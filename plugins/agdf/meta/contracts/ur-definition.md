# AGDF Runtime Contract — UR Definition

This contract guides `ur-definition` only after a non-authorizing, bound
`skill_continuation` with `phase: ur_definition`. It creates no gate or persistence authority.

## Binding and ownership

Use only the returned governance_target, run_id, revision_id, artifact_path and template_path.
template_path is the absolute, version-matched template owned by the installed plugin runtime.
Repository copies under `.agdf/control/templates/` are derived scaffold references and never
override this authoring source. Read the template without rewriting it; persist only artifact_path.
A direct invocation first dispatches ur-definition; without a bound run follow the existing
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
output belongs to `.agdf/control/artefacts/<run_id>/previews/` for the bound run; the UX skill owns
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
complete summary in the resolved presentation language covering problem, goal, affected users,
scope, non-goals, acceptance signals, source ownership, risks/unknowns and next step.
Do not truncate decision-relevant content or use ellipses. The existing approval renderer's
limits and validation apply. This summary is editorial; the UR remains authoritative.
For new-format URs, a missing or invalid required summary returns to this same authoring
route before presentation. Correct it through the existing revision writer; no user approval
is required merely to complete an unapproved incomplete draft.

## Revision and recording

A new draft is recorded through existing run-step --step ur --title <short title>, using
--dir <governance_target> --run <run_id> --revision <revision_id>.
For an already registered unapproved draft, require explicit user revision intent. Resume
through gate-check with intake true, intake_mode resume, run_id, expected_revision_id and
ur_action revise (CLI --ur-action revise). Ordinary intake of a ready draft still presents it.
After editing a registered draft use existing run-update, not run-step: the previous seal
must be replaced by the canonical revision writer. Never edit an approved UR or its approval.
Use the returned new revision, redispatch gate-check for this target/run, prepare the fresh
run-present when supplied, show its returned text verbatim and wait for a NEW deliberate
`Approval: UR`. Previous presentations/replies cannot approve a changed draft.
After valid UR approval, existing Brownfield Review and Mode/Slice routing continue unchanged.
