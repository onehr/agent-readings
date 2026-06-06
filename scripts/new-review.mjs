#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const slug = process.argv[2];
const title = process.argv.slice(3).join(" ") || "TODO: Paper title";

if (!slug) {
  console.error("usage: bun run new-review <paper-slug> [paper title]");
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("slug must be lowercase, hyphenated, and alphanumeric");
  process.exit(1);
}

const reviewsDir = path.join(root, "data", "reviews");
const reviewPath = path.join(reviewsDir, `${slug}.json`);
const readingsPath = path.join(root, "data", "readings.yml");
const slidesDir = path.join(root, "slides", slug);
const slidesIndex = path.join(slidesDir, "index.html");

if (fs.existsSync(reviewPath)) {
  console.error(`data/reviews/${slug}.json already exists`);
  process.exit(1);
}

fs.mkdirSync(reviewsDir, { recursive: true });
fs.mkdirSync(slidesDir, { recursive: true });

if (!fs.existsSync(slidesIndex)) {
  fs.copyFileSync(path.join(root, "slides", "_template", "index.html"), slidesIndex);
}

const readings = fs.existsSync(readingsPath) ? fs.readFileSync(readingsPath, "utf8") : "";
if (!new RegExp(`(^|\\n)-\\s+slug:\\s+${escapeRegExp(slug)}(\\s|\\n|$)`).test(readings)) {
  const separator = readings.endsWith("\n") || readings.length === 0 ? "" : "\n";
  fs.appendFileSync(
    readingsPath,
    `${separator}- slug: ${slug}
  title: "${escapeJsonString(title)}"
  authors: "TODO et al."
  year: 0
  section: "TODO: README section"
  url: "TODO: paper URL"
  slides: true
  poc: false
`
  );
}

const review = {
  schema_version: 1,
  slug,
  review_status: "draft",
  paper: {
    title,
    authors: ["TODO"],
    year: 0,
    venue: "TODO",
    url: "TODO: paper URL",
    project_url: "",
    arxiv_id: "",
    read_sources: [{ kind: "paper", url: "TODO: source URL", note: "What was read for this review." }]
  },
  summary: {
    one_sentence: "TODO: one-sentence review claim.",
    thesis: "TODO: the paper's thesis.",
    why_it_matters: "TODO: why this matters for agent infrastructure."
  },
  problem: {
    prior_state: ["TODO: what was broken or expensive before this paper."],
    key_gap: "TODO: the missing capability or systems gap.",
    assumptions: ["TODO: assumption needed for the method to work."]
  },
  concepts: [{ id: "concept-1", name: "TODO", definition: "TODO" }],
  method: {
    core_idea: "TODO: the mechanism in one paragraph.",
    action_grammar: ["TODO: action/thought/interface format if applicable."],
    steps: ["TODO: load-bearing step."],
    pseudocode: ""
  },
  claims: [
    {
      id: "C1",
      type: "result",
      status: "unverified",
      statement: "TODO: falsifiable claim.",
      scope: "TODO: where this claim applies.",
      evidence_refs: ["E1"],
      caveats: ["TODO: limitation or boundary."]
    }
  ],
  evidence: [
    {
      id: "E1",
      kind: "paper_result",
      source: "paper",
      locator: "TODO: section/table/figure",
      result: "TODO: exact result supporting the claim.",
      metric: "TODO",
      claim_refs: ["C1"]
    }
  ],
  agent_infra_takeaways: ["TODO: infrastructure lesson."],
  caveats: ["TODO: review caveat."],
  related_work: [],
  poc: {
    status: "missing",
    note: "No PoC yet - contributions welcome."
  },
  slide_plan: {
    title,
    subtitle: "TODO: compact deck subtitle",
    sections: ["summary", "problem", "method", "evidence", "claims", "infra_takeaways", "caveats", "run_it", "references"]
  }
};

fs.writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);

console.log(`Created data/reviews/${slug}.json and slides/${slug}/index.html.`);
console.log("Next: fill the review, then run `bun run build` to synthesize the deck and review page.");

function escapeJsonString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
