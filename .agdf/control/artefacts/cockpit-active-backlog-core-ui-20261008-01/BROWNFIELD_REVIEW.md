# Brownfield Review: Shared Core reading and active-backlog selection

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: cockpit-active-backlog-core-ui-20261008-01
- related_ur: UR.md, approved through presentation 34c2ba96-73b9-4534-8ec8-ad885abbca1a
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-08

## Objective

Size the approved Core + UI increment: compact Active Backlog selection in reverse source-table order, readable rows, deterministic section-scoped search and shared list-reading ownership. No implementation has started.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Replacing the main selection control and changing initial membership, search coverage and visible counts materially changes the bounded overview capability and its no-result/recovery states. Human authority and the selected-run workflow remain unchanged.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready — UX_INTENT_DEFINITION.md, completed 2026-10-08 as subordinate analytical PRD input

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Master Backlog section membership and stored row data | `packages/core/lib/control-inspect/cockpit-backlog.js` projects all three named sections without lifecycle inference | medium |
| Source of truth | Master Backlog for stored pointers; run state and existing evaluator for actual control | `cockpit.js` uses separate backlog and selected-run projections; duplicate keys are nonselectable in `cockpit-backlog.js` | low |
| Runtime path | Core scoped-read service, browser read worker and MCP session service | `packages/control-ui/server/service.mjs`, `packages/core/lib/control-inspect/cockpit-session.js`, `packages/control-ui/src/mcp/transport.ts` use existing snapshot/run/title operations | low |
| UI / UX | Overview, CompactCockpit and useBacklogTitles | Overview reverses one section; compact filters all entries in original order; cached UR titles alter expanded search | medium |
| Persistence / data | Existing read-only snapshots and ephemeral React state | No product data write is required; `useBacklogTitles.ts` bounds its volatile cache and discards it on changed digest | none |
| Tests / QA | Core projection/title/session tests; UI service/component/browser tests | `packages/core/test/control-cockpit-projection-test.js`, `cockpit-backlog-title-test.js`, `cockpit-session-test.js`; `packages/control-ui/test/backlog-titles.test.tsx`, `compact.test.tsx`, `service.test.mjs`, `browser/backlog.spec.mjs` | medium |
| Release / operations | Private UI build and existing local preparation | `packages/control-ui/package.json` is private; `scripts/build-mcp.mjs` embeds assets with an exact resource digest and size bound | low |

Current coverage is partially_done. Shared source reading, section parsing, diagnostics, bounded title reads, run validation and both rendering paths exist. Common section/order/search projection and readable compact rows are not_done. Existing tests intentionally assert the current cache-dependent search; those expectations must change against the approved product behavior, while bounded-read and navigation regressions remain protected.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: List policy currently lives in two renderers. Moving its ownership into the existing Core read boundary affects the internal Core-to-UI contract and must avoid a second derived-state authority. No change to the public CLI, MCP tool request protocol, control file format, approval writer or trust boundary is necessary for the approved outcome.
- architecture_evidence: `cockpit-backlog.js`, `cockpit.js`, `cockpit-contract.js`, `Overview.tsx`, `CompactCockpit.tsx`, `api.ts`, `mcp/transport.ts`, `server/service.mjs` and `scripts/build-mcp.mjs`.
- architecture_missing_evidence: none for proportional routing; exact internal function/DTO design belongs to SD
- architecture_next_owner_and_action: PRD fixes the searched title corpus and selection behavior; SD assigns the minimal Core extension and coordinates private UI adapters while preserving existing request schemas and limits. Reassess depth if a new independently consumed protocol or coordinated rollout becomes necessary.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: two list-policy owners | `Overview.tsx` and `CompactCockpit.tsx` independently filter and order entries | revise | SD must place section/order/search/title policy under existing Core ownership and make both renderers consumers; implementation must remove superseded rules. |
| problem: incidental cache changes search membership | `useBacklogTitles.ts` loads visible rows; Overview includes cache values in its filter | revise | PRD must declare one deterministic search corpus; SD must keep optional title observation separate from search completeness and preserve bounded reads. |
| problem: positional presentation identity and opaque read identity serve different purposes | `backlogRowKey` includes original index; `cockpit.js` replaces opaque selectors per read scope | warn | SD must bind presentation identities to the source observation and preserve opaque selector validation; no durable global run assignment may be inferred from a row. |
| problem: stored pointer/control meaning can be conflated | compact labels concatenate stored statuses; selected-run projection evaluates current state independently | warn | Preserve section membership and the explicit stored-status label; validate opening through existing run reads. |

