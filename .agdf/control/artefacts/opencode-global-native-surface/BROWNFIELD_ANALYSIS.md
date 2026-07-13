# Brownfield Analysis: Global Native OpenCode Surface

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/opencode-global-native-surface/BROWNFIELD_ANALYSIS.md`

## Scope

Verify the approved TP against the existing AGDF OpenCode implementation and the installed OpenCode runtime before changing the global installer, generated assets, status contract or documentation.

## Runtime evidence

- OpenCode's installed native discovery accepts the isolated global path `<configDir>/skills/<name>/SKILL.md`.
- A clean isolated config containing the generated global adapters produced all nine entries through `OPENCODE_CONFIG_DIR=<configDir> opencode debug skill`.
- OpenCode `1.17.13` does not prefer a same-named project skill over a global skill; distinct `agdf-global-*` names are therefore required to prevent global masking of canonical local `agdf-*` skills.
- The existing deterministic test contract already uses `OPENCODE_CONFIG_DIR` to isolate global plugin/config loadability from repository-surface detection.
- The current repository-local `.opencode/skills/` layout remains valid and contains the same nine canonical adapters.

## Existing owners and reuse path

| TP tasks | Existing owner | Coverage before implementation | Action |
|---|---|---|---|
| OGS-01 | installed OpenCode runtime and `create-agdf/scripts/smoke-test.js` | partially_done | Extend the isolated runtime probe with global discovery and collision-safe namespace evidence. |
| OGS-02 | `create-agdf/bin/create-agdf.js` generated-write protections | not_done | Add a narrow global ownership marker contract; reuse existing generated-write safety conventions. |
| OGS-03 | `create-agdf/scripts/sync-package-assets.js`, `plugin/skills/**` | partially_done | Extend canonical adapter generation to the global path; do not fork skill bodies. |
| OGS-04 | `installOpenCodeGlobalPlugin()` | partially_done | Extend the existing `opencode` installer in place; preserve public command shape. |
| OGS-05 | `create-agdf/opencode-plugin.js` and generated `.opencode/AGDF.md` | partially_done | Add a generated global boundary adapter; keep plugin lifecycle-only. |
| OGS-06 | `evaluateOpenCodeStatus()` and smoke tests | partially_done | Add additive global-native fields and preserve schema-v1 aliases. |
| OGS-07 | global config merge and existing-config tests | partially_done | Extend preservation tests for instructions, permissions and unowned skills. |
| OGS-08 | `create-agdf/opencode-plugin.js` | fully_done for current boundary | Keep unchanged unless implementation evidence proves a read-only signal is necessary. |
| OGS-09 | `plugin/scripts/check-runtime-integrity.mjs`, package smoke tests | partially_done | Add global asset count/marker/reference checks. |
| OGS-10 | installed OpenCode probe and `capabilities.js` | partially_done | Add global discovery/precedence probe; retain `instruction_only`. |
| OGS-11 | `INSTALL.md`, package README, Pages and CLI output | partially_done | Update existing OpenCode documentation owners. |
| OGS-12 | control artefact chain and validation commands | not_done | Produce implementation evidence after all code/tests. |

## Reuse strategy

- overall: `extend`
- generator: extend `sync-package-assets.js` with a shared global adapter path and boundary transformation;
- installer/status: extend `create-agdf/bin/create-agdf.js` rather than adding a command;
- plugin: retain the existing small lifecycle/status/compaction owner;
- validation: extend the current OpenCode smoke, runtime-integrity and installed-runtime probes;
- documentation: update existing OpenCode sections in place.

## Change impact and regression risk

- global config and skill files are user-global state, so preservation and ownership checks are higher risk than repository-only generation;
- `opencode-status` is schema-v1 and must remain additive/alias-compatible;
- same-named project/global skills are not project-preferred in the installed runtime, so global adapters must use `agdf-global-*` and duplicate-discovery behavior must be captured in runtime tests;
- no data model, persistence schema or shared gate semantics change;
- no UI or central state-hook risk is present;
- OpenCode remains `instruction_only`; discovery and permissions do not establish independent enforcement.

## Parallel-structure and source-of-truth check

The implementation is safe if global assets are adapters only. A global `AGDF.md` may provide the fail-closed boundary, but `.agdf/control/` and repository-local `.opencode/AGDF.md` remain authoritative. No global control directory, second router policy or plugin gate calculator is permitted.

## Missing evidence and implementation obligations

- prove collision-safe discovery or document the exact OpenCode merge behavior in OGS-10;
- test preservation of unrelated global skills and unmarked AGDF-like files before enabling overwrite;
- validate global permission merging against existing user config rather than assuming defaults;
- verify status behavior for missing, partial and complete global surfaces.

These are implementation/test obligations, not blockers: the owners and isolated runtime path are known and the TP explicitly covers them.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing Delivery Path Search surface capability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
- rationale: the work changes OpenCode packaging and visibility only; no reusable enforcement knowledge is established.

## Minimal clean implementation path

Extend canonical asset generation, the existing global installer and additive status reporting in place; add ownership markers and fail-closed global boundary text; preserve unrelated global config/files; then prove global discovery, local-vs-global behavior, status separation, runtime integrity and `instruction_only` classification with focused and aggregate tests.

## Required next step

Proceed to `CD+Tests` for the approved TP. Do not broaden the scope to tool enforcement or global control-state persistence.
