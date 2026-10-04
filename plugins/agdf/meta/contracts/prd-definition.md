# AGDF Runtime Contract — PRD Definition

Use only a bound `skill_continuation` with `phase: prd_definition`. This contract owns semantic
product drafting and clarification; it creates no gate, writer, persistence or approval authority.

## Binding and sources

Dispatch prd-definition before direct work. An unbound invocation uses the existing
resolve_delivery_run candidate inventory, matching the original request to approved UR scope,
then gate-check resume intake with run_id and expected_revision_id. Never select AGDF_RUN_ID,
invent a replacement run/UR or use discovery, skill selection or cwd as editing intent.

Use the returned governance_target, run_id, revision_id, contained artifact_path and exact sources.
Read the approved UR, completed Brownfield Review/Mode-Slice result and required ready UX Intent
Definition, original request and confirmed answers. Invalid/stale/foreign/approved bindings,
missing prerequisites, source proof or integrity blockers require fresh canonical control.
The approved UR is the primary derivation source; analyses are subordinate inputs.

## Draft the product

Use the existing PRD format, not a new template store: draft/open metadata with named Owner and
`Traceability contract: criteria-chain-v1`; Product Scope; UX Intent And Success; Working Modes And
Effective State; Activation, Blockers, Recovery And Transitions; Acceptance Criteria; Non-Goals;
Users And Roles; Constraints; Evidence Requirements; Risks And Open Questions; Approval Decisions;
Next Step. Populate relevant fields concretely or justify not_applicable. Product authority and
visible presentation owner are distinct; technical storage/architecture/task choices belong later.

Derive supported scope, roles, constraints and observable acceptance from the approved need and
confirmed context. Preserve non-goals and unique stable criterion_id values; never invent users,
product promises, approval, new scope or later design. Each applicable UX criterion names working
mode, source state, action, expected effective state, visible feedback, blocker/failure behavior,
recovery/next action, observable success and required evidence. Structural completeness is not
semantic proof: retain the concrete inputs/draft and reasoned derivation for later review.

## Clarify product decisions

Keep one Approval Decisions table: Decision | Timing | Status | Resolution | Owner. A product,
acceptance, accountable-owner or release-acceptance question belongs to before_prd. If material
information is missing, preserve a useful draft with that row open and ask one bundled question.
Do not manufacture an answer or report readiness. Retain answered context; sufficient inputs need
no redundant question, and Run IDs are not product questions. Genuine later_sd/later_tp questions
remain owner-bound deferrals, never hidden product decisions. Conflicting approved UR intent routes
to its existing revision owner before a changed product draft can be presented.

Gate-check alone evaluates readiness. Permission to finish clarification under
AGDF_PRD_DECISIONS_OPEN does not remove the blocker or permit approval. Missing required UX input
and unrelated integrity/source blockers are not clarification permission.

## Explicit revision and recording

For a registered ready unapproved draft, require an actual human drafting/revision request;
loading or selecting this skill is insufficient. The shared explicit route is gate-check with
intake true, intake_mode resume, run_id, expected_revision_id and prd_action revise
(CLI --prd-action revise). Ordinary ready-draft continuation presents the existing result.
Never edit an approved PRD or transfer its approval. An approved-intent change uses the existing
earliest affected UR/PRD revision route, not this unapproved authoring assignment.

Use the shared Reviewed Recording Input in gate-artifact-preparation and existing
run-step --step artefact --gate PRD --evidence <recording-input.json> with the supplied current
run/revision. Record PRD derived_from the exact approved UR; analyses do not replace that source.
Initial registration uses update_draft false; explicit registered replacement uses true with
fresh reviewed mapping and recording paths. Retain previous proof/history and other protected
bytes. Never hand-author receipts, substitute run-update for required source binding or reseal
unknown edits. Follow existing transaction recovery and supported visible retry with fresh state.

Use the returned revision and redispatch gate-check. When supplied, prepare exact run-present,
show its returned text verbatim and wait for a NEW deliberate Approval: PRD. A different artifact
language needs the existing localized summary: goal, scope, every criterion ID once and decision
context, within unchanged limits. Editorial correction uses permitted canonical replacement and
a fresh presentation; an old reply cannot approve changed content. Only valid PRD approval permits
the existing SD stage. This skill creates no SD, TP, implementation, QA or release result.
