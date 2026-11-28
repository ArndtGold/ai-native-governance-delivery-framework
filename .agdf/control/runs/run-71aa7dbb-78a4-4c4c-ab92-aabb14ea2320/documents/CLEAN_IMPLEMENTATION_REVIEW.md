# Clean Implementation Review: Single Core reader for the companion event journal

Gate: Clean Implementation Review
Type: Clean Implementation Review
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- approved_sd: sha256:2934a7c419645896a9ce640accb97ad8fcf12d2ea08125fbe5bc07ab8ac1c06f
- reviewer: Claude (agent)
- reviewed_at: 2026-11-27

## Scope

Structural cleanliness of the uncommitted diff on `agdf/companion-journal-reader` against b10fec4a after the Code Review fixes: ownership, parallel structures, dead code, boundaries, naming and test placement.

## Assessment

- Single owner: journal lines are parsed only by Core `events.js` `parseEventLines` inside `read-companion-events.js`; the Claude templates hold no parser, root normalization, read bound or rotation file name (contract test SCN-001). The Cockpit and `run-view` both call the same `readCompanionEvents`.
- No parallel structure: the Codex card reuses the template's `historyEvents`, `isConfirmed`, `isStillUncertain`, `eventText` and `eventTimeText` through the existing import path instead of re-implementing them in TSX; its local `eventTimeText` was removed. `last_activity` comes from the run inventory's existing receipt derivation (`runLastActivity`), not a second time rule.
- Boundaries kept: the Claude template still imports no Core module and reaches Core only through the read-only `run-view` process; `run-view` stays read-only; the Cockpit observation keeps its response-size check.
- Dead code removed: `parseJournal`, `EVENT_SCHEMA`, `normalizeRoot`, `sameRoot`, `JOURNAL_READ_LIMIT`, `JOURNAL_ROTATED_FILE` in `events.mjs`; the rotation-file read and the separate confirmation path of the old `pollEvents`; the parser and root mirror tests. The test alias `COCKPIT_EVENTS_READ_LIMIT` was replaced by the new constant name.
- Retained on purpose: Core `events.js` `sameRoot` (used only by the host-neutral test harness, SD SDD-005); `JOURNAL_FILE` and `journalDirectory` in the template for the size/mtime change detection.
- Code Review fixes stay inside their owners: the failed-snapshot event mapping in `run-state.mjs`, the monotonic cursor in `events.mjs`, the order of `receiveEvents` and the single `showEvents` path in `register.mjs`; no new module or flag.
- Runtime profiles consistent: the reader is no longer excluded from the Copilot projection, `package-contents-test.js` pins it into every profile, and the Copilot payload baseline names this run.
- Tests placed with their owners: reader and cross-consumer contract in Core tests, CLI option in the run-view command test, poll flow in the Claude adapter test, card rules in control-ui tests.

## Normalized Findings

No applicable finding.

## Decision

- decision: pass
