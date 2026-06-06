use std::env;
use std::error::Error;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use serde_json::Value;

const DEFAULT_PROMPT: &str = "prompts/review-paper.md";
const DEFAULT_SCHEMA: &str = "schemas/review.schema.json";
const DEFAULT_REVIEWER_CMD: &str = "codex";
const REVIEWS_DIR: &str = "data/reviews";

#[derive(Debug)]
struct Config {
    paper_input: String,
    out_dir: PathBuf,
    prompt_path: PathBuf,
    reviewer_cmd: String,
    dry_run: bool,
}

fn main() {
    if let Err(error) = run() {
        eprintln!("error: {error}");
        std::process::exit(1);
    }
}

fn run() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.first().map(String::as_str) == Some("check") {
        return run_check(&args[1..]);
    }

    let config = parse_args(args)?;
    let prompt = build_review_prompt(&config)?;

    fs::create_dir_all(&config.out_dir)?;
    let request_path = config.out_dir.join("review-request.md");
    fs::write(&request_path, &prompt)?;

    println!("wrote {}", request_path.display());

    if config.dry_run {
        println!("dry run: skipped reviewer command");
        return Ok(());
    }

    let output = invoke_reviewer(&config.reviewer_cmd, &prompt)?;
    let stdout_path = config.out_dir.join("model-output.md");
    let stderr_path = config.out_dir.join("model-stderr.txt");

    fs::write(&stdout_path, &output.stdout)?;
    fs::write(&stderr_path, &output.stderr)?;

    println!("wrote {}", stdout_path.display());
    println!("wrote {}", stderr_path.display());

    if !output.status.success() {
        return Err(format!(
            "reviewer command exited with {}. Inspect {} and {}",
            output.status,
            stdout_path.display(),
            stderr_path.display()
        )
        .into());
    }

    Ok(())
}

fn parse_args(args: Vec<String>) -> Result<Config, Box<dyn Error>> {
    let mut positional = Vec::new();
    let mut prompt_path = PathBuf::from(DEFAULT_PROMPT);
    let mut reviewer_cmd = env::var("AGR_REVIEWER_CMD")
        .or_else(|_| env::var("AGENT_READINGS_REVIEWER_CMD"))
        .unwrap_or_else(|_| DEFAULT_REVIEWER_CMD.to_string());
    let mut dry_run = false;
    let mut index = 0;

    while index < args.len() {
        match args[index].as_str() {
            "-h" | "--help" => {
                print_usage();
                std::process::exit(0);
            }
            "--dry-run" => {
                dry_run = true;
                index += 1;
            }
            "--prompt" => {
                index += 1;
                let value = args.get(index).ok_or("--prompt requires a path")?;
                prompt_path = PathBuf::from(value);
                index += 1;
            }
            "--cmd" => {
                index += 1;
                let value = args.get(index).ok_or("--cmd requires a command")?;
                reviewer_cmd = value.to_string();
                index += 1;
            }
            value if value.starts_with('-') => {
                return Err(format!("unknown flag: {value}").into());
            }
            value => {
                positional.push(value.to_string());
                index += 1;
            }
        }
    }

    if positional.len() != 2 {
        print_usage();
        return Err("expected <url-or-pdf> and <out-dir>".into());
    }

    Ok(Config {
        paper_input: positional.remove(0),
        out_dir: PathBuf::from(positional.remove(0)),
        prompt_path,
        reviewer_cmd,
        dry_run,
    })
}

fn print_usage() {
    eprintln!(
        "usage: agr <url-or-pdf> <out-dir> [--dry-run] [--prompt prompts/review-paper.md] [--cmd \"codex\"]"
    );
    eprintln!("       agr check [review-slug-or-path]");
    eprintln!();
    eprintln!("examples:");
    eprintln!(
        "  cargo run -- https://arxiv.org/pdf/2210.03629 review-out/react-yao-2022 --dry-run"
    );
    eprintln!("  AGR_REVIEWER_CMD=\"codex\" cargo run -- ./paper.pdf review-out/my-paper");
    eprintln!("  agr ./paper.pdf review-out/my-paper --cmd \"codex\"");
    eprintln!("  cargo run -- check");
    eprintln!("  cargo run -- check react-yao-2022");
}

