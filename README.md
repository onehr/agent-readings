# Readings in Agents and Agent Infrastructure

A curated list of papers for understanding LLM agents and the systems that run them. The list is opinionated: it reads agents not as a prompting trick but as a new kind of **long-running, side-effecting, fault-prone distributed program**, and asks what runtime, isolation, memory, and verification substrate such a program actually needs. Where it helps, entries trace modern ideas back to their systems ancestors -- durable workflows, supervision trees, microkernels, capability security -- because most of what is hard about agents was hard about distributed systems first.

The list is curated and maintained by @onehr. If you think a paper belongs here, please open a pull request. It may take a while to merge -- each entry gets read before it lands.

> **What's in this repo.** Beyond this list, each reviewed paper gets an AI-assisted slide deck under [`/slides`](./slides) that compresses it to its load-bearing ideas, and select papers get a runnable proof-of-concept under [`/pocs`](./pocs) that reproduces a key result locally. The reading list is the spine; the decks and PoCs are how you go from "I've heard of this paper" to "I've run the thing."

## Table of Contents

1. [Start Here](#start-here)
2. [Reasoning, Acting, and Reflection](#reasoning)
3. [Tool Use and Interoperability](#tools)
4. [Memory and State](#memory)
5. [Planning and Skill Acquisition](#planning)
6. [Multi-Agent Systems](#multi-agent)
7. [Training Agents](#training)
8. [The Agent Runtime](#runtime)
9. [Isolation and Sandboxing](#isolation)
10. [Inference and Serving Infrastructure](#serving)
11. [Evaluation and Benchmarks](#eval)
12. [Security, Safety, and Trust](#security)
13. [Surveys and Perspectives](#surveys)

<a name="start-here"></a>
## Start Here

If you read nothing else, read these three. They define the vocabulary the rest of the list assumes.

* **ReAct: Synergizing Reasoning and Acting in Language Models** ([Yao et al., 2022](https://arxiv.org/abs/2210.03629)): The paper that turned a language model into an agent. The insight is almost embarrassingly simple -- interleave *thoughts* (free-form reasoning) with *actions* (tool calls) and *observations* (results) in a single loop -- but it is the loop every agent framework reimplements. Read this first; everything downstream is a variation on it.
* **Cognitive Architectures for Language Agents (CoALA)** ([Sumers et al., 2023](https://arxiv.org/abs/2309.02427)): A framework paper that gives names to the parts -- working vs. long-term memory, internal vs. external actions, the decision procedure -- and situates LLM agents in the 50-year lineage of cognitive architectures (SOAR, ACT-R). The best map of the territory before you get lost in it.
* **Building Effective Agents** ([Anthropic, 2024](https://www.anthropic.com/research/building-effective-agents)): Not a paper, but the most useful practitioner taxonomy in circulation. Its load-bearing distinction -- *workflows* (LLMs orchestrated through fixed code paths) vs. *agents* (LLMs that direct their own control flow) -- is the line that decides whether you need an orchestration engine or a scheduler. Most production "agents" are workflows, and that's usually correct.

<a name="reasoning"></a>
## Reasoning, Acting, and Reflection

The agent loop is a control problem: how does a model decide what to do next, and how does it recover when it's wrong? This section is the evolution from single-shot prompting to iterative, self-correcting decision-making. The arc is worth noticing -- each paper adds one more feedback path.

* **Chain-of-Thought Prompting Elicits Reasoning in Large Language Models** ([Wei et al., 2022](https://arxiv.org/abs/2201.11903)): The precondition for everything else. Showing that simply asking the model to "think step by step" unlocks multi-step reasoning is what made acting-on-reasoning viable at all.
* **Self-Consistency Improves Chain of Thought Reasoning** ([Wang et al., 2022](https://arxiv.org/abs/2203.11171)): Sample many reasoning paths, take the majority answer. The first hint that you can buy reliability with compute at inference time -- a theme that returns in [serving](#serving) and [training](#training).
* **Tree of Thoughts: Deliberate Problem Solving with Large Language Models** ([Yao et al., 2023](https://arxiv.org/abs/2305.10601)): Generalizes the linear chain into a search tree with explicit lookahead and backtracking. Reframes reasoning as classical search, which is the bridge to planning (section 5). The cost -- many model calls per decision -- is exactly the bill the serving stack has to pay.
* **Reflexion: Language Agents with Verbal Reinforcement Learning** ([Shinn et al., 2023](https://arxiv.org/abs/2303.11366)): Adds an outer loop: after a failed attempt, the agent writes a natural-language critique of itself and retries with that critique in context. "Reinforcement learning" without gradients -- the reward signal is text. Pairs naturally with [task memory](#memory).
* **Self-Refine: Iterative Refinement with Self-Feedback** ([Madaan et al., 2023](https://arxiv.org/abs/2303.17651)): The same self-critique idea applied within a single task rather than across attempts. Read alongside Reflexion to see the design space of "model grades its own work." Worth pairing with the skeptics -- there is real evidence that models cannot reliably self-correct reasoning without an external signal, which is why [verifiable rewards](#training) and [executable checks](#eval) matter.

<a name="tools"></a>
## Tool Use and Interoperability

An agent is only as capable as the actions it can take. This section covers how models learn to call tools, how they're discovered at scale, and -- crucially -- the protocol layer that decides whether tools compose. The systems lesson here is old: the hard part of tool use is not the calling, it's the *interface contract*.

* **Toolformer: Language Models Can Teach Themselves to Use Tools** ([Schick et al., 2023](https://arxiv.org/abs/2302.04761)): The model learns *where* in a generation to insert an API call, self-supervised, by checking whether the call reduces perplexity on the continuation. Elegant, and the conceptual root of native function-calling.
* **Gorilla: Large Language Model Connected with Massive APIs** ([Patil et al., 2023](https://arxiv.org/abs/2305.15334)): Tool use at the scale of thousands of APIs, with retrieval over an API database and a focus on hallucinated-call detection. The problem it surfaces -- keeping the tool catalog current -- is a live infrastructure problem, not a modeling one.
* **ToolLLM: Facilitating LLMs to Master 16000+ Real-World APIs** ([Qin et al., 2023](https://arxiv.org/abs/2307.16789)): Scales tool learning further and contributes ToolBench. The interesting move is the decision-tree search over API call sequences -- multi-step tool use is a planning problem.
* **HuggingGPT: Solving AI Tasks with ChatGPT and its Friends** ([Shen et al., 2023](https://arxiv.org/abs/2303.17580)): An LLM as orchestrator that routes subtasks to specialist models. An early, clean statement of the "controller + worker models" pattern that recurs in [multi-agent systems](#multi-agent).
* **Model Context Protocol** ([Anthropic, 2024](https://modelcontextprotocol.io)): The interoperability layer the field converged on -- a standard for exposing tools, resources, and prompts to any model over a common transport. MCP is to agent tools roughly what a driver model is to an OS: it's the thing that lets a tool written once work everywhere. Read it as a systems spec, and note where its trust boundaries are thin -- see [security](#security).

<a name="memory"></a>
## Memory and State

A context window is RAM, not disk. An agent that runs for hours needs a memory hierarchy. This section is short because the field is young here -- which is precisely why it's worth your attention.

* **MemGPT: Towards LLMs as Operating Systems** ([Packer et al., 2023](https://arxiv.org/abs/2310.08560)): Borrows virtual memory directly: treat the context window as fast memory and an external store as slow memory, and let the model page information in and out via function calls. The OS analogy is not a metaphor here -- it's the architecture. Compare the same move in [PagedAttention](#serving), which pages the KV cache.
* **Generative Agents: Interactive Simulacra of Human Behavior** ([Park et al., 2023](https://arxiv.org/abs/2304.03442)): The "Smallville" paper. Its lasting contribution is the *memory stream* with retrieval weighted by recency, importance, and relevance, plus periodic *reflection* that synthesizes raw observations into higher-level beliefs. The most influential design for long-horizon agent memory; also a landmark for [multi-agent](#multi-agent) simulation.

<a name="planning"></a>
## Planning and Skill Acquisition

Reasoning decides the next step; planning commits to a sequence; skill acquisition is what lets an agent stop re-deriving the same plan. The throughline: durable, reusable competence is what separates a demo from a system.

* **Voyager: An Open-Ended Embodied Agent with Large Language Models** ([Wang et al., 2023](https://arxiv.org/abs/2305.16291)): The standout idea is a growing *skill library* -- the agent writes executable code for behaviors it discovers and retrieves them later, so capability compounds over time. Lifelong learning without fine-tuning. This is closer to "building a standard library" than to "prompting."
* **LLM+P: Empowering Large Language Models with Optimal Planning Proficiency** ([Liu et al., 2023](https://arxiv.org/abs/2304.11477)): Translate the problem into PDDL, hand it to a classical planner, translate the plan back. A clean statement of a recurring strategy: don't make the LLM do what a sound solver does better -- make it the *translator* to the solver. The same instinct underlies [verifiable rewards](#training) and formal [evaluation](#eval).
* **On the Planning Abilities of LLMs -- A Critical Investigation** ([Valmeekam et al., 2023](https://arxiv.org/abs/2305.15771)): The necessary counterweight. Strong empirical evidence that LLMs are weak autonomous planners but useful plan *generators* inside a verify-and-revise loop. Read it before you trust a benchmark number.

<a name="multi-agent"></a>
## Multi-Agent Systems

When one agent isn't enough, you get a distributed system with non-deterministic nodes that communicate in natural language -- which is to say, all the classic problems plus ambiguity. The promise is decomposition and specialization; the cost is coordination and compounding error.

* **AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation** ([Wu et al., 2023](https://arxiv.org/abs/2308.08155)): The most widely used framing of multi-agent work as *conversation* between configurable agents (including human-in-the-loop). A good study of how far you get by making the message bus the primary abstraction.
* **CAMEL: Communicative Agents for "Mind" Exploration** ([Li et al., 2023](https://arxiv.org/abs/2303.17760)): Role-playing agents (e.g., a "user" and an "assistant") that cooperate via inception prompting. Notable for showing how multi-agent dialogue becomes a *data-generation* engine -- a thread that leads straight into [training](#training).
* **MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework** ([Hong et al., 2023](https://arxiv.org/abs/2308.00352)): Encodes human SOPs (a software company's roles and handoffs) as the coordination structure. The argument -- structure the protocol, not just the prompts -- is the multi-agent version of the workflow-vs-agent distinction in [Start Here](#start-here).
* **Improving Factuality and Reasoning in Language Models through Multiagent Debate** ([Du et al., 2023](https://arxiv.org/abs/2305.14325)): Several model instances argue and converge. Sometimes it helps, sometimes it's an expensive way to run [self-consistency](#reasoning). Read it to calibrate when "more agents" is real and when it's theater.

<a name="training"></a>
## Training Agents

Prompting gets you a demo; training gets you reliability. This section is the path from human-feedback alignment to the verifiable-reward regime that is reshaping how agents are built -- and the reason "intelligence is getting cheaper" is true in a measurable way.

* **Training Language Models to Follow Instructions with Human Feedback (InstructGPT)** ([Ouyang et al., 2022](https://arxiv.org/abs/2203.02155)): The RLHF recipe that made instruction-following models work. Foundational, and the baseline every later method is measured against.
* **WebGPT: Browser-Assisted Question-Answering with Human Feedback** ([Nakano et al., 2021](https://arxiv.org/abs/2112.09332)): Underrated and early -- an LLM trained to operate a text browser to answer questions. The first serious "train the agent to use a real environment" result, predating most of this list.
* **Direct Preference Optimization** ([Rafailov et al., 2023](https://arxiv.org/abs/2305.18290)): Shows you can optimize the RLHF objective with a simple classification loss and no reward model or RL loop. Mostly a simplification of alignment, but it cleared the deck for the verifiable-reward work that followed.
* **Tulu 3: Pushing Frontiers in Open Language Model Post-Training** ([Lambert et al., 2024](https://arxiv.org/abs/2411.15124)): Where Reinforcement Learning with Verifiable Rewards (RLVR) is laid out as a recipe -- when correctness is checkable (math, code, format), the reward is the checker, and you need no human in the loop. This is the economic hinge: it converts reward generation from O(human-time) to O(compute).
* **DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning** ([DeepSeek-AI, 2025](https://arxiv.org/abs/2501.12948)): The result that made verifiable-reward RL impossible to ignore -- strong reasoning emerging largely from RL against automatically checkable rewards. Read it next to Tulu 3 to see the same idea at frontier scale.

<a name="runtime"></a>
## The Agent Runtime

This is the section most agent reading lists skip, and it's the one that decides whether your agent survives a crash, a retry, or a duplicate tool call. An agent is a workflow over unreliable, non-deterministic external calls. That is a *solved* problem in distributed systems -- the solutions just predate LLMs by decades.

* **Making Reliable Distributed Systems in the Presence of Software Errors** (Armstrong, 2003): Joe Armstrong's thesis -- the origin of Erlang/OTP and the *supervision tree*: isolated processes, "let it crash," and a hierarchy that restarts failed children to a known-good state. If you squint, a multi-agent system with retries and fallbacks is a supervision tree that hasn't read the literature. The correct ancestor of agent fault-tolerance.
* **DBOS: A DBMS-Oriented Operating System** (Skiadopoulos et al., VLDB 2022): Argues for building OS services (scheduling, IPC, state) *on top of a database*, so that program execution state is queryable, recoverable, and exactly-once by construction. The lineage behind Postgres-backed durable execution. For agents, "every step is a transactional write" is what makes a trajectory replayable.
* **Durable Execution** -- *background reading, not a single paper*: The pattern behind Temporal, AWS Step Functions, and DBOS -- persist each step's result so that on failure the workflow resumes mid-flight rather than restarting. The key constraint is **determinism**: the workflow body must be replayable, which means all non-determinism (model calls, tool I/O, time) has to be captured as recorded steps. This is the single most important idea for anyone building a serious agent runtime, and it's why an agent's spine is a logged, append-only trajectory. Start with the [DBOS docs' comparison to Temporal](https://docs.dbos.dev/why-dbos), then read the DBOS paper above for the systems argument.

<a name="isolation"></a>
## Isolation and Sandboxing

An agent that can run code, browse, and call APIs is, from a security standpoint, untrusted code with network access. The question "what is the agent allowed to do, and how is that enforced?" is the question this section answers, by way of the isolation primitives the cloud already uses. Note how the strength/overhead frontier here mirrors the [serving](#serving) cost story.

* **Firecracker: Lightweight Virtualization for Serverless Applications** ([Agache et al., NSDI 2020](https://www.usenix.org/conference/nsdi20/presentation/agache)): The microVM that powers AWS Lambda -- hardware-virtualization isolation with ~125ms boot and tiny memory overhead, by ruthlessly stripping the device model. The current default answer to "how do I run untrusted agent-generated code with a real security boundary." Understand *why* a VM boundary beats a container boundary for multi-tenant untrusted workloads.
* **gVisor** ([Google, project + design docs](https://gvisor.dev)): A user-space application kernel that intercepts syscalls -- a different point on the curve than Firecracker: less overhead than a VM, stronger isolation than a namespace, at the cost of compatibility and syscall performance. Read it against Firecracker to internalize the isolation/overhead/compatibility trilemma.
* **seL4: Formal Verification of an OS Kernel** (Klein et al., SOSP 2009): The first OS kernel with a machine-checked proof of functional correctness. The reason it belongs on an *agent* list: it is the existence proof that a small, security-critical mediator can be *proven* to enforce its isolation guarantees. If an agent's effects pass through one chokepoint, that chokepoint is where verification has the highest leverage.
* **Bringing the Web Up to Speed with WebAssembly** (Haas et al., PLDI 2017): The formal foundation of WASM -- a portable, sandboxed-by-design bytecode with a typed, capability-shaped import boundary. An increasingly popular substrate for agent tool execution precisely because the host mediates every effect at a single, narrow interface.
* **Capability Myths Demolished** (Miller, Yee, Shapiro, 2003): The clearest short treatment of capability-based security and why the ambient-authority model (ACLs) breeds confused-deputy bugs. Directly applicable to agent permissioning: a capability is an unforgeable token that *is* the authority to act, which is what you want when the actor is a language model.

<a name="serving"></a>
## Inference and Serving Infrastructure

Agents are inference-hungry -- a single task can be hundreds of model calls (see [Tree of Thoughts](#reasoning), [debate](#multi-agent)). The economics of agents are the economics of the serving stack. This section is why "intelligence is getting cheaper" is a measurable, engineered fact.

* **Orca: A Distributed Serving System for Transformer-Based Generative Models** ([Yu et al., OSDI 2022](https://www.usenix.org/conference/osdi22/presentation/yu)): Introduced *continuous (iteration-level) batching* -- schedule at the granularity of tokens, not requests, so finished sequences leave and new ones join mid-batch. The single biggest throughput win in LLM serving, and the foundation everything below builds on.
* **Efficient Memory Management for LLM Serving with PagedAttention (vLLM)** ([Kwon et al., SOSP 2023](https://dl.acm.org/doi/10.1145/3600006.3613165)): Applies OS paging to the KV cache: fixed-size blocks, non-contiguous physical layout, near-zero fragmentation, and copy-on-write sharing across sequences. The same virtual-memory move as [MemGPT](#memory), one layer down. This is the paper that made high-throughput serving commodity.
* **Fast Inference from Transformers via Speculative Decoding** ([Leviathan et al., 2022](https://arxiv.org/abs/2211.17192)): A small draft model proposes tokens; the large model verifies them in parallel. Latency wins with no quality loss -- speculative execution, borrowed from CPUs. Matters for agents because per-step latency compounds over a long loop.
* **SGLang: Efficient Execution of Structured Language Model Programs** ([Zheng et al., 2023](https://arxiv.org/abs/2312.07104)): RadixAttention for automatic prefix-cache reuse across calls, plus a language for structured generation. Built for exactly the workload agents create -- many calls that share long prefixes (system prompts, tool schemas, history).
* **FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness** ([Dao et al., 2022](https://arxiv.org/abs/2205.14135)): The kernel underneath all of the above. An IO-aware, exact attention that stops moving the attention matrix to and from HBM. Foundational systems work; read it to understand where the GPU time actually goes.

<a name="eval"></a>
## Evaluation and Benchmarks

You cannot ship what you cannot measure, and agent evaluation is genuinely hard -- the outputs are trajectories with side effects, not strings. This section covers the benchmarks that matter and, just as important, the work showing how easily they're gamed.

* **SWE-bench: Can Language Models Resolve Real-World GitHub Issues?** ([Jimenez et al., 2023](https://arxiv.org/abs/2310.06770)): Real issues from real repos, graded by whether the repo's own test suite passes. The gold standard because the verifier is *executable*, not an LLM judge -- which is also why it became the headline number for coding agents. Read with the SWE-bench Verified subset in mind.
* **WebArena: A Realistic Web Environment for Building Autonomous Agents** ([Zhou et al., 2023](https://arxiv.org/abs/2307.13854)): Self-hosted, fully functional websites (e-commerce, forums, a GitLab clone) with state-based evaluation. The standard for web autonomy, and a good lens on how brittle agents are on long-horizon, multi-page tasks.
* **GAIA: A Benchmark for General AI Assistants** ([Mialon et al., 2023](https://arxiv.org/abs/2311.12983)): Questions that are easy for humans and hard for models because they require compound tool use and multi-hop reasoning. A clean test of "general assistant" capability.
* **tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains** ([Yao et al., 2024](https://arxiv.org/abs/2406.12045)): Adds the two things one-shot benchmarks miss -- a simulated *user* the agent must converse with, and *policy* the agent must obey. Its pass^k metric (succeed on the same task k times in a row) surfaces the reliability crisis that single-run numbers hide. The most honest signal for production agents.
* **OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments** ([Xie et al., 2024](https://arxiv.org/abs/2404.07972)): Full computer control in real VMs across OSes -- the most infrastructure-heavy benchmark here (it needs KVM), and the most faithful to what "computer-use agent" actually means.
* **AgentBench: Evaluating LLMs as Agents** ([Liu et al., 2023](https://arxiv.org/abs/2308.03688)): Eight distinct environments in one harness. Useful for the cross-domain finding: a model that tops a coding benchmark can collapse on database or web tasks.
* **Establishing Best Practices for Building Rigorous Agentic Benchmarks** ([Zhuge / Kang Lab et al., 2025](https://arxiv.org/abs/2507.02825)): The skeptic's entry, and the bridge to [security](#security). Demonstrates that most popular agent benchmarks can be driven to near-perfect scores *without solving any task* -- by exploiting the grader (overwriting test files, reading gold answers off disk, reaching the network). The lesson is brutal and important: **a benchmark with a weak sandbox is measuring sandbox escapes, not capability.** Evaluation integrity is an isolation problem.

<a name="security"></a>
## Security, Safety, and Trust

An agent takes actions in the world on behalf of a user, driven by text it reads from the world. That is a confused-deputy problem waiting to happen. Trust -- not raw capability -- is the gating factor for autonomy, and this section is the threat model.

* **Reflections on Trusting Trust** (Thompson, 1984): Ken Thompson's Turing Award lecture. You cannot trust code you did not build from source you fully audited -- trust has to bottom out somewhere. The oldest paper here and the right frame for the whole section: when the actor is an opaque model, *where does your trust actually rest?* (A deliberate nod to the database reading list this one is modeled on.)
* **Not What You've Signed Up For: Compromising LLM-Integrated Applications with Indirect Prompt Injection** ([Greshake et al., 2023](https://arxiv.org/abs/2302.12173)): The defining agent vulnerability. Malicious instructions hidden in *retrieved* content -- a web page, an email, a tool result -- hijack the agent, because the model cannot reliably separate data from instructions. There is still no clean fix; mitigation is an architecture problem, which is why it leads back to [isolation](#isolation) and capabilities.
* **Universal and Transferable Adversarial Attacks on Aligned Language Models (GCG)** ([Zou et al., 2023](https://arxiv.org/abs/2307.15043)): Automated adversarial suffixes that jailbreak aligned models and transfer across them. The reason "the model is aligned" is not a security boundary you can lean on.
* **Identifying the Risks of LM Agents with an LM-Emulated Sandbox (ToolEmu)** ([Ruan et al., 2023](https://arxiv.org/abs/2309.15817)): Uses an LLM to *emulate* tool execution so you can probe an agent's failure modes without real-world side effects. A pragmatic answer to "how do I test for harm before granting real capabilities" -- and a clever inversion of the sandbox idea.

<a name="surveys"></a>
## Surveys and Perspectives

For mapping the field or onboarding someone. Surveys date fast in this area; prefer them as indexes into primary sources rather than as ground truth.

* **The Rise and Potential of Large Language Model Based Agents: A Survey** ([Xi et al., 2023](https://arxiv.org/abs/2309.07864)): The broad map -- brain/perception/action framing, single- and multi-agent, applications. Good for breadth.
* **A Survey on Large Language Model Based Autonomous Agents** ([Wang et al., 2023](https://arxiv.org/abs/2308.11432)): Organized around construction (profile, memory, planning, action), with a useful taxonomy. A good complement to CoALA in [Start Here](#start-here).
* **Advances and Challenges in Foundation Agents** ([Liu et al., 2025](https://arxiv.org/abs/2504.01990)): A recent, ambitious synthesis spanning brain-inspired architecture, self-improvement, collaboration, and safety. Use it to find the 2024-2025 primary work this list hasn't absorbed yet.


---

*Contributions welcome via pull request. Each entry is read before it's merged, so expect a delay. The goal is a list that stays small enough to actually read.*
