# TP: Verlässlicher Delivery-Intake und Fortsetzung

Status: draft
Gate: TP
Gate approval: open
Revision: 1
Based on: SD.md, freigegebene Fassung 1; PRD.md, freigegebene Fassung 1
Date: 2026-09-27
Owner: user
Run: agdf-intake-continuation-repair

## 1. Task List

Alle Aufgaben sind geplant, keine Implementierung oder Fix-Validierung ist bereits erfüllt.

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| T01 | Implementierungsvorbereitende Brownfield Analysis: aktuellen HEAD/Arbeitsbaum erfassen, betroffene Owner und vorhandene Tests prüfen, Änderungen anderer Arbeiten erhalten, Reuse und ausführbare Prüfbefehle bestätigen | alle; SD D-01 bis D-06 | BROWNFIELD_ANALYSIS.md; Baseline; pass vor T02 |
| T02 | Intake-Modi new/resume einschließlich CLI-/MCP-Validierung im gemeinsamen Dispatch-Vertrag ergänzen; fehlender Modus bleibt sicher kompatibel | IC-01,02,06,07; D-01 | Prüfungen V01,V02; explizite run_id und Zielbindung |
| T03 | run-create über gemeinsamen Handler auch im installierbaren lokalen Validator unterstützen; bestehende Erstellungs-/Pfadprüfungen erhalten | IC-03,07; D-02 | V03,V08; keine internen Agentenimporte |
| T04 | Begrenzte continue_delivery-Fortsetzung für Brownfield Review/Mode-Slice-Recovery ergänzen; Gate, Freigabe, Revision und Ziel prüfen; Status bleibt lesend | IC-05,06,07; D-03 | V04,V07; terminale Negativfälle; kein unbegrenzter Loop |
| T05 | Blockadekarten bei fehlender/mehrdeutiger/ungültiger Run-Auswahl von Freigabeaufforderungen bereinigen, kanonischen Renderer und Lokalisierungen verwenden | IC-02,06; D-04 | V02,V09; sichtbare Ausgaben |
| T06 | run-present mit unveränderlichem Beleg, kanonischem Renderer, Gate-/Revisions-/Digestprüfung und sicherem run-lokalem Speicher implementieren | IC-04,07; D-05 | V05,V06; schreibender Befehl klar vom lesenden Dispatcher getrennt |
| T07 | run-approve an --presentation binden, Belegreferenz im bestehenden Approval-Nachweis speichern; alte gespeicherte Freigaben erhalten; alte neue Aufrufe sicher zurückweisen | IC-04,08; D-05,06 | V05,V06,V07; kein nachträgliches Backfill |
| T08 | Contracts, Skills, CLI-Hilfe, Schema-/Host-Projektionen und Kompatibilitätshinweise konsistent ändern; bestehende Generatoren ausführen | alle; D-01 bis D-06 | V09,V10; generierte Artefakte und Quellowner stimmen überein |
| T09 | Durchgängige Regression über frisch gepackte installierbare Runtime ergänzen: neuer Auftrag neben fremden Runs bis Freigabe und interner Fortsetzung; Fehler/Wiederholung separat prüfen | IC-01 bis IC-08 | V08; Befehle tatsächlich aus Paket ausführen |
| T10 | Sichtbaren realen Codex-Mehrturn-Verlauf mit passender installierter Version beobachten; Testprojekt verwenden, Versions-/Provenienznachweis und Reihenfolge festhalten | IC-01,02,04,05,07,08 | V11; tatsächliche Nutzerantwort, keine synthetische Live-Freigabe |
| T11 | Task Plan Review, Clean Implementation Review und Code Review durchführen; Abweichungen nach zuständigem Gate behandeln, anschließend qa-gate | alle | Drei Review-Berichte; QA_REPORT.md; QA entscheidet pass/revise/block |
| T12 | Nach zulässiger QA-/UAT-Folge OR erstellen; verbleibende Host-Nachweise und Installationsstand getrennt ausweisen | alle | OR.md; keine automatische Veröffentlichung/VCS-Aktion |

Reihenfolge: T01 -> T02/T03 -> T04/T05 -> T06/T07 -> T08/T09 -> T10 -> T11 -> T12. Abhängige Änderungen und schreibende Kontrollaktionen sequentiell. Keine Subagentenbeauftragung durch diesen TP.

## 2. Test Plan

