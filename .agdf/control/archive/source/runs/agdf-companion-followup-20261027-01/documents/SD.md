# SD: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-27
Owner: Arndt Gold
Run: agdf-companion-followup-20261027-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

All changes stay inside the delivered Claude companion under `plugins/agdf/host-templates/claude/companion/`, its suites under `packages/cli/scripts/claude-companion*-test.js`, the companion section of `INSTALL.md`, the companion file list of the runtime integrity check and the regenerated evidence. The companion keeps its structure: host-independent logic modules (reader, state rules, assignment, localization, gate bar, figure, view) and one host adapter (`register.mjs`).

The run-state reader additionally reads the Mode/Slice Decision with the core's rule. The gate bar mirrors the status card's per-mode path and adds the `CD+Tests` mark for structured paths. The state rules gain a fifth mood `baut` with its figure variant. A new logic module `notice.mjs` owns the feedback outside the panel: the transition detector, the toast text, the status-line text and a generated soft tone. The adapter calls `$.ui.toast`, `$.ui.status`, `$.audio.play` and `$.settings.read` behind catch paths, keeps refreshing while the companion is on even when the pane is hidden, and persists two new switches. Labels carry the single brand "AGDF Companion"; placeholder objectives are dropped; the language falls back to Claude's `language` setting where no AGDF control exists.

No manifest, descriptor, shared definition, shared hook, Copilot inventory, core module or `RUN_STATE.md` writer changes.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner | Companion role |
|---|---|---|
| Run state, mode, gates, approvals | `RUN_STATE.md` through the canonical writers in `packages/core/lib/control-state/` | Read-only parser `run-state.mjs`, bound by parity tests |
| Status-card path per mode | `BREADCRUMB_PATH_TEMPLATES` and `buildBreadcrumbPath` in `packages/core/lib/control-evaluation/gate-check.js:141-181`; mode rule `modeSliceDecision` in `run-state-policy.js:45-51` | Mirror in `gate-bar.mjs` and `run-state.mjs`, parity-tested against `evaluateGateCheck(...).breadcrumb` |
| Placeholder objective | `isDecisionContentPlaceholder` in `packages/core/lib/control-evaluation/decision-content-readiness.js:7-13` | Mirror in `run-state.mjs`, parity-tested on a value list |
| Gate titles and chat language | `plugins/agdf/meta/agdf-interaction-locales.json`; `resolveConfiguredChatLanguage` | Unchanged lookup; Claude `language` setting only without AGDF config |
| Turn activity | Claude host turn events | Panel overlay only |
| Companion choices | The user, stored in `companion-state.json` in the AGDF plugin data directory | Adapter persistence |
| Toast, status line, audio | Claude host (`$.ui.toast`, `$.ui.status`, `$.audio.play`) | Observation output only |
| Approvals and run continuation | AGDF status card and approval cards in chat | None |

## 3. Architecture Decisions

