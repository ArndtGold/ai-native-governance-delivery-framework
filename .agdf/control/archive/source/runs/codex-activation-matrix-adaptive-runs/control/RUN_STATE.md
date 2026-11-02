# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: codex-activation-matrix-adaptive-runs
- lifecycle: completed
- revision: 24
- revision_id: ad3a05f6-1a39-41cd-9cbe-ac4e7e22e7ff
- content_seal: sha256:f9f98480475e4585dd7fa7244a6470a2e4c0eedcbded90c1b876ce723de8b829
- approval_seal: sha256:04ceea9271c67d446a011c1046da9ac6cc31414903fc577177ec18fe69cf020a
- mode: structured_slice
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Die Codex-CLI-Aktivierungsmatrix prüft zehn Fälle in frischen Erstläufen, wiederholt nur begründete Abweichungen oder vorab markierte Grenzfälle und weist Token-, Laufzeit- und Suchtelemetrie pro Sitzung nachvollziehbar aus.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA und UAT sind freigegeben; OR dokumentiert den abgeschlossenen Scope mit 10/10 Live-Erstläufen und seinen Messgrenzen. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP, Approval: QA, Approval: UAT |
| What is missing? | Nichts innerhalb des genehmigten Scope. |
| What is the next allowed action? | Delivery-Closeout als Git-Handoff erstellen; Commit, Push, PR und Veröffentlichung erfordern eine gesonderte ausdrückliche Anweisung. |
| What is explicitly forbidden right now? | commit, push, open PR or release automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/UR.md` sha256:8b57bf2ec7390213 · presentation 03d44e8c-66a9-40d3-a846-f7ac2017e247 sha256:32cf12bcd28017ffac6377bfeaefa598d87942a640c9a81c25b427a4be76a6c5 |
| PRD | approved | `Approval: PRD` · 2026-09-29 · revision 7 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/PRD.md` sha256:a5e2a27b9ebf4e9f · presentation f9adb24b-a2ea-48d3-836b-ab1ec5d96111 sha256:beb34375a2ed910c2912f465767e631a6d2b6c13d4ccf50dde3e6d048a9393ef |
| SD | approved | `Approval: SD` · 2026-09-29 · revision 11 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/SD.md` sha256:b7fa0fe6ddba8076 · presentation 6ef85d6f-5025-41bf-b7aa-052dc03fa961 sha256:73e72a8f57fef664ff7dce9e1a8553da0ab888366b510d894be789ac12e2249e |
| TP | approved | `Approval: TP` · 2026-09-29 · revision 13 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/TP.md` sha256:731817622bc7ba13 · presentation 06cd04fe-41b6-47f9-8ea9-a40f7bcb9e16 sha256:e399e04c3b4bcfeb4fc4d6d496615b4df294216b14adc083db00da62164c077d |
| QA | approved | `Approval: QA` · 2026-09-29 · revision 21 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/QA_REPORT.md` sha256:96d3b3964b019e52 · presentation d44946b3-2d58-440f-be95-0ad49d848257 sha256:ee2245679accccb57e30c769eb4bbc83d60a61e9e8245d8e379b56b9c4f410c3 |
| UAT | approved | `Approval: UAT` · 2026-09-29 · revision 22 · presentation e6796103-7771-415f-a6e0-d9c9b8f486e6 sha256:2c4236cb6accddedddb9c02b9153383e975002d6ddbf9fea6ea361a5ffa629ea |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/PRD.md` | approved | criteria-chain-v1; AC-001 through AC-007 |
| SD | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/SD.md` | approved | criteria-chain-v1; AC-001 through AC-007 mapped |
| TP | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/TP.md` | approved | criteria-chain-v1; T-001 through T-005; SCN-001 through SCN-011 |
| Brownfield Analysis | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_ANALYSIS.md` | done | `pre_implementation_analysis` pass for approved TP; canonical Harness owner and test path confirmed |
| CD+Tests | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/CD_TESTS.md` | done | T-001 through T-005; 10/10 live Erstläufe; Maintenance-Tests pass |
| CR | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/CR_REPORT.md` | done | Code Review pass |
| QA | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/QA_REPORT.md` | pass | QA decision pass; Approval: QA recorded |
| OR | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/OR.md` | pass | OR-full; QA and UAT approved; no VCS action |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: lokaler, reversibler Maintenance-Probe-Slice mit neuer Auswertungssemantik; Quick Task und Verified Change zu schmal, kein Full-Depth-Trigger
- evidence: .agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/UR.md` sha256:8b57bf2ec7390213 · presentation 03d44e8c-66a9-40d3-a846-f7ac2017e247 sha256:32cf12bcd28017ffac6377bfeaefa598d87942a640c9a81c25b427a4be76a6c5 |
| PRD | derived_from | UR | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/PRD.md` maps the approved UR scope to AC-001 through AC-007 and uses `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_REVIEW.md` for the bounded route. |
| PRD | approved_by | Approval: PRD | `Approval: PRD` · 2026-09-29 · revision 7 · `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/PRD.md` sha256:a5e2a27b9ebf4e9f · presentation f9adb24b-a2ea-48d3-836b-ab1ec5d96111 sha256:beb34375a2ed910c2912f465767e631a6d2b6c13d4ccf50dde3e6d048a9393ef |
| SD | derived_from | PRD | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/SD.md` maps each approved PRD criterion AC-001 through AC-007 exactly once to the existing Harness owner and SDD-001 through SDD-004. |
| TP | derived_from | SD | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/TP.md` maps approved PRD criteria and SDD-001 through SDD-004 to T-001 through T-005 and SCN-001 through SCN-011. |
| Brownfield Analysis | verifies | TP | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_ANALYSIS.md` confirms the existing Harness, JSONL, isolation, documentation and regression-test owners for approved TP revision 13. |
| CD+Tests | implements | TP | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/CD_TESTS.md` maps T-001 through T-005 to code, tests and 2026-09-29 live evidence. |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/QA_REPORT.md` consumes TP Review, Clean Implementation Review, Code Review und den Live-Nachweis. |
| OR | closes | QA_REPORT | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/OR.md` records QA/UAT approvals, live limits and the next handoff. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| PRD draft | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/PRD.md` | adaptive run selection, A4 source binding, session telemetry, AC-001 through AC-007 | direct |
| SD draft | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/SD.md` | bounded scheduler, A4 source, JSONL telemetry, compatibility and criterion mapping | direct |
| TP draft | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/TP.md` | task, scenario and evidence mapping for AC-001 through AC-007 | direct |
| Pre-implementation Brownfield Analysis | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/BROWNFIELD_ANALYSIS.md` | pass; existing owners, reuse path, regression and live-test limits | direct |
| CD+Tests evidence | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/CD_TESTS.md` | T-001 through T-005, tests, live 10/10, telemetry and limits | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/codex-activation-matrix-adaptive-runs/CR_REPORT.md | direct |
| Task Plan Review | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/TP_REVIEW.md` | 5/5 tasks fully done; AC-001 through AC-007 | direct |
| Clean Implementation Review | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/CLEAN_IMPLEMENTATION_REVIEW.md` | primary solution, Brownfield fit, no parallel owner | direct |
| QA Report | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/QA_REPORT.md` | QA pass decision and limits; Approval: QA recorded | direct |
| OR | `.agdf/control/artefacts/codex-activation-matrix-adaptive-runs/OR.md` | completed run, approvals, risks and next step | direct |

## Closeout

- next_allowed_action: Delivery-Closeout als Git-Handoff erstellen; Commit, Push, PR und Veröffentlichung nur bei gesonderter ausdrücklicher Anweisung.
- quality_outlook: QA und UAT freigegeben; keine zusätzliche Qualitätskorrektur für diesen Slice festgestellt.
