# UR: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-27
Owner: Arndt Gold
Run: agdf-companion-followup-20261027-01
Language: en

## 1. Problem

Run `agdf-begleiter-companion-20261025-01` delivered the opt-in AGDF companion side panel for Claude (pull request #36, merged into `main` on 2026-10-27). The owner deliberately kept several points out of that run and added further ones after the live recheck of 2026-10-26/27. The shipped companion has these gaps:

1. **No implementation phase in the gate bar.** The bar mirrors the status-card breadcrumb `UR PRD SD TP QA UAT OR`. While a structured run is at Brownfield Analysis, CD+Tests or CR, no mark is current; only the reason line hints at the work.
2. **No visible build activity.** In the same phases the figure looks like any other "working" run.
3. **A fixed seven-gate bar for every mode.** Quick-task runs show `○PRD ○SD ○TP` and, once completed, `✓` for gates that never existed, while the status card shows `UR → Compact Delivery`. Verified-change and blocked routes have the same mismatch.
4. **State changes go unnoticed.** A switch to "waiting for approval" or "blocked" is visible only to someone looking at the panel.
5. **No glanceable state outside the panel.** With the panel closed, or in the terminal, the companion shows nothing.
6. **Two brand names.** The panel is called "AGDF-Begleiter" in German and "AGDF Companion" in English, while the command is `/agdf-companion` in every language.
7. **Live-test findings.** A fresh run shows the template objective "Describe the trustworthy outcome." as its objective, and in a folder without `.agdf/control` the panel speaks English although the user's Claude language is German.

## 2. Goal

A user who has switched the AGDF companion on sees the implementation phase of a structured run in the gate bar and in the figure. The gate bar follows the path the status card shows for the run's mode. The user notices without watching the panel when the shown run starts waiting for an approval or becomes blocked, and sees a compact run status in Claude's status line even with the panel closed and in the terminal. The companion carries one brand name in every language, hides template placeholder objectives and speaks the user's language where no AGDF control folder exists. It stays opt-in, read-only, failure-isolated and Claude-only, as delivered.

## Affected Users

The user working on AGDF delivery in Claude Code with the companion switched on, primarily in the Code tab of the Claude desktop app on Windows and secondarily in the terminal. Claude users of the AGDF plugin who have not switched the companion on notice no change. Codex and Copilot users of AGDF are affected only in that their behavior must stay unchanged.

## 3. Scope

1. **Gate bar: implementation mark.** In structured paths (`structured_delivery`, `structured_slice`) the bar gains a mark `CD+Tests` between `TP` and `QA`. It is current while the run's current gate is Brownfield Analysis, CD+Tests or CR, and done from QA on and for completed runs. The full bar fits 40 columns (the full structured bar is 39 columns); below its width the existing condensed form keeps every mark and names the current one.
2. **"Builds" figure variant.** In the same phases the figure shows a build variant (for example a hammer and stacking bricks) inside the existing accessory region, with a still pose without any animation element, a terminal face (for example `(o_o) ⚒`) and accessory-bounds tests that hold the drawing inside the region. Whether the state label reads "builds" or stays "working", and how the variant combines with the active-turn overlay, is decided in UX intent and PRD. "Waiting" and "blocked" keep precedence over the build variant.
3. **Gate bar per mode.** The bar follows the status card's path for the run's Mode/Slice Decision: `UR PRD SD TP QA UAT OR` for structured paths (plus the mark from item 1), `UR · Verified Change · OR` for verified change, `UR · Compact Delivery` for quick task, `UR · Block` for a blocking decision and `UR` while undecided. Marks agree with the status card for each mode, and no gate outside the mode's path is shown.
4. **Notification on waiting or blocked.** When the run the companion shows switches to "waiting for approval" or "blocked" during the session, a short toast (`$.ui.toast`) names the run, the gate and the state; optionally a soft sound (`$.audio.play`) plays. Owner decision of 2026-10-27: the toast is on and the sound is off by default; both are switched in the panel and persist like the existing choices. The notification only observes: it offers no approval button and no action, because AGDF requires the deliberate reply to the presented version.
5. **Status line.** While the companion is switched on, a compact localized entry such as `AGDF · QA · wartet` appears in Claude's status line (`$.ui.status`), also with the panel closed and in the terminal. Switching the companion off clears it.
6. **One brand name.** Owner decision of 2026-10-27: the companion is called "AGDF Companion" in every language (panel title, command texts, error lines and documentation); the command `/agdf-companion` stays unchanged. "Compagnon" was rejected.
7. **Live-test findings.** A run objective that is a template placeholder (the core's `isDecisionContentPlaceholder` semantics) is not shown. In a folder without `.agdf/control` the companion uses a defined language fallback, such as Claude's own `language` setting, before English.
8. The consequences of changing the plugin payload: regenerated plugin payloads (`npm run build:prepare`), compatibility records (`npm run compatibility:record`, `npm run compatibility:check`), and payload budgets and evaluation fingerprints wherever a contract or template text changes.
9. Automated checks for every item in the companion suites `packages/cli/scripts/claude-companion*-test.js`, native `claude plugin validate` and `claude plugin test` checks, and a live test in the Claude desktop app with screenshots, including toast and status line.
10. Documentation of the new behavior, switches and limits in the existing companion section of `INSTALL.md`.

## 4. Non-Goals

- No change to the core status card: adding a CD+Tests mark there is a separate core change for all hosts.
- No change to AGDF control behavior: contracts, dispatcher, MCP server, the SessionStart hook and the `RUN_STATE.md` format keep their behavior.
- No approvals, gate actions, run continuation or writes to `.agdf/control` from the companion, its toast or its status line.
- No native operating-system notification (`$.ui.notify`) and no spoken output (`$.audio.speak`).
- No companion, toast or status line for Codex, Copilot or OpenCode.
- Not in this run, recorded as later candidates: a run timeline from Approvals and Run Operations, recognition of long checks such as `verify:ci` (for example "checks · for N min" and a hang hint), a cleanup hint for runs untouched for weeks, and a completion animation at OR.
- No public plugin directory submission, npm publication or release. Delivery ends with a pull request from this run's feature branch; merging is not part of this scope.

## 5. Acceptance Signals

1. For a structured run at Brownfield Analysis, CD+Tests and CR the bar shows `✓TP ●CD+Tests ○QA`; from QA on and for completed runs it shows `✓CD+Tests`. The full bar fits 40 columns, and the condensed form applies below the full width.
2. In the same phases the figure shows the build variant inside the accessory region (bounds test), the still pose contains no animation element, the terminal shows the build face, and waiting or blocked runs show their own figure.
3. Quick-task, verified-change, block and undecided runs show exactly the status card's path for their mode; for fixtures of every mode the marks agree with the status card, and no completed quick-task run shows `✓PRD`, `✓SD` or `✓TP`.
4. A switch of the shown run to waiting or blocked during the session raises exactly one toast; repeated reads of the same state and the first read after switching on raise none, and an active turn does not cause repeated toasts. The sound plays only when switched on. Both switches persist across sessions. No toast, status line or panel element approves, continues or writes; run state files stay byte-identical over a test window.
5. While the companion is switched on, the status line shows a compact localized entry on the desktop and in the terminal, also with the panel closed; switching off clears it.
6. Every locale shows "AGDF Companion"; the command `/agdf-companion` is unchanged; `INSTALL.md` uses the name.
7. A fresh run with the template objective shows no objective line; a folder without `.agdf/control` shows the panel in the language of the defined fallback (German on the owner's machine).
8. The companion suites, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record` and `npm run compatibility:check` pass; the repository's verification lanes that cover the companion pass; regenerated evidence is reviewed.
9. A live test in the Claude desktop app on Windows shows, with screenshots: the CD+Tests mark, the build figure, a quick-task bar, a toast, the status line with the panel closed, the brand name and the language fallback. Live evidence stays separate from automated evidence; sound playback is reported as observed, including "not audible" if that is the result.

## 6. Existing Source Of Truth

- The owner decisions of 2026-10-26 and 2026-10-27 for this follow-up: the scope items 1 to 7, the later candidates, the brand name "AGDF Companion", toast on and sound off by default, and observation only without an approval button.
- The completed run `agdf-begleiter-companion-20261025-01`: its approved UR, PRD, SD, TP and UX intent, `UAT_LIVE_RECHECK.md` and `OR.md` under `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/`.
- The companion code under `plugins/agdf/host-templates/claude/companion/` (`register.mjs`, `view.mjs`, `gate-bar.mjs`, `figure.mjs`, `state.mjs`, `run-state.mjs`, `assignment.mjs`, `persistence.mjs`, `localization.mjs`, `locales.json`) and its suites `packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js` and `claude-companion-integrity-test.js`.
- The core status card path `BREADCRUMB_PATH_TEMPLATES` and `buildBreadcrumbPath` in `packages/core/lib/control-evaluation/gate-check.js`, the mode reader `modeSliceDecision` in `packages/core/lib/control-evaluation/run-state-policy.js`, the gate names in `packages/core/lib/control-state/run-steps.js`, and `isDecisionContentPlaceholder` in `packages/core/lib/control-evaluation/decision-content-readiness.js`; all consumed read-only.
- The Claude Code mod API as declared by Claude Code 2.1.308 (early access): `$.ui.toast`, `$.ui.status`, `$.audio.play` and `$.settings.read`.
- `INSTALL.md` (section "Optional AGDF companion panel") and the Context Graph entries `CG-RUN-STATUS-CARD` (companion_projection_20261027), `CG-PUBLIC-PLUGIN-DISTRIBUTION` and `CG-RUN-SCOPED-CONTROL-STATE` in `.agdf/control/CONTEXT_GRAPH.md`.
- The payload and evidence owners: `plugins/agdf/meta/copilot-payload-baseline.json`, `docs/maintenance/payload-budget-history.md`, evaluation fingerprints under `evals/` and the compatibility records.

## 7. Risks And Unknowns

- `$.audio.play` plays nothing in Linux and Windows terminals according to the API declaration; whether the desktop app plays a clip on Windows is unknown until the live test. The sound source (a small asset in the plugin or bytes generated in the module) affects the payload.
- Toast and status line are declared by the mod API but not yet observed live in the desktop app; where the desktop draws the status line is unknown.
- A status line with the panel closed needs the refresh to continue while the pane is hidden, which changes the delivered rule that closing the pane stops the refresh for the session; refresh cost with many runs must stay bounded.
- Notification noise: the first read, run switching by assignment, several sessions on one repository, and the active-turn overlay (which shows "working" during every turn) must not raise repeated toasts; transitions must be judged on the run-derived state.
- Whether "builds" is a fifth state label or a variant of "working", its precedence over the active-turn overlay and its animation inside the 48 px accessory region (an earlier scratch sketch crossed it) are UX and PRD decisions.
- Reading the Mode/Slice Decision must match the core (`modeSliceDecision`): values in backticks, multi-line scope reasons, placeholders and legacy runs with `not_applicable` approvals. The gate name "Verified Change" contains a space, which the condensed form must handle within 40 columns.
- Claude's `language` setting is free text (for example `de` or `German`); its mapping to the companion's locales must be defined.
- The brand name changes texts from the approved UX intent of the previous run; tests and documentation that assert the old titles change with it.
- The payload change chain (generated plugin, compatibility records, possibly payload budgets and evaluation fingerprints) adds effort, and native Claude evidence goes stale.
- The mod API is early access and may change between Claude Code releases. The desktop draws a Button's `label` while the `claude plugin test` engine draws its children, so layout must be checked live.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After `Approval: UR`, Brownfield Review records the Mode/Slice Decision; UX intent clarification follows for the new visible states (build variant, toast, status line) before PRD.

## AGDF Approval Summary (de; source=en)

Der Run `agdf-begleiter-companion-20261025-01` hat den optionalen AGDF-Begleiter als Seitenpanel für Claude geliefert (PR #36, am 2026-10-27 in `main` gemergt). Einige Punkte hat der Owner bewusst aus diesem Run herausgehalten und nach dem Live-Test vom 2026-10-26/27 ergänzt. Heute fehlen: eine Marke für die Umsetzungsphase in der Gate-Leiste (bei Brownfield Analysis, CD+Tests und CR ist kein Punkt aktuell), eine sichtbare Bau-Aktivität der Figur, eine Gate-Leiste je Modus (Quick-Task-Runs zeigen `○PRD ○SD ○TP` und nach Abschluss Häkchen für nie vorhandene Gates, die Statuskarte dagegen `UR → Compact Delivery`), ein Hinweis beim Wechsel auf „wartet auf Freigabe“ oder „blockiert“, ein Status außerhalb des Panels, ein einheitlicher Markenname statt „AGDF-Begleiter“/„AGDF Companion“ sowie zwei Live-Befunde: Das Vorlagenziel „Describe the trustworthy outcome.“ wird angezeigt, und in einem Ordner ohne `.agdf/control` spricht das Panel Englisch.

Ziel ist, dass ein Anwender mit eingeschaltetem Begleiter die Umsetzungsphase eines strukturierten Runs in Gate-Leiste und Figur sieht, die Gate-Leiste dem Pfad der Statuskarte für den Modus folgt, ein Wechsel des gezeigten Runs auf „wartet auf Freigabe“ oder „blockiert“ ohne Blick ins Panel auffällt und ein knapper Status in der Claude-Statuszeile steht, auch bei geschlossenem Panel und im Terminal. Der Begleiter trägt einen Namen in allen Sprachen, blendet Vorlagenziele aus und spricht ohne Kontrollordner die Sprache des Anwenders. Er bleibt Opt-in, rein lesend, fehlerisoliert und nur für Claude. Betroffen ist vor allem der Anwender mit eingeschaltetem Begleiter im Code-Tab der Desktop-App unter Windows, nachrangig im Terminal; wer ihn nicht einschaltet, merkt nichts, Codex- und Copilot-Anwender bleiben unberührt.

Zum Umfang gehören:
- Gate-Leiste: eine Marke `CD+Tests` zwischen TP und QA in strukturierten Pfaden, aktuell bei Brownfield Analysis, CD+Tests und CR, erledigt ab QA und bei abgeschlossenen Runs; die volle Leiste passt in 40 Spalten (39 Spalten im strukturierten Pfad), darunter gilt die bestehende Kurzform.
- „baut“-Variante der Figur in denselben Phasen: Hammer und Ziegel im bestehenden Zubehörbereich, Standbild ohne Animationselement, Terminal-Gesicht wie `(o_o) ⚒` und Grenztests für das Zubehör; ob der Zustandsname „baut“ lautet oder „läuft“ bleibt und wie die Variante mit dem Turn-Overlay zusammenspielt, entscheiden UX-Intent und PRD; „wartet“ und „blockiert“ haben Vorrang.
- Gate-Leiste je Modus wie die Statuskarte: strukturierte Pfade `UR PRD SD TP QA UAT OR` plus CD+Tests-Marke, Verified Change `UR · Verified Change · OR`, Quick Task `UR · Compact Delivery`, Block `UR · Block`, unentschieden nur `UR`; die Marken stimmen je Modus mit der Statuskarte überein.
- Meldung beim Wechsel des gezeigten Runs auf „wartet auf Freigabe“ oder „blockiert“ als kurze Toast-Meldung (`$.ui.toast`) mit Run, Gate und Zustand, optional mit leisem Ton (`$.audio.play`); nach Owner-Entscheidung vom 2026-10-27 ist die Meldung standardmäßig an und der Ton aus, beides im Panel schaltbar und dauerhaft gespeichert; nur beobachtend, ohne Freigabe-Button und ohne Aktion, weil AGDF die bewusste Antwort auf die gezeigte Vorlage verlangt.
- Statuszeile: solange der Begleiter eingeschaltet ist, ein knapper lokalisierter Eintrag wie `AGDF · QA · wartet` (`$.ui.status`), auch bei geschlossenem Panel und im Terminal; Ausschalten entfernt ihn.
- Markenname nach Owner-Entscheidung vom 2026-10-27: „AGDF Companion“ in allen Sprachen (Panel-Titel, Befehlstexte, Fehlerzeilen, Dokumentation); der Befehl `/agdf-companion` bleibt; „Compagnon“ ist verworfen.
- Live-Befunde: Ein Vorlagen-Platzhalter als Ziel (Semantik von `isDecisionContentPlaceholder` im Kern) wird nicht angezeigt; ohne `.agdf/control` gilt ein festgelegter Sprach-Rückfall, etwa die Claude-Einstellung `language`, vor Englisch.
- die Folgen der Payload-Änderung: neu erzeugtes Plugin (`npm run build:prepare`), Kompatibilitätsnachweise (`npm run compatibility:record`, `npm run compatibility:check`) sowie Payload-Budgets und Eval-Fingerprints, falls Vertrags- oder Vorlagentexte sich ändern.
- automatische Prüfungen für jeden Punkt in den Begleiter-Suiten `packages/cli/scripts/claude-companion*-test.js`, native Prüfungen mit `claude plugin validate` und `claude plugin test` und ein Live-Test in der Desktop-App mit Screenshots, auch von Meldung und Statuszeile.
- Dokumentation von Verhalten, Schaltern und Grenzen im bestehenden Begleiter-Abschnitt von `INSTALL.md`.

Nicht enthalten sind:
- eine Änderung der Statuskarte im Kern; eine CD+Tests-Marke dort ist eine eigene Kernänderung für alle Hosts.
- Änderungen am Steuerungsverhalten von AGDF: Verträge, Dispatcher, MCP-Server, SessionStart-Hook und das Format von `RUN_STATE.md` bleiben unverändert.
- Freigaben, Gate-Aktionen, Run-Fortsetzung oder Schreibzugriffe auf `.agdf/control` durch Begleiter, Meldung oder Statuszeile.
- native Betriebssystem-Benachrichtigungen (`$.ui.notify`) und Sprachausgabe (`$.audio.speak`).
- Begleiter, Meldung oder Statuszeile für Codex, Copilot oder OpenCode.
- die späteren Kandidaten: Zeitleiste des Runs, Erkennen langer Prüfungen wie `verify:ci` (etwa „prüft · seit N min“ mit Hänger-Hinweis), Aufräumhinweis für lange unberührte Runs und Abschluss-Animation bei OR.
- Einreichung in ein öffentliches Plugin-Verzeichnis, npm-Veröffentlichung oder Release; die Lieferung endet mit einem Pull Request vom Feature-Branch dieses Runs, ohne Merge.

Abnahmefähig ist der Umfang unter neun Bedingungen:
- Ein strukturierter Run bei Brownfield Analysis, CD+Tests und CR zeigt `✓TP ●CD+Tests ○QA`, ab QA und nach Abschluss `✓CD+Tests`; die volle Leiste passt in 40 Spalten, darunter gilt die Kurzform.
- In denselben Phasen zeigt die Figur die Bau-Variante innerhalb des Zubehörbereichs (Grenztest), das Standbild enthält kein Animationselement, das Terminal zeigt das Bau-Gesicht, und wartende oder blockierte Runs zeigen ihre eigene Figur.
- Quick-Task-, Verified-Change-, Block- und unentschiedene Runs zeigen genau den Pfad der Statuskarte für ihren Modus; die Marken stimmen für Testdaten jedes Modus mit der Statuskarte überein, und kein abgeschlossener Quick-Task-Run zeigt `✓PRD`, `✓SD` oder `✓TP`.
- Ein Wechsel des gezeigten Runs auf „wartet“ oder „blockiert“ während der Session löst genau eine Meldung aus; wiederholtes Lesen desselben Zustands, das erste Lesen nach dem Einschalten und aktive Turns lösen keine aus. Der Ton spielt nur, wenn er eingeschaltet ist. Beide Schalter bleiben über Sessions erhalten. Kein Element gibt frei, setzt fort oder schreibt; Run-Dateien bleiben über ein Testfenster byteidentisch.
- Solange der Begleiter eingeschaltet ist, zeigt die Statuszeile auf dem Desktop und im Terminal einen knappen lokalisierten Eintrag, auch bei geschlossenem Panel; Ausschalten entfernt ihn.
- Alle Sprachen zeigen „AGDF Companion“, der Befehl `/agdf-companion` bleibt, `INSTALL.md` verwendet den Namen.
- Ein frischer Run mit Vorlagenziel zeigt keine Zielzeile; ein Ordner ohne `.agdf/control` zeigt das Panel in der Sprache des festgelegten Rückfalls (auf dem Rechner des Owners Deutsch).
- Begleiter-Suiten, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record` und `npm run compatibility:check` bestehen; die Verifikations-Lanes mit dem Begleiter bestehen; neu erzeugte Nachweise sind geprüft.
- Ein Live-Test in der Desktop-App unter Windows belegt mit Screenshots die CD+Tests-Marke, die Bau-Figur, eine Quick-Task-Leiste, eine Meldung, die Statuszeile bei geschlossenem Panel, den Markennamen und den Sprach-Rückfall; Live-Nachweise bleiben von automatischen getrennt, und die Tonwiedergabe wird so berichtet, wie sie beobachtet wurde, auch als „nicht hörbar“.

Maßgebliche Quellen sind:
- die Owner-Entscheidungen vom 2026-10-26 und 2026-10-27: Umfangspunkte 1 bis 7, spätere Kandidaten, Markenname „AGDF Companion“, Meldung an und Ton aus als Voreinstellung, nur beobachtend ohne Freigabe-Button.
- der abgeschlossene Run `agdf-begleiter-companion-20261025-01` mit freigegebenen UR, PRD, SD, TP und UX-Intent sowie `UAT_LIVE_RECHECK.md` und `OR.md`.
- der Begleiter-Code unter `plugins/agdf/host-templates/claude/companion/` und seine Suiten `claude-companion-test.js`, `claude-companion-adapter-test.js` und `claude-companion-integrity-test.js` unter `packages/cli/scripts/`.
- im Kern, nur lesend genutzt: der Statuskarten-Pfad `BREADCRUMB_PATH_TEMPLATES` und `buildBreadcrumbPath` in `gate-check.js`, `modeSliceDecision` in `run-state-policy.js`, die Gate-Namen in `run-steps.js` und `isDecisionContentPlaceholder` in `decision-content-readiness.js`.
- die Mod-API von Claude Code 2.1.308 (Early Access): `$.ui.toast`, `$.ui.status`, `$.audio.play` und `$.settings.read`.
- `INSTALL.md` (Abschnitt „Optional AGDF companion panel“) und die Context-Graph-Einträge `CG-RUN-STATUS-CARD` (companion_projection_20261027), `CG-PUBLIC-PLUGIN-DISTRIBUTION` und `CG-RUN-SCOPED-CONTROL-STATE`.
- die Payload- und Nachweis-Eigentümer: `copilot-payload-baseline.json`, `payload-budget-history.md`, Eval-Fingerprints unter `evals/` und die Kompatibilitätsnachweise.

Offene Punkte für Brownfield Review, UX-Intent, PRD und SD:
- `$.audio.play` spielt laut API-Deklaration in Linux- und Windows-Terminals nichts ab; ob die Desktop-App unter Windows einen Klang abspielt, zeigt erst der Live-Test. Die Tonquelle (kleine Datei im Plugin oder im Modul erzeugte Bytes) wirkt auf die Payload.
- Meldung und Statuszeile sind in der API deklariert, aber noch nicht live in der Desktop-App beobachtet; wo der Desktop die Statuszeile zeigt, ist offen.
- Eine Statuszeile bei geschlossenem Panel verlangt, dass das Neulesen auch bei verborgenem Panel weiterläuft; das ändert die gelieferte Regel, dass Schließen das Neulesen für die Session beendet, und der Lesezeitbedarf bei vielen Runs muss begrenzt bleiben.
- Meldungsflut vermeiden: erstes Lesen, Run-Wechsel durch die Zuordnung, mehrere Sessions im selben Repository und das Turn-Overlay (zeigt bei jedem Turn „läuft“) dürfen keine wiederholten Meldungen auslösen; Wechsel werden am aus dem Run abgeleiteten Zustand beurteilt.
- Ob „baut“ ein fünfter Zustandsname oder eine Variante von „läuft“ ist, ihr Vorrang vor dem Turn-Overlay und die Animation innerhalb des 48-px-Zubehörbereichs (eine frühere Skizze ragte hinaus) sind UX- und PRD-Entscheidungen.
- Das Lesen der Mode/Slice Decision muss dem Kern (`modeSliceDecision`) folgen: Werte in Backticks, mehrzeilige Begründungen, Platzhalter und ältere Runs mit `not_applicable`-Freigaben. „Verified Change“ enthält ein Leerzeichen, das die Kurzform in 40 Spalten verkraften muss.
- Die Claude-Einstellung `language` ist Freitext (etwa `de` oder `German`); die Abbildung auf die Sprachen des Begleiters ist festzulegen.
- Der Markenname ändert Texte aus dem freigegebenen UX-Intent des Vorgänger-Runs; Tests und Dokumentation mit den alten Titeln ändern sich mit.
- Die Folgekette der Payload-Änderung (erzeugtes Plugin, Kompatibilitätsnachweise, gegebenenfalls Payload-Budgets und Eval-Fingerprints) kostet Aufwand, und native Claude-Nachweise veralten.
- Die Mod-API ist Early Access und kann sich zwischen Claude-Code-Versionen ändern. Der Desktop zeichnet das `label` eines Buttons, die Testumgebung von `claude plugin test` dessen Kinder; das Layout wird daher live geprüft.

Nächster Schritt nach `Approval: UR` ist Brownfield Review mit Mode/Slice Decision, danach UX-Intent-Klärung für die neuen sichtbaren Zustände (Bau-Variante, Meldung, Statuszeile) vor der PRD.
