# Code Review: Companion core in Core (run view, MCP events, figure states)

Decision: pass
Gate: CR
Type: CR
Reviewer: Claude (three independent reviewer agents for the CD+Tests diff and one for the QA follow-up delta, plus verification by the implementing agent, for Arndt Gold)
reviewed_at: 2026-11-06
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

The uncommitted diff of branch `feat/companion-core-run-view` against main `53e8e900` after CD+Tests (revision 33). Three reviewers read it independently, each given only the code, the approved SD and TP and the owner decisions C1 to C5, without the implementer's conclusions:

- Core and the MCP write path: `packages/core/lib/companion/*`, `control-inspect/run-classification.js`, `cockpit.js`, `run-material.js`, the catalog modules, `packages/mcp-server/src/server.js`, `generation-runtime.js`, `packages/cli/lib/mcp-dispatch-runtime.js` and `mcp-lifecycle/plugin-runtime.js`.
- The Claude companion mod: `plugins/agdf/host-templates/claude/companion/*.mjs` and the companion catalog keys.
- The CLI command, packaging, CI wiring, the catalog and the changed tests.

The implementing agent verified every finding against the code before acting on it. The initial result was `revise`: 24 reported observations, 23 of them distinct (A7 and C4 name the same defect), one of them blocking. Twenty were confirmed and corrected (normalized findings below). A3, A4 and A8 were checked and not adopted, and B8 and C3 were corrected only in part; the reasons are listed. Every correction has a targeted check. Where feasible, that check was shown to fail without the correction.

Follow-up review (2026-11-06, gate QA): the corrections of the Clean Implementation Review findings CIR-01 to CIR-06 were reviewed by a further independent agent, given the changed hunks, the findings, the SD and the TP. It reported seven observations (RV-1 to RV-7); the implementing agent reproduced or checked each in the code. Six were corrected with targeted tests (RV-01 to RV-05, RV-07 below), each shown to fail on the previous code where feasible; RV-6 (cost of the captured read) is within budget and listed under observations.

## Findings

- [block → resolved] `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`: on Codex the journal directory below the `--data` root made uninstall classify that root as foreign. As a result, `planGlobalUninstall('codex')` kept the runtime instead of removing it.
- [revise → resolved] `packages/mcp-server/src/server.js`: failures the generation facade throws itself were never journaled. Examples are a lost generation connection, an unknown response and an expired session.
- [revise → resolved] `plugins/agdf/host-templates/claude/companion/register.mjs`:
  - B1: a failed run-view read kept its fingerprint, so no automatic retry followed.
  - B2: a new conversation was no longer noticed at the regular check.
  - B3: a root change mis-filtered the events of the new root.
  - B4: durable facts were shown in the pane before the run view confirmed them.
  - B5: session start waited for the run-view process.
- [advisory → resolved] Further corrected findings:
  - rotation-file lines could be missed;
  - uncertain outcomes cleared after one turn;
  - "read again" skipped the journal;
  - catalog keys were missing for four store reasons;
  - the terminal showed no preview;
  - drift was read from superseded bindings;
  - the event root lost the caller's path spelling;
  - an evaluation exception was hidden as an idle run;
  - malformed `--run` ids were accepted;
  - the objective line came from the card title;
  - three test-strength gaps.
