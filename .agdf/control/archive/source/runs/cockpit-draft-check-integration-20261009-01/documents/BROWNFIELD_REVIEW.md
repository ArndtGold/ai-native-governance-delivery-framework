# Brownfield Review: Cockpit draft checks

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: cockpit-draft-check-integration-20261009-01
- related_ur: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-09

## Objective

Size the approved supplementary UR for a deliberate, read-only Entwurf prüfen action on the selected current UR/PRD/SD/TP draft. The existing compact documented-approval Run remains independently approved and unchanged. This review grants no implementation permission.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: A new deliberate action introduces loading, result, unavailable and stale states and recovery within one undertaking detail; no new user population or authority.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/UX_INTENT_DEFINITION.md

The required internal UX analysis is complete with decision ready, preserving the approved action and scope. Its source is recorded with this analytical update before PRD drafting.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Supplementary approved UR; existing authoring checks | UR.md; packages/core/lib/control-inspect/artifact-readiness.js returns readiness_scope authoring_checks, authorizes false and separate review/registration/presentation requirements | medium |
| Source of truth | Canonical Run, exact source bytes and validators | artifact-readiness.js checks selected active Run, expected revision, seal, current gate and canonical draft; existing UR/PRD/SD/TP validators are reused | medium |
| Runtime path | Scoped Cockpit session, read worker and bounded snapshot | packages/core/lib/control-inspect/cockpit-session.js, cockpit.js; packages/core/lib/control-read/cockpit-worker.js, cockpit-pool.js, snapshot.js | medium |
| UI / UX | Selected reading state and Run detail | packages/control-ui/src/App.tsx, state.ts, RunDetail.tsx, mcp/transport.ts, api.ts, types.ts | medium |
| Persistence / data | No new persistent state | UR non-goals; Core readiness only supplies an in-memory draft pointer, does not write | none |
| Tests / QA | Existing Core and scoped MCP/UI suites | packages/core/test/artifact-readiness-test.js, cockpit-session-test.js, cockpit-scoped-read-test.js; packages/cli/scripts/cockpit-scoped-mcp-test.js; App tests need new result/race coverage | medium |
| Release / operations | Existing package/build and host activation | Current installed MCP operation has been reached; App addition requires built-source identity and fresh observed UI evidence, not a new host/release rollout | low |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: The currently allowlisted agdf_cockpit_read schema and its validated envelope do not expose draft checks. The integration changes a compatibility-sensitive MCP App selector/result contract and must bridge the standalone Core snapshot to the existing selected session/freshness boundary. This is a concrete interface effect, not an inference from file count.
- architecture_evidence: packages/core/lib/control-inspect/cockpit-contract.js excludes readiness; cockpit-session.js verifies snapshot and document/run selectors and generation before response; cockpit-worker.js has an explicit operation allowlist; mcp/transport.ts only calls agdf_cockpit_read and validates envelopes; artifact-readiness.js performs independent bounded capture and returns exact draft digest.
- architecture_missing_evidence: none for route selection. Exact selector/DTO and snapshot composition are design obligations for SD, not unknown approved product intent.
- architecture_next_owner_and_action: sd-definition must select an additive scoped adapter and freshness composition under the current Core session/reader owners; preserve the established bounded schema and transport validation without a generic bridge.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: App operation missing | cockpit-contract.js and cockpit-worker.js have no readiness operation; existing artifact-readiness.js fully owns the checks | warn | SD: extend the existing bounded interface, keep the original Core validator owner; do not duplicate readiness in React or MCP |
| problem: independently captured result could outlive selected context | Core report carries revision/draft digest; session has snapshot/run/generation; UI state.ts rejects old generations | warn | PRD: require exact binding and invalidation for selection, revision and source changes; SD: compose existing snapshot and generation owners and retain bounded dependency monitoring |
| problem: unregistered draft must not need approval registration to be checked | Core can inspect canonical gate draft with an in-memory pointer; Cockpit document manifest only offers registered sources | warn | SD: scope a canonical current-draft selector through the verified selected Run; never accept client file paths or invent registered resources |
| problem: success could imply approval or QA | Core report explicitly separates authoring checks and downstream authorities | warn | PRD: require Entwurfsprüfung bestanden plus authoring scope and the existing permitted next step; no control writes or click approval |
| problem: existing approved overview sources could be overwritten | Separate cockpit-documented-approvals-20261009-01 UR/PRD are already approved; shared checkout is dirty | warn | PRD/SD/TP: preserve those bytes and their approvals; reuse presentation owners through explicit references, accept this draft action independently |