fn run_check(args: &[String]) -> Result<(), Box<dyn Error>> {
    if args.iter().any(|arg| arg == "-h" || arg == "--help") {
        eprintln!("usage: agr check [review-slug-or-path]");
        eprintln!();
        eprintln!("examples:");
        eprintln!("  cargo run -- check");
        eprintln!("  cargo run -- check react-yao-2022");
        eprintln!("  agr check data/reviews/react-yao-2022.json");
        return Ok(());
    }

    let review_paths = match args.len() {
        0 => all_review_paths()?,
        1 => vec![resolve_review_target(&args[0])?],
        _ => return Err("usage: agr check [review-slug-or-path]".into()),
    };

    if review_paths.is_empty() {
        println!("checked 0 reviews: no review JSON files found in {REVIEWS_DIR}");
        return Ok(());
    }

    let mut passed = 0usize;
    let mut failed = 0usize;

    for path in review_paths {
        match check_review_file(&path) {
            Ok(slug) => {
                passed += 1;
                println!("ok {} ({slug})", path.display());
            }
            Err(errors) => {
                failed += 1;
                eprintln!("not ok {}", path.display());
                for error in errors {
                    eprintln!("  - {error}");
                }
            }
        }
    }

    println!(
        "checked {} review(s): {passed} ok, {failed} failed",
        passed + failed
    );

    if failed > 0 {
        return Err("review check failed".into());
    }

    Ok(())
}

fn all_review_paths() -> Result<Vec<PathBuf>, Box<dyn Error>> {
    let dir = Path::new(REVIEWS_DIR);
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut paths = Vec::new();
    for entry in fs::read_dir(dir)? {
        let path = entry?.path();
        if path.extension().and_then(|ext| ext.to_str()) == Some("json") {
            paths.push(path);
        }
    }
    paths.sort();
    Ok(paths)
}

fn resolve_review_target(target: &str) -> Result<PathBuf, Box<dyn Error>> {
    let direct = PathBuf::from(target);
    if direct.exists() {
        return Ok(direct);
    }

    if target.contains('/') || target.contains('\\') {
        return Err(format!("review file does not exist: {target}").into());
    }

    let slug = target.strip_suffix(".json").unwrap_or(target);
    let path = Path::new(REVIEWS_DIR).join(format!("{slug}.json"));
    if path.exists() {
        Ok(path)
    } else {
        Err(format!("review slug not found: {target} ({})", path.display()).into())
    }
}

fn check_review_file(path: &Path) -> Result<String, Vec<String>> {
    let source =
        fs::read_to_string(path).map_err(|error| vec![format!("failed to read file: {error}")])?;
    let value: Value =
        serde_json::from_str(&source).map_err(|error| vec![format!("invalid JSON: {error}")])?;

    let mut errors = Vec::new();
    validate_review(path, &value, &mut errors);

    if errors.is_empty() {
        let slug = value
            .get("slug")
            .and_then(Value::as_str)
            .unwrap_or("unknown")
            .to_string();
        Ok(slug)
    } else {
        Err(errors)
    }
}

fn validate_review(path: &Path, value: &Value, errors: &mut Vec<String>) {
    let Some(root) = object_at(value, "$", errors) else {
        return;
    };

    require_int(root, "$", "schema_version", errors);
    if root.get("schema_version").and_then(Value::as_i64) != Some(1) {
        errors.push("$.schema_version must be 1".to_string());
    }

    let slug = require_string(root, "$", "slug", errors);
    if let Some(slug) = slug {
        if !is_valid_slug(slug) {
            errors.push(format!("$.slug is not lowercase hyphenated: {slug}"));
        }
        if let Some(file_slug) = path.file_stem().and_then(|stem| stem.to_str()) {
            if file_slug != slug {
                errors.push(format!(
                    "$.slug ({slug}) does not match file name ({file_slug}.json)"
                ));
            }
        }
    }

    for key in [
        "paper",
        "summary",
        "problem",
        "method",
        "claims",
        "evidence",
        "agent_infra_takeaways",
        "caveats",
        "slide_plan",
    ] {
        if !root.contains_key(key) {
            errors.push(format!("$.{key} is required"));
        }
    }

    validate_paper(root.get("paper"), errors);
    validate_summary(root.get("summary"), errors);
    validate_problem(root.get("problem"), errors);
    validate_concepts(root.get("concepts"), errors);
    validate_method(root.get("method"), errors);
    validate_claims_and_evidence(root.get("claims"), root.get("evidence"), errors);
    require_string_array(root, "$", "agent_infra_takeaways", errors);
    require_string_array(root, "$", "caveats", errors);
    validate_slide_plan(root.get("slide_plan"), errors);

    if let Some(related_work) = root.get("related_work") {
        array_at(related_work, "$.related_work", errors);
    }
    if let Some(poc) = root.get("poc") {
        object_at(poc, "$.poc", errors);
    }
}

