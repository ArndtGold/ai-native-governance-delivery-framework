# Brownfield Review: Concrete Run and UAT decision content

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: run-uat-content-readiness-20261014-01
- related_ur: .agdf/control/artefacts/run-uat-content-readiness-20261014-01/UR.md
- current_gate: Brownfield Review
- reviewer: Coding agent, cooperative source review
- reviewed_at: 2026-10-14

## Objective

Size and route the approved correction: required Run content cannot remain a template placeholder at a decision boundary; UAT must explain actual delivered outcome, acceptance and material limits using current authoritative sources. G-00 is the recorded exact UR approval at revision 4. No implementation or other approval is inferred.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: This bounded correction changes decision-ready versus missing-content feedback and the information used for the existing UAT primary approval. Existing gate order and user decision authority remain intact.
- ux_intent_definition_required: yes
- ux_intent_definition_result: blocked

The required UX analysis is not yet recorded. This is an internal preparation gap, not a user decision: route the existing ux-intent-definition owner before PRD readiness. Sizing facts are complete; PRD is not ready until that analysis is ready.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Existing Run, UAT and gate/content readiness | Approved UR; prior immutable UAT document and final-doctor.json in report-decision-field-hardening-20261014-01 | medium |
| Source of truth | Registered UR/PRD/SD/TP/QA and current writer-owned results | decisionMaterial prerequisiteTypes and exact digests in packages/core/lib/control-state/presentation-decision.js | low |
| Runtime path | Core readiness, renderer and presentation/approval writer | packages/core/lib/control-evaluation/gate-check.js; doctor.js; control-state/run-presentation-render.js; run-presentation.js | medium |
| UI / UX | Core localized approval summary and immutable UAT document | run-presentation-render.js renderReviewableApproval UAT currently lists associations; interaction-presentation.js resolveHumanRunTitle can use Objective | medium |
| Persistence / data | Existing sealed Run and presentation documents/receipts | run-state-repository.js DEFAULT_BODY contains the observed placeholder; run-presentation.js retains exact documents and bindings | low |
| Tests / QA | Existing presentation, document, readiness, decision and localization suites | packages/core/test/presentation-document-test.js; presentation-decision-test.js; artifact-readiness-test.js; packages/cli/scripts/operational-localization-test.js | medium |
| Release / operations | Standard generator, assembly and supported local installer | Existing exact payload ceiling; previous completed Run's qualification identifies final installed build 1830ec6d596b and old loaded generation separately | low |

Current coverage is partial: exact sources, deliberate approvals and immutable documents already exist; required concrete Objective/UAT result readiness is missing. Reuse strategy is extend existing Core readiness and source-authored summary/presentation owners, never add a new delivery/QA store or consumer policy.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: low
- architecture_reason: Required-content observation and source-derived presentation must agree across readiness, preparation, document inspection and approval revalidation. This is a local consistency/compatibility change within existing owners.
- architecture_evidence: decisionMaterial already binds UAT prerequisite sources; renderReviewableApproval derives current evidence associations and hashes its generated UAT document; run-presentation.js compares exact refreshed bindings.
- architecture_missing_evidence: none for sizing; exact minimum fields, semantic source selection and readiness propagation are downstream PRD/SD decisions within this approved scope.
- architecture_next_owner_and_action: PRD defines concrete stage-required information and compatibility; SD selects one shared read-only readiness/derivation owner and tests affected consumers.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: template Objective can reach decision output | run-state-repository.js DEFAULT_BODY; completed prior Run UAT chat and final doctor pass | warn | Existing PRD/content-readiness owner defines stage-appropriate detection; preserve authorable intake and completed history |
| problem: UAT currently summarizes source associations instead of delivered outcome | run-presentation-render.js UAT branch | warn | Existing presentation owner derives a decision brief from authoritative current sources; inspection and chat share exact material |
| problem: duplicate acceptance/summary authority would create drift | Existing approved sources, artifactSummary and decisionMaterial | warn | SD must retain one derivation/validation owner and source attribution; no mutable parallel UAT record |
| problem: stricter checks could retroactively block historical or draft material | Existing historical presentation and completed-Run rules | warn | PRD/SD distinguish new/current decision preparation from immutable history and incomplete draft authoring |

No debt is knowingly accepted by this review; no fallback/store is introduced. Any later discovered full-depth effect requires route reassessment before implementation. No architecture diagram is necessary to settle this bounded ownership map.

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: one bounded decision-content correction using current Core source, readiness, rendering and writer owners; no new authority, stored schema, public protocol/CLI field, migration or coordinated host release. Quick is ineligible because decision-content and missing-content feedback semantics need product/compatibility decisions; Verified Change is ineligible because readiness/approval consumers are affected. Full delivery is rejected because all seven bounded-slice conditions are positively evidenced.
- evidence: .agdf/control/artefacts/run-uat-content-readiness-20261014-01/BROWNFIELD_REVIEW.md
- transparency_note: Existing structured gates remain, with concise artefacts covering only this correction. Required UX analysis is an internal prerequisite before PRD, not another human gate.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: quick_task and verified_change for changed decision-content/readiness semantics; structured_delivery because no evidenced full-depth boundary effect exists
- missing_or_conflicting_facts: none for route selection
- depth_evidence_refs: Approved UR; inspected Core owners and tests above; completed prior Run UAT document/doctor reproduction

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR AC-001 through AC-005 define concrete decision content and exact installed acceptance |
| authority_boundary | pass | Existing approvals, authoritative artefacts and writers remain; content observation neither decides QA nor authorizes delivery |
| owner_consumer_coordination | pass | Core readiness/render/prepare/revalidation and their derived host output remain inside one bounded correction, with no external cutover |
| full_depth_impacts_absent | pass | No new permission/security boundary, execution engine, persistent schema/migration, public protocol/CLI fields or release/host activation is requested |
| migration_propagation_bounded | pass | Standard generated runtime copies and local supported installer; no history rewrite or repository-wide backfill; source change is locally reversible |
| failure_recovery_local | pass | Existing gap diagnosis and unapproved-authoring/revision owners; retain historical bytes and exact stale-source guards; no durable retry mechanism added |
| independently_acceptable | pass | Source/package plus final installed positive/negative decision flows qualify this scope without native-click/new-session or neighboring-Run completion |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which required concrete fields and stage-specific missing-content states form the brief, including QA deviations and evidence limits? | PRD | warn |
| Which current source-authored sections and existing readiness owner produce a single consistent projection/binding without parallel authority? | SD | warn |
| Which exact protected-history, refusal-state and installed/localization scenarios prove the approved behavior? | TP | warn |

These are bounded next-stage decisions, not missing route facts or user intent. Required UX defines working-mode/feedback intent before PRD drafting.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing ownership retained; reproduction and local source findings belong to this Run. No graph mutation or external memory update is requested.

## Next Permissible Step

- next_allowed_action: Record this bounded route, perform required UX Intent Definition, then draft the scoped PRD using current sources and analytical inputs.
- forbidden_until_then: PRD approval while UX is blocked; SD, TP, implementation, publication and automatic VCS actions.

## Quality Outlook

- quality_outlook: Required UX preparation pending; no implementation or new candidate qualification has occurred. Preserve the prior completed fixes and uncommitted neighboring work during later implementation analysis.
