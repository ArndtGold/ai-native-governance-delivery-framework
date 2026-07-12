# Brownfield Analysis: Run-Scoped AGDF Control State

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: done
Decision: pass

## Run

- run_id: agdf-run-scoped-control-state
- related_tp: .agdf/control/artefacts/agdf-run-scoped-control-state/TP.md
- reviewer: agent
- reviewed_at: 2026-07-11

## Objective

Verify that the approved Task/Test Plan has one clean reuse path through the existing runtime, identify
every implementation owner and regression surface, preserve the current worktree/index boundary, and
confirm whether CD+Tests may begin without creating parallel state or gate semantics.

## Existing Ownership And Coverage

| Area | Existing owner | Coverage | Reuse decision | Implementation boundary |
|---|---|---|---|---|
| Gate semantics | `plugin/meta/agdf-runtime-contract.md` | fully_done for current single-run model | extend | Add run selection/authority rules; do not duplicate the transition table elsewhere |
| Markdown normalization | `create-agdf/bin/create-agdf.js::readRunState` and parsing helpers | partially_done | refactor | Extract behind shared parser while preserving normalized fields and legacy characterization |
| Doctor | `create-agdf/bin/create-agdf.js::evaluateDoctor` | partially_done | extend | Keep repository scaffold checks; inject selected/all-active normalized records |
| Gate check | `create-agdf/bin/create-agdf.js::evaluateGateCheck` | partially_done | extend | Keep existing evaluator; replace only state acquisition |
| Delivery map | `create-agdf/bin/create-agdf.js::analyzeDeliveryMap` | partially_done | extend | Evaluate existing logic per run, then aggregate outside the gate model |
| Delivery Path Search | `create-agdf/lib/delivery-path-search/state-adapter.js` | partially_done | refactor | Remove direct legacy file read and consume shared resolver output |
| Scaffold writes | `generatedFilesForTarget`, `liveControlFiles`, `writeGeneratedFile` | partially_done | extend | Add canonical template/layout and dedicated safe run writer; do not overload generic overwrite behavior |
| Package propagation | `create-agdf/scripts/sync-package-assets.js` | fully_done as generation mechanism | reuse | Change canonical source first, then regenerate |
| Runtime integrity | `plugin/scripts/check-runtime-integrity.mjs` | partially_done | extend | Validate new canonical template/ownership and legacy compatibility rules |
| CLI tests | `create-agdf/scripts/smoke-test.js` plus delivery-path tests | partially_done | extend | Characterize legacy behavior before adding multi-run/migration fixtures |
| CLI wrapper | `agdf/bin/agdf.js` and `agdf/scripts/smoke-test.js` | partially_done | extend | Verify option/command forwarding and package-visible help |
| CI | `.github/workflows/agdf-guardrails.yml` | partially_done | extend | Change delivery validation to all-active only after command behavior is covered |
| Documentation | `INSTALL.md`, `create-agdf/README.md`, `agdf/README.md`, `plugin/control/README.md` | partially_done | update | Remove single-authority claims and describe migration without creating doc-owned semantics |

## Direct Call-Site Map

- `create-agdf/bin/create-agdf.js` owns the live control file lists, scaffold creation, doctor required
  paths, the only CLI `readRunState` parser, doctor/gate-check/delivery-map entry points and Delivery
  Path Search invocation.
- `create-agdf/lib/delivery-path-search/state-adapter.js` is the only separate runtime direct reader of
  `.agdf/control/AGDF_RUN.md` found outside the CLI monolith.
- `plugin/scripts/check-runtime-integrity.mjs` directly validates the canonical template and this
  repository's current legacy live record.
- `.github/workflows/agdf-guardrails.yml` invokes repository-level delivery-map without a selector.
- `create-agdf/scripts/smoke-test.js` contains all current live-state fixture writes and must remain the
  primary integration regression surface.
- Generated package files contain copied references but are derived; they are not implementation
  owners.

## Clean Reuse Path

