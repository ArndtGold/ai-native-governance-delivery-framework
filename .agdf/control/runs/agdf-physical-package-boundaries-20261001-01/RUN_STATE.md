# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-physical-package-boundaries-20261001-01
- lifecycle: active
- revision: 23
- revision_id: 6b7e8c86-5608-495e-afc2-28d0b84a7eaf
- content_seal: sha256:7694ae5af829e69f7b027e93d0cd55b7b6970dd30ff8ce38519946add799efb1
- approval_seal: sha256:5022f0aa795629895ec393d2aa0196365a580111a785e3edb28bbc44e3aa8194
- updated_at: 2026-10-02T05:52:32.121Z
- mode: structured_delivery
- current_gate: QA
- decision: revise
- owner: agent

## Objective

Physische Core-/CLI-/MCP-Paketstruktur mit eindeutigen Verantwortungsgrenzen, kanonischer Pluginquelle und kompatiblen Paketen/Profilen erreichen.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | CI-001..005 repaired and locally verified; Code/Clean reviews pass; overall QA revise on original TPR-E001/E002 evidence obligations. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Authoritative reconciliation of original TPR-E001/E002; repaired GitHub matrix run is unverified. No QA approval can be requested from revise. |
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
| CD+Tests | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CD_TESTS.md | done | CI_REPAIR.md: npm prefix through direct CLI passed; terminal routing repaired and verified; fresh-source, community, startup and Pages pass. Full original npm exit 1 retained. |
| CR | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CODE_REVIEW.md | done | Actual CI repair diff reviewed and canonical run-step review pass recorded; CI-001..005 resolved. |
| QA | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/QA_REPORT.md | revise | CI-001..005 repaired and verified locally; original TPR-E001/E002 remain open. qa-gate sole decision owner. |
| TP Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/TASK_PLAN_REVIEW.md | done | Current consumer and test evidence refreshed; 11/13 fully_done; TPR-E001/E002 remain open evidence obligations. |
| Clean Implementation Review | .agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/CLEAN_IMPLEMENTATION_REVIEW.md | done | pass: existing canonical paths, restored mandatory coverage/navigation; no runtime or asset copies. |
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

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-NATIVE-INTERACTION-AUTHORITY, CG-TASK-TARGET-AUTHORITY and SOT_REGISTRY updated against actual owners.

## Closeout

- next_allowed_action: Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.
- quality_outlook: QA revise; 11/13 current-gate tasks fully_done; actual architecture/build/archive/isolated evidence passes; TPR-E001/E002 historical proof obligations open; no UAT/OR/release claim.
