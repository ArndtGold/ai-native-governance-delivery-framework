# T-002 to T-006 Evidence: Implementation and Tests

- run_id: `agdf-companion-followup-20261027-01`
- tasks: T-002, T-003, T-004, T-005, T-006 (approved TP revision 11)
- date: 2026-10-27
- environment: Windows 11, Node v22.22.3, repository worktree `claude/festive-mcnulty-c824c7` based on `main` ce127553

## Changed Files

| Task | File | Change |
|---|---|---|
| T-002 | `plugins/agdf/host-templates/claude/companion/run-state.mjs` | `route` read from the Mode/Slice Decision by the core rule (`modeSliceDecision`); `isPlaceholderText` mirrors `isDecisionContentPlaceholder`; template objectives read as empty; `BUILD_GATES`, `isStructured` |
| T-002 | `plugins/agdf/host-templates/claude/companion/gate-bar.mjs` | `PATHS` equal to `BREADCRUMB_PATH_TEMPLATES`; marks as `buildBreadcrumbPath`; `CD+Tests` mark between TP and QA on structured paths |
| T-003 | `plugins/agdf/host-templates/claude/companion/state.mjs` | fifth mood `baut` after fertig, blockiert and wartet; kept during an active turn |
| T-003 | `plugins/agdf/host-templates/claude/companion/figure.mjs` | build palette, eyes, mouth and bob; hammer swinging between −55° and 5° around (36, 44) and three bricks in the 48 px accessory region; `ACCESSORY_BOUNDS.baut` {1, 16, 45, 31}; still pose without animation; `FIGURE_TEXT.baut` `(o_o) ⚒` |
| T-004 | `plugins/agdf/host-templates/claude/companion/notice.mjs` (new) | `observedRun`, `observeNotice` (run-derived signature, baseline per run, unreadable keeps the last observation), `noticeText`, `statusText`, `chimeClip` (0.3 s, 8 kHz, 8-bit mono WAV, own base64 encoder, gain 0.35) |
| T-005 | `plugins/agdf/host-templates/claude/companion/register.mjs` | `announce` after each applied read (status line on change, toast and optional chime on notices, each call in its own catch path); `silence` on switch-off; reads continue with the pane hidden; `$.settings.read({ key: 'language' })` without AGDF config; second button row (notice, sound); brand in the error line |
| T-005 | `plugins/agdf/host-templates/claude/companion/persistence.mjs` | `notice` (default true) and `sound` (default false), schema 1 |
| T-005 | `plugins/agdf/host-templates/claude/companion/localization.mjs` | `settingLocale` (tag or `languageNames`); `chatLocale` falls back to it only without config |
| T-005 | `plugins/agdf/host-templates/claude/companion/locales.json` | "AGDF Companion" in every locale; `languageNames`; `states.baut`; `statusStates`; `reasons.building`; `notices`; switch labels |
| T-005 | `plugins/agdf/scripts/check-runtime-integrity.mjs` | `notice.mjs` in the companion file list |
| T-006 | `packages/cli/scripts/claude-companion-test.js` | parity, paths, widths, build mood and figure bounds, detector, texts, chime, persistence, brand, placeholder, language |
| T-006 | `packages/cli/scripts/claude-companion-adapter-test.js` | fake host with toast, status, audio and settings; transitions, switches, hidden pane, switch-off, failing channels, language; updated footer and close expectations |
| T-006 | `packages/cli/scripts/claude-companion-integrity-test.js` | missing `notice.mjs` fails the runtime integrity check |

No manifest, companion descriptor, shared definition, shared hook, Copilot inventory, core module or `RUN_STATE.md` writer changed.

## Test Results

`npm run test:claude-companion` (in `packages/cli`, after `node scripts/sync-package-assets.js`):

```text
Claude companion logic tests passed
Claude companion adapter tests passed
Claude companion integrity tests passed
```

Scenario coverage in the suites:

