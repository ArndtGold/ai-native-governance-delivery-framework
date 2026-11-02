# Brownfield Analysis: Run overview and worktree convention

Decision: pass
Status: done
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Date: 2026-10-31
Owner: Codex

## Run and approved basis

- run_id: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
- current_revision: 3716b5e5-9a32-4a4a-9033-ce5e10805c56
- scope: approved PRD/SD/TP; Run-based Cockpit, end new mandatory backlog maintenance, normative worktree convention.
- approved_prd: sha256:f07e94c8b4f1580749794e3e3ef129aef42d387c14465aefb01f88ac24a0d057
- approved_sd: sha256:47420849b40b40d8601c57bb77e9030d1fd922b5729c4148db5346ef583f0a96
- approved_tp: sha256:c459a2c031a7b536655f10d86d8940565f103ac06fc4d7ba41e68d92907f211e
- baseline: 8e57078d2a7cbe0f8c071d1c27eac8e0c0a14f52; assigned branch agdf/run-overview-worktree-convention.
- execution_checkout: .agdf/worktrees/run-overview-worktree-convention
- reviewer: Codex, source analysis/self-review; no independent-review or implementation-pass claim.

All typed authoring-input pages were consumed with exact source digests, including completed Brownfield Review and ready UX analysis. Approved criteria/design/task decisions remain authoritative. This is implementation preparation; the existing structured_delivery route is retained, not selected again.

## Existing-system view and coverage

| Area | Coverage and reuse | Actual source evidence and impact |
|---|---|---|
| Run inventory | fully_done for shared saved-state semantics; extend scoped adapter | run-inventory-reader.js calls discovery once and run-inventory.js owns attention, lifecycle, title/activity/order. Do not duplicate its rules in UI or evaluate all Runs. |
| Overview and detail | partially_done; replace default scope, preserve detail | cockpit.js default snapshot calls backlogScope; selected detail already evaluates exact Run but also reads backlog saved summary. Remove ordinary legacy read; preserve current source/seal/evaluation boundaries. |
| New mutation | not_done; refactor existing owners | run-backlog-writer.js locks Run then MASTER_BACKLOG, computes projection and globally blocks other pending journals. run-steps.js additionally requires backlog path, performs upsert/archive planning and summary capture. Approval and recording call these owners. New operations need existing Run locks/transaction with backlog null. |
| Source revision | not_done; extend existing revision owner | run-revision.js withRevisionLocks validates/locks backlog, apply reads/writes its row and reopening plans projection. Remove new live backlog dependency while retaining exact source history and transactional validation. |
| Recovery | partially_done; preserve and specialize | run-step-transaction.js already accepts null backlog in versions 1-5 and validates original captured fields/commit point. Public recovery and boundedRecover currently always lock backlog. Run-only recovery can avoid that lock; recorded legacy responsibility still needs explicit original recovery and conflict guards. |
| Setup and control | not_done; refactor authoritative checks | required-files.js requires MASTER_BACKLOG; doctor.js and delivery-map.js consume its pointers/vocabulary. Initialization/scaffold seed it. Replace current control relationship uses with Run/source owners, preserving actual missing-source/SoT/graph checks. |
| Transport/UI | partially_done; extend existing scopes | Existing session, resource, HTTP/MCP and desktop/compact owners are reusable. Pair v2 envelope/resource and add explicit legacy scope; retain exact selectors, denial behavior and stale/failure recovery. |
| Worktree guidance | not_done; update normative source/references | task-target-resolution and linked repository-context owners are existing boundaries. Primary ownership/reuse/ignore are a process rule, not new orchestration or branch/HEAD locks. |
| Tests | partially_done; extend existing suites | run-backlog-writer tests currently assert projection/repair, Cockpit tests assert backlog default. Keep unrelated safety assertions; replace obsolete outcome expectations and retain old transaction checkpoint fixtures for explicit recovery. Add PRD-derived regression/negative assertions before relevant implementation. |

## Reuse, ownership and minimal clean path

Follow approved T-001 through T-012: first split ordinary Run writing from captured legacy recovery at existing owners, then remove setup/evaluation prerequisites, then adapt bounded inventory, paired transport and shared UI, followed by canonical documentation/projections and evidence. Keep one assigned writer and serial targeted checks. No second index/cache/evaluator/store or migration service is needed. Existing same-Run expected revision, operation UUID/request replay, material/source exactness, seal, archive and receipt ownership are protected.

The UI's shared rows/filtering should consume the pure inventory contract; App/Compact orchestration must retain request generations and coherent snapshots rather than deriving policy while rendering. Existing legacy parser/title enrichment stays confined to explicit legacy mode. Run-ID grammar must match canonical discovery/selection. Current read budgets remain unchanged; quota/unknown coverage cannot become complete empty success.

The supplied template is the installed Brownfield Review format; this pre-implementation analysis uses its existing-system/ownership/risk concerns and the skill's pre_implementation_analysis output. It does not overwrite the already completed BROWNFIELD_REVIEW.md, reopen product routing or invent another user gate.

## Risks and evidence obligations

No new product/design contradiction was found. Binding choices are resolved in approved SD; implementation discovery of a material contradiction returns to its existing source owner. Preserve legacy journal v1-v5 original checkpoint proof, explicit recovery-only shared output, null-backlog recovery and independent Runs. Test absent/stale/conflicted/held-lock backlog through actual lifecycle callers, not just a helper. Preserve protected historical fixture bytes and current source checks while dropping summary-only projection checks.

TP names executable Core/CLI/protocol/package/UI and visible browser routes. Local UI installation/browser launch is an execution prerequisite, not a native observation. No suite was executed in this analysis. Required targeted and rendered proof precedes QA; exact reconciled mandatory CI precedes integration. No budgets, assertions, timing baselines or native observations may be weakened/copied to obtain green checks.

## Isolation observation

Read-only starting observation retained at /private/tmp/agdf-run-overview-start-observation.json. Feature HEAD remains 8e57078d on its assigned branch. Existing differences are this Run's control records/backlog plus the three separately authorized authoring-input repair files. The CI worktree remains on agdf/fix-copilot-release-baseline at e50f6b02afaef3f2dbd778eb6a15718e8c0b0f5c with staged compatibility facts/snapshot/docs, a host observation, request-activation manifest and Copilot baseline. This is a current observation, not proof its CI is complete. No mutation or process action was taken there. Its independent future changes must not be reset. No AGENTS.md was found by the scoped instruction-file inventory.

## Context Graph Impact

- Situation: Run-only transactions replace shared projection as normal invariant; old captured recovery remains supported.
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: T-008 updates existing graph/SoT descriptions after actual implementation; no automatic new node and no clean OR before reconciliation.
- memory_target: scope_artifact
- memory_reason: this preparation and its baseline are Run-specific; durable changed invariant belongs to existing graph/SoT owners during T-008.
- memory_refs: this analysis and approved TP T-008.

## Next Permissible Step

- decision: pass
- missing_evidence: implementation, targeted tests, rendered evidence and eventual integration proof remain required downstream; no missing architectural fact prevents preparation completion.
- required_next_step: Record this analysis/internal step through the existing typed writer and redispatch gate-check; begin T-002 only if current control permits CD+Tests.
- forbidden_until_then: feature code before accepted internal preparation, gate bypass, historical resealing, foreign CI mutation, live runtime installation, commit/push/merge/release.
