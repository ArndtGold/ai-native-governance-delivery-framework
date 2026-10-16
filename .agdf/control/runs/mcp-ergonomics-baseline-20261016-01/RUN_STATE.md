# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: mcp-ergonomics-baseline-20261016-01
- lifecycle: active
- revision: 15
- revision_id: c29727d2-1188-4de9-8689-b53deecd5e90
- content_seal: sha256:9e1442cd2f31d9cec63a0888bdf285a99c14a98b08884d6a06231bf3695fafc4
- approval_seal: sha256:ab67feee8a32f6c74913a959752914805592db1b9a23ef97737aa0f0c731251e
- updated_at: 2026-10-16T07:26:37.602Z
- mode: structured_slice
- current_gate: Brownfield Analysis
- decision: in_progress
- owner: agent

## Objective

A repeatable MCP ergonomics evaluation exists and has produced a committed baseline for the current AGDF MCP interfaces. Later phases can re-run the same evaluation unchanged and compare their results with this baseline.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval recorded for TP; current gate is Brownfield Analysis. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Run Brownfield Analysis for the approved TP scope before CD+Tests. |
| What is explicitly forbidden right now? | implement before Brownfield evidence supports the approved TP path; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-16 · revision 7 · `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md` sha256:f412f37894ce8cc8 · presentation 9262d1d7-1c83-4309-8eb1-83ab1230c5a2 sha256:bf3c4edfb95889a2b2d703d8ad21296de9c817da4876968c87d5342ef9a0ef6e |
| PRD | approved | `Approval: PRD` · 2026-10-16 · revision 10 · `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD.md` sha256:0c2e378321f08a8c · presentation 1d370e10-309a-4d02-a54d-8e555ab1b44c sha256:78231c3d995fb4672199f7cbc08ba54d679d21acaec8acee16060ab68aed4f15 |
| SD | approved | `Approval: SD` · 2026-10-16 · revision 12 · `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD.md` sha256:0144cef299f39e3a · presentation 457d265b-3c3d-4295-8c42-b7884b6786d9 sha256:ffd162805bb664e79807fc1aa8af0ea5436ad6e64e3cfeec70ab5e3a930ec210 |
| TP | approved | `Approval: TP` · 2026-10-16 · revision 14 · `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md` sha256:db56921325fb1f2d · presentation 498a81c3-fc3a-47e8-a5fe-7c918b587605 sha256:603a854a041151f377e2391e507dd9961725e11421965d22504ebfbc7da8de46 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md` | approved | Previous content is historical; fresh recording and approval required |
| Brownfield Review | `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_REVIEW.md` | done | Renewed evidence required after source revision |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis |  | missing | Renewed evidence required after source revision |
| CD+Tests |  | missing | Renewed evidence required after source revision |
| CR |  | missing | Renewed evidence required after source revision |
| QA |  | missing | Renewed decision and evidence required after source revision |
| Binding proof fcccbbb6-0055-4d73-acfe-763776a5711c | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD_DERIVATION_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 4c0a0a2b-3f9b-46c8-883d-20c56dbd3da5 | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD_DERIVATION_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 723f1e65-36e7-4d6e-9b40-3ae12d6aa15c | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP_DERIVATION_REVIEW-01.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: repeatable MCP ergonomics evaluation (protocol layer plus native Claude Code layer with Opus 5.5 and Sonnet 5.5) reusing the MCP test harness, the Claude native probe and the eval layout; no full-depth trigger; all seven bounded-slice checks pass. Rejected: quick_task/verified_change (new capability, several owners, nondeterministic native layer) and structured_delivery (no evidenced trigger).
- evidence: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-16 · revision 7 · `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md` sha256:f412f37894ce8cc8 · presentation 9262d1d7-1c83-4309-8eb1-83ab1230c5a2 sha256:bf3c4edfb95889a2b2d703d8ad21296de9c817da4876968c87d5342ef9a0ef6e |
| PRD | derived_from | UR | binding fcccbbb6-0055-4d73-acfe-763776a5711c; reviewed by Claude Code (claude-opus-5-5); .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD_DERIVATION_REVIEW-01.json |
| SD | derived_from | PRD | binding 4c0a0a2b-3f9b-46c8-883d-20c56dbd3da5; reviewed by Claude Code (claude-opus-5-5); .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD_DERIVATION_REVIEW-01.json |
| TP | derived_from | SD | binding 723f1e65-36e7-4d6e-9b40-3ae12d6aa15c; reviewed by Claude Code (claude-opus-5-5); .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP_DERIVATION_REVIEW-01.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| UR draft | `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| Artefact source binding | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD_DERIVATION_REVIEW-01.json | PRD derived_from UR; binding fcccbbb6-0055-4d73-acfe-763776a5711c; operation 12785a84-1350-44d6-ac28-70da96bf5ddf; 6ccfaa6a-1a76-4dfc-8d62-1381b86be514 -> 2bd01af8-02d1-4e05-a744-9d6aa1ff764b | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD_DERIVATION_REVIEW-01.json | SD derived_from PRD; binding 4c0a0a2b-3f9b-46c8-883d-20c56dbd3da5; operation bd06e7ec-1e95-48d3-8bc1-612a82e0c297; 3a0dfa03-06e7-4aeb-b328-dacac984f792 -> dd60b65e-8317-4480-9e7c-1c3760b66761 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP_DERIVATION_REVIEW-01.json | TP derived_from SD; binding 723f1e65-36e7-4d6e-9b40-3ae12d6aa15c; operation 2780d2aa-6f70-437f-b1d7-616ef592ecf0; 3126177f-8ca7-4a7a-8a23-982731ae80a1 -> 8bf6a29d-d34c-4d81-8915-44e93bf06b50 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Run Brownfield Analysis for the approved TP scope before CD+Tests.
- quality_outlook:

