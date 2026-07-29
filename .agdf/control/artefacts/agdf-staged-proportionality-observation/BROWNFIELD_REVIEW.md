# Brownfield Review: Stufengerechte Proportionalitätsbeobachtung

Status: `done`
Type: Brownfield Review
Mode: `post_ur_review`
Decision: `pass`
Mode/Slice Decision: `structured_slice`
Required next gate: `PRD`
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Based on: genehmigte UR Revision 1

## Scope

Den vorhandenen Proportionalitäts-Benchmark so versioniert erweitern, dass er die aktuell zulässige
nächste Lifecycle-Stufe und den späteren Delivery Path getrennt beobachtet und gradet. Die
historische v2-Serie, ihr Report und die blockierende QA-Entscheidung bleiben unverändert.

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Die Änderung betrifft die sichtbare Entwickler-CLI-/Report-Semantik des
  Benchmarks, aber keine öffentliche AGDF-Nutzerjourney, Aktivierung, Recovery oder
  Gate-Interaktion.
- ux_intent_definition_required: `no`

Die genehmigte UR beschreibt Nutzerziel, beide Beobachtungsfragen, Blindheitsgrenze, sichtbare
Ergebnisarten und Recovery durch Fail-Closed-Ambiguität bereits eindeutig. Eine separate UX Intent
Definition würde keine offene Produktentscheidung schließen.

## Mode/Slice Decision

- decision: `structured_slice`
- scope_reason: Der Gap ist auf einen bestehenden Eval-Workstream begrenzt, ändert aber gemeinsam
  Corpus-/Fixture-Vertrag, strukturierte Agent-Ausgabe, Recorder-Provenienz, Offline-Grading,
  Reportsemantik und Regressionstests. Damit ist er größer als Quick Task oder Verified Change,
  ohne neue AGDF-Runtime-, Gate-, Policy-, Persistenz- oder Cross-Host-Produktarchitektur zu
  erfordern.
- evidence:
  - `create-agdf/lib/proportionality-benchmark/`;
  - `create-agdf/scripts/record-proportionality-benchmark.js`;
  - `create-agdf/scripts/run-proportionality-benchmark.js`;
  - `create-agdf/scripts/proportionality-benchmark-test.js`;
  - `evals/proportionality/`;
  - Vorgänger-`PROPORTIONALITY_BENCHMARK_REPORT.json`;
  - Parent-`PROPORTIONALITY_AMBIGUITY_ASSESSMENT.md`.
- required_next_gate: `PRD`

## Bestehende Owner und Abdeckung

| Bereich | Kanonischer Owner | Bestehende Abdeckung | Bewertung |
|---|---|---|---|
| Delivery-Path-Vokabular und Agent-Ausgabe | `create-agdf/lib/proportionality-benchmark/contracts.js` | sechs Pfade, strukturiertes Schema, Redaction, Compact-Delivery-Fail-Closed | `partially_done` |
| Blind-Prompt | `create-agdf/lib/proportionality-benchmark/blind-prompt.js` | ergebnisfreier One-Shot-Prompt mit kanonischen Routingquellen | `partially_done` |
| Corpus und Fixture-Auflösung | `corpus-loader.js`; `evals/proportionality/cases.json`; `fixtures/catalog.json`; `manifest.json` | 40 Fälle, neutrales Fixture, sechs explizite Compact-Kontexte | `partially_done` |
| Live-Aufzeichnung | `live-recorder.js`; `record-proportionality-benchmark.js` | Disposable Workspace, read-only Agent-Seam, Mutationsschutz, Serienprovenienz | `fully_done_reuse` |
| Offline-Grading | `evaluator.js` | Pfadrang, Over-/Under-/Ambiguous-Klassen, Thresholds, Freshness | `partially_done` |
| Bericht | `report.js`; `run-proportionality-benchmark.js` | kanonisches JSON-Objekt und Markdown-Projektion | `partially_done` |
| Source Fingerprint | `source-fingerprint.js` | Behavior- und Implementation-Owner plus Fixture-/Falldaten | `fully_done_reuse` |
| Tests | `proportionality-benchmark-test.js`; Package-Smoke | Schema, Blindheit, Redaction, Mutation, Provenienz, Thresholds, Report | `partially_done` |
| Gemeinsame Agent-Ausführung | `create-agdf/lib/live-agent/read-only-structured.js` | explizites Modell, Timeout, Structured Output, read-only Toolgrenze | `fully_done_reuse` |
| Historische Evidenz | v2-Observationen, Vorgänger-Report und QA | 120/120 gültige Observationen, 27 ambiguous, QA block | `fully_done_preserve` |

