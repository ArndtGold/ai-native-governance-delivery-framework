# Brownfield Analysis: Staged Proportionality Baseline v3

Mode: `pre_implementation_analysis`
Status: `done`
Decision: `pass`
Date: 2026-08-19
Run: `agdf-staged-proportionality-baseline-v3`
Based on: approved TP Revision 1

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact:
  `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/BROWNFIELD_ANALYSIS.md`
- scope: Implement SPB3-T02 through SPB3-T22 by extending the existing proportionality benchmark
  owners after the mandatory TP approval and candidate-path baseline check.
- evidence:
  - Exact `Approval: TP` was received on 2026-08-19 for durable TP Revision 1 after same-run,
    same-gate and revision revalidation.
  - Candidate implementation paths under `create-agdf/lib/proportionality-benchmark/**`, the two
    proportionality CLI scripts, the focused benchmark test and `evals/proportionality/**` had no
    tracked or untracked changes before implementation.
  - Dirty paths are confined to this Child's new control artefacts and previously reconciled Parent
    control documents; no foreign benchmark implementation overlaps the candidate paths.
  - Existing owners are `contracts.js`, `corpus-loader.js`, `blind-prompt.js`, `live-recorder.js`,
    `source-fingerprint.js`, `evaluator.js`, `report.js`, the two existing CLI scripts and the single
    focused benchmark test.
  - Current staged-v2 core hashes are captured below and the r3 observation directory contains 217
    files before implementation.
  - Existing test entry points are `npm --prefix create-agdf run test:proportionality`, full
    `smoke-test`, the two Runtime Integrity checks, exact-version doctor/gate-check and diff checks.
- transparency: Implementation may add one metadata registry and additive v3 data, but must keep one
  loader/recorder/evaluator/reporter path. No live invocation, new executable or canonical policy
  change is required.
- missing_evidence: implementation diff; generated history inventory; focused/full test results;
  mandatory TP/Clean/Code reviews; QA. Authenticated v3 live evidence is intentionally outside this
  implementation and remains an explicit later non-claim.
- current_coverage:
  - `fully_done`: legacy-v1 and staged-v2 loading, recording, deterministic grading/reporting,
    source fingerprints, safety checks and a 216-observation r3 historical series;
  - `partially_done`: profile dispatch and staged-family logic, currently repeated through
    staged-v2 conditionals;
  - `not_done`: staged-v3 registry/data, complete neutral targeted facts, v3 schema/provenance,
    history inventory and deterministic v3 test matrices.
- reuse_strategy: `refactor` profile selection into one registry; `extend` every existing benchmark
  owner; `new` only for v3 data/history files and run-owned evidence; `replace` nothing.
- risks:
  - broad profile refactoring could regress v2 output;
  - a partial history inventory could create false immutability confidence;
  - visible facts or prompts could leak hidden targets;
  - v3 conditionals could recreate a parallel pipeline if the registry is not consumed consistently.
- parallel_structure_risk: `pass` with guard — `profiles.js` is metadata only; all execution stays in
  existing shared owners and scripts.
- source_of_truth_drift: `none`; Modes and Gate Transition remain read-only behavior sources.
- interface_impact: additive public `staged-v3` selector with retained legacy-v1/staged-v2 behavior.
- data_migration: `none`; v3 is additive and history is hash-protected.
- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing routing and ceremony boundaries remain authoritative; this
  implementation records version-specific evidence only.
- required_next_step: Enter `CD+Tests` and implement the approved TP in phase order, stopping on any
  protected-history drift, overlapping candidate-path change, second pipeline or failed required
  check.

## Candidate Path Baseline

- clean_before_implementation:
  - `create-agdf/lib/proportionality-benchmark/**`
  - `create-agdf/scripts/run-proportionality-benchmark.js`
  - `create-agdf/scripts/record-proportionality-benchmark.js`
  - `create-agdf/scripts/proportionality-benchmark-test.js`
  - `evals/proportionality/**`
- owned_dirty_control_paths: Child artefact/run directories, Master Backlog and Parent coordination
  artefacts only.
- foreign_overlap: `none`
- protected_r3_file_count: `217`

## Protected Core Hashes Before Implementation

| Path | SHA-256 |
|---|---|
| `evals/proportionality/staged-manifest.json` | `d440c04c133a45fcaf407bc77928774b932c9e8d7e7edf69d6b8ac00742ec489` |
| `evals/proportionality/staged-scenarios.json` | `e98219d62631242c442ec90e195e6bed741254e7689b6a388c82dca37ea45c2f` |
| `evals/proportionality/fixtures/staged-catalog.json` | `1d12e1f2094c7bfdfbab40ef5c3d0aac20048f93480db0ec9008664361eae43e` |
| `.agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_BASELINE.json` | `51ebe754d79265d4ac0b023fd73a71a79a96a4b7a04551b67e391a8e217d077d` |
| `.agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_REPORT.json` | `719ace92ab71f7211d5cdf9bf8c869d9b2ce5dbe6ecba65608d6c6f145182ba3` |
| `.agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_REPORT.md` | `6d0c3a736e462f827f923d9ae31288fe3948954ce59345ba86ffb5f28cded984` |

## Implementation Guardrails

- Recheck scoped status before every broad edit or mechanical refactor.
- Generate the history inventory deterministically from explicit protected roots; review its path set
  before relying on hashes.
- Establish v1/v2 compatibility tests before switching consumers to the registry.
- Build v3 visible data and hidden baseline as separate writes and test leakage before prompt work.
- Use only mocked/in-memory recorder execution; no external model or host call.
- Do not update this analysis to hide a discovered blocker; stop and route it visibly.