- [medium] `packages/core/lib/companion/run-view.js`, `plugins/agdf/host-templates/claude/companion/run-state.mjs`, `register.mjs` - after the first CIR-01 correction a write during the single captured read made the whole view `unavailable/source_changed`; the companion replaced its last good view and dropped durable events it could not confirm (RV-01).
- [medium] `run-view.js` - a read-boundary failure of one run (a document registered outside `.agdf/control`, a linked file, a read limit) made the whole view unavailable, against SDD-003 (RV-02).
- [medium] `run-view.js` - a junction or symlinked project root was refused, although MCP canonicalizes the same target and journals its events (RV-03).
- [low] `packages/core/lib/control-inspect/run-classification.js` - `boundedCode` turned the configuration owner's `configuration_invalid` into `read_failed` (RV-04).
- [low] `run-view.js` - a missing `--dir` reported `unavailable/read_failed` instead of no control folder (RV-05).
- [low] `plugins/agdf/host-templates/claude/companion/events.mjs` - a drive root (`P:\`) kept its case in the companion's root comparison (RV-07).

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-A1 | implementation_gap | CD+Tests | resolved | SDD-006 says the journal directory is removed on uninstall like the companion state, but `inspectPluginMcpDataRoot` treated `companion/` as foreign. Reviewer probe: `owned`, then `foreign` after one `appendJournalEvent`. Fixed: the inspector accepts a plain `companion` directory holding only `events.jsonl` and `events.1.jsonl`; `retirePluginMcpDataRoot` removes it. Check: `scratchpad red-a1.mjs` exits 1 with the original line and 0 with the fix. `packages/cli/scripts/plugin-mcp-runtime-test.js` covers owned with both journal files, foreign with a stranger file, and retirement removing the root. | none |
| CR-A2 | implementation_gap | CD+Tests | resolved | TP SCN-021 requires journaling of thrown failures through the facade. The facade's own failures (`generation_connection_lost` and similar) reached no generation result and were not journaled. Fixed: `server.js` journals catch-path failures whenever the runtime observes outcomes; generation results it only relays are not journaled again. `companion-journal.test.js` checks that a lost connection gives one `effect_unknown` line and a relayed generation result none. It failed with the original catch line and passes with the fix. | none |
| CR-A5 | implementation_gap | CD+Tests | resolved | SDD-008 drift compared every latest artefact binding, including bindings a recorded source revision had invalidated. Fixed: `readRunDrift` reads `readArtefactBindings(...).active`, Core's own effective-binding owner (`bindingIsEffective`). Justified alternative to a source-revision fixture run: the selection is Core's tested effectiveness rule, and the drift checks in `packages/core/test/companion-run-view-test.js` (SCN-014) still pass. | none |
| CR-A6 | implementation_gap | CD+Tests | resolved | SDD-005 names the MCP target path as the event root, but the journal wrote the realpath, so a junction, symlink or subst spelling never matched the companion's session root. Fixed: the new `eventRoot` keeps the caller's absolute target when it is the same directory; review facts still read below the resolved root. `packages/core/test/companion-events-test.js` (CR A6) checks a junction, the same path, a foreign directory and a relative path. | none |
| CR-A7 | implementation_gap | CD+Tests | resolved | Also reported as C4. An exception from `evaluateGateCheck` for one run was swallowed and the run shown as idle (`bereit`), which hides a failure the run view must report. Fixed: the entry carries `evaluation_error` with the bounded code, and the figure shows `blockiert` with the unreadable reason. Unit test CR A7 in `companion-run-view-test.js`. | none |
| CR-B1 | implementation_gap | CD+Tests | resolved | SDD-010 calls for a retry after a failed read, and the old companion re-read every 30 s. After a failed read the stored fingerprint suppressed every further read until a file changed. Fixed: a failed read clears the fingerprint. Adapter test CR B1: a failing read, then a read at the next unchanged check, then quiet again. | none |
| CR-B2 | implementation_gap | CD+Tests | resolved | The chat-run navigation regression (CR-F03): with refresh gated by the fingerprint, `/clear` or a resumed transcript kept the chat run. Fixed: `check` follows the conversation and reads again when it changed. Adapter test CR B2: "Named in the chat" disappears after the conversation id changes. | none |
| CR-B3 | implementation_gap | CD+Tests | resolved | SDD-007 filters events by the current project root, but `pollEvents` used the root of the last read. Fixed: `pollEvents` reads `$.session.root()` and reads the run view first on a change; a root change clears pane entries and the preview. Adapter test CR B3: an event of the new root is announced and the old root's entries leave. | none |
| CR-B4 | implementation_gap | CD+Tests | resolved | SD section 2 requires durable facts to be confirmed against the run view, but the pane listed `approval_recorded` and `run_completed` unconfirmed. Fixed: `isConfirmed` (completed lifecycle, or the gate fulfilled on the path) gates both pane entries and toasts. Unit test in `claude-companion-test.js`; adapter test CR B4: of a QA and a UR approval, only the fulfilled UR is shown. | none |
| CR-B5 | implementation_gap | CD+Tests | resolved | Existing behaviour must stay unchanged (UR acceptance), but session start awaited the run-view process (about 1.4 s on this repository, up to the 10 s timeout) before the host continued. Fixed: the first read runs in the background (`whenIdle` for tests). Adapter test CR B5: the start hook passes on while the process is still held. | none |
| CR-B6 | implementation_gap | CD+Tests | resolved | SDD-006 and SDD-007 say the reader tolerates rotation, but lines written before a rotation and not yet read were lost. Fixed: when the cursor left the current file, the rotation file is read first. Adapter test CR B6: both the rotated line and the current line are announced. | none |
| CR-B7 | implementation_gap | CD+Tests | resolved | PRD state transition: the effect unknown or recovery required warning stays until the run state no longer carries the uncertainty. It cleared at the next turn. Fixed: these kinds stay past turns until the run view shows a later activity of that run (`isStillUncertain`). Unit test, plus adapter tests: the warning stays past a turn, and an older warning leaves at the next read. | none |
| CR-B8 | implementation_gap | CD+Tests | resolved | The PRD recovery path says "read again" re-reads run state and events, but it re-read only the run view. Fixed: the action resets the journal stamp and polls. Adapter test: a new line is announced by "read again" without a timer tick. | none |
| CR-B9 | implementation_gap | CD+Tests | resolved | `boundedCode` can return `resource_denied`, `source_changed`, `timeout` and `resource_limit`, but the catalog had no text for them, so the pane showed raw keys. Fixed: de and en texts added, and the four codes are now in `COMPANION_UNREADABLE_REASONS`, so the catalog validator requires them in every locale. | none |
| CR-B10 | implementation_gap | CD+Tests | resolved | PRD M1 and AC-007 include the terminal, but the terminal text showed no preview. Fixed: the first three preview lines appear beneath the material line. Unit test CR B10 in `claude-companion-test.js`. | none |
| CR-C1 | evidence_gap | evidence_obligation | resolved | The test comparing the companion's chat-language rule with Core's (SCN-008, including no repair of an invalid configuration) was dropped in the rewrite. It is restored in `claude-companion-test.js` for null, de, de-AT, fr and DE, plus the three invalid configurations. | none |
| CR-C2 | implementation_gap | CD+Tests | resolved | The follow-up regression SCN-020: the objective line came from the status card's run title ("UR: …") and could show a template text. Fixed: the run view carries `objective` only for an authored objective (inventory `title_source: objective`), and the companion shows only that. Unit test CR C2 in `companion-run-view-test.js`. | none |
| CR-C3 | implementation_gap | CD+Tests | resolved | `run-view --run` accepted any value, for example `../../etc`, and reported an evaluated run for it. Fixed: an id outside `RUN_ID_PATTERN` is a usage error (exit 1, no output). `run-view-command-test.js` covers four malformed ids. | none |
| CR-C5 | evidence_gap | evidence_obligation | resolved | The write-boundary scan in `packages/mcp-server/test/safety.test.js` did not list `appendFileSync`, so the journal's append went unchecked. Fixed: the symbol is scanned, and the journal is declared with `renameSync`, `mkdirSync` and `appendFileSync`. `test:safety` passes. | none |
| CR-C6 | evidence_gap | evidence_obligation | resolved | Main's check that German views show no English-only catalog copy was reduced to four literal words. Restored: German and English companion keys must agree, and at least 25 text fields of nine German views are compared with every English-only value. | none |
| RV-01 | implementation_gap | CD+Tests | resolved | The single captured read of the first CIR-01 correction failed as a whole on a concurrent write (19 of 20 reads under a 50 ms rewrite loop, reproduced by the follow-up reviewer); the companion parsed `unavailable` as a store diagnosis and replaced its last good view, and `pollEvents` dropped `approval_recorded`/`run_completed` events it could not confirm. Corrected: one snapshot per read (inventory, each run) with up to three attempts on `source_changed` (`captured`, `CAPTURE_ATTEMPTS`); transient store reasons keep the last good view stale (`TRANSIENT_STORE_REASONS`); durable events wait for a fresh view (`session.unconfirmed`); a view in which a run was read during a change keeps the last good view as well (found by the RV-1 probe, `evidence/CD_TESTS-probe-rv1-01.md`). Tests: `companion-run-view-test.js` "RV-1", `claude-companion-test.js` transient store cases, `claude-companion-adapter-test.js` "RV-1"; each red with the previous behavior restored | none |
| RV-02 | implementation_gap | CD+Tests | resolved | A `ControlReadError` of one run poisoned the single snapshot, and the run inventory itself opened registered documents through its gate observation. Corrected: each evaluated run reads in its own snapshot, and the inventory is read with its owner's new `observe: false` option, which skips the observation the run view does not use. Test "CIR-01/RV-2": with a PRD registered as `docs/notes.md` only that run shows `resource_denied`, the other run stays evaluated; red on the single-snapshot version (whole store unavailable) and on the uncaptured version (outside document evaluated) | none |
| RV-03 | implementation_gap | CD+Tests | resolved | `captureControlScope` refuses a linked root, while MCP canonicalizes its target with realpath and the journal keeps junction spellings (CR-A6). Corrected: the root is resolved with `realpathSync` before the capture; the view keeps the caller's spelling. Test "RV-3/RV-5": a junction root yields the same runs as its target; red on the single-snapshot version | none |
| RV-04 | implementation_gap | CD+Tests | resolved | An invalid `chat_language` showed every evaluated run as `read_failed`. Corrected: `boundedCode` maps the configuration owner's codes (`configuration_invalid` to `control_invalid`, `control_layout_unsupported`). Test `run-view-command-test.js` "CIR-05" asserts `control_invalid`; red with the mapping removed | none |
| RV-05 | implementation_gap | CD+Tests | resolved | A nonexistent `--dir` gave `unavailable/read_failed` after the capture change; before it gave no control folder. Corrected: a missing root reports `no_control` again. Covered by test "RV-3/RV-5" | none |
| RV-07 | implementation_gap | CD+Tests | resolved | `normalizeRoot` stripped `P:\` to `P:`, which its drive-letter rule no longer matched, so the comparison kept case unlike Core's `sameRoot` on win32. Corrected: drive roots and UNC roots are lowercased. The root matrix in `claude-companion-test.js` now includes `P:\` and `P:`; red with the previous rule | none |

## Reviewer Observations Not Adopted

| Observation | Why not adopted |
|---|---|
| A3: the journal records the outcome before a later reply substitution | Generation path: since CR-A2 the facade journals the `generation_result_limit` failure as `effect_unknown`, so the human sees both the outcome and the uncertain delivery. Direct server: the journal records the executed outcome, and a `resource_limit` replacement of an oversized reply is a delivery failure the tool reply reports. |
| A4: `write_rejected` also covers owner-reported rejections such as `stale_revision` | A failed write with a known effect wrote nothing, which is what "write rejected" means in PRD AC-006. The parenthesis "(not dispatched)" separates it from effect unknown, and these entries are pane-only (P1). |
| A8: journaling runs synchronously before the reply | SD Risks: "Its write is synchronous append after the final result, with an upper size bound." The bound is one source of at most 128 KiB; measured 13 to 29 ms per full call including the journal. |
| B8 (part): a fresh install shows "events unavailable" until the first AGDF write | SDD-007 states it literally ("a missing or unreadable journal shows 'events unavailable'"). The hint clears with the first journaled outcome. |
| C3 (part): a well-formed but unknown `--run` id returns an entry with `listed: false, valid: null` | Requested ids outside the inventory are evaluated for their card by design (SCN-002, for example behind an unsupported layout). The entry is flagged, and the companion ignores unlisted entries. |
| RV-6: the captured read is about seven times slower than the uncaptured one | The approved design requires the captured read (T-002, SD section 4). Measured on this repository's store: 0.70 to 0.83 s per in-process view, below the uncaptured 1.3 to 1.4 s per process call accepted under C2, which included process start; the companion's 10 s process budget is unchanged |
| RV nit: a rejecting host clock makes `readSnapshot` reject | `refresh` catches it and records the read as failed with reason `unavailable`, which keeps the last good view stale; no unhandled path remains |

## Verification

| Check | Result |
|---|---|
| `node packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js`, `claude-companion-integrity-test.js`, `node --test packages/cli/scripts/claude-companion-parity-test.js` | pass |
| `node --test packages/core/test/companion-run-view-test.js` (9), `companion-events-test.js` (7), `companion-host-neutral-test.js`, `status-card-golden-test.js`, `packages/cli/scripts/run-view-command-test.js` | pass |
| `node packages/mcp-server/test/companion-journal.test.js` (facade legacy, facade modern, plugin generation, direct server, facade-thrown failure) | pass; red without the CR-A2 line |
| `node packages/mcp-server/test/safety.test.js` | pass |
| `node packages/cli/scripts/plugin-mcp-runtime-test.js` | pass; CR-A1 red without the inspector change |
| `package-contents-test.js`, `cli-modularization-test.js` | pass |
| Full re-verification: compatibility record, every `verify:ci` stage on its own, every `cli-smoke` step on its own, `wrapper-smoke`, `pages-install`, `pages` | pass on Windows (win32), 2026-11-06: compatibility record ok; all 23 `verify:ci` stages ok (incl. `host-compatibility`, `transactions`, `archives`); 77 of 78 `cli-smoke` steps ok; `wrapper-smoke`, `pages-install`, `pages` ok. The one failing step, `test:run-command-flow`, fails only in `packages/core/test/project-initialization-test.js` cases 18 and 29 with `EPERM` on `symlink` (this Windows account cannot create file symlinks). That test and its owner are unchanged by this run. The four preview tests that the `&&` chain skipped after the failure were run on their own and pass. |
| Follow-up delta (CIR-01 to CIR-06, RV-01 to RV-07): targeted tests, red checks and the full targeted re-verification | pass on Windows (win32), 2026-11-06: the 30 targeted checks and the companion re-run listed in `evidence/CD_TESTS-input-02.md`, each correction with its red check; RV-1 probe in `evidence/CD_TESTS-probe-rv1-01.md` (single capture without retry 14 of 20 failed; corrected view never unavailable, 15 of 20 complete, the other 5 now keep the companion's last good view). The full `packages/mcp-server` suite is assigned to PR CI before merge |

## Missing Evidence

- T-013, the native check in the Claude desktop app with screenshots and measured refresh time, needs the owner. In particular, the background first read (CR-B5) and the root follow-up (CR-B3) are verified against the adapter's fake host only.
- CR-A5 is verified through Core's effective-binding rule and the existing drift checks, not by a run with an applied source revision.

## Risks

- Each companion run-view call costs 1.3 to 1.4 s on this repository's store (C2, accepted by the owner).
- Uncertain-outcome warnings now stay until the run records a later operation. A run that is never touched again keeps the warning until the session ends.

## Required Next Step

Re-record the Clean Implementation Review for the corrected tree; QA through `qa-gate` once the open TP Review findings (TPR-01 to TPR-03) are resolved.
