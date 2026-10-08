# AGDF Runtime Contract — UR Definition

This contract guides `ur-definition` only after a non-authorizing, bound
`skill_continuation` with `phase: ur_definition`. It creates no gate or persistence authority.

## Binding and ownership

Use only the returned governance_target, run_id, revision_id, artifact_path and template_path.
A direct invocation first dispatches ur-definition; without a bound run follow the existing
resolve_delivery_run assignment, then gate-check intake/resume with its expected_revision_id.
Never use AGDF_RUN_ID, cwd, discovery or a previous approval as authority. Missing, stale,
foreign, invalid or approved bindings require fresh control routing; do not write.
Gate-check delegates UR content here and remains the read-only readiness/approval owner.
PRD semantic preparation belongs to prd-definition. SD/TP preparation and shared registration
remain in gate-artifact-preparation.

## Define the need

Read the original request and answered context. Populate Problem, Goal, Affected Users,
Scope, Non-Goals, Acceptance Signals, Existing Source Of Truth, Risks And Unknowns and Next Step.
Keep user intent distinct from assumptions. Cite known repository owners where available;
record unknown ownership without inventing facts. Do not invent users, scope, requirements,
acceptance promises, approvals or downstream product/design decisions.

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
