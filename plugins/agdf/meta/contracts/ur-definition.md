# AGDF Runtime Contract — UR Definition

This contract guides `ur-definition` only after a non-authorizing, bound
`skill_continuation` with `phase: ur_definition` or `phase: planned_ur_definition`.
The same owner defines UR content in both modes. It creates no gate or persistence authority.

## Planning mode before a Run

For explicit capture/refinement/priority intent, dispatch this same skill with the confirmed
target and `planning: {plan_id, expected_digest}`. Use null digest for capture and an inspected
canonical digest for replacement. Planning is mutually exclusive with Run/revision, delivery
intake, continue_delivery and source-revision selectors. Do not enter Run assignment to save a
planned need. The optional planning plugin orchestrates this mode; Core owns its semantics.

Follow `phase: planned_ur_definition` only. Read every returned authoring-inputs page for the
version-matched UR template, current source and `planning_capability`. Use the same need,
clarification, preview, language and summary rules below. An incomplete draft remains saveable
with clarification open. Planning stops at UR and minimal metadata: never author planned PRD,
SD or TP, present a gate, collect Approval: UR or infer delivery permission.

Use `agdf_record/planned_material.stage` for one UR, then `planned_ur.create` or
`planned_ur.replace` with that exact planning scope and original mutation UUID. Choose the new
identity as `plan-<mutation UUID>` without asking the user for an identifier. Creation material
contains the ordinary UR template without planning scalar fields: Core adds exactly one initial
`Planning schema: planned-ur-v1`, `Planning id: <plan_id>` and `Planning priority: high|normal|low`.
Default normal applies only on explicit create. Replacement preserves schema/identity and
changes priority in that same UR source under its expected digest; no saved parallel title/status.
No Run-bound material, generic file writer, shell fallback or copied template is permitted.

Return the saved readable title, source reference/digest, priority and remaining clarification.
Completeness/priority/selection never starts delivery. Only a later explicit request to start from
the selected current source uses `agdf_run/run.create_from_planned`; read its contract and preserve
the original UUID after uncertainty. The handoff creates one unapproved Run for normal UR review.
A different UUID on an already transferred identity returns that Run. Historical planning source
is read-only afterwards; later product edits use the active Run's existing revision owner.
Inspect the original operation before retry. Missing/incompatible Core, unsafe/stale source,
pending recovery or ambiguous origins stop the affected action with concrete diagnosis.

## Run mode binding and ownership

For `phase: ur_definition`, use only the returned governance_target, run_id, revision_id, artifact_path and template_path.
template_path is the absolute, version-matched template owned by the installed plugin runtime.
Repository copies under `.agdf/control/templates/` are derived scaffold references and never
override this authoring source. Read the template without rewriting it; persist only artifact_path.
An already returned bound `ur_definition` continuation satisfies entry: consume its authoring inputs and writer forms directly. Do not repeat author dispatch or intake for that same snapshot. A direct invocation without such a continuation first dispatches ur-definition; without a bound run follow the existing
resolve_delivery_run assignment, then gate-check intake/resume with its expected_revision_id.
Never use AGDF_RUN_ID, cwd, discovery or a previous approval as authority. Missing, stale,
foreign, invalid or approved bindings require fresh control routing; do not write.
Gate-check delegates UR content here and remains the read-only readiness/approval owner.
PRD semantic preparation belongs to prd-definition. Semantic SD/TP preparation belongs to sd-definition/tp-definition; shared registration
remains in gate-artifact-preparation.

## Define the need

Read the original request and answered context. Populate Problem, Goal, Affected Users,
Scope, Non-Goals, Acceptance Signals, Existing Source Of Truth, Risks And Unknowns and Next Step.
Keep user intent distinct from assumptions. Cite known repository owners where available;
record unknown ownership without inventing facts. Do not invent users, scope, requirements,
acceptance promises, approvals or downstream product/design decisions.

### Preserve requested clarification deliverables

For a user-facing change, capture what the user needs to see or try to judge the proposed behavior.
When a preview, mockup or prototype is explicitly requested, preserve it as an actual deliverable
in Scope: its purpose, user task, relevant states/scenarios, required interaction or format and
when it is needed (for example before PRD approval). Record observable review success in Acceptance
Signals and unresolved product questions in Risks And Unknowns. Use answered context; ask only if
an ambiguity materially changes the requested deliverable. Do not turn an illustrative example into
a requirement. Without an explicit preview commitment, do not impose one on unrelated or already
clear requests.

