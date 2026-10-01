# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-portable-plugin-package-structure-20261001-01
- lifecycle: active
- revision: 21
- revision_id: d9334b3c-d45a-466b-a79d-6b5fbe408c38
- content_seal: sha256:043eec060c3d7f5ac204c3bb3f862ba0958410febe400172bc49be556db06bc6
- approval_seal: sha256:c58db22380725ec72b46ee12a6d6f2fefd262fd0444e5b7b039a035fea408169
- updated_at: 2026-10-01T12:18:07.080Z
- mode: structured_delivery
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Deliver a portable AGDF plugin with one canonical identity and explicit plugin, control-core, CLI/installation, MCP and build boundaries; preserve supported host profiles and governance authority through a staged migration.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Authorized five-module cleanup and actual package/profile evidence pass; Code/Clean/TP Review pass; qa-gate Revision 2 pass. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Human Approval: QA; no required package evidence remains open. |
| What is the next allowed action? | Review the persisted QA Report Revision 2; bind its presentation before any QA approval question. |
| What is explicitly forbidden right now? | UAT before human QA approval; release; automatic VCS actions; unrelated cleanup beyond the five authorized paths. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-01 · revision 2 · `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/UR.md` sha256:75f03105a573b05d · presentation a589b32d-e03f-44e1-852a-b1ec5606b68a sha256:a58021d6e4fc88548a1bedc6ba5d17e8260b703ce6bac055359833a876c19404 |
| PRD | approved | `Approval: PRD` · 2026-10-01 · revision 7 · `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/PRD.md` sha256:ec307bf5c1d3c221 · presentation 2c999019-3e1a-4b5a-a4ba-6e6b0fdbb6c3 sha256:aa81d982dd01b76d42e96762f678510f318ab07ca13d8f0ed126b72bf01ee2f8 |
| SD | approved | `Approval: SD` · 2026-10-01 · revision 9 · `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/SD.md` sha256:e318695439006d49 · presentation 395691d5-ebc3-403d-aab2-fab945868b0b sha256:b4079b2be779c5437f2e6260fb7c40a883dbc6a7f7e44c6b94f45072b8dac96d |
| TP | approved | `Approval: TP` · 2026-10-01 · revision 11 · `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/TP.md` sha256:05e47d9f6ef5e0af · presentation aac3f3b9-91e3-407e-b03d-d55fa572acfe sha256:5410c3a2222dee4a54d5dd1e957b04b9657cb73d73ee7b4134cb009117ae0aad |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/PRD.md` | approved | criteria-chain-v1; AC-001 through AC-009 |
| SD | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/SD.md` | approved | criteria-chain-v1; SDD-001 through SDD-008 |
| TP | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/TP.md` | approved | criteria-chain-v1; T-001 through T-010; SCN-001 through SCN-021 |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis; pass; baseline/shared-owner evidence captured |
| CD+Tests | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CD_TESTS.md` | done | Revision 2; normal actual package/prepack evidence pass; duplicate cleanup explicitly authorized |
| CR | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CODE_REVIEW.md` | done | Revision 2 pass; canonical cleanup retained and actual pack proof |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CLEAN_IMPLEMENTATION_REVIEW.md` | done | pass; existing owners and bounded host/archive bridges |
| Task Plan Review | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/TASK_PLAN_REVIEW.md` | done | pass; 10/10 tasks; TPR-E001 resolved by actual archive/profile evidence |
| QA | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/QA_REPORT.md` | done | Revision 2 pass; human Approval: QA still missing |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: portable root identity and component discovery change distributed integration contracts; release_cross_host_depth also applies. Reject structured_slice because full_depth_impacts_absent fails for the first format milestone; Quick/Verified routes cannot cover this external contract change.
- evidence: .agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-01 · revision 2 · `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/UR.md` sha256:75f03105a573b05d · presentation a589b32d-e03f-44e1-852a-b1ec5606b68a sha256:a58021d6e4fc88548a1bedc6ba5d17e8260b703ce6bac055359833a876c19404 |
| PRD | derived_from | UR | Approved UR plus completed Brownfield Review; stable criteria AC-001 through AC-009 |
| SD | derived_from | PRD | Approved PRD with AC-001 through AC-009 mapped once; SDD-001 through SDD-008 |
| TP | derived_from | SD | Approved SDD-001 through SDD-008 and AC-001 through AC-009 mapped to tasks and scenarios |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |

| Implementation-preparation Brownfield Analysis | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/BROWNFIELD_ANALYSIS.md`; evidence/BASELINE.md; evidence/OWNER_COORDINATION.md | Approved TP reuse path, exact input hashes, current shared-owner revisions and unrelated dirty payload interference | source inspection; no implementation/package/host result |
| Code Review | .agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CODE_REVIEW.md | decision pass: .agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CODE_REVIEW.md | direct |

| Post-implementation quality evidence | `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CD_TESTS.md`; `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/TASK_PLAN_REVIEW.md`; `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CLEAN_IMPLEMENTATION_REVIEW.md`; `.agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/QA_REPORT.md` | staged migration and refreshed QA pass; TPR-E001 resolved in Revision 2 | direct |

| Authorized duplicate remediation | user “fix it” / “leg los”; evidence/duplicate-remediation/CLEANUP.json; normal pack/archive/profile evidence | five source copies removed, ten derived copies pruned, canonical originals preserved; TPR-E001 resolved | direct |
| Code Review | .agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CODE_REVIEW.md | decision pass: .agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/CODE_REVIEW.md | direct |

## Closeout

- next_allowed_action: Review QA Report Revision 2; prepare its binding before requesting exact Approval: QA.
- quality_outlook: QA pass for approved scope; all 10 tasks fully_done; native lanes explicitly unverified; human QA/UAT approvals missing.
