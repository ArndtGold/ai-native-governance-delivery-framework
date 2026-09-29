# TP: Adaptive Codex-CLI-Aktivierungsmatrix

Status: draft
Gate: TP
Gate approval: open
Based on: approved `SD.md`, Revision `a0f09e7b-4e85-4d72-a550-625e2e175a10`
Date: 2026-09-29
Owner: Codex
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Bestehenden Matrix-Harness für adaptiven Erstlauf, bedingte Läufe 2/3, vorab markierte Fälle und festen `--runs`-Modus erweitern | Codex | genehmigte SD; bestehende `CASES`, `grade`, `runOne` und `main` |
| T-002 | A4-Prompt an die `modes.md` der isolierten AGDF-Plugin-Kopie binden und fehlende Quelle vor Teststart melden | Codex | T-001; isoliertes Plugin-Setup |
| T-003 | Pro-Sitzung-Parser für Cache-Usage und abgeschlossene Datei-/Shell-Suchereignisse ergänzen; fehlende Daten als `null` behandeln | Codex | repräsentative Rohprotokolle vom 2026-09-28 |
| T-004 | `observation.json`, `summary.txt` und `scripts/native-probes/README.md` für Modus, Auslöser, A4 und Messgrenzen aktualisieren | Codex | T-001 bis T-003 |
| T-005 | Gezielte automatische Scheduler-/Parser-Prüfungen sowie begrenzten frischen Codex-CLI-Nachweis durchführen und Befunde im Run erfassen | Codex | T-001 bis T-004 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Zehn unauffällige Erstläufe erzeugen zehn getrennte Sitzungen und keine Repeat-Queue | Scheduler-Test mit kontrolliertem `runOne`; Ergebnis-Snapshot |
| AC-001 | SDD-004 | T-001 | SCN-002 | Ohne `--runs` gilt adaptiv; explizites `--runs 3` plant weiterhin 30 feste Läufe | Options- und Scheduling-Test; `observation.json` |
| AC-002 | SDD-001 | T-001 | SCN-003 | Ein fehlerhafter oder unvollständiger Erstlauf erhält nur für seinen Fall Läufe 2 und 3; alle drei Befunde bleiben erhalten | Scheduler-Test mit Fehl-, Timeout- und Spawn-Fehlerfällen |
| AC-003 | SDD-001 | T-001 | SCN-004 | Ein vorab markierter Fall erhält unabhängig vom Erstbefund zwei Wiederholungen und einen dokumentierten Auslöser | Options-/Scheduler-Test; `observation.json` |
| AC-003 | SDD-001 | T-001 | SCN-005 | Unbekannte Fall-ID sowie Kombination von `--repeat-case` und `--runs` stoppen vor Codex-Start | CLI-Validierungstest mit Codex-Stub |
| AC-004 | none — bestehendes `grade` bleibt Bewertungs-Owner | T-005 | SCN-006 | Erwartetes `target_unresolved` bei erfolgreichem Dispatcher-Aufruf löst allein keine Wiederholung aus; Zielbindung bleibt separat | Grade-/Scheduler-Test mit strukturierter Dispatcher-Beobachtung |
| AC-005 | SDD-002 | T-002 | SCN-007 | A4 benennt die existierende isolierte `modes.md` und bleibt in der zehn-Fall-Matrix | Prompt-/Setup-Test und begrenzter frischer A4-Lauf |
| AC-005 | SDD-003 | T-003 | SCN-008 | A4-Suchaufrufe erscheinen getrennt vom Aktivierungsbefund; historischer Bericht bleibt unverändert | Parser-/Reporting-Test; Git-Diff der Evidenzdateien |
| AC-006 | SDD-003 | T-003 | SCN-009 | `turn.completed` liefert gesamte, gecachte und berechnete nicht gecachte Inputs, Output und Laufzeit pro Sitzung ohne doppelte Items | Parser-Test mit echten archivierten JSONL-Zeilen |
| AC-006 | SDD-003 | T-003 | SCN-010 | Fehlende Cache- oder Suchereignisse erscheinen als unbekannt; Such- und Leseaufrufe werden nur pro abgeschlossenem strukturierten Aufruf gezählt | Parser-Test für fehlende Felder, Started-/Completed-Paare und mehrere Befehle in einem Shell-Aufruf |
| AC-007 | SDD-004 | T-004 | SCN-011 | README und Ergebnisdateien benennen Modus, Laufzahl, Repeat-Auslöser, A4-Quellbindung und Kosten-/Stichprobengrenzen | Doku-/Ergebnis-Inspektion; lokaler Ausgabesnapshot |

