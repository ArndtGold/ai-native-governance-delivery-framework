# Brownfield Review: Lean Codex continuation handoff

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-fc64e714-ce09-40f1-934f-5593fbeed84e
- related_ur: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/UR.md (approved, sha256:86c3a5f47c27335802d2671085f4c9331a0337e2f5012e2291b85c1e8db1baee)
- current_gate: Brownfield Review
- reviewer: Claude (agent, brownfield-analysis post_ur_review)
- reviewed_at: 2026-11-27

## Objective

Size and route the approved UR: reduce the Codex continuation admission of PR #84 to the Companion handoff (reserve, publish, claim of the published attempt) with bounded reserved and pending records, derive the Companion "running" state from the existing Codex activity lease, stop gating ordinary Codex `continue_delivery` dispatches, and remove the owner chain (`continuation_owner`, owner-bound `resume_call`, `work_admission` owner, hook-side turn association). Work happens on branch `agdf/pr84-continuation-locks`, based on `codex/agdf-companion-reader-and-continuation` (PR #84, head c0e0c600). The superseded run-5fbcb71f is closed; none of its code is in the working tree.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: No new screen or action. The Companion card already renders `ready`, `pending`, `running`, `stopping`, `stale` and `unavailable` (`packages/control-ui/src/mcp/CompanionContinuationAction.tsx`) and already shows Codex work from the activity lease (`packages/control-ui/src/mcp/CompanionCard.tsx`, `matchesActivity`). The change only alters where `running` comes from and possibly drops `stopping`; the UR allows text changes only where a state disappears or changes its source.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | One admission authority per target and Run for Companion starts and ordinary Codex continuations; the Companion never records an approval | `packages/core/lib/companion/codex-continuation.js:106-214` (`reserve`, `publish`, `cancelReservation`, `claim`, `associateTurn`, `observeRunning`, `settleRunning`, `settleTurn`) | `medium` |
| Source of truth | Durable admission record per target hash and Run below the companion data root (`codex-continuation/`), schema_version 1, phases `reserved`, `pending`, `running`, `settled`, never deleted; separately the Codex activity store `companion/codex-activity.json` with bounded rows (`codexTurnBound`) read by `readCodexObservation` | `codex-continuation.js:40-54,93-98`; `packages/core/lib/companion/codex-activity.js:117-166`; `packages/core/lib/companion/activity.js:142-160` (`matchesActivity` on target, Run and gate) | `high` |
| Runtime path | `admitCodexContinuation` claims for every Codex `continue_delivery` with an agent operation and stops through `stopCodexContinuation`; `work_admission` carries the owner; `mcp-continuation.js:37,92` puts it into `resume_call`; `prepared-control-calls.js:14` forwards `continuation_owner`; `codex-activity.js:96-115,149` (`observeContinuation`) associates turns and settles running records | `packages/cli/lib/mcp-dispatch-runtime.js:84-112`; files named | `high` |
| UI / UX | Companion action states and polling; Cockpit attaches `companion_observation` for the shown agent step | `CompanionContinuationAction.tsx`, `companion-continuation.ts:27-30` (`stopping` from `interrupt_requested`), `packages/core/lib/control-inspect/cockpit-session.js:77-111,296-316` | `low` |
| Persistence / data | Records live in the plugin data folder, not in `.agdf/control`; records written by the PR #84 format (phase `running`, owner, turn) may exist where the branch ran | `validateRecord` requires `schema_version === 1` | `medium` |
| Tests / QA | `packages/core/test/codex-continuation-admission-test.js` (send permit across processes, shared authority with chat claims, lost publication, cancel/stale, unreadable record, turn settlement), `packages/mcp-server/test/companion-continuation.test.js` (qualification; scoped action and competing ordinary dispatch), `packages/cli/scripts/skill-dispatch-function-contract-test.js`, `packages/control-ui/test/companion-continuation.test.tsx`, browser cases `packages/control-ui/test/browser/companion-continuation-cases.mjs` and fixture (not runnable on this Windows host) | `grep -rn continuation_owner` over `packages` | `medium` |
| Release / operations | Core and CLI changes ship in the plugin runtime and Copilot profile: generated copies under `packages/cli/runtime` and `packages/cli/generated`, Copilot payload baseline, `npm run build:prepare`, `npm run compatibility:record`; the native continuation qualification binds server and dispatcher digests and the observation list | `packages/core/lib/runtime/plugin-provenance.js:19-32`; `plugins/agdf/meta/copilot-payload-baseline.json` | `medium` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: The change narrows the dispatch admission that sits between Codex and every governed `continue_delivery`, removes an input field (`continuation_owner`) and an output field (`work_admission.owner`) of the `agdf_dispatch` contract, changes the durable admission record format and lets the Companion read the activity lease for its state. These are runtime/host contract and data-format boundaries inside this repository and one plugin build. PR #84 is unmerged, so no released consumer depends on the removed fields.
- architecture_evidence: `codex-continuation.js`; `mcp-dispatch-runtime.js:84-112`; `skill-dispatch/contract.js:80-86,292-316,356-357`; `mcp-continuation.js:37,92`; `prepared-control-calls.js:14`; `codex-activity.js:96-115,149`; `cockpit-session.js:77-111`; `.agdf/control/CONTEXT_GRAPH.md` node CG-MCP-DISPATCH-ADAPTER.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: SD fixes the reserved and pending bounds, the record format and treatment of PR #84 records, the mapping from activity lease to Companion states (including `stopping` and refusal of a reservation while Codex works) and the new observation list; TP lists tests per UR acceptance signal and the derived-artefact chain.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: PR #84 runs two authorities for "Codex works on this Run" (admission `running` record and activity lease) | `codex-continuation.js:93-98` and `codex-activity.js:156-166` both answer it; `CompanionCard.tsx` already uses the activity lease | `revise` | Remove the `running` phase from the admission; the activity lease stays the only source for running work |
| problem: the owner token duplicates the existing revision binding of canonical writes | every write is bound to `expected_revision_id` and rejected when stale; the owner only exists to re-admit the agent past its own lock | `revise` | Remove `continuation_owner` and the owner in `work_admission` and `resume_call`; no replacement token |
| trade-off: without trusted Companion hooks the activity lease is unknown, so a Companion handoff can overlap with chat work on the same Run | `readCodexObservation` returns `liveness: unknown` without hook evidence | `warn` | SD states the behaviour; consistency stays with the revision check, duplicate work is accepted and documented as residual risk in OR |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: bounded_structured_slice. One coherent outcome (the admission protects only the Companion handoff, never gates ordinary continuations and never locks a Run) inside the Codex continuation module family of PR #84. Compact Delivery (`quick_task`) is not eligible: the change removes fields from the dispatch contract, changes a durable record format and moves the Companion running state to another source, so bounds, record handling and the state mapping must be fixed in SD. Verified Change is not eligible: several owners (admission module, dispatch runtime, dispatch contract, continuation builder, activity hook, Cockpit session, control-ui) and runtime/contract impact. No full-depth trigger: the record lives in the plugin data folder of the same build, all consumers are in this repository, PR #84 is unreleased, there is no authority, permission or release boundary, and failure stays local to the continuation feature.
- evidence: this review; UR sections 3, 4 and 7; files cited in the Existing-System View on branch `agdf/pr84-continuation-locks` (base c0e0c600).
- transparency_note: PRD, SD and TP stay at slice depth: PRD states the observable handoff and continuation behaviour per UR acceptance signal; SD fixes bounds, record format, state mapping and observation list; TP lists tasks, tests and the contract text change chain.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: structured_delivery (no authority, persistence outside the plugin data folder, released external contract, release or unbounded coordination trigger); quick_task and verified_change (ineligible as stated in the scope reason)
- missing_or_conflicting_facts: none
- depth_evidence_refs: UR.md sections 3-7; `packages/core/lib/companion/codex-continuation.js`; `packages/core/lib/companion/codex-activity.js`; `packages/core/lib/companion/activity.js`; `packages/core/lib/control-inspect/cockpit-session.js`; `packages/cli/lib/mcp-dispatch-runtime.js`; `packages/core/lib/skill-dispatch/contract.js`; `packages/core/lib/skill-dispatch/mcp-continuation.js`; `packages/core/lib/control-state/prepared-control-calls.js`; `packages/core/lib/runtime/plugin-provenance.js`

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: a bounded Companion handoff with one send permit per Run, no gating of ordinary continuations, running state from the activity lease; acceptance per UR section 5 |
| authority_boundary | `pass` | Admission stays non-authorizing (`authorizes: false`); no gate, approval or permission semantics change; the Companion still cannot record an approval |
| owner_consumer_coordination | `pass` | Owners and consumers are Core companion and skill-dispatch modules, the CLI dispatch runtime, the Cockpit session and control-ui, all in this repository |
| full_depth_impacts_absent | `pass` | Persistence only in the plugin data folder; removed dispatch fields were introduced by the unmerged PR #84; no release or cross-host rollout beyond the plugin build |
| migration_propagation_bounded | `pass` | PR #84 records are handled by a rule fixed in SD (ignored or removed, never locking); propagation through `npm run build:prepare`, payload baseline and `npm run compatibility:record`, verified by `npm run compatibility:check` |
| failure_recovery_local | `pass` | A failure at worst lets a handoff expire or overlap with chat work, which the revision check keeps consistent; reverting the branch restores PR #84 behaviour |
| independently_acceptable | `pass` | Acceptance by tests named in UR section 5; native re-qualification on a real Codex host is a stated later step, not a prerequisite |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| How long may a reserved and a pending handoff stay unresolved, and from which time does each bound count? | SD | `revise` |
| Which Companion state is shown while the activity lease shows Codex work on the shown Run, and is a new reservation refused then? | PRD | `revise` |
| Is the `stopping` state kept (interrupt marker of the activity lease) or dropped? | SD | `warn` |
| How are records in the PR #84 format (phase `running`, owner, turn) treated? | SD | `warn` |
| Which qualification observations replace `competing_normal_continuation` and the other owner-bound observations? | SD | `warn` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER (`.agdf/control/CONTEXT_GRAPH.md`, "Bound MCP continuations and host invocation")
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node's decision (reuse canonical Core validation and writers, preserve the original target, Run, revision and operation identity in bound continuations) stays valid; removing the owner field from bound continuations does not change the node text.

## Next Permissible Step

- next_allowed_action: Draft the PRD at slice depth through prd-definition and present it for `Approval: PRD`.
- forbidden_until_then: SD, TP and any source change for this run.

## Quality Outlook

- quality_outlook: The design gets smaller (fewer phases, no owner chain, no hook-side settlement). Main risks are a pending bound shorter than Codex needs to pick up the handoff (second start possible after expiry) and Companion state flicker between handoff and the first activity observation; both get explicit tests. The browser continuation cases cannot run on this Windows host, and native re-qualification on a real Codex host stays open after this run.
