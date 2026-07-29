# Brownfield Review: AGDF Proportionality Benchmark

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-proportionality-benchmark`
- related_ur: `.agdf/control/artefacts/agdf-proportionality-benchmark/UR.md`
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-07-28

## Objective

Die genehmigte 40-Fall-Baseline gegen vorhandene Mode-, Gate-, Scope- und Eval-Owner prüfen und
den kleinsten belastbaren Pfad für eine deterministische Ist-gegen-Soll-Messung bestimmen.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: Der Slice erzeugt ausschließlich maschinenlesbare Benchmark- und
  Testevidenz. Er verändert keine Nutzerinteraktion, Host-Oberfläche, Statusdarstellung oder
  Recovery-Semantik.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Current coverage | Reuse decision |
|---|---|---|---|
| Delivery-Path-Semantik | `plugin/meta/contracts/modes.md` | sechs menschliche Benchmark-Pfade sind ableitbar; `compact_delivery` bleibt der sichtbare Name für den gespeicherten Modus `quick_task` nach UR/Brownfield | `extend`, keine neue Mode-Autorität |
| Gate- und Slice-Legalität | `plugin/meta/contracts/gate-transition.md`; `create-agdf/lib/control-evaluation/gate-policy.js` | kanonische Gate-Transitions und Mode/Slice-Entscheidungen existieren | unverändert konsumieren |
| Scope-Klassifikation | `plugin/skills/gate-check/SKILL.md`; `create-agdf/lib/interaction-presentation.js` | fail-closed Trivial-/Quick-/gated-Grenzen und sichtbare Projektion existieren | Klassifikationsergebnis konsumieren, Presentation nicht als Policy verwenden |
| Skill-Evals | `evals/manifest.json`; `evals/cases/`; `evals/fixtures/catalog.json`; `evals/observations/deterministic-replay.json`; `create-agdf/lib/skill-evals/` | versioniertes deterministisches Replay, Fixtures, Schema-/Artefaktprüfung und Runner vorhanden | Runner-/Schema-Konventionen erweitern |
| Delivery Path Search | `create-agdf/lib/delivery-path-search/` | bewertet erlaubte nächste Schritte, ist advisory und kein Task-zu-Mode-Router | nicht als Klassifikator umdeuten |
| Baseline | Parent `PROPORTIONALITY_BENCHMARK_BASELINE.json` Version `1.0.0` | 40 Fälle, sechs Pfade, 19 adversariale Fälle, Sollpfad und Quelle; bewusst ohne Ist-Ergebnis | unverändert als versionierten Eingang verwenden |
| Test-/CLI-Integration | `create-agdf/package.json`; bestehende `test:*`-/`eval:*`-Skripte | deterministische lokale und CI-nahe Ausführung vorhanden | fokussierten Benchmark-Runner und Tests integrieren |

## Coverage Assessment

- current_coverage: `partially_done`
- fully_done: Baseline-Struktur, Sollpfade, Quellenauflösung, Redaction, Schwellenwerte und bestehende
  Eval-Grundstruktur.
- not_done: deterministische Fallrepräsentation für die aktuelle Routing-Auswertung,
  normalisierte Istpfade, Fehlerklassifikation, Aggregation, Schwellenentscheidung und Bericht.
- missing_existing_capability: Es existiert kein kanonischer deterministischer Klassifikator, der
  freien Tasktext direkt einem Delivery Path zuordnet. Historische Artefakte belegen frühere
  Entscheidungen, dürfen aber weder als aktuelle Ausführung noch als automatischer Router gelten.

## Reuse And Parallel-Structure Risk

| Finding | Risk | Required action |
|---|---|---|
| `compact_delivery` ist Präsentationssemantik des gespeicherten `quick_task` nach UR/Brownfield | falsch-positive Drift oder siebter Maschinenmodus | Normalisierung kontextabhängig aus bestehenden Mode-/Gate-Ownern ableiten |
| `trivial_change` ist eine ungated Boundary, kein gespeicherter Run-Modus | unzulässige Mode-Erweiterung | als Benchmark-Pfad abbilden, nicht als neuen Runtime-Modus persistieren |
| Freier Tasktext ist ohne strukturierte Merkmale oder ausführbare Fixture nicht deterministisch klassifizierbar | Modellurteil wird als Testevidenz ausgegeben | jeder Fall benötigt versionierte, maschinenlesbare Routing-Eingaben oder eine ausführbare Fixture |
| Historische `evidence_ref`-Artefakte enthalten frühere Entscheidungen | Sollwert wird als Istwert recycelt | Quellen nur für Herkunft/Begründung verwenden; Istpfad ausschließlich aus aktueller Ausführung erzeugen |
| Delivery Path Search ist advisory | zweite oder falsche Routing-Autorität | nicht zum Benchmark-Classifier umwidmen |
| Eval- und Report-Code könnten Schwellen separat definieren | Policy-Drift | Schwellen einmal aus der Baseline laden und in allen Ausgaben referenzieren |

## Impact

- files/modules: Parent-Baseline, `evals/`-Schema/Fixtures/Observations, fokussierter Runner unter
  `create-agdf/lib/`, CLI-/package-script-Anbindung und Regressionstests.
- interfaces: neues internes maschinenlesbares Benchmark-Ergebnis; keine Änderung bestehender
  Gate-, Approval-, Host- oder Public-API-Verträge.
- data_model: versionierte Erweiterung der Benchmark-Eingaben und Ergebnisse; keine Migration
  produktiver Persistenz.
- backwards_compatibility: bestehende Skill-Evals und Delivery-Path-Search-Ausgaben müssen
  unverändert bleiben.
- regression_tests: Baseline-Invarianten, sechs Pfade, Ambiguität, Unter-/Über-Governance,
  10-%-Grenze, Owner-Normalisierung, Redaction und bestehende Eval-Suite.
- side_effects: keine automatischen Reparaturen, keine Host-Ausführung, keine VCS- oder
  Release-Aktion.

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: Der Scope ist auf einen deterministischen Benchmark und bestehende Eval-Owner
  begrenzt, benötigt aber neue messbare Ergebnissemantik, mehrere zusammenhängende Code-/Datenowner
  und eine explizite Grenze gegen parallele Routing-Autorität. Quick/Compact oder Verified Change
  wären dafür zu schmal; ein voller Structured-Delivery-Scope wäre unverhältnismäßig.
- evidence: genehmigte Child-UR; Parent-Baseline 1.0.0; bestehende Mode-/Gate-/Scope-Contracts;
  `evals/` und `create-agdf/lib/skill-evals/`; fehlender deterministischer Tasktext-Klassifikator.
- transparency_note: PRD, SD und TP bleiben erforderlich, dürfen aber jeweils auf diesen Benchmark-
  Slice begrenzt werden. Keine neue UI-/UX-Intent-Analyse ist erforderlich.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `resolved_for_review`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Der Benchmark misst bestehende Pfade und verlinkt bestehende
  Autoritätsgrenzen; er schafft keinen neuen dauerhaften Architektur- oder Policy-Owner.

## Next Permissible Step

- next_allowed_action: kleines PRD für Eingabe-, Auswertungs-, Schwellen- und Evidenzsemantik
  entwerfen und `Approval: PRD` anfordern.
- forbidden_until_then: SD, TP, Implementierung, automatische Routing-Reparaturen, QA, VCS und
  Release.

## Quality Outlook

- quality_outlook: Der Slice ist nur dann belastbar, wenn Istpfade aus einer aktuellen,
  reproduzierbaren Ausführung stammen, Ambiguität fail-closed bleibt und keine zweite
  Routing-Autorität entsteht.
