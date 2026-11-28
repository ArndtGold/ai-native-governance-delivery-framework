# Code Review: Lean Codex continuation handoff

Gate: CR
Type: Code Review
Status: `done`

## Run

- run_id: run-fc64e714-ce09-40f1-934f-5593fbeed84e
- approved_tp: sha256:c5e5d1a2892e92dc4aafbeebcb3916a669aa9f9d02e7324172642168662d576f
- reviewer: independent review subagent (read-only, given the diff and the intended behaviour, not the author's assessment) plus Claude (agent) verification and fixes
- reviewed_at: 2026-11-27

## Scope

The uncommitted diff on `agdf/pr84-continuation-locks` against c0e0c600 (`git diff HEAD`, generated `.agdf/`, `docs/compatibility/` and `evals/` excluded): `codex-continuation.js`, `mcp-dispatch-runtime.js`, `cockpit-session.js`, `contract.js`, `plugin-provenance.js`, the three files restored to 6e166cab, the control-ui continuation port and action, and the adapted tests including the browser cases.

Checked and fine by the reviewer: every write and unlink of the store runs under the per-record lock and pruning re-checks each record under its own lock without nesting; only the reserved-to-pending step of the same view and attempt yields a send permit and a lost reply cannot produce a second one; production clocks are all `Date.now`; the three restored files are byte-identical to 6e166cab; no caller of `continuation_owner`, `work_admission`, `associateTurn`, `settleTurn`, `observeRunning`, `interrupt_requested` or `stopping` remains; the activity binding matches the Cockpit's `companionBinding`; the browser case expectations can hold against the fixture (clock offset, `attachTurn`, terminal rows).

## Findings

- [should-fix] CR-01 `cockpit-session.js` `continue`/`reserve`: a view kept `session.reservation` after its own reservation ended in the store; with the new 2-minute expiry a later click hit the branch that answered `unavailable` for a ready store, so the card stayed stuck until reopened. Fixed: a held reservation that the store reports `ready` is cleared and a new reservation proceeds; a publication that answers `ready` also clears it.
- [minor] CR-03 `codex-continuation.js` `current`: an unreadable record with a file time further in the future than the bound never aged. Fixed: such a file counts as aged, like the future-dated `since` rule of live records.
- [minor] CR-04 `mcp-dispatch-runtime.js` `admitCodexContinuation`: a dispatch with `continuation_attempt_id` whose result is terminal or has nothing to continue left the handoff pending for up to 10 minutes, so the card showed the waiting text. Fixed: such a dispatch releases its pending handoff through the new store operation `release(scope, attemptId)`; the result stays unchanged.
- [minor] CR-05 tests: browser SCN-007 compared the attempt with itself, browser SCN-009 asserted the absence of a text the UI no longer has, and the Core pruning case depended on mixed clocks and did not cover an old file with a live record. Fixed: SCN-007 checks the running card, one message and one grant for the original attempt; the trivial SCN-009 line is removed; pruning has its own Core test with explicit file times covering an ended old record, a live record with an old file, an ended record with a young file, an aged and a young unreadable file.
- Reviewer finding 2 (within the approved design, not a gap): after the 1-minute claimed display only the activity lease holds the start back; for an approval handoff (no agent activity), agent phases without an activity lease or hosts without trusted hooks, a second click can publish a new handoff for the same step. This is the PRD decision (claimed display 1 minute, PRD section 10 and SD section 8 risks); a repeated approval handoff only opens the decision again, and repeated agent work stays consistent through the revision check.
- Reviewer finding 3b (designed, not a gap): a directory, link or inaccessible file at a record path is never judged or removed and keeps Companion operations of that Run `unavailable`; ordinary chat continuations are unaffected. The store deliberately never deletes something that is not its own regular record file, as the PR #84 store did.

## Re-verification After Fixes

- Each fix was reverted temporarily and its new test failed: CR-01 (`companion-continuation.test.js` case 3, a second reservation after the own record ended answered `unavailable`), CR-03 (`codex-continuation-admission-test.js` case 5, the far-future unreadable file stayed `unavailable`), CR-04 (`companion-continuation.test.js` case 2, the ghost-run handoff stayed `pending` after a terminal pickup). With the fixes restored all pass.
- After the fixes: `node --test packages/core/test/codex-continuation-admission-test.js` 7 of 7, `node --test packages/core/test/cockpit-session-test.js` 18 of 18, `npm run build:prepare` pass (no payload growth), `npm --prefix packages/mcp-server run test:continuation` 3 of 3 plus `continuation.test.js`, `test:safety` pass, `npm --prefix packages/cli run test:companion-run-view` 77 pass, `test:skill-dispatch` pass, `node --check` on both browser files, `npm run compatibility:record` (source fingerprint 7812664f..., observation d0246518...; the superseded first observation b0c4805e... was removed because the snapshot no longer references it) and `npm run compatibility:check` (56 scenarios, 0 failed).

## Missing Evidence

- The browser continuation cases and a native Codex host are not exercised on this machine (stated gap since the PRD).

## Risks

- Repeated handoffs after the claimed display where no activity lease exists (reviewer finding 2), as accepted in the PRD.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | `cockpit-session.js` clears an ended own reservation; MCP server case 3 red before, green after | none |
| CR-03 | implementation_gap | CD+Tests | resolved | `current` treats a far-future file time as aged; Core case 5 red before, green after | none |
| CR-04 | implementation_gap | CD+Tests | resolved | `admitCodexContinuation` releases a handoff on a terminal pickup via `release`; MCP server case 2 red before, green after | none |
| CR-05 | evidence_gap | evidence_obligation | resolved | browser SCN-007 and SCN-009 sharpened, dedicated Core pruning test with explicit file times passes | none |

## Required Next Step

Clean Implementation Review, TP Review and QA gate as routed by gate-check.

## Decision

- decision: pass
