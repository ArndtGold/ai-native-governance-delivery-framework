# Brownfield Analysis: Recovery ungesiegelter aktiver AGDF-Runs

Mode: `pre_implementation_analysis`
Decision: `pass`
Mode/Slice Decision: `structured_delivery`
Required next gate: `none`
Run: `restore-unsealed-active-run-records-20260929-01`
Approved TP: revision 13 · sha256:06ea366e554acca86b3af29d32039856ce2f928ffb98558c6c8117b47a6b6b30
Approved SD: revision 11 · sha256:e37053ad63732c416df6e73d8e063b479489b678366e35483bf6b4c29d34cd23
Date: 2026-09-29

## Scope

Implementation preparation for the approved TP only: explicit per-run inspection, digest-bound preview, conservative Approval disposition, recovery journaling, and a capability-limited write through the existing Control-State owner. The current confirmed set contains the 23 Run IDs named in the approved PRD/TP. No recovery has been applied to them. The other untracked scope `mcp-zielarchitektur-doku-20260929-01` and unrelated repository changes are outside this analysis and must remain untouched.

## Existing Owners And Evidence

| Concern | Existing owner | Evidence | Coverage |
|---|---|---|---|
| Canonical run selection and parsing | `create-agdf/lib/control-state/run-state-reader.js`, `run-state-resolver.js`, `run-state-parser.js`; `create-agdf/lib/control-evaluation/run-state.js` | Existing doctor/gate-check resolve the canonical `.agdf/control/runs/<id>/RUN_STATE.md`; `internalStepArtefacts` recognizes `Brownfield Analysis`; parsed internal completion is the linked Artefact row with status `done`. | `fully_done` for selection and ordinary status reads; recovery semantics are `not_done`. |
| Revision, lock, atomic write and seals | `run-state-writer.js`, `run-recording.js`, `run-seal.js` | `writeRunLocked` verifies current revision/content, serializes through the existing run lock, rejects unsealed/invalid states, and delegates to atomic replacement plus shared `sealRunState`. | `fully_done` for normal sealed revisions; explicit safe unsealed recovery is `not_done`. |
| Approval and gate transition | `run-recording.js`, `run-presentation.js`, `gate-approval-validator.js`, `gate-policy.js` | `run-approve` binds an exact response to a stored presentation and revision; gate policy derives the next permitted gate from canonical approvals and artefact status. | `partially_done`: ordinary forward approval works; there is no recovery-time provenance adjudication or invalidation path. |
| Artefact path safety | `contained-file.js`, `run-seal.js`, `run-state-parser.js` | Listed artefact digests use the contained regular-file resolver; duplicate artefact rows and unsafe paths already have validation paths. | `partially_done`: protections exist for normal reads/writes; recovery must repeat them under the recovery lock and against the confirmed snapshot. |
| Legacy migration | `legacy-migration.js`, CLI `run-migrate` | Legacy migration reads only `.agdf/control/AGDF_RUN.md`; it rejects collisions with canonical run directories. | `fully_done` as a separate legacy import; cannot be reused for these canonical unsealed runs. |
| CLI entry and tests | `command-registry.js`, `parse-args.js`, `validation-handlers.js`; Control-State, run-lock, run-step-transaction, run-revision, lifecycle and CLI-gate suites | CLI handlers route mutations to the shared services; `create-agdf/package.json` exposes the relevant suites. | `partially_done`: writer and lifecycle regression owners exist; recovery-specific commands and failure-injection coverage are `not_done`. |
| MCP and host surfaces | `mcp-dispatch-runtime.js`, `agdf-mcp-server/src/server.js`, Codex/Claude/Copilot/OpenCode installers | Current MCP exposes governed dispatch and read-only inspect; no recovery apply tool or user-facing recovery UI is in the approved TP. | `not_done` for a recovery capability, intentionally unchanged by this run. |

## Reuse Strategy And Minimal Clean Path

