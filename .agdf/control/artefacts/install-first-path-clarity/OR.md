# OR: Sharpen INSTALL.md Into A Guided Installation Path

## OR

- gate: `Quick Task Execution`
- report_mode: `OR-lite`
- artefact: `.agdf/control/artefacts/install-first-path-clarity/OR.md`
- status: `pass`
- delivered:
  - Added a concise surface-selection and install/verify/first-action table before advanced material.
  - Made Node.js, the target-repository boundary and OpenCode as a supported prerequisite visible at the start.
  - Preserved the critical global-versus-repository OpenCode distinction and added nearby `opencode-status --json` verification, session-signal interpretation, restart guidance and repository-surface expectations.
  - Corrected the opening OpenCode description from generated agents to generated native skills, matching the current installer and migration behavior.
  - Kept Delivery Path Search, skill identity, detailed surface instructions, AGENTS ownership, CI and runtime reference material intact below the guided path.
  - Documented only verified update behavior (re-run the installer) and the absence of an AGDF-specific remove/disable command.
- intentionally_not_delivered:
  - No CLI target, flag, plugin, generated asset, runtime behavior, permission policy, security policy, remove command, release workflow or repository configuration changed.
  - No manual deletion recipe was invented for user-owned configuration.
  - No commit, push, pull request or release was performed.
- evidence:
  - `npm --prefix create-agdf run smoke-test` passed, including generated-asset sync, control-state, Delivery Path Search, installer smoke and routing checks.
  - `node plugin/scripts/check-runtime-integrity.mjs` passed (`9 skills and 14 control files checked`).
  - `node create-agdf/bin/create-agdf.js doctor --json` passed with 0 findings.
  - `git diff --check` passed.
  - Source inspection confirmed `opencode-status` status semantics, supported update paths and native-skill generation/migration behavior.
- missing_evidence: no first-time-user study or direct cross-platform app-session observation was run; the guidance is restricted to current CLI and smoke-tested behavior.
- risks:
  - A reader may still need the detailed per-surface reference for non-standard environments; it remains directly below the guided path.
  - AGDF-specific remove/disable automation remains unavailable and is explicitly disclosed.
- retained_fallbacks: none.
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- required_next_step: offer delivery closeout; any VCS or release action still requires separate explicit instruction.
- quality_outlook: validate the table and first-action wording with a new user on each supported surface before broadening installation documentation further.
