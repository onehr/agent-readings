#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const readingsPath = path.join(root, "data", "readings.yml");
const reviewsDir = path.join(root, "data", "reviews");
const readmePath = path.join(root, "README.md");

const readings = parseReadings(fs.readFileSync(readingsPath, "utf8"));
const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
const reviews = loadReviews(readings);

for (const entry of readings) {
  const review = reviews.get(entry.slug);
  if (!review) continue;
  ensureDeckDir(entry.slug);
  const deckMarkdown = renderDeckMarkdown(entry, review);
  writeFile(`slides/${entry.slug}/deck.md`, deckMarkdown);
  writeFile(`slides/${entry.slug}/index.html`, renderDeckIndex(entry, review, deckMarkdown));
}

const warnings = [...validate(readings, readme, reviews), ...validateReviews(readings, reviews)];

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

writeFile("slides/index.html", renderSlidesIndex(readings));
writeFile("index.html", renderLanding(readings));
writeFile("pocs/index.html", renderPocsIndex(readings));
writeFile("reviews/index.html", renderReviewsIndex(readings, reviews));
for (const entry of readings) {
  const review = reviews.get(entry.slug);
  if (review) writeFile(`reviews/${entry.slug}/index.html`, renderReviewPage(entry, review));
}

console.log(
  `Generated site indexes, ${reviews.size} review page(s), and synthesized deck Markdown for ${readings.length} readings.`
);

function writeFile(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function loadReviews(entries) {
  const reviews = new Map();
  if (!fs.existsSync(reviewsDir)) return reviews;

  const knownSlugs = new Set(entries.map((entry) => entry.slug));
  for (const fileName of fs.readdirSync(reviewsDir).sort()) {
    if (!fileName.endsWith(".json") || fileName.startsWith("_")) continue;
    const reviewPath = path.join(reviewsDir, fileName);
    const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
    const slug = review.slug || fileName.replace(/\.json$/, "");
    if (!knownSlugs.has(slug)) {
      console.warn(`warning: review ${fileName} has no matching data/readings.yml entry`);
    }
    reviews.set(slug, review);
  }

  return reviews;
}

function ensureDeckDir(slug) {
  const targetDir = path.join(root, "slides", slug);
  fs.mkdirSync(targetDir, { recursive: true });
}

function parseReadings(source) {
  const entries = [];
  let current = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = stripComment(rawLine).trimEnd();
    if (!line.trim()) continue;

    if (line.startsWith("- ")) {
      if (current) entries.push(current);
      current = {};
      const rest = line.slice(2).trim();
      if (rest) assignPair(current, rest);
      continue;
    }

    if (!current) {
      throw new Error(`Invalid readings.yml line before first entry: ${rawLine}`);
    }

    if (/^\s+/.test(line)) {
      assignPair(current, line.trim());
      continue;
    }

    throw new Error(`Invalid readings.yml line: ${rawLine}`);
  }

  if (current) entries.push(current);
  return entries;
}

function assignPair(target, line) {
  const colon = findColonOutsideQuotes(line);
  if (colon === -1) throw new Error(`Expected key/value pair: ${line}`);

  const key = line.slice(0, colon).trim();
  const value = line.slice(colon + 1).trim();
  target[key] = parseScalar(value);
}

function parseScalar(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value
      .slice(1, -1)
      .replace(/\\(["'\\])/g, "$1")
      .replace(/\\n/g, "\n");
  }

  return value;
}

function stripComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const previous = line[index - 1];
    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote || char;
      continue;
    }
    if (!quote && char === "#" && (!previous || /\s/.test(previous))) {
      return line.slice(0, index);
    }
  }
  return line;
}

function findColonOutsideQuotes(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const previous = line[index - 1];
    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote || char;
      continue;
    }
    if (!quote && char === ":") return index;
  }
  return -1;
}

