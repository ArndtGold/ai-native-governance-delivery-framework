# Scope Draft: AGDF Proportionality Benchmark

Status: ready_for_child_ur
Date: 2026-07-28
Parent task: `RMP-07`
Proposed child run: `agdf-proportionality-benchmark`

## Ausgangslage

BL-11 belegt versionsgebundene Host-Conformance, misst aber weder erwarteten gegen tatsächlichen
Delivery Path noch Über- oder Unter-Governance. Die versionierte
`PROPORTIONALITY_BENCHMARK_BASELINE.json` schließt die zuvor offene Eingangsevidenz:

- 40 redigierte reale AGDF-Aufgaben;
- alle sechs genehmigten Delivery Paths;
- 19 adversariale Grenzfälle;
- je Fall ein erwarteter Pfad, eine kurze Begründung und eine auflösbare kanonische Quelle.

## Vorgeschlagenes Child-Ziel

Die bestehende Eval-Infrastruktur um einen deterministischen Proportionalitäts-Benchmark erweitern,
der die 40 Baseline-Fälle mit der aktuellen AGDF-Routinglogik klassifiziert und erwarteten gegen
tatsächlichen Delivery Path vergleicht.

## Messmodell

| Feld | Bedeutung |
|---|---|
| `expected_delivery_path` | durch Baseline und kanonische Mode-/Gate-Owner begründeter Sollpfad |
| `actual_delivery_path` | durch den ausführbaren Benchmark beobachteter aktueller Pfad |
| `classification` | `correct`, `over_governance`, `under_governance` oder `ambiguous` |
| `adversarial` | Grenzfallmarkierung aus der Baseline |
| `rationale` | kurze code-owned Why-/Challenge-kompatible Begründung |
| `evidence_ref` | kanonische redigierte Quelle |

`ambiguous` wird fail-closed behandelt und darf weder als korrekt noch als Interaktionsgewinn
gezählt werden.

## Schwellenwerte

- Fallzahl: exakt 40 in Baseline Version `1.0.0`;
- adversariale Fälle: mindestens 10, aktuell 19;
- Unter-Governance bei neuer Produktsemantik, Gate-, Sicherheits-, Persistenz- oder
  Architekturwirkung: `0`;
- Über-Governance bei eindeutig trivialen oder ungated Quick Tasks: höchstens `10 %`;
- keine abgeschwächte Gate-, Approval-, Brownfield-, Evidenz- oder QA-Anforderung.

## Vorgesehene Owner

- Mode- und Pfadsemantik: `plugin/meta/contracts/modes.md`;
- Gate-Legalität: `plugin/meta/contracts/gate-transition.md`;
- vorhandene Skill-Eval-Infrastruktur: `evals/` und ihre kanonischen Runner/Manifest-Owner;
- Begründungs-/Challenge-Pfad: bestehende Gate-Rationale- und Interaction-Owner;
- Child-Control-State: ausschließlich eigener Run unter `.agdf/control/`.

Der Benchmark darf keine zweite Mode-, Gate-, Scope- oder Approval-Autorität schaffen.

## Vorgesehene Evidenz

1. Schema-/Baseline-Prüfung für exakt 40 eindeutige Fälle und alle sechs Pfade.
2. Referenzprüfung für 40/40 kanonische Quellen.
3. Deterministische tatsächliche Klassifikation je Fall.
4. Getrennte Fehlerzahlen für `over_governance`, `under_governance`, `ambiguous`.
5. Negative Tests für kritische Unter-Governance.
6. Grenzwerttest für höchstens 10 % Über-Governance im kleinen Pfadsegment.
7. Regressionsprüfung, dass Gate-Legalität und Challenge-/Why-Pfad unverändert bleiben.
8. Redaction-, Scope-, Runtime-Integrity- und Diff-Prüfung.

## Stop-Bedingungen

- erwarteter Pfad widerspricht einem kanonischen Mode-/Gate-Owner;
- eine Baseline-Quelle ist nicht mehr auflösbar oder nicht redigierbar;
- tatsächliche Klassifikation erfordert Modellurteil ohne deterministische Prüfbarkeit;
- Benchmark-Optimierung würde Governance-Schutz oder Evidenzpflicht abschwächen;
- neue Produkt-, Runtime-, Gate- oder Interaction-Semantik wird nötig;
- Child-UR oder spätere Freigabe fehlt.

## Out of Scope

- Änderung von Delivery-Path-Schwellen oder Gate-Semantik im Parent;
- automatische Reparatur gefundener Über-/Unter-Governance;
- native Host-UI-, Mehrturn- oder Restart-Tests;
- Claude-Login oder Provider-Konfiguration;
- Commit, Push, PR, Release oder Veröffentlichung.

## Gate-Grenze

Dieser Scope-Entwurf autorisiert keine Implementierung. Ein eigener Child-Run beginnt mit einer
dauerhaften UR und benötigt ein separates exaktes `Approval: UR`; Parent-Freigaben werden nicht
vererbt.
