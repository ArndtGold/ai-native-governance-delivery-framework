# QA Report

Decision: revise
Status: revise
Gate: QA
Date: 2026-10-08
Run: cockpit-active-backlog-core-ui-20261008-01
Based on: exact approved TP.md (sha256:b3cd38526653d1fcb4d056f9da17dd83271140ef3717f5d438a622d102f91b87) and its approved PRD/SD chain.
QA decision owner: qa-gate

## Quality Readiness
| Dimension | Outcome | Evidence |
|---|---|---|
| Plan coverage | revise | TP_REVIEW.md; 7/8 fully_done; T-007 partially_done |
| Solution integrity | pass | CLEAN_IMPLEMENTATION_REVIEW.md |
| Code quality | pass | CR.md; CR-001 resolved with exact-row-focus regression |
| QA decision | revise | qa-gate is the sole final decision owner; TPR-001 open |

## QA Gate
- decision: revise
- evidence: the approved bounded Core/UI slice and satisfactory preparation, 63 Core tests, 7 service tests, 129 component tests and final full 20-case browser run pass. Typecheck and both final builds pass. Both stdio suites under both supported protocols pass against the final prepared UI digest sha256:551cf9bf88c24df33618e634eb1e3474cc344fecf1191d20ddf54dd3080a59a1. Runtime integrity, private projection bytes/exclusion, payload/variant/config checks pass. Eight browser width/theme captures were inspected. Reports are EVIDENCE_CORE.md, EVIDENCE_UI.md, EVIDENCE_BUILD.md, EVIDENCE_REGRESSION.md and EVIDENCE_RENDERED.md.
- missing_evidence: TPR-001; SCN-010/014/024 fresh actual compact Codex rendering, observed width/display capability and expansion result, list/search/disclosure/select/return/reload journey, and a separately measured all-.agdf/control-file app-only path/byte equality window. EVIDENCE_NATIVE.md explains the old active connection and absent accessible MCP App tabs. Preparation/configuration/protocol success does not prove new native rendering.
- risks: actual host usability/no-write qualification remains unknown; five rows need not fit a fixed pixel height. There is no evidenced security, source-of-truth, scope or hard architecture defect requiring block.
- required_next_step: execute the approved T-007 qualification through a freshly loaded matching agdf-cockpit-local connection and accessible App surface, then refresh evidence/reviews and rerun QA.
- impact_codes: not_applicable; no project-specific code registry invoked.

## Acceptance and evidence assessment
AC-001/002/003/006/007 are covered by the mapped Core/component/rendered browser observations. AC-004/005/008 remain partial at their explicit native evidence edges. TP_REVIEW.md maps every applicable criterion to task and visible evidence. Its three partial UX rows and open normalized finding prevent pass under the Quality Contract. No missing requirement, design decision or plan obligation is invented or reclassified. No numeric P0/P1 priorities exist in this TP; the required native evidence is conservatively QA-relevant.

CR-001 is resolved by App.tsx restricting overview return targets to list row actions. A valid Run key equal to backlog-search returns focus to its exact row in the final passing regression. Structural review confirms one pure Core policy and unchanged session/selector/transport authority. Documentation describes stored-field search, source provenance, compact five-match display and deliberate overview reload, including newly observed rows starting with closed source disclosure after explicit reload.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-001 | evidence_gap | evidence_obligation | open | TP_REVIEW.md and EVIDENCE_NATIVE.md; SCN-010/014/024 not yet observed in fresh native App | Complete approved T-007 native qualification, refresh affected evidence/reviews and rerun QA |

## Context Graph and knowledge
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: bounded existing-owner fix; focused docs and run-local evidence retain the relevant knowledge.
- memory_target: scope_artifact
- memory_reason: task-specific implementation, package, rendered and missing-native evidence belongs to this run; no external memory update requested.
- memory_refs: this report, TP_REVIEW.md, EVIDENCE_*.md and evidence/.

## Authority and next gate
This decision revises evidence, not approved product intent. QA pass, Approval: QA, UAT, release and VCS actions are not granted. A revise report must not be presented for approval as though ready. The only next action is the scoped native qualification above; the user has been asked to reload the named connection and expose the App.

## AGDF Approval Summary (de; source=en)

QA-Ergebnis: revise. Gemeinsame Core-Listenlogik, lesbare Zeilen, aktive Fünfer-Vorschau, Suche im gesamten aktiven Bereich und genaue Rückkehrnavigation sind implementiert. Die abschließenden 63 Core-, sieben Service-, 129 Komponenten- und 20 Browserprüfungen bestehen; beide Builds und die MCP-Protokollprüfungen passen zum vorbereiteten Paket. Code Review und Strukturprüfung sind bestanden.

Sieben von acht Aufgaben sind vollständig belegt. Offen bleibt T-007: frische echte Codex-Ansicht mit beobachteter Breite/Vergrößerung und ein ausschließlich durch App-Leseaktionen gemessener Vergleich aller Kontrolldateien nach Pfad und Bytes. Browser- und Protokollnachweise ersetzen das nicht. Deshalb bleiben AC-004, AC-005 und AC-008 teilweise belegt. Als Nächstes wird die neu geladene lokale Cockpit-Verbindung im zugänglichen App-Seitenpanel geprüft; danach folgen aktualisierte Nachweise und QA. Aktuell wird keine QA-, UAT- oder Release-Freigabe angefragt oder erteilt.
