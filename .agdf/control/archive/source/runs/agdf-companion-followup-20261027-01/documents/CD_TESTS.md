# CD+Tests: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Decision: pass
Status: `pass`

## Decision

- decision: pass
- scope: approved TP tasks T-001 to T-009 and scenarios SCN-001 to SCN-026 (TP revision 11), realizing SDD-01 to SDD-12 (SD revision 9) for AC-001 to AC-012 (PRD revision 7)
- run_id: `agdf-companion-followup-20261027-01`
- recorded: 2026-10-27
- branch: `claude/festive-mcnulty-c824c7`, based on `main` ce127553

## Task Status

| task_id | Status | Evidence |
|---|---|---|
| T-001 | done | `T-001_HOST_PROBE.md`: toast and status line drawn on the Windows desktop (status line with no pane open), `$.settings.read({ key: "language" })` returned `de`, `$.audio.play` resolved but was not audible; probe mod removed; no return to SD |
| T-002 | done | `run-state.mjs` route and placeholder rule, `gate-bar.mjs` paths, marks and `CD+Tests` mark (`T-002_T-006_EVIDENCE.md`) |
| T-003 | done | `state.mjs` mood `baut`, `figure.mjs` build figure, bounds, still pose and terminal face |
| T-004 | done | new `notice.mjs`: observation, detector, toast and status texts, chime |
| T-005 | done | `register.mjs`, `persistence.mjs`, `localization.mjs`, `locales.json`, integrity file list; live-finding fix LT-F01 (status line set after every applied read) |
| T-006 | done | logic, adapter and integrity suites extended; three mutations caught |
| T-007 | done | `T-007_T-008_EVIDENCE.md`: `build:prepare` passed, compatibility record and check 56/0 (final fingerprint `e36cc0a7fa3ac293c1efad7d714b8106e92707b32fa7be98d6fea3fc305b33e3`), four Windows CI lanes passed, Copilot budget and eval fingerprints unchanged |
| T-008 | done | `INSTALL.md` companion section updated incl. the live evidence of 2026-10-27 |
| T-009 | done | `T-009_EVIDENCE.md`: native validate and test 5 of 5 before and after the fix; installed branch build; live screenshots `live/00` to `live/10`; byte identity; LT-F01 resolved, LT-F03 resolved, observation LT-O01 for UAT |

## Scenario Results

| scenario_id | Result | Evidence |
|---|---|---|
| SCN-001 | pass | logic suite: CD+Tests mark per phase, 39 of 40 columns, condensed form below |
| SCN-002 | pass | `live/04-build-phase-baut-cd-tests.png`: build phase shown with the CD+Tests mark current (condensed at the default panel width, observation LT-O01) |
| SCN-003 | pass | logic suite: `baut` rules, precedence, turn overlay, labels |
| SCN-004 | pass | logic suite: hammer and brick bounds, still pose, terminal face |
| SCN-005 | pass | `live/04-build-phase-baut-cd-tests.png`: build figure inside the accessory region without covering the figure; still pose covered by the logic suite and the predecessor's live check of the pose switch |
| SCN-006 | pass | logic suite: route and path parity with `modeSliceDecision` and `evaluateGateCheck` for six routes, active and completed, plus five format variants |
| SCN-007 | pass | `live/06-quick-task-bar-compact-delivery.png`, `live/10-popout-quick-task-status-line.png` |
| SCN-008 | pass | logic suite: 14-step detector sequence |
| SCN-009 | pass | adapter suite: exactly one toast per transition, none for baselines, switching, equal reads or turns |
| SCN-010 | pass | `live/05-toast-status-line-wartet-qa.png` |
| SCN-011 | pass | logic and adapter suites: defaults, upgrade, switches, sound only with a toast, chime format |
| SCN-012 | pass | `live/03-installed-build-brand-and-button-rows.png`: both button rows without wrapping; sound reported as observed (not audible on Windows, LT-F03 resolved) |
| SCN-013 | pass | logic suite: status texts per state and locale |
| SCN-014 | pass | adapter suite: status set after reads (repeated after the LT-F01 fix), kept with the pane hidden, cleared on switch-off |
| SCN-015 | pass | `live/09-pane-closed-status-line-stays.png`; status line in the footer in `live/04`, `live/05`, `live/06`; terminal surface covered by the native test's terminal tree |
| SCN-016 | pass | adapter suite: write surface |
| SCN-017 | pass | `T-009_EVIDENCE.md`: live-folder hashes equal from 17:11:04 to 17:21:59 while the companion read them |
| SCN-018 | pass | logic suite: one brand in every locale |
| SCN-019 | pass | `INSTALL.md` diff; `live/03` title |
| SCN-020 | pass | logic suite: placeholder parity and fresh canonical run without objective line |
| SCN-021 | pass | logic and adapter suites: fallback order and name mapping; native test documents that the 2.1.302 test engine has no `$.settings` |
| SCN-022 | pass | `live/07-no-control-folder-german-no-status-line.png`: German panel text in a folder without control |
| SCN-023 | pass | adapter suite: failing and missing channels |
| SCN-024 | pass | `T-007_T-008_EVIDENCE.md`: generators, compatibility, integrity list, CI lanes |
| SCN-025 | pass | `T-002_T-006_EVIDENCE.md`, `T-009_EVIDENCE.md`: `claude plugin validate` passed, `claude plugin test` 5 of 5 |
| SCN-026 | pass | `INSTALL.md` diff separating live, native and automated evidence |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| LT-F01 | implementation_gap | CD+Tests | resolved | Live: an idle session showed no status line because the desktop dropped the set during session start (`live/07`, `live/08`); `register.mjs` now sets the line after every applied read; adapter suite and native test assert the repeated set; corrected build installed (`probe-results/f9b`); owner waived a further live re-check on 2026-10-27 | none |
| LT-F03 | evidence_gap | evidence_obligation | resolved | AC-005 requires the sound result as observed: not audible in the T-001 probe on Windows, the companion's chime not observed live, the call evidenced by the adapter suite and the native test, `INSTALL.md` states the Windows limit | none |

## Design Note

SDD-07 says the adapter sets the status line after every applied read "when the text changed". The LT-F01 fix sets it after every applied read, unchanged text included, because the desktop host dropped the first set. The visible behaviour of AC-006 is unchanged; the change only removes the de-duplication. CR and QA assess whether this needs an SD revision.

## Observation For UAT

LT-O01: at the default docked panel width the full structured bar (39 columns) condenses to `✓✓✓✓●○○○ CD+Tests`; a wider panel shows the full bar. AC-001 is met as written; the owner decides at UAT whether to accept this or to ask for a shorter mark later.

## Verification Commands

- `npm run test:claude-companion` (in `packages/cli`, after `node scripts/sync-package-assets.js`): logic, adapter and integrity tests passed on the final tree.
- `npm run build:prepare`: passed (64.4 s) on the final tree.
- `npm run compatibility:record` and `npm run compatibility:check`: 56 evaluated, 0 failed.
- `CI= node scripts/ci-plan.mjs --job windows-22-installation-part-2|-3, windows-22-packages-part-2|-4 --scope all --suite cli --published false`: all commands exit 0; `windows-22-installation-part-3` repeated on the final tree.
- `claude plugin validate packages/cli/generated/plugins/agdf` and `claude plugin test` on a scratch copy: passed, 5 of 5.
