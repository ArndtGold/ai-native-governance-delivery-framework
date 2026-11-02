# Brownfield Review: Modularize the create-agdf CLI Entry Point

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: create-agdf-cli-modularization
- related_ur: `.agdf/control/artefacts/create-agdf-cli-modularization/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-16

## Objective

Size and route the approved behaviour-preserving modularization of
`create-agdf/bin/create-agdf.js`, identify existing owners and regression boundaries,
and select the smallest delivery path that can safely change the published CLI core.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Runtime Contract and current CLI behaviour | `plugin/meta/agdf-runtime-contract.md`; `create-agdf/bin/create-agdf.js` | `medium` |
| Source of truth | CLI entry point plus focused existing libraries | `create-agdf/bin/create-agdf.js`; `create-agdf/lib/` | `high` |
| Runtime path | Published `create-agdf` executable and `@agdf/cli` wrapper path | `create-agdf/package.json`; `create-agdf/scripts/release-bootstrap-smoke-test.js` | `high` |
| UI / UX | Human CLI output and status-card presentation | `create-agdf/bin/create-agdf.js`; `create-agdf/lib/interaction-presentation.js` | `medium` |
| Persistence / data | Generated repository files and canonical run-state library | `generatedFilesForTarget()`; `create-agdf/lib/control-state/` | `medium` |
| Tests / QA | Subprocess-heavy package smoke, control-state and focused library tests | `create-agdf/scripts/smoke-test.js`; `control-state-test.js`; focused test scripts | `high` |
| Release / operations | Published package file boundary includes all of `bin` and `lib` | `create-agdf/package.json` | `medium` |

## Current Coverage

| Concern | Coverage | Evidence |
|---|---|---|
| Canonical control-state ownership | `fully_done` | `create-agdf/lib/control-state/` is already modular and directly tested. |
| Delivery Path Search ownership | `fully_done` | `create-agdf/lib/delivery-path-search/` is already modular and directly tested. |
| Shared interaction presentation | `fully_done` | `create-agdf/lib/interaction-presentation.js` owns locale/presentation helpers. |
| Command registry | `not_done` | Target list, usage text, validation message and `main()` dispatch are separate declarations. |
| Argument parsing seam | `not_done` | `parseArgs()` directly prints and exits the process. |
| Installer ownership | `not_done` | Codex, Claude and OpenCode installation/status logic remains in the entry point. |
| Scaffold ownership | `not_done` | Generated-file planning, overwrite policy and next-step rendering remain in the entry point. |
| Doctor/gate/delivery-map evaluation ownership | `partially_done` | Control-state primitives are modular, but evaluation and transition policy remain in the entry point. |
| Behavioural regression evidence | `fully_done` at CLI boundary, `partially_done` at module boundary | Broad subprocess suites exist; extracted seams need focused unit coverage. |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Existing `control-state`, `delivery-path-search` and presentation libraries already own core concerns. | `create-agdf/lib/` | `block` if duplicated | Extract orchestration around them; do not copy or wrap them into competing domain models. |
| Package publication already includes the entire `lib` directory. | `create-agdf/package.json` | `none` | Keep the executable path and exports unchanged; place new internal modules under `lib/`. |
| Active `installer-output-parity` owns Windows/actionable installer behaviour. | Its UR and RUN_STATE | `warn` | Move current installer behaviour verbatim; exclude error-classification and Windows fixes. |
| Active decision/status runs reference the current CLI presentation path. | `agdf-human-decision-surface`; `agdf-state-orientation` run state | `warn` | Treat current HEAD behaviour as baseline and preserve presentation contracts byte-for-byte where practical. |
| Existing tests call the executable as a subprocess. | `smoke-test.js`; `control-state-test.js` | `warn` | Retain end-to-end tests and add direct tests only for new pure seams. |
| A single generic `utils.js` or duplicate `cli-core.js` would merely relocate the monolith. | Current responsibility inventory | `revise` | Define cohesive modules with one owner and explicit dependencies in SD. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: The approved scope changes the internal architecture of the published CLI across command discovery, parsing, installation, scaffolding, doctor evaluation, gate policy and delivery-map evaluation. Although public behaviour must remain unchanged, the change affects multiple runtime owners, package composition, subprocess boundaries and high-value governance decisions. This is broader than one bounded presentation or parser slice and requires explicit product requirements, dependency design and a staged task/test plan.
- evidence: 3,342-line executable; largest functions are `transitionDecisionForRunState` (249 lines), `evaluateDoctor` (238), `parseArgs` (177) and `main` (135); existing `lib/` modules demonstrate the repository convention for directly testable domain owners; package smoke is 2,810 lines and control-state regression is 676 lines.
- transparency_note: Quick Task and Verified Change are ineligible because the work changes code architecture and multiple runtime owners. A structured slice would understate the cross-cutting published-CLI and regression impact. Structured Delivery is selected, but artefacts should remain compact and must not redesign existing semantics.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which responsibility groups are mandatory in the first delivery, and which can remain in the composition root without defeating the goal? | `PRD` | `block` |
| What exact public output and exit-code compatibility matrix must be frozen? | `PRD` | `block` |
| How is one command registry shaped so it owns recognition/help/dispatch metadata without owning domain policy? | `SD` | `block` |
| How are generated metadata, environment variables, filesystem and subprocess dependencies injected without changing initialization timing? | `SD` | `block` |
| What extraction order avoids circular dependencies between doctor, gate-check, delivery-map and presentation? | `SD` | `block` |
| Which direct module tests complement rather than duplicate the existing subprocess suite? | `TP` | `revise` |

## Minimal Clean Path

1. Freeze the public compatibility matrix and mandatory module boundaries in PRD.
2. Design an acyclic dependency direction from executable composition root to CLI modules to existing domain libraries.
3. Extract pure command metadata and argument parsing first, then side-effecting installers/scaffolding, then diagnostic/gate evaluators.
4. Keep each extraction behaviour-preserving and continuously covered by existing subprocess tests.
5. Finish with a thin executable that only composes dependencies, dispatches one selected command and maps results to process exit state.

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`; `CG-RUN-STATUS-CARD`; `CG-DELIVERY-PATH-SEARCH`
- context_graph_required_action: `create`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes cover individual CLI domains, but none records the reusable overall CLI composition-root and dependency-direction boundary. Create a curated node only at OR after the architecture is approved and delivered.

## Missing Evidence

- Exact command/output/exit compatibility matrix.
- Approved module/dependency design.
- Direct unit-test strategy for parser, registry and injected side-effect boundaries.
- Full smoke evidence after extraction.
- Native Windows execution remains unverified and is not silently claimed by this refactor.

## Next Permissible Step

- next_allowed_action: Draft a compact PRD for the behaviour-preserving modularization and request exact `Approval: PRD`.
- forbidden_until_then: SD, TP and implementation before PRD approval.

## Quality Outlook

- quality_outlook: Highest risk is semantic drift hidden inside mechanical movement; the delivery must prove command, output, exit-code, generated-file and gate-decision compatibility at every extraction boundary.
