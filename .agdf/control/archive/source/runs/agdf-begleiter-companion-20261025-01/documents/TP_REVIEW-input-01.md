# TP Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: revise
Status: `revise`

## Decision

- decision: revise
- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent
- basis: approved TP (T-001 to T-009, SCN-001 to SCN-023), SD (SDD-01 to SDD-11), PRD (AC-001 to AC-011), CD+Tests pass (`CD_TESTS-input-01.md`), Code Review pass after corrections (`CODE_REVIEW-input-02.md`), task evidence `T-001_HOST_PROBE*.md`, `T-002_EVIDENCE.md` to `T-009_EVIDENCE.md` and `live/`.
- summary: seven of nine tasks are fully done. T-003 and T-006 are partially done because of two implementation gaps. A full verification of the current tree is still missing.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | `T-001_HOST_PROBE.md`, `T-001_HOST_PROBE-02.md`: loading in an installed build; failure isolation of the SessionStart hook, MCP and dispatch with load-time and hook-time failures (SCN-013); `$.store` retained after uninstall led to the SD revision of SDD-07; the state file in the plugin data directory is removed on uninstall (SCN-017) | none | none |
| T-002 | fully_done | `T-002_EVIDENCE.md`; `scripts/public-plugin/manifest.js` adds `hooks` from the companion descriptor in the runtime profile only; `public-plugin-test.js` covers the declaration and its absence from the source manifest | none | none |
| T-003 | partially_done | Logic modules and `locales.json` (en, de) exist and were checked against 145 run states (`T-003_EVIDENCE.md`). Two gaps remain. (1) `run-state.mjs:10` accepts only the lifecycles `active` and `completed`, while the core reader accepts `active`, `completed`, `superseded` and `abandoned` (`packages/core/lib/control-state/run-state-parser.js:13`); a superseded or abandoned run is reported unreadable with reason `format`. Once parsed, `assignment.mjs:8` would count it as open, because it only excludes `completed`. (2) The missing-control message (`locales.json` `messages.noControl`, `view.mjs:29`) does not name the checked folder. | Parsing and closed treatment of superseded and abandoned runs; folder name in the missing-control message | TPR-F01, TPR-F02 |
| T-004 | fully_done | `T-004_EVIDENCE.md`; `register.mjs` with command, state file, turn events, timer, pane and catch paths; CR-F01 and CR-F03 to CR-F10 corrected and covered by the adapter suite (`CODE_REVIEW-input-02.md`) | none | none |
| T-005 | fully_done | `T-005_EVIDENCE.md`; generation into the runtime plugin only; integrity positive and negative checks; Copilot exclusion (SCN-015, SCN-016) | none | none |
| T-006 | partially_done | Logic, adapter and integrity suites registered as `test:claude-companion` and in the CI `installation` domain (`T-006_EVIDENCE.md`). The parity suite (SCN-005) has no superseded or abandoned fixture. The reader suite (SCN-009) does not check that the missing-control message names the folder. | Parity cases for superseded and abandoned runs compared with the core reader; reader and view checks for the folder name | TPR-F01, TPR-F02 |
| T-007 | fully_done | `T-007_EVIDENCE.md`: payload review recorded; fingerprints and compatibility evidence renewed; `npm run verify:ci` passed all 27 stages on the T-007 tree. After the CR corrections, payload, fingerprints and compatibility were renewed again (`CODE_REVIEW-input-02.md`). | `npm run verify:ci` on the tree after the corrections of this review | TPR-F03 |
| T-008 | fully_done | `T-008_EVIDENCE.md`; Claude section of `INSTALL.md` covers switching on and off, surfaces, version range, incompatible hosts and limits (SCN-023) | none | none |
| T-009 | fully_done | `T-009_EVIDENCE.md`: native validate and test (SCN-022); dated live desktop session with screenshots `live/01` to `live/11` (SCN-002, SCN-004, SCN-019); byte identity in `live/harness-ledger.json` (SCN-012) | The installed desktop build predates the CR corrections; a live spot check of the corrected build is planned before UAT | UAT live spot check |

