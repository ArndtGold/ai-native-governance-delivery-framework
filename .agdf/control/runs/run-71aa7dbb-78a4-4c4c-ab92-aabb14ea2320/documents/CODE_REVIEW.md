# Code Review: Single Core reader for the companion event journal

Gate: CR
Type: Code Review
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- approved_tp: sha256:07fee34825864b4c8fa4f54c3987d65952fed6f9fd0793e08d5ba6001271d08d
- reviewer: independent review subagent (read-only, given the code and the change goal, not the author's assessment) plus Claude (agent) verification and fixes
- reviewed_at: 2026-11-27

## Scope

The uncommitted diff on `agdf/companion-journal-reader` against b10fec4a: `read-companion-events.js` (renamed), `run-view.js`, `cockpit-session.js`, `cockpit.js`, `run-inventory.js`, the CLI parser, registry and run-view command, `scripts/core-projection.mjs`, the Claude templates `register.mjs`, `run-state.mjs`, `events.mjs`, `view.mjs`, the Codex card and types, and the adapted and new tests.

Checked and fine by the reviewer: Windows root matching (realpath plus `path.relative` for case, separators, trailing separators, junctions), current-before-rotated read with id de-duplication, events read before runs including the early returns, CLI rejection of repeated, relative, missing or foreign-command `--companion-data`, the Copilot projection change, no remaining reference to the old module name, card types, keys and `historyEvents` ordering. The card hiding `approval_recorded` without a run detail path is the intended PRD AC-006 failure behaviour.

## Findings

- [should-fix] CR-01 `run-state.mjs`, `register.mjs`: a run view that parsed but counted as failed (transient store reason `source_changed`/`timeout`, a run with `evaluation_error: source_changed`) dropped its events, so an `effect_unknown`, `recovery_required` or `approval_requested` event was announced only after a later good read; the base parsed the journal itself and announced such kinds at once. Fixed: the failed snapshot keeps the parsed events, `showEvents` shows the non-durable ones and keeps durable facts waiting in `unconfirmed`. A process timeout or crash still delays events until the next good read (no output to use); this follows the owner-approved run-view route.
- [minor] CR-03 `events.mjs` `unseenEvents`: two overlapping reads applied in order could move the cursor back to an older event, so the next read announced the events in between again. Fixed: a view whose newest event is not newer than the cursor keeps the cursor.
- [minor] CR-04 `register.mjs` `refresh`: if persisting a dropped selection threw after the events were taken, the cursor had advanced and the events were lost. Fixed: the events are taken last in the read.
- [minor] CR-06 `run-state.mjs` `runViewArgv`: a relative plugin data directory (relative `CLAUDE_CONFIG_DIR`) made `--companion-data` a usage error and cost the whole run view. Fixed: the option is passed only for an absolute path; the companion then reads without events.

## Re-verification After Fixes

- CR-01: new adapter case (readable view with store `unavailable`/`source_changed`): the uncertain outcome is toasted during the outage, the recorded approval waits and is shown once by the next confirming view, nothing twice. The case fails against the previous `showEvents` early return (`AssertionError: the uncertain outcome is announced during the outage`) and passes with the fix; unit case for the failed snapshot keeping its events.
- CR-03: unit case "an older view keeps the cursor"; the base `unseenEvents` of b10fec4a moves the cursor from `z` back to `a` on the same input, the fixed one keeps `z`.
- CR-04: verified by code order (events taken after the selection handling); a failing state-file write is not reproducible in the fake host, the full adapter suite passes.
- CR-06: unit cases for a relative and an absolute POSIX data directory in `runViewArgv`.
- After the fixes: `npm run build:prepare`, `test:claude-companion`, `test:companion-run-view` (incl. the contract test), control-ui vitest, `npm run compatibility:record` and `npm run compatibility:check` (56 scenarios, 0 failed, source fingerprint 6696b7fd...) were run again and passed; the superseded observation file of the first record was removed, the new one (06b80eba...) is referenced by the snapshot.

## Missing Evidence

- The live Claude companion pane and the Codex app are not exercised (stated gap since the PRD).

## Risks

- Reviewer finding 2 (accepted trade-off, not a gap): every journal write for any project root starts one run-view read in every open Claude companion, and the observer loop awaits it. The owner accepted this cost on 2026-11-27 (UR section 7, PRD section 10). A follow-up could let `companion-observe`, which already runs Core, signal `journal` only when this root has a new event.
- Reviewer finding 5 (designed bound): only the newest 32 events of the root reach the companion per read (SD SDD-001, SDD-003); a burst of more than 32 events between two applied reads announces only the newest. The worst-case run-view output with 32 maximal previews is about 150 KB; whether `$.process.run` caps stdout is not documented.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | `snapshotFromRunView` keeps parsed events on transient failure, `showEvents` without the failed early return; adapter case red before, green after | none |
| CR-03 | implementation_gap | CD+Tests | resolved | `unseenEvents` keeps a newer cursor; unit case passes, base b10fec4a moves the cursor back on the same input | none |
| CR-04 | implementation_gap | CD+Tests | resolved | `refresh` takes the events after the selection handling; code order verified, adapter suite passes | none |
| CR-06 | implementation_gap | CD+Tests | resolved | `runViewArgv` passes `--companion-data` only for an absolute path; unit cases pass | none |

## Required Next Step

Clean Implementation Review, TP Review and QA gate as routed by gate-check.

## Decision

- decision: pass
