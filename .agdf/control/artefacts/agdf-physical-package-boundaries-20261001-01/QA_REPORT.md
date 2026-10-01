# QA Report: Physische Core-/CLI-/MCP-Paketstruktur

Run: agdf-physical-package-boundaries-20261001-01
Binding: qa-gate skill_continuation; revision 17 / bf55a637-d87b-4287-a7df-2a8ac91070c7
Source: evidence/FINAL_SOURCE_BINDING.json; unchanged approved PRD/SD/TP

## QA Gate

- decision: revise
- evidence: BROWNFIELD_ANALYSIS.md; CD_TESTS.md; TASK_PLAN_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; evidence/FINAL_REGRESSION_MATRIX.json; evidence/TEST_EXECUTIONS.json; evidence/FINAL_CRITERIA_MATRIX.json; evidence/ARCHIVE_CONSUMERS.json; evidence/FINAL_OWNER_MAP.json; evidence/REPEAT_BUILD_DIFF.json; evidence/CLEAN_CHECKOUT.json; evidence/checkpoints/STAGED_REHEARSAL.json; evidence/FINAL_DIFF_INVENTORY.json.
- missing_evidence: Original C01–C03 source/output checkpoint records and full original per-entry staged index binding remain unavailable. The current isolated rehearsal and non-mutating index audit cannot prove the original implementation timeline or every original entry identity.
- risks: The current architecture, outputs and tested recovery paths are evidenced; historical process proof is incomplete. The two open evidence findings prevent QA pass under the supplied quality contract. A changed binary index must not be “repaired” by overwriting unowned staged state.
- required_next_step: Reconcile the two evidence obligations through the concrete proposed EVIDENCE_RECONCILIATION.md decision, without transferring an old approval or fabricating historical proof.
- impact_codes: migration/package/evidence scope; no new Quality Contract rule or parallel decision owner.

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | revise; 11/13 current-gate tasks fully_done; T-001/T-011 partially_done | TASK_PLAN_REVIEW.md; TPR-E001/E002 |
| Solution integrity | pass evidence dimension | CLEAN_IMPLEMENTATION_REVIEW.md |
| Code quality | pass evidence dimension | CODE_REVIEW.md; mandatory CR recorded with run-step review |
| QA decision | revise; qa-gate is sole decision owner | Open normalized evidence obligations prevent pass; next action is the concrete evidence-deviation decision |

The projection above describes this report's inputs; operational status and approval orientation remain gate-check/interaction owned. QA/UAT approvals are missing, and no QA approval question may be requested from this revise report.

## Criteria and Actual Target Tree

The repository physically owns plugins/agdf, packages/core, packages/cli, packages/mcp-server, docs, evals and scripts. Old create-agdf/agdf/agdf-mcp-server active source roots and temporary migration bridges are absent. Private Core contains 73 canonical modules with no external dependencies, CLI/MCP/backimports, package cycles or process/network implementations. Shared control writer, seal, locks and transactional state owner are retained. CLI composes platform/host/Git/runtime providers; MCP owns SDK, stdio and worker adaptation.

AC-001–013 are evidenced by the current implementations and tests. AC-014 remains partial because its historical checkpoint/index obligation lacks original proof. AC-015 is fulfilled for executed mandatory reviews, honest QA reporting and evidence-plane separation; later QA/UAT approval and OR/Closeout requirements remain conditional and unperformed. All 42 scenarios have actual evidence mappings, including partial SCN-037/039; a planned filename alone is never counted as evidence.

## Tests, Profiles and Packages

- 82/82 existing checks pass in final aggregate: the full sequential matrix was 77/82; six targeted affected reruns passed after corrections. Original failed exits and targeted method are retained, not represented as one clean full pass.
- Root normal build/pack and three real npm archive consumers pass outside checkout and workspace links. Public names remain create-agdf, @agdf/cli and @agdf/mcp-server; public exports/bins and Node >=22 are preserved; no private Core registry or file/workspace production dependency leaks.
- Actual archived MCP server negotiates 2025-11-25 and 2026-07-28, lists both tools and performs real dispatch/inspect with matched provenance. Identical explicit target/run doctor reports match CLI, excluding only checked_at; adapters remain authorizes:false.
- Both offline profile closures load contracts outside checkout with network/non-Node processes/npm unavailable; malformed/missing resource, version, module, provider and provenance inputs remain rejected.
- Actual clean current-source fixture starts without generated/dist/node_modules, uses exact bundled dependency files, verifies import-only generation has no writes, and builds profiles/assembly/Core successfully. Repeat actual build is byte-identical across derived resources/runtime/assemblies.
- Copilot changes from 136 files / 1,275,270 bytes to 152 / 1,293,465: exactly +16 files / +18,195 bytes, documented by actual inventories. Baseline has no reserve; existing guard and forbidden installer/SDK/duplicate-contract checks remain active.
- Source/public profiles remain skills-only; Codex has root mcp.json stdio, Claude its declared profile path; Copilot and OpenCode preserve approved profile responsibilities. Current host compatibility fixtures and deterministic evals were run; old native/model observations were not transferred.
- Isolated install/update/repair/disable/cache/consent/ownership and canonical recovery/seal/lock cases pass. Actual pre-publish failure and bounded source/output restoration checks pass; original C01–C03 checkpoint omission remains open.

## Normalized Findings Consumed

Classification and routing are unchanged from TASK_PLAN_REVIEW.md, as required by the supplied quality contract.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-E001 | evidence_gap | evidence_obligation | open | Original stage checkpoints unavailable; fresh rehearsal explicitly differs in evidence plane | Reconcile the original checkpoint obligation against available original evidence or an explicit authoritative decision on the documented deviation. |
| TPR-E002 | evidence_gap | evidence_obligation | open | INDEX_PRESERVATION.json records the unavailable original per-entry proof and observed binary drift | Reconcile the original index obligation against original evidence or an explicit authoritative decision on the documented proof limit; preserve the live index. |

## Evidence Planes and Scope

Source, actual builds, archives, isolated lifecycle and real local MCP protocol behavior are verified. Native Codex/Claude/Copilot/OpenCode migration behavior, a fresh model session, Windows and Node24 native behavior are unverified. No real host installation, registry publication, VCS staging/reset/commit/push, UAT or closeout was performed. Registry-bootstrap is explicitly not applicable to this offline migration scope, with normal archive consumers separately evidenced. Existing old runs/reviews remain byte-identical to their actual C00 source; approved PRD/SD/TP bytes remain unchanged.

## Context Graph and SoT

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md; docs/architecture/package-structure.md; evidence/FINAL_OWNER_MAP.json
- memory_target: scope_artifact
- memory_reason: Current proof and open deviations belong to this run; existing SoT/Graph owners carry durable physical ownership.

The decision is revise because open mandatory evidence obligations remain, not because a failing package/build or missing current source owner is hidden. Neither this report nor a structural/code pass waives the approved plan.

Final index observation: evidence/FINAL_STAGED_ENTRIES.json records the original five staged duplicate paths plus 28 additionally observed staged documentation deletions. No staging/reset was performed by this migration; attribution is unavailable and the live index is preserved. This observation is not a migration-owned deletion or proof of the original per-entry index identity. Current source/approved artefact SHA256 bindings remain unchanged.
