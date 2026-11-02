# Brownfield Review: Close Active Runs as Superseded or Abandoned

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `run-lifecycle-close-20261028-01`
- related_ur: `.agdf/control/artefacts/run-lifecycle-close-20261028-01/UR.md` (approved, revision 3)
- current_gate: Brownfield Review
- reviewer: Claude
- reviewed_at: 2026-10-28

## Objective

Size and route the approved UR: a human owner ends one or several active runs as `superseded`
(successor and reason) or `abandoned` (reason) through one previewed and explicitly confirmed
decision, reachable through CLI and MCP. Each ended run keeps its artefacts, carries its own sealed
receipt, rejects further delivery operations, leaves every active-run list and stays readable as
history. The closure is final.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The change adds an irreversible, possibly multi-run governance decision with a
  new visible state type (`superseded`, `abandoned`) across CLI, MCP hosts, cockpit, companion and
  status presentation. On the MCP path it must keep the confirmation with the human and prevent an
  agent from confirming its own preview, which is a safety-relevant authority boundary. The preview,
  confirmation and per-run result semantics are not yet defined.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `not_applicable` until the UX intent definition step runs before PRD.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Run lifecycle values and the only completion path | `packages/core/lib/control-state/run-state-parser.js:16-17` knows `superseded` and `abandoned`; `packages/core/lib/control-state/run-steps.js:381,403` writes only `completed` through OR closeout | `high` |
| Source of truth | Canonical `RUN_STATE.md` and artefact chain; backlog as derived pointer | `plugins/agdf/meta/contracts/control-scaffold.md:72-73`; `plugins/agdf/meta/contracts/interaction.md:329`; `packages/core/lib/control-state/run-backlog.js:24` | `high` |
| Runtime path | Run command contract and service with receipts and confirmation selectors | `packages/core/lib/control-state/run-command-contract.js:23,55,63` (`closeout.record` via `agdf_closeout`, `exact_material_confirmation`); `run-operations.js:8,24` (`RUN_OPERATION_KINDS`, closeout receipt shape); `run-command-service.js:115` (`lifecycle_ineligible`); `run-step-transaction.js:68` (journal kinds) | `high` |
| UI / UX | Companion open-run list, cockpit overview and run detail, status card | `plugins/agdf/host-templates/claude/companion/assignment.mjs:9-12` (open runs are `active`); `state.mjs:26` and `view.mjs:62` handle only `completed` as done; `packages/core/lib/control-inspect/cockpit.js:306` (overview from backlog sections) and `:109-143` (run detail); `docs/architecture/07-ui-konzept.md:156-159` | `medium` |
| Persistence / data | Sealed run writer, append-only receipts, backlog projection and its lock | `run-state-writer.js:304-369`; `approval-operations.js:6,37` and `run-operations.js:7,43` (`created_at`); `run-backlog-writer.js:15-35` (backlog lock; a pending step of another run blocks); `backlog-summary-shape.js:27` and `control-evaluation/shared.js:65-66` (accept `superseded`, `abandoned`) | `high` |
| Tests / QA | Core control-state tests, MCP server tests, companion suites, doctor and delivery-map | `packages/core/test/`; `packages/mcp-server/test/protocol.test.js`; `packages/cli/scripts/claude-companion-test.js`; `run-state-resolver.js:4-18` (`allActive`) used by `doctor.js:45` and `delivery-map.js:170` | `medium` |
| Release / operations | Contract text change chain and cross-host payloads | Contract text under `plugins/agdf/meta/contracts/` feeds Copilot payload baseline, eval fingerprints and compatibility records; MCP tools are shared by Claude, Codex, Copilot and OpenCode | `medium` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `high`
- architecture_reason: A new irreversible lifecycle transition enters the sealed canonical control
  state, with a new operation and receipt kind, a new public CLI command and MCP operation, and a new
  human-confirmation binding on the MCP path. Gate, approval, revision, recovery and continuation
  writers must reject ended runs consistently, and several readers must render the new states.
- architecture_evidence: `run-steps.js:360-406` (closeout as the only lifecycle writer);
  `run-command-contract.js:55,63`; `run-operations.js:8,24`; `run-command-service.js:115`;
  `run-revision-boundary.js:14,24,44`; `run-recovery.js:45,132`; `run-backlog-writer.js:24-25`;
  `cockpit.js:306`; `assignment.mjs:9-12`.
- architecture_missing_evidence: Whether every writer path (step, artefact, approval, presentation
  decision, PRD reopen, revise, update, recovery) rejects non-active runs; owner: Brownfield Analysis
  after TP approval and the SD.
- architecture_next_owner_and_action: UX intent definition, then PRD and SD decide the decision
  semantics, the operation and receipt shape, batch application and the MCP binding before any
  implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: a separate closure writer beside the run command service would duplicate locking, sealing, receipts and backlog synchronization | `run-command-contract.js:55` and `run-steps.js:360-406` already provide a confirmed, receipted lifecycle transition with backlog synchronization | `revise` | SD extends the run command contract with a new operation kind modelled on `closeout.record`; no parallel writer |
