# Clean Implementation Review: Doctor and Presentation Identity-Validation Parity

Date: 2026-09-01
Decision: pass
Owner: agent

## Clean Implementation Review

- decision: pass
- primary_solution: One identity owner (`lib/control-state/run-identity.js`) consumed by parser,
  content path and presentation; renderer guards now call the exported precondition validators
  themselves, so precondition semantics exist exactly once; gate-check surfaces render failures as an
  additive `presentation_diagnostics` object and appends codes to the two existing localized fallback
  lines. Root cause (duplicated pattern definitions, two differently strict parse paths, discarded
  validation errors) is removed, not masked.
- evidence: `git diff create-agdf/lib`; suites control-state, interaction-presentation,
  verified-change, local-marketplace, copilot-profile, routing green after the refactor; live
  gate-check on the selected run renders unchanged with no diagnostics key.
- fallbacks_retained:
  1. `try/catch` around `resolvePresentationLocale` inside the two precondition validators —
     justified: validators must report `locale_unresolved` instead of throwing; this IS the target
     architecture for a validator, no exit condition required.
  2. `snapshot_unavailable` label in gate-check — bounded, labeled catch-all used only when the gate
     was ready, the snapshot is missing and every known precondition passes; exists so no code path
     can ever emit an empty diagnostics array; exit condition: none needed (defensive floor, tested
     shape).
  3. `selectedRunState.identity_findings ?? []` in doctor — compatibility with callers that construct
     run-state objects directly (tests, other evaluators); justified, no behavior branch.
- workaround_or_shim_risk: none. An initial guard/validator duplication was found during this review
  and removed in place: `renderOperationalStatusCard` and `buildApprovalOrientationSnapshot` now
  consume the validators instead of repeating their conditions, eliminating the drift risk the SD had
  only planned to test against.
- parallel_structure_risk: none. No second pattern, no second finding-code family, no second print
  path, no second locale key; the retired presentation-local regex is structurally asserted absent.
- brownfield_fit: reuses canonical finding codes, the existing `statusPresentationFailure` /
  `presentationFailure` locale anchors, the existing `addFinding`/severity vocabulary and the
  deterministic sync owner. The `verified-change-test` fixture repair aligns a legacy fixture with
  the tightened contract instead of weakening the contract.
- missing_evidence: E2E-positive `presentation_diagnostics` through CLI fixtures is unreachable by
  design (upstream fail-closed layers fire first); covered at unit/print level — disclosed in TP
  Review deviation 1.
- required_next_step: Code Review, then QA gate.
