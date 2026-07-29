# Brownfield Review: QA-Block Transition Integrity

Status: `done`
Date: 2026-07-29
Run: `agdf-qa-block-transition-integrity`

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- artefact:
  `.agdf/control/artefacts/agdf-qa-block-transition-integrity/BROWNFIELD_REVIEW.md`
- scope: Die bestehende QA-Transition in `gate-policy.js` so korrigieren, dass QA-`block` keine
  Approval-Aufforderung erzeugt; fokussierte Tests und abgeleitete Packageflächen über bestehende
  Owner validieren.
- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Die sichtbare Status-/Approval-Projektion wird auf bereits genehmigte,
  eindeutige QA-Semantik zurückgeführt; Working Mode, Authority, Aktivierung und Recovery werden
  nicht neu definiert.
- ux_intent_definition_required: `no`
- evidence:
  - `create-agdf/lib/control-evaluation/gate-policy.js` ist der gemeinsame kanonische
    Transitionowner; `qaRevisionRequired` erkennt aktuell ausschließlich `revise`.
  - `create-agdf/lib/control-evaluation/run-state.js` hält die dauerhafte Grenze bereits
    fail-closed: QA ist nur mit Approval und Artefaktstatus `pass | passed` erfüllt.
  - `create-agdf/scripts/control-state-test.js` enthält bereits den fokussierten QA-Revise-Fixture
    und ist der kleinste direkte Testowner.
  - `create-agdf/scripts/smoke-test.js` enthält die Gate-Transition-Matrix und den vollständigen
    Regressionseinstieg.
  - Alle drei Kandidatenpfade sind am Baseline-Commit
    `7a15768d319b47f78e6a178c52e94682360ad6dc` sauber; fremder Worktree-Scope bleibt außerhalb.
- transparency: `quick_task` ist proportional, weil das Narrow-Code-Fix-Kriterium erfüllt werden
  kann: eine Funktion mit eng gekoppeltem Caller in genau einem Implementierungsfile, gezielte
  Regressionstests, keine neue Gate-/Approval-/CLI-/Schema-Semantik und unveränderte
  Doctor-/Testschnittstellen. Code Review bleibt verpflichtend.
- missing_evidence: Implementierungsdiff und grüne Regressionsevidenz fehlen erwartungsgemäß vor
  Quick Task Execution.
- current_coverage:
  - `fully_done`: dauerhafte QA-`pass`-Grenze verhindert UAT bei nicht-pass Bericht;
  - `partially_done`: QA-`revise` besitzt bereits eine fail-closed Sonderprojektion;
  - `not_done`: QA-`block` besitzt keine entsprechende Transition-/Presentation-Projektion.
- reuse_strategy: `extend` den bestehenden Gate-Policy-Owner und die vorhandenen Testmatrizen; kein
  neuer Transition-, Presentation- oder QA-Owner.
- risks:
  - Eine generische Behandlung aller nicht-pass Werte könnte fehlendes oder unbekanntes QA
    fälschlich blockieren; nur kanonische Artefaktwerte behandeln.
  - Unterschiedliche JSON-/Statuskartenpfade wären eine Parallelstruktur; die Korrektur muss vor
    der gemeinsamen Presentation liegen.
  - Fremder umfangreicher Benchmark-Scope ist aktiv; ausschließlich die drei sauberen
    Kandidatenpfade berühren.
- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Bestehende Authority-/Statusknoten reichen; kein neuer Owner oder Graphknoten.
- required_next_step: Quick Task eng im genehmigten UR-Scope implementieren, fokussierte und
  vollständige Tests ausführen, verpflichtenden Code Review und OR-lite dokumentieren.

## Mode/Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Bestehende eindeutige QA-Semantik wird in einem Implementierungsowner korrekt
  projiziert; der Fix kann das Narrow-Code-Fix-Kriterium ohne Contract- oder Gateänderung erfüllen.
- evidence: `gate-policy.js`, `run-state.js`, `control-state-test.js`, `smoke-test.js`; saubere
  Kandidatenpfade am Baseline-Commit `7a15768d319b47f78e6a178c52e94682360ad6dc`.

