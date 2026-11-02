# Brownfield Review: Run-Scoped AGDF Control State

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-run-scoped-control-state
- related_ur: .agdf/control/artefacts/agdf-run-scoped-control-state/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-11

## Objective

Identify the existing owners of AGDF run state, determine whether a run-scoped model can reuse the
current gate/runtime machinery, expose migration and parallel-source risks, and select the smallest
safe delivery path after the approved UR.

## Existing-System View

| Area | Existing owner or artefact | Current coverage | Evidence | Impact |
|---|---|---|---|---|
| Runtime semantics | `plugin/meta/agdf-runtime-contract.md` | partially_done | Defines `AGDF_RUN.md` as current dashboard, source precedence, scope ambiguity and gate transitions | high |
| Control schema | `plugin/control/templates/AGDF_RUN.md` | partially_done | Already carries `run_id`, scope evidence, approvals, artefact chain, risks and next action, but only in one global file | high |
| CLI state loading | `create-agdf/bin/create-agdf.js` (`evaluateDoctor`, `readRunState`, gate-check, delivery-map) | partially_done | Central parser and validators can be reused, but they resolve one hard-coded live path | high |
| Scaffold/bootstrap | `create-agdf/bin/create-agdf.js`; `create-agdf/scripts/sync-package-assets.js` | partially_done | `init` writes one live `AGDF_RUN.md`; generated package assets propagate canonical templates | high |
| Delivery Path Search | `create-agdf/lib/delivery-path-search/state-adapter.js` | partially_done | Directly reads `.agdf/control/AGDF_RUN.md` and derives `scope_key` from `run_id` | high |
| Backlog/discovery | `.agdf/control/MASTER_BACKLOG.md`; compact backlog parser | partially_done | Already lists multiple work items and normalizes scope keys, but is not authoritative run-state selection | medium |
| CI | `.github/workflows/agdf-guardrails.yml` | partially_done | Calls repository-level `delivery-map --dir .` without an explicit run selector | high |
| Runtime integrity | `plugin/scripts/check-runtime-integrity.mjs` | partially_done | Validates the canonical template and this repository's single active file | high |
| Tests | `create-agdf/scripts/smoke-test.js` | partially_done | Extensive fixtures cover one `AGDF_RUN.md`; no multi-run discovery, ambiguity or migration fixtures | high |
| Documentation | `INSTALL.md`; `create-agdf/README.md`; `agdf/README.md`; `plugin/control/README.md` | partially_done | User guidance consistently assumes one live `AGDF_RUN.md` | medium |

## Reuse Strategy

- primary_strategy: `refactor`
- reuse: Preserve the existing Markdown field model, gate transition model, approval parser, artefact
  parser, delivery-map analysis and status-card projection behind a run-state repository/resolver.
- extend: Add deterministic run discovery and explicit selection before existing evaluators consume a
  state record.
- replace: Replace only the hard-coded single-path ownership assumption, not the gate model or the
  existing state semantics.
- migration: Convert or adopt a valid legacy `AGDF_RUN.md` into one canonical run-scoped record, then
  derive any compatibility projection from that record.

## Reuse And Parallel-Structure Risks

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| `AGDF_RUN.md` is read directly by more than one runtime path | CLI reader and Delivery Path Search adapter | A new loader added only to one path would fork state semantics | Introduce one shared resolver/loader and migrate all runtime consumers to it |
| The Runtime Contract and template currently declare the global file authoritative | Runtime Contract Control Scaffold and Delivery Map sections | Keeping both legacy and run-scoped files writable would create two sources of truth | Define one canonical owner and make legacy output read-only/derived or migration-only |
| `MASTER_BACKLOG.md` already identifies multiple scopes | Backlog parser and live backlog | Reusing it as mutable run state would overload a steering index and increase contention | Use it only as discovery/evidence; keep run details in isolated records |
| A mutable `ACTIVE_RUNS.md` dashboard could recreate the same conflict | Current global dashboard failure mode | Renaming the shared write slot would not solve concurrency | Keep repository-level discovery compact, deterministic and pointer-oriented; prefer derivation over manual state duplication |
| Existing validators trust first matching fields in one Markdown document | `readRunState` and prior union-merge evidence | Duplicate/contradictory fields can appear valid | Validate uniqueness and reject contradictory records before gate evaluation |
| Released consumers and CI know only the legacy path | package docs, scaffold and workflow | A hard cutover would break existing repositories and older packages | Specify a versioned, idempotent compatibility sequence and mixed-version behavior |

