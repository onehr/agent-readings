<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Reasoning, Acting, and Reflection</p>
  <h1>Reflexion</h1>
  <p class="deck-subtitle">Verbal feedback as cross-trial agent memory</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>arXiv</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Reflexion teaches an LLM agent across trials by turning task feedback into verbal self-reflections stored in memory, without updating model weights.</h2>
  <p class="deck-note">Reflexion makes agent learning a runtime data problem rather than only a training problem: trajectories, evaluator signals, reflections, and memory windows become first-class state.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>LLM agents could act in environments using prompting, but mostly learned from in-context examples rather than from their own failed trials.</p></div>
<div class="apple-card"><p>Traditional reinforcement learning can learn from reward, but often requires many samples and expensive model updates.</p></div>
<div class="apple-card"><p>Scalar rewards provide weak credit assignment for long language-agent trajectories.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether agents can improve over repeated attempts by converting feedback into natural-language experience summaries and reusing those summaries as memory.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Run the agent for a task attempt, evaluate the trajectory, generate a natural-language reflection from the feedback and trajectory, append that reflection to...</h2>
  <p class="deck-note">Run the agent for a task attempt, evaluate the trajectory, generate a natural-language reflection from the feedback and trajectory, append that reflection to memory, and retry with the memory in context until success or a trial limit.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Generate an initial trajectory with an Actor such as ReAct or CoT.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Evaluate the result with task-specific feedback.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Ask the Self-Reflection model to convert feedback and trajectory into a useful lesson.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Store the reflection in memory.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Actor: the LLM policy that emits text, actions, or code conditioned on observations and memory.</p></div>
<div class="apple-card"><p>Evaluator: an environment, heuristic, exact-match grader, test runner, compiler, or LLM that scores the trajectory.</p></div>
<div class="apple-card"><p>Self-reflection: an LLM-generated verbal summary of the failure mode or lesson.</p></div>
<div class="apple-card"><p>Memory: a bounded buffer of previous reflections, usually 1-3 experiences in the paper's setups.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
memory = []
for trial in 1..max_trials:
    trajectory = actor(task, memory)
    reward, feedback = evaluator(trajectory)
    if reward == success:
        return trajectory
    reflection = reflect(trajectory, feedback, memory)
    memory = keep_recent(memory + [reflection], limit=3)
return failure
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
  <p>The paper defines Reflexion as verbal reinforcement where an agent reflects on task feedback, stores reflective text in memory, and conditions future trials on that memory...</p>
</div>
<div class="proof-card">
  <span>E-components</span>
  <p>Reflexion uses an Actor to generate text/actions, an Evaluator to score trajectories, a Self-Reflection model to generate verbal cues, and short/long-term memory. The paper...</p>
</div>
<div class="proof-card">
  <span>E-alfworld</span>
  <p>On 134 ALFWorld tasks, ReAct + Reflexion completes 130 of 134 tasks using the simple heuristic, and the paper summarizes an absolute 22% improvement over strong baselines in 12...</p>
</div>
<div class="proof-card">
  <span>E-hotpotqa</span>
  <p>The paper reports Reflexion outperforms CoT-only, ReAct-only, and CoT(GT)-only baselines across several learning steps on 100 HotPotQA questions, and summarizes a 20% reasoning...</p>
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
  <p>Reflexion reinforces an agent through verbal self-reflection stored in memory rather than through weight updates.</p>
  <small>E-method</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The framework decomposes learning into Actor, Evaluator, Self-Reflection, and memory components.</p>
  <small>E-components</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>On ALFWorld, ReAct plus Reflexion solves far more tasks than ReAct alone over repeated trials.</p>
  <small>E-alfworld</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>On HotPotQA, Reflexion improves both CoT-style reasoning and ReAct-style retrieval/reasoning over repeated attempts.</p>
  <small>E-hotpotqa</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Reflexion makes failed trajectories reusable data. A runtime should persist trajectory, evaluator result, reflection text, and retry attempt together.</p></div>
<div class="apple-card"><p>Feedback amplification is a separate component: scalar reward or binary failure is not enough unless converted into an actionable memory item.</p></div>
<div class="apple-card"><p>Reflection memory needs lifecycle rules: size limits, replacement, retrieval, and stale or misleading lessons become correctness concerns.</p></div>
<div class="apple-card"><p>External evaluators matter. Exact match, environment completion, compiler logs, and unit tests all create different reflection quality and failure...</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Reflexion is not gradient-based reinforcement learning and does not update model weights.</p></div>
<div class="apple-card"><p>The method depends on the LLM's self-evaluation or on task heuristics; poor feedback can produce poor reflections.</p></div>
<div class="apple-card"><p>The memory window is small in the paper's experiments, usually 1-3 reflections, and can lose useful history.</p></div>
<div class="apple-card"><p>Repeated retries increase cost and can still converge to non-optimal local behavior.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful local PoC would run a toy ReAct-like agent on deterministic text tasks, persist failed trajectories plus reflection notes, and compare first-attempt vs retry success.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2303.11366">Reflexion: Language Agents with Verbal Reinforcement Learning</a></li><li>Project/code: <a href="https://github.com/noahshinn024/reflexion">https://github.com/noahshinn024/reflexion</a></li><li>extends: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li><li>extends: <a href="https://arxiv.org/abs/2201.11903">Chain-of-Thought Prompting</a></li><li>contrasts: <a href="https://arxiv.org/abs/2303.17651">Self-Refine</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/reflexion-shinn-2023.json`. Update the review record, then run `bun run build`.
