# Brownfield Analysis: Stufengerechte Proportionalitätsbeobachtung

Status: `done`
Mode: `pre_implementation_analysis`
Decision: `pass`
Mode/Slice Decision: `structured_slice`
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Task: `SPT-T01`
Based on: genehmigter TP Revision 1

## Scope und Ausgangsbasis

Die genehmigte staged Erweiterung baut auf der vollständig umgesetzten, getesteten und reviewten,
aber noch uncommittierten Pipeline des Vorgänger-Runs `agdf-proportionality-benchmark` auf. Dessen
untracked/modified Dateien sind bewusste Ausgangsbasis dieses Childs und kein unbekannter fremder
Scope.

Andere aktive Runs und insbesondere Änderungen außerhalb der genehmigten Proportionalitätsowner
bleiben ausgeschlossen. Der vorhandene Dirty Worktree wird nicht bereinigt, zurückgesetzt oder
umgedeutet.

## Preflight-Ergebnis

| Dimension | Ergebnis | Evidenz |
|---|---|---|
| AGDF Validator | pass | version-matched `0.11.4`; Child-Doctor und Gate-Check ohne Findings |
| Codex Runtime | pass | `codex-cli 0.145.0` |
| explizites Modell | pass | read-only Structured-Output-Probe mit `gpt-5.6-sol`: `{"status":"ready","mutation_allowed":false}` |
| Authentifizierung | pass | dieselbe Probe wurde erfolgreich über den authentifizierten Codex-Executor ausgeführt |
| Package-Version | pass | `create-agdf` `0.11.4` |
| gemeinsame Agent-Seam | pass | `create-agdf/lib/live-agent/read-only-structured.js`; Sandbox `read-only`, ephemeral, Toolgrenze |
| Mutationsgrenze | pass | Disposable Workspace plus Vorher-/Nachher-Snapshot; nur explizite Persistenzpfade |
| Vorgänger-Serie | pass | 121 Dateien im v2-Serienverzeichnis; 120 Observationen plus Attempts |
| historische Kernhashes | pass | alle drei genehmigten SHA-256-Werte stimmen |
| Scope-Isolation | pass | Kandidatenpfade sind Proportionalitätsowner plus run-eigene Artefakte; fremde aktive Runs bleiben unverändert |

## Historische Kernhashes

- Vorgänger-Report JSON:
  `c2f5bd65846e9c1aec34230df78c04297ed397c668c206ade98bac62caeeb1f6`
- Vorgänger-QA:
  `053ba438bf7f450c2226fcfe1a33653f7df12b5062bf588920d607a3930cf682`
- v2-`attempts.json`:
  `026fdd91992a9b4157985547cda94c99a80c80f6cccb7684e40adad3d2284be0`

## Erlaubte Kandidatenpfade

- `create-agdf/lib/proportionality-benchmark/**`
- die drei vorhandenen Proportionalitäts-Scripts
- `create-agdf/package.json` ausschließlich für vorhandene Proportionalitäts-Kommandos
- neue staged Profil-/Scenario-/Fixture-/Provenienzdateien unter `evals/proportionality/`
- neue staged Observation-Serie unter `evals/proportionality/observations/`
- neue staged Baseline und run-eigene Control-/Review-/QA-Artefakte
- Child Run State, Master Backlog und Parent-Workstream-Verlinkung

Nicht erlaubt sind Änderungen an `plugin/meta/**`, Gate-/Mode-/Approval-/Interaction-Ownern,
fremden Runs, Vorgänger-Evidenz, VCS oder Release.

## Reuse Path

- bestehende Pipeline `extend/refactor`, nicht duplizieren;
- bestehender Agent-Executor, Recorder, Fingerprint, Evaluator und Reporter bleiben gemeinsame Owner;
- v1 bleibt als Legacy-Profil lesbar;
- v2 ergänzt Scenario-, Stage- und Path-Achsen;
- historische Serien erhalten eine read-only Provenienzgrenze statt aktueller Freshness-Neubewertung.

## Regression- und Migrationsrisiken

- v1-Schema oder vorhandene CLI-Aufrufe brechen;
- Source-Fingerprint-Änderung macht historische Evidenz scheinbar stale;
- Sollwerte gelangen in Blind-Fixtures;
- v2-Evaluierbarkeit akzeptiert widersprüchliche null/non-null-Kombinationen;
- staged CLI schreibt in bestehende Serien;
- Package-Smoke wird durch neue Profilpflicht unbeabsichtigt gebrochen.

Jedes Risiko ist im TP durch fokussierte Negative- und vollständige Smoke-Tests abgedeckt.

## Live-Konfiguration

- Surface: `codex`
- Modell: `gpt-5.6-sol`
- Runtime: `codex-cli 0.145.0`
- AGDF/Package: `0.11.4`
- Profil: `staged-v2`
- Wiederholungen: `3`
- Pflichtscenarios: `72`
- Mindestobservationen: `216`
- Timeout je Versuch: `120000 ms`
- Attempt-Limit: `230`
- Parallelität: sequentiell
- Persistenz: neue eindeutige Serien-ID; kein Replacement
- Budgetgrenze: maximal 230 Agentversuche; sofortiger Stop bei Mutation, Redaction-Fehler,
  Provenienzdrift oder Nutzerunterbrechung

Die Konfiguration wird unmittelbar vor dem Live-Lauf erneut revalidiert.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: `resolved_for_implementation`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Bestehende Messpipeline wird erweitert; kein neuer Architektur- oder
  Policy-Owner.

## Ergebnis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact:
  `.agdf/control/artefacts/agdf-staged-proportionality-observation/BROWNFIELD_ANALYSIS.md`
- scope: genehmigte 24 Tasks innerhalb der expliziten Kandidatenpfade
- evidence: Validator, Dirty-Worktree-Inventar, historische Hashes, Runtime-/Modellprobe und
  bestehende Owner
- transparency: Vorgängeränderungen sind uncommittierte, aber genehmigte Ausgangsbasis; sie werden
  nicht als neue staged Arbeit beansprucht
- missing_evidence: Implementierung, Offline-Tests, neue Live-Serie, Reviews und QA
- current_coverage: v1-Pipeline vollständig; staged Semantik noch nicht implementiert
- reuse_strategy: gemeinsame Pipeline versioniert erweitern
- risks: Leakage, Versions-/Freshness-Drift, Serienüberschreibung, widersprüchliche Achsen
- context_graph_impact: `link_only`
- required_next_step: SPT-T02 bis SPT-T19 implementieren und vollständig offline validieren; erst
  danach SPT-T20 bis SPT-T22 ausführen.