function validate(entries, readmeContent, reviewsBySlug) {
  const warnings = [];
  const slugs = new Set();
  const readmeSections = new Set(
    [...readmeContent.matchAll(/^##\s+(.+)$/gm)].map((match) => plainText(match[1]))
  );

  for (const entry of entries) {
    for (const key of ["slug", "title", "authors", "year", "section", "url", "slides", "poc"]) {
      if (!(key in entry)) warnings.push(`${entry.slug || "unknown"} is missing ${key}`);
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(entry.slug))) {
      warnings.push(`${entry.slug || "unknown"} has an invalid slug`);
    }

    if (slugs.has(entry.slug)) warnings.push(`${entry.slug} appears more than once`);
    slugs.add(entry.slug);

    if (readmeSections.size > 0 && !readmeSections.has(entry.section)) {
      warnings.push(`${entry.slug} section does not match a README section: ${entry.section}`);
    }

    if (entry.slides) {
      for (const required of ["index.html", "deck.md"]) {
        const requiredPath = path.join(root, "slides", entry.slug, required);
        if (!fs.existsSync(requiredPath) && !(required === "deck.md" && reviewsBySlug.has(entry.slug))) {
          warnings.push(`${entry.slug} has slides: true but missing ${required}`);
        }
      }
    }

    if (entry.poc) {
      const pocReadme = path.join(root, "pocs", entry.slug, "README.md");
      if (!fs.existsSync(pocReadme)) warnings.push(`${entry.slug} has poc: true but missing pocs/${entry.slug}/README.md`);
    }
  }

  return warnings;
}

function validateReviews(entries, reviewsBySlug) {
  const warnings = [];
  const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]));

  for (const [slug, review] of reviewsBySlug.entries()) {
    const required = ["schema_version", "slug", "paper", "summary", "problem", "method", "claims", "evidence"];
    for (const key of required) {
      if (!(key in review)) warnings.push(`${slug} review is missing ${key}`);
    }

    if (review.slug !== slug) warnings.push(`${slug} review slug field does not match file slug`);
    if (!entriesBySlug.has(slug)) warnings.push(`${slug} review has no matching reading`);

    const claimIds = new Set((review.claims || []).map((claim) => claim.id));
    const evidenceIds = new Set((review.evidence || []).map((evidence) => evidence.id));

    for (const claim of review.claims || []) {
      if (!claim.id) warnings.push(`${slug} has a claim without id`);
      if (!claim.statement) warnings.push(`${slug} claim ${claim.id || "unknown"} has no statement`);
      for (const evidenceRef of claim.evidence_refs || []) {
        if (!evidenceIds.has(evidenceRef)) warnings.push(`${slug} claim ${claim.id} references missing evidence ${evidenceRef}`);
      }
    }

    for (const evidence of review.evidence || []) {
      if (!evidence.id) warnings.push(`${slug} has evidence without id`);
      if (!evidence.result) warnings.push(`${slug} evidence ${evidence.id || "unknown"} has no result`);
      for (const claimRef of evidence.claim_refs || []) {
        if (!claimIds.has(claimRef)) warnings.push(`${slug} evidence ${evidence.id} references missing claim ${claimRef}`);
      }
    }
  }

  return warnings;
}