| test_id | Fälle und erwartetes Ergebnis | Ausführung und Evidenz |
|---|---|---|
| V01 | Neuer Auftrag bei null/einem fremden/mehreren Runs; neue ID wird vorbereitet; fremde Run-Digests unverändert. Kollision übernimmt keinen Run. resume ohne Bindung sowie ungültige Moduskombinationen werden zurückgewiesen | skill-dispatch-function-contract-test.js, skill-dispatch-test.js und Binding-Tests erweitern |
| V02 | Unklare Fortsetzung bleibt Auswahl; fehlender Modus wählt keinen fremden Run. Fehlende/mehrdeutige/ungültige Auswahl bietet kein Approval: UR oder suggerierte Folgeaktion | Dispatch-, Gate- und Präsentationstests; deutsche/englische gerenderte Ausgaben |
| V03 | Gepackter Validator führt run-create über denselben Owner wie volle CLI aus; ungültige Pfade, Symlinks, fehlendes Gerüst, Kollision und konkurrierende Anlage bleiben sicher | local-validator-test.js und CLI-/Kontrollzustandstests erweitern |
| V04 | continue_delivery nur bei gültiger UR und internem erlaubtem Gate nichtterminal. Status, fehlende Freigabe, Blockade und nächstes Nutzer-Gate terminal. Unveränderter Zustand wird nicht endlos ausgeführt | Dispatch- und Skill-Vertragstests; gemockte Entscheidung plus reale Kontrollzustandsfixtures |
| V05 | Beleg bindet Run, Gate, Revision, Inhalt und Darstellung. Gültiges Approval akzeptiert; fehlende, fremde, manipulierte, veraltete Bindung/Artefakte abgelehnt. UR/PRD/SD/TP/QA und gate-spezifische UAT-Evidenz abdecken | control-state-test.js erweitern oder fokussierte Suite im bestehenden Kontrollzustandstestlauf einbinden |
| V06 | Beleg-IDs können keine Pfade verlassen; Symlinks und unzulässige Dateien abweisen. Exklusive Anlage; Mutation zwischen Vorbereitung und Antwort zurückweisen; zwei konkurrierende Antworten höchstens einmal erfolgreich | temporäre isolierte Run-Stores; deterministische Synchronisation statt Timing-Schlaf |
| V07 | Unterbrechung nach create, UR, Präsentation, Approval und vor route; Wiederaufnahme erzeugt weder Doppelrun noch doppelte Freigabe. revise/decline/cancel/empty/timeouts erteilen keine Autorität | Kontrollzustands-/E2E-Fixtures; Dateien vor/nach vergleichen |
| V08 | Reale installierbare Paketdateien in neuem temporärem Verzeichnis: new -> run-create -> UR -> run-step -> run-present -> gebundene Testantwort -> run-approve -> continue_delivery -> Review/route -> nächstes Gate. Kein Zugriff auf Quell-CLI als Ersatz | neuer zusammenhängender Regressionstest, an bestehenden npm-Testlauf angeschlossen; Paketdigest, Ausgaben und Assertions. Synthetische Antworten ausschließlich im automatisierten Test, nicht als Live-Nutzerfreigabe |
| V09 | Statusaufrufe inklusive --approval-envelope und MCP schreiben nichts. Contracts/Skills/CLI-Hilfe transportieren new/resume/continue/presentation identisch. Neue Felder gegen alte Runtime scheitern klar | relevante Schema-, Aktivierungs-, Host-, Sprach- und Runtime-Tests; Dateibestandvergleich |
| V10 | Generierung und Paketierung enthalten alle neuen Owner; Versions-/Digestprüfung bleibt intakt. Bestehende Regressionen bleiben wirksam | release:prepare; Paket-/Runtime-/Skill-Tests, danach vollständiger smoke-test einmal vor QA |
| V11 | Echter sichtbarer Mehrturn-Verlauf: Beleg vor Anzeige und Nutzerantwort; gebundene Freigabe; interne Fortsetzung ohne weiteren Weiterarbeits-Prompt; nächstes Nutzer-Gate stoppt. Statusfrage separat unverändert. Veralteter Vorschlag verlangt neue Entscheidung | Beobachtungsprotokoll, tatsächlicher Chat-/Tool-Verlauf, installierte Version und Digest. Fehlender Live-Nachweis bleibt evidence_gap und verhindert vollständiges QA-pass für die UX-Behauptung |

