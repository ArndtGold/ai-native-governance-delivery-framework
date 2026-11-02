# Brownfield Review: Global Native OpenCode Surface

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/opencode-global-native-surface/BROWNFIELD_REVIEW.md`

## Scope

Assess whether the approved request can add globally discoverable native OpenCode AGDF skills without creating a second governance owner or weakening the repository-local source-of-truth boundary.

## Existing owners and coverage

| Area | Current coverage | Existing owner | Brownfield action |
|---|---|---|---|
| Canonical AGDF skill bodies | fully_done | `plugin/skills/**` | Reuse as the only skill-body source. |
| OpenCode repository skill adapters | fully_done | `create-agdf/scripts/sync-package-assets.js` | Extend the adapter generator or shared asset path; do not fork skill bodies. |
| Global OpenCode npm plugin installation | fully_done | `installOpenCodeGlobalPlugin()` in `create-agdf/bin/create-agdf.js` | Extend the existing global installer in place. |
| Global/repository status separation | fully_done | `evaluateOpenCodeStatus()` and `opencode-status` | Add a distinct global native-surface signal without conflating it with repository activation. |
| Lifecycle/status/compaction hook | fully_done | `create-agdf/opencode-plugin.js` | Retain as the global runtime adapter; it must not become a second gate owner. |
| OpenCode native discovery evidence | partially_done | package smoke tests and installed OpenCode probes | Add a global-skill discovery probe using an isolated OpenCode config directory. |
| Existing-config protection and migration | partially_done | OpenCode generator and smoke tests | Define ownership and non-destructive behavior for globally installed skill adapters. |
| Capability classification | fully_done | `create-agdf/lib/delivery-path-search/surfaces/capabilities.js` | Preserve `instruction_only`; no enforcement upgrade in this slice. |
| Documentation and status output | partially_done | `INSTALL.md`, package README, CLI output, Pages copy | Describe global native skills separately from repository-local governance. |

## Reuse strategy

- overall: `extend`
- canonical content: reuse `plugin/skills/**` and the shared Runtime Contract;
- installer: extend the existing `opencode` target so global plugin and global native skill assets have one deterministic ownership path;
- status: extend the existing status report with global native skill presence/discovery evidence while preserving repository-surface status;
- tests: extend the existing OpenCode smoke suite and installed-runtime probes;
- documentation: sharpen existing OpenCode installation guidance rather than adding a second guide.

## Change impact

- files/modules: `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/sync-package-assets.js` or a shared global asset writer, `create-agdf/scripts/smoke-test.js`, `create-agdf/opencode-plugin.js` only if hook context needs a read-only global-surface signal, runtime integrity, package README, `INSTALL.md` and Pages copy;
- interfaces: existing `opencode` and `opencode-status` commands and schema-v1 output; public command shape should remain unchanged;
- persistence: user-global OpenCode config/skill directories, with preservation of unrelated user files and an explicit AGDF-owned fingerprint for migration;
- compatibility: existing global plugin installs must remain valid; repository-local `opencode-repo` must continue to work independently;
- regression tests: global discovery, global/repository separation, existing-config preservation, deterministic regeneration, status schema compatibility and `instruction_only` classification;
- side effects: global installation changes the user's OpenCode skill discovery for all repositories, so fail-closed routing and clear status wording are mandatory.

## Parallel-structure risk

High if global skills contain an independent router, copied control state or a second gate model. The clean target is one canonical skill body and Runtime Contract source with global adapters only. Global skills may announce or delegate to the repository surface, but may not declare a repository governed merely because the global plugin or global skill exists.

## Source-of-truth and runtime drift

The global surface is a new delivery adapter, not a new governance source. `.agdf/control/` remains repository-owned. OpenCode's global skill directory is an installation surface only. The implementation must make the distinction visible in `opencode-status` and global skill instructions.

## Context Graph impact

- context_graph_impact: `link_only`
- context_graph_refs: existing Delivery Path Search surface capability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
- rationale: global discoverability changes packaging and routing visibility but establishes no new model-independent enforcement evidence.

## Transparency

This is not a Quick Task: it changes a global runtime installation surface, status contract, migration ownership and cross-repository behavior. A small structured slice is sufficient because canonical skills, the plugin hook, repository generator, status owner and tests already exist. PRD/SD/TP must define the exact global directory, ownership fingerprint, fail-closed routing and schema-compatible status fields before implementation.

## Missing evidence

- exact OpenCode global skill directory and precedence behavior must be verified against the installed runtime before implementation;
- whether global skills can safely reference a globally installed Runtime Contract without conflicting with repository-local copies;
- deterministic uninstall/update behavior for AGDF-owned global skill files.

## Required next step

Draft the smallest PRD for the global native OpenCode surface and request `Approval: PRD`. Do not implement before the PRD/SD/TP chain and post-TP Brownfield Analysis.
