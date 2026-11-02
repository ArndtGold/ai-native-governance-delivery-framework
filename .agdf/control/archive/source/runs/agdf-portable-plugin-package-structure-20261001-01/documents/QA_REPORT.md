# QA Report: Portable AGDF Plugin Package Structure

Status: pending
Decision: pending
Revision: 4
Date: 2026-10-01
Run: agdf-portable-plugin-package-structure-20261001-01
Owner: qa-gate (sole Quality Readiness decision owner)
Binding: named QA continuation; revision 26 / 9651f34d-54dd-4bd9-925b-416fa6e8cf3b; same target; QA; doctor pass.

## Snapshot superseded by discovery repair

Revision 4 below records the earlier source/install snapshot only. A subsequent native discovery defect (QA-I002) showed that the recognized portable root ignored the fallback MCP declaration. The repaired source and local installation are evidenced in `evidence/codex-mcp-discovery-remediation/REMEDIATION.md`. Its current Quality Readiness decision is pending qa-gate revalidation; the earlier pass is not current acceptance for this new diff. No QA approval exists. The original report is preserved unchanged in that evidence directory.

## Historical QA Gate

- decision: pass
- evidence: unchanged approved UR/PRD/SD/TP; prior staged migration and duplicate cleanup evidence; fresh CD_TESTS and Code/Clean/TP Review Revision 3; eight passing package/runtime verification groups, normal real three-package archives and unpacked integrity/inventory/resource/entrypoint checks, current compatibility 56/0 and community-health pass; authorized npm run install:codex exits 0 and independent installed/enabled list plus installed integrity pass.
- missing_evidence: none required for the approved package/correction scope. Fresh session/model behavior, hooks discovery/trust/execution, other native hosts, Windows and unrelated whole-root smoke remain unverified and are not claimed.
- risks: native local installation/registration is evidence for that operation; it does not establish a restarted live host session. The installer requires host restart/fresh session. No publication or VCS operation is authorized by this report.
- required_next_step: human review of QA Report Revision 4; prepare its presentation binding before requesting exact Approval: QA.
- impact_codes: none newly applicable; control authority and status-card decision model unchanged.

## Consumed quality evidence

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | pass | 10/10 tasks fulfilled; T-003/T-006/T-008 compatibility/provenance correction; user additionally authorized active installation; fresh affected checks/archive proof |
| Solution integrity | pass | existing marketplace/provenance/integrity owners fix production root selection; no parallel source/acceptance/control owner or validator bypass |
| Code quality | pass | exact correction diff reviewed; source hashes unchanged despite externally created commits; root/fallback identity enforced; non-version fields remain hash-bound; idempotence/recovery/negative fixtures pass |
| QA decision | pass | sole qa-gate; QA-I001 resolved by actual installed local identity and fresh evidence; prior CR-R001 and TPR-E001 remain resolved without reclassification |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QA-I001 | implementation_gap | CD+Tests | resolved | evidence/codex-install-remediation/INSTALLED.json; CHECKS.json; PACKED_OUTPUTS.json; installed root/fallback 0.14.5+codex.local-d4ca33a48e88; actual installed integrity passes | retain corrected production projection and regression evidence |

Canonical generated/public/package and Claude versions remain 0.14.5. Normal archives contain 642/5/9 files, all exports and dependencies resolve, no removed supplemental module or build-only hook template appears. Copilot inventory hashes/sizes match actual unpacked contents: 136 files / 1274994 bytes. Its existing shared provenance owner grows by exactly 332 bytes; the recorded ceiling adds only that measured delta, no duplicate files/headroom. Prior duplicate-remediation results remain valid for their earlier snapshot.

Prior QA pass and newly observed native failure are preserved in evidence/codex-install-remediation/PRIOR_QA_REPORT.md and QA_REPORT_REVISE.md. Archive reporting needed a task-owned npm cache and Python 3.9 extraction/JSON decoding adjustments; normal production packing succeeded. These reporting corrections are distinct from the fixed native installation defect.

No QA/UAT approval, OR, release or fresh-model-session acceptance is inferred.

## Context Graph reconciliation

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-PUBLIC-PLUGIN-DISTRIBUTION; #CG-MCP-DISPATCH-ADAPTER; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: reusable local_portable_version_projection_20261001 invariant added to existing distribution node, docs/architecture/package-structure.md updated, current compatibility/community-health pass.
- memory_target: scope_artifact
- memory_reason: exact installation/cache/archive tuples and new failure/correction logs are run-specific.
- memory_refs: evidence/codex-install-remediation/; this report.
