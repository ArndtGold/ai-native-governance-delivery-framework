# T-013 Native Check: Claude Desktop App On Windows 11 (second version, after the F2 correction)

- run: run-d2818184-27fc-40ae-9195-70d080d3e926
- task: T-013 (TP SCN-005, PRD AC-002 live check; QA deviation TPR-01)
- date: 2026-11-06, 14:20 to 18:26 local time (CET); toast check C6 on 2026-11-07, 08:51 to 08:55; SCN-005 re-check on 2026-11-07, 10:32 to 10:34
- supersedes: `evidence/T-013-NATIVE_CHECK-01.md` (kept unchanged because the TP source revision `fbfbe051` cites it by digest)
- host: Claude desktop app (Code tab), Windows 11 Enterprise 10.0.26200, Node v22.22.3, model Opus 5.5
- build: AGDF 0.30.0 built locally from the uncommitted working tree of branch `feat/companion-core-run-view`; installed outside the packaged app via `explorer.exe` and `npm run install:claude` (before 14:21, 14:32 and 15:24 on 2026-11-06; 09:28 on 2026-11-07 with the F2 correction)
- method: fresh Claude sessions per phase; the parent session captured the session windows with PrintWindow (`C:\Workspace\agdf-t013-tools\capture-window.ps1`, `capture-loop.ps1` every 2 s); event times come from the MCP journal `companion/events.jsonl` in the plugin data root
- screenshots and timings: `evidence/T-013-native-check/` (file list with SHA-256 at the end)
- observer: Claude agent (parent session); accountable owner Arndt Gold drove attempt 2 directly

## Result

- decision: pass
- summary: The companion runs natively in the desktop app. Run state, gate bar, figure states, event lines, review facts, the drift warning and the P1 toasts appear as specified, 0.6 to 6.8 s after the underlying change (toasts 3.4 to 4.6 s). Toasts are drawn in the main window only, not in a pop-out session window. After the F2 correction the archived legacy store shows "189 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt" (AC-002, SCN-005). The findings F1, F2 and F5 were planned by the TP source revision `fbfbe051` of 2026-11-07 and are covered by the renewed CD+Tests, CR and Clean Implementation Review; the wording points F4 are a follow-up.

## Attempts

1. Attempt 1 (14:21, first local install shortly before): the host refused the whole companion hooks module. Message in the transcript: `hooks module did not load: ...\companion\register.mjs:138: $.process is used as a value (a noun of $ bound, passed or read); $ is always spelled $.noun.event(...) at the call site ...` (screenshot 01). `claude plugin validate` on the installed plugin reported the same error. No pane was drawn.
2. Attempt 2 (14:33, build 14:32 with fix F1): `claude plugin validate` passed and the pane was drawn in the current project (screenshot 02). The owner then drove phases B and C in that session without captures and asked for the run-id cleanup F5, which the session implemented and installed at 15:24.
3. Attempt 3 (18:05 to 18:26, build 15:24): phases A (owner session in the main window), B and C with captures; phase D measured by the parent session.
4. Toast check C6 (2026-11-07, 08:51 to 08:55, build 15:24): the live session shown as split view in the maximized main window, captured every 1.1 s; the session restored the recorded UR bytes, waited 40 s and prepared and delivered the UR presentation again.
5. SCN-005 re-check (2026-11-07, 10:32 to 10:34, build 09:28 with the F2 correction): a fresh session in the disposable legacy project; the parent captured its window once the session had confirmed readiness.

## Observations