fn validate_paper(value: Option<&Value>, errors: &mut Vec<String>) {
    let Some(value) = value else {
        return;
    };
    let Some(object) = object_at(value, "$.paper", errors) else {
        return;
    };

    for key in ["title", "venue", "url"] {
        require_string(object, "$.paper", key, errors);
    }
    require_int(object, "$.paper", "year", errors);
    require_string_array(object, "$.paper", "authors", errors);

    for key in ["project_url", "arxiv_id"] {
        if let Some(value) = object.get(key) {
            if !value.is_string() {
                errors.push(format!("$.paper.{key} must be a string"));
            }
        }
    }

    if let Some(read_sources) = object.get("read_sources") {
        if let Some(items) = array_at(read_sources, "$.paper.read_sources", errors) {
            for (index, item) in items.iter().enumerate() {
                let path = format!("$.paper.read_sources[{index}]");
                if let Some(source) = object_at(item, &path, errors) {
                    require_string(source, &path, "kind", errors);
                    require_string(source, &path, "url", errors);
                    optional_string(source, &path, "note", errors);
                }
            }
        }
    }
}

fn validate_summary(value: Option<&Value>, errors: &mut Vec<String>) {
    let Some(value) = value else {
        return;
    };
    let Some(object) = object_at(value, "$.summary", errors) else {
        return;
    };
    for key in ["one_sentence", "thesis", "why_it_matters"] {
        require_string(object, "$.summary", key, errors);
    }
}

fn validate_problem(value: Option<&Value>, errors: &mut Vec<String>) {
    let Some(value) = value else {
        return;
    };
    let Some(object) = object_at(value, "$.problem", errors) else {
        return;
    };
    require_string_array(object, "$.problem", "prior_state", errors);
    require_string(object, "$.problem", "key_gap", errors);
    require_string_array(object, "$.problem", "assumptions", errors);
}

fn validate_concepts(value: Option<&Value>, errors: &mut Vec<String>) {
    let Some(value) = value else {
        return;
    };
    if let Some(items) = array_at(value, "$.concepts", errors) {
        for (index, item) in items.iter().enumerate() {
            let path = format!("$.concepts[{index}]");
            if let Some(concept) = object_at(item, &path, errors) {
                for key in ["id", "name", "definition"] {
                    require_string(concept, &path, key, errors);
                }
            }
        }
    }
}

fn validate_method(value: Option<&Value>, errors: &mut Vec<String>) {
    let Some(value) = value else {
        return;
    };
    let Some(object) = object_at(value, "$.method", errors) else {
        return;
    };
    require_string(object, "$.method", "core_idea", errors);
    require_string_array(object, "$.method", "action_grammar", errors);
    require_string_array(object, "$.method", "steps", errors);
    optional_string(object, "$.method", "pseudocode", errors);
}

