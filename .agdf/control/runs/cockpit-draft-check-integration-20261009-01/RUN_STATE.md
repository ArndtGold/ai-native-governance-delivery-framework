# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cockpit-draft-check-integration-20261009-01
- lifecycle: completed
- revision: 28
- revision_id: af3a4ef5-ef64-4572-8245-3ffc2818c405
- content_seal: sha256:30b75ec05b7748d4cdab7bec0b64ae6629e59b93509ac865710cfef97c20e24f
- approval_seal: sha256:adb8d008ee42456c3187a6673c5e7cfc9d33df4b1d4eb431ad0b12a9f798698a
- updated_at: 2026-10-09T20:40:16.668Z
- mode: structured_delivery
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Let users deliberately check the selected current draft in the Cockpit, understand actual authoring corrections and distinguish the result from documented approval, current gate permission and QA.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA pass and deliberate QA/UAT approvals recorded; OR completed. NATIVE-001 resolved with exact-build native evidence. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP, Approval: QA, Approval: UAT |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Produce delivery closeout or requested handoff; do not perform VCS actions automatically. |
| What is explicitly forbidden right now? | commit, push, open PR or release automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-09 · revision 2 · `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UR.md` sha256:1f56550a0bd1c5f2 · presentation 5f9072c5-0727-440b-843b-ebc98034282a sha256:307f850eb5c40f2ff3b488d97d155b3a4e6c6408063eaffde7224e146ce76939 |
| PRD | approved | `Approval: PRD` · 2026-10-09 · revision 7 · `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/PRD.md` sha256:18f516c1665b0e19 · presentation fd6138cc-0d58-4456-9441-5b04ddec0198 sha256:fdf942cfc2dd80cdc872c1feed8a5c2e64bbcc2b2d6b3604494235e05880d393 |
| SD | approved | `Approval: SD` · 2026-10-09 · revision 9 · `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/SD.md` sha256:24ff2e1b912b988f · presentation 19bed4d5-3d49-41ad-a1d4-dd2e30e51d99 sha256:4fc671a5ce323edc7656dadf0e3318f9a6e3c544fdca05bad782af30e70c6309 |
| TP | approved | `Approval: TP` · 2026-10-09 · revision 11 · `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP.md` sha256:541fef03c6192ee7 · presentation 0df2f5bf-f1b5-4aca-981d-c2c97588fa05 sha256:e8b8be0630186a7045a694e50cadde1a59af73dcffeb6b774401bea618e9182f |
| QA | approved | `Approval: QA` · 2026-10-09 · revision 24 · `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_REPORT.md` sha256:d686e60feccc2993 · presentation ca3ce680-bcaa-421b-a76b-c34f4253886c sha256:cbd5a7c36ad19630a19814cb5947c1e0a7e3a7ea731e2417dd4666711426c7e6 |
| UAT | approved | `Approval: UAT` · 2026-10-09 · revision 25 · presentation 2d601326-b41c-4c23-bae4-9a5acd8fcd20 sha256:5c2dec48e74885298cb9ae4c3bc2931ebead7d9fe2aefa155d6b0384896085cd |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UR.md` | approved |  |
| UX Intent Definition | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UX_INTENT_DEFINITION.md` | done | Internal analytical input; no approval authority |
| Brownfield Review | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation analysis pass; protected baseline and reuse owners verified |
| CD+Tests | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/CD_TESTS.md` | done | Implementation, automated and approved native evidence complete |
| CR | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/CODE_REVIEW.md` | done | Code Review pass; original 26-path scope unchanged |
| QA | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_REPORT.md | pass | Reviewed source binding recorded atomically |
| Task Plan Review | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TASK_PLAN_REVIEW.md` | done | Review pass; all seven tasks and UX criteria fulfilled |
| Clean Implementation Review | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Structural review pass; native evidence completed within approved scope |
| Binding proof a46d0462-4a36-49d0-bb4c-7bdbfd253425 | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/PRD_MAPPING_73356326-400e-4e1c-9616-c41b15813ad8.json | done | Subordinate reviewed mapping evidence |
| Binding proof aea95c47-f23d-4aff-b102-cf1eb895b234 | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/SD_MAPPING_26c3ddb2-ca94-4609-8739-fe81a566ff93.json | done | Subordinate reviewed mapping evidence |
| Binding proof 5a001be1-4ca0-4b4d-bf18-873bed11a3d1 | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP_MAPPING_a530242d-b3e0-49f4-a942-dd356c2d42ea.json | done | Subordinate reviewed mapping evidence |
| Binding proof 84a9b627-5fd5-4c43-8789-8406c8814eae | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_MAPPING_a6fc130b-9d7d-4310-919a-5135e91a47d0.json | done | Subordinate reviewed mapping evidence |
| Binding proof ce13c452-4006-4668-8fa7-f33dd06da5b2 | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_MAPPING_4071bda0-3db1-40fa-83a4-928b1cb171e2.json | done | Subordinate reviewed mapping evidence |
| OR | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/OR.md` | done | OR-full; QA and UAT approved; no VCS action |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: Add a bounded MCP App draft-check operation and validated result; preserve selected-session and source freshness. Reject structured_slice due to the evidenced integration-contract effect and reject compact paths due to the new capability.
- evidence: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-09 · revision 2 · `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UR.md` sha256:1f56550a0bd1c5f2 · presentation 5f9072c5-0727-440b-843b-ebc98034282a sha256:307f850eb5c40f2ff3b488d97d155b3a4e6c6408063eaffde7224e146ce76939 |
| PRD | derived_from | UR | binding a46d0462-4a36-49d0-bb4c-7bdbfd253425; reviewed by Codex (PRD derivation review); .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/PRD_MAPPING_73356326-400e-4e1c-9616-c41b15813ad8.json |
| SD | derived_from | PRD | binding aea95c47-f23d-4aff-b102-cf1eb895b234; reviewed by Codex (SD derivation review); .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/SD_MAPPING_26c3ddb2-ca94-4609-8739-fe81a566ff93.json |
| TP | derived_from | SD | binding 5a001be1-4ca0-4b4d-bf18-873bed11a3d1; reviewed by Codex (TP derivation review); .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP_MAPPING_a530242d-b3e0-49f4-a942-dd356c2d42ea.json |
| QA_REPORT | tests | TP | binding ce13c452-4006-4668-8fa7-f33dd06da5b2; reviewed by Codex (QA evidence and TP-source review); .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_MAPPING_4071bda0-3db1-40fa-83a4-928b1cb171e2.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/PRD_MAPPING_73356326-400e-4e1c-9616-c41b15813ad8.json | PRD derived_from UR; binding a46d0462-4a36-49d0-bb4c-7bdbfd253425; operation f15b4903-76e2-4c18-b086-2b14c7a2d841; 64979eff-e77e-41fd-9c73-6cd06af839ff -> 114c46d4-1f0c-4c1a-a85e-9a4737c8f96e | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/SD_MAPPING_26c3ddb2-ca94-4609-8739-fe81a566ff93.json | SD derived_from PRD; binding aea95c47-f23d-4aff-b102-cf1eb895b234; operation 870b19ec-7502-493b-92f7-4a021a9d84bf; c4a9e624-0a76-4b1d-a82e-e63f61d6cde3 -> a3f02b78-25f2-46ef-aaa9-8f69d58ffc5e | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP_MAPPING_a530242d-b3e0-49f4-a942-dd356c2d42ea.json | TP derived_from SD; binding 5a001be1-4ca0-4b4d-bf18-873bed11a3d1; operation 7ea852ca-4170-48f5-9d35-a9035d8bf767; b46cbe9d-a51a-4ebf-895d-1433faa141e5 -> 67ebc3fe-2766-4328-a0f6-a3066843273c | reviewed cooperative mapping |
| Code Review | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/CODE_REVIEW.md | decision pass: Actual 26-file incremental diff reviewed; no remaining code defect. Fresh native host proof remains open as NATIVE-001. | direct |
| Artefact source binding | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_MAPPING_a6fc130b-9d7d-4310-919a-5135e91a47d0.json | QA_REPORT tests TP; binding 84a9b627-5fd5-4c43-8789-8406c8814eae; operation 751f196d-2733-4ee7-af20-873181ee47c9; 603b6c2f-931f-4fe4-bf49-b2502cc39fd0 -> a3b4e65d-0f4b-4543-9514-5ccf650cf2bd | reviewed cooperative mapping |
| User-authorized separate local MCP connection configured and recognized enabled; exact parsed-config stdio startup, tool discovery, UI digest and bound actual Core authoring result passed. Fresh native host tools remain unavailable until reload; NATIVE-001 stays open. | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/evidence/NATIVE_ACTIVATION.json | TP T-006 access prerequisite; NATIVE-001 remains unfulfilled | direct |
| Fresh native Codex MCP App reached after restart; actual unchecked/checking/pass, original source and Core report, same-revision edit/corrections, restore/reload/explicit recheck, source/document/approval navigation observed. User reported ohne flackern and closed the exact test view; subsequent UI inventory empty. Controlled transient retry, compact/keyboard detail and backend teardown acknowledgement remain open under NATIVE-001; QA remains revise. | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/evidence/NATIVE_HOST_INTERACTION.json | TP T-006 native observation progress; NATIVE-001 partial, not resolved | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/CODE_REVIEW.md | direct |
| NATIVE-001 resolved: exact-build native initialization, original Core busy and explicit retry/pass, same-revision source recovery, attributed compact/expanded user controls, explicit native read close:true and session_expired plus user card closure. All 26 source and 15 protected hashes unchanged; isolated probe startup restored; refreshed owner reviews pass. | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/evidence/NATIVE_FINAL_OBSERVATION.json | TP T-006/T-007; PRD AC-006/007; SCN-018/021; no Approval: QA inferred | direct |
| Artefact source binding | .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/QA_MAPPING_4071bda0-3db1-40fa-83a4-928b1cb171e2.json | QA_REPORT tests TP; binding ce13c452-4006-4668-8fa7-f33dd06da5b2; operation c1b12178-0ee7-4bc6-8f4a-3d1b91dede90; 6250cbe3-e030-4d84-8359-e58d53824247 -> 7898f9ce-ed2e-4ac7-be8d-2d2c51bd0668 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Produce delivery closeout or requested handoff; do not perform VCS actions automatically.
- quality_outlook: No additional quality follow-up identified for this approved scope.

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| a46d0462-4a36-49d0-bb4c-7bdbfd253425 | sha256:851f3b10a7d7dcc4041775bf31cb039fa7115176f1ba4ab973445766d5cb42c4 | eyJiaW5kaW5nX2lkIjoiYTQ2ZDA0NjItNGEzNi00OWQwLWJiNGMtN2JkYmZkMjUzNDI1IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjE4ZjUxNmMxNjY1YjBlMTllNGRlNDg3MzdjY2RiYzc3MGQxOGNkOGNkNDliNWQxYmRhNTMzY2U0NjFhNzQ0MTgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9QUkQubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJQUkQifSwib3BlcmF0aW9uIjp7ImlkIjoiZjE1YjQ5MDMtNzZlMi00YzE4LWIwODYtMmIxNGM3YTJkODQxIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI2NDk3OWVmZi1lNzdlLTQxZmQtOWM3My02Y2QwNmFmODM5ZmYiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiIxMTRjNDZkNC0xZjBjLTRjMWEtYTg1ZS05YTQ3MzdjOGY5NmUiLCJyZXZpc2lvbiI6N30sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlBSRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiVVIifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjplN2UzYjA2MWQ4ZDBmOWRmYzllMWUyMzgxNTVhYjBhYzNkNzBmOWNiYTI5YjAxNzY4MTZiNmNjNzUyN2Q3Njk5IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2NvY2twaXQtZHJhZnQtY2hlY2staW50ZWdyYXRpb24tMjAyNjEwMDktMDEvUFJEX01BUFBJTkdfNzMzNTYzMjYtNDAwZS00ZTFjLTk2MTYtYzQxYjE1ODEzYWQ4Lmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChQUkQgZGVyaXZhdGlvbiByZXZpZXcpIn0sInJ1bl9pZCI6ImNvY2twaXQtZHJhZnQtY2hlY2staW50ZWdyYXRpb24tMjAyNjEwMDktMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjFmNTY1NTBhMGJkMWM1ZjJhMGI3Y2UwMjg4MTM0MWZkZDViNTE0NzQ0MGYzZmZkZjE5NTQwNzZkYTBlYTA1OGEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| aea95c47-f23d-4aff-b102-cf1eb895b234 | sha256:ecaf6aebb6144d51f2e28e20327a619d9bd68a4af32b5d944122280e0de5617d | eyJiaW5kaW5nX2lkIjoiYWVhOTVjNDctZjIzZC00YWZmLWIxMDItY2YxZWI4OTViMjM0IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjI0ZmYyZTFiOTEyYjk4OGZkMWE4YzNmNzI0MzRiYjY3ZDc0ZWYyNTg4ZTExZjI0OTkyZmViMzAxNmRhZGM3MmMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9TRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlNEIn0sIm9wZXJhdGlvbiI6eyJpZCI6Ijg3MGIxOWVjLTc1MDItNDkzYi05MmY3LTRhMDIxYTlkODRiZiIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiYzRhOWU2MjQtMGE3Ni00YjFkLWE4MmUtZTYzZjYxZDZjZGUzIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiYTNmMDJiNzgtMjVmMi00NmVmLWFhYTktOGY2OWQ1OGZmYzVlIiwicmV2aXNpb24iOjl9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJTRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiUFJEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6NmEyMjAzMTY1MDM3NTM5MWZlYWFjZmU2NDA4MmI1ODE5MjYzMjlkZTZkZjFlMGRlYTZhMTIxZWM5NjM2YjIyNiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWRyYWZ0LWNoZWNrLWludGVncmF0aW9uLTIwMjYxMDA5LTAxL1NEX01BUFBJTkdfMjZjM2RkYjItY2E5NC00NjA5LTg3MzktZmU4MWE1NjZmZjkzLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChTRCBkZXJpdmF0aW9uIHJldmlldykifSwicnVuX2lkIjoiY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6MThmNTE2YzE2NjViMGUxOWU0ZGU0ODczN2NjZGJjNzcwZDE4Y2Q4Y2Q0OWI1ZDFiZGE1MzNjZTQ2MWE3NDQxOCIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWRyYWZ0LWNoZWNrLWludGVncmF0aW9uLTIwMjYxMDA5LTAxL1BSRC5tZCIsInR5cGUiOiJQUkQifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 5a001be1-4ca0-4b4d-bf18-873bed11a3d1 | sha256:727d8de4b40a2ee895cdd490a99fb898d7a6745a7513b3e768c1f3e1b30b30ad | eyJiaW5kaW5nX2lkIjoiNWEwMDFiZTEtNGNhMC00YjRkLWJmMTgtODczYmVkMTFhM2QxIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjU0MWZlZjAzYzYxOTJlZTdhNTY3Y2UyYjkwNjdhN2ExZmVlYjU0MGY3YjgzY2ZlNzQwNjk5ODhhZGFlOWE0NGIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9UUC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlRQIn0sIm9wZXJhdGlvbiI6eyJpZCI6IjdlYTg1MmNhLTQxNzAtNDhmNS05ZDM1LWE5MDM1ZDhiZjc2NyIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiYjQ2Y2JlOWQtYTUxYS00ZWJmLTg5NWQtMTQzM2ZhYTE0MWU1IiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiNjdlYmMzZmUtMjc2Ni00MzI4LWEwZjYtYTMwNjY4NDMyNzNjIiwicmV2aXNpb24iOjExfSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiVFAiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlNEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6Nzg0YmU4MDZlMDYxZWI1YTA4OGFlNWI1NWIyMzRjMTg4MzljZWI5ZTEwYWZjNjk0MmY5YzVjMTY3NmU2MmIyMyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWRyYWZ0LWNoZWNrLWludGVncmF0aW9uLTIwMjYxMDA5LTAxL1RQX01BUFBJTkdfYTUzMDI0MmQtYjNlMC00OWY0LWE5NDItZGQzNTZjMmQ0MmVhLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChUUCBkZXJpdmF0aW9uIHJldmlldykifSwicnVuX2lkIjoiY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6MjRmZjJlMWI5MTJiOTg4ZmQxYThjM2Y3MjQzNGJiNjdkNzRlZjI1ODhlMTFmMjQ5OTJmZWIzMDE2ZGFkYzcyYyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWRyYWZ0LWNoZWNrLWludGVncmF0aW9uLTIwMjYxMDA5LTAxL1NELm1kIiwidHlwZSI6IlNEIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| 84a9b627-5fd5-4c43-8789-8406c8814eae | sha256:28f8627a61b92a466cba8cd744a8c20a56286526dbb6e85f773512539dcd2bf5 | eyJiaW5kaW5nX2lkIjoiODRhOWI2MjctNWZkNS00YzQzLTg3ODktODQwNmM4ODE0ZWFlIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2Ojg3ZDlmOGFhYjdiOTgwZTBkNDE5NmFhOGQ4MTY3OTFmOTBkMjYzM2M5ODY5ZmZkYWY1MWM0NGJiMmMzNTE0ZDQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9RQV9SRVBPUlQubWQiLCJzdGF0dXMiOiJyZXZpc2UiLCJ0eXBlIjoiUUFfUkVQT1JUIn0sIm9wZXJhdGlvbiI6eyJpZCI6Ijc1MWYxOTZkLTI3MzMtNGVlNy1hZjIwLTg3MzE4MWVlNDdjOSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiNjAzYjZjMmYtOTMxZi00ZmU0LWJmNDktYjI1MDJjYzM5ZmQwIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiYTNiNGU2NWQtMGY0Yi00NTQzLTk1MTQtNWNjZjY1MGNmMmJkIiwicmV2aXNpb24iOjE3fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUUFfUkVQT1JUIiwicmVsYXRpb25zaGlwIjoidGVzdHMiLCJ0byI6IlRQIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6OWI4MzZjNmI0YWZlYzBjNTg4NjhhMWUwZGNhZGUwOTZjZTgzZDJjMWNkYjU1NDkyOTYyZTlkOThkYjgyMGMwYiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWRyYWZ0LWNoZWNrLWludGVncmF0aW9uLTIwMjYxMDA5LTAxL1FBX01BUFBJTkdfYTZmYzEzMGItOWQ3ZC00MzEwLTkxOWEtNTEzNWU5MWE0N2QwLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChRQSBldmlkZW5jZSBhbmQgVFAtc291cmNlIHJldmlldykifSwicnVuX2lkIjoiY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6NTQxZmVmMDNjNjE5MmVlN2E1NjdjZTJiOTA2N2E3YTFmZWViNTQwZjdiODNjZmU3NDA2OTk4OGFkYWU5YTQ0YiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWRyYWZ0LWNoZWNrLWludGVncmF0aW9uLTIwMjYxMDA5LTAxL1RQLm1kIiwidHlwZSI6IlRQIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| ce13c452-4006-4668-8fa7-f33dd06da5b2 | sha256:08965029e579a69577f5d903ba0020566a4bd4527e4736c9bd0c90e254facc92 | eyJiaW5kaW5nX2lkIjoiY2UxM2M0NTItNDAwNi00NjY4LThmYTctZjMzZGQwNmRhNWIyIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmQ2ODZlNjBmZWNjYzI5OTM2OTM0OTMxNDI4MzBmM2Q5MGI4ZWYzOTJiY2YwYWFjZWQyYjdlOTg1ZDY4NmVjMjMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9RQV9SRVBPUlQubWQiLCJzdGF0dXMiOiJwYXNzIiwidHlwZSI6IlFBX1JFUE9SVCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJjMWIxMjE3OC0wZWU3LTRiYzYtOGY0YS0zZDFiOTFkZWRlOTAiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjYyNTBjYmUzLWUwMzAtNGQ4NC04MzU5LWU1OGQ1MzgyNDI0NyIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6Ijc4OThmOWNlLWVkMmUtNGFjNy1iZThkLTJkMmM1MWJkMDY2OCIsInJldmlzaW9uIjoyNH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlFBX1JFUE9SVCIsInJlbGF0aW9uc2hpcCI6InRlc3RzIiwidG8iOiJUUCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmE1Y2RkYWM4Y2VkM2UzZDFkYzRiOGY2MzY4MDNhYjMwMjhmYWY2NGNmNDU3NWVlY2M1OGZkNDI5ZDU0ODliMWEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9RQV9NQVBQSU5HXzQwNzFiZGEwLTNkYjEtNDBmYS04M2E0LTkyOGIxY2IxNzFlMi5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCAoUUEgZXZpZGVuY2UgYW5kIFRQLXNvdXJjZSByZXZpZXcpIn0sInJ1bl9pZCI6ImNvY2twaXQtZHJhZnQtY2hlY2staW50ZWdyYXRpb24tMjAyNjEwMDktMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjU0MWZlZjAzYzYxOTJlZTdhNTY3Y2UyYjkwNjdhN2ExZmVlYjU0MGY3YjgzY2ZlNzQwNjk5ODhhZGFlOWE0NGIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kcmFmdC1jaGVjay1pbnRlZ3JhdGlvbi0yMDI2MTAwOS0wMS9UUC5tZCIsInR5cGUiOiJUUCJ9LCJzdXBlcnNlZGVzIjoiODRhOWI2MjctNWZkNS00YzQzLTg3ODktODQwNmM4ODE0ZWFlIiwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