## Compatibility And Migration Impact

- `init` must create the new canonical layout without introducing a second writable owner.
- Existing repositories need an explicit migration/adoption command or deterministic first-read
  migration; silent destructive movement is not acceptable.
- Single-run repositories should retain a zero-ambiguity default, while multiple active runs require an
  explicit selector or deterministic CI policy.
- `doctor`, `gate-check`, `delivery-map` and Delivery Path Search must resolve the same selected record.
- CI needs a defined repository-level mode: evaluate a selected run, all active runs, or fail when the
  policy is unspecified. This is a product decision for PRD, not an implementation detail.
- Older package versions writing the legacy file concurrently with newer versions are a migration
  hazard and require an explicit precedence/error contract.

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: PRD
- scope_reason: The change alters durable state ownership, migration, CLI contracts, CI behavior,
  Delivery Path Search input, package scaffolding, generated cross-surface assets and documentation.
  A quick task or narrow structured slice cannot safely decide canonical authority and mixed-version
  behavior.
- evidence: Existing-System View, Reuse And Parallel-Structure Risks and Compatibility And Migration
  Impact above.
- transparency_note: A focused PRD is required to decide observable behavior and migration guarantees;
  SD and TP remain blocked until their preceding approvals. Implementation is not authorized.

## PRD Open Questions

| Question | Why it is product-level | Required outcome |
|---|---|---|
| What is the canonical run record path and stable identifier contract? | Determines persistence and interoperability | One portable layout with collision and validation rules |
| How is a run selected in interactive CLI, agent-native and CI use? | Changes visible behavior and fail-closed semantics | Explicit precedence and ambiguity behavior |
| What repository-level validation should CI perform with several active runs? | Affects merge/release blocking behavior | Selected-run, all-active or declared-policy contract |
| What is the exact legacy migration and mixed-version contract? | Determines data safety and backwards compatibility | Idempotent steps, precedence, rollback and stale-projection handling |
| Is `AGDF_RUN.md` retained as a generated projection, migration input or deprecated entirely? | Determines whether parallel authority can recur | One non-authoritative compatibility role or removal plan |
| How is same-run concurrent modification detected? | Cross-run isolation does not solve same-run writes | Revision, content identity or explicit conflict contract |

## Test And Verification Impact

- Add focused fixtures for zero, one and several run-scoped records.
- Verify explicit selection, deterministic single-run default and fail-closed ambiguity.
- Verify duplicate `run_id`, conflicting active claims, malformed records and stale projections.
- Verify idempotent legacy migration and mixed legacy/new layouts.
- Run `node plugin/scripts/check-runtime-integrity.mjs` for runtime/template propagation.
- Run `npm --prefix create-agdf run smoke-test` and `npm --prefix agdf run smoke-test` for package and CLI behavior.
- Verify `.github/workflows/agdf-guardrails.yml` against the chosen multi-run CI policy.

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: none yet
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The reusable invariant is that authoritative mutable state must be isolated per
  run and all consumers must share one resolver; the precise architecture awaits approved PRD/SD.

## Brownfield Analysis Decision

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: PRD
- artefact: `.agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_REVIEW.md`
- scope: Run-state ownership, discovery, selection, migration, CLI/CI behavior and cross-surface propagation.
- evidence: Existing owners and direct read paths are identified above; the existing parser and gate model provide a clear reuse base.
- transparency: PRD is required because selection and migration behavior are user- and CI-visible product semantics.
- missing_evidence: No blocker for PRD; implementation details and complete call-site mechanics remain for SD and pre-implementation Brownfield Analysis.
- current_coverage: `partially_done`
- reuse_strategy: `refactor` the hard-coded state loader into one shared resolver, then `extend` discovery and migration around existing evaluators.
- risks: Parallel authority, mutable-index contention, mixed package versions and same-run conflicts.
- context_graph_impact: `new_node_required` with reconciliation deferred until product/design decisions are approved.
- required_next_step: Draft the focused PRD and request `Approval: PRD`.
