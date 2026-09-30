# PRD: Recovery ungesiegelter aktiver AGDF-Runs

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

AGDF muss die 23 im Doctor-Bericht vom 2026-09-29 benannten aktiven, kanonischen Run States mit `AGDF_RUN_SEAL_INVALID` sicher prüfen und entweder auf einen belegbaren Kontrollstand zurückführen oder mit einem konkreten, zulässigen nächsten Schritt blockiert lassen.

Die Funktion muss einen unverändernden Prüf-/Vorschauschritt und eine explizit ausgelöste Wiederherstellung unterstützen. Jede Wiederherstellung ist an einen exakten Run und eine zuvor geprüfte Revision gebunden. Batch-Bearbeitung darf mehrere ausdrücklich ausgewählte Runs koordinieren, muss aber pro Run unabhängig atomar und wiederaufnehmbar sein.

Ein Siegel belegt die Integrität des Zustands ab der Wiederherstellung. Es ist kein Signaturnachweis für frühere Freigaben. Frühere Gate-Freigaben dürfen nur weiter als wirksam geführt werden, wenn ihre ursprüngliche Freigabe samt Run, Gate, Revision, Präsentation und exakter Antwort nachvollziehbar belegt ist. Fehlt dieser Beleg, bleibt die Freigabe unwirksam und die reguläre Gate-Sequenz muss ab dem frühesten unbelegten Gate neu durchlaufen werden.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: not_applicable; diese PRD ändert keine Statuskarte, Gate-Präsentation oder MCP-Nutzeroberfläche. Die diskutierte MCP-Intake-Vereinfachung ist ein separates Vorhaben.
- primary_user_intent: die betroffenen Run States mit sichtbarer Evidenz und kontrollierter Wiederherstellung wieder arbeitsfähig machen.
- success_signal: Für jeden ausgewählten Run sieht der Nutzer vor jedem Schreibvorgang den geprüften Zustand, die erhaltenen oder erneut erforderlichen Freigaben und das Ergebnis; Unterbrechungen lassen sich ohne Doppeländerung fortsetzen.
- primary_decision_or_action: einen exakt ausgewählten Run nach Prüfung seiner Historie wiederherstellen oder ihn mit dem fehlenden Nachweis blockiert lassen.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Prüfung | Run bleibt unverändert; Integritäts- und Herkunftsbefund ist read-only | gültige Basis, fehlende Basis, Approval-Nachweis fehlt, Konflikt | kanonischer Run State, Git-Historie und validierte Approval-Präsentation | bestehender Doctor-/Status-Ausgabepfad |
| Vorschau | keine Run-Änderung; der konkrete vorgeschlagene Wiederherstellungsschritt ist gebunden | wiederherstellbar, erneute Gate-Freigabe erforderlich, blockiert | Recovery-Prüfung für den ausgewählten Run und die geprüfte Revision | bestehender Run-present-/Gate-Status-Pfad |
| Wiederherstellung | nur der bestätigte Run erhält eine neue Revision; nicht belegte Approval-Zeilen werden nicht als genehmigt gewertet | erfolgreich wiederhergestellt, teilweise wiederhergestellt, blockiert, Wiederaufnahme erforderlich | kanonischer Lifecycle-Writer und Run-Seal-Eigentümer | bestehender Run Status-/Doctor-Pfad |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: kein automatischer Schreibvorgang beim Start oder bei `doctor`; Beginn nur nach explizitem Wiederherstellungsauftrag mit aufgelisteten Run-IDs. Eine neue Doctor-Ausgabe erweitert die gebundene Auswahl nicht automatisch.
- blockers_and_visible_next_actions: fehlende Run-Historie, unbekannte Dateiherkunft, Approval ohne prüfbare Präsentation/Antwort, Revisionskonflikt oder nicht unterstützter Run-Typ blockiert den betroffenen Run mit Code, Pfad und erforderlichem Beleg.
- recovery_paths: read-only Prüfung wiederholen; vertrauenswürdige Quelle nachreichen; unbelegte Gates über normale Präsentation und exakte Freigabe erneut durchlaufen; fehlgeschlagene Run-Transaktion anhand ihrer Journal-ID idempotent wiederaufnehmen.
- relevant_state_transitions: `unsealed` → `preview_ready` nur mit identitätsgeprüftem Run und aufgelöster Inhaltsquelle; `preview_ready` → `recovery_confirmed` nur für den exakten Run und Snapshot; `recovery_confirmed` → `sealed` nur durch den gemeinsamen Lifecycle-Writer; fehlt Approval-Provenienz, bleibt das Gate ab dem frühesten unbelegten Punkt offen. Bei Snapshot-Änderung oder Abbruch bleibt der Run blockiert und zeigt einen sicheren Wiederaufnahme- oder Abbruchschritt.

## 5. Acceptance Criteria

