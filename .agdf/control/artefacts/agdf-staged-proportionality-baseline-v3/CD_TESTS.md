# CD+Tests: Staged Proportionality Baseline v3

Status: `done`
Decision: `implemented_and_tested`
Date: 2026-08-19
Run: `agdf-staged-proportionality-baseline-v3`
Based on: approved TP Revision 1 and passing pre-implementation Brownfield Analysis

## Implementation Result

The approved additive `staged-v3` profile is implemented through the existing proportionality
benchmark pipeline. A frozen `profiles.js` registry now owns selector, family, manifest, schema,
protocol, adapter, runner, observation-key, fixture, evidence-class, history and fingerprint
properties for `legacy-v1`, `staged-v2` and `staged-v3`. Loader, prompt, recorder, evaluator, reporter
and both existing CLI scripts consume that shared owner; no second runner, recorder, evaluator,
reporter, executable or routing-policy owner was introduced.

The v3 data boundary contains:

- a separately versioned manifest, 40-case hidden baseline, 72-scenario blind corpus and fixture
  catalog covering all six delivery paths and the retained adversarial minimum;
- explicit PB-008 control-state, permitted-clarification and mutation-intent facts;
- single-action and single-semantic-effect facts for PB-010 and PB-011;
- complete bounded-change fact groups for PB-016, PB-017 and PB-020;
- complete Structured Depth objects for every structured case with six trigger families and seven
  bounded checks;
- one explicit semantic evaluation target for each Full-Depth trigger family: PB-021 behavior or
  policy, PB-031 architecture or runtime, PB-033 persistence or security, PB-034 unbounded
  coordination, PB-036 release or cross-host and PB-037 external contract;
- schema/protocol/profile version 3 observation handling, deterministic synthetic replay and
  explicit repository-replay versus authenticated-live evidence labels.

## Historical Boundary

`staged-v3-history-provenance.json` records a stable sorted SHA-256 inventory of 225 protected
staged-v2/r3 files: the four v2 corpus/baseline inputs, all 217 persisted r3 attempt/observation
files, the r3 JSON and Markdown reports, and the completed r3 QA and OR evidence. Loading v3 checks
every hash, rejects missing required evidence and rejects omitted or added files under the protected
r3 root. No protected file changed during implementation.

## Deterministic Evidence

| Test area | Result | Evidence |
|---|---|---|
| Focused proportionality suite | pass | v1/v2 compatibility plus v3 registry, CLI, 40/72 identity, all six paths, adversarial coverage, neutral facts, leakage, schema, recorder, evaluator and report checks |
| Full-Depth semantic cases | pass | six explicit semantic targets; one positive behavior case per trigger family; missing and conflicting trigger/check matrices fail closed |
| V3 synthetic series | pass | 216/216 temporary `synthetic_replay` observations; repeat evaluation and JSON/Markdown rendering are deterministic; no repository observation persisted |
| Negative series | pass | missing coverage, duplicate ID, mixed provenance, stale fingerprint, critical path under-governance, stage deviation and 12.5% small-path over-governance block |
| Threshold compatibility | pass | unchanged existing v1/v2 10% pass and above-10% block assertions remain green |
| Loader and history safety | pass | unknown selector, version mismatch, path escape, symlink escape, required-file omission, protected-root addition and hash drift reject |
| Recorder safety | pass | atomic observation write, duplicate/replacement provenance, mutation and redaction stops; only generator timeout is retryable |
| Full create-agdf smoke | pass | complete `npm --prefix create-agdf run smoke-test`, including package, control, 58/58 skill evals, routing and proportionality |
| Runtime Integrity | pass | source runtime: 10 skills and 16 control files |
| Generated Runtime Integrity | pass | installed generated runtime: 10 skills and 16 control files |
| Control-state regression | pass | control-state and backlog vocabulary suites |
| Exact run gate-check | pass | gate `CD+Tests`, zero focused findings before review transition |
| Protected-history verification | pass | 225 declared files present, complete and hash-matching |
| Diff quality and scope | pass | `git diff --check`; implementation confined to approved benchmark/data/run paths; unrelated pre-existing Parent control edits preserved |

## Commands

- `npm --prefix create-agdf run test:proportionality`
- `npm --prefix create-agdf run smoke-test`
- `npm --prefix create-agdf run test:control-state`
- `node plugin/scripts/check-runtime-integrity.mjs`
- `AGDF_RUNTIME_INTEGRITY_ROOT="$PWD/create-agdf/generated/plugins/agdf" node create-agdf/generated/plugins/agdf/scripts/check-runtime-integrity.mjs`
- `node create-agdf/generated/plugins/agdf/runtime/agdf-local.js gate-check --run agdf-staged-proportionality-baseline-v3`
- v3 `loadCorpus` protected-history verification
- `git diff --check`

## Evidence Boundary And Non-Claims

The complete v3 series is deterministic repository evidence labeled `synthetic_replay`. No
authenticated or billable agent call was made, no v3 observation series was persisted, and no
authenticated live-host behavior is claimed. A future v3 live series still requires its own bounded
execution review and authority after repository acceptance. No VCS, release, publish, deployment or
reinstall action was performed.

## Decision

SPB3-T02 through SPB3-T22 are implemented and deterministically evidenced. CD+Tests passes and the
next permitted action is the mandatory Task Plan Review, Clean Implementation Review and Code Review.