Distinguish a required preview from an optional clarification aid. An explicitly requested
interactive preview cannot silently become a screenshot, static wireframe or written walkthrough.
Preserve the requirement and name a concrete recovery or obtain an explicit scope change if it
cannot be delivered. Record the responsible later UX/PRD step in Next Step; UR authoring still
writes only its assigned UR, not a preview or product implementation. A requested before-PRD preview
is created through UX intent clarification under the existing post-UR routing owner. Its durable
output belongs to `.agdf/control/runs/<run_id>/evidence/previews/` for the bound run; the UX skill owns
creation, versioning, evidence and references. An inline chat rendering alone does not fulfill that
run deliverable. In a new UR, set exactly one initial metadata line before the first section:
`Preview requirement: before_prd_interactive` for a required interactive before-PRD preview,
otherwise `Preview requirement: none`. Preserve the task/scenarios in Scope and Acceptance
Signals; the field cannot replace them. Missing markers in existing URs retain legacy semantics;
do not retrofit an approved source or infer a requirement from prose/examples. Unknown or duplicate
values require correction through the existing UR owner. This adds no gate or separate approval.

When a missing fact materially changes the problem, intended users, scope or success signal,
ask one bundled semantic clarification covering the actual gap. Do not ask for technical run
identifiers or repeat answered questions. Preserve a useful draft with
`Requirements clarification: open`; it is not ready for approval. If the concrete request is
complete, draft immediately. Minor unknowns may be marked assumptions/deferred questions when
they do not change the need; explain them, do not create redundant clarification loops.
Set `Requirements clarification: complete` only when all required sections are concrete and
no material requirement decision remains open. This is cooperative semantic judgement, not approval.
Keep Status draft and Gate approval open.

## Language and approval summary

Use the continuation's `artifact_language` resolved from `.agdf/control/config.json` for
the UR and its resolved `presentation_language` for user-facing text. Do not infer the
artefact language from the request, template headings or runtime rules. The configured
chat language is the direct-command default; explicit dispatcher presentation input
follows its current-request language contract and does not change the artefact language.

Before recording a complete draft, when `approval_summary_required` is true, include exactly
one `## <approval_summary_heading>` section using the supplied heading verbatim. Write a
complete summary in the resolved presentation language. Read `approval_summary_format.required_fields` from authoring-inputs: those exact list field declarations need concrete authored values; prose or a heading alone is not a named field. Cover problem, goal, affected users,
scope, non-goals, acceptance signals, source ownership, risks/unknowns and next step.
Do not truncate decision-relevant content or use ellipses. The existing approval renderer's
limits and validation apply. This summary is editorial; the UR remains authoritative.
For new-format URs, a missing or invalid required summary returns to this same authoring
route before presentation. Correct it through the existing revision writer; no user approval
is required merely to complete an unapproved incomplete draft.

## Run mode revision and recording

A new draft is recorded through existing run-step --step ur --title <short title>, using
--dir <governance_target> --run <run_id> --revision <revision_id>.
When this bound continuation returns a registered, incomplete unapproved draft, correct its
readiness gaps directly through the supplied `ur_draft.replace` form. The existing authoring
route already covers completing that same need; do not open another intake or dispatch.
A deliberate change to an already READY registered draft outside that continuation still
requires explicit user revision intent: enter via gate-check with intake true, intake_mode
resume, run_id, expected_revision_id and ur_action revise (CLI --ur-action revise).
Ordinary intake of a ready draft still presents it. Never substitute a field named revision.
Stage the replacement and use ur_draft.replace with the current binding. The writer
publishes the document and typed evidence atomically. Never edit bound bytes, reseal
an unknown change or alter an approved UR or its approval.
Use the returned new revision, redispatch gate-check for this target/run, prepare the fresh
run-present when supplied, show its returned text verbatim and wait for a NEW deliberate
`Approval: UR`. Previous presentations/replies cannot approve a changed draft.
After valid UR approval, existing Brownfield Review and Mode/Slice routing continue unchanged.