- SDD-01: Read the run's route like the core. `run-state.mjs` reads the section `## Mode/Slice Decision` (else `## Mode / Slice Decision`), takes the first `- decision:`, `- scope_reason:` and `- evidence:` fields, strips surrounding backticks from the decision and returns `route` = the decision when decision, scope reason and evidence are filled and none is a template placeholder (empty, or starting with a backtick and containing `|`), else `undecided`; rationale: the status card chooses its path with `modeSliceDecision` and the companion cannot import core; consequence: a parity test compares `route` with `modeSliceDecision(readRunState(...))` on canonical fixtures of every mode, so format drift fails the suite.
- SDD-02: Mirror the status-card path in `gate-bar.mjs`. A frozen `PATHS` table equals `BREADCRUMB_PATH_TEMPLATES` (structured paths `UR PRD SD TP QA UAT OR`; verified change `UR`, `Verified Change`, `OR`; quick task `UR`, `Compact Delivery`; block `UR`, `Block`; undecided and unknown `UR`). Marks follow `buildBreadcrumbPath`: a standard gate is done when approved, current when it is the current gate, else open; OR is done for a completed run at OR; Verified Change and Compact Delivery are done once the run is at OR and current while the mode is theirs; Block is current for mode block; OR at OR is current otherwise. For structured paths a `CD+Tests` mark is inserted between TP and QA: current while the current gate is Brownfield Analysis, CD+Tests or CR, done when the current gate is QA, UAT or OR or the run is completed, else open. The full bar keeps `glyph+name` tokens joined by single spaces (39 columns for the structured path) and the existing condensed form below the pane's `bodyColumns`; rationale: AC-001 and AC-003; consequence: a parity test compares the companion marks without `CD+Tests` with `evaluateGateCheck(...).breadcrumb` for fixtures of every mode.
- SDD-03: Add the build mood. `state.mjs` adds `baut` to the moods: after fertig, blockiert and wartet, a structured run (`route` structured) whose current gate is Brownfield Analysis, CD+Tests or CR and whose decision is a working value shows `baut` with reason key `building` and the gate; `displayState` keeps a derived `baut` during an active main-loop turn and shows läuft for every other derived mood as today; rationale: AC-002 with the PRD precedence; consequence: the turn overlay never hides the build phase.
- SDD-04: Draw the build figure in the reserved accessory region. `figure.mjs` adds body colours, mouth and motion for `baut` (the läuft palette with a slower bob), and an accessory of a hammer swinging around its handle end and three bricks appearing in sequence, all within `ACCESSORY_REGION` (48 × 48 px); `ACCESSORY_BOUNDS.baut` declares the extent including the swing; the still pose emits no animation element; `FIGURE_TEXT.baut` is `(o_o) ⚒`; rationale: AC-002; consequence: a bounds test computes the hammer's rotated corner points at both swing extremes and checks them against the declared bounds and the region.
- SDD-05: Detect transitions in a new logic module `notice.mjs`. `observeNotice(previous, current)` takes the last observation `{ runId, signature }` and the current run with its run-derived state (`runState`, never `displayState`); the signature is mood, reason key, gate and decision. It returns a notice only when the run id is unchanged, the signature changed and the new mood is wartet or blockiert; a missing previous observation or another run id yields a new baseline without a notice. The adapter resets the observation when the companion is switched off, when no run is shown and at session start, and skips detection for a stale snapshot; rationale: AC-004 without noise from baseline reads, run switching, equal reads, turns or transient failures; consequence: detector tests feed noisy sequences.
- SDD-06: Toast and sound. The adapter shows a notice with `$.ui.toast(text)` at the host's default display time when the notice switch is on; the text comes from `notice.mjs` with the localized state, the gate title and, for blockiert, the decision (`{run} wartet auf Freigabe: {gate}`, `{run} wartet auf Entscheidung: {gate}`, `{run} ist blockiert: {gate} – {decision}` and the English equivalents). When the sound switch is also on it calls `$.audio.play({ base64, mime: "audio/wav" }, { gain: 0.35 })` without awaiting, with a catch that ignores failures. The clip is generated once in `notice.mjs`: a two-note chime of about 0.3 s as 8 kHz, 8-bit mono PCM WAV, base64-encoded by the module's own encoder; rationale: AC-004 and AC-005 with no binary asset in the payload and silence where no player exists; consequence: the clip is deterministic and tested for header and length; Windows desktop playback is live evidence only.
- SDD-07: Status line. `notice.mjs` builds `AGDF · {gate} · {short state}` from the run-derived state: the gate of the reason (pending approval for wartet, current gate otherwise; none for fertig), the short state from `statusStates` in `locales.json` (de läuft, baut, wartet, blockiert, fertig; en working, building, waiting, blocked, done), `AGDF · {idle}` without a shown run or control, `AGDF · {unreadable}` for an unreadable or failed read. The adapter calls `$.ui.status(text)` after every applied read when the text changed and `$.ui.status(undefined)` on switch-off; rationale: AC-006; consequence: the turn overlay never reaches the status line.
- SDD-08: Refresh lifecycle while the pane is hidden. While the companion is on, the 30-second timer, the read after each main-loop `turn.complete` and "Neu lesen" keep running whether or not the pane is shown; a person's close of the pane only sets `isHidden`; `/agdf-companion` with a hidden pane reopens it; switching off stops the timer, closes the pane, clears the status line and resets the observation; the turn overlay is still tracked only while the pane is shown; rationale: AC-004 and AC-006 with the pane closed; consequence: reads continue at the delivered cadence (one read of all run states per refresh, about 240 ms for 144 runs).
- SDD-09: Persist the two switches in the existing state file. `persistence.mjs` adds `notice` (default true; only an explicit `false` turns it off) and `sound` (default false; only an explicit `true` turns it on) to `companion-state.json`, keeps `schema_version: 1` and serializes all fields; a state file of the delivered companion reads with the defaults; rationale: AC-005; consequence: an older companion writing the file drops the two fields (mixed-version limit, documented like the existing one).
- SDD-10: Panel controls and brand. The actions area gets a second row with two text buttons whose label is the action (`Meldung aus` / `Meldung an`, `Ton an` / `Ton aus`; en `Notices off` / `Notices on`, `Sound on` / `Sound off`), with the read time on its own line below, on the desktop and in the terminal. `locales.json` uses "AGDF Companion" as title and in the command texts of every locale, and the adapter's fallback error line reads `AGDF Companion: …`; rationale: AC-005 and AC-008 with the desktop drawing a Button's label; consequence: localization tests assert one brand name in every locale and no "AGDF-Begleiter".
- SDD-11: Placeholder objective and language fallback. `run-state.mjs` returns an empty objective when the first objective line is a decision-content placeholder by the core's rule (the five template prompts, the core's open-task marker words, text wrapped in angle brackets and status alternatives, compared trimmed, case-insensitively and without surrounding backticks); the view then omits the objective row. Without `.agdf/control/config.json` the adapter reads `$.settings.read({ key: "language" })` and `localization.mjs` resolves it to a supported locale as a language tag (exact or base language) or as one of the locale's `languageNames` in `locales.json` (de `German`, `Deutsch`; en `English`, `Englisch`), case-insensitively, else the registry fallback; with a config file the existing rule applies unchanged; rationale: AC-009 and AC-010; consequence: parity tests bind the placeholder rule to the core and keep the config rule equal to `resolveConfiguredChatLanguage`.
- SDD-12: Isolate the new channels and refresh the evidence. Toast, status line, audio and settings calls run inside the adapter's existing catch paths; a missing or throwing channel stays silent and never stops the read, the pane or the event chain; the new module is added to the companion file list in `plugins/agdf/scripts/check-runtime-integrity.mjs`; the runtime plugin, compatibility records and, only if they change, payload budgets and evaluation fingerprints are regenerated through their existing owners; `INSTALL.md` documents the new behaviour and limits; rationale: AC-007, AC-011 and AC-012; consequence: adapter tests inject failing channels, and the write-surface test still allows only the companion state file.

