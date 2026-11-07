# CD+Tests: contradictions collected for owner clarification

Owner instruction 2026-11-05: work through the approved TP without per-task questions and clarify contradictions together at the end. Each entry names the conflicting statements, the interpretation used meanwhile and the evidence.

## C1 too_large has no Core source (T-004)

- Conflict: SD SDD-003 and TP T-004 list the per-run reason `too_large`. With the node-side run view the companion's own 1 MiB bound is gone, and Core has no per-run size bound in the CLI read path; the oversized fixture F12 is reported by Core as `AGDF_RUN_OPERATIONS_INVALID`.
- Interpretation used: map Core's finding codes only (`run_version_unsupported`, `run_state_invalid`, `missing`); `too_large` stays in the reason vocabulary with count 0 and is never invented. F12 shows `run_state_invalid`.
- Evidence: `packages/core/lib/companion/run-view.js` (`diagnosisReason`), `packages/core/test/companion-run-view-test.js` (SCN-004/SCN-006 case).
- Clarification needed: drop `too_large` from SDD-003/T-004 wording, or define a Core size bound (new rule).

## C2 Refresh cost above the SD measurement (T-005, T-006)

- Conflict: SD SDD-002 and the SD risk table state 0.5 to 0.65 s per companion refresh. On this repository's control store (707 MB, about 13.6k files, 160+ runs) one `run-view` call of the generated runtime takes 1.31 to 1.42 s (three runs, 2026-11-05); the T-002 probe measured a smaller store.
- Interpretation used: the design stays; the SD mitigation (refresh only on fingerprint change, event or language change, T-010) bounds the number of calls, and the companion keeps the last good view meanwhile.
- Evidence: `node packages/cli/generated/plugins/agdf/runtime/agdf-local.js run-view --dir <repo> --json --language de` timings; `evidence/T-002-process-probe-01.json`.
- Clarification needed: accept the measured cost for large stores, or ask for a bounded read (for example active runs only by default) as a follow-up.

## C3 Review results are no block on the status card (T-006)

- Conflict: the earlier companion follow-up (SCN-009) raised "blocked" toasts after a recorded review decision `revise` or `block`, a state the old companion derived itself. The status card, which SD SDD-001 makes the only source, keeps a quick task with a recorded review `revise`/`block` at `open` with no blocking condition, so the companion now shows "working" and raises no toast there.
- Interpretation used: follow the status card (SDD-001); real blocks (request change, doctor findings) still raise toasts. The adapter test reports a block through the run view for its notice, sound and race checks and says so in a comment.
- Evidence: probe of `fixture-a` after approval and `step.record review` (status `open`, `blocking_reason: none`); `packages/cli/scripts/claude-companion-adapter-test.js` (`reportBlock`).
- Clarification needed: accept that review results are not companion blocks, or extend the status card (Core change outside this run's SD).

## C4 Run order and "changed in this session" use the last receipt (T-006)

- Conflict: the old companion ordered runs and detected "changed in this session" by `updated_at`; the run view carries the inventory's `last_activity` (latest receipt time). A run without any receipt (created directly, no recorded operation) has no activity, sorts last and never counts as changed in this session.
- Interpretation used: use the run view's `last_activity` (SDD-001, one source with the cockpit); the adapter test derives stepping neighbours from the same view instead of pinned `updated_at` values.
- Evidence: `packages/core/lib/control-state/run-inventory.js` (`lastActivity`), `packages/cli/scripts/claude-companion-adapter-test.js` (`neighbour`).
- Clarification needed: none if accepted; otherwise the run view would need an additional `updated_at` field.

## C5 Declared input sources are not kept in the run state (T-009)

- Conflict: SD SDD-008 lets the run view "compare declared sources from Run Operations with their current canonical digest". The run state keeps no declared input file of a recording: Run Operations rows hold only operation id and request digest, Artefact Bindings name the upstream document and the recorded destination, Evidence Bindings the recorded report. A recording's material path (for example `evidence/SD-input-05.md`) appears nowhere (checked on this run's RUN_STATE.md: 0 of 38 receipts).
- Interpretation used: the run view compares the documents the run state binds with a recorded digest (latest artefact binding destination, latest evidence report per path) against their current canonical digest (`readRunDrift`, node digest owner `artefactFileDigest`). A recording from a path still reports source path, recorded digest and `match`/`mismatch` at record time in its journal event (review facts).
- Evidence: `packages/core/lib/companion/run-view.js` (`readRunDrift`), `packages/core/test/companion-run-view-test.js` (SCN-014 case), `packages/mcp-server/test/companion-journal.test.js` (path review facts).
- Clarification needed: accept the interim, or persist the declared input source in the recording receipt (Core write change, own run) so drift of the input file itself can be detected.

## Owner decisions (2026-11-06)

Asked together after T-001 to T-012 and the full verification, as instructed.

| Item | Decision | Consequence |
|---|---|---|
| C1 | Keep `too_large` in the reason vocabulary with count 0; never invent it | No SD/TP revision; the deviation is documented in CD+Tests |
| C2 | Accept the measured refresh cost for large stores | No follow-up; the run view is only called on fingerprint, event or language change |
| C3 | The status card is authoritative; review results are no companion block | No status card change; real blocks still raise notices |
| C4 | Informational, no decision requested | The run view's `last_activity` stays the order and session-change source |
| C5 | Accept the interim drift check of bound documents plus the record-time source match in journal events | No Core write change; the gap is documented in CD+Tests |