## Summary

- fully_done: T-001, T-002, T-004, T-005, T-007, T-008, T-009
- partially_done: T-003, T-006
- not_done: none
- out_of_scope_changes: The AGDF core fix (Brownfield Analysis as an initiating phase of a source revision) is outside the TP. Its scope was decided by the owner: it ships in the companion pull request, with the CR-F11 mixed-version limit documented.
- risks: Real runs can carry the lifecycles `superseded` and `abandoned` (core-valid). Today the companion reports them as unreadable instead of treating them as closed. A user without the folder name cannot tell which project root the companion checked.
- required_next_step: Hand TPR-F01 to TPR-F03 to the QA gate. QA routes them back to CD+Tests.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | off / on, toggle and persistence | T-004, T-009 | `live/09-off-closed.png`, `live/10-on-again-still.png`, `live/11-new-session-auto-open-still.png` | fulfilled | none |
| AC-002 | on, assigned run at default width | T-006, T-009 | `live/03-laeuft.png` to `live/06-fertig.png` | fulfilled | none |
| AC-003 | on, run-derived state | T-003, T-006, T-009 | Four states visible in `live/03` to `live/06`; a core-valid superseded or abandoned run is shown as unreadable instead of being treated as closed | partial | implementation_gap |
| AC-004 | on, no run assigned / selected | T-003, T-006, T-009 | `live/01-no-run-real-repository.png`, `live/02-no-run-live-project.png`; superseded and abandoned runs are not excluded from the open runs once they parse | partial | implementation_gap |
| AC-005 | on, German panel | T-003, T-009 | All labels German in `live/03` to `live/06` | fulfilled | none |
| AC-006 | on, status unavailable | T-003, T-006 | The missing-control message does not name the checked folder (owner clarification of 2026-10-26) | partial | implementation_gap |
| AC-007 | all modes, read-only | T-004, T-009 | `live/harness-ledger.json`; no approval or continuation control in any screenshot | fulfilled | none |
| AC-008 | incompatible or failing host | T-001, T-006 | `T-001_HOST_PROBE-02.md` debug log and stream output | fulfilled | none |
| AC-009 | install and uninstall | T-001, T-005 | `T-001_HOST_PROBE.md` file listing | fulfilled | none |
| AC-010 | still pose, accessories | T-006, T-009 | `live/04-wartet.png`, `live/08-still-after-turn.png` | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-F01 | implementation_gap | CD+Tests | open | SDD-04 requires parity with the core reader (SCN-005), and the PRD treats only open runs as current. Core `run-state-parser.js:13` accepts `superseded` and `abandoned`; companion `run-state.mjs:10` rejects them as `format`, and `assignment.mjs:8` treats every non-`completed` lifecycle as open. The parity suite has no such fixture. | In CD+Tests, parse `superseded` and `abandoned` as valid, treat only `active` as open, never assign such a run, drop a remembered selection on it, and add parity tests with superseded and abandoned fixtures against the core reader |
| TPR-F02 | implementation_gap | CD+Tests | open | AC-006 and SCN-009 require a specific message for missing AGDF control. The owner clarified on 2026-10-26 that this message must name the checked folder. The clarification refines the approved message without changing scope or acceptance, so it is run evidence and needs no PRD revision. `locales.json` `messages.noControl` ("Kein AGDF-Kontrollordner in diesem Projekt.") and the `no_control` snapshot in `run-state.mjs:86` carry no folder. | In CD+Tests, carry the project root in the `no_control` snapshot, show its last path part in the en and de message with the full path as a hint in the panel and terminal text, and cover it in the reader and view tests |
| TPR-F03 | evidence_gap | evidence_obligation | open | `T-007_EVIDENCE.md` covers the T-007 tree. The run after the CR corrections is still in progress, and the corrections for TPR-F01 and TPR-F02 will change the tree again. | Run `npm run verify:ci` on the tree after the TPR-F01 and TPR-F02 corrections and record the result in the CD+Tests evidence |