## 4. Integration Points

- Claude host mod API (Claude Code 2.1.308, early access): existing `$.fs`, `$.env`, `$.clock`, `$.session`, `$.command`, `$.ui.open/close/invalidate/resolve`; new `$.ui.toast(text)`, `$.ui.status(text | undefined)`, `$.audio.play(clip, { gain })` and `$.settings.read({ key: "language" })`, each spelled at its call site as the validator requires.
- Core status-card path and mode rule, read-only through parity tests: `evaluateGateCheck`, `readRunState`, `modeSliceDecision`, `isDecisionContentPlaceholder`, `resolveConfiguredChatLanguage`.
- Generators and checks: `scripts/sync-package-assets.js` copies the companion folder into the runtime plugin; `scripts/public-plugin/validator.js` and `plugins/agdf/scripts/check-runtime-integrity.mjs` check the companion files; `scripts/public-plugin/copilot-profile.js` keeps `companion/` excluded.

## 5. Constraints And Compatibility

- Existing state files stay readable; new fields default as the owner decided (notice on, sound off).
- The delivered behaviour for panel, assignment, stepping, still pose and command is unchanged except for the brand, the build mood, the per-mode bar, the hidden-pane refresh and the omitted placeholder objective.
- Codex sees the changed files in the shared runtime folder but never loads them; the Copilot payload stays without the companion.
- `$.audio.play` is declared silent in Linux and Windows terminals; desktop behaviour is unknown until the live test.
- Mixed versions: an older companion in another session ignores and drops the two new switches when it writes the state file.

## 6. Test And Evidence Strategy

Risk sits in mirrored core rules (drift), in noisy transitions (toast floods) and in unobserved host channels. Reuse first: the existing logic suite already builds canonical fixtures through the core writers and compares with `readRunState`, the core lifecycles and `resolveConfiguredChatLanguage`; the adapter suite has a fake host with failure injection and a write-surface check; the integrity suite checks the companion files.

