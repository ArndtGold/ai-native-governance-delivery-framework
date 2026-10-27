# UR: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-25
Owner: Arndt Gold
Run: agdf-begleiter-companion-20261025-01
Language: en

## 1. Problem

While AGDF delivery runs in Claude Code, the state of a run (current gate, pending approval, blocking decision, completion) is visible only when the agent renders a status card or the user asks for it. The user wants a glanceable, always-visible companion comparable to Codex Pets that shows this state per run. Codex Pets cannot carry AGDF state: their states are owned by Codex and no plugin, hook or MCP interface is documented. Claude Code mods (function hooks modules) can draw a side panel with an animated SVG figure in the Claude desktop app.

A prototype mod `agdf-begleiter` was built outside this repository on 2026-10-25. It passed `claude plugin validate`, a TypeScript check and 5 of 5 `claude plugin test` cases, and it was seen working in a Claude desktop test session against this repository's real runs. The panel test showed five findings:

1. The gate bar wraps onto a second line (monospace font plus separators).
2. The hourglass accessory of the "waiting" figure overlaps the figure's right ear.
3. The panel mixes languages: German labels, English texts taken from `RUN_STATE.md`.
4. The panel shows the most recently updated open run ("1 of 56 open runs"), not the run the session works on.
5. The run objective takes three lines of the panel.

The prototype is not part of AGDF and is not distributed. The user decided to ship the companion inside the AGDF plugin for Claude rather than as a separate plugin, and to leave Codex out.

## 2. Goal

A user who installs AGDF in Claude Code receives the companion with the AGDF plugin and can switch it on deliberately. Once switched on, the Claude desktop app shows a side panel with an animated figure and a compact status for the run worked on in that session, updated after each turn. Users who do not switch it on notice no change. Codex and Copilot installations of AGDF behave exactly as before, and a failure of the companion never impairs AGDF's control functions.

## Affected Users

The user working on AGDF delivery in Claude Code, primarily in the Code tab of the Claude desktop app and secondarily in the terminal, starting with the current Windows environment. Every Claude user of the AGDF plugin receives the companion files but sees no change until opting in. Codex and Copilot users of AGDF are affected only in that their behavior must stay unchanged. OpenCode is not addressed.

## 3. Scope

- Ship the companion inside the AGDF plugin and wire it in only through the Claude manifest `.claude-plugin/plugin.json`, the way that manifest already wires the Claude-only `mcp/claude.mcp.json`. The Codex manifest `.codex-plugin/plugin.json`, the Copilot plugin payload and the shared `hooks/hooks.json` do not reference the companion; companion files that are present in the shared plugin folder stay without effect for those hosts.
- Opt-in: the panel never opens unasked. The user switches the companion on deliberately (by a slash command or a plugin setting; the exact mechanism is decided in PRD), the choice persists, and switching it off closes the panel and stops its refresh.
- Failure isolation: if the companion cannot load or fails at run time (for example on an incompatible Claude Code version or after a change of the early-access mod API), the AGDF dispatcher, MCP server, SessionStart hook and skills keep working unchanged.
- A side panel drawn by the mod: an animated SVG figure with four states, state label, one-line reason, one-line gate bar, run identity, objective and next allowed step. The states are:
  - **läuft**: a main-loop turn is active, or the run is in progress without a pending approval;
  - **wartet auf Freigabe**: the run names a pending gate approval such as `Approval: QA`, or awaits a decision;
  - **blockiert**: the run's decision is `revise`, `block`, `blocked` or `decline`;
  - **fertig**: the run's lifecycle is `completed`.
- A control to switch the figure to a still pose, a text fallback for the terminal surface, and a slash command that opens the panel.
- Status is read only from `.agdf/control/runs/*/RUN_STATE.md` of the session's project. It refreshes after each main-loop turn, on demand and on a bounded timer while switched on. The companion never writes control state, never requests or records approvals and never continues a run.
- Run assignment for display: the panel follows the run whose `RUN_STATE.md` changes during the current session; otherwise it shows the user's explicit selection, remembered per project. The user can step through open runs. This assignment is for display only and never binds AGDF delivery.
- Resolve or explicitly decide each of the five panel findings: a single-line gate bar at the default panel width, accessories that do not overlap the figure, a defined language policy for panel labels versus run-derived texts, the run assignment above, and a one-line objective with optional expansion.
- The consequences of changing the plugin payload: regenerated generated plugin payloads, payload budgets and baselines, evaluation fingerprints and compatibility records, and renewed native Claude host evidence where the change makes existing evidence stale.
- Automated checks for parsing, state rules, run assignment, rendering on the desktop and terminal surfaces, opt-in behavior and failure isolation, integrated into the repository's verification, plus a live check in the Claude desktop app.
- Documentation of switching the companion on and off, supported surfaces and limits.

