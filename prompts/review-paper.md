# Paper Review Prompt for agent-readings

You are reviewing a paper for `agent-readings`, a curated list about LLM agents and the infrastructure that runs them.

Read the paper first. Do not review from the abstract alone. If you cannot access the paper, say exactly what is blocked and stop instead of fabricating details.

## Lens

Read agents as long-running, side-effecting, fault-prone distributed programs. In addition to the model idea, look for the runtime contract:

- What state exists, where it lives, and how it is recovered.
- What actions/tools/environment effects are allowed.
- What evidence supports the claimed improvement.
- What failure modes, benchmark weaknesses, or trust boundaries remain.
- What this implies for agent infrastructure: scheduling, memory, isolation, serving, evaluation, or verification.

## Required output

Create a structured review JSON conforming to `schemas/review.schema.json`.

If your runtime can write files, write:

1. `review.json` — the structured review, valid JSON only.
2. `notes.md` — short reviewer notes: sources read, uncertainties, strongest evidence, and recommended README section.
3. `readings.yml.stub` — a metadata stub for `data/readings.yml`.
4. `poc-plan.md` — only if a small local PoC is realistic.

If your runtime cannot write files, print the same artifacts in clearly labeled fenced code blocks.

## Review JSON requirements

- `slug`: use `<short-name>-<first-author>-<year>`, lowercase and hyphenated.
- `paper`: include title, authors, year, venue if known, URL, project/code URL if known, and read sources.
- `summary.one_sentence`: one faithful claim. No marketing.
- `problem`: prior state, key gap, and assumptions.
- `method`: core idea, action/tool grammar if relevant, load-bearing steps, optional pseudocode.
- `claims`: 4-8 falsifiable claims. Each claim needs a type, status, scope, evidence refs, and caveats.
- `evidence`: link every claim to paper evidence. Use exact table/figure/section locators and numbers where possible.
- `agent_infra_takeaways`: what changes for agent systems builders.
- `caveats`: limitations, failure modes, benchmark risks, or scope boundaries.
- `related_work`: include only related work needed to position the paper.
- `poc`: mark as `missing` unless you can specify a small, local, reproducible PoC.
- `slide_plan`: use a compact title/subtitle and 8-14 sections suitable for a generated reveal.js deck.

## Evidence standards

- Distinguish paper-supported claims from your inference.
- Do not say a result is general if it was shown only in a benchmark or ablation.
- Preserve negative results and failure modes.
- Quote sparingly. Prefer precise paraphrase plus locators.
- If the paper includes tables, extract the key numbers that earned the citation.
- If a result depends on a benchmark setup, state that setup in claim scope.

## Style

- Use plain, technical English.
- Keep all generated JSON valid and ASCII-safe.
- Avoid hype, vague claims, and unsupported historical framing.
- The review should be maintainable data, not an essay. The README can carry prose; the JSON should carry claims and evidence.