- Logic suite (`claude-companion-test.js`, run in `test:claude-companion`, CI domain installation): route parity with `modeSliceDecision` and path/mark parity with `evaluateGateCheck(...).breadcrumb` for structured, verified-change, quick-task, block and undecided fixtures; CD+Tests mark per phase and full/condensed widths at 40 columns; `baut` rules, precedence and turn overlay; build figure bounds at both swing extremes, still pose without animation elements, terminal face; detector sequences (baseline, equal reads, run switch, waiting→waiting at another gate, blocked, turn, stale); toast and status-line texts per state and locale; tone clip header and size; persistence defaults and upgrade from a delivered state file; brand in every locale; placeholder parity on a value list; language fallback order and name mapping.
- Adapter suite (`claude-companion-adapter-test.js`): fake host gains `ui.toast`, `ui.status`, `audio.play` and `settings.read`; one toast per transition and none otherwise; sound only with toast and switch; status line with the pane closed and cleared on switch-off; refresh continues while hidden; switches persist; throwing or missing channels leave the pane and event chain intact; the only write is the companion state file.
- Integrity suite and runtime integrity check: the new module is present in the generated runtime plugin and absent from Copilot.
- Native evidence where Claude Code is installed: `claude plugin validate` and `claude plugin test` on the generated runtime plugin.
- Run evidence: `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` and the CI lanes covering the companion; the full `verify:ci` remains available but is not required by the PRD.
- Live evidence on the Windows desktop (TP probe first, final live test later): toast, status line with the pane closed, sound result, build figure, CD+Tests mark, quick-task bar, brand and language fallback with dated screenshots; layout accepted only from live evidence.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | `CD+Tests` mark inserted into structured paths; current in build phases, done from QA; full bar 39 columns, condensed form below `bodyColumns` | Status-card path mirrored in `gate-bar.mjs` | SDD-02 | none beyond width tests |
| AC-002 | Fifth mood `baut` after fertig, blockiert and wartet; kept during turns; build figure in the accessory region; still pose; terminal face | `state.mjs`, `figure.mjs`; run route from SDD-01 | SDD-03, SDD-04 | SMIL ignores reduced motion; still pose remains the fallback |
| AC-003 | Route read like `modeSliceDecision`; per-mode path and marks like `buildBreadcrumbPath` | Core status card through parity tests | SDD-01 | Format drift caught by parity tests |
| AC-004 | Transition detector on the run-derived state; toast text with run, state and gate | `notice.mjs`; adapter | SDD-05, SDD-06 | Several sessions may each toast for their own shown run |
| AC-005 | Two persisted switches with owner defaults; sound only with a toast; generated chime | `persistence.mjs`; `notice.mjs`; panel actions | SDD-09, SDD-10 | Older companion versions drop the switches on write |
| AC-006 | Status-line text from the run-derived state; updated after each read; cleared on switch-off; refresh continues with the pane hidden | `notice.mjs`; adapter lifecycle | SDD-07, SDD-08 | Host placement of the status line on the desktop is live evidence |
| AC-007 | Text-only toast and status line; read-only file access; only write is the companion state file | Adapter; write-surface test | SDD-12 | none |
| AC-008 | One brand in every locale and in the adapter's error line | `locales.json`; `register.mjs` | SDD-10 | Tests and documentation asserting old titles change with it |
| AC-009 | Placeholder objective dropped by the core rule | `run-state.mjs` mirror of `isDecisionContentPlaceholder` | SDD-11 | Parity on a value list |
| AC-010 | Config rule unchanged; Claude `language` by tag or language name; else English | `localization.mjs`; `locales.json` `languageNames`; `$.settings.read` | SDD-11 | Free-text settings outside the names fall back to English |
| AC-011 | Catch paths around every new host call; silent channel on failure | Adapter | SDD-12 | Early-access API changes |
| AC-012 | Suites, native checks, generators, integrity list, documentation and live evidence | Test owners; generators; `INSTALL.md` | SDD-12 | Native Claude evidence goes stale with the payload change |

## 8. Risks And Open Questions