## Reuse Strategy

- `extend`: bestehendes Proportionalitätsmodul und seine Scripts versioniert erweitern.
- `extend`: dasselbe Corpus-/Fixture- und Source-Fingerprint-Modell um explizite Lifecycle-Stufen
  ergänzen.
- `extend`: denselben Recorder und gemeinsamen read-only Agent-Executor verwenden.
- `refactor`: das bisher eindimensionale Observation-/Gradingmodell in zwei ausdrücklich getrennte
  Bewertungsachsen zerlegen.
- `preserve`: historische Baseline 1.0.0, v2-Serie, Report und QA-Entscheidung unverändert halten.
- `new`: nur neue versionierte Fixture-/Baseline-/Observation-Daten und run-eigene Artefakte, soweit
  die genehmigte Semantik sie erfordert.

Keine zweite Benchmark-Pipeline, kein zweiter Agent-Executor und kein freier Tasktext-Router sind
gerechtfertigt.

## Change Impact

### Voraussichtlich betroffen

- `create-agdf/lib/proportionality-benchmark/contracts.js`
- `create-agdf/lib/proportionality-benchmark/blind-prompt.js`
- `create-agdf/lib/proportionality-benchmark/corpus-loader.js`
- `create-agdf/lib/proportionality-benchmark/live-recorder.js`
- `create-agdf/lib/proportionality-benchmark/evaluator.js`
- `create-agdf/lib/proportionality-benchmark/report.js`
- `create-agdf/lib/proportionality-benchmark/source-fingerprint.js`
- die drei vorhandenen Proportionalitäts-Scripts;
- `evals/proportionality/manifest.json`, Cases und Fixtures;
- eine neue versionierte Baseline und neue Observation-Serie;
- fokussierte Proportionalitäts- und Package-Smoke-Tests.

### Explizit nicht betroffen

- `plugin/meta/contracts/modes.md`;
- `plugin/meta/contracts/gate-transition.md`;
- Approval-, Brownfield-, Interaction- oder Runtime-Semantik;
- öffentliche Pages-, Installations- oder Host-Adapter-Journey;
- Vorgänger-Run, v2-Serie, Vorgänger-Report und Vorgänger-QA.

### Kompatibilität und Migration

- Persistierte v1-Observationen und der v1-Report bleiben historische, read-only Evidenz.
- Neue Felder benötigen eine neue Schema-/Corpus-/Baseline-/Adapter-/Runner-Version oder eine
  gleichwertige explizite Versionsgrenze.
- Der bestehende CLI-Aufruf darf nicht still dieselbe Serien-ID mit neuer Semantik verwenden.
- Ein Integritätsbeleg muss mindestens die aktuellen SHA-256-Werte der historischen Kernartefakte
  schützen:
  - Vorgänger-Report JSON:
    `c2f5bd65846e9c1aec34230df78c04297ed397c668c206ade98bac62caeeb1f6`;
  - Vorgänger-QA:
    `053ba438bf7f450c2226fcfe1a33653f7df12b5062bf588920d607a3930cf682`;
  - v2-`attempts.json`:
    `026fdd91992a9b4157985547cda94c99a80c80f6cccb7684e40adad3d2284be0`.

## Offene PRD-/SD-Fragen

1. Welches endliche Vokabular gilt für `next_permissible_stage`, und wie wird es ausschließlich aus
   bestehenden Gate-/Mode-Ownern abgeleitet?
2. Wird jeder gated Fall als explizite Stufensequenz modelliert oder werden getrennte, verknüpfte
   Observationen pro Fall geführt?
3. Welche redigierten Tatsachen sind für die spätere Brownfield-Pfadentscheidung notwendig, ohne
   Sollpfad oder Sollbegründung zu leaken?
