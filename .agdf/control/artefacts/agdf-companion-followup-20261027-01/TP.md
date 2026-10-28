# TP: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-27
Owner: Arndt Gold
Run: agdf-companion-followup-20261027-01
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Early host probe before adapter work: a scratch mod in this session's dev-mods folder (outside the repository, enabled only with the owner's answer to Claude's mods question) calls `$.ui.toast`, `$.ui.status`, `$.audio.play` with a generated 8 kHz WAV clip and `$.settings.read({ key: "language" })` after a main-loop turn; observe on the Windows desktop whether the toast is drawn, where the status line appears and whether it stays with no pane open, whether the clip is audible, and what the language value is; record `T-001_HOST_PROBE.md` with screenshots and remove the scratch mod afterwards | Claude Code implementing agent; observation with Arndt Gold | none |
| T-002 | Reader and path: `run-state.mjs` reads the route from the Mode/Slice Decision by the core rule and drops placeholder objectives by the core rule; `gate-bar.mjs` mirrors the status-card paths and marks and inserts the `CD+Tests` mark for structured paths | Claude Code implementing agent | none |
| T-003 | Build mood and figure: `state.mjs` adds `baut` with its precedence and turn behaviour; `figure.mjs` adds the build palette, motion, hammer-and-bricks accessory, declared bounds, still pose and terminal face | Claude Code implementing agent | T-002 |
| T-004 | New logic module `notice.mjs`: transition detector on the run-derived state, toast text, status-line text and the generated chime (WAV header, PCM, base64 encoder) | Claude Code implementing agent | T-003 |
| T-005 | Adapter, persistence and texts: `register.mjs` keeps reading while the pane is hidden, sets and clears the status line, raises toasts and the optional sound, reads Claude's `language` setting without AGDF config, renders the second button row, and wraps every new host call in its catch path; `persistence.mjs` adds `notice` and `sound`; `localization.mjs` adds the language fallback; `locales.json` adds the brand, build texts, notice and status texts, switch labels and `languageNames`; `view.mjs` omits empty objectives and passes the build state; add `notice.mjs` to the companion file list in `plugins/agdf/scripts/check-runtime-integrity.mjs` | Claude Code implementing agent | T-001, T-004 |
| T-006 | Tests: extend `packages/cli/scripts/claude-companion-test.js` (parity, paths, widths, build mood and figure, detector, texts, chime, persistence, brand, placeholder, language), `claude-companion-adapter-test.js` (fake host with toast, status, audio and settings; lifecycle, switches, failing channels, write surface) and `claude-companion-integrity-test.js` (new module present in the runtime plugin, absent from Copilot) | Claude Code implementing agent | T-002, T-003, T-004, T-005 |
| T-007 | Generation and evidence: `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check`; payload budget and evaluation fingerprints only where the generators report a change, recorded with a reason; run `test:claude-companion`, the runtime integrity, public plugin and Copilot profile tests and the CI lane that holds the companion domain | Claude Code implementing agent | T-006 |
| T-008 | Documentation in the companion section of `INSTALL.md`: brand, build state and CD+Tests mark, per-mode bar, toast and sound switches with defaults, status line with the pane closed, language fallback, observed host limits from T-001 | Claude Code implementing agent | T-001, T-005 |
| T-009 | Native and live evidence: `claude plugin validate` and `claude plugin test` on the generated runtime plugin; install this branch's AGDF build into Claude; dated Claude desktop session on Windows with screenshots of a structured run in a build phase (CD+Tests mark, build figure), a quick-task bar, a toast, the status line with the pane closed, the brand, a folder without `.agdf/control` in German, the sound result and a byte-identity check of the run states | Arndt Gold with the Claude Code implementing agent | T-007, T-008 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-02 | T-006 | SCN-001 | A structured run shows `CD+Tests` current at Brownfield Analysis, CD+Tests and CR, done at QA, UAT, OR and when completed, open before; the full structured bar is 39 columns and fits 40; below its width the condensed form keeps every mark and names the current one | Node test output (logic suite) |
| AC-001 | SDD-02 | T-009 | SCN-002 | In the desktop panel a run in a build phase shows `✓TP ●CD+Tests ○QA` on one line at the default width | Dated live screenshot |
| AC-002 | SDD-03 | T-006 | SCN-003 | A structured run in a build phase that is neither blocked nor waiting shows `baut` with reason `building`; blocked and waiting take precedence; a non-structured run at the same gate shows läuft; during an active turn `baut` stays and other moods show läuft | Node test output (logic suite) |
| AC-002 | SDD-04 | T-006 | SCN-004 | The build accessory's rotated extremes lie within `ACCESSORY_BOUNDS.baut` and the region, the region does not intersect the figure box, the still pose contains no animation element and the terminal face is `(o_o) ⚒` | Node test output (figure tests) |
| AC-002 | SDD-04 | T-009 | SCN-005 | The build figure is visible in the desktop panel without covering the figure, and motion stops in the still pose | Dated live screenshots |
| AC-003 | SDD-01 | T-006 | SCN-006 | For canonical fixtures of structured, verified-change, quick-task, block and undecided runs (active and completed) the companion route equals `modeSliceDecision` and the companion marks without `CD+Tests` equal `evaluateGateCheck(...).breadcrumb`; no quick-task, verified-change or block run shows PRD, SD or TP | Node test output (parity tests) |
| AC-003 | SDD-01 | T-009 | SCN-007 | A quick-task run in the desktop panel shows `UR` and `Compact Delivery` only | Dated live screenshot |
| AC-004 | SDD-05 | T-006 | SCN-008 | Detector sequences: baseline read, equal reads, run switch, läuft→wartet, wartet at another gate, wartet→blockiert, decision change, turn overlay and stale snapshot produce notices exactly for the transitions into or within wartet and blockiert | Node test output (notice tests) |
| AC-004 | SDD-06 | T-006 | SCN-009 | With the fake host a transition raises exactly one `$.ui.toast` with run, localized state and gate title, none on switch-on, session start, run switching or a failed read | Node test output (adapter suite) |
| AC-004 | SDD-06 | T-009 | SCN-010 | A real transition of the shown run on the Windows desktop shows one toast | Dated live screenshot |
| AC-005 | SDD-09 | T-006 | SCN-011 | Defaults notice on and sound off; a delivered state file reads with these defaults; each switch changes only its field and persists; the sound plays only with a toast and the sound switch on; the chime is a valid RIFF/WAVE 8 kHz 8-bit mono clip of about 0.3 s and is passed as base64 with `audio/wav` and gain 0.35 | Node test output (logic and adapter suites) |
| AC-005 | SDD-10 | T-009 | SCN-012 | The second button row is visible and does not wrap at the default width; the sound result is recorded as observed | Dated live screenshot and note |
| AC-006 | SDD-07 | T-006 | SCN-013 | Status-line texts per state and locale (`AGDF · QA · wartet`, `AGDF · CR · baut`, `AGDF · fertig`, idle, unreadable); the turn overlay never changes the text | Node test output (notice tests) |
| AC-006 | SDD-08 | T-006 | SCN-014 | With the fake host the status line is set after each changed read, stays and keeps updating after a person's close of the pane, and is cleared on switch-off when the timer stops | Node test output (adapter suite) |
| AC-006 | SDD-07 | T-009 | SCN-015 | On the Windows desktop the status line shows the entry with the pane closed; in the terminal where available | Dated live screenshots |
| AC-007 | SDD-12 | T-006 | SCN-016 | The adapter writes only the companion state file; toast and status line carry plain text; no gating hook and no approval or continuation control | Node test output (adapter suite) |
| AC-007 | SDD-12 | T-009 | SCN-017 | Every `RUN_STATE.md` the companion read is byte-identical before and after the live window | Hash listing before and after |
| AC-008 | SDD-10 | T-006 | SCN-018 | Every locale's title and command texts use "AGDF Companion"; no user-visible companion text contains "AGDF-Begleiter"; the command name is unchanged | Node test output (localization tests) |
| AC-008 | SDD-10 | T-008 | SCN-019 | `INSTALL.md` uses "AGDF Companion" throughout the companion section | Documentation diff |
| AC-009 | SDD-11 | T-006 | SCN-020 | The companion placeholder rule equals `isDecisionContentPlaceholder` on a value list incl. the RUN_STATE template objective; a fresh canonical run shows no objective line on desktop and terminal | Node test output (parity and render tests) |
| AC-010 | SDD-11 | T-006 | SCN-021 | With config the language equals `resolveConfiguredChatLanguage`; without config `de`, `de-AT`, `German`, `deutsch` resolve to de, `English` to en, unsupported or absent values to en; a throwing `settings.read` falls back to en | Node test output (logic and adapter suites) |
| AC-010 | SDD-11 | T-009 | SCN-022 | A folder without `.agdf/control` shows the panel in German on the owner's machine | Dated live screenshot |
| AC-011 | SDD-12 | T-006 | SCN-023 | With throwing or missing `ui.toast`, `ui.status`, `audio.play` and `settings.read` the pane renders, reads continue and every hook passes its event on | Node test output (failure-injection tests) |
| AC-012 | SDD-12 | T-007 | SCN-024 | `build:prepare`, `compatibility:record` and `compatibility:check` pass; the runtime integrity check lists `notice.mjs`; the Copilot payload contains no companion file; companion, integrity, public plugin and Copilot profile tests and the companion CI lane pass; any budget or fingerprint change is recorded with a reason | Command output and regenerated evidence |
| AC-012 | SDD-12 | T-009 | SCN-025 | `claude plugin validate` and `claude plugin test` pass on the generated runtime plugin, labelled native evidence | Command output with Claude Code version |
| AC-012 | SDD-12 | T-008 | SCN-026 | `INSTALL.md` describes the new behaviour, switches, defaults and observed limits and separates live, native and automated evidence | Documentation diff |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/cli/scripts/claude-companion-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing logic tests | Fix before T-007 |
| AC-001 | SCN-002 | Manual: show a structured run at CD+Tests in the panel | Claude desktop Code tab on Windows with this branch's AGDF installed | Local AGDF installation; Claude restart after install | Arndt Gold | Screenshot | Record the gap; QA stays revise |
| AC-002 | SCN-003 | Logic suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-002 | SCN-004 | Logic suite (figure tests) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-002 | SCN-005 | Manual: build-phase run, then "Bewegung aus" | Claude desktop Code tab on Windows | As SCN-002 | Arndt Gold | Screenshots | Record the gap; QA stays revise |
| AC-003 | SCN-006 | Logic suite (parity tests against core) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-003 | SCN-007 | Manual: select a quick-task run | Claude desktop Code tab on Windows | As SCN-002; a quick-task fixture run in the live folder | Arndt Gold | Screenshot | Record the gap; QA stays revise |
| AC-004 | SCN-008 | Logic suite (notice tests) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-004 | SCN-009 | `node packages/cli/scripts/claude-companion-adapter-test.js` | Local Node 22 and CI | none | Claude Code implementing agent | Passing adapter tests | Fix before T-007 |
| AC-004 | SCN-010 | Manual: move the shown live run to a pending approval | Claude desktop Code tab on Windows | As SCN-002; live folder with an active run | Arndt Gold | Screenshot | If the host draws no toast, record the observation and the T-001 result; QA decides on the documented limit |
| AC-005 | SCN-011 | Logic and adapter suites | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-005 | SCN-012 | Manual: press both switches, trigger a transition with sound on | Claude desktop Code tab on Windows | As SCN-002; speakers on | Arndt Gold | Screenshot and note "audible" or "not audible" | Record the observation; silence is reported, not failed |
| AC-006 | SCN-013 | Logic suite (notice tests) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-006 | SCN-014 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-006 | SCN-015 | Manual: close the pane, read the status line; terminal session where available | Claude desktop Code tab on Windows; Claude CLI terminal if available | As SCN-002 | Arndt Gold | Screenshots | If the host draws no plugin status line, record the observation; QA decides on the documented limit |
| AC-007 | SCN-016 | Adapter suite (write surface) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-007 | SCN-017 | `Get-FileHash` over `.agdf/control/runs/*/RUN_STATE.md` before and after the live window | Live folder on Windows | none | Claude Code implementing agent | Hash listings | Record the gap; QA stays revise |
| AC-008 | SCN-018 | Logic suite (localization tests) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-008 | SCN-019 | Documentation review | Repository | none | Claude Code implementing agent | Diff | Fix before QA |
| AC-009 | SCN-020 | Logic suite (parity and render tests) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-010 | SCN-021 | Logic and adapter suites | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-010 | SCN-022 | Manual: switch the companion on in a folder without `.agdf/control` | Claude desktop Code tab on Windows | As SCN-002; Claude `language` set to `de` | Arndt Gold | Screenshot | Record the gap; QA stays revise |
| AC-011 | SCN-023 | Adapter suite (failure injection) | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-012 | SCN-024 | `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check`, `npm run test:claude-companion`, runtime integrity, public plugin and Copilot profile tests, CI lane with the companion domain | Local Node 22 on Windows | none | Claude Code implementing agent | Command output, regenerated records | Fix before QA |
| AC-012 | SCN-025 | `claude plugin validate` and `claude plugin test` on the generated runtime plugin | Local Claude Code CLI on Windows | Claude Code installed | Claude Code implementing agent | Command output with version | Record as missing native evidence; QA stays revise |
| AC-012 | SCN-026 | Documentation review | Repository | none | Claude Code implementing agent | Diff | Fix before QA |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Host probe order | SD: Host probe order | resolved | T-001 runs first, after Brownfield Analysis and before adapter work: a scratch mod in this session's dev-mods folder probes toast, status line (with no pane open), sound and `settings.read` on the Windows desktop; a missing channel does not stop the run but is documented and drives the live acceptance wording in T-008 and T-009; a failing mod load or an effect on AGDF stops the run and returns it to SD | Claude Code implementing agent, TP author |
| Fixture strategy per mode | SD: Fixture strategy per mode | resolved | Canonical runs are created with `createRun` and the core writers (`recordRunStep` with `route` for quick_task, structured_slice and structured_delivery); verified-change and block decisions and the build-phase gates use the existing core test edit helpers (`replaceFirstScalar`, section edits) followed by `sealRunState`, as the delivered suite does for decisions; completed fixtures come from `control-cockpit-fixtures.js`; every fixture is compared with `readRunState`, `modeSliceDecision` and `evaluateGateCheck` | Claude Code implementing agent, TP author |
| Live-test script | SD: Live-test script | resolved | T-009 uses a live folder outside the repository with copied run fixtures (a structured run at CD+Tests, a quick-task run, an active run that is moved to a pending approval during the window) and a second folder without `.agdf/control`; screenshots are taken of the Claude window and stored under this run's `live/` folder with date; run-state hashes are listed before and after | Claude Code implementing agent, TP author |
| Full verification run | TP | resolved | The full `npm run verify:ci` is not required by the PRD; T-007 runs the targeted suites and the CI lane that holds the companion domain, as the owner chose for the predecessor's final checks | Claude Code implementing agent, TP author |

