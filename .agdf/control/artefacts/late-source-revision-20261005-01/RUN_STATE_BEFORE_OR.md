# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: late-source-revision-20261005-01
- lifecycle: active
- revision: 25
- revision_id: 1e0c6260-f554-4565-9855-9116cc221831
- content_seal: sha256:fa381b76e191a20fd0fc836f025a99f651fa63e3c1832a7ee574403a9a4708ab
- approval_seal: sha256:be6a35ab32406a61a763123cc0c587d294007cc613d66dd320c45f6818f3a757
- updated_at: 2026-10-05T13:15:24.808Z
- mode: structured_delivery
- current_gate: OR
- decision: in_progress
- owner: agent

## Objective

Provide an explicit source-revision path for valid active CD+Tests runs after approved TP, preserving exact historical authority and requiring renewed affected approvals before implementation resumes.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval recorded for UAT; current gate is OR. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP, Approval: QA, Approval: UAT |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Produce delivery closeout or requested handoff; do not perform VCS actions automatically. |
| What is explicitly forbidden right now? | commit, push, open PR or release automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-05 · revision 3 · `.agdf/control/artefacts/late-source-revision-20261005-01/UR.md` sha256:230c7815c41afa06 · presentation 551c6a39-3ce1-4a16-977d-c519ee3b2a09 sha256:25024f741a4651049badcbea668e78455e87efeba83651974cbc3f2afae396a9 |
| PRD | approved | `Approval: PRD` · 2026-10-05 · revision 7 · `.agdf/control/artefacts/late-source-revision-20261005-01/PRD.md` sha256:c0064751db7a8776 · presentation 1428b048-4d16-4518-a49e-740eb88d7e36 sha256:1855eb244ecb60984d88e81184fdb578c39b61e91a921d54eafecb485371c73f |
| SD | approved | `Approval: SD` · 2026-10-05 · revision 9 · `.agdf/control/artefacts/late-source-revision-20261005-01/SD.md` sha256:5e53a78cede87cff · presentation f44851b2-a214-4981-9a28-74554e10e09a sha256:f7fed9c6be1691e704a9d925c196ba99fd1b23fc3662ed75db47ac511a81adb5 |
| TP | approved | `Approval: TP` · 2026-10-05 · revision 11 · `.agdf/control/artefacts/late-source-revision-20261005-01/TP.md` sha256:270a1a12b2e4dd50 · presentation a0bc57ef-4316-4cc3-b4f6-7cee9e0d61a0 sha256:86aa975b8eb3d32577dc1b7918a93ebd1ed35b12a8f5946c83ae00522718d923 |
| QA | approved | `Approval: QA` · 2026-10-05 · revision 23 · `.agdf/control/artefacts/late-source-revision-20261005-01/QA_REPORT.md` sha256:9961291a002b3c72 · presentation 7c16f5fa-1ebf-4431-b2fb-4f0caa259e12 sha256:240a59383a88deb954875d39c533159e3ba98036c06f38904e32dba37070818c |
| UAT | approved | `Approval: UAT` · 2026-10-05 · revision 24 · presentation 5e1c0894-6777-4cc2-8afe-f5f6fad58f32 sha256:9f4fdf7dacbdf77d18511a6aee9c8da28ec6ec0558b86663a1fe88adb4eb30e9 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/late-source-revision-20261005-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/late-source-revision-20261005-01/BROWNFIELD_REVIEW.md` | done |  |
| UX Intent Definition | .agdf/control/artefacts/late-source-revision-20261005-01/UX_INTENT_DEFINITION.md | ready | Analytical PRD input; no approval or implementation authority |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/late-source-revision-20261005-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/late-source-revision-20261005-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/late-source-revision-20261005-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | .agdf/control/artefacts/late-source-revision-20261005-01/BROWNFIELD_ANALYSIS.md | done | Passed implementation preparation for exact approved TP |
| CD+Tests | .agdf/control/artefacts/late-source-revision-20261005-01/CD_TESTS.md | done | Exact d3683df full required native CI matrix passed; parent macOS full plan and bounded correction attributed |
| CR | .agdf/control/artefacts/late-source-revision-20261005-01/CODE_REVIEW.md | done | Cooperative actual Code Review pass |
| QA | .agdf/control/artefacts/late-source-revision-20261005-01/QA_REPORT.md | pass | Reviewed source binding recorded atomically |
| Binding proof c94815fd-6485-457f-998d-ed6f6816a44b | .agdf/control/artefacts/late-source-revision-20261005-01/PRD_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 5e2fb61e-927e-43ef-8c9d-60f685ce8520 | .agdf/control/artefacts/late-source-revision-20261005-01/SD_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof a6cb3e86-9280-41c7-b8d8-fed33c730994 | .agdf/control/artefacts/late-source-revision-20261005-01/TP_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |

| TP Review | .agdf/control/artefacts/late-source-revision-20261005-01/TASK_PLAN_REVIEW.md | done | Fulfillment assessment pass: 10/10 tasks complete; exact required platform evidence resolved |
| Clean Implementation Review | .agdf/control/artefacts/late-source-revision-20261005-01/ARCHITECTURE_REVIEW.md | done | Cooperative solution integrity pass |
| Scope derivation review | .agdf/control/artefacts/late-source-revision-20261005-01/DERIVATION_REVIEW.md | done | Exact capability delta and approved exceptions reviewed |
| Context Graph reconciliation | .agdf/control/artefacts/late-source-revision-20261005-01/CONTEXT_GRAPH_RECONCILIATION.md | done | Existing node updated; reconciliation resolved |
| Binding proof bb58064c-64e9-4e68-bea7-dbdaab1f418c | .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 74d21119-addc-4f3a-988a-75d2c4f832a5 | .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-02.json | done | Subordinate reviewed mapping evidence |
| Binding proof 738f1eb2-2214-4a56-bc24-ac4cf78eb6fa | .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-03.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: late revision changes effective implementation authority and persistent source-proof meaning; structured_slice rejected because authority_boundary and full_depth_impacts_absent fail; Quick/Verified Change ineligible.
- evidence: .agdf/control/artefacts/late-source-revision-20261005-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-05 · revision 3 · `.agdf/control/artefacts/late-source-revision-20261005-01/UR.md` sha256:230c7815c41afa06 · presentation 551c6a39-3ce1-4a16-977d-c519ee3b2a09 sha256:25024f741a4651049badcbea668e78455e87efeba83651974cbc3f2afae396a9 |
| PRD | derived_from | UR | binding c94815fd-6485-457f-998d-ed6f6816a44b; reviewed by Codex (cooperative product derivation review); .agdf/control/artefacts/late-source-revision-20261005-01/PRD_SOURCE_MAPPING-01.json |
| SD | derived_from | PRD | binding 5e2fb61e-927e-43ef-8c9d-60f685ce8520; reviewed by Codex (cooperative architecture derivation review); .agdf/control/artefacts/late-source-revision-20261005-01/SD_SOURCE_MAPPING-01.json |
| TP | derived_from | SD | binding a6cb3e86-9280-41c7-b8d8-fed33c730994; reviewed by Codex (cooperative task and test derivation review); .agdf/control/artefacts/late-source-revision-20261005-01/TP_SOURCE_MAPPING-01.json |
| QA_REPORT | tests | TP | binding 738f1eb2-2214-4a56-bc24-ac4cf78eb6fa; reviewed by Codex (cooperative QA-to-TP derivation review); .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-03.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/late-source-revision-20261005-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/late-source-revision-20261005-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| UX Intent Definition | .agdf/control/artefacts/late-source-revision-20261005-01/UX_INTENT_DEFINITION.md | Ready medium-impact analytical input for PRD; current/history/preview/recovery semantics | cooperative analytical review |
| Artefact source binding | .agdf/control/artefacts/late-source-revision-20261005-01/PRD_SOURCE_MAPPING-01.json | PRD derived_from UR; binding c94815fd-6485-457f-998d-ed6f6816a44b; operation f89519e8-4762-4a53-8cbf-845c5a9379a6; 9203ed33-f5c4-4ede-b943-d7cdd4556e9f -> a265245b-afac-45ca-b005-de92c32be23e | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/late-source-revision-20261005-01/SD_SOURCE_MAPPING-01.json | SD derived_from PRD; binding 5e2fb61e-927e-43ef-8c9d-60f685ce8520; operation 07be26ef-2588-4851-acc5-e2ee1c2cee4a; ea2a3835-4478-4b43-b99d-0e787d600111 -> 2b519e83-3b02-4a7e-ae8b-03db8baa2001 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/late-source-revision-20261005-01/TP_SOURCE_MAPPING-01.json | TP derived_from SD; binding a6cb3e86-9280-41c7-b8d8-fed33c730994; operation 162fb16b-0ba5-4239-91ff-0f2e22f7bd2b; 89be6202-9263-4c52-9739-1d42706eb5da -> 93ea2343-9c1f-458b-a538-25093f2b33be | reviewed cooperative mapping |
| Brownfield implementation preparation | .agdf/control/artefacts/late-source-revision-20261005-01/BROWNFIELD_ANALYSIS.md | Approved TP scope, existing owners, starting bytes and protected work | cooperative source analysis |
| Implementation preparation completed; refreshed canonical next action from existing gate policy | .agdf/control/artefacts/late-source-revision-20261005-01/BROWNFIELD_ANALYSIS.md | Approved TP execution continuation; no approval changes | direct |
| Current implementation and bounded Core/CLI/MCP/runtime/serial performance checks passed. Full isolated shared plan blocked at prepare by unchanged Copilot payload limit: 200 files / 1682900 bytes observed. Exact proposal prepared; no CD+Tests completion, CR, QA, installation or VCS action claimed. | .agdf/control/artefacts/late-source-revision-20261005-01/VALIDATION.md | delivery | direct |
| Code Review | .agdf/control/artefacts/late-source-revision-20261005-01/CODE_REVIEW.md | decision pass: Actual final 56-path Code Review passed; cooperative reviewed scope, no unresolved defect. Required CI observations remain open in Task Plan Review. | direct |
| Artefact source binding | .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-01.json | QA_REPORT tests TP; binding bb58064c-64e9-4e68-bea7-dbdaab1f418c; operation f2f08f07-4bef-4d2e-b116-e4e9820578d7; cf2196fc-21a1-44cc-b282-e61e1ec6ddd6 -> 55f66c01-74b8-4e13-a856-872ddf9ef984 | reviewed cooperative mapping |

| Exact candidate platform qualification | .agdf/control/artefacts/late-source-revision-20261005-01/CI_MATRIX_FINAL.json | All required native Linux22 repository / Windows22 runtime / Linux24 runtime lanes passed for exact d3683df; 1477 source hashes match; separate exact publication decisions | actual native CI execution |
| Artefact source binding | .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-02.json | QA_REPORT tests TP; binding 74d21119-addc-4f3a-988a-75d2c4f832a5; operation 5c85540e-d147-4971-b579-e2f47b4796ed; 8f1ce0df-dde8-416e-801e-416b626cf32c -> 9ef338b8-8edb-4d3a-889b-a2cbc9dd4ace | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/late-source-revision-20261005-01/QA_SOURCE_MAPPING-03.json | QA_REPORT tests TP; binding 738f1eb2-2214-4a56-bc24-ac4cf78eb6fa; operation cd96f714-4a6a-45f8-a5d8-5e5fca92aa91; 6c712a53-fe9e-4c1d-9395-2564745b1dc2 -> f9457c30-ff35-4081-84c3-a7890fe2eef6 | reviewed cooperative mapping |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/artefacts/late-source-revision-20261005-01/CONTEXT_GRAPH_RECONCILIATION.md

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Reusable proved source-revision invariant and explicit platform limits
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state

## Closeout

- next_allowed_action: Produce delivery closeout or requested handoff; do not perform VCS actions automatically.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| c94815fd-6485-457f-998d-ed6f6816a44b | sha256:e314c168c6572305f3f0506993399e163c72c160c254d83ee47011bc2ea35f32 | eyJiaW5kaW5nX2lkIjoiYzk0ODE1ZmQtNjQ4NS00NTdmLTk5OGQtZWQ2ZjY4MTZhNDRiIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmMwMDY0NzUxZGI3YTg3NzZiNjE4ZTI0ZDdjM2RkMWFiZWQ4MzA4MjRmMTVlZWU2ODQ0ZDIwN2NjOWY2YWRkNzEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6ImY4OTUxOWU4LTQ3NjItNGE1My04Y2JmLTg0NWM1YTkzNzlhNiIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiOTIwM2VkMzMtZjVjNC00ZWRlLWI5NDMtZDdjZGQ0NTU2ZTlmIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiYTI2NTI0NWItYWZhYy00NWNhLWIwMDUtZGU5MmMzMmJlMjNlIiwicmV2aXNpb24iOjd9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJQUkQiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlVSIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6ZGZiNzZlZDZlMTM1ODYxMjlhNjU3MzlkZDA4NDE4MzI0Y2JiODdiNzA3M2RhYTVkYTIzYWYyODQ1NjcxYWE2MSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9sYXRlLXNvdXJjZS1yZXZpc2lvbi0yMDI2MTAwNS0wMS9QUkRfU09VUkNFX01BUFBJTkctMDEuanNvbiIsInJldmlld2VyIjoiQ29kZXggKGNvb3BlcmF0aXZlIHByb2R1Y3QgZGVyaXZhdGlvbiByZXZpZXcpIn0sInJ1bl9pZCI6ImxhdGUtc291cmNlLXJldmlzaW9uLTIwMjYxMDA1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjoyMzBjNzgxNWM0MWFmYTA2MTdhMDZhMWYzZWI4MDdmNGE4OTE2YWMyNTY4OTA0MmY1MzNkMjYxOGY4ZGNmN2FlIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2xhdGUtc291cmNlLXJldmlzaW9uLTIwMjYxMDA1LTAxL1VSLm1kIiwidHlwZSI6IlVSIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| 5e2fb61e-927e-43ef-8c9d-60f685ce8520 | sha256:29f402edf87a03069cab53d1ec874edd4895743e6045eeca1bbd21518a4aaeb0 | eyJiaW5kaW5nX2lkIjoiNWUyZmI2MWUtOTI3ZS00M2VmLThjOWQtNjBmNjg1Y2U4NTIwIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjVlNTNhNzhjZWRlODdjZmZlNWViZDcwZGQxMDNhZWQyYTI1MzYwNjdiODJhYWZmMTNiODJhZDU0MjllNDUxOTIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIwN2JlMjZlZi0yNTg4LTQ4NTEtYWNjNS1lMmVlMWMyY2VlNGEiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImVhMmEzODM1LTQ0NzgtNGI0My1iOTlkLTBlNzg3ZDYwMDExMSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjJiNTE5ZTgzLTNiMDItNGE3ZS1hZThiLTAzZGI4YmFhMjAwMSIsInJldmlzaW9uIjo5fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiU0QiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlBSRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjRlMTJlMWJiZTlkNTMzYzU3NWM2NzNiZjFjYzU4NjlkYmU0Y2I4NTRiMWMwNTRjMGRiODExYmE1OTIxMDUzNjUiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvU0RfU09VUkNFX01BUFBJTkctMDEuanNvbiIsInJldmlld2VyIjoiQ29kZXggKGNvb3BlcmF0aXZlIGFyY2hpdGVjdHVyZSBkZXJpdmF0aW9uIHJldmlldykifSwicnVuX2lkIjoibGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OmMwMDY0NzUxZGI3YTg3NzZiNjE4ZTI0ZDdjM2RkMWFiZWQ4MzA4MjRmMTVlZWU2ODQ0ZDIwN2NjOWY2YWRkNzEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| a6cb3e86-9280-41c7-b8d8-fed33c730994 | sha256:9f77212e58d2c1982990e9f61754035d485656a8bfc090b85f9a2d59b844a1c0 | eyJiaW5kaW5nX2lkIjoiYTZjYjNlODYtOTI4MC00MWM3LWI4ZDgtZmVkMzNjNzMwOTk0IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjI3MGExYTEyYjJlNGRkNTA1NzZkNmVkNDIxMmRkMDdlMDBjZTIxYzg1M2MwZjE3ODUwYzU0ZmE2MWNlNTA2NzYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIxNjJmYjE2Yi0wYmE1LTQyMzktOTFmZi0wZjJlMjJmN2JkMmIiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6Ijg5YmU2MjAyLTkyNjMtNGM1Mi05NzM5LTFkNDI3MDZlYjVkYSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjkzZWEyMzQzLTljMWYtNDU4Yi1hNTM4LTI1MDkzZjJiMzNiZSIsInJldmlzaW9uIjoxMX0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlRQIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJTRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2Ojk3ODNjNmFmNDc5Zjk3YjJkMmRmYmRlNWM0ODMyYmZiZWQ1MTYxNmZjOTcxM2FjZjQzNzgzMjY4MmQ0MGI0ZGMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvVFBfU09VUkNFX01BUFBJTkctMDEuanNvbiIsInJldmlld2VyIjoiQ29kZXggKGNvb3BlcmF0aXZlIHRhc2sgYW5kIHRlc3QgZGVyaXZhdGlvbiByZXZpZXcpIn0sInJ1bl9pZCI6ImxhdGUtc291cmNlLXJldmlzaW9uLTIwMjYxMDA1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1Njo1ZTUzYTc4Y2VkZTg3Y2ZmZTVlYmQ3MGRkMTAzYWVkMmEyNTM2MDY3YjgyYWFmZjEzYjgyYWQ1NDI5ZTQ1MTkyIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2xhdGUtc291cmNlLXJldmlzaW9uLTIwMjYxMDA1LTAxL1NELm1kIiwidHlwZSI6IlNEIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| bb58064c-64e9-4e68-bea7-dbdaab1f418c | sha256:c5c88d0c70f6ee649e12a7e29b1e8b808164ff9952b19b22b3226df446c54f88 | eyJiaW5kaW5nX2lkIjoiYmI1ODA2NGMtNjRlOS00ZTY4LWJlYTctZGJkYWFiMWY0MThjIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjM0OWVmMDdkNDJkYjk3OTlhNjBiZTYxYmNhOWUwY2FmYTM4NWY4YjUyMTUyNDMxYzQ0ZWZmZTQ0ZmYwMjYwYjEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvUUFfUkVQT1JULm1kIiwic3RhdHVzIjoicmV2aXNlIiwidHlwZSI6IlFBX1JFUE9SVCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJmMmYwOGYwNy00YmVmLTRkMmUtYjExNi1lNGU5ODIwNTc4ZDciLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImNmMjE5NmZjLTIxYTEtNDRjYy1iMjgyLWU2MWUxZWM2ZGRkNiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjU1ZjY2YzAxLTc0YjgtNGUxMy1hODU2LTg3MmRkZjllZjk4NCIsInJldmlzaW9uIjoxOX0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlFBX1JFUE9SVCIsInJlbGF0aW9uc2hpcCI6InRlc3RzIiwidG8iOiJUUCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2Ojc5MDNkNDEyYjJmODdmNTNhOGJmNGY0ZDc5NTlkMzRhYzQ3NWJkOGM5NTI4NmExYWJjZGY5MDEwZDlmZjVjNTMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvUUFfU09VUkNFX01BUFBJTkctMDEuanNvbiIsInJldmlld2VyIjoiQ29kZXggKGNvb3BlcmF0aXZlIFFBLXRvLVRQIGRlcml2YXRpb24gcmV2aWV3KSJ9LCJydW5faWQiOiJsYXRlLXNvdXJjZS1yZXZpc2lvbi0yMDI2MTAwNS0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6MjcwYTFhMTJiMmU0ZGQ1MDU3NmQ2ZWQ0MjEyZGQwN2UwMGNlMjFjODUzYzBmMTc4NTBjNTRmYTYxY2U1MDY3NiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9sYXRlLXNvdXJjZS1yZXZpc2lvbi0yMDI2MTAwNS0wMS9UUC5tZCIsInR5cGUiOiJUUCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| 74d21119-addc-4f3a-988a-75d2c4f832a5 | sha256:ec611089348ba8b08bf31a8d5360bc5315dced9fb133a9eaec42a2aab5b8c211 | eyJiaW5kaW5nX2lkIjoiNzRkMjExMTktYWRkYy00ZjNhLTk4OGEtNzVkMmM0ZjgzMmE1IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjExZTVkNDk2NThmZTMzOTdiZWZlOTBkNDkwMGY4ZDZmYWYzNjJiNDMwMDk4ZTk0YmMzNjcxNGIxMzhiZWQxNGIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvUUFfUkVQT1JULm1kIiwic3RhdHVzIjoicGFzcyIsInR5cGUiOiJRQV9SRVBPUlQifSwib3BlcmF0aW9uIjp7ImlkIjoiNWM4NTU0MGUtZDE0Ny00OTcxLWI1NzktZTJmNDdiNDc5NmVkIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI4ZjFjZTBkZi1kZGU4LTQxNmUtODAxZS00MTZiNjI2Y2YzMmMiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI5ZWYzMzhiOC04ZWRiLTRkM2EtODg5Yi1hMmNiYzlkZDRhY2UiLCJyZXZpc2lvbiI6MjF9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJRQV9SRVBPUlQiLCJyZWxhdGlvbnNoaXAiOiJ0ZXN0cyIsInRvIjoiVFAifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjoxNmY4Y2VhMjU0ZmExOTM0YTRjZmE3NWI3MmNkZGQwNGQ2OTlmMjY1M2ZkOTgyYmY2OGY2NTUxYTA3MWU1NWRkIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2xhdGUtc291cmNlLXJldmlzaW9uLTIwMjYxMDA1LTAxL1FBX1NPVVJDRV9NQVBQSU5HLTAyLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChjb29wZXJhdGl2ZSBRQS10by1UUCBkZXJpdmF0aW9uIHJldmlldykifSwicnVuX2lkIjoibGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjI3MGExYTEyYjJlNGRkNTA1NzZkNmVkNDIxMmRkMDdlMDBjZTIxYzg1M2MwZjE3ODUwYzU0ZmE2MWNlNTA2NzYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvVFAubWQiLCJ0eXBlIjoiVFAifSwic3VwZXJzZWRlcyI6ImJiNTgwNjRjLTY0ZTktNGU2OC1iZWE3LWRiZGFhYjFmNDE4YyIsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| 738f1eb2-2214-4a56-bc24-ac4cf78eb6fa | sha256:a8ea82c263620b075b5a9637156987d45f18af9df4ad0544f932685b4cde7984 | eyJiaW5kaW5nX2lkIjoiNzM4ZjFlYjItMjIxNC00YTU2LWJjMjQtYWM0Y2Y3OGViNmZhIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2Ojk5NjEyOTFhMDAyYjNjNzI1ODlkNDAwM2ZhMTc3MTFjZGRjZjM1ZWE5Nzg0NWM4MTFjNzU2YmMxNTk4YzkxMWMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvUUFfUkVQT1JULm1kIiwic3RhdHVzIjoicGFzcyIsInR5cGUiOiJRQV9SRVBPUlQifSwib3BlcmF0aW9uIjp7ImlkIjoiY2Q5NmY3MTQtNGE2YS00NWY4LWE1ZDgtNWU1ZmNhOTJhYTkxIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI2YzcxMmE1My1mZTllLTRjMWQtOTM5NS0yNTY0NzQ1YjFkYzIiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJmOTQ1N2MzMC1mZjM1LTQwODEtODRjMy1hNzg5MGZlMmVlZjYiLCJyZXZpc2lvbiI6MjN9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJRQV9SRVBPUlQiLCJyZWxhdGlvbnNoaXAiOiJ0ZXN0cyIsInRvIjoiVFAifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjphOTRjOGY2ZmQ0ZDg2ZjhmMWMwZWY3MTA5MmYyMjQzMjY5NDdkYTYwZmEwOGM1OWRlNDVkZWJmZjliMWExZWY3IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2xhdGUtc291cmNlLXJldmlzaW9uLTIwMjYxMDA1LTAxL1FBX1NPVVJDRV9NQVBQSU5HLTAzLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChjb29wZXJhdGl2ZSBRQS10by1UUCBkZXJpdmF0aW9uIHJldmlldykifSwicnVuX2lkIjoibGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjI3MGExYTEyYjJlNGRkNTA1NzZkNmVkNDIxMmRkMDdlMDBjZTIxYzg1M2MwZjE3ODUwYzU0ZmE2MWNlNTA2NzYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbGF0ZS1zb3VyY2UtcmV2aXNpb24tMjAyNjEwMDUtMDEvVFAubWQiLCJ0eXBlIjoiVFAifSwic3VwZXJzZWRlcyI6Ijc0ZDIxMTE5LWFkZGMtNGYzYS05ODhhLTc1ZDJjNGY4MzJhNSIsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
