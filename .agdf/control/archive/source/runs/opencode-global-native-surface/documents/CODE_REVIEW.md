# Code Review: Global Native OpenCode Surface

## Code Review

- decision: `pass`
- findings: None.
- missing_evidence: None for the reviewed collision and ownership paths.
- risks: A failure after preflight during an individual filesystem write could still leave a partial surface, but unowned-file collision paths are rejected before any config, package or surface mutation. This residual filesystem-failure behavior is outside the current scoped migration contract.
- required_next_step: `QA Gate`

## Review scope and evidence

- Reviewed actual diff in `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/smoke-test.js`, `plugin/meta/agdf-plugin.definition.json`, `plugin/scripts/check-runtime-integrity.mjs`, generated asset sync and affected documentation.
- `npm --prefix create-agdf run smoke-test` passed, including preflight collision and preservation coverage.
- Focused collision probe passed: config remained byte-identical, no npm `node_modules` directory was created, and a marker appearing only in user content was rejected.
- `doctor --json`, runtime integrity and `git diff --check` passed; focused collision tests close the reviewed safety paths.
- Brownfield fit and Clean Implementation Review remain valid for the intended architecture; preflight and structural marker validation now close the collision-path findings.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install ownership and repository-source-of-truth invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
