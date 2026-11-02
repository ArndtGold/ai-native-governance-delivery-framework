# Brownfield Review: AGDF Plugin Family Language

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: agdf-plugin-family-language
- related_ur: `.agdf/control/artefacts/agdf-plugin-family-language/UR.md`
- current_gate: PRD
- reviewer: Codex
- reviewed_at: 2026-08-23

## Objective

Size and route the approved first slice that replaces the visible lowercase local Marketplace label
with the existing uppercase AGDF brand while preserving technical IDs and distinct plugin roles.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The change affects one bounded Marketplace family label. It does not alter user actions, working modes, effective state, blockers, activation or recovery behavior.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and `plugin/meta/agdf-plugin.definition.json` | The canonical public brand value is already `AGDF`; local product identity remains the full framework name | low |
| Source of truth | `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName` | Existing canonical value is `AGDF` | low |
| Runtime path | `create-agdf/lib/installers/local-marketplace.js` | `codexMarketplace()` currently projects `definition.displayName` into the Marketplace heading | low |
| UI / UX | Codex Plugins screen | Direct screenshot renders the technical Marketplace label as lowercase `agdf` | low |
| Persistence / data | None | No schema, user data or migration change | none |
| Tests / QA | `create-agdf/scripts/local-marketplace-test.js`; Runtime Integrity | Deterministic local Marketplace projection and ownership checks already exist | low |
| Release / operations | Existing local install and rollback owner | Repository work does not reinstall, publish or release | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The uppercase brand value already exists | `publicDistribution.publicDisplayName` is `AGDF` | none | Reuse it; do not introduce another hardcoded brand value |
| Local Marketplace projection uses the full product display name | `codexMarketplace()` maps `definition.displayName` | warn | Change only the mapping to the existing canonical AGDF value |
| Installed Marketplace and host UI are derived evidence | Local Marketplace manifests and screenshot | warn | Do not edit cache directly or infer host rendering from repository tests |
| Public distribution is an active separate run at UAT | `agdf-public-plugin-distribution/RUN_STATE.md` | revise | Do not change the approved public value or public candidate contract in this slice |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice`; the outcome is one coherent local Marketplace identity change with known owners, no full-depth impact and bounded rollback, but the attempted compact record failed formal eligibility and therefore escalated fail closed.
- evidence: `plugin/meta/agdf-plugin.definition.json`; local Marketplace generator and tests; invalid Verified Change finding `AGDF_VERIFIED_CHANGE_IMPACTS_INVALID`; complete bounded-slice evidence below.
- transparency_note: The structured slice is limited to the same local Marketplace outcome. It does not expand into public distribution, Inventory, release or runtime behavior.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery`; rejected because the slice introduces no authority, security, architecture, runtime, persistence, migration, external/public contract, coordinated release or unbounded-owner transition.
- missing_or_conflicting_facts: none; refreshed Codex UI behavior remains planned acceptance evidence rather than a depth fact.
- depth_evidence_refs: approved UR; canonical definition; local Marketplace generator, transaction tests and rollback owner; public-contract isolation; invalid compact record and declared structured escalation target.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One exact visible Marketplace family label with an observable host acceptance boundary. |
| authority_boundary | pass | Canonical metadata and AGDF run authority are known; no new trust, policy, permission or security boundary. |
| owner_consumer_coordination | pass | AGDF metadata, local projector and tests remain inside one repository; Inventory and public distribution are explicitly isolated. |
| full_depth_impacts_absent | pass | No architecture, runtime, persistence, data, external API, public CLI, release or cross-host coordination change. |
| migration_propagation_bounded | pass | Local projection and optional authorized refresh are deterministic, testable and reversible through the existing installer. |
| failure_recovery_local | pass | Existing owned Marketplace transaction supplies rollback; host mismatch produces an evidence-limited outcome. |
| independently_acceptable | pass | The uppercase family heading is independently observable and valuable without changing Inventory or public distribution. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What exact canonical value and projection mapping preserve local/public separation? | SD | warn |
| How are repository, installed-package and direct-host evidence sequenced? | TP | warn |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#release_built_plugin_distribution_2026_07_18`; `.agdf/control/SOT_REGISTRY.md` release-built Marketplace owner row
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing local Marketplace ownership and rollback node already governs this bounded projection; no new node is justified.

## Next Permissible Step

- next_allowed_action: Review the bounded PRD and request exact `Approval: PRD`.
- forbidden_until_then: SD, TP, implementation, cache edit, reinstall, public-contract change, release, publication or VCS action.

## Quality Outlook

- quality_outlook: Prove the mapping through the existing Marketplace transaction tests and retain direct Codex rendering as separate host evidence.
