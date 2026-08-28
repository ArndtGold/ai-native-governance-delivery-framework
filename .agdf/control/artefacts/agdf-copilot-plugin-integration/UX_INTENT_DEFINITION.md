# UX Intent Definition: AGDF GitHub Copilot Plugin

Status: ready  
Date: 2026-08-28  
UR: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md`  
Brownfield Review: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md`

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: Install AGDF once for GitHub Copilot, know whether the expected version and
  workflow controls are actually active in the current session, and recover safely when they are not.
- success_signal: A supported installation reports a verified version and one next action; a fresh
  session exposes the intended `agdf-` skills; governed repositories use their own `.agdf/control/`
  state; unsupported or degraded states remain visible and recoverable.
- primary_decision_or_action: Install or update the AGDF plugin, then start or restart a Copilot
  session in the intended repository.
- working_modes: `not_installed`; `installed_pending_fresh_session`; `active_ungoverned_repository`;
  `active_governed_repository`; `active_with_project_override`; `degraded_or_stale`;
  `repository_bootstrap_only`; `disabled_or_uninstalled`
- effective_state_by_mode: Host installation and enabled state determine plugin availability;
  fresh-session discovery determines loaded state; the exact-version validator determines AGDF
  runtime compatibility; `.agdf/control/` determines repository governance state; project or personal
  precedence determines whether a colliding plugin skill is effective.
- visible_state_types: installed version; version verification; enabled or managed state; restart or
  fresh-session requirement; loaded skill identity; repository governed or ungoverned; automatic
  checks enabled, manual or unavailable; degraded reason; one recovery action.
- effective_state_authority_by_mode: GitHub Copilot owns installed, enabled, managed, cached and
  loaded host state. The AGDF validator owns version and control-state diagnosis. The selected
  `.agdf/control/runs/<run_id>/RUN_STATE.md` owns delivery gates and approvals. Project and personal
  configuration owners retain their documented precedence.
- primary_state_presentation_owner_by_mode: Copilot Customize and plugin controls present host
  installation state; AGDF lifecycle cards present package verification and the next technical action;
  AGDF status presentation reports governance state; project instructions present repository-specific
  setup and precedence.
- activation_paths: Install from a supported marketplace, repository or local development source;
  finish verification; restart or begin a fresh session when required; select a repository; run AGDF
  status or begin a governed task. Repository bootstrap remains a separate explicit activation path.
- blockers: Unsupported Copilot version; managed policy; plugin or marketplace unavailable; invalid
  manifest; version or provenance mismatch; failed install or update; restart pending; plugin skill
  shadowed by project or personal configuration; validator unavailable; ambiguous AGDF run.
- recovery_paths: Preserve the previous healthy installation on failed update; show the failing phase
  and one retry or rollback action; restart when activation is pending; use manual validation when
  automatic checks are unavailable; diagnose skill precedence without overwriting project files;
  retain repository bootstrap as an explicit fallback; never auto-approve a gate during recovery.
- relevant_state_transitions: `not_installed -> installed_pending_fresh_session -> active`; `active ->
  update_pending -> active`; `active -> degraded_or_stale -> recovered_active`; `active -> disabled_or_uninstalled`;
  `active_ungoverned_repository -> active_governed_repository`; `active -> active_with_project_override`;
  `plugin_unavailable -> repository_bootstrap_only`.
- proposed_prd_acceptance_criteria: One supported install and update flow with coherent version output;
  fresh-session skill discovery; visible plugin, runtime and repository states; no implicit repository
  mutation; deterministic collision diagnostics; exact-text gate approval baseline; bounded failure
  and rollback behavior; separate package, loaded-host and UAT evidence; complementary repository
  bootstrap; explicit supported-surface matrix.
- open_product_questions: PRD must state whether a native Copilot input extension is excluded from the
  first release or accepted only after gate-safety proof. PRD must name the initial supported app and
  CLI versions and keep cloud agent, code review and VS Code outside claims until separately evidenced.
  These questions do not block drafting because exact text and the locally installed app/CLI path are
  the approved baseline.
- affected_outputs: PRD acceptance criteria, lifecycle state model, support matrix, installation and
  recovery copy, UAT protocol and public capability wording.
- evidence: Approved UR; completed Brownfield Review; official GitHub plugin, skill and hook contracts;
  installed Copilot app 1.1.14 SDK; existing AGDF lifecycle, interaction and status owners.
- missing_evidence: Direct installed-plugin and fresh-session observations are later implementation and
  UAT evidence, not prerequisites for PRD intent.
- required_next_step: Incorporate this intent into the PRD without turning presentation ownership into
  technical design or adding another gate authority.
