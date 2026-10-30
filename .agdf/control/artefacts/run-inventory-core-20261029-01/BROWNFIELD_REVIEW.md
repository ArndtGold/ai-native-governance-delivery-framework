# Brownfield Review: Shared Core Run Inventory from Stored Run State

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `run-inventory-core-20261029-01`
- related_ur: `.agdf/control/artefacts/run-inventory-core-20261029-01/UR.md` (approved, revision 3)
- current_gate: Brownfield Review
- reviewer: Claude
- reviewed_at: 2026-10-29

## Objective

Size and route the approved UR: one pure Core module derives a run inventory (ID, title, lifecycle
including `superseded` and `abandoned`, current gate, attention class with its stored basis, last
activity with its source, revision) from the `RUN_STATE.md` files alone, without live gate
evaluation per run. `doctor --all-active` and `agdf_inspect` are its first consumers. The companion
copy and hub supplement 3 are follow-up runs.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The change adds read-only orientation fields to an existing CLI and MCP read
  result and one read operation for agents. It changes no primary action, working mode, effective
  run state, activation or recovery path; no human decision is taken through it. The attention
  classes and the rule that they are labelled as stored state are already fixed in the approved UR;
  the exact mapping is ordinary PRD content and needs no preview.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Run lifecycle, stored control state and the companion's state rules | `packages/core/lib/control-state/run-state-parser.js:13` (`LIFECYCLES`); `run-operations.js:9,98` (`ENDED_LIFECYCLES`, `runClosure`); `plugins/agdf/host-templates/claude/companion/state.mjs:8-35` (blocked for `revise`/`block`/`blocked`/`decline`, waiting for `Approval: <gate>` in "What is missing?", running otherwise, unreadable when no rule matches) | `medium` |
| Source of truth | Canonical `RUN_STATE.md` per run; backlog only as derived pointer | `plugins/agdf/meta/contracts/control-scaffold.md`; `run-state-reader.js:20` (`discoverRuns`); `run-state-resolver.js:2-20` (`allActive` selection); `docs/architecture/07-ui-konzept.md:153-180,513-516,555` | `medium` |
| Runtime path | Doctor all-active composition and the shared read inspection behind `agdf_inspect` | `packages/core/lib/control-evaluation/doctor.js:44-82` (per-run `evaluateDoctor`, report `inventory: { state, active_count }`); `control-inspect/selection.js:3-4` (operation list, `ALL_ACTIVE_OPERATIONS`); `control-inspect/contract.js:17` (`CONTROL_INSPECT_MAX_DEFINITION_BYTES = 5000`), `:46-48` (operation enum, `all_active` field); `control-inspect/service.js:204` | `high` |
| UI / UX | Readers with their own run-list rules | `packages/core/lib/interaction-presentation.js:236-288` (`normalizedRunTitle`, `resolveHumanRunTitle`, `buildRunCandidates` sorted by title, `last_updated_at` from `updated_at`); companion `run-state.mjs:72,82` (`isPlaceholderText`, own pure parser); `control-inspect/cockpit.js` and `cockpit-list.js` (backlog-based overview) | `medium` |
| Persistence / data | Receipts with `created_at` inside the run state | `run-operations.js:58` (`readRunOperations`), `approval-operations.js:41` (`readApprovalOperations`); measured on 2026-10-29: 4 of 57 active runs carry a receipt, 23 only dated approval evidence, 30 neither; 16 share the migration stamp, 8 lack `updated_at`, 16 keep the placeholder objective | `low` |
| Tests / QA | Core, CLI and MCP tests around active runs and inspection | `packages/cli/scripts/active-run-inventory-test.js` (MCP `doctor` with `all_active: true` for "show the active runs"); `control-inspect-test.js`; `run-close-test.js`; `packages/core/test/run-lifecycle-guard-test.js`; `packages/mcp-server/test/protocol.test.js` and `performance.test.js` | `medium` |
| Release / operations | Hook, routing contract, payload and budgets | `scripts/sync-plugin-runtime.js:350` (SessionStart session check runs `doctor --all-active --json` under the shared hook deadline); `plugins/agdf/meta/contracts/request-activation.md` routes "show the active AGDF runs" to `agdf_inspect` `doctor` with `all_active: true`; `plugins/agdf/meta/copilot-payload-baseline.json` has no headroom; MCP tool definition has about 100 bytes left | `high` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: A new shared read owner enters Core and becomes the single run-list rule for
  CLI, MCP and later the companion and hub. The MCP read contract shared by four hosts and the JSON
  report of `doctor --all-active`, which the SessionStart hook consumes, gain fields or an
  operation. The module must be free of `node:` imports, but the existing parser chain is not.
- architecture_evidence: `node` import trace on 2026-10-29: `run-state-parser.js` reaches
  `node:util` (`run-operations.js:2`, `approval-operations.js:2`, `run-source-revisions.js`,
  `artefact-bindings.js`), `node:crypto` (`approval-command-contract.js`, `evidence-bindings.js`),
  `node:path` and `control-read/fs.js` (`node:fs`); `run-state-document.js` (`scalarFields`,
  `sectionTableRows`, `parseControlState`) has no `node:` import. `doctor --all-active` took 11.7 s
  for 57 active runs on this repository.
- architecture_missing_evidence: Whether the MCP read worker can read about 150 run states within
  its deadline; owner: SD and the performance test in TP.
- architecture_next_owner_and_action: PRD fixes the attention mapping and the doctor/inspect result
  semantics; SD decides module placement, the input shape (texts or read function), how validity
  findings from the full parser reach the inventory, and the MCP operation shape within budget.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: a fourth run-list rule beside `buildRunCandidates`, the companion and the cockpit would deepen the drift the UR wants to remove | `interaction-presentation.js:265-288`; companion `state.mjs:25-35`; `cockpit-list.js` | `revise` | SD makes the inventory the single owner of title, attention and order; existing title helpers are moved or reused, not copied. Switching the intake list and the companion is follow-up work and must be named |
