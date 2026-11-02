# Brownfield Review: Parent Reconciliation Handoff

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-parent-reconciliation-handoff`
- related_ur: `.agdf/control/artefacts/agdf-parent-reconciliation-handoff/UR.md`
- current_gate: `PRD`
- reviewer: agent
- reviewed_at: `2026-08-19`

## Objective

Size and route the approved requirement for one explicit, non-authorizing Child-to-Parent closeout
handoff while keeping independently valid Child completion intact.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: the change adds visible resolved/open/not-applicable closeout state, one
  recovery action and startable-versus-final programme aggregation meaning to existing OR and
  delivery handoff surfaces.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/contracts/closeout.md` | Relevant Run and non-duplication boundaries | high |
| Gate and authority | `plugin/meta/contracts/gate-transition.md` | Child gates, OR and delivery-closeout ownership | high |
| Orchestration report | `plugin/skills/release-or/SKILL.md`; OR template | existing audit report and Context Graph reconciliation pattern | high |
| Operational handoff | `plugin/skills/delivery-closeout/SKILL.md` | consumes QA/OR/UAT and owns Git text only | medium |
| Relationship parsing | `run-state-parser.js`; `delivery-map.js` | Artefact Chain is parsed; only the fixed gate chain is currently evaluated | high |
| Generated surfaces | `sync-package-assets.js`; Runtime Integrity | canonical plugin files propagate to Codex, Claude, Copilot and OpenCode bundles | medium |
| Programme evidence | Product Maturity Roadmap RMP-06/RMP-10/RMP-11 | project-specific reconciliation and aggregate readiness example | medium |
| Persistence / migration | run-scoped Markdown control state | additive fields can remain backward compatible | low |
| Tests / QA | smoke, control-state and Runtime Integrity suites | existing deterministic seams for contracts, templates and relationships | high |

## Current Coverage

- fully_done: Relevant Run boundary, Context Graph reconciliation, OR audit ownership, delivery
  handoff ownership, Artefact Chain parsing and generated-surface synchronization.
- partially_done: project-specific Parent reconciliation exists in the Product Maturity Roadmap but
  is not a general closeout contract.
- not_done: canonical Parent reconciliation projection, programme aggregation readiness boundary and
  an explicit-relationship-only stale-state diagnostic.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Closeout already has one normative owner | `closeout.md` | block | Extend it; do not create a Parent-specific contract module. |
| OR already owns audit closeout | `release-or` | block | Emit the reconciliation handoff there and in the existing OR template. |
| Delivery closeout owns only operative Git handoff | `delivery-closeout` | block | Consume the OR state; do not reevaluate Parent relationships. |
| Artefact Chain parser accepts arbitrary rows | `run-state-parser.js` | warn | Define explicit accepted Parent relationship evidence before diagnostic evaluation. |
| Delivery Map has fixed required gate relationships | `delivery-map.js` | block | Add any diagnostic through this owner; do not create another scanner. |
| Roadmap aggregation is an example, not global authority | RMP-10/RMP-11 | block | Generalize only readiness semantics, not the Roadmap's PMR schema. |
| Candidate source paths are clean | focused `git status` | warn | Revalidate before implementation and isolate unrelated control-state changes. |

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `authority_policy_security_depth`
- decisive_full_depth_triggers:
  - `authority_policy_security_depth`: the change defines whether an open Parent coordination gap
    affects Child completion and which component may evaluate or merely consume that state; this is
    normative delivery authority, not local copy.
  - `external_contract_depth`: a deterministic diagnostic may extend public Doctor or Delivery Map
    JSON and the OR control format, requiring explicit compatibility and consumer treatment.
- rejected_alternative: `structured_slice` is rejected because the accepted outcome changes
  normative closeout authority across Runtime Contract, OR, delivery handoff, templates, generated
  surfaces and potentially public validator output. Bounded files and additive migration do not
  neutralize those effects. Quick Task and Verified Change are ineligible for policy and CLI impact.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: approved `UR.md`; `plugin/meta/contracts/closeout.md`;
  `plugin/meta/contracts/gate-transition.md`; `plugin/skills/release-or/SKILL.md`;
  `plugin/skills/delivery-closeout/SKILL.md`; `plugin/control/templates/artefacts/OR.md`;
  `create-agdf/lib/control-state/run-state-parser.js`;
  `create-agdf/lib/control-evaluation/delivery-map.js`; Runtime Integrity and smoke tests.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: explicit Parent reconciliation is visible without coupling Child completion. |
| authority_boundary | fail | Normative closeout and evaluation-versus-consumption authority necessarily changes. |
| owner_consumer_coordination | pass | Existing Contract, OR, Delivery Map and delivery-closeout owners and consumers are identified. |
| full_depth_impacts_absent | fail | Authority/policy and compatibility-sensitive public output effects are present. |
| migration_propagation_bounded | pass | Additive fields can preserve legacy runs and generated surfaces propagate deterministically. |
| failure_recovery_local | pass | Missing, stale or ambiguous explicit relationships can remain visible and non-authorizing without Parent mutation. |
| independently_acceptable | pass | Contract, projection and deterministic diagnostic behavior can be accepted without retroactive run migration. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `authority_policy_security_depth` — normative Child-completion and Parent-handoff
  authority changes, with an additional compatibility-sensitive validator/output boundary;
  Structured Slice is rejected despite bounded additive implementation.
- evidence: complete Structured Depth Evidence above and the approved UR Revision 1.
- transparency_note: depth follows from authority and public-contract effects, never from file count.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which explicit Artefact Chain relationships qualify without name inference? | PRD | block |
| What must users see for resolved, open and not-applicable handoffs? | PRD | block |
| What does startable versus final-ready mean without creating a gate? | PRD | block |
| Which parser/evaluator owns qualification and stale-state comparison? | SD | block |
| Does the diagnostic belong in Doctor, Delivery Map or both, and what severity is safe? | SD | block |
| Which generated templates and tests must carry the additive fields? | SD | revise |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-RUN-STATUS-CARD`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: the accepted scope establishes a reusable closeout invariant that belongs
  with existing ceremony and status ownership rather than a new node.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: the independent-Child and explicit-Parent-handoff invariant is reusable across runs.
- memory_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-RUN-STATUS-CARD`

## Next Permissible Step

- next_allowed_action: Review PRD Revision 1 and provide exact `Approval: PRD`, request revision or decline.
- forbidden_until_then: SD, TP, Contract/Skill/Template/Validator changes, QA, Parent mutation, VCS and release.

## Quality Outlook

- quality_outlook: Prove explicit relationship qualification and backward-compatible non-authorizing diagnostics before implementation.
