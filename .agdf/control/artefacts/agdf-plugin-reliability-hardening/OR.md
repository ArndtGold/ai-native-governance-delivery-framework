# OR: Dual-Layout Runtime-Integrity Validation

Status: pass
Report mode: OR-full
Date: 2026-07-16
Owner: agent

## Current Delivery State

- gate: OR
- report_mode: OR-full
- artefact: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/OR.md`
- status: pass
- missing_approval: none

## Delivered

- deterministic source and installed layout classification
- common plugin-owned and conditional source-only integrity validation
- stable fail-closed invalid-layout diagnostic
- permanent staged installed-plugin regression suite
- aggregate smoke integration and override documentation
- 7/7 TP coverage, clean implementation pass, Code Review pass and QA decision pass

## Intentionally Not Delivered

- broad `create-agdf` CLI modularization
- native approval live-UAT redesign
- platform-neutral SessionStart hook replacement
- mutation of the installed 0.9.0 cache
- commit, push, pull request, npm publication or plugin reinstall

## Evidence

- source integrity: pass, `mode=source`, 9 skills and 15 control files
- installed layout and negative fixtures: pass
- aggregate `create-agdf` and `@agdf/cli` smoke: pass
- both package dry-runs: pass
- TP Review: 7/7 fully done
- Clean Implementation Review and Code Review: pass
- QA Report: pass

## Gaps, Risks And Fallbacks

- missing_evidence: none for the accepted repository slice; deployment/reinstall evidence is
  intentionally outside this run
- risks: current installed cache remains on the prior published artifact until a later authorized
  delivery action
- retained_fallbacks: none
- exit_criteria: satisfied for the repository slice; delivery actions require separate instruction

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: `CG-AGDF-RUN-SCOPED-CONTROL-STATE`;
  `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md`
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing invariant linkage is recorded in the selected run and Brownfield
  artefact; no graph mutation is required.

## Next Permissible Step

- required_next_step: Offer the commit-ready delivery handoff; do not execute VCS or release actions
  without explicit instruction.
- quality_outlook: No further technical follow-up is required for this slice. A later release and
  reinstall are required before the current installed cache receives the change.

## Delivery Handoff

- delivery_status: uat_approved_with_code
- commit_title: `fix: validate installed AGDF plugin layouts`
- commit_body: Resolve runtime-integrity roots deterministically for source and installed plugin
  layouts; preserve repository-only checks in source mode; add staged installed-layout regression
  coverage to the aggregate smoke chain; document explicit override semantics.
- migration_rollout_note: No data migration. A later package/plugin release and reinstall are needed
  to replace the immutable installed 0.9.0 cache.
