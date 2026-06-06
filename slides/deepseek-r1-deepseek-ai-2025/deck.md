<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Training Agents</p>
  <h1>DeepSeek-R1</h1>
  <p class="deck-subtitle">Verifiable rewards as reasoning infrastructure</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2025</strong><span>Nature 645, 633-638 (2025); arXiv v2 revised 2026</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>DeepSeek-R1 shows that large-scale reinforcement learning with verifiable rewards can elicit long-chain reasoning, then packages the result into a stronger cold-start-plus-RL model and distilled smaller models.</h2>
  <p class="deck-note">For agents, DeepSeek-R1 made verifiable reward reinforcement learning a concrete infrastructure pattern: if correctness can be checked, post-training can optimize trajectories at scale without hand-labeling every reasoning path.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Strong reasoning models relied heavily on supervised demonstrations, preference data, or closed training recipes.</p></div>
<div class="apple-card"><p>Open post-training stacks lacked a clear frontier-scale example showing reasoning behavior emerging primarily from automatically checkable rewards.</p></div>
<div class="apple-card"><p>Long chain-of-thought models introduced inference-time scaling, but the training recipe for producing them was not broadly visible.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether an LLM can develop stronger reasoning through reinforcement learning against verifiable tasks, and how to turn the emergent but rough behavior into a usable model family.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Use verifiable tasks as the reward source for RL, observe what reasoning behaviors emerge without supervised traces, then add cold-start data and staged...</h2>
  <p class="deck-note">Use verifiable tasks as the reward source for RL, observe what reasoning behaviors emerge without supervised traces, then add cold-start data and staged post-training to improve readability, language control, general capability, and smaller-model transfer.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Train R1-Zero by applying GRPO to DeepSeek-V3-Base on reasoning tasks with rule-based accuracy and format rewards.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Track whether longer reasoning, self-reflection, verification, and strategy adaptation emerge during RL.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>For R1, collect thousands of cold-start examples to make initial reasoning traces more readable and controlled.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Run reasoning-oriented RL from the cold-start model.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>base model: DeepSeek-V3-Base.</p></div>
<div class="apple-card"><p>prompt: problem statement with instructions to produce reasoning and final answer.</p></div>
<div class="apple-card"><p>completion: long chain-of-thought plus answer.</p></div>
<div class="apple-card"><p>accuracy reward: checker result for the final answer.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
base = DeepSeekV3Base()

r1_zero = grpo_train(
    policy=base,
    tasks=verifiable_reasoning_tasks,
    reward=accuracy_reward + format_reward,
)

cold = sft(base, curated_cold_start_reasoning_examples)
reasoner = grpo_train(cold, verifiable_reasoning_tasks, accuracy_reward)
wide = sft(reasoner, rejection_sample(reasoner) + non_reasoning_instruction_data)
r1 = rl_align(wide, helpfulness_reward + harmlessness_reward)

distill_data = sample(r1, count=800000)
distilled_models = [sft(student, distill_data) for student in qwen_and_llama_students]
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-r1-zero-emergence</span>
  <p>The paper describes R1-Zero as trained through large-scale RL without preliminary SFT and reports emergent reasoning behaviors such as self-reflection, verification, and dynamic...</p>
</div>
<div class="proof-card">
  <span>E-aime-r1-zero</span>
  <p>The paper reports that R1-Zero's AIME 2024 pass@1 increases from 15.6% to 71.0%, and that majority voting improves the score to 86.7%.</p>
</div>
<div class="proof-card">
  <span>E-r1-pipeline</span>
  <p>DeepSeek-R1 starts from thousands of cold-start examples, then uses reasoning-oriented RL, rejection sampling plus SFT, and a final RL stage for broader helpfulness and...</p>
</div>
<div class="proof-card">
  <span>E-r1-o1-comparable</span>
  <p>The authors summarize DeepSeek-R1 as achieving performance comparable to OpenAI-o1-1217 across a range of reasoning tasks.</p>
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
  <p>DeepSeek-R1-Zero demonstrates that reasoning behaviors can emerge from pure large-scale RL on a base model without supervised fine-tuning as a preliminary...</p>
  <small>E-r1-zero-emergence</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>During R1-Zero training, AIME 2024 pass@1 rises from 15.6% to 71.0%, and majority voting reaches 86.7%.</p>
  <small>E-aime-r1-zero</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>DeepSeek-R1 adds cold-start data and a multi-stage pipeline to fix R1-Zero's practical weaknesses while preserving reasoning RL as the load-bearing mechanism.</p>
  <small>E-r1-pipeline</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The paper reports DeepSeek-R1 performance comparable to OpenAI-o1-1217 on reasoning tasks.</p>
  <small>E-r1-o1-comparable</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>DeepSeek-R1 turns verifiers into training infrastructure: the key artifact is not a prompt but a reliable reward path for answer checking.</p></div>
<div class="apple-card"><p>R1-Zero is the clean scientific result; R1 is the productizable recipe. Keep those separate when reasoning about what pure RL achieved.</p></div>
<div class="apple-card"><p>For agents, RLVR works best where the environment can emit a crisp correctness signal, such as math, code, format, or executable tests.</p></div>
<div class="apple-card"><p>Long reasoning traces are a serving concern. Better task success may come with higher token budgets, latency, and scheduler pressure.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The current arXiv record is v2 revised in January 2026 and also lists a Nature 2025 journal reference; this review treats the arXiv and Nature...</p></div>
<div class="apple-card"><p>R1-Zero's pure-RL result should not be confused with DeepSeek-R1's final multi-stage recipe.</p></div>
<div class="apple-card"><p>Benchmark parity with OpenAI-o1-1217 is scoped to reasoning tasks reported by the paper.</p></div>
<div class="apple-card"><p>The evidence is strongest for verifiable reasoning tasks, not open-ended autonomous agents with side effects.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A small PoC could train a tiny policy on arithmetic traces with a rule-based answer checker, then compare supervised traces against reward-only updates.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2501.12948">DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning</a></li><li>Project/code: <a href="https://github.com/deepseek-ai/DeepSeek-R1">https://github.com/deepseek-ai/DeepSeek-R1</a></li><li>extends: <a href="https://arxiv.org/abs/2411.15124">Tulu 3</a></li><li>depends_on: <a href="https://arxiv.org/abs/2201.11903">Chain-of-Thought Prompting</a></li><li>connects: <a href="https://arxiv.org/abs/2203.11171">Self-Consistency</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/deepseek-r1-deepseek-ai-2025.json`. Update the review record, then run `bun run build`.