| problem: preview and apply without a bound digest would let a changed run be closed | `run-recovery.js:17-30,194` binds apply to a stored preview digest | `revise` | SD reuses the preview-digest pattern; apply checks each run's revision against the preview |
| unresolved: a batch confirmation across several sealed runs has no transaction owner | `run-step-transaction.js` journals one run; `run-backlog-writer.js:24-25` blocks writes while another run has a pending step | `revise` | SD decides between sequential per-run operations with a per-run result and a new batch journal |
| unresolved: the MCP path must keep confirmation with the human | approvals record `reply_provenance: caller_forwarded_deliberate_reply`, `independent_human_proof: unavailable` (`run-approve` output in this run) | `revise` | PRD defines what counts as the confirmation; SD reuses the presentation-bound approval path instead of a new trust mechanism |
| problem: readers that treat only `completed` as done may show ended runs wrongly | `state.mjs:26`, `view.mjs:62`; cockpit run detail evaluation by lifecycle (`cockpit.js:134-142`) | `warn` | Brownfield Analysis lists every reader; TP covers each with a test |
| trade-off: the backlog row moves to Completed / Superseded Pointers although the backlog's status role is planned to shrink | `run-steps.js:393,413` (`backlog.closeout`); backlog lifecycle rules in `.agdf/control/MASTER_BACKLOG.md` | `none` | Reuse the existing closeout backlog synchronization; the backlog role change stays a follow-up run |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: persistence_migration_depth. The closure is an irreversible lifecycle transition of
  the sealed canonical run record with a new receipt kind; further decisive triggers are an authority
  boundary (the human confirmation on the MCP path must not be confirmable by the agent) and an
  external contract (new public CLI command and MCP operation shared by four hosts). quick_task and
  verified_change are ineligible because CLI, persistence and authority behavior change. Rejected
  alternative: structured_slice, because `authority_boundary`, `full_depth_impacts_absent` and
  `migration_propagation_bounded` fail.
- evidence: This review
  (`.agdf/control/artefacts/run-lifecycle-close-20261028-01/BROWNFIELD_REVIEW.md`); approved UR
  revision 3; `run-steps.js:360-406`; `run-command-contract.js:55,63`; `run-operations.js:8,24`;
  `run-recovery.js:17-30`; `run-backlog-writer.js:24-25`.
- transparency_note: The UR is narrow, but the change touches the governance core: an irreversible
  state transition, a human decision and public interfaces. The high UI/UX impact adds the UX intent
  definition before PRD.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `persistence_migration_depth`
- decisive_full_depth_triggers: persistence (irreversible lifecycle transition and new receipt kind in
  sealed control state); authority (human confirmation binding on the MCP path); external contract
  (new CLI command and MCP operation).
- rejected_alternative: `structured_slice`
- missing_or_conflicting_facts: none for the depth decision; the writer-path coverage and the batch
  transaction design are design questions for SD and Brownfield Analysis.
- depth_evidence_refs: `run-steps.js:360-406`; `run-command-contract.js:55,63`;
  `run-operations.js:8,24`; `run-command-service.js:115`; `run-backlog-writer.js:24-25`;
  `docs/architecture/07-ui-konzept.md:156-159`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: end active runs as superseded or abandoned with a receipt; UR acceptance signals bound it |
| authority_boundary | `fail` | A new human decision type and its binding on the MCP path introduce an authority boundary |
| owner_consumer_coordination | `pass` | Core, CLI, MCP server, cockpit and companion are owned in this repository and change together |
| full_depth_impacts_absent | `fail` | Persistence, public CLI and MCP contract change |
| migration_propagation_bounded | `fail` | The transition is final; a wrong closure cannot be reverted by design |
| failure_recovery_local | `pass` | Failed or stale applies write nothing for the affected run; existing run-step recovery covers interrupted writes |
| independently_acceptable | `pass` | The command is acceptable on its own; inventory and hub changes are separate follow-ups |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What exactly does the preview show per run, and what does the human confirm (verbatim phrase, card action)? | PRD | `revise` |
| Which successor references are allowed (run id, other scope or artefact) and how is existence checked? | PRD | `revise` |
| How is the confirming person named in the receipt, given that independent human proof is unavailable today? | PRD | `revise` |
| How do cockpit run detail, companion and status card present `superseded` and `abandoned`? | PRD | `warn` |
| Batch application: sequential per-run operations with per-run results or a batch journal? | SD | `revise` |
| Operation kind, receipt shape and MCP tool placement (extend `agdf_closeout` or a new tool)? | SD | `revise` |
| Which writer paths must newly reject ended runs, and with which reason code? | SD | `revise` |
| May runs with an invalid seal or a pending run-step journal be closed, and how? | SD | `warn` |
| Native host evidence for the MCP path on Claude Code and Codex | TP | `warn` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The node records run-scoped control state rules; the new lifecycle
  transition, its receipt and the rejection of operations on ended runs must be added at closeout.

## Next Permissible Step

- next_allowed_action: Run the UX intent definition for the closure decision, then draft the PRD.
- forbidden_until_then: PRD approval, SD, TP and any implementation.

## Quality Outlook

- quality_outlook: Good if SD reuses the run command contract, the preview-digest pattern and the
  presentation-bound approval path; the main risks are an inconsistent rejection of operations on
  ended runs and an MCP binding that lets an agent confirm its own preview.
