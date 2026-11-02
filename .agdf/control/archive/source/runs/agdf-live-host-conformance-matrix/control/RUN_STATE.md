# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-live-host-conformance-matrix
- lifecycle: completed
- revision: 11
- revision_id: ef16335a-d483-4ff2-9910-1bdc974d5ba2
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: user / agent

## Objective

Zwölf kritische AGDF-Szenarien auf Codex, Claude Code und OpenCode direkt, redigiert und
host-/versionsgebunden beobachten, ohne gefundene Produktlücken still zu reparieren.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Die 36-Zeilen-Matrix mit 16 Passes, 8 Limitierungen und 12 Claude-`host_unavailable` ist durch QA und UAT akzeptiert; OR `pass` schließt den Child-Run ab. |
| What is approved? | Child-UR, PRD, SD und TP sind durch exakte Freigaben vom 2026-07-28 genehmigt; Pre-Implementation Brownfield Analysis entscheidet `pass`. |
| What is missing? | Nichts im genehmigten Child-Scope. |
| What is the next allowed action? | Keine weitere Child-Arbeit; Parent darf RMP-06 verlinken. |
| What is explicitly forbidden right now? | Produktreparatur, Commit, Push, PR oder Release ohne separaten Scope beziehungsweise ausdrückliche Anweisung. |

## Source And Scope State

- primary_target: AGDF Live Host Conformance Matrix
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: Roadmap-Conformance-Scope, bestehende Host-/UAT-Artefakte, installierte Full Surfaces und deren sichtbares Verhalten
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: explizit aus genehmigtem Roadmap-TP RMP-04/RMP-05 abgeleitet
- competing_scope_lines: Task Target, Interaction und OpenCode-Runs bleiben eigenständig und werden nur als Evidenz gelesen
- excluded_mutation_targets: Runtime-/Plugin-Code, fremde Runs, Host-Konfiguration, VCS, Release und Reinstall

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` am 2026-07-28 nach same-run, same-gate, revision-2 und durable-artefact revalidation. |
| PRD | approved | Exaktes `Approval: PRD` am 2026-07-28 nach same-run, same-gate, revision-3 und durable-artefact revalidation. |
| SD | approved | Exaktes `Approval: SD` am 2026-07-28 nach same-run, same-gate, revision-4 und durable-artefact revalidation. |
| TP | approved | Exaktes `Approval: TP` am 2026-07-28 nach same-run, same-gate, revision-5 und durable-artefact revalidation. |
| QA | approved | Exaktes `Approval: QA` am 2026-07-28 nach same-run, same-gate, Revision-9-, QA-Bericht- und Doctor-Revalidierung akzeptiert. |
| UAT | approved | Exaktes `Approval: UAT` am 2026-07-28 nach same-run, same-gate, Revision-10- und durable-artefact revalidation akzeptiert. |
| OR | done | `OR.md` entscheidet `pass`; diagnostischer Child-Scope abgeschlossen. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/UR.md` | approved | Zwölf Fälle, drei Hosts, Redaction, Evidenz-/Enforcement-Klassen und keine stille Reparatur; freigegeben 2026-07-28. |
| Brownfield Review | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/BROWNFIELD_REVIEW.md` | done | `structured_slice`; UI-/UX-Impact none; vorhandene Evidenz und aktuelle CLI-Grenzen inventarisiert. |
| PRD | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/PRD.md` | approved | LHC-1 bis LHC-8; freigegeben 2026-07-28. |
| SD | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/SD.md` | approved | Run-eigene Matrix, getrennte Beobachtungsmodi, Preflight, Redaction und Mutationsschutz; freigegeben 2026-07-28. |
| TP | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/TP.md` | approved | LHT-01 bis LHT-12 und LHT-T01 bis LHT-T12; freigegeben 2026-07-28. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/BROWNFIELD_ANALYSIS.md` | done | `pass`; vorhandene sichere Headless-Pfade wiederverwenden, Claude unauthentifiziert und interaktive Pfade fallweise unavailable. |
| CD+Tests | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/CD_TESTS.md` | done | 11/12 Tasks vollständig; LHT-12 nur bis QA-Freigabe/UAT teilweise. |
| TP Review | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/TASK_PLAN_REVIEW.md` | pass_for_qa | 11/12 fully done; TPR-LHC-001 `resolved`. |
| Clean Review | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Kein Parallel-Owner, Fallback oder Produktcode. |
| CR | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/CODE_REVIEW.md` | done | Review abgeschlossen und `pass`; Applicability `not_applicable`, weil kein Code geändert wurde. |
| QA | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/QA_REPORT.md` | pass | QA `pass`; exaktes `Approval: QA` nach Revision-9-Revalidierung aufgezeichnet. |
| UAT Evidence | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/UAT_EVIDENCE.md` | accepted | Exaktes `Approval: UAT` nach Revision-10-Revalidierung aufgezeichnet. |
| OR | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/OR.md` | done | OR-full `pass`; non-code delivery closeout ohne VCS-Handoff. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: Keine Produktänderung, aber zwölf Fälle über drei Hosts, Authentifizierung, Redaction und potenzielle Restart-/Mutationsgrenzen erfordern einen kleinen formalen Slice.
- evidence: `.agdf/control/artefacts/agdf-live-host-conformance-matrix/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| Roadmap TP | proposes | Child UR | RMP-04/RMP-05 und `CONFORMANCE_SCOPE.md`; keine Approval-Vererbung. |
| UR | derived_from | Roadmap Conformance Scope | HC-01 bis HC-12, Redaction und Gap-Routing übernommen. |
| UR | approved_by | `Approval: UR` | Exakte Child-Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 2 und dauerhaftem Artefakt. |
| Brownfield Review | sizes | UR | `structured_slice`; vorhandene Tests werden als Baseline wiederverwendet, Live-Passes müssen frisch beobachtet werden. |
| PRD | derived_from | UR | LHC-1 bis LHC-8 definieren Beobachtung, Freshness, Redaction, Pass-/Limit-Regeln und keine stille Reparatur. |
| PRD | approved_by | `Approval: PRD` | Exakte Child-Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 3 und dauerhaftem Artefakt. |
| SD | derived_from | PRD | Run-eigene Evidenzartefakte, Headless-/Interactive-Grenze, sichere Preflights, Wegwerf-Workspaces und Stop-and-route für Produktlücken. |
| SD | approved_by | `Approval: SD` | Exakte Child-Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 4 und dauerhaftem Artefakt. |
| TP | derived_from | SD | LHT-01 bis LHT-12 operationalisieren sichere Preflights, 36 Beobachtungen, Redaction, Mutation Guard, Gap-Routing und Reviews. |
| TP | approved_by | `Approval: TP` | Exakte Child-Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 5 und dauerhaftem Artefakt. |
| Brownfield Analysis | prepares | CD+Tests | `pass`; run-eigene Artefakte und vorhandene tool-enforced Headless-Muster bilden den kleinsten sauberen Pfad. |
| CD+Tests | implements | TP | 36 Matrixzeilen, redigierte Hostevidenz und zwölf grüne Kontrollprüfungen. |
| TP Review | verifies | TP | 11/12 fully_done; LHT-12 nur bis QA-Freigabe/UAT teilweise; TPR-LHC-001 `resolved`. |
| Clean Implementation Review | verifies | CD+Tests | `pass`; keine Fallback-, Shim- oder Parallelstruktur. |
| CR | reviews | CD+Tests | Review `pass`; Applicability `not_applicable`, weil kein Code geändert wurde. |
| QA_REPORT | tests | TP | `pass`; TPR-LHC-001 ist durch zwölf direkte serielle OpenCode-Fallbeobachtungen aufgelöst. |
| QA_REPORT | approved_by | `Approval: QA` | Exakte Freigabe am 2026-07-28 nach Revalidierung von Run, Gate QA, Revision 9 und dauerhaftem Bericht. |
| UAT Evidence | evidenced_by | QA_REPORT | Bereite Abnahmeprojektion bewahrt Limitierungen, Host-Verfügbarkeit und Enforcement-Grenzen. |
| UAT Evidence | approved_by | `Approval: UAT` | Exakte Freigabe am 2026-07-28 nach Revalidierung von Run, Gate UAT, Revision 10 und dauerhaftem Artefakt. |
| OR | closes | Child-Run | `pass`; alle erforderlichen Freigaben vorhanden, Grenzen bewahrt, keine Code- oder VCS-Aktion. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Zwölfteiliger Scope | `.agdf/control/artefacts/agdf-product-maturity-roadmap/CONFORMANCE_SCOPE.md` | Fälle, Schema, Hosts und Grenzen | direct |
| Baseline Register | `.agdf/control/artefacts/agdf-product-maturity-roadmap/BASELINE_REGISTER.md` | bestehende Evidenz und offene Grenzen | direct |
| Parent-TP | `.agdf/control/artefacts/agdf-product-maturity-roadmap/TP.md` | unabhängige Child-Gates | direct |

