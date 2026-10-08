# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-control-cockpit-20261005-01
- lifecycle: completed
- revision: 21
- revision_id: 326a36d9-4589-4d7d-b654-60ecba54ebab
- content_seal: sha256:5396c6ece539da71192ad9c25a55bcf2c49c82d4cb349f782c0e4ccdfdfda7c0
- approval_seal: sha256:4f88d68682fa34aa305bb43b84600032dc0758314da4c7531d0440c584e58e56
- updated_at: 2026-10-05T19:31:47.523Z
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Provide a local read-only control cockpit with run overview, authoritative Core evaluation and registered source documents for the explicitly selected repository.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Accepted local browser delivery completed; OR records QA/UAT, evidence and scope limits. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP, Approval: QA, Approval: UAT |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Produce delivery closeout or requested handoff; do not perform VCS actions automatically. |
| What is explicitly forbidden right now? | commit, push, open PR or release automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-05 · revision 4 · `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md` sha256:b90a6fe3005cf0ba · presentation d116a103-3065-48c8-830d-42622b48dd51 sha256:e3e201dce5206cc97910f3ed57897a219d3c0761199b22c707fde40b05d86de8 |
| PRD | approved | `Approval: PRD` · 2026-10-05 · revision 8 · `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/PRD.md` sha256:1422e790d7638f4a · presentation ef74a48d-79b3-477e-8dd1-7772a9125b55 sha256:631e8e83388c97cf20b5277bc76dbd8c3dcf6decd791054b6f96529abef6eb86 |
| SD | approved | `Approval: SD` · 2026-10-05 · revision 10 · `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/SD.md` sha256:e612ec852d267e11 · presentation 23c6997b-701d-4ab1-850a-19a8b2aa0a88 sha256:ac5b11d9a16ac662fb8b8416a011b690903575891aa8fb513d09e2435554dd30 |
| TP | approved | `Approval: TP` · 2026-10-05 · revision 12 · `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP.md` sha256:a796f192780d1ad7 · presentation 372a8b3c-a7b5-4897-a9bd-108754cadd64 sha256:3f9c70d4dbbef69a3262155a3d7d960bc95fa9e87166490c8239c0c5d241333a |
| QA | approved | `Approval: QA` · 2026-10-05 · revision 18 · `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/QA_REPORT.md` sha256:576b4c9fefc660a7 · presentation ea5d66f6-ac83-476c-af6e-acb20f2f6b35 sha256:233564190bc9fde0cdc4f5a41afe7fc0b2bc4837526be785fdbd1e933180837e |
| UAT | approved | `Approval: UAT` · 2026-10-05 · revision 19 · presentation 090588e6-02ce-4dcb-8661-bf29251b1d82 sha256:734e3a93098f4ed34719b8d21e6b531d16f2a1ff9b1fb71c23a59b01134dde0a |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/BROWNFIELD_ANALYSIS.md | done | pre_implementation_analysis pass; audited Core provider seams |
| CD+Tests | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CD_TESTS.md | done | Approved TP implemented; 26 new tests and ten affected regression suites pass |
| CR | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CR.md | done | Code Review pass; four resolved findings, no open gap |
| QA | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/QA_REPORT.md | pass | Reviewed source binding recorded atomically |
| UX Intent Definition | `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UX_INTENT_DEFINITION.md` | done | Ready analytical PRD input; non-authorizing |
| Binding proof 3f849c4e-fa79-430d-9b92-b95d21825a13 | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/PRD_SOURCE_MAPPING_v1.json | done | Subordinate reviewed mapping evidence |
| Binding proof 69cf6f3c-e969-4136-b9e0-9986055ae9b4 | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/SD_SOURCE_MAPPING_v1.json | done | Subordinate reviewed mapping evidence |
| Binding proof cf192a1e-e496-4fdd-a58a-c2369aa7d47e | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP_SOURCE_MAPPING_v1.json | done | Subordinate reviewed mapping evidence |
| TP Review | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP_REVIEW.md | done | Task Plan Review pass; all ten tasks and eleven UX fidelity rows fulfilled |
| Clean Implementation Review | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CLEAN_IMPLEMENTATION_REVIEW.md | done | Clean Implementation Review pass; single Core authority and private read surface |
| Context Reconciliation | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CONTEXT_RECONCILIATION.md | done | Resolved existing Context Graph and physical ownership documentation |
| Binding proof 757a13ff-b965-4c4f-a76d-3d911224572d | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/QA_SOURCE_MAPPING_v1.json | done | Subordinate reviewed mapping evidence |

