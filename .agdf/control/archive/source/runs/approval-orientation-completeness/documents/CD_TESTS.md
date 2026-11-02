# CD+Tests: Complete Approval Orientation

Status: done
Gate: CD+Tests
Based on: approved `TP.md` and passed `BROWNFIELD_ANALYSIS.md`
Date: 2026-07-15
Owner: AGDF

## Delivered Behavior

- Added one pure immutable approval-orientation snapshot with fixed
  `run_status_card → gate_transition_card → approval_interaction` order.
- The snapshot contains one selected run/revision/gate/locale identity, exactly
  six compact status fields, the existing transition/artefact projection and
  non-authorizing approval options.
- Canonical gate evaluation supplies readiness; the snapshot cannot select a
  run, evaluate authority, persist state or authorize approval.
- The CLI attaches the snapshot non-enumerably to the existing status card, so
  public JSON remains unchanged.
- Runtime Contract and canonical `gate-check` now require both cards once before
  every ready native or exact-text approval and preserve non-ready suppression.
- Runtime Integrity and negative fixtures reject missing/reversed two-card
  ordering and repeated-card fallback behavior.

## Task Evidence

| task_id | status | evidence |
|---|---|---|
| AOC-01 | done | `buildApprovalOrientationSnapshot` is pure, immutable, has fixed sequence and `authorizes: false`; focused tests cover shape and input classes. |
| AOC-02 | done | `evaluateGateCheck` reuses `statusCard` and `humanPresentation`, supplies `revision_id`, and attaches `approvalOrientation` non-enumerably; JSON compatibility assertion passes. |
| AOC-03 | done | Runtime Contract and `gate-check` define compact Status Card → Transition Card → one approval interaction for all ready user gates. |
| AOC-04 | done | Existing complete locale packs are reused; `de-AT` resolution, incomplete packs and length budgets remain covered. No copied localized template was added. |
| AOC-05 | done | All six user gates, exact options, immutability and non-authority are table-tested; existing outcome/attempt tests remain green. |
| AOC-06 | done | Helper rejects non-ready, blocked, mismatched and internal-step input; existing control-state tests cover ambiguous, missing artefact and stale response/revision boundaries. |
| AOC-07 | done | Generated assets synchronized; Runtime Integrity and new negative mutations pass. |
| AOC-08 | done | Full create-agdf smoke/routing suite, Pages check/build, doctor, Runtime Integrity and whitespace checks pass; live host layout remains UAT-only evidence. |

## Verification Evidence

| Check | Result |
|---|---|
| `npm run smoke-test` in `create-agdf/` | pass; control-state, interaction, Verified Change, runtime-integrity-negative, Delivery Path Search, smoke and routing checks all pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; 9 skills and 15 control files checked |
| `node create-agdf/scripts/runtime-integrity-negative-test.js` | pass |
| `npm run check` in `pages/` | pass; 0 errors, 0 warnings, 0 hints |
| `npm run build` in `pages/` | pass; static production build completed |
| `npx --yes @agdf/cli@latest doctor --run approval-orientation-completeness --json` | pass; 0 findings before CD+Tests persistence |
| `git diff --check` | pass |

## Compatibility And Evidence Boundary

- No persisted-state schema, gate evaluator, approval formula, adapter contract
  or public JSON key changed.
- No custom renderer, copied locale registry, retry loop or host-specific gate
  policy was introduced.
- Repository evidence proves semantic composition and ordering. It does not
  prove pixel layout or native-control rendering on every host.

## Required Next Step

Run Task Plan Review, Clean Implementation Review and Code Review, then use
QA Gate as the sole final quality decision owner. No QA approval may be
requested before those reviews are persisted.

## Live Sequence Remediation (2026-07-15)

- A first live QA attempt rendered the compact Status Card but invoked the
  native control before the Transition Card; the attempt returned no deliberate
  answer and no approval was accepted.
- Runtime Contract and `gate-check` now require one Approval Orientation
  Envelope: one immediately preceding assistant message containing both
  distinct card blocks in order. Native invocation before the complete envelope
  is explicitly invalid.
- Runtime Integrity and a negative mutation reject removal of the
  complete-envelope-before-tool boundary.
- Complete create-agdf smoke/routing, focused interaction/control-state,
  Runtime Integrity, negative fixtures and `git diff --check` pass after the
  remediation.