## Missing Evidence

- keine fehlende Evidenz innerhalb des akzeptierten diagnostischen Child-Scope;
- native-UI-, echte-Mehrturn-, Restart- und Claude-Authentifizierungsgrenzen bleiben bewusst
  akzeptierte Nicht-Garantien.

## Risks

- private Daten in Logs/Screenshots;
- Host-Ausführung verursacht Mutation;
- Diagnose driftet in Produktreparatur;
- Parent-Approval wird fälschlich wiederverwendet;
- Host-Limit wird zur Universalgarantie hochgestuft.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-DELIVERY-PATH-SEARCH`; `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: `resolved_for_review`
- context_graph_required_action: link
- context_graph_gate_effect: `none`
- context_graph_evidence: Brownfield Review entscheidet `link_only`; Host-Versionen und einzelne Beobachtungen sind keine neuen Autoritätsknoten.

## Closeout

- delivered: genehmigte Child-UR/PRD/SD/TP; Brownfield `pass`; 36-Zeilen-Matrix; Codex-/Claude-/OpenCode-Evidenz; TPR-LHC-001 `resolved`; Reviews; QA `pass`.
- intentionally_not_delivered: Produktänderung, VCS und Release.
- next_allowed_action: keine weitere Child-Arbeit; Parent darf RMP-06 verlinken.
- quality_outlook: Die verbleibenden acht Modus-Limitierungen und zwölf Claude-Verfügbarkeitsgrenzen in UAT bewusst bewerten.