| unresolved: the pure module cannot import `parseRunState` because its chain pulls `node:` modules; a private mini-parser would be a parallel parser | import trace above; `run-state-document.js` is pure | `revise` | SD reuses `run-state-document.js` and a pure receipt-time reader (global `atob`/`TextDecoder`); full validity (seal, receipt validation) stays with `parseRunState` and is passed in by node-side callers |
| trade-off: the companion keeps its own pure parser and state rules until slice 2 | `run-state.mjs:82`, `state.mjs:25`; owner decision of 2026-10-28 (SDD-04 of the companion SD rejected MCP from the mod) | `none` | Rationale: slice 2 is an agreed follow-up run; owner: Arndt Gold; mitigation: the inventory adopts the companion's state rules where they agree and the TP pins them with shared fixtures; exit condition: slice 2 replaces the companion parser with the bundled copy |
| problem: answering "show the active runs" through `doctor` with `all_active: true` runs a full evaluation per run | `request-activation.md` route; `active-run-inventory-test.js`; 11.7 s measurement | `revise` | PRD decides whether that route moves to the inventory operation; SD accounts for the contract text change chain (payload baseline, eval fingerprints, compatibility record) |
| unresolved: the doctor report shape is consumed by the SessionStart hook under a shared deadline | `sync-plugin-runtime.js:350` | `warn` | SD keeps existing fields unchanged and the added inventory cheap; TP measures the hook path |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: external_contract_depth. The change extends the public MCP read contract
  `agdf_inspect`, shared by Claude Code, Codex, Copilot and OpenCode under a 5000-byte discovery
  budget, and the JSON report of `doctor --all-active` that the SessionStart hook consumes; the
  request-activation route for "show the active runs" may change with it. quick_task and
  verified_change are ineligible because a new product capability with new semantics is added across
  CLI and MCP. Rejected alternative: structured_slice, because `full_depth_impacts_absent` fails on
  the public MCP and CLI contract change.
- evidence: This review
  (`.agdf/control/artefacts/run-inventory-core-20261029-01/BROWNFIELD_REVIEW.md`); approved UR
  revision 3; `control-inspect/contract.js:17,46-48`; `selection.js:3-4`; `doctor.js:44-82`;
  `sync-plugin-runtime.js:350`; `request-activation.md`.
- transparency_note: The module itself is a bounded read-only change, but its first consumers are
  public interfaces of four hosts, so PRD, SD and TP cover the contract, budget and hook effects in
  full. No UX intent step is required because the UI/UX impact is low.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: external or public contract (new or extended `agdf_inspect` read
  result shared by four hosts; extended `doctor --all-active --json` report consumed by the
  SessionStart hook; possible change of the request-activation route for active-run listings).
- rejected_alternative: `structured_slice`
- missing_or_conflicting_facts: none for the depth decision; the MCP worker deadline for about 150
  run states is a design and test question for SD and TP.
- depth_evidence_refs: `control-inspect/contract.js:17,46-48`; `control-inspect/selection.js:3-4`;
  `doctor.js:44-82`; `scripts/sync-plugin-runtime.js:350`;
  `plugins/agdf/meta/contracts/request-activation.md`;
  `packages/cli/scripts/active-run-inventory-test.js`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: a shared run inventory read by doctor and agdf_inspect; UR acceptance signals bound it |
| authority_boundary | `pass` | Read-only; `RUN_STATE.md` stays the source of truth; no new decision, permission or trust boundary |
| owner_consumer_coordination | `pass` | Core, CLI, MCP server and companion are owned in this repository; companion and hub follow later |
| full_depth_impacts_absent | `fail` | Public MCP read contract and the doctor JSON report change |
| migration_propagation_bounded | `pass` | Additive fields and operation; no stored data changes; reverting the module restores the old output |
| failure_recovery_local | `pass` | A failing inventory read yields an incomplete inventory with findings; no write path is involved |
| independently_acceptable | `pass` | Acceptable on CLI and MCP alone; companion and hub are separate follow-up runs |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact mapping from stored decision, Artefacts results and "What is missing?" to decision required, clarification required, blocked, in progress and unclear; how `revise` differs from `block` compared with the companion's single "blockiert" | PRD | `revise` |
| What exactly `doctor --all-active` adds (all runs or active only, counts) and which `agdf_inspect` operation answers "show the runs"; whether the request-activation route moves | PRD | `revise` |
| Localized labels for the attention classes and the "stored state" marking | PRD | `warn` |
| Module placement and input shape (texts or read function); how node-side validity findings are passed in | SD | `revise` |
| MCP operation name and schema within the remaining definition budget; payload baseline and compatibility chain | SD | `revise` |
| Whether `buildRunCandidates` already consumes the inventory titles in this run or in a follow-up | SD | `warn` |
| Performance of about 150 run states through the MCP read worker and the SessionStart hook path | TP | `warn` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The node states that all consumers share selection semantics and records
  the companion as a separate projection with its own parser; the shared inventory as the single
  run-list owner and its stored-state basis must be added at closeout.

## Next Permissible Step

- next_allowed_action: Draft the PRD.
- forbidden_until_then: PRD approval, SD, TP and any implementation.

## Quality Outlook

- quality_outlook: Good if SD keeps one owner for title, attention and order, reuses the pure run
  state document helpers instead of a new parser, and keeps the MCP contract within budget; the main
  risks are a classification that over-claims "decision required" from stale stored state and a
  slow MCP read for large run stores.
