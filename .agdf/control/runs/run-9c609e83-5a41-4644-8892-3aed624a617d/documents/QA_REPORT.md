# QA Report: Companion shows planned URs instead of an empty state

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-11-16
Owner: Arndt Gold

## 1. QA Decision

Decision: pass

## 2. TP Coverage

- delivered_result: When the Claude companion shows no Run, it now shows the newest planned UR (changed in this session, or with no Run open) by title with route "UR planning · no run yet", its goal, a who-is-next block for draft (writing during a turn, resting otherwise), ready (hand over in the chat) and unclear coverage (clarify in the chat), the gate bar, a note with completed Runs and further planned URs, the plan id and the status line "AGDF · UR planning"; Core's read-only run view lists non-transferred planned URs with an empty-list fallback, and the pane reads again once per new or changed planned UR. Texts in de and en.

All TP tasks T-001 to T-009 are fully done (TP Review pass). The four Code Review findings were fixed and re-verified in this Run.

## 3. Evidence

- CD+Tests record (all TP checks green) and the re-run after the CR fixes: `test:claude-companion`, `test:companion-run-view`, interaction-catalog, payload-budget, copilot-profile, package-contents, `test:skill-evals`, `eval:skills`, `test:operational-localization`, `test:interaction-presentation`, host-compatibility-test, run-view-command-test, `test:planned-urs`, `npm run build:prepare`, community health, control-ui typecheck and `npm test` 353/353, `node scripts/host-compatibility/run.mjs check` 0 failed.
- Exact Copilot payload baseline 459 files / 4,826,070 bytes from the generated inventory; compatibility observation 54804015 referenced.
- Code Review pass with CR-01 to CR-04 resolved; CR-01 shown red without the fix and green with it.
- TP Review pass with all 13 scenarios and a fulfilled UX Intent Fidelity matrix for AC-001 to AC-009.
- Clean Implementation Review pass.
- Visible evidence: PNG rendered from the real code path with four panels (draft working, draft resting, ready, needs clarification with note and status line).

## 4. Missing Evidence

- qualification_limits: The live Claude companion pane was not exercised; visible behaviour is evidenced by renders from the real code path outside Claude and by adapter tests. `npm run test:browser` of packages/control-ui was not run (outside TP). No CI run yet, because nothing is committed.

## 5. Risks

- delivery_risks: Readiness of a planned UR follows the display language, so a UR without a German approval summary is shown as a draft in German (accepted in PRD). "Drafting the UR" is shown for any main-loop turn because the companion cannot see what the turn does.

## 6. Required Next Step

Request `Approval: QA`; then UAT.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ergebnis: Zeigt der Begleiter keinen Run, zeigt er jetzt die neueste geplante UR (in dieser Sitzung geändert oder kein Run offen) mit Titel, „UR-Planung · noch kein Run“, Ziel, „Wer ist dran“ für Entwurf (schreibt während eines Turns, ruht sonst), bereit (im Chat übergeben) und unklar (im Chat klären), Gate-Leiste, Hinweis auf abgeschlossene Runs und weitere URs, Plan-ID und Statuszeile „AGDF · UR-Planung“. Die Run-Ansicht des Core listet nicht übergebene geplante URs und fällt bei Fehlern auf eine leere Liste zurück; eine neue oder geänderte UR wird genau einmal neu gelesen. Alle Prüfungen grün, vier Review-Befunde behoben und nachgeprüft.
- Grenzen: Das echte Claude-Panel wurde nicht geprüft; sichtbar belegt ist das Verhalten durch Bilder aus dem echten Codepfad außerhalb von Claude und durch Adapter-Tests. Browser-Tests des Cockpits liefen nicht (außerhalb des TP), CI steht aus, weil noch nichts committet ist.
- Risiken: Eine UR ohne deutsche Freigabe-Zusammenfassung erscheint auf Deutsch als Entwurf (im PRD akzeptiert). „Schreibt am UR-Entwurf“ erscheint bei jedem Turn, weil der Begleiter nicht sieht, was der Turn tut.