| OR | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/OR.md | done | Full closeout; QA/UAT approved, no VCS action or chat embedding |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: new browser-to-local-control trust boundary; structured_slice rejected because authority_boundary and full_depth_impacts_absent fail.
- evidence: .agdf/control/artefacts/agdf-control-cockpit-20261005-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-05 · revision 4 · `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md` sha256:b90a6fe3005cf0ba · presentation d116a103-3065-48c8-830d-42622b48dd51 sha256:e3e201dce5206cc97910f3ed57897a219d3c0761199b22c707fde40b05d86de8 |
| PRD | derived_from | UR | binding 3f849c4e-fa79-430d-9b92-b95d21825a13; reviewed by Codex; .agdf/control/artefacts/agdf-control-cockpit-20261005-01/PRD_SOURCE_MAPPING_v1.json |
| SD | derived_from | PRD | binding 69cf6f3c-e969-4136-b9e0-9986055ae9b4; reviewed by Codex; .agdf/control/artefacts/agdf-control-cockpit-20261005-01/SD_SOURCE_MAPPING_v1.json |
| TP | derived_from | SD | binding cf192a1e-e496-4fdd-a58a-c2369aa7d47e; reviewed by Codex; .agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP_SOURCE_MAPPING_v1.json |
| QA_REPORT | tests | TP | binding 757a13ff-b965-4c4f-a76d-3d911224572d; reviewed by Codex; .agdf/control/artefacts/agdf-control-cockpit-20261005-01/QA_SOURCE_MAPPING_v1.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-control-cockpit-20261005-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/PRD_SOURCE_MAPPING_v1.json | PRD derived_from UR; binding 3f849c4e-fa79-430d-9b92-b95d21825a13; operation 68ec101e-fda0-4074-b442-9eaaeafde047; aae1aec6-bab8-4090-9636-6992172d3d21 -> b3202dc6-7434-40bd-86e4-57fb69ed5fc5 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/SD_SOURCE_MAPPING_v1.json | SD derived_from PRD; binding 69cf6f3c-e969-4136-b9e0-9986055ae9b4; operation e7e527ce-3b2a-4b5b-9093-8425b8d50866; fa7910ab-8b5d-4a62-80f7-ec65f0cf71e3 -> c1df7d1e-a304-4a70-8760-7e1c2c31039d | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP_SOURCE_MAPPING_v1.json | TP derived_from SD; binding cf192a1e-e496-4fdd-a58a-c2369aa7d47e; operation 217f4ef4-0b0f-40c3-8afc-d1bd5d3009b5; 508a3f5c-294f-44ad-b867-128c2982004a -> 7470c77d-d8bc-4cbe-a68a-70d4e879d694 | reviewed cooperative mapping |
| CD+Tests | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CD_TESTS.md | TP tasks, 32 scenario mappings and source/browser/package proof | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CR.md | direct |
| Post-implementation review | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/TP_REVIEW.md; .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CLEAN_IMPLEMENTATION_REVIEW.md; .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CR.md | Plan, solution and code evidence for qa-gate | direct |
| Artefact source binding | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/QA_SOURCE_MAPPING_v1.json | QA_REPORT tests TP; binding 757a13ff-b965-4c4f-a76d-3d911224572d; operation bcc79f23-21a5-4d71-96bd-ac56a21551c1; 5889322c-c586-49b2-af25-cd062bbff51c -> f0cd0278-5c3e-49d9-8e12-bd1b3fc59c7c | reviewed cooperative mapping |

| OR closeout | .agdf/control/artefacts/agdf-control-cockpit-20261005-01/OR.md | Accepted local browser scope; deliberate QA/UAT; context resolved; no VCS | direct |

## Closeout

