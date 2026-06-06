<!-- .slide: class="title-slide apple-title" -->

<div class="slide-frame slide-frame--center">
  <p class="deck-kicker">agent-readings / Training Agents</p>
  <h1>Direct Preference Optimization</h1>
  <p class="deck-subtitle">Preference training without the PPO loop</p>

  <div class="deck-meta-strip">
    <div class="deck-meta-pill"><strong>2023</strong><span>NeurIPS 2023</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>claims</span></div>
    <div class="deck-meta-pill"><strong>7</strong><span>evidence refs</span></div>
    <div class="deck-meta-pill"><strong>paper-read</strong><span>status</span></div>
  </div>
</div>

---

<!-- .slide: class="statement-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">The one sentence</p>
  <h2>DPO turns preference optimization into a direct classification-style policy loss, removing the explicit reward-model and PPO loop from standard RLHF.</h2>
  <p class="deck-note">DPO lowered the operational barrier for post-training: teams can use pairwise preference data with a standard supervised fine-tuning loop instead of maintaining separate reward-model training, online sampling, PPO stability machinery, and extensive RL tuning.</p>
</div>

---

<!-- .slide: class="problem-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Before this paper</p>
  <h2>The friction was structural.</h2>
  <div class="apple-card-grid apple-card-grid--three">
    <div class="apple-card"><p>RLHF typically required supervised fine-tuning, reward-model training, and reinforcement-learning optimization.</p></div>
<div class="apple-card"><p>PPO-based RLHF is expensive and unstable because it samples from the policy during training and must control reward over-optimization and KL drift.</p></div>
<div class="apple-card"><p>Preference labels are easier to collect than expert demonstrations, but the standard pipeline made them operationally heavy.</p></div>
  </div>
  <div class="deck-callout">
    <span>Key gap</span>
    <p>The paper asks whether the same KL-regularized RLHF objective can be optimized directly from preference pairs without fitting a separate reward model or running reinforcement learning.</p>
  </div>
</div>

---

<!-- .slide: class="idea-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Core idea</p>
  <h2>Start from the KL-constrained RLHF objective, express the latent reward as a function of the optimized policy and reference policy, substitute that expression...</h2>
  <p class="deck-note">Start from the KL-constrained RLHF objective, express the latent reward as a function of the optimized policy and reference policy, substitute that expression into a Bradley-Terry preference likelihood, and train the policy directly on preferred/dispreferred...</p>
  <div class="idea-loop" aria-label="Agent loop">
    <div><strong>Model</strong><span>reason</span></div>
    <div><strong>Runtime</strong><span>act</span></div>
    <div><strong>World</strong><span>observe</span></div>
  </div>
  <div class="step-strip">
    <div class="step-item">
  <span>01</span>
  <p>Train or choose a supervised reference policy.</p>
</div>
<div class="step-item">
  <span>02</span>
  <p>Collect or load preference pairs on the target distribution.</p>
</div>
<div class="step-item">
  <span>03</span>
  <p>Compute log probabilities of preferred and dispreferred completions under both current and reference policies.</p>
</div>
<div class="step-item">
  <span>04</span>
  <p>Construct the DPO preference margin from policy/reference log-ratio differences.</p>
</div>
  </div>
</div>

---

<!-- .slide: class="grammar-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Action grammar</p>
  <h2>The agent is an interface contract.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>x: prompt or context.</p></div>
<div class="apple-card"><p>yw: preferred completion.</p></div>
<div class="apple-card"><p>yl: dispreferred completion.</p></div>
<div class="apple-card"><p>pi_ref: fixed reference policy, usually SFT.</p></div>
  </div>
</div>

---

<!-- .slide: class="code-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Executable shape</p>
  <h2>The mechanism should fit on one screen.</h2>

```python
for x, y_win, y_lose in preference_pairs:
    pi_margin = logp(policy, y_win, x) - logp(policy, y_lose, x)
    ref_margin = logp(reference, y_win, x) - logp(reference, y_lose, x)
    loss = -log_sigmoid(beta * (pi_margin - ref_margin))
    update(policy, loss)

return policy
```
</div>

---

<!-- .slide: class="proof-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Evidence</p>
  <h2>The proof objects.</h2>
  <div class="proof-grid">
    <div class="proof-card">
  <span>E-derivation</span>
  <p>The paper shows that the optimal policy for the KL-constrained reward objective can be written as the reference policy times an exponentiated reward, then rearranges this to...</p>
