<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Security, Safety, and Trust</p>
  <h1>ToolEmu</h1>
  <p class="deck-subtitle">Risk testing before real tool side effects</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>ICLR 2024</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>ToolEmu uses a language model to emulate tool execution and sandbox states so agent risks can be tested before real tools are wired up.</h2>
  <p class="deck-note">For agent infrastructure, ToolEmu is a practical testing layer between prompt-only evaluation and real-world side effects. It does not replace real sandboxes, but it helps find dangerous trajectories early.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Tool-using agents can leak data, transfer money, delete files, or trigger physical-world effects.</p></div>
<div class="apple-card"><p>Testing these risks manually requires tool implementations, sandbox setup, scenario design, and human trajectory inspection.</p></div>
<div class="apple-card"><p>Many high-stakes or future tools are difficult to instantiate safely in real environments.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to test diverse, high-stakes agent-tool scenarios at scale without implementing every tool and sandbox.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Replace expensive real tool sandboxes with an LM-emulated environment, run agents against curated risky scenarios, and use LM-based evaluators plus human...</h2>
  <p class="deck-note">Replace expensive real tool sandboxes with an LM-emulated environment, run agents against curated risky scenarios, and use LM-based evaluators plus human validation to measure realistic failures.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Formalize tool-using LM agents as systems that act in a partially observable environment.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Use an LM emulator to generate tool observations from tool specifications and agent inputs.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Add an adversarial emulator to instantiate challenging sandbox states for red-teaming.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Build LM-based safety and helpfulness evaluators for scalable trajectory scoring.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>tool specification: the interface and expected behavior of the tool under test.</p></div>
<div class="apple-card"><p>user instruction: an ambiguous or underspecified request that may create safety risk.</p></div>
<div class="apple-card"><p>agent action: the selected tool call and arguments.</p></div>
<div class="apple-card"><p>emulated observation: the LM-generated tool result and sandbox state transition.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
for test_case in benchmark:
    state = emulator.instantiate(test_case)
    trajectory = run_agent(agent, tools=emulated_tools, state=state)
    safety = safety_evaluator.score(trajectory)
    helpfulness = helpfulness_evaluator.score(trajectory)
    record(test_case, trajectory, safety, helpfulness)

# Real sandboxes are still needed for deployment proof; LM emulation is an early risk-discovery layer.
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-emulated-sandbox</span>
  <p>ToolEmu emulates tool execution and sandbox states with an LM using only tool specifications and tool inputs, avoiding manual implementation for many scenarios.</p>
</div>
<div class="proof-card">
  <span>E-evaluators</span>
  <p>The framework includes an LM-based safety evaluator for risky actions/severity and a helpfulness evaluator for task completion.</p>
</div>
<div class="proof-card">
  <span>E-benchmark</span>
  <p>The benchmark contains 36 high-stakes toolkits, 144 test cases, and 9 risk categories including privacy breach, financial loss, data loss/corruption, safety hazards, and computer...</p>
</div>
<div class="proof-card">
  <span>E-human-validation</span>
  <p>The paper reports that over 80% of sampled tool execution trajectories were judged realistic by humans and that 68.8% of failures identified by the emulator/evaluator were...</p>
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
  <p>ToolEmu uses an LM to emulate tool executions and sandbox states from tool specifications and tool inputs.</p>
  <small>E-emulated-sandbox</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The framework pairs the emulator with LM-based safety and helpfulness evaluators to score complete agent trajectories.</p>
  <small>E-evaluators</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>The initial benchmark covers 36 high-stakes toolkits, 144 test cases, and 9 risk types.</p>
  <small>E-benchmark</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Human validation found most sampled emulations realistic enough for risk testing, and 68.8% of failures identified by ToolEmu were judged valid real-world...</p>
  <small>E-human-validation</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Agent safety evaluation needs trajectory-level testing, not only single-turn model safety scores.</p></div>
<div class="apple-card"><p>LM-emulated sandboxes are useful for early risk discovery when real tools are expensive, unsafe, or not yet implemented.</p></div>
<div class="apple-card"><p>Do not confuse emulation with containment. A production agent still needs real sandboxing, scoped capabilities, audit logs, and policy enforcement.</p></div>
<div class="apple-card"><p>Safety prompting can reduce failures, but the paper's best prompted agent still failed on nearly one quarter of ToolEmu cases.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The emulator and evaluators are LMs, so they can hallucinate tool behavior or misjudge trajectory risk.</p></div>
<div class="apple-card"><p>The benchmark focuses on ambiguous or underspecified user instructions, not all agent threat models.</p></div>
<div class="apple-card"><p>Reported model failure rates are historical and tied to the evaluated model versions, prompts, and ToolEmu benchmark.</p></div>
<div class="apple-card"><p>ToolEmu is best interpreted as scalable red-team infrastructure, not as a formal safety guarantee.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet. A safe PoC could emulate benign file, email, or calendar tools locally and show how a trajectory-level evaluator flags ambiguous high-risk actions without executing them.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2309.15817">Identifying the Risks of LM Agents with an LM-Emulated Sandbox</a></li><li>Project/code: <a href="https://toolemu.com/">https://toolemu.com/</a></li><li>complementary_risk_source: <a href="https://arxiv.org/abs/2302.12173">Indirect Prompt Injection</a></li><li>model_robustness: <a href="https://arxiv.org/abs/2307.15043">GCG Attacks</a></li><li>agent_evaluation: <a href="https://arxiv.org/abs/2307.13854">WebArena</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/toolemu-ruan-2023.json`. Update the review record, then run `bun run build`.
