<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Surveys and Perspectives</p>
  <h1>LLM Agent Survey</h1>
  <p class="deck-subtitle">Brain, perception, action, and society</p>

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
  <h2>Xi et al. map LLM-based agents around a broad brain-perception-action framework, then survey single-agent, multi-agent, human-agent, and agent-society applications.</h2>
  <p class="deck-note">For this reading list, the paper supplies breadth and vocabulary. It is less about one new mechanism and more about organizing the agent stack from model cognition through tools, embodiment, multi-agent coordination, and risk.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Classical agent research had many algorithms and task-specific training setups, but no general foundation model that could adapt broadly across scenarios.</p></div>
<div class="apple-card"><p>Early LLM-agent work was scattered across prompting, tools, memory, embodiment, multi-agent systems, and simulation.</p></div>
<div class="apple-card"><p>The field lacked a single map connecting construction, application, agent societies, evaluation, and risks.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The survey asks how to organize the rapidly expanding LLM-agent literature into a general conceptual framework and application taxonomy.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Synthesize the LLM-agent literature into a construction framework, then classify applications and open problems by the agent's components, interaction setting,...</h2>
  <p class="deck-note">Synthesize the LLM-agent literature into a construction framework, then classify applications and open problems by the agent's components, interaction setting, society behavior, evaluation needs, and risks.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Trace the concept of agents from philosophical and AI origins.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Explain why LLMs are suitable as the primary component of an agent brain.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Introduce the brain-perception-action framework for LLM-based agent construction.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Survey applications across single agents, multi-agent systems, and human-agent cooperation.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>brain: LLM-centered cognition, memory, reasoning, planning, and generalization.</p></div>
<div class="apple-card"><p>perception: text, vision, audio, or other environmental inputs.</p></div>
<div class="apple-card"><p>action: textual output, tool use, or embodied execution.</p></div>
<div class="apple-card"><p>single-agent deployment: task-oriented, innovation-oriented, or lifecycle-oriented usage.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
agent = {
  brain: llm + memory + reasoning + planning,
  perception: text | vision | audio | other_inputs,
  action: text_output | tool_use | embodied_action
}

application = single_agent | multi_agent | human_agent
risk_review = evaluate(agent.utility, sociability, values, evolution, robustness, trustworthiness)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-framework</span>
  <p>The paper presents a general conceptual framework with three main components: brain, perception, and action.</p>
</div>
<div class="proof-card">
  <span>E-brain</span>
  <p>The brain section is organized around natural-language interaction, knowledge, memory, reasoning/planning, and transfer/generalization.</p>
</div>
<div class="proof-card">
  <span>E-perception-action</span>
  <p>The paper surveys perception inputs such as text, vision, and audio, and action outputs including text generation, tool use, and embodied actions.</p>
</div>
<div class="proof-card">
  <span>E-application-taxonomy</span>
  <p>Applications are grouped into single-agent deployment, multi-agent coordination, and human-agent interaction; multi-agent systems include cooperative and adversarial interaction...</p>
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
  <p>The survey proposes brain, perception, and action as the main construction components of LLM-based agents.</p>
  <small>E-framework</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>The agent brain is organized around natural-language interaction, knowledge, memory, reasoning/planning, and transfer/generalization.</p>
  <small>E-brain</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>The perception/action split highlights that LLM agents become more than chatbots when they receive multimodal inputs and can use tools or embodied actions.</p>
  <small>E-perception-action</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>The survey groups applications into single-agent, multi-agent, and human-agent scenarios, with multi-agent interaction split into cooperative and adversarial...</p>
  <small>E-application-taxonomy</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Use this survey as a map of the agent stack rather than as evidence for any one mechanism.</p></div>
<div class="apple-card"><p>The brain-perception-action frame makes infrastructure boundaries visible: memory/state, input adapters, tool protocols, and effect control.</p></div>
<div class="apple-card"><p>The action module is where agent infrastructure becomes safety-critical because text generation turns into tool use or embodied side effects.</p></div>
<div class="apple-card"><p>Multi-agent and human-agent patterns require message protocols, role boundaries, logging, and coordination policies, not just prompts.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>This is a broad 2023 survey; many systems and benchmarks have changed since publication.</p></div>
<div class="apple-card"><p>The paper is strongest as taxonomy and orientation, not as a source of primary empirical evidence.</p></div>
<div class="apple-card"><p>The AGI framing is more aspirational than operational for production agent infrastructure.</p></div>
<div class="apple-card"><p>Because the survey is very broad, readers should follow primary-source papers for mechanisms, numbers, and failure modes.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet. This survey is best represented by review/schema coverage rather than a runnable reproduction.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2309.07864">The Rise and Potential of Large Language Model Based Agents: A Survey</a></li><li>Project/code: <a href="https://github.com/WooooDyy/LLM-Agent-Paper-List">https://github.com/WooooDyy/LLM-Agent-Paper-List</a></li><li>complementary_framework: <a href="https://arxiv.org/abs/2309.02427">Cognitive Architectures for Language Agents</a></li><li>neighboring_survey: <a href="https://arxiv.org/abs/2308.11432">A Survey on Large Language Model Based Autonomous Agents</a></li><li>agent_society_example: <a href="https://arxiv.org/abs/2304.03442">Generative Agents</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/llm-agents-survey-xi-2023.json`. Update the review record, then run `bun run build`.
