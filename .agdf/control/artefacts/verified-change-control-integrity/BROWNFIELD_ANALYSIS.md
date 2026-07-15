# Brownfield Analysis: Verified Change Control Integrity and Proportionality

- mode: `pre_implementation_analysis`
- decision: `pass`
- related_tp: `.agdf/control/artefacts/verified-change-control-integrity/TP.md` revision 1
- date: 2026-07-15

## Scope

Verify the implementation path for VCI-TP-01 through VCI-TP-12 before CD+Tests. The approved slice changes existing AGDF runtime, parser, evaluator, metadata, template, skill, synchronization and regression owners only.

## Existing Coverage

- current_coverage: `partially_done`
- the Runtime Contract already owns Verified Change and native interaction semantics.
- `run-state-parser.js` already centralizes control-table parsing, but applies generic backtick cleanup rather than strict path-cell parsing.
- `create-agdf.js` already owns recognized artefact vocabularies, Verified Change evaluation, status-card derivation and doctor/gate/delivery reports.
- `interaction-presentation.js` already owns immutable approval snapshots, exact outcome normalization and native-attempt orchestration.
- focused control-state, Verified Change, interaction-presentation, runtime-integrity-negative, routing and package smoke harnesses already exist.
- `sync-package-assets.js` already propagates canonical runtime, skills, metadata and templates to derived surfaces.

## Reuse Strategy

- overall: `extend`
- parser: add one strict artefact-path cell parser inside the existing run-state parser; do not create another parser module.
- artefact roles: extend the existing vocabulary inputs with a distinct closeout category and reuse the existing artefact map.
- scope enforcement: extend the current Verified Change evaluator and derive its permitted control paths from the selected run.
- historical evidence: extend the existing compact template and evaluator fields; do not create a second evidence store.
- native capability: add one pure preflight to the existing interaction-presentation module and feed its result into the existing status-card/attempt path.
- workflow: correct canonical runtime/skills and propagate through the existing synchronizer.

## Exact Existing Owners

| Concern | Reused owner | Regression owner |
|---|---|---|
| Path-cell parsing | `create-agdf/lib/control-state/run-state-parser.js` | `create-agdf/scripts/control-state-test.js` |
| Artefact vocabulary, role state and Verified Change lifecycle | `create-agdf/bin/create-agdf.js` | `create-agdf/scripts/verified-change-test.js`; control-state/smoke fixtures |
| Native capability and attempt boundary | `create-agdf/lib/interaction-presentation.js` | `create-agdf/scripts/interaction-presentation-test.js` |
| Canonical interaction metadata | `plugin/meta/agdf-plugin.definition.json` | `plugin/scripts/check-runtime-integrity.mjs`; runtime-integrity negative tests |
| Canonical delivery semantics | `plugin/meta/agdf-runtime-contract.md`; existing workflow skills | runtime integrity and routing tests |
| Compact schema | `plugin/control/templates/artefacts/VERIFIED_CHANGE.md` | Verified Change and package smoke fixtures |
| Generated parity | `create-agdf/scripts/sync-package-assets.js` | routing, repeated-sync and package smoke checks |

## Worktree And Parallel-Structure Check

- tracked implementation-path overlap: none.
- untracked implementation-path overlap: none.
- at analysis time, dirty paths were limited to this run's `.agdf/control/` artefacts and `MASTER_BACKLOG.md`; during CD+Tests, the concurrent `agdf-state-orientation` run added its own control artefacts and backlog pointer.
- `agdf-state-orientation` currently has no implementation-path diff. Its future presentation scope may touch `interaction-presentation.js`, so its control artefacts remain isolated and any later implementation overlap must be reconciled before further writes.
- the completed Pages contact-email files are not dirty and remain outside the implementation boundary.
- no second parser, gate model, adapter authority path, compact-record owner or generated-surface owner is required.

## Compatibility And Regression Impact

- interfaces: internal artefact-entry metadata and gate-check JSON gain additive capability evidence; existing exact approval values and public commands remain unchanged.
- persistence: compact records gain required execution-snapshot fields for new eligible/executed validation; separate Brownfield/OR records remain supported.
- migration: legacy boolean adapter metadata is fail-closed compatibility input only and cannot authorize a native gate.
- legacy control state: legacy `AGDF_RUN.md` fixtures and non-Verified modes must remain readable; missing lifecycle defaults to active validation behavior.
- generated surfaces: canonical changes will touch derived Codex, Copilot and OpenCode outputs through synchronization only.
- tests: existing smoke assertions that equate every ready gate with `native_attempt_required: true` must be refined to supply capability evidence or assert the new fail-closed default.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Strict path parsing changes valid legacy inputs | Accept unchanged plain paths and exactly one complete code span; add explicit compatibility fixtures before implementation. |
| Derived control paths become over-permissive | Require recognized role, explicit selected-run link and same-run directory containment independently. |
| Completed lifecycle skips too much live validation | Skip only later worktree comparison; retain record, ownership, path, impact, propagation, validation and execution-snapshot checks. |
| Capability metadata becomes a second authority | Runtime evidence outranks static metadata; unknown/conflict fails closed; exact response validator remains unchanged. |
| Status-card interaction semantics regress | Decouple `interaction_kind` from native availability and cover eligible/unavailable/non-ready cases independently. |
| Generated drift | Synchronize from canonical sources, rerun synchronization and prove idempotence. |
| Concurrent `agdf-state-orientation` later modifies the same presentation owner | Preserve its control artefacts, keep this run explicitly selected, and re-check implementation-path overlap before every remaining write/review stage. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: approved PRD revision 3, SD revision 1, TP revision 1 and this owner/reuse analysis.

## Missing Evidence

- none blocking before implementation.
- implementation and regression results remain intentionally missing until CD+Tests.
- Context Graph invariants are updated; final review evidence must confirm the implementation matches them.

## Required Next Step

Implement VCI-TP-01 through VCI-TP-12 through the existing owners, run the approved validation bundle, then perform Task Plan Review, Clean Implementation Review and Code Review before QA.
