# Brownfield Review: Scope Classification Card Contract Hardening

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: scope-classification-card-contract-hardening
- related_ur: `.agdf/control/artefacts/scope-classification-card-contract-hardening/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-08-19

## Objective

Size and route the approved correction of Scope Classification Card mode, locale and dynamic-input
semantics while preserving the established single-owner presentation architecture.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The bounded correction changes when a classification card is visible and how unsupported locale, invalid registry and invalid dynamic-input states recover. It preserves the existing intent and authority model but materially affects working-mode activation, blockers and visible recovery.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Parent PRD/SD and `plugin/meta/contracts/interaction.md` | Approved parent artefacts plus current contract inspection | `medium` — locale recovery is contradictory and must be made singular |
| Source of truth | `create-agdf/lib/interaction-presentation.js` and `plugin/meta/agdf-interaction-locales.json` | Current renderer and locale registry | `low` — extend existing owners only |
| Runtime path | `create-agdf/scripts/sync-package-assets.js` and generated plugin runtime | Existing canonical sync and runtime digest | `low` — bounded deterministic propagation |
| UI / UX | `renderScopeClassificationCard` consumed verbatim by `gate-check` | Renderer, interaction contract and parent UX evidence | `medium` — activation and recovery behavior change visibly |
| Persistence / data | none | Renderer is pure and classification is transient | `none` |
| Tests / QA | `interaction-presentation-test.js`, Runtime Integrity and gate-check eval cases | Current tests pass but encode or omit the three confirmed gaps | `medium` — negative coverage must be corrected |
| Release / operations | existing package build only | UR excludes release, publication and reinstall | `none` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The renderer must remain in the existing presentation owner | Parent SD; current additive export | `none` | Extend `renderScopeClassificationCard`; create no wrapper or parallel renderer |
| Locale semantics are split between approved parent PRD and current specific contract | Parent PRD SCC-6; current interaction contract; runtime probe | `revise` | PRD must make unsupported-locale fallback and invalid-registry fail-closed behavior distinct |
| Dynamic limits lack a canonical owner | Parent SD requires bounds but current registry budgets cover static copy | `warn` | SD must place explicit dynamic-input limits in one canonical contract owner and reuse them in code/tests |
| Generated surfaces may preserve permissive behavior | Canonical sync/runtime packaging | `warn` | Propagate only through existing sync and verify built-plugin integrity |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — the approved correction has one coherent outcome and bounded owners, propagation, recovery and evidence. Quick Task is ineligible because approved product/fallback semantics and normative runtime contracts change. Verified Change is ineligible because it forbids gate/contract behavior impact and cannot prove one canonical owner. Structured Delivery is rejected because no authority, architecture, persistence, external contract, release or unbounded coordination trigger applies.
- evidence: Approved UR; parent PRD/SD/QA/OR; current interaction contract, renderer, locale registry, focused runtime probes, tests and canonical sync owners.
- transparency_note: PRD/SD/TP are required only at slice depth to own the corrected behavior, limits and negative evidence; no broader redesign or release plan is justified.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery` rejected because every full-depth effect is absent; `quick_task` and `verified_change` are separately ineligible for normative product-contract corrections.
- missing_or_conflicting_facts: none
- depth_evidence_refs: approved UR; parent PRD/SD/QA/OR; `plugin/meta/contracts/interaction.md`; `create-agdf/lib/interaction-presentation.js`; `plugin/meta/agdf-interaction-locales.json`; focused probes dated 2026-08-19.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One acceptance boundary: only valid fresh Quick Task classifications render under one coherent locale/input contract. |
| authority_boundary | `pass` | Existing interaction contract, PRD and exact approvals remain authoritative; no new trust, permission or security boundary. |
| owner_consumer_coordination | `pass` | Existing renderer, locale, contract, skill, tests and generated-runtime consumers remain inside one sync-controlled slice. |
| full_depth_impacts_absent | `pass` | No architecture, persistence, external API/CLI, deployment, release or cross-host activation change. |
| migration_propagation_bounded | `pass` | Additive contract/test corrections propagate through the existing deterministic sync and are locally reversible. |
| failure_recovery_local | `pass` | Invalid input or registry returns `null` and routes to the existing fail-closed ceremony; rollback is the bounded source change. |
| independently_acceptable | `pass` | Focused acceptance criteria, negative tests and runtime integrity fully decide the slice without hidden prerequisite work. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What exact distinction applies between unsupported requested locale and incomplete/invalid registry? | `PRD` | `revise` |
| Which dynamic fields, character classes, lengths and trigger counts are valid? | `PRD` | `revise` |
| Where are dynamic-input limits defined and reused without magic numbers? | `SD` | `revise` |
| Which focused and generated-runtime tests prove the corrected contract? | `TP` | `revise` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing node owns non-authorizing interaction presentation; closeout should record the corrected activation and invalid-input recovery invariant.

## Next Permissible Step

- next_allowed_action: Use the ready UX Intent Definition as input, draft the bounded PRD and request exact `Approval: PRD`.
- forbidden_until_then: SD, TP, implementation, QA, UAT, lifecycle reconciliation and VCS/release actions.

## Quality Outlook

- quality_outlook: Preserve the pure single-owner renderer and make every accepted dynamic input and recovery state explicit and negatively tested.
