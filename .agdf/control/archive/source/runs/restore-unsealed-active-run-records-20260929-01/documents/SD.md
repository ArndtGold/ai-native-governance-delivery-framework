# Solution Design: Recovery ungesiegelter aktiver AGDF-Runs

Status: draft
Gate: SD
Gate approval: open
Based on: genehmigte PRD-Revision 7 · sha256:831707db1e6fe4970a718ce30ae470857207859bfe105eb770e948c255313158
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Der bestehende Control-State-Lifecycle erhält einen expliziten, rungebundenen Recovery-Pfad für kanonische v2-Run-States mit fehlenden oder ungültigen Siegeln. Er besteht aus einer read-only Prüfung, einer digestgebundenen Vorschau und einer ausdrücklich bestätigten Wiederherstellung je Run. Die Ausführung verwendet den bestehenden Run-State-Writer als alleinigen Eigentümer für Sperre, atomaren Dateiaustausch, Revision und Siegelberechnung; sie führt keinen parallelen Writer ein.

Die Vorschau bindet Run-ID, unveränderten Inhaltssnapshot, alle gelisteten Artefaktdigests, Approval-Zeilen und den daraus abgeleiteten nächsten Gate-Schritt. Vor dem Schreiben prüft der Lifecycle dieselben Bindungen unter der Run-Sperre erneut. Konflikt, geänderter Snapshot, ungültiger Pfad, unvollständige Run-Struktur oder nicht auflösbarer Inhalt stoppt diesen Run ohne Überschreiben.

Historische Approval-Zeilen werden nur übernommen, wenn ein unabhängiger, vertrauenswürdiger Nachweis sie exakt an Run, Gate, Revision, gespeicherte Präsentation und ursprüngliche Antwort bindet. Das ungesiegelte Run-State-Dokument allein und ein `run-present`-Datensatz allein erfüllen diese Schwelle nicht. Fehlt ein solcher Nachweis, wird ab dem frühesten unbelegten Gate diese und jede nachfolgende Approval-Zeile unwirksam; die normale Gate-Sequenz fordert die Freigaben erneut an. Das neue Siegel schützt ausschließlich den bestätigten Zustand ab der Recovery.

Der erste Lieferumfang arbeitet pro Run. Eine Batch-Koordination kann später dieselbe per-Run-Operation wiederverwenden; Batch-Planung, MCP-Intake, SessionStart-Automation und UI-Änderungen sind nicht Teil dieser PRD.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design action |
|---|---|---|
| Run-Identität und autoritativer Ist-Zustand | `.agdf/control/runs/{run_id}/RUN_STATE.md` und `run-state-resolver.js` | Run exakt auswählen; den aktuellen ungesiegelten Inhalt nur als bestätigten Recovery-Snapshot behandeln, nicht als Beleg früherer Freigaben. |
| Artefakte und Pfadgrenze | Artefaktliste im Run State; `run-seal.js` und `contained-file.js` | Alle gelisteten Dateien vor und während der Vorschau aufzulösen, zu hashen und auf erlaubte Run-/Artefaktpfade zu begrenzen. |
| Approval-Übergänge | `gate-policy.js`, `run-presentation.js`, `run-recording.js` | Frühestes nicht belegtes Gate ermitteln; frühere wirksame Freigaben nur nach unabhängiger exakter Evidenz behalten; sonst reguläre Approval-Sequenz nutzen. |
| Sperre, Revision, Atomizität und Siegel | `run-state-writer.js`, `run-seal.js` | Den gemeinsamen Lock- und Atomic-Write-Pfad erweitern, sodass ein eng begrenzter Recovery-Aufruf einen validierten unsealed Zustand annimmt, Approval-Zeilen policykonform normalisiert und Revision plus beide Siegel in einem Write erstellt. Normale Updates bleiben fail-closed. |
| Recovery-Orchestrierung und Vorschau | neues `control-state/run-recovery.js`, aufgerufen über einen expliziten CLI-Befehl | Read-only Prüfen/Vorschauen sowie gebundene Bestätigung orchestrieren; keine direkte Dateischreib- oder eigene Seal-Implementierung. |
| Entscheidung und Ausführung | Repository-Eigentümer über exakt gebundene Vorschau; bestehende CLI-Control-State-Oberfläche | Keine automatische Ausführung durch Doctor, SessionStart oder `agdf_dispatch`; jede Recovery beginnt mit expliziter Run-ID und Snapshot-Bestätigung. |

Die 23 Run States sind derzeit die einzige gebundene Auswahl. Neue Doctor-Ausgaben oder weitere Runs erweitern eine bestätigte Vorschau nicht. Die historische Legacy-Datei `.agdf/control/AGDF_RUN.md` bleibt beim getrennten `run-migrate`-Pfad.

