# Brownfield Analysis: AGDF Product Maturity Roadmap

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: none
- artefact: `.agdf/control/artefacts/agdf-product-maturity-roadmap/BROWNFIELD_ANALYSIS.md`
- scope: Parent-Phase A RMP-01 bis RMP-04; ausschließlich run-eigene Baseline-, Workstream- und
  Conformance-Scope-Artefakte plus kanonische Run-/Backlog-Verlinkung.
- evidence: genehmigter TP; aktuelle Gate-Checks der angrenzenden Runs; bestehender run-scoped
  Control State; vorhandene Artefact Chain; Context Graph `link_only`; Worktree zeigt den
  Roadmap-Scope getrennt von bereits vorhandenen fremden Änderungen.
- transparency: Parent-Control-Artefakte reichen für Phase A aus. Neue Runtime-, Template-,
  Validator-, Router-, Eval- oder Interaction-Logik ist weder erforderlich noch zulässig.
- missing_evidence: authentifizierte Host-Conformance und Child-UAT fehlen planmäßig; sie gehören
  nicht in Parent-Phase A.
- current_coverage:
  - `fully_done`: genehmigte UR/PRD/SD/TP, Brownfield Routing, UX Intent, bestehende Run- und
    Evidenz-Owner.
  - `partially_done`: Baseline über Task Target, Interaction und OpenCode-Arbeit.
  - `not_done`: gemeinsame Host-Conformance, Benchmark, Enforcement Closure und Unified Journey.
- reuse_strategy:
  - `extend`: ausschließlich run-eigene Artefaktkette und Master-Backlog-Zeile.
  - `reuse`: kanonische Child-/Bestandszustände über Links und Validatorausgabe.
  - `new`: drei run-eigene nicht-normative Koordinationsartefakte.
  - `replace`: nichts.
- risks:
  - fremden Run-Zustand kopieren oder hochstufen;
  - Parent-Approval als Child-Autorität behandeln;
  - Conformance-Scope in eine stille Produktreparatur erweitern;
  - neue Control-Templates aus run-eigenen Artefakten ableiten.
- context_graph_impact: `link_only`; keine neue dauerhafte Autorität und kein neuer Knoten.
- required_next_step: RMP-01 bis RMP-04 ausführen, Scope-Isolation prüfen und anschließend den
  eigenständigen Conformance-Run nur bis zur separaten UR-Entscheidung vorbereiten.

## Owner- und Regression-Check

| Bereich | Bestehender Owner | Phase-A-Wirkung | Ergebnis |
|---|---|---|---|
| Run-Zustand | `.agdf/control/runs/<run_id>/RUN_STATE.md` plus Resolver | read-only verlinken | pass |
| Backlog | `.agdf/control/MASTER_BACKLOG.md` | eine Roadmap-Zeile aktualisieren | pass |
| Target/Scope | Task Target, Modes, Gate Transition | keine Änderung | pass |
| Quality/Capability | Quality Contract, Surface Capabilities | nur Evidenzklasse referenzieren | pass |
| Interaction | Interaction Contract und Renderer | keine Änderung | pass |
| Context Graph | bestehende sechs Knoten | `link_only` | pass |
| Tests | Doctor, Gate Check, Delivery Map, Link- und Diff-Prüfung | bestehende Validatoren wiederverwenden | pass |

## RMP-11 Brownfield Revalidation — 2026-08-19

- mode: `pre_implementation_analysis`
- decision: `pass`
- scope: reconcile the completed QA Transition and Structured Depth child outcomes into the Parent
  registers and decide the smallest safe next workstream action.
- evidence: both child run states are `completed`; both ORs are `pass`; the Depth child records exact
  QA and UAT approvals; the active Parent remains at `CD+Tests` with no missing approval or Doctor
  finding.
- current_coverage: WS-03 is completed; WS-02 has the accepted Depth prerequisite but retains the
  bounded SPF-01 through SPF-04 Benchmark v3 gaps; WS-04 still depends on unsettled canonical Target,
  Interaction and OpenCode owners.
- reuse_strategy: extend `BASELINE_REGISTER.md`, `WORKSTREAM_REGISTER.md`,
  `STAGED_PRODUCT_FINDINGS_ASSESSMENT.md`, `CD_TESTS.md` and Parent control state; reuse child ORs by
  link; create no new Parent policy, runtime or interaction owner.
- parallel_structure_risk: `pass`; Benchmark v3 remains in the existing proportionality pipeline,
  while Unified Journey remains with the existing Interaction owners and is not started.
- context_graph_impact: `link_only`; existing approved nodes remain the authority and no new node is
  justified by this coordination checkpoint.
- missing_evidence: a separate Benchmark v3 UR approval; settled QA/UAT/host evidence for the owners
  that bound any future Unified Journey scope.
- required_next_step: prepare the separately gated Benchmark v3 UR; do not create a Unified Journey
  child until a concrete residual gap is evidenced.
