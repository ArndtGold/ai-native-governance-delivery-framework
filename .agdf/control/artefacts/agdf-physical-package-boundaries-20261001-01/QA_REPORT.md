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


## CI repair QA follow-up — 2026-10-02

- decision: revise
- decision_owner: qa-gate
- evidence: CI_REPAIR.md; evidence/ci-repair-20261002/RESULTS.json; current CD+Tests, Code Review, Clean Implementation Review and TP Review addenda.
- current_correction: CI-001..005 are resolved implementation_gap to CD+Tests, consumed without reclassification. Canonical documentation paths, restored startup suite and legacy navigation, translation source binding, Pages logo URL and terminal routing root are repaired.
- verification: 14 successful current command groups plus the original complete npm run that passed its entire prefix/direct CLI and failed at final routing; that changed terminal npm stage and fresh-source check passed after repair. The original exit 1 remains explicit. No final full-command exit-zero or repaired remote matrix claim.
- missing_evidence: TPR-E001/E002 remain open evidence_gap to evidence_obligation; no authoritative waiver or original proof has been supplied. Repaired native Linux/Windows/Node24 and a final GitHub run remain unverified.
- risks: local targeted repair evidence cannot be presented as GitHub-hosted success.
- required_next_step: Reconcile original TPR-E001/E002 against original evidence or an explicit authoritative deviation decision; do not request Approval: QA from revise.

| Quality dimension | Current evidence |
|---|---|
| Plan coverage | 11/13 fully_done; original TPR-E001/E002 open |
| Solution integrity | pass; restored existing owners and required coverage/navigation |
| Code quality | pass; actual CI correction diff reviewed |
| QA decision | revise; qa-gate sole decision owner |

Current CI repair adds no new source owner or product behavior. Its knowledge stays in scope_artifact; existing run Context Graph/SoT reconciliation remains resolved.

## Workflow prerequisite QA refresh — 2026-10-02

Binding: qa-gate skill_continuation; revision 25 / a510d21d-8757-49a5-b343-a2a110dc3a54.

| Quality dimension | Current evidence |
|---|---|
| Plan coverage | 11/13 fully_done; original TPR-E001/E002 open |
| Solution integrity | pass; existing locks/fixtures retained; standard file-URL preload |
| Code quality | pass; actual scoped diff and canonical CR recording |
| QA decision | revise; qa-gate sole decision owner |

Decisive reason: original checkpoint/index evidence obligations remain open. Permissible next step: reconcile those obligations against original proof or the documented authoritative deviation process; do not request Approval: QA from revise.

CI-006/007 are consumed unchanged as resolved implementation_gap findings routed to CD+Tests; their actual evidence is CI_REPAIR.md and evidence/ci-prerequisites-20261002/RESULTS.json. Baseline 31602aa remote Node24 passed; Ubuntu Node22/evidence recording failed on missing MCP fixture dependencies and Windows failed at the raw-path legacy preload. The follow-up source repairs pass current local checks; corrected remote jobs await push. No full replacement npm smoke or corrected Windows success is claimed. TPR-E001/E002 remain evidence_gap / evidence_obligation / open. Existing Context Graph/SoT reconciliation remains resolved; this scope adds no product owner. The explicitly requested commit/push does not authorize QA/UAT/release.

## Real local dependency QA refresh — 2026-10-02

Binding: qa-gate skill_continuation; revision 28 / fd5569ef-94dd-44df-be46-2a1be9a341a5.

| Quality dimension | Current evidence |
|---|---|
| Plan coverage | 11/13 fully_done; TPR-E001/E002 remain open |
| Solution integrity | pass for scoped workflow order; canonical build/lock retained |
| Code quality | pass; actual diff, real installation witnesses and canonical CR recording |
| QA decision | revise; qa-gate sole decision owner |

Decisive reason: Original mandatory checkpoint/index proof obligations remain open. Permissible next step: reconcile those obligations against original evidence or the documented authoritative deviation process; do not request Approval: QA from revise.

CI-008 is consumed unchanged as resolved implementation_gap / CD+Tests. Real early installation reproduces the remote ENOENT, then preparation-before-install fixes it. The complete npm smoke command, wrapper, community and 56-case compatibility check pass in the fresh source installation. Current shared-workspace ignored generated payload drift is separately documented as a verification limitation; fresh source fingerprints/snapshot pass. The next corrected GitHub matrix is pending at this recording. TPR-E001/E002 remain evidence_gap / evidence_obligation / open; no historical evidence or approval is transferred. Existing Context Graph/SoT reconciliation remains resolved. User-authorized source commit/push grants no QA/UAT/release authority.

## Windows tar QA refresh — 2026-10-02

Binding: qa-gate skill_continuation; revision 32 / bf3f9479-cd98-4cb7-8766-1ed19fafff58.

| Quality dimension | Current evidence |
|---|---|
| Plan coverage | 11/13 fully_done; TPR-E001/E002 remain open |
| Solution integrity | pass for scoped relative archive extraction; existing owner/tool retained |
| Code quality | pass; two source callers reviewed and canonical CR recorded |
| QA decision | revise; qa-gate sole decision owner |

Decisive reason: original mandatory historical checkpoint/index evidence remains missing. Permissible next step: reconcile TPR-E001/E002 against original proof or the documented authoritative deviation process; do not request Approval: QA from revise.

CI-009 is consumed unchanged as resolved implementation_gap / CD+Tests. Complete real control-package and all three archive-consumer suites pass locally. The prior 7ecc77f remote Linux22/Linux24 and compatibility recording passed; Windows failed on GNU tar interpreting C: as a remote host, and corrected execution awaits the next push. The two source callers now use relative local archive paths; no OS test skip, runtime dependency, owner or fallback was added. Existing ignored shared-workspace generated drift is unchanged and remains unclaimed. TPR-E001/E002 stay evidence_gap / evidence_obligation / open. Existing Context Graph/SoT reconciliation remains resolved. Source commit/push grants no QA/UAT/release approval.