4. Wie bleibt synthetischer Fixture-State klar von realer Approval-Autorität getrennt?
5. Wie werden Baseline 1.0.0 und das alte Observation-Schema weiterhin lesbar, ohne eine zweite
   aktive Pipeline zu schaffen?
6. Wird `PB-008` geteilt oder eindeutig umformuliert, und bleibt die Gesamtfallzahl exakt 40?
7. Welche Ambiguitätsklassen blockieren QA, und welche kennzeichnen einen bewusst nicht
   evaluierbaren Lifecycle-Zustand?

Diese Fragen sind klein genug für ein fokussiertes PRD und SD, aber zu semantisch für eine direkte
Implementierung.

## Risiken

- **Label Leakage:** Stufenfakten kodieren den erwarteten Endpfad indirekt.
- **Autoritätsverwechslung:** Synthetischer Fixture-State wird als echte Freigabe verstanden.
- **Parallelstruktur:** Ein neuer staged Runner dupliziert Recorder, Grader oder Report.
- **Versionsdrift:** Neue Schemas machen historische Serien unlesbar oder scheinbar stale.
- **Metrikvermischung:** Aktuelle Gate-Legalität und spätere Pfadproportionalität werden erneut in
  einer Kennzahl zusammengeführt.
- **Scope Drift:** Ein Messprotokoll-Fix wird ohne Evidenz zur Änderung kanonischer Routingsemantik.

## Test Impact

Erforderlich sind mindestens:

- Schema- und negative Unknown-Field-Tests für beide Ergebnisachsen;
- Leakage-Tests gegen Pfad, Begründung, Gradingklasse und Synonyme;
- Lifecycle-/Fixture-Konsistenztests je gated und ungated Fall;
- PB-008-Intenttest;
- alte-v1-/neue-v2-Kompatibilitäts- und Integritätstests;
- Mutations-, Redaction-, Provenienz-, Freshness- und Duplicate-Schutz;
- getrennte Over-/Under-/Ambiguity-Thresholdtests;
- deterministischer JSON-/Markdown-Replay;
- fokussierter Proportionalitätstest und vollständiger Package-Smoke.

## Parallel-Structure Check

Status: `pass`

Der bestehende Modul-, Script-, Fixture- und Testpfad kann erweitert werden. Ein zweiter
`staged-proportionality`-Runner oder eine zweite Delivery-Path-Autorität ist weder erforderlich noch
zulässig.

## SoT-/Runtime-/Produktsemantik

Status: `pass_with_guardrail`

Die kanonischen Mode-/Gate-Owner bleiben reine Behavior Sources. Das neue Protokoll darf ihre
Semantik beobachten und versioniert fingerprinten, aber nicht in Fixtures oder Grading neu
definieren. Entsteht bei der Detailausarbeitung doch Bedarf an neuer Routingsemantik, stoppt dieser
Run und routet den Gap upstream.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: `resolved_for_prd`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Der Slice erweitert eine Messpipeline und verlinkt bestehende
  Delivery-Path-/Ceremony-Autorität; er erzeugt keinen neuen Policy- oder Architektur-Owner.

## Ergebnis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact:
  `.agdf/control/artefacts/agdf-staged-proportionality-observation/BROWNFIELD_REVIEW.md`
- transparency: Ein fokussiertes PRD, SD und TP sind erforderlich, weil mehrere gekoppelte
  Daten-/Codeowner und neue messbare Ergebnissemantik betroffen sind. `structured_delivery` ist
  nicht gerechtfertigt, weil Runtime-, Gate-, Policy-, Persistenz-, Release- und öffentliche
  Cross-Host-Wirkung ausgeschlossen bleiben.
- missing_evidence: genehmigtes PRD, SD und TP; Pre-Implementation Brownfield Analysis; neue
  Live-Serie und QA.
- current_coverage: Kernpipeline vollständig vorhanden, Stufentrennung noch nicht vorhanden.
- reuse_strategy: bestehende Pipeline versioniert erweitern; historische Evidenz unverändert
  bewahren.
- risks: Leakage, Autoritätsverwechslung, Parallelstruktur, Versions- und Metrikdrift.
- context_graph_impact: `link_only`
- required_next_step: fokussiertes PRD auf Basis von SPO-1 bis SPO-8 und den sieben offenen
  Produktfragen erstellen.

