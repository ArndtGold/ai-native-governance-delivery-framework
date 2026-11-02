# Brownfield Review: AGDF GitHub Copilot Plugin Integration

Status: done  
Mode: post_ur_review  
Revision: 2
Date: 2026-08-28  
UR: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` revision 2

## Decision

- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- scope: Make the existing installable AGDF plugin the only supported GitHub Copilot integration.
  Remap the public `copilot` command to plugin installation, retire the separate repository
  projection and its `both` composition, preserve existing user files and align documentation and
  tests with that single product path.
- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The change removes a visible installation choice, changes the meaning of a
  public CLI command and changes recovery guidance. Installed, pending restart, active, degraded,
  disabled and uninstalled states remain.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md` revision 2
- transparency: The plugin implementation and lifecycle owners already exist, but the change is not
  a documentation-only correction. It changes a published command contract and retires a supported
  generated surface, so the structured artefact chain must be realigned before implementation.

## Current Coverage

| Capability | Coverage | Evidence |
|---|---|---|
| Generated Copilot plugin bundle | `fully_done` | `create-agdf/generated/plugins/agdf/plugin.json`, `copilot-skills/**`, `hooks/copilot-hooks.json`, exact runtime payload |
| Copilot plugin lifecycle | `fully_done` for the existing `copilot-plugin` command | `create-agdf/lib/cli/application.js`, `plugin-installers.js`, lifecycle status and operations, focused tests |
| Local checkout installation | `fully_done` | Root and package `install:copilot` scripts call the plugin lifecycle |
| Public `copilot` plugin command | `not_done` | `copilot` currently routes to `scaffoldHandler`; plugin installation is exposed as `copilot-plugin` |
| Copilot repository projection | `fully_done` but now retired by product decision | Scaffold plan and presentation, generated `AGENTS.md`, `.github/copilot-instructions.md`, `.github/skills/**`, smoke and routing tests |
| `both` composition | `fully_done` but conflicts with revised scope | It combines the Codex repository marketplace with the retired Copilot repository projection |
| Non-destructive migration | `partially_done` | Current lifecycle avoids deleting repository files, but command retirement and documentation need regression coverage |
| Public documentation and Pages | `partially_done` | INSTALL and CLI README describe two Copilot paths; root README and Pages contain repository-only or missing plugin claims |

## Existing Owners And Reuse Strategy

| Concern | Canonical owner | Strategy |
|---|---|---|
| Public command registration and validation | `create-agdf/lib/cli/command-registry.js`, `application.js` | `refactor`; map `copilot` to the existing plugin handler and remove the separate public `copilot-plugin` contract |
| Plugin install and lifecycle | `create-agdf/lib/installers/plugin-installers.js`, lifecycle modules | `reuse`; no second installer or provenance model |
| Local checkout command | Root and `create-agdf/package.json`, `install-local-plugin.js` | `reuse`; keep `npm run install:copilot` as the local plugin path |
| Copilot plugin bundle | `plugin/meta/agdf-plugin.definition.json`, `sync-package-assets.js`, `sync-plugin-runtime.js` | `reuse`; preserve the generated plugin and its prefixed skills, hook and exact validator |
| Repository projection | Scaffold plan, presentation and generated repository assets | `remove from supported Copilot generation`; do not delete files already present in user repositories |
| `both` target | CLI registry, scaffold handler and routing tests | `retire`; it cannot remain a Copilot setup path under plugin-only support |
| Runtime-check consent | `create-agdf/lib/runtime-check-consent/**` | `reuse`; accept `copilot` as the plugin installer target and retain consent boundaries |
| Documentation | `README.md`, `INSTALL.md`, `create-agdf/README.md`, `pages/src/data/site.ts` | `refactor`; publish one Copilot install command and one support model |
| Verification | Existing smoke, lifecycle, local-install, routing and Pages tests | `refactor`; replace repository-projection assertions with plugin-command and non-deletion assertions |

## Impact And Compatibility

