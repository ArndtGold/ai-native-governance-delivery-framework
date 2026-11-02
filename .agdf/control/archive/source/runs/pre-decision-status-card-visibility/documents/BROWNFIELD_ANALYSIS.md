# Brownfield Analysis: Pre-Decision Status Card Visibility

Mode: pre_implementation_analysis
Date: 2026-09-01
Decision: pass
Task: PDV-T1
Owner: agent

## Baseline

- HEAD `884e1be`; the worktree additionally carries the uncommitted, QA-approved diff of run
  `doctor-presentation-identity-parity` (6 lib files, 3 test scripts, copilot baseline) plus this
  run's control artefacts. `gate-check.js` is touched by both runs — different regions (parity:
  diagnostics around report assembly; PDV: `printApprovalEnvelope` rendered branch). Disclosed:
  changed-path evidence for PDV must be read per-region, and any commit handoff will contain both
  runs unless the user asks for separation.

## Verified Implementation Facts

| Fact | Evidence |
|---|---|
| Envelope rendered branch prints compact card → blank → transition card → blank → exact-text line | `gate-check.js#printApprovalEnvelope` (rendered branch); insertion point after the first block |
| No Runtime Integrity phrase pins the §151-158 wording to be replaced | grep over `check-runtime-integrity.mjs` for "remains available", "five", "compact approval-time": no required-phrase hit; §603-611 pins other envelope sentences (first-line rule etc.) that stay valid | 
| PDV-T5 therefore shrinks to ADD one new-sequence assertion; nothing to swap | same grep |
| `smoke-test.js:1262-1271` asserts envelope contains the exact approval value exactly twice | full card adds `Missing approval: Approval: <G>` → count becomes 3; assertion and its comment must change to "once in the snapshot cards, once in the full card, once in the request" |
| `smoke-test.js:1253-1261` once-only check on JSON snapshot blocks stays at 1 | consistent with PRD once-only scope; untouched |
| Existing envelope unit tests pass reports without `status_presentation` | `interaction-presentation-test.js:387,404,423` — after PDV-T2 these hit the degradation line; fixtures must gain a `status_presentation` or assert the degradation output explicitly |
| No skill-eval fixture asserts envelope text | grep over `create-agdf/lib/skill-evals`: no `approval_presentation`/envelope match |
| Localized failure line already exists | `interaction.statusPresentationFailure` in every locale (registry completeness enforced) |

## Reuse Path (minimal clean implementation)

1. PDV-T2 in `printApprovalEnvelope`: between the two existing block prints, print
   `report.status_presentation.markdown` (verbatim) or the `statusPresentationFailure` line with
   `presentation_diagnostics.status_presentation_errors` codes; blank-line separators as today.
2. PDV-T3 contract amendment replaces one sentence and adds one single-line scope sentence.
3. PDV-T4 skill sentence follows the contract; PDV-T5 adds one integrity assertion.
4. Tests: extend the three envelope unit cases plus new order/exactly-once/degradation cases;
   update `smoke-test.js` envelope count 2→3 with adjusted message.

## Regression Risk And Test Impact

| Risk | Owner | Handling |
|---|---|---|
| `smoke-test.js` is outside TP §3 allowed paths | TP deviation | Same class as prior copilot-baseline deviation: required consequence of the approved requirement; record in TP Review |
| Envelope unit fixtures hit degradation unintentionally | `interaction-presentation-test.js` | Fixtures gain `status_presentation`; one dedicated degradation case keeps the path covered |
| Both uncommitted runs share `gate-check.js` | worktree | Per-region diff discipline; disclosed for closeout |

## Parallel-Structure Check

None: one composition point (envelope), one card renderer, one failure line, one sequence owner
(contract). No new semantic id, no new locale key.

## Context Graph Impact

link_only; no node creation.

## Result

- decision: pass
- required_next_step: CD+Tests — implement PDV-T2..PDV-T7 inside TP §3 paths plus the disclosed
  `smoke-test.js` deviation.