These are existing problems the scoped change must resolve, not accepted retained debt. Their owners and product/design routes are known. No new store, cache policy authority, generic search service or new approval control is justified. Review pass means the reuse and routing path is understood; it does not claim those defects have been implemented or verified away.

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice — one independently acceptable selection/search outcome within the existing read-only cockpit. Quick/Compact is ineligible because list membership and search semantics change and Core/UI ownership must be planned. Verified Change is ineligible because this is not one unchanged canonical owner with deterministic propagation only. Full Structured Delivery is rejected: no evidenced full-depth boundary requires independent consumer coordination, data migration, public protocol change or rollout.
- evidence: This review's Structured Depth Evidence and the approved UR; cited Core, UI, adapter and build owners.
- transparency_note: Use focused PRD/SD/TP for this outcome and its tests, without a framework-wide architecture replacement. Required UX Intent Definition precedes PRD readiness; implementation-preparation Brownfield Analysis remains required after TP approval.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none evidenced within this approved scope
- rejected_alternative: quick_task and verified_change fail their product/ownership conditions; structured_delivery lacks a full-depth trigger
- missing_or_conflicting_facts: none decisive for routing; product/design choices are assigned below
- depth_evidence_refs: UR.md; Core cockpit projection/contract/session files; UI Overview/CompactCockpit/types/api/transport; browser service; private build script and regression tests listed above

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR Goal and acceptance signals bound one list-selection/search outcome, with Planned/Archive reachable through the existing overview. |
| authority_boundary | pass | Existing backlog projection is passive; selected-run evaluation and canonical writers retain authority. UR excludes writers, permission and gate changes. |
| owner_consumer_coordination | pass | Core read owners, private browser service and MCP bridge, and two React surfaces are identified. Existing operations carry the relevant source fields; local UI build is digest-bound. No independent consumer cutover is required. |
| full_depth_impacts_absent | pass | Existing request schemas suffice for bounded source-field search and rendering; no execution, persistent schema, public CLI/file format, host support or approval change is required. Internal list policy can be extended within the slice. |
| migration_propagation_bounded | pass | No stored data migration. Core/UI source and locally built assets use existing build/preparation with manifest identity; changes are locally reversible. |
| failure_recovery_local | pass | Existing source_changed/session_invalid/resource_limit states, deliberate reload and disabled ambiguous rows supply local failure boundaries. No distributed execution or new recovery authority is introduced. |
| independently_acceptable | pass | UR acceptance can be demonstrated with mixed sections, long titles, deterministic search, no-write checks and one actual compact Codex observation. Claude integration and prior-run UAT are not prerequisites or claimed results. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which title is the stable primary list title and which exact corpus is searched? | PRD | revise |
| What compact result bound, expansion behavior and focus/return behavior make a long list usable? | PRD | revise |
| How are source-bound identity, completeness and title provenance represented by the existing Core read owner and consumed by both surfaces? | SD | revise |
| How are adapter validation, existing bounded title reads, snapshot replacement and selection races preserved? | SD | revise |
| Which rendered fixtures, adapter parity and fresh compact-host checks prove the result? | TP | revise |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md` existing `local_read_cockpit_20261005` entry
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This review links the existing read-owner invariant. No new node or delivered behavior is claimed. Reassess after implementation if durable ownership knowledge changes.
- memory_target: scope_artifact
- memory_reason: Current defects, scoped route and design questions belong to this run's review.
- memory_refs: BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Execute required UX Intent Definition, then draft a focused PRD through its bound owner and present it for a new human decision.
- forbidden_until_then: SD, TP, code implementation and QA/release claims.

## Quality Outlook

Existing source/test inspection supports the bounded reuse path. No tests, rendered checks or native-host acceptance have been performed for a new implementation. Preserve core/session/HTTP boundary tests and the pending-title navigation regression; replace only the old product expectations that this run deliberately changes.
