<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / The Agent Runtime</p>
  <h1>Durable Execution</h1>
  <p class="deck-subtitle">Replayable control flow for agents</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2026</strong><span>Background reading and product documentation</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>source-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Durable execution records workflow progress so long-running code can resume after failures without redoing already completed steps or losing the logical trajectory.</h2>
  <p class="deck-note">Agents are exactly the kind of long-lived, side-effecting workflow durable execution was built for: model calls, tool calls, sleeps, callbacks, retries, and user interactions must survive crashes without duplicating actions or losing context.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Ordinary process memory loses workflow state on crash, deploy, timeout, or machine restart.</p></div>
<div class="apple-card"><p>Ad-hoc retry logic can duplicate side effects, skip recovery cases, or restart expensive work from the beginning.</p></div>
<div class="apple-card"><p>Logs are often good enough for debugging but not strong enough to reconstruct executable control flow.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>Durable execution fills the gap between stateless request handling and reliable long-running programs by making step history part of the runtime contract.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Keep orchestration deterministic, move every external or random operation into a durable boundary, persist each completed boundary's result, and recover by...</h2>
  <p class="deck-note">Keep orchestration deterministic, move every external or random operation into a durable boundary, persist each completed boundary's result, and recover by replaying the workflow until the first boundary without a recorded result.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Start a workflow and persist its input.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Run deterministic orchestration code until it reaches a durable operation.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Execute the step/activity and persist its output before advancing the workflow.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>If the process fails, restart the workflow with its checkpointed input.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>workflow input: arguments recorded at workflow start.</p></div>
<div class="apple-card"><p>durable step/activity: a named operation whose output is persisted.</p></div>
<div class="apple-card"><p>history/checkpoint store: database or service-side log containing completed steps and events.</p></div>
<div class="apple-card"><p>replay: rerun orchestration code from the top, returning recorded step outputs instead of re-executing completed steps.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
workflow(input):
    plan = deterministic_plan(input)

    profile = step("load-profile", () => db.read(input.user_id))
    quote = step("model-call", () => llm.generate(profile, plan))
    charge_id = step("charge", () => payments.charge(input.amount, idem_key=input.workflow_id))
    receipt = step("notify", () => email.send(input.email, quote, charge_id))

    return receipt

recover(workflow_id):
    input, checkpoints = load_history(workflow_id)
    replay workflow(input)
    completed steps return checkpoints
    first missing step executes normally
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-durable-definition</span>
  <p>DBOS describes durable workflows built on Postgres that recover from failures where they left off, while Temporal describes crash-proof execution that resumes after crashes,...</p>
</div>
<div class="proof-card">
  <span>E-dbos-recovery</span>
  <p>DBOS stores workflow inputs and step outputs, detects interrupted workflows, restarts them with checkpointed inputs, returns checkpointed outputs for completed steps, and resumes...</p>
</div>
<div class="proof-card">
  <span>E-temporal-replay</span>
  <p>Temporal uses event sourcing to recover workflow objects; when workflow state is restored, code is re-executed from the beginning, and side effects such as activity invocations...</p>
</div>
<div class="proof-card">
  <span>E-determinism</span>
  <p>All three sources state that code replayed by the durable runtime must be deterministic, and that non-deterministic work such as time, random values, external I/O, service calls,...</p>
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
  <span>C1 · source-supported</span>
  <p>Durable execution persists workflow progress so applications can recover from crashes, restarts, and failures without starting from the beginning.</p>
  <small>E-durable-definition</small>
</div>
<div class="claim-card">
  <span>C2 · source-supported</span>
  <p>DBOS recovery re-executes workflows from checkpointed inputs and returns stored step outputs until it reaches the failed or uncompleted step.</p>
  <small>E-dbos-recovery</small>
</div>
<div class="claim-card">
  <span>C3 · source-supported</span>
  <p>Temporal uses event sourcing to restore workflow state by replaying workflow code against recorded history while ignoring already-recorded side effects.</p>
  <small>E-temporal-replay</small>
</div>
<div class="claim-card">
  <span>C4 · source-supported</span>
  <p>Durable execution requires deterministic orchestration code: random values, wall-clock time, external I/O, service calls, and database reads must be inside...</p>
  <small>E-determinism</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>An agent trajectory should be a recoverable workflow history, not just a chat transcript.</p></div>
<div class="apple-card"><p>Every non-deterministic agent operation belongs behind a durable boundary: model call, tool call, memory read, memory write, clock, random choice,...</p></div>
<div class="apple-card"><p>Model calls are side effects for replay purposes. Record the prompt, model identity, parameters, returned text, tool-call JSON, usage, and errors...</p></div>
<div class="apple-card"><p>Idempotency keys are required anywhere the agent can charge money, send mail, create files, open tickets, mutate databases, or call external services.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>This is background reading synthesized from product documentation, not a single peer-reviewed paper.</p></div>
<div class="apple-card"><p>Durable execution does not make side effects exactly-once by magic; external systems need idempotency or transactions.</p></div>
<div class="apple-card"><p>The deterministic replay model can conflict with highly dynamic agent graphs unless graph evolution is versioned.</p></div>
<div class="apple-card"><p>Replay recovers execution state, not semantic correctness. A recovered agent can still pursue the wrong goal.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A compact PoC could implement a SQLite-backed durable agent loop that records model-call and tool-call outputs and resumes after a simulated crash.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://docs.dbos.dev/why-dbos">Durable Execution</a></li><li>Project/code: <a href="https://docs.dbos.dev/architecture">https://docs.dbos.dev/architecture</a></li><li>data_substrate: <a href="https://people.eecs.berkeley.edu/~matei/papers/2022/vldb_dbos.pdf">DBOS</a></li><li>fault_tolerance: <a href="https://worrydream.com/refs/Armstrong_2003_-_Making_reliable_distributed_systems_in_the_presence_of_software_errors.pdf">Making Reliable Distributed Systems in the Presence of Software Errors</a></li><li>runtime_target: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/durable-execution-background-2026.json`. Update the review record, then run `bun run build`.
