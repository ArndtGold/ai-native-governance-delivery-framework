# Brownfield Review: Gate State Clarity

## Decision

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD

## Scope

The approved requirement changes AGDF gate/status output semantics for CLI status-card output, JSON evidence, runtime-contract wording and durable run-status guidance. The goal is to clarify current gate, exact required approval, next gate or internal step after approval, and what is allowed now versus after approval.

## Evidence

- `create-agdf/bin/create-agdf.js` owns `evaluateGateCheck`, status-card construction, JSON gate-check fields and human-readable output.
- `plugin/meta/agdf-runtime-contract.md` owns status-card semantics and must remain the runtime source of truth.
- `create-agdf/scripts/smoke-test.js` already covers gate-check blocked/open scenarios and can be extended with focused status-card/JSON assertions.
- Generated package output is synchronized from `plugin/` through `create-agdf/scripts/sync-package-assets.js`; derived output must not be edited as an independent source.
- Current status-card output exposes `Current gate`, `Missing approval`, `Next step`, `Allowed now` and `Forbidden now`, but no explicit `Next gate after approval` or `Allowed after approval`.

## Current Coverage

| Area | Status | Evidence |
|---|---|---|
| Current gate visibility | partially_done | status-card and JSON expose `current_gate` |
| Missing approval visibility | partially_done | status-card and JSON expose `missing_approval` |
| Next gate after approval | not_done | no dedicated field or printed line exists |
| Allowed now vs after approval | partially_done | `allowed` and `forbidden` exist, but no post-approval boundary is exposed |
| Runtime contract wording | partially_done | status-card fields exist, but transition-after-approval semantics are not explicit |
| Regression coverage | partially_done | existing smoke tests cover gate-check status-card shape, not next-gate-after-approval semantics |

## Reuse Strategy

- Extend the existing gate-check report/status-card builder; do not create another gate model.
- Derive any new transition fields from the existing canonical gate decision path and Runtime Contract terms.
- Extend existing smoke tests rather than adding a new test runner.
- Update Runtime Contract/templates only where they are the source of truth.

## Risks

- Duplicating gate order or transition rules would create a second source of truth.
- Adding too many lines can make interactive status output noisy.
- JSON consumers may depend on existing fields; new fields should be additive unless a breaking change is explicitly approved.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: pending PRD scope decision
- context_graph_required_action: link
- context_graph_gate_effect: none
- rationale: The change strengthens AGDF gate clarity and belongs to the existing delivery-governance reliability line; no new node is needed yet.

## Transparency

This is not just a wording tweak. It changes user-visible and machine-readable gate/status semantics, so a structured slice with PRD, SD and TP is warranted before implementation.

## Required Next Step

Create the PRD for the approved structured slice, then obtain `Approval: PRD`.
