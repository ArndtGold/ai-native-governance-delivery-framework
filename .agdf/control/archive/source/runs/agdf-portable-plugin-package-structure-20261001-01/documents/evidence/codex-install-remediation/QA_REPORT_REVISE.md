# QA Report: Portable AGDF Plugin Package Structure

Status: revise
Decision: revise
Revision: 3
Date: 2026-10-01
Run: agdf-portable-plugin-package-structure-20261001-01
Owner: qa-gate (sole Quality Readiness decision owner)
Binding: same selected target; revision 20 / d1618497-589b-40ab-9b78-03153250c83c; named QA continuation; canonical gate QA; doctor pass; no run ambiguity.

## QA Gate

- decision: revise
- evidence: approved UR/PRD/SD/TP; staged Brownfield, schema/profile/path/rollback/adapter/protocol/documentation evidence; refreshed CD_TESTS, CODE_REVIEW, CLEAN_IMPLEMENTATION_REVIEW and TASK_PLAN_REVIEW. Duplicate-remediation CLEANUP.json and INVARIANTS.json preserve canonical source/approval hashes; ten fresh verification groups (eight affected package/runtime groups plus Compatibility recording/community-health); exact normal three-package archives and unpacked resource/profile checks pass.
- missing_evidence: none required for this approved scope. Native four-host recognition, Windows observations and whole-root smoke remain explicitly unverified/not claimed under the existing evidence boundaries. The unrelated deleted startup test and other supplemental files remain outside the authorized five-module remediation.
- risks: repository/package/deterministic fixture evidence does not establish fresh-host support or active installation. No publication or VCS action is authorized by this report.
- required_next_step: human review of QA Report Revision 2; obtain exact QA approval before UAT.
- impact_codes: none newly applicable; no parallel status-card decision model.

## Consumed quality evidence

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | pass | Task Plan Review Revision 2: 10/10 fully_done; actual SCN-020 passes; native SCN-017 explicitly unverified as planned |
| Solution integrity | pass | Clean Review Revision 2: canonical source retained, ordinary generators prune derived copies, no exclusion/budget/validator workaround |
| Code quality | pass | Code Review Revision 2: four identical supplemental files and one older weaker recovery copy removed; canonical originals unchanged; affected recovery and real packed-command tests pass |
| QA decision | pass | sole qa-gate: TPR-E001 is resolved by normal actual prepack/archives/profile evidence; no applicable open normalized finding |

Actual create-agdf archive has 642 files, @agdf/cli 5, @agdf/mcp-server 9. All 15 supplemental distributed paths are absent. Actual Copilot profile is 136 files / 1274662 bytes, exactly the unchanged limit. Versions, exports and dependency identities remain stable; build-only hook templates and schema engine are excluded. Package inspection used normal npm pack with scripts enabled, including real successful create-agdf prepack.

The user explicitly authorized correction of the five named baseline files with “fix it” and “leg los”. Canonical run-recovery retains assertRecoveryOperationsTrusted; its removed copy lacked that import/call and contained no unique required behavior. Original copies are recoverable from the task-owned backup. Approved product/design/plan artefacts are unchanged.

The current Compatibility owner re-recorded 56 scenarios with no failures after the source fingerprint changed. Community-health then passed. Older revise reports and archive evidence are preserved under evidence/duplicate-remediation/PRIOR_* and the original evidence files; fresh acceptance links the new subdirectory only. The temporary archive-capture helper was corrected for lifecycle output before JSON, then normal pack repeated successfully.

Normalized findings are consumed without reclassification: CR-R001 implementation_gap/CD+Tests remains resolved by migrated-source proof; TPR-E001 evidence_gap/evidence_obligation is now resolved by fresh actual evidence. No QA/UAT human approval, OR, active installation, fresh native invocation, publication, commit, index update or push is inferred.

## Context Graph reconciliation

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-PUBLIC-PLUGIN-DISTRIBUTION; #CG-MCP-DISPATCH-ADAPTER; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: migration node/source refs and previous reviewed documentation remain correct; supplemental file removal adds no new source owner or durable architecture decision.
- memory_target: scope_artifact
- memory_reason: cleanup authorization, removed/retained hashes, package tuples and prior revise evidence are run-specific.
- memory_refs: evidence/duplicate-remediation/; this report.

## New native installation finding (supersedes the preceding pass)

User explicitly authorized npm run install:codex and its correction with fix it / leg los und fix it. The real installation failed with exit 1: expected 0.14.5+codex.local-38324453ebf0, observed 0.14.5. The new portable root manifest retains the canonical version while the local installer projects only the Codex fallback version. Earlier fixture evidence did not exercise actual root-manifest version selection. No human QA approval exists.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QA-I001 | implementation_gap | CD+Tests | open | actual Codex plugin add/list version mismatch; local-marketplace.js projects only .codex-plugin/plugin.json | Synchronize owned local root/fallback versions, preserve normalized provenance, add regression and rerun authorized local install. |

Current QA decision: revise. Required next step: correct QA-I001 inside approved compatibility/provenance tasks T-003/T-006/T-008; refresh affected reviews and QA evidence before requesting QA approval. Source/package public versions and host authority remain unchanged.
