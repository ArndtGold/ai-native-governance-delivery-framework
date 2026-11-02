# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-review-remediation-20260929-01
- lifecycle: active
- revision: 18
- revision_id: 5770bb52-5a06-4597-8187-788b9a3b5cad
- content_seal: sha256:5b6db51905f7bad8f2a7dad344d67215c7b650a956084112b344ea735f010ad6
- approval_seal: sha256:88cf8615a6a18b568f5dc829c35f825fba722a8637a9b13db036df09a3460e1d
- mode: structured_delivery
- current_gate: QA
- decision: revise
- owner: agent

## Objective

Recoverably write AGDF control and host state, publish only coherent licensed packages through the coupled release path, and align installed contracts and public evidence with the exact verified version.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Local CD+Tests and Code Review pass; qa-gate decided revise because exact cross-platform and release/host observations remain open. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Exact candidate Linux/Windows CI and release/host observations; QA approval is not requested while QA is revise. |
| What is the next allowed action? | Close the two Task Plan Review evidence obligations, then rerun qa-gate for this run. |
| What is explicitly forbidden right now? | claim QA pass; request QA or UAT approval; release |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UR.md` sha256:8ba0d49f324ecc33 · presentation c349d121-9c55-49ed-a3a6-dd9b3d75aa89 sha256:ef90c0fd94b53f314bfb4c628a6960156326fc4b05e51149fb4913481130d5ca |
| PRD | approved | `Approval: PRD` · 2026-09-29 · revision 6 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/PRD.md` sha256:fe801a520ac58a7c · presentation ff83a27c-d961-4282-82d1-60a922958057 sha256:d04fd0da5d770b95c079cf38dc597cc5f2f41a8ce4e4a5f872201624674734f7 |
| SD | approved | `Approval: SD` · 2026-09-29 · revision 10 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/SD.md` sha256:2e9c147451bce01a · presentation df27983e-1d49-4ef0-ab65-34146a68678e sha256:663bbc1f053b3ef3b3f1ddafe83bddc9f3c5b1ebe36339f69be463017ba52aad |
| TP | approved | `Approval: TP` · 2026-09-29 · revision 12 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TP.md` sha256:d69ba07c544b8be6 · presentation e7f7e85f-ebd5-4102-bddd-70ad6259d13c sha256:8cfa6c81593b62d56289232e196b832ef014721fd3cae85c8f05740ecd92fbaf |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_REVIEW.md` | done |  |
| UX Intent Definition | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UX_INTENT_DEFINITION.md` | ready | High cross-mode impact; PRD input only |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/PRD.md` | approved | criteria-chain-v1; eleven acceptance criteria |
| SD | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/SD.md` | approved | criteria-chain-v1; SDD-001–SDD-011 map AC-001–AC-011 |
| TP | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TP.md` | approved | criteria-chain-v1; T-001–T-013 and SCN-001–SCN-024 |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis pass; existing owners and overlaps reconciled |
| CD+Tests | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/CD_TESTS.md` | done | Final local aggregate smoke and focused suites pass; external CI and release observations open |
| Task Plan Review | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TASK_PLAN_REVIEW.md` | revise | 8/13 tasks fully done, 5/13 partial on external evidence |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/CLEAN_IMPLEMENTATION_REVIEW.md` | done | pass for reviewed local solution structure |
| Local Smoke Log | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/LOCAL_SMOKE.log` | done | Final local aggregate run |
| Baseline C2 | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BASELINE_C2.json` | done | Two-process lost Backlog row on baseline source |
| Baseline C3 | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BASELINE_C3.json` | done | Dead lock owner on baseline source |
| Baseline C7 | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BASELINE_C7.json` | done | Old marketplace recovery of postcommit-like residue |
| CR | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/CODE_REVIEW.md` | done | Code Review pass on actual local diff; recorded by run-step at revision 16 |
| QA | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/QA.md` | revise | qa-gate decision revise; external evidence obligations open |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: architecture_runtime_depth: durable concurrency and recovery, installer ownership and coupled public release require coordinated acceptance; rejected structured_slice because the failures span stores and hosts
- evidence: .agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_REVIEW.md; UX_INTENT_DEFINITION.md; Review v2 C1-C7/B1-B5/P1

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE; CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-REQUEST-ACTIVATION-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Brownfield Analysis, CD+Tests, TP Review, Clean Implementation Review, Code Review and QA report link existing owners; no new node or source of truth.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UR.md` sha256:8ba0d49f324ecc33 · presentation c349d121-9c55-49ed-a3a6-dd9b3d75aa89 sha256:ef90c0fd94b53f314bfb4c628a6960156326fc4b05e51149fb4913481130d5ca |
| PRD | derived_from | UR | Approved UR revision 3 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UR.md` sha256:8ba0d49f324ecc332c2de9a054c62ad3c7676d0c465497b68a7d02164c8592ca · `Approval: UR` presentation c349d121-9c55-49ed-a3a6-dd9b3d75aa89 · Brownfield Review `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_REVIEW.md` structured_delivery · PRD `.agdf/control/artefacts/agdf-review-remediation-20260929-01/PRD.md` sha256:fe801a520ac58a7c8ccc61805e3963237a074d7216246c9d6fcb2f5659848fad · criteria-chain-v1 |
| SD | derived_from | PRD | Approved PRD revision 6 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/PRD.md` sha256:fe801a520ac58a7c8ccc61805e3963237a074d7216246c9d6fcb2f5659848fad · `Approval: PRD` presentation ff83a27c-d961-4282-82d1-60a922958057 · SD `.agdf/control/artefacts/agdf-review-remediation-20260929-01/SD.md` sha256:2e9c147451bce01a2533ccfc7fd47b895ff5f3734d7669f7f51ee3b3e7e7b19b · criteria-chain-v1 |
| TP | derived_from | SD | Approved SD revision 10 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/SD.md` sha256:2e9c147451bce01a2533ccfc7fd47b895ff5f3734d7669f7f51ee3b3e7e7b19b · `Approval: SD` presentation df27983e-1d49-4ef0-ab65-34146a68678e · TP `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TP.md` sha256:d69ba07c544b8be68b8669a7c5a6c8ce2248521f295f73c25a866e1a5f5aea5f · criteria-chain-v1 |
| Brownfield Analysis | derived_from | TP | Approved TP revision 12 · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TP.md` sha256:d69ba07c544b8be68b8669a7c5a6c8ce2248521f295f73c25a866e1a5f5aea5f · `Approval: TP` presentation e7f7e85f-ebd5-4102-bddd-70ad6259d13c · `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_ANALYSIS.md` sha256:9551d61a694af878cae2b48e91be1a3991443b3d330181af064fb06a2201ffc1 |
| CD+Tests | implements | TP | Final local source and `CD_TESTS.md`; full aggregate result in `LOCAL_SMOKE.log`; exact Linux/Windows and registry observations open |
| Task Plan Review | reviews | TP and CD+Tests | `TASK_PLAN_REVIEW.md` decision revise for external evidence obligations |
| Clean Implementation Review | reviews | CD+Tests | `CLEAN_IMPLEMENTATION_REVIEW.md` pass for local solution structure |
| CR | reviews | CD+Tests | `CODE_REVIEW.md` pass recorded by run-step at revision 16 |
| QA | tests | TP | `QA.md` revise; consumes open Task Plan Review evidence obligations R2-TPR-02 and R2-TPR-03 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| UX Intent Definition | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UX_INTENT_DEFINITION.md` | effective-state, recovery and human decision intent | analytical |
| PRD draft | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/PRD.md` | owned workstreams and AC-001–AC-011 | direct |
| SD draft | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/SD.md` | architecture, owners, SDD-001–SDD-011 and exact AC mapping | direct |
| TP draft | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TP.md` | tasks, dependencies, scenarios and evidence for AC-001–AC-011 | direct |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/BROWNFIELD_ANALYSIS.md` | pre_implementation_analysis pass; owners, reuse and overlap boundaries | direct |
| CD+Tests | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/CD_TESTS.md` | implemented T-001–T-013 local scope and bounded external gaps | direct |
| Local aggregate smoke | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/LOCAL_SMOKE.log` | release preparation, focused suites, host scenarios and routing render | direct |
| Task Plan Review | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/TASK_PLAN_REVIEW.md` | TP coverage and normalized external evidence gaps | direct |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/CLEAN_IMPLEMENTATION_REVIEW.md` | primary solution, Brownfield fit and fallback boundaries | direct |
| Code Review | .agdf/control/artefacts/agdf-review-remediation-20260929-01/CODE_REVIEW.md | decision pass: Actual diff reviewed; local control, host, release and projection regressions pass; external CI and registry evidence remains for QA | direct |
| QA report | `.agdf/control/artefacts/agdf-review-remediation-20260929-01/QA.md` | qa-gate revise; exact external evidence obligations | direct |

## Closeout

- next_allowed_action: Obtain exact candidate Linux/Windows CI and release/host observations, then rerun qa-gate.
- quality_outlook: qa-gate revise; local source and smoke pass, but QA pass remains unavailable without exact external evidence.
