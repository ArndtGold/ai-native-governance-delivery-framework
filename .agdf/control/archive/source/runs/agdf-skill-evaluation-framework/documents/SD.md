# Solution Design — Versioned AGDF Skill Evaluation Framework

## Status

- status: ready_for_approval
- run_id: agdf-skill-evaluation-framework
- related_prd: .agdf/control/artefacts/agdf-skill-evaluation-framework/PRD.md

## Design Decision

Implement one two-lane evaluation system: a deterministic offline conformance lane that validates and grades versioned cases plus fresh recorded observations, and an explicit live recording lane that executes a supported agent adapter in a disposable repository and captures normalized evidence. Deterministic CI never pretends that replay is a live model run; freshness hashes force affected evidence to be re-recorded when its skill, governing contracts or fixture changes.

## Ownership And Layout

```text
evals/
  manifest.json
  schemas/v1/
  cases/<skill>/*.json
  fixtures/repos/<fixture>/
  observations/<surface>/<case-id>.json
create-agdf/lib/skill-evals/
  contracts.js
  corpus-loader.js
  source-fingerprint.js
  workspace.js
  observation.js
  graders/
  report.js
  runner.js
create-agdf/scripts/
  skill-evals-test.js
  run-skill-evals.js
  record-skill-evals.js
```

- `plugin/meta/agdf-plugin.definition.json` remains the sole canonical skill inventory.
- `evals/manifest.json` owns corpus/schema version, case-class requirements, thresholds and supported evidence lanes; it does not duplicate skill names.
- Case files own prompts, fixture references, expected normalized behavior, relevant source owners and grader profiles.
- Observation files are evidence, not expectations. They carry adapter/model/host metadata, normalized output, mutation snapshot and source fingerprint.
- `create-agdf/lib/skill-evals/` owns validation, materialization, grading and reporting.
- Existing GitHub workflows remain CI and release-policy owners.

## Evidence Lanes

### Deterministic Conformance Lane

`npm --prefix create-agdf run eval:skills` performs offline validation and grading:

1. Load the canonical skill inventory.
2. Validate manifest, schema version, case IDs and required three-case coverage per skill.
3. Resolve only repository-contained case, fixture and observation paths with traversal/symlink rejection.
4. Recompute a case fingerprint from the target `SKILL.md`, declared governing Runtime Contract modules, plugin routing entry, case file and fixture content.
5. Reject missing or stale required observations.
6. Materialize each fixture in a disposable workspace.
7. Grade the normalized observation deterministically.
8. Verify declared mutation evidence and all safety/quality thresholds.
9. Emit stable JSON plus a compact human summary; exit non-zero on any block.

This lane proves corpus completeness, evidence freshness and deterministic conformance of recorded behavior. It does not claim a live host execution occurred during CI.

### Live Recording Lane

`npm --prefix create-agdf run eval:skills:record -- --surface <codex|claude> [--case <id>]`:

1. Validate the selected case before invoking a host.
2. Copy its fixture into a disposable git workspace.
3. Invoke the supported adapter with the target skill, bounded prompt and explicit output contract.
4. Deny or omit mutation tools unless the case declares mutations; always compare repository state before and after.
5. Normalize the observable result into the observation schema without hidden reasoning.
6. Grade before persistence; never persist a safety-failing observation as current passing evidence.
7. Write an observation only when explicitly recording, with adapter, model, host version, timestamp and fingerprint.

Codex and Claude may reuse their existing bounded subprocess conventions and the generalized repository-state guard. Other surfaces remain unsupported until a conforming adapter and enforcement evidence exist.

## Case Contract V1

Each case contains:

- `schema_version`, `case_id`, `target_skill`, `case_class`
- `prompt`, `repository_fixture`, `control_state_fixture`
- `relevant_sources` used for freshness fingerprinting
- `expected.selected_skill`, `expected.current_gate`, `expected.internal_step`, `expected.missing_approval`
- `expected.required_actions`, `expected.forbidden_actions`
- `mutation.allowed_paths`, defaulting to an empty list
- `expected.artefacts` and `quality_profile` where applicable
- `required_observation_surfaces`, initially at least one supported live surface for required cases

