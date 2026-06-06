<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Isolation and Sandboxing</p>
  <h1>WebAssembly</h1>
  <p class="deck-subtitle">A typed sandbox ABI for agent tools</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2017</strong><span>PLDI 2017</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>WebAssembly defines a compact, typed, sandboxed low-level code format whose validated modules can run near native speed while receiving authority only through host-provided imports.</h2>
  <p class="deck-note">For agents, WASM is a useful substrate for tool execution because untrusted code starts with no ambient OS access and every external effect must be mediated by the embedder's import/API layer.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>JavaScript had become the only universal built-in Web language despite inconsistent performance and awkwardness as a low-level compilation target.</p></div>
<div class="apple-card"><p>asm.js demonstrated that typed low-level subsets could run fast, but still inherited JavaScript parsing and representation costs.</p></div>
<div class="apple-card"><p>Mobile code on the Web needed efficient validation, compact transfer, safe execution, and broad browser/vendor support.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks how to define a low-level, portable, safe, efficient, and formally specified compilation target that can run inside the Web and beyond it.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Encode low-level code as typed modules, validate before execution, restrict memory to bounds-checked linear memories, keep control flow structured, and require...</h2>
  <p class="deck-note">Encode low-level code as typed modules, validate before execution, restrict memory to bounds-checked linear memories, keep control flow structured, and require all environmental authority to be imported from an embedder.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Compile source languages such as C/C++/Rust into WebAssembly modules.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Transmit or load the compact binary format.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Decode and validate the module before execution.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Instantiate the module with explicitly supplied host imports.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>binary module: compact transferable code/data package.</p></div>
<div class="apple-card"><p>decode: convert binary encoding to an internal module representation.</p></div>
<div class="apple-card"><p>validate: type-check functions, operands, stack shape, control flow, imports, exports, memories, and tables.</p></div>
<div class="apple-card"><p>instantiate: create a module instance with host-supplied imports and initialized state.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
wasm = compile_to_wasm(source)
module = decode(wasm.bytes)
assert validate(module)

imports = {
    "env.read_file": capability_read_file(allowlist),
    "env.http_fetch": capability_fetch(egress_policy),
    "env.log": structured_logger,
}
instance = instantiate(module, imports)
result = invoke(instance.exports["run"], input)

if trap:
    record_failure(trap)
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-design-goals</span>
  <p>The publication abstract and spec describe WebAssembly as a low-level bytecode/virtual ISA with compact representation, efficient validation and compilation, safe low-overhead...</p>
</div>
<div class="proof-card">
  <span>E-semantic-phases</span>
  <p>The spec divides semantics into decoding, validation, and execution; execution further includes instantiation and invocation.</p>
</div>
<div class="proof-card">
  <span>E-memory-safety</span>
  <p>The spec states that code executes in a memory-safe sandbox and that linear-memory loads/stores trap when accesses are outside current memory bounds.</p>
</div>
<div class="proof-card">
  <span>E-no-ambient-authority</span>
  <p>The spec says WebAssembly provides no ambient access to I/O, resources, operating-system calls, or the computing environment; interaction happens only by invoking...</p>
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
  <p>WebAssembly was designed as a portable low-level bytecode/virtual ISA for efficient validation, compilation, safe execution, and Web-platform...</p>
  <small>E-design-goals</small>
</div>
<div class="claim-card">
  <span>C2 · source-supported</span>
  <p>A module goes through decoding, validation, instantiation, and invocation, with validation checking type and stack discipline before execution.</p>
  <small>E-semantic-phases</small>
</div>
<div class="claim-card">
  <span>C3 · source-supported</span>
  <p>WebAssembly's memory safety comes from validated code and bounds-checked linear memory; out-of-bounds access traps instead of corrupting host memory.</p>
  <small>E-memory-safety</small>
</div>
<div class="claim-card">
  <span>C4 · source-supported</span>
  <p>WASM modules have no ambient access to I/O, OS calls, or resources; environmental interaction happens only through host-provided imports.</p>
  <small>E-no-ambient-authority</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>WASM is a useful agent-tool ABI because code starts with computation but no ambient authority.</p></div>
<div class="apple-card"><p>The import list is the permission model. If an agent tool should not access the network, filesystem, clock, or secrets, do not import those...</p></div>
<div class="apple-card"><p>Host imports need the same design care as syscalls: stable names, typed inputs, policy checks, audit logs, timeouts, resource limits, and idempotency...</p></div>
<div class="apple-card"><p>WASM is strongest for deterministic, CPU-bound, narrow-API tools. It is weaker when the task needs broad POSIX compatibility or arbitrary native...</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>The review combines the 2017 PLDI paper framing with the current WebAssembly core spec for precise semantics.</p></div>
<div class="apple-card"><p>WASM is not a full operating-system sandbox by itself; host embeddings decide what resources are available.</p></div>
<div class="apple-card"><p>Unsafe source languages can corrupt their own data structures inside linear memory even if host memory is protected.</p></div>
<div class="apple-card"><p>Hardware side channels and host-import vulnerabilities remain outside the core validation guarantee.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful PoC could run a generated tool as WASM with only one imported capability and show denied filesystem/network access by absence of imports.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://research.google/pubs/bringing-the-web-up-to-speed-with-webassembly/">Bringing the Web Up to Speed with WebAssembly</a></li><li>Project/code: <a href="https://webassembly.github.io/spec/core/">https://webassembly.github.io/spec/core/</a></li><li>permission_model: <a href="http://srl.cs.jhu.edu/pubs/SRL2003-02.pdf">Capability Myths Demolished</a></li><li>contrasts: <a href="https://gvisor.dev/">gVisor</a></li><li>security_boundary: <a href="https://sel4.systems/Research/pdfs/sel4-formal-verification-os-kernel.pdf">seL4</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/webassembly-haas-2017.json`. Update the review record, then run `bun run build`.
