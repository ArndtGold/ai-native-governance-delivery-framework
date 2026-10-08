# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-cockpit-claude-host-20261008-01
- lifecycle: active
- revision: 13
- revision_id: 36fc72e1-c95d-4b9c-ad74-c9b66206f92a
- content_seal: sha256:f868ad577961600b093f325a5aa5bc086cb70faab571e9c660754fa999f056dd
- approval_seal: sha256:b31890a2493386c8a073e41c21e3c979e5f57435165df98488e0bdfa1e346894
- updated_at: 2026-10-08T09:01:37.396Z
- mode: structured_delivery
- current_gate: Brownfield Analysis
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

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
| UR | approved | `Approval: UR` · 2026-10-08 · revision 2 · `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UR.md` sha256:5b7e33d7a6a8742b · presentation 18675007-7ea6-4d8e-9354-eaa2685bb66f sha256:4611e65287b4556cd53c13034c1c58451a9e18d07938438ecb86f48050dd80cf |
| PRD | approved | `Approval: PRD` · 2026-10-08 · revision 6 · `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/PRD.md` sha256:0066e53b922d0b5d · presentation 2a906516-461c-42db-9f62-8e9f35da6956 sha256:09b2fd0dacaed3f7e77b9747f2ae97edca7fe1bfe191c1de5832484012c05483 |
| SD | approved | `Approval: SD` · 2026-10-08 · revision 9 · `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD.md` sha256:dde6e707c0d60a1b · presentation 1d9d4a1a-8abe-4535-b897-0a3753f74e78 sha256:a528416f200fb877cc18a0b8809dc0b8a41541df1c56f14680c12a47359ca8c2 |
| TP | approved | `Approval: TP` · 2026-10-08 · revision 11 · `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/TP.md` sha256:1232a2f94029b678 · presentation cd34b0a7-9d21-475c-81e1-dd79dc17360b sha256:a8b16f5457f218869959e0d119485601aaf5bf2d63f12317ba26556658e0934f |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/BROWNFIELD_REVIEW.md` | done |  |
| UX Intent Definition | `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UX_INTENT_DEFINITION.md` | done | Analytical PRD input; decision ready |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis; decision pass |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| Binding proof c85d7dbc-1ade-4ee4-8adf-17be40506c1b | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/PRD_MAPPING_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof b31674bb-9948-4abd-ac38-92e327f6a280 | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD_MAPPING_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof c45557dc-7dfa-44db-a22b-73b4212ecba4 | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD_MAPPING_REVIEW-02.json | done | Subordinate reviewed mapping evidence |
| Binding proof 1cd2f2cd-7c9b-4bec-8c4f-baa05e0ae055 | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/TP_MAPPING_REVIEW-01.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: release_cross_host_depth: activating the cockpit in Claude Code changes the distributed plugin MCP declaration, launcher contract, payload and provenance, and adds a host-provided project binding; structured_slice rejected (full_depth_impacts_absent, authority_boundary fail)
- evidence: .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-08 · revision 2 · `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UR.md` sha256:5b7e33d7a6a8742b · presentation 18675007-7ea6-4d8e-9354-eaa2685bb66f sha256:4611e65287b4556cd53c13034c1c58451a9e18d07938438ecb86f48050dd80cf |
| PRD | derived_from | UR | binding c85d7dbc-1ade-4ee4-8adf-17be40506c1b; reviewed by Claude Code implementing agent; cooperative source derivation review, not independent proof; .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/PRD_MAPPING_REVIEW-01.json |
| SD | derived_from | PRD | binding c45557dc-7dfa-44db-a22b-73b4212ecba4; reviewed by Claude Code implementing agent; cooperative source derivation review, not independent proof; .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD_MAPPING_REVIEW-02.json |
| TP | derived_from | SD | binding 1cd2f2cd-7c9b-4bec-8c4f-baa05e0ae055; reviewed by Claude Code implementing agent; cooperative source derivation review, not independent proof; .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/TP_MAPPING_REVIEW-01.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/PRD_MAPPING_REVIEW-01.json | PRD derived_from UR; binding c85d7dbc-1ade-4ee4-8adf-17be40506c1b; operation f75e1478-2f3d-4a8d-afd3-4196b0058676; bb852fbe-87dc-42a6-8a21-1cdeea4139da -> bde58d00-1110-4095-a649-3acd46d30bb0 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD_MAPPING_REVIEW-01.json | SD derived_from PRD; binding b31674bb-9948-4abd-ac38-92e327f6a280; operation 1deacfdf-3ef8-4976-ac71-e51f5b5e9605; 36e53e99-f4e3-411b-9868-1fe3953133ab -> b388f0ab-8deb-409e-a69b-7db45a1b7f74 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/SD_MAPPING_REVIEW-02.json | SD derived_from PRD; binding c45557dc-7dfa-44db-a22b-73b4212ecba4; operation 7d4a0733-3495-4eef-bb23-09951266c952; b388f0ab-8deb-409e-a69b-7db45a1b7f74 -> 8596ba15-3c24-4053-b008-77c000125078 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/TP_MAPPING_REVIEW-01.json | TP derived_from SD; binding 1cd2f2cd-7c9b-4bec-8c4f-baa05e0ae055; operation cdd62f48-b960-4c15-b3a2-24a209c30379; ab45aacb-e66b-4d09-a155-75c4a4e5153d -> d5edc53c-86a1-4156-838d-cabece23c8b6 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Run Brownfield Analysis for the approved TP scope before CD+Tests.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| c85d7dbc-1ade-4ee4-8adf-17be40506c1b | sha256:d711d681b63b04a942df1cd42bc95a27dd65c76365d31083438c0fab43dd9e2d | eyJiaW5kaW5nX2lkIjoiYzg1ZDdkYmMtMWFkZS00ZWU0LThhZGYtMTdiZTQwNTA2YzFiIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjAwNjZlNTNiOTIyZDBiNWRiZTRkZWNkYTJlMjYxYmUxOGNlMjE1YzY4NzUyYWZkMGE3MGQ1MzRmZjdjM2VlZGEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb2NrcGl0LWNsYXVkZS1ob3N0LTIwMjYxMDA4LTAxL1BSRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlBSRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJmNzVlMTQ3OC0yZjNkLTRhOGQtYWZkMy00MTk2YjAwNTg2NzYiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImJiODUyZmJlLTg3ZGMtNDJhNi04YTIxLTFjZGVlYTQxMzlkYSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImJkZTU4ZDAwLTExMTAtNDA5NS1hNjQ5LTNhY2Q0NmQzMGJiMCIsInJldmlzaW9uIjo2fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUFJEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJVUiJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmI2ODAxNDU3YjJkMmM5MzM0MzFiMWEyOGJjNDQ3Y2U2YjQ1MmVhMWZiMDUwYmZmYmUyMTU5MTE4YTUwYWRlYWMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb2NrcGl0LWNsYXVkZS1ob3N0LTIwMjYxMDA4LTAxL1BSRF9NQVBQSU5HX1JFVklFVy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDbGF1ZGUgQ29kZSBpbXBsZW1lbnRpbmcgYWdlbnQ7IGNvb3BlcmF0aXZlIHNvdXJjZSBkZXJpdmF0aW9uIHJldmlldywgbm90IGluZGVwZW5kZW50IHByb29mIn0sInJ1bl9pZCI6ImFnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6NWI3ZTMzZDdhNmE4NzQyYjQ4OTJkNzM5YjE5MDZiYjllNmEwNzc0ZjlkMmIzNzJiNGJhZTcwZDA4MDQyZmRlMCIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9hZ2RmLWNvY2twaXQtY2xhdWRlLWhvc3QtMjAyNjEwMDgtMDEvVVIubWQiLCJ0eXBlIjoiVVIifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmFmYjMxODczZWZhOTFkODkyYjkwNDY2MzEyNjhkNzlmMWM4Y2I0M2FhMzkyYzBlZjVlNGQyZmQ1MDAyOTNmMTAifQ |
| b31674bb-9948-4abd-ac38-92e327f6a280 | sha256:dbc62803d1585e03600c419d7fdcf7133fa52e20dc18882f0f4bce4128f64478 | eyJiaW5kaW5nX2lkIjoiYjMxNjc0YmItOTk0OC00YWJkLWFjMzgtOTJlMzI3ZjZhMjgwIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjY0ODJmNzBkMDU5MzlkM2M0MWQwYTE2ZTc0OTBhNzM2ODYwOWRmNzdiN2RkMDA4ODUzNWRjNzA0ZWM1M2I1MjMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb2NrcGl0LWNsYXVkZS1ob3N0LTIwMjYxMDA4LTAxL1NELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiU0QifSwib3BlcmF0aW9uIjp7ImlkIjoiMWRlYWNmZGYtM2VmOC00OTc2LWFjNzEtZTUxZjViNWU5NjA1IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiIzNmU1M2U5OS1mNGUzLTQxMWItOTg2OC0xZmUzOTUzMTMzYWIiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJiMzg4ZjBhYi04ZGViLTQwOWUtYTY5Yi03ZGI0NWExYjdmNzQiLCJyZXZpc2lvbiI6OH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlNEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJQUkQifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjowNmZiOTg0ZGJiNzQwZTgwZDhmMzQzOGM1Y2NjN2UyNDMzMzhiNWYxYzg5N2M2ZWFiMWQ3MmU1OTUwN2Y5NjliIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMS9TRF9NQVBQSU5HX1JFVklFVy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDbGF1ZGUgQ29kZSBpbXBsZW1lbnRpbmcgYWdlbnQ7IGNvb3BlcmF0aXZlIHNvdXJjZSBkZXJpdmF0aW9uIHJldmlldywgbm90IGluZGVwZW5kZW50IHByb29mIn0sInJ1bl9pZCI6ImFnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6MDA2NmU1M2I5MjJkMGI1ZGJlNGRlY2RhMmUyNjFiZTE4Y2UyMTVjNjg3NTJhZmQwYTcwZDUzNGZmN2MzZWVkYSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9hZ2RmLWNvY2twaXQtY2xhdWRlLWhvc3QtMjAyNjEwMDgtMDEvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YWZiMzE4NzNlZmE5MWQ4OTJiOTA0NjYzMTI2OGQ3OWYxYzhjYjQzYWEzOTJjMGVmNWU0ZDJmZDUwMDI5M2YxMCJ9 |
| c45557dc-7dfa-44db-a22b-73b4212ecba4 | sha256:9c1e835220f51940b835e097d0473cfc927685521358b26833bb2de94e1e8822 | eyJiaW5kaW5nX2lkIjoiYzQ1NTU3ZGMtN2RmYS00NGRiLWEyMmItNzNiNDIxMmVjYmE0IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmRkZTZlNzA3YzBkNjBhMWIzNTU2ODk0NjMyNDVmOTdjZDNhNmVlZjNiMmI5MTllNGYwN2FlMDY0MzMyOGEyNGEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb2NrcGl0LWNsYXVkZS1ob3N0LTIwMjYxMDA4LTAxL1NELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiU0QifSwib3BlcmF0aW9uIjp7ImlkIjoiN2Q0YTA3MzMtMzQ5NS00ZWVmLWJiMjMtMDk5NTEyNjZjOTUyIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiJiMzg4ZjBhYi04ZGViLTQwOWUtYTY5Yi03ZGI0NWExYjdmNzQiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI4NTk2YmExNS0zYzI0LTQwNTMtYjAwOC03N2MwMDAxMjUwNzgiLCJyZXZpc2lvbiI6OX0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlNEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJQUkQifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjplZGFjOGQ5NDlmNzM0YzM1OGE0MWZmYzYwMjBlYzcxNmY5NTBhODk4ZTUxZjM5ODJiOGM5NWM2MmI1YmMyZTQyIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMS9TRF9NQVBQSU5HX1JFVklFVy0wMi5qc29uIiwicmV2aWV3ZXIiOiJDbGF1ZGUgQ29kZSBpbXBsZW1lbnRpbmcgYWdlbnQ7IGNvb3BlcmF0aXZlIHNvdXJjZSBkZXJpdmF0aW9uIHJldmlldywgbm90IGluZGVwZW5kZW50IHByb29mIn0sInJ1bl9pZCI6ImFnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6MDA2NmU1M2I5MjJkMGI1ZGJlNGRlY2RhMmUyNjFiZTE4Y2UyMTVjNjg3NTJhZmQwYTcwZDUzNGZmN2MzZWVkYSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9hZ2RmLWNvY2twaXQtY2xhdWRlLWhvc3QtMjAyNjEwMDgtMDEvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjoiYjMxNjc0YmItOTk0OC00YWJkLWFjMzgtOTJlMzI3ZjZhMjgwIiwidGFyZ2V0X2lkIjoic2hhMjU2OmFmYjMxODczZWZhOTFkODkyYjkwNDY2MzEyNjhkNzlmMWM4Y2I0M2FhMzkyYzBlZjVlNGQyZmQ1MDAyOTNmMTAifQ |
| 1cd2f2cd-7c9b-4bec-8c4f-baa05e0ae055 | sha256:5adf0363f2e742d674de3241d1f9e8e45d0d090b40bad20cedfbd300a885f19b | eyJiaW5kaW5nX2lkIjoiMWNkMmYyY2QtN2M5Yi00YmVjLThjNGYtYmFhMDVlMGFlMDU1IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjEyMzJhMmY5NDAyOWI2NzhjZDcxZGU0ZTA3N2U2Yjg4ODBhODRmMGI1MDgxNDMwMjEzNWZkNmMwZjYzOTU5ZTgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1jb2NrcGl0LWNsYXVkZS1ob3N0LTIwMjYxMDA4LTAxL1RQLm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiVFAifSwib3BlcmF0aW9uIjp7ImlkIjoiY2RkNjJmNDgtYjk2MC00YzE1LWIzYTItMjRhMjA5YzMwMzc5IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiJhYjQ1YWFjYi1lNjZiLTRkMDktYTE1NS03NWM0YTRlNTE1M2QiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJkNWVkYzUzYy04NmExLTQxNTYtODM4ZC1jYWJlY2UyM2M4YjYiLCJyZXZpc2lvbiI6MTF9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJUUCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiU0QifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1Njo0Y2Q5ZWQ0OWZkYmVlNmNlNjA4OTA3YWFlMGRjMmM5N2IyMTFlMDc2YmM5OWFhNTZhZDQyNDc4ODNlM2UxOTNhIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMS9UUF9NQVBQSU5HX1JFVklFVy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDbGF1ZGUgQ29kZSBpbXBsZW1lbnRpbmcgYWdlbnQ7IGNvb3BlcmF0aXZlIHNvdXJjZSBkZXJpdmF0aW9uIHJldmlldywgbm90IGluZGVwZW5kZW50IHByb29mIn0sInJ1bl9pZCI6ImFnZGYtY29ja3BpdC1jbGF1ZGUtaG9zdC0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6ZGRlNmU3MDdjMGQ2MGExYjM1NTY4OTQ2MzI0NWY5N2NkM2E2ZWVmM2IyYjkxOWU0ZjA3YWUwNjQzMzI4YTI0YSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9hZ2RmLWNvY2twaXQtY2xhdWRlLWhvc3QtMjAyNjEwMDgtMDEvU0QubWQiLCJ0eXBlIjoiU0QifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmFmYjMxODczZWZhOTFkODkyYjkwNDY2MzEyNjhkNzlmMWM4Y2I0M2FhMzkyYzBlZjVlNGQyZmQ1MDAyOTNmMTAifQ |