| phase | setting | observed (German UI text verbatim) | evidence |
|---|---|---|---|
| A | repository, attempt 2, no run selected | figure "bereit"; "Kein Run zugeordnet"; "In dieser Sitzung hat sich kein Run geändert. Wähle einen offenen Run, um ihn hier zu zeigen."; "Ereignisse nicht verfügbar; der Run-Status wird weiter gelesen." (journal file not yet created); "1 offene Runs" with run-d2818184; footer "Stand 14:32"; status line "AGDF · bereit" | 02 |
| A | repository, attempt 3, run-d2818184 selected | figure "wartet auf Freigabe", "Freigabe ausstehend: Nutzerabnahme"; gate bar "✓UR ✓PRD ✓SD ✓TP ✓CD+Tests ✓QA ●UAT ○OR"; "Von dir ausgewählt"; objective with "Mehr"; next step "Den verlinkten Entwurf prüfen und entscheiden, ob du ihn freigibst, überarbeiten lässt oder ablehnst."; "1 von 1 offenen Runs" with previous/next buttons; status line "AGDF · UAT · wartet" | 03 (pane cropped from the owner's window) |
| B | disposable copy of the archived v2 store | figure "bereit"; "Run-Status nicht lesbar: Aufbau des Kontrollordners nicht unterstützt"; status line "AGDF · nicht lesbar"; "Keine offenen Runs" not shown; no count of unreadable runs | 04 |
| B (re-check) | same legacy store, build 09:28 with the F2 correction | figure "bereit"; "189 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt"; status line "AGDF · nicht lesbar"; "Keine offenen Runs" not shown; footer "Stand 10:32"; the installed runtime returns `store.run_folders` 189 | 15 |
| C0 | live project, run-4ee7b956 at UR | figure "wartet auf Freigabe", "Freigabe ausstehend: Nutzeranforderungen"; gate bar "●UR"; status line "AGDF · UR · wartet" | 05 |
| C1 | material.stage seal | event "18:18 Material übertragen (Nutzeranforderungen)" without run id; review facts "UR: 1234 Bytes, sha256:6d4b29fe… · Quelle nicht bestimmbar – bitte die Vorschau prüfen" with the preview "# UR: T-013 Live-Ereignisse" | 06 |
| C2 | step.record ur | pane entries cleared at the next main-loop turn (18:20:11), then "18:20 Nutzeranforderungen erfasst"; origin "In dieser Sitzung geändert"; review facts "UR: – Bytes, sha256:6d4b29fe…" | 07 |
| C3 | presentation.prepare and deliver | "18:21 Freigabe angefragt für Nutzeranforderungen"; origin later "Im Chat genannt"; no toast visible in the pop-out window | 08 |
| C4 | step.record with a stale revision | "18:23 Aufruf abgelehnt (stale_revision)" in the pane only, as P1 requires | 09 |
| C5 | plain file edit of the recorded UR | warning "UR wurde nach der Erfassung geändert (erfasst sha256:6d4b29fe…, jetzt sha256:dbd9ee78…). Aus der aktuellen Datei neu erfassen oder die Datei wiederherstellen."; next step "Unaufgezeichnete Bytes sichern, vertrauenswürdigen Zustand wiederherstellen und die Änderung beim aktuellen Eigentümer erfassen."; figure "läuft" while the turn ran, "blockiert" at its end; status line "AGDF · UR · blockiert"; no toast visible (neither the drift toast nor the state notice) | 10, 11 |

| C6 | main window, split view, UR bytes restored | drift warning gone, figure "wartet auf Freigabe", status line "AGDF · UR · wartet"; toast "agdf: Wartet auf Freigabe: Nutzeranforderungen" at the bottom right of the main window | 12, 14 |
| C6 | main window, presentation.prepare and deliver again | event "08:53 Freigabe angefragt für Nutzeranforderungen"; toast "agdf: Freigabe angefragt für Nutzeranforderungen" at the bottom right of the main window from 08:53:37.7 to 08:53:43.3 | 13, 14 |

No event line or toast text carried the run id after F5.

## Refresh Time

Latency from the journal entry (or the file modification for C5) to the first capture showing the change; the bound is the previous capture without it (captures every 2.05 s).

| step | change at | previous capture | first capture with change | latency |
|---|---|---|---|---|
| C1 material_staged | 18:18:42.777 | 18:18:43.430 | 18:18:45.478 | 0.7 to 2.7 s |
| C2 document_recorded | 18:20:31.268 | 18:20:31.846 | 18:20:33.896 | 0.6 to 2.6 s |
| C3 approval_requested | 18:21:57.234 | 18:21:58.083 | 18:22:00.133 | 0.8 to 2.9 s |
| C4 write_rejected | 18:23:51.835 | 18:23:54.920 | 18:23:56.967 | 3.1 to 5.1 s |
| C5 drift (UR.md modified) | 18:24:45.655 | 18:24:50.356 | 18:24:52.418 | 4.7 to 6.8 s |
| C6 drift cleared, state toast (UR.md restored) | 08:52:12.740 | 08:52:32.547 | 08:52:33.668 | 19.8 to 20.9 s (no journal event; found by the 30 s run-file check) |
| C6 approval_requested toast | 08:53:33.096 | 08:53:36.542 | 08:53:37.682 | 3.4 to 4.6 s |

Phase D, wall time of the `run-view` command the companion starts per refresh (5 runs each, timeout 10 s, `phase-d-run-view-timings.txt`):

| project | median | range | exit | store |
|---|---|---|---|---|
| repository (2 runs) | 2.78 s | 2.74 to 3.57 s | 0 | ok |
| disposable legacy store | 1.24 s | 1.17 to 1.35 s | 2 | unavailable, control_layout_unsupported, diagnosis counts 0 |
| live project (1 run) | 1.29 s | 1.24 to 1.41 s | 0 | ok |

## Findings

| id | severity | finding | status |
|---|---|---|---|
| F1 | high | The host refuses a hooks module that passes a `$` noun as a value; `register.mjs` passed `$.process` to `readSnapshot`, so the companion never loaded natively. The test doubles accepted it. | fixed: call-site wrapper `processes($)`; planned as T-014/SCN-023; parser-based checks of the `$` spelling and the process call sites (`packages/cli/scripts/companion-host-spelling.js`, red against the old code); `claude plugin validate` passes on the generated and the installed plugin; every later session loaded the module |
| F2 | medium | AC-002: for the unsupported legacy layout the companion showed the reason but no count; `run-view` did not enumerate runs of an unsupported layout (`diagnosis.counts.unreadable` 0). | fixed: TP T-004/SCN-004 revised on 2026-11-07, `store.run_folders` counted with the discovery rule `runFolderEntries`; natively verified on 2026-11-07 (screenshot 15) |
| F3 | low | PRD P1 toasts are drawn by the host in the main window (bottom right) only; a session in a pop-out window shows none of its toasts (approval requested, digest mismatch, blocked notice were absent in attempt 3). In the main window the state toast and the approval-requested toast appeared without run id (C6). The drift toast itself was not re-checked in the main window. | host behaviour, documented; no code change |
| F4 | low | Wording: "Ereignisse nicht verfügbar" before the first journal entry exists; "1 offene Runs" (text already on main); "UR: – Bytes" after document_recorded; raw reason code "stale_revision". | open, cosmetic |
| F5 | n/a | Owner-requested change during attempt 2: event lines and toasts name no run for the shown run, another run by objective or short id (`events.ofRun`), notice toasts without run id; MCP UI rebuilt, compatibility evidence re-recorded. | planned as T-015/SCN-024 by the TP source revision of 2026-11-07; reviewed and verified; natively seen in C6 |

## Consequence For The Run

Update of 2026-11-07: the owner chose a TP source revision (`fbfbe051`, proposal `evidence/TP-revision-proposal-02.json`); TP revision 60 was approved; Brownfield Analysis, CD+Tests (`evidence/CD_TESTS-input-04.md`), CR (`evidence/CODE_REVIEW-input-05.md`, with an independent delta review) and Clean Implementation Review (`evidence/CLEAN_IMPLEMENTATION_REVIEW-input-04.md`) were recorded again for the final code. The paragraphs below describe the state before that revision.

### State Before The Revision

- TP sufficiency names "changed code after the check" as a re-check trigger. F1 and F5 changed `register.mjs`, `events.mjs`, `view.mjs`, `notice.mjs`, `agdf-interaction-locales.json`, both companion tests and the compatibility evidence after the QA approval; CD+Tests, CR and QA do not cover them.
- Checks run on the final code so far: `npm --prefix packages/cli run test:claude-companion` (4 of 4 stages green after F1; the attempt-2 session reported green after F5 together with `interaction-catalog-test`, `operational-localization-test`, `payload-budget-test`, `package-contents-test`, `test:host-compatibility` and `compatibility:check` pass), `claude plugin validate` pass.
- F2 is an acceptance gap against approved PRD content (AC-002); it needs an owner decision (fix in this run, accept as deviation, or route to a follow-up). F3 is a host limitation of pop-out windows and needs no code change.

## Evidence Files

| file | bytes | sha256 |
|---|---|---|
| 01-attempt1-hooks-module-refused.png | 14632 | e52028e0802c4eaecf95703c7d9414433bb6caa5ca1288bef21faefbf70d4fa5 |
| 02-attempt2-current-project.png | 104053 | da9635e9a5cb61b31fcab31995b1e9f9d0fa81e699d84ddcd95fd928cedb3c29 |
| 03-attempt3-run-d2818184-uat-pane.png | 41776 | 80aacfc13e8dc8ee8f570a26545adcd5e321310887b922624623024c89a424d9 |
| 04-attempt3-B-legacy-store.png | 110599 | 66beaa68fa83b23b60dc4072722d95f4f8250c28e9710172fad3678b8d8725d4 |
| 05-attempt3-C0-live-start.png | 110132 | cdc74c374af819e9b9cd423c7f411f3a2c05f34a268eddb4eb4f6c740e0b095c |
| 06-attempt3-C1-material-staged-181845.png | 105962 | 73e671e5d2d65bb10fc8f858be72d9357b16743e5c767cf8aa4d1d959e95ee65 |
| 07-attempt3-C2-document-recorded.png | 112072 | 406642d2ad9829aad6e5702944658b8d7574c3307ead15f27da1b9309e57e4c1 |
| 08-attempt3-C3-approval-requested-182200.png | 102603 | 01bab315d02d8236d50c643281c42f2cf83708b199b9317d56189e42ed4ad863 |
| 09-attempt3-C4-write-rejected.png | 80822 | 78625d204f41601010a3db2ab56e14c2952fffc39658d76e782606b7a3e8c6ec |
| 10-attempt3-C5-drift-during-turn-182452.png | 116564 | b02fb471f73b5528659b8cb7c74b0dfb1377c18df4bd35f60a49184483160bf8 |
| 11-attempt3-C5-drift-blocked-after-turn.png | 124677 | cb9cb1312e9a9a9c5a7420fecb0a4dbc410eb2d26a14fdeba68e8aea7f6fc7e8 |
| 12-attempt3-C6-main-window-state-toast-085243.png | 161335 | c6fa5c90b808cb56aa33668f8a1bc649e311524eb8aefe57d9f31731dd449766 |
| 13-attempt3-C6-main-window-approval-toast-085339.png | 165466 | 7b10867ce66cabde03388860d5f18d19542b84a06617743fac50b09d4f562366 |
| 14-attempt3-C6-toast-region-sheet.png | 104587 | 54d89364b61af6de8c471b3debe313a2837c6eb259c984c6997d5e1af097dd69 |
| 15-attempt4-scn005-legacy-store-count.png | 97664 | 5501f2191346d14947691f093048c792b786351544386f4a76e7272e38ce5da2 |
| phase-d-run-view-timings.txt | 2229 | 6ed5b4ca7115b864727357a239a1c26f39efe2f8d2cda70780dfd398165b1d57 |