</div>
<div class="proof-card">
  <span>E-pipeline-simplification</span>
  <p>DPO optimizes a policy directly with a binary cross-entropy objective over preference pairs, eliminating explicit reward-model training, policy sampling during fine-tuning, and...</p>
</div>
<div class="proof-card">
  <span>E-sentiment</span>
  <p>In controlled sentiment generation, DPO produces the strongest expected reward versus KL frontier and strictly dominates PPO, including a PPO-GT baseline with ground-truth...</p>
</div>
<div class="proof-card">
  <span>E-summarization</span>
  <p>On Reddit TL;DR summarization, DPO reports about a 61% win rate against reference summaries at temperature 0.0, while PPO reaches about 57% at its best temperature; DPO is also...</p>
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
  <p>DPO derives a direct policy objective by reparameterizing the reward in terms of the optimal policy and the reference policy.</p>
  <small>E-derivation</small>
</div>
<div class="claim-card">
  <span>C2 · paper-supported</span>
  <p>DPO avoids explicit reward-model fitting, online policy sampling during fine-tuning, and PPO-style actor-critic optimization.</p>
  <small>E-pipeline-simplification</small>
</div>
<div class="claim-card">
  <span>C3 · paper-supported</span>
  <p>In controlled sentiment generation, DPO achieves a better reward/KL frontier than PPO, including PPO with ground-truth reward access.</p>
  <small>E-sentiment</small>
</div>
<div class="claim-card">
  <span>C4 · paper-supported</span>
  <p>On TL;DR summarization, DPO reaches about a 61% GPT-4 win rate against reference summaries, exceeding PPO's about 57% best reported win rate.</p>
  <small>E-summarization</small>
</div>
  </div>
</div>

---

<!-- .slide: class="takeaway-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Agent infrastructure</p>
  <h2>What changes if you build systems.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>DPO makes preference training operationally boring in the best way: it turns post-training into a supervised loop over preference pairs.</p></div>
<div class="apple-card"><p>The reference model is part of the contract. DPO is not just 'prefer A over B'; it is 'prefer A over B relative to what the reference model already...</p></div>
<div class="apple-card"><p>Preference-data quality still dominates. Removing PPO does not remove the need for representative prompts, good comparisons, and clear evaluator...</p></div>
<div class="apple-card"><p>The beta knob is a runtime policy knob in training form: it controls how far the agent model may move from known behavior.</p></div>
  </div>
</div>

---

<!-- .slide: class="caveat-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Caveats</p>
  <h2>What this does not prove.</h2>
  <div class="apple-card-grid apple-card-grid--two">
    <div class="apple-card"><p>DPO simplifies RLHF but does not make preference optimization free of assumptions.</p></div>
<div class="apple-card"><p>The method still needs pairwise preference data from the task distribution.</p></div>
<div class="apple-card"><p>The experiments use models up to 6B parameters, so frontier-scale behavior is an extrapolation from this paper.</p></div>
<div class="apple-card"><p>GPT-4 judge prompts materially affect reported win rates.</p></div>
  </div>
</div>

---

<!-- .slide: class="closing-slide" -->

<div class="slide-frame">
  <p class="deck-kicker">Run it</p>
  <h2>No PoC yet.</h2>
  <p class="deck-note">No PoC yet - contributions welcome. A compact PoC could optimize a tiny language model or classifier on synthetic preference pairs with the DPO log-ratio loss and compare it to preferred-only fine-tuning.</p>
  <div class="reference-list">
    <ul><li>Paper: <a href="https://arxiv.org/abs/2305.18290">Direct Preference Optimization: Your Language Model is Secretly a Reward Model</a></li><li>Project/code: <a href="https://github.com/eric-mitchell/direct-preference-optimization">https://github.com/eric-mitchell/direct-preference-optimization</a></li><li>simplifies: <a href="https://arxiv.org/abs/2203.02155">InstructGPT</a></li><li>connects: <a href="https://arxiv.org/abs/2112.09332">WebGPT</a></li><li>precedes: <a href="https://arxiv.org/abs/2411.15124">Tulu 3</a></li></ul>
  </div>
</div>

Note: This deck is synthesized from `data/reviews/dpo-rafailov-2023.json`. Update the review record, then run `bun run build`.
