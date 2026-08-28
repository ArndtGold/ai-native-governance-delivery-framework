# Brownfield Review: AGDF GitHub Copilot Plugin Integration

Status: done  
Mode: post_ur_review  
Date: 2026-08-28  
UR: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md`

## Decision

- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- scope: Generate, install, validate and document one AGDF plugin package for the supported GitHub
  Copilot app and CLI while retaining repository-owned control state and the existing bootstrap path.
- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The change adds install, update, activation, disabled, degraded and recovery
  states that users must understand across the Copilot app and CLI. It changes a bounded capability's
  effective state and recovery behavior without creating a broader application UX.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md`
- transparency: A small proof can reuse much of the existing generated content, but delivery changes
  a versioned external plugin contract and cross-host installation lifecycle. Compact Delivery and
  Structured Slice therefore do not provide enough contract, recovery and release depth.

## Current Coverage

| Capability | Coverage | Evidence |
|---|---|---|
| Copilot repository instructions and skills | `fully_done` | `create-agdf/generated/.github/skills/**`, `.github/copilot-instructions.md`, `AGENTS.md` generation and routing smoke tests |
| Canonical skill and metadata ownership | `fully_done` | `plugin/skills/**`, `plugin/meta/agdf-plugin.definition.json`, `plugin/meta/contracts/**` |
| Complete generated runtime plugin | `fully_done` for Codex and Claude | `create-agdf/generated/plugins/agdf/**`, `sync-package-assets.js`, `sync-plugin-runtime.js` |
| Copilot plugin manifest and marketplace projection | `not_done` | No Copilot plugin bundle or `.github/plugin/marketplace.json` owner exists |
| Copilot plugin lifecycle | `partially_done` | Lifecycle schema recognizes `copilot`; install handlers, restart action, status and local install command do not |
| Copilot session activation hook | `not_done` | Existing `plugin/hooks/hooks.json` is owned by the Codex and Claude bundle and does not match the documented Copilot hook contract |
| Copilot exact-version validator resolution | `partially_done` | Validator payload exists; installed Copilot plugin root resolution and provenance are unimplemented and unobserved |
| Copilot host evidence | `partially_done` | Installed app 1.1.14 and bundled SDK inspected; plugin installation, fresh-session loading and cross-platform behavior unverified |
| Public documentation | `partially_done` | Current docs describe repository-only, instruction-only Copilot behavior and require revision after delivery evidence exists |

## Existing Owners And Reuse Strategy

| Concern | Canonical owner | Strategy |
|---|---|---|
| Plugin identity and surface metadata | `plugin/meta/agdf-plugin.definition.json` | `extend`; add Copilot plugin and lifecycle metadata without a second manifest owner |
| Copilot skill names and portable skill projection | `sync-package-assets.js`, `skillSet`, `copilot.skillPrefix` | `extend`; reuse the existing `agdf-` transformation and shared contracts |
| Complete runtime payload | `sync-plugin-runtime.js` and generated runtime manifest | `extend`; compose the Copilot bundle through the same exact-version runtime owner |
| Host installer and provenance | `create-agdf/lib/installers/**`, lifecycle modules and provenance contract | `extend`; add a thin Copilot adapter only after the supported transport is confirmed |
| Runtime-check consent | `create-agdf/lib/runtime-check-consent/**` | `extend` only if automatic checks are supported; preserve manual mode and content-bound consent |
| Gate approval and presentation | `plugin/meta/contracts/interaction.md`, locale registry and renderer | `reuse`; exact text remains baseline and native input stays capability-gated |
| Package and routing validation | `check-runtime-integrity.mjs`, `smoke-test.js`, release preparation | `extend`; validate the exact Copilot candidate and keep generated parity |
| Repository bootstrap | `create-agdf` scaffold plan and writer | `reuse unchanged`; plugin complements rather than replaces project-owned files |
| Installation documentation and public capability copy | `INSTALL.md`, package READMEs and Pages compatibility data | `extend` after executable evidence; avoid a second documentation owner |

## Impact And Compatibility

- interfaces: Copilot `plugin.json`, marketplace metadata, skill discovery, hooks, lifecycle commands
  and possibly extension APIs become compatibility-sensitive external host contracts.
