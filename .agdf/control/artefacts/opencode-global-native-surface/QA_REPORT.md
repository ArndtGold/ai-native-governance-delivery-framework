# QA Report: Global Native OpenCode Surface

## QA Gate

- decision: `pass`
- evidence:
  - TP Review: `12/12 fully_done`; the global namespace correction is documented and verified.
  - Brownfield Analysis: `pass`; existing installer, status, generated-surface and repository-source-of-truth owners are preserved.
  - Clean Implementation Review: `pass`; no second gate owner, parallel policy structure or unnecessary fallback remains.
  - Code Review: `pass`; the preflight and structural ownership-marker findings were fixed and re-reviewed.
  - Runtime: OpenCode `1.17.13` discovered nine `agdf-global-*` skills; local `agdf-*` skills coexist without same-name masking; global-only status remains separate from repository activation.
  - Safety: unrelated config and user-owned skills are preserved; unowned collision leaves config unchanged and does not install npm dependencies.
  - Validation: package smoke, aggregate CLI smoke, Pages check, runtime integrity, doctor and `git diff --check` are recorded as passing.
- missing_evidence: None for the approved implementation scope.
- risks:
  - A failure during an individual filesystem write after preflight could still leave a partial owned surface; collision/error safety is covered, while full multi-file filesystem transactionality is outside this slice.
  - OpenCode remains `instruction_only`; global discovery and permission configuration are not enforcement evidence.
- required_next_step: `UAT`
- impact_codes: `link_only`

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install ownership and repository-source-of-truth invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

## QA boundary

This QA pass does not claim a live governed session, tool enforcement, commit, push, pull request or release. UAT must validate the user-visible global OpenCode installation and repository activation boundary before delivery closeout.