function renderLanding(entries) {
  const readingsCount = countReadmeEntries(readme) || entries.length;
  const deckCount = entries.filter((entry) => entry.slides).length;
  const pocCount = entries.filter((entry) => entry.poc).length;
  const reviewCount = entries.filter((entry) => fs.existsSync(path.join(reviewsDir, `${entry.slug}.json`))).length;
  const featuredEntry = entries.find((entry) => reviews.has(entry.slug)) || entries[0];
  const featuredReview = featuredEntry ? reviews.get(featuredEntry.slug) : null;
  const featuredTitle = featuredReview?.slide_plan?.title || featuredEntry?.title || "No review yet";
  const featuredSummary =
    featuredReview?.summary?.one_sentence ||
    (featuredEntry ? `${featuredEntry.authors}, ${featuredEntry.year}` : "Add a structured review to feature it here.");
  const readmeHtml = renderReadmeHtml(readme, { omitTitle: true });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>agent-readings</title>
  <link rel="stylesheet" href="assets/theme.css" />
</head>
<body class="site-page landing-page">
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="./">agent-readings</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="slides/">Slides</a>
        <a href="reviews/">Reviews</a>
        <a href="pocs/">PoCs</a>
        <a href="README.md">README.md</a>
      </nav>
    </div>
  </header>
  <main class="site-main">
    <section class="hero hero--landing" aria-label="Collection summary">
      <div class="hero-copy">
        <p class="eyebrow">Agent infrastructure readings</p>
        <h1>Read papers like systems.</h1>
        <p class="hero-lede">A curated corpus for LLM agents, runtime design, safety, evaluation, and serving. Each reading becomes a structured claim/evidence review and a hosted slide deck.</p>
        <div class="hero-actions" aria-label="Primary actions">
          <a class="button button--primary" href="slides/">Browse decks</a>
          <a class="button" href="reviews/">Open reviews</a>
          <a class="button" href="CONTRIBUTING.md">Contribute</a>
        </div>
      </div>
      <aside class="hero-card" aria-label="Repository summary">
        <div class="hero-card__top">
          <span>Corpus</span>
          <strong>${readingsCount}</strong>
        </div>
        <div class="metric-grid" aria-label="Repository stats">
          <div class="metric"><strong>${reviewCount}</strong><span>Reviews</span></div>
          <div class="metric"><strong>${deckCount}</strong><span>Decks</span></div>
          <div class="metric"><strong>${pocCount}</strong><span>PoCs</span></div>
        </div>
        <div class="featured-review">
          <span>Featured review</span>
          <h2>${escapeHtml(featuredTitle)}</h2>
          <p>${escapeHtml(featuredSummary)}</p>
          ${
            featuredEntry
              ? `<div class="hero-card__actions">
            <a href="slides/${escapeAttr(featuredEntry.slug)}/">Deck</a>
            <a href="reviews/${escapeAttr(featuredEntry.slug)}/">Review</a>
          </div>`
              : ""
          }
        </div>
      </aside>
    </section>
    <section class="quick-links" aria-label="Repository sections">
      <a class="quick-link" href="slides/">
        <span>01</span>
        <strong>Decks</strong>
        <p>One browser-viewable HTML presentation per reviewed reading.</p>
      </a>
      <a class="quick-link" href="reviews/">
        <span>02</span>
        <strong>Reviews</strong>
        <p>Claim/evidence records designed for maintainable synthesis.</p>
      </a>
      <a class="quick-link" href="pocs/">
        <span>03</span>
        <strong>PoCs</strong>
        <p>Local-only reproductions when a paper has runnable substance.</p>
      </a>
    </section>
    <section class="landing-layout" aria-label="Reading list and review shortcuts">
      <article class="readme-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Canonical index</p>
            <h2>Reading List</h2>
          </div>
          <a href="README.md">README.md</a>
        </div>
        <div class="readme readme--landing" data-readme>
${readmeHtml || "<p>No README content yet.</p>"}
        </div>
      </article>
      <aside class="side-rail" aria-label="Shortcuts">
        <section class="rail-panel">
          <p class="eyebrow">Start here</p>
          <div class="rail-links">
            <a href="slides/">Slides gallery</a>
            <a href="reviews/">Structured reviews</a>
            <a href="pocs/">Runnable PoCs</a>
          </div>
        </section>
        <section class="rail-panel rail-panel--note">
          <p class="eyebrow">Maintainer model</p>
          <p>The README stays canonical. The generated site turns review records into pages and decks.</p>
        </section>
      </aside>
    </section>
  </main>
  <footer class="site-footer">
    <span>Code and PoCs: MIT. Written content and decks: CC BY 4.0.</span>
  </footer>
</body>
</html>
`;
}

function renderReadmeHtml(source, options = {}) {
  const html = [];
  let paragraph = [];
  let listType = null;
  let skippedTitle = false;

  const closeParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      closeParagraph();
      closeList();
      continue;
    }

    const anchor = line.match(/^<a\s+name="([^"]+)"\s*><\/a>$/i);
    if (anchor) {
      closeParagraph();
      closeList();
      html.push(`<span id="${escapeAttr(anchor[1])}" class="anchor-target"></span>`);
      continue;
    }

    if (line === "---") {
      closeParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      if (options.omitTitle && !skippedTitle && level === 1) {
        skippedTitle = true;
        continue;
      }
      skippedTitle = skippedTitle || level === 1;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s*(.+)$/);
    if (quote) {
      closeParagraph();
      closeList();
      html.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      closeParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${inlineMarkdown(numbered[1])}</li>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      closeParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  closeParagraph();
  closeList();
  return html.join("\n");
}

function countReadmeEntries(source) {
  let count = 0;
  let section = "";
  for (const line of source.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      section = plainText(heading[1]);
      continue;
    }
    if (section === "Table of Contents" || section === "External Reading Lists") continue;
    if (/^\*\s+/.test(line)) count += 1;
  }
  return count;
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, text, url) => `<a href="${escapeAttr(url)}">${text}</a>`);
}

function renderSlidesIndex(entries) {
  const deckEntries = entries.filter((entry) => entry.slides);
  const groups = new Map();
  for (const entry of deckEntries) {
    const group = groups.get(entry.section) || [];
    group.push(entry);
    groups.set(entry.section, group);
  }

  const groupMarkup =
    deckEntries.length === 0
      ? `<div class="content-frame"><p>No decks yet.</p></div>`
      : [...groups.entries()]
          .map(([section, sectionEntries]) => {
            const cards = sectionEntries
              .map((entry) => {
                const pocBadge = entry.poc
                  ? `<span class="badge badge--ready">PoC</span>`
                  : `<span class="badge">No PoC</span>`;
                const reviewBadge = fs.existsSync(path.join(reviewsDir, `${entry.slug}.json`))
                  ? `<span class="badge badge--ready">Structured review</span>`
                  : `<span class="badge">Manual deck</span>`;
                return `<a class="deck-card" href="${escapeAttr(entry.slug)}/">
  <div>
    <h3>${escapeHtml(entry.title)}</h3>
    <p>${escapeHtml(entry.authors)}, ${escapeHtml(String(entry.year))}</p>
  </div>
  <div class="badge-row">
    <span class="badge badge--ready">Slides</span>
    ${reviewBadge}
    ${pocBadge}
  </div>
</a>`;
              })
              .join("\n");

            return `<section class="gallery-section">
  <h2>${escapeHtml(section)}</h2>
  <div class="deck-grid">
${cards}
  </div>
</section>`;
          })
          .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>agent-readings · slides</title>
  <link rel="stylesheet" href="../assets/theme.css" />
</head>
<body class="site-page">
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="../">agent-readings</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="../">Readings</a>
        <a href="../reviews/">Reviews</a>
        <a href="../pocs/">PoCs</a>
      </nav>
    </div>
  </header>
  <main class="site-main">
    <section class="hero" aria-label="Slides gallery summary">
      <div>
        <p class="eyebrow">Generated gallery</p>
        <h1>Slide Decks</h1>
        <p class="hero-lede">Markdown-authored reveal.js decks grouped by the reading-list sections, generated from structured reviews.</p>
      </div>
      <div class="hero-card hero-card--compact" aria-label="Gallery stats">
        <div class="hero-card__top">
          <span>Decks</span>
          <strong>${deckEntries.length}</strong>
        </div>
      </div>
    </section>
${groupMarkup}
  </main>
  <footer class="site-footer">
    <span>Generated from data/readings.yml and data/reviews/*.json. Do not hand-edit this page.</span>
  </footer>
</body>
</html>
`;
}

