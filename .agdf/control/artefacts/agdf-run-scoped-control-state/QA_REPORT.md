# QA Report: Run-Scoped AGDF Control State

Status: done
Gate: QA
Gate approval: `Approval: QA` provided on 2026-07-12
Based on: approved TP, implementation evidence, TP Review, Clean Implementation Review, Code Review
Date: 2026-07-12
Owner: agent

## 1. QA Decision

Decision: `pass`

The approved run-scoped control-state implementation satisfies the Task Plan with strong evidence. No
blocking Brownfield, source-of-truth, solution-integrity, regression, security or maintainability
finding remains.

## 2. TP Coverage

- fully_done: 20
- partially_done: 0
- not_done: 0
- P0/P1 gaps: none
- reference: `.agdf/control/artefacts/agdf-run-scoped-control-state/TP_REVIEW.md`

## 3. Evidence

- Focused control-state tests cover schema validation, discovery, selectors, atomic writes, locking,
  migration rollback, projection drift, aggregate policy and Git conflict visibility.
- Delivery Path Search focused, unit and generator suites pass.
- `create-agdf` and `@agdf/cli` smoke suites pass.
- Pages type/diagnostic check passes with zero errors, warnings or hints; Pages build passes.
- Runtime integrity passes with 9 skills and 14 control files.
- Package dry-run contains the canonical template and all shared control-state modules.
- Fresh two-run CLI evidence evaluates both active runs deterministically and rejects ambiguous
  single-run evaluation.
- This repository's migrated canonical run passes `delivery-map --all-active` with one run and zero
  findings.
- `git diff --check` passes.
- Clean Implementation Review and Code Review both pass with no open finding.

## 4. Missing Evidence

None for the approved TP and QA decision. UAT and release behavior remain later-gate concerns.

## 5. Risks

- Explicit legacy compatibility remains until older consumers are retired. It is non-authoritative,
  digest-checked and blocked on drift or mixed authority.
- No open QA-blocking or QA-revising risk remains.

## 6. Required Next Step

Proceed to UAT. OR, commit, push, PR and release remain forbidden until UAT approval and their
applicable explicit authorizations are satisfied.

## 7. Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Final implementation, reviews and validation confirm the recorded run-isolation,
  deterministic-selection, migration and conflict-visibility invariants.

## 8. Gate Approval

Approved with:

`Approval: QA` provided on 2026-07-12.
