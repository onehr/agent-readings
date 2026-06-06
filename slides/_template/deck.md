<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / {Section from README}</p>
  <h1>{Paper Short Title}</h1>
  <p class="deck-subtitle">{First Author} et al., {Year} · {Venue}</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>{Year}</strong><span>paper</span></div>
    <div class="deck-meta-pill"><strong>4-8</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>source-read</strong><span>status</span></div>
    <div class="deck-meta-pill"><strong>{slug}</strong><span>review</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>The single claim the paper makes. If you remember one thing, remember this.</h2>
  <p class="deck-note">One supporting sentence: why this matters for LLM agents or agent infrastructure.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>What was broken, impossible, expensive, unsafe, or hard to evaluate.</p></div>
    <div class="apple-card"><p>What prior methods could not do cleanly.</p></div>
    <div class="apple-card"><p>What system boundary or abstraction was missing.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The precise gap this paper closes.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>The mechanism, in the simplest faithful form.</h2>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item"><span>01</span><p>First load-bearing step.</p></div>
    <div class="step-item"><span>02</span><p>Second load-bearing step.</p></div>
    <div class="step-item"><span>03</span><p>Third load-bearing step.</p></div>
    <div class="step-item"><span>04</span><p>Fourth step, only if needed.</p></div>
  </div>
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card"><span>E1</span><p>The number, table, figure, theorem, benchmark, or design fact that earned the citation.</p></div>
    <div class="proof-card"><span>E2</span><p>Another result, scoped honestly.</p></div>
    <div class="proof-card"><span>E3</span><p>A failure mode or ablation if that is what matters.</p></div>
    <div class="proof-card"><span>E4</span><p>Optional fourth proof object.</p></div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Runtime, memory, tool, safety, evaluation, or serving implication.</p></div>
    <div class="apple-card"><p>Another implication, written as a design constraint.</p></div>
    <div class="apple-card"><p>Connection to another reading.</p></div>
    <div class="apple-card"><p>What a production system must still handle.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Scope limitation.</p></div>
    <div class="apple-card"><p>Evaluation limitation.</p></div>
    <div class="apple-card"><p>Deployment or safety limitation.</p></div>
    <div class="apple-card"><p>Open question.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">Link to `pocs/{slug}/` if a PoC exists. Otherwise: contributions welcome.</p>
  <div class="reference-list">
    <ul>
      <li>Paper: [{Paper Title}]({paper-url})</li>
      <li>Code/project: [{project-url}]({project-url})</li>
    </ul>
  </div>
</div>

Note: This Markdown template is for intentionally custom decks. The default path is to edit `data/reviews/<slug>.json` and let `bun run build` synthesize `deck.md`.