fn validate_claims_and_evidence(
    claims: Option<&Value>,
    evidence: Option<&Value>,
    errors: &mut Vec<String>,
) {
    let mut claim_ids = Vec::new();
    let mut evidence_ids = Vec::new();

    if let Some(claims) = claims {
        if let Some(items) = array_at(claims, "$.claims", errors) {
            for (index, item) in items.iter().enumerate() {
                let path = format!("$.claims[{index}]");
                if let Some(claim) = object_at(item, &path, errors) {
                    for key in ["id", "statement", "type", "status", "scope"] {
                        require_string(claim, &path, key, errors);
                    }
                    if let Some(id) = claim.get("id").and_then(Value::as_str) {
                        push_unique(&mut claim_ids, id, &path, errors);
                    }
                    require_string_array(claim, &path, "evidence_refs", errors);
                    if let Some(value) = claim.get("caveats") {
                        string_array_at(value, &format!("{path}.caveats"), errors);
                    }
                }
            }
        }
    }

    if let Some(evidence) = evidence {
        if let Some(items) = array_at(evidence, "$.evidence", errors) {
            for (index, item) in items.iter().enumerate() {
                let path = format!("$.evidence[{index}]");
                if let Some(evidence) = object_at(item, &path, errors) {
                    for key in ["id", "kind", "source", "locator", "result"] {
                        require_string(evidence, &path, key, errors);
                    }
                    optional_string(evidence, &path, "metric", errors);
                    if let Some(id) = evidence.get("id").and_then(Value::as_str) {
                        push_unique(&mut evidence_ids, id, &path, errors);
                    }
                    require_string_array(evidence, &path, "claim_refs", errors);
                }
            }
        }
    }

    validate_claim_evidence_refs(claims, evidence, &claim_ids, &evidence_ids, errors);
}

fn validate_claim_evidence_refs(
    claims: Option<&Value>,
    evidence: Option<&Value>,
    claim_ids: &[String],
    evidence_ids: &[String],
    errors: &mut Vec<String>,
) {
    if let Some(items) = claims.and_then(Value::as_array) {
        for (claim_index, claim) in items.iter().enumerate() {
            let Some(refs) = claim.get("evidence_refs").and_then(Value::as_array) else {
                continue;
            };
            for (ref_index, evidence_ref) in refs.iter().enumerate() {
                let Some(evidence_ref) = evidence_ref.as_str() else {
                    continue;
                };
                if !evidence_ids.iter().any(|id| id == evidence_ref) {
                    errors.push(format!(
                        "$.claims[{claim_index}].evidence_refs[{ref_index}] references missing evidence id `{evidence_ref}`"
                    ));
                }
            }
        }
    }

    if let Some(items) = evidence.and_then(Value::as_array) {
        for (evidence_index, evidence) in items.iter().enumerate() {
            let Some(refs) = evidence.get("claim_refs").and_then(Value::as_array) else {
                continue;
            };
            for (ref_index, claim_ref) in refs.iter().enumerate() {
                let Some(claim_ref) = claim_ref.as_str() else {
                    continue;
                };
                if !claim_ids.iter().any(|id| id == claim_ref) {
                    errors.push(format!(
                        "$.evidence[{evidence_index}].claim_refs[{ref_index}] references missing claim id `{claim_ref}`"
                    ));
                }
            }
        }
    }
}

fn validate_slide_plan(value: Option<&Value>, errors: &mut Vec<String>) {
    let Some(value) = value else {
        return;
    };
    let Some(object) = object_at(value, "$.slide_plan", errors) else {
        return;
    };
    require_string(object, "$.slide_plan", "title", errors);
    require_string(object, "$.slide_plan", "subtitle", errors);
    require_string_array(object, "$.slide_plan", "sections", errors);
}

fn object_at<'a>(
    value: &'a Value,
    path: &str,
    errors: &mut Vec<String>,
) -> Option<&'a serde_json::Map<String, Value>> {
    match value.as_object() {
        Some(object) => Some(object),
        None => {
            errors.push(format!("{path} must be an object"));
            None
        }
    }
}

fn array_at<'a>(value: &'a Value, path: &str, errors: &mut Vec<String>) -> Option<&'a Vec<Value>> {
    match value.as_array() {
        Some(array) => Some(array),
        None => {
            errors.push(format!("{path} must be an array"));
            None
        }
    }
}

fn require_string<'a>(
    object: &'a serde_json::Map<String, Value>,
    path: &str,
    key: &str,
    errors: &mut Vec<String>,
) -> Option<&'a str> {
    match object.get(key) {
        Some(value) if value.is_string() => value.as_str(),
        Some(_) => {
            errors.push(format!("{path}.{key} must be a string"));
            None
        }
        None => {
            errors.push(format!("{path}.{key} is required"));
            None
        }
    }
}

