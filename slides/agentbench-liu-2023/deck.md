<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Evaluation and Benchmarks</p>
  <h1>AgentBench</h1>
  <p class="deck-subtitle">Cross-domain text-agent evaluation</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>ICLR 2024; arXiv 2023</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>AgentBench evaluates LLMs as text-based agents across eight interactive environments spanning code, games, and web tasks.</h2>
  <p class="deck-note">For agent infrastructure, AgentBench is an early systems-shaped benchmark: it needs task servers, isolated workers, interaction histories, score normalization, and environment-specific validators.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Traditional NLP benchmarks evaluate static input-output behavior rather than multi-turn action in environments.</p></div>
<div class="apple-card"><p>Many early agent evaluations focused on a single environment, which hid cross-domain weaknesses.</p></div>
<div class="apple-card"><p>Embodied or multimodal simulators were not always practical for evaluating text-only LLM agents.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to systematically evaluate LLMs as autonomous agents across multiple realistic interactive task families.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Wrap eight heterogeneous environments in a common multi-turn interface, prompt LLMs with thought/action style outputs, execute environment transitions through...</h2>
  <p class="deck-note">Wrap eight heterogeneous environments in a common multi-turn interface, prompt LLMs with thought/action style outputs, execute environment transitions through task workers, and report both per-environment and normalized overall scores.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Define eight environments grouped as code-grounded, game-grounded, and web-grounded tasks.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Adapt or build each environment so a text-only LLM can interact in multi-turn dialogue/action form.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Use Chain-of-Thought-style thought/action prompting with greedy decoding for reproducible baseline comparisons.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Run API and open-source LLMs through an HTTP/server-client evaluation toolkit.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>state: hidden environment state for a task.</p></div>
<div class="apple-card"><p>observation: environment feedback returned to the LLM as user-side messages.</p></div>
<div class="apple-card"><p>action: model output command in the expected environment format.</p></div>
<div class="apple-card"><p>transition: environment update after the action.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
for env_name in agentbench_envs:
    worker = start_task_worker(env_name)
    for task in worker.test_split:
        history = [task.instruction]
        for turn in range(task.max_turns):
            response = model.generate(format_prompt(history), temperature=0)
            action = parse_action(response)
            obs, done, score, reason = worker.step(task.id, action)
            history.append((response, obs))
            if done:
                break
        record(env_name, task.id, score, reason)

overall = weighted_average(environment_scores)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-eight-envs</span>
  <p>AgentBench is introduced as a benchmark with 8 distinct interactive environments for assessing LLM-as-Agent reasoning and decision-making.</p>
</div>
<div class="proof-card">
  <span>E-env-taxonomy</span>
  <p>The environments are Operating System, Database, Knowledge Graph, Digital Card Game, Lateral Thinking Puzzles, House-Holding, Web Shopping, and Web Browsing, grouped as code,...</p>
</div>
<div class="proof-card">
  <span>E-metrics</span>
  <p>The paper reports per-environment metrics including success rate, F1, reward, game progress, and step success, then computes a weighted overall score to reduce dominance by...</p>
</div>
<div class="proof-card">
  <span>E-model-results</span>
  <p>The paper evaluates 27 API-based and OSS LLMs and reports GPT-4 leading the weighted overall score, with a clear gap to OSS models included in the study.</p>
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
  <p>AgentBench defines eight distinct interactive environments for evaluating LLMs as agents.</p>
  <small>E-eight-envs</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The eight environments are grouped into code-grounded, game-grounded, and web-grounded task families.</p>
  <small>E-env-taxonomy</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>AgentBench evaluates multi-turn, open-ended agent behavior and reports environment-specific metrics plus a weighted overall score.</p>
  <small>E-metrics</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The paper evaluates 27 API-based and open-source LLMs and finds a large gap between top commercial models and many OSS models at the time.</p>
  <small>E-model-results</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>A serious agent benchmark needs a harness, not just prompts: task servers, workers, model adapters, logs, and environment reset all matter.</p></div>
<div class="apple-card"><p>Cross-domain evaluation is useful because code, game, and web tasks stress different mixes of planning, state tracking, action validity, and domain...</p></div>
<div class="apple-card"><p>Tracking finish reasons is a practical debugging primitive for agent systems and should be preserved in traces.</p></div>
<div class="apple-card"><p>Dockerized task workers are an early example of benchmark-side isolation for heterogeneous agent environments.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The headline model results are historical and should not be treated as current model capability.</p></div>
<div class="apple-card"><p>The benchmark is broad, but some environments are adapted or simplified compared with live production systems.</p></div>
<div class="apple-card"><p>Text-only interaction makes the benchmark cheaper and broader, but misses multimodal GUI grounding that OSWorld later targets.</p></div>
<div class="apple-card"><p>The repository has evolved beyond the original paper version, including function-calling and newer benchmark variants.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A compact PoC could emulate one AgentBench-style environment with a task worker, a tiny action parser, and finish-reason accounting.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2308.03688">AgentBench: Evaluating LLMs as Agents</a></li><li>Project/code: <a href="https://github.com/THUDM/AgentBench">https://github.com/THUDM/AgentBench</a></li><li>agent_loop: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li><li>successor: <a href="https://arxiv.org/abs/2307.13854">WebArena</a></li><li>successor: <a href="https://arxiv.org/abs/2404.07972">OSWorld</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/agentbench-liu-2023.json`. Update the review record, then run `bun run build`.
