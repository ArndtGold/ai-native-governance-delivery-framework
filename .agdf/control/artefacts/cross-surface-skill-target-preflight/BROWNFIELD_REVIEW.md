# Brownfield Review: Cross-Surface Skill Target Preflight

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: cross-surface-skill-target-preflight
- related_ur: `.agdf/control/artefacts/cross-surface-skill-target-preflight/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-09-03

## Objective

Den freigegebenen Cross-Surface-Scope so einordnen, dass direkte evidenzabhängige Skill-Aufrufe
dieselbe bestehende Zielautorität verwenden, ohne Host-Forks, einen zweiten Resolver oder einen
zweiten Presentation-Owner einzuführen.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: Zielklärung, sichtbare Blocker, Recovery und der Unterschied zwischen
  Statuskarte, Quality Readiness und QA-Entscheidung ändern sich für direkte Skill-Aufrufe.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
  (`.agdf/control/artefacts/cross-surface-skill-target-preflight/UX_INTENT_DEFINITION.md`)

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `task-target-resolution.md`; `quality.md` | Zielauflösung ist global vorgelagert; QA entscheidet genau `pass | revise | block` | `medium` |
| Source of truth | `agdf-agent-router.md`; kanonische Skills unter `plugin/skills/` | Regeln existieren, direkte Skill-Selbstständigkeit ist lückenhaft | `medium` |
| Runtime path | `target-check`; generierter surface-local Validator | Code-owned Resolver und lokalisierter Renderer sind vorhanden | `low` |
| UI / UX | `interaction.md`; `interaction-presentation.js` | Task Target Orientation und Run Status Card besitzen getrennte Owner | `medium` |
| Persistence / data | `.agdf/control/` | Keine neue Persistenz oder Migration erforderlich | `none` |
| Tests / QA | `evals/cases/qa-gate.json`; Runtime Integrity; Sync-Tests | QA-Evals enthalten noch keinen direkten repo-losen Aufruf | `medium` |
| Release / operations | vorhandene Profilgenerierung für vier Hosts | Eine kanonische Quelle wird in bestehende Profile projiziert | `low` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Target-Semantik und Renderer existieren bereits | Target-Contract, `target-check`, Interaction-Renderer | `block` bei Duplikation | Bestehende Owner nur referenzieren und aufrufen |
| `gate-check` besitzt einen funktionierenden operativen Preflight | kanonischer Skill und Cross-Surface-Generierung | `warn` | Gemeinsame kurze Preflight-Regel ableiten, keine zweite Gate-Logik kopieren |
| `qa-gate` besitzt die alleinige QA-Entscheidung | Quality Contract und Skill | `block` bei Vermischung | Statuskarte nicht in `qa-gate` verschieben |
| Profile werden aus kanonischen Skills generiert | `sync-package-assets.js` und Conformance-Tests | `warn` | Kanonische Quelle ändern und alle Projektionen deterministisch prüfen |
| Bestehender Copilot-Run ist abgeschlossen committed, aber QA-UAT bleibt hostseitig offen | Commit `5047db2`; Copilot-Run QA Revision 12 | `warn` | Neuen Run getrennt halten; Hostbelege nicht übernehmen |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice`; der Scope ändert eine klar begrenzte direkte
  Skill-Interaktion und ihre vorhandenen Cross-Surface-Projektionen. Authority, Persistenz,
  Runtime-Architektur, CLI-Schema und Gate-Modell bleiben unverändert. Quick Task und Verified
  Change sind wegen normativer Skill-, Contract-, Eval- und Mehrflächenwirkung ungeeignet;
  Structured Delivery wäre ohne eigenen Rollout, Migration oder neue externe Schnittstelle zu tief.
- evidence: freigegebene UR; abgeschlossene Runs `task-target-resolution-boundary` und
  `quality-readiness-surface`; aktuelle canonical/generierte Skill- und Testowner.
- transparency_note: PRD, SD und TP bleiben auf direkte evidenzabhängige Skill-Aufrufe, vorhandene
  Zielauflösung und bestehende Profilgenerierung begrenzt.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: `none`
- rejected_alternative: `structured_delivery`, weil weder neue Authority noch Runtime-Architektur,
  Persistenz, Migration, externe API oder koordinierter Host-Rollout erforderlich ist.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: freigegebene UR; `task-target-resolution.md`; `quality.md`;
  `agdf-plugin.definition.json`; `sync-package-assets.js`; bestehende Cross-Surface-Tests.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | Direkte evidenzabhängige Skills klären das Ziel oder verwenden Repository-Evidenz selbstständig. |
| authority_boundary | `pass` | Bestehende Target-, Gate-, QA- und Presentation-Owner bleiben unverändert autoritativ. |
| owner_consumer_coordination | `pass` | Kanonische Skills und bestehende Generatoren bedienen alle Profile ohne getrennten Cutover. |
| full_depth_impacts_absent | `pass` | Keine Security-, Policy-, Persistenz-, Runtime-, API-, CLI- oder Releasearchitekturänderung. |
| migration_propagation_bounded | `pass` | Nur deterministische Skill-/Contract-Projektion; keine Nutzerdatenmigration. |
| failure_recovery_local | `pass` | Fehler endet mit Zielklärung oder fail-closed Skill-Entscheidung; Rückbau ist quellenlokal. |
| independently_acceptable | `pass` | Der Slice ist über direkte QA-Aufrufe und generierte Profile separat prüfbar. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Welche Skills gelten als evidenzabhängig und benötigen den direkten Preflight? | `PRD` | `block` |
| Liegt die gemeinsame Orchestrierungsregel im Router, in einem fokussierten Contract oder als kurze Skill-Pflicht? | `SD` | `block` |
| Wie wird Repository-Evidenz gefunden, ohne den Host-cwd zur Zielautorität zu machen? | `SD` | `block` |
| Welche direkten Hostbeobachtungen sind für Cross-Surface-Parität erforderlich? | `TP` | `revise` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Der bestehende Target-Owner gilt bereits vor jeder Repository-Aktivierung;
  der neue Slice schließt die direkte Skill-Invocation-Lücke und behält Presentation-Owner getrennt.

## Next Permissible Step

- next_allowed_action: Den aus der ready UX Intent Definition abgeleiteten PRD-Entwurf prüfen und
  `Approval: PRD` anfordern.
- forbidden_until_then: SD, TP, Implementierung, QA, UAT, Release und VCS-Aktionen.

## Quality Outlook

- quality_outlook: Die Lösung ist nur sauber, wenn ein Ziel genau einmal vor Evidenzzugriff bestimmt
  wird und jeder Skill danach ausschließlich seinen eigenen kanonischen Output erzeugt.