### AC-001 — Gebundener Findings-Bestand
- criterion_id: AC-001
- observable_success: Für jeden Run der expliziten Auswahl liegen ID, aktueller Revision-Hash, Seal-Status, Git-Historie-Beleg und aktive Approval-Zeilen vor; der geprüfte Bestand ist exakt und unverändert.

Die Prüfung zeigt für jeden ausgewählten Run ID, aktuellen Revision-Hash, Seal-Status, Git-Historie-Beleg und aktive Approval-Zeilen. Sie ändert keine Datei. Der geprüfte Bestand im Ergebnis entspricht genau der expliziten Run-Auswahl.

### AC-002 — Voransicht je Run
- criterion_id: AC-002
- observable_success: Die Vorschau weist je Run Quellrevision, betroffene Artefakte, Approval-Behandlung und nächsten Gate-Schritt aus; unklare Quellen oder Konflikte blockieren nur den betroffenen Run.

Vor einer Wiederherstellung zeigt die Vorschau für jeden Run die vorgesehene Quellrevision, alle betroffenen Artefakte, die Behandlung jeder Gate-Freigabe sowie den resultierenden nächsten Gate-Schritt. Unklare Quellen und Konflikte sind sichtbar und blockieren nur den betroffenen Run.

### AC-003 — Keine unbelegte Approval-Übernahme
- criterion_id: AC-003
- observable_success: Eine frühere Freigabe bleibt nur mit prüfbarer Run-, Gate-, Revisions-, Präsentations- und Antwortbindung wirksam; andernfalls beginnt die reguläre Gate-Sequenz am frühesten unbelegten Gate.

Eine bisherige Gate-Freigabe bleibt nur wirksam, wenn eine prüfbare ursprüngliche Präsentation mit passender Run-ID, Gate, Revision, Presentation-ID und exakter Antwort vorliegt. Sonst wird sie nicht als `approved` übernommen; die reguläre Gate-Sequenz beginnt am frühesten unbelegten Gate.

### AC-004 — Kontrollierte Versiegelung
- criterion_id: AC-004
- observable_success: Der Lifecycle- und Seal-Eigentümer erzeugt eine neue Revision aus dem bestätigten Inhalt und den gelisteten Artefakten, ohne Signatur oder rückwirkende Approval-Echtheit zu behaupten.

Eine erfolgreiche Wiederherstellung erzeugt über den vorhandenen Lifecycle- und Seal-Eigentümer eine neue Revision und berechnet beide Siegel aus dem bestätigten Inhalt und den gelisteten Artefakten. Das Ergebnis behauptet keine Signatur oder rückwirkende Echtheit früherer Freigaben.

### AC-005 — Atomare Run-Grenze
- criterion_id: AC-005
- observable_success: Jeder Run bleibt unabhängig atomar und nach Abbruch eindeutig unverändert, wiederhergestellt oder wiederaufnehmbar; Wiederholung erzeugt keine doppelte Revision und überschreibt keinen geänderten Run.

Jeder Run ist eine unabhängige atomare Transaktion. Nach Abbruch ist für jeden Run eindeutig, ob er unverändert, wiederhergestellt oder sicher wiederaufnehmbar ist. Wiederholung erzeugt keine doppelte Revision und überschreibt keine inzwischen geänderte Run-Datei.

### AC-006 — Konflikt- und Pfadschutz
- criterion_id: AC-006
- observable_success: Bei geänderter Vorschau-Snapshot-Basis oder unzulässigem Artefaktpfad wird nicht geschrieben; Run, Konfliktgrund und zulässige nächste Aktion werden angezeigt.

Ändert sich der Run nach der Vorschau oder liegt ein Artefakt außerhalb der erlaubten Run-/Artefaktpfade, wird nicht geschrieben. Der Nutzer erhält den betroffenen Run, den Konfliktgrund und die nächste zulässige Aktion.

### AC-007 — Verifizierbarer Abschluss
- criterion_id: AC-007
- observable_success: Doctor meldet für erfolgreich wiederhergestellte Runs keinen `AGDF_RUN_SEAL_INVALID`; nicht wiederherstellbare Runs bleiben mit spezifischem Grund blockiert und unabhängige Warnungen gelten nicht als behoben.

Nach der Operation liefert `doctor --all-active --json` für jeden erfolgreich wiederhergestellten Run keinen `AGDF_RUN_SEAL_INVALID`-Befund mehr. Nicht wiederherstellbare Runs bleiben blockiert und werden mit ihrem spezifischen Grund ausgegeben. Warnungen zu Risiken oder fehlender Evidenz werden nicht als behoben gezählt.

### AC-008 — Erhaltung der unabhängigen Runs
- criterion_id: AC-008
- observable_success: Der benannte Review-Run und alle nicht ausgewählten Runs bleiben bytegleich; Approval-Freigaben werden nicht zwischen Runs übertragen.

