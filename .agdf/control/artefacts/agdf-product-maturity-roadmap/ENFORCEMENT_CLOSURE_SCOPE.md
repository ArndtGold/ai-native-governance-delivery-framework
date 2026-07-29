# Enforcement Closure Scope: QA-Block Transition Integrity

Status: `ready_for_child_ur`
Date: 2026-07-29
Parent task: `RMP-08`
Proposed child run: `agdf-qa-block-transition-integrity`
Source finding: `SPF-06`

## Gap-to-Scope

| Feld | Wert |
|---|---|
| Garantie | Ein dauerhafter QA-Bericht mit `decision: block` darf keine QA-Freigabe anfordern oder als freigabebereit erscheinen. |
| Surface | gemeinsamer lokaler Gate-Checker und alle daraus gerenderten Host-Statusoberflächen |
| Istklasse | deterministische Enforcement verhindert UAT ohne QA-`pass`, aber die Interaktionsprojektion fordert fälschlich `Approval: QA` an |
| Zielklasse | fail-closed Transition und Presentation: kein QA-Approval-Pfad bei `block`; genau eine zulässige Remediation-/Upstream-Aktion |
| Kanonischer Owner | `create-agdf/lib/control-evaluation/gate-policy.js`; abgeleitete Runtime-/Packageflächen nur über bestehenden Sync |
| Negativer Test | QA-`block` darf weder `missing_approval: Approval: QA` noch `request exact QA approval` noch eine Approval Presentation erzeugen |

## Scope-Grenze

Enthalten:

- bestehende QA-Entscheidungszustände `pass | revise | block` korrekt projizieren;
- `block` und `revise` fail-closed halten;
- fehlenden Bericht und noch nicht ausgeführtes QA weiterhin als offenen QA-Schritt behandeln;
- irrtümlich gespeicherte QA-Freigabe bei nicht-pass Bericht darf UAT nicht öffnen;
- direkte Unit-/Regressionstests, vollständiger Package-Smoke und Runtime Integrity;
- generierte Runtimeflächen nur über vorhandene Propagation.

Nicht enthalten:

- neue QA-Entscheidungswerte;
- Änderung der Approval-Formel;
- Änderung von `qa-gate` als alleiniger QA-Entscheidungsowner;
- Structured-Slice-/Delivery-Semantik;
- Benchmark-Baseline, Prompt, Fixture oder Live-Serie;
- VCS, Release oder Reinstall.

## Produktentscheidung

Der Befund ist ein enger Implementierungsfehler gegen bereits genehmigte Semantik. Eine
vollständige neue Produktdefinition ist nicht nötig; Brownfield Review soll nach eigener Child-UR
prüfen, ob Bug Lightweight Track oder `verified_change` die kleinste sichere Umsetzung ist.

## Gate-Grenze

Dieser Scope autorisiert keine Implementierung. Der Child benötigt eine eigene dauerhafte UR und
ein separates exaktes `Approval: UR`.

