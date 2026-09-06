# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-mcp-dispatch-server
- lifecycle: active
- revision: 1
- revision_id: B2B7A53C-8A4B-44C5-8E97-D996B17F4C26
- started_at: 2026-09-05
- mode: `undecided`
- current_gate: `UR`
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Provide one standard, cross-host MCP interface for bounded AGDF skill dispatch while preserving the
existing dispatcher, CLI verification path, target authority, durable control state and exact gate
approval semantics.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | AGDF has one shared dispatcher and a canonical semantic definition for `agdf_dispatch`; supported MCP hosts can in principle discover and invoke schema-described tools. |
| What is approved? | No gate approval is recorded for the MCP-server scope. |
| What is missing? | Review of UR Revision 1 and exact `Approval: UR`. |
| What is the next allowed action? | Review or refine the durable UR and request exact UR approval. |
| What is explicitly forbidden right now? | Brownfield Review, PRD, SD, TP, MCP implementation, host registration, permission mutation, installation, QA, UAT and release claims. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User explicitly chose on 2026-09-05 to document the cross-agent MCP-server intent before implementation.
- competing_scope_lines: `cross-surface-executable-skill-dispatcher` owns the existing dispatcher and remains at QA revise; `opencode-native-dispatch-tool` is an unapproved OpenCode-only permission proposal; `agdf-public-plugin-distribution` currently excludes MCP from its first release.
- branch_workspace_evidence: HEAD `54e7c1c65b3da9f8f43322de434c7ec1aa0bb671`; existing uncommitted dispatcher and control-evidence changes predate this run and remain outside its mutation scope.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: current dispatcher source and tests; current control artefacts; MCP specification; prior installed-host observations
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: new cross-host MCP dispatch capability
- excluded_mutation_targets: dispatcher implementation; existing run evidence; installed caches and host settings; public plugin candidate; approvals; unrelated workspace changes

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UR |
| Allowed now | Review or refine UR Revision 1. |
| Blocked by | Exact UR approval is missing. |
| Missing approval | `Approval: UR` |
| Next step | Review the UR and provide the exact approval, request revision or decline. |
| Quality outlook | Standardize the model-facing dispatch interface without creating a second governance owner or overstating host parity. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing | none |
| PRD | missing | none |
| SD | missing | none |
| TP | missing | none |
| QA | missing | none |
| UAT | missing | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-mcp-dispatch-server/UR.md` | draft | Revision 1 records the cross-host need, bounded MCP intent, acceptance criteria and authority boundaries. |
| Brownfield Review |  | missing | Allowed only after exact UR approval. |
| PRD |  | not_applicable | Not allowed before approved UR, Brownfield Review and Mode/Slice Decision. |
| SD |  | not_applicable | Not allowed. |
| TP |  | not_applicable | Not allowed. |
| QA |  | not_applicable | Not allowed. |
| UAT |  | not_applicable | Not allowed. |

## Mode / Slice Decision

- decision: `undecided`
- required_next_gate: `none`
- scope_reason: Existing dispatcher, package, host adapter, permission and public-distribution owners have not yet been assessed together for MCP reuse.
- evidence: `.agdf/control/artefacts/agdf-mcp-dispatch-server/UR.md`
- transparency_note: MCP is the approved direction to document, but transport, package shape and host support are not yet design authority.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | approval missing |
| PRD | derived_from | UR | not allowed |
| SD | derived_from | PRD | not allowed |
| TP | derived_from | SD | not allowed |
| QA_REPORT | tests | TP | not allowed |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Semantic function owner | `create-agdf/lib/skill-dispatch/contract.js` | canonical name, description and input schema | direct repository inspection |
| Dispatcher owner | `create-agdf/lib/skill-dispatch/service.js` | existing target, control, presentation and continuation behavior | direct repository inspection |
| Current dispatcher evidence | `cross-surface-executable-skill-dispatcher` control artefacts | repository tests and open host evidence | direct repository inspection |
| MCP protocol | `https://modelcontextprotocol.io/specification/2025-11-25/` | standardized tool and transport protocol | official external documentation |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Current MCP configuration, lifecycle and permission behavior per claimed host | blocks design and support claims | Inspect official host contracts and installed versions during Brownfield Review. |
| Package entrypoint and version-provenance fit | blocks design | Map current package, runtime and binding owners during Brownfield Review. |
| Relationship to the OpenCode-native dispatch proposal | blocks clean scope ownership | Decide reuse, narrowing or separation during Brownfield Review. |
| Loaded-host and native-OS behavior | blocks QA/UAT | Define later evidence matrix; do not infer from protocol or repository tests. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| MCP adapter duplicates AGDF policy or presentation logic. | warn | Keep the adapter thin and reuse canonical dispatcher owners. |
| Tool permission is mistaken for AGDF approval. | warn | Preserve `authorizes: false`, exact approval text and same-run revalidation. |
| Shared protocol is presented as automatic host parity. | warn | Require separate official and loaded-host evidence for every support claim. |
| Remote transport expands data, authentication or privacy scope. | warn | Keep the initial intent local, offline and without remote fallback. |
| Existing CLI removal weakens CI and recovery. | warn | Retain CLI verification and compatibility paths in the initial scope. |

## Context Graph Impact

- context_graph_impact: `pending`
- context_graph_refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `pending`
- context_graph_required_action: Brownfield Review must determine whether MCP is a new transport adapter under the executable dispatcher owner or requires a distinct bounded context node.
- context_graph_gate_effect: none before UR approval

## Closeout

- next_allowed_action: review or refine UR Revision 1
- quality_outlook: Prefer one semantically exact MCP tool over host-specific model command construction while retaining existing governance authority and evidence boundaries.
