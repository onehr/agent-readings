<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Tool Use and Interoperability</p>
  <h1>ToolLLM</h1>
  <p class="deck-subtitle">Multi-step tool learning over 16k real-world APIs</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>arXiv 2023; ICLR 2024</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>ToolLLM scales tool learning from API-call selection to multi-step REST API trajectories over 16,464 real-world APIs.</h2>
  <p class="deck-note">ToolLLM treats an agent as a system over a real API marketplace: catalog ingestion, API metadata, retriever precision, execution traces, evaluator design, and search strategy are all part of the same tool-use stack.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>General instruction tuning gave open-source LLMs broad dialogue skills but weak tool-use ability.</p></div>
<div class="apple-card"><p>Earlier datasets often used limited APIs, single-tool settings, or no real API execution responses.</p></div>
<div class="apple-card"><p>Users cannot manually choose the correct API subset when the available tool pool contains thousands of real APIs.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to build, train, retrieve, plan, and evaluate open-source LLM tool use over a large real-world REST API marketplace with both single-tool and multi-tool tasks.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Collect and filter RapidAPI tools, generate single-tool and multi-tool instructions with ChatGPT, annotate executable solution paths with DFSDT, finetune...</h2>
  <p class="deck-note">Collect and filter RapidAPI tools, generate single-tool and multi-tool instructions with ChatGPT, annotate executable solution paths with DFSDT, finetune LLaMA-2 7B into ToolLLaMA, retrieve candidate APIs with a neural retriever, and evaluate trajectories with...</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Crawl RapidAPI tools and filter unreliable or low-quality APIs.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Sample APIs and use ChatGPT to generate diverse single-tool and multi-tool instructions.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Use ChatGPT with DFSDT to search for successful multi-step solution paths with real API calls and responses.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Train a neural API retriever from generated instruction/API relevance pairs.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Tool: a RapidAPI-hosted service containing one or more APIs.</p></div>
<div class="apple-card"><p>API document: endpoint name, description, HTTP method, required and optional parameters, request body, code snippets,...</p></div>
<div class="apple-card"><p>Instruction: a generated user request involving one or more APIs.</p></div>
<div class="apple-card"><p>Action: a thought, API name, and parameters for one API call.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
api_docs = crawl_and_filter_rapidapi()
instructions = chatgpt_generate_instructions(api_docs)
paths = []
for instruction in instructions:
    path = dfsdt_search(chatgpt, instruction, relevant_apis(instruction))
    if path.passed:
        paths.append(path)
retriever = train_dense_retriever(instructions, relevant_apis)
toolllama = finetune(llama2_7b, paths)

apis = retriever(user_instruction)
trajectory = toolllama.solve(user_instruction, apis)
score = tooleval(trajectory)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-api-corpus</span>
  <p>ToolBench collects 16,464 real-world RESTful APIs spanning 49 RapidAPI categories. The paper reports starting from 10,853 tools and 53,190 APIs and retaining 3,451 high-quality...</p>
</div>
<div class="proof-card">
  <span>E-instructions-paths</span>
  <p>The paper reports nearly 200k qualified instruction/API relevance pairs, specifically 87,413 I1, 84,815 I2, and 25,251 I3 instances, and 126,486 retained...</p>
</div>
<div class="proof-card">
  <span>E-dfsdt</span>
  <p>DFSDT pass rates are 58.0 on I1, 70.6 on I2, 62.8 on I3, and 63.8 average, compared with ReAct at 37.8, 40.6, 27.6, and 35.3 average, and ReAct@N at 49.4, 49.4, 34.6, and 44.5...</p>
</div>
<div class="proof-card">
  <span>E-tooleval</span>
  <p>ToolEval uses pass rate and win rate. The paper reports 87.1% agreement with human annotators for pass rate and 80.3% agreement for win rate.</p>
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
  <p>ToolBench filters RapidAPI into 3,451 high-quality tools and 16,464 APIs across 49 categories from an initial crawl of 10,853 tools and 53,190 APIs.</p>
  <small>E-api-corpus</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>ToolBench includes large-scale generated instructions and executable solution paths, including nearly 200k qualified instruction/API relevance pairs and...</p>
  <small>E-instructions-paths</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>DFSDT improves solution-path annotation over ReAct by exploring multiple branches and allowing failed branches to be abandoned.</p>
  <small>E-dfsdt</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>ToolEval defines pass rate and win rate for tool-use trajectories and reports high agreement with human annotators.</p>
  <small>E-tooleval</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The tool registry is data infrastructure: every endpoint needs method, parameters, request body, code snippets, example responses, and quality checks.</p></div>
<div class="apple-card"><p>Multi-tool agents need execution traces, not just API-call labels. ToolBench stores thought, action, parameters, observation, and final-answer steps.</p></div>
<div class="apple-card"><p>Search strategy matters. DFSDT is a runtime planning primitive because it supports branch abandonment and recovery from bad tool calls.</p></div>
<div class="apple-card"><p>Retrieval is part of the action space. The model's reachable tools depend on retriever quality, so retriever evaluation belongs in the agent CI loop.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>ToolBench depends heavily on ChatGPT for instruction generation, solution-path annotation, and evaluation.</p></div>
<div class="apple-card"><p>ToolEval is not a formal verifier; it approximates human judgment using a prompted model.</p></div>
<div class="apple-card"><p>The paper's strongest ToolBench main results mostly use oracle APIs, while production settings require retrieval.</p></div>
<div class="apple-card"><p>RapidAPI endpoints can disappear, slow down, change schemas, or return low-quality responses over time.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful local PoC would build a tiny REST API catalog, retrieve candidate endpoints, run a branch-and-backtrack planner over mocked responses, and score pass/win outcomes.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2307.16789">ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs</a></li><li>Project/code: <a href="https://github.com/OpenBMB/ToolBench">https://github.com/OpenBMB/ToolBench</a></li><li>extends: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li><li>extends: <a href="https://arxiv.org/abs/2305.15334">Gorilla</a></li><li>connects-to: <a href="https://arxiv.org/abs/2305.10601">Tree of Thoughts</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/toolllm-qin-2023.json`. Update the review record, then run `bun run build`.
