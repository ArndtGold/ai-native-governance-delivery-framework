# Brownfield Review: Review-Befunde zu Schreibintegrität und Auslieferung beheben

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-review-remediation-20260929-01`
- related_ur: `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UR.md` (approved, revision 3)
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-09-29

## Objective

Route the approved review remediation without transferring approvals from other runs: restore crash and concurrency safety in the control store and host installers, then make the coupled release path and distributed contracts verifiable. The reviews are issue leads; their unexecuted and inferred claims require focused reproduction before correction.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: Control-state recovery, installer failure and release feedback span several working modes and hosts. A wrong effective-state or recovery message can lead to a destructive retry or a false claim of readiness. Approval authority must remain human and run-bound.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence: `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UX_INTENT_DEFINITION.md`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Runtime contracts and focused quality/gate modules | `plugin/meta/contracts/`, `create-agdf/lib/control-evaluation/`; P1–P4 are contract and projection findings, not a reason to create another policy source. | `high` |
| Source of truth | Run-state writer, version-coherence descriptors, plugin definition and SOT registry | `create-agdf/lib/control-state/`, `create-agdf/lib/release/version-coherence.js`, `.agdf/control/SOT_REGISTRY.md`; the review found gaps around multi-file updates and one lockfile. | `high` |
| Runtime path | Existing CLI, MCP read runtime, local marketplace and lifecycle | `create-agdf/lib/cli/`, `create-agdf/lib/installers/`, `create-agdf/lib/lifecycle/`, `create-agdf/lib/mcp-lifecycle/`; reuse their provenance and transaction owners. | `high` |
| UI / UX | CLI status and recovery presentations; user-facing README, INSTALL, privacy and terms | `create-agdf/lib/lifecycle/presentation.js`, `README.md`, `INSTALL.md`, `PRIVACY.md`, `TERMS.md`; effective state and next action need truthful wording. | `high` |
| Persistence / data | Sealed `RUN_STATE.md`, OR/Backlog artefacts, host configuration and owned marketplace trees | `create-agdf/lib/control-state/run-steps.js`, `run-state-writer.js`, `create-agdf/lib/installers/local-marketplace.js`, `create-agdf/lib/lifecycle/operations.js`; C1–C7 cover abort, concurrency, stale lock and ownership boundaries. | `high` |
| Tests / QA | Focused control, installer, package and release suites | `create-agdf/scripts/{control-state,run-revision,local-marketplace,lifecycle,release-version-coherence,package-contents}-test.js`, `.github/workflows/agdf-guardrails.yml`; add failure injection to existing suites. | `high` |
| Release / operations | One coupled workflow, legacy standalone workflow, npm package manifests and lockfiles | `.github/workflows/publish-agdf.yml`, `publish-create-agdf.yml`, `RELEASE.md`, `agdf/package-lock.json`; release preparation is technical validation, not QA/UAT authority. | `high` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `high`
- architecture_reason: The control store's failure and concurrency boundary, installer ownership at execution time, public package composition and cross-host activation are affected. A local reorder of two writes is insufficient to define a consistent multi-file result.
- architecture_evidence: `run-steps.js` writes OR before guarded run persistence and Backlog afterward; `run-state-writer.js` uses a persistent lock file; `lifecycle/operations.js` directly writes and recursively removes plan targets; `local-marketplace.js` distinguishes stage, stable and backup roots; the two publish workflows have independent tag triggers.
- architecture_missing_evidence: Fault-injection and concurrent execution results for C1–C7; exact installed-host impact and npm release behavior are not established by the reviews.
- architecture_next_owner_and_action: PRD binds outcomes and ownership per workstream; SD selects one recovery model per existing store or installer owner; TP assigns focused reproduction and negative tests before implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: control-state writes span Run, OR and Backlog without one recoverable outcome | `run-steps.js`; existing `run-state-writer.js` seal, revision and atomic single-file writer | `revise` | Extend the control-state owner; specify the unit of work and recovery before changing write order. |
| problem: host writes and deletes have different ownership and atomicity guarantees | `lifecycle/operations.js`, `installers/opencode.js`, `installers/local-marketplace.js`, existing `mcp-lifecycle` transaction | `revise` | Reuse existing ownership and transaction primitives; do not add an independent generic installer policy. |
| unresolved: C7 overlaps a QA-revise historical marketplace run | `legacy-profile-upgrade-recovery` owns historical profile upgrade and Windows cache recovery; `local-marketplace.js` is shared | `revise` | PRD allocates C7 to exactly one run and records the other as dependency/evidence; no approval transfer. |
| unresolved: B5 overlaps an active package-payload PRD | `agdf-npm-package-payload-cleanup` owns runtime-complete package composition; this UR requires LICENSE/NOTICE content | `revise` | PRD identifies one package-content implementation owner and one shared test; coordinate without parallel manifests. |
| problem: rule prose and projected guards can drift | `request-activation.md`, `instruction-footprint.mjs`, generated skill guards; Review v2 P1–P4 | `revise` | Keep the normative contract and projection owner; make installed-path validity and exact projections testable. |
| trade-off: published 0.14.5 and current source have different MCP capabilities | Tag `agdf-v0.14.5` predates `agdf_inspect`; current source and `agdf-mcp-inspect-slice1-20260929-01` are unreleased | `warn` | Preserve released-versus-source language and keep the slice's QA/UAT separate from this remediation. |

### Retained Debt Detail (only when applicable)

- finding: trade-off: published 0.14.5 and current source have different MCP capabilities
- rationale: The version number is unchanged on a development branch while new behavior awaits the next governed release.
- accountable_owner: Release owner in `.github/workflows/publish-agdf.yml` and `RELEASE.md`.
- mitigation: Documentation names the version boundary; package and host claims are checked against an exact tag or installed bundle.
- review_date_or_exit_condition: Resolve on the next versioned release and its exact package/host evidence.

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `architecture_runtime_depth`: durable concurrency, abort recovery and ownership checks change beyond a local slice; `release_cross_host_depth` and `external_contract_depth` also apply to the coupled npm workflow, plugin payload and host-facing recovery. Rejected `structured_slice` because independently owned stores, public packages and host adapters require coordinated acceptance and release evidence.
- evidence: Approved UR; `run-steps.js`, `run-state-writer.js`, `local-marketplace.js`, `lifecycle/operations.js`, `version-coherence.js`, `.github/workflows/publish-{agdf,create-agdf}.yml`; Review v2 C1–C7/B1–B5/P1 and Review v3 A1/A4/A9.
- transparency_note: Quick Task and Verified Change cannot carry new failure-recovery, ownership, public-package and release contracts. The remediation is staged within one structured delivery; PRD must name one owner for every overlap before TP.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `architecture_runtime_depth`
- decisive_full_depth_triggers: `architecture_runtime_depth`, `persistence_migration_depth`, `external_contract_depth`, `release_cross_host_depth`
- rejected_alternative: `structured_slice` — control-state unit of work, installer ownership and public release effects cross local recovery and consumer boundaries.
- missing_or_conflicting_facts: No uncertainty about full-depth routing; failure reproductions, exact recovery design and overlapping run ownership remain PRD/SD/TP work.
- depth_evidence_refs: `create-agdf/lib/control-state/run-steps.js`, `run-state-writer.js`, `create-agdf/lib/installers/local-marketplace.js`, `create-agdf/lib/lifecycle/operations.js`, `.github/workflows/publish-agdf.yml`, `.github/workflows/publish-create-agdf.yml`, `.agdf/control/runs/legacy-profile-upgrade-recovery/RUN_STATE.md`, `.agdf/control/runs/agdf-npm-package-payload-cleanup/RUN_STATE.md`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `fail` | The UR combines several separately acceptable remediation outcomes, so it needs workstream ownership and ordered acceptance under structured delivery. |
| authority_boundary | `fail` | Control-state approval and installer ownership are safety-relevant boundaries; they require full-depth decisions. |
| owner_consumer_coordination | `fail` | Existing QA and PRD runs overlap marketplace and package owners. |
| full_depth_impacts_absent | `fail` | Concurrency, persistence, public packages and release behavior are directly affected. |
| migration_propagation_bounded | `unknown` | PRD/SD must decide whether recovery metadata or compatibility migration is needed. |
| failure_recovery_local | `fail` | OR/Backlog and marketplace backup recovery span multiple files or steps. |
| independently_acceptable | `fail` | A single small slice cannot justify the combined release-readiness claim. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which confirmed C-failure paths are required in this run, and which must be routed to an existing run (especially C7)? | `PRD` | `revise` |
| Which package owner changes LICENSE/NOTICE and package-content validation without duplicating `agdf-npm-package-payload-cleanup`? | `PRD` | `revise` |
| What externally observable state and recovery message must users see after a failed run-step, installer operation or partial publish? | `PRD` | `revise` |
| What unit of work and recovery protocol keeps Run, OR and Backlog consistent under stale revision, concurrency and crash? | `SD` | `revise` |
| How does a stale lock become recoverable without allowing a live writer to be displaced? | `SD` | `revise` |
| Which exact fault points, OS path forms, symlink swaps and npm package inventories constitute sufficient regression evidence? | `TP` | `revise` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`, `CG-CREATE-AGDF-CLI-COMPOSITION`, `CG-PUBLIC-PLUGIN-DISTRIBUTION`, `CG-REQUEST-ACTIVATION-AUTHORITY`, `CG-MCP-DISPATCH-ADAPTER`
- context_graph_required_action: `link`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The review reuses these existing decision owners. PRD/SD must update an existing node if a new recovery or contract decision materially changes its invariant.

## Next Permissible Step

- next_allowed_action: Draft the structured-delivery PRD with workstream ownership, observable failure/recovery outcomes and bounded acceptance criteria; use the ready UX Intent Definition as input.
- forbidden_until_then: No SD, TP, implementation, QA or release for this run before their exact required approvals.

## Quality Outlook

- quality_outlook: Require deterministic failpoint and concurrent-writer evidence, complete package inventories and exact host observations; keep tests, QA, UAT and release claims separate.
