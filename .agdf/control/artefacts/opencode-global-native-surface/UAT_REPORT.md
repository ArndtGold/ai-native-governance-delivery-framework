# UAT Report: Global Native OpenCode Surface

## UAT

- decision: `pass`
- acceptance_scope: User-visible global installation, status separation, repository activation and native skill discovery.
- evidence:
  - Isolated `opencode` installation completed with nine global `agdf-global-*` skills, global `AGDF.md`, Runtime Contract and explicit skill permission.
  - Global-only status reported `global_native_surface.complete=true` while `repository_surface.present=false`.
  - `opencode-repo --force` generated the repository-local `.opencode/` surface.
  - Repository-active status reported `repository_surface.present=true` and visible entrypoint `agdf-gate-check (native skill)`.
  - Installed OpenCode `debug skill` exposed both the global surface and the repository-local surface without same-name masking: global `agdf-global-*` and local `agdf-*` names coexist.
  - Unrelated global configuration and user-owned skills remained preserved in the QA collision/preservation probes.
- missing_evidence: None for the UAT acceptance scope.
- risks:
  - OpenCode remains `instruction_only`; UAT does not establish tool enforcement or a live governed session.
  - No commit, push, pull request or release was performed.
- required_next_step: `Approval: UAT`

## User acceptance boundary

The global surface is discoverable and operationally separated from repository governance. Governance becomes active only through the repository-local `.opencode/` surface and `.agdf/control/` state.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install ownership and repository-source-of-truth invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

