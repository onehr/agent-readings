<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Multi-Agent Systems</p>
  <h1>AutoGen</h1>
  <p class="deck-subtitle">Conversation as the multi-agent runtime</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>arXiv 2023; ICLR 2024 LLM Agents Workshop Best Paper</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>AutoGen turns LLM applications into programmable conversations among agents backed by models, tools, and humans.</h2>
  <p class="deck-note">AutoGen made 'conversation' the primary orchestration API for LLM agents. That gives developers a simple way to compose specialist agents, tool executors, human input, and dynamic group chats, but it also makes conversation history the runtime state.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Complex LLM applications needed different ad hoc wrappers for prompts, tool execution, human feedback, and multi-step control flow.</p></div>
<div class="apple-card"><p>Single-agent loops made it awkward to separate roles such as assistant, tool executor, critic, retriever, and human proxy.</p></div>
<div class="apple-card"><p>Developers needed both natural-language control and regular programmatic control over agent interactions.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to make multi-agent LLM applications easier to build across domains without hard-coding every workflow as a bespoke orchestrator.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Represent each workflow participant as a conversable agent, then program the workflow through auto-reply functions, termination conditions, human-input modes,...</h2>
  <p class="deck-note">Represent each workflow participant as a conversable agent, then program the workflow through auto-reply functions, termination conditions, human-input modes, tool execution, custom reply functions, and optional group-chat speaker selection.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Define a set of agents with roles and capabilities.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Configure each agent's LLM, tool, human-input, code-execution, and reply behavior.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Initialize a conversation with a task message.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Let auto-reply and custom reply functions drive message passing.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>send: one agent sends a message to another agent.</p></div>
<div class="apple-card"><p>receive: an agent appends the incoming message to its conversation context.</p></div>
<div class="apple-card"><p>generate_reply: the agent chooses an action and response from LLM inference, human input, code execution, function...</p></div>
<div class="apple-card"><p>auto-reply: a reply is sent automatically unless a termination condition is satisfied.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
assistant = AssistantAgent(system_message="solve; write code; fix errors")
user_proxy = UserProxyAgent(
    human_input_mode="TERMINATE_OR_ALWAYS",
    code_execution=True,
    termination=lambda msg: "TERMINATE" in msg
)

user_proxy.initiate_chat(assistant, message=user_task)

# Runtime loop induced by auto-replies:
# assistant -> proposes code or answer
# user_proxy -> executes code or asks human
# assistant -> revises from feedback
# termination -> stop when task is complete
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-conversable-agent</span>
  <p>AutoGen agents are described as customizable and conversable, with capabilities backed by LLMs, human input, tools, or combinations. The built-in AssistantAgent and...</p>
</div>
<div class="proof-card">
  <span>E-conversation-programming</span>
  <p>The paper defines conversation programming as first defining conversable agents with roles and capabilities, then programming their interaction behavior through...</p>
</div>
<div class="proof-card">
  <span>E-auto-reply</span>
  <p>Agents expose send, receive, and generate_reply functions. By default, an agent receiving a message invokes generate_reply and sends a reply unless a termination condition is met...</p>
</div>
<div class="proof-card">
  <span>E-control-modes</span>
  <p>AutoGen supports natural-language control via system prompts, programming-language control via Python configuration and custom functions, transitions between the two through...</p>
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
  <p>AutoGen's core abstraction is the conversable agent, configurable with LLM, human, and tool capabilities and able to send and receive messages.</p>
  <small>E-conversable-agent</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>Conversation programming expresses LLM application workflows as conversation-centric computation and control flow.</p>
  <small>E-conversation-programming</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>AutoGen uses unified send/receive/generate_reply interfaces and auto-reply mechanisms to induce decentralized workflow execution.</p>
  <small>E-auto-reply</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Control can move between natural language and code: prompts guide LLM-backed agents, while Python configures termination, human input, tool execution, custom...</p>
  <small>E-control-modes</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>Conversation is a message bus. AutoGen made agent orchestration look like typed roles sending messages, not one monolithic prompt.</p></div>
<div class="apple-card"><p>Separate the assistant from the executor. The UserProxyAgent pattern keeps code execution and human approval outside the pure LLM role.</p></div>
<div class="apple-card"><p>Natural-language control is useful for shaping behavior, but runtime invariants need programmatic controls such as max turns, termination predicates,...</p></div>
<div class="apple-card"><p>Multi-agent is most defensible when roles add different capabilities: retrieval, execution, grounding, critique, or human input.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The 2023 paper describes an early AutoGen architecture; the open-source project has since evolved.</p></div>
<div class="apple-card"><p>Benchmarks and demonstrations are heterogeneous, so they should not be read as one uniform proof that multi-agent designs always win.</p></div>
<div class="apple-card"><p>The framework enables code execution, which requires sandboxing and explicit trust boundaries.</p></div>
<div class="apple-card"><p>Conversation control can be brittle if termination markers, speaker routing, or human-input modes are underspecified.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A small PoC would mock AssistantAgent and UserProxyAgent, run generated code in a sandboxed local process, and persist every send/receive/generate_reply event.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2308.08155">AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation</a></li><li>Project/code: <a href="https://github.com/microsoft/autogen">https://github.com/microsoft/autogen</a></li><li>uses: <a href="https://arxiv.org/abs/2210.03629">ReAct</a></li><li>compares: <a href="https://arxiv.org/abs/2305.14325">Multiagent Debate</a></li><li>contrast: <a href="https://arxiv.org/abs/2308.00352">MetaGPT</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/autogen-wu-2023.json`. Update the review record, then run `bun run build`.
