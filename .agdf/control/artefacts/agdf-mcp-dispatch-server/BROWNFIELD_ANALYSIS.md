# Brownfield Analysis: Cross-Host AGDF Dispatch Through MCP

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-mcp-dispatch-server/BROWNFIELD_ANALYSIS.md`
- run: `agdf-mcp-dispatch-server`
- revision: 2
- based_on: approved TP Revision 2, SD Revision 3 and PRD Revision 4
- source_baseline: `d0d4d9ff822f52521675a20bf49d7ae969978bd8`
- scope: Revalidate the existing local MCP adapter, separate package, project-first host lifecycle
  and evidence classification against approved TP Revision 2 without creating another owner or
  repeating already completed direct-host work.
- evidence: Direct inspection of the final semantic contract, dispatcher service, locale owner,
  read boundary, SDK v2 server, worker, package lifecycle, Codex/Claude/OpenCode adapters, release
  workflow, focused and aggregate tests, retained direct-host evidence and controlled protocol runs.
- transparency: This analysis passes because TP Revision 2 changes evidence decomposition only.
  The existing implementation and its canonical owners remain the minimal clean path. CD+Tests may
  now refresh classifications and validation before renewed reviews. This does not grant QA, UAT,
  publication, release or VCS authority.
- missing_evidence: none for the approved TP Revision 2 scope. OpenCode 2.x, native Linux/Windows and
  authenticated Claude model behavior remain explicit unclaimed future evidence lanes.

## Revision 2 Revalidation

| Concern | Current coverage | Reuse decision | Evidence |
|---|---|---|---|
| semantic function and dispatcher | `fully_done` | reuse canonical `skill-dispatch/contract.js` and `service.js` | schema/dispatcher suites, exact terminal transfer and fail-closed target behavior |
| protocol and process adapter | `fully_done` | reuse the separate SDK v2 server and bounded worker | both controlled protocol generations, contract, safety, provenance and performance suites |
| read and authority boundary | `fully_done` | reuse the narrow read-only runtime graph | static closure, runtime sentinels and unchanged `authorizes: false` semantics |
| package and lifecycle | `fully_done` | reuse exact-version acquisition and transactional adapters | package, release, rollback and direct cleanup evidence |
| host qualification | `fully_done` for the approved first-release claim | reuse direct OpenCode and Codex observations as the host lane | exact host tuples pass required observable behavior; selected protocol telemetry is optional under TP2 |
| protocol compatibility | `fully_done` | reuse controlled clients as the independent protocol lane | MCP `2026-07-28` and `2025-11-25` negotiate against the production definition |
| approval presentation | `fully_done` | keep the canonical locale registry and dispatcher sequence serializer | PRD, SD and TP German gate regressions plus non-empty terminal `host_action.text` |

- current_coverage: all TP Revision 2 implementation paths have an existing owner and evidence path.
- reuse_strategy: `extend` only the canonical locale/test owners when a standard gate value lacks
  coverage; otherwise reuse the delivered MCP implementation unchanged.
- parallel_structure_risk: none. No second semantic schema, dispatcher, target resolver, renderer,
  approval store, protocol server, lifecycle owner or host evidence substitute is introduced.
- regression_risk: localized internal gate values, generated payload parity and final aggregate
  validation must be refreshed before review.
- context_graph_impact: `update_existing_node`; `CG-MCP-DISPATCH-ADAPTER` already records the two
  evidence lanes and exact remaining support limits.
- required_next_step: refresh CD+Tests against TP Revision 2, then run Task Plan Review, Clean
  Implementation Review, Code Review and QA.

## Historical Revision 1 Implementation Preparation

## 1. Current Coverage

| TP area | Current state | Evidence | Consequence |
|---|---|---|---|
| MCP-TP-03 semantic definition | `partially_done` | `skill-dispatch/contract.js` already owns tool name, purpose, input JSON Schema, surface/target vocabulary, validation, versions and serializer. | Extend this owner with output schema, annotations and wire mapping. Do not add an MCP schema file. |
| MCP-TP-04 dispatcher runtime export | `partially_done` | `skill-dispatch/service.js` already composes target, control, presentation, continuation and terminal behavior. `plugin-provenance.js` already owns deterministic digest and installation checks. | Extract a narrow public composition and pure provenance path; preserve CLI exports. |
| MCP-TP-05/06 server package and protocol | `not_done` | No MCP package, SDK dependency, server entrypoint or protocol test exists. | Create only the approved separate package. |
| MCP-TP-07 trusted context | `partially_done` | The dispatcher currently derives runtime evidence from mutable `AGDF_DISPATCH_*` environment values. Generated CLI bindings already supply those values. | Add immutable injected evidence for the MCP path while retaining the existing CLI compatibility adapter. Environment is not an MCP identity owner. |
| MCP-TP-08 worker lifecycle | `not_done` | Existing dispatch is synchronous and has no connection-level concurrency, cancellation or worker owner. | Add one worker boundary in the MCP package only. |
| MCP-TP-09 read-only closure | `partially_done` | Dispatcher dependencies are read-oriented, and runtime provenance helpers expose read-only digest operations. The broader validator imports subprocess behavior. | Export a smaller reachable graph and test it. Do not import `local-validator.js` wholesale. |
| MCP-TP-10 package preparation | `partially_done` | `local-development.js`, OpenCode installation and `fs-swap.js` provide exact-package, isolated staging, injected command and atomic replacement patterns. npm executable selection is currently duplicated and partly surface-specific. | Extract one shared cross-platform npm invocation owner, then extend lifecycle with an MCP-specific exact-package transaction. |
| MCP-TP-11 lifecycle command | `partially_done` | CLI registry/parser/application and lifecycle result/presentation/status modules already compose explicit status, disable and uninstall operations. | Add the approved `mcp` command family through these owners. Do not create another CLI or consent store. |
| MCP-TP-12 Codex configuration | `partially_done` | Codex adapter already isolates an exact TOML section, rejects ambiguity and preserves unrelated sections for repository plugin state. | Extract the bounded TOML-section operation and reuse it for `mcp_servers.agdf`. |
| MCP-TP-13 Claude configuration | `partially_done` | Claude adapter already uses injected native CLI calls, exact phases, read-back and rollback evidence. Installed CLI evidence supports `mcp add --scope local|user`. | Add a focused MCP adapter using the same command/error/rollback mechanics. |
| MCP-TP-14 OpenCode configuration | `partially_done` | OpenCode installer already validates JSON shape, preserves explicit permission values, installs exact packages and verifies the result. | Add a focused `mcp.agdf` merge with full prior-content rollback; do not couple MCP to the plugin list owner. |
| MCP-TP-15 release coherence | `partially_done` | Release bump and publish workflow currently know `create-agdf` followed by `@agdf/cli`; package tests verify ordering and readiness. | Insert the server package between those owners and extend exact-version tests. |
| MCP-TP-16 docs/Context Graph | `partially_done` | `CG-MCP-DISPATCH-ADAPTER` now owns the approved architecture boundary. Existing docs distinguish repository/package/host evidence. | Update only with delivered owners and observed evidence. |
| MCP-TP-17/18 evidence and reviews | `partially_done` | Dispatcher, lifecycle, package, integrity and host-compatibility test harnesses exist; no MCP cases or direct AGDF MCP observations exist. | Extend deterministic harnesses and keep direct-host lanes separate. |

## 2. Reuse Strategy

| Concern | Strategy | Existing owner | Minimal clean change |
|---|---|---|---|
| tool semantics | `extend` | `create-agdf/lib/skill-dispatch/contract.js` | Add output schema, annotations and one schema-derived wire adapter. |
| dispatcher behavior | `extend` | `create-agdf/lib/skill-dispatch/service.js` | Accept immutable runtime evidence through dependency injection; keep the CLI environment adapter at its wrapper. |
| server-facing runtime | `new` thin public seam | `create-agdf` package exports | Add `./mcp-dispatch-runtime` that re-exports only approved semantic, dispatch and pure provenance functions. |
| MCP protocol/process | `new` | separate `agdf-mcp-server/` package | Keep SDK, STDIO, worker and result mapping outside the CLI package. |
| provenance | `extend` | `runtime/plugin-provenance.js` and package manifests | Reuse digest/path/version rules; add one MCP package identity envelope instead of a second trust model. |
| npm executable selection | `refactor` | duplicated local-development and OpenCode helpers | Extract one injected cross-platform npm invocation utility and migrate current consumers before adding MCP acquisition. |
| managed runtime staging | `extend` | `local-development.js`, `fs-swap.js`, data-root owner | Reuse safe-root, stage, marker, atomic swap and rollback patterns under the approved MCP data-root layout. |
| CLI/lifecycle | `extend` | command registry, parser, application, lifecycle result/status/presentation | Add one subcommand family and one focused MCP transaction composer. |
| Codex TOML | `refactor` | exact-section logic in Codex adapter | Extract a generic bounded table-section helper; reject duplicate or ambiguous target tables. |
| Claude MCP | `extend` | Claude command and rollback helpers | Add exact native `mcp` commands and read-back without changing plugin installation. |
| OpenCode JSON | `extend` | JSON classification and permission-preserving merge patterns | Add a separate `mcp.agdf` field owner using shared safe read/write/rollback utilities. |
| release | `extend` | release bump, workflow, package/smoke tests | Add one package descriptor and exact dependency ordering. |

## 3. Architecture And Compatibility Impact

### Interfaces

- The existing dispatcher input/output contract remains version 1 unless implementation evidence
  proves an unavoidable externally visible change. MCP schemas project the current result shape.
- `create-agdf` gains one public export and one CLI command family. Existing commands and exports
  retain their signatures.
- The new server package is independently installable and requires Node.js 20. It is not a
  dependency of `create-agdf` or `@agdf/cli`.
- Host config changes are bounded to one exact MCP server entry. Foreign or ambiguous entries stop
  before mutation.

### Data And Migration

- No application database or `.agdf/control/` schema migration is required.
- Managed MCP package roots use the approved versioned data-root layout and an ownership/provenance
  marker derived from existing conventions.
- Existing host MCP configuration is preserved. No legacy MCP entry exists to migrate in this
  repository; collision behavior is fail-closed.

### Backwards Compatibility

- Node.js 18 users retain all existing CLI and plugin capabilities and see `manual_compatible` for
  MCP lifecycle.
- Current environment-backed dispatcher bindings remain supported. Only the MCP entrypoint rejects
  environment identity overrides.
- Existing Codex, Claude, Copilot and OpenCode plugin installation behavior is unchanged.
- Public Skills-only distribution remains runtime-free and MCP-free.

## 4. Parallel-Structure Check

| Risk | Assessment | Control |
|---|---|---|
| second tool schema | clear | `fromJsonSchema()` consumes the semantic owner's JSON Schemas directly. |
| second dispatcher or gate evaluator | clear | MCP imports the narrow existing dispatcher runtime; protocol code cannot evaluate control itself. |
| second provenance model | controlled | MCP package identity extends digest/version/ownership conventions and uses one envelope; no alternate runtime search. |
| second installer/lifecycle | controlled | package preparation and host registration are submodules of the existing lifecycle composition. |
| duplicate npm selection | requires refactor | extract the current duplicated platform logic before adding the third consumer. |
| duplicate TOML mutation | requires refactor | extract the existing exact-section behavior for plugin and MCP tables. |
| host-symmetric fiction | clear | each adapter keeps its native scope/config semantics and independent evidence status. |
| second approval path | clear | server graph excludes control writers; host permission and MCP results remain non-authorizing. |

No blocking parallel owner remains after the two named refactors. Both are internal ownership cleanup
inside approved TP tasks and do not change product semantics.

## 5. SoT, Runtime And Product-Semantics Drift

- SoT drift: none found. PRD, SD, TP and `CG-MCP-DISPATCH-ADAPTER` consistently assign semantics to
  the function contract and governance authority to existing control owners.
- Runtime drift: present but planned. The current dispatcher trusts environment runtime evidence;
  MCP requires immutable package-derived evidence. Preserve environment handling only at the
  existing CLI wrapper and inject closed evidence into the shared service.
- Package drift: planned. Release code currently knows two npm packages. Add one exact descriptor
  and reject partial release/version states.
- Host drift: direct behavior is not yet proven. Installed CLI help and official configuration
  contracts support implementation, but only MCP-TP-18 may establish support.
- Product-semantics drift: none found. Explicit package acquisition can use the network during
  user-authorized `enable`; the running MCP server itself remains offline. Node acquisition and
  runtime search remain forbidden.

## 6. Visible State And Recovery Ownership

The existing lifecycle result, operation status and presentation modules remain the visible owner
for `not_configured`, `configured_pending_restart`, `configured_unverified`, `available`,
`unavailable`, `unsupported` and `manual_compatible`. Host adapters return facts and recovery
evidence; they do not render a second user journey.

MCP tool terminal and continuation presentation remains owned by the dispatcher and canonical
interaction renderer. The server returns it losslessly. Startup failures that occur before tool
availability remain host/lifecycle state with bounded stderr codes.

No UI monolith or central state hook is affected. The work changes CLI text, host configuration and
model-visible MCP results through existing owners.

## 7. Regression And Test Impact

Required focused extensions:

- semantic function contract and dispatcher tests;
- CLI registry/parser/application and lifecycle tests;
- runtime provenance and import-closure tests;
- local package preparation, atomic swap and rollback tests;
- Codex TOML, Claude native command and OpenCode JSON adapter tests;
- package contents, release bump, publication order and public candidate tests;
- protocol, worker, cancellation, secret leakage, read-only and performance tests in the server
  package;
- existing full `create-agdf` smoke after the final diff stabilizes.

Fixture host configuration must stay under temporary roots. Direct host mutation is not part of the
deterministic suite and requires the separately bounded MCP-TP-18 lane.

## 8. Risks

| Risk | Impact | Required control |
|---|---|---|
| SDK v2 API differs from planning evidence | revise | Install exact packages, prove public imports in red contract tests and return to SD if dual-era serving cannot be met. |
| npm preparation leaves partial state | block | Stage outside stable root, verify before swap, restore exact prior root and keep host config untouched on failure. |
| current lifecycle apply helper lacks general rollback | warn | Use one focused MCP transaction composer over existing primitives; do not pretend the simple apply loop is atomic. |
| TOML bounded editor accepts ambiguous tables | block | Reject duplicate, array or malformed target tables before write and verify exact read-back. |
| dispatcher leaks uncontrolled exception text | warn | MCP adapter exposes stable diagnostic codes only; sentinel tests cover input, SDK, worker and evaluator failures. |
| server import graph reaches CLI subprocess fallback | block | Export pure functions explicitly and enforce dependency-closure negatives. |
| direct host behavior differs from config documentation | revise | Keep status unverified until fresh discovery, call, failure and removal evidence passes. |

## 9. Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`;
  `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `design_resolved_implementation_pending`
- required_action: Update `CG-MCP-DISPATCH-ADAPTER` only with actual final owner paths, protocol,
  package and direct-host evidence during MCP-TP-16.

## 10. Minimal Clean Implementation

1. Add failing contract/package/protocol tests.
2. Extend the semantic owner and inject immutable runtime evidence into the existing dispatcher.
3. Extract the two small shared owners for npm invocation and bounded TOML sections.
4. Build the isolated server package and prove its dependency/read-only boundary.
5. Add managed package preparation and lifecycle composition.
6. Add Codex, Claude and OpenCode adapters independently with rollback tests.
7. Extend release, documentation and deterministic regression evidence.
8. Collect separately authorized direct-host evidence, perform mandatory reviews and run QA.

## 11. Required Next Step

Decision: `pass`. Begin CD+Tests with MCP-TP-02 red controls, then execute the approved tasks in
dependency order. Do not mutate real host configuration during deterministic implementation. Stop
and return to SD if exact SDK v2 behavior, package acquisition or host scope cannot satisfy the
approved boundaries.
