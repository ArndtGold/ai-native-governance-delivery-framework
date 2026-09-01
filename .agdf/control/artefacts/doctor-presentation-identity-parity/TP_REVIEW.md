# TP Review: Doctor and Presentation Identity-Validation Parity

Date: 2026-09-01
Reference: `.agdf/control/artefacts/doctor-presentation-identity-parity/TP.md` (approved revision 1)
Decision: pass
Owner: agent

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| DIP-T1 | fully_done | `BROWNFIELD_ANALYSIS.md` persisted with baseline, regex-site, consumer, fixture, sync and CLI-anchor facts | none | none |
| DIP-T2 | fully_done | `lib/control-state/run-identity.js`; IPP-1 unit matrix (valid, uppercase, leading dot, overlong, spaced run_id; empty/non-UUID/short revision_id; both-missing) passing in `test:control-state` | none | none |
| DIP-T3 | fully_done | Parser imports/re-exports shared patterns (IPP-1 asserts object identity); all pre-existing parser assertions in `test:control-state` pass unmodified | none | none |
| DIP-T4 | fully_done | Inline superset regex removed (structural IPP test proves absence + import); `validateOperationalStatusCardPreconditions` and `validateApprovalOrientationPreconditions` exported and unit-tested code-for-code against the silent-`null` guards; `buildApprovalOrientationSnapshot` rejects `Uppercase-Run` | none | none |
| DIP-T5 | fully_done | `readRunState` attaches `identity_findings`; doctor maps to `revise` with `run-migrate` next step; IPP-2 CLI evidence for both defect classes on the legacy content path; `doctor.status` never mere `warn` for identity defects | none | none |
| DIP-T6 | fully_done | `presentation_diagnostics` populated additively in `evaluateGateCheck`; `printGateCheckStatusCard` and `printApprovalEnvelope` append error codes to the existing localized failure lines; print-level tests assert both fallback lines carry codes | E2E-positive JSON diagnostics via CLI fixtures are unreachable by design (see deviations) | low — hand note to QA |
| DIP-T7 | fully_done | IPP-2 (both defects, legacy path), IPP-3 (loud gate-check outcome), IPP-4 (healthy canonical run: no `presentation_diagnostics` key), structural single-owner test, precondition unit matrices, fallback-line print tests | none | none |
| DIP-T8 | fully_done | `sync-package-assets` passes and is idempotent; mirror `run-identity.js` byte-identical; suites green: control-state, interaction-presentation, verified-change, parent-reconciliation, delivery-path-search (+unit), local-marketplace, copilot-profile, routing, package-build, release-version-coherence, public-plugin; `git diff --check` clean | none (pre-existing native-Windows failures disclosed below) | none |
| DIP-T9 | partially_done | This TP Review; Clean Implementation Review and Code Review follow in the same internal operation | remaining reviews and QA | QA is the consumer |

## Summary

- fully_done: 8/9 (DIP-T9 completes with the remaining reviews and QA)
- partially_done: DIP-T9 (in progress by definition of the step)
- not_done: none
- out_of_scope_changes:
  1. `plugin/meta/copilot-payload-baseline.json` raised to 79 files / 568459 bytes — required by the
     conscious-growth guard for the new runtime module; outside TP §3 allowed paths; content-neutral.
  2. `scripts/verified-change-test.js` legacy fixture gained a `revision_id` — fixture repair
     foreseen by Brownfield Analysis (tightened contract), inside test-owner scope.
- deviations:
  1. DIP-T6/AC-04 E2E note: a positive `presentation_diagnostics` cannot be produced through CLI
     fixtures because upstream fail-closed layers fire first (identity defects block via doctor
     `revise`; `buildStatusCard` normalizes empty `run_id` to `unknown`). The field and both fallback
     lines are therefore proven at unit/print level; the layered guards themselves are the E2E
     evidence that no silent card loss remains reachable.
  2. TP test-plan items on `test:lifecycle` / `test:cli-modularization` could not run to green on
     this host: failures are pre-existing native-Windows limitations proven identical on clean
     `main` via stash comparison (OpenCode global-surface ownership, POSIX `/tmp` path fixture,
     `spawnSync npm` ENOENT in package-contents, CRLF working copy in Runtime Integrity,
     local-validator version fixture).
- risks: none blocking; severity tightening for legacy states is intended and diagnosed.
- required_next_step: Clean Implementation Review and Code Review, then QA gate with this coverage.
