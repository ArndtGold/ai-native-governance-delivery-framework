# Brownfield Analysis: MCP error contract implementation preparation

Decision: pass
Mode: pre_implementation_analysis
Date: 2026-10-19
Owner: Codex
Run: mcp-error-contract-phase1-20261019-01
Based on: approved TP, SD and PRD; BROWNFIELD_REVIEW.md and UX_INTENT_DEFINITION.md

## Scope And Current System

Implement the approved T-001 through T-010 under the existing Core/CLI/MCP/UI owners. Current checkout is a8a867a3578a2d8b16853860276c401ddd04db28; candidate production paths were clean at preparation. The pre-existing staged Control artefacts, selected Run/backlog writes and unrelated core-model-handoff-simplification artefacts are retained. Exact starting source hashes, approved-input hashes, platform, Node and Git status are in evidence/source-baseline.json. No index/branch/commit action is performed.

Current coverage is partially_done: Core already knows accepted/already_applied, rejected/recovery_required/effect_unknown and operation receipts; SDK 2.0.0 handles schema input errors. The missing boundary is operation-aware error signalling, preserved execution causes, actionable guidance and consumer handling of isError with a valid negative envelope.

## Existing Owners And Reuse

| Area | Existing evidence | Implementation path |
|---|---|---|
| Semantic outcomes and no-write reads | Core dispatch/inspect services, run-command-service.js, Cockpit readers/session | Reuse current results; pure projector observes explicit tool/operation/outcome fields. No reevaluation of gates or added writer. |
| Wire result | server.js toolResult currently serializes original domain data and preserves presentation_delivery | Consume private checked projection; preserve original public domain result/first content and success presentation, append error explanation only. |
| Typed causes | SkillDispatchInputError, parser field metadata; existing DispatchExecutionError | Retain only known typed/allowlisted cause facts at parse/execute seams; unknown exceptions stay bounded runtime failures, unknown execution stays unknown. |
| Worker and generation | worker-entry.js, worker.js, generation-entry.js and generation.js; manifest compatibility in generation-protocol.js | Keep the existing execution/slot/deadline/receipt lifetimes; project at producing runtime and carry versioned private descriptor. |
| Locale | agdf-interaction-locales.json and existing locale resolution | Extend existing EN/DE packs, no second catalogue. |
| UI | transport.ts currently throws read_failed on isError; DecisionEntry throws result_unconfirmed | Preserve validated negative domain envelopes under error flag; never pass accepted payload as success or lose current session/binding checks. |
| CI/tests/build | Existing CLI plugin runtime suite, MCP protocol/safety/generation/flow suites, UI component/browser fixtures, Core projection and provenance | Add behavioral tests through their canonical npm suite inventory; no removed tests, increased bounds or installed-runtime patch. |

## Concrete Operation Inventory

Dispatch failures are invalid_input/target_unresolved/evaluator_error; routing and successfully reported blocked governance remain successful. Inspect doctor/gate-check/delivery-map/artifact-readiness/operation-status and available qualification reports are successful observations even for blocked/not-ready/missing-original state. Exact document/preview/operation-contract/runtime binding reads can fail with available false. Cockpit distinguishes top-level failure of requested operations from successfully observed nested run/resource blocks and freshness state. Commands and decision actions preserve their outer accepted/already_applied/rejected/recovery_required/effect_unknown semantics. Exact structured shapes and supported operations are covered by the projector and wire test inventory, not by text search or blanket nested-state rules.

## Risks, Regression Evidence And Constraints

- Default/Copilot composition must not import private Cockpit code through the new pure helper. Core projection includes the lib tree and existing integrity digests; use its supported assembly.
- Parse fails before execute: known not-dispatched. Worker handoff followed by timeout/exit is not proof of rollback. Preserve original UUID/payload/receipt path for uncertain commands.
- The generation facade parses input before invoking an owned child and can have older bound sessions. Error projection must come from the selected producing generation; incompatible descriptor manifests reject through existing qualification.
- SDK outputSchema validation is skipped on isError; explicit checked domain shapes/negative UI envelopes remain mandatory.
- Existing Cockpit/decision transport cannot simply throw away structured errors once isError is added. Preserve guards, safe negative state and actionable feedback through current owners.
- Baseline evaluation uses the existing harness and immutable matrix/metrics; unexpected changes are not explained away by new predicates. Source/fixtures/browser/packed-runtime evidence never implies native agent qualification.

## Minimal Clean Path And Evidence

Follow the approved task dependency order: pure helper/locale, typed causes, wire, generation, UI, regression/packaging, baseline comparison, reviews/QA. Keep product sources unchanged; any contradiction discovered in execution routes to the existing earliest approved source or evidence owner. Pre-change build and protocol/tool capture belong to T-001 and are retained under evidence/ before source implementation begins. Their actual exit/results are read before this analysis is canonically recorded.

No material design/owner ambiguity or new architecture requirement is found. No persistent schema migration, network service, new authority or hidden debt exception is needed. Existing limits and test ownership remain binding. Implementation evidence will be recorded separately; this pass confirms the implementation path, not completion.

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update after verified implementation/evaluation evidence
- context_graph_gate_effect: warning; clean closeout must reconcile the result

## Next Step

Record this analysis after reading pre-change build/protocol evidence, redispatch gate-check and implement only if canonical control opens CD+Tests. Missing mandatory test evidence stays open for later QA; no installation, paid model session, VCS or publication is authorized.
