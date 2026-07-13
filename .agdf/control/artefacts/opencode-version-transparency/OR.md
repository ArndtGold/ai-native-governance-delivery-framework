# Orchestration Report: OpenCode Version Transparency

## OR

- gate: `Approval: UAT`
- report_mode: `OR-full`
- artefact: `.agdf/control/artefacts/opencode-version-transparency/OR.md`
- status: `pass`
- delivered:
  - OpenCode human output now reports installed version, expected version and version status;
  - `opencode-status --json` additively exposes installed/expected/version-status fields;
  - installer output reports new-install, updated, unchanged and unknown transitions without persistent history;
  - current, outdated, unknown and unloadable package states are tested;
  - full TP Review, Clean Review, Code Review, QA and UAT chain completed.
- intentionally_not_delivered:
  - persistent package-version history or a second version registry;
  - changes to global skill names, repository governance authority or `instruction_only` capability classification;
  - commit, push, pull request, release or rollout execution.
- evidence:
  - TP Review: 8/8 tasks fully done;
  - Brownfield Analysis, Clean Implementation Review and Code Review: pass;
  - QA Report: pass;
  - UAT Report: pass for current and outdated user-visible flows;
  - package/CLI/Pages/integrity/doctor/diff validation: pass.
- missing_evidence: None for the scoped delivery.
- risks:
  - Previous-version visibility is operation-only; external replacement without readable metadata reports `unknown`.
  - OpenCode remains `instruction_only`; version evidence is not enforcement evidence.
- retained_fallbacks: Explicit `unknown` states for unreadable metadata and transitions; no alternative policy or version owner.
- required_next_step: `Delivery-Closeout`
- quality_outlook: `no further technical follow-up`; commit/push/PR remain explicit operational choices.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install status and package-loadability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

