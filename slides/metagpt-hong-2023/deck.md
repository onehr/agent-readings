<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Multi-Agent Systems</p>
  <h1>MetaGPT</h1>
  <p class="deck-subtitle">SOPs as the multi-agent control plane</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>arXiv 2023; current arXiv v7 revised 2024</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>MetaGPT makes multi-agent software development work more like an assembly line by encoding SOPs, role handoffs, and structured artifacts.</h2>
  <p class="deck-note">MetaGPT is the strongest SOP argument in the reading list. It treats agent orchestration as workflow engineering, where the payloads are PRDs, designs, APIs, tasks, code, tests, and feedback rather than free-form chat.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Role-playing and chat-based multi-agent systems can drift into idle chatter or inconsistent handoffs.</p></div>
<div class="apple-card"><p>Naively chaining LLMs can amplify hallucinations across agents.</p></div>
<div class="apple-card"><p>Software development requires structured intermediate artifacts, not only conversational agreement.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether encoding human software-development SOPs into an LLM multi-agent framework can make collaborative code generation more coherent and executable.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Model software development as a standardized multi-agent assembly line: each role creates structured outputs, publishes them to a shared pool, downstream roles...</h2>
  <p class="deck-note">Model software development as a standardized multi-agent assembly line: each role creates structured outputs, publishes them to a shared pool, downstream roles subscribe to prerequisites, and the Engineer iterates using executable tests and feedback.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Define agent profiles with name, role, goal, constraints, skills, and context.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Run the SOP sequence from requirement analysis through design, task decomposition, code generation, and QA.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Require structured artifacts at each handoff instead of unconstrained natural-language dialogue.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Store artifacts in a shared message pool and use subscriptions so agents receive relevant dependencies.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Requirement intake: the user provides a one-line software requirement.</p></div>
<div class="apple-card"><p>Product Manager: produce PRD, user stories, and requirement pool.</p></div>
<div class="apple-card"><p>Architect: turn requirements into file lists, data structures, interface definitions, and flow diagrams.</p></div>
<div class="apple-card"><p>Project Manager: decompose the design into implementable tasks.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
requirement = user.one_line_requirement()

prd = product_manager.write_prd(requirement)
message_pool.publish(prd)

design = architect.write_design(message_pool.subscribe("prd"))
message_pool.publish(design)

tasks = project_manager.assign_tasks(design)
message_pool.publish(tasks)

for task in tasks:
    code = engineer.write_code(prd, design, task)
    for retry in range(3):
        result = run_tests_or_precompile(code)
        if result.ok:
            break
        code = engineer.debug(code, result, message_pool.relevant_history())
    message_pool.publish(code)

qa_report = qa_engineer.write_tests_and_report(message_pool.subscribe("code"))
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-sop-framing</span>
  <p>The paper frames cascading hallucination as a problem in naive LLM chaining and proposes SOPs, role specialization, structured outputs, and workflow management as a...</p>
</div>
<div class="proof-card">
  <span>E-roles</span>
  <p>MetaGPT defines Product Manager, Architect, Project Manager, Engineer, and QA Engineer roles, each with profile, goal, constraints, context, and skills.</p>
</div>
<div class="proof-card">
  <span>E-structured-communication</span>
  <p>The paper argues pure natural language can distort information, so agents communicate through role-specific documents and diagrams such as PRDs, system interface designs,...</p>
</div>
<div class="proof-card">
  <span>E-message-pool</span>
  <p>Agents publish structured messages into a shared message pool and subscribe to role-relevant information; actions activate after prerequisite dependencies are received.</p>
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
  <p>MetaGPT encodes software-development SOPs into prompt sequences and agent workflows to reduce the cascading hallucinations of naive multi-agent chaining.</p>
  <small>E-sop-framing</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The core simulated company uses specialized Product Manager, Architect, Project Manager, Engineer, and QA Engineer roles.</p>
  <small>E-roles</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>MetaGPT replaces much unconstrained dialogue with structured documents and diagrams so downstream agents receive standardized handoff artifacts.</p>
  <small>E-structured-communication</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The shared message pool plus role-specific subscriptions is the communication substrate for publishing artifacts and triggering downstream actions.</p>
  <small>E-message-pool</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Multi-agent collaboration needs artifacts, not just messages. PRDs, designs, APIs, tasks, tests, and code are the state transferred between agents.</p></div>
<div class="apple-card"><p>SOPs are control planes. They define who acts, what they emit, who consumes it, and when downstream work can start.</p></div>
<div class="apple-card"><p>Publish-subscribe beats point-to-point chat for complex workflows because dependencies are explicit and reusable.</p></div>
<div class="apple-card"><p>Executable feedback is the load-bearing verifier. Code review by another LLM is weaker than running tests in a sandbox.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The current arXiv version is v7 from 2024, while the reading-list entry anchors the original 2023 paper.</p></div>
<div class="apple-card"><p>MetaGPT focuses on software-development workflows; claims should not be generalized to arbitrary multi-agent systems without evidence.</p></div>
<div class="apple-card"><p>The SoftwareDev benchmark is self-generated and only seven representative tasks are used for some comparisons.</p></div>
<div class="apple-card"><p>The framework requires safe code execution infrastructure, but the paper does not deeply analyze sandboxing.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful PoC would implement a tiny SOP pipeline that turns a one-line requirement into PRD, interface spec, code, and tests, with each artifact persisted and checked.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2308.00352">MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework</a></li><li>Project/code: <a href="https://github.com/FoundationAgents/MetaGPT">https://github.com/FoundationAgents/MetaGPT</a></li><li>contrast: <a href="https://arxiv.org/abs/2308.08155">AutoGen</a></li><li>contrast: <a href="https://arxiv.org/abs/2303.17760">CAMEL</a></li><li>connects-to: <a href="https://arxiv.org/abs/2305.16291">Voyager</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/metagpt-hong-2023.json`. Update the review record, then run `bun run build`.
