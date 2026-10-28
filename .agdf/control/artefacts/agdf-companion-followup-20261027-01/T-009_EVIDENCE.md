# T-009 Evidence: Native and Live Checks

- run_id: `agdf-companion-followup-20261027-01`
- task: T-009 (approved TP revision 11)
- date: 2026-10-27, 17:11 to 18:55 local time
- host: Claude desktop app (Code tab), Windows 11 Enterprise 10.0.26200, desktop engine 2.1.308; Claude Code CLI 2.1.302 for `claude plugin validate`, `claude plugin test` and the installer
- observers: Claude Code implementing agent (window captures through DPI-aware `PrintWindow`, UI Automation, file hashes); Arndt Gold (sessions in the live folder, audibility)

## Native (SCN-025)

- `claude plugin validate packages/cli/generated/plugins/agdf`: passed without warnings, before and after the live-finding fix (hooks, `.catch`, calls and env reads as listed in `T-002_T-006_EVIDENCE.md`).
- `claude plugin test` on a scratch copy of the generated runtime plugin: 5 of 5 passed before and after the fix; after the fix test 1 also asserts that two reads of the same state set the status line twice.

## Installation

- This branch's build was installed into the real Claude configuration outside the desktop app package (`explorer.exe` on `probe-results/f9a/run.cmd`, after the fix `probe-results/f9b/run.cmd`): `result: success`, `plugin.operation: update`, `agdf@agdf` 0.20.2 enabled from `%LOCALAPPDATA%\agdf\marketplaces\agdf\plugins\agdf`, `plugin:agdf:agdf` MCP connected; the installed `companion/register.mjs`, `notice.mjs`, `locales.json` and `gate-bar.mjs` are byte-identical to the generated ones.
- Sessions started after the installation load the new build; sessions started before keep the build they loaded.

## Live Observations

Live folder `C:\Workspace\agdf-companion-followup-live` (config `chat_language: de`, copies of this run's `RUN_STATE.md` at CD+Tests and of the open quick-task run `quick-task-closeout-status-20261002-01`); folder without control `C:\Workspace\agdf-companion-followup-plain`. Screenshots under `live/`:

| Screenshot | Scenario | Observation |
|---|---|---|
| `00-before-cd-tests-no-mark.png` | before | The previously installed companion ("AGDF-Begleiter") shows this run at CD+Tests as `✓TP ○QA` with no current mark |
| `01-probe-toast-and-status-line.png`, `02-probe-status-line-cleared.png` | T-001 | Probe toast bottom right, status line in the footer without a pane, cleared again |
| `03-installed-build-brand-and-button-rows.png` | SCN-012, SCN-019 | A session started after the installation: title "AGDF Companion", second button row "Meldung aus" / "Ton an", read time on its own line, no wrapping (SCN-012 layout) |
| `04-build-phase-baut-cd-tests.png` | SCN-002, SCN-005 | Live session, this run selected: figure with hammer and bricks in the accessory region, not covering the figure; "baut"; "In Arbeit: Implementierung und Tests"; bar `✓✓✓✓●○○○ CD+Tests` (condensed, see LT-F02); status line "agdf AGDF · CD+Tests · baut" |
| `05-toast-status-line-wartet-qa.png` | SCN-010, SCN-015 | After the live copy moved to a pending QA approval: toast "agdf: agdf-companion-followup-20261027-01 wartet auf Freigabe: Qualitätssicherung"; "wartet auf Freigabe"; status line "agdf AGDF · QA · wartet" |
| `06-quick-task-bar-compact-delivery.png`, `10-popout-quick-task-status-line.png` | SCN-007 | Quick-task run: bar `✓UR ●Compact Delivery`, "Als Nächstes: Quick Task Execution", status line "agdf AGDF · Quick Task Execution · läuft" |
| `07-no-control-folder-german-no-status-line.png` | SCN-022 | A session started by the agent in the folder without control: "Kein AGDF-Kontrollordner in „agdf-companion-followup-plain“.", "Geprüfter Projektordner: …", "bereit", German buttons; no status line (LT-F01) |
| `08-status-line-after-text-change.png` | LT-F01 | After a run appeared that counts as changed in that session, the status line "agdf AGDF · CD+Tests · baut" appeared |
| `09-pane-closed-status-line-stays.png` | SCN-015 | The panel closed through its own close button (UI Automation invoke, no mouse movement); the status line "agdf AGDF · CD+Tests · baut" stays |

- SCN-017 (byte identity): `RUN_STATE.md` hashes in the live folder at 17:11:04 and at 17:21:59 (just before the agent's first deliberate edit of a fixture copy) are equal (`7D1FFC62…ACFFCED`, `A2A21234…CE42577`); the companion read them throughout. The only later changes were the agent's own fixture edits.
- SCN-012 (sound): T-001 played a generated clip through `$.audio.play`, which resolved without being audible to the owner. In live round C the sound switch stayed off (button label "Ton an", state file `sound: false`), so no companion chime could play; the owner's report of a tone in that window cannot be attributed to the companion. Sound playback by the companion on Windows is therefore not observed; the automated suites and the native test show the call with `audio/wav` and gain 0.35.
- Turn overlay, run switching without a toast and the hidden-pane reading are covered by the automated suites; live they were seen in passing (the live session showed "1 von 2 offenen Runs" and the stepping row).

## Live Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| LT-F01 | implementation_gap | CD+Tests | resolved | `07-no-control-folder-german-no-status-line.png` and `08-status-line-after-text-change.png`: the desktop dropped the status line set during session start; the adapter set it again only on a changed text, so an idle session never showed it. Fixed in `register.mjs` (`announce` sets the line after every applied read, unchanged text included); the adapter suite asserts the repeated set after a post-turn read, the native test after two reads of the same state (5 of 5), the corrected build is installed (`probe-results/f9b`, `register.mjs` byte-identical). The owner waived a further live re-check on 2026-10-27 („Keine weitere Live-Prüfung; Tests und nativer Nachweis reichen.“) | none |
| LT-F03 | evidence_gap | evidence_obligation | resolved | AC-005 requires the sound result to be reported as observed, including "not audible": the T-001 probe clip resolved without being audible on Windows, the companion's chime was not observed live (switch off during round C), the call itself is evidenced by the adapter suite and the native test; `INSTALL.md` states that the chime stays silent on Windows | none |

## Observation For UAT

- LT-O01: At the default docked panel width the body has fewer than the 39 columns of the full structured bar, so the bar shows the condensed form `✓✓✓✓●○○○ CD+Tests` (`04-build-phase-baut-cd-tests.png`, `05-toast-status-line-wartet-qa.png`); a wider panel shows the full bar, and the previous seven-gate bar of 29 columns fitted the default width. PRD AC-001 (the full bar fits 40 columns, the condensed form applies below the full width) is met as written. Owner decision at UAT: accept the condensed form at the default width, or ask for a shorter mark in a follow-up.
