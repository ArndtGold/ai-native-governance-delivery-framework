# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-local-plugin-install-scripts
- lifecycle: completed
- revision: 17
- revision_id: 2f2dbd43-cfe6-4a1a-9983-b470444eeca7
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make local AGDF plugin installation from the current source checkout simple, safe and consistently verifiable across supported coding-agent surfaces without duplicating installer authority.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The fresh Codex task loads AGDF skills and the validator from `0.13.5+codex.local-619acdcbd1f9`; plugin list and cache manifest expose the same identity. UAT is approved and the OR is complete. |
| What is approved? | UR, PRD, SD, TP, QA and UAT are approved by exact user approvals on 2026-08-23. |
| What is missing? | Nothing within the accepted Codex UAT boundary. |
| What is the next allowed action? | Use delivery closeout only when the user explicitly requests a commit, push or pull request handoff. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, release, publication or deployment. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided by the user on 2026-08-23 for revision 1 (`93fb5ec5-5fba-4d47-bae3-f13840a17c96`) and revalidated before persistence. |
| PRD | approved | `Approval: PRD` provided by the user on 2026-08-23 for revision 4 (`6911b3b2-ada8-428c-8ae0-ee1935fbbf7d`) and revalidated before persistence. |
| SD | approved | `Approval: SD` provided by the user on 2026-08-23 for revision 6 (`b3e62510-408a-4d8e-9d60-e772c9547fb2`) and revalidated before persistence. |
| TP | approved | `Approval: TP` provided by the user on 2026-08-23 for revision 8 (`aec6c6d7-2978-461e-81f6-b60f64d1232e`) and revalidated before persistence. |
| QA | approved | `Approval: QA` provided by the user on 2026-08-23 for revision 11 (`caba7c09-2d32-4dd1-83d0-8e1bb1f4a710`) and revalidated immediately before persistence. |
| UAT | approved | `Approval: UAT` provided by the user on 2026-08-23 for revision 16 (`13565830-7291-412f-91aa-3cd8acc0114d`) and revalidated immediately before persistence. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UR.md` | approved | Simple local installation intent and boundaries. |
| Brownfield Review | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/BROWNFIELD_REVIEW.md` | done | Existing owners and bounded Structured Slice path are evidenced. |
| Verified Change |  | not_applicable | Structured Slice mode was selected. |
| PRD | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/PRD.md` | approved | Exact commands, working modes, acceptance criteria and evidence boundaries. |
| SD | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/SD.md` | approved | Thin aliases, deterministic Codex cache projection and durable local OpenCode package transport. |
| TP | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/TP.md` | approved | Fifteen tasks cover owners, implementation, isolation, reviews, QA and UAT preparation. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation owner, path, reuse and regression analysis passes. |
| CD+Tests | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/CD_TESTS.md` | done | Approved implementation and isolated plus full evidence pass. |
| CR | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/CODE_REVIEW.md` | done | Code Review passes with no open finding. |
| QA | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/QA_REPORT.md` | pass | QA decision passes and exact user approval is recorded separately. |
| UAT Preparation | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UAT_INSTRUCTIONS.md` | executed | The selected Codex real-host path was executed; Claude Code and OpenCode host execution were not required by the accepted boundary. |
| UAT Evidence | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UAT_EVIDENCE.md` | pass | Post-repair fresh task loads skills and validator from the exact suffix cache; manifest and plugin list agree. |
| OR | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/OR.md` | pass | Full closeout reports delivery, evidence, boundaries, risks and the next permissible handoff. |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: `bounded_structured_slice`; one coherent contributor installation outcome delegates to existing owners, remains locally reversible and independently verifiable, while Quick Task and Verified Change cannot cover the executable cross-surface paths and Full Structured Delivery has no decisive trigger.
- evidence: `.agdf/control/artefacts/agdf-local-plugin-install-scripts/BROWNFIELD_REVIEW.md`; root and `create-agdf` package manifests; existing build, marketplace, lifecycle, OpenCode and test owners.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | defines | local plugin installation scope | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UR.md` |
| UR | approved_by | `Approval: UR` | User input on 2026-08-23 after revalidation of revision 1. |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/BROWNFIELD_REVIEW.md` |
| PRD | derived_from | UR | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/PRD.md`; approved UR and Brownfield Review. |
| PRD | approved_by | `Approval: PRD` | User input on 2026-08-23 after revalidation of revision 4. |
| SD | derived_from | PRD | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/SD.md`; approved PRD and Brownfield owner evidence. |
| SD | approved_by | `Approval: SD` | User input on 2026-08-23 after revalidation of revision 6. |
| TP | derived_from | SD | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/TP.md`; approved SD and PRD acceptance criteria. |
| TP | approved_by | `Approval: TP` | User input on 2026-08-23 after revalidation of revision 8. |
| Brownfield Analysis | prepares | TP | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/BROWNFIELD_ANALYSIS.md` |
| CD+Tests | implements_and_tests | TP | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/CD_TESTS.md` |
| Code Review | reviews | CD+Tests | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/CODE_REVIEW.md` |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/QA_REPORT.md`; 15/15 tasks, 11/11 UX rows and all mandatory reviews pass. |
| QA_REPORT | approved_by | `Approval: QA` | User input on 2026-08-23 after revalidation of revision 11. |
| UAT Preparation | prepares | UAT | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UAT_INSTRUCTIONS.md`; the selected Codex real-host path was executed. |
| UAT Evidence | evidences | UAT | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UAT_EVIDENCE.md`; direct post-repair host evidence resolves `UAT-LPI-01`. |
| UAT Evidence | approved_by | `Approval: UAT` | User input on 2026-08-23 after revalidation of revision 16. |
| OR | summarizes | completed run | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/OR.md`; UAT-approved full closeout. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| User request for simple AGDF npm installation commands comparable to Project Inventory | User input, 2026-08-23 | User need and reference behavior | direct |
| Existing `codex`, `claude` and `opencode` lifecycle commands | `create-agdf` CLI and installer modules | Existing lifecycle authority | direct |
| No matching repository npm scripts | Root, `create-agdf` and `agdf` package manifests | Current developer-entrypoint gap | direct |
| Existing owner and proportional path analysis | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/BROWNFIELD_REVIEW.md` | Reuse strategy, cross-surface impact and Structured Slice selection | direct |
| Full implementation and test evidence | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/CD_TESTS.md` | Exact aliases, local identities, provenance, failure boundaries and regression evidence | strong |
| Mandatory reviews | `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md`; `QA_REPORT.md` | Plan coverage, integrity, code quality and QA decision | strong |
| Codex installation and loaded-host comparison | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UAT_EVIDENCE.md` | First negative observation, repair, and passing restarted loaded-runtime proof | strong |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Existing node updated with the source-checkout installation alias ownership boundary.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The source-checkout alias boundary is reusable for future AGDF installer and packaging work.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- next_allowed_action: Use `delivery-closeout` only if the user explicitly requests a commit, push or pull request handoff.
- quality_outlook: Preserve direct restarted-host checks whenever installer identity, cache selection or host activation behavior changes.