- interfaces: `copilot` changes from repository generation to plugin installation;
  `copilot-plugin` and `both` are retired public targets.
- persistence: no new store. `.agdf/control/` remains repository-owned and is created through the
  generic governed setup path when needed, not through a Copilot-specific projection.
- migration: existing `AGENTS.md`, `AGENTS.agdf.md`, `.github/copilot-instructions.md`,
  `.github/skills/**` and `.agdf/control/**` remain untouched by install, update and uninstall.
- backwards_compatibility: the command change is intentionally breaking within the unreleased
  Copilot plugin work. Existing checked-in files continue to function as user-owned legacy content
  but are no longer generated, documented or supported as an AGDF Copilot distribution path.
- regression_surface: CLI help, command registry, scaffold planning, generated package contents,
  runtime-check consent, local install, lifecycle, routing tests, release checks and public docs.
- visible_state_ownership: Copilot owns effective plugin installation and loading; AGDF lifecycle
  owns verified package reporting; `.agdf/control/` owns governance state.
- ui_monolith_risk: `not_applicable`; this is a bounded CLI and documentation contract change.

## Parallel Structure And Drift Assessment

- The plugin is the single Copilot distribution surface. No replacement repository projection may
  be created under another command name.
- The current `copilot` scaffold mapping and `copilot-plugin` installation mapping are product
  semantics drift against approved UR revision 2.
- Existing generated repository assets are historical implementation evidence, not authority to
  retain a second supported path.
- Plugin skills remain generated from canonical AGDF skills. Removing the repository projection
  must not remove or rename the plugin's `copilot-skills/**` payload.
- Lifecycle, consent, approval and provenance owners remain shared. A Copilot-specific parallel
  installer or gate model is prohibited.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: `external_contract_depth`; `release_cross_host_depth`
- rejected_alternative: `structured_slice` is rejected because `copilot` changes meaning, two public
  targets are retired and package, installer, generated assets, tests and public documentation must
  move together without deleting user content.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: approved UR revision 2; CLI registry and handler mapping; scaffold plan and
  generated Copilot assets; existing plugin lifecycle; smoke, routing and local-install tests.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | `pass` | One supported Copilot plugin path and one canonical public install command. |
| `authority_boundary` | `pass` | Copilot owns host state; `.agdf/control/` and exact approvals retain governance authority. |
| `owner_consumer_coordination` | `pass` | Existing CLI, generator, lifecycle, consent, documentation and test owners are identified. |
| `full_depth_impacts_absent` | `fail` | The public CLI contract and supported distribution surface change materially. |
| `migration_propagation_bounded` | `pass` | Existing user files are retained; only future generation and supported guidance are removed. |
| `failure_recovery_local` | `pass` | Existing plugin lifecycle already owns install, update, status, disable, uninstall and recovery. |
| `independently_acceptable` | `pass` | The plugin is already useful without the repository projection. |

## Risks And Missing Evidence

- Retiring `both` can affect users who use it for a combined Codex and Copilot repository setup.
  Documentation must state that Codex repository setup remains available separately.
- Generated repository files may remain in source and package fixtures for unrelated consumers.
  Removal must be owner-specific and verified through package inventory.
- Existing user repositories can retain stale AGDF Copilot files. They must not be deleted or
  presented as current supported installation evidence.
- Linux and native Windows plugin lifecycle parity remains separately unverified.

## Context Graph And Knowledge Persistence

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-CREATE-AGDF-CLI-COMPOSITION`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `pending_after_delivery`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: The revised scope changes the public Copilot command and removes the
  repository projection consumer while retaining existing authority and lifecycle owners.
- memory_target: `scope_artifact`
- memory_reason: The plugin-only command and migration decision remain run-specific until delivered.
- memory_refs: this Brownfield Review and approved UR revision 2

## Required Next Step

Revise the PRD around one supported Copilot plugin path, canonical `copilot` installation,
non-destructive legacy-file retention, lifecycle states and evidence boundaries. Do not implement
until the revised PRD, SD and TP are separately approved.
