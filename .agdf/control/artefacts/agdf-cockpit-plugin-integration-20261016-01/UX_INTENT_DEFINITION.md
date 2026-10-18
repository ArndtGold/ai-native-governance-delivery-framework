# UX Intent Definition: Open Cockpit from the AGDF plugin

Status: ready
- decision: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-10-16
Owner: Codex

This is non-authorizing analytical input. It carries no approval or implementation permission. The subsequently approved PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Plugin installation replaces a separate setup journey; project binding, legacy transition and failure recovery require truthful visible states.
- ux_intent_definition_required: yes
- evidence: Approved UR; BROWNFIELD_REVIEW.md; existing local preparation, launcher and lifecycle code cited there.

## 2. Intent And Success

- primary_user_intent: Install AGDF once and use its existing Cockpit in Codex without configuring an additional server.
- success_signal: A fresh session with the installed plugin opens the existing Cockpit for the intended project and reads canonical run data; updating or removing AGDF treats Cockpit as part of the same product.
- primary_decision_or_action: Ask to open Cockpit. If the project is not established, identify it once through an understandable project choice rather than configure MCP infrastructure.

## 3. Working Modes And State

- working_modes: clean installation; established project; project unresolved; existing owned local setup; foreign/conflicting local setup; disabled plugin; update or connection failure.
- effective_state_by_mode: Plugin availability, checked project identity and current connection/read evidence determine readiness. Written configuration alone is configured/pending reconnect, not verified ready. A retained legacy connection stays explicitly identified until replacement and retirement complete.
- visible_state_types: Cockpit available; project needed; reconnect/restart needed; transition pending; Cockpit ready for named project; conflict requiring resolution; unavailable with retry/recovery; plugin disabled.
- effective_state_authority_by_mode: Codex owns plugin activation and host permissions; AGDF's existing target/read services own checked project and run data; existing installation/lifecycle verification owns registration and replacement observations. No view state becomes gate authority.
- primary_state_presentation_owner_by_mode: Codex plugin/MCP management presents installed/enabled status. The existing Cockpit tool result or view presents project identity, opening/read status and actionable failures. Installer/lifecycle output presents transition and partial-update results. Do not add a second dashboard or competing success indicator.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Normal AGDF plugin installation/update supplies Cockpit; an ordinary request opens it for a confirmed project. Existing host trust and permission prompts retain their meaning. No manual server-registration/build step is required from the user.
- blockers: Missing/ambiguous project; invalid or unavailable project data; unsupported host UI; plugin disabled; incompatible or failed runtime/UI preparation; foreign/uncertain legacy ownership; unverified replacement before retirement.
- recovery_paths: Ask only for the unresolved project; explain an invalid project and permit correction; offer a visible retry for transient opening/read failure; explain a required fresh session once; report the observed UI limitation and established fallback when appropriate; preserve a working prior installation or owned legacy route on failure and name the existing repair action. Never silently delete a foreign connection or claim readiness while recovery is pending.
- relevant_state_transitions: installed -> reconnect-needed -> available -> project-bound -> ready; project-needed -> deliberate project choice -> ready or actionable failure; legacy-active -> replacement-verified -> legacy-retired; failed replacement -> prior state retained; enabled -> disabled -> unavailable; unavailable -> explicit retry -> checked ready or explicit failure. Merely opening or selecting never advances a delivery gate.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Clean install exposes Cockpit without extra setup; visible name Cockpit; correct project binding with understandable missing-project recovery; read-only and source/context boundaries preserved; accurate configured-versus-verified states; owned legacy transition without duplicates and with rollback; foreign state preserved; plugin update/disable/remove lifecycle consistency; fresh installed Codex journey plus bounded negative scenarios; documentation matching observed support.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions: none blocking PRD authoring; the above states derive from approved UR. Runtime composition, transport identifiers, storage and rollback implementation belong to SD.
- affected_outputs: PRD acceptance criteria and user-visible installation/opening/recovery behavior; later design and test traceability.
- evidence: Approved UR; BROWNFIELD_REVIEW.md; packages/cli/lib/mcp-lifecycle/service.js; packages/cli/lib/mcp-lifecycle/adapters/codex.js; packages/cli/lib/mcp-dispatch-runtime.js; scripts/sync-package-assets.js.
- missing_evidence: Fresh final installed-host behavior is a later verification obligation, not a claimed current result.
- required_next_step: Canonically record this analysis, then author the bound PRD with stable acceptance IDs. No new user gate or implementation permission is created.
