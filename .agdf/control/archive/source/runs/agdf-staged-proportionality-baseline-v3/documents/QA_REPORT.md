# QA Report: Staged Proportionality Baseline v3

Status: `pass`
Gate: QA
Gate approval: `approved`
Approval evidence: exact `Approval: QA` on 2026-08-19 after revalidation of run, QA gate,
revision 9 (`1cc4d778-4dd6-4db7-91d3-508c22f4e221`) and the durable passing QA report.
Decision: `pass`
Date: 2026-08-19
Run: `agdf-staged-proportionality-baseline-v3`
Based on: approved TP Revision 1, Brownfield Analysis, CD+Tests, Task Plan Review, Clean
Implementation Review and Code Review

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | pass | 23/23 pre-QA tasks fully done, seven UX fidelity rows fulfilled; this QA report executes gate-owned T24 |
| Solution integrity | pass | one frozen profile owner and one existing execution pipeline; no fallback-heavy or parallel structure |
| Code quality | pass | five review findings resolved; no open correctness, regression, security, data-integrity or maintainability finding |
| QA decision | pass | `qa-gate` is the sole decision owner; approved behavior, protected history and deterministic evidence are complete |

Decisive reason: the approved v3 contract is traceable from requirements through one primary
implementation path, all applicable UX and TP obligations have direct deterministic evidence, every
review finding is resolved, and the 225-file historical boundary remains complete and byte-identical.

## QA Gate

- decision: `pass`
- evidence:
  - approved UR, PRD, SD and TP Revision 1 plus both Brownfield steps;
  - 40 v3 cases, 72 staged scenarios, all six delivery paths and retained adversarial coverage;
  - exactly five complete bounded-change eligibility groups for PB-016, PB-017 and PB-020;
  - `depth_policy_version: 1`, all six Full-Depth triggers, all seven bounded checks and one explicit
    semantic eval target per trigger family;
  - schema/protocol/profile v3, explicit adapter/runner/report versions and named mismatch dimensions;
  - 216/216 temporary synthetic observations evaluated and rendered deterministically twice;
  - missing, false, conflicting, mixed, duplicate, stale, ambiguous, critical-under, stage-deviation,
    threshold, leakage, mutation, redaction, path/symlink and history-drift negatives;
  - safe attempt records expose retryability and remaining budget; only generator timeout retries;
  - 225 protected staged-v2/r3 files are present, inventory-complete and hash-matching;
  - focused proportionality suite, complete `create-agdf` smoke, 58/58 skill evals, control-state,
    source/generated Runtime Integrity and `git diff --check` pass;
  - Task Plan Review `pass_for_qa`, Clean Review `pass`, Code Review `pass`; no open or invalid
    normalized finding.
- missing_evidence: authenticated staged-v3 live-host execution was not performed.
- risks:
  - deterministic repository replay proves the implementation and corpus contract, not authenticated
    model adherence on a live host;
  - a future live series remains separately authorized, cost-bearing and provenance-sensitive;
  - any change to fingerprint sources will correctly make affected future observations stale.
- required_next_step: Review this passing QA decision and provide exact `Approval: QA` if accepted.
- impact_codes: `none`

The missing live evidence is an explicit non-claim and not an approved repository QA acceptance
criterion. No QA conclusion depends on it. No live call, persisted v3 series, VCS action, release,
publish, deployment or reinstall was performed.

## UX Intent Fidelity

All seven approved UX criteria are `fulfilled`: explicit selection, historical compatibility,
dimension-specific blocking, deterministic evidence-labeled reporting, fact-gap recovery, bounded
retry visibility and terminal safety behavior each have direct CLI/output or deterministic recorder
evidence.

## TP Completion At QA

SPB3-T01 through SPB3-T23 were fully done before QA. This report performs SPB3-T24, so the approved
TP is now 24/24 complete at the QA decision boundary.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: v3 is version-specific benchmark evidence linked to the existing routing
  and ceremony owners; it creates no new policy or reusable authority node.

## Gate Approval

Exact QA approval was accepted and persisted on 2026-08-19. The next user gate is UAT; release and
automatic VCS actions remain forbidden until the remaining gate and closeout requirements are met.
