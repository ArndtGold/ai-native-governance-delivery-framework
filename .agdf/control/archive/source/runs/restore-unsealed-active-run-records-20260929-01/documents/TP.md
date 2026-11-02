# Task/Test Plan: Recovery ungesiegelter aktiver AGDF-Runs

Status: draft
Gate: TP
Gate approval: open
Based on: genehmigte SD-Revision 11 · sha256:e37053ad63732c416df6e73d8e063b479489b678366e35483bf6b4c29d34cd23
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-EVIDENCE | Inventarisieren und klassifizieren, welche unabhängigen historischen Approval-Nachweise für die 23 gebundenen Runs tatsächlich verfügbar und prüfbar sind; keine Zeile aus dem ungesiegelten Run State selbst als Herkunftsbeleg werten. | Control-State-Eigentümer | Keine |
| T-INSPECT | Read-only Recovery-Prüfung für explizite Run-ID, Struktur, Seal-Status, Git-Kandidaten, Artefaktliste und Approval-Provenienz ergänzen. | Control-State-Eigentümer | T-EVIDENCE |
| T-PREVIEW | Digestgebundene Preview und exakte, pro Run bestätigte Apply-Eingabe einschließlich nächstem Gate-Schritt implementieren. | Control-State-Eigentümer | T-INSPECT |
| T-APPROVAL | Vertrauensschwelle, frühestes unbelegtes Gate und Deaktivierung abhängiger späterer Approval-Zeilen implementieren. | Approval-/Control-State-Eigentümer | T-EVIDENCE, T-INSPECT |
| T-WRITER | Capability-begrenzten Recovery-Einstieg im gemeinsamen Writer integrieren; Lock, Revision, atomaren Austausch und beide Siegel wiederverwenden. | Control-State-Eigentümer | T-APPROVAL, T-PREVIEW |
| T-JOURNAL | Recovery-Journal mit exklusiver Anlage, bekannten Phasen, Digestbindung und idempotenter Wiederaufnahme implementieren. | Control-State-Eigentümer | T-PREVIEW, T-WRITER |
| T-CLI | CLI-Registry, Optionen, Handler und JSON-Ergebnisse für Prüfung, Preview, Apply und sichere Wiederaufnahme integrieren. | CLI-/Control-State-Eigentümer | T-INSPECT, T-PREVIEW, T-WRITER, T-JOURNAL |
| T-VERIFY | Integrations- und Regressionsevidenz mit Doctor, Gate-Check, Delivery Map, Standard-Writer, Approval und Legacy-Migration erfassen. | Quality-Eigentümer | T-CLI, T-JOURNAL |
| T-ISOLATION | Bytegleichheit aller nicht ausgewählten Runs und Artefakte nach erfolgreichen, blockierten und gemischten Wiederherstellungsfällen prüfen. | Quality-Eigentümer | T-VERIFY |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-INSPECT | SCN-001 | Prüfung listet ausschließlich die explizite Run-Auswahl mit Revision, Seal, Artefaktdigests und Approval-Zeilen; Dateien bleiben bytegleich. | Isolierter Fixture-Run; Vorher-/Nachher-Digests und JSON-Prüfbericht |
| AC-001 | SDD-004 | T-EVIDENCE | SCN-002 | Ein Approval zählt nur mit unabhängig belegter Bindung von Run, Gate, Revision, Presentation-ID und exakter Antwort; unvollständige Quelle wird als unbelegt ausgegeben. | Evidenzinventar der 23 Run-IDs; positive und negative Provenienz-Fixtures |
| AC-002 | SDD-001 | T-PREVIEW | SCN-003 | Preview zeigt für einen explizit gewählten Run Quelle, betroffene Artefakte, Approval-Behandlung, Follegate und eindeutige Preview-ID, ohne Run State oder Artefakte zu ändern. | Preview-JSON und Snapshot-Digests vor/nach Erstellung |
| AC-002 | SDD-003 | T-JOURNAL | SCN-004 | Preview-Journal bindet Run, Inhalts- und Artefaktdigests, Approval-Plan, Preview-ID und Startphase exklusiv. | Journal-Fixture; Validierung von Inhalt, Digest und exklusiver Zweitanlage |
| AC-002 | SDD-004 | T-APPROVAL | SCN-005 | Preview weist belegte Freigaben und den frühesten erforderlichen erneuten Gate-Schritt korrekt je Run aus. | Approval-Matrix-Fixtures mit vollständigem, fehlendem und abweichendem Nachweis |
| AC-003 | SDD-004 | T-APPROVAL | SCN-006 | Bei fehlender oder geänderter Approval-Provenienz werden die erste unbelegte und alle späteren Freigaben nicht als genehmigt übernommen; die reguläre Folge startet am korrekten Gate. | Übergangs- und Approval-Seal-Tests für jedes Gate mit verändertem Approval-Eintrag |
| AC-003 | SDD-004 | T-EVIDENCE | SCN-007 | Exakte unabhängige Originalnachweise erhalten nur die jeweils gebundene Freigabe; falsche Run-, Gate-, Revision-, Präsentations- oder Antwortdaten werden verworfen. | Provenienz-Validator-Bericht mit je einem Bindungsfehler-Fixture |
| AC-004 | SDD-002 | T-WRITER | SCN-008 | Recovery erstellt unter dem vorhandenen Writer-Lock genau eine neue Revision und beide Siegel; gewöhnliches `run-update` lehnt einen unsealed Zustand weiterhin ab. | Writer-Unit-Tests; Revision- und Siegel-Digests; Standard-Update-Negativtest |
| AC-004 | SDD-005 | T-WRITER | SCN-009 | Das Siegel deckt den bestätigten Run und alle gelisteten Artefakte ab, ohne den Bericht als Signatur oder Beweis früherer Freigaben zu bezeichnen. | Nachher-`run-seal`-Prüfung; Artefakt-Digests und Ergebnistext-Fixture |
| AC-005 | SDD-002 | T-WRITER | SCN-010 | Eine concurrent geänderte Revision oder eine zweite schreibende Recovery gewinnt keinen stillen Überschreibpfad; es entsteht höchstens eine bestätigte Recovery-Revision. | Konkurrenztests mit zwei Writer-Prozessen; stale-revision und lock outcomes |
| AC-005 | SDD-003 | T-JOURNAL | SCN-011 | Fehler vor Journal, vor Rename, nach Rename und vor Abschlussmarkierung lassen einen eindeutig erkennbaren Zustand zurück; Wiederholung ist idempotent und erzeugt keine Doppelrevision. | Fault-Injection-Logs und Journal-/Run-Digests für jede Phase |
| AC-005 | SDD-005 | T-ISOLATION | SCN-012 | In einem gemischten Bestand bleiben erfolgreiche, blockierte und wiederaufnehmbare Runs separat; ein Run-Erfolg verändert keinen anderen Run. | Zwei-Run-Fixture mit Erfolg und Blockierung; byteweise Einzelvergleiche |
| AC-006 | SDD-002 | T-WRITER | SCN-013 | Symlink-, Traversal-, Fremdpfad-, fehlende Artefakt- und doppelte Artefaktzeilen führen vor jedem Write zu einem benannten Block. | Path-Guard-Fixtures auf macOS, Linux und Windows; unveränderte Snapshot-Digests |
| AC-006 | SDD-003 | T-JOURNAL | SCN-014 | Änderungen am Run- oder Artefaktdigest nach Preview verhindern Apply; unbekannte Journalphase bleibt gesperrt. | Stale-preview- und unbekannte-Phase-Fixtures mit exaktem Blockcode |
| AC-007 | SDD-002 | T-VERIFY | SCN-015 | Doctor meldet für erfolgreich wiederhergestellte Fixtures kein `AGDF_RUN_SEAL_INVALID`; Gate-Check verwendet deren berechneten Gate-Stand. | Doctor- und Gate-Check-JSON vor/nach Recovery mit Run-Zuordnung |
| AC-007 | SDD-004 | T-VERIFY | SCN-016 | Nicht belegte Runs bleiben mit spezifischem Provenienzgrund blockiert; unabhängige Warnungen und Findings werden nicht als behoben ausgewiesen. | Doctor-Bericht gemischter Provenienzfälle; Severity- und Finding-Diff |
| AC-008 | SDD-001 | T-CLI | SCN-017 | Aufruf ohne explizite Run-ID oder mit einer anderen Preview-ID schreibt nichts und erweitert den bestätigten Bestand nicht. | CLI-Parsing-Negativfälle; Kontrollbaum-Snapshot vor/nach |
| AC-008 | SDD-005 | T-ISOLATION | SCN-018 | Der Review-Run `agdf-review-remediation-20260929-01`, alle nicht ausgewählten Run States und ihre Artefakte bleiben bytegleich. | Vorher-/Nachher-SHA-256-Inventar des gesamten nicht ausgewählten Bestands |

