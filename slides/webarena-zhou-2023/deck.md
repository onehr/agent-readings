<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Evaluation and Benchmarks</p>
  <h1>WebArena</h1>
  <p class="deck-subtitle">Stateful web tasks with functional validators</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>ICLR 2024; arXiv 2023</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>WebArena is a self-hosted web benchmark where agents perform long-horizon tasks across realistic sites and are graded by functional correctness rather than matching reference actions.</h2>
  <p class="deck-note">For agents, WebArena captures a production-shaped task class: navigate, search, click, read, edit, coordinate multiple sites, and recover from mistakes in a stateful web environment.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Many web-agent environments were simplified, synthetic, or static snapshots rather than fully functional websites.</p></div>
<div class="apple-card"><p>Action-sequence matching fails when multiple valid paths can achieve the same web task.</p></div>
<div class="apple-card"><p>Live public websites are not reproducible because content, CAPTCHAs, bot defenses, and configuration drift over time.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to build a realistic and reproducible web environment for evaluating autonomous agents on functional task completion.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Host realistic web applications across common domains, populate them with real-world-like data, define high-level tasks, and evaluate final-state functional...</h2>
  <p class="deck-note">Host realistic web applications across common domains, populate them with real-world-like data, define high-level tasks, and evaluate final-state functional correctness through validators.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Build four fully functional self-hosted website domains: e-commerce, discussion forums, collaborative development, and content management.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Add utility tools and external knowledge sources such as maps, calculator, scratchpad, Wikipedia, and manuals.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Package hosting through Docker containers and gym-style APIs for reproducibility.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Create 812 long-horizon natural-language web tasks.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>environment state: all website/database states across the benchmark.</p></div>
<div class="apple-card"><p>observation: browser view or accessibility representation available to the agent.</p></div>
<div class="apple-card"><p>action: browser/tool command issued by the agent.</p></div>
<div class="apple-card"><p>transition: deterministic website response to an action.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
env = WebArena.start(docker=True)
state = env.reset(task_id)
intent = task.intent

while not done and steps < limit:
    obs = env.observe()
    action = agent.act(intent, obs, history)
    state, obs = env.step(action)
    history.append((action, obs))

success = task.validator(env.state)
score += int(success)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-self-hosted</span>
  <p>The paper introduces a standalone self-hosted web environment built for realistic and reproducible autonomous-agent evaluation.</p>
</div>
<div class="proof-card">
  <span>E-four-domains</span>
  <p>The environment includes fully operational websites for online shopping, discussion forums, collaborative software development, and business content management.</p>
</div>
<div class="proof-card">
  <span>E-tools-knowledge</span>
  <p>WebArena includes utility tools such as map, calculator, and scratchpad plus knowledge resources including Wikipedia and domain manuals.</p>
</div>
<div class="proof-card">
  <span>E-functional-validation</span>
  <p>The paper provides validators to programmatically check the functional correctness of each task and argues this better supports alternative valid paths than action-sequence...</p>
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
  <p>WebArena provides a realistic, reproducible, self-hosted web environment for language-guided agents.</p>
  <small>E-self-hosted</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The environment includes fully functional websites from four domains: e-commerce, forums, collaborative software development, and content management.</p>
  <small>E-four-domains</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>WebArena enriches tasks with tools and knowledge resources such as maps, calculator, scratchpad, Wikipedia, and manuals.</p>
  <small>E-tools-knowledge</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The benchmark uses functional correctness validators rather than action-sequence surface matching.</p>
  <small>E-functional-validation</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Web-agent evaluation needs stateful environments, not just transcript grading.</p></div>
<div class="apple-card"><p>Functional validators are the important object: they let agents take different valid paths while still receiving objective success/failure.</p></div>
<div class="apple-card"><p>Self-hosting trades live-web messiness for reproducibility; both dimensions matter depending on evaluation goal.</p></div>
<div class="apple-card"><p>Long-horizon web tasks expose active exploration, state tracking, and failure recovery weaknesses.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Paper-era baseline results are not current SOTA.</p></div>
<div class="apple-card"><p>Self-hosted sites are realistic but not the live web; CAPTCHAs, anti-bot systems, and arbitrary site drift are excluded.</p></div>
<div class="apple-card"><p>Validators are only as good as their task specification.</p></div>
<div class="apple-card"><p>A web benchmark can be gamed if environment internals or validator logic leak to the agent.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A compact PoC could host one tiny web app with a validator and evaluate whether an agent/browser script reaches the target state.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2307.13854">WebArena: A Realistic Web Environment for Building Autonomous Agents</a></li><li>Project/code: <a href="https://webarena.dev">https://webarena.dev</a></li><li>adds_user_policy: <a href="https://arxiv.org/abs/2406.12045">tau-bench</a></li><li>broader_computer_control: <a href="https://arxiv.org/abs/2404.07972">OSWorld</a></li><li>agent_loop: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/webarena-zhou-2023.json`. Update the review record, then run `bun run build`.
