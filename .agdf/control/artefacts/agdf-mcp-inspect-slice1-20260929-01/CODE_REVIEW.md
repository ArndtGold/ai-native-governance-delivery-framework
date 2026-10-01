# Code Review: Lesende AGDF-Operationen über MCP statt Shell

Status: pass
Decision: pass
Date: 2026-09-29
Run: `agdf-mcp-inspect-slice1-20260929-01`
Based on: approved TP revision 11, CD+Tests evidence and the final working-tree diff (37 files, incl. two fixes from this review)
Reviewer: Claude

## Code Review

- decision: `pass`
- scope: `create-agdf/lib/control-inspect/*` (new), `create-agdf/lib/mcp-dispatch-runtime.js`, `create-agdf/lib/skill-dispatch/{service,contract}.js`, `create-agdf/lib/cli/command-registry.js`, `create-agdf/lib/runtime/plugin-provenance.js`, `create-agdf/scripts/sync-plugin-runtime.js`, `agdf-mcp-server/src/{server,worker,worker-entry}.js`, the touched skills and contracts, and the test changes. Neighbours inspected: `validation-handlers.js`, `control-read-boundary.js`, `contract-command.js`, `plugin-runtime.js`, the MCP server tests.
- findings (both resolved in this review):
  - [revise → resolved] `agdf-mcp-server/src/server.js`, `create-agdf/lib/control-inspect/contract.js` — an inspect result above the 1 MiB output ceiling was serialized with the dispatcher's oversize fallback, whose shape violates the inspect `outputSchema`; the host received a schema error instead of a recovery. Evidence: worker end-to-end reproduction against this repository, `delivery-map` with `all_active: true` (2084605 bytes) returned `isError` with a 162-byte body. Fix: `serializeControlInspectResult` with an inspect-shaped fallback (`inspect_output_too_large`, recovery names `run_id` narrowing or the CLI); tools carry their own `serialize`; the server uses it for results and failures. Re-run: `evaluator_error` with the recovery text, 1887 bytes, schema-valid.
  - [revise → resolved] `create-agdf/lib/cli/command-registry.js` — the shared validator made the CLI reject `--status-card`/`--approval-envelope` on non-gate-check commands, a new public CLI rejection outside the approved SD (SDD-002 promised identical CLI behavior, not new rules). Fix: the CLI no longer passes the variant; the rule remains for the MCP tool only; `gateCheckVariantFromFlags` removed; `control-inspect-test.js` asserts the CLI tolerance and the MCP rejection separately.
- verified without finding:
  - Correctness: every operation calls the same evaluator function as the CLI handler; parity asserted per operation, variant and locale with only `checked_at` normalized. Worker structured-clone of `report` verified end to end (doctor, gate-check both variants, delivery-map, contract) through the real stdio server and worker executor.
  - Fail-closed paths: unknown operation and write-shaped names fail at schema level (`additionalProperties: false`, enum); unknown tool names in the worker return `dispatch_worker_failed`; read boundary runs before evaluation (safety test with symlinked control tree); unresolved target returns orientation without evaluation.
  - Read-only guarantee: snapshot of the control tree unchanged across all operations, rejected calls and the dispatch preview; MCP server source scan (no child_process, network or write calls) includes `control-inspect/`.
  - Authority: every result `authorizes: false`; the dispatch preview is non-terminal, keeps `continue_delivery_intake` and the `run-present` step; `run-approve` without a presentation id still rejected; digests of the preview equal `run-present`.
  - Compatibility: dispatch `schema_version` unchanged; `runtime.definition/parse/execute` retained for existing consumers; protocol, contract, provenance and performance pins updated to two tools; provenance digest and plugin runtime entry lists include the new module (missing entry was caught by the smoke run and fixed).
  - Security: no caller-provided path reaches `readRuntimeContract` beyond the allowlisted module name; `pluginRoot: null` in MCP; language and target parsing reuse the dispatcher rules; recovery strings contain no secrets (safety test).
- missing_evidence:
  - AC-007 host measurement (evidence obligation per PRD decision, not a gate).
  - Live host discovery of `agdf_inspect` on Codex, Copilot and OpenCode: Copilot's adapter allowlist (`tools: ["agdf_dispatch"]`) will hide the tool until extended (routed to Slice 3; fallback covers it).
- risks:
  - Worker executor is serial with a 10-second timeout; `delivery-map` over many runs can approach it before hitting the size ceiling. Mitigation: the recovery text steers to `run_id` narrowing.
  - Parity limitation for `verified_change` fixtures (no git observation over MCP) is documented in the tool description and SD, not tested against a git fixture.
- context_graph_impact: `none`
- context_graph_reconciliation: `not_applicable`
- required_next_step: Run the QA gate for this run with the CD+Tests and Code Review evidence; do not request `Approval: QA` before the QA report exists.

## Reproduction

```bash
cd agdf-mcp-server && node <scratch>/cr-worker-e2e.mjs
```

Result before CR-01: `{"operation":"delivery-map","all_active":true} -> isError bytes=162`.
Result after: `-> evaluator_error [{"code":"inspect_output_too_large"}] ... bytes=1887`; all other operations `inspect_result`.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | Worker e2e: oversize inspect result returned a schema-invalid dispatch-shaped fallback; fixed by `serializeControlInspectResult` and per-tool `serialize`; `test:control-inspect` covers the fallback shape | none; covered by the updated suite |
| CR-02 | emergent_risk | CD+Tests | resolved | `validateCommandOptions` rejected `--status-card`/`--approval-envelope` on non-gate-check commands, a public CLI change not decided in SD; CLI tolerance restored, MCP-only rule kept and tested | none; covered by the updated suite |
