# Code Review: Declare the preview snapshot writer in the MCP safety write boundary

Gate: CR
Type: Code Review
Decision: pass
Date: 2026-10-19
Reviewer: Claude Code (agent) with an independent read-only review agent; cooperative assurance

## Scope

Commit 2595f362 on `fix/agdf-core-approval-defects-20261017`: `packages/mcp-server/test/safety.test.js` (one `continuationWriteOwners` entry, the `assertExclusiveCreate` assertion with a positive control and three negative cases). Governance artefacts under `.agdf/control/` are out of review scope.

## Method

1. Self-review against the approved UR and the Brownfield Review.
2. Independent read-only review agent: declaration against the scanner's own regex on the built `dist` copy, behaviour of `assertExclusiveCreate` on the real source and on simulated weakenings, ordering and lookups, effect on the read-only graph, style.
3. Both review findings that required a change (CR-02, CR-03) were fixed before the commit and `test:safety` was re-run.

## Decision

Decision: pass

No open finding remains.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | `preview-snapshot.js` was reachable from the MCP server but undeclared; the entry at `safety.test.js` line 82 declares `writeFileSync`, `openSync`, `fsyncSync`, which is exactly what the scanner finds in `dist/npm/create-agdf/runtime/core/lib/control-state/preview-snapshot.js` in `writeSymbols` order (the dist copy is byte-identical to the source); a full graph scan finds no other module beyond its boundary | Re-run `npm --prefix packages/mcp-server run test:safety` after any change to `preview-snapshot.js` |
| CR-02 | implementation_gap | CD+Tests | resolved | Independent review (revise): the three negative `assert.throws` calls had no validator, so an unrelated `TypeError` would also have satisfied them. Fixed: each expects `assert.AssertionError`; the positive control on the synthetic open still passes | Keep the `assert.AssertionError` validators when the negative cases are edited |
| CR-03 | implementation_gap | CD+Tests | resolved | Independent review (warn): the comment claimed that the declared symbols cannot cover an overwrite, but a write by path in the same module would pass both the symbol scan and the open assertion. Fixed: the comment now states only that the exclusive, non-following open cannot open over or through an existing file | Keep the comment limited to what `assertExclusiveCreate` checks |
| CR-04 | emergent_risk | UR | resolved | Independent review: a second write by path (`writeFileSync(join(root, p), data)`) inside `preview-snapshot.js` would not be caught. earliest-owner assessment: the approved UR limits this run to the declaration and the open assertion; today the module writes only through the exclusive descriptor (`preview-snapshot.js` lines 52 and 59), so the residual risk is future drift, which the owner can close with a `writeFileSync(fd)` assertion in a separate UR | Offer the owner a follow-up UR that also asserts a single `writeFileSync(fd, …)` call |

## Verified Safety Properties

- The read-only graph accepts the module through the same reviewed map (`readDescriptors = continuationWriteOwners`), as it already did for `run-presentation.js` with the same symbols; `publishPreviewSnapshot` is called only from `prepareRunPresentation` (`run-presentation.js` line 123), not from the Inspect readers.
- `visited.get` for the module runs after the existing check that every declared owner is visited, so it cannot be undefined.
- Style matches the neighbouring structural assertions (single quotes, two-line comment).

## Residual Risks And Follow-Ups

- Pre-existing and outside this scope: no test asserts that `agdf_inspect` leaves the tree unchanged for `presentation-preview` and `presentation-document` reads (`preview-session-test.js` compares only `RUN_STATE.md`); the "actual no-write tests" half of the test comment is not met for presentations.
- The structural regex depends on the exact formatting of the open call, like the existing assertions for `snapshot.js` and `run-presentation.js`; a reformatting fails closed and needs a test update.
