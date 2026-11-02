# Brownfield Analysis: Task Target Resolution Boundary

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/task-target-resolution-boundary/BROWNFIELD_ANALYSIS.md`
- date: 2026-07-28
- reviewer: agent

## Scope

Pre-Implementation-Prüfung für TP T1–T13 nach genehmigter UR, PRD, SD und TP. Ziel ist ein
minimaler sauberer Implementierungspfad für eine Task Target Resolution Boundary vor
Repository-Aktivierung, Scope Classification und Gate-Auswertung.

## Evidenz

- `plugin/meta/agdf-runtime-contract.md` indexiert sieben fokussierte Contract-Module; die
  Modullisten in `sync-package-assets.js` und `check-runtime-integrity.mjs` sind die bestehenden
  Propagation- und Drift-Owner.
- `plugin/meta/agdf-agent-router.md` beginnt derzeit direkt mit Mode Selection und besitzt damit den
  klaren Einfügepunkt für die vorgelagerte Resolution.
- `plugin/meta/contracts/gate-transition.md` besitzt Source Precedence und Repository-Workstate,
  aber keine Task-Target-Präzedenz; eine Erweiterung dort würde zwei Autoritätsarten vermischen.
- `plugin/meta/contracts/interaction.md` besitzt Read-only Orientation, Scope Classification und
  Ready-Gate-Presentation; die neue Orientierung kann dort ohne zweiten Interaction-Owner
  abgegrenzt werden.
- `create-agdf/lib/interaction-presentation.js` besitzt bereits reine, validierende Renderer mit
  `null`-Fail-closed-Verhalten und `authorizes: false`.
- `plugin/meta/agdf-interaction-locales.json` und `validateLocaleRegistry` besitzen vollständige
  `en`/`de`-Pack-Parität und Unit-Fallback; keine neue Locale-Logik ist erforderlich.
- `plugin/skills/gate-check/SKILL.md` besitzt den operativen Einstieg und konsumiert Presentation
  bereits verbatim; Target Resolution kann als erster Workflow-Schritt ergänzt werden.
- `evals/cases/gate-check.json`, Fixture Catalog, deterministic replay und Manifest besitzen den
  bestehenden Behavioral-Eval-Pfad.
- `.agdf/control/CONTEXT_GRAPH.md` enthält `CG-NATIVE-INTERACTION-AUTHORITY`, aber keinen
  Target-Authority-Owner.
- `pages/.astro/settings.json` ist eine fremde bestehende Änderung und nicht Teil dieses Scopes.

## Fehlende Evidenz

- Direkte Live-Host-Beobachtung für Attachment-Pfade und hosteigene Gesprächsfortsetzung ist lokal
  nicht verfügbar. Diese Lücke blockiert die Repository-Implementierung nicht, muss aber in QA und
  UAT ausdrücklich als unverified bleiben.
- Behavioral Evals können die geforderte Agententscheidung prüfen, aber keine vollständige
  technische Erzwingung in jedem Host beweisen.

## Aktuelle Abdeckung

- current_coverage: `partially_done`
- vorhanden: Repository-Scope-Ambiguität, Scope Classification, Presentation Authority,
  Locale-Fallback, Asset-Sync, Runtime Integrity und Skill-Eval-Infrastruktur.
- fehlend: vorgelagerte Task-Target-Autorität, Rollenmodell, Reason Codes, Mehrturn-Stabilität,
  Target-Orientation und fokussierte Regressionsevidenz.

## Reuse-Strategie

- `new`: genau ein fokussiertes Contract-Modul `task-target-resolution.md`, weil kein bestehender
  Contract diese Autorität besitzt.
- `extend`: Router, `gate-check`, Interaction Contract, bestehender Renderer, Locale Registry,
  Runtime Integrity, Eval-Corpus, Runtime Manifest und Context Graph.
- `reuse`: bestehende Contract-Inventare, Sync-Pipeline, Locale-Auflösung, Renderer-Konventionen,
  Testskripte, Eval-Fixtures und Generated-Surface-Pfade.
- `replace`: nichts.

## Impact

- normative Dateien: Router, Runtime Manifest, neuer Contract, Interaction Contract, Gate-check Skill;
- Code: bestehender Presentation-Owner und Tests; Sync-/Integrity-Inventare;
- Daten: additive Locale-Keys und Eval-Datensätze; keine Produktdaten oder Migration;
- Kompatibilität: bestehende Gate-, Approval-, Scope-Classification- und Run-State-Schemata bleiben
  gültig; alte Runs erhalten keine erfundene Target-Bindung;
- Seiteneffekte: generierte Oberflächen und Runtime-Digests ändern sich ausschließlich über den
  vorhandenen Sync.

## Parallelstruktur-Risiko

- risk: neuer Contract könnte Gate- oder Repository-Scope-Semantik duplizieren.
  mitigation: ausschließlich Task-Target-Rollen und vorgelagerte Reihenfolge; explizite
  Runtime-Integrity-Assertions.
- risk: Renderer könnte Target-Evaluator werden.
  mitigation: nur normalisiertes Ergebnis validieren und projizieren; keine Ableitung im Renderer.
- risk: Skill oder Surface erzeugt eigenes Template.
  mitigation: consume-verbatim-Regel und No-Duplication-Assertion.
- risk: globale Target-Persistenz wird zweiter State Owner.
  mitigation: bestehende run-scoped Evidenz nutzen; außerhalb eines Runs transient bleiben.

## SoT-/Runtime-/Produktsemantik-Drift

- kein Konflikt mit genehmigter UR, PRD, SD oder TP;
- keine bestehende Source of Truth muss ersetzt werden;
- der neue Contract schließt eine echte Owner-Lücke und wird im Kompatibilitätsmanifest sowie in
  den bestehenden Contract-Inventaren registriert.

## Sichtbarer State Owner

- effective state: Nutzeranfrage plus kanonischer Task-Target-Contract;
- presentation: ausschließlich `interaction.md` und `interaction-presentation.js`;
- recovery: Reason Code plus sichtbare nächste Aktion; keine Approval- oder Gate-Autorität;
- UI-Monolith-Risiko: nicht anwendbar, da ein fokussierter reiner Renderer im bestehenden
  Presentation-Modul ergänzt wird.

## Risiken

- `block`, falls unresolved Zustände nachgelagerte Aktivierung oder Mutation zulassen.
- `block`, falls Evidence Source als Governance/Mutation Target gelten kann.
- `revise`, falls Mehrturn-Verhalten nicht adversarial getestet wird.
- `revise`, falls Contract- oder Surface-Propagation driftet.
- `warn`, dass Repository-Tests keine Live-Host-Attachment-Verfügbarkeit beweisen.

## Context-Graph-Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- required_action: T11 legt den genehmigten Target-Authority-Knoten an; Closeout reconciliiert ihn.

## Minimaler sauberer Implementierungspfad

1. Contract und Inventare;
2. Router und Gate-check-Konsum;
3. Interaction Contract, Renderer und Locale Registry;
4. Integrity- und Unit-Tests;
5. Behavioral- und Mehrturn-Evals;
6. Context Graph;
7. bestehender Sync, fokussierte Tests und vollständige Regression.

## Erforderlicher nächster Schritt

- required_next_step: `CD+Tests` für TP T1–T13 ausführen.
- transparency: Keine späteren Artefakte werden übersprungen; Implementation ist erst durch
  genehmigten TP plus diese bestandene Brownfield Analysis erlaubt.
