# QA Gate

- decision: pass
- run_id: late-source-revision-20261005-01
- decision_owner: qa-gate, sole final Quality Readiness owner
- reviewer: Codex (cooperative QA, same implementing assistant)
- candidate: CANDIDATE_CI_PORTABILITY.json
- candidate_digest: sha256:16268eddabada1e7d2cbc35688cbc3d064bfd009693703d1aea77cbfc215d2b9
- snapshot_commit: d3683dfb21435a68c987b10d851fc9c72a606ca8
- evidence: approved TP.md; BROWNFIELD_ANALYSIS.md; CD_TESTS.md; CODE_REVIEW.md; ARCHITECTURE_REVIEW.md; TASK_PLAN_REVIEW.md; DERIVATION_REVIEW.md; CI_MATRIX_FINAL.json; CI_PORTABILITY_SOURCE_RECONCILIATION.json; CI_PORTABILITY_REVIEW.md; FINAL_SHARED_VERIFICATION.json (parent macOS); GENERATED_OPERATIONAL_FINAL_RECONCILIATION.json; PROTECTED_PATHS_OPERATIONAL_FINAL.json; PERFORMANCE.json; CONTEXT_GRAPH_RECONCILIATION.md
- missing_evidence: none for required TP qualification; optional fresh installed-host/model execution remains unverified
- risks: same author/reviewer assurance; native CI fixtures are not production approval or fresh native-model execution; Windows archive-read counter limitation is explicitly bounded below; zero package reserve
- required_next_step: Prepare the revision-bound QA presentation and obtain deliberate Approval: QA
- impact_codes: no additional run-specific registry codes declared

## Quality Readiness

| dimension | evidence owner | outcome |
|---|---|---|
| Plan coverage | task-plan-review | pass: 10/10 tasks fully_done; eleven acceptance criteria, eight design decisions and 29 scenarios assessed |
| Solution integrity | clean-implementation-review | pass: existing Core lifecycle, locks, journals and subordinate immutable proofs remain owners; Brownfield fit and Context Graph reconciliation resolved |
| Code quality | code-review | pass: actual 56-path capability diff plus one bounded archive consumer correction reviewed; CR-001/002/003 resolved |
| QA decision | qa-gate (sole decision owner) | pass: required exact candidate platform evidence completed; no applicable open normalized finding |

The exact new commit completed all 20 unchanged repository stages on Ubuntu Node22.23.3,
all 15 unchanged runtime stages on Windows Node22.23.3 and all 15 unchanged runtime stages on
Ubuntu Node24.21.0. CI_MATRIX_FINAL.json records native logs, hashes, job identities, stages and
actual cold/warm MCP observations; unchanged 1500/1000-ms p95 budgets pass on every platform.
Actual package archives, CLI/bootstrap, stdio MCP, source renewal, faults, recovery, contention,
localized output, compatibility and required repository checks passed. The native Windows job
completed in 32m1s; the whole GitHub run is success. First failed Windows attempt and both parent
Linux results are preserved separately, without transferring success to the changed commit.

CI_PORTABILITY_SOURCE_RECONCILIATION.json proves all 1477 inventoried canonical source hashes
match both the immutable Git tree and current workspace. The new one-line harness comparison
normalizes Windows separators only for the pre-existing build-owned resources/binding.js
exception. All other Core byte assertions and native filesystem reads remain unchanged. Actual
before-fix Windows failure, focused local archive/compatibility checks and complete after-fix
native matrix prove the correction. Parent macOS 20-stage proof is identified as parent evidence;
it is not relabeled as an exact complete macOS rerun of the changed verifier.

All applicable UX Intent Fidelity rows are fulfilled by actual packaged en/de/fr-CA output and
stdio MCP behavior. The TP declares no P0/P1 task labels, so no mandatory obligation is downgraded.
Historical source authority, contained archive proofs, approved UR/PRD/SD/TP bytes and the original
design Run remain unchanged. Exact payload 200 files / 1686414 bytes, zero reserve, and protected
derived bytes remain bound to the deliberate scoped decisions. Separate explicit human decisions
permit publication only of e785c5e and d3683df to the qualification branch; they do not grant QA
approval, a merge, installation, release or fulfillment of the original separate no-growth TP.

Evidence boundary: revision-performance archived-read counting uses a POSIX path substring, so
its Windows unrelated_history_reads diagnostic is not independent zero-read proof. Actual
Linux/macOS instrumentation and review of the shared evaluator establish that invariant. Native
Windows elapsed time, archive file/byte inventory, real process contention and runtime assertions
are actual observed evidence. No unbounded/eager history work or existing MCP budget failure is
observed. Raw historical Run snapshots grow; no additional history SLA or linear total size is claimed.

Positive fixture approvals are synthetic and instruction replay is deterministic fixture evidence.
This pass is the cooperative Quality Readiness decision, not deliberate human Approval: QA,
UAT acceptance, an installed-host/model observation or release authority.

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | CODE_REVIEW.md; actual packaged preview output and full qualification prove intended change/source hashes/approval and analysis impact | Preserve actual packaged preview regression |
| CR-002 | implementation_gap | CD+Tests | resolved | CODE_REVIEW.md; actual en/de/fr-CA output and unchanged strict localization scanner/full plans | Preserve unchanged localization enforcement |
| CR-003 | implementation_gap | CD+Tests | resolved | CI_PORTABILITY_REVIEW.md; actual Windows before-fix failure and complete after-fix matrix in CI_MATRIX_FINAL.json | Preserve actual archive-consumer check in future CI runs |
| TPR-001 | evidence_gap | evidence_obligation | resolved | TASK_PLAN_REVIEW.md; CI_MATRIX_FINAL.json proves all three required exact lanes; source reconciliation matches 1477 hashes | Consume completed platform evidence in this QA reassessment |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: CONTEXT_GRAPH_RECONCILIATION.md; existing late_source_revision_extension_2026_10_05
- memory_target: context_graph
- memory_reason: Reusable source-revision proof/recovery invariant, completed platform observations and bounded diagnostic limits
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
