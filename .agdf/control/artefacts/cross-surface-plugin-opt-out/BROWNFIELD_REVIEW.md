# Brownfield Review: Cross-surface Plugin Opt-out

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `cross-surface-plugin-opt-out`
- related_ur: `.agdf/control/artefacts/cross-surface-plugin-opt-out/UR.md`
- current_gate: `PRD`
- reviewer: Codex
- reviewed_at: 2026-09-01

## Objective

Size and route the approved revision-2 lifecycle scope against the current Copilot configuration
contract and the selected personal-local default plus explicit repository-shared opt-out.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The change affects CLI behavior, files and documentation, not an application UI, visible working mode or interactive product state.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `create-agdf/lib/cli/command-registry.js`; `INSTALL.md` | Public `disable --surface <surface> --scope repository` contract exists but Copilot behavior is absent. | `high` |
| Source of truth | `create-agdf/lib/lifecycle/operations.js` | One lifecycle-plan owner already handles repository disable and global uninstall. | `high` |
| Runtime path | `create-agdf/lib/installers/copilot-settings.js` | Existing safe JSON reader and atomic writer currently target user settings only. | `medium` |
| UI / UX | none | No application UI or rendered interaction surface changes. | `none` |
| Persistence / data | `.github/copilot/settings.local.json`; `.github/copilot/settings.json`; `.gitignore` | Copilot defines personal-local and shared repository layers with different audiences and precedence. | `high` |
| Tests / QA | `create-agdf/scripts/lifecycle-test.js`; `create-agdf/scripts/copilot-repository-retention-test.js`; `create-agdf/scripts/local-development-install-test.js` | Existing fixtures cover Codex disable, Copilot retention and atomic settings behavior. | `high` |
| Release / operations | `create-agdf` public CLI and `INSTALL.md` | New public behavior must ship and remain coherent across package, docs and host evidence planes. | `high` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Lifecycle dispatch and verification already have canonical owners. | `operations.js`; `application.js` | `warn` | Extend surface-specific planning and verification behind the existing command. |
| Copilot settings mutation already has one atomic JSON owner. | `copilot-settings.js` | `block` | Generalize or reuse it for explicit paths; do not add ad-hoc JSON writes in lifecycle orchestration. |
| Revision 2 now owns both modes with personal-local as default. | Approved UR revision 2 plus official Copilot settings precedence | `none` | Derive one PRD contract without reopening product scope. |
| Plugin deactivation does not disable repository instructions. | Official Copilot custom-instructions reference | `warn` | Keep plugin state and instruction discovery as separate documented and tested boundaries. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth`; the public `disable` CLI behavior, personal and shared Copilot configuration contracts, cross-surface support claims and package documentation must change coherently.
- evidence: Approved UR revision 2; official Copilot settings precedence; `create-agdf/lib/lifecycle/operations.js`; `create-agdf/lib/installers/copilot-settings.js`; lifecycle and retention tests.
- transparency_note: Quick Task and Verified Change are ineligible because public CLI semantics change. Structured Slice is rejected because one external public contract trigger is decisive under the depth policy.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: Public CLI behavior and a compatibility-sensitive external Copilot settings contract change across personal, shared, managed-policy and instruction-discovery boundaries.
- rejected_alternative: `structured_slice` is rejected because the public CLI contract and externally consumed repository configuration are decisive full-depth triggers even though the implementation owners are bounded.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: `.agdf/control/artefacts/cross-surface-plugin-opt-out/UR.md`; `create-agdf/lib/lifecycle/operations.js`; official Copilot configuration reference.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One cross-surface lifecycle outcome with a bounded Copilot opt-out contract. |
| authority_boundary | `pass` | AGDF gate authority and host permission authority remain unchanged. |
| owner_consumer_coordination | `pass` | Existing CLI, lifecycle, settings, test and documentation owners are identified. |
| full_depth_impacts_absent | `fail` | Public CLI behavior and the external Copilot settings contract are directly affected. |
| migration_propagation_bounded | `pass` | Only exact AGDF map entries and an owned ignore rule may change; unrelated values must be retained. |
| failure_recovery_local | `pass` | Existing atomic-write and fail-closed lifecycle patterns provide local rollback boundaries. |
| independently_acceptable | `pass` | Approved UR revision 2 defines one independently testable lifecycle outcome. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What exact CLI option selects the shared mode while personal-local remains the default? | `PRD` | `revise` |
| How are effective managed-policy conflicts reported without overstating host activation? | `PRD` | `revise` |
| How is one atomic settings owner reused for both repository paths and `.gitignore` handling? | `SD` | `revise` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing node already owns lifecycle command routing and focused adapter boundaries; the unresolved product choice remains in the revised UR.

## Next Permissible Step

- next_allowed_action: Draft the bounded PRD for the approved cross-surface lifecycle outcome.
- forbidden_until_then: SD, TP, implementation, documentation changes, QA and release claims.

## Quality Outlook

- quality_outlook: Make personal versus shared effect explicit and preserve one atomic Copilot settings owner.