## 3. Test Plan

1. Der Harness soll reine Options-, Auswahl- und JSONL-Auswertungsfunktionen ohne Profil-/Netz-Setup testbar machen; keine zweite Fallliste oder Bewertungsinstanz anlegen. Tests verwenden Node `node:test` und kontrollierte Laufresultate, nicht zehn kostenpflichtige Codex-Sitzungen für jede Codeänderung.
2. Den Scheduler für Standard, vorab markierten Grenzfall, Erstlaufabweichung, kombinierte Auslöser und expliziten festen Modus prüfen. `session_completed`, Timeout, Spawn-Fehler, `grade` und `target_unresolved` als getrennte Fakten testen.
3. Den Parser gegen Rohzeilen aus `probe-results/codex-activation-matrix-20260928-143639Z/` und künstlich fehlende Felder prüfen; nur `item.completed` zählen und eindeutige IDs beachten.
4. `node --check scripts/native-probes/codex-activation-matrix.mjs`, die neuen gezielten Node-Tests und die vorhandenen Maintenance-Contracts ausführen. Bei konkreten Fehlern zusätzlich die betroffene vorhandene Probe testen.
5. Mindestens einen frischen isolierten Codex-CLI-Lauf für tatsächliche A4-Quellbindung und die JSONL-Felder ausführen. Seine beobachtete Sitzungszahl, Plugin-/CLI-Version, Cache- und Suchtelemetrie und Grenzen im Run vermerken. Die vollständige 30er-Matrix nur auf ausdrücklich gesonderten Vergleichsbedarf starten.

## 4. Brownfield Scope

- Vor Implementierung `scripts/native-probes/codex-activation-matrix.mjs` für Options-Parsing, `setupIsolatedCodexHome`, `parseTranscript`, `grade`, `runOne` und `main` prüfen.
- `scripts/native-probes/README.md`, `package.json` und historischen Nachweis `scripts/native-probes/evidence/codex-activation-matrix-20260928.*` als bestehende Betreiber- und Evidenzoberflächen berücksichtigen.
- `plugin/meta/contracts/request-activation.md` und die installierte `meta/contracts/modes.md` nur lesen; keine normative Regeländerung.
- Vor Codeänderung einen separaten Brownfield Analysis Schritt für Testbarkeit, Redaction und Runtime-Folgen durchführen.

## 5. Out Of Scope

- AGDF-Dispatcher, Gates, Plugin-Installation, Claude-Matrix und historische 30/30-Ergebnisse ändern.
- Geldkosten errechnen oder aus adaptiven zehn Läufen eine dreifache Wiederholbarkeit behaupten.
- Ohne CLI-Livebeobachtung Cache- oder Suchfeldverfügbarkeit für andere Versionen zusichern.

## 6. Risks And Blockers

- Eine geänderte Codex-JSONL-Form kann Werte unbekannt lassen; QA muss zwischen vorhandenem Parserfehler und tatsächlich fehlender Telemetrie unterscheiden.
- Eine vorab markierte Fall-ID muss vor erstem Lauf validiert sein; nachträgliche Auswahl würde die Evidenz verfälschen.
- Änderungen an `main` dürfen die temporäre Authentifizierungskopie und das Cleanup nicht umgehen.
- Ein frischer Live-Lauf belegt nur seinen Host-/CLI-/Pluginstand, keine generelle Aktivierungsquote.

## 7. Next Step

Diesen Aufgaben- und Testplan prüfen und ausschließlich mit folgender Antwort freigeben:

`Approval: TP`
