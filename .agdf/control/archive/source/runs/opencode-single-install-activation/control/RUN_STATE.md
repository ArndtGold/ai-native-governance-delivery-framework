# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-single-install-activation
- lifecycle: completed
- revision: 12
- revision_id: 8183dbf7-7063-4766-a982-e16f3a07b9e0
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Simplify OpenCode AGDF adoption to one global installation with explicit repository activation from
durable AGDF control state, without duplicating shared OpenCode runtime assets.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | One global OpenCode installation with durable repository activation, early routing, separated status and no generated local runtime duplication is implemented, reviewed, QA-approved and UAT-accepted. |
| What is approved? | UR revision 2, PRD revision 2, SD revision 2, TP revision 2, QA and UAT are approved; OR-full closes the governance lifecycle. |
| What is missing? | No governance artefact or approval. Authenticated interactive OpenCode restart, rendering and skill-selection observation remain unperformed post-release evidence. |
| What is the next allowed action? | Re-evaluate Product Maturity Roadmap PMR-5/PMR-6 using this accepted owner outcome. |
| What is explicitly forbidden right now? | Inferring live-host proof or performing automatic installation mutation, VCS, release, deployment or reinstall actions. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-07-17 after selected-run, same-gate, QA-report and durable-state revalidation. |
| UAT | approved | Exact `Approval: UAT` accepted on 2026-08-19 after selected-run, same-gate and Revision 11 revalidation with the live-host limit retained. |
| OR | done | OR-full `pass`; governance lifecycle completed without live-host, VCS, release or installation action. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/opencode-single-install-activation/UR.md` | approved | Revision 2 defines the approved single-install activation boundary. |
| Brownfield Review | `.agdf/control/artefacts/opencode-single-install-activation/BROWNFIELD_REVIEW.md` | done | Existing owners, collision risk and migration boundary support the structured-slice decision. |
| PRD | `.agdf/control/artefacts/opencode-single-install-activation/PRD.md` | approved | Revision 2 defines the approved activation, shared runtime, compatibility, permission and status requirements. |
| SD | `.agdf/control/artefacts/opencode-single-install-activation/SD.md` | approved | Revision 2 defines the approved activation, early guidance, permission, compatibility, status and verification ownership. |
| TP | `.agdf/control/artefacts/opencode-single-install-activation/TP.md` | approved | Revision 2 maps the approved design to six ordered implementation and verification tasks. |
| Brownfield Analysis | `.agdf/control/artefacts/opencode-single-install-activation/BROWNFIELD_ANALYSIS.md` | done | Existing helper, plugin, installer, scaffold and test seams support the approved implementation path. |
| TP Review | `.agdf/control/artefacts/opencode-single-install-activation/TASK_PLAN_REVIEW.md` | done | Pass: 6/6 approved tasks fully done. |
| Clean Implementation Review | `.agdf/control/artefacts/opencode-single-install-activation/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | One activation owner; no new duplicate runtime surface. |
| CD+Tests | `.agdf/control/artefacts/opencode-single-install-activation/CD_TESTS.md` | done | Approved TP tasks implemented with focused and aggregate repository evidence. |
| CR | `.agdf/control/artefacts/opencode-single-install-activation/CODE_REVIEW.md` | done | Pass: no remaining finding in reviewed scope. |
| QA | `.agdf/control/artefacts/opencode-single-install-activation/QA_REPORT.md` | pass | Pass decision accepted with exact QA approval. |
| UAT | `.agdf/control/artefacts/opencode-single-install-activation/UAT_EVIDENCE.md` | approved | Repository behavior accepted with authenticated live OpenCode observation retained as a non-claim. |
| OR | `.agdf/control/artefacts/opencode-single-install-activation/OR.md` | pass | OR-full records accepted delivery, compatibility boundary and resolved Context Graph impact. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Current OpenCode status | `opencode-status --json` on 2026-07-17 | Global plugin and skills are installed while this repository has no local OpenCode surface. | direct |
| Global plugin implementation | `create-agdf/opencode-plugin.js` | Current local-surface detection, shell environment and compaction-only routing behavior. | direct |
| Current installer and scaffold | `create-agdf/lib/installers/opencode.js`; `create-agdf/lib/scaffold/plan.js` | Global skills and repository-local duplication are separate current paths. | direct |
| Implementation and reviews | `CD_TESTS.md`; `TASK_PLAN_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md`; `QA_REPORT.md` | One durable activation owner, early routing, status separation, no new local runtime copies and reviewed QA readiness. | direct |

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR | approved_by | `Approval: UR` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | sizes | `structured_slice` | done | Existing global plugin, installer, scaffold, status and generated-asset owners can be extended without a second policy or runtime surface. |
| PRD | derived_from | UR | ready | Revision 1 is constrained by the structured-slice Brownfield Review and its collision-safe migration boundary. |
| PRD | approved_by | `Approval: PRD` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | ready | Revision 1 preserves the global plugin and prefixes while moving activation to durable control state. |
| SD | approved_by | `Approval: SD` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | ready | Revision 1 preserves the approved activation, compatibility and no-duplication constraints. |
| TP | approved_by | `Approval: TP` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation. |
| CD+Tests | fulfills | TP OSA-01 through OSA-06 | done | `CD_TESTS.md` records implementation and verification. |
| QA_REPORT | tests | TP | Pass: 6/6 task coverage, mandatory reviews and repository verification are recorded in `QA_REPORT.md`. |
| QA Report | derived_from | TP Review; Clean Review; Code Review | pass | `qa-gate` pass decision accepted at QA. |
| QA | approved_by | `Approval: QA` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, QA-report and durable-state revalidation. |
| UAT Evidence | validates | QA-passed repository behavior | approved | `UAT_EVIDENCE.md` records accepted repository behavior and the retained explicit live-host limitation. |
| UAT | approved_by | `Approval: UAT` | approved | Exact approval accepted on 2026-08-19 after selected-run, same-gate and Revision 11 revalidation. |
| OR | verifies | full run | pass | OR-full records accepted delivery, evidence limits, retained legacy compatibility and resolved Context Graph impact. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `UAT`
- scope_reason: The change alters repository activation semantics, global-plugin hooks, status, generated assets, legacy-local migration and public guidance, but it reuses established owners and does not change gate authority or durable control state.
- evidence: `.agdf/control/artefacts/opencode-single-install-activation/BROWNFIELD_REVIEW.md`; `create-agdf/opencode-plugin.js`; `create-agdf/lib/installers/opencode.js`; `create-agdf/lib/scaffold/plan.js`; `plugin/meta/agdf-plugin.definition.json`.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: existing nodes own native interaction, exact-version CLI composition and independent installation/activation status.

## Closeout

- delivered: single-install activation behavior, 6/6 tasks, mandatory reviews, QA/UAT acceptance, OR-full and Context Graph reconciliation.
- intentionally_not_delivered: authenticated live OpenCode observation, installation mutation, VCS, release, deployment and reinstall.
- next_allowed_action: Re-evaluate Product Maturity Roadmap PMR-5/PMR-6 using this accepted owner outcome.
- quality_outlook: Preserve one durable activation owner and obtain authenticated OpenCode evidence without reintroducing repository-local runtime duplication.
