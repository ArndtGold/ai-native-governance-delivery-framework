# QA Report: Adaptive Codex-CLI-Aktivierungsmatrix

Status: ready for approval
Gate: QA
Gate approval: open
Based on: approved `TP.md`, `BROWNFIELD_ANALYSIS.md`, `CD_TESTS.md`, `TP_REVIEW.md`, `CLEAN_IMPLEMENTATION_REVIEW.md`, `CR_REPORT.md`
Date: 2026-09-29
Owner: Codex
Run: `codex-activation-matrix-adaptive-runs`

## 1. QA Decision

Decision: `pass`

Der genehmigte Slice ist mit fünf vollständig erfüllten TP-Aufgaben, passender Brownfield-Integration, sauberem Implementierungspfad, bestandenem Code Review, gezielten Tests und einem frischen zehn-Sitzungen-Live-Lauf ausreichend belegt. Es gibt keine offenen normalisierten Findings, keinen P0/P1-Befund und keinen SoT-Drift. Diese Entscheidung ist die fachliche QA-Bewertung; das User-Gate bleibt bis zur exakten Freigabe offen.

## 2. TP Coverage

| Task | Status | Maßgeblicher Nachweis |
|---|---|---|
| T-001 | fully_done | Adaptive Auswahl und fester `--runs`-Modus; Scheduler-Test 10/14/30; Live 10/10 |
| T-002 | fully_done | A4-Quellbindung an isoliertes `meta/contracts/modes.md`; Live-A4 las die Quelle ohne beobachtete Shell-Suche |
| T-003 | fully_done | JSONL-Parser für Cache-/Suchdaten; Parser-Tests und historischer Rohtrace |
| T-004 | fully_done | README, `summary.txt`, `observation.json` und neue Evidenzdateien weisen Auslöser und Grenzen aus |
| T-005 | fully_done | Maintenance-Contracts einschließlich 6/6 Matrix-Tests, Syntax-/Diff-Prüfung und frischer isolierter CLI-Lauf |

AC-001 bis AC-007 sind für diesen Slice erfüllt. Details und Messgrenzen stehen in `TP_REVIEW.md`.

## 3. Evidence

- Brownfield fit: `BROWNFIELD_ANALYSIS.md` bestätigt denselben Harness als Owner für Fallliste, `grade`, Sitzungsisolation und Reporting; `CLEAN_IMPLEMENTATION_REVIEW.md` entscheidet `pass` ohne zweiten Runner oder parallele Bewertungsinstanz.
- Code quality: `CR_REPORT.md` entscheidet `pass`; keine offenen normalisierten Findings. Die produktive Scheduler-Queue wurde nach dem Review durch eine injizierte Ausführung mit zehn, vierzehn und dreißig Sitzungen geprüft.
- Automatisierte Prüfungen am 2026-09-29 erneut bestanden: `npm run test:maintenance-contracts`, `node --check scripts/native-probes/codex-activation-matrix.mjs`, `git diff --check`.
- Frische CLI-Evidenz: `scripts/native-probes/evidence/codex-activation-matrix-20260929.json` und `.md`; Codex CLI `0.157.1`, isolierte AGDF-Kopie `0.14.5+codex.local-18841fddd654`; 10/10 abgeschlossene und erwartungsgemäße Erstläufe, null Wiederholungen und null Fixture-Änderungen. Fünf Fälle blieben ohne Dispatcher, fünf riefen ihn auf. Q1-`target_unresolved` ist ein getrennter Zielbindungsbefund.
- Telemetrie des Live-Laufs: 624.034 Input-Tokens, 510.592 gecacht, 113.442 nicht gecacht, 7.632 Output-Tokens; 317.057 ms summierte Sitzungsdauer; 13 beobachtete Shell-Suchaufrufe und 18 Dateileseaufrufe. Pro-Sitzung-Werte liegen im JSON; `file_search_calls` ist mangels Ereignistyp `null`.
- A4 las im Live-Rohtrace die konkret benannte isolierte Quelle einmal; es wurde dort keine Shell-Suche beobachtet. Historische `20260928`-Evidenz blieb unverändert.

## 4. Missing Evidence

- Die neun übrigen unauffälligen Fälle wurden nicht mehrfach live beprobt. Die adaptive Matrix behauptet deshalb keine dreifache Wiederholbarkeit.
- Abweichungs-, Timeout- und Spawn-Fehlerpfade wurden nicht mit echten zusätzlichen CLI-Sitzungen ausgelöst; der produktive Scheduler und seine Auswahlregeln wurden kontrolliert getestet und im Diff geprüft.
- Die CLI emittierte in diesem Lauf keinen separaten `file_search`-Ereignistyp. Der neue Signal-Abbruch-Cleanup wurde nach dem beobachteten Vorversuch nicht mit einem zweiten Live-Abbruch validiert.

Diese Grenzen verhindern weder die geprüfte Standardfunktion noch die angegebene begrenzte Aussage des Probes; sie bleiben in der Betreiber-Evidenz sichtbar.

## 5. Risks And Context Graph

- Kosten: Die Reduktion auf zehn Sitzungen ist beobachtet, ein konkreter Abrechnungsbetrag oder eine exakte Tokenersparnis ist nicht belegt.
- Messung: Suchwerte zählen abgeschlossene Toolaufrufe, nicht intern gelesene Dateien oder Shell-Teilbefehle. Unbekannte Telemetrie bleibt `null`.
- context_graph_impact: `none`
- context_graph_refs: keine
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Brownfield Analysis und Clean Implementation Review; lokale Maintenance-Probe ohne neue Architektur- oder SoT-Entscheidung.
- memory_target: `scope_artifact`
- memory_reason: Run-spezifische Live- und Testevidenz verbleibt bei diesem Run.
- memory_refs: `scripts/native-probes/evidence/codex-activation-matrix-20260929.*`, `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/`.

## 6. Required Next Step

Diese QA-Entscheidung für genau den Run `codex-activation-matrix-adaptive-runs` mit `run-present` zur Freigabe vorlegen. Vor `Approval: QA` keine UAT-, Release- oder Delivery-Readiness behaupten.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`
