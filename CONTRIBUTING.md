# Contributing

Additions should keep the repository static, dependency-light, and easy to review.

## Add a structured review and deck

1. Run `bun run new-review <paper-slug>`.
2. Edit `data/reviews/<paper-slug>.json`.
3. Fill in the stub in `data/readings.yml`.
4. Run `cargo run -- check <paper-slug>`.
5. Run `bun run build`.
6. Preview with `bun run preview`, then open `http://localhost:8080/reviews/<paper-slug>/` and `http://localhost:8080/slides/<paper-slug>/`. If port 8080 is busy, use `bun run preview --port 8090`.
7. Open a PR with the review JSON, metadata, and generated pages.

Use slugs of the form `<short-name>-<first-author>-<year>`, for example `react-yao-2022`.

`slides/<paper-slug>/deck.md` is generated from the review record. Do not hand-edit it unless the deck is intentionally custom.

## Review format

Each review stores the paper as a small ARA-inspired cognitive layer:

- `problem`: prior state, key gap, and assumptions
- `method`: core idea, action grammar, steps, and optional pseudocode
- `claims`: falsifiable statements with status and scope
- `evidence`: paper tables, figures, or PoC outputs linked back to claims
- `agent_infra_takeaways`: what changes for agent systems
- `caveats`: failure modes and boundaries

The schema lives in `schemas/review.schema.json`.

## AI-assisted paper review helper

Use the Rust CLI to ask a local reviewer model to draft the structured review artifacts:

```sh
cargo run -- <paper-url-or-local-pdf> review-out/<paper-slug>
```

After installing/building the binary, the command name is `agr`:

```sh
agr <paper-url-or-local-pdf> review-out/<paper-slug>
```

The CLI writes `review-request.md` into the output directory, pipes it to the local reviewer command, and captures `model-output.md` plus `model-stderr.txt`.

By default it runs `codex`. Override it with either:

```sh
AGR_REVIEWER_CMD="your-local-llm-command" cargo run -- <paper> <out-dir>
cargo run -- <paper> <out-dir> --cmd "your-local-llm-command"
agr <paper> <out-dir> --cmd "your-local-llm-command"
```

Use `--dry-run` to generate only the prompt bundle. The prompt contract lives in `prompts/review-paper.md`.

## Check reviews

Validate all structured reviews:

```sh
cargo run -- check
agr check
```

Validate one review by slug or path:

```sh
cargo run -- check react-yao-2022
agr check data/reviews/react-yao-2022.json
```

## Add a PoC

Put code under `pocs/<paper-slug>/`. Its README must state the exact paper claim being reproduced, prerequisites, one command to run locally, and expected output. Pin dependencies inside the PoC directory.

## Quality bar

Decks should be 8-14 slides, readable on mobile, export cleanly with `?print-pdf`, and use only relative paths. Do not add analytics, auth, a backend, a CMS, or a per-deck custom build pipeline.