## 3. Test Plan

1. Jede Unit- und Evaluator-Prüfung läuft in einem isolierten temporären Repository mit eigenständigem Run-Verzeichnis; die 23 produktiven Run States werden während Entwicklung und Tests nicht geschrieben.
2. Provenienztests decken fehlende, vollständige, duplizierte und in jeder Bindungsdimension abweichende Nachweise ab. Ein Preview- oder Journalrecord darf sich nicht selbst als Approval-Evidenz qualifizieren.
3. Writer- und Journaltests injizieren Schreib-, fsync-, Rename-, Prozessabbruch- und Wiederaufnahmefehler. Sie vergleichen Run-State-Bytes, Journalphase, Revision und Siegel nach jedem Fehlerpunkt.
4. Pfadtests prüfen enthaltene reguläre Artefakte, fehlende Dateien, Symlinks, Traversal und plattformspezifische Pfadformen. Die Tests laufen auf macOS, Linux und Windows; nicht unterstützte Dateisystemsemantik muss fail-closed sein.
5. CLI-Integration prüft Argumentenumfang, JSON-Verträge, exakte Preview-Bindung, erfolgreiche und blockierte Apply-Fälle sowie Resume. Eine apply-Aufrufwiederholung muss dasselbe Recovery-Ergebnis zurückgeben oder mit Digestkonflikt blockieren.
6. Regression prüft `run-update`, `run-approve`, `run-present`, `run-migrate`, Doctor, Gate-Check und Delivery Map gegen bestehende Fixtures; unsealed/invalid bleibt außerhalb der Recovery-Capability schreibgeschützt.
7. Abschlussverifikation vergleicht All-active Doctor vor/nach jedem Fixture-Lauf, ordnet jeden Befund einer Run-ID zu und zählt unabhängige Warnungen nicht als beseitigt.

