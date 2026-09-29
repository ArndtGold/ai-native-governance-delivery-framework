# Brownfield Analysis: Lesende AGDF-Operationen über MCP statt Shell

Status: complete
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Decision: pass
Based on: approved TP revision 11
Date: 2026-09-29
Reviewer: Claude

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_ANALYSIS.md`
- scope: Six approved TP tasks, seven PRD criteria and five SD decisions; implementation preparation only. No code or tests were changed or run during this analysis.
- evidence: Current source confirms the owners listed below. `printDoctorReport`, `printGateCheckReport` and `printDeliveryMapReport` each emit `JSON.stringify(report, null, 2)` in their `--json` branch, so CLI parity is exactly `JSON.stringify` equality of the evaluator's report object; non-enumerable `humanPresentation` and `runState` properties are excluded on both sides by construction. `buildAgdfServer` registers one tool from `runtime.definition`; `worker-entry.js` calls `runtime.parse` and `runtime.execute` without a tool name. `createSkillDispatchService` calls `evaluateGateCheck` with `runId` and `presentationLanguage` only and never passes `cliGitObservation`. The `presentation_required` branch in `service.js` sets no `presentation` while `control.approval_presentation.preview_markdown` is available in the same scope. `validateCommandOptions` holds the read-command rules inline (`--all-active` only doctor/delivery-map; `--module` only contract; `contract` requires `--module`). The safety test scans every module reachable from `agdf-mcp-server/src` for prohibited capabilities, so `control-inspect/` will be scanned automatically once imported by the runtime.
- transparency: This establishes a repository implementation path, not loaded-host behavior. The installed runtime (`0.14.5`, digest `0840e2757c47fd5e479f2a4bdcc7b825e5123e81e483418a0a221bfea60682b0`) predates the current source; approval cards in this run therefore still show the old summary renderer. No native host session was inspected.
- missing_evidence: The shared suite `create-agdf/scripts/control-state-test.js` is red on `main` at line 279 (commit 62e4140; passes on its parent). It is owned by run `agdf-actionable-card-ux-20260928-01`. The approved TP makes a green suite a precondition for this slice's CD+Tests. The small-path measurement (AC-007) requires a host session and is not available yet.
- current_coverage: Evaluators, read boundary, worker executor, trust checks, dispatch result field and the MCP-first skill wording pattern exist. The inspect tool, shared validator, multi-tool registration, preview population and read-step wording do not exist. `partially_done`.
- reuse_strategy: `extend`. Extend `mcp-dispatch-runtime.js`, `server.js`, `worker-entry.js`, `service.js`, `contract.js` and `command-registry.js`; add the new module `control-inspect/` that only composes existing functions. Add no evaluator, renderer, writer or host adapter.
- risks: Worker routing by tool name must fail closed for unknown names. The protocol test's single-tool pin and the function-contract test's key-order pins change deliberately. The dispatcher's `outputSchema.presentation` must accept the new `approval_preview` object shape. gate-check skill budget pressure. Parity for `verified_change` fixtures is limited by design (SDD-002).
- context_graph_impact: `none`; existing ownership and architecture records are confirmed, not changed.
- required_next_step: Wait for a green `control-state-test.js` from its owning run, then implement the approved TP tasks in the documented order, starting with the shared validator and the inspect module.

## Existing Owners And Evidence

| Concern | Existing owner | Observed behavior and evidence | Planned reuse |
|---|---|---|---|
| Read evaluators | `create-agdf/lib/control-evaluation/doctor.js`, `gate-check.js`, `delivery-map.js`; `create-agdf/lib/cli/contract-command.js` | `validation-handlers.js` calls `evaluateDoctor(dir, options, cliGitObservation)`, `evaluateGateCheck(dir, selection, cliGitObservation)`, `evaluateDeliveryMap(dir, options, { evaluateDoctor, buildStatusCard, postApprovalTransition })` and `readRuntimeContract(module)`; each print function's JSON branch is `JSON.stringify(report, null, 2)`. | Inspect service calls the same four functions with the dispatcher's dependency set (no git observation) and returns the report object; parity tests compare `JSON.stringify` of both. |
| Read-selection rules | `create-agdf/lib/cli/command-registry.js` `validateCommandOptions` | Inline rules for `--all-active`, `--module`, `contract requires --module`, `--status-card`/`--approval-envelope` only via parse flags; no shared function exists. | Extract the read-command subset into `control-inspect/selection.js` with identical error strings; `validateCommandOptions` calls it; existing CLI tests keep passing. |
| Dispatcher parsing helpers | `create-agdf/lib/skill-dispatch/contract.js` (`requireText`, `canonicalizeLanguageTag`, `resolvePresentationLocale`, `normalizeTaskTargetSource`, `RUN_ID_PATTERN`) | Language and target rules are implemented once and tested through the language matrix fixtures. | Reuse for the inspect input; do not duplicate language or target grammar. |
| Read boundary | `create-agdf/lib/control-read-boundary.js` | Injected into the dispatch service as `validateControlReadBoundary` and called before `evaluateGateCheck`. | Inject the same function into the inspect service and call it before every operation. |
| Tool surface | `create-agdf/lib/mcp-dispatch-runtime.js`, `agdf-mcp-server/src/server.js`, `worker.js`, `worker-entry.js` | Runtime exposes `definition`, `parse`, `execute`, `serialize`, `failure`, `trustedContext`; server registers one tool; worker receives `argumentsValue` only. | Add `tools` (array of `{ definition, parse, execute }`), keep the dispatcher accessors; server iterates `tools`; worker receives `toolName` and routes; unknown name fails with `dispatch_worker_failed`. |
| Dispatch result and preview | `create-agdf/lib/skill-dispatch/service.js` lines 430–447; `contract.js` `outputSchema.presentation` | `presentation_required` result has `presentation: null`; `control.approval_presentation` carries `preview_markdown`, `artefact_digest`, `summary_digest`, `revision_id`. | Populate `presentation` with the `approval_preview` object; extend the schema description; keep `host_action.mode` and `continuation.steps`. |
| Skills and contracts | ten `plugin/skills/*/SKILL.md`; `plugin/meta/contracts/interaction.md`, `gate-transition.md`, `quality.md` | Skills already carry an "Executable Dispatch" block naming `agdf_dispatch` first and the binding second; read steps (`gate-check --json`, `doctor --json`, `delivery-map --json`, `contract --module`) are named as shell steps. | Reuse the same sentence pattern for `agdf_inspect`; leave the fingerprint-locked guard and terminal-dispatch blocks untouched. |
| Tests | `agdf-mcp-server/test/protocol.test.js` (`tools.length === 1`), `safety.test.js` (reachable-source scan, no write), `create-agdf/scripts/skill-dispatch-function-contract-test.js` (definition key order), `skill-dispatch-test.js`, `control-state-test.js` | Pins encode the single-tool surface and current result shape. | Change pins deliberately to two tools; add parity, snapshot and preview-digest assertions at the named suites. |
| Package and budget | `create-agdf/scripts/sync-package-assets.js`; `payload-budget.js`; `plugin/scripts/instruction-footprint.mjs` | Generated assets are gitignored and were stale locally before this run; the budget review records growth with rationale. | Run sync before package and integrity checks; accept growth via `payload:budget --accept`. |

## Reuse And Parallel-Structure Risk

| Classification | Finding | Evidence | Required control |
|---|---|---|---|
| `problem` | Read rules exist only inline in the CLI validator; MCP would otherwise need a copy. | `validateCommandOptions` in `command-registry.js`. | Extract to `selection.js` and call from both surfaces; assert identical error strings. |
| `problem` | Worker entry has no tool routing; a second tool cannot be executed today. | `worker-entry.js` calls `runtime.parse`/`runtime.execute` directly. | Pass `toolName` in `workerData`; route through `runtime.tools`; fail closed on unknown names. |
| `trade-off` | MCP evaluators run without git observation, so `verified_change` fixtures can differ from CLI output. | Safety test forbids `node:child_process` in reachable sources; `cliGitObservation` spawns git. Rationale: keep the server free of child processes. Owner: SD owner Arndt Gold (SDD-002). Mitigation: parity fixtures hold the dependency equal; tool description names the limitation. Exit condition: Slice 2 decides whether a process-free git observation is worth adding. | Record the limitation in the tool description and `interaction.md`. |
| `trade-off` | The installed host runtime is older than the source; host evidence for AC-007 depends on a refreshed installation that this slice does not perform. | Dispatcher runtime digest `0840e275…` vs current source. Owner: Arndt Gold. Mitigation: measurement is an evidence obligation, not a gate (PRD decision). Exit condition: measurement recorded or gap named before QA. | Keep AC-007 as a dated evidence record. |
| `unresolved` | `control-state-test.js` is red on `main`. | Line 279 fails on 62e4140, passes on its parent. Owner: run `agdf-actionable-card-ux-20260928-01`. | CD+Tests of this slice waits for a green suite; this slice must not weaken the assertion. |
| `none` | No parallel evaluator, renderer, writer or host adapter is needed. | Every planned module composes existing functions. | Keep the MCP layer a projection. |

## Minimal Implementation Path

1. `control-inspect/selection.js`: extract the read-command rules; wire `validateCommandOptions` to it; run the CLI suites.
2. `control-inspect/contract.js` and `service.js`: definition (≤ 2048 bytes), parsing via the dispatcher helpers, execute over the four evaluators with the read boundary; return `{ report, presentation }`.
3. `mcp-dispatch-runtime.js`: expose `tools`; `server.js` iterates; `worker-entry.js` routes by name; update protocol and function-contract pins.
4. `service.js`: populate `presentation` for `presentation_required`; extend `outputSchema` description; add dispatch and control-state assertions including digest equality with `run-present`.
5. Skills and contracts: MCP-first read wording; footprint and smoke checks.
6. `sync-package-assets`, parity and snapshot tests, safety scan, `payload:budget --accept`, definition size assertion; record the small-path measurement when a host session is available.

## Completion Boundary

This analysis passes the reuse, ownership and regression-path review and permits the next control step `CD+Tests` once its named precondition (green `control-state-test.js`) holds. It does not claim implementation, test success, package freshness, host behavior, QA readiness or release readiness.
