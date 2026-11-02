# Brownfield Review: Sharpen INSTALL.md Into A Guided Installation Path

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/install-first-path-clarity/BROWNFIELD_REVIEW.md`
- scope: reorder and sharpen only `INSTALL.md` into a guided path, using existing commands and runtime facts; correct stale OpenCode generated-agent terminology to native-skill terminology.
- evidence:
  - `INSTALL.md` already contains detailed Codex, OpenCode, Claude Code and Copilot flows, prerequisites, explicit global/repository boundaries and advanced reference sections.
  - `create-agdf/bin/create-agdf.js` exposes only install/update/status/bootstrap targets; it has no user-facing remove or disable target. Re-running `codex`, `claude` or `opencode` is the supported update path because their installers perform marketplace update/upgrade or exact npm installation.
  - `opencode-status` reports plugin configuration, package loadability, installed/expected version, global native-skill completeness, session signals and repository-surface presence; its next step explicitly asks for `opencode-repo` when the repository surface is missing and says to restart OpenCode if needed when it exists.
  - The current OpenCode repository installer writes `.opencode/skills/agdf-*/SKILL.md` and only removes owned legacy AGDF agents during migration; the opening INSTALL.md wording about generated agents is stale.
  - Existing smoke coverage asserts the OpenCode global/repository separation, native-skill paths, status schema and migration behavior.
- transparency: no PRD, SD or TP is required because this is a bounded Markdown information-architecture and terminology correction that reuses established CLI/runtime owners, does not alter commands or policy, and stays outside runtime-governing paths.
- missing_evidence: direct first-time-user usability testing is unavailable; existing install/status behavior and the documented navigation gaps are sufficient for this bounded edit.
- current_coverage:
  - `partially_done`: complete detailed surface guidance, prerequisites, permission boundaries and advanced runtime reference exist.
  - `not_done`: an early surface-selection path, consistently adjacent install/verify/first-action instructions, explicit OpenCode prerequisite and corrected native-skill terminology.
- reuse_strategy: `refactor` existing sections by adding a short guided introduction and moving advanced Delivery Path Search/skill-identity material below it; retain detailed sections as their authoritative reference owners.
- risks:
  - Reordering could duplicate or diverge from detailed surface sections; mitigate with concise summaries that link/lead into the existing detailed owners.
  - A removal/disable section could imply unsafe operations; document only the verified absence of an AGDF-specific command and preserve existing configuration-ownership safeguards.
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- required_next_step: execute the Quick Task, validate documentation consistency and package/runtime checks, then record compact closeout evidence.

## Mode/Slice Decision

- decision: `quick_task`
- scope_reason: one Markdown file is being structurally sharpened from existing, directly verified command and runtime facts; no public command, generated asset, runtime policy or control-state behavior changes.
- evidence: `INSTALL.md`; `create-agdf/bin/create-agdf.js`; `create-agdf/scripts/smoke-test.js`.
