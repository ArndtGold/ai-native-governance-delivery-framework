# OR: Report pre-dispatch MCP command failures as not dispatched

Run: run-8ede6acb-e0ce-4072-907a-aedad626635c
Report mode: OR-lite

## Result

Compact Delivery (`quick_task`) of the approved UR is implemented in the working tree and not committed. `prepareDispatch` in `packages/cli/lib/mcp-dispatch-runtime.js` now rethrows every dispatch-preparation failure (input context, staged-material grants) with typed `not_dispatched` facts through `preDispatchFailure`: classified material-store reasons pass through (`material_transfer_expired`, `stale_revision`, `material_binding_mismatch`, ...), four Core reason families map onto existing tool-error codes (`recovery_required`, `planning_source_stale`, `invalid_run`, `control_layout_unsupported`), and anything else becomes `dispatch_worker_failed` with `not_dispatched`. Both call sites (facade `server.js` and production `generation-runtime.js`) therefore return `outcome: rejected`, `dispatch: not_dispatched`, `isError: true` with "No command was dispatched by this attempt." instead of `effect_unknown`; the generation no longer parks such operations in its `unknown` set. Failures after dispatch are unchanged. New regression test `packages/mcp-server/test/pre-dispatch-failure.test.js` (registered in `test:protocol`). Derived compatibility evidence is re-recorded; the Copilot payload baseline is unchanged.

## Evidence

- Approved UR: `.agdf/control/runs/run-8ede6acb-e0ce-4072-907a-aedad626635c/documents/UR.md` (sha256:99306653dc8999bf79919f2e6cb5a236588e10f9e9f8d7eff2a7b9d0948c3f29).
- Brownfield Review with Mode/Slice `quick_task`: `documents/BROWNFIELD_REVIEW.md` (sha256:97fc4701ac962589cf18d014669916bddb97380269b96c2e78dd9eaa770b1341).
- Verification evidence: `evidence/VERIFICATION-input-01.md` (sha256:1d5bd136a1b6d9b6f19c3aa49d5a47a69b41b8da7743d1c657498c1ada107a04). The regression test failed against the previous build with `effect_unknown` and passes on the final build for facade legacy, facade modern and plugin generation. MCP server suites `test:protocol`, `test:run-command-flow`, `test:generation`, `test:contract`, `test:safety`, CLI MCP suites, `test:copilot-profile`, payload budget and `compatibility:check` (after `compatibility:record`) pass.
- Code Review `pass` with five resolved normalized findings from an independent review agent: `documents/CODE_REVIEW.md` (sha256:e0f547cc7f12f8eccff0c6365479bf87f413f5fd98aa43ae541e028e54fd9482).
- Context Graph: no impact (`context_graph_impact: none`, `context_graph_reconciliation: not_applicable`); knowledge persistence `scope_artifact` (this Run's evidence).

## Risk

- No native Claude CLI re-run against an installed build of this change; native proof of the defect exists only for released 0.30.0.
- The compatibility record moved from a macOS (2026-11-04) to a native Windows deterministic recording; it stays simulated-host evidence.
- Future Core reasons without a classified code fall back to `dispatch_worker_failed` with generic guidance.
- Pre-existing, out of scope: `material_transfer_expired` guidance category, multi-cause `material_binding_invalid` / `stale_revision`, `material_binding_invalid` as `effect_unknown` for a no-mutation `source_revision.preview` inside Core, and the review-step rejection `internal_result_unconfirmed` surfacing as `unclassified_tool_failure`.

## Next Step

Owner decides on VCS: review the diff and commit on a feature branch with the Run folder, the regression test, the source change and the re-recorded compatibility evidence. No VCS, release or install action is performed by this closeout.
