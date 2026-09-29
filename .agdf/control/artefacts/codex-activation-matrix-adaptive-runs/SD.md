# SD: Adaptive Codex-CLI-Aktivierungsmatrix

Status: draft
Gate: SD
Gate approval: open
Based on: approved `PRD.md`, Revision `52aa34f2-b61e-4328-8752-8c61d3a05a1d`
Date: 2026-09-29
Owner: Codex
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Der vorhandene Harness `scripts/native-probes/codex-activation-matrix.mjs` bleibt alleiniger Runner und Ergebnis-Owner. Ohne `--runs` führt er eine erste Phase mit allen zehn Fällen aus, bewertet jeden Erstlauf mit dem bestehenden `grade` plus Sitzungsabschluss und plant danach für ausgelöste Fälle genau die Läufe 2 und 3. Jeder Aufruf von `runOne` erzeugt weiter ein eigenes Fixture und einen eigenen `codex exec --json --ephemeral`-Prozess. Explizites `--runs <n>` behält die feste Anzahl pro Fall für Vergleichsläufe. Wiederholungen aufgrund vorab markierter Grenzfälle werden durch wiederholbare `--repeat-case <ID>`-Eingaben vor dem ersten Lauf festgelegt; `--runs` und `--repeat-case` werden zusammen abgewiesen, damit die Ausführung eindeutig ist.

Der A4-Prompt verweist zur Laufzeit auf `meta/contracts/modes.md` in der isolierten Plugin-Kopie. Dieser Pfad wird vom bereits angelegten temporären Paket abgeleitet, bevor der Fall gestartet wird. Die Datei enthält die dokumentierte Unterscheidung von Quick Task und Structured Delivery; A4 bleibt Abstain-Fall. Der Prompt und die tatsächlichen Suchereignisse erscheinen nur in der lokalen Probe-Evidenz; der historische Bericht bleibt unverändert.

`parseTranscript` zählt abgeschlossene strukturierte JSONL-Ereignisse pro eindeutiger Item-ID und summiert `turn.completed.usage`. Die Sitzungsdaten führen Brutto-, Cache- und nicht gecachte Input-Tokens getrennt, dazu Output-Tokens und die bereits vorhandene `duration_ms`. Nicht gecachter Input ist nur `input_tokens - cached_input_tokens`, wenn beide Werte vorliegen und die Differenz nicht negativ ist; sonst `null`. Fehlende Ereignisfelder bleiben `null`. Die Suchtelemetrie ist eine definierte Aufrufzählung, keine Behauptung über Anzahl gelesener Dateien oder Tokens.

## 2. Ownership And Source Of Truth

- Fachliche Erwartungen und Kriterien: genehmigte PRD, `AC-001` bis `AC-007`; Aktivierungsgrenze bleibt `plugin/meta/contracts/request-activation.md`.
- Fallliste, Fixture, Scoring, Scheduling und Messwert-Parsing: bestehender `codex-activation-matrix.mjs`.
- Anwenderanleitung: `scripts/native-probes/README.md`.
- Laufbeobachtungen: neue `probe-results/codex-activation-matrix-<Zeitstempel>/observation.json`, `summary.txt` und JSONL-Rohprotokolle. Der historische Nachweis `evidence/codex-activation-matrix-20260928.*` bleibt unverändert.
- AGDF-Control: eigener ausgewählter Run; der Test-Harness liest oder schreibt keine Gate-Freigaben.

## 3. Architecture Decisions