1. Freeze output/finding contracts and characterize the current legacy parser.
2. Extract parser and normalized state without changing evaluators.
3. Add repository discovery, strict v2 validation and selection around that normalized state.
4. Inject resolved state into existing doctor, gate-check, delivery-map and Delivery Path Search paths.
5. Add atomic writes, creation, explicit migration and explicit compatibility rendering only after read
   equivalence is proven.
6. Propagate canonical runtime/template changes through existing sync and integrity mechanisms.

This sequence prevents a temporary second parser, selector or gate model.

## Worktree And Index Boundary

Observed before implementation:

- staged: new approved-scope `UR.md` and `BROWNFIELD_REVIEW.md`
- unstaged: `AGDF_RUN.md`, `MASTER_BACKLOG.md`, deletion of the superseded scaffold-only UR
- untracked: `PRD.md`, `SD.md`, `TP.md` and this Brownfield Analysis
- product/runtime source files: unchanged

All observed control changes belong to this run. Implementation must preserve the current staging
boundary: no reset, checkout, broad staging, formatting sweep or generated-output cleanup may absorb
or discard them. Source implementation should be reviewed separately from control artefacts.

## Compatibility And Regression Risks

| Risk | Effect | Required control |
|---|---|---|
| Parser extraction changes legacy normalization | block | Golden characterization before extraction; identical normalized fixtures afterward |
| CLI and Delivery Path Search resolve runs differently | block | One exported resolver API and cross-consumer selection fixtures |
| Generic scaffold writer is reused for optimistic run updates | block | Dedicated atomic run-state writer with token checks |
| Legacy and canonical files both become writable | block | Mixed-authority detection and explicit-only projection rendering |
| All-active aggregation becomes a second gate model | block | Aggregate existing per-run decisions only; no cross-run approval inference |
| Generated copies edited directly | revise | Source-first changes plus sync and integrity checks |
| Existing `merge=union` guidance leaks to canonical records | block | Explicit attribute/docs tests and same-run conflict simulation |
| Current staged control state is overwritten | block | Preserve index boundary and verify status throughout implementation |
| Package wrapper drops new arguments | revise | Wrapper forwarding/help smoke tests |

## Test Impact

- Add a focused control-state test script rather than expanding every case inline in the already large
  smoke test; wire it into the existing `smoke-test` command.
- Keep current smoke fixtures as legacy characterization during the compatibility release.
- Add subprocess integration coverage for commands/options and direct unit coverage for library modules.
- Use temporary repositories for Git conflict, symlink, atomic-write and migration failure fixtures.
- Capture before/after checksums for every read-only and failed-write path.

## Parallel-Structure And SoT Check

- parallel_structure_risk: controlled
- canonical runtime policy remains `plugin/meta/agdf-runtime-contract.md`.
- canonical state parsing/resolution will have one owner under `create-agdf/lib/control-state/`.
- existing evaluators remain authoritative for gate and delivery decisions.
- `MASTER_BACKLOG.md`, legacy projections, generated copies and surface instructions remain secondary.
- stop_condition: If implementation requires a second parser/evaluator, an automatically maintained
  global active index, or silent mixed-authority precedence, stop and return to SD.

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: none yet
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Approved PRD/SD establish reusable invariants; TP RSC-18 owns the node before
  QA/closeout.

## Brownfield Analysis Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: none
- artefact: `.agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_ANALYSIS.md`
- scope: Approved TP RSC-01 through RSC-20.
- evidence: Direct runtime, package, test, workflow, documentation and worktree/index inspection above.
- transparency: Existing gate evaluation and package generation are reused; only state ownership,
  selection, migration and aggregation are added/refactored.
- missing_evidence: No implementation blocker; complete output field names and direct write mechanics
  are intentionally frozen by RSC-01 fixtures before behavior changes.
- current_coverage: `partially_done`
- reuse_strategy: `refactor` state parsing/acquisition into one core, then `extend` existing evaluators,
  scaffold, tests and docs.
- risks: Parser regression, split authority, hidden same-run conflicts, wrapper forwarding and staged
  control-state damage.
- context_graph_impact: `new_node_required`, owned by RSC-18 before QA.
- required_next_step: Begin CD+Tests with RSC-01 contract fixtures, preserving the current staging boundary.