No retained debt is accepted. Identified problems have existing owners and mandatory scoped treatment; no unresolved choice prevents sizing. Implementation details are deferred to the actual SD gate.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth — add an operation and validated result to the bounded MCP App contract, with selected-context/source freshness obligations. Reject structured_slice because the external_contract_depth trigger is evidenced; reject quick_task/verified_change because a new user capability and integration contract are involved.
- evidence: this review, approved UR.md, packages/core/lib/control-inspect/cockpit-contract.js, cockpit-session.js, artifact-readiness.js and packages/control-ui/src/mcp/transport.ts
- transparency_note: Full gate sequence with focused coverage of the affected App interface, Core source/snapshot boundary, consumers, recovery and exact-build observation. No unrelated deployment, archival or identity project.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External or public contract: the compatibility-sensitive agdf_cockpit_read operation/result consumed by the MCP App must be extended; its schema, Core owner and validating App consumer are evidenced above.
- rejected_alternative: structured_slice — full_depth_impacts_absent fails on the concrete integration-contract extension. Quick Task and Verified Change are ineligible because they forbid this new capability/contract impact.
- missing_or_conflicting_facts: none for the depth decision
- depth_evidence_refs: UR.md; Existing-System View; Architecture Impact; cockpit-contract.js; cockpit-session.js; mcp/transport.ts; api.ts; artifact-readiness.js

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Selected current draft can be deliberately checked and corrected; UR six acceptance signals |
| authority_boundary | pass | Existing authoring checks, session selectors and control writers remain owners; no new approval/security authority; bounded adapter must preserve those guards |
| owner_consumer_coordination | pass | Core reader/session, MCP schema adapter and Cockpit consumer identified; existing public operation remains compatible through additive guarded extension |
| full_depth_impacts_absent | fail | A compatibility-sensitive MCP App operation/result contract changes; evidenced full-depth trigger 4 |
| migration_propagation_bounded | pass | No persistent schema/migration; use existing generated package/build paths, retain old operations and permit reverting the scoped addition |
| failure_recovery_local | pass | Existing timeout, busy, session expiry and source_changed feedback; reload/recheck and generation invalidation; no control mutation to undo |
| independently_acceptable | pass | Current UI can accept this draft action independently; compact overview is contextual reuse, not an unknown later prerequisite |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| No open product question; approved action/states/authority/recovery are explicit | none | warn |
| Exact additive selector, DTO validation and reuse of captured draft/source dependencies | SD | warn |
| Exact execution limits, invalidation/race scenarios and built/native observation sequence | TP | warn |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific interface and review findings are retained here; no new durable graph/source authority is proposed.
- memory_target: scope_artifact
- memory_reason: This review contains exact supplemental scope, owners and evidence boundaries.
- memory_refs: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Record this review and Mode/Slice together, complete required UX Intent Definition, then draft PRD for this supplemental Run.
- forbidden_until_then: PRD readiness before required UX is ready; SD/TP/implementation without their preceding approvals; any transfer or rewrite of the other Run's approvals/sources.
- current_coverage: Core checks fully_done; App selector, validated result and visible action not_done.
- reuse_strategy: extend existing session/reader/MCP/App owners; reuse current authoring validators and feedback/freshness.
- missing_evidence: New implementation tests and exact-build native observation belong to later authorized delivery; no such outcome is claimed here.
- required_next_step: Canonical route recording, followed by bound gate-check continue_delivery.

## Quality Outlook

- quality_outlook: Sizing and route pass. Freshness, failed/late responses, no-write assertions, schema compatibility and visible responsive keyboard/focus/scroll evidence are mandatory later acceptance dimensions.