- SDD-001: Der vorhandene Runner verwendet eine zweiphasige Queue mit Erstläufen und bedingten Läufen 2/3; rationale: die Auswahl folgt ausschließlich dem beobachteten Erstlauf und einer vorab festgelegten Grenzfallliste; consequence: adaptive Läufe haben unterschiedliche Fall-Laufzahlen, daher ersetzt eine per-Fall-Auslöserliste den pauschalen Dreifachwert.
- SDD-002: A4 erhält einen Laufzeit-Prompt mit absolutem Pfad zur `modes.md` der isolierten Plugin-Kopie; rationale: eine konkrete Quelle begrenzt die ungebundene Dokumentensuche, ohne A4 aus den zehn Fällen zu entfernen; consequence: der Prompt wird erst nach Isolations-Setup gebildet und der Quellpfad muss existieren.
- SDD-003: Telemetrie wird ausschließlich aus abgeschlossenen JSONL-Items und `turn.completed.usage` mit expliziten `null`-Werten bei fehlenden Feldern berechnet; rationale: Startereignisse und unvollständige Nutzungsdaten dürfen weder doppelt gezählt noch als Nullkosten gelesen werden; consequence: Ergebnisdateien erhalten additive Messfelder und eine dokumentierte Suchaufruf-Definition.
- SDD-004: Ein expliziter numerischer `--runs`-Wert bleibt fester Kompatibilitätsmodus, während fehlendes Flag den adaptiven Standard wählt; rationale: frühere reproduzierbare Vergleichsläufe sollen weiter startbar sein; consequence: README und Ergebnisdateien benennen Modus, geplante und tatsächliche Sitzungen ausdrücklich.

## 4. Integration Points

- `codex exec --json`: liefert `turn.completed` mit `input_tokens`, `cached_input_tokens`, `output_tokens` und `item.completed` für `command_execution` (in den Rohprotokollen vom 2026-09-28 beobachtet). Zusätzliche Dateisuche-Item-Typen werden nur gezählt, wenn sie als strukturierte abgeschlossene Ereignisse vorliegen.
- Suchzählung: Ein abgeschlossener `command_execution`-Aufruf zählt einmal als Shell-Suche, wenn sein Befehl eine Datei-/Textsuche über `rg`, `grep`, `git grep`, `find` oder `fd` aufruft; ein abgeschlossener strukturierter Datei-Suchtool-Aufruf zählt einmal als Dateisuche. Datei-Leseaufrufe wie `cat` oder `sed` werden separat als Dateizugriffe gezählt. Die Klassifikation betrachtet den aufgezeichneten Befehl; verschachtelte Shell-Kommandos können nur als ein Aufruf gezählt werden. Ein fehlender Ereignistyp bedeutet `unknown`, nicht belegte Null.
- `git status --porcelain -uall`: bleibt alleinige Dateiänderungsprüfung für die Fixture-Repositories.
- `observation.json`: enthält `execution_mode`, `preselected_boundary_cases`, pro Fall `repeat_triggers` und `runs`, pro Sitzung Usage, Dauer und Suchzählung. Summen weisen bekannte Werte und Anzahl unbekannter Sitzungen getrennt aus.
- `summary.txt`: nennt adaptive oder feste Matrix, Gesamtzahl und pro Fall Laufzahl/Auslöser; A4-Suchwerte erhalten eine eigene Zeile.

## 5. Constraints And Compatibility

- Gleiche zehn Fall-IDs und dieselbe `grade`-Semantik wie bisher; `target_unresolved` ist ein Zielbindungsbefund, kein eigenständiger Repeat-Trigger.
- Der `--runs`-Modus behält Wertebereich 1 bis 10 und seine feste Bedeutung. Die Default-Änderung wird dokumentiert und in `observation.json` sichtbar.
- Kein Rohprotokoll oder Authentifizierungswert wird in aggregierten Ausgaben unredigiert kopiert; vorhandene Redaction bleibt.
- Keine Geldkostenberechnung und keine Gleichsetzung mit der historischen 30/30-Stichprobe.
- Bei fehlenden Usage-Feldern bleiben abhängige Zahlen `null`; Summen dürfen nur als vollständige Summen erscheinen, wenn alle eingeschlossenen Sitzungen den Wert liefern.

## 6. Test And Evidence Strategy

