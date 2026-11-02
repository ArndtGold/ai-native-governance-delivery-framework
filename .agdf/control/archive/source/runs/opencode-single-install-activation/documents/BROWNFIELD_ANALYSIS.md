# Brownfield Analysis: Single-Install OpenCode Activation

- mode: `pre_implementation_analysis`
- decision: `pass`
- artefact: `.agdf/control/artefacts/opencode-single-install-activation/BROWNFIELD_ANALYSIS.md`
- scope: OSA-01 through OSA-06 of approved TP revision 2.
- current_coverage: `partially_done`; global plugin, installer, scaffold and focused smoke fixtures exist, while durable-control activation and early session guidance are absent.
- reuse_strategy: extend `create-agdf/opencode-plugin.js`, `create-agdf/lib/installers/opencode.js`, `create-agdf/lib/scaffold/plan.js`, `lifecycle-test.js` and `smoke-test.js`; add one focused shared activation helper only.
- evidence: plugin currently keys activation on two `.opencode` files; scaffold currently writes duplicated files; focused tests already cover global install, explicit question preservation, local scaffold and owned legacy-agent migration.
- risks: do not rename `agdf-global-*`; do not delete local assets; preserve explicit `question: deny`; ensure system guidance is appended only for valid durable control.
- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- required_next_step: Implement the six approved TP tasks and record CD+Tests evidence.