## 3. Architecture Decisions

- SDD-001: Recovery verwendet eine explizite per-Run CLI-Operation mit read-only Prüfung/Vorschau und separater Bestätigung der gebundenen Preview-ID; rationale: vorhandener `run-present`/`run-approve`-Pfad bleibt Approval-Eigentümer und die PRD verlangt menschliche Bestätigung je exaktem Run und Snapshot; consequence: die erste Version bietet keine Batch-Bestätigung und ändert keine MCP- oder SessionStart-Oberfläche.
- SDD-002: Der Control-State-Writer bleibt der einzige persistente Run-Writer und erhält einen separaten, capability-begrenzten Recovery-Einstieg unter demselben Run-Lock und Atomic-Write-Pfad; rationale: nur der kanonische Eigentümer kann Revision und beide Siegel konsistent mit den gelisteten Artefakten berechnen; consequence: Writer-Validierung wird refaktoriert und muss gewöhnliche `run-update`-Aufrufe weiterhin für unsealed/invalid Runs abweisen.
- SDD-003: Recovery erhält ein exklusiv erzeugtes Journal pro Run-Preview, das Snapshot-Digests, ausgewählte Approval-Behandlung, Preview-ID und Transaktionsphase bindet; rationale: Absturz und Wiederholung müssen ohne Doppelrevision oder stilles Überschreiben unterscheidbar sein; consequence: Journal- und Recovery-Pfad werden Teil der geschützten Control-State-Struktur, und unbekannte Phasen oder Byteabweichungen blockieren statt automatisch zu überschreiben.
- SDD-004: Für jede Approval-Zeile gilt eine unabhängige Vertrauensschwelle; nicht belegte Freigaben werden ab dem frühesten unbelegten Gate samt späteren Freigaben deaktiviert und über die normale Sequenz erneuert; rationale: ein neues Integritätssiegel beweist keine frühere Antwort, und spätere Freigaben hängen von den vorangehenden Gates ab; consequence: Runs ohne unabhängigen Originalnachweis können mehr als ein Gate erneut durchlaufen müssen.
- SDD-005: Pro Run werden nur Run State und Recovery-Journal geschrieben; gelistete Artefakte, andere Runs, Legacy-Projektionen, MCP-Tool-Schemas, Installer und Release-Dateien werden nicht durch Recovery mutiert; rationale: die PRD verlangt eine unabhängige Run-Transaktion und schließt Host-/MCP-Änderungen aus; consequence: Batch-Status wird aus unabhängigen Run-Ergebnissen gebildet und Rollback betrifft nur den betroffenen Run.

## 4. Integration Points

| Integration point | Design action | Compatibility boundary |
|---|---|---|
| CLI-Registry und Validation Handler | Einen neuen Befehl für Prüfung/Vorschau/Bestätigung an `run-recovery.js` routen. | Vorhandene Befehle und JSON-Ergebnisse bleiben kompatibel; es gibt keinen ungebundenen Default-Run. |
| `control-state/run-recovery.js` | Run auflösen, Status und Herkunft prüfen, Approval-Provenienz bewerten, Preview erzeugen und bestätigte Recovery orchestrieren. | Keine Gate-Policy duplizieren; Übergangsentscheidung an den existierenden Gate-Eigentümer delegieren. |
| `control-state/run-state-writer.js` | Engen Recovery-Schreibpfad unter vorhandener Sperre und `atomicWrite` ergänzen. | Nur dieser Pfad darf einen unsealed Ausgang akzeptieren; reguläre Revisionen und Approval-Änderungen bleiben restriktiv. |
| `run-seal.js`, `run-state-parser.js`, `contained-file.js` | Beide Siegel nur aus validiertem resultierendem Inhalt und unveränderten, enthaltenen Artefakten berechnen. | Siegel dokumentieren Integrität ab Recovery, keine Identität oder frühere Freigabe. |
| `command-registry.js`, `validation-handlers.js`, Laufzeittests | Neue CLI-Argumente, Befehlsroute und Recovery-Verträge abbilden. | Kein MCP-Tool, kein automatischer Hook und kein Write-Shortcut aus `doctor`. |
| `doctor.js`, `gate-check.js`, `delivery-map.js` | Bestehende Evaluatoren lesen den wiederhergestellten Run wie einen normalen gesiegelten Run. | Erfolgsbefund bedeutet gültigen aktuellen Zustand; er ändert nicht die Bewertung unabhängiger Warnungen. |

## 5. Constraints And Compatibility

