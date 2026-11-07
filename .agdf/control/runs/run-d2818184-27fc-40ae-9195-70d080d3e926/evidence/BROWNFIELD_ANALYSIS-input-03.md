# Brownfield Analysis: Companion core in Core (pre-implementation, node-side run view, run selector)

Decision: pass
Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Reviewer: Claude (agent analysis for Arndt Gold)
reviewed_at: 2026-11-05
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Run

- related_tp: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP.md` @ sha256:52a4785df9aeebc5970a8334819775525bb270677963df0655695eb483423330 (approved, revision 31, adds the optional `--run ID` selector)
- related_sd: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md` @ sha256:3a45e45d8a4353aee5e2d1bd74739d4e6d39dfcfce6432326b66d3588dc639b9 (approved, revision 25)
- previous analyses: `BROWNFIELD_ANALYSIS-findings-01.md` (revise, resolved by source revision a76c3178), `BROWNFIELD_ANALYSIS-input-01.md` (pass for the superseded pure split), `T-002-design-finding-01.md` (sizing and native probe, resolved by source revision f007df42)
- retained work: T-001 fixtures, golden baseline and companion regression cases; T-002 `packages/core/lib/companion/run-view.js` with SCN-001 green; T-003 command registration without the selector (branch `feat/companion-core-run-view`, uncommitted)
- previous analysis of this TP family: `BROWNFIELD_ANALYSIS-input-02.md` (pass for TP revision 27); `T-003-plan-finding-01.md` (resolved by TP source revision b6422779)

## Objective

Verify the implementation path of the approved TP (T-002 to T-013) for the node-side run view against the existing system before further CD+Tests work.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Status fields | `evaluateGateCheck` in `packages/core/lib/control-evaluation/gate-check.js` | unchanged; consumed as is (SDD-002) | none |
| Run discovery and diagnosis | `readRunInventory` in `packages/core/lib/control-state/run-inventory-reader.js` and `buildRunInventory` in `run-inventory.js` | discovery, titles, lifecycle counts, ordering, last activity and per-run findings for invalid runs; reads the control layout first | medium |
| Reason codes | `boundedCode` in `packages/core/lib/control-inspect/cockpit.js` | maps `AGDF_CONTROL_LAYOUT_UNSUPPORTED` and `AGDF_RUN_VERSION_UNSUPPORTED` to the MCP reason codes | low |
| Control classification | `projectCockpitAssessment(report, lifecycle)` in `cockpit.js` | read-only projection of the evaluated decision, never a second evaluator | low |
| Existing projection | `createCockpitReader` in `cockpit.js` (Codex cockpit) | heavier per-run detail with documents and resources over the same report | medium |
| Run selector | `packages/cli/lib/cli/parse-args.js` line 162 stores `--run` as a single `runId` (last value wins) | run-view needs every repeated value; collect them into `runIds` and allow repeats only for run-view | low |
| Local command | `command-registry.js` (`project-state` entry), `validateCommandOptions`, `validation-handlers.js` handler map, `runtime/validator-application.js` command set and help text, plugin entry `runtime/agdf-local.js` | reference command with explicit absolute `--dir`, `--json`, `--language` | medium |
| Companion | `plugins/agdf/host-templates/claude/companion/*.mjs`, bridge rewrite in `scripts/sync-package-assets.js` lines 638-640 | `core.mjs`, `state.mjs`, `run-state.mjs` hold the current run logic to be replaced | medium |
| MCP result path | `packages/mcp-server/src/server.js` and `generation-runtime.js` (success and `catch` branches to `projectToolResult`) | unchanged from the previous analysis | medium |
| Tests / QA | T-001 fixtures and golden test; companion suites; `run-view-command-test.js` to be added | golden baseline deterministic, negative probe fails | low |
| Release / operations | Copilot payload headroom 11 files / 207,467 bytes; `node` on PATH required by the SessionStart hook | measured 2026-11-05 | low |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: a new read-only runtime command and a host process call from the companion; no change to the central evaluator
- architecture_evidence: SD SDD-001 to SDD-010 @ sha256:3a45e45d8a4353aee5e2d1bd74739d4e6d39dfcfce6432326b66d3588dc639b9; native probe `T-002-process-probe-01.json`
- architecture_missing_evidence: none
- architecture_next_owner_and_action: CD+Tests implements T-002 to T-013 in TP order

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the run inventory for discovery and diagnosis; no second run discovery | `readRunInventory` already yields titles, lifecycles, findings and ordering | none | T-002 and T-004 build `readRunView` on `readRunInventory` and evaluate only valid active runs with `evaluateGateCheck` |
| Reuse the cockpit reason mapping and control classification | `boundedCode`, `projectCockpitAssessment` in `cockpit.js` | warn | export and reuse them instead of copying; no new classification rules |
| Second projection beside the Codex cockpit reader | `createCockpitReader` projects the same report with document detail | warn | the run view copies report fields verbatim and adds no rule; the Codex run decides whether the cockpit consumes the run view |
| Unsupported layout throws before discovery | `readRunInventory` calls `readControlLayout` | warn | `readRunView` catches the layout error and reports `control_layout_unsupported` as store diagnosis |
| Payload file headroom | 11 files left | warn | new Core code in `companion/run-view.js`, `companion/figure-state.js`, `companion/events.js`; the command handler joins an existing CLI module |

## Implementation Path

1. T-002: `readRunView` on `readRunInventory` plus `evaluateGateCheck` per valid active run inside one captured view; `projectRunView` copies status-card fields verbatim; SCN-001 against the T-001 fixtures; golden stays green.
2. T-003: register `run-view` beside `project-state` (registry, option validation, handler, validator command set and help) with the repeatable `--run ID` passed as `runIds` to `readRunView`; SCN-002 spawns it with `--run` for F01 to F13; confirm `gate-check.js` unchanged.
3. T-004 and T-005: diagnosis reasons and counts, figure state and catalog texts.
4. T-006: companion process adapter, bridge removal, integrity test, T-001 regression cases into `test:claude-companion`; increment 1 checkpoint.
5. T-007 to T-013 as planned.

## Regression Risk And Test Impact

- Status card bytes cannot change through the run view because `gate-check.js` stays untouched; the golden test and an exact `git diff` on that file guard it.
- The companion's visible behavior changes by design (divergence removed); existing companion suites need updated expectations only where they encoded the old self-derived state, without weakening other assertions.
- The new command must not write: covered by the control-digest check in SCN-016.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: no curated node owns the companion or the status card; the SD integration points carry the ownership

## Decision

- decision: pass
- evidence: approved SD and TP above; repository evidence listed in the Existing-System View
- missing_evidence: none for continuing CD+Tests; native evidence follows in T-013
- risks: second projection beside the cockpit, layout error handling, payload headroom; each has a planned action
- required_next_step: continue CD+Tests with T-003 (run selector and SCN-002) on branch `feat/companion-core-run-view`

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP, continuing with T-003
- forbidden_until_then: none beyond the TP order (increment 2 starts only after the increment 1 checkpoint)

## Quality Outlook

- quality_outlook: golden and gate-check diff guard the evaluator; command parity over all 13 fixtures before the companion changes
