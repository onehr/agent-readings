<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Planning and Skill Acquisition</p>
  <h1>LLM+P</h1>
  <p class="deck-subtitle">Let the LLM translate; let the planner plan</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>arXiv 2023</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>LLM+P gets reliable plans by making the LLM translate natural language into PDDL and letting a classical planner do the search.</h2>
  <p class="deck-note">The paper is a clean neuro-symbolic systems pattern for agents: separate semantic parsing from plan search, keep a domain model explicit, and route correctness through a verifier/planner instead of model plausibility.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>LLMs produce plausible natural-language plans that often violate action preconditions or world constraints.</p></div>
<div class="apple-card"><p>Classical planners can produce correct or optimal plans, but require structured domain and problem encodings.</p></div>
<div class="apple-card"><p>Robot users naturally specify goals in language, not PDDL.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether an LLM can be used as a translation layer into PDDL so a classical planner can provide the actual planning competence.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Use the LLM for translation into and out of the formal planning language, but use a classical planner for the search and correctness-critical plan generation.</h2>
  
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Provide a domain PDDL file for the robot planning domain.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Prompt GPT-4 with the new natural-language planning problem plus one demonstration pair of natural language and PDDL.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Ask the model to produce only the problem PDDL.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Feed the domain and generated problem file to Fast Downward.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Natural-language problem: user describes initial state and goal.</p></div>
<div class="apple-card"><p>Domain PDDL: expert-supplied actions, predicates, preconditions, effects, and optional costs.</p></div>
<div class="apple-card"><p>Context example: one natural-language problem and matching problem PDDL file.</p></div>
<div class="apple-card"><p>Problem PDDL generation: the LLM writes the objects, init facts, and goal facts for the new task.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
domain = load_domain_pddl(domain_name)
example = load_example_pair(domain_name)
problem_pddl = llm.translate_to_pddl(user_problem, example, domain_hint)

plan = fast_downward.solve(domain, problem_pddl, alias="seq-opt-fdss-1")
if plan.timeout_or_fail():
    plan = fast_downward.solve(domain, problem_pddl, alias="lama")

answer = llm.translate_plan_to_language(plan)
return answer
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-pipeline</span>
  <p>The pipeline asks the LLM to produce a problem PDDL file, feeds it with a human-provided domain PDDL file to a classical planner, then translates the planner output back to...</p>
</div>
<div class="proof-card">
  <span>E-context</span>
  <p>Without context, GPT-4's PDDL example has made-up predicates and missing initial facts. With a simple natural-language/PDDL example, the sample problem becomes directly solvable....</p>
</div>
<div class="proof-card">
  <span>E-benchmark</span>
  <p>The benchmark contains seven domains borrowed from past International Planning Competitions: Blocksworld, Barman, Floortile, Grippers, Storage, Termes, and Tyreworld, with 20...</p>
</div>
<div class="proof-card">
  <span>E-llm-as-p-fails</span>
  <p>The paper reports that LLM-as-P returns natural-language plans for every problem but most are infeasible. It cites failures tracking Blocksworld on/clear predicates, Barman...</p>
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
  <p>LLM+P delegates planning search to a classical planner after an LLM translates a natural-language task into a PDDL problem file.</p>
  <small>E-pipeline</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>A simple in-context example is crucial because GPT-4 often emits incorrect PDDL without a demonstration pair.</p>
  <small>E-context</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>The benchmark covers seven robot-planning domains with 20 generated tasks per domain.</p>
  <small>E-benchmark</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Direct LLM planning mostly produces infeasible plans because it fails to track preconditions and spatial constraints.</p>
  <small>E-llm-as-p-fails</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Use LLMs as translators when a sound solver exists. Planning correctness should come from the planner, not from plausible prose.</p></div>
<div class="apple-card"><p>The action model is infrastructure. Domain PDDL is a contract over capabilities, preconditions, effects, and costs.</p></div>
<div class="apple-card"><p>Structured intermediate representations make agent failures inspectable: bad plan versus bad translation is a different bug.</p></div>
<div class="apple-card"><p>One-shot examples can be enough to steer translation, but production systems need validation and repair loops for generated PDDL.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The domain model is manually supplied; LLM+P does not learn or verify the domain PDDL.</p></div>
<div class="apple-card"><p>The planner can only be correct with respect to the given domain and problem encoding.</p></div>
<div class="apple-card"><p>Generated PDDL can omit facts or use wrong predicates, causing planner failure or an invalid plan request.</p></div>
<div class="apple-card"><p>Floortile remains unsolved in the reported table.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful PoC would translate a tiny Blocks World natural-language instance into PDDL, run a local planner or validator, and translate the plan back to text.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2304.11477">LLM+P: Empowering Large Language Models with Optimal Planning Proficiency</a></li><li>Project/code: <a href="https://github.com/Cranial-XIX/llm-pddl">https://github.com/Cranial-XIX/llm-pddl</a></li><li>baseline: <a href="https://arxiv.org/abs/2305.10601">Tree of Thoughts</a></li><li>counterpart: <a href="https://arxiv.org/abs/2305.15771">On the Planning Abilities of LLMs</a></li><li>contrast: <a href="https://arxiv.org/abs/2305.16291">Voyager</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/llm-p-liu-2023.json`. Update the review record, then run `bun run build`.
