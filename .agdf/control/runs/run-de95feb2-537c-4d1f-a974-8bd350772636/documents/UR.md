# UR: Fix seven companion review findings before merge

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-10
Owner: Arndt Gold

## 1. Problem

A code review of the unmerged branch `feat/companion-core-run-view` (commits 66200870 and 677b655a against `main`) reported seven findings in the companion run view, the companion event journal and the Claude companion adapter. Two were confirmed by reading the code, five are plausible. Left as they are, the companion can show a raw catalog key as a toast, miss drift on evidence reports, lose the whole run view because of one run, show contradictory events for one call, show a blocked completed run as done, exceed its own read timeout on stores with many unreadable runs, and stay silent for two kinds of document recording.

## 2. Goal

All seven findings are fixed on the branch, each covered by a test, so the branch can be merged without these defects.

## Affected Users

Users of the AGDF Companion in Claude (pane, status line, toasts), and maintainers who rely on the companion event journal and the `run-view` command.

## 3. Scope

Fix the seven review findings, each with a test in the existing companion suites:

1. `notice.mjs`: an unreadable observed run raises no toast reading the raw key `notices.unreadable`.
2. `register.mjs` fingerprint: a changed bound evidence report under `evidence/` triggers a new run-view read, so drift is warned.
3. `run-state.mjs`: one run ending in `timeout` no longer fails the whole view; other runs stay shown.
4. `server.js` and `generation-runtime.js`: one tool call yields at most one journal event.
5. `figure-state.js`: a completed run that evaluates as blocked is shown as blocked, not done.
6. `run-view.js`: invalid runs are evaluated only when requested by id.
7. `events.js` and `journal.js`: accepted `verified_change.record` and `ur_draft.replace` yield a `document_recorded` event with review facts.

## 4. Non-Goals

- No new companion features, no change to the `run-view/1` or `companion-event/1` schema versions unless a fix cannot be made without it.
- No change to gate rules, the status card or the gate-check evaluator.
- No decision about the untracked files in the working tree (`.agdf/control/maintenance/`, `evals/host-compatibility/observations/`).
- No commit, push or pull request unless requested separately.

## 5. Acceptance Signals

- For each of the seven findings a test fails on the current branch state and passes after the fix.
- `npm run test:companion-run-view`, `npm run test:claude-companion` and the MCP server protocol tests pass.
- Generated package assets and dependent baselines (payload baseline, eval fingerprints, compatibility record) are consistent where a change under `plugins/agdf` requires it.

## 6. Existing Source Of Truth

- The approved artefacts and implementation of the companion core run (`run-d2818184-27fc-40ae-9195-70d080d3e926`): SD sections SDD-001 to SDD-010, PRD AC-002, AC-003, AC-007, AC-008.
- Code owners: `packages/core/lib/companion/`, `packages/mcp-server/src/`, `plugins/agdf/host-templates/claude/companion/`, the interaction catalog `plugins/agdf/meta/agdf-interaction-locales.json`.
- The review findings reported in this conversation on 2026-11-10.

## 7. Risks And Unknowns

- Five findings are plausible, not reproduced; a test may show that one does not occur as described. Such a finding is then closed as not applicable with the test as evidence.
- Finding 3 touches a deliberate decision (CR delta review RV-1: a run read while its files changed keeps the last good view). `source_changed` keeps that behaviour; only `timeout` of a single run is isolated. Whether a single-run `timeout` should mark only that run is the assumption taken here.
- Finding 5 changes what a completed run shows; the cockpit's `unconfirmed` classification is the reference.
- Changes under `plugins/agdf` trigger the contract text change chain (payload baseline, eval fingerprints, compatibility record); native Claude evidence may become stale.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Der Review des ungemergten Branches `feat/companion-core-run-view` ergab sieben Befunde im Companion (Run-Ansicht, Ereignis-Journal, Claude-Adapter); zwei sind am Code bestätigt, fünf plausibel.

Ziel: Alle sieben Befunde sind auf dem Branch behoben und jeweils durch einen Test abgedeckt, sodass der Branch ohne diese Fehler gemergt werden kann.

Betroffene Nutzer: Nutzer des AGDF Companion in Claude sowie Maintainer, die das Ereignis-Journal und den Befehl `run-view` verwenden.

Umfang: (1) kein Toast mit dem rohen Schlüssel `notices.unreadable`; (2) Änderungen an Evidenzberichten lösen einen neuen Lesevorgang und damit die Drift-Warnung aus; (3) ein einzelner Run mit `timeout` verwirft nicht mehr die ganze Ansicht; (4) höchstens ein Journal-Ereignis je Tool-Aufruf; (5) ein abgeschlossener, aber blockierter Run wird als blockiert gezeigt; (6) ungültige Runs werden nur auf Anfrage per Id ausgewertet; (7) `verified_change.record` und `ur_draft.replace` erzeugen ein `document_recorded`-Ereignis mit Prüfangaben. Jede Korrektur erhält einen Test.

Nicht-Ziele: keine neuen Companion-Funktionen, keine Änderung an Gate-Regeln, Statuskarte oder Schema-Versionen, keine Entscheidung über die unversionierten Dateien im Arbeitsbaum, kein Commit, Push oder Pull Request ohne gesonderten Auftrag.

Akzeptanzsignale: Zu jedem Befund schlägt ein Test auf dem heutigen Stand fehl und läuft nach der Korrektur durch; `test:companion-run-view`, `test:claude-companion` und die Protokolltests des MCP-Servers laufen durch; generierte Paketinhalte und abhängige Baselines sind konsistent.

Quellen: die freigegebenen Artefakte des Companion-Core-Runs `run-d2818184-27fc-40ae-9195-70d080d3e926` (SD SDD-001 bis SDD-010, PRD AC-002, AC-003, AC-007, AC-008), der Code unter `packages/core/lib/companion/`, `packages/mcp-server/src/` und `plugins/agdf/host-templates/claude/companion/` sowie die Review-Befunde vom 2026-11-10.

Risiken und offene Punkte: Fünf Befunde sind nicht reproduziert; zeigt ein Test, dass einer nicht auftritt, wird er mit diesem Test als nicht zutreffend geschlossen. Bei Befund 3 bleibt das bewusste Verhalten für `source_changed` erhalten, nur ein `timeout` eines einzelnen Runs wird isoliert; das ist eine Annahme. Befund 5 ändert die Anzeige abgeschlossener Runs nach dem Vorbild der Cockpit-Einstufung `unconfirmed`. Änderungen unter `plugins/agdf` ziehen die Kette aus Payload-Baseline, Eval-Fingerprints und Kompatibilitätseintrag nach sich; native Claude-Evidenz kann veralten.

Nächster Schritt: Dieses UR prüfen und nur mit `Approval: UR` freigeben.
