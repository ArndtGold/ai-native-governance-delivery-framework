# Code Review: Versioned defaults and immediate MCP input relief

- decision: pass
- Reviewer: Codex semantic self-review; no independent human review claimed
- Date: 2026-10-30
- Run: run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53
- source_revision: 1833c8b4a5e3184bbcb1dde97c09a33f086dd3eb plus current-candidate-inputs.json, 99 intended files; compact-manifest sha256:1a1279afd089b79da451a50448a8eacc280bef55b60f222da508ffcf29a35a5a

## Reviewed scope and evidence

Reviewed the intended diff and neighbouring public/full schema validators, target resolution, existing family operation/status/transaction/seal/history owners, resource loading, generation/Worker input transport, runtime provenance, presentation delivery and native harness. Unrelated CONTRIBUTING/installer/other-Run changes are excluded and protected by ten unchanged baseline hashes. Current bound authoring inputs at revision b40588c9-2ddf-4b9d-945b-a9f81677bc6e were consumed through every cursor; manifest sha256:fad126570bd0f47cf9b7a16b6d1c97e30ae0992f164ae584cdd598cb2f8549ee. Approved PRD/SD/TP digests and current CD_TESTS.md sha256:0eedbc2dbdf3f1423239bb7afd0c53a7e251daeca46aa926b120a8d40e75d027 agree with the reviewed scope.

The shared public projection removes only eligible required values. Complete validators still reject explicit bad constants, foreign binding, absent IDs/digests/replies and unknown fields. The private context seam cannot be set by public arguments, validates real directories and rejects runtime roots; native cwd omission remains a no-effect error. Configuration is target-bound, invalid recognized values are not overridden, and source/field diagnostics are bounded without raw extension contents. Configuration size is checked before reading and again before new effects. Snapshot ownership is carried once by private context; AsyncLocalStorage isolates concurrent operations.

Reviewed resolved/1 wrappers and strict family unwrapping, logical/effective digests and presence shape, original lookup before current settings, prospective creation observation without publication, full journal/receipt resolution equality, immutable presentation hashing of stored bytes, and closure preview/per-Run ownership. Existing volatile transfer/delivery/generation contexts are bounded; uncertainty/expiry remains explicit. New resources are digested based on digested consumer bytes, so deleting a resource cannot downgrade the inventory. Legacy inventory selection remains compatible.

Functional evidence is the current CD+Tests scenario matrix SCN-001 through SCN-024, final both-SDK negatives and execution, full protocol/generation, 22 expanded source-revision cells, 44 approval interruption checkpoints with metadata tampering, final package/runtime/safety/build checks and the fresh native codex-delivered.json. Final native dispatcher/server digests equal assembled packages. Reused earlier family flows retain original source identities and applicability; the timed-out npm aggregate is not presented as a pass. Performance threshold success is distinct from any improvement claim. Original failures and corrected-condition tests are retained in probe-results/mcp-defaults-run-3ab79b5a/.

## Findings

No unresolved material defect found in this bounded review. The following concrete findings discovered during implementation review are resolved with original-condition evidence; they are not status-only closures.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | resources/configuration.js previously read before enforcing its 65536-byte limit. config-size-regression.json uses 65622 bytes: old helper/revalidation read counts 1/1, final 0/0, same typed configuration_invalid/snapshot_stale; final Core configuration and both-SDK tests pass. | none |
| CR-002 | implementation_gap | CD+Tests | resolved | Shared input normalizer lost allowlisted diagnostic field in actual Worker errors. mcp-input-resolution.js now preserves only validExecutionFacts allowlisted root fields; current-protocol.log and exact tool-error cases pass, including invalid skill_id and no raw config leak. | none |
| CR-003 | implementation_gap | CD+Tests | resolved | Early unresolved read/dispatch target changed its result plane in adapter. Shared resolver now leaves unresolved reads to existing Core; final-cli-results.json control-inspect exits 0, and final SDK/protocol negatives pass. | none |

## Missing evidence and risks

No missing evidence required for the approved implementation boundary. No independent reviewer, native Desktop/UI click, installation, GitHub CI, other-host/platform qualification, model task outcome, power-loss result or cost/token improvement is asserted. Full verify:commit was not run against the unrelated dirty source index. The source candidate is uncommitted. Existing caps have limited headroom (inspect 4954/5000 and aggregate 24033/24576); future additions must remain budgeted. Resolution metadata consumes existing transfer budgets and volatile retention has its established expiry/loss policy. These disclosed constraints do not constitute an unimplemented requirement of this TP.

- required_next_step: Complete the remaining TP Coverage and Clean Implementation evidence dimensions before the sole qa-gate decision.