## 4. Brownfield Scope

Inspect before implementation: the companion modules under `plugins/agdf/host-templates/claude/companion/`, the three companion suites, `packages/core/test/control-cockpit-fixtures.js`, `packages/core/lib/control-evaluation/gate-check.js` (`buildBreadcrumbPath`, `breadcrumb`), `run-state-policy.js`, `decision-content-readiness.js`, `packages/core/lib/control-state/run-steps.js` (`route`), `run-state-document.js`, `plugins/agdf/scripts/check-runtime-integrity.mjs`, `scripts/sync-package-assets.js`, `scripts/public-plugin/validator.js`, `scripts/public-plugin/copilot-profile.js`, `scripts/ci-test-domains.mjs` and the companion section of `INSTALL.md`.

## 5. Out Of Scope

- Changes to the core status card, contracts, dispatcher, MCP server, SessionStart hook or the `RUN_STATE.md` format.
- Changes to the Claude manifest, the companion descriptor, the shared plugin definition, shared hooks or the Copilot inventory.
- Native operating-system notifications, spoken output and any Codex, Copilot or OpenCode companion.
- The later candidates (timeline, long-check recognition, cleanup hint, completion animation).
- Publication, npm release or merge.

## 6. Risks And Blockers

- Warn: T-001 may show that the Windows desktop draws no toast or status line or plays no clip; the run continues with documented limits, and QA judges AC-004 to AC-006 against the observation.
- Block: T-001 shows that the scratch mod's new calls break the session or AGDF; the run returns to SD.
- Revise: any live scenario (SCN-002, SCN-005, SCN-007, SCN-010, SCN-012, SCN-015, SCN-017, SCN-022) without evidence keeps QA at revise unless the observation documents a host limit.
- Warn: the mod API is early access; a Claude Code update during the run may require re-running native checks.
- Warn: payload, compatibility and fingerprint evidence must be regenerated after the last companion change.

