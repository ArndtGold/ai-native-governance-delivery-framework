# Brownfield Review: Doctor Semantic Consistency

Status: done
Mode: post_ur_review
Decision: pass
Date: 2026-07-09
Owner: agent
Based on: `.agdf/control/artefacts/doctor-semantic-consistency/UR.md`

## Scope

Make AGDF detect the observed semantic control-state mismatch where `doctor` can pass while `gate-check` later blocks because a QA artefact row uses the wrong gate-specific status.

## Existing-System View

Relevant owners already exist and should be extended rather than replaced:

- CLI parser and validation: `create-agdf/bin/create-agdf.js`
- Regression coverage: `create-agdf/scripts/smoke-test.js`
- Runtime vocabulary and gate semantics: `plugin/meta/agdf-runtime-contract.md`
- Current control-state evidence: `.agdf/control/AGDF_RUN.md`

## Current Coverage

| Area | Coverage | Evidence |
|---|---|---|
| Durable artefact status parsing | partially_done | `isDurableGateArtefactSatisfied()` treats QA artefacts as satisfied only for `pass` or `passed`. |
| Doctor semantic checks | partially_done | `evaluateDoctor()` already calls `analyzeDeliveryMap()`, but did not surface this QA status mismatch before gate-check. |
| Regression fixtures | partially_done | Smoke tests cover missing durable QA artefact and valid QA-passed/UAT-ready state, but not the wrong QA artefact status word. |
| Current repo state | fully_done | Correcting QA artefact status to `passed` made `gate-check` return `OR` open. |

## Reuse And Parallel-Structure Risk

- reuse_strategy: extend existing CLI validation and smoke-test fixtures
- parallel_structure_risk: low; no new validator or second gate model is needed
- generated_output_risk: low; implementation is expected to stay in CLI/test code and not generated package assets

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: none
- scope_reason: The fix is a narrow validation hardening in existing CLI parser/test ownership. It does not introduce new product semantics, storage, gate order, package surface or runtime authority beyond the approved UR.
- evidence: Existing functions and smoke tests already own the relevant parser and validation behavior; the observed failure can be reproduced with a focused fixture.
- transparency_note: PRD, SD and TP are intentionally skipped for this slice. Implementation must stay limited to semantic validation/normalization and focused regression tests.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `doctor` becomes too strict for historical artefacts | medium | Check the active run state and focused fixtures, not arbitrary archive prose. |
| Status normalization hides meaningful distinctions | medium | Prefer a clear `doctor` finding unless normalization is already part of existing parser semantics. |
| Gate-check and doctor drift further | medium | Reuse existing parser helpers and add smoke coverage for both valid and invalid states. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: open_gap
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This quick task extends the same validation reliability line captured in `CG-DELIVERY-PATH-SEARCH`.

## Required Next Step

Proceed with Quick Task implementation in the existing CLI validation and smoke-test owners, then run focused validation.