Run `agdf-review-remediation-20260929-01` und alle Runs außerhalb der ausdrücklich gewählten 23 bleiben bytegleich. Freigaben werden nicht zwischen Runs übertragen.

## 6. Non-Goals

- Änderung der Gate-Sequenz oder allgemeine Lockerung des Approval-Vertrags.
- Manuelle Erzeugung oder Einfügung von Seal-Zeilen.
- Automatisches Migrieren aller aktiven Runs oder automatische Ausführung durch SessionStart.
- Erweiterung der MCP-Nutzeroberfläche oder neue Anfrage-/Intake-Vereinfachung; dies bleibt ein eigenes Vorhaben im bestehenden MCP-Service.
- Behebung der 62 Warnungen oder des einzelnen `revise`-Findings aus dem Doctor-Bericht.
- Änderung von Plugin-Installation, Paketierung, Host-Konfiguration, Veröffentlichung oder VCS-Zustand.

## 7. Users And Roles

- Nutzer/Repository-Eigentümer: wählt die betroffenen Runs und bestätigt den angezeigten, exakten Wiederherstellungsschritt.
- AGDF-Lifecycle: validiert Identität, Revision, Provenienz, Pfade und Transaktion; alleiniger Schreib- und Seal-Eigentümer.
- Run-/Artefakt-Eigentümer: liefert fehlende Approval-Präsentationen oder akzeptiert die erneute Gate-Sequenz für unbelegte Freigaben.

## 8. Constraints

- Ein Content- oder Approval-Seal ist Integritätsschutz, keine Signatur und kein rückwirkender Herkunftsnachweis.
- Bestehende `run-update`- und Approval-Validierung bleibt fail-closed.
- Legacy-Import der alten einzelnen `AGDF_RUN.md` und Recovery bestehender kanonischer Run-Verzeichnisse bleiben als getrennte Quellen klar unterscheidbar.
- Exakte Run-Auswahl, Snapshot-Bindung, Pfadbegrenzung, Kollisionsschutz und nachvollziehbare Wiederaufnahme sind erforderlich.
- Die Recovery-Operation darf keinen parallelen Run-State-Writer einführen.

## 9. Evidence Requirements

- Herkunfts- und Integritätsreport pro Run vor der Vorschau.
- Prüfung von approval-evidence auf exakte Run-/Gate-/Revisions-/Presentation-Bindung.
- Vorher-/Nachher-Digests für Run State und alle gelisteten Artefakte.
- Fault-Injection für Abbruch vor, während und nach Transaktionsschritten sowie idempotente Wiederaufnahme.
- Schutztests für geänderte Snapshots, Pfadmanipulation, Symlinks, Mehrfachauswahl und gemischte Erfolgs-/Blockierungsfälle.
- All-active Doctor-Ausgabe vor und nach dem Lauf mit Zuordnung der Ergebnisse zum ausgewählten Bestand.

## 10. Risks And Open Questions

- Für keinen der 23 Runs enthält die geprüfte Git-Historie eine Version mit beiden Siegelzeilen. Frühere Gate-Freigaben sind daher nicht über eine gesiegelte Revision belegt.
- Die Verfügbarkeit originaler `run-present`-/`run-approve`-Nachweise außerhalb des Repositorys ist noch nicht geprüft.
- Die konkrete Vorschau-, Bestätigungs- und Wiederaufnahmeoberfläche bleibt ein SD-Entscheid; sie ändert keine Gate-Formel.
- Die 62 Warnungen und ein `revise`-Finding bleiben eigenständige Befunde, selbst wenn alle 23 Seal-Blocker geklärt sind.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Umgang mit früheren Freigaben ohne gesiegelten Herkunftsnachweis | before_prd | resolved | Entsprechend der genehmigten UR werden sie nicht ungeprüft übernommen. Nur exakt gebundene Originalnachweise erhalten ihren Status; andernfalls ist die normale Gate-Freigabe ab dem frühesten unbelegten Gate erneut einzuholen. | Arndt Gold |
| Erforderliche Transaktions- und Wiederaufnahmegrenzen | later_sd | open | SD legt den gemeinsamen Lifecycle-Owner, Snapshot-Bindung, Journal, Wiederaufnahme und Rollback fest. | AGDF |
| Technische Abdeckung der Recovery-Fälle und Fault-Injection | later_tp | open | TP ordnet jedes Akzeptanzkriterium konkreten Aufgaben, Szenarien und erwarteten Ergebnissen zu. | AGDF |

## 11. Next Step

PRD-Entscheidungen und Kriterienkette mit Gate-Check validieren. Erst wenn die Approval Decisions readiness-konform sind, die PRD-Fassung präsentieren und nur mit `Approval: PRD` freigeben.
