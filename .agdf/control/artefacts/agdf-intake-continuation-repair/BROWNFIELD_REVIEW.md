# Brownfield Review: Verlässlicher Delivery-Intake

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: agdf-intake-continuation-repair
- related_ur: .agdf/control/artefacts/agdf-intake-continuation-repair/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-09-27
- baseline_commit: 36fd67e571f2f62f9bf94e92448c00ecbd4e4a3b

## Objective

Die freigegebene UR durch Wiederverwendung bestehender Steuerungs-, Präsentations- und Persistenzverantwortlicher umsetzen. Die UR-Freigabe ist an Revision 3274b878-2045-44e0-9941-e56e05390393 gebunden; aufgezeichnete Revision danach: 07d2ab95-2792-4e56-86a2-386aeb4d3a2d. Der aktuelle Arbeitsbaum enthält nur die bisher angelegten Steuerungsartefakte dieses Reparaturlaufs und dessen Backlog-Zeile.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: Hostübergreifende Blockade-, Fortsetzungs- und Freigabeinteraktion betroffen; die sichtbare Entscheidung muss dieselbe Autoritätsgrenze wie der ausführende Pfad haben.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready

UX_INTENT_DEFINITION.md liegt mit ready vor; ihre vorgeschlagenen Kriterien sind in PRD.md übernommen. Keine zusätzliche Nutzerfreigabe für die Analyse.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | plugin/meta/contracts/request-activation.md; gate-transition.md; interaction.md | delivery.start, interne Schritte und revisionsgebundene Freigaben sind bereits getrennt beschrieben | high |
| Source of truth | plugin/meta/contracts und .agdf/control/runs | Contracts definieren Semantik, RUN_STATE die gebundene Laufrevision | high |
| Runtime path | create-agdf/lib/skill-dispatch/delivery-intake.js; service.js; contract.js | Intake kennt run_missing und ur_missing; übrige gate-check-Ausgänge terminal | high |
| UI / UX | create-agdf/lib/control-evaluation/gate-check.js; interaction-presentation.js | Mehrdeutiger Run zeigt Approval: UR; interne Fortsetzung wird als terminal dargestellt | high |
| Persistence / data | create-agdf/lib/control-state/run-recording.js; gate-approval-validator.js | CLI prüft aktuelle Revision, vertraut Aufrufer bei zuvor präsentierter Revision und Antwortursprung | high |
| Tests / QA | create-agdf/scripts/skill-dispatch-test.js; local-validator-test.js; control-state-test.js; interaction-presentation-test.js | Intake-Test benutzt volle Quell-CLI; installierter Validator kann run-create nicht ausführen | high |
| Release / operations | create-agdf/scripts/sync-plugin-runtime.js; sync-package-assets.js | Runtime- und Skill-Projektionen müssen zusammenpassen; Quelltest beweist keinen installierten Host | high |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| partially_done: Intake-Erkennung existiert | delivery-intake.js | revise | Neuanlage und Fortsetzungsabsicht innerhalb des bestehenden Dispatch-Vertrags ausdrücken |
| partially_done: kanonische Run-Erstellung vorhanden | CLI run-create erfolgreich für diesen Lauf; validator-application.js schließt Befehl aus | revise | Unterstützte Runtime-Schnittstelle nutzen, keinen zweiten Run-Writer bauen |
| partially_done: Freigabeprüfung vorhanden | run-recording.js und gate-approval-validator.js | revise | Präsentationsbindung am vorhandenen Owner ergänzen; keine Chat-Text-Heuristik als Autoritätsquelle |
| not_done: begrenzte Fortsetzung nach UR im gate-check | service.js deterministischer terminal-Zweig | revise | Status-only erhalten und autorisierte Delivery-Fortsetzung unterscheiden |
| fully_done: maßgebliche Persistenz und genaue Freigabeformel | versiegelte RUN_STATE und run-approve | warn | Wiederverwenden; keine automatische Freigabe oder Änderung fremder Runs |

