# AGDF Runtime Contract — PRD Definition

Use only a bound `skill_continuation` with `phase: prd_definition`. This contract owns semantic
product drafting and clarification; it creates no gate, writer, persistence or approval authority.

## Binding and sources

Dispatch prd-definition before direct work. An unbound invocation uses the existing
resolve_delivery_run candidate inventory, matching the original request to approved UR scope,
then gate-check resume intake with run_id and expected_revision_id. Never select AGDF_RUN_ID,
invent a replacement run/UR or use discovery, skill selection or cwd as editing intent.

Use the returned governance_target, run_id, revision_id, contained artifact_path, absolute
plugin-owned template_path and exact sources. The installed, version-matched plugin is the sole
authoring-template authority. Repository `.agdf/control/templates/` copies are derived scaffold
references and never override template_path. If template_path is unavailable or unsafe, stop
without writing or falling back and route the explicit plugin repair/reinstall recovery.
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

When a visible flow or decision remains hard to assess in prose, use a focused UI preview or scenario
walkthrough following `ux-intent-definition`'s UI preview guidance. Reuse existing UX findings rather
than creating a parallel specification or requiring another preview. Carry the scenario, observed
feedback and qualification limits into the existing UX Intent And Success and Evidence Requirements
sections; translate adopted behavior into stable acceptance criterion IDs. Record material product
choices in the same Approval Decisions table, preserving unresolved `before_prd` rows. A positive
reaction to a mockup resolves only the product questions actually answered; it is not `Approval: PRD`.
For an optional aid, an unavailable visualization capability alone is not a readiness blocker when
semantics can be clarified otherwise. Preserve an explicitly required preview from approved UR scope:
read the UX report's exact run-local preview version, relative path, digests and observation limits.
Confirm that the referenced durable copy exists and matches before relying on its findings; a
chat-only preview, stale version or missing requested interaction leaves the obligation open.
Use the existing UX analytical recovery route for missing required preview evidence; do not invent
a product answer, repeat UR intake or bypass the required UX result. If PRD clarification creates or
changes a preview, apply the UX skill's same retention and versioning rules. Keep material choices
open until actually answered. Scope changes return to the earliest affected owner. Preview fidelity
does not prescribe SD choices or prove working implementation.

Gate-check alone evaluates readiness. Permission to finish clarification under
AGDF_PRD_DECISIONS_OPEN does not remove the blocker or permit approval. Missing required UX input
and unrelated integrity/source blockers are not PRD clarification permission. Use the interaction
contract Bounded internal recovery route for eligible UX preparation; do not author PRD first.

## Prepare the preview review handoff

For a required UI preview, put a concise review task and versioned preview access in UX Intent And
Success, relate the scenarios to stable criterion IDs, and retain the observations and limitations
in Evidence Requirements. Keep material answers in Approval Decisions. Explain that PRD approval
adopts the specified behavior and criteria; implementation, visual-design acceptance and delivery
evidence require their own applicable sources. Do not label a proposed flow as already delivered.
Follow interaction.md PRD Preview Review At Approval for the single canonical presentation owner,
viewing/approval distinction, host availability and required revalidation. Prepare source material;
never hand-build an extra approval card or claim missing runtime integration is implemented.

The PRD owns exactly one `## Preview Review` section containing only one fenced `json` object.
Use `schema_version: "1"`, a short lowercase `version` ending in `-vN`, the canonical approved
`source_ur_digest`, and `entry: ".agdf/control/artefacts/<run_id>/previews/<version>/index.html"`.
Provide `files` sorted by path, each with `path`, raw-byte SHA-256 `digest`, exact `bytes` and
`media_type`; also provide `review_task`, nonempty `scenarios`, valid PRD `criterion_ids`, and
`open_questions` (an array, possibly empty). No other keys or separate manifest are accepted.
The whole descriptor is at most 16 KiB; at most 32 files, 128 KiB each and 1 MiB combined.
Supported media are text/html, text/css, text/javascript and PNG/JPEG/WebP/GIF/SVG images.
Keep classic scripts, styles, CSS imports and images local and declared; no network, modules,
forms, embedded frames or host calls. Unsupported resource syntax fails explicitly. Bundle or
simplify the example within the existing unapproved source owner; never substitute a blank view.
The prepared PRD presentation snapshots exact source files and the isolated rendered view. It
offers versioned access beside the document; opening it is not approval or proof of human review.
A changed or unavailable required file requires repair/revision and a fresh presentation before
an approval reply. Existing unmarked URs need no descriptor; an authored descriptor always binds.

## Explicit revision and recording

Before recording, use the continuation's resolved language and summary fields with
gate-artifact-preparation's Language and approval summary preparation. A translated summary
must be part of the draft before presentation, not deferred until a renderer failure.
Use the shared canonical summary validator and separate recognized goal, scope and decisions
labels. A required malformed summary is an unready authoring input, not a missing user choice.
On an eligible own unapproved formatting diagnosis, correct once, validate and replace through
the same typed writer, then reevaluate without a restart question. An unchanged failure stops;
this does not permit editing a ready or approved draft without its existing authority.

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