## 4. Brownfield Scope

- Kanonische Writer-/Lock-/Siegel-Eigentümer: `run-state-writer.js`, `run-recording.js`, `run-seal.js`, `run-state-parser.js`.
- Quellen- und Pfadprüfung: `run-state-resolver.js`, `contained-file.js`, `legacy-migration.js`, Git-Historie der bestätigten Run-Auswahl.
- Gate- und Approval-Vertrag: `gate-policy.js`, `run-presentation.js`, `gate-approval-validator.js`, `run-present`, `run-approve`.
- CLI-Integration: `command-registry.js`, `validation-handlers.js`, `local-validator.js` und zugehörige CLI-/Control-State-Test-Suiten.
- Bestehende Kontrollleser: Doctor, Gate-Check, Delivery Map und alle Aufrufer des Run-State-Parsers; neue Datei-/Journalfelder dürfen keinen zweiten Run-Writer erzeugen.
- Externe Approval-Provenienz: verfügbare Host- und Sessionarchive für exakt diese Runs, sofern der Repository-Eigentümer sie bereitstellt; keine automatische Annahme aus Chat-Suche oder ungesiegelten Zeilen.

## 5. Out Of Scope

- Implementierung vor `Approval: TP`, Ausführung der Recovery auf den 23 produktiven Runs vor einer eigenen exakten Vorschau-Bestätigung und Wiederherstellung der 62 Warnungen.
- MCP-Tool- oder Intake-Erweiterung, SessionStart-Automation, UI-Redesign, Batch-Bestätigung und Host-/Plugin-/Installer-/Release-Änderungen.
- Manuelle Siegel, Approval-Übertragung, automatische Auswahl einer historischen Git-Revision oder Nutzung des Legacy-Imports für kanonische Run-Verzeichnisse.
- QA-, UAT-, Release- oder Host-Konformitätsbehauptungen aus lokalen Tests.

## 6. Risks And Blockers

- Kein unabhängiger Originalnachweis: die betroffenen Gates müssen erneut durchlaufen werden; ist die Gate-Folge nicht konsistent rekonstruierbar, blockiert der betreffende Run.
- Mehrdeutige Git-Quelle, Artefaktpfad, Preview oder Journalphase: Apply bleibt gesperrt, bis eine konkrete Quelle oder ein sicherer manueller nächster Schritt dokumentiert ist.
- Nicht atomar unterstützter Rename, unbekannter Lock-Eigentümer oder nicht nachweisbarer Prozesszustand: fail-closed; keine zeitbasierte Übernahme einer Sperre.
- Regression im normalen Writer, Approval-Flow oder Legacy-Migrate blockiert QA, bis die gemeinsame Eigentümergrenze wiederhergestellt ist.
- Plattform- oder Hostbeobachtung fehlt: entsprechende Aussage bleibt offen; Testpass auf einem Betriebssystem belegt keinen Live-Host-Pass auf einem anderen.

## 7. Next Step

Diesen Task/Test Plan prüfen und nur exakt mit `Approval: TP` freigeben. Implementierung bleibt bis zu dieser Freigabe gesperrt.

## AGDF Approval Summary (de; source=de)

- Ziel: Die freigegebene Recovery-Architektur durch konkrete Vorbereitungs-, Writer-, Journal-, CLI- und Verifikationsaufgaben prüfbar machen.
- Umfang: Alle acht PRD-Kriterien und jede referenzierte SD-Entscheidung erhalten Szenarien mit beobachtbarem Ergebnis und spezifischer Evidenzquelle.
- Reihenfolge: Zuerst Approval-Provenienz inventarisieren, dann Prüfung und Preview, anschließend Approval- und Writer-Pfad, Journal, CLI sowie Integrations- und Isolationsevidenz.
- Risiken: Fehlender unabhängiger Approval-Nachweis, Snapshot-Konflikt, unbekannte Journalphase oder unsichere Pfad-/Lock-Behandlung blockieren nur den betroffenen Run; produktive Runs bleiben bis zu eigener Bestätigung unberührt.
