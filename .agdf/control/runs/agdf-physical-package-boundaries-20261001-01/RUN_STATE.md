# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-physical-package-boundaries-20261001-01
- lifecycle: active
- revision: 33
- revision_id: ecfb6709-3fd3-40dd-ad24-74b97f6f25eb
- content_seal: sha256:01b11100ce30cb439a69e2d82da43032d36c40f59c0a1e1715d4799582a97f5d
- approval_seal: sha256:5022f0aa795629895ec393d2aa0196365a580111a785e3edb28bbc44e3aa8194
- updated_at: 2026-10-02T07:29:43.468Z
- mode: structured_delivery
- current_gate: QA
- decision: revise
- owner: agent

## Objective

Physische Core-/CLI-/MCP-Paketstruktur mit eindeutigen Verantwortungsgrenzen, kanonischer Pluginquelle und kompatiblen Paketen/Profilen erreichen.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | CI-008 remote Linux22/Linux24 and compatibility recording passed; Windows tar CI-009 repaired and affected real archive suites pass locally. QA revise on original TPR-E001/E002. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Authoritative reconciliation of TPR-E001/E002; corrected Windows/matrix execution awaits push. Existing ignored generated workspace drift remains unclaimed. |
| What is the next allowed action? | Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report. |
| What is explicitly forbidden right now? | request QA approval; request UAT approval; release; claim delivery readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-01 · revision 2 · `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/UR.md` sha256:aba2ef0c688ce144 · presentation b29a598e-24f7-43f4-8e5a-170787aaee83 sha256:2a2a238e029629c382c2e75732c9b53f7623826e1236ee12870ab5d857dff5dd |
| PRD | approved | `Approval: PRD` · 2026-10-01 · revision 6 · `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/PRD.md` sha256:bb6bf85cbce2777d · presentation ed7918c1-7e15-47d6-9a8e-2a742a28fb57 sha256:b72cc6eab3bcd73eac7a4af74f4762c947574d70639accda15c47ed0d232a5df |
| SD | approved | `Approval: SD` · 2026-10-01 · revision 10 · `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/SD.md` sha256:b80f0b29b480f278 · presentation de242a67-852e-4f31-a5d1-3d94c0f0dacd sha256:6f6f285dda7d4a4989741b170cf471382cc24ab594b31e0cce32f08c702ead22 |
| TP | approved | `Approval: TP` · 2026-10-01 · revision 12 · `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/TP.md` sha256:d0ac7ba82b9451c2 · presentation a7b8f920-3901-4379-b6d1-488dbac6d979 sha256:438d5c5c7864573df2b681a8c4edc44b980ef2a7e544983dee0f495e911415fa |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/PRD.md` | approved | Kriterien AC-001–015; Produktentscheidungen aus genehmigter UR beantwortet. |
| SD | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/SD.md` | approved | criteria-chain-v1; SDD-001–012; AC-001–015 vollständig zugeordnet; optionale Profilabweichungen ausdrücklich vorgelegt |
| TP | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/TP.md` | approved | criteria-chain-v1; T-001–013; SCN-001–042; alle AC-/SDD-Zuordnungen vollständig |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis; pass; source/index/checkpoint boundary and existing owners bound |
| CD+Tests | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CD_TESTS.md | done | CI-009: complete control package/three archive consumers pass with relative tar argv; prior Linux22/24 remote pass; corrected Windows pending. |
| CR | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | done | Actual two tar caller diff reviewed and canonical run-step pass recorded; source-wide caller audit complete. |
| QA | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/QA_REPORT.md | revise | qa-gate refresh: CI-009 repaired locally; TPR-E001/E002 unchanged; corrected Windows execution pending. |
| TP Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/TASK_PLAN_REVIEW.md | done | Archive consumer evidence refreshed; 11/13 fully_done; original proof obligations unchanged. |
| Clean Implementation Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CLEAN_IMPLEMENTATION_REVIEW.md | done | pass: portable relative tar extraction; no platform skip, parallel archive engine or runtime dependency. |
| Evidence Reconciliation | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/EVIDENCE_RECONCILIATION.md | draft | Concrete proposed deviation decision; no waiver or approval recorded. |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: architecture_runtime_depth: Core, CLI-Komposition, MCP-Fassade und Offline-Runtime erfordern gemeinsam mit Paket- und Profilverbrauchern einen kompatiblen Cutover; release_cross_host_depth ist ebenfalls belegt. structured_slice abgelehnt: lokale Umbenennung erfüllt die genehmigte physische Trennung und Verbrauchermigration nicht.
- evidence: .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-01 · revision 2 · `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/UR.md` sha256:aba2ef0c688ce144 · presentation b29a598e-24f7-43f4-8e5a-170787aaee83 sha256:2a2a238e029629c382c2e75732c9b53f7623826e1236ee12870ab5d857dff5dd |
| PRD | derived_from | UR | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/PRD.md` §§1–11 überführen die genehmigte UR und BROWNFIELD_REVIEW in Kriterien AC-001–015; keine Änderung des genehmigten PRD-Inhalts. |

