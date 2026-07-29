# RMP-07 Assessment: Proportionalität und Zeremonie

Status: completed
Date: 2026-07-28
Task: `RMP-07`
Decision: `child_scope_ready_for_ur`

## Bewertungsfrage

Rechtfertigen die akzeptierten Conformance-Befunde bereits einen eigenständigen
Proportionalitäts-/Zeremonie-Child mit Produkt- oder Eval-Implementierung?

## Entscheidung

Nein. Die akzeptierte Host-Matrix liefert keine direkte Über- oder Unter-Governance-Evidenz:

- 16 `pass` belegen versionsgebundenes Headless-Verhalten;
- 8 `limitation` sind native-UI-, echte-Mehrturn- oder Restart-Beobachtungsgrenzen;
- 12 `host_unavailable` stammen aus fehlender Claude-Code-Authentifizierung;
- 0 `product_gap` und 0 `invalid_evidence` bleiben.

Eine Modus- oder Host-Verfügbarkeitsgrenze wird nicht in einen Zeremonie- oder Produkt-Gap
umgedeutet. Damit fehlt die in RMP-07 geforderte Gap-to-scope-Traceability für einen
Implementierungs-Child.

## Vorhandene proportionale Signale

| Evidenz | Aussage | Grenze |
|---|---|---|
| BL-10 `agdf-micro-tier-below-quick-task` | Triviale nicht-normative Änderungen besitzen einen reduzierten, fail-closed Pfad. | Misst keine reale Verteilung oder Über-Governance-Rate. |
| `agdf-self-maintenance-overhead-reduction` | Brownfield Review vermied zwei redundante Mechanismen; Narrow Code-Fix Criterion wurde an zwei echten Fixes kalibriert. | Zwei Beispiele sind kein repräsentatives Benchmark-Korpus. |
| BL-11 Live Host Conformance | Ziel-, Approval- und Scope-Grenzen funktionieren in 16 direkten Headless-Beobachtungen. | Fälle messen weder Interaktionsaufwand noch erwarteten gegen tatsächlichen Delivery Path. |

## Nicht prüfbare PMR-4-Schwellen

| Kriterium | Aktueller Zustand |
|---|---|
| mindestens 40 Real-Task-Fälle über sechs Delivery Paths | fehlt |
| mindestens 25 % adversariale Grenzfälle | nicht berechenbar |
| Unter-Governance bei kritischen Fällen = 0 | nicht berechenbar |
| Über-Governance bei trivialen/ungated Quick Tasks ≤ 10 % | nicht berechenbar |
| Begründung plus bestehender Challenge-/Why-Pfad je Fall | noch nicht als Benchmark-Datensatz vorhanden |

## Delivery Path Search

- status: `no_safe_recommendation`
- current_gate: `CD+Tests`
- enforcement: `tool_enforced`
- machine_validation: `owned_version_matched`, AGDF `0.11.4`
- evaluations: 0
- cost_units: 0
- stopping_reason: `candidate_queue_exhausted`

Der Search autorisiert keinen Scope. Das Ergebnis bestätigt lediglich, dass aus dem aktuellen
Control State kein validierter Delivery-Kandidat ableitbar ist.

## Verworfene Alternativen

1. **Sofort einen Implementierungs-Child eröffnen:** verworfen, weil Benchmark- und
   Gap-to-scope-Evidenz fehlen.
2. **HC-05 bis HC-08 als Zeremonie-Gaps behandeln:** verworfen, weil dies Beobachtungsmodus mit
   Produktverhalten verwechselt.
3. **Claude `host_unavailable` als Unter-Governance behandeln:** verworfen, weil fehlende
   Authentifizierung keine Routing- oder Gate-Fehlklassifikation belegt.
4. **Schwellenwerte reduzieren oder Benchmark überspringen:** verworfen, weil dies die genehmigte
   PRD-/SD-Schutzwirkung abschwächen würde.

## Kleinster zulässiger nächster Evidenzschritt

Im Parent-Scope eine versionierte `PROPORTIONALITY_BENCHMARK_BASELINE.json` erstellen:

- exakt 40 redigierte reale AGDF-Aufgaben aus bestehenden kanonischen Runs;
- Abdeckung von Trivial Change, Quick Task, Compact Delivery, Verified Change,
  Structured Slice und Structured Delivery;
- mindestens 10 adversariale Grenzfälle;
- erwarteter Delivery Path, kurze Begründung, kanonische Evidenzreferenz;
- noch keine tatsächliche Klassifikation, Produktänderung oder Schwellenoptimierung.

Erst nach Validierung dieser Baseline darf RMP-07 entscheiden, ob ein eigener Benchmark-Child
mit UR gerechtfertigt ist. Parent-Approvals werden nicht vererbt.

## Next Action

Die anfängliche Entscheidung `no_child_scope_yet` galt bis zur geforderten Eingangsevidenz. Die
anschließend kuratierte und validierte `PROPORTIONALITY_BENCHMARK_BASELINE.json` Version `1.0.0`
enthält 40 reale Fälle, alle sechs Pfade, 19 adversariale Fälle und 40 auflösbare Quellen.

Damit ist `PROPORTIONALITY_BENCHMARK_SCOPE.md` als Child-Scope-Entwurf gerechtfertigt. Nächster
Schritt ist eine eigenständige Child-UR; noch keine Implementierung.