- SCN-001: CD+Tests current at Brownfield Analysis, CD+Tests and CR, done at QA, UAT, OR and after completion, open before; 39 of 40 columns; condensed `✓✓✓✓●○○○ CD+Tests` at 38 columns (logic suite).
- SCN-003: `baut` for the three build gates on both structured routes; blocked and waiting take precedence; quick task at CD+Tests reads läuft; a turn keeps `baut`; German and English label and reason; terminal line `(o_o) ⚒ baut · In Arbeit: Implementierung und Tests` (logic suite).
- SCN-004: hammer corners sampled every 0.5° from −55° to 5° and all brick corners lie within `ACCESSORY_BOUNDS.baut` with 0.75 px stroke allowance; bounds within the region; region disjoint from the figure box; still pose without animation elements; the drawn swing uses the tested angles (logic suite).
- SCN-006: for runs created by `recordRunStep` (`ur`, `route`), presented and approved by the core (undecided, quick task, verified change, structured slice, structured delivery, block), the companion route equals `modeSliceDecision(readRunState(...))` and its marks without CD+Tests equal `evaluateGateCheck(...).status_card.breadcrumb`; the same after setting the run completed at OR (path names); format variants (backticked decision, empty evidence, template scope reason, template decision, spaced heading) keep route parity (logic suite).
- SCN-008: a 14-step observation sequence (baseline, equal read, approval to working, new pending gate, unreadable in between, blocked, decision change, run switch, building, done, no run) yields notices exactly for the transitions into or within wartet and blockiert (logic suite).
- SCN-009: with the fake host, selecting and approving the run raise no toast; `review revise` raises exactly one toast "fixture-a is blocked: Quick Task Execution – revision needed", a second read none (adapter suite).
- SCN-011: defaults notice on and sound off, a first-version state file reads with them, both switches persist; with sound on the next transition plays one `audio/wav` clip at gain 0.35; with notices off a transition raises neither toast nor sound; the chime is RIFF/WAVE PCM mono 8 kHz 8 bit, 0.3 s, standard base64 (logic and adapter suites).
- SCN-013 and SCN-014: status texts per state and locale; the status line is set after reads, not changed by a turn, kept with the pane hidden (the person's close leaves one refresh timer; a post-turn read with the pane hidden raises a toast), cleared on switch-off with the timer stopped (logic and adapter suites).
- SCN-016: the adapter writes only `companion-state.json`; one write site; no host store writes; no approval or continuation control; control state byte-identical after reads (adapter suite).
- SCN-018: every locale's title and command texts carry "AGDF Companion"; no "Begleiter" in the companion texts (logic suite).
- SCN-020: `isPlaceholderText` equals `isDecisionContentPlaceholder` on 14 values; a run created by `createRun` has an empty objective and no objective line on desktop and terminal (logic suite).
- SCN-021: `de`, `de-AT`, `German`, `deutsch`, ` Deutsch ` resolve to de; `English`, `en-GB` to en; unsupported, empty, missing or non-text values to en; an AGDF config wins; adapter sessions in a folder without control speak German for `Deutsch` and `de`, English without a setting and when the settings read fails (logic and adapter suites).
- SCN-023: with throwing toast and status channels, no audio channel and a rejecting settings read, the enabled companion opens its pane, reads, renders the run, passes `turn.complete` on and switches off and on (adapter suite).
- SCN-024 (integrity part): removing `notice.mjs` from a copy of the generated runtime plugin fails the runtime integrity check (integrity suite).

Mutation checks (2026-10-27): adding `PRD` to the quick-task path fails the path parity; dropping the evidence check from the route reader fails "empty evidence: route parity"; dropping the backtick cleaning fails "backticked decision: route parity". Each mutation was reverted and the suite passed again.

## Native Checks (SCN-025)

- `claude plugin validate packages/cli/generated/plugins/agdf` (Claude Code CLI 2.1.302): passed without warnings; hooks `session.start`, `command.run{command=agdf-companion}`, `turn.start`, `turn.complete`, `ui.close{id=agdf-companion}`, `ui.render{component=Pane, requestId=agdf-companion}`; `.catch` on both gating-capable hooks; calls include `$.audio.play (via announce)`, `$.settings.read (via loadSession)`, `$.ui.status (via announce, silence)`, `$.ui.toast (via announce)`; env reads `CLAUDE_CONFIG_DIR`, `HOME`, `USERPROFILE`; env writes nothing.
- `claude plugin test` (Claude Code CLI 2.1.302) on a scratch copy of the generated runtime plugin with a generated test file (real `locales.json`, the interaction locale registry and run states written by the canonical writers; generator and test kept in the session scratchpad, outside the payload): 5 of 5 passed.
  1. Switched on: German command texts with the brand, `AGDF · bereit`, selection to `AGDF · UR · wartet` without a toast, bar `●UR ●Compact Delivery`, button labels `Bewegung aus`, `Neu lesen`, `Meldung aus`, `Ton an`, read time on its own line; a blocked run state raises one toast "fixture-a ist blockiert: Nutzeranforderungen – Überarbeitung nötig" and `AGDF · UR · blockiert` without sound; with sound on the return to waiting raises "fixture-a wartet auf Freigabe: Nutzeranforderungen" and one `audio/wav` clip at gain 0.35; terminal text without Svg; vscode and mobile trees validate; switch-off clears the status line; writes only the state file.
  2. A structured run at CD+Tests: `baut`, "In Arbeit: Implementierung und Tests", `✓UR ✓PRD ✓SD ✓TP ●CD+Tests ○QA ○UAT ○OR`, Svg on desktop; terminal `(o_o) ⚒ baut · …` with `●CD+Tests`.
  3. A folder without control and the setting `Deutsch`: the 2.1.302 test engine has no `$.settings` noun, so the companion keeps its English fallback ("No AGDF control folder in “live-project”.", `AGDF · idle`); the test asserts the German result where the host reads settings.
  4. A folder without control and no setting: English.
  5. Unreadable plugin data: nothing registered, nothing written, one neutral line "AGDF Companion: …".