### Prüfkommandos und Ausführungsdisziplin

Nach T01 werden vorhandene Skripte gegen den aktuellen Stand bestätigt. Betroffene gezielte Suites: `npm --prefix create-agdf run test:skill-dispatch`, `test:cli-modularization`, `test:local-validator`, `test:control-state`, `test:interaction-presentation`, `test:operational-localization`, `test:request-activation`, `test:host-command`, `test:plugin-mcp-runtime`, `test:mcp-server` und neue fokussierte Tests. Die npm-Namen nach dem ersten Befehl verwenden denselben Präfix und `run`.

Generierung vor Paket-/Hosttests; bestehende release:prepare-, package-build-, package-contents-, runtime-integrity- und Skill-Conformance-Suites verwenden. Vollständigen smoke-test vor QA einmal ausführen; anschließend nur bei neuen Änderungen/Fehlern angemessen wiederholen. `git diff --check` und auf diesen Run begrenzte doctor/gate-check/delivery-map-Prüfungen vervollständigen den Nachweis. Keine fremden Baseline-Fehler verschweigen oder Assertions abschwächen.

### UX Intent Fidelity

TP Review muss IC-01 bis IC-08 auf task_id, working_mode_state, visible_evidence und fidelity_status abbilden. Code-/Mocktests ersetzen keine sichtbaren Belege für IC-02,04,05,07,08. Offene Abweichungen als requirements_gap, design_gap, plan_gap, implementation_gap oder evidence_gap zum zuständigen Owner routen.

## 3. Brownfield Scope

Vor T02: skill-dispatch/contract.js, service.js, delivery-intake.js; CLI-Parser/Registry/application/validation-handlers; runtime/validator-application.js; control-state/run-recording.js, run-state-repository.js, run-state-writer.js, run-seal.js und gate-approval-validator.js; gate-check.js/interaction-presentation.js; MCP-Dispatch-Transport; Generatoren und Host-Projektionen. Bereits vorhandene Laufdaten und Freigaben nur lesen und erhalten.

T01 muss insbesondere klären, wie Run-Siegel und Approval-Nachweise den neuen Beleg referenzieren, ohne historische Freigaben umzuschreiben, und welche vorhandenen Installations-/Payloadtests neue Module aufnehmen. Eine Abweichung vom freigegebenen SD führt zur SD-Revision, nicht zu einer stillen Architekturänderung.

## 4. Out Of Scope

MGDF-Code und historische MGDF-Freigaben; fremde AGDF-Runs; automatische Gate-Antworten; allgemeiner Agenten-Ausführungsschleifer; neue schreibende MCP-Funktion; Veröffentlichung, Commit, Push oder PR ohne Auftrag. Kein direkter Patch im installierten Cache. Keine persönliche Memory-Aktualisierung.

## 5. Risks And Blockers

- Autoritätsverletzung, fremde Mutation, ungebundene Antwort oder Schreiben durch Status/MCP: block.
- Fehlender realer Mehrturn-/Installationsnachweis: evidence_gap, kein vollständiges QA-pass; Quell- und Paketfortschritt trotzdem präzise ausweisen.
- Neue Syntax benötigt konsistente Runtime-/Skill-Auslieferung. Unbekannte Pflichtbindung darf nicht still auf alte Semantik zurückfallen.
- Installation für V11 über den unterstützten lokalen Weg; erforderliche Host-Neustarts und echte Freigabeentscheidungen dem Nutzer konkret vorbereiten. Keine erfundenen Beobachtungen und keine ungefragte Aktivierung anderer Hosts.
- Sichtbarkeit bleibt Host-/Agentenbeleg; ein gespeicherter Präsentationsdatensatz ist kein kryptografischer Beweis menschlicher Wahrnehmung.
- Bei T07 muss die Behandlung weiterer Freigaben dieses Reparaturlaufs die neue Bindung nutzen, sobald der neue Pfad wirksam wird. Bereits erteilte Freigaben bleiben historisch unverändert.

## 6. Next Step

TP Fassung 1 und die gebundene Run-Revision prüfen. `Approval: TP` erlaubt zunächst T01 (Implementierungsvorbereitung) und bei positivem Ergebnis die Umsetzung des genehmigten Umfangs. Spätere QA-/UAT-Entscheidungen bleiben getrennt.
