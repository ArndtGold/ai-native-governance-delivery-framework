# Brownfield Analysis: Doctor and Presentation Identity-Validation Parity

Mode: pre_implementation_analysis
Date: 2026-09-01
Decision: pass
Task: DIP-T1
Owner: agent

## Baseline

- HEAD `884e1be74ef5d25fcc1d150dba576a2cbf0f038d`; worktree contains only this run's `.agdf/control/`
  additions and the regenerated legacy projection — no code path is dirty.

## Verified Implementation Facts

| Fact | Evidence |
|---|---|
| Exactly one presentation-side `run_id` regex exists | `create-agdf/lib/interaction-presentation.js:552` (`/^[A-Za-z0-9._-]+$/`); repo-wide grep shows the only other `[a-z0-9._-]` sites are different domains (`live-recorder.js:61` series IDs, `delivery-path-search/contracts.js:66` scope keys) — out of scope, untouched |
| Canonical pattern owner | `create-agdf/lib/control-state/run-state-parser.js:1` `RUN_ID_PATTERN`; UUID `revision_id` check at lines 37-38 |
| Renderer consumers complete | `gate-check.js:298,335` and `scripts/interaction-presentation-test.js`; no other in-repo callers |
| Sync owner propagates automatically | `scripts/sync-plugin-runtime.js` copies `lib/control-state` and `lib/control-evaluation` as whole directories and `lib/interaction-presentation.js` explicitly — the new `run-identity.js` needs no sync-list change |
| CLI fallback anchor exists | `gate-check.js:404-410` already prints `interaction.statusPresentationFailure` when `status_presentation` is missing; the diagnostics extend this existing anchor instead of adding a new print path |
| Legacy template lacks identity fields | `plugin/control/templates/AGDF_RUN.md` has empty `run_id:` and no `revision_id` — every fresh scaffold and un-migrated legacy state will show both new findings |
| Fresh-scaffold doctor expectation is already `revise` | `scripts/smoke-test.js:1003-1004,1034-1035` — additional `revise` findings keep the asserted status stable |
| No uppercase run_id fixtures in test scripts | grep over `create-agdf/scripts` for uppercase run_id literals: none |
| Existing negative tests pin silent `null` | `interaction-presentation-test.js:330,341,348,355` assert `renderApprovalOrientationSnapshot(...) === null` — these stay valid (signatures unchanged); new diagnostics tests are additive |

## Reuse Path (minimal clean implementation)

1. New leaf module `lib/control-state/run-identity.js`; parser delegates and re-exports.
2. `interaction-presentation.js` imports the pattern; adds the two exported precondition validators
   next to the existing exported `validateApprovalOrientationSnapshot` (same `{valid, errors}` shape).
3. `readRunState` attaches `identity_findings`; `evaluateDoctor` maps them (severity `revise`,
   `next_step` naming `run-migrate`).
4. `gate-check` populates `presentation_diagnostics` and extends the existing
   `printGateCheckStatusCard` fallback with error codes; approval-path diagnostics only when ready.

## Regression Risk And Test Impact

| Risk | Owner | Handling |
|---|---|---|
| Tests asserting exact doctor `summary` counts on legacy fixtures could shift | `smoke-test.js`, `control-state-test.js`, `verified-change-test.js`, `parent-reconciliation-test.js`, `delivery-path-search-test.js` (all write legacy `AGDF_RUN.md` fixtures) | Run full suites in DIP-T8; adjust only count assertions, never weaken status assertions |
| Presentation switch to canonical pattern rejects run_ids the old superset allowed | none found in fixtures; live states use lowercase ids | Structural test AC-03 plus doctor finding gives diagnosis if it ever occurs |
| Existing `statusPresentationFailure` copy key vs SD's `presentationFailure` naming | locale registry | Use the existing key(s) verbatim; add no new locale keys (SD constraint holds — anchor exists) |

## Parallel-Structure Check

No second pattern, no new finding codes, no new print path, no new locale keys. The change removes
one duplicate definition and reuses every existing anchor. No SoT drift beyond the one this run fixes.

## Context Graph Impact

link_only; no node creation. The parity invariant lives in `run-identity.js` and its tests.

## Result

- decision: pass
- required_next_step: CD+Tests — implement DIP-T2..DIP-T8 inside the TP §3 allowed paths.