function renderReviewsIndex(entries, reviewsBySlug) {
  const reviewedEntries = entries.filter((entry) => reviewsBySlug.has(entry.slug));
  const cards =
    reviewedEntries.length === 0
      ? `<div class="content-frame"><p>No structured reviews yet.</p></div>`
      : `<div class="deck-grid">
${reviewedEntries
  .map((entry) => {
    const review = reviewsBySlug.get(entry.slug);
    return `<a class="deck-card" href="${escapeAttr(entry.slug)}/">
  <div>
    <h3>${escapeHtml(entry.title)}</h3>
    <p>${escapeHtml(review.summary?.one_sentence || `${entry.authors}, ${entry.year}`)}</p>
  </div>
  <div class="badge-row">
    <span class="badge badge--ready">${(review.claims || []).length} claims</span>
    <span class="badge badge--ready">${(review.evidence || []).length} evidence refs</span>
  </div>
</a>`;
  })
  .join("\n")}
</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>agent-readings · reviews</title>
  <link rel="stylesheet" href="../assets/theme.css" />
</head>
<body class="site-page">
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="../">agent-readings</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="../">Readings</a>
        <a href="../slides/">Slides</a>
        <a href="../pocs/">PoCs</a>
      </nav>
    </div>
  </header>
  <main class="site-main">
    <section class="hero" aria-label="Structured review summary">
      <div>
        <p class="eyebrow">Claim/evidence database</p>
        <h1>Structured Reviews</h1>
        <p class="hero-lede">Paper reviews stored as schema-compatible records and rendered into readable review pages and slide decks.</p>
      </div>
      <div class="hero-card hero-card--compact" aria-label="Review stats">
        <div class="hero-card__top">
          <span>Reviews</span>
          <strong>${reviewedEntries.length}</strong>
        </div>
      </div>
    </section>
${cards}
  </main>
  <footer class="site-footer">
    <span>Generated from data/reviews/*.json. Do not hand-edit this page.</span>
  </footer>
</body>
</html>
`;
}

