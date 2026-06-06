<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Reasoning, Acting, and Reflection</p>
  <h1>Self-Consistency</h1>
  <p class="deck-subtitle">Sample many reasoning paths, vote on the answer</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2022</strong><span>ICLR 2023</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Self-consistency improves chain-of-thought reasoning by sampling many reasoning paths and choosing the final answer that appears most consistently across them.</h2>
  <p class="deck-note">This paper turns inference-time sampling into a reliability primitive for agents: spend more model calls, aggregate final answers, and get a stronger signal than one greedy reasoning trace.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Chain-of-thought prompting used greedy decoding in the original setup, producing one reasoning path and one final answer.</p></div>
<div class="apple-card"><p>Greedy decoding is locally optimal and repetitive, while a single sampled trace is stochastic and unreliable.</p></div>
<div class="apple-card"><p>Verifier or reranker approaches can improve generated reasoning, but add training, annotations, or auxiliary models.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether a frozen model can improve reasoning accuracy by generating multiple diverse traces and marginalizing over their answers without additional training.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Keep the same CoT prompt, but replace greedy decoding with sampling.</h2>
  <p class="deck-note">Keep the same CoT prompt, but replace greedy decoding with sampling. Parse the final answer from each sampled reasoning path, discard the paths during aggregation, and output the answer with the highest vote or normalized weighted support.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Prompt the language model using the same CoT exemplars as prior work.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Sample a diverse set of reasoning paths from the decoder instead of taking the greedy path.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Parse the final answer from each reasoning path.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Aggregate answers by marginalizing out reasoning paths, usually via unweighted majority vote.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Prompt: few-shot chain-of-thought exemplars plus the test question.</p></div>
<div class="apple-card"><p>Reasoning path: a sampled chain-of-thought completion.</p></div>
<div class="apple-card"><p>Parsed answer: the final answer extracted from each sampled completion.</p></div>
<div class="apple-card"><p>Aggregator: majority vote or probability-weighted answer selection over parsed answers.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
answers = []
for _ in 1..N:
    trace = sample_lm(cot_prompt + question)
    answers.append(parse_final_answer(trace))
return majority_vote(answers)
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
  <p>Self-consistency prompts with CoT, samples diverse reasoning paths, parses their final answers, and chooses the most consistent answer; the paper describes it as off-the-shelf,...</p>
</div>
<div class="proof-card">
  <span>E-aggregation</span>
  <p>For PaLM 540B, greedy decode gets 56.5 GSM8K, 94.7 MultiArith, 35.8 AQuA, 79.0 SVAMP, 79.0 CSQA, and 85.2 ARC-c; majority vote gets 74.4, 99.3, 48.3, 86.6, 80.7, and 88.7....</p>
</div>
<div class="proof-card">
  <span>E-arithmetic</span>
  <p>Self-consistency improves every arithmetic row shown. Examples include PaLM 540B GSM8K 56.5 to 74.4 (+17.9), PaLM 540B AQuA 35.8 to 48.3 (+12.5), code-davinci-002 GSM8K 60.1 to...</p>
</div>
<div class="proof-card">
  <span>E-commonsense-symbolic</span>
  <p>The abstract reports improvements including StrategyQA +6.4 and ARC-challenge +3.9. The experiments also include symbolic last-letter concatenation and coin-flip tasks from the...</p>
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
  <p>Self-consistency is an unsupervised decoding method that needs no extra training, auxiliary verifier, or human annotation beyond the CoT prompt.</p>
  <small>E-method</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>For PaLM 540B, direct majority vote performs about as well as normalized probability-weighted aggregation and far better than greedy decoding on the evaluated...</p>
  <small>E-aggregation</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>Self-consistency substantially improves arithmetic reasoning over greedy CoT across UL2, LaMDA, PaLM, and GPT-3/Codex model families.</p>
  <small>E-arithmetic</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The largest arithmetic gains appear on hard tasks such as GSM8K and AQuA, with PaLM 540B gaining +17.9 on GSM8K and +12.5 on AQuA, and code-davinci-002...</p>
  <small>E-arithmetic</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Self-consistency makes inference-time compute a reliability knob: run multiple traces, parse answers, and aggregate instead of trusting one...</p></div>
<div class="apple-card"><p>The method creates a clean separation between trace generation and answer aggregation; an agent runtime can store all sampled traces but act only on...</p></div>
<div class="apple-card"><p>Majority voting works only after a task-specific answer parser, so structured output and answer normalization become part of the runtime contract.</p></div>
<div class="apple-card"><p>Sampling improves reliability but multiplies model calls; schedulers and serving stacks must budget for parallel or batched trace generation.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The method is a decoding strategy layered on CoT, not a new reasoning model.</p></div>
<div class="apple-card"><p>It assumes a fixed or parseable final answer; open-text generation needs a separate agreement metric.</p></div>
<div class="apple-card"><p>It increases inference cost substantially because the main setup samples 40 outputs per run.</p></div>
<div class="apple-card"><p>It can amplify biases shared across sampled traces if many wrong traces converge on the same wrong answer.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful local PoC would sample multiple reasoning traces from a local model on deterministic arithmetic fixtures, parse final answers, and compare greedy vs majority-vote accuracy.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2203.11171">Self-Consistency Improves Chain of Thought Reasoning in Language Models</a></li><li>extends: <a href="https://arxiv.org/abs/2201.11903">Chain-of-Thought Prompting</a></li><li>contrasts: <a href="https://arxiv.org/abs/2110.14168">Training Verifiers to Solve Math Word Problems</a></li><li>connects: <a href="https://arxiv.org/abs/2305.10601">Tree of Thoughts</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/self-consistency-wang-2022.json`. Update the review record, then run `bun run build`.
