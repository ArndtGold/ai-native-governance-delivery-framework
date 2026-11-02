# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ur-definition-separation-20261004-01
- lifecycle: active
- revision: 16
- revision_id: 2795ef51-02af-4c3a-93e3-db1e1678918b
- content_seal: sha256:ae513913f30527632ddeef9952e3da7ea3becff338ddabae8304b828563ca8af
- approval_seal: sha256:49feff4723e699477169ae604bddaca7e9b14b6390978aad60cc3ff2b0c1ab40
- updated_at: 2026-10-04T12:57:19.594Z
- mode: structured_delivery
- current_gate: UAT
- decision: in_progress
- owner: agent

## Objective

Separate bound unapproved UR drafting and clarification from gate-check through the canonical ur-definition skill, retaining existing registration, revision and deliberate approval controls.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval recorded for QA; current gate is UAT. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP, Approval: QA |
| What is missing? | Exact Approval: UAT. |
| What is the next allowed action? | Request exact approval: Approval: UAT before delivery handoff. |
| What is explicitly forbidden right now? | release; push; open PR; commit without explicit user instruction and required approval |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-04 · revision 3 · `.agdf/control/artefacts/ur-definition-separation-20261004-01/UR.md` sha256:1fa05040fb5794c9 · presentation ca92f1fa-4fa2-4b56-b0ae-e45376a345b2 sha256:2c02a8d1a548e52074f0385db497dc982d6f1985ea31d694b45475c317dc7829 |
| PRD | approved | `Approval: PRD` · 2026-10-04 · revision 6 · `.agdf/control/artefacts/ur-definition-separation-20261004-01/PRD.md` sha256:700215e86bf3e107 · presentation 4396bdb4-279f-45b1-b31b-f57ee775a9a4 sha256:d5e4930bf15ced2fdc6ec1e2b23392f469ced8b1605c20c9e63701a39933c6a0 |
| SD | approved | `Approval: SD` · 2026-10-04 · revision 8 · `.agdf/control/artefacts/ur-definition-separation-20261004-01/SD.md` sha256:73d88cc4c83c3715 · presentation 97f02b51-9de4-450f-aa1d-a2dfad8b2d55 sha256:c8cde20595ae7566259cc7f81e998aba25eadf733e0d9215fa368e9ecb26bebe |
| TP | approved | `Approval: TP` · 2026-10-04 · revision 10 · `.agdf/control/artefacts/ur-definition-separation-20261004-01/TP.md` sha256:fbf178662ca4a448 · presentation e2262e28-0b0b-4a64-a4d3-d36b7f034293 sha256:34fd07138791f5b52392a42a31f5b51ac7eb22cd64271f09406a80f77ccc5dc6 |
| QA | approved | `Approval: QA` · 2026-10-04 · revision 15 · `.agdf/control/artefacts/ur-definition-separation-20261004-01/QA_REPORT.md` sha256:82e82a07688e45ca · presentation d48af1cc-0781-4648-84ad-1f5df42d263e sha256:953ac7ab3fbf2b9bef1820b5c2de448871e65a363d3b412e3e61acbe291f3d42 |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/ur-definition-separation-20261004-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/ur-definition-separation-20261004-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/ur-definition-separation-20261004-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/ur-definition-separation-20261004-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/ur-definition-separation-20261004-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | `.agdf/control/artefacts/ur-definition-separation-20261004-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis: pass; approved TP owners and reuse verified |
| CD+Tests | .agdf/control/artefacts/ur-definition-separation-20261004-01/CD_TESTS.md | done | All approved implementation and test obligations completed; final source and outcomes recorded. |
| CR | .agdf/control/artefacts/ur-definition-separation-20261004-01/CODE_REVIEW.md | done | Code Review pass; existing canonical review operation recorded. |
| QA | .agdf/control/artefacts/ur-definition-separation-20261004-01/QA_REPORT.md | pass | Reviewed source binding recorded atomically |
| Binding proof f4721639-f33b-4541-bf8c-199a96f1c2e4 | .agdf/control/artefacts/ur-definition-separation-20261004-01/PRD_MAPPING_REV5.json | done | Subordinate reviewed mapping evidence |
| Binding proof 1045c3b7-8e60-437a-9563-af48ba34f0f8 | .agdf/control/artefacts/ur-definition-separation-20261004-01/SD_MAPPING_REV7.json | done | Subordinate reviewed mapping evidence |
| Binding proof b263d437-75a3-499c-96c0-9742e5f9e275 | .agdf/control/artefacts/ur-definition-separation-20261004-01/TP_MAPPING_REV9.json | done | Subordinate reviewed mapping evidence |

| Clean Implementation Review | .agdf/control/artefacts/ur-definition-separation-20261004-01/CLEAN_IMPLEMENTATION_REVIEW.md | done | Solution integrity pass; cooperative architecture/structure review. |
| TP Review | .agdf/control/artefacts/ur-definition-separation-20261004-01/TP_REVIEW.md | done | Plan coverage pass; 8/8 tasks fully_done; no open finding. |
| Candidate checks | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/CANDIDATE_CHECKS.json | done | Subordinate measured outcomes and log digests. |
| Candidate source | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/SOURCE_SNAPSHOT.json | done | Subordinate exact final source identity. |
| Cooperative UR behavior | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/UR_BEHAVIOR_CASES.json | done | Subordinate original inputs and actual cooperative outputs. |
| Bound UR behavior | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/BOUND_BEHAVIOR_RUNTIME.json | done | Subordinate actual built-MCP bindings and fresh checks. |
| Projection and budget | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/PROJECTION_AND_BUDGET.json | done | Subordinate exact payload and unchanged instruction limits. |
| Rendered UR cards | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/UR_RENDERED_CARDS.json | done | Subordinate actual EN/DE rendering; no native UI claim. |
| Candidate coherence | .agdf/control/artefacts/ur-definition-separation-20261004-01/evidence/PRIMARY_CANDIDATE_COHERENCE.json | done | Subordinate primary/validated generated identity equality. |
| Binding proof b7292aa3-aa32-4522-9665-e8ffb584dea2 | .agdf/control/artefacts/ur-definition-separation-20261004-01/QA_MAPPING_REV14.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: Neuer öffentlicher UR-Skill und konsumierte Intake-Übergabe ändern den gemeinsamen Laufzeit-/Hostvertrag; structured_slice verworfen wegen des belegten Vertragseffekts.
- evidence: .agdf/control/artefacts/ur-definition-separation-20261004-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-04 · revision 3 · `.agdf/control/artefacts/ur-definition-separation-20261004-01/UR.md` sha256:1fa05040fb5794c9 · presentation ca92f1fa-4fa2-4b56-b0ae-e45376a345b2 sha256:2c02a8d1a548e52074f0385db497dc982d6f1985ea31d694b45475c317dc7829 |
| PRD | derived_from | UR | binding f4721639-f33b-4541-bf8c-199a96f1c2e4; reviewed by Codex cooperative source mapping review; not independent human proof; .agdf/control/artefacts/ur-definition-separation-20261004-01/PRD_MAPPING_REV5.json |
| SD | derived_from | PRD | binding 1045c3b7-8e60-437a-9563-af48ba34f0f8; reviewed by Codex cooperative source mapping review; not independent human proof; .agdf/control/artefacts/ur-definition-separation-20261004-01/SD_MAPPING_REV7.json |
| TP | derived_from | SD | binding b263d437-75a3-499c-96c0-9742e5f9e275; reviewed by Codex cooperative source mapping review; not independent human proof; .agdf/control/artefacts/ur-definition-separation-20261004-01/TP_MAPPING_REV9.json |
| QA_REPORT | tests | TP | binding b7292aa3-aa32-4522-9665-e8ffb584dea2; reviewed by Current Codex cooperative QA source mapping; same author/reviewer instance, no independent human proof; .agdf/control/artefacts/ur-definition-separation-20261004-01/QA_MAPPING_REV14.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/ur-definition-separation-20261004-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/ur-definition-separation-20261004-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/ur-definition-separation-20261004-01/PRD_MAPPING_REV5.json | PRD derived_from UR; binding f4721639-f33b-4541-bf8c-199a96f1c2e4; operation d3e4bcaa-2fc3-42b0-a1ba-55d7e6c3348a; 0e83cef1-828e-478a-b786-e4eeba61ffa7 -> 7e2b8bb7-1c84-49eb-adc0-7a86bbbdaec9 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/ur-definition-separation-20261004-01/SD_MAPPING_REV7.json | SD derived_from PRD; binding 1045c3b7-8e60-437a-9563-af48ba34f0f8; operation edb1de47-8b5a-4616-938a-138b0431015c; 40e92f16-e159-4ece-8c8b-0a0568432258 -> 5ecd6fc7-8630-444b-859e-6cbfddb5ca41 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/ur-definition-separation-20261004-01/TP_MAPPING_REV9.json | TP derived_from SD; binding b263d437-75a3-499c-96c0-9742e5f9e275; operation 3543a99a-8cc5-4c15-b75e-5841783af49c; f70d9bea-986e-4dfa-a079-6b54a79fd3ba -> a88ef2db-1bae-49d6-83c7-8982e63108d7 | reviewed cooperative mapping |
| Code Review | .agdf/control/artefacts/ur-definition-separation-20261004-01/CODE_REVIEW.md | decision pass: Final source-bound Code Review; resolved installed-integrity findings; no open code defect; exact candidate and actual checks recorded. | direct |

| Approved TP implementation | .agdf/control/artefacts/ur-definition-separation-20261004-01/CD_TESTS.md | T-000..T-007, AC-001..AC-008, SCN-001..SCN-021; local built/packed/cooperative evidence, no new native install | direct and cooperative as identified |
| Artefact source binding | .agdf/control/artefacts/ur-definition-separation-20261004-01/QA_MAPPING_REV14.json | QA_REPORT tests TP; binding b7292aa3-aa32-4522-9665-e8ffb584dea2; operation c5b6a081-8e1e-4921-a589-82c47bbaa4b9; a6bb9803-d67f-4833-b0a2-3a393b7c1851 -> 56012530-2b14-47b6-be52-77eeeeb73d48 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Request exact approval: Approval: UAT before delivery handoff.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| f4721639-f33b-4541-bf8c-199a96f1c2e4 | sha256:4b44ffc0400019c5ff0c4a438a1ae2ac4bd2611080a18381b0c22e5a8ab738b6 | eyJiaW5kaW5nX2lkIjoiZjQ3MjE2MzktZjMzYi00NTQxLWJmOGMtMTk5YTk2ZjFjMmU0IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjcwMDIxNWU4NmJmM2UxMDdlNTgwNzBkMmU3ZjAwYjI1Mjc4YTFmZmRjYTE3ODQ1OTE5MDJiOGY5OTllYTZjNzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlBSRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJkM2U0YmNhYS0yZmMzLTQyYjAtYTFiYS01NWQ3ZTZjMzM0OGEiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjBlODNjZWYxLTgyOGUtNDc4YS1iNzg2LWU0ZWViYTYxZmZhNyIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjdlMmI4YmI3LTFjODQtNDllYi1hZGMwLTdhODZiYmJkYWVjOSIsInJldmlzaW9uIjo2fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUFJEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJVUiJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjdkMTU3N2RjZmFkODM5YjI0Y2ZkYTlkMzM3MmMxMmQ3YWMxMzI2MDA5YTMwMWI0NjQ4MjI0NDUyZmI3MWI5YTIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRF9NQVBQSU5HX1JFVjUuanNvbiIsInJldmlld2VyIjoiQ29kZXggY29vcGVyYXRpdmUgc291cmNlIG1hcHBpbmcgcmV2aWV3OyBub3QgaW5kZXBlbmRlbnQgaHVtYW4gcHJvb2YifSwicnVuX2lkIjoidXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjoxZmEwNTA0MGZiNTc5NGM5ZjRiZmY0OWI3MmNhYzBkNzYxZDE0ZTFmOWYyZDE5ZDBhZGI4NjFlZDRiZDljMjllIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3VyLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| 1045c3b7-8e60-437a-9563-af48ba34f0f8 | sha256:1420538ca43f804bb652acc0a3320037a0086b419a1b456d95db496b9e27ceb6 | eyJiaW5kaW5nX2lkIjoiMTA0NWMzYjctOGU2MC00MzdhLTk1NjMtYWY0OGJhMzRmMGY4IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjczZDg4Y2M0YzgzYzM3MTUxNzRhZGE3MjU1Zjg2ZWMzOWNmMWQzODY1Y2I2MTFjMDVmYzAwOWM5Y2U1OGQzMmYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1NELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiU0QifSwib3BlcmF0aW9uIjp7ImlkIjoiZWRiMWRlNDctOGI1YS00NjE2LTkzOGEtMTM4YjA0MzEwMTVjIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI0MGU5MmYxNi1lMTU5LTRlY2UtOGM4Yi0wYTA1Njg0MzIyNTgiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI1ZWNkNmZjNy04NjMwLTQ0NGItODU5ZS02Y2JmZGRiNWNhNDEiLCJyZXZpc2lvbiI6OH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlNEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJQUkQifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjoxMDE5MGM5ZjBiODdiNTQ0Zjg4MGZlYTE3NWRmNjRjZDczNzI0OTVjMzczNzUwM2UzYmJmMTFkZjBmZmI5NTUyIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3VyLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9TRF9NQVBQSU5HX1JFVjcuanNvbiIsInJldmlld2VyIjoiQ29kZXggY29vcGVyYXRpdmUgc291cmNlIG1hcHBpbmcgcmV2aWV3OyBub3QgaW5kZXBlbmRlbnQgaHVtYW4gcHJvb2YifSwicnVuX2lkIjoidXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1Njo3MDAyMTVlODZiZjNlMTA3ZTU4MDcwZDJlN2YwMGIyNTI3OGExZmZkY2ExNzg0NTkxOTAyYjhmOTk5ZWE2YzcyIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3VyLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9QUkQubWQiLCJ0eXBlIjoiUFJEIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| b263d437-75a3-499c-96c0-9742e5f9e275 | sha256:6648c4bc53354e9fb3c26b1a12809dd5f81e383d9ccabefe2dcd7d344ea642eb | eyJiaW5kaW5nX2lkIjoiYjI2M2Q0MzctNzVhMy00OTljLTk2YzAtOTc0MmU1ZjllMjc1IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmZiZjE3ODY2MmNhNGE0NDgyYjY3M2JkMDFmMWQzYTM4MWI5NzMzYzU4Y2Q5NzdmYTNlMTUzMmZjNGU0YzdlYTYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1RQLm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiVFAifSwib3BlcmF0aW9uIjp7ImlkIjoiMzU0M2E5OWEtOGNjNS00YzE1LWI3NWUtNTg0MTc4M2FmNDljIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiJmNzBkOWJlYS05ODZlLTRkZmEtYTA3OS02YjU0YTc5ZmQzYmEiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJhODhlZjJkYi0xYmFlLTQ5ZDYtODNjNy04OTgyZTYzMTA4ZDciLCJyZXZpc2lvbiI6MTB9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJUUCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiU0QifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjoxNTZkZDM2YTNmNjM0ZmFhODU0NDQxMmNjZDYyZTUwMWM2YTM4YzcyOWJkZTM2NjQwZTc1YjNkZDU5MGIzMzZlIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3VyLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9UUF9NQVBQSU5HX1JFVjkuanNvbiIsInJldmlld2VyIjoiQ29kZXggY29vcGVyYXRpdmUgc291cmNlIG1hcHBpbmcgcmV2aWV3OyBub3QgaW5kZXBlbmRlbnQgaHVtYW4gcHJvb2YifSwicnVuX2lkIjoidXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1Njo3M2Q4OGNjNGM4M2MzNzE1MTc0YWRhNzI1NWY4NmVjMzljZjFkMzg2NWNiNjExYzA1ZmMwMDljOWNlNThkMzJmIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3VyLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9TRC5tZCIsInR5cGUiOiJTRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| b7292aa3-aa32-4522-9665-e8ffb584dea2 | sha256:1380c17921ea8c65a3e7c5e52037d8c9b91300f1023f58a4b6f9a6033a848a67 | eyJiaW5kaW5nX2lkIjoiYjcyOTJhYTMtYWEzMi00NTIyLTk2NjUtZThmZmI1ODRkZWEyIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjgyZTgyYTA3Njg4ZTQ1Y2E1YThhNmZhMjRiMjM5ZDRhYmM2NTUxMGFjNThkZDgyNmU4MDMwNGRiMmExNDdhOTMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1FBX1JFUE9SVC5tZCIsInN0YXR1cyI6InBhc3MiLCJ0eXBlIjoiUUFfUkVQT1JUIn0sIm9wZXJhdGlvbiI6eyJpZCI6ImM1YjZhMDgxLThlMWUtNDkyMS1hNTg5LTgyYzQ3YmJhYTRiOSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiYTZiYjk4MDMtZDY3Zi00ODMzLWIwYTItM2EzOTNiN2MxODUxIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiNTYwMTI1MzAtMmIxNC00N2I2LWJlNTItNzdlZWVlYjczZDQ4IiwicmV2aXNpb24iOjE1fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUUFfUkVQT1JUIiwicmVsYXRpb25zaGlwIjoidGVzdHMiLCJ0byI6IlRQIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6YTgyYzM5ZThhMjAxMTEwY2FjZWJiYjRhMDI3YjgyOGVhYmM5OWJlNzYyOTc2ODc1ZTYzNTYzMjk4OGJhY2RkMSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy91ci1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEvUUFfTUFQUElOR19SRVYxNC5qc29uIiwicmV2aWV3ZXIiOiJDdXJyZW50IENvZGV4IGNvb3BlcmF0aXZlIFFBIHNvdXJjZSBtYXBwaW5nOyBzYW1lIGF1dGhvci9yZXZpZXdlciBpbnN0YW5jZSwgbm8gaW5kZXBlbmRlbnQgaHVtYW4gcHJvb2YifSwicnVuX2lkIjoidXItZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjpmYmYxNzg2NjJjYTRhNDQ4MmI2NzNiZDAxZjFkM2EzODFiOTczM2M1OGNkOTc3ZmEzZTE1MzJmYzRlNGM3ZWE2IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3VyLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9UUC5tZCIsInR5cGUiOiJUUCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