## 7. Next Step

Review this task and test plan and approve only with `Approval: TP`. Valid approval permits the implementation-preparation Brownfield Analysis, then implementation of the approved tasks.

## AGDF Approval Summary (de; source=en)

Der Plan setzt das freigegebene Lösungsdesign in neun Aufgaben um und ordnet alle zwölf Kriterien und alle zwölf Designentscheidungen 26 prüfbaren Szenarien zu. Er ist vorbereitet, aber noch nicht umgesetzt.

- Reihenfolge: Zuerst kommt eine frühe Host-Probe (T-001): Ein Probe-Mod im Mod-Ordner dieser Session, außerhalb des Repositorys und nur nach deiner Zustimmung in Claudes Mod-Abfrage, ruft Meldung, Statuszeile, Ton und Spracheinstellung auf; beobachtet wird auf dem Windows-Desktop, ob die Meldung erscheint, wo die Statuszeile steht, ob der Klang hörbar ist und welchen Wert die Spracheinstellung liefert. Danach wird der Probe-Mod entfernt. Fehlt ein Kanal, läuft der Run mit dokumentierter Grenze weiter; beeinträchtigt die Probe AGDF, geht der Run zurück ans SD.
- Umsetzung: Leser und Gate-Leiste mit Modus-Pfad, Platzhalterregel und `CD+Tests`-Marke (T-002), Zustand „baut“ mit Bau-Figur (T-003), das neue Modul `notice.mjs` für Übergangserkennung, Meldungs- und Statuszeilentext und den erzeugten Klang (T-004), dann Adapter, Zustandsdatei, Sprache, Texte mit Markenname und die Dateiliste der Integritätsprüfung (T-005).
- Tests: Die drei Begleiter-Suiten werden erweitert: Parität mit `modeSliceDecision`, `evaluateGateCheck` und `isDecisionContentPlaceholder` für Testdaten jedes Modus, Breiten, Bau-Zustand und Figurgrenzen, Übergangsfolgen mit Störungen, Texte, Klangformat, Zustandsdatei, Name, Sprache sowie ein gefälschter Host mit Meldung, Statuszeile, Ton und Einstellungen einschließlich Fehlerinjektion und Schreibprüfung (T-006).
- Nachweise: `build:prepare`, `compatibility:record` und `compatibility:check`, Budgets und Fingerprints nur bei gemeldeter Änderung mit Begründung, die gezielten Suiten und die CI-Lane mit dem Begleiter; ein vollständiges `verify:ci` ist nicht vorgesehen (T-007). Die Dokumentation steht im Begleiter-Abschnitt von `INSTALL.md` (T-008). Native Prüfungen und ein datierter Live-Test im Code-Tab unter Windows mit Screenshots von Bauphase, Quick-Task-Leiste, Meldung, Statuszeile bei geschlossenem Panel, Name, Ordner ohne Kontrollordner, Tonbeobachtung und byteidentischen Run-Dateien schließen ab (T-009).
- Risiken: Zeigt der Desktop keine Meldung oder Statuszeile oder spielt keinen Klang, wird das als Grenze dokumentiert und von QA beurteilt. Fehlen Live-Nachweise ohne dokumentierte Host-Grenze, bleibt QA auf revise. Ein Claude-Update während des Runs kann eine Wiederholung der nativen Prüfungen erfordern.
