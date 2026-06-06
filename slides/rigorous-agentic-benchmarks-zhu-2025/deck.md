<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Evaluation and Benchmarks</p>
  <h1>Rigorous Agentic Benchmarks</h1>
  <p class="deck-subtitle">If the sandbox is weak, the benchmark is weak</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2025</strong><span>arXiv 2025</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>This paper turns agent benchmark quality into a checklist-driven validity problem: task validity, outcome validity, and honest benchmark reporting.</h2>
  <p class="deck-note">For agent infrastructure, the paper is a warning that benchmark harnesses are attack surfaces. A weak evaluator measures shortcuts, stale state, leakage, or parser bugs instead of agent capability.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Agent benchmarks often grade complex multistep outcomes with tests, string matching, LLM judges, or state comparisons.</p></div>
<div class="apple-card"><p>Those success signals can be incomplete, brittle, stale, or directly exploitable by agents.</p></div>
<div class="apple-card"><p>Leaderboard scores are increasingly used for research and product decisions, so evaluator flaws can misrepresent real capability.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to systematically design, assess, and report agentic benchmarks so their scores correspond to the intended capability.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Collect common agentic benchmark failure modes, organize them into an actionable checklist, apply that checklist to popular benchmarks, validate issues with...</h2>
  <p class="deck-note">Collect common agentic benchmark failure modes, organize them into an actionable checklist, apply that checklist to popular benchmarks, validate issues with experiments, and show that the checklist can improve a complex benchmark during construction.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Survey agentic benchmark pitfalls, evaluation frameworks, and best practices from software testing and benchmark design.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Define two core validity criteria: task validity and outcome validity.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Create ABC with three sections: outcome validity, task validity, and benchmark reporting.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Apply ABC to selected widely used open-source agentic benchmarks covering software engineering, cybersecurity, assistants, and environment...</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>agentic task: target capability plus environment and tools.</p></div>
<div class="apple-card"><p>task outcome: unstructured result such as text, code, file edits, state changes, or attack effects.</p></div>
<div class="apple-card"><p>success signal: string match, unit test, fuzz test, LLM judge, state match, quality metric, or E2E check.</p></div>
<div class="apple-card"><p>task validity check: asks whether task setup, tools, environment, and implementation admit shortcuts or impossible...</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
for benchmark in selected_agentic_benchmarks:
    assessment = ABC.apply(benchmark)
    for issue in assessment.suspected_issues:
        exploit = design_trivial_or_shortcut_agent(issue)
        measured = run_benchmark(exploit)
        impact = compare(measured, intended_success)
        report(issue, impact)

if benchmark_under_construction:
    patch = fix_task_or_evaluator(issue)
    rerun_and_quantify_overestimation_reduction(patch)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-validity-taxonomy</span>
  <p>The paper defines outcome validity as whether the evaluation result indicates true task success, and task validity as whether success corresponds to possessing the target...</p>
</div>
<div class="proof-card">
  <span>E-abc-structure</span>
  <p>ABC is organized into outcome validity, task validity, and benchmark reporting, with checks for string matching, LLM judges, unit/fuzz/E2E testing, state matching, tool versions,...</p>
</div>
<div class="proof-card">
  <span>E-assessment-results</span>
  <p>Across ten selected open-source agentic benchmarks, the authors find seven violating task validity, seven violating outcome validity, and all ten with benchmark-reporting...</p>
</div>
<div class="proof-card">
  <span>E-relative-error</span>
  <p>The paper says evaluation issues can cause under- or overestimation of agent performance by up to 100% in relative terms.</p>
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
  <p>The paper identifies task validity and outcome validity as the two central threats to rigorous agentic evaluation.</p>
  <small>E-validity-taxonomy</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>ABC organizes best practices into outcome validity, task validity, and benchmark reporting.</p>
  <small>E-abc-structure</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>Applying ABC to ten popular agentic benchmarks found seven with task-validity issues, seven with outcome-validity issues, and all ten with reporting...</p>
  <small>E-assessment-results</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The paper reports benchmark issues that can under- or overestimate agent performance by up to 100% in relative terms.</p>
  <small>E-relative-error</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Benchmark harnesses must be treated like security-sensitive infrastructure because agents can exploit files, state, parsers, tests, judges, and stale...</p></div>
<div class="apple-card"><p>Outcome validators need adversarial baselines: do-nothing, answer-spamming, database-dumping, and test-tampering agents should fail by construction.</p></div>
<div class="apple-card"><p>Task reset and ground-truth isolation are core runtime requirements, not benchmark polish.</p></div>
<div class="apple-card"><p>For web and GUI benchmarks, frozen environments matter because live selectors, layouts, URLs, and rate limits drift.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>ABC is an assessment framework, not a full formal proof of benchmark validity.</p></div>
<div class="apple-card"><p>The paper audits selected benchmarks; private or newer benchmarks may have different failure modes.</p></div>
<div class="apple-card"><p>Some public benchmark issues cited by the paper or repository may already have been patched.</p></div>
<div class="apple-card"><p>The checklist can increase benchmark-building cost because better validators, frozen environments, and oracle solvers require engineering effort.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful PoC would implement a tiny state-matching benchmark plus do-nothing and answer-spamming baselines that expose invalid success criteria.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2507.02825">Establishing Best Practices for Building Rigorous Agentic Benchmarks</a></li><li>Project/code: <a href="https://uiuc-kang-lab.github.io/agentic-benchmarks/">https://uiuc-kang-lab.github.io/agentic-benchmarks/</a></li><li>evaluated_benchmark: <a href="https://arxiv.org/abs/2310.06770">SWE-bench</a></li><li>evaluated_benchmark: <a href="https://arxiv.org/abs/2406.12045">tau-bench</a></li><li>evaluated_benchmark: <a href="https://arxiv.org/abs/2404.07972">OSWorld</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/rigorous-agentic-benchmarks-zhu-2025.json`. Update the review record, then run `bun run build`.
