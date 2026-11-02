# Linked UR title implementation checkpoint

Run: agdf-cockpit-mcp-app-20261005-01
Observed: 2026-10-07T14:07:31.499Z
Approved source revision: 102 / ad538c78-2b9a-4cbf-9cf7-84916060c9b6
Status: in_progress; minimal T-003/T-004/T-005 path implemented; T-006 fresh native checkpoint open. This is not completed CD+Tests, QA, UAT or OR.

## Result

The expanded three-area list reverses stored backlog row order and lazily replaces the visible row title with the first actual H1 of its uniquely explicit linked UR. A full bounded UR file is captured to produce its digest; only passive heading metadata is returned. Ambiguous, missing, denied, unsupported or oversized sources keep a labelled backlog-title fallback. Status and next step remain unchanged stored masterbacklog fields; the UR document status is never projected into these fields. Opening a Run performs the separate current control evaluation. The compact selection dropdown remains stored backlog discovery; no new graph or publication behavior was implemented.

Opaque selectors, immutable scope replacement, exact unchanged backlog digest, optional denied-path identity and freshness revalidation are owned by Core. HTTP and the private MCP read schema delegate to that owner. One visible title batch contains at most twelve unique current row selectors. The UI keeps metadata only, per-view LRU 128 records / 256 KiB serialized UTF-8 including keys; refreshed, stale or new-session observations reset it. Navigation cancels candidates and preserves same-digest title search/focus; passive title responses never focus or switch Run.

## Verification

- Core: 7 new title assertions and 13 existing scoped-read regressions pass. Read sets, complete-source hash, denied ancestor replay, boundaries, races and no-write fixture windows are recorded.
- UI: 113 tests; HTTP: 6 tests passed earlier; latest copied rerun passes 3 and fails 3 with asset_boundary_invalid during guarded build-asset capture. The targeted title test passes; full current HTTP acceptance remains open; browser: 4 tests. Theme/width, area reversal, visibility, fallback, loaded-title search, generation, abort, cache and return are covered. Typecheck, browser build and MCP build pass.
- Both stdio protocol eras pass for the isolated and registered matching runtime. Default MCP regressions pass; the final subsequent Core change only refines H1 parsing.
- Real repository initial read: Masterbacklog only. Single title request: Masterbacklog plus the selected explicit UR, no directory enumeration or other Run read. Selected observed source bytes remain unchanged across the read window.
- Actual browser overview shows 54 active, 2 planned and 86 archive entries; first active heading is Embedded AGDF Cockpit for Codex. Screenshots are copied below. Browser evidence does not qualify the native host.

The planned area has an existing diagnostic, faithfully retained. The stored Cockpit backlog row says Awaiting SD and an older TP-drafting next step; this is an outdated stored pointer, not UR metadata or a current gate assessment. No automatic backlog synchronization or writer change is part of this delta.

The local runtime is prepared and its configuration restored. T-006 / SCN-099 remain open until a fresh Codex connection exposes and renders this tuple. Dependent feature expansion has stopped at that boundary. Full renewed task fulfillment, review, QA, UAT and OR remain open.

## Evidence and ownership

- BACKLOG_TITLE_READ_EVIDENCE-22.json
- BACKLOG_TITLE_UI_EVIDENCE-22.json
- HOST_BACKLOG_TITLE_EVIDENCE-22.md
- backlog-title-evidence-22/: copied logs, reports, screenshots, preparation and activation receipts. No preview authentication nonce is saved.

Current external HEAD is 20cf9c9b5ac8587d43d0bc3cbe673635e468e440; an external commit occurred after the earlier preparation baseline. No commit, stage, reset or PR was performed by this checkpoint. Approved UR/PRD/SD/TP hashes match their bound originals. The protected lifecycle diagram digest is b5bfbb74afd100e5dda4a7ae56df978c99e1cf4ce57e10239782c7448d9a90bf. Architecture and existing README document the implemented read path and limits; canonical Pages design ownership is unchanged.
