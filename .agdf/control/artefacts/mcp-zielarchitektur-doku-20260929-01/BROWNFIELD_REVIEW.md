# Brownfield Review: MCP-Zielarchitektur als Diskussionsdokument

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `mcp-zielarchitektur-doku-20260929-01`
- related_ur: `.agdf/control/artefacts/mcp-zielarchitektur-doku-20260929-01/UR.md`
- current_gate: Brownfield Review
- reviewer: AGDF agent
- reviewed_at: 2026-09-29

## Objective

Route the approved UR for a non-normative target-architecture discussion document describing
candidate domain-facing MCP capabilities. The first slice documents proposals and open decisions;
it changes no MCP runtime, schema, policy, or canonical control owner.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The deliverable is repository architecture documentation; no host surface,
  interaction, visible state, or recovery behavior changes.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | User-approved UR; target MCP names and semantics remain undecided | UR explicitly scopes discussion and excludes API decisions | `low` |
| Source of truth | Runtime contracts and canonical tool definitions | `plugin/meta/contracts/`; `create-agdf/lib/skill-dispatch/contract.js`; `create-agdf/lib/control-inspect/contract.js` | `low` |
| Runtime path | Existing local stdio MCP server and shared dispatcher/evaluator services | `agdf-mcp-server/`; `create-agdf/lib/mcp-dispatch-runtime.js`; `docs/architecture/README.md` | `none` |
| UI / UX | Coding-agent host owns tool visibility and interaction | No host, tool schema, status rendering, or recovery behavior is changed | `none` |
| Persistence / data | Canonical control state remains in `.agdf/control/`; this slice adds only documentation | No run schema, stored business state, or migration changes | `none` |
| Tests / QA | Existing contracts and implementation remain untouched | Documentation-only scope; no runtime behavior to validate | `none` |
| Release / operations | Existing MCP lifecycle and release ownership | No package, host registration, deployment, or release change | `none` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `low`
- architecture_reason: The document discusses possible future externally consumed MCP capabilities,
  so it must preserve the existing contract and authority owners. Its proposals are explicitly
  non-normative and do not alter an interface or decision boundary.
- architecture_evidence: `docs/architecture/README.md` describes the two current tools;
  `create-agdf/lib/skill-dispatch/contract.js` owns `agdf_dispatch`; `create-agdf/lib/control-inspect/contract.js`
  and `selection.js` own read-only inspection; `plugin/meta/contracts/` remains the normative source;
  `.agdf/control/SOT_REGISTRY.md` assigns runtime contracts to `plugin/meta/contracts/` and marks
  user-facing explanation as secondary to runtime and CLI sources.
- architecture_missing_evidence: No missing fact for the bounded documentation slice. Final MCP
  capability names, write permissions, approval binding, and resource/tool allocation remain open
  design questions and are not settled by this proposal.
- architecture_next_owner_and_action: The AGDF maintainer and runtime-contract owner review the
  candidate model; any accepted API or authority change requires its own approved scope and canonical
  contract update before implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| unresolved — target proposals could be mistaken for a second MCP contract or for accepted approval semantics | Existing semantic owners are `skill-dispatch/contract.js`, `control-inspect/contract.js`, runtime contracts, and canonical control services; `CG-MCP-DISPATCH-ADAPTER` records the adapter boundary | `revise` if candidate names appear normative; otherwise `warn` | Label the document as a discussion, distinguish implemented/decided/candidate/open status, and keep schemas and policy in existing owners |
| trade-off — existing architecture material is version-scoped and may age | `docs/architecture/README.md` is dated 2026-09-09 and distinguishes the 0.14.5 baseline from the next development version | `warn` | State the observed baseline and release status precisely; do not rewrite unrelated lifecycle claims in this slice |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — one coherent, independently reviewable target-architecture
  discussion document plus a navigation link; no runtime or canonical API change.
- evidence: Approved UR; existing semantic tool owners identified; candidate content can be labeled
  non-normative; one documentation owner/maintainer path; no data or runtime change; local revert
  restores the prior state; independent acceptance is the complete document and working link.
- transparency_note: Quick Task is not selected because the approved scope is a formal architecture
  discussion with unresolved interface questions. Structured Delivery is not selected because no
  public contract, authority boundary, runtime, persistence, cross-host rollout, or release behavior
  changes in this slice. The PRD must preserve the proposal-only boundary.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: `none — candidate interface discussion only; no protocol, public API,
  permission, policy, runtime, persistence, deployment, or cross-host behavior changes`
- rejected_alternative: `structured_delivery` — would add process depth without a coordinated external
  contract or operational change; `quick_task` — ineligible for this formal architecture scope.
- missing_or_conflicting_facts: `none for this documentation slice; API and approval design remain
  explicit open questions for a future scope`
- depth_evidence_refs: `UR.md`; `docs/architecture/README.md`; `plugin/meta/contracts/`;
  `create-agdf/lib/skill-dispatch/contract.js`; `create-agdf/lib/control-inspect/contract.js`;
  `.agdf/control/SOT_REGISTRY.md`; `.agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One target-architecture discussion document and one link, accepted independently by review. |
| authority_boundary | `pass` | Existing policy, semantic tool contracts, control state, and human approval owners remain unchanged; candidate proposals are non-normative. |
| owner_consumer_coordination | `pass` | One repository documentation/maintainer path; no host or external consumer cutover. |
| full_depth_impacts_absent | `pass` | No runtime, public schema, permission, policy, persistence, CLI, release, or cross-host change. |
| migration_propagation_bounded | `pass` | Only a new Markdown document and a local navigation link; reversible in the repository. |
| failure_recovery_local | `pass` | A documentation error is corrected or reverted locally; no distributed state or runtime recovery. |
| independently_acceptable | `pass` | The discussion document and its navigation link form a complete deliverable without a later runtime change. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which candidate capability groups should become actual MCP contracts, and which remain in Skills/CLI? | `PRD` | `warn` |
| What evidence and host interaction would be required before any MCP command could record a human decision? | `PRD` | `warn` |
| Which stable operations belong as Tools, Resources, or Prompts, and how should compatibility be versioned? | `SD` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The deliverable records candidate questions, not an accepted architecture
  decision or reusable runtime fact. Existing MCP ownership remains unchanged; update the graph only
  after a later scope accepts a target decision.

## Next Permissible Step

- next_allowed_action: Draft the bounded PRD for the target-architecture discussion slice, preserving
  the non-normative status and resolving the before-PRD product/scope decisions.
- forbidden_until_then: Do not create or change MCP schemas, server behavior, authorization, approval
  recording, or control-state ownership.

## Quality Outlook

- quality_outlook: `revise` until PRD scope and candidate/open status are made explicit; no runtime
  test or host evidence is required for this documentation-only review.
