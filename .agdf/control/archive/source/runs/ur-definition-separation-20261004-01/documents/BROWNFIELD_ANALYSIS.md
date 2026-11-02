# Brownfield Analysis: UR-Erstellung

Mode: pre_implementation_analysis
Decision: pass
Date: 2026-10-04
Run: ur-definition-separation-20261004-01
Based on: genehmigte PRD, SD und TP dieses Runs
Reviewer: Codex, kooperative Quellprüfung

## Approved Tasks And Existing Owners

T-000 ist abgeschlossen: der aktuelle Quellstand entspricht dem im SD beschriebenen Intake, gemeinsamen Dispatcher, Katalog und den kanonischen Run-Operationen. T-001 bis T-007 können im genehmigten Umfang umgesetzt werden. evidence/BASELINE.json bindet Commit und Arbeitsstand; die zwei fremden staged Kompatibilitätskopien bleiben geschützt.

## Reuse Path

- Der bisherige ur_missing-Intake liefert write_ur, record_ur und dispatch_again. Die fachliche Tätigkeit wird an ur-definition übergeben; run_missing und delivery-run-assignment bleiben maßgeblich.
- service.js und contract.js besitzen Dispatch und Eingabeprüfung; dort die gebundene UR-Fortsetzung und revise-Option einordnen. CLI-Parser, Schema-2-Bindung und MCP übernehmen den gemeinsamen Vertrag.
- run-step ur registriert erstmalig. Eine Änderung einer bereits sealgebundenen Draft-UR benötigt run-update; dieselbe run-step-Operation kann den geänderten Seal nicht neu erfassen. Vorhandene Schreiber bleiben unverändert.
- Die Gate-Evaluation besitzt Bereitschaft und Präsentation. Eine fokussierte lesende Klärungsprüfung kann dort offene neue URs zurückhalten; alte URs bleiben kompatibel.
- Kanonischer Katalog, Hostnamensprojektion und bestehende Generatoren bleiben die einzigen Quellen. Die feste Zehn-Skills-Annahme muss katalogbasiert ersetzt werden; tatsächliche Budgets bleiben geprüft.

## Risk And Test Impact

- UR-spezifische Routen vor generischem Judgement und alter Präsentation prüfen, ohne andere Skills umzuleiten. Ungebundene Direktaufrufe dürfen keinen Umgebungs-Run auswählen.
- Fehlende/falsche Bindung, stale revision, freigegebene UR, spätere Gates und Seal-Fehler bleiben fail-closed. Fremdartefakte und Freigaben müssen unverändert bleiben.
- Neue Vorlage mit Klärungsfeld, vollständigem Bedarf und Nutzern; offene oder unvollständige neue UR verhindert Präsentation. Kein Zustandsfeld ersetzt semantischen Review oder Zustimmung.
- MCP und CLI erhalten dieselbe optionale Eingabe; Schema, normalisierter Input und deklarierte Binding-Argumente zusammen prüfen.
- Gemeinsame Generated-Verzeichnisse nicht parallel beschreiben. Exakte Payload-/Anweisungsdeltas, aktuelle Katalog-/Paketfingerprints und unveränderte Evaluationsanforderungen nachweisen.

## Scope And Next Step

Keine neue Persistenz, Freigabeautorität, Run-Migration oder spätere Erstellungskompetenz. Keine automatische Installation, Veröffentlichung oder VCS-Aktion. Context Graph: vorhandene Dispatch-Autorität referenzieren; neue Eigentümer nach Umsetzung vor Closeout kuratieren. Nächster Schritt: T-001, danach abhängige genehmigte Aufgaben und Tests.
