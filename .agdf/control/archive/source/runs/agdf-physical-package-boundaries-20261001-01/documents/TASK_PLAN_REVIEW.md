# Task Plan Review: Physische Paketgrenzen

Binding: Dispatcher skill_continuation; revision 15 / e83f627d-371e-4242-b824-2d3732e6ce58; FINAL_SOURCE_BINDING.json
Reference: unchanged approved TP.md; all 13 tasks / 42 scenarios / 15 PRD criteria
Decision: revise (plan evidence dimension; qa-gate alone decides final QA)

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | partially_done | BROWNFIELD_ANALYSIS.md; IMPLEMENTATION_BASELINE.json; INDEX_PRESERVATION.json | Original index entry identities unavailable; original intermediate-stage snapshots incomplete | TPR-E001; TPR-E002 |
| T-002 | fully_done | stages/C-01_MODULES.json; FINAL_OWNER_MAP.json; CONTROL_OWNER_CHECK.json; tests/core-*.log | none | none |
| T-003 | fully_done | tests/core-boundaries.log; tests/provider-boundaries.log; profiles/RESOURCE_CLOSURE.json | none | none |
| T-004 | fully_done | CLI_CONTRACT_DIFF.json; PROVIDER_MAP.json; tests/cli-cli-modularization-test.log; ARCHIVE_CONSUMERS.json | none | none |
| T-005 | fully_done | MCP_OWNER_MAP.json; ARCHIVE_CONSUMERS.json; tests/mcp-server-*.log; ADAPTER_PARITY.json | none | none |
| T-006 | fully_done | ASSEMBLY_MAP.json; BUILD_ENTRYPOINTS.json; PACKED_MANIFESTS.json; tests/rollback-fixture.log | none | none |
| T-007 | fully_done | profiles/PROFILE_MATRIX.json; profiles/RESOURCE_CLOSURE.json; profiles/PAYLOAD_DELTA.json; tests/cli-runtime-integrity-negative-test.log | none | none |
| T-008 | fully_done | ACTIVE_REFERENCE_AUDIT.json; REPLAY_REBINDING.json; FINAL_DIFF_INVENTORY.json; tests/host-compatibility.log; tests/community-health.log | none | none |
| T-009 | fully_done | ARCHIVE_CONSUMERS.json; PACKED_OUTPUTS.json; tests/archive-consumers.log | none | none |
| T-010 | fully_done | tests/cli-lifecycle-test.log; tests/cli-local-development-install-test.log; tests/cli-mcp-lifecycle-test.log; tests/rollback-fixture.log; checkpoints/STAGED_REHEARSAL.json | none for current fixtures; rehearsal is not original timeline proof | TPR-E001 separately remains open |
| T-011 | partially_done | FINAL_TREE.txt; FINAL_DEPENDENCIES.json; BRIDGE_INVENTORY.json; FINAL_REGRESSION_MATRIX.json; CLEAN_CHECKOUT.json; FINAL_DIFF_INVENTORY.json | Original C01-C03 backup/output timeline and original per-entry index proof | TPR-E001; TPR-E002 |
| T-012 | fully_done | CD_TESTS.md; TEST_EXECUTIONS.json; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; CORE_DIFF_REVIEW.patch | none for review execution; gaps explicitly handed to QA | open findings retained |
| T-013 | fully_done | QA_REPORT.md; EVIDENCE_PLANES.json; FINAL_CRITERIA_MATRIX.json | none for current QA execution; QA/UAT approvals and OR/Closeout are conditional later work | QA revise; no approval or release inferred |

## Criterion and Scenario Coverage

FINAL_CRITERIA_MATRIX.json and TEST_EXECUTIONS.json map each approved criterion/design/task/scenario without copying new acceptance semantics. AC-001–013 implementation and current verification are done. AC-014 remains partial: SCN-037/039 cannot prove every original index identity and original C01–C03 timeline. SCN-038 is passed for the actual new isolated rehearsal only. AC-015 requires this review set and the ensuing qa-gate; no later approval is inferred.

## Summary

- fully_done: 11/13 after qa-gate execution; T-002–010 and T-012–013.
- partially_done: T-001 and T-011.
- not_done: none of the implementation tasks.
- evidence confidence: high for current source/build/archive/isolated fixtures; insufficient for original historical checkpoint/index assertions.
- out_of_scope_changes: none left in historical run/review artefacts; preserved C00 bytes verified in FINAL_DIFF_INVENTORY.json. Existing staged duplicates remain untouched.
- risks: Original C01/C02/C03 source/output checkpoints and per-entry original index identities were not captured. A new staged rehearsal cannot be represented as historical execution evidence.
- required_next_step: Reconcile TPR-E001/E002 through the concrete proposed EVIDENCE_RECONCILIATION.md decision; QA_REPORT.md records revise.