## Source Revisions

- schema_version: 1

| operation_id | receipt_digest | receipt |
|---|---|---|
| 835fbe03-7a34-4676-92b8-6616c355e6d5 | sha256:49797c002b5a868db178c22236044cda827f8cb3e498c71b2e51a5f63c85be94 | eyJhbmFseXNlcyI6W3siZGlnZXN0Ijoic2hhMjU2OmZiZDhmYjg3ZWViZmI1MDgwNTE4MTdkY2RmYWViODkyMGFjOTYzN2ZhNWY5ZDU3YzUyYjIyYzllMmM4Zjk5NGYiLCJkaXNwb3NpdGlvbiI6InJlYXNzZXNzIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxL0JST1dORklFTERfUkVWSUVXLm1kIiwicmVhc29uIjoiVVIgcmV2aXNpb24gcmVxdWlyZXMgYSBmcmVzaCBwb3N0LVVSIEJyb3duZmllbGQgUmV2aWV3IGFuZCBNb2RlL1NsaWNlIGRlY2lzaW9uOyBob3N0IHNjb3BlIG9mIHRoZSBuYXRpdmUgbGF5ZXIgY2hhbmdlcy4iLCJ0eXBlIjoiQnJvd25maWVsZCBSZXZpZXcifV0sImFyY2hpdmUiOnsiZGlnZXN0Ijoic2hhMjU2OmY5M2ZjNzgwYzFjNmNlZmE5N2Q0NWZkNmZjMDFlY2FhZjQ3YjZjMDgwN2VhZWExMGJiMWJiYTU0ZTVlYWI3NjQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9ydW5zL21jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxL3JldmlzaW9ucy84MzVmYmUwMy03YTM0LTQ2NzYtOTJiOC02NjE2YzM1NWU2ZDUvbWFuaWZlc3QuanNvbiJ9LCJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY29tbWFuZF9kaWdlc3QiOiJzaGEyNTY6ZTA0ZmY0ODlmYTlhNWI4OTUwNmM0ODdkMzEwZjYwNzAwNGExYTMxNTkwYWM4YzJmNDc5NzNiZDg4ODM2ODdhNyIsImNvbmZpcm1hdGlvbl9kaWdlc3QiOiJzaGEyNTY6MmRkNjA0NGMyNjgxNjRkNGE1ZTkzY2U1MmViYzIxZWYxYmE4NDcyYTc4NGFkNjc1MTBlZDI0MzhmNjA4YTc2MyIsImltcGFjdF9kaWdlc3QiOiJzaGEyNTY6YzY4YzdlOGY3OTM1ODc4OThkYTJmMWJjN2FlZThmYjE0YzZkZTU5OWNhM2U0ZDMyMWRlNmRiYzA4YzAxZDE0ZiIsImluaXRpYXRpbmdfcGhhc2UiOiJQUkQiLCJpbnZhbGlkYXRlZF9iaW5kaW5ncyI6W10sIm9wZXJhdGlvbl9pZCI6IjgzNWZiZTAzLTdhMzQtNDY3Ni05MmI4LTY2MTZjMzU1ZTZkNSIsInBvbGljeV92ZXJzaW9uIjoyLCJwcmV2aWV3X2RpZ2VzdCI6InNoYTI1NjoxOGJkMWY2NDBlNmQwZTk4MjAyMThhNGQxYzdkNDc1YzA0NzE2N2Y4MDczNjUzYTgxYWJkOGY3ZTFkMGQ4MjVkIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI4MzEzMTk0Zi1jMzAwLTQ5ZGYtYTJiYi0wYmEwNTVkZmQ3ZGQiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicHJvcG9zYWxfcmVmZXJlbmNlIjp7ImRpZ2VzdCI6InNoYTI1NjpjNDFmOTAxNWMyNWM5ZWVjYjI2ZjIwYzUzZjM4YjVkOGMzYjBjNmU4NjdhYTFkNmY0ZjRiNjA3ZTVhNTE0YTk3IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxL1VSX1JFVklTSU9OX1BST1BPU0FMLTAxLmpzb24ifSwicXVhbGl0eV9kaWdlc3QiOiJzaGEyNTY6ZGJmMzNmN2RjYmJhNmI3ZTZhOGVlY2Y2YjhlZjVlNGVkNGQxMmFkM2VjYzU3MzExZTA3MGYwNGY0MDkyMmZiMCIsInJlYXNvbiI6IlVzZXIgZGVjaXNpb24gMjAyNi0xMC0xNiBkdXJpbmcgUFJEIGNsYXJpZmljYXRpb246IG5hdGl2ZSBtZWFzdXJlbWVudCBydW5zIG9ubHkgb24gQ2xhdWRlIENvZGUgb24gdGhpcyBXaW5kb3dzIG1hY2hpbmU7IENvZGV4IGxlYXZlcyB0aGlzIHJ1bi4iLCJyZXF1ZXN0X2RpZ2VzdCI6InNoYTI1NjoxM2Q0MWE0ODg0ZDFmNWY0YTBjOGNmY2E0YTI5YTI4N2JmODEzODljZTU1YWI1MDU1ZGI2MTE0ZWJjYWQ2NWZlIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiOWVhY2RlYzAtZjg2Ni00ODEwLTg4YTEtZDI1MTc4ZWIwYzZiIiwicmV0YWluZWRfc291cmNlcyI6W10sInJldmlzaW9uIjo2LCJydW5faWQiOiJtY3AtZXJnb25vbWljcy1iYXNlbGluZS0yMDI2MTAxNi0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMyIsInNvdXJjZV9nYXRlIjoiVVIiLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YWZiMzE4NzNlZmE5MWQ4OTJiOTA0NjYzMTI2OGQ3OWYxYzhjYjQzYWEzOTJjMGVmNWU0ZDJmZDUwMDI5M2YxMCJ9 |

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| fcccbbb6-0055-4d73-acfe-763776a5711c | sha256:273958d4e3790c9fe2048ca14fb49e6ef5c1a38f61980222bdd862aa840db596 | eyJiaW5kaW5nX2lkIjoiZmNjY2JiYjYtMDA1NS00ZDczLWFjZmUtNzYzNzc2YTU3MTFjIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjBjMmUzNzgzMjFmMDhhOGNkYTllZDVjMGZmMmMzYWVlNjJiNTliN2Q1Zjk3NzU2OWExODFkZjdlMGYzMTM2MWYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6IjEyNzg1YTg0LTEzNTAtNDRkNi1hYzI4LTcwZGE5NmJmNWRkZiIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiNmNjZmFhNmEtMWE3Ni00ZGZjLThkNjItMTM4MWI4NmJlNTE0IiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiMmJkMDFhZjgtMDJkMS00ZTA1LWE3NDQtOWQ2YWExZmY3NjRiIiwicmV2aXNpb24iOjEwfSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUFJEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJVUiJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjhjMDc3MDBjMDMxNzVlNzEwMWNjNGQzZGVmMjRlZDVjNjczYzU0ODlmNTU5NTBiN2E1ZDk0MTk1MjBlNjA4NzMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEvUFJEX0RFUklWQVRJT05fUkVWSUVXLTAxLmpzb24iLCJyZXZpZXdlciI6IkNsYXVkZSBDb2RlIChjbGF1ZGUtb3B1cy01LTUpIn0sInJ1bl9pZCI6Im1jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjpmNDEyZjM3ODk0Y2U4Y2M4NzlmNDA1ZDcwMDk5OTE0OGRjYjE3NDAwOWY5NDc2NzAxYzg1ZWVlNmQ0MGJiZmUzIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxL1VSLm1kIiwidHlwZSI6IlVSIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphZmIzMTg3M2VmYTkxZDg5MmI5MDQ2NjMxMjY4ZDc5ZjFjOGNiNDNhYTM5MmMwZWY1ZTRkMmZkNTAwMjkzZjEwIn0 |
| 4c0a0a2b-3f9b-46c8-883d-20c56dbd3da5 | sha256:eaa70c1a602fb7a99ee8810239b42af89a634550d73c8e150d6accb2408c710e | eyJiaW5kaW5nX2lkIjoiNGMwYTBhMmItM2Y5Yi00NmM4LTg4M2QtMjBjNTZkYmQzZGE1IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjAxNDRjZWYyOTlmMzllM2EzYjhlMmQ3MDhiNjZjY2U4ZTNhNjk0NWU5ZjRjYzNlY2ExNTI3Yjk5YzkzODE4ZTgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJiZDA2ZTdlYy0xZTk1LTQ4ZDMtOGJjMS02MTJhODJlMGMyOTciLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjNhMGRmYTAzLTA2ZTctNGFlYi1iMzI4LWRhY2FjOTg0Zjc5MiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImRkNjBiNjVlLTgzMTctNDQ4MC05ZTdjLTFjMzc2MGI2Njc2MSIsInJldmlzaW9uIjoxMn0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlNEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJQUkQifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1Njo5NjBhMTAyYzNiZTgzNTQ0YjQ1ZWY1YjA3MzdiY2MzMmY4ODBlNjExZTJjZTk1OTkzNDc4ODdlNWQ2YmNlM2YyIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxL1NEX0RFUklWQVRJT05fUkVWSUVXLTAxLmpzb24iLCJyZXZpZXdlciI6IkNsYXVkZSBDb2RlIChjbGF1ZGUtb3B1cy01LTUpIn0sInJ1bl9pZCI6Im1jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjowYzJlMzc4MzIxZjA4YThjZGE5ZWQ1YzBmZjJjM2FlZTYyYjU5YjdkNWY5Nzc1NjlhMTgxZGY3ZTBmMzEzNjFmIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcmdvbm9taWNzLWJhc2VsaW5lLTIwMjYxMDE2LTAxL1BSRC5tZCIsInR5cGUiOiJQUkQifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmFmYjMxODczZWZhOTFkODkyYjkwNDY2MzEyNjhkNzlmMWM4Y2I0M2FhMzkyYzBlZjVlNGQyZmQ1MDAyOTNmMTAifQ |
| 723f1e65-36e7-4d6e-9b40-3ae12d6aa15c | sha256:db5a39bd158798e6d69f6b6e477ccf8fccfa50a911ea709b5b8aa57fc90feb17 | eyJiaW5kaW5nX2lkIjoiNzIzZjFlNjUtMzZlNy00ZDZlLTliNDAtM2FlMTJkNmFhMTVjIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmRiNTY5MjEzMjVmYjFmMmRlZWIxNDliNDVhNTkzZjVmYjliMGFhMGJiMDQ5NDgxNDRjNzMwMzkxODMxNDYyZTEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIyNzgwZDJhYS02ZjcwLTQzN2YtYjFkNy02MTZlZjU5MmVjZjAiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjMxMjYxNzdmLThjYTctNGE3YS04YTIzLTk4MjczMWFlODBhMSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjhiZjZhMjlkLWQzNGMtNGQ4MS04OTE1LTQ0ZTkzYmYwNmI1MCIsInJldmlzaW9uIjoxNH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlRQIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJTRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmY5M2UyMjk2Yjk3ZWUwNzY3NjA0M2UzODRiMTY0ZjAxOGU0YzYyYmI5MDc5MGE0YWZkYzVmZGI3ZTI4ZTRhOTgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEvVFBfREVSSVZBVElPTl9SRVZJRVctMDEuanNvbiIsInJldmlld2VyIjoiQ2xhdWRlIENvZGUgKGNsYXVkZS1vcHVzLTUtNSkifSwicnVuX2lkIjoibWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjAxNDRjZWYyOTlmMzllM2EzYjhlMmQ3MDhiNjZjY2U4ZTNhNjk0NWU5ZjRjYzNlY2ExNTI3Yjk5YzkzODE4ZTgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLWVyZ29ub21pY3MtYmFzZWxpbmUtMjAyNjEwMTYtMDEvU0QubWQiLCJ0eXBlIjoiU0QifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmFmYjMxODczZWZhOTFkODkyYjkwNDY2MzEyNjhkNzlmMWM4Y2I0M2FhMzkyYzBlZjVlNGQyZmQ1MDAyOTNmMTAifQ |
