# Brownfield Analysis: Gate State Clarity

## Status

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: CD+Tests
- artefact: .agdf/control/artefacts/gate-state-clarity/BROWNFIELD_ANALYSIS.md

## Scope

Implementation is limited to additive gate/status clarity fields in existing gate-check JSON and status-card output, Runtime Contract wording, durable status guidance where needed, and focused smoke coverage.

## Evidence

- `create-agdf/bin/create-agdf.js` already owns transition decisions, `buildStatusCard`, `evaluateGateCheck`, `evaluateDeliveryMap`, and status-card printing.
- `plugin/meta/agdf-runtime-contract.md` is the authoritative runtime wording source.
- `create-agdf/scripts/smoke-test.js` already has fixtures for blocked UR, UAT, open SD, completed-only backlog and missing artefact cases.
- `create-agdf/package.json` runs `sync-package-assets` before smoke tests, preserving generated output from canonical plugin sources.

## Current Coverage

| Area | Coverage | Notes |
|---|---|---|
| Existing gate decisions | fully_done | `transitionDecisionForRunState` already centralizes current immediate gate decisions. |
| Status-card projection | partially_done | Existing status-card lacks explicit post-approval transition fields. |
| Runtime wording | partially_done | Current contract lists status-card fields but does not define post-approval transition. |
| Regression coverage | partially_done | Existing tests assert current gate, allowed now and quality outlook, but not next gate after approval. |

## Reuse Strategy

- Extend `buildStatusCard` and report construction in `create-agdf/bin/create-agdf.js`.
- Add a narrow helper that maps only the existing missing approval to immediate post-approval metadata.
- Update `plugin/meta/agdf-runtime-contract.md`; allow `sync-package-assets` to update generated copies.
- Extend existing smoke-test fixtures and assertions.

## Risks

- Duplicating gate order would create a second source of truth; mitigation is to derive only from the already-computed missing approval and current transition decision.
- Human output can get noisy; mitigation is to print new lines only when a missing approval exists.
- JSON consumers need compatibility; fields are additive.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: pending implementation evidence and closeout
- context_graph_required_action: link
- context_graph_gate_effect: none

## Decision

Pass. Existing owners are clear and the implementation path is bounded.

## Required Next Step

Implement T01-T07, run required validation, then perform reviews before QA.