fn optional_string(
    object: &serde_json::Map<String, Value>,
    path: &str,
    key: &str,
    errors: &mut Vec<String>,
) {
    if let Some(value) = object.get(key) {
        if !value.is_string() {
            errors.push(format!("{path}.{key} must be a string"));
        }
    }
}

fn require_int(
    object: &serde_json::Map<String, Value>,
    path: &str,
    key: &str,
    errors: &mut Vec<String>,
) {
    match object.get(key) {
        Some(value) if value.as_i64().is_some() => {}
        Some(_) => errors.push(format!("{path}.{key} must be an integer")),
        None => errors.push(format!("{path}.{key} is required")),
    }
}

fn require_string_array(
    object: &serde_json::Map<String, Value>,
    path: &str,
    key: &str,
    errors: &mut Vec<String>,
) {
    match object.get(key) {
        Some(value) => string_array_at(value, &format!("{path}.{key}"), errors),
        None => errors.push(format!("{path}.{key} is required")),
    }
}

fn string_array_at(value: &Value, path: &str, errors: &mut Vec<String>) {
    if let Some(array) = array_at(value, path, errors) {
        for (index, item) in array.iter().enumerate() {
            if !item.is_string() {
                errors.push(format!("{path}[{index}] must be a string"));
            }
        }
    }
}

fn push_unique(values: &mut Vec<String>, value: &str, path: &str, errors: &mut Vec<String>) {
    if values.iter().any(|existing| existing == value) {
        errors.push(format!("{path}.id duplicates `{value}`"));
    } else {
        values.push(value.to_string());
    }
}

fn is_valid_slug(value: &str) -> bool {
    let mut previous_dash = false;
    let mut saw_char = false;

    for ch in value.chars() {
        match ch {
            'a'..='z' | '0'..='9' => {
                previous_dash = false;
                saw_char = true;
            }
            '-' if saw_char && !previous_dash => previous_dash = true,
            _ => return false,
        }
    }

    saw_char && !previous_dash
}

fn build_review_prompt(config: &Config) -> Result<String, Box<dyn Error>> {
    let project_prompt = fs::read_to_string(&config.prompt_path)?;
    let schema = fs::read_to_string(DEFAULT_SCHEMA)?;
    let input_kind = classify_input(&config.paper_input);
    let canonical_out_dir = canonical_or_display(&config.out_dir);
    let canonical_prompt_path = canonical_or_display(&config.prompt_path);
    let local_input_note = local_input_note(&config.paper_input)?;

    Ok(format!(
        r#"# agent-readings paper review request

## Paper input

- Input: `{paper_input}`
- Detected kind: `{input_kind}`
{local_input_note}

## Output directory

Use this directory for artifacts if your runtime can write files:

`{out_dir}`

At minimum, produce a complete structured review JSON in your final answer or stdout.

## Project review prompt

Loaded from `{prompt_path}`.

{project_prompt}

## Required JSON schema

The primary output must conform to this schema:

```json
{schema}
```
"#,
        paper_input = config.paper_input,
        input_kind = input_kind,
        local_input_note = local_input_note,
        out_dir = canonical_out_dir.display(),
        prompt_path = canonical_prompt_path.display(),
        project_prompt = project_prompt.trim(),
        schema = schema.trim(),
    ))
}

fn classify_input(value: &str) -> &'static str {
    if value.starts_with("http://") || value.starts_with("https://") {
        if value.to_ascii_lowercase().ends_with(".pdf") || value.contains("/pdf/") {
            "remote-pdf"
        } else {
            "remote-url"
        }
    } else if value.to_ascii_lowercase().ends_with(".pdf") {
        "local-pdf"
    } else {
        "local-or-text"
    }
}

fn local_input_note(value: &str) -> Result<String, Box<dyn Error>> {
    let path = Path::new(value);
    if !path.exists() {
        return Ok(
            "- Local file status: not a local path; reviewer must fetch/read it if needed."
                .to_string(),
        );
    }

    let canonical = path.canonicalize()?;
    let metadata = fs::metadata(path)?;
    Ok(format!(
        "- Local file path: `{}`\n- Local file size: {} bytes",
        canonical.display(),
        metadata.len()
    ))
}

fn canonical_or_display(path: &Path) -> PathBuf {
    path.canonicalize().unwrap_or_else(|_| path.to_path_buf())
}