- Vorschau und Prüfung ändern weder Run State noch gelistete Artefakte; eine Preview-ID oder ein Recovery-Journal bindet nur die spätere bestätigte Transaktion.
- Anwenden erfordert Run-ID, Preview-ID und exakt passende Inhalt- und Artefakt-Digests. Die Werte werden vor jeder Änderung unter derselben Sperre erneut gelesen.
- Keine Git-Version wird automatisch gewählt. Eine historische Revision ist nur eine Quelle, wenn ihre Identität und die betroffenen Artefakte konkret belegt sind; andernfalls bleibt der Run gesperrt oder die bestätigte aktuelle Momentaufnahme wird mit unbelegten Approvals zurückgesetzt.
- Bestehende Approval-Zeilen werden nie als historisch echt behandelt, nur weil sie aktuell lesbar sind. Ein `run-present`-Datensatz belegt die erzeugte Darstellung, nicht eine menschliche Antwort.
- Der Recovery-Writer ändert nur den ausgewählten kanonischen Run-State und sein Journal. Verweise aus `Artefacts` bleiben enthalten und unverändert; fremde Pfade, Symlinks, fehlende Dateien, Duplikate und ungültige Zustände blockieren.
- Wiederaufnahme ist nur für bekannte Journalphasen und exakt passende Vorher-/Nachher-Digests zulässig. Jede unerwartete Abweichung stoppt ohne automatisches Rollback über zwischenzeitliche Fremdänderungen.
- Die alte Legacy-Migration und vorhandene Gate-Sequenz bleiben getrennt. MCP-Intake-Vereinfachung ist out of scope.

## 6. Test And Evidence Strategy

Der TP muss konkrete Fälle und erwartete Ergebnisse für folgende Punkte festlegen:

- read-only Inventar und Vorschau für jeden gebundenen Run, inklusive exakter Auswahl, Run-/Artefakt-Digests, Approval-Provenienz und nächstem Gate;
- gültige und fehlende Approval-Nachweise, falsche Run-/Gate-/Revisions-/Presentation-Bindung, veränderte Approval-Zeile, sowie Neustart ab dem frühesten unbelegten Gate;
- erfolgreiche Vorschau-Bestätigung und negative Fälle für falsche Preview-ID, veralteten Snapshot, geändertes Artefakt, Symlink, Pfadflucht, fehlende Datei, Duplikatzeile und Run-Kollision;
- Fehler-Injektion vor Journalanlage, nach Journalanlage, vor atomarem Rename, direkt nach Rename und vor Abschlussmarkierung; Wiederaufnahme muss idempotent und pro Run unabhängig bleiben;
- Abgleich der Vorher-/Nachher-Digests für Run State und alle gelisteten Artefakte; Doctor und Gate-Check nach erfolgreicher Recovery sowie spezifische Blockgründe für nicht auflösbare Runs;
- Selektionsgrenze über die bestätigte Run-Liste: der Review-Run `agdf-review-remediation-20260929-01` und nicht ausgewählte Runs bleiben bytegleich;
- unverändertes Verhalten von normalem `run-update`, `run-approve` und `run-migrate`, insbesondere fail-closed Ablehnung unsealed/invalid Updates außerhalb der Recovery-Capability.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Read-only Prüfung gibt exakt die bestätigten Run-IDs, Revision-/Artefaktdigests, Seal-Status, Git-Herkunft und wirksamen Approval-Zeilen pro Run aus. | `doctor.js`, `run-state-resolver.js`, `run-seal.js`, Git-Historie; Control-State-Eigentümer | SDD-001, SDD-004 | Unvollständige Git- oder Approval-Historie stoppt den betroffenen Run und erweitert die Auswahl nicht. |
| AC-002 | Preview zeigt Quellrevision, gelistete Artefakte, Approval-Behandlung und Gate-Folge vor jeder Run-State-Änderung; jeder Run wird einzeln bestätigt. | `run-recovery.js`, `run-state-parser.js`, `gate-policy.js`; Control-State-Eigentümer | SDD-001, SDD-003, SDD-004 | Kein Batch-Apply in der ersten Version; gemischte Ergebnisse bleiben getrennte Run-Ergebnisse. |
| AC-003 | Nur unabhängig validierte Originalnachweise erhalten ein Approval; ab dem frühesten nicht belegten Gate und danach werden Freigaben erneut eingeholt. | `run-presentation.js`, `run-recording.js`, `gate-policy.js`; Approval-/Control-State-Eigentümer | SDD-004 | Fehlt ein unabhängiger Hostnachweis, müssen historische Gates erneut durchlaufen werden. |
| AC-004 | Der Recovery-Einstieg lässt den gemeinsamen Run-State-Writer Revision und beide Integritätssiegel aus bestätigtem Inhalt und Artefakten erzeugen. | `run-state-writer.js`, `run-seal.js`; Control-State-Eigentümer | SDD-002, SDD-005 | Der neue Seal-Status ist keine Signatur und beweist keine frühere Approval-Herkunft. |
| AC-005 | Exklusives Journal und atomarer Austausch machen Abbruchphase, idempotente Fortsetzung und Einzel-Run-Transaktion explizit. | `run-state-writer.js`, `atomicWrite`, Recovery-Journal; Control-State-Eigentümer | SDD-002, SDD-003, SDD-005 | Unbekannte Phase oder nicht passender Digest führt zu sichtbarer Sperre statt automatischer Reparatur. |
| AC-006 | Preview-Digests, Pfadprüfung und erneute Validierung unter Lock verweigern Writes bei Snapshot- oder Pfadkonflikten. | `contained-file.js`, `run-state-parser.js`, `run-state-writer.js`; Control-State-Eigentümer | SDD-002, SDD-003 | Plattformspezifische Symlink- und Rename-Grenzen benötigen gezielte TP-Fälle; der sichere Ausgang bleibt blockiert. |
| AC-007 | Doctor liest den neu versiegelten Zustand und ordnet verbleibende Blocker je Run zu; unabhängige Warnungen bleiben bestehen. | `doctor.js`, `run-seal.js`, `run-recovery.js`; Control-Evaluation-Eigentümer | SDD-002, SDD-004 | `doctor --all-active` enthält weiter Warnungen und Befunde außerhalb der expliziten Wiederherstellung. |
| AC-008 | Schreibauswahl ist auf einen Run pro bestätigter Operation begrenzt; keine Freigabe oder Artefaktdatei wird zwischen Runs übertragen. | `run-recovery.js`, `run-state-writer.js`; Control-State-Eigentümer | SDD-001, SDD-005 | Orchestrierung mehrerer Runs muss Ergebnisse getrennt ausweisen und darf keine globale Rollback-Annahme machen. |

