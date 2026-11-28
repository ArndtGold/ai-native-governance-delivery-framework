# Brownfield Review: Recoverable Codex continuation leases

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-5fbcb71f-d164-46ce-9288-aa25d6a90642
- related_ur: .agdf/control/runs/run-5fbcb71f-d164-46ce-9288-aa25d6a90642/documents/UR.md (approved, sha256:e30e08ef8ef125543e9cd0727f69a871edbc61aa7d4b0e675b092871807bf496)
- current_gate: Brownfield Review
- reviewer: Claude (agent, brownfield-analysis post_ur_review)
- reviewed_at: 2026-11-27

## Objective

Size and route the approved UR: make the Codex continuation admission of PR #84 recoverable (bounded lifetime of reserved, pending and running records), keep the admitted agent's own follow-up and same-revision continuation admitted, evaluate turn ends without a fixed record maximum and remove finished records, and refuse an ordinary Codex `continue_delivery` only for a conflicting live admission. Work happens on branch `agdf/pr84-continuation-locks`, based on `codex/agdf-companion-reader-and-continuation` (PR #84, head c0e0c600).

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: No new screen, text or action. The Companion card already renders the admission states `ready`, `pending`, `running`, `stopping`, `stale` and `unavailable` (`packages/control-ui/src/mcp/CompanionContinuationAction.tsx`); the change only makes a stuck `pending` or `running` state return to `ready` after its bound and stops terminal refusals of the agent's own chat continuation. The UR excludes new card texts.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | One admission authority per target and Run for Companion starts and ordinary Codex continuations; the Companion never records an approval | `packages/core/lib/companion/codex-continuation.js:106-214` (`createCodexContinuationAdmission`: `reserve`, `publish`, `cancelReservation`, `claim`, `associateTurn`, `observeRunning`, `settleTurn`); `packages/core/lib/control-inspect/cockpit-contract.js` `COCKPIT_CONTINUATION_DEFINITION` description | `medium` |
| Source of truth | Durable admission record, one JSON file per target hash and Run in `codex-continuation/` below the companion data root, schema_version 1, phases `reserved`, `pending`, `running`, `settled`; no time field today; never deleted | `codex-continuation.js:46-60` (`validateRecord`), `:93-100` (`status`), `:197-212` (`settleTurn`, `names.length > 512`) | `high` |
| Runtime path | Dispatch admission `admitCodexContinuation` claims for every Codex `continue_delivery` with an agent operation and stops with `stopCodexContinuation` when not admitted; eligibility `isCurrentContinuation` from `codex-continuation-binding.js`; owner-bound `resume_call` in `mcp-continuation.js:92`; plain next calls after canonical writes from `run-command-service.js:189` via `prepared-control-calls.js:10` (`continueDeliveryCall`); hook association in `codex-activity.js:96-115` (`observeContinuation`) | `packages/cli/lib/mcp-dispatch-runtime.js:84-112,136-142`; files named | `high` |
| UI / UX | Companion action states and polling | `packages/control-ui/src/mcp/CompanionContinuationAction.tsx`, `packages/control-ui/src/mcp/companion-continuation.ts` | `low` |
| Persistence / data | Records live in the plugin data folder, not in `.agdf/control`; a schema change must read existing version-1 records (no time field) without locking a Run | `validateRecord` requires `schema_version === 1` | `medium` |
| Tests / QA | `packages/core/test/codex-continuation-admission-test.js` (6 tests: send permit across processes, shared authority, lost publication, cancel/stale, unreadable record, native turn settlement), `packages/mcp-server/test/companion-continuation.test.js` (qualification, scoped action and ordinary competing dispatch), `packages/control-ui/test/companion-continuation.test.tsx`, browser cases `packages/control-ui/test/browser/companion-continuation-cases.mjs` (not runnable on Windows) | `grep -n "^test("` on these files | `medium` |
| Release / operations | Changes under `packages/core` and `packages/cli` ship in the plugin runtime and Copilot profile: Copilot payload baseline, eval fingerprints, `npm run build:prepare`, `npm run compatibility:record`; the native continuation qualification record binds the server digest, so any change requires a later native re-qualification | `packages/core/lib/runtime/plugin-provenance.js` `inspectCodexContinuationQualification`; `plugins/agdf/meta/copilot-payload-baseline.json` | `medium` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: The change alters the semantics of a durable runtime record (lifetime, cleanup) and of the dispatch admission that sits between Codex and every governed `continue_delivery`, and it may add an optional `continuation_owner` to the bound next calls that canonical writes return. These are runtime/host contract and data-format boundaries inside this repository and the same plugin build; there is no external consumer and no `.agdf/control` format change.
- architecture_evidence: `codex-continuation.js:46-60,93-100,167-212`; `mcp-dispatch-runtime.js:97-112`; `run-command-service.js:189`; `prepared-control-calls.js:10-16`; `skill-dispatch/contract.js` (`continuation_owner` schema with `dependentSchemas`); `.agdf/control/CONTEXT_GRAPH.md` node CG-MCP-DISPATCH-ADAPTER (bound MCP continuations).
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: SD fixes the lease bounds, the record migration from version 1, the owner-continuity mechanism and the conflict rule for ordinary continuations; TP lists the tests per UR acceptance signal.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: lifetime must extend the existing admission record, not add a second lease store | `codex-continuation.js` already owns the record and its lock; `codex-activity.js` has its own activity lease with `codexTurnBound` (`activity.js:10`) that must not become a second admission authority | `warn` | SD reuses the admission record and may reuse `codexTurnBound` as the bound; no new file family |
| problem: owner continuity must reuse the existing owner token and `continueDeliveryCall` | `mcp-continuation.js:92` already passes `continuation_owner`; `run-command-service.js:189` builds next calls through the same `continueDeliveryCall` | `warn` | SD decides whether canonical writes carry the owner forward (input field) or the serving side recognizes it; no parallel token |
| trade-off: ordinary continuations without the Companion keep taking a lease so the Companion can show `running` | `admitCodexContinuation` claims for all agent operations | `warn` | SD states the conflict rule (only a live foreign admission refuses) and keeps eligibility checks for Companion reserve/publish only |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: bounded_structured_slice. One coherent outcome (a recoverable, non-self-blocking admission) inside the Codex continuation module family of PR #84. Compact Delivery (`quick_task`) is not eligible: the change alters a durable runtime record format and the dispatch admission contract, and may add an optional field to bound next calls, so lease bounds, migration and the owner mechanism must be fixed in SD before implementation. Verified Change is not eligible: several owners (admission module, dispatch runtime, run command service, activity hook) and runtime/contract impact. No full-depth trigger: the record lives in the plugin data folder of the same build, consumers are only in this repository, there is no authority, permission or release boundary, and failure stays local to the continuation feature.
- evidence: this review; UR sections 3, 4 and 7; files cited in the Existing-System View on branch `agdf/pr84-continuation-locks` (base c0e0c600).
- transparency_note: PRD, SD and TP stay at slice depth: PRD states the observable admission behaviour per UR acceptance signal; SD fixes bounds, record version and migration, owner continuity and the conflict rule; TP lists tasks, tests and the contract text change chain.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: structured_delivery (no authority, persistence outside the plugin data folder, breaking external contract, release or unbounded coordination trigger); quick_task and verified_change (ineligible as stated in the scope reason)
- missing_or_conflicting_facts: none
- depth_evidence_refs: UR.md sections 3-7; `packages/core/lib/companion/codex-continuation.js`; `packages/core/lib/companion/codex-continuation-binding.js`; `packages/core/lib/companion/codex-activity.js`; `packages/cli/lib/mcp-dispatch-runtime.js`; `packages/core/lib/control-state/run-command-service.js`; `packages/core/lib/control-state/prepared-control-calls.js`; `packages/core/lib/skill-dispatch/mcp-continuation.js`; `packages/core/lib/skill-dispatch/contract.js`

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: the admission never locks a Run permanently and never stops the admitted agent's own governed work; acceptance per UR section 5 |
| authority_boundary | `pass` | Admission stays non-authorizing (`authorizes: false`); no gate, approval or permission semantics change; the Companion still cannot record an approval |
| owner_consumer_coordination | `pass` | Owners: Core companion modules, CLI dispatch runtime, Core run command service, all in this repository; consumers of the admission record are the same modules and tests |
| full_depth_impacts_absent | `pass` | Persistence only in the plugin data folder with a readable migration from version 1; dispatch schema change at most an optional field already defined for `agdf_dispatch`; no release or cross-host rollout beyond the plugin build |
| migration_propagation_bounded | `pass` | Existing version-1 records are read and expire under the new rule; propagation through `npm run build:prepare`, payload baseline and `npm run compatibility:record`, verified by `npm run compatibility:check` |
| failure_recovery_local | `pass` | A failure leaves a Run continuable after the bound or through an ordinary continuation; reverting the branch restores PR #84 behaviour |
| independently_acceptable | `pass` | Acceptance by tests named in UR section 5; native re-qualification on a real Codex host is a stated later step, not a prerequisite of this outcome |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| How long may a `reserved`, `pending` and `running` admission stay unresolved, and from which time does the bound count (creation, publication, last confirmed dispatch)? | SD | `revise` |
| How are existing version-1 records without a time field treated after the change? | SD | `revise` |
| Does a canonical write carry `continuation_owner` forward into its next call, or does the serving side recognize the owner for the agent's own follow-up? | SD | `revise` |
| Which admission state does an ordinary continuation see when a live Companion `pending` or `running` admission of another owner exists? | PRD | `warn` |
| How and when are settled or expired records removed, and how does `settleTurn` find the matching record without a fixed maximum? | SD | `warn` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER (`.agdf/control/CONTEXT_GRAPH.md`, "Bound MCP continuations and host invocation")
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node's decision (reuse canonical Core validation and writers, preserve the original target, Run, revision and operation identity in bound continuations) already covers carrying the continuation owner in bound next calls; no node text changes.

## Next Permissible Step

- next_allowed_action: Draft the PRD at slice depth through prd-definition and present it for `Approval: PRD`.
- forbidden_until_then: SD, TP and any source change for this run.

## Quality Outlook

- quality_outlook: Main risks are a too short bound that releases a Run while Codex still works (double start) and a migration that leaves old records locked; both get explicit tests. The browser continuation cases cannot run on this Windows host, and native re-qualification on a real Codex host stays open after this run.