function renderReviewPage(entry, review) {
  const claims = review.claims || [];
  const evidenceById = new Map((review.evidence || []).map((evidence) => [evidence.id, evidence]));
  const readSources = review.paper?.read_sources || [];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>agent-readings · ${escapeHtml(entry.title)}</title>
  <link rel="stylesheet" href="../../assets/theme.css" />
</head>
<body class="site-page">
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="../../">agent-readings</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="../../slides/${escapeAttr(entry.slug)}/">Deck</a>
        <a href="../">Reviews</a>
        <a href="../../slides/">Slides</a>
      </nav>
    </div>
  </header>
  <main class="site-main">
    <section class="hero" aria-label="Review summary">
      <div>
        <p class="eyebrow">${escapeHtml(entry.section)}</p>
        <h1>${escapeHtml(review.slide_plan?.title || entry.title)}</h1>
        <p class="hero-lede">${escapeHtml(review.summary?.one_sentence || "")}</p>
      </div>
      <div class="hero-card hero-card--compact" aria-label="Review stats">
        <div class="metric-grid metric-grid--two">
          <div class="metric"><strong>${claims.length}</strong><span>Claims</span></div>
          <div class="metric"><strong>${(review.evidence || []).length}</strong><span>Evidence</span></div>
        </div>
      </div>
    </section>
    <div class="review-layout">
      <aside class="review-meta" aria-label="Review metadata">
        <div>
          <span>Paper</span>
          <strong>${escapeHtml(review.paper?.year || entry.year)} · ${escapeHtml(review.paper?.venue || entry.authors)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>${escapeHtml(review.review_status || "draft")}</strong>
        </div>
        <div>
          <span>Sources read</span>
          <strong>${readSources.length}</strong>
        </div>
        <a class="button button--primary" href="../../slides/${escapeAttr(entry.slug)}/">Open deck</a>
        <a class="button" href="${escapeAttr(entry.url)}">Source</a>
      </aside>
      <article class="readme review-body">
      <h2>Why It Matters</h2>
      <p>${escapeHtml(review.summary?.why_it_matters || "")}</p>

      <h2>Problem</h2>
      ${htmlList(review.problem?.prior_state || [])}
      <p><strong>Key gap:</strong> ${escapeHtml(review.problem?.key_gap || "")}</p>

      <h2>Method</h2>
      <p>${escapeHtml(review.method?.core_idea || "")}</p>
      ${htmlList(review.method?.steps || [])}

      <h2>Claims</h2>
      ${claims
        .map((claim) => {
          const refs = (claim.evidence_refs || [])
            .map((id) => evidenceById.get(id))
            .filter(Boolean)
            .map((evidence) => `<li><strong>${escapeHtml(evidence.id)}</strong>: ${escapeHtml(evidence.result)}</li>`)
            .join("");
          return `<section class="review-claim">
  <h3>${escapeHtml(claim.id)} · ${escapeHtml(claim.status || "unreviewed")}</h3>
  <p>${escapeHtml(claim.statement)}</p>
  <p><strong>Scope:</strong> ${escapeHtml(claim.scope || "")}</p>
  ${refs ? `<ul>${refs}</ul>` : "<p>No evidence refs.</p>"}
</section>`;
        })
        .join("\n")}

      <h2>Agent Infrastructure Takeaways</h2>
      ${htmlList(review.agent_infra_takeaways || [])}

      <h2>Caveats</h2>
      ${htmlList(review.caveats || [])}
      </article>
    </div>
  </main>
  <footer class="site-footer">
    <span>Generated from data/reviews/${escapeHtml(entry.slug)}.json.</span>
  </footer>
</body>
</html>
`;
}

function renderDeckMarkdown(entry, review) {
  const title = review.slide_plan?.title || entry.title;
  const subtitle = review.slide_plan?.subtitle || `${entry.authors}, ${entry.year}`;
  const strongestEvidence = (review.evidence || []).slice(0, 4);
  const keyClaims = (review.claims || []).slice(0, 4);
  const problemItems = compactItems(review.problem?.prior_state || [], 3, 178);
  const methodSteps = compactItems(review.method?.steps || [], 4, 148);
  const actionGrammar = compactItems(review.method?.action_grammar || [], 4, 120);
  const takeaways = compactItems(review.agent_infra_takeaways || [], 4, 150);
  const caveats = compactItems(review.caveats || [], 4, 150);
  const coreIdea = String(review.method?.core_idea || "");
  const coreHeadline = firstSentence(coreIdea, 160);
  const coreNote = coreIdea && coreIdea !== coreHeadline ? shorten(coreIdea, 260) : "";

  return `<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / ${escapeHtml(entry.section)}</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="deck-subtitle">${escapeHtml(subtitle)}</p>

  <div class="deck-meta-strip">
    ${deckMetaPill(review.paper?.year || entry.year || "", review.paper?.venue || "Paper")}
    ${deckMetaPill((review.claims || []).length, "claims")}
    ${deckMetaPill((review.evidence || []).length, "evidence refs")}
    ${deckMetaPill(review.review_status || "draft", "status")}
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>${escapeHtml(review.summary?.one_sentence || "")}</h2>
  <p class="deck-note">${escapeHtml(review.summary?.why_it_matters || "")}</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    ${deckCards(problemItems)}
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>${escapeHtml(review.problem?.key_gap || "")}</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>${escapeHtml(coreHeadline)}</h2>
  ${coreNote ? `<p class="deck-note">${escapeHtml(coreNote)}</p>` : ""}
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    ${deckSteps(methodSteps)}
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    ${deckCards(actionGrammar)}
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

${review.method?.pseudocode ? `\`\`\`python\n${review.method.pseudocode.trim()}\n\`\`\`` : `<div class="deck-callout"><span>No pseudocode</span><p>The review records mechanism steps instead of runnable pseudocode.</p></div>`}
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    ${deckEvidenceCards(strongestEvidence)}
  </div>
</div>

---

<!-- .slide: class="claim-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Claim map</p>
  <h2>What the review actually supports.</h2>
  <div class="claim-grid">
    ${deckClaimCards(keyClaims)}
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    ${deckCards(takeaways)}
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    ${deckCards(caveats)}
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>${review.poc?.status === "available" ? "There is a local reproduction." : "No PoC yet."}</h2>
  <p class="deck-note">${escapeHtml(review.poc?.status === "available" ? `${review.poc.path} · ${review.poc.command}` : review.poc?.note || "Contributions welcome.")}</p>
  <div class="reference-list">
    ${deckReferenceList(referenceLines(review).slice(0, 5))}
  </div>
</div>

Note: This deck is synthesized from \`data/reviews/${entry.slug}.json\`. Update the review record, then run \`bun run build\`.
`;
}

function renderDeckIndex(entry, review, deckMarkdown) {
  const title = review.slide_plan?.title || entry.title;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>agent-readings · ${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/highlight/monokai.css" />
  <link rel="stylesheet" href="../../assets/theme.css" />
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section data-markdown
               data-separator="^\\n---\\n$"
               data-separator-vertical="^\\n--\\n$"
               data-separator-notes="^Note:">
        <textarea data-template>
${escapeTextarea(deckMarkdown)}
        </textarea>
      </section>
    </div>
  </div>
  <script type="module" src="../../assets/deck.js"></script>
</body>
</html>
`;
}

function renderPocsIndex(entries) {
  const pocEntries = entries.filter((entry) => entry.poc);
  const pocMarkup =
    pocEntries.length === 0
      ? `<div class="content-frame"><p>No PoCs yet.</p></div>`
      : `<div class="deck-grid">
${pocEntries
  .map(
    (entry) => `<a class="deck-card" href="${escapeAttr(entry.slug)}/">
  <div>
    <h3>${escapeHtml(entry.title)}</h3>
    <p>${escapeHtml(entry.authors)}, ${escapeHtml(String(entry.year))}</p>
  </div>
  <div class="badge-row">
    <span class="badge badge--ready">PoC</span>
  </div>
</a>`
  )
  .join("\n")}
</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>agent-readings · PoCs</title>
  <link rel="stylesheet" href="../assets/theme.css" />
</head>
<body class="site-page">
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="../">agent-readings</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="../">Readings</a>
        <a href="../slides/">Slides</a>
        <a href="README.md">PoC README</a>
      </nav>
    </div>
  </header>
  <main class="site-main">
    <section class="hero" aria-label="PoC summary">
      <div>
        <p class="eyebrow">Runnable artifacts</p>
        <h1>PoCs</h1>
        <p class="hero-lede">Small, local-only reproductions for selected readings.</p>
      </div>
      <div class="hero-card hero-card--compact" aria-label="PoC stats">
        <div class="hero-card__top">
          <span>PoCs</span>
          <strong>${pocEntries.length}</strong>
        </div>
      </div>
    </section>
${pocMarkup}
  </main>
  <footer class="site-footer">
    <span>Generated from data/readings.yml. PoC conventions live in pocs/README.md.</span>
  </footer>
</body>
</html>
`;
}

function deckMetaPill(value, label) {
  return `<div class="deck-meta-pill"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(String(label))}</span></div>`;
}

function deckCards(items) {
  const normalizedItems = items.length > 0 ? items : ["None recorded."];
  return normalizedItems
    .map((item) => `<div class="apple-card"><p>${escapeHtml(item)}</p></div>`)
    .join("\n");
}

function deckSteps(items) {
  const normalizedItems = items.length > 0 ? items : ["None recorded."];
  return normalizedItems
    .map(
      (item, index) => `<div class="step-item">
  <span>${String(index + 1).padStart(2, "0")}</span>
  <p>${escapeHtml(item)}</p>
</div>`
    )
    .join("\n");
}

function deckEvidenceCards(items) {
  const normalizedItems = items.length > 0 ? items : [{ id: "None", result: "No evidence recorded." }];
  return normalizedItems
    .map(
      (item) => `<div class="proof-card">
  <span>${escapeHtml(item.id || "Evidence")}</span>
  <p>${escapeHtml(shorten(item.result || "", 178))}</p>
</div>`
    )
    .join("\n");
}

function deckClaimCards(items) {
  const normalizedItems = items.length > 0 ? items : [{ id: "None", status: "missing", statement: "No claims recorded." }];
  return normalizedItems
    .map(
      (item) => `<div class="claim-card">
  <span>${escapeHtml(item.id || "Claim")} · ${escapeHtml(item.status || "unreviewed")}</span>
  <p>${escapeHtml(shorten(item.statement || "", 158))}</p>
  <small>${escapeHtml((item.evidence_refs || []).join(", ") || "No evidence refs")}</small>
</div>`
    )
    .join("\n");
}

function deckReferenceList(items) {
  if (!items || items.length === 0) return "<p>No references recorded.</p>";
  return `<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`;
}

function compactItems(items, limit, maxLength) {
  return (items || []).slice(0, limit).map((item) => shorten(item, maxLength));
}

function firstSentence(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const firstStop = text.search(/[.!?](\s|$)/);
  if (firstStop > 0 && firstStop + 1 <= maxLength) return text.slice(0, firstStop + 1);
  return shorten(text, maxLength);
}

function shorten(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  const boundary = Math.max(text.lastIndexOf(". ", maxLength), text.lastIndexOf("; ", maxLength), text.lastIndexOf(" ", maxLength));
  const end = boundary > Math.floor(maxLength * 0.62) ? boundary : maxLength;
  return `${text.slice(0, end).trim()}...`;
}

function htmlList(items) {
  if (!items || items.length === 0) return "<p>None recorded.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function mdList(items) {
  if (!items || items.length === 0) return "- None recorded.";
  return items.map((item) => `- ${item}`).join("\n");
}

function mdTable(headers, rows) {
  const normalizedRows = rows.length > 0 ? rows : [["None", ""]];
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...normalizedRows.map((row) => `| ${row.map((cell) => tableCell(cell)).join(" | ")} |`)
  ].join("\n");
}

function tableCell(value) {
  return String(value ?? "")
    .replace(/\n/g, " ")
    .replace(/\|/g, "\\|");
}

function referenceLines(review) {
  const lines = [];
  if (review.paper?.url) lines.push(`Paper: [${review.paper.title || "paper"}](${review.paper.url})`);
  if (review.paper?.project_url) lines.push(`Project/code: [${review.paper.project_url}](${review.paper.project_url})`);
  for (const item of review.related_work || []) {
    if (item.url) lines.push(`${item.relation}: [${item.title}](${item.url})`);
  }
  return lines;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function escapeTextarea(value) {
  return String(value).replace(/<\/textarea/gi, "<\\/textarea");
}

function plainText(value) {
  return value
    .replace(/\[[^\]]+\]\([^)]+\)/g, (match) => match.slice(1, match.indexOf("]")))
    .replace(/[`*_~]/g, "")
    .trim();
}
