# Brownfield Review: Define UX Intent Before Implementation

Status: done
Mode: post_ur_review
Decision: pass
Mode/Slice Decision: structured_delivery
Required Next Gate: PRD
Date: 2026-07-19

## Scope

Assess the existing AGDF owners and the smallest safe delivery path for introducing conditional
pre-PRD UX-intent definition, stronger PRD UX acceptance criteria, PRD-to-TP-to-surface traceability,
Task Plan Review UX fidelity evidence and QA consumption without adding a user gate or competing
requirements authority.

## Evidence

- `plugin/control/templates/artefacts/PRD.md` currently provides only a general `Users And Roles`
  prompt for UX-related product definition.
- `plugin/skills/brownfield-analysis/SKILL.md` already checks visible state, UI, status and recovery
  ownership, but only as Brownfield evidence and routing.
- `plugin/skills/task-plan-review/SKILL.md` already owns task, acceptance-criteria, runtime/UI evidence
  and completion coverage; it is the narrow reuse owner for post-implementation UX Intent Fidelity.
- `plugin/skills/qa-gate/SKILL.md` already requires UI surface integrity and remains the sole final
  QA decision owner.
- `plugin/meta/agdf-plugin.definition.json` is the canonical skill-set inventory used by routers,
  installers, generated surfaces, runtime integrity and Pages evidence.
- `create-agdf/scripts/sync-package-assets.js` already propagates canonical skills to Codex, Claude,
  Copilot and OpenCode surfaces.
- `plugin/scripts/check-runtime-integrity.mjs` enforces exact canonical skill inventory, router parity,
  Pages parity and packaged-surface consistency.
- `evals/`, `create-agdf/lib/skill-evals/` and `pages/src/data/evaluationEvidence.ts` require normal,
  boundary and adversarial behavioral cases for every canonical skill.

## Current Coverage

- `partially_done`: downstream Brownfield, Task Plan Review and QA owners already contain isolated
  UI/state/recovery evidence rules.
- `not_done`: there is no canonical pre-PRD `ux-intent-definition` skill, no shared impact-routing
  contract, no explicit PRD UX-intent section and no PRD-to-TP UX fidelity matrix.
- `fully_done`: canonical skill discovery, cross-surface generation, integrity validation and
  behavioral evaluation infrastructure already exist and can be extended.

## Reuse Strategy

- `extend` the canonical plugin definition, router, runtime contract modules, PRD template, Task Plan
  Review and QA guidance.
- `new` only for the bounded `plugin/skills/ux-intent-definition/` skill and its help/evaluation cases.
- Reuse `sync-package-assets` for every derived surface; do not hand-maintain generated copies.
- Reuse the existing skill-evaluation framework with three behavioral cases rather than adding a
  separate evaluator.

## Impact Assessment

- Files/modules: canonical skill definition and router, focused runtime-contract modules, PRD
  template, Brownfield routing, Task Plan Review, QA Gate, new skill/help, eval corpus, Pages skill
  catalogue and generated assets.
- Interfaces: canonical `skillSet`, cross-surface skill names/counts and evaluation evidence counts.
- Data model/migrations: none.
- Backwards compatibility: existing gate names and approval values stay unchanged; the new analysis
  step is internal and conditional.
- Regression evidence: runtime integrity, routing render tests, behavioral skill evaluations,
  package synchronization/idempotence, package smoke and Pages check/build.
- Release impact: the canonical skill inventory and packaged multi-surface assets change.

## Ownership And Parallel-Structure Risk

- The approved PRD remains the sole authority for product behavior and acceptance criteria.
- `ux-intent-definition` produces analytical input only and returns `ready | blocked | not_applicable`;
  it is not a gate and cannot approve or mutate product scope.
- Task Plan Review owns implementation fidelity; it must route missing product criteria back to PRD
  rather than inventing them.
- QA Gate remains the sole final `pass | revise | block` owner.
- The UX analysis output must be linked as PRD input and must not become a parallel requirements SoT.

## Visible-State Ownership

- `effective_state_authority_by_mode` identifies the product/system authority deciding what applies.
- `primary_state_presentation_owner_by_mode` identifies the primary surface communicating that state.
- Technical storage, derivation and component ownership remain Solution Design concerns.

## Missing Evidence

- Exact implementation touchpoints and acceptance identifiers must be fixed in PRD and SD.
- The new skill's behavioral cases and derived-surface parity remain future TP/QA evidence.

## Risks

- Greenfield and Brownfield routing could diverge if UI/UX impact classification has multiple owners.
- Low-impact work could gain disproportionate ceremony if mandatory PRD minimums and conditional skill
  invocation are not separated.
- The analysis output could become a second requirements source if lifecycle and PRD absorption are
  not explicit.
- Adding a canonical skill changes installed surface counts and Pages evidence and must be propagated
  atomically.

## Context Graph Impact

- context_graph_impact: new_node_required
- context_graph_refs: none
- context_graph_reconciliation: open_gap
- context_graph_required_action: create
- context_graph_gate_effect: warning
- context_graph_evidence: The approved run introduces a reusable cross-run invariant for where UX
  intent is defined, made authoritative, verified and accepted.

## Transparency

`structured_delivery` is proportionate because the change adds a canonical cross-surface skill and
changes requirement, review, QA, evaluation, packaging and public evidence owners. `quick_task` and
`verified_change` are ineligible due to product semantics, contract and packaged-surface impact;
`structured_slice` is too narrow for the cross-owner lifecycle change.

## Required Next Step

Draft the smallest complete PRD that defines the conditional routing, skill contract, PRD authority,
Task Plan Review fidelity evidence, QA boundary, generated-surface propagation and deterministic
acceptance evidence, then request `Approval: PRD`.

## Revision 15 Addendum — Shared Review Gap Routing

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- scope: normalize review findings across the shared Quality Contract, Task Plan Review, Clean
  Implementation Review, Code Review and QA without creating a new skill or decision owner
- evidence: `plugin/meta/contracts/quality.md` already owns UX Fidelity gap semantics;
  `task-plan-review/SKILL.md` already consumes `requirements_gap | plan_gap | implementation_gap |
  evidence_gap`; Clean Review and Code Review currently expose findings and next steps without a
  canonical upstream classification; QA already blocks `requirements_gap` but not a normalized set
- current_coverage: partially_done; four gap types and PRD routing exist in one review path, while
  `design_gap`, `emergent_risk` and cross-review consumption are missing
- reuse_strategy: extend the existing Quality Contract as the sole taxonomy owner; make the three
  reviews and QA reference it; reuse existing skill evaluations, Runtime Integrity, sync and package tests
- ui_ux_impact: none
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable
- parallel_structure_risk: low only if consumers reference the shared contract; high if each skill
  copies its own mapping table, which is explicitly forbidden
- context_graph_impact: update_required
- context_graph_refs: CG-UX-INTENT-BEFORE-PRD
- context_graph_reconciliation: open_gap
- transparency: `quick_task` and `verified_change` are ineligible because normative review semantics
  and generated multi-surface skill content change; no new canonical skill or user gate is justified
- missing_evidence: exact acceptance identifiers, technical contract shape, consumer output fields and
  negative-test matrix belong in revised PRD, SD and TP
- required_next_step: draft the smallest revised PRD for the shared taxonomy, routing authority,
  review boundaries, QA consumption and deterministic evidence, then request `Approval: PRD`
