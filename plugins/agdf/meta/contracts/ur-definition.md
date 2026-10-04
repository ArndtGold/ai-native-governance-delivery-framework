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
PRD, SD and TP preparation remains in gate-artifact-preparation.

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
