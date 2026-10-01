# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: restore-unsealed-active-run-records-20260929-01
- lifecycle: active
- revision: 24
- revision_id: bfe1ca8a-e76b-46ed-8280-ddcbcf5013a6
- content_seal: sha256:cadb1b3b0e7a575789cd80db78d606e40db5fdc7cbf40b977343908d21d8a728
- approval_seal: sha256:fa6d6ef6bb179129a809eddc8ba33629595f0bc987bea1f1c3b23b93d89ba178
- mode: structured_delivery
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Code Review and Clean Implementation Review are `pass`; QA decision is `revise` due to three open normalized TP findings. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Resolution of TPR-APPROVAL-SOURCE via SD, transaction fault-injection evidence, Linux/native Windows evidence, then a new QA decision. |
| What is the next allowed action? | Resolve the routed SD design gap and evidence obligations; repeat Task Plan Review and QA. |
| What is explicitly forbidden right now? | request UAT approval; release; claim delivery readiness before QA approval and report evidence |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/UR.md` sha256:8d7b9bfa3d282956 · presentation 3303ae9c-1349-4aed-be7b-4ca238c97738 sha256:40cd3863f137eedcd8543b27797fe8b0d76f06ea214bba5c295ea207bed4617b |
| PRD | approved | `Approval: PRD` · 2026-09-29 · revision 7 · `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/PRD.md` sha256:831707db1e6fe497 · presentation af1aa5b2-a7d0-44a2-8dfa-b44f6d936edb sha256:7c82ea862494052c012963ee9c7f2fb5d5b2a4d983d8f8d6a9e3609b3df7454c |
| SD | approved | `Approval: SD` · 2026-09-29 · revision 11 · `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/SD.md` sha256:e37053ad63732c41 · presentation 9c8380db-15de-40eb-bb1e-0e0d461c7e16 sha256:046ec6b9c6d5f7ec456326a2df03e98c50f34d4eeb6ae72d5b3bf2e227a8d1fd |
| TP | approved | `Approval: TP` · 2026-09-29 · revision 13 · `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/TP.md` sha256:06ea366e554acca8 · presentation 8f5413d9-1556-4b23-b154-a8adf73664a2 sha256:9759a6b1e8c66ba3e7c62d461c52c927a272e5a9c0daf104716d504f94960575 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/PRD.md` | approved | criteria-chain-v1; Approval Decisions included |
| SD | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/SD.md` | approved | criteria-chain-v1; based on approved PRD revision 7 |
| TP | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/TP.md` | approved | criteria-chain-v1; based on approved SD revision 11 |
| Brownfield Analysis | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis; approved TP revision 13 |
| CD+Tests | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/CD_TESTS.md` | done | approved implementation and local test evidence |
| CR | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/CR.md` | done | Code Review pass |
| TP Review | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/TP_REVIEW.md` | revise | positive provenance, fault-injection and cross-platform evidence open |
| Clean Implementation Review | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/CLEAN_IMPLEMENTATION_REVIEW.md` | done | single shared writer and Recovery owner |
| QA | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/QA_REPORT.md` | revise | Sole QA decision owner; open TP findings prevent pass |  |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: sichere Migration muss die Herkunft bestehender Approval-Zeilen klären; persistence_migration_depth: 23 kanonische aktive Runs haben keine gesiegelte Historie und der Writer weist ungesiegelte Änderungen zurück.
- evidence: Brownfield Review: run-seal.js dokumentiert Siegel als Integritätsschutz, nicht als Signatur; run-state-writer.js verweigert unsealed; legacy-migration.js importiert nur AGDF_RUN.md; git log --all --follow fand für keinen der 23 betroffenen Run States eine Version mit beiden Siegelzeilen.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/UR.md` sha256:8d7b9bfa3d282956 · presentation 3303ae9c-1349-4aed-be7b-4ca238c97738 sha256:40cd3863f137eedcd8543b27797fe8b0d76f06ea214bba5c295ea207bed4617b |
| PRD | derived_from | UR | PRD revision 7 · sha256:831707db1e6fe4970a718ce30ae470857207859bfe105eb770e948c255313158 · approved with `Approval: PRD` at revision 7; source UR revision 2 · sha256:8d7b9bfa3d28295609a88a8e90b046a8e3232d551dd2eab7c8a298ad5b392deb |
| SD | derived_from | PRD | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/SD.md`; criteria-chain-v1; based on approved PRD revision 7 · sha256:831707db1e6fe4970a718ce30ae470857207859bfe105eb770e948c255313158 |
| TP | derived_from | SD | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/TP.md`; criteria-chain-v1; based on approved SD revision 11 · sha256:e37053ad63732c416df6e73d8e063b479489b678366e35483bf6b4c29d34cd23 |
| Brownfield Analysis | derived_from | approved TP revision 13 | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/BROWNFIELD_ANALYSIS.md`; pre_implementation_analysis; reuse/owner/regression evidence recorded |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| PRD draft | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/PRD.md` | scope, acceptance criteria and unresolved design decisions | direct |
| Brownfield Analysis | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/BROWNFIELD_ANALYSIS.md` | pre-implementation owners, reuse path, regression risk and evidence gap | direct |
| T-EVIDENCE repository inventory | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/BROWNFIELD_ANALYSIS.md` | 23 selected runs: no local presentation records, no presentation IDs in approval rows, no sealed Git history; current approvals require ordinary re-approval absent independent external proof | direct |
| Recovery inspection, digest-bound preview, conservative approval reset, capability-limited locked writer, journal resume and explicit CLI implemented. Isolated fixtures cover confirmation, stale artifacts, preview tampering, writer boundary, seals, next gate and post-rename resume. The 23 production Run States were not recovered. | npm run test:run-recovery; test:control-state; test:run-lock; test:run-step-transaction; test:run-revision; test:cli-gates; test:lifecycle; test:package-build; test:payload-budget | Approved TP T-INSPECT through T-ISOLATION; isolated fixtures only | direct |
| Post-implementation doctor --all-active reports 86 aggregate findings as before: 23 block, 1 revise and 62 warn. The selected implementation run passes; no recovery was applied to the 23 affected production runs. | node create-agdf/bin/create-agdf.js doctor --all-active --json; 2026-09-29T17:19:23Z | T-VERIFY Doctor before/after observation; finding count is not claimed fixed | direct |
| Code Review | agdf:code-review | decision pass: CR.md reviews the actual recovery, writer and CLI diff; no code finding remains. Linux/native Windows evidence is still open for Task Plan Review. | direct |
| Read-only recovery inventory | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/CD_TESTS.md` | all 23 named runs unsealed; 19 artefact sets resolvable; four block Preview on unresolved artefact paths; no production Run State or Artefact changed | direct |
| Task Plan Review | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/TP_REVIEW.md` | T-APPROVAL, T-JOURNAL and T-VERIFY remain partial with normalized findings | direct |
| QA Gate | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/QA_REPORT.md` | `revise`; consumes all three open normalized findings without reclassification | direct |
| Context Graph reconciliation | `.agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE` | Existing node updated with bounded recovery behavior, evidence and remaining risks | direct |
| Clean Implementation Review | `.agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/CLEAN_IMPLEMENTATION_REVIEW.md` | primary solution reuses shared owners; no parallel writer | direct |

## Closeout

- next_allowed_action: Resolve the SD-routed approval-provenance design gap and the transaction/platform evidence obligations; rerun Task Plan Review and QA. Approval: QA is not available while this report is revise.
- quality_outlook: revise — QA pass is not allowed while normalized findings remain open.
