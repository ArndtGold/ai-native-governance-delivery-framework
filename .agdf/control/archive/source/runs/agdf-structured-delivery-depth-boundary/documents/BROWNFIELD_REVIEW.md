# Brownfield Review: Structured Delivery Depth Boundary

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-structured-delivery-depth-boundary`
- related_ur:
  `.agdf/control/artefacts/agdf-structured-delivery-depth-boundary/UR.md`
- current_gate: `PRD`
- reviewer: `agent`
- reviewed_at: `2026-07-29`

## Objective

Den genehmigten SDB-1-bis-SDB-10-Scope gegen bestehende normative Owner, Runtimekonsumenten,
Testpfade, aktive Fremdänderungen und die notwendige formale Tiefe abgrenzen.

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- artefact:
  `.agdf/control/artefacts/agdf-structured-delivery-depth-boundary/BROWNFIELD_REVIEW.md`
- scope: Eine kanonische Depth-Decision-Semantik im bestehenden Modes Contract definieren,
  vorhandene Gate-/Brownfield-Konsumenten ausrichten, fail-closed Evidenz und Begründung
  spezifizieren sowie deterministische Contract-/Skill-/Runtime-Tests planen. Benchmark v3 bleibt
  ein eigener nachgelagerter Run.
- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: Die Änderung spannt zwei formale Delivery-Modi auf, verändert die sichtbare
  Mode/Slice-Begründung und Recovery bei fehlenden Fakten und wirkt auf operative sowie
  nicht-autorisierende Benchmarkprojektionen.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- evidence:
  - `plugin/meta/contracts/modes.md` ist der normative Modes-Owner, enthält aber noch keine
    entscheidbare Tiefenmatrix.
  - `plugin/meta/contracts/gate-transition.md` besitzt die abstrakte Mode/Slice-Auswahl und die
    unveränderte Gate-Reihenfolge.
  - `plugin/skills/brownfield-analysis/SKILL.md` ist der operative post-UR-Auswahlkonsument.
  - `create-agdf/lib/control-evaluation/run-state.js` und `gate-policy.js` validieren bereits
    Entscheidung, Grund und Evidenz, nicht aber die neue fachliche Tiefengrenze.
  - Runtime Integrity, Control-State-/Smoke-Tests und deterministische Skill-Evals sind vorhandene
    Validierungsowner.
  - `CG-DELIVERY-PATH-SEARCH`, `CG-DOCUMENTATION-CEREMONY-BOUNDARY` und
    `CG-UX-INTENT-BEFORE-PRD` bilden die relevanten bestehenden Graphgrenzen.
  - `evals/proportionality/**` und `create-agdf/lib/skill-evals/live-recorder.js` sind bereits durch
    den fremden Benchmark-/Staged-Scope verändert oder untracked und bleiben in diesem Child
    zunächst ausgeschlossene Mutationsziele.
- transparency: `quick_task` und `verified_change` scheiden wegen neuer normativer Produktsemantik
  und mehreren Contract-/Runtime-/Skill-Konsumenten aus. `structured_slice` reicht nicht, weil der
  Change die gemeinsame Delivery-Mode-Authority, fail-closed Recovery, generierte Runtimeflächen
  und mehrere Evaluations-/Presentationkonsumenten koordiniert. Die vollständige Gate-Kette ist
  proportional; Benchmarkdaten werden dennoch nicht in diesen Scope gezogen.
- missing_evidence: PRD-Entscheidungen zu zwingenden Triggern, Signalkumulation, Mindestfakten und
  sichtbarer Slice-Tiefe; SD-Evidenz zur genauen Owner-/Propagationsmatrix.
- current_coverage:
  - `fully_done`: bestehende Trivial-/Quick-/Compact-/Verified-Change-Grenzen und gemeinsame
    strukturierte Gate-Reihenfolge;
  - `partially_done`: abstrakte Definitionen von `structured_slice` und
    `structured_delivery`, evidenzpflichtige Mode/Slice Decision und Statusprojektion;
  - `not_done`: kanonische Tiefenmatrix, zwingende und kumulative Signale, Mindestfakten,
    fail-closed Depth-Gap-Projektion sowie fokussierte Decision-Evals.
- reuse_strategy: `extend` vorhandene Modes-, Gate-, Brownfield-, Runtime-Integrity- und
  Skill-Eval-Owner; keine neue Mode-Engine und keine Benchmark-eigene Policy.
- risks:
  - Doppelte normative Regeln in Modes, Gate Transition und Skills könnten sofort wieder driften.
  - Eine rein numerische Matrix könnte hohe Wirkung unterschätzen oder kleine Multi-Owner-Slices
    übereskalieren.
  - Eine implizite Default-Eskalation könnte Informationsgaps verbergen und unnötige Zeremonie
    erzeugen.
  - Aktiver fremder Benchmarkscope macht Änderungen an `evals/proportionality/**`,
    Proportionalitätsimplementierung und Live Recorder konfliktträchtig.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`;
  `CG-UX-INTENT-BEFORE-PRD`
- context_graph_reconciliation: `resolved_for_review`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: Bestehende Knoten besitzen Delivery-Path-Authority, Ceremony-Grenzen und
  UX-Intent-Routing; SD muss die neue Depth-Invariante dort verorten, kein neuer Knoten ist derzeit
  gerechtfertigt.
- required_next_step: PRD mit expliziter Produktentscheidung zu Triggern, Kumulation,
  Mindestfakten, sichtbarer Begründung und Slice-Tiefe erstellen und zur exakten Freigabe vorlegen.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/contracts/modes.md` | abstrakte Mode-Grenzen | high |
| Source of truth | Modes Contract; Gate Transition konsumiert | ein normativer Owner muss erhalten bleiben | high |
| Runtime path | Gate Policy, Run State, Interaction Presentation | gemeinsame Entscheidung wird bereits projiziert | medium |
| UI / UX | Run Status Card und Mode/Slice Decision | Begründung, Blocker und Recovery werden sichtbar | high |
| Persistence / data | `RUN_STATE.md` Mode/Slice-Felder | keine neue Persistenzform erwartet | low |
| Tests / QA | Runtime Integrity, Control State, Smoke, Skill Evals | vorhandene Owner, neue Matrixfälle nötig | high |
| Release / operations | generierte Plugin-/Packageflächen | Propagation und Packaging betroffen, kein Release im Run | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Modes Contract ist normativer Owner | `modes.md` | block | Alle anderen Flächen referenzieren/konsumieren; keine Vollkopie der Policy. |
| Gate Transition besitzt operative Auswahl | `gate-transition.md` | revise | Nur Integrations- und Fail-Closed-Regel, keine zweite Matrix. |
| Benchmarkscope ist bereits dirty/untracked | Git-Status und aktive Child-Runs | block | Bis separatem Benchmark-v3-Run nicht mutieren. |
| Bestehende Eval-/Integrity-Infrastruktur | Package- und Runtime-Tests | warn | Wiederverwenden statt neue Testengine. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: Neue normative Delivery-Mode-Semantik mit breiter Contract-, Runtime-, Skill-,
  Presentation-, Propagations- und Evaluationswirkung.
- evidence: genehmigte UR; Modes/Gate-Transition-Verträge; bestehende Runtime-/Skill-Konsumenten;
  UX Intent Definition `ready`; isolierter fremder Benchmarkscope.
- transparency_note: Vollständige formale Tiefe ist wegen der Authority- und
  Cross-Consumer-Wirkung erforderlich, nicht wegen Datei- oder Ownerzahl. Benchmark v3 bleibt
  außerhalb.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Welche Dimensionen erzwingen einzeln Full Depth? | PRD | block |
| Wie werden kumulative Signale ohne starre Proxy-Schwellen bewertet? | PRD | block |
| Welche Mindestfakten erlauben eine positive Entscheidung? | PRD | block |
| Wie unterscheidet sich Slice-Tiefe sichtbar, ohne Gates auszulassen? | PRD | block |
| Welche Dateien konsumieren oder referenzieren die normative Matrix? | SD | revise |
| Wie werden generierte Runtimeflächen ohne Policy-Duplikation synchronisiert? | SD | revise |
| Welche fokussierten Tests beweisen Konsistenz und Fail-Closed-Verhalten? | SD | revise |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`;
  `CG-UX-INTENT-BEFORE-PRD`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: Die neue Invariante verfeinert vorhandene Delivery-Path- und
  Ceremony-Authority; konkrete Referenzen und Exit-Kriterien werden in SD festgelegt.

## Next Permissible Step

- next_allowed_action: PRD erstellen und exakt `Approval: PRD` anfordern.
- forbidden_until_then: SD, TP, Contract-/Code-/Benchmarkänderung, Implementierung, QA/UAT, VCS,
  Release und Reinstall.

## Quality Outlook

- quality_outlook: Ein Modes-Owner, explizite Impact-/Evidence-Grenze, sichtbare Recovery und
  getrennte nachgelagerte Benchmarkkalibrierung.
