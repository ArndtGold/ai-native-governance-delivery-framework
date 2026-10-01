# CD+Tests — Lesende AGDF-Operationen über MCP statt Shell

- Run: `agdf-mcp-inspect-slice1-20260929-01`
- Approved TP: revision 11
- Date: 2026-09-29
- Status: implementation and repository checks passed; AC-007 measurement remains an open evidence obligation (PRD decision: measurement, not gate).

## Implementation

| TP task | Change | Files |
|---|---|---|
| T-INSPECT-CONTRACT | New module `control-inspect/`: `selection.js` (shared read-selection rules with CLI-identical wording), `contract.js` (`agdf_inspect` definition, 2023 bytes ≤ 2048, `operation` enum `doctor \| gate-check \| delivery-map \| contract`, parsing via the dispatcher's language and target rules), `service.js` (execute over `evaluateDoctor`, `evaluateGateCheck`, `evaluateDeliveryMap`, `readRuntimeContract` behind `assertMcpControlReadBoundary`; returns the CLI `--json` report object and canonical Markdown). `command-registry.js` calls the shared validator. | `create-agdf/lib/control-inspect/*`, `create-agdf/lib/cli/command-registry.js` |
| T-RUNTIME-SERVER | Owned runtime exposes `tools` (dispatch, inspect) and `tool(name)`; `failure(code, toolName)` returns the tool's result shape. Server registers every listed tool through the same executor; worker carries `toolName` and fails closed on unknown names. `lib/control-inspect` added to the provenance digest and to the plugin runtime entry list. | `create-agdf/lib/mcp-dispatch-runtime.js`, `agdf-mcp-server/src/server.js`, `worker.js`, `worker-entry.js`, `create-agdf/lib/runtime/plugin-provenance.js`, `create-agdf/scripts/sync-plugin-runtime.js` |
| T-DISPATCH-PREVIEW | `presentation_required` populates `presentation` with `semantic_block: approval_preview` (preview Markdown, artefact and summary digests, run, gate, revision, `authorizes: false`); `host_action.mode` stays `continue_delivery_intake`; `run-present` remains the binding step. `outputSchema.presentation` documents it. | `create-agdf/lib/skill-dispatch/service.js`, `contract.js` |
| T-SKILLS-CONTRACTS | Nine skills name `agdf_inspect` (`operation: contract`) before the schema-2 binding for runtime-contract reads; `release-or` does the same for its doctor step; `interaction.md` step 3 allows the embedded preview before `run-present` and asks the gate question only after a `presentation_id` exists; `control-scaffold.md` documents the MCP equivalents. Fingerprint-locked blocks untouched. | `plugin/skills/*/SKILL.md` (9), `plugin/meta/contracts/interaction.md`, `control-scaffold.md` |
| T-REGRESSION-PACKAGE | New suite `test:control-inspect` (in the smoke chain); pins updated to two tools in protocol, contract, provenance and performance tests; safety test covers the read tool behind the boundary and scans `control-inspect/`; function-contract and dispatch tests extended; payload budget accepted with rationale; eval manifest fingerprints recomputed for the changed skill sources. | `create-agdf/scripts/control-inspect-test.js`, `agdf-mcp-server/test/*`, `create-agdf/scripts/skill-dispatch-*.js`, `plugin/meta/copilot-payload-baseline.json`, `docs/maintenance/payload-budget-history.md`, `evals/manifest.json` |
| T-MEASUREMENT | Definition size asserted (2023 ≤ 2048). The small-path host measurement is not available in this session (see AC-007). | `create-agdf/scripts/control-inspect-test.js`, `skill-dispatch-function-contract-test.js` |

## Repository evidence

| Check | Result | Evidence |
|---|---|---|
| Read-tool parity, shared selection, read-only snapshot, preview digests, envelope and locale matrix (AC-001, AC-002, AC-003, AC-005) | passed | `npm --prefix create-agdf run test:control-inspect`; parity is `JSON.stringify` equality of the evaluator report with only the evaluation timestamp `checked_at` normalized; control-tree snapshot unchanged across every operation, rejected call and dispatch preview; `run-approve` without presentation id rejected |
| Dispatch contract, service and binding (AC-003, AC-005) | passed | `npm --prefix create-agdf run test:skill-dispatch` incl. `agdf_inspect` definition pins and `presentation_required` preview assertions |
| MCP server: contract, continuation, protocol (two tools, write-shaped operation rejected by schema), safety (boundary, source scan incl. `control-inspect/`), provenance, package | passed | `npm --prefix agdf-mcp-server test` at 07:4x (cold p95 634 ms, warm p95 484 ms) |
| MCP server performance assertion | passed in the final full smoke run | Under load at 08:0x the 1500/1000 ms thresholds failed on this branch and on unmodified `main` alike (warm p95 2200 ms); the final full `smoke-test` run at 08:2x passed the assertion together with every other chained suite |
| Control state, CLI gates, intake continuation, PRD readiness, run-revision, parent reconciliation, verified change | passed | `test:control-state`, `test:cli-gates`, `test:intake-continuation`, `test:prd-readiness`, `test:run-revision`, `test:parent-reconciliation`, `test:verified-change` |
| Skills and contracts (AC-004, AC-006) | passed | `test:instruction-footprint` (gate-check budget and fingerprints), `test:request-activation` (37 cases), `eval:skills` 90/90, `test:skill-evals`, `test:agent-skills-conformance`; recorded search: no primary read-only shell step remains in `plugin/skills`; the five remaining `--json` mentions in `control-scaffold.md` and `interaction.md` describe CLI ownership, not agent steps |
| Renderer, localization, setup, missing-control cards | passed | `test:interaction-presentation`, `test:operational-localization`, `test:install-setup-interaction`, `test:gate-check-missing-control` |
| Package, profile, budget, runtime integrity | passed | `sync-package-assets`; `test:copilot-profile`; `test:payload-budget` (114 files / 1108560 bytes accepted after the Code Review fix CR-01); `test:package-build`; `test:package-contents`; `test:runtime-integrity-layout`; `test:runtime-integrity-negative`; `test:plugin-mcp-runtime` |
| Remaining smoke chain | passed | `test:proportionality`, `test:delivery-path-search*`, `test:opencode-hardening`, `scripts/smoke-test.js`, `scripts/test-routing.js` |
| Patch whitespace | passed | `git diff --check` |

The full `smoke-test` chain was run four times; each run advanced past the previous stop. The final run at the final code state passed end to end (`npm --prefix create-agdf run smoke-test`, exit 0).

## Precondition work attributed to run `agdf-actionable-card-ux-20260928-01`

The approved TP required a green `control-state-test.js` before CD+Tests. On `main` (commit 62e4140) the following suites were red because fixtures still encoded pre-change behavior; the assertions were aligned to that run's approved PRD (AC-003/AC-004 fail-closed clarification, AC-008 localized summaries), not weakened:

- `control-state-test.js` lines 279 and 307: free-text QA revise/block actions now expect `user_action_required: yes` and `internal_next_step: none`; approval fixtures (UR, SD, TP, QA_REPORT) carry `AGDF Approval Summary (de; source=en)` blocks.
- `cli-gate-scenarios-test.js` and `intake-continuation-test.js`: English UR fixtures presented in German carry summary blocks; the intake assertion checks the localized summary instead of an English excerpt.
- `smoke-test.js`: status-card phases use explicit `--language en` and the actor row (`I am continuing` / `No reply needed` / `Your turn`) instead of the removed `Next step` row; the TP fixture carries reviewable content.

These changes belong to the owning run's evidence and should be recorded there.

## Open items

- **AC-007 (measurement obligation)**: the small-path baseline with the MCP server listed requires a fresh host session consuming this revision; the installed runtime is still `0.14.5` (pre-change). Not measured in this session; recorded as an open evidence gap, not a gate.
- **Copilot adapter allowlist (emergent, routed)**: `create-agdf/lib/mcp-lifecycle/adapters/copilot.js` writes `tools: ["agdf_dispatch"]`; Copilot will not expose `agdf_inspect` until that allowlist is extended. Adapter changes are a PRD non-goal of this slice; the binding fallback covers Copilot (AC-006). Routed as `emergent_risk` to the SD owner for Slice 3.
- **Codex consent policy** keys only `agdf_dispatch` approval mode; `agdf_inspect` calls need per-call approval under Codex as every other tool does today.
- The two reads of `gate-check/SKILL.md` (tail), plugin budgets and two contract passages were blocked by the session's permission classifier; the gate-check skill was therefore left unchanged (its read steps are already MCP-first) and only anchors known from earlier reads were edited in the contracts.

## Next step

Mandatory Code Review (`CR`) of this diff, then QA.