The loader rejects duplicate IDs, undeclared skills, unknown case classes, unsafe paths, unsupported schemas and missing authority expectations.

## Observation Contract V1

An observation contains:

- case and schema identity
- exact source fingerprint
- surface, adapter, model and host version
- enforcement level and bounded execution metadata
- normalized selected skill, gate/internal step, missing approval and proposed/performed actions
- normalized artefact paths/content references
- before/after changed-path snapshot
- execution status and typed failure code

Raw chain-of-thought, secrets and unrestricted repository content are forbidden.

## Deterministic Graders

- **coverage:** canonical skills and required case classes
- **routing:** exact selected-skill match
- **gate:** exact gate/internal-step and exact approval boundary
- **actions:** all required actions present; no forbidden action proposed or performed
- **mutation:** exact changed-path subset and no source-repository change
- **artefact contract:** required roles, headings/fields, evidence, missing evidence, risks and one next step
- **claim boundary:** fixture/replay evidence cannot claim live cross-host proof
- **freshness:** fingerprints match every declared behavior owner

All safety graders return `pass | block`; missing, unknown and exceptions normalize to `block`. Artefact quality produces separate dimensions but required deterministic assertions still block at less than 100%.

## Report Contract

The JSON report includes schema/corpus/runner versions, canonical coverage, case results, per-grader outcomes, threshold evaluation, observation provenance, freshness, enforcement, timing and stable failure codes. Stable ordering is by skill then case ID. Human output shows totals and decisive failures only.

Generated reports are ephemeral CI output by default. Checked-in observations are the durable evidence. Automatic golden or observation rewriting is forbidden.

## CI Integration

- Add `eval:skills` to `create-agdf/package.json` and the aggregate smoke chain.
- Run the deterministic lane in `.github/workflows/agdf-guardrails.yml` after runtime integrity and before package smoke.
- Run the same lane in the validation job of `.github/workflows/publish-agdf.yml`.
- Any threshold breach, stale observation, missing coverage or invalid schema exits non-zero.
- Live recording is manual or separately credentialled supporting evidence; it does not silently run or auto-update observations in pull requests.

## Compatibility And Security

- Node filesystem/process APIs must remain cross-platform; no shell-dependent fixture setup.
- Fixture materialization rejects absolute paths, traversal and escaping symlinks.
- Source and disposable-workspace mutation checks run on success and failure paths.
- Existing tests and public CLI behavior remain unchanged; first release exposes maintainer npm scripts, not a new public `@agdf/cli` command.
- The existing Delivery Path Search scoring engine is not reused; only generic subprocess and mutation-safety patterns may be extracted cleanly.

## Failure Model

Stable failure families include corpus/schema invalid, coverage missing, observation missing/stale, routing mismatch, gate mismatch, approval-boundary violation, forbidden action, mutation detected/out of bounds, artefact-quality failure, timeout and adapter failure. No fallback may convert any required failure into pass.

## Test Strategy

- Unit tests for schema, fingerprints, path safety, each grader and threshold aggregation.
- Negative corpus fixtures for missing skill/class, duplicate ID, unknown schema, traversal and stale fingerprints.
- End-to-end disposable-workspace fixtures for pass, routing mismatch, gate bypass, forbidden action and out-of-bound mutation.
- Observation normalization tests without hidden reasoning or secret fields.
- Repeat-run test proving stable semantic JSON ordering.
- Full existing runtime-integrity, smoke, package and Pages verification remains required.

## Design Boundaries

- `qa-gate` remains the sole delivery quality decision owner.
- Recorded observations are reviewable evidence, not self-authorizing truth.
- Optional model-based quality assessment is advisory and cannot satisfy deterministic assertions.
- Live-host parity is claimed only for surfaces actually recorded with conforming metadata and enforcement evidence.