- The Windows desktop may draw no toast or status line or play no clip; the TP probes these first and the live test reports what it observes.
- The mirrored path and mode rules can drift from the core; parity tests on canonical fixtures of every mode bind them.
- The hammer's swing must stay inside the 48 px region; the bounds test computes the rotated extremes.
- Continuing reads with the pane hidden adds reads in sessions that only want the status line; the cadence equals the delivered one.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Route reader | before_sd | resolved | SDD-01: Mode/Slice Decision read with the core's `modeSliceDecision` rule, parity-tested | Arndt Gold, SD Owner |
| Per-mode path and CD+Tests mark | before_sd | resolved | SDD-02: mirrored `PATHS` and mark rules with breadcrumb parity; CD+Tests inserted for structured paths only | Arndt Gold, SD Owner |
| Build mood and figure | before_sd | resolved | SDD-03 and SDD-04: fifth mood `baut` below blockiert and wartet, kept during turns; hammer and bricks inside the accessory region with computed bounds | Arndt Gold, SD Owner |
| Transition detector | before_sd | resolved | SDD-05: run-derived signature per shown run; baseline on start, switch-on and run change; stale reads skipped | Arndt Gold, SD Owner |
| Toast and sound source | before_sd | resolved | SDD-06: host default toast; generated 8 kHz WAV chime as base64 at gain 0.35, fire-and-forget; no binary asset | Arndt Gold, SD Owner |
| Status-line text and updates | before_sd | resolved | SDD-07: `AGDF · {gate} · {short state}` from the run-derived state, set after each changed read, cleared on switch-off | Arndt Gold, SD Owner |
| Hidden-pane refresh | before_sd | resolved | SDD-08: reads continue while on; close hides only the pane; switch-off stops everything | Arndt Gold, SD Owner |
| State-file extension | before_sd | resolved | SDD-09: additive `notice` and `sound` fields, schema 1, owner defaults | Arndt Gold, SD Owner |
| Controls and brand | before_sd | resolved | SDD-10: second button row with action labels; "AGDF Companion" in every locale | Arndt Gold, SD Owner |
| Placeholder and language fallback | before_sd | resolved | SDD-11: core placeholder rule mirrored; Claude `language` by tag or `languageNames` only without AGDF config | Arndt Gold, SD Owner |
| Isolation and evidence refresh | before_sd | resolved | SDD-12: catch paths, integrity file list, existing generators, `INSTALL.md` | Arndt Gold, SD Owner |
| No external dependency | before_sd | resolved | No framework, library, external API or service is added; the Claude mod API is already used by the delivered companion and its new calls are taken from the installed Claude Code 2.1.308 declaration | Arndt Gold, SD Owner |
| Host probe order | later_tp | open | Probe toast, status line, sound and `settings.read` on the Windows desktop before building on them | TP author through gate-check |
| Fixture strategy per mode | later_tp | open | Which canonical writer sequences produce verified-change, quick-task, block and undecided fixtures for the parity tests | TP author through gate-check |
| Live-test script | later_tp | open | Steps and folders for the dated screenshots incl. a folder without control | TP author through gate-check |

## 9. Next Step

Review this solution design and approve only with `Approval: SD`. Valid approval permits Task/Test Plan authoring; implementation still requires the approved TP and implementation-preparation Brownfield Analysis.

## Source and Derivation Evidence

