# Operational Git Handoff: Explicit Local Approval Command

Date: 2026-10-01
Owner: delivery-closeout
Run: agdf-control-command-slice1-20260930-01
Acceptance input: completed revision 22 / ecc10961-45e2-43b9-a4c5-d20c37f02b24; recorded Approval: UAT and OR pass.
Delivery status: uat_approved_with_code
Next step: offer commit limited to this slice; execute only on explicit user instruction.
Quality outlook: monitoring/runtime verification for later installed-host or native-platform qualification.

Commit title: Add cooperative local approval command with atomic replay receipts

Commit body:
Expose the additive create-agdf/control-command ESM API and explicit CLI operation identity through the existing approval, policy and Run owners. Persist approval and its protected receipt atomically. Acknowledge an exact retry without another revision or restoring superseded approval, reject stale or conflicting requests, and provide explicit assurance and recovery limits. Separate shared runtime context from CLI ownership and propagate the public dependency/resource closure through existing packaging and provenance inventories.

Validate nine tasks, nine acceptance criteria and 32 scenario families with source negatives, real concurrent/interrupted processes, actual packed external consumers, generated validators and relevant regressions. Clean Implementation Review, Code Review and QA pass; user QA and UAT are recorded. Qualification remains scoped to macOS source/packed/generated execution. A pre-existing architecture documentation assertion prevents a complete current-workspace smoke/release claim.

Migration/Rollout note: Receipt-bearing Runs require the aware runtime. The current installed plugin has not been updated; new installed-host and native Linux/Windows behavior require fresh qualification. Legacy receipt-free seals and supported CLI behavior retain compatibility. This handoff executes no commit, push, PR, installation or publication.

## Scope for selective staging

The source selection is the exact 29-file map in SOURCE_IDENTITY.json, verified before OR; a commit must recheck it before staging. Include the selected Run and its run-specific artefacts according to repository tracking rules. MASTER_BACKLOG.md is mixed ownership: stage only this Run's completed-row move and OR link, retaining every unrelated backlog change.

Exclude existing unrelated changes in docs/architecture/README.md, docs/architecture/diagrams/03-dispatch.dot, docs/architecture/diagrams/03-dispatch.svg and docs/architecture/mcp-target-architecture.md. The .gitignore/presentation-cleanup discussion was advice only and contributes no implementation to this commit.

Source paths:

- create-agdf/README.md
- create-agdf/lib/cli/command-registry.js
- create-agdf/lib/cli/parse-args.js
- create-agdf/lib/cli/runtime-context.js
- create-agdf/lib/cli/validation-handlers.js
- create-agdf/lib/control-command.js
- create-agdf/lib/control-evaluation/delivery-map.js
- create-agdf/lib/control-evaluation/gate-check.js
- create-agdf/lib/control-state/approval-command-contract.js
- create-agdf/lib/control-state/approval-command.js
- create-agdf/lib/control-state/approval-operations.js
- create-agdf/lib/control-state/run-identity.js
- create-agdf/lib/control-state/run-presentation-render.js
- create-agdf/lib/control-state/run-recording.js
- create-agdf/lib/control-state/run-recovery.js
- create-agdf/lib/control-state/run-seal.js
- create-agdf/lib/control-state/run-state-parser.js
- create-agdf/lib/control-state/run-state-writer.js
- create-agdf/lib/runtime/control-command-service.js
- create-agdf/lib/runtime/control-context.js
- create-agdf/lib/runtime/plugin-provenance.js
- create-agdf/package.json
- create-agdf/scripts/control-command-package-test.js
- create-agdf/scripts/control-command-process-test.js
- create-agdf/scripts/control-command-test.js
- create-agdf/scripts/support/control-command-child.js
- create-agdf/scripts/support/control-command-fixture.js
- create-agdf/scripts/sync-plugin-runtime.js
- plugin/meta/copilot-payload-baseline.json

## Reconciliation and evidence

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE; CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved (consume OR.md; no new graph work)
- parent_reconciliation: {"outcome":"not_applicable","target_run_id":"","disposition":"not_applicable","evidence":"","missing_evidence":"none","next_action":"none"} (consume OR.md only)
- Evidence: OR.md; QA_REPORT.md; SOURCE_IDENTITY.json; EXECUTION_EVIDENCE.json; CD_TESTS.md; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CR.md; RUN_STATE.md approval bindings.
- DELIVERY_SUMMARY.md is retained as the historical pre-UAT acceptance summary and non-operative draft. This file owns the current operational handoff.