| SD | derived_from | PRD | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/SD.md`; genehmigtes PRD unverändert; §7 ordnet AC-001–015 genau einmal zu |

| TP | derived_from | SD | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/TP.md`; genehmigte PRD/SD-Hashes unverändert; 13 Tasks und 42 Szenarien decken AC-001–015 samt ihren SDD-Zuordnungen ab |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| PRD draft | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/PRD.md` | Zielbaum, Kriterien AC-001–015 und beantwortete Produktentscheidungen | direct |
| UR draft | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |

| Solution Design | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/SD.md`; `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/SD_MODULE_OWNERSHIP.json` | Architektur, 203 modulbezogene Zielzuordnungen, private Core-Assembly, Provider-/Profilgrenzen; nur Design, keine Umsetzung | source inspection / design |

| Task/Test Plan | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/TP.md`; `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/TP_SOURCE_BINDING.json`; `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/TP_TEST_INVENTORY.json` | Stufen, Rückweg, konkrete Regression-/Archiv-/Offline-/Lifecycle-/Kriteriennachweise; nur Planung, keine Umsetzung | source inspection / plan |

| Implementation preparation | `.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/BROWNFIELD_ANALYSIS.md`; evidence/IMPLEMENTATION_BASELINE.json; evidence/checkpoints/C-00.json | approved TP reuse path, unchanged 203-module source map, actual source backup and preserved index | direct |
| Code Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | decision pass: CODE_REVIEW.md; actual C00 diff, Core owner graph, three archive consumers and 82 final regressions; TPR evidence obligations remain open | direct |
| Code Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | decision pass: CI-001 through CI-005 resolved; actual repair diff reviewed; npm prefix, corrected terminal routing, fresh-source, community, startup and Pages evidence in CI_REPAIR.md. | direct |
| CI repair 2026-10-02 | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CI_REPAIR.md; .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/ci-repair-20261002/RESULTS.json | CI consumer/test path repairs; fresh-source and local npm stages; original remote failure and full npm exit preserved | direct |
| Code Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | decision pass: CI-006/007 resolved through actual locked dependency ordering and file-URL preload; negative contracts and real process suite pass locally; corrected remote platform execution remains pending; original TPR-E001/E002 remain open. | direct |
| CI prerequisites 2026-10-02 | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CI_REPAIR.md; .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/ci-prerequisites-20261002/RESULTS.json | Actual pushed baseline failures; workflow prerequisites and preload URL; local positive/negative test evidence | direct |
| Code Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | decision pass: CI-008 resolved: actual locked npm ci reproduces unprepared CLI-copy ENOENT; preparation-before-install fixes it; complete npm smoke and fresh wrapper/community/compatibility checks exit 0. Corrected remote jobs pending; original TPR-E001/E002 remain open. | direct |
| Real dependency CI repair | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CI_REPAIR.md; .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/ci-local-dependency-20261002/RESULTS.json | Three remote failures, real npm installation negative/positive and complete smoke exit 0; original gaps preserved | direct |
| Code Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | decision pass: CI-009 resolved: both tar callers use local relative argv/cwd, peer separators normalized; complete real control-package and three archive consumers pass. Previous remote Linux22/Linux24 passed; corrected Windows run pending; TPR-E001/E002 unchanged. | direct |
| Windows tar CI repair | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CI_REPAIR.md; .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/ci-windows-tar-20261002/RESULTS.json | Actual GNU tar drive-letter failure, both relative callers and real archive suite passes | direct |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-NATIVE-INTERACTION-AUTHORITY, CG-TASK-TARGET-AUTHORITY and SOT_REGISTRY updated against actual owners.

## Closeout

- next_allowed_action: Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.
- quality_outlook: QA revise; 11/13 current-gate tasks fully_done; actual architecture/build/archive/isolated evidence passes; TPR-E001/E002 historical proof obligations open; no UAT/OR/release claim.
