# Task/Test Plan: Consistent Gate Recovery and Approval Eligibility

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided on 2026-07-16 after same-run, same-gate and revision-12 revalidation
Date: 2026-07-16
Derived from: `.agdf/control/artefacts/gate-check-recovery-command/SD.md`

## 1. Delivery Boundary

Implement only the approved recovery, readiness, capability and orchestration-consistency changes.
Do not redesign host controls, accept decorated approvals, add new public CLI flags or change gate order,
approval persistence, plugin identity or release behavior.

## 2. Tasks

| task_id | Change | Primary owners | Acceptance evidence |
|---|---|---|---|
| GRC-01 | Capture current failing fixtures for ambiguous recovery, illegal `gate-check --all-active`, ready-gate projection and decorated-only Codex transport before changing behavior. | `create-agdf/scripts/control-state-test.js`; `create-agdf/scripts/interaction-presentation-test.js` | Tests reproduce each defect or enforcement gap against the baseline and name the expected corrected result. |
| GRC-02 | Centralize the semantic artefact-ready approval predicate and make transition/status projection consume it without using human labels as authority. | `create-agdf/bin/create-agdf.js` | UR/PRD/SD/TP/QA/UAT ready fixtures report `status: open` and `interaction_kind: gate_approval`; genuine blockers remain blocked. |
| GRC-03 | Separate native eligibility from gate readiness and propagate the existing capability-preflight result without introducing a second evaluator. | `create-agdf/bin/create-agdf.js`; `create-agdf/lib/interaction-presentation.js` only if minimal reason propagation is needed | Decorated-only/report-only capability remains native false without changing ready gate status; exact/separate transport remains eligible. |
| GRC-04 | Make ambiguous-run recovery target-aware and route expected illegal target/option input through the existing concise top-level error boundary. | `create-agdf/bin/create-agdf.js` | `gate-check` never recommends `--all-active`; aggregate targets retain it; illegal `gate-check --all-active` exits non-zero without stack trace. |
| GRC-05 | Make decorated-only adapter prohibition explicit and non-bypassable in canonical Runtime Contract and gate-check instructions, including the current Codex exact-text rule and **eligible** native-attempt wording. | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; canonical plugin definition as capability SoT | No instruction tells the agent to invoke decorated-only `request_user_input`; exact approval and fallback authority remain unchanged. |
| GRC-06 | Extend Runtime Integrity for capability/authorization/instruction parity and synchronize generated surfaces through the existing generator. | `plugin/scripts/check-runtime-integrity.mjs`; generated plugin surfaces | Integrity fails on decorated-only/native-invocation drift, unqualified attempt wording or non-exact approval options; generated assets match canonical sources. |
| GRC-07 | Complete deterministic regression coverage for command recovery, readiness matrices, prevented Codex invocation, eligible native invocation and interaction-scoped retry identity. | `create-agdf/scripts/control-state-test.js`; `create-agdf/scripts/interaction-presentation-test.js`; existing smoke tests if affected | All approved PRD acceptance cases have direct assertions; no skipped or weakened tests. |
| GRC-08 | Reconcile existing Context Graph links and collect final validation evidence without creating a duplicate policy node. | `.agdf/control/CONTEXT_GRAPH.md` only if a missing link is confirmed; run artefacts | Brownfield `open_gap` becomes resolved or is explicitly retained with evidence; focused tests, package smoke, Runtime Integrity, selected doctor and whitespace checks pass. |

## 3. Test Matrix

| Scenario | Expected result | Test owner |
|---|---|---|
| Multiple active runs via `gate-check` | Blocked/clarification; explicit run candidates; only `--run` and `AGDF_RUN_ID` recovery | control-state test |
| Multiple active runs via `doctor --all-active` or `delivery-map --all-active` | Aggregate behavior remains supported | control-state/smoke test |
| Illegal `gate-check --all-active` | Non-zero, concise stderr, no Node stack trace | subprocess test |
| Selected ready UR, PRD, SD, TP, QA, UAT | `open`, `gate_approval`; native eligibility evaluated separately | state-matrix test |
| Missing artefact, stale revision, gate mismatch, ambiguous scope | `blocked`; zero adapter calls | state-matrix test |
| Codex `decorated_label_only` | Native false, `decorated_only`, zero `request_user_input` calls, exact-text fallback | interaction test |
| Exact or separate label/value transport | Exactly one native attempt for the current revalidated interaction | interaction test |
| Fresh revision/request after prior attempt | New eligible identity may attempt once; decorated-only remains ineligible | interaction test |
| Decorated approval response | `invalid`; never persisted | exact-approval test |
| Canonical/generated instruction drift | Runtime Integrity fails | integrity test |

## 4. Execution Order

1. GRC-01 baseline fixtures.
2. GRC-02 and GRC-03 readiness/capability correction.
3. GRC-04 recovery and concise-error correction.
4. GRC-05 canonical instruction correction.
5. GRC-06 generation and integrity enforcement.
6. GRC-07 full focused regression matrix.
7. GRC-08 Context Graph reconciliation and final validation evidence.

## 5. Required Validation

- Focused `control-state-test` and `interaction-presentation-test`.
- `npm --prefix create-agdf run smoke-test`.
- `node plugin/scripts/check-runtime-integrity.mjs`.
- Selected `doctor --run gate-check-recovery-command --json`.
- `git diff --check`.
- Task Plan Review, Clean Implementation Review and Code Review before QA.

If the full smoke aggregate is blocked by an unrelated environment or dirty-worktree condition, record
the exact blocker and run every unaffected focused check; do not weaken assertions or claim full pass.

## 6. Brownfield And Scope Controls

- Reuse current owners; no parallel readiness evaluator, recovery policy or interaction contract.
- Preserve unrelated dirty paths and other active runs.
- Run pre-implementation Brownfield Analysis after TP approval and before editing implementation owners.
- Escalate back to SD if implementation requires a new public schema, host adapter, flag or approval semantic.

## 7. Completion Criteria

All GRC tasks are `fully_done`, every PRD acceptance criterion has direct evidence, Context Graph impact
is reconciled, reviews pass, QA decides `pass`, and UAT records the live user outcome. Commit, push, PR
and release remain separate explicit actions.

## 8. Required Next Step

Run the required pre-implementation Brownfield Analysis. Implementation remains forbidden until that analysis passes.
