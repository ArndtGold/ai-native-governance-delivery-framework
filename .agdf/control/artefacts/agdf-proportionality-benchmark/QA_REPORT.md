# QA Report: AGDF Proportionality Benchmark

Status: `block`
Gate: QA
Gate approval: `not_requestable_while_blocked`
Date: 2026-07-28
Decision owner: `qa-gate`

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | pass | Task Plan Review: 18/18 `fully_done` |
| Solution integrity | pass | Clean Implementation Review: gemeinsame sichere Agent-Seam, keine zweite Routing-Autorität |
| Code quality | pass | Code Review: keine offenen Implementierungsfindings; vollständiger Smoke und Runtime Integrity grün |
| QA decision | block | frischer Live-Benchmark enthält 27/40 mehrdeutige Fälle; TP-Stop-Bedingung greift |

`qa-gate` ist alleiniger Entscheidungsowner. Die Implementierung und Evidenz sind vollständig, aber
der gemessene Produktzustand erfüllt die genehmigte Ambiguitätsgrenze nicht. Der nächste zulässige
Schritt ist eine separate Produktentscheidung über den Ambiguitätsbefund; UAT und Release bleiben
gesperrt.

## QA Gate

- decision: `block`
- evidence:
  - genehmigte UR, PRD Revision 2, SD Revision 2 und TP Revision 2;
  - Brownfield Analysis `pass`;
  - `CD_TESTS.md`;
  - Task Plan Review 18/18;
  - Clean Implementation Review `pass`;
  - Code Review `pass`;
  - vollständiger Smoke einschließlich `test:proportionality`;
  - frische Serie `codex-gpt-5.6-sol-agdf-0.11.4-20260728-v2`,
    120/120 Observationen aus 120 Versuchen;
  - deterministisch identischer JSON-Replay;
  - Benchmark: 13 korrekt, 27 ambiguous, 0 Critical Under, 0/8 Small Over.
- missing_evidence: kein technischer Evidenzgap; es fehlt eine akzeptierte separate
  Produktentscheidung, wie mit der beobachteten Ambiguität der aktuellen Agent-Routinglogik
  umzugehen ist.
- risks: Eine QA-Freigabe würde 27 mehrdeutige Pfadentscheidungen verschweigen und die ausdrückliche
  TP-Stop-Bedingung verletzen. Eine Prompt-/Corpus-Optimierung oder erneute Serie im selben Run würde
  das Messergebnis kontaminieren.
- required_next_step: Den 27-Fall-Ambiguitätsbefund im Parent-Roadmap-Kontext bewerten und bei
  gewünschter Remediation einen separaten, neu genehmigten Produkt-Scope eröffnen.
- impact_codes: none

## Benchmark Blocking Evidence

- ambiguous IDs: `PB-008`, `PB-015` bis `PB-040`;
- critical under-governance IDs: keine;
- Small-Segment Over-Governance: `0/8 = 0 %`;
- Freshness: `fresh`;
- Evidenzgrenze: `live routing observations with deterministic offline grading`.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Der Benchmark verlinkt bestehende Autoritäten und zeigt eine
  Ambiguitätsgrenze; er erzeugt keinen neuen Routing- oder Policy-Owner.

## Next Step

Kein `Approval: QA` anfordern. Zuerst den blockierenden Produktbefund separat entscheiden; dieser
Mess-Run repariert oder wiederholt gültige Ergebnisse nicht.