- persistence: no new AGDF governance store is required. Host plugin cache and existing content-bound
  consent receipts are installation state, not delivery authority.
- migration: existing repository-local Copilot users keep their files. Plugin skills must coexist
  with project and personal skill precedence without overwriting either.
- backwards_compatibility: `npm create agdf -- copilot` remains a supported repository setup path.
  Existing Codex, Claude and OpenCode bundles retain their identifiers and behavior.
- regression_surface: release preparation, generated asset parity, manifest validation, runtime
  provenance, installer transactions, status output, routing, hooks and public documentation.
- visible_state_ownership: Copilot owns effective installed, enabled, managed and loaded host state;
  AGDF lifecycle output reports verified package state; `.agdf/control/` owns governance state.
- ui_monolith_risk: `not_applicable`; no large UI component is proposed. Native host UI remains a
  thin optional adapter rather than an AGDF-owned interface.

## Parallel Structure And Drift Assessment

- A second Copilot-only skill source is prohibited. The existing canonical skills and surface
  projector must generate the plugin content.
- A second installer, provenance schema, approval renderer or gate model is prohibited.
- The generated plugin directory is derived output, never a new source of truth.
- Current documentation stating that Copilot cannot consume AGDF as a plugin is confirmed drift
  against current official GitHub capabilities. It should change only with delivered package and
  host evidence, not from documentation review alone.
- The generated local runtime bundle observed during analysis was stale relative to source version
  0.13.8. Normal `release:prepare` regeneration remains the owner; the stale output is not a design
  signal and must not be patched directly.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: `external_contract_depth`; `release_cross_host_depth`
- rejected_alternative: `structured_slice` is rejected because the work establishes a versioned
  external plugin contract and coordinated package, installer, activation, compatibility and release
  behavior across the Copilot app and CLI.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: official Copilot plugin and hooks references; `plugin/meta/agdf-plugin.definition.json`;
  `sync-package-assets.js`; `sync-plugin-runtime.js`; lifecycle and installer modules; existing smoke
  and Runtime Integrity owners.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | `pass` | One installable AGDF Copilot plugin has a clear installation, discovery, validation and documentation boundary. |
| `authority_boundary` | `pass` | Copilot owns host installation and permissions; `.agdf/control/` and the exact approval contract retain governance authority. |
| `owner_consumer_coordination` | `pass` | Internal AGDF owners and the Copilot app/CLI consumers are identified; repository bootstrap remains independently supported. |
| `full_depth_impacts_absent` | `fail` | External plugin compatibility, versioned distribution, cross-host activation and release evidence are directly in scope. |
| `migration_propagation_bounded` | `pass` | Existing repository files remain compatible; generated projections and owned installer transactions provide bounded propagation and rollback paths. |
| `failure_recovery_local` | `pass` | Installation failure, stale version, disabled state and restart requirements can be surfaced and recovered through the existing lifecycle model; live proof remains later evidence. |
| `independently_acceptable` | `pass` | A skills, runtime and exact-text plugin is useful without native approval UI or default-marketplace publication. |

## Risks And Missing Evidence

- Direct app installation, loaded skill inventory, hook behavior and plugin-local validator resolution
  remain implementation and UAT evidence obligations.
- Linux and native-Windows install, update, rollback and fresh-session behavior remain unverified.
- Native Copilot input APIs must not be treated as gate-safe until exact value transport, deliberate
  waiting and revalidation are directly proven.
- Managed policy and project/personal skill precedence can change effective plugin behavior and need
  explicit diagnostics and tests.

## Context Graph And Knowledge Persistence

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-TASK-TARGET-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes already own public plugin evidence separation, exact approval
  authority, target selection and deterministic status. No new reusable decision is final before PRD
  and SD.
- memory_target: `scope_artifact`
- memory_reason: The owner inventory and depth decision are specific to this run until design settles
  a reusable Copilot lifecycle boundary.
- memory_refs: this Brownfield Review and `UX_INTENT_DEFINITION.md`

## Required Next Step

Draft the smallest PRD that defines the plugin package, complementary repository path, visible
lifecycle states, exact-text approval baseline, support matrix and evidence obligations. Do not
design or implement the adapter yet.