## Normalized Findings

Classification and routing use the supplied quality Runtime Contract, Normalized Review Gaps; no local route mapping.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-E001 | evidence_gap | evidence_obligation | open | TP checkpoint obligation; original C01–C03 snapshots unavailable; checkpoints/STAGED_REHEARSAL.json is explicitly fresh rehearsal | Reconcile the original checkpoint obligation against available original evidence or obtain an explicit authoritative decision on the documented deviation; do not treat the rehearsal as original snapshots. |
| TPR-E002 | evidence_gap | evidence_obligation | open | INDEX_PRESERVATION.json; binary index changed; original per-entry staged recovery OID not separately recorded | Reconcile the original index-identity obligation against original per-entry evidence or obtain an explicit authoritative decision on the documented proof limit; do not reset or reconstruct the live index. |

## UX Intent Fidelity

PRD preserves existing CLI/report/interactions rather than introducing a new UI or product mode. Visible command/output contracts are covered by actual CLI, localized presentation and archive tests; no new UX intent or native-host behavior is claimed.

The missing priorities in these procedural evidence obligations are not fabricated as P0/P1; every open normalized finding nevertheless prevents QA pass under the supplied quality contract.

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md; docs/architecture/package-structure.md
- memory_target: scope_artifact
- memory_reason: Findings and test observations are bound to this run; architecture owners are already curated in existing registry/nodes.


QA execution supplement: the bound qa-gate continuation at revision 17 produced QA_REPORT.md with revise. T-013 is fulfilled for the current permitted quality assessment; no conditional future approval or OR was performed. T-001/T-011 and their findings remain unchanged.

Final index observation: evidence/FINAL_STAGED_ENTRIES.json records the original five staged duplicate paths plus 28 additionally observed staged documentation deletions. No staging/reset was performed by this migration; attribution is unavailable and the live index is preserved. This observation is not a migration-owned deletion or proof of the original per-entry index identity. Current source/approved artefact SHA256 bindings remain unchanged.


## CI repair follow-up — 2026-10-02

Current correction evidence: CI_REPAIR.md and RESULTS.json. T-008 consumers and normative navigation/source binding repaired; T-010 bounded startup/consent coverage restored; T-011 fresh current-source verification now explicitly covers npm entrypoints, community and startup; T-012 actual repair diff reviewed. Relevant scenarios SCN-028/029/035/040 refreshed with current evidence. T-001 and T-011 remain partially_done on TPR-E001/E002, not waived by green tests; overall 11/13 tasks fully_done, 2 partially_done. No approved acceptance or plan change.

All five CI findings are consumed as resolved implementation_gap to CD+Tests from CI_REPAIR.md; original TPR-E001/E002 remain evidence_gap to evidence_obligation, open.
- required_next_step: Reconcile original TPR-E001/E002 before QA can pass.

## CI prerequisites plan evidence refresh — 2026-10-02

Dispatcher revision 23 / 6b7e8c86-5608-495e-afc2-28d0b84a7eaf. T-008/T-012 current CI consumer/review evidence extends to the locked MCP prerequisite and actual legacy preload cases in CI_REPAIR.md. Coverage remains 11/13 fully_done; T-001/T-011 remain partial. TPR-E001/E002 classifications, routing and open status are unchanged. CI-006/007 are resolved implementation_gap findings routed to CD+Tests, with corrected remote execution still pending. No historical obligation is satisfied by the fresh test or current index proof.

## Real dependency installation plan evidence refresh — 2026-10-02

Dispatcher revision 26 / 2f7a1a4b-19f9-4d87-9150-6f09b86a580e. T-008/T-012 consumer evidence now includes actual registry-backed locked installs and a complete npm smoke exit 0. The earlier dependency-copy fixture proof did not cover this install-before-build failure. CI-008 is resolved implementation_gap / CD+Tests; corrected remote execution remains pending. Coverage remains 11/13 fully_done; T-001/T-011 remain partial and TPR-E001/E002 remain evidence_gap / evidence_obligation / open. The fresh proof does not recreate historical checkpoints or original index identities.

## Windows archive plan evidence refresh — 2026-10-02

Dispatcher revision 29 / 4152a430-724b-46d3-82c5-74b64dc6a38d. T-009/T-012 actual archive consumer evidence is refreshed in CI_REPAIR.md. CI-009 is resolved implementation_gap / CD+Tests; corrected Windows result remains pending. Plan coverage remains 11/13 fully_done; T-001/T-011 partial. TPR-E001/E002 remain evidence_gap / evidence_obligation / open; current Windows or archive evidence cannot satisfy missing original checkpoint/index proof.
