# Brownfield Review: Browser-only click tests for the Codex Companion

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d
- related_ur: UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-11-22

## Objective

Establish which existing browser and fixture observations can prove that activating the built Companion starts one bound request and that competing or reopened views preserve the original handoff. This Run owns browser acceptance. Native qualification belongs to the linked continuation Run.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The maintainer must identify the disposable Run, recognize an unresolved handoff and distinguish a real browser gesture from a simulated receiver in the results. The existing action and shared admission semantics already define the interaction.
- ux_intent_definition_required: yes
- ux_intent_definition_result: blocked

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and linked continuation TP | One start for a ready fixture, an observable original attempt on reopen, and a distinct owner for production qualification. | medium |
| Source of truth | Shared admission and canonical Run binding | packages/core/lib/companion/codex-continuation.js owns the durable attempt; codex-continuation-binding.js checks the selected Run and operation. | medium |
| Runtime path | Browser SDK host, Cockpit session and MCP dispatch | sdk-trace.spec.mjs starts an actual local Cockpit service with a disposable data root, the built UI and an in-memory SDK connection. Its host can withhold a response. | medium |
| UI / UX | CompanionContinuationAction.tsx and SDK host | The existing ready button, pending message, status check and keyboard activation can be exercised inside the real Chromium iframe. | medium |
| Persistence / data | Test fixture allocator and Core admission | The existing fixture and admission directories scope state to a test; the pending case inspects the durable record for the fixture's target and Run. | low |
| Tests / QA | Browser, MCP and Core suites | Browser reports for aa73dfba on 2026-11-22 have two passing activation tests and one two-view contention test. The pointer and contention variants ran in a disposable checkout. Core and MCP already have tests covering claims and races with ordinary dispatch. | medium |
| Release / operations | Linked continuation Run and installed qualification owner | This Run can deliver browser evidence with the existing test host. It requires no change to qualification, installed profile permissions or release activation. | none |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: low
- architecture_reason: Evidence crosses the browser, SDK host and Core admission. Each is authoritative for a different observation. Tests can exercise these boundaries using existing services in private fixtures.
- architecture_evidence: packages/control-ui/test/browser/sdk-trace.spec.mjs and sdk-trace-host.ts; packages/mcp-server/test/companion-continuation.test.js; packages/core/test/codex-continuation-admission-test.js.
- architecture_missing_evidence: The browser baseline stopped at a pending request. The fixture integration owner must establish end-to-end status readback and separate claim and terminal observations in the remaining cases.
- architecture_next_owner_and_action: Test integration should connect existing fixture routes to the built UI, count each observable effect and identify simulated host effects explicitly in the report.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Browser sends and admitted fixture work have distinct meanings. | The pending SDK case counts one host message and one send permit while the durable attempt is still pending. | revise | Reuse the same admission record and record both send and work-grant counts. Record a missing observation explicitly. |
| problem: Two successful exploratory scenarios are absent from the checked-in browser spec at the tested commit. | The disposable pointer and two-view specs passed alongside the existing keyboard test. | revise | Retain reproducible tests in the existing SDK browser suite and reuse the prior observations for the same build and conditions. |
| unresolved: Which state transitions can be shown across the built browser UI and ordinary fixture dispatch? | Existing Core and MCP cases exercise contention, stale binding and claim; this does not establish rendered feedback after interruption or candidate change. | warn | Map covered observations to their source and cover the missing browser states or name their limits in the PRD. |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice. The observable outcome spans the real browser and local fixture admission. It needs requirements binding those effects to one attempt. Quick Task and Verified Change cannot establish that outcome from a single isolated edit and one proof owner. Full delivery would introduce planning for native authority or release changes outside this approved scope.
- evidence: Existing-System View and Structured Depth Evidence in this review, UR.md and the three focused browser observations on aa73dfba.
- transparency_note: Keep requirements, design and tests focused on fixture isolation, visible behavior and evidence attribution. Existing production hooks and qualification retain their owners.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: structured_delivery. No production activation, migration, persistence change, shared cutover or public interface is required to exercise a disposable browser fixture.
- missing_or_conflicting_facts: none for routing; incomplete scenario evidence is a test obligation.
- depth_evidence_refs: UR.md, the SDK browser fixture, the Core admission suite, the MCP continuation test and the scoped Chromium reports.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One candidate and fixture can be assessed for exactly-once browser activation and recovery. |
| authority_boundary | pass | The fixture selects test data; current eligibility and admission stay with Core. Production qualification stays with the linked Run. |
| owner_consumer_coordination | pass | UI and test integration consume the same fixture and admission binding. No deployment coordination is involved. |
| full_depth_impacts_absent | pass | The existing SDK transport and private fixture root serve the built UI without changes to public routes, permissions or release behavior. |
| migration_propagation_bounded | pass | Cases and observations are local to test setup and reporting. Existing Run and production data need no migration. |
| failure_recovery_local | pass | Retain the original pending record, inspect it, and start unrelated cases in fresh disposable data. No real work needs recovery. |
| independently_acceptable | pass | A reviewer can accept browser evidence and list unavailable facts independently of any native readiness decision. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which visible states and source-labelled observations establish success or an evidence gap in each case? | PRD | warn |
| How can the existing harness exercise the regular competing fixture dispatch and control event order while keeping the shared admission owner? | SD | warn |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter, .agdf/control/CONTEXT_GRAPH.md#cg-quality-contract, .agdf/control/CONTEXT_GRAPH.md#cg-brand-guided-ux
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes cover dispatcher binding, evidence scope and actionable UI. The test work consumes each.

## Next Permissible Step

- next_allowed_action: Reassess UX intent for browser-only observation, then draft the scoped PRD for review.
- forbidden_until_then: Implementation before the applicable gates.

## Quality Outlook

- quality_outlook: Retain evidence of a pointer and keyboard start, pending after reopen, and one send from two views. Separately verify the winning fixture claim, bounded readback, recovery cases and the competing fixture-dispatch route. Describe unobservable host behavior in the case report.
