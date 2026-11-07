# Brownfield Analysis: Companion core in Core (pre-implementation)

Decision: pass
Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Reviewer: Claude (agent analysis for Arndt Gold)
reviewed_at: 2026-11-05
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Run

- related_tp: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP.md` @ sha256:974adb56efb667fa7ea2e0ebc89f9f72d7cf71be7d699ec565d5e191652b4045 (approved, revision 21)
- related_sd: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md` @ sha256:e46bc4d06d5237d44de8db24859d0f11b667419c72308a7dfdfd6e58a18c5360 (approved, revision 19)
- previous attempt: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/evidence/BROWNFIELD_ANALYSIS-findings-01.md` (revise, B1 and B2), resolved through source revision a76c3178-86b4-4e9d-a0a3-e9169869bd24 and renewed SD and TP approvals

## Objective

Verify the implementation path of the approved TP (T-001 to T-013) against the existing system before CD+Tests: owners, reuse, affected interfaces, regression risk, test impact and the minimal clean path.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Status fields | `evaluateGateCheck` and `buildStatusCard` in `packages/core/lib/control-evaluation/gate-check.js` | lines 323-697: doctor override, readiness, traceability, decision content, next step, status card | high |
| Run-state preparation | `prepareRunContentState` in `run-state.js` with `presentation-decision.js`, `evidence-bindings.js`, `qa-deviation-acceptance.js`, `closeout-readiness.js` | imports `node:crypto`, `control-read/fs.js`; already accepts an injected `readArtefact` reader | high |
| Pure gate policy | `gate-policy-pure.js` (`createGatePolicy`), `run-state-policy.js`, `run-state-document.js` | already bridged into the companion through `plugins/agdf/host-templates/claude/companion/core.mjs` | medium |
| Doctor | `evaluateDoctorWithRunState` in `doctor.js` | node-bound (seal, inventory, transactions); stays node-side as captured fact (SDD-002) | medium |
| MCP result path | `packages/mcp-server/src/server.js` line 139 and `generation-runtime.js` line 75 (success), `catch` branches to `projectToolResult` (failure) | final projection serves both paths (SDD-006) | medium |
| Plugin data root | `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (`CLAUDE_PLUGIN_DATA`, Codex argument) | not yet in the dispatch runtime context; hand-over needed for T-008 | low |
| Material store | `packages/core/lib/control-state/run-material.js` seal | seal validates bytes and digests; preview computed there (SDD-008) | low |
| Companion | `plugins/agdf/host-templates/claude/companion/*.mjs`, `scripts/sync-package-assets.js` lines 638-640 | bridge rewrite of `core.mjs` imports; `register.mjs` reads the interaction catalog at runtime and polls every 30 s | medium |
| Texts | `plugins/agdf/meta/agdf-interaction-locales.json`, `companion/locales.json` (5,288 bytes) | catalog validator `packages/core/lib/interaction-catalog-validation.js` | low |
| Tests / QA | `test:claude-companion`, gate-check and status-card suites, MCP server suites, `test:payload-budget` | fixture factories use `randomUUID` | medium |
| Release / operations | Copilot payload baseline | 442 of 453 files, 4,510,405 of 4,717,872 bytes | medium |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: shared Core owner for status fields, a new runtime-to-host notification channel and the companion bridge; all decided in the approved SD revision
- architecture_evidence: SD SDD-001 to SDD-010 @ sha256:e46bc4d06d5237d44de8db24859d0f11b667419c72308a7dfdfd6e58a18c5360; findings B1 and B2 in the previous attempt
- architecture_missing_evidence: none
- architecture_next_owner_and_action: CD+Tests implements T-001 to T-013 in TP order

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the pure gate policy path; no second policy | `core.mjs` already imports `gate-policy-pure.js` | none | T-003 builds `run-view.js` on `createGatePolicy` |
| Reuse the injected reader of `prepareRunContentState` | `run-state.js` signature `{ readArtefact }` | warn | T-002 adds an injected hash and moves `node:crypto`/`fs` use behind it instead of copying the preparation |
| Central `digest` uses `node:crypto` | `approval-command-contract.js` line 15 | warn | pure modules receive the hash function; node keeps `digest` unchanged |
| Catalog loaded via `fs` in `resources/context.js` | line 19 | none | pure modules take the catalog as input, as `register.mjs` already does |
| Journal write must not duplicate between facade and generation | generation proxy has no `postprocessToolResult` (`generation.js` line 244) | warn | T-008 writes once in the executing process; SCN-021 asserts no duplicate |
| Payload file headroom | 11 files left | warn | bundle new Core code into few modules; budget re-record only after an owner decision |

## Implementation Path

1. T-001 on unchanged code: fixtures F01 to F13 (F08 from an archived v2 RUN_STATE, F13 with a broken seal in a temporary directory), golden snapshots with exact-token normalization and sorted run lists, failing companion regression cases.
2. T-002 then T-003: extract pure rules with injected hash and captured doctor findings; evaluators keep signatures and delegate; status card reads the projection; golden comparison after each step.
3. T-004 to T-006: diagnosis, figure state and catalog texts, companion bridge and integrity test; increment 1 checkpoint (SCN-001 to SCN-004, SCN-006, SCN-016, SCN-017, SCN-020).
4. T-007 to T-011: events, journal at the final result projection with data-root hand-over, review facts and SHA-256, companion polling, host-neutral harness.
5. T-012 and T-013: rebuild, payload and compatibility, full regression, native Claude desktop check.

## Regression Risk And Test Impact

- Highest risk: byte drift of the status card in CLI and MCP during T-002; guarded by the T-001 golden baseline before any source change.
- MCP results must stay byte-identical with and without journal (SCN-010, SCN-021).
- Existing suites stay unchanged; no assertion is weakened (SCN-018).

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: no curated node owns the companion or the status card; the SD integration points carry the ownership

## Decision

- decision: pass
- evidence: approved SD and TP above; repository evidence listed in the Existing-System View
- missing_evidence: none for starting CD+Tests; native evidence follows in T-013
- risks: status card byte drift, payload file headroom, journal duplication; each has a planned check
- required_next_step: start CD+Tests with T-001 on a feature branch cut from main 53e8e900

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP, starting with T-001 on unchanged code
- forbidden_until_then: none beyond the TP order (increment 2 starts only after the increment 1 checkpoint)

## Quality Outlook

- quality_outlook: golden baseline first, increment checkpoint before events, payload measured before Code Review