- Scheduler und Optionsprüfung mit kontrollierten Laufresultaten: zehn unauffällige Fälle, ein Fehl-Erstlauf, ein vorab markierter Fall, beide Trigger zusammen, fester `--runs`-Modus und ungültige ID.
- Parser mit repräsentativen tatsächlichen JSONL-Zeilen aus der archivierten Codex-Matrix: Cache-Input, `item.started`/`item.completed`, mehrere Toolaufrufe und fehlende Felder. Prüfen, dass weder Doppelzählung noch fälschliche Null entsteht.
- Frische Live-Prüfung mit isolierter Codex-CLI-Installation für mindestens die Ereignisform und A4-Quellbindung; tatsächliche Sitzungszahl und Cache-Feldverfügbarkeit ausweisen. Um Tokenverbrauch zu begrenzen, nicht automatisch eine neue 30er-Matrix starten.
- Ergebnisstruktur gegen `AC-001` bis `AC-007` sowie historische Berichtsunverändertheit prüfen.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Erstphase erzeugt genau einen `runOne` je Fall; adaptive Queue nur nach Bewertung | PRD AC-001; `codex-activation-matrix.mjs` `CASES`, `runOne`, `main` | SDD-001, SDD-004 | Default-Modus ändert sich; Modus und Sitzungszahl werden dokumentiert |
| AC-002 | Fehlender oder negativer Erstbefund plant nur für denselben Fall Läufe 2/3 und bewahrt alle Einzelbefunde | PRD AC-002; bestehendes `grade` und `session_completed` | SDD-001 | Folgeerfolg kaschiert Erstausfall nicht; alle Läufe bleiben sichtbar |
| AC-003 | Wiederholbares `--repeat-case` wird vor Start gegen `CASES` validiert und in Triggern gespeichert | PRD AC-003; Harness-Optionen und Fallliste | SDD-001 | Kombination mit `--runs` wird klar abgewiesen |
| AC-004 | Bestehendes `grade` bleibt aktivierungsführend; Zielbindung wird nur als separater Befund gezählt | PRD AC-004; `grade`, `dispatch_calls` | none — keine neue Designentscheidung für die vorhandene Bewertungsregel | none — keine Änderung der erwarteten Aktivierung |
| AC-005 | A4-Prompt bekommt Pfad zur isolierten `modes.md`, Suchzählung bleibt separat | PRD AC-005; isoliertes Paket, A4 in `CASES` | SDD-002, SDD-003 | Fehlende Quelldatei stoppt vor A4 statt ungebundene Suche zuzulassen |
| AC-006 | Parser liest Cache-Usage und abgeschlossene Such-/Lese-Items; unbekannte Werte sind `null` | PRD AC-006; Codex-JSONL, `parseTranscript`, `runOne` | SDD-003 | Ereignistypen können je CLI-Version variieren; Felder tragen Verfügbarkeitsstatus |
| AC-007 | README und Ergebnisdateien erklären Modus, Auslöser, A4 und Messgrenzen | PRD AC-007; `scripts/native-probes/README.md`, `summary.txt`, `observation.json` | SDD-004 | Historische Evidenz bleibt unberührt; keine Kostenbehauptung |

## 8. Risks And Open Questions

- Ein Shell-Aufruf kann mehrere Suchbefehle enthalten; die Zählung ist bewusst pro Toolaufruf, nicht pro internem Kommando. Das Ergebnis erläutert diese Grenze.
- Codex kann künftig andere JSONL-Ereignisnamen liefern. Nicht erkannte Telemetrie wird unbekannt und der Live-Test macht die tatsächlich beobachtete Form sichtbar.
- Wenn die A4-Quelldatei nicht in der isolierten Kopie liegt, ist der Lauf vor Teststart ungültig; kein stiller Rückfall auf breite Suche.

## 9. Next Step

Dieses Lösungsdesign prüfen und ausschließlich mit folgender Antwort freigeben:

`Approval: SD`
