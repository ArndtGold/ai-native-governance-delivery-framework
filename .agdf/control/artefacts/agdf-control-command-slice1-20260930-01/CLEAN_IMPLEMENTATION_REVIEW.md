# Clean Implementation Review: Explicit Local Approval Command

Status: done
Date: 2026-10-01

## Clean Implementation Review

- decision: pass
- primary_solution: The explicit service orchestrates the existing approval application, policy/presentation and Run writer under one owned Run lock. The canonical Run owns both effective approval and protected historical receipt. CLI and public ESM composition share the same evaluator and local Git observation.
- evidence: Actual changed production modules and neighboring read/presentation/revision/recovery/Run-step writers reviewed; SOURCE_IDENTITY.json; CD_TESTS.md; final source/process/package and MCP evidence in EXECUTION_EVIDENCE.json; review-consumer.json.
- fallbacks_retained: Legacy run-approve without operation remains the explicitly approved compatibility lane; shared CLI context re-exports preserve imports; absent receipt section retains exact v1 seal. No receipt backfill or inferred idempotency. These remain until a separately approved breaking-version change, not until a hidden migration.
- workaround_or_shim_risk: None open. Failure branches inspect the canonical destination rather than treating an exception as no effect. Safe retry/unknown-owner instructions are explicit. Guards enforce the approved contract. Private checkpoint/flush dependencies exist only below the public facade and never replace canonical policy. Test-only native rename preload stays in a disposable legacy fault fixture.
- parallel_structure_risk: None identified. No sidecar receipt ledger, second policy, identity registry, metadata source or runtime package. Presentation records and pending Run-step journal retain their existing distinct purposes; neither is adopted as an approval receipt.
- brownfield_fit: prepareGateApproval extracts existing validation/candidate construction; writer enforces append/preservation across every approval-changing path including legacy, PRD supersession and recovery. Shared locale/metadata context moves to runtime ownership; adapters retain parsing/printing. Package synchronization and MCP provenance inventory are updated in their canonical owners; generated copies are qualified in isolated snapshots.
- missing_evidence: None required for this selected source/packed/generated macOS slice. Installed new behavior, native Linux/Windows, actual human visibility and independent human proof are absent and excluded from pass claims.
- required_next_step: qa-gate evaluates the linked reports and evidence.

## Structural evidence and retained boundaries

| area | inspected owner and reason | evidence |
|---|---|---|
| Approval/policy | run-recording.js preparation reused; gate-policy.js unchanged | Gate regressions plus packed/generated semantic parity |
| Atomicity/history | run-state-writer.js owned lock/atomic replacement/flush; approval-operations.js canonical codec; run-seal.js conditional v2 | Real competition/termination, fault boundaries, codec/history negatives and byte-preserving replay |
| Recovery | run-recovery.js and writeRunRecoveryLocked preserve only receipt history whose recorded approval seal verifies | Corruption rejects; supported reset retains receipt and clears approval |
| Consumer boundaries | Thin control-command.js facade; runtime/control-command-service.js and control-context.js; compatible CLI re-export | Actual 38-module import closure and instrumentation; package resource absence fails without target mutation |
| Propagation | sync-plugin-runtime.js inventory and plugin-provenance.js digest scope | Current packed/generated execution, manifests, negative integrity and exact Copilot payload guards |

The isolated HEAD-document substitution is test evidence isolation for an already recorded unrelated failure, not a production fallback. The working document and existing test remain untouched. The six required runtime modules add an exactly measured payload, with no discretionary headroom. Package extraction remains outside approved scope.

## Findings

No open normalized finding or unresolved ownership decision. CR-001 and CR-002 corrections are evidenced in CR.md; they change schema diagnostics and consumer recovery feedback within existing owners.

## Context Graph and persistence

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE; CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes in .agdf/control/CONTEXT_GRAPH.md; BROWNFIELD_ANALYSIS.md and this report link the unchanged state and adapter owners. No new policy or architecture authority.
- memory_target: scope_artifact
- memory_reason: Evidence and qualification belong to this selected Run.
- memory_refs: CD_TESTS.md; SOURCE_IDENTITY.json; EXECUTION_EVIDENCE.json; evidence/review-consumer.json
