# Brownfield Review: Simple Local Plugin Installation Scripts

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-local-plugin-install-scripts
- related_ur: `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UR.md`
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-08-23

## Objective

Size and route the approved source-checkout npm installation entry points while preserving the existing AGDF build, marketplace, host lifecycle, verification and public bootstrap owners.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: The contributor-facing primary action becomes shorter and more discoverable, but the existing surface-specific installation, status, recovery, restart and evidence semantics remain authoritative and unambiguous.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and public installation guidance | `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UR.md`; `INSTALL.md`; `agdf/README.md` | low |
| Source of truth | Root package for repository contributor commands; `create-agdf` for lifecycle implementation | `package.json`; `create-agdf/package.json`; `create-agdf/lib/cli/application.js` | medium |
| Runtime path | Generated package assets and surface-specific installer modules | `create-agdf/lib/cli/runtime-context.js`; `create-agdf/lib/installers/plugin-installers.js`; `create-agdf/lib/installers/opencode.js` | medium |
| UI / UX | npm command names and existing lifecycle presentation | Root `package.json`; `create-agdf/lib/lifecycle/presentation.js` | low |
| Persistence / data | Owned local marketplace and host configuration | `create-agdf/lib/installers/local-marketplace.js`; OpenCode ownership preflight | low |
| Tests / QA | Existing lifecycle, marketplace, smoke, package and Runtime Integrity suites | `create-agdf/scripts/local-marketplace-test.js`; `lifecycle-test.js`; `smoke-test.js`; Runtime Integrity tests | medium |
| Release / operations | Canonical package asset synchronization and public package bootstrap | `create-agdf` `release:prepare`; `INSTALL.md` | low |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Codex and Claude Code already share one transactional local-marketplace and host-command owner. | `plugin-installers.js` delegates to `prepareLocalMarketplace`. | block | npm scripts must invoke the existing CLI path after canonical source preparation; no new marketplace writer. |
| OpenCode installs an npm runtime and a generated global native surface rather than the Codex/Claude plugin bundle. | `installOpenCodeGlobalPlugin` and `installOpenCodeGlobalSurface`. | revise | Preserve the distinct OpenCode lifecycle and design a checkout-local package source without pretending it is the same plugin transport. |
| Runtime metadata is loaded from generated package assets, not directly from source `plugin/`. | `runtime-context.js` resolves `create-agdf/generated`. | block | Every local install entry point must run the canonical source-to-generated preparation before lifecycle execution. |
| Public `npx` bootstrap already owns end-user installation. | `INSTALL.md`; `agdf/README.md`; CLI help. | warn | Document npm scripts as contributor/source-checkout commands only. |
| Project Inventory provides useful command naming but does not own AGDF lifecycle semantics. | `agdf-project-inventory/package.json`. | warn | Reuse the naming pattern only; retain AGDF's existing lifecycle owners and verification model. |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: `bounded_structured_slice` because this is one coherent contributor installation outcome with fixed existing owners, no new authority or public CLI grammar, bounded local propagation and independently testable surface adapters. Quick Task is ineligible because the change adds a user-visible developer capability across executable paths. Verified Change is ineligible because the work spans the root command owner, build propagation, multiple lifecycle adapters, documentation and tests. Full Structured Delivery is rejected because no trust boundary, persistence migration, public package protocol, coordinated host cutover or independent consumer rollout is introduced.
- evidence: Approved UR; root and `create-agdf` package manifests; existing CLI application, marketplace, lifecycle, OpenCode, build and test owners; clean candidate implementation paths in the current worktree.
- transparency_note: PRD, SD and TP remain required, but only for the bounded source-checkout installation slice. Existing public installation and host lifecycle behavior stay outside redesign.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery` is unnecessary because the npm scripts remain repository contributor aliases over existing lifecycle owners and require no coordinated release, external compatibility window, migration or cross-host cutover.
- missing_or_conflicting_facts: none
- depth_evidence_refs: `package.json`; `create-agdf/package.json`; `create-agdf/lib/cli/application.js`; `create-agdf/lib/installers/plugin-installers.js`; `create-agdf/lib/installers/local-marketplace.js`; `create-agdf/lib/installers/opencode.js`; `create-agdf/lib/cli/runtime-context.js`; existing lifecycle and package tests.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One contributor action installs or refreshes the current checkout for a named supported surface with explicit verification. |
| authority_boundary | pass | AGDF lifecycle, marketplace ownership, plugin identity and gate authority remain with their current modules and contracts. |
| owner_consumer_coordination | pass | Root npm scripts delegate to `create-agdf`; each host surface remains independently invokable and verifiable. |
| full_depth_impacts_absent | pass | No permission, security, persistence, external API, public CLI grammar, release plan or coordinated host activation changes. |
| migration_propagation_bounded | pass | Propagation is limited to canonical source asset preparation plus existing owned installation paths; removal or rollback semantics remain unchanged. |
| failure_recovery_local | pass | Existing ownership preflight, transactional marketplace rollback and surface-specific lifecycle failures remain the recovery owners. |
| independently_acceptable | pass | Each named npm command can be fixture-tested and host-verified separately while the complete slice shares one contributor contract. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which exact npm scripts are required, and must status scripts be included in the same slice? | PRD | revise |
| What source-preparation guarantee must precede every install command? | PRD | revise |
| How does OpenCode consume the current checkout without resolving the already-published package? | SD | revise |
| Which command layer owns orchestration while preserving existing installer error and rollback behavior? | SD | revise |
| Which evidence is repository/package proof versus installed-host or restarted-host proof? | PRD | revise |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The existing node now records that source-checkout npm aliases must delegate to canonical preparation and lifecycle owners and preserve separate installed-host evidence.

## Next Permissible Step

- next_allowed_action: Draft the bounded PRD for exact contributor commands, behavior, evidence and non-goals, then request `Approval: PRD`.
- forbidden_until_then: Solution Design, Task Plan, implementation, installation, QA, release and VCS delivery.

## Quality Outlook

- quality_outlook: Make the OpenCode checkout-local package source explicit without weakening the existing ownership, exact-version and host-evidence boundaries.