fn invoke_reviewer(cmdline: &str, prompt: &str) -> Result<std::process::Output, Box<dyn Error>> {
    let parts = split_command(cmdline)?;
    if parts.is_empty() {
        return Err("reviewer command is empty".into());
    }

    let mut child = Command::new(&parts[0])
        .args(&parts[1..])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| {
            format!(
                "failed to start reviewer command `{cmdline}`: {error}. Use --dry-run, --cmd, or AGR_REVIEWER_CMD"
            )
        })?;

    child
        .stdin
        .as_mut()
        .ok_or("failed to open reviewer stdin")?
        .write_all(prompt.as_bytes())?;

    Ok(child.wait_with_output()?)
}

fn split_command(cmdline: &str) -> Result<Vec<String>, Box<dyn Error>> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut quote = None;
    let mut escape = false;

    for ch in cmdline.chars() {
        if escape {
            current.push(ch);
            escape = false;
            continue;
        }

        if ch == '\\' {
            escape = true;
            continue;
        }

        match quote {
            Some(q) if ch == q => quote = None,
            Some(_) => current.push(ch),
            None if ch == '"' || ch == '\'' => quote = Some(ch),
            None if ch.is_whitespace() => {
                if !current.is_empty() {
                    parts.push(std::mem::take(&mut current));
                }
            }
            None => current.push(ch),
        }
    }

    if escape {
        current.push('\\');
    }

    if let Some(q) = quote {
        return Err(format!("unterminated quote {q} in reviewer command").into());
    }

    if !current.is_empty() {
        parts.push(current);
    }

    Ok(parts)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn splits_command_with_quotes() {
        assert_eq!(
            split_command("codex exec --model 'gpt test'").unwrap(),
            vec!["codex", "exec", "--model", "gpt test"]
        );
    }

    #[test]
    fn classifies_remote_pdf() {
        assert_eq!(
            classify_input("https://arxiv.org/pdf/2210.03629"),
            "remote-pdf"
        );
    }

    #[test]
    fn validates_minimal_review_shape() {
        let review = minimal_review();
        let mut errors = Vec::new();

        validate_review(
            Path::new("data/reviews/unit-paper-2026.json"),
            &review,
            &mut errors,
        );

        assert!(errors.is_empty(), "{errors:#?}");
    }

    #[test]
    fn rejects_missing_evidence_references() {
        let mut review = minimal_review();
        review["claims"][0]["evidence_refs"] = json!(["E-missing"]);
        let mut errors = Vec::new();

        validate_review(
            Path::new("data/reviews/unit-paper-2026.json"),
            &review,
            &mut errors,
        );

        assert!(
            errors
                .iter()
                .any(|error| error.contains("references missing evidence id `E-missing`")),
            "{errors:#?}"
        );
    }

    fn minimal_review() -> Value {
        json!({
            "schema_version": 1,
            "slug": "unit-paper-2026",
            "paper": {
                "title": "Unit Paper",
                "authors": ["Unit Author"],
                "year": 2026,
                "venue": "UnitConf",
                "url": "https://example.com/unit"
            },
            "summary": {
                "one_sentence": "A one sentence summary.",
                "thesis": "A thesis.",
                "why_it_matters": "A reason."
            },
            "problem": {
                "prior_state": ["Before state."],
                "key_gap": "The gap.",
                "assumptions": ["An assumption."]
            },
            "method": {
                "core_idea": "The core idea.",
                "action_grammar": ["Action grammar."],
                "steps": ["Step one."]
            },
            "claims": [{
                "id": "C1",
                "type": "result",
                "status": "paper-supported",
                "statement": "The claim.",
                "scope": "The scope.",
                "evidence_refs": ["E1"]
            }],
            "evidence": [{
                "id": "E1",
                "kind": "result_table",
                "source": "paper",
                "locator": "Table 1",
                "result": "The result.",
                "claim_refs": ["C1"]
            }],
            "agent_infra_takeaways": ["Takeaway."],
            "caveats": ["Caveat."],
            "slide_plan": {
                "title": "Unit Paper",
                "subtitle": "A subtitle.",
                "sections": ["summary", "evidence"]
            }
        })
    }
}
