# Code Review: Four AGDF approval-chain defects

Gate: CR
Type: Code Review
Decision: pass
Date: 2026-10-17
Reviewer: Claude Code (agent) with an independent read-only review agent (two rounds); cooperative assurance

## Scope

The full uncommitted change set on branch `fix/agdf-core-approval-defects-20261017` (base `main` 16d08888): Core evaluation, presentation, gate policy, closeout, evidence bindings, approval material, lock writer, the CLI dispatch-runtime export, the MCP worker executor, worker entry, bin and generation-child entrypoints, locale registry, Copilot payload baseline and the new and updated tests. Governance artefacts under `.agdf/control/` are out of review scope.

## Method

1. Self-review while implementing T-001 to T-010.
2. Independent review round 1 by a separate read-only agent: correctness, regressions, integrity weakening (lock release safety, D4 exceptions), races, Windows paths, legacy receipts, the Clean Review alias, and readiness/presentation/UAT consistency (D1).
3. All block, revise and warn findings were fixed or explicitly assessed, then independently re-reviewed (round 2) on the fix delta.

## Decision

Decision: pass

No open finding remains. Round 2 found no block or revise finding. Its one warn finding (CR-14) is fixed and covered by a test. Final verification found three test-harness and evidence findings (CR-17 to CR-19); all are fixed without weakening an assertion.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | Round 1: `packages/mcp-server/src/generation-entry.js` created the worker executor without `releaseOwnedLock`, so the plugin launch path (owned generation child) never released abandoned locks. Fixed: it passes `releaseAbandonedOwnedLock`; `worker-lock-release.test.js` statically checks that every `createAgdfWorkerExecutor` call in `main.js` and `generation-entry.js` passes it. | none |
| CR-02 | implementation_gap | CD+Tests | resolved | Round 1: the closeout QA-association allowance applied even when the QA approval had seen the reviews (QA report recorded before the reviews, then approved). Fixed: the allowance applies only to review types absent from the QA approval receipt material (`run-state.js`, `evidence-bindings.js`), and gate policy now withholds Approval: QA while the QA association is not current ("Rerun QA against the current evidence"). The normal-flow test covers QA rerun and closeout without allowance. | none |
| CR-03 | implementation_gap | CD+Tests | resolved | Round 1: the late-review allowance existed only in closeout, so the work summary, the cockpit and the UAT evidence list still reported QA as not current. Fixed: one owner, `evidenceApplicability`, with option `lateReviewTypes` computed once in `run-state.js`. | none |
| CR-04 | implementation_gap | CD+Tests | resolved | Round 1: an unreadable Approval Operations section made late recording eligible (fail open). Fixed: `approvalMaterialTypes` returns `invalid` and eligibility refuses; covered by a unit assertion. | none |
| CR-05 | emergent_risk | PRD | resolved | Round 1: a late review is evidence recorded after a human QA/UAT decision, and a late non-pass review keeps closeout refused with no recovery after Approval: UAT. earliest-owner assessment: approved PRD AC-009 decides exactly this (record without source revision or renewed approval; a non-pass review keeps closeout refused and is named). The OR must disclose late recordings; the negative test covers the refusal. | none |
| CR-06 | implementation_gap | CD+Tests | resolved | Round 1: gate policy ignored the supported `Clean Review` alias, while material, QA deviation and Quality Readiness honour it. Fixed: shared `reviewArtefactType` in `closeout-readiness.js`, used by gate policy and closeout; unit-tested. | none |
| CR-07 | implementation_gap | CD+Tests | resolved | Round 1: with an artefact language other than en/de the new early check would refuse UR/QA presentation with an unfixable diagnostic (UAT already could not read such summaries). Fixed: `readAuthoredContent` accepts any well-formed source tag; fields stay keyed by the display locale; tested with `source=fr`. | none |
| CR-08 | implementation_gap | CD+Tests | resolved | Round 1: the failed-acquisition path announced `released` even if publishOwnedLock's own cleanup had failed, which could drop a still-held token. Fixed: no announcement on that path; release after exit returns `absent` or `foreign` when nothing of ours remains; `run-lock-test.js` updated. | none |
| CR-09 | emergent_risk | CD+Tests | resolved | Round 1 info: readiness recovery shows absolute local paths. earliest-owner assessment: identical to the existing PRD readiness recovery owner (`prd-readiness.js`); local-only output; no change in this slice. | none |
| CR-10 | implementation_gap | CD+Tests | resolved | Round 1 info: the recovery named only the first unreadable field. Fixed: every expected line is listed; tested with QA missing `Grenzen` and `Risiken`. | none |
| CR-11 | emergent_risk | CD+Tests | resolved | Round 1 info: `done` maps to pass without checking the review's own evidence association. earliest-owner assessment: Quality Readiness is display-only and already ignores association for keyword statuses; gate decisions use `isInternalStepSatisfied`; no change. | none |
| CR-12 | emergent_risk | CD+Tests | resolved | Round 1 info: a terminated worker leaks its lock file descriptor (one per abandoned dispatch). earliest-owner assessment: rare (only abandoned dispatches); the real-thread test proves the lock is still removed on Windows; documented as residual risk for QA. | none |
| CR-13 | emergent_risk | CD+Tests | resolved | Round 1 info: the D1 skip rule skips any colon-labelled prose line and accepts `Ziel :`. earliest-owner assessment: accepted by SDD-001 (labelled lines are skipped; readability is enforced by the shared check before approval). | none |
| CR-14 | implementation_gap | CD+Tests | resolved | Round 2 warn: legacy QA approvals without a material receipt were late-eligible, but the association allowance requires a receipt, creating a possible new dead end. Fixed: late eligibility requires a material receipt that proves the review was unseen (symmetric with the allowance); unit-tested. | none |
| CR-15 | emergent_risk | CD+Tests | resolved | Round 2 info: the QA rerun branch is satisfied by re-recording a byte-identical QA report. earliest-owner assessment: cooperative-assurance limit of all recordings; the qa-gate rule already requires review evidence for a QA pass; no change. | none |
| CR-16 | emergent_risk | CD+Tests | resolved | Round 2 info: a kept token after a failed acquisition triggers one brief release attempt under the reclaim guard after exit. earliest-owner assessment: a concurrent cross-process reclaim at that instant sees one transient lock error and retries normally; negligible. | none |
| CR-17 | implementation_gap | CD+Tests | resolved | Verification: `packages/cli/scripts/runtime-check-consent-test.js` normalized the checkout path only in raw form, but the hook facts are JSON text in which Windows backslashes are escaped. In this worktree the supplement measured 322 bytes against the 320-byte budget, because the escaped 117-character path stayed in. Fixed: the JSON-escaped path is normalized; the 320-byte budget is unchanged; the test passes. This is a pre-existing, path-depth-dependent test defect, not caused by this change. | none |
| CR-18 | implementation_gap | CD+Tests | resolved | Verification: the late-gate transition fixture in `packages/cli/scripts/build-contract-checks.js` (used by `smoke-test.js` and the CI stage `build-contracts`) approved QA without TP Review and Clean Implementation Review rows, so the D4 gate-policy branch now correctly withheld Approval: QA. Fixed: the fixture writes both review rows; the cases `qa-approval` and `brownfield-not-applicable` record them as `done`; a new case `qa-reviews-missing` asserts the new branch (allowed `record TP Review and Clean Implementation Review`, forbidden `request QA approval` and `request UAT approval`). No assertion was weakened. | none |
| CR-19 | emergent_risk | CD+Tests | resolved | Verification: `delivery-intake.js` is a declared behavior owner of the `ur-definition` skill evals, so its change made the deterministic eval fingerprints stale (`manifest_fingerprint_stale`, `EVAL_OBSERVATION_STALE` on four cases). earliest-owner assessment: routing, gate, approval and action expectations are unchanged; only the skill-level fingerprint in `evals/manifest.json` and the four `ur-definition` observations in `evals/observations/deterministic-replay.json` were re-pinned, as in commit 1f1f10e9. `eval:skills` 106/106 and `test:skill-evals` pass. | none |

## Verified Safety Properties

- `releaseAbandonedOwnedLock` removes only an exact own token with the same PID and unchanged bytes, under the reclaim guard; foreign, unknown and guarded locks stay unchanged (tests).
- The executor releases tokens only after the worker's actual exit or confirmed termination; Node drains posted messages before `exit` (real-thread test on Windows, Node 22.22.3).
- The D4 allowances never cover material an approval saw: approval material and QA association exceptions apply only to required review types absent from the QA approval receipt; any other changed source still invalidates (tests).
- No existing recorded review can be replaced through the late path; no other internal step becomes recordable after QA approval (tests).
