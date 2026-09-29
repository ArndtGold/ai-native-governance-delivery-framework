# UX Intent Definition: sichere AGDF-Schreib- und Releasewege

Status: ready
Decision: ready
Based on: approved UR revision 3 and post-UR Brownfield Review
Date: 2026-09-29
Owner: Arndt Gold

This is non-authorizing analytical input. The approved PRD will own product behavior.

## 1. Routing Evidence

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The work changes effective success, failure and recovery across run authoring, host setup and release operations. These states cross hosts and can influence consequential human decisions.
- ux_intent_definition_required: `yes`

## 2. Intent And Success

- primary_user_intent: A maintainer can trust that a reported success corresponds to one durable state, and can tell what survived an interruption before retrying or releasing.
- success_signal: After a forced failure, the next status check identifies the effective revision or installed version, any recoverable residue and one bounded next action; it never presents an uncommitted change as approved or published.
- primary_decision_or_action: The person decides whether to approve a gate, retry a bounded operation or release an exact validated revision; AGDF supplies evidence and does not infer that decision from a successful command.

## 3. Working Modes And State

- working_modes: run and artefact recording; host configuration and marketplace install/uninstall; coupled package release.
- effective_state_by_mode: The sealed run revision plus related artefact transaction; the ownership-checked host configuration and installed runtime; exact npm package versions and published registry state, respectively.
- visible_state_types: committed, rejected without mutation, interrupted but recoverable, ownership conflict, partially published and awaiting human gate decision.
- effective_state_authority_by_mode: `RUN_STATE.md` seal/revision and existing control-state owner; native host configuration plus AGDF ownership markers and read-back; npm registry evidence plus exact tag and package inventory.
- primary_state_presentation_owner_by_mode: gate-check/status presentation; lifecycle result/presentation; release workflow logs and `RELEASE.md`.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Explicit run-step/approval, installer lifecycle selection, or the versioned release workflow for an approved target.
- blockers: stale revision, live lock, invalid seal or path, unowned/symlinked target, unavailable dependency, package mismatch, missing QA/UAT or partial npm publish.
- recovery_paths: Re-read effective state; restore or complete only an ownership-proven interrupted transaction; report the exact blocked path and permissible retry. A partial publish requires an explicit operator decision and must not be described as rolled back automatically.
- relevant_state_transitions: proposed → validated → committed; committed → approved only after exact human response; prepared marketplace → committed or rolled back; validated package → published or partial/failed with registry read-back.

## 5. Proposed PRD Acceptance Criteria

- A stale or failed control write leaves either the old complete state or a recoverable new complete state and reports which revision is effective.
- Installer retries distinguish an already committed version from an interrupted stage; cleanup requires current ownership evidence immediately before mutation.
- CLI and release output name the exact target, operation, version and recovery step without converting technical success into QA, UAT or release approval.
- Public docs and package inventory state only the behavior verified for the exact source, tag, bundle or loaded host.

## 6. Decision Evidence

- blocking_reason: none for PRD drafting; detailed recovery and package behavior remain PRD/SD decisions.
- open_product_questions: Which partial-publish states require manual intervention? Which confirmed C findings belong to existing active runs? How much recovery information may be shown without leaking host paths or secrets?
- affected_outputs: run-step and gate-check status, lifecycle results and recovery, workflow summaries, README/INSTALL/privacy text and npm package contents.
- evidence: Approved UR; Brownfield Review; existing run-state writer, lifecycle presentation and coupled publish owners; Review v2/v3 findings as unexecuted issue leads.
- missing_evidence: Isolated failure reproductions and loaded-host observations are still needed before implementation and acceptance.
- required_next_step: Draft the PRD with explicit workstream ownership and user-observable acceptance criteria.
