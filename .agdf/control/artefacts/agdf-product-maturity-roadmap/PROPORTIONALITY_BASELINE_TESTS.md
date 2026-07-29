# Test Evidence: Proportionality Benchmark Baseline

Status: pass
Date: 2026-07-28
Scope: RMP-07 Parent-Evidenz und Scope-Entwurf

## Ergebnisse

| Test | Ergebnis | Evidenz |
|---|---|---|
| JSON-Parsing und Pflichtstruktur | pass | Baseline Version `1.0.0`, Status `baseline_ready` |
| Fallzahl | pass | exakt 40 Fälle |
| Eindeutigkeit | pass | 40 eindeutige IDs und 40 eindeutige Task-Summaries |
| Pfadabdeckung | pass | Trivial 2, Quick 6, Compact 6, Verified 6, Structured Slice 10, Structured Delivery 10 |
| Adversariale Abdeckung | pass | 19/40 = 47,5 %, Mindestwert 10/40 |
| Quellenauflösung | pass | 40/40 relative kanonische Artefaktquellen vorhanden |
| Begründung | pass | 40/40 mit kurzer Pfadbegründung |
| Baseline-Grenze | pass | 0 `actual_delivery_path`- oder Ergebnisfelder; keine tatsächliche Auswertung vorweggenommen |
| Redaction | pass | keine Secret-/Token-/Cookie-/privaten Absolutpfad-Treffer |
| Schwellenparität | pass | Fallzahl 40, adversarial mindestens 10, Unter-Governance 0, Über-Governance höchstens 10 % |
| Scope-Legalität | pass | Child-Scope erweitert vorhandene Eval-Owner; keine zweite Mode-/Gate-/Approval-Autorität |
| Diff-Format | pass | `git diff --check` |

## RMP-T08

`pass`: `PROPORTIONALITY_BENCHMARK_SCOPE.md` bewahrt alle genehmigten 40-Fall-/25%-/0-/10%-
Kriterien, behandelt `ambiguous` fail-closed und stoppt vor eigener Child-UR oder Implementierung.

## Aussagegrenze

Die Baseline validiert Korpus und Scope. Sie misst noch keine tatsächliche Routing-Qualität und
belegt daher noch keine Über- oder Unter-Governance-Rate. Diese Auswertung gehört ausschließlich in
den später separat genehmigten Child-Run.
