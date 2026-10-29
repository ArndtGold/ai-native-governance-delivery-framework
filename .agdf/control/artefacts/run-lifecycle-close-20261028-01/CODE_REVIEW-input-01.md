# Code Review: Close Active Runs as Superseded or Abandoned

Decision: pass
run_id: run-lifecycle-close-20261028-01
Reviewer: independent Claude Code review subagent (read-only), corrections verified by the implementing agent
reviewed_at: 2026-10-29

## Scope

Working-tree diff of branch `feat/run-lifecycle-close` against `main` (`af0634d3`): Core closure module and identity helper, run-step integration, ended-run guard, readers, MCP kinds, CLI command, cockpit and control-ui, tests. Excluded: `.agdf/control/**`, eval fingerprint churn, payload baseline.

## First Pass Result

The independent review returned `revise` with two defects against AC-012 and five notes. It confirmed as sound: the writer guard in `writeRunLocked` and `writeRunRecoveryLocked`, the idempotent replay before the ended check, the per-run revision, lifecycle and seal recheck under the lock, run id and preview id containment without path traversal, `lifecycle_close` not reachable from `run-step` or `step.record`, the repository-wide pending-journal refusal, the unchanged MCP tool count and budgets with per-run kinds still requiring their binding, unchanged `completed` and closeout behavior, and CRLF handling.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | `recordRunStep` asserted the backlog path before the closure plan, so a directory or symlink at `MASTER_BACKLOG.md` stopped the closure (probe confirmed); fixed in `packages/core/lib/control-state/run-steps.js` to report `skipped/backlog_path_invalid` and close the run; new case in `packages/core/test/run-closure-test.js` fails without the fix and passes with it | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | backlog-only `run-update` on an ended run only rewrote the Active status cell; `packages/core/lib/control-state/run-backlog.js` now moves the row to Completed / Superseded Pointers with final status, run link and receipt outcome via shared helpers in `run-operations.js`; `packages/core/test/run-lifecycle-guard-test.js` asserts the archive row and fails without the fix | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | a committed closure whose backlog recovery failed was reported `not_closed`; `run-closure.js` now reports `closed_recovery_pending` with the recovery next action and `recovery_pending_count`; injected-failure test in `run-closure-test.js` fails without the fix | none |
| CR-F04 | implementation_gap | CD+Tests | resolved | the phrase binds only the preview id, so a rewritten preview file was not visible to the owner; preview and result headings now show the first 12 hex characters of the preview digest in en and de; core and CLI tests assert them and fail without the fix | none |
| CR-F05 | implementation_gap | CD+Tests | resolved | identity precedence repo, XDG, `~/.gitconfig` and fallthrough on empty values differed from what Git reports for AC-006; `git-identity.js` now reads repository config, `~/.gitconfig`, then XDG, and an explicit empty value counts as set; `git-identity-test.js` covers order and empty values and fails without the fix; this corrects the source order written in SD SDD-08 | none |
| CR-F06 | emergent_risk | SD | resolved | the `agdf_closeout` input schema no longer lists `run_id` and `expected_revision_id` as required for any kind; earliest-owner assessment: SD SDD-09 already decided a kind-limited envelope enforced in Core within the byte budget, and `validateRunCommand` rejects a `closeout.record` without them (tested in `packages/core/test/run-command-contract-test.js` and `packages/mcp-server/test/run-command.test.js`) | none |
| CR-F07 | implementation_gap | CD+Tests | resolved | after a crash mid-apply the remaining runs pointed to a new preview, and an exception for one run failed the whole preview; next action is now "recover, then repeat the same apply", and per-run fact collection is isolated as `run_unreadable`; both cases tested and fail without the fix | none |

## Verification After Corrections

- Each fix was reverted in turn; all eight targeted assertions failed, then passed after restoring the fix.
- `run-closure-test`, `run-lifecycle-guard-test`, `git-identity-test`, `run-close-test`, `run-closeout-command-test`, `claude-companion-test`, `cockpit-mcp-test`, `run-command-contract-test` and `test:run-step-transaction` pass.
- After rebuilding the npm package and reinstalling it in `packages/mcp-server`, all MCP server test scripts pass on the corrected tree; in the full serial run the performance test exceeded its warm dispatch p95 limit once (1394 ms against 1000 ms) and passed twice when rerun alone, together with `test:package` and `test:sdk-digest`.
- `npm run build:prepare`, `compatibility:check` (56/56) and `eval:skills` (113/113) pass after the payload baseline update to 399 files / 3579410 bytes.

## Residual Notes

- The SD text of SDD-08 still names XDG before `~/.gitconfig`; the implementation follows Git's precedence as AC-006 requires.
- The closure confirmation keeps the cooperative limit of approvals: a party that can write the preview file can change it; the digest prefix makes such a change visible but does not prevent it.