## 4. Non-Goals

- No change to AGDF control behavior: contracts, dispatcher, MCP server, the SessionStart hook and the `RUN_STATE.md` format keep their behavior. A session-to-run binding inside the AGDF core is a possible later run, not part of this one.
- No companion or status line for Codex, Copilot or OpenCode, no integration with Codex Pets and no Stop-hook status line.
- No separate companion plugin and no additional marketplace entry.
- No approvals, gate actions, run continuation or writes to `.agdf/control` from the companion.
- No overview of all runs or the master backlog beyond stepping through open runs.
- No public plugin directory submission, npm publication or release. Delivery ends with a pull request from branch `feat/agdf-begleiter`; merging is not part of this scope.
- No transfer of approvals or evidence from other runs.

## 5. Acceptance Signals

1. After installing AGDF in Claude Code, the companion is available but not shown. Switching it on opens the panel; switching it off closes it and stops its refresh. Uninstalling AGDF leaves no companion data or settings behind.
2. The Codex manifest, the Copilot payload and the shared `hooks/hooks.json` carry no companion reference. Codex and Copilot installation, hook trust state and existing checks are unchanged.
3. With the companion failing to load or failing at run time, AGDF dispatch, MCP tools and the SessionStart hook still work; an automated check demonstrates this.
4. In a real Claude desktop session on the user's Windows machine, the switched-on panel shows the animated figure, state label, reason, a single-line gate bar, run identity, a one-line objective and the next step. All four states are reproducible from test fixtures, and the still pose works.
5. With several open runs in the project, the panel follows the run changed in the current session, and an explicit selection persists per project across sessions. Run state files stay byte-identical over a test window.
6. Each of the five panel findings is resolved, or decided with a recorded rationale, and evidenced by a screenshot at the default panel width.
7. Plugin validation, type checking and the companion's tests run in the repository's verification and pass; existing repository checks still pass; regenerated baselines, fingerprints and payload budgets are reviewed and their growth is recorded.
8. Documentation states how to switch the companion on and off, supported surfaces and limits (Claude desktop focus, terminal fallback, early-access mod API) and keeps live-host evidence separate from automated evidence.

## 6. Existing Source Of Truth