1. Complete `T-EVIDENCE` first. Search only trusted, independently retained approval records for the exact 23 IDs and record which evidence can prove each required binding. The existing unsealed row and `run-present` JSON alone do not qualify. If no independent response provenance is found, carry no prior Approval beyond the earliest unproven gate; retain the old row as non-authorizing audit evidence in the recovery record.
2. Add a focused `control-state/run-recovery.js` orchestrator and CLI command, reusing the canonical run resolver/parser, contained-file checks, gate policy, presentation conventions, and output style. Keep preview inspection read-only and bind apply to its exact Run ID, Preview ID, state digest and artefact digest set.
3. Extend/refactor `run-state-writer.js` with an internal, capability-limited recovery entry that shares the existing lock, optimistic snapshot comparison, revision increment, `atomicWrite` and `sealRunState`. It must accept only a valid parsed recovery candidate and must not relax ordinary `run-update` rejection of unsealed/invalid input.
4. Keep transaction metadata in the Recovery owner and under the selected control root. Known journal phases resume idempotently only when before/after digests match; unknown phases or concurrent edits block. Do not introduce a second source of truth, run-wide batch transaction, MCP writer or new approval authority.
5. Add recovery-focused tests beside existing Control-State and writer transaction suites; use temporary repositories and injected I/O failures. Validate package/CLI projection through the current build/sync path only after source tests pass.

## Compatibility And Regression Risks

- A capability too broad in the shared writer could allow unsealed changes through ordinary `run-update`; pin this negative behavior in regression tests.
- Approval invalidation can leave stale later artefact statuses or an invalid derived current gate. Use canonical gate-transition logic and test each earliest-unproven position; do not hand-calculate the sequence in the CLI.
- Locking only the Run State but not the recovery journal can race preview/apply or duplicate recovery. Both must share one owner-token boundary and exact before/after digests.
- Run seals include every listed artefact. Any artifact change between preview and apply must stop before mutation; do not rewrite the source artefacts as part of recovery.
- Git refs do not contain a sealed revision for any of the 23 runs in the reviewed evidence. Unverified sources remain blocked; a newly computed seal is not historical attestation.
- Unrelated work is present in the checkout: `.agdf/control/MASTER_BACKLOG.md` is modified, and `mcp-zielarchitektur-doku-20260929-01` control files are untracked. They are not recovery inputs and must remain byte-identical through the implementation.

## Test Impact

Use the approved TP as the verification source. Primary existing suites are `test:control-state`, `test:run-lock`, `test:run-step-transaction`, `test:run-revision`, `test:cli-gates` and `test:lifecycle`, with new isolated Recovery-specific scenarios for provenance, preview binding, path/symlink denial, fault injection, idempotent resumption and non-selected-run byte equality. Run tests only against temporary fixtures; capture all-active Doctor output as a read-only before/after observation after implementation, without treating unrelated warnings as fixed.

## Missing Evidence

- T-EVIDENCE repository inventory completed for all 23 bound Run IDs: each has zero local `presentations/*.json` records, zero presentation IDs in its current approval rows, and no historical `RUN_STATE.md` version with both valid seal lines in the checked Git refs. This is evidence only about the inspected repository; no external host/session archive was supplied or independently queried.
- No historical Approval response currently meets the independent provenance threshold. The implementation must therefore carry none of the 23 current Approval rows as effective by default; each Recovery preview must show the affected gates and the normal re-approval sequence. A future independently verified source may qualify a specific approval only if the exact run, gate, revision, presentation and response bindings are all proven.
- Cross-platform failure injection for Windows rename/locking and filesystem sync behavior remains future TP evidence; tests must fail closed when the platform cannot prove the required atomicity.
- The current MCP/host path has no recovery write capability, but its absence does not block the approved CLI-only slice.

## Parallel-Structure Risk

High if recovery directly edits files or computes seals in a second service. Keep orchestration separate from authority: `run-recovery.js` may validate and prepare a plan, but only the shared writer performs a durable Run State replacement and seal. Do not extend `legacy-migration.js` to blur legacy import and canonical recovery.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- evidence: The node already requires explicit migration and one canonical run authority. This feature closes the documented gap for existing canonical unsealed records; update the node with the implemented preview, provenance and writer boundary after verified behavior exists. This analysis does not create or edit a Context Graph node.

## Decision And Next Step

`pass`: current owners, reuse path and regression owners are evidenced; missing historical Approval provenance has a safe fail-closed path and does not require a new product decision. Implement only the approved TP in `CD+Tests`, starting with T-EVIDENCE. Do not run Recovery against any of the 23 product Run States until the implementation produces an exact bound preview and the repository owner confirms that preview.
