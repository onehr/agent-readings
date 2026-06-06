<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / The Agent Runtime</p>
  <h1>Reliable Distributed Systems</h1>
  <p class="deck-subtitle">Supervision trees before agent runtimes</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2003</strong><span>Doctoral dissertation, Royal Institute of Technology</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Armstrong's thesis argues that reliable systems can be built from faulty software by isolating concurrent processes, letting failed workers crash, and delegating recovery to explicit supervision hierarchies.</h2>
  <p class="deck-note">Modern agents are long-running programs made of model calls, tools, memory updates, and side effects. Armstrong gives the older systems vocabulary for making that shape survivable: isolation boundaries, restart specifications, supervisors, degraded service, and protocol-level fault detection.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Large telecom systems had to run continuously despite shipping with software defects.</p></div>
<div class="apple-card"><p>Traditional defensive programming mixed business logic and error recovery in the same code path.</p></div>
<div class="apple-card"><p>Distributed programs needed to tolerate process, message, software, and hardware failures without stopping the entire system.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The thesis asks how to program systems that behave reasonably even when the components implementing them contain software errors.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Organize the system as isolated tasks with explicit goals; when a task cannot achieve its goal, abort that task and delegate recovery to a supervisor that knows...</h2>
  <p class="deck-note">Organize the system as isolated tasks with explicit goals; when a task cannot achieve its goal, abort that task and delegate recovery to a supervisor that knows how to restart the right process or subtree.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Partition the application into isolated processes that communicate by message passing.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Define the goals and acceptable degraded modes of the system as a task hierarchy.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Write workers so that unrecoverable local errors crash instead of tangling business logic with generic recovery.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Attach workers and lower supervisors to supervision trees with start/stop/restart specifications.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>worker: a process that performs application work.</p></div>
<div class="apple-card"><p>supervisor: a process that watches workers or lower supervisors.</p></div>
<div class="apple-card"><p>exit signal: runtime notification that a process failed or stopped.</p></div>
<div class="apple-card"><p>restart specification: data describing how to start, stop, or restart a child.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
supervisor = Supervisor(strategy="one_for_one", max_restarts=5, window_seconds=1000)
supervisor.child("packet", start=packet_assembler.start, restart="permanent")
supervisor.child("server", start=kv.start, restart="permanent")
supervisor.child("logger", start=simple_logger.start, restart="permanent")

while supervisor.running:
    event = wait_for_child_exit()
    if event.reason != "normal":
        supervisor.restart(event.child)
    if supervisor.restart_rate_exceeded():
        crash_to_parent_supervisor()
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-errors-assumed</span>
  <p>Armstrong states that large programs will probably contain errors when put into service and asks how to build systems that behave reasonably despite those errors.</p>
</div>
<div class="proof-card">
  <span>E-fault-isolation</span>
  <p>The thesis identifies fault isolation as the essential problem: isolate code for each goal so errors can be detected and prevented from propagating to other simultaneous goals.</p>
</div>
<div class="proof-card">
  <span>E-let-it-crash</span>
  <p>The thesis explicitly says workers should crash on errors they cannot handle, while separate supervisor processes are responsible for correction and recovery.</p>
</div>
<div class="proof-card">
  <span>E-supervision</span>
  <p>Supervisors monitor workers or other supervisors, keep start/stop/restart specifications, restart failed children under OR supervision, restart groups under AND supervision, and...</p>
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
  <p>The thesis treats software errors as expected in large deployed systems and designs for acceptable behavior despite them.</p>
  <small>E-errors-assumed</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>Fault isolation is the central runtime requirement: errors in one task must not propagate arbitrarily to unrelated tasks.</p>
  <small>E-fault-isolation</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>The let-it-crash rule separates application work from generic recovery by letting workers fail and supervisors repair the system.</p>
  <small>E-let-it-crash</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Supervisors encode restart policy in a hierarchy and can restart one child, a dependent group, or fail upward when restart limits are exceeded.</p>
  <small>E-supervision</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>A serious agent runtime needs a supervision tree, even if it calls it a workflow, retry policy, task graph, or orchestration plan.</p></div>
<div class="apple-card"><p>Letting an agent step fail is only safe when the runtime knows what state to discard, what state to replay, and which side effects are already...</p></div>
<div class="apple-card"><p>Agent workers should be small failure domains: model call, tool call, parser, verifier, memory update, and finalizer are different restart units.</p></div>
<div class="apple-card"><p>Generic recovery belongs in the runtime layer; task-specific reasoning belongs in the worker.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The thesis predates cloud workflow engines, containers, LLMs, and modern exactly-once execution patterns.</p></div>
<div class="apple-card"><p>Crash-only recovery can duplicate external side effects unless the runtime records and deduplicates them.</p></div>
<div class="apple-card"><p>Erlang process isolation is stronger and more uniform than many agent frameworks' in-process task abstractions.</p></div>
<div class="apple-card"><p>The telecom case studies prove practical viability in that domain, not universal superiority for every distributed architecture.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A minimal PoC could model an agent task as workers under a supervisor with bounded restart counts and idempotent step logs.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://worrydream.com/refs/Armstrong_2003_-_Making_reliable_distributed_systems_in_the_presence_of_software_errors.pdf">Making Reliable Distributed Systems in the Presence of Software Errors</a></li><li>Project/code: <a href="https://www.erlang.org/">https://www.erlang.org/</a></li><li>ancestor: <a href="https://docs.dbos.dev/why-dbos">Durable Execution</a></li><li>connects: <a href="https://people.eecs.berkeley.edu/~matei/papers/2022/vldb_dbos.pdf">DBOS</a></li><li>runtime_for: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/reliable-distributed-systems-armstrong-2003.json`. Update the review record, then run `bun run build`.