- next_allowed_action: Produce delivery closeout or requested handoff; do not perform VCS actions automatically.
- quality_outlook: No additional quality follow-up is required within this approved local browser scope.

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 3f849c4e-fa79-430d-9b92-b95d21825a13 | sha256:40483dfea2604a1455c89f34d2d4690e6390338e309163fb9e398fac5d3f29e0 | eyJiaW5kaW5nX2lkIjoiM2Y4NDljNGUtZmE3OS00MzBkLTliOTItYjk1ZDIxODI1YTEzIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjE0MjJlNzkwZDc2MzhmNGFiY2U2ZDk5OTMzZGM1OTcxNDcwM2RjY2EwZmI1MjBlNDFkODkyYzhhOTljZmYxYTAiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6IjY4ZWMxMDFlLWZkYTAtNDA3NC1iNDQyLTllYWFlYWZkZTA0NyIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiYWFlMWFlYzYtYmFiOC00MDkwLTk2MzYtNjk5MjE3MmQzZDIxIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiYjMyMDJkYzYtNzQzNC00MGJkLTg2ZTQtNTdmYjY5ZWQ1ZmM1IiwicmV2aXNpb24iOjh9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJQUkQiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlVSIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6MDliODQyMzRmNTFlZWEyZTE3ODY4YjhiOGJiOGU0ZTgzYjNmMjdkODJhMjYyZTFjNzg5MDk0OGQwMTVmN2ViYSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9hZ2RmLWNvbnRyb2wtY29ja3BpdC0yMDI2MTAwNS0wMS9QUkRfU09VUkNFX01BUFBJTkdfdjEuanNvbiIsInJldmlld2VyIjoiQ29kZXgifSwicnVuX2lkIjoiYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OmI5MGE2ZmUzMDA1Y2YwYmFlYjE1YWM0Njc5OGRmOTAyZjVlNTkwOWExMjU2YjhlNDRkNmVlYzVmZTBmMzUzODgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvVVIubWQiLCJ0eXBlIjoiVVIifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 69cf6f3c-e969-4136-b9e0-9986055ae9b4 | sha256:afcd4f58afefc09681d6547caed6491847edfe8815a28fda472d66459e17772d | eyJiaW5kaW5nX2lkIjoiNjljZjZmM2MtZTk2OS00MTM2LWI5ZTAtOTk4NjA1NWFlOWI0IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmU2MTJlYzg1MmQyNjdlMTE5YTY2MjFkOTM0NTlhMDM2NWJhZmZkNjg0YmRkN2JmOThiMWQ2MDBhNDk3N2NjMTYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJlN2U1MjdjZS0zYjJhLTRiNWItOTA5My04NDI1YjhkNTA4NjYiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImZhNzkxMGFiLThiNWQtNGE2Mi04MGY3LWVjNjVmMGNmNzFlMyIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImMxZGY3ZDFlLWEzMDQtNGE3MC04NzYwLTdlMWMyYzMxMDM5ZCIsInJldmlzaW9uIjoxMH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlNEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJQUkQifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1Njo4Zjg4NDJjYjIxYjhmMWI5YTM3YjllYzVjNjBmOTVjNzYzMWYyZGQzMjAyYmIyZjMyYTUxNjFhNmU0YTlmZmE2IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29udHJvbC1jb2NrcGl0LTIwMjYxMDA1LTAxL1NEX1NPVVJDRV9NQVBQSU5HX3YxLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4In0sInJ1bl9pZCI6ImFnZGYtY29udHJvbC1jb2NrcGl0LTIwMjYxMDA1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjoxNDIyZTc5MGQ3NjM4ZjRhYmNlNmQ5OTkzM2RjNTk3MTQ3MDNkY2NhMGZiNTIwZTQxZDg5MmM4YTk5Y2ZmMWEwIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29udHJvbC1jb2NrcGl0LTIwMjYxMDA1LTAxL1BSRC5tZCIsInR5cGUiOiJQUkQifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| cf192a1e-e496-4fdd-a58a-c2369aa7d47e | sha256:ef04c977b88594b634af09babc901cce99c64c0c8dcef9ecb874acc8c7276afe | eyJiaW5kaW5nX2lkIjoiY2YxOTJhMWUtZTQ5Ni00ZmRkLWE1OGEtYzIzNjlhYTdkNDdlIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmE3OTZmMTkyNzgwZDFhZDc4MzdkZDg2MDcyOGQ5ZGNiZDQyNTRjYTAxYjU3MzQ4N2E4ZTAyNzc3NWUyODJlM2YiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIyMTdmNGVmNC0wYjBmLTQwYzMtOGFmYy1kMWJkNWQzMDA5YjUiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjUwOGEzZjVjLTI5NGYtNDRhZC1iODY3LTEyOGMyOTgyMDA0YSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6Ijc0NzBjNzdkLWQ4YmMtNGNiZS1hNjhhLTcwZDRlODc5ZDY5NCIsInJldmlzaW9uIjoxMn0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlRQIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJTRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmU5YzljZDFlZDlmZjI5MTkyMTE2ZmIzY2M3MjgyYTZkMzM2OGMzYjE4ZmMwMDZkYTU0MGU4ZDMxNzgyYjRiZWMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvVFBfU09VUkNFX01BUFBJTkdfdjEuanNvbiIsInJldmlld2VyIjoiQ29kZXgifSwicnVuX2lkIjoiYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OmU2MTJlYzg1MmQyNjdlMTE5YTY2MjFkOTM0NTlhMDM2NWJhZmZkNjg0YmRkN2JmOThiMWQ2MDBhNDk3N2NjMTYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvU0QubWQiLCJ0eXBlIjoiU0QifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 757a13ff-b965-4c4f-a76d-3d911224572d | sha256:5869ae30cd2afb29e089367754483e7b2cf63eb1e545dc8fd9bad48ccd6c695f | eyJiaW5kaW5nX2lkIjoiNzU3YTEzZmYtYjk2NS00YzRmLWE3NmQtM2Q5MTEyMjQ1NzJkIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjU3NmI0YzlmZWZjNjYwYTc5MGY1ZGFjZjRiMWExYmMwMzM3MWRhMTZkNTkyNGQ4YTVlYmUyMmNjZWMzMmVkMjAiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb250cm9sLWNvY2twaXQtMjAyNjEwMDUtMDEvUUFfUkVQT1JULm1kIiwic3RhdHVzIjoicGFzcyIsInR5cGUiOiJRQV9SRVBPUlQifSwib3BlcmF0aW9uIjp7ImlkIjoiYmNjNzlmMjMtMjFhNS00ZDcxLTk2YmQtYWM1NmEyMTU1MWMxIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI1ODg5MzIyYy1jNTg2LTQ5YjItYWYyNS1jZDA2MmJiZmY1MWMiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJmMGNkMDI3OC01YzNlLTQ5ZDktOGUxMi1iZDFiM2ZjNTljN2MiLCJyZXZpc2lvbiI6MTh9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJRQV9SRVBPUlQiLCJyZWxhdGlvbnNoaXAiOiJ0ZXN0cyIsInRvIjoiVFAifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjozZTc2ZGIyNDAyMTYwMzdmMjAzYjM5NzRiNjM5ODM4MzRhM2E3NGE4MWNkMTJjYTBhYzM3MmNlNTk1MzVhMzk1IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29udHJvbC1jb2NrcGl0LTIwMjYxMDA1LTAxL1FBX1NPVVJDRV9NQVBQSU5HX3YxLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4In0sInJ1bl9pZCI6ImFnZGYtY29udHJvbC1jb2NrcGl0LTIwMjYxMDA1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjphNzk2ZjE5Mjc4MGQxYWQ3ODM3ZGQ4NjA3MjhkOWRjYmQ0MjU0Y2EwMWI1NzM0ODdhOGUwMjc3NzVlMjgyZTNmIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29udHJvbC1jb2NrcGl0LTIwMjYxMDA1LTAxL1RQLm1kIiwidHlwZSI6IlRQIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |

## Memory Persistence

- memory_target: context_graph
- memory_reason: Reusable scoped read and presentation authority boundaries reconciled to existing owner.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/SOT_REGISTRY.md#Physical-Package-Ownership; packages/control-ui/README.md

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/artefacts/agdf-control-cockpit-20261005-01/CONTEXT_RECONCILIATION.md