## 8. Risks And Open Questions

- Für die 23 Runs wurde bisher keine gesiegelte Git-Fassung gefunden. Ob außerhalb von Git unabhängige Originalnachweise existieren, ist noch zu prüfen; ohne solchen Nachweis setzt die Recovery die Approval-Sequenz am frühesten Gate zurück.
- Der bestehende Host speichert `run-present`-Records lokal, aber diese allein attestieren keine menschliche Antwort. TP muss die konkret verfügbaren, unabhängigen Nachweisquellen verifizieren; kein Nachweis darf durch das Recovery-Journal selbst erzeugt oder als unabhängig behandelt werden.
- Die Recovery-Journal-Phasen und ihre Verzeichnis-/Retention-Regeln müssen im TP auf Crash- und Konkurrenzfälle festgelegt werden. Eine unklare Phase bleibt blockiert.
- Die Wiederherstellung der 23 Runs ist eine spätere, ausdrücklich ausgewählte Ausführung und nicht Teil dieses SD-/TP-Drafts. Heute wurden an diesen 23 Runs keine Änderungen vorgenommen.

## 9. Next Step

Dieses Solution Design prüfen und nur exakt mit `Approval: SD` freigeben. Danach darf der Task/Test Plan erstellt werden; Implementierung bleibt bis zur separaten TP-Freigabe gesperrt.

## AGDF Approval Summary (de; source=de)

- Lösung: Ein expliziter, pro Run bestätigter Recovery-Pfad prüft und bindet den exakten Snapshot; der bestehende Control-State-Writer erzeugt die nächste Revision und beide Siegel.
- Freigaben: Historische Approvals bleiben nur mit unabhängiger, exakter Run-/Gate-/Revisions-/Präsentations-/Antwort-Evidenz wirksam; sonst beginnt die normale Gate-Sequenz am frühesten unbelegten Punkt neu.
- Entscheidungen:
  - SDD-001: Read-only Vorschau und separate Bestätigung je Run; Batch-, MCP- und SessionStart-Ausführung bleiben außerhalb des Umfangs.
  - SDD-002: Ein gemeinsamer Writer, Lock und atomarer Dateiwechsel; normale Updates bleiben bei unsealed/invalid fail-closed.
  - SDD-003: Exklusives Journal bindet Preview-ID, Snapshot-Digests und Transaktionsphase; unbekannte Zustände blockieren.
  - SDD-004: Unbelegte Approval-Zeilen werden ab dem frühesten Gate samt späterer Freigaben deaktiviert und regulär erneuert.
  - SDD-005: Änderungen bleiben auf den ausgewählten Run und sein Journal begrenzt; gelistete Artefakte und andere Runs bleiben unverändert.
- Risiken: Für keinen der 23 Runs ist eine gesiegelte Historie bekannt; unabhängige externe Approval-Nachweise sind noch nicht inventarisiert.
