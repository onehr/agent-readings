<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Memory and State</p>
  <h1>Generative Agents</h1>
  <p class="deck-subtitle">The memory stream behind Smallville</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>UIST 2023</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>Generative Agents turns an LLM into a persistent social simulator by logging every experience, retrieving relevant memories, reflecting over them, and planning from them.</h2>
  <p class="deck-note">This is the most influential memory architecture for agent simulations. It treats memory as an append-only natural-language database where observations, reflections, and plans all become retrievable state.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>LLMs can generate plausible single-turn behavior, but long-running agents need consistency across memories, relationships, and plans.</p></div>
<div class="apple-card"><p>A complete event history is too large and distracting to place directly in a prompt.</p></div>
<div class="apple-card"><p>Raw observations alone do not support higher-level inferences such as interests, relationships, or social commitments.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to build LLM-driven agents that can remain believable over multiple days of simulated life in a shared environment.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Represent every agent experience as natural language, retrieve a small relevant subset for each decision, periodically synthesize high-level reflections, and...</h2>
  <p class="deck-note">Represent every agent experience as natural language, retrieve a small relevant subset for each decision, periodically synthesize high-level reflections, and generate plans that are recursively decomposed into concrete actions and dialogue.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Initialize each agent from a short natural-language description split into seed memories.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>At each simulation step, convert world state into natural-language observations and append them to memory.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Retrieve memories using normalized recency, importance, and relevance scores with equal weights in the implementation.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Generate reflections when accumulated importance from recent events exceeds 150; in practice agents reflect two or three times per day.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Perceive: the agent observes nearby environment, objects, and other agents.</p></div>
<div class="apple-card"><p>Record: each perception is appended as an observation in the memory stream.</p></div>
<div class="apple-card"><p>Retrieve: current context queries the stream using recency, importance, and relevance.</p></div>
<div class="apple-card"><p>Reflect: when recent importance passes a threshold, the model generates questions and insights from retrieved memories.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
for step in simulation:
    observations = perceive_world(agent, world)
    memory_stream.append(observations)

    relevant = retrieve(
        memory_stream,
        query=current_situation,
        score=recency + importance + relevance
    )

    if recent_importance(memory_stream) > 150:
        questions = llm.generate_reflection_questions(recent_records=100)
        for question in questions:
            evidence = retrieve(memory_stream, query=question)
            memory_stream.append(llm.extract_insights(evidence))

    if needs_daily_plan(agent):
        plan = llm.make_day_plan(agent_summary, yesterday_summary)
        memory_stream.append(decompose(plan, granularity="5-15min"))

    action = llm.choose_continue_or_react(agent_summary, relevant, current_plan)
    world.apply(action)
    memory_stream.append(action)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-smallville</span>
  <p>The paper connects the architecture to gpt-3.5-turbo and populates a sandbox environment with 25 agents. Users can observe and interact with agents, and the public repository...</p>
</div>
<div class="proof-card">
  <span>E-memory-stream</span>
  <p>The memory stream is described as a database of natural-language records. It stores observations, reflections, and plans, each available for future retrieval and reasoning.</p>
</div>
<div class="proof-card">
  <span>E-retrieval</span>
  <p>Retrieval uses recency over sandbox game hours, importance scored by an LLM on a 1-10 poignancy scale, and relevance via embedding cosine similarity. The scores are normalized...</p>
</div>
<div class="proof-card">
  <span>E-reflection</span>
  <p>Reflections are generated when accumulated importance of recent events exceeds 150. The model sees the 100 most recent records, proposes salient high-level questions, retrieves...</p>
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
  <p>The paper instantiates 25 ChatGPT-driven agents in an interactive Smallville sandbox where users can observe and intervene in natural language.</p>
  <small>E-smallville</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The architecture centers on a memory stream that stores observations, reflections, and plans as natural-language records for later retrieval.</p>
  <small>E-memory-stream</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>Memory retrieval combines recency, importance, and relevance, where importance is model-scored and relevance uses embedding cosine similarity.</p>
  <small>E-retrieval</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Reflection creates higher-level memories by asking the model to form salient questions from recent records, retrieve evidence, and synthesize cited insights.</p>
  <small>E-reflection</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The durable object is the memory stream: observations, reflections, and plans are all persisted as queryable state.</p></div>
<div class="apple-card"><p>Reflection is a compaction layer, not just introspection. It turns raw events into higher-level facts that can guide future behavior.</p></div>
<div class="apple-card"><p>Planning and memory should feed each other. Plans become memories, and memories condition plan updates.</p></div>
<div class="apple-card"><p>Social agents are distributed systems with lossy communication: information diffusion, relationship formation, and coordination all depend on...</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The paper optimizes for believability, not factual correctness, task success, or safety.</p></div>
<div class="apple-card"><p>The evaluation is small and simulation-specific; the end-to-end results come from one two-day Smallville run.</p></div>
<div class="apple-card"><p>The architecture depends on prompts and ChatGPT behavior, not a learned or verified cognitive model.</p></div>
<div class="apple-card"><p>Memory retrieval failures and embellishments are explicitly observed.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful local PoC would implement a tiny memory stream with recency/importance/relevance retrieval, periodic reflection, and a two-agent event loop over mocked LLM responses.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2304.03442">Generative Agents: Interactive Simulacra of Human Behavior</a></li><li>Project/code: <a href="https://github.com/joonspk-research/generative_agents">https://github.com/joonspk-research/generative_agents</a></li><li>connects-to: <a href="https://arxiv.org/abs/2310.08560">MemGPT</a></li><li>conceptual-map: <a href="https://arxiv.org/abs/2309.02427">CoALA</a></li><li>parallel: <a href="https://arxiv.org/abs/2308.08155">AutoGen</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/generative-agents-park-2023.json`. Update the review record, then run `bun run build`.
