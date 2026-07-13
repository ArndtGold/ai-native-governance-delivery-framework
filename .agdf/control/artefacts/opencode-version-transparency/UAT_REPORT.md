# UAT Report: OpenCode Version Transparency

## UAT

- decision: `pass`
- acceptance_scope: User-visible current-version reporting, update visibility and stale-version repair guidance.
- evidence:
  - Real isolated `opencode` installation reported `Package version: 0.6.9`, `Expected version: 0.6.9`, `Version status: current` and `Version transition: new install (0.6.9)`.
  - Real `opencode-status --json` reported `installed_version: 0.6.9`, `expected_version: 0.6.9` and `version_status: current`.
  - Isolated stale package fixture at `0.0.1` reported `Package version: 0.0.1`, `Expected version: 0.6.9`, `Version status: outdated` and the actionable `npx --yes @agdf/cli@latest opencode` repair step.
  - QA fixtures additionally cover unknown and unloadable metadata states and all transition states.
- missing_evidence: None for the UAT acceptance scope.
- risks:
  - Previous-version visibility is operation-only and cannot reconstruct external package history.
  - OpenCode remains `instruction_only`; version output does not establish enforcement or governance activation.
  - No commit, push, pull request or release was performed.
- required_next_step: `Approval: UAT`

## User acceptance boundary

The output now answers the user’s operational question directly: which package is installed, which version is expected, whether it is current, and how to repair an outdated installation.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install status and package-loadability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

