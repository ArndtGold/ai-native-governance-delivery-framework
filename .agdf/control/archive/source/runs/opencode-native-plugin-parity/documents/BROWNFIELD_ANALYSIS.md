# Brownfield Analysis

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- required_next_step: `CD+Tests`

## Scope

Verify the approved Task Plan against the installed OpenCode runtime and the existing AGDF OpenCode implementation before changing code.

## Runtime evidence

- Installed OpenCode runtime: `1.17.13` at `/Users/arndtgold/.npm-global/bin/opencode`.
- `opencode plugin <module>` is a native installer that updates project config; `--global` targets global config and `--force` replaces an existing plugin version.
- `opencode debug skill` is the native discovery probe for project and global skills.
- `opencode agent list` is the native discovery probe for generated agents.
- A clean temporary repository produced by the current `opencode-repo` target exposes all nine `agdf-*` entries as subagents, while `opencode debug skill` exposes no AGDF skills.
- OpenCode supports explicit `skill`, `edit` and `bash` permission keys. Skill discovery and permissioning are separate from AGDF gate enforcement.

## Current coverage

| Area | Coverage | Existing owner |
|---|---|---|
| npm plugin module | fully_done | `create-agdf/opencode-plugin.js`, package exports |
| native plugin installation | partially_done | current CLI edits config directly; OpenCode now exposes `opencode plugin` |
| repository instructions | fully_done | `sync-package-assets.js` and `.opencode/AGDF.md` |
| subagent discovery | fully_done | `.opencode/agents/agdf-*.md`; verified with `opencode agent list` |
| native skill discovery | not_done | no `.opencode/skills/agdf-*/SKILL.md`; verified with `opencode debug skill` |
| permission boundary | partially_done | `edit` and `bash` are explicit; `skill` is absent |
| repository status detection | fully_done for current layout | CLI status and plugin detect `AGDF.md` plus `.opencode/agents` |
| generation regression tests | partially_done | smoke tests assert agents and explicitly reject skills |
| integrity ownership | partially_done | runtime-integrity check requires `writeOpenCodeAgent` and must move with the canonical layout |
| user documentation | partially_done | `INSTALL.md`, package READMEs, CLI help and Pages describe the current agent-only surface |

## Reuse strategy

- overall: `extend` the existing package, CLI target and status model;
- generator: `refactor` the OpenCode asset writer from agent files to native skill directories;
- installer: `refactor` the global/project plugin installation path to prefer OpenCode's native `opencode plugin` command where compatibility evidence permits, while preserving deterministic config/status behavior;
- status/plugin detection: `extend` existing checks from `.opencode/agents` to `.opencode/skills`;
- tests/docs/integrity: `replace` agent-only assertions with native-skill assertions rather than adding a parallel suite.

## Owner and change map

| TP tasks | Primary owners | Expected action |
|---|---|---|
| OC-01, OC-02 | OpenCode CLI probes; repository search | Record native installer and discovery behavior; confirm agent-only usage is generated/documented rather than external policy ownership. |
| OC-03, OC-04 | `plugin/meta/agdf-plugin.definition.json`, `create-agdf/scripts/sync-package-assets.js` | Generate valid native skills and a thin router from canonical sources. |
| OC-05 | synchronizer, CLI help, `INSTALL.md`, package READMEs, Pages copy | Remove agent-only product claims and generated parallel routing. |
| OC-06 | generated `opencode.json`, existing-config merge/protection path | Add explicit skill permission without weakening edit/bash approval. |
| OC-07 | `create-agdf/opencode-plugin.js`, status code in `create-agdf/bin/create-agdf.js` | Detect native skill layout and retain global/repository separation. |
| OC-08 | `create-agdf/scripts/smoke-test.js`, routing tests, runtime-integrity check | Replace agent-only expectations and add native discovery coverage. |
| OC-09 | capability probe and `capabilities.js` | Keep `instruction_only` unless an independent guard is proven. |
| OC-10 | package/runtime checks | Produce task-linked implementation evidence. |

## Compatibility and migration

- Existing commands remain the public interface.
- The implementation may use `opencode plugin` internally without adding a new AGDF command or parameter.
- Existing repositories are changed only by an explicit `opencode-repo` run; existing-config protection remains binding.
- Generated `.opencode/agents/agdf-*.md` files must not coexist indefinitely with equivalent native skills. The explicit regeneration path should remove known AGDF-generated agent files when safe and leave unrelated user agents untouched.
- Status output changes its visible entry point from `@agdf-gate-check` to native skill discovery wording only when the new surface is present.

## Parallel-structure and source-of-truth check

The implementation is safe only if generated native skills replace the generated AGDF subagents as workflow controls. Keeping both would create two discoverable AGDF routing surfaces. Canonical skill bodies, router rules and the Runtime Contract remain sourced from `plugin/**`; OpenCode-specific files remain generated adapters.

## Risks

- Native plugin installation behavior may differ across OpenCode versions; retain explicit version/error evidence and deterministic status checks.
- Removing only generated AGDF agents requires precise ownership matching to avoid deleting user files.
- OpenCode native skills improve discovery but do not prove model-independent gate enforcement.
- Documentation, integrity checks and generated assets are broad propagation owners; missing one would create product/runtime drift.

## Missing evidence

No blocking existing-system evidence is missing. Live model execution is not required to begin CD+Tests. OC-09 must still capture bounded enforcement evidence before any capability upgrade.

## Context Graph impact

- context_graph_impact: `link_only`
- context_graph_refs: existing Delivery Path Search surface capability invariant
- context_graph_gate_effect: none
- context_graph_required_action: reconcile the final OpenCode capability classification at QA/OR; create no new node unless reusable enforcement knowledge is actually established

## Minimal clean implementation path

Refactor the existing generator and status/plugin owners in place: generate native skills, remove only owned generated AGDF agents during explicit regeneration, add explicit skill permission, align plugin/status detection, replace agent-only tests and documentation, then run native OpenCode discovery probes plus package/runtime integrity checks. Do not add a second OpenCode router or a speculative tool-enforcement layer.
