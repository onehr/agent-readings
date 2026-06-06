<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Isolation and Sandboxing</p>
  <h1>seL4</h1>
  <p class="deck-subtitle">A proved kernel boundary</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2009</strong><span>SOSP 2009</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>8</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>seL4 proves functional correctness of a complete general-purpose microkernel from abstract specification down to C implementation, showing that a small privileged mediator can be both high-assurance and practical.</h2>
  <p class="deck-note">For agents, seL4 is the extreme point on the isolation curve: if every effect must pass through a small capability-enforcing chokepoint, that chokepoint is where formal proof has maximum leverage.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Security and reliability depend on privileged kernel code, but kernel bugs can undermine the whole system.</p></div>
<div class="apple-card"><p>Common assurance methods such as testing, static analysis, model checking, or type-safe implementation do not prove full functional correctness of realistic kernels.</p></div>
<div class="apple-card"><p>Traditional verified kernels either stopped at models, verified only limited properties, or accepted large performance/simplicity tradeoffs.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether a realistic, high-performance, general-purpose OS microkernel can be formally verified from high-level specification to C implementation.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Design a small L4-style microkernel around explicit capabilities, write a high-level abstract spec and a detailed executable spec, implement the kernel in a...</h2>
  <p class="deck-note">Design a small L4-style microkernel around explicit capabilities, write a high-level abstract spec and a detailed executable spec, implement the kernel in a restricted C subset, and prove refinement between each layer in Isabelle/HOL.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Define the seL4 programming model: address spaces, threads, IPC, capabilities, CNodes, explicit memory management, and user-mode drivers.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Create a high-level abstract specification of kernel behavior.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Build a Haskell prototype/executable specification to connect OS design and proof development.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Implement the kernel in a C99 subset shaped to be translatable and verifiable.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>MA: abstract state-machine specification.</p></div>
<div class="apple-card"><p>ME: executable specification state machine.</p></div>
<div class="apple-card"><p>MC: C implementation translated into the theorem prover.</p></div>
<div class="apple-card"><p>refinement theorem: ME refines MA and MC refines ME, therefore MC refines MA.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
MA = abstract_specification()
ME = executable_specification()
MC = translate_c_to_isabelle(sel4_c)

prove Theorem1: refines(ME, MA)
prove Theorem2: refines(MC, ME)

by_transitivity:
    prove Theorem3: refines(MC, MA)

for all user_behaviors in nondeterministic_user_model:
    every kernel behavior of MC is allowed by MA
    kernel never crashes or performs undefined/unsafe operations under assumptions
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-first-proof</span>
  <p>The paper states that seL4 is, to the authors' knowledge, the first formal proof of functional correctness of a complete general-purpose OS kernel.</p>
</div>
<div class="proof-card">
  <span>E-programming-model</span>
  <p>seL4 features virtual address spaces, threads, IPC, capabilities for authorization, CNodes for capability spaces, explicit memory management, and user-mode device drivers.</p>
</div>
<div class="proof-card">
  <span>E-refinement</span>
  <p>The proof establishes ME refines MA and MC refines ME; by transitivity, MC refines MA. The user model is nondeterministic and includes benign, buggy, and malicious user behavior.</p>
</div>
<div class="proof-card">
  <span>E-safety</span>
  <p>The strengthened proof implies the implementation has defined behavior, cannot crash unexpectedly, all kernel assertions hold, the kernel never accesses null or misaligned...</p>
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
  <p>The paper presents the first formal proof of functional correctness for a complete general-purpose operating-system kernel.</p>
  <small>E-first-proof</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>seL4 uses a small L4-style microkernel model with address spaces, threads, IPC, and capabilities for authorization.</p>
  <small>E-programming-model</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>The central proof shows ME refines MA and MC refines ME, hence the translated C implementation refines the abstract specification.</p>
  <small>E-refinement</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>Under the paper's assumptions, the proved kernel cannot crash, access null or misaligned pointers, or perform undefined unsafe behavior, and all kernel API...</p>
  <small>E-safety</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>If an agent's effects pass through one privileged mediator, seL4 shows why that mediator should be small, capability-based, and precisely specified.</p></div>
<div class="apple-card"><p>Capabilities are a better mental model than ambient permissions for agent tools: authority should be explicit, scoped, and unforgeable.</p></div>
<div class="apple-card"><p>Formal proof is most valuable at the chokepoint. Do not try to prove the whole agent; prove the runtime kernel that grants access to files, network,...</p></div>
<div class="apple-card"><p>Proof boundaries matter. A verified kernel does not prove the correctness of user code, model outputs, policies, compilers, hardware, or allowed side...</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The proof is relative to the abstract specification; if the spec is wrong, the implementation can be correctly wrong.</p></div>
<div class="apple-card"><p>The paper assumes correctness of compiler, assembly code, boot code, hardware, cache/TLB behavior, and parts of the machine interface.</p></div>
<div class="apple-card"><p>The original verified target is ARMv6; current seL4 project status may include later verification work not covered by this 2009 paper.</p></div>
<div class="apple-card"><p>The paper proves functional correctness, not all information-flow, timing-channel, or application-level security properties.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A realistic seL4 PoC is too large for this repo, but a small capability-machine model could demonstrate scoped authority and non-forgeability in a toy verifier.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://sel4.systems/Research/pdfs/sel4-formal-verification-os-kernel.pdf">seL4: Formal Verification of an OS Kernel</a></li><li>Project/code: <a href="https://sel4.systems/">https://sel4.systems/</a></li><li>authorization_model: <a href="http://srl.cs.jhu.edu/pubs/SRL2003-02.pdf">Capability Myths Demolished</a></li><li>contrasts: <a href="https://www.usenix.org/conference/nsdi20/presentation/agache">Firecracker</a></li><li>contrasts: <a href="https://gvisor.dev/">gVisor</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/sel4-klein-2009.json`. Update the review record, then run `bun run build`.
