# Code Review: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`  
Reviewed baseline: `d9d7be70945d4ead16de6fb12830afb7e2c3325d`

## Code Review

- decision: `pass`
- findings:
  - [resolved] `create-agdf/scripts/sync-package-assets.js`, `sync-plugin-runtime.js` and `package-build-test.js` - complete Copilot profile replacement allowed conflict-named siblings to escape the signed payload inventory - generation now updates owned files in place, prunes entries outside the exact mapping and verifies stale root/runtime fixtures; package build, local installation and final smoke pass.
  - [resolved] `create-agdf/lib/mcp-lifecycle/result.js`, `presentation.js`, `profile.js`, `adapter-contract.js` and locale metadata - the first review found a non-canonical fallback code, incomplete diagnostic localization, duplicate enum tolerance and insufficient direct-evidence failure validation - the stable code, closed locale projection, unique enums, adapter source conformance and required `failure_status: passed` are now enforced by focused tests.
  - [resolved] `create-agdf/lib/mcp-lifecycle/service.js` and `package.js` - transaction review found missing fault seams and a retirement commit that could hide deletion failure - injected failures now cover prepare, registration, read-back, reference and retirement phases; retirement errors propagate while rollback can still restore config, references and runtime.
- missing_evidence: No correctness-critical review scope is missing. Native Windows, Linux, OpenCode 2.x, authenticated Claude and callable Copilot behavior remain unreviewed runtime qualification surfaces and are explicitly excluded from current support claims.
- risks: Host configuration contracts may change in later releases. Closed profile validation, native-source inspection and exact tuple qualification make such drift fail closed, but future host versions need new direct evidence.
- required_next_step: Run `qa-gate` against the approved TP, Brownfield Analysis, TP Review, Clean Implementation Review, this Code Review, CD+Tests and direct host evidence.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CHMCP-CR-01 | implementation_gap | CD+Tests | resolved | In-place Copilot synchronization and stale-entry regression pass package build, local install and final smoke. | Keep the regression in the normal package suite. |
| CHMCP-CR-02 | implementation_gap | CD+Tests | resolved | Focused result, presentation, profile, adapter and evidence-validator tests pass after the contract corrections. | Keep closed-code and source-conformance cases in the lifecycle suite. |
| CHMCP-CR-03 | implementation_gap | CD+Tests | resolved | Full transaction fault matrix proves exact restoration; retirement deletion failure now propagates and `rollback_incomplete` stays blocking. | Keep all mutation phases injectable and covered. |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node reflects the final owners, transaction boundary, direct facts and remaining exact-tuple risks.
