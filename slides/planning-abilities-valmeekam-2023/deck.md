<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Planning and Skill Acquisition</p>
  <h1>Planning Abilities</h1>
  <p class="deck-subtitle">LLMs are plan sketchers, not planners</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>NeurIPS 2023 Spotlight</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>LLMs are weak autonomous planners but useful plan sketchers when an external planner or verifier owns correctness.</h2>
  <p class="deck-note">This paper is the hard boundary around agent planning hype. It gives agent builders a concrete architecture lesson: keep domain models, validators, and planners in the loop, and never treat an LLM's natural-language plan as proof of executability.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Many agent demos evaluated plans by plausibility or human inspection rather than executability against a domain model.</p></div>
<div class="apple-card"><p>LLMs often produce natural-language plans that look reasonable but violate action preconditions or fail to reach goals.</p></div>
<div class="apple-card"><p>Human-in-the-loop iterative correction can hide who is doing the planning, creating a Clever Hans problem.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether LLMs can autonomously generate executable plans in classical planning tasks, and whether their failed plans can still help sound planners or verifiers.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Generate planning prompts from PDDL domains, test LLM plans autonomously with a validator, then separately test whether LLM candidate plans help external...</h2>
  <p class="deck-note">Generate planning prompts from PDDL domains, test LLM plans autonomously with a validator, then separately test whether LLM candidate plans help external planners or verifier-backed repair.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Generate planning instances from PDDL domains and translate them into natural-language and PDDL prompt variants.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Evaluate GPT-family models, BLOOM, and a fine-tuned GPT-3 variant in autonomous mode by validating generated plans.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Stress-test GPT-4 with Mystery Blocksworld name obfuscations.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Evaluate forgiving plan-validation relaxations to see whether failed plans are close to correct.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Domain prompt: lifted action model, preconditions, effects, initial state, and goal.</p></div>
<div class="apple-card"><p>Prompt mode: natural language or PDDL; zero-shot or one-shot; optional state-tracking chain of thought.</p></div>
<div class="apple-card"><p>Plan extraction: parse the LLM response until a plan-end tag.</p></div>
<div class="apple-card"><p>Validation: use VAL to check whether the plan is executable and reaches the goal.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
for problem in benchmark:
    prompt = render_prompt(problem, mode="natural_language", examples=0_or_1)
    candidate = llm.generate(prompt)
    plan = extract_plan(candidate)
    valid = val.validate(problem.domain, problem.instance, plan)

    if heuristic_mode:
        repaired = lpg.solve(seed_plan=plan, domain=problem.domain, instance=problem.instance)

    if backprompt_mode and not valid:
        for round in range(15):
            feedback = val.explain_failure(plan)
            plan = llm.generate(prompt + feedback)
            if val.validate(problem.domain, problem.instance, plan):
                break
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-eval-design</span>
  <p>The paper evaluates LLMs in autonomous mode, where generated plans are validated by VAL, and heuristic mode, where generated plans are used by external planners or verifiers.</p>
</div>
<div class="proof-card">
  <span>E-headline</span>
  <p>The abstract states that the best model, GPT-4, has an average autonomous executable-plan success rate of about 12% across domains.</p>
</div>
<div class="proof-card">
  <span>E-blocksworld</span>
  <p>GPT-4 solves 210/600 (34.6%) zero-shot natural-language Blocksworld instances, 214/600 (35.6%) with chain-of-thought, 106/600 (17.6%) zero-shot PDDL instances, and 75/600 (12.5%)...</p>
</div>
<div class="proof-card">
  <span>E-obfuscation</span>
  <p>With zero-shot natural-language prompts, GPT-4 solves 210/600 ordinary Blocksworld instances, but only 1/600 deceptive Mystery Blocksworld instances and 0/600 randomized Mystery...</p>
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
  <p>The paper separates LLM planning evaluation into autonomous mode and heuristic mode, using automated planning tools to avoid plausibility-only assessment.</p>
  <small>E-eval-design</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>In autonomous mode, the best model, GPT-4, averages only about 12% executable-plan success across domains.</p>
  <small>E-headline</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>Even in Blocksworld, GPT-4 reaches only around one-third success, and chain-of-thought or PDDL-formatted prompts do not fix the failure.</p>
  <small>E-blocksworld</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Obfuscating action and predicate names causes a catastrophic drop, showing that GPT-4's apparent planning depends strongly on familiar semantics.</p>
  <small>E-obfuscation</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Do not let plan-shaped text bypass an executable validator. Planning outputs need machine-checkable preconditions, effects, and goals.</p></div>
<div class="apple-card"><p>LLMs can be good proposal generators while still being bad autonomous planners. Architect the loop so a sound planner or verifier owns correctness.</p></div>
<div class="apple-card"><p>Name obfuscation is a useful stress test: if a model collapses when labels lose semantics, it is pattern matching more than planning.</p></div>
<div class="apple-card"><p>Verifier feedback beats self-critique because it comes from the domain model, not the same model that made the error.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The results focus on classical deterministic planning domains.</p></div>
<div class="apple-card"><p>The paper evaluates GPT-family models available at the time plus BLOOM; later reasoning models may change absolute numbers but not the architecture...</p></div>
<div class="apple-card"><p>Autonomous-mode prompts include domain descriptions, so this is not a test of discovering actions from raw environment interaction.</p></div>
<div class="apple-card"><p>Heuristic mode relies on external planners and verifiers with correct domain models.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful PoC would validate one LLM-generated Blocks World plan with VAL or a tiny local precondition/effect checker, then show how verifier feedback changes the next plan.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2305.15771">On the Planning Abilities of Large Language Models: A Critical Investigation</a></li><li>Project/code: <a href="https://github.com/karthikv792/LLMs-Planning">https://github.com/karthikv792/LLMs-Planning</a></li><li>supports: <a href="https://arxiv.org/abs/2304.11477">LLM+P</a></li><li>contrast: <a href="https://arxiv.org/abs/2305.10601">Tree of Thoughts</a></li><li>contrast: <a href="https://arxiv.org/abs/2303.11366">Reflexion</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/planning-abilities-valmeekam-2023.json`. Update the review record, then run `bun run build`.