- Approved PRD (`PRD.md`, sha256:72e4afaa4c252427ea9ddc9d336eacf08d8532d5169b5d80dad162047fc5c617), `BROWNFIELD_REVIEW.md` and `UX_INTENT_DEFINITION.md` of this run.
- Inspected code: companion modules `register.mjs`, `run-state.mjs`, `state.mjs`, `gate-bar.mjs`, `figure.mjs`, `view.mjs`, `persistence.mjs`, `localization.mjs`, `locales.json`; `packages/core/lib/control-evaluation/gate-check.js:141-181,229`; `run-state-policy.js:45-51`; `decision-content-readiness.js:7-13`; `packages/core/lib/control-state/run-state-document.js:125-182`; `shared.js:297-328`; `plugins/agdf/scripts/check-runtime-integrity.mjs:1635-1660`; `scripts/public-plugin/copilot-profile.js:107-110`; suites `claude-companion-test.js` and `claude-companion-adapter-test.js`.
- Claude Code 2.1.308 mod API declaration (bundled `claude-code.d.ts`, read 2026-10-27): `$.ui.toast(text, { timeoutMs })`, `$.ui.status(text | undefined)`, `$.audio.play(clip, { gain })` with `{ base64, mime }` clips and the note that Linux and Windows terminals play nothing, `$.settings.read({ key })`.
- Predecessor design: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/SD.md` (SDD-03 to SDD-10 reused).

## AGDF Approval Summary (de; source=en)

Alle Änderungen bleiben im gelieferten Claude-Begleiter, seinen Tests, dem Begleiter-Abschnitt von `INSTALL.md`, der Dateiliste der Integritätsprüfung und den neu erzeugten Nachweisen. Manifest, Begleiter-Beschreibung, gemeinsame Plugin-Definition, gemeinsame Hooks, Copilot-Inventar, Kernmodule und das Format von `RUN_STATE.md` bleiben unverändert.

- Modus und Pfad: Der Leser liest die Mode/Slice Decision nach der Kernregel `modeSliceDecision` (SDD-01). Die Gate-Leiste spiegelt Pfad und Marken der Statuskarte je Modus und fügt in strukturierten Pfaden `CD+Tests` zwischen TP und QA ein, aktuell bei Brownfield Analysis, CD+Tests und CR, erledigt ab QA (SDD-02). Paritätstests gegen `evaluateGateCheck` und `modeSliceDecision` binden beides an den Kern.
- Bauphase: Ein fünfter Zustand „baut“ gilt nach „fertig“, „blockiert“ und „wartet“ und bleibt auch während eines Turns (SDD-03). Die Figur zeigt einen schwingenden Hammer und erscheinende Ziegel nur im 48-px-Zubehörbereich; ein Test berechnet die Schwungextreme; das Standbild hat keine Animation, das Terminal zeigt `(o_o) ⚒` (SDD-04).
- Meldung und Ton: Ein neues Modul `notice.mjs` erkennt Wechsel des gezeigten Runs am Run-Zustand ohne Turn-Overlay; erstes Lesen, Einschalten, Run-Wechsel und veraltete Lesungen setzen nur eine Ausgangslage (SDD-05). Die Meldung nutzt `$.ui.toast` mit Standarddauer; der Ton ist ein im Modul erzeugter, leiser Zwei-Ton-Klang als WAV-Bytes ohne Datei in der Payload, er spielt nur mit Meldung und eingeschaltetem Ton, Fehler bleiben still (SDD-06).
- Statuszeile: `AGDF · {Gate} · {Kurzzustand}` aus dem Run-Zustand, nach jedem geänderten Lesen gesetzt und beim Ausschalten entfernt (SDD-07). Solange der Begleiter an ist, liest er weiter, auch bei geschlossenem Panel; Schließen verbirgt nur das Panel, Ausschalten beendet alles (SDD-08).
- Schalter, Name, Ziel und Sprache: Die Zustandsdatei bekommt `notice` (Standard an) und `sound` (Standard aus), Schema 1, alte Dateien lesen sich mit diesen Standards (SDD-09). Eine zweite Knopfreihe „Meldung aus/an“ und „Ton an/aus“, überall der Name „AGDF Companion“ (SDD-10). Platzhalter-Ziele entfallen nach der Kernregel; ohne AGDF-Konfiguration gilt Claudes Einstellung `language` als Sprachkürzel oder Sprachname, sonst Englisch (SDD-11).
- Isolation und Nachweise: Alle neuen Host-Aufrufe laufen in Fangpfaden; ein fehlender Kanal bleibt stumm. Das neue Modul kommt in die Dateiliste der Integritätsprüfung; Plugin, Kompatibilitätsnachweise und, falls nötig, Budgets und Fingerprints werden über die bestehenden Generatoren erneuert; `INSTALL.md` beschreibt Verhalten und Grenzen (SDD-12). Es kommt keine externe Abhängigkeit hinzu.
- Zuordnung zu den Kriterien: AC-001 bis AC-012 sind je genau einmal Designentscheidungen zugeordnet. Offen für den TP bleiben die Reihenfolge der Host-Probe für Meldung, Statuszeile, Ton und Spracheinstellung, die Testdaten je Modus und das Drehbuch des Live-Tests.
