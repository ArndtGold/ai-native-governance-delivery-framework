# UX Intent Definition: AGDF GitHub Copilot Plugin

Status: ready  
Revision: 2
Date: 2026-08-28  
UR: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` revision 2
Brownfield Review: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` revision 2

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: Install AGDF for GitHub Copilot through one obvious command and know whether
  the expected plugin version and workflow controls are active in the current session.
- success_signal: `npx --yes @agdf/cli@latest copilot` installs or updates the plugin, reports a
  verified version and one next action; a fresh session exposes the intended `agdf-` skills.
- primary_decision_or_action: Install or update the AGDF plugin, then start or restart Copilot.
- working_modes: `not_installed`; `installed_pending_fresh_session`; `active_ungoverned_repository`;
  `active_governed_repository`; `active_with_project_override`; `degraded_or_stale`;
  `disabled_or_uninstalled`.
- effective_state_by_mode: Host installation and enabled state determine plugin availability;
  fresh-session discovery determines loaded state; the exact-version validator determines runtime
  compatibility; `.agdf/control/` determines repository governance state.
- visible_state_types: installed version; verification result; restart requirement; loaded skills;
  repository governed or ungoverned; runtime checks enabled, manual or unavailable; degraded reason;
  one recovery action.
- effective_state_authority_by_mode: GitHub Copilot owns installed, enabled, managed, cached and
  loaded state. AGDF owns package verification and governance diagnosis. The selected
  `.agdf/control/runs/<run_id>/RUN_STATE.md` owns delivery gates and approvals.
- primary_state_presentation_owner_by_mode: Copilot plugin controls present host installation;
  AGDF lifecycle output presents verification and the next technical action; AGDF status presents
  repository governance state.
- activation_paths: Run `npx --yes @agdf/cli@latest copilot` for a public installation or
  `npm run install:copilot` from a source checkout, complete consent selection, then restart or open a
  fresh Copilot session.
- blockers: Unsupported Copilot version; managed policy; plugin unavailable; invalid manifest;
  version or provenance mismatch; failed update; restart pending; skill precedence conflict;
  validator unavailable; ambiguous AGDF run.
- recovery_paths: Preserve the previous healthy plugin on failed update; show the failing phase and
  one retry action; restart when pending; use manual checks when automatic checks are unavailable;
  diagnose precedence without overwriting project files; never approve an AGDF gate during recovery.
- relevant_state_transitions: `not_installed -> installed_pending_fresh_session -> active`;
  `active -> update_pending -> active`; `active -> degraded_or_stale -> recovered_active`;
  `active -> disabled_or_uninstalled`; `active_ungoverned_repository -> active_governed_repository`.
- proposed_prd_acceptance_criteria: One public Copilot install command; one local checkout command;
  no supported repository projection; no deletion of existing repository files; verified lifecycle
  output; fresh-session skill discovery; exact gate authority; separate package, host and UAT evidence.
- open_product_questions: None. `copilot-plugin` and `both` are retired public Copilot setup targets;
  existing repository files remain user-owned legacy content and are not automatically removed.
- affected_outputs: PRD, CLI command registry and help, scaffold composition, package generation,
  tests, README, INSTALL, CLI README and Pages compatibility and installation copy.
- evidence: Approved UR revision 2; Brownfield Review revision 2; existing plugin implementation and
  host evidence; current CLI and scaffold mappings.
- missing_evidence: Revised command and non-deletion behavior are later implementation and test
  obligations, not prerequisites for PRD intent.
- required_next_step: Incorporate this intent into PRD revision 2 without adding a second Copilot
  installation or repository projection path.
