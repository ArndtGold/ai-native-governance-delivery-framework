# Code Review: Explicit Local Approval Command

Status: done
Date: 2026-10-01
Scope: Actual production diff and all new command/receipt/composition modules, tests and documentation; directly affected parser, writer, recovery, PRD revision, presentation, CLI, package synchronization and provenance neighbors.

## Code Review

- decision: pass
- findings: Two concrete implementation findings were corrected within the approved TP. CR-001 rejected-object diagnostics accessed caller getters; CR-002 transient/unknown-lock results omitted an explicit safe next action. Both are resolved with executable evidence below. No unresolved correctness, data-integrity, compatibility, security or material maintainability finding remains evident in reviewed scope.
- evidence: SOURCE_IDENTITY.json hashes the final 29-file source set; EXECUTION_EVIDENCE.json binds final unit/process/packed/generated and MCP regression logs. Actual writer/control flow reviewed in addition to green tests; review-consumer.json captures the requested result surface.
- missing_evidence: Installed new plugin and fresh human-visible host behavior; native Windows/Linux; independent human verification. These are not implemented/qualified by this slice and cannot be inferred from its tests.
- risks: Cooperative callers remain responsible for forwarding the actual deliberate reply. Seals detect unrecorded edits, not malicious OS-user writes. Receipt-aware runtime is necessary for receipt-bearing Runs; replay is historical acknowledgement and grants no current permission. Native durability and installed-host claims remain bounded. The pre-existing architecture README assertion is recorded separately and bars a full-workspace smoke/release claim.
- required_next_step: qa-gate evaluates the linked quality evidence for this exact Run.

## Reviewed paths and conclusions

| area | concrete review conclusion | supporting evidence |
|---|---|---|
| Schema and authority | Own data descriptors enforce the closed object; accessors are rejected without invoking them in validation or diagnostic binding. Raw reply bytes remain in request digest; legacy trimmed reply validation is preserved. Stronger authority and undeclared role/proof claims cannot upgrade assurance. | CR-001 final unit negative matrix; assurance CLI/API fixtures |
| Freshness and effect | Canonical read/history/preparation/write stay inside withRunLock; prepareGateApproval and its final presentation validation share the existing eligibility owner. Preselected UUID binds approval/receipt to one numeric revision. | Final checkpoint children change each artifact/presentation/revision/eligibility; no accepted effect |
| History and replay | Matching operation/digest is acknowledged before freshness only after valid canonical read/seal; no write and no effective-approval restoration. Conflict does not adopt the historical effect. | Same-Run replay, progress/reset/supersession and changed-payload tests |
| Writer and recovery | Generic writers preserve the exact receipt set; only matched service append is accepted. Parser checks run/history/current revision consistency; approval seal v2 covers receipts. Recovery refuses untrusted evidence and clears effective approvals. | Codec/seal/writer negatives; recovery and legacy-seal equality |
| Interruption and competition | Exceptions after rename resolve against the destination, report observed effect/unconfirmed acknowledgement, and exact retry flushes without a new revision. Unknown/live owners remain protected. | Real SIGKILL/process competitions; pre/postcommit and lock-release faults |
| Feedback | Retryable failures explicitly retain original UUID/payload; unknown locks require canonical/owner inspection and never imply approval. Current observation remains separate from original effect. | CR-002 unit assertions and review-consumer.json live_lock/unknown_lock |
| Compatibility/package | Shared context extraction preserves configured locale/Git composition and existing export targets; public facade excludes CLI/installer/MCP bootstrap. Synchronization/provenance include dependencies; packed/generated execution and missing-resource behavior are tested. | Final external .tgz consumer, generated validators and MCP safety/contract/continuation |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | approval-command-contract.js ownDataValue; commandBinding and approval-command.js diagnostic operation identity; SCN-002 covers throwing getters on all ten command fields with zero invocations and unchanged Run | Retain the executed accessor matrix in CD+Tests evidence |
| CR-002 | implementation_gap | CD+Tests | resolved | approval-command.js recovery field for retryable/unknown outcomes; final unit assertions and live_lock/unknown_lock consumer JSON | Retain the executed recovery-feedback evidence in CD+Tests |

Both corrections are implementation changes to existing approved schema/result obligations, not new product/design choices. No finding was downgraded, silently rerouted or hidden as a test-only workaround.

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
