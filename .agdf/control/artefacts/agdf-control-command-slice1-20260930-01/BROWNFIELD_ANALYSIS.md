# Brownfield Analysis: One Explicit Approval-Recording Command

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery
- scope: Approved TP tasks T-001 through T-009, PRD AC-001 through AC-009, SD SDD-001 through SDD-011.
- current_coverage: partially_done; current approval validation, gate policy, presentation, revision guard, owned lock and atomic writer exist; operation receipts, explicit replay contract and public package entry do not.
- reuse_strategy: Refactor the existing approval preparation once for legacy and explicit consumers; extend the current parser/seal/writer and package pipeline; move shared context to runtime ownership; introduce only the approved facade/composition and contract/receipt helpers.
- evidence: BASELINE.json; BASELINE_TESTS.json; run-recording.js, run-state-writer.js, run-state-parser.js, run-seal.js, run-presentation.js, run-revision.js, run-recovery.js; gate-check.js/gate-policy.js; CLI parser/registry/handlers/context; package exports and sync-plugin-runtime.js.
- transparency: TP is approved; this is the mandatory implementation-preparation analysis. No later approval or quality decision is inferred.
- missing_evidence: New-command/process/package execution and native Linux/Windows/installed/live-host qualification remain to be collected; the cooperative assurance ceiling remains explicit.
- required_next_step: Implement the approved command and dependency boundary, then execute the TP scenarios before mandatory CR and QA.

## Existing owners and minimal implementation

`run-recording.js` remains the approval application owner. Extract its validated candidate construction so neither CLI nor public API reproduces policy. The command holds `withRunLock` through receipt lookup and current validation, and writes once using `writeRunLocked` with the selected revision UUID. Receipt evidence belongs to the same Run and extends the existing approval seal only when the new section exists; receipt-free seal behavior is preserved.

The ordinary approval writer and bounded PRD supersession both use `allowApprovalChange`; recovery has its own locked writer and resets effective approvals. All must preserve existing receipt evidence; only the selected command may append a validated new receipt. Recovery must reject unverifiable receipt evidence even when legacy approval recovery would otherwise be possible. Existing pending Run-step transactions remain blocking and their journal is not an approval receipt.

Shared locale/configured-language dependencies currently reach `cli/runtime-context.js` from gate evaluation, delivery-map and presentation rendering. Move shared context to the approved runtime owner and retain CLI re-exports; adapters own parsing/printing. CLI/API use the same local Git-observation composition. Public imports cannot initialize installer or MCP services, inspect a user Run, spawn or write. Package-local metadata/locale resources retain the existing canonical sources and synchronization owner.

## Regression and baseline

Baseline commit: `15af7ff6e2133fdb1707db7711355014521f1c7a`; platform macOS, Node 22.22.3; package 0.14.5. Exact dirty paths and hashes are recorded in BASELINE.json. Existing dirty backlog/architecture documents are unrelated and must not be reset, edited or claimed as this Run's changes.

Baseline run-lock, run-revision, run-recovery, cli-gate-scenarios and control-state tests passed. cli-modularization-test fails before implementation at the architecture document assertion requiring the old MCP wording; `/tmp/agdf-command-baseline/cli-modularization.log` records the exact failure. This is a named concurrent documentation mismatch, not a source regression or permission to weaken the assertion. Track its unchanged status separately and use isolated, explicitly identified document fixtures for any source-only regression claim. No clean whole-repository suite claim is permitted while this mismatch remains.

## Reuse and parallel-structure risk

| Finding | Classification | Resolution |
|---|---|---|
| CLI and API could separately decide eligibility or construct approvals | problem | Both use the same approved application service and runtime composition; test actual call paths and outcomes. |
| Separate receipt file could disagree with a committed approval | problem | Receipt and approval commit in the same canonical Run file; no authoritative sidecar. |
| Cooperative host cannot independently prove human visibility/decision | trade-off | Rationale: approved product ceiling; owner: Arndt Gold; mitigation: explicit assurance and stronger-claim rejection; exit: independently verified authority requires a separately approved scope before any stronger claim. |
| Current package contains distribution and runtime responsibilities | trade-off | Rationale: retain compatible package names while proving the additive API boundary; owner: package/runtime owner; mitigation: enforce dependency/resource closure and external tarball execution; exit: reassess physical extraction after this boundary is qualified, before a new consumer requires separate distribution. |

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing Run-state and adapter ownership retained; this analysis links them. Any implementation-time ownership change must update the existing node, not create a parallel register.
- memory_target: scope_artifact
- memory_reason: Baseline, bounded reuse plan and qualification limits belong to this Run; no personal-memory update is authorized.
- memory_refs: BROWNFIELD_ANALYSIS.md; BASELINE.json; BASELINE_TESTS.json