- The user's requests in this conversation: a Codex-Pets-like per-run status, the desktop mod prototype, the panel screenshot and its findings, the run-assignment rule, Codex excluded, the companion inside the Claude projection of the AGDF plugin (Claude manifest only, opt-in, failures isolated, no effect on Codex and Copilot payloads), a feature branch and a pull request at the end.
- The prototype outside the repository (`agdf-begleiter` in the session's Claude dev-mods folder: hooks module, `RUN_STATE.md` parser, figure renderer, state contract and tests) as reference implementation only.
- The Claude Code mod API as declared by Claude Code 2.1.308 (plugin-authoring reference and type declarations; marked early access).
- The canonical plugin source `plugins/agdf/`, used by both the Claude manifest `.claude-plugin/plugin.json` (which already wires `./mcp/claude.mcp.json` for Claude only) and the Codex manifest `.codex-plugin/plugin.json`; the shared SessionStart hook `plugins/agdf/host-templates/shared/hooks/hooks.json`; the Copilot projection under `packages/cli/generated/plugins/copilot/agdf` built through `scripts/public-plugin/copilot-profile.js`.
- The Claude installer and marketplace owners `packages/cli/lib/host-adapters/claude/plugin.js`, `packages/cli/lib/host-adapters/claude/marketplace.js` and `packages/cli/lib/installers/local-marketplace.js`.
- Payload and evidence owners that react to plugin changes: `docs/maintenance/payload-budget-history.md`, evaluation fingerprints under `evals/` and the compatibility records.
- The `RUN_STATE.md` format written by the AGDF core under `packages/core/`, consumed read-only.
- Native observations of 2026-10-25 (Stop-hook `systemMessage` rendering in Claude, Codex Pets capabilities) as background evidence.
- Normative contracts under `plugins/agdf/meta/contracts/` for activation, approvals and run binding.

## 7. Risks And Unknowns

- Whether a hooks file referenced only from `.claude-plugin/plugin.json` may declare a mod (`modules`), or which other Claude-only wiring is possible without touching the shared `hooks/hooks.json`. Brownfield Review must establish this.
- Whether Claude-only files in the shared plugin folder change digests or provenance checks that Codex or Copilot evaluate, and how to keep them without effect there.
- The opt-in mechanism: a slash command alone, a plugin setting, or both, and how the choice persists; a PRD decision.
- The mod API is early access and may change between Claude Code releases; supported versions, the behavior on an incompatible host and the evidence for failure isolation must be defined.
- The payload change chain: regenerated baselines and fingerprints, payload budget growth and stale native Claude evidence add effort to this run.
- Reliable detection of "the run that changes in this session": comparison against session start, several sessions on the same repository, and runs changed by another session.
- Language policy for English run-derived texts in a German panel (for example localized summaries or status-card fields); a UX and PRD decision.
- Refresh cost with many runs: the prototype read 144 `RUN_STATE.md` files in about 240 ms at session start.
- Visual behavior is verifiable only in the desktop app; SMIL animation does not follow the operating system's reduced-motion setting, so the still pose is the accessible fallback.
- Loading behavior of mods in an installed plugin and possible trust prompts.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Während AGDF-Arbeit in Claude Code läuft, ist der Zustand eines Runs (aktuelles Gate, offene Freigabe, blockierende Entscheidung, Abschluss) nur sichtbar, wenn der Agent eine Statuskarte zeigt oder der Anwender nachfragt. Gewünscht ist ein ständig sichtbarer Begleiter wie die Codex Pets, der diesen Zustand pro Run zeigt. Codex Pets können das nicht: Ihre Zustände gehören Codex, und es gibt keine dokumentierte Schnittstelle für Plugins, Hooks oder MCP. Claude-Code-Mods können dagegen in der Claude-Desktop-App ein Seitenpanel mit animierter SVG-Figur zeigen. Ein Prototyp außerhalb des Repositorys wurde am 2026-10-25 gebaut, geprüft (Validierung, Typprüfung, 5 von 5 Tests) und in einer Desktop-Testsession mit den echten Runs gesehen. Der Panel-Test zeigte fünf Befunde: Die Gate-Leiste bricht um, die Sanduhr überdeckt das rechte Ohr, Panel-Texte sind deutsch und Run-Texte englisch, das Panel zeigt den zuletzt geänderten offenen Run statt des Runs der Session, und das Ziel belegt drei Zeilen. Der Anwender hat entschieden, den Begleiter im AGDF-Plugin für Claude auszuliefern statt als eigenes Plugin, und Codex auszuschließen.

Ziel ist, dass ein Anwender mit der AGDF-Installation in Claude Code den Begleiter mitbekommt und ihn bewusst einschalten kann. Eingeschaltet zeigt die Claude-Desktop-App ein Seitenpanel mit animierter Figur und kompaktem Status für den Run, an dem in der Session gearbeitet wird, aktualisiert nach jedem Turn. Wer ihn nicht einschaltet, merkt keinen Unterschied. Codex- und Copilot-Installationen von AGDF verhalten sich unverändert, und ein Fehler des Begleiters beeinträchtigt nie die Steuerungsfunktionen von AGDF. Betroffen ist vor allem der Anwender im Code-Tab der Desktop-App unter Windows, nachrangig im Terminal. Jeder Claude-Anwender erhält die Dateien des Begleiters, sieht aber ohne Einschalten keine Änderung.

Zum Umfang gehören:
- der Begleiter im AGDF-Plugin, eingebunden nur über das Claude-Manifest `.claude-plugin/plugin.json`, so wie dieses heute schon `mcp/claude.mcp.json` nur für Claude einbindet; Codex-Manifest, Copilot-Payload und die gemeinsame `hooks/hooks.json` verweisen nicht auf den Begleiter, seine Dateien bleiben für diese Hosts wirkungslos;
- Opt-in: Das Panel öffnet sich nie ungefragt; der Anwender schaltet den Begleiter bewusst ein (per Slash-Befehl oder Plugin-Einstellung, Festlegung in der PRD), die Wahl bleibt erhalten, Ausschalten schließt das Panel und beendet das Neulesen;
- Fehlerisolation: Lädt der Begleiter nicht oder scheitert er zur Laufzeit, etwa auf einer inkompatiblen Claude-Code-Version oder nach einer Änderung der Early-Access-API, arbeiten Dispatcher, MCP-Server, SessionStart-Hook und Skills unverändert;
- ein Seitenpanel per Mod mit animierter Figur und vier Zuständen: „läuft“ (Turn aktiv oder Run in Arbeit ohne offene Freigabe), „wartet auf Freigabe“ (offene Gate-Freigabe wie `Approval: QA` oder ausstehende Entscheidung), „blockiert“ (Entscheidung `revise`, `block`, `blocked` oder `decline`) und „fertig“ (Lebenszyklus `completed`); dazu Zustandsname, einzeilige Begründung, einzeilige Gate-Leiste, Run-Kennung, Ziel und nächster erlaubter Schritt;
- ein Schalter für ein Standbild, eine Textdarstellung im Terminal und ein Slash-Befehl zum Öffnen;
- rein lesender Zugriff auf `.agdf/control/runs/*/RUN_STATE.md` des Projekts der Session, aktualisiert nach jedem Turn, auf Knopfdruck und in begrenztem Takt, solange eingeschaltet; kein Schreiben von Kontrollzustand, keine Freigaben, keine Run-Fortsetzung;
- eine Run-Zuordnung nur für die Anzeige: Das Panel folgt dem Run, dessen `RUN_STATE.md` sich in der laufenden Session ändert, sonst der pro Projekt gemerkten Auswahl; offene Runs lassen sich durchblättern; die Zuordnung bindet keine AGDF-Lieferung;
- die fünf Panel-Befunde: einzeilige Gate-Leiste bei Standardbreite, keine Überdeckung der Figur, eine festgelegte Sprachregel für Panel- und Run-Texte, die Run-Zuordnung wie oben und ein einzeiliges, aufklappbares Ziel;
- die Folgen der Payload-Änderung: neu erzeugte Plugin-Payloads, Payload-Budgets und Basislinien, Eval-Fingerprints und Kompatibilitätsnachweise sowie erneuerte native Claude-Nachweise, wo bestehende Nachweise veralten;
- automatische Prüfungen (Auslesen, Zustandsregeln, Zuordnung, Darstellung auf Desktop und Terminal, Opt-in, Fehlerisolation) in der Repository-Verifikation sowie ein Live-Test in der Desktop-App;
- Dokumentation von Ein- und Ausschalten, unterstützten Oberflächen und Grenzen.

Nicht enthalten sind:
- Änderungen am Steuerungsverhalten von AGDF: Verträge, Dispatcher, MCP-Server, SessionStart-Hook und das Format von `RUN_STATE.md` bleiben in ihrem Verhalten unverändert; eine Zuordnung von Session zu Run im Kern wäre ein späterer Run;
- Begleiter oder Statuszeile für Codex, Copilot oder OpenCode, eine Anbindung an Codex Pets und eine Stop-Hook-Statuszeile;
- ein eigenes Begleiter-Plugin oder ein zusätzlicher Marketplace-Eintrag;
- Freigaben, Gate-Aktionen, Run-Fortsetzung oder Schreibzugriffe auf `.agdf/control` durch den Begleiter;
- eine Übersicht über alle Runs oder das Master-Backlog über das Durchblättern offener Runs hinaus;
- Einreichung in ein öffentliches Plugin-Verzeichnis, npm-Veröffentlichung oder Release; die Lieferung endet mit einem Pull Request vom Branch `feat/agdf-begleiter`, ohne Merge;
- eine Übernahme von Freigaben oder Nachweisen aus anderen Runs.

Abnahmefähig ist der Umfang unter acht Bedingungen:
- Nach der AGDF-Installation in Claude Code ist der Begleiter verfügbar, aber nicht sichtbar. Einschalten öffnet das Panel, Ausschalten schließt es und beendet das Neulesen. Eine Deinstallation von AGDF hinterlässt keine Daten oder Einstellungen des Begleiters.
- Codex-Manifest, Copilot-Payload und die gemeinsame `hooks/hooks.json` enthalten keinen Verweis auf den Begleiter. Installation, Hook-Vertrauensstatus und bestehende Prüfungen von Codex und Copilot sind unverändert.
- Lädt der Begleiter nicht oder scheitert er zur Laufzeit, funktionieren AGDF-Dispatch, MCP-Werkzeuge und SessionStart-Hook weiter; eine automatische Prüfung belegt das.
- In einer echten Desktop-Session unter Windows zeigt das eingeschaltete Panel die animierte Figur, Zustandsname, Begründung, eine einzeilige Gate-Leiste, Run-Kennung, ein einzeiliges Ziel und den nächsten Schritt. Alle vier Zustände sind aus Testdaten reproduzierbar, das Standbild funktioniert.
- Bei mehreren offenen Runs folgt das Panel dem in der Session geänderten Run, eine ausdrückliche Auswahl bleibt pro Projekt über Sessions erhalten. Die Run-Dateien bleiben über ein Testfenster byteidentisch.
- Jeder der fünf Panel-Befunde ist behoben oder mit Begründung entschieden und per Screenshot bei Standardbreite belegt.
- Plugin-Validierung, Typprüfung und die Tests des Begleiters laufen in der Repository-Verifikation und bestehen; die bestehenden Prüfungen bestehen weiterhin; neu erzeugte Basislinien, Fingerprints und Payload-Budgets sind geprüft und ihr Zuwachs ist festgehalten.
- Die Dokumentation nennt Ein- und Ausschalten, unterstützte Oberflächen und Grenzen (Schwerpunkt Desktop-App, Text im Terminal, Early-Access-API) und trennt Live-Nachweise von automatischen Nachweisen.

Maßgebliche Quellen sind:
- die Anforderungen des Anwenders aus diesem Gespräch: Status pro Run wie Codex Pets, der Desktop-Mod-Prototyp, der Panel-Screenshot mit den Befunden, die Zuordnungsregel, der Ausschluss von Codex, der Begleiter in der Claude-Projektion des AGDF-Plugins (nur Claude-Manifest, Opt-in, Fehler isoliert, ohne Wirkung auf Codex- und Copilot-Payload), Feature-Branch und Pull Request;
- der Prototyp im Mod-Ordner der Session, nur als Referenz;
- die Mod-API von Claude Code 2.1.308 (Early Access);
- die Plugin-Quelle `plugins/agdf/`, die vom Claude-Manifest `.claude-plugin/plugin.json` (bindet heute schon `./mcp/claude.mcp.json` nur für Claude ein) und vom Codex-Manifest `.codex-plugin/plugin.json` gemeinsam genutzt wird, der gemeinsame SessionStart-Hook `plugins/agdf/host-templates/shared/hooks/hooks.json` und die Copilot-Projektion unter `packages/cli/generated/plugins/copilot/agdf` aus `scripts/public-plugin/copilot-profile.js`;
- Claude-Installer und Marketplace in `packages/cli/lib/host-adapters/claude/plugin.js`, `packages/cli/lib/host-adapters/claude/marketplace.js` und `packages/cli/lib/installers/local-marketplace.js`;
- die Payload- und Nachweis-Eigentümer `docs/maintenance/payload-budget-history.md`, die Eval-Fingerprints unter `evals/` und die Kompatibilitätsnachweise;
- das Format von `RUN_STATE.md` aus `packages/core/`, nur lesend genutzt;
- die nativen Beobachtungen vom 2026-10-25 zu Stop-Hook und Codex Pets als Hintergrund;
- die Runtime-Verträge unter `plugins/agdf/meta/contracts/`.

Offene Punkte für Brownfield Review, PRD und SD:
- Ob eine nur in `.claude-plugin/plugin.json` eingebundene Hooks-Datei einen Mod (`modules`) laden darf, oder welche andere Einbindung nur für Claude möglich ist, ohne die gemeinsame `hooks/hooks.json` zu ändern.
- Ob Claude-spezifische Dateien im gemeinsamen Plugin-Ordner Digests oder Herkunftsprüfungen von Codex oder Copilot verändern, und wie sie dort wirkungslos bleiben.
- Der Opt-in-Weg: nur Slash-Befehl, Plugin-Einstellung oder beides, und wie die Wahl erhalten bleibt; eine PRD-Entscheidung.
- Die Mod-API ist Early Access; unterstützte Versionen, das Verhalten auf inkompatiblen Hosts und der Nachweis der Fehlerisolation sind festzulegen.
- Die Folgekette der Payload-Änderung: neue Basislinien und Fingerprints, wachsendes Payload-Budget und veraltete native Claude-Nachweise erhöhen den Aufwand dieses Runs.
- Wie „der Run, der sich in der Session ändert“ verlässlich erkannt wird, auch bei mehreren Sessions im selben Repository oder Änderungen durch eine andere Session.
- Die Sprachregel für englische Run-Texte im deutschen Panel ist eine UX- und PRD-Entscheidung.
- Der Lesezeitbedarf bei vielen Runs: Der Prototyp las 144 Dateien in etwa 240 ms.
- Die Darstellung ist nur in der Desktop-App prüfbar; SMIL-Animationen folgen nicht der Systemeinstellung „Bewegung reduzieren“, daher ist das Standbild der barrierearme Rückfall.
- Das Ladeverhalten von Mods in einem installierten Plugin und mögliche Vertrauensabfragen.

Nächster Schritt nach `Approval: UR` ist Brownfield Review mit Mode/Slice Decision, danach UX-Intent-Klärung für die Oberfläche und die erforderliche Produkt- und Lösungsplanung vor der Umsetzung.
