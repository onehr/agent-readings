<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Reasoning, Acting, and Reflection</p>
  <h1>Self-Refine</h1>
  <p class="deck-subtitle">A generate-critique-rewrite loop for test-time improvement</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>NeurIPS 2023</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Self-Refine improves a model's first answer by repeatedly asking the same LLM to critique its output and rewrite it from that feedback.</h2>
  <p class="deck-note">For agents, Self-Refine turns intermediate artifacts into maintainable state: draft, feedback, revised draft, stop signal, and iteration budget are separate records that can be inspected, replayed, and connected to external checks.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Many LLM generations are useful but incomplete or suboptimal on the first attempt.</p></div>
<div class="apple-card"><p>Prior iterative refinement methods often trained separate refiners or depended on supervised feedback data, scalar reward models, or human annotation.</p></div>
<div class="apple-card"><p>One-shot prompting gives no durable place to store why an answer is wrong or how the next version should change.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether a strong frozen LLM can improve its own outputs across tasks by generating task-specific natural-language feedback and then refining from that feedback.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Generate an initial output, prompt the same LLM for specific feedback on that output, prompt the same LLM to refine the output using the feedback, append prior...</h2>
  <p class="deck-note">Generate an initial output, prompt the same LLM for specific feedback on that output, prompt the same LLM to refine the output using the feedback, append prior outputs and feedback to later prompts, and repeat until a stop condition or maximum iteration count.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Produce a first draft for the task.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Ask the model to critique the draft with specific, actionable feedback.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Ask the model to revise the draft using that feedback.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Carry the output and feedback history into the next iteration.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Initial generation prompt: task input plus examples for producing a first answer.</p></div>
<div class="apple-card"><p>Feedback prompt: task input, current output, and examples for writing specific, actionable feedback.</p></div>
<div class="apple-card"><p>Refine prompt: task input, current output, feedback, and examples for rewriting the output.</p></div>
<div class="apple-card"><p>Stop condition: either a fixed iteration count or a task-specific signal extracted from feedback or an external...</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
output = generate(input)
history = []
for iteration in 1..max_iterations:
    feedback = critique(input, output, history)
    if should_stop(feedback, output):
        break
    next_output = refine(input, output, feedback, history)
    history.append({"output": output, "feedback": feedback})
    output = next_output
return output
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-method</span>
  <p>The paper defines Self-Refine as initial generation, self-feedback, and refinement using the same LLM, with no additional supervised training data, extra training, or...</p>
</div>
<div class="proof-card">
  <span>E-state-loop</span>
  <p>The algorithm alternates feedback and refine steps until a stop condition. The paper says previous feedback and outputs are retained by appending them to the prompt, and the last...</p>
</div>
<div class="proof-card">
  <span>E-main-results</span>
  <p>The abstract reports about 20 absolute points average improvement. Table 1 shows improvements across Sentiment Reversal, Dialogue Response, Code Optimization, Code Readability,...</p>
</div>
<div class="proof-card">
  <span>E-task-pattern</span>
  <p>Examples include GPT-4 Dialogue Response improving from 25.4 to 74.6, ChatGPT Constrained Generation from 44.0 to 67.0, and GPT-4 Constrained Generation from 15.0 to 45.0. Math...</p>
</div>
  </div>
</div>

---

<!-- .slide: class="claim-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Claim map</p>
  <h2>What the review actually supports.</h2>
  <div class="claim-grid">
    <div class="claim-card">
  <span>C1 · paper-supported</span>
  <p>Self-Refine needs no supervised training data, additional training, or reinforcement learning; it uses the same LLM as generator, feedback provider, and...</p>
  <small>E-method</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The loop retains previous outputs and feedback in the prompt, making intermediate drafts and critiques part of the computation state.</p>
  <small>E-state-loop</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>Across seven evaluated tasks, Self-Refine improves strong base LLM outputs by about 20 absolute points on average over conventional one-step generation.</p>
  <small>E-main-results</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The largest gains appear on tasks where feedback can point to missing constraints or preference defects, while math reasoning improves only modestly without...</p>
  <small>E-task-pattern</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Treat generate, critique, refine, and stop-decision as separate logged runtime steps rather than one opaque completion.</p></div>
<div class="apple-card"><p>Persist every intermediate output and feedback item so a review can explain why a slide, summary, or code artifact changed.</p></div>
<div class="apple-card"><p>Do not treat self-feedback as a verifier. Where possible, pair critique prompts with external checks such as tests, parsers, graders, or task-specific...</p></div>
<div class="apple-card"><p>Iteration count is an infrastructure knob: it trades latency and cost for quality, and diminishing returns should be measured per task.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Self-Refine is a test-time prompting and orchestration method, not a new trained model.</p></div>
<div class="apple-card"><p>The strongest experiments use proprietary models such as GPT-3.5, ChatGPT, GPT-4, and Codex.</p></div>
<div class="apple-card"><p>Preference-based evaluations rely partly on humans and GPT-4-as-judge, so they are not all executable verifiers.</p></div>
<div class="apple-card"><p>Math reasoning gains are modest without an external signal that identifies wrong answers.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful local PoC would refine a generated paper summary against schema checks and compare one-shot versus iterative schema-valid output.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2303.17651">Self-Refine: Iterative Refinement with Self-Feedback</a></li><li>Project/code: <a href="https://selfrefine.info/">https://selfrefine.info/</a></li><li>builds-on: <a href="https://arxiv.org/abs/2201.11903">Chain-of-Thought Prompting</a></li><li>contrasts: <a href="https://arxiv.org/abs/2203.11171">Self-Consistency</a></li><li>contrasts: <a href="https://arxiv.org/abs/2303.11366">Reflexion</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/self-refine-madaan-2023.json`. Update the review record, then run `bun run build`.
