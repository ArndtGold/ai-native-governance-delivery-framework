# Produktbewertung: Staged-v2-r3-Befunde

Status: `assessed`
Date: 2026-07-29
Parent task: `RMP-07`, `RMP-08`, Vorbereitung `RMP-09`
Source run: `agdf-staged-proportionality-observation`
Source series: `codex-gpt-5.6-sol-agdf-0.11.4-staged-v2-20260729-r3`
Decision: `three_separate_follow_up_paths`

## Kurzentscheidung

Die r3-Serie ist technisch gültig, belegt aber nicht pauschal zwei Routingfehler, drei
Stage-Fehler und sechs falsche Delivery Paths. Die neun nicht korrekten Scenarios zerfallen in:

1. vier Benchmark-Semantik-/Evidenzgaps (`PB-008`, `PB-010`, `PB-011` sowie die
   Verified-Change-Gruppe `PB-016`/`PB-017`/`PB-020`);
2. einen kanonischen Produkt-Requirements-Gap für die Abgrenzung
   `structured_slice` versus `structured_delivery` (`PB-022`, `PB-028`, `PB-029`);
3. einen unabhängigen Transition-/Interaktionsdefekt: Gate-Checker 0.11.4 fordert bei dauerhaftem
   QA-`block` fälschlich `Approval: QA` an.

Der dritte Befund ist kein belegter Autoritätsbypass: Selbst nach einer irrtümlichen QA-Freigabe
verlangt `isGateSatisfied` weiterhin einen QA-Bericht mit Status `pass`; UAT bleibt geschlossen.
Fehlerhaft ist die vorgeschaltete Approval-Aufforderung und Statusprojektion.

## Befundmatrix

| finding_id | Evidenz | Bewertung | Produktwirkung | Routing |
|---|---|---|---|---|
| SPF-01 | `PB-008:intake`: 3× `blocked`, davon 2× `structured_delivery`, obwohl ausschließlich Zielklärung erlaubt ist | `protocol_state_action_ambiguity` | `blocked` vermischt wartenden Control State mit der weiterhin zulässigen Klärungsaktion; kein Beleg für falsche Mutation oder Gate-Umgehung | Benchmark-v3-Scope |
| SPF-02 | `PB-010:intake`: 1× `ungated_execution`, 2× `ur` | `baseline_contract_drift` | Die heutige Non-Normative Trivial Change Boundary kann eine reine Markdown-Klarstellung ungated erlauben; historische Quick-Task-Ausführung nach UR beweist keine aktuelle UR-Pflicht | Benchmark-v3-Scope nach kanonischer Entscheidung |
| SPF-03 | `PB-011:intake`: 3× `ungated_execution` statt `ur` | `baseline_semantic_mismatch` | Tasktext verlangt nur read-only visuelle Verifikation und Erläuterung; die Agentenentscheidung entspricht der aktuellen Quick-Task-Semantik | Benchmark-v3-Scope |
| SPF-04 | `PB-016`/`017`/`020`: je mindestens 2× `verified_change`, einzelne Eskalation zu `structured_slice` | `fixture_evidence_gap` | Evidence Packs enthalten keinen expliziten `structured_slice`-/`structured_delivery`-Eskalationstarget und keinen vollständigen Baseline-Record; beide sind kanonische Verified-Change-Voraussetzungen | Benchmark-v3-Scope |
| SPF-05 | `PB-022`/`028`/`029`: gemischt `structured_slice`/`structured_delivery` | `requirements_gap` | Modes Contract definiert Quick Task, Compact und Verified Change, aber keine entscheidbaren Kriterien zwischen den beiden strukturierten Tiefen | eigener Product-Semantics-Child |
| SPF-06 | Gate-Checker 0.11.4 bei QA-Artefaktstatus `block`: `missing_approval: Approval: QA` | `implementation_gap` | unzulässige Approval-Aufforderung und widersprüchliche Statuskarte; kein UAT-Fortschritt ohne QA-`pass` | eigener enger Bug-Child |

## Evidenzgrenzen

- r3 bleibt unverändert gültige Beobachtungsevidenz.
- Historische r2-/v2-Evidenz wird nicht überschrieben oder nachträglich neu gegradet.
- Die Bewertung ändert keine Baseline, kein Fixture, keinen Prompt und keine Routingsemantik.
- Modellvarianz allein beweist keinen Produktfehler, wenn Baseline oder kanonische
  Entscheidungsgrenze unvollständig ist.
