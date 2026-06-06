<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Inference and Serving Infrastructure</p>
  <h1>Orca</h1>
  <p class="deck-subtitle">Token-iteration scheduling for LLM serving</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2022</strong><span>OSDI 2022</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>6</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Orca reframes LLM serving as token-iteration scheduling: instead of batching full requests until every sequence finishes, it admits, removes, and schedules requests after every generated token.</h2>
  <p class="deck-note">Agents create many short and long generations with unpredictable lengths. Orca is the first paper in this list that makes inference serving feel like a scheduler problem rather than only a model-kernel problem.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Existing inference servers such as Triton/TensorFlow Serving were designed around request-level batching.</p></div>
<div class="apple-card"><p>Autoregressive Transformer generation runs one model iteration per output token.</p></div>
<div class="apple-card"><p>Requests in a batch can need different output lengths, so short requests wait for longer ones and new arrivals wait for the whole batch to finish.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to keep batching efficient while allowing the serving system to make scheduling decisions after every generation iteration.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Run one token iteration at a time, update request membership after each iteration, selectively batch parameter-heavy operations while handling attention's...</h2>
  <p class="deck-note">Run one token iteration at a time, update request membership after each iteration, selectively batch parameter-heavy operations while handling attention's variable-length state separately, and coordinate model-parallel workers with memory-aware scheduling.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Admit an initial batch of requests.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Invoke the model execution engine for one iteration rather than the whole request.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>After the iteration returns, immediately return finished requests to clients.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Admit newly arrived requests into free batch slots before the next iteration.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>request queue: incoming generation requests waiting for admission.</p></div>
<div class="apple-card"><p>active batch: requests selected for the next generation iteration.</p></div>
<div class="apple-card"><p>iteration: one model execution that emits one next token per active request.</p></div>
<div class="apple-card"><p>finished request: request that emitted EOS or hit a length limit.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
active = []
while serving:
    active += admit_requests(queue, available_memory, max_batch)

    outputs, kv_updates = model.run_one_iteration(active, selective_batching=True)

    for req, token in outputs:
        req.append(token)
        if token == EOS or req.length_limit_reached():
            return_to_client(req)
            free_kv_cache(req)
            active.remove(req)

    update_memory_accounting(kv_updates)
    rebalance_or_pipeline_workers_if_needed()
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-request-batching-problem</span>
  <p>The paper explains that existing request-level serving systems cannot change a batch until all requests in the batch finish, so short requests wait for long ones and new arrivals...</p>
</div>
<div class="proof-card">
  <span>E-iteration-scheduling</span>
  <p>Orca invokes the engine to run one model iteration on the batch, then checks completion and admits new requests after every iteration.</p>
</div>
<div class="proof-card">
  <span>E-selective-batching</span>
  <p>Selective batching applies batching only to selected operations, while attention is processed per request because its tensor shapes depend on already processed tokens and it has...</p>
</div>
<div class="proof-card">
  <span>E-distributed-serving</span>
  <p>The paper states Orca adopts intra-layer and inter-layer model parallelism and adds scheduling, memory management, and pipelined execution for large-scale models.</p>
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
  <p>Autoregressive generation breaks request-level batching because each request can require a different number of model iterations.</p>
  <small>E-request-batching-problem</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>Iteration-level scheduling lets newly arrived requests wait only for one model iteration and lets completed requests return immediately after their final...</p>
  <small>E-iteration-scheduling</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>Selective batching batches only selected operations and handles attention differently because attention tensors have variable shapes as sequence lengths...</p>
  <small>E-selective-batching</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Orca includes distributed serving support for models with hundreds of billions of parameters through intra-layer and inter-layer model parallelism.</p>
  <small>E-distributed-serving</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>LLM serving for agents is scheduling, not just kernels: every agent step consumes a variable number of token iterations.</p></div>
<div class="apple-card"><p>Iteration-level scheduling is the ancestor of modern continuous batching. Agents need it because task lengths are unpredictable.</p></div>
<div class="apple-card"><p>Short generations should not wait behind long generations from the same batch; the scheduler must retire completed sequences immediately.</p></div>
<div class="apple-card"><p>Admission control must account for KV-cache growth, not just current batch size.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The evaluation is on GPT-style language models, not every generative model domain.</p></div>
<div class="apple-card"><p>The main comparison is against the evaluated FasterTransformer baseline from the paper era.</p></div>
<div class="apple-card"><p>The paper predates PagedAttention/vLLM and modern production serving engines.</p></div>
<div class="apple-card"><p>Selective batching handles variable-length attention, but does not fully solve KV-cache memory fragmentation and sharing.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A simple PoC could simulate request-level versus iteration-level batching with variable output lengths and compare queueing latency.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://www.usenix.org/conference/osdi22/presentation/yu">Orca: A Distributed Serving System for Transformer-Based Generative Models</a></li><li>successor: <a href="https://arxiv.org/abs/2309.06180">PagedAttention</a></li><li>demand_driver: <a href="https://arxiv.org/abs/2305.10601">Tree of Thoughts</a></li><li>latency_optimization: <a href="https://arxiv.org/abs/2211.17192">Speculative Decoding</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/orca-yu-2022.json`. Update the review record, then run `bun run build`.
