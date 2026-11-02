# QA Report: Shared Core Run Inventory from Stored Run State

Status: draft
Gate: QA
Gate approval: open
Based on: TP revision 10, CD+Tests, Code Review, TP Review, Clean Implementation Review
Date: 2026-10-30
Owner: Arndt Gold

## 1. QA Decision

Decision: pass

## 2. TP Coverage

- delivered_result: One pure Core module `run-inventory.js` derives a run inventory from the stored `RUN_STATE.md` files only: every run once with title and title source, lifecycle including `superseded` and `abandoned` with closure facts, gate, stored decision, attention class (decision required, clarification required, blocked, in progress, unclear) with the note that it is stored state, last activity from receipts or approval dates and never from `updated_at`, revision and path, in a fixed order with counts; `doctor --all-active --json` carries it additively, the new read operation `inventory` serves it through `agdf_inspect`, the CLI and the surface-local validator, and the route for "show the active AGDF runs" uses it.

All tasks T-001 to T-009 are fully done (TP Review). All 18 scenarios SCN-001 to SCN-018 have passing tests or recorded evidence; UX Intent Fidelity is fulfilled for AC-001 to AC-014.

## 3. Evidence

- CD+Tests: `.agdf/control/artefacts/run-inventory-core-20261029-01/CD_TESTS.md` (tree before the review corrections).
- Code Review: `CODE_REVIEW.md`; independent reviewer found CR-F01 (validator lacked `inventory`) and nine notes; CR-F11 (MCP result projection rejected `inventory` as `tool_result_invalid`) was found afterwards by a real STDIO call and fixed with a test that fails without the fix; CR-F12 completed the evaluator prompt; its verification section covers the final tree.
- STDIO call through a separate MCP server process: `evidence/inventory-stdio.json` (152 entries equal to the CLI, 231 to 309 ms, run selection refused).
- Measurement on this repository: `evidence/measurement.json` (each of 152 run folders once, counts equal Run Meta, no template title, no activity from `updated_at`; doctor 9.3 to 9.7 s with 0.17 to 0.20 s added).
- Behavioral evaluation with Claude Code 2.1.302: both active-run cases choose `control.inventory`; 38 of 39 cases pass, the failing help case fails identically on `main`.
- TP Review: `TP_REVIEW.md`; Clean Implementation Review: `CLEAN_IMPLEMENTATION_REVIEW.md`.
- Final tree: build preparation, compatibility record (0 failed), skill evaluations 113/113, all MCP server scripts and the affected CLI suites pass.

## 4. Missing Evidence

- qualification_limits: No native host session was observed (PRD non-goal) and the STDIO call used the source runtime, not an installed package; the behavioral evaluation ran with Claude Code only, not Codex; SCN-017 compared doctor time with the UR baseline because a `main` worktree could not be built; the owner has not yet judged the real attention classes; the full pull-request CI lanes have not run.

## 5. Risks

- delivery_risks: Attention classes rest on stored state and can lag behind a live evaluation, and the inventory does not check seals, so a tampered run is listed while doctor blocks it; the `agdf_inspect` definition has 11 bytes of headroom; many legacy runs without receipts have day-precision or unknown activity and sort late; contract text changes make the native Claude CLI release evidence stale.

## 6. Required Next Step

Request `Approval: QA`; after approval request `Approval: UAT` with a look at the real inventory, then produce the OR. The companion copy, hub supplement 3 and the intake list are follow-up runs.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Eine verlässliche Liste aller Runs, die zuerst zeigt, wo eine Entscheidung oder Klärung wartet, dann was blockiert ist und was zuletzt bearbeitet wurde.
- Ergebnis: Das reine Core-Modul `run-inventory.js` leitet das Inventar nur aus den gespeicherten `RUN_STATE.md` ab: jeder Run einmal mit Titel, Lebenszyklus inklusive `superseded`/`abandoned`, Gate, Aufmerksamkeitsklasse mit Hinweis auf den gespeicherten Stand, letzter Aktivität ohne `updated_at` und Revision, in fester Reihenfolge. `doctor --all-active` trägt es mit, die neue Operation `inventory` liefert es über `agdf_inspect`, CLI und Validator, und die Route „Zeige die aktiven AGDF-Runs“ nutzt sie.
- Nachweise: Alle Tests und Prüfketten grün; echter STDIO-Aufruf mit 152 Einträgen in 0,23 bis 0,31 s; Claude-Verhaltensevaluation wählt die neue Route; Code Review mit zwei echten, behobenen Fehlern (fehlender Validator-Befehl, MCP-Ergebnisprojektion).
- Grenzen: Keine native Host-Sitzung, STDIO mit Quellcode statt installiertem Paket, Verhaltensevaluation nur mit Claude, doctor-Zeit gegen die UR-Basis gemessen, deine fachliche Prüfung der echten Klassen steht aus, volle CI im Pull Request steht aus.
- Risiken: Klassen beruhen auf gespeichertem Stand und Seals werden nicht geprüft; 11 Byte Restbudget in der Tool-Definition; Altläufe ohne Beleg sortieren spät; die native Claude-CLI-Evidenz veraltet durch den Vertragstext.
