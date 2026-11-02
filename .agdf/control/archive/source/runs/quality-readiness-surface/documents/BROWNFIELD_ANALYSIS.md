# Brownfield Analysis: Quality Readiness Surface

Gate: Brownfield Analysis
Type: Brownfield Analysis
Status: done

## Analysis Meta

- mode: `pre_implementation_analysis`
- run_id: `quality-readiness-surface`
- related_tp: `.agdf/control/artefacts/quality-readiness-surface/TP.md`
- analysed_at: 2026-07-15
- analyst: agent

## Decision

- decision: `pass`
- reuse_strategy: `extend_existing_owners`
- required_next_gate: `CD+Tests`

## Existing-System View

| Owner | Current coverage | Reuse path | Implementation impact |
|---|---|---|---|
| `create-agdf/lib/interaction-presentation.js` | Existing locale, artefact-link, gate-option and non-authorizing interaction helpers | Add pure Quality Readiness construction/formatting helpers | medium |
| `create-agdf/lib/control-state/aggregate.js` | Canonical deterministic severity aggregation | Reuse ranking; do not create a UI-specific status algorithm | low |
| `create-agdf/scripts/interaction-presentation-test.js` | Existing focused assertions for locale, artifacts and non-authorizing outcomes | Extend with projection row, reason, ordering and authority-negative fixtures | medium |
| `plugin/meta/agdf-runtime-contract.md` | Canonical authority, Run Status and Gate Transition boundaries | Add derived Quality Readiness rules without changing gate semantics | medium |
| Router, definition and Pages skill metadata | Existing skill roles and discovery copy | Clarify the four review roles; keep identifiers and generated propagation stable | medium |
| `plugin/scripts/check-runtime-integrity.mjs` | Enforces runtime/skill/manifest invariants | Add only targeted assertions for the new shared contract | medium |

## Reuse And Parallel-Structure Check

- No fifth review is permitted. The projection consumes the existing four owners.
- No new persisted state is required. Overall status reuses canonical aggregate ordering.
- No new approval path is permitted. The projection is explicitly non-authorizing.
- No second card renderer is permitted. The existing interaction presentation module owns the
  derived human projection; Runtime Contract text remains normative.

## Change Impact

- interfaces: additive human-facing compact/detail projection only; JSON/report paths and exact
  approvals remain stable.
- regression risk: severity/reason ordering and missing-evidence behavior could accidentally
  suggest `pass`; focused negative tests are mandatory.
- propagation risk: router/definition and generated assets can drift; sync and integrity checks
  remain mandatory.
- visible state ownership: interaction presentation is the single UI/status formatting owner;
  no Pages-only or host-only alternative owner is introduced.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: existing human decision surface and aggregate status invariants
- context_graph_required_action: add a reusable invariant only if implementation introduces a
  stable contract beyond this bounded presentation slice
- context_graph_gate_effect: none

## Required Implementation Path

1. Implement pure derived projection helpers and focused tests.
2. Extend Runtime Contract and canonical routing/discovery copy.
3. Synchronize generated assets and run focused plus aggregate validation.
4. Run TP Review, Clean Implementation Review, Code Review and QA Gate after CD+Tests.

## Quality Outlook

Preserve one canonical authority chain: supporting review evidence -> derived Quality Readiness
projection -> `qa-gate` as sole final decision owner.
