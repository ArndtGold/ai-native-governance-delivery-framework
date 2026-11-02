# QA Report: OpenCode Version Transparency

## QA Gate

- decision: `pass`
- evidence:
  - TP Review: 8/8 tasks `fully_done`; OVT-05 transition coverage was expanded before review to include new install, updated, unchanged and unknown.
  - Brownfield Analysis: `pass`; existing resolver, installer, status and smoke owners were extended without parallel version or governance ownership.
  - Clean Implementation Review: `pass`; one canonical expected-version source, one installed-version source and bounded unknown states.
  - Code Review: `pass`; no correctness, compatibility, security or maintainability finding remains in scope.
  - Runtime: installed and expected package version `0.6.9`, status `current`; global native surface remains 9/9.
  - Tests: current/outdated/unknown/unloadable fixtures, transition fixtures, aggregate package/CLI/Pages/integrity/doctor/diff checks passed.
- missing_evidence: None for the approved implementation scope.
- risks:
  - Previous-version visibility is operation-only; external package replacement without readable metadata reports `unknown` rather than inferring history.
  - OpenCode remains `instruction_only`; version evidence does not establish enforcement.
- required_next_step: `UAT`
- impact_codes: `link_only`

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install status and package-loadability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

## QA boundary

This QA pass does not claim a live governed session, tool enforcement, commit, push, pull request or release. UAT must validate the user-visible version output and current/outdated repair boundary.