Reuse strategy: extend vorhandene Owner; keine zweite Routing-Engine, kein paralleler Statusrenderer und kein zweites Freigaberegister ohne geklärte kanonische Zuständigkeit. Die genehmigte Ausnahme betrifft Intake-Recovery, nicht spätere Gates.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth — normative Fortsetzungs- und Präsentationsbindung ändern eine Autoritätsgrenze; zusätzlich external_contract_depth durch CLI/MCP-Vertrag und release_cross_host_depth durch installierte Projektionen. quick_task und verified_change sind wegen Gate-, Vertrags- und Persistenzwirkung unzulässig; structured_slice scheitert am nachgewiesenen Autoritäts- und öffentlichen Vertragsimpact.
- evidence: UR.md; create-agdf/lib/control-state/run-recording.js; create-agdf/lib/skill-dispatch/contract.js; create-agdf/lib/runtime/validator-application.js; plugin/meta/contracts/interaction.md
- transparency_note: Keine Wahl nach Dateianzahl. Maßgeblich sind Antwortbindung, begrenzte Handlungserlaubnis und kompatible installierte Ausführung. PRD, SD und TP sind erforderlich; Implementierung bleibt gesperrt.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: authority_policy_security_depth; external_contract_depth; release_cross_host_depth
- rejected_alternative: structured_slice; quick_task; verified_change
- missing_or_conflicting_facts: none for depth selection; concrete protocol and presentation evidence mechanism remain SD work
- depth_evidence_refs: plugin/meta/contracts/modes.md; plugin/meta/contracts/interaction.md; create-agdf/lib/skill-dispatch/contract.js; create-agdf/lib/control-state/run-recording.js

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR: neuer Auftrag bis gültiger Freigabe und interner Fortsetzung |
| authority_boundary | fail | Antwort darf nicht mehr an eine erst später erzeugte Run-Revision gebunden werden; run-recording.js vertraut dem Aufrufer |
| owner_consumer_coordination | pass | Kanonische Contracts, Dispatcher, Validator und generierte Host-Projektionen identifiziert; keine Änderung fremder Fachprodukte |
| full_depth_impacts_absent | fail | CLI/MCP-Vertrag, Fortsetzungssemantik und hostübergreifende Installation betroffen |
| migration_propagation_bounded | unknown | SD muss Umgang mit alten Aufrufen und fehlender Präsentationsbindung festlegen; keine spekulative Migration |
| failure_recovery_local | unknown | SD muss Wiederholungen, Unterbrechungen und Rücknahme der installierten Version bestimmen |
| independently_acceptable | pass | UR-Abnahmesignale verlangen zusammenhängenden positiven Pfad und negative Autoritätsfälle |

Die zwei unbekannten Detailchecks ändern die eindeutige Full-Depth-Wahl nicht: Autoritäts- und öffentliche Vertragswirkung sind bereits direkt belegt.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Wie unterscheidet der sichtbare Ablauf Neuanlage, Fortsetzung, Status und echte Auswahlmehrdeutigkeit? | PRD | revise |
| Welche Bindung beweist vorbereitete Präsentation, und welche tatsächliche Sichtbarkeit bleibt Host-/Agentenverantwortung? | SD | revise |
| Wie bleiben alte Aufrufer sicher, ohne eine aktuelle Revision als zuvor präsentiert anzunehmen? | SD | revise |
| Wie erfolgen begrenzte Fortsetzung, Wiederholung und Installation ohne zusätzliche Schreibrechte für lesende MCP-Aufrufe? | SD | revise |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-spezifische Diagnose in dieser Review; kanonische Vertragsänderungen werden bei der Umsetzung ihren bestehenden Ownern zugeordnet.
- memory_target: scope_artifact
- memory_reason: Diagnose und Auswahl dieser Reparatur, keine neue persönliche Erinnerung oder Graph-Struktur.
- memory_refs: BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: UX Intent Definition aus der freigegebenen UR erstellen und in eine prüfbare PRD überführen.
- forbidden_until_then: SD, TP, Implementierung, QA- oder Installationsbehauptungen.

## Quality Outlook

- quality_outlook: Regressionen müssen die tatsächlich ausgelieferte Validator-Schnittstelle, Status-only, Mehrfachruns, veraltete Antworten und Unterbrechungen abdecken. Implementierungsvorbereitende Brownfield Analysis nach TP erforderlich. Noch keine Tests eines Fixes und kein Fix installiert.
