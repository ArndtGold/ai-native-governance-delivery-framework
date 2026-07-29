# UR: AGDF Proportionality Benchmark

Status: approved
Gate: UR
Gate approval: exaktes `Approval: UR` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 1 und dauerhaftem Artefakt
Date: 2026-07-28
Owner: user / agent
Based on: genehmigte Roadmap RMP-07, `PROPORTIONALITY_BENCHMARK_SCOPE.md` und Baseline `1.0.0`

## 1. Problem

AGDF besitzt proportionale Delivery Paths und einzelne reale Worked Examples, aber noch keinen
deterministischen Benchmark, der erwarteten und tatsächlich gewählten Delivery Path über ein
repräsentatives Real-Task-Korpus vergleicht. Deshalb sind Über- und Unter-Governance derzeit nicht
quantitativ gegen die genehmigten PMR-4-Schwellen prüfbar.

Die akzeptierte Live Host Conformance Matrix löst dieses Problem nicht: Ihre acht Limitierungen sind
Beobachtungsmodusgrenzen und ihre zwölf Claude-Zeilen Verfügbarkeitsgrenzen, keine
Proportionalitätsfehler.

## 2. Nutzerbedarf

Maintainer benötigen einen reproduzierbaren Nachweis, dass AGDF:

- kritische, normative oder risikoreiche Aufgaben niemals zu leicht einstuft;
- triviale und ungated Quick Tasks nicht unnötig in formale Delivery-Pfade zwingt;
- mehrdeutige Fälle fail-closed sichtbar hält;
- jede Einstufung über den bestehenden Challenge-/Why-Pfad knapp begründet;
- für Verbesserungen keine Gate-, Approval-, Brownfield-, Evidenz- oder QA-Pflicht abschwächt.

## 3. Genehmigter Ausgangsdatensatz

Die Parent-Baseline `PROPORTIONALITY_BENCHMARK_BASELINE.json` Version `1.0.0` enthält:

- exakt 40 redigierte reale AGDF-Aufgaben;
- alle sechs Delivery Paths;
- 19 adversariale Grenzfälle;
- 40/40 auflösbare kanonische Quellen;
- erwarteten Pfad und kurze Begründung je Fall;
- noch keine tatsächliche Routing-Auswertung.

## 4. Scope

Der Child-Run soll die bestehende Eval-Infrastruktur so erweitern, dass:

1. die 40 Baseline-Fälle deterministisch mit der aktuellen AGDF-Routinglogik ausgewertet werden;
2. `expected_delivery_path` und `actual_delivery_path` getrennt bleiben;
3. jedes Ergebnis `correct`, `over_governance`, `under_governance` oder `ambiguous` erhält;
4. `ambiguous` fail-closed behandelt wird;
5. kritische Unter-Governance `0` betragen muss;
6. Über-Governance bei trivialen und ungated Quick Tasks höchstens `10 %` beträgt;
7. mindestens 10 adversariale Fälle erhalten bleiben;
8. bestehende Mode-, Gate-, Scope-, Challenge-/Why- und Eval-Owner wiederverwendet werden.

## 5. Akzeptanzsignale

| ID | Erwartung |
|---|---|
| PBM-1 | Exakt 40 eindeutige Baseline-Fälle werden ohne stille Umdeutung geladen. |
| PBM-2 | Alle sechs Delivery Paths und mindestens 10 adversariale Fälle bleiben abgedeckt. |
| PBM-3 | Erwarteter und tatsächlicher Pfad sowie Fehlerklasse sind getrennt und maschinenlesbar. |
| PBM-4 | Kritische Unter-Governance ist `0`; jeder Treffer blockiert QA. |
| PBM-5 | Über-Governance im trivialen/ungated-Quick-Segment ist höchstens `10 %`. |
| PBM-6 | `ambiguous` bleibt fail-closed und wird nicht als Erfolg gezählt. |
| PBM-7 | Jede Einstufung besitzt kurze, Challenge-/Why-kompatible Begründung und Evidenzreferenz. |
| PBM-8 | Keine zweite Mode-, Gate-, Scope-, Approval- oder Interaction-Autorität entsteht. |

## 6. Nicht-Ziele

- keine automatische Reparatur gefundener Routing-Gaps im selben Run;
- keine Änderung genehmigter Schwellenwerte;
- keine Abschwächung von Gate-, Approval-, Brownfield-, Test-, Review- oder Evidenzpflichten;
- keine neue native Host-UI, kein Claude-Login und keine Provider-Konfiguration;
- keine Produkt-, Release- oder VCS-Aktion ohne spätere eigene Autorität.

## 7. Risiken

- historische Pfadwahl könnte fälschlich als erwarteter Sollpfad übernommen werden;
- manuell kuratierte Erwartungen könnten kanonischen Mode-/Gate-Ownern widersprechen;
- Optimierung auf weniger Interaktion könnte kritische Unter-Governance verdecken;
- ein neuer Benchmark könnte versehentlich eine parallele Routing-Autorität werden;
- Modellurteile könnten als deterministische Evidenz ausgegeben werden.

## 8. Gate-Grenze

Diese UR genehmigt nur Problem, Ziel, Scope, Akzeptanzsignale und Nicht-Ziele. Nach
`Approval: UR` folgen Brownfield Review und proportionale Mode/Slice-Entscheidung. Implementierung,
PRD, SD oder TP sind dadurch noch nicht freigegeben.

Exakter Freigabewert: `Approval: UR`