- Der Gate-Checker-Befund wurde gegen `gate-policy.js`, `gate-transition.md`, `qa-gate` und die
  dauerhafte QA-Artefaktprüfung abgegrenzt.

## Folgepfade und Reihenfolge

### 1. QA-Block Transition Integrity

Vorgeschlagener Run: `agdf-qa-block-transition-integrity`

Kleinster Scope:

- `qaRevisionRequired` zu einer expliziten nicht-pass QA-Entscheidungsprojektion erweitern;
- bei QA-`block` kein `Approval: QA` und keine Approval-Aktion anbieten;
- QA-`revise` und QA-`block` mit getrenntem Grund, aber gleicher Fail-Closed-Grenze projizieren;
- Regressionstests für `pass`, `revise`, `block`, fehlenden QA-Bericht und irrtümlich vorhandene
  QA-Freigabe;
- Runtime Contract nicht neu erfinden, sondern die bestehende `qa-gate`-Semantik korrekt ausführen.

Dieser Scope ist unabhängig, technisch deterministisch und sicherheitsnah. Er soll zuerst starten.

### 2. Structured Delivery Depth Boundary

Vorgeschlagener Run: `agdf-structured-delivery-depth-boundary`

Kleinster Scope:

- kanonische, beobachtbare Kriterien für `structured_slice` und `structured_delivery`;
- Owner-, Impact-, Consumer-, Migration-, Architektur-, Policy- und Release-Signale;
- fail-closed Verhalten bei unvollständigen Facts;
- ein gemeinsamer Owner in `modes.md`, keine Benchmark-eigene zweite Policy;
- fokussierte Decision-Matrix und Runtime-Integrity-/Skill-Evals.

Dieser Scope führt Produktsemantik ein und benötigt die vollständige eigene Gate-Kette.

### 3. Staged Benchmark v3

Vorgeschlagener späterer Run: `agdf-staged-proportionality-baseline-v3`

Er darf erst nach der kanonischen Structured-Depth-Entscheidung starten und soll:

- `PB-008` Control State und zulässige Klärungsaktion getrennt messen;
- `PB-010` entweder eindeutig als reine Trivial-Change-Dokumentation oder als semantische
  Nutzeränderung formulieren;
- `PB-011` als read-only ungated ausweisen oder einen tatsächlichen Mutationstask verwenden;
- Verified-Change-Fixtures um alle fünf kanonischen Voraussetzungen ergänzen;
- die neue Structured-Depth-Matrix übernehmen;
- eine neue Baseline-/Corpus-/Fixture-/Adapterversion und eine neue blinde Live-Serie verwenden.

## Stop-Bedingungen

- kein Tuning der bestehenden r3-Serie;
- keine Baseline-Korrektur vor der kanonischen Structured-Depth-Entscheidung;
- keine gemeinsame Umsetzung von Gate-Policy-Fix und Delivery-Path-Produktsemantik;
- keine Behauptung eines Autoritätsbypass ohne nachgewiesenen UAT-Fortschritt;
- keine Child-Implementierung ohne eigene dauerhafte UR und exaktes `Approval: UR`.

## Reconciliation — 2026-08-19

- `agdf-qa-block-transition-integrity` is completed with OR `pass`; the QA-`block` projection gap is
  closed without a new gate or approval value.
- `agdf-structured-delivery-depth-boundary` is completed, QA-approved and UAT-accepted; all six
  Full-Depth trigger families have dedicated semantic coverage and Benchmark evidence was not
  mutated.
- The prerequisite for a separately gated `agdf-staged-proportionality-baseline-v3` is therefore
  satisfied. Its already-defined scope remains necessary because SPF-01 through SPF-04 are
  benchmark protocol, baseline and fixture gaps that neither completed child resolves.
- RMP-09 does not yet justify a separate Unified Journey child. The canonical Task Target,
  Interaction Ownership, Single Install and OpenCode parity runs still own unsettled QA/UAT or host
  evidence. Creating a Journey child now would pre-empt those owners and risk a parallel
  interaction pipeline.

## Next Action

Continue `agdf-staged-proportionality-baseline-v3` through its separately gated full-depth path: UR,
PRD and SD are approved, Brownfield/UX routing is complete and TP Revision 1 is ready for its own
exact approval. Keep RMP-09 at `no_safe_child_scope_yet` until its named dependencies settle and a
concrete residual Journey gap is evidenced.
