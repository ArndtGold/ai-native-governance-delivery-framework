# Brownfield Review: Bound preview access at PRD approval

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: prd-preview-review-integration-20261018-01
- related_ur: .agdf/control/artefacts/prd-preview-review-integration-20261018-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex, cooperative source inspection
- reviewed_at: 2026-10-18

## Objective

Size the approved integration of a retained, verifiable UI preview into the existing PRD review and deliberate approval flow. No implementation or later gate approval is performed by this review.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: Reviewers gain executable illustrative content beside a consequential PRD decision; unavailable and changed evidence must affect the same native and text decision without creating another approval authority.
- ux_intent_definition_required: yes
- ux_intent_definition_result: blocked

The result above means required UX analysis is still pending at this routing checkpoint. This review's sizing and routing are complete; PRD readiness remains closed until a separately recorded ready UX analysis exists. No preview use or feedback is claimed here.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; PRD authoring contract | UR Scope and Acceptance Signals; plugins/agdf/meta/contracts/prd-definition.md | high: exact reviewed behavior and open decisions must remain distinguishable from illustrative visual details |
| Source of truth | Core analytical source inspector and decision material | packages/core/lib/control-evaluation/definition-sources.js; packages/core/lib/control-state/presentation-decision.js | high: UX currently verifies report readiness, while decision material hashes registered source documents, not preview files |
| Runtime path | Presentation prepare and revalidation | packages/core/lib/control-state/run-presentation.js, binding and validateRunPresentation | high: reuse the immutable record and fresh validation instead of an independent approval mechanism |
| UI / UX | Decision card, entry and session | packages/control-ui/src/mcp/DecisionCard.tsx; DecisionEntry.tsx; packages/core/lib/control-inspect/decision-session.js | high: current document access renders passive Markdown and has no bound interactive-preview access |
| Persistence / data | Presentation record and existing approval material receipts | packages/core/lib/control-state/run-presentation.js; presentation-decision.js | high: new material must be represented without silently changing historical record interpretation |
| Tests / QA | Exact presentation document and decision tests | packages/core/test/presentation-document-test.js; packages/control-ui/test/decision-card.test.tsx; decision-entry.test.tsx | medium: reuse genuine file/session/UI test paths; replay fixtures alone cannot verify the feature |
| Release / operations | Existing package generation and runtime distribution | packages/cli generated package assembly; plugins/agdf/meta/contracts/interaction.md | medium: source change is separate from installed-host activation; no release or install is in scope |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Executable preview content crosses a boundary into a consequential decision surface; exact preview files need an explicit compatible representation in persisted presentations and approval material.
- architecture_evidence: DecisionCard currently exposes one passive document button and one approve action; run-presentation validates strict versioned presentation envelopes; presentation-decision constructs approval material from named registered source documents.
- architecture_missing_evidence: SD must decide the precise compatible binding format and isolated read/render transport. Native host support remains unqualified until tested in the actual host.
- architecture_next_owner_and_action: sd-definition must specify existing owner extensions, isolation, fresh validation, compatibility and recovery before TP or implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: preview evidence is not machine-enforced | definition-sources.js checks ready UX report but no preview bytes; presentation-decision.js lists registered source types | revise | PRD must define observable rejection cases; SD extends the existing source and material owners |
| problem: executable content must not inherit decision authority | DecisionCard owns approve submission; preview content will be supplied by source files | revise | SD must isolate content and deny access to approval controls, host bridge and arbitrary files/network |
| unresolved: compatible representation of preview material | strict schemas in run-presentation.js and decision receipts | revise | SD decides versioned representation and historical validation without rewriting historical evidence |
| problem: generic links are insufficient for access | DecisionCard renders PassiveMarkdown with no active document links; current port reads only the gate document | revise | Extend existing decision session and view with checked read-only access; accurately report capability limits |
| problem: early branch edits are already present | git status includes UR/UX/PRD contracts, templates, handbook and evaluation changes | warn | Preserve this baseline; implementation diff and tests must distinguish inherited guidance from new runtime enforcement |

No debt is accepted by this review. Unresolved design details are routed to SD; they do not prevent identifying the affected trust and persistence boundaries or choosing structured delivery.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: isolate executable illustrative content from a binding approval action and enforce exact external material; persistence and compatibility-sensitive presentation contracts also change. Reject quick_task and verified_change because this expands decision behavior and persistent/runtime contracts. Reject structured_slice because authority and external-contract full-depth triggers are evidenced.
- evidence: Existing-System View, Architecture Impact and Structured Depth Evidence in this report; approved UR Scope.
- transparency_note: This is one coherent outcome, but its trust, persisted-binding and cross-surface behavior require the existing PRD, SD and TP approvals. No additional preview gate is introduced. Implementation remains forbidden.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: Authority/policy/security: new executable-content isolation at decision surface; persistence/data: compatible extension of exact presentation material; external contract: checked preview projection for native and text review.
- rejected_alternative: structured_slice lacks a positive authority_boundary and full_depth_impacts_absent result; compact modes exclude these changes.
- missing_or_conflicting_facts: none needed to select depth; technical representation and actual host qualification remain explicit SD/validation work.
- depth_evidence_refs: packages/core/lib/control-state/run-presentation.js; packages/core/lib/control-state/presentation-decision.js; packages/core/lib/control-inspect/decision-session.js; packages/control-ui/src/mcp/DecisionCard.tsx; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One review task: inspect exact proposed interaction and deliberately approve the same PRD basis |
| authority_boundary | fail | Executable preview isolation beside existing approve action must be added and verified |
| owner_consumer_coordination | pass | Core presentation/session and the existing UI are identified; no external service replacement |
| full_depth_impacts_absent | fail | Persisted presentation and externally consumed decision read contracts need compatible changes |
| migration_propagation_bounded | unknown | SD must decide compatibility of historical presentations and runs with no preview |
| failure_recovery_local | pass | Missing/changed evidence returns to its current source owner and fresh presentation; no automatic approval or release |
| independently_acceptable | pass | UR acceptance signals define one end-to-end flow and explicit failure cases |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which visible task and recovery states make preview access and PRD approval unambiguous? | PRD | revise: UX analysis must propose criteria before PRD readiness |
| What exact evidence schema and session read path isolate preview content while preserving historical proof? | SD | revise: design must be resolved before implementation |
| Which host can actually render the proposed access and what is the accurate fallback? | SD | revise: specify capability behavior and qualification evidence |
| Should the illustrative product allow approval with an important missing proof? | none | warn: deliberately unanswered example policy; not a decision about AGDF PRD evidence readiness |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Findings are run-specific preparation retained in this report; no graph claim or new node.
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: Keep current inspection and future evidence with this run; no personal memory update.
- memory_refs: .agdf/control/artefacts/prd-preview-review-integration-20261018-01/BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Record this route, complete UX Intent Definition, then draft and present the PRD under the existing owner.
- forbidden_until_then: No SD, TP, implementation, QA or release before their existing prerequisites.

## Quality Outlook

- decision: revise
- quality_outlook: Routing is complete. Required UX evidence is pending; implementation must later prove file checks and actual decision-view interaction. This review grants no product approval or host qualification.
