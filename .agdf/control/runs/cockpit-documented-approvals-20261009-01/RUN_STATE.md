# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cockpit-documented-approvals-20261009-01
- lifecycle: active
- revision: 7
- revision_id: be3171c6-5d3e-47cc-bed1-cce6071b53d8
- content_seal: sha256:f195dc85a2f55841fa6b9ae73ee02e0ee02dc29060a5eb61abeb843fe18ea1fc
- approval_seal: sha256:1eeaf6ff15f46640ab148a057ad08311a20e24752a8c676445ef30849e9cf2a7
- updated_at: 2026-10-09T16:19:20.883Z
- mode: structured_slice
- current_gate: SD
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval recorded for PRD; current gate is SD. |
| What is approved? | Approval: UR, Approval: PRD |
| What is missing? | Exact Approval: SD. |
| What is the next allowed action? | Draft or refine the Solution Design; do not implement before SD and TP are approved. |
| What is explicitly forbidden right now? | create TP; implement code; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-09 · revision 2 · `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/UR.md` sha256:457a950bc4207fd8 · presentation ad5b75c3-7f70-476c-8ab2-cecb89c0a854 sha256:0c20e24d714c420c7abc0780c79cae9881d5cba3fa069a4f343fba9eb8e1b269 |
| PRD | approved | `Approval: PRD` · 2026-10-09 · revision 6 · `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/PRD.md` sha256:e2f8d2c3e1ca6ef9 · presentation 3ee87263-4704-4ba6-bfb9-2ee04f113eef sha256:fee01d763d5cfa61ef78d1d07a382a628b770659b6e59c7b3136d5fdeef68ae2 |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/BROWNFIELD_REVIEW.md` | done |  |
| UX Intent Definition | `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/UX_INTENT_DEFINITION.md` | done | Analytical input ready; preserves approved UR. |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/cockpit-documented-approvals-20261009-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| Binding proof 41eb0645-bfa5-4ceb-ab1d-550e7c9ead88 | .agdf/control/artefacts/cockpit-documented-approvals-20261009-01/PRD_MAPPING_93da81fa-b62e-4dbc-91e2-0b28b6ef9611.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: compact documented approvals with truthful current-version fallback in existing read-only owners; reject quick_task and dirty-baseline verified_change, no full-depth boundary impact.
- evidence: .agdf/control/artefacts/cockpit-documented-approvals-20261009-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-09 · revision 2 · `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/UR.md` sha256:457a950bc4207fd8 · presentation ad5b75c3-7f70-476c-8ab2-cecb89c0a854 sha256:0c20e24d714c420c7abc0780c79cae9881d5cba3fa069a4f343fba9eb8e1b269 |
| PRD | derived_from | UR | binding 41eb0645-bfa5-4ceb-ab1d-550e7c9ead88; reviewed by Codex (PRD derivation review); .agdf/control/artefacts/cockpit-documented-approvals-20261009-01/PRD_MAPPING_93da81fa-b62e-4dbc-91e2-0b28b6ef9611.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| Artefact source binding | .agdf/control/artefacts/cockpit-documented-approvals-20261009-01/PRD_MAPPING_93da81fa-b62e-4dbc-91e2-0b28b6ef9611.json | PRD derived_from UR; binding 41eb0645-bfa5-4ceb-ab1d-550e7c9ead88; operation b07ef0ff-4405-42bf-8400-250de0296427; 2bf91dcf-74a4-4539-b4c8-0385a2308407 -> 7bb8a871-c696-4940-9356-eb601255ba93 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Draft or refine the Solution Design; do not implement before SD and TP are approved.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 41eb0645-bfa5-4ceb-ab1d-550e7c9ead88 | sha256:e70990c409c033afcde31c1a48c214abce387b602699dcfef69c533d624a87bd | eyJiaW5kaW5nX2lkIjoiNDFlYjA2NDUtYmZhNS00Y2ViLWFiMWQtNTUwZTdjOWVhZDg4IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmUyZjhkMmMzZTFjYTZlZjk3OTE1ZGM1NDdlNzYwMTJlZDQ5ZmZjYzZlNWE2YWFkODM1ZWFiODdiMWFmYWNhMjgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kb2N1bWVudGVkLWFwcHJvdmFscy0yMDI2MTAwOS0wMS9QUkQubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJQUkQifSwib3BlcmF0aW9uIjp7ImlkIjoiYjA3ZWYwZmYtNDQwNS00MmJmLTg0MDAtMjUwZGUwMjk2NDI3IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiIyYmY5MWRjZi03NGE0LTQ1MzktYjRjOC0wMzg1YTIzMDg0MDciLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI3YmI4YTg3MS1jNjk2LTQ5NDAtOTM1Ni1lYjYwMTI1NWJhOTMiLCJyZXZpc2lvbiI6Nn0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlBSRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiVVIifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1Njo0NTMyNGUwMWMzYjRlZGRkYTMxOTlmMGYyOWU0NWJhZWY1YmZmNWZiYTA1NjcyZDNiMGE0YTRlMDRhNDMzNDhhIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2NvY2twaXQtZG9jdW1lbnRlZC1hcHByb3ZhbHMtMjAyNjEwMDktMDEvUFJEX01BUFBJTkdfOTNkYTgxZmEtYjYyZS00ZGJjLTkxZTItMGIyOGI2ZWY5NjExLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IChQUkQgZGVyaXZhdGlvbiByZXZpZXcpIn0sInJ1bl9pZCI6ImNvY2twaXQtZG9jdW1lbnRlZC1hcHByb3ZhbHMtMjAyNjEwMDktMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjQ1N2E5NTBiYzQyMDdmZDhjZTE2OThhYzBjMjkxM2M4YzMwZDg2ZDE5YWUwZGQ3NjQwMjkxZTIzMGE3YTM0YTkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1kb2N1bWVudGVkLWFwcHJvdmFscy0yMDI2MTAwOS0wMS9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
