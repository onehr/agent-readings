<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Reasoning, Acting, and Reflection</p>
  <h1>Chain of Thought</h1>
  <p class="deck-subtitle">Reasoning traces as inference-time scratch work</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2022</strong><span>NeurIPS 2022</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>9</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Chain-of-thought prompting shows that large language models can be induced to solve harder reasoning tasks by generating intermediate natural-language steps before the final answer.</h2>
  <p class="deck-note">CoT is the precondition for many agent loops: it turns an LLM call from answer selection into an inspectable intermediate-state update that later systems reuse for planning, tool use, critique, and search.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Large language models scaled well on many NLP tasks but still struggled with arithmetic, commonsense, and symbolic reasoning.</p></div>
<div class="apple-card"><p>Rationale-augmented training and finetuning could teach intermediate steps, but required many high-quality rationales.</p></div>
<div class="apple-card"><p>Standard few-shot prompting used input-output examples and often failed to improve substantially on reasoning tasks with scale alone.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper tests whether a small number of natural-language reasoning exemplars can elicit multi-step reasoning from off-the-shelf LMs.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Replace ordinary input-output few-shot exemplars with input-rationale-output triples.</h2>
  <p class="deck-note">Replace ordinary input-output few-shot exemplars with input-rationale-output triples. At test time, let the model generate intermediate reasoning text before the answer, allocating more inference-time tokens to problems that need multi-step reasoning.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Manually compose a small set of chain-of-thought exemplars for each task family.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Prompt off-the-shelf LMs with those exemplars instead of finetuning.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Decode model completions and evaluate only the final answer against benchmark labels.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Compare against standard few-shot input-output prompting across arithmetic, commonsense, and symbolic tasks.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Question/input: the task instance.</p></div>
<div class="apple-card"><p>Chain of thought: natural-language intermediate steps that decompose and solve the problem.</p></div>
<div class="apple-card"><p>Answer/output: the final predicted answer after the reasoning trace.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
prompt = examples.map(input, rationale, answer) + test_input
completion = lm(prompt)
trace, answer = parse_reasoning_and_answer(completion)
score(answer, target)
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
  <p>The paper defines CoT prompting as few-shot exemplars consisting of input, chain of thought, and output, with eight manually composed math exemplars used across most math...</p>
</div>
<div class="proof-card">
  <span>E-reproducibility</span>
  <p>The authors state that all experiments use prompting-based inference only, no finetuning was done, exact prompts are provided, GPT-3 API experiments are included, and PaLM 540B...</p>
</div>
<div class="proof-card">
  <span>E-arithmetic-results</span>
  <p>CoT more than doubled GSM8K performance for the largest GPT and PaLM models; PaLM 540B with CoT achieved new state of the art on GSM8K, SVAMP, and MAWPS, while AQuA and ASDiv...</p>
</div>
<div class="proof-card">
  <span>E-scale-emergence</span>
  <p>The authors report that CoT does not positively affect smaller models and only yields performance gains for models of roughly 100B parameters; smaller models produced fluent but...</p>
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
  <p>CoT prompting requires only few-shot exemplars with intermediate reasoning steps and does not finetune the model.</p>
  <small>E-method, E-reproducibility</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>On arithmetic reasoning, CoT improves large-model performance substantially and lets PaLM 540B set new state of the art on GSM8K, SVAMP, and MAWPS in the...</p>
  <small>E-arithmetic-results</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>The paper finds CoT to be an emergent ability of scale: it helps around 100B+ parameter models but not smaller ones.</p>
  <small>E-scale-emergence, E-symbolic-results</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>CoT also improves several commonsense reasoning tasks, including StrategyQA and sports understanding for PaLM 540B.</p>
  <small>E-commonsense-results</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>CoT turns reasoning into explicit per-call runtime state: the trace becomes something downstream agents can inspect, critique, route, or continue.</p></div>
<div class="apple-card"><p>Inference-time compute is a control knob. Harder tasks can spend more tokens on intermediate reasoning, but this directly affects latency and serving...</p></div>
<div class="apple-card"><p>Trace text is not a correctness proof. Agent runtimes should pair reasoning traces with executable checks, tool observations, or external verifiers.</p></div>
<div class="apple-card"><p>Prompted reasoning quality depends on model scale and exemplar design, so production systems should treat CoT as a capability with evaluations rather...</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The paper evaluates prompting, not a trained reasoning architecture.</p></div>
<div class="apple-card"><p>The strongest results use very large models, including PaLM 540B, which makes cost and access load-bearing.</p></div>
<div class="apple-card"><p>The paper uses manually written exemplar rationales and does not eliminate prompt construction effort.</p></div>
<div class="apple-card"><p>Reasoning traces can be wrong or coincidentally lead to correct answers.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful local PoC would compare direct answering vs CoT prompting on a small deterministic arithmetic fixture with exact-answer grading.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2201.11903">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li><li>extends: <a href="https://arxiv.org/abs/2203.11171">Self-Consistency Improves Chain of Thought Reasoning</a></li><li>extends: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li><li>evaluates-on: <a href="https://arxiv.org/abs/2110.14168">GSM8K</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/chain-of-thought-wei-2022.json`. Update the review record, then run `bun run build`.
