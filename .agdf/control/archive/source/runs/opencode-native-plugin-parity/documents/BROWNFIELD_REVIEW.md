# Brownfield Review

## Review mode

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`

## Scope

Evaluate whether the existing OpenCode adapter can be extended into a native OpenCode plugin surface without creating a second AGDF policy owner or weakening the repository control-state boundary.

## Existing coverage

| Area | Coverage | Evidence |
|---|---|---|
| npm plugin loading | partially_done | `create-agdf/opencode-plugin.js`, `create-agdf/package.json` |
| global install/status path | fully_done | `create-agdf/lib/targets/opencode.js`, OpenCode smoke tests |
| repository instructions | fully_done | generated `.opencode/AGDF.md` and `opencode.json` |
| workflow routing | partially_done | generated `mode: subagent` agents under `.opencode/agents/` |
| native OpenCode Skills | not_done by design | `create-agdf/scripts/sync-package-assets.js` explicitly omits `.opencode/skills/` |
| permission controls | partially_done | generated `edit` and `bash` permissions set to `ask` |
| capability enforcement evidence | not_done | `capabilities.js` classifies OpenCode as `instruction_only` with no evidence |
| canonical source propagation | fully_done | `plugin/meta/agdf-plugin.definition.json` and sync script |

## Reuse strategy

`extend` the existing OpenCode package and generated-surface pipeline. The canonical router, Runtime Contract and skill definitions remain authoritative; OpenCode-specific packaging becomes an adapter concern. No parallel AGDF policy or gate implementation is justified.

## Impact

- likely owners: `create-agdf/opencode-plugin.js`, `create-agdf/scripts/sync-package-assets.js`, `plugin/meta/agdf-plugin.definition.json`, OpenCode capability evaluation and focused smoke tests;
- interfaces: OpenCode package exports, `opencode.json`, generated `.opencode/` layout and capability evidence contract;
- compatibility: existing global `opencode` and repository `opencode-repo` commands must remain usable, including existing-config protection;
- regression surface: package generation, skill/agent discovery, permission behavior, status reporting and cross-surface source synchronization;
- data model/migration: no persistent data migration expected.

## Parallel-structure check

No new AGDF policy owner is needed. The current split between npm hook and repository files is an integration split, not a second source of truth. The implementation must avoid copying the Runtime Contract into a separately maintained OpenCode-only policy.

## Product and runtime risks

- OpenCode's native Skills/Agents/Plugin mechanisms must be verified against the installed/current runtime before design is finalized.
- A plugin being loadable does not prove that it can enforce tool restrictions; capability classification must remain fail-closed until reproducible evidence exists.
- Global plugin activation must not imply that a repository has active AGDF control state.

## Context Graph impact

- context_graph_impact: `link_only`
- context_graph_refs: existing delivery-path-search surface capability node and Runtime Contract enforcement distinction
- context_graph_gate_effect: none at review stage
- context_graph_required_action: assess whether the final enforcement evidence changes the existing OpenCode capability invariant during implementation closeout

## Transparency

`structured_slice` is selected because the existing package, generator, CLI commands, control boundary and tests are substantial and reusable, while the requested change is bounded to OpenCode integration parity. A PRD is required because the change alters a user-visible runtime integration and may change the capability contract. No implementation is permitted before PRD, SD and TP approvals.

## Required next step

Create the PRD for the approved OpenCode-native plugin parity slice.
