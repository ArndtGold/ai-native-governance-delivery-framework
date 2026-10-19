# Clean Implementation Review: Four AGDF approval-chain defects

Gate: Clean Implementation Review
Type: Clean Implementation Review
Decision: pass
Date: 2026-10-19
Reviewer: Claude Code (agent), cooperative assurance

## Scope

Structural cleanliness of the change set on `fix/agdf-core-approval-defects-20261017`: ownership, reuse, parallel structures, coupling, naming, comments and test placement.

## Assessment

- **One owner per rule.** Localized readability has one owner (`localizedDecisionFields`), used by UAT observation and by readiness/presentation. The required-review list (`STRUCTURED_REQUIRED_REVIEWS`) and the late-review association rule live in `evidence-bindings.js`. Approval material has one reader (`approvalMaterialTypes`). Lock rules stay in `run-state-writer.js`, and worker lifecycle stays in `packages/mcp-server`. No second parser, registry or reclaim path was added.
- **Reuse.** The release function reuses the existing reclaim guard and its compare-then-unlink protocol. The payload re-pin uses the existing `payload-budget.js` tool. Locale text goes through the existing `operationalValues` registry. Closeout, gate policy, eligibility and approval-material checks are extended in place.
- **Boundaries.** Core imports only the Node built-in `node:diagnostics_channel` (allowed by `check-package-boundaries.mjs`). The MCP server still imports Core only through `create-agdf/mcp-dispatch-runtime`. The executor receives the release function by injection, so `worker.js` does not load the runtime composition.
- **Compatibility.** The lock record format, receipts, evidence bindings, RUN_STATE sections and the summary heading are unchanged. New exports and diagnostic reasons are additive.
- **Readability.** Comments explain intent and safety conditions at each new branch, in the density of the surrounding code. Names follow existing conventions.
- **Tests.** Regression tests sit next to the owners they exercise (`packages/core/test`, `packages/mcp-server/test`) and are wired into existing scripts (`test:run-command-flow`, `test:safety`). Fixture changes do not weaken assertions.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-01 | emergent_risk | CD+Tests | resolved | `approval-chain-defects-test.js` emulates a pre-fix runtime by copying Core to a temp directory and removing the two new branches at named anchors. earliest-owner assessment: this is the only faithful way to reproduce approvals given before the fix. The test fails loudly if an anchor changes, and the copy is removed afterwards. | none |
| CIR-02 | emergent_risk | CD+Tests | resolved | A terminated worker leaks its lock file descriptor (see CR-12). earliest-owner assessment: residual, rare, and not a correctness issue because the lock file is removed; documented for QA. | none |
