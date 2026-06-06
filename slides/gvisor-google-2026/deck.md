<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Isolation and Sandboxing</p>
  <h1>gVisor</h1>
  <p class="deck-subtitle">A userspace kernel for safer containers</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2026</strong><span>Project and architecture documentation</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>source-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>gVisor is a Linux-compatible userspace application kernel that intercepts container syscalls, implements them in a separate Sentry, and sharply limits direct host-kernel exposure.</h2>
  <p class="deck-note">For agent infrastructure, gVisor is attractive when you want stronger isolation than ordinary containers while retaining Kubernetes/Docker ergonomics and faster/lighter operation than a full microVM boundary.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>Native containers rely on host-kernel security primitives, so untrusted code can still reach a large kernel API surface.</p></div>
<div class="apple-card"><p>Rule-based syscall filtering is hard to configure safely for arbitrary or previously unknown applications.</p></div>
<div class="apple-card"><p>VMs provide stronger workload isolation but can impose fixed resource overhead, slower startup, and extra proxies or agents for container use.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>gVisor asks whether a container runtime can reduce host-kernel attack surface by reimplementing the Linux application interface outside the host kernel.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Intercept application system calls before they reach the host kernel, implement Linux-like behavior in a Go Sentry, route filesystem access through a Gofer, and...</h2>
  <p class="deck-note">Intercept application system calls before they reach the host kernel, implement Linux-like behavior in a Go Sentry, route filesystem access through a Gofer, and restrict the host system calls that gVisor itself can make.</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Start a container through runsc instead of a conventional OCI runtime.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Create a gVisor sandbox containing a Sentry and one or more Gofer processes.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Intercept the workload's system calls through systrap, KVM, or another platform.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Handle supported system calls in the Sentry rather than passing them through to the host kernel.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>application: normal Linux binary in an OCI container bundle.</p></div>
<div class="apple-card"><p>runsc: OCI runtime entrypoint that starts the sandbox.</p></div>
<div class="apple-card"><p>Sentry: per-sandbox userspace kernel implementing syscalls, memory, processes, signals, network stack, filesystems,...</p></div>
<div class="apple-card"><p>Gofer: process mediating filesystem access over 9P or shared-memory channels.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
container = oci_bundle(rootfs, config)
sandbox = runsc.create(container)

sentry = sandbox.start_sentry(platform="systrap")
gofer = sandbox.start_gofer(rootfs=container.rootfs)

while app.running:
    syscall = platform.intercept(app)
    if sentry.implements(syscall):
        result = sentry.handle(syscall, gofer=gofer)
    else:
        result = ENOSYS_or_policy_denial
    platform.return_to_app(result)

host_enforcement = cgroups + namespaces + seccomp + network_policy
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-application-kernel</span>
  <p>The docs describe gVisor as an open-source workload isolation solution and application kernel, not a VM hypervisor or syscall filter, written in memory-safe Go and running in...</p>
</div>
<div class="proof-card">
  <span>E-no-passthrough</span>
  <p>The docs state that applications' direct interactions with the host System API are intercepted by the Sentry, no supported syscall is passed through directly, and applications...</p>
</div>
<div class="proof-card">
  <span>E-sentry</span>
  <p>The Sentry is described as implementing syscalls, signal delivery, memory management, page faulting, threading, process management, namespaces, filesystems, and networking, while...</p>
</div>
<div class="proof-card">
  <span>E-defense-in-depth</span>
  <p>The docs list engineering principles: no direct host syscall pass-through, implement only common functionality, minimize the host surface accessible to the Sentry, isolate unsafe...</p>
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
  <span>C1 · source-supported</span>
  <p>gVisor is an application kernel, not a conventional VM or syscall filter, and it implements a Linux-like interface in userspace.</p>
  <small>E-application-kernel</small>
</div>
<div class="claim-card">
  <span>C2 · source-supported</span>
  <p>gVisor minimizes direct host System API exposure by preventing sandboxed applications from passing system calls directly to the host kernel.</p>
  <small>E-no-passthrough</small>
</div>
<div class="claim-card">
  <span>C3 · source-supported</span>
  <p>The Sentry is a Go userspace kernel that implements system calls, memory management, process management, signals, namespaces, filesystems, and networking...</p>
  <small>E-sentry</small>
</div>
<div class="claim-card">
  <span>C4 · source-supported</span>
  <p>gVisor's defense-in-depth rules include no direct syscall pass-through, common-functionality-only implementation, minimized host surface for the Sentry, no...</p>
  <small>E-defense-in-depth</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>gVisor is a strong middle option for local agent tool sandboxes where full microVM startup or fixed resource allocation is too expensive.</p></div>
<div class="apple-card"><p>The key architectural point is syscall mediation, not policy text. The agent's code talks to a fake Linux kernel first, not directly to the host...</p></div>
<div class="apple-card"><p>Compatibility is a budget. Agent tools that depend on unusual syscalls, ioctls, /proc, /sys, GPU paths, or filesystem behavior need explicit testing...</p></div>
<div class="apple-card"><p>Host egress and resource controls still live outside the sandbox. Pair gVisor with network policy, cgroups, credentials isolation, and filesystem...</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>This is a project/docs review, not a peer-reviewed paper entry.</p></div>
<div class="apple-card"><p>Documentation reflects current gVisor behavior as of the review date and can drift.</p></div>
<div class="apple-card"><p>gVisor is not a VM in the Firecracker sense and should not be presented as one.</p></div>
<div class="apple-card"><p>Reduced compatibility and per-syscall overhead are first-order tradeoffs for syscall-heavy workloads.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A useful PoC could run a small syscall-heavy tool under runc and runsc, then compare denied syscalls, filesystem exposure, startup, and latency.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://gvisor.dev/">gVisor</a></li><li>Project/code: <a href="https://gvisor.dev/docs/">https://gvisor.dev/docs/</a></li><li>contrasts: <a href="https://www.usenix.org/conference/nsdi20/presentation/agache">Firecracker</a></li><li>alternative_sandbox: <a href="https://dl.acm.org/doi/10.1145/3062341.3062363">WebAssembly</a></li><li>permission_model: <a href="http://srl.cs.jhu.edu/pubs/SRL2003-02.pdf">Capability Myths Demolished</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/gvisor-google-2026.json`. Update the review record, then run `bun run build`.
