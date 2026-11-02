# Verified Change: Windows-portable Release-Bump Symlink Fixture

- schema_version: 1
- status: executed
- related_ur: `.agdf/control/artefacts/windows-release-bump-symlink-fixture/UR.md`
- escalation_target: structured_slice
- canonical_owner: `create-agdf/scripts/release-bump-test.js`
- allowed_source_paths: `create-agdf/scripts/release-bump-test.js`
- allowed_derived_paths: none
- prohibited_impacts: none
- propagation_command: none
- validation_commands: `node create-agdf/scripts/release-bump-test.js`; `npm --prefix create-agdf run release:prepare`
- baseline_commit: `2d3df45aa34cb67684f54b29b10062125ecb797e`
- baseline_tracked_paths: `.agdf/control/MASTER_BACKLOG.md`
- baseline_untracked_paths: `.agdf/control/artefacts/windows-release-bump-symlink-fixture/UR.md`, `.agdf/control/runs/windows-release-bump-symlink-fixture/RUN_STATE.md`, `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png`
- execution_changed_paths: .agdf/control/artefacts/windows-release-bump-symlink-fixture/BROWNFIELD_REVIEW.md, .agdf/control/artefacts/windows-release-bump-symlink-fixture/CODE_REVIEW.md, .agdf/control/artefacts/windows-release-bump-symlink-fixture/VERIFIED_CHANGE.md, create-agdf/scripts/release-bump-test.js
- execution_scope_status: pass
- validation_status: pass
- propagation_status: not_applicable
- run_id: `windows-release-bump-symlink-fixture`

## Declared Paths

- owner_evidence: `create-agdf/scripts/release-bump-test.js`
- source_scope_evidence: `create-agdf/scripts/release-bump-test.js`
- derived_scope_evidence: none
- control_scope_evidence: selected run artefacts, run state and master backlog

## Eligibility

| Check | Status | Evidence |
|---|---|---|
| Exactly one canonical owner | pass | One test script owns the failing fixture. |
| Prohibited impacts absent | pass | No gate, permission, security rule, persistence, architecture, API, CLI contract or release behavior changes. |
| Deterministic propagation | pass | No derived path; direct test and complete release preparation validate the source. |
| Clean candidate baseline | pass | HEAD `2d3df45aa34cb67684f54b29b10062125ecb797e`; source digest `a50283076c8925fc10445437dd863e74cc7709eb`; candidate path absent from baseline dirty set. |
| Escalation target | pass | Escalate to `structured_slice` if scope leaves the single fixture or changes production semantics. |

## Baseline Worktree

- tracked_baseline_evidence: `.agdf/control/MASTER_BACKLOG.md`
- untracked_control_evidence: `.agdf/control/artefacts/windows-release-bump-symlink-fixture/UR.md`; `.agdf/control/runs/windows-release-bump-symlink-fixture/RUN_STATE.md`
- unrelated_untracked_evidence: `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png`
- candidate_path_dirty: `false`

## Planned Change

Add a local symlink-capability probe equivalent to the existing public-plugin fixture guard. Execute
the recovery symlink assertion unchanged when creation is available. On `EPERM`, skip only this
fixture and emit an explicit diagnostic. Rethrow every other error.

## Validation

- `node create-agdf/scripts/release-bump-test.js`
- `npm --prefix create-agdf run release:prepare`
- Native Windows: `npm run install:copilot`

## Execution

- changed_path_snapshot_evidence: The exact post-baseline set contains the three run-local control artefacts listed above and the one declared source path; no derived or unrelated path was introduced.
- implementation_evidence: `symlinkCreationAvailable()` skips only the symlink recovery fixture after `EPERM`, rethrows every other error and preserves the existing assertion when symlink creation succeeds.
- focused_validation_evidence: `node create-agdf/scripts/release-bump-test.js` passed with all recovery assertions on the symlink-capable development host.
- aggregate_validation_evidence: `npm --prefix create-agdf run release:prepare` passed distribution history, release bump, version coherence and public plugin tests.
- diff_validation_evidence: `git diff --check` passed; release asset synchronization introduced no generated-file drift.
- code_review: `pass`; `.agdf/control/artefacts/windows-release-bump-symlink-fixture/CODE_REVIEW.md`
- native_windows_status: `pass_user_attested`; the user reported successful Copilot installation on the previously failing Windows environment after the change.
- post_install_observation: `/agdf-gate-check` remained in Copilot reasoning for more than two minutes without visible response; this is a separate host-dispatch or execution-latency finding and not evidence against installer completion.
- mini_closeout: Source implementation, local validation, mandatory Code Review and user-attested native-Windows installation pass. The symlink fixture no longer blocks the install chain. The separate slow gate-check observation is intentionally not absorbed into this fix. No VCS or release action was performed.
