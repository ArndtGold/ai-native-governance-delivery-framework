# Brownfield Review: Companion core in Core

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-d2818184-27fc-40ae-9195-70d080d3e926
- related_ur: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/UR.md (approved, sha256:00a55324a4a40f6abe5b0abd7194572ffa6623c4764787758e5a50cd9ae2ed95)
- current_gate: Brownfield Review
- reviewer: Claude (cooperative agent review for Arndt Gold)
- reviewed_at: 2026-11-05

## Objective

Size and route the approved UR, which moves the host-neutral companion concepts into Core:
- a shared run view used by the Claude companion and the MCP status card, including diagnosis of unreadable or unsupported runs;
- an event model the AGDF MCP server derives from its own operations;
- review facts for recorded material;
- figure states and texts.

The Claude companion is migrated onto this core. A Codex surface, approval through the companion and any gating are out of scope.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The companion gains new visible state types and feedback. These are an explicit hint for unreadable or unsupported runs and stores; event notices (approval requested, write rejected, effect unknown, recovery required, run completed); and a human-readable review of recorded material (preview, size, digest). Its next-step text also changes to the shared run view. These change visible state types and feedback inside one bounded capability (the companion). No authority, approval or cross-surface activation changes.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `not_applicable` (pending; it runs after this review and before PRD readiness)

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | The companion's view semantics live only in the Claude mod: `view.mjs` (`buildPanelView`, `terminalText`), `state.mjs` (`displayState`), `gate-bar.mjs`, `notice.mjs` (`observeNotice`, `statusText`), `figure.mjs`, `locales.json`, `localization.mjs` under `plugins/agdf/host-templates/claude/companion/`. The status card lives in `buildStatusCard` / `evaluateGateCheck` in `packages/core/lib/control-evaluation/gate-check.js`. | Two owners present the same run differently. The companion takes `next_allowed_action` from the pure gate policy (`gate-policy-pure.js:56`, "Fill the current UR control state … request exact approval"). `evaluateGateCheck` refines it, for example with artefact readiness (`gate-check.js:465-470`, "formulate and persist UR"). For unreadable runs the companion falls back to "No open runs" (`view.mjs:39-42`), while MCP reports `control_layout_unsupported`. | `high` |
| Source of truth | Run state `RUN_STATE.md` with typed records; durable operation receipts in `Run Operations` (`packages/core/lib/control-state/run-operations.js`, `RUN_OPERATION_KINDS`) | Accepted operations already have a durable canonical record. Rejected or effect-unknown outcomes exist only in the MCP tool result. | `medium` |
| Runtime path | Claude mod: `register.mjs` polls `$.fs` every 30 s and at `turn.complete`; its core bridge `core.mjs` imports 7 pure Core modules with no Node built-ins (closure check 2026-11-05; rewritten by `scripts/sync-package-assets.js:639-640`). `evaluateGateCheck` reads through `packages/core/lib/control-read/fs.js` (`node:fs`, `node:async_hooks`), so it cannot run in the mod as is. The MCP server observes every AGDF tool outcome in `postprocessToolResult` (`packages/cli/lib/mcp-dispatch-runtime.js`) for both facade (`server.js`) and generation (`generation-runtime.js`). The Cockpit already has a node-side captured read model and change observer (`control-read/snapshot.js`, `control-read/control-changes.js`, `cockpit-worker.js`). | A shared run view needs a pure projection over captured facts that works in the mod sandbox and in node. Events need a channel from the MCP server process to host surfaces. | `high` |
| UI / UX | Claude companion pane, status line and toasts; Codex surfaces in `packages/control-ui/src/mcp/` (`CompactCockpit.tsx`, `DecisionCard.tsx`) for later reuse | New visible state types and event feedback (see UI/UX routing) | `medium` |
| Persistence / data | No event store exists. Companion choices: `companion-state.json` in the plugin data directory (`persistence.mjs`). | Whether events are transient or durable is undecided. Durable storage must not become a second source of truth next to `Run Operations`. | `medium` |
| Tests / QA | `packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js`, `claude-companion-integrity-test.js`; gate-check and status-card tests in Core; MCP server suites (`test:protocol`, `test:run-command-flow`, `test:generation`) | Existing suites cover each owner separately; no parity test between companion and status card exists. | `medium` |
| Release / operations | Runtime plugin payload (Copilot payload budget `plugins/agdf/meta/copilot-payload-baseline.json`, currently 208,515 bytes headroom), compatibility record `docs/compatibility/*`, companion generation via `scripts/sync-package-assets.js` | Moving modules into Core and adding event code changes payload and compatibility evidence, which existing tooling re-records deterministically. | `low` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `high`
- architecture_reason: Four boundaries are affected:
  1. Module/owner: run presentation semantics move from the Claude mod into Core, and the central gate-check evaluator must be split into a capture part and a pure projection shared by CLI, MCP and companion.
  2. Runtime/host contract: a new channel carries MCP-server-observed events to host surfaces in other processes.
  3. External interface: hosts such as Codex must be able to read the run view and events through MCP.
  4. Data/SoT: event lifetime must not create a second source of truth next to `Run Operations`.
- architecture_evidence: `packages/core/lib/control-evaluation/gate-check.js:184` (`buildStatusCard`), `:323` (`evaluateGateCheck`), `:465-470` (next-step refinement); `packages/core/lib/control-evaluation/gate-policy-pure.js:54-56`; `packages/core/lib/control-read/fs.js` (node-bound read seam); `plugins/agdf/host-templates/claude/companion/core.mjs` (pure bridge, 7 modules); `packages/cli/lib/mcp-dispatch-runtime.js` (`postprocessToolResult`); `packages/core/lib/control-state/run-operations.js`; `packages/core/lib/control-read/control-changes.js`.
- architecture_missing_evidence: event delivery and lifetime (owner: SD); whether the Claude mod sandbox allows anything beyond pure modules and injected `$.fs` (owner: SD, verified by probe); Codex MCP App capabilities (owner: separate Codex run after a macOS probe).
- architecture_next_owner_and_action: UX Intent Definition defines the visible states and notices. PRD fixes the event set, review-fact bounds and the host-readable run-view contract. SD decides the evaluator split, the pure projection boundary, the event channel and lifetime, and the MCP surface.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: two run-presentation owners (companion vs. status card) | `view.mjs` / `state.mjs` vs. `gate-check.js:184-470`; observed diverging next step and hidden legacy runs on 2026-11-05 | `revise` | This run removes the parallel owner: one pure Core projection for both; the companion keeps only drawing |
| Reuse the pure gate policy and run-state document parsers already used by the companion | `core.mjs` imports `run-state-document.js`, `gate-policy-pure.js`, `run-state-policy.js`, `run-identity.js` | `none` | Extend these pure owners instead of adding a new parser |
| unresolved: gate-check refinements depend on node file access | `gate-check.js` reads artefacts, readiness and traceability through `control-read/fs.js` | `warn` | SD splits capture from projection; the projection consumes captured facts so mod (`$.fs`) and node (`fs`) feed the same function |
| Reuse `Run Operations` as the durable source for accepted-operation events; do not add a parallel event log for them | `run-operations.js`, `RUN_OPERATION_KINDS` | `warn` | SD derives durable events from `Run Operations` and keeps only non-durable outcomes (rejected, effect unknown) in the MCP observation channel |
| Reuse the Cockpit capture and change observer on the node side | `control-read/snapshot.js`, `control-read/control-changes.js`, `cockpit-worker.js` | `none` | SD evaluates reuse for MCP-side event push; no second watcher |
| unresolved: host-neutral exposure of run view and events through MCP | No current MCP operation returns companion-level view or events | `warn` | PRD/SD define the MCP surface; the Codex UI stays out of this run |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: Primary reason `architecture_runtime_depth`. Delivering the UR requires:
  - splitting the central gate-check evaluator into capture and a pure projection shared by CLI, MCP and the Claude mod;
  - introducing a cross-process event channel from the AGDF MCP server to host surfaces, including lifetime and SoT rules.

  Secondary trigger `external_contract_depth`: hosts must read the run view and events through a new MCP surface. Rejected alternative `structured_slice`: `full_depth_impacts_absent` fails on the architecture/runtime and external-contract evidence above. The compact paths `quick_task` and `verified_change` are ineligible: several owners, new contract, new runtime channel.
- evidence: this review; approved UR; code references in Existing-System View and Architecture Impact.
- transparency_note:
  - UX Intent Definition runs before PRD readiness because the companion gains new visible state types and feedback (`ui_ux_impact: medium`).
  - PRD, SD and TP are required. PRD may phase the delivery into two increments (shared run view first, then events and review facts) under this same Run.
  - Implementation-preparation Brownfield Analysis is required after TP approval.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `architecture_runtime_depth`
- decisive_full_depth_triggers:
  - Architecture or runtime: central evaluator split plus a new cross-process event channel.
  - External or public contract: new MCP surface for the run view and events, consumed by other hosts.
- rejected_alternative: `structured_slice` (bounded-slice check `full_depth_impacts_absent` fails)
- missing_or_conflicting_facts: none decisive for depth. Open design facts (event lifetime, mod sandbox limits, Codex capabilities) are routed to SD or a separate run and do not change the depth.
- depth_evidence_refs: this review; `packages/core/lib/control-evaluation/gate-check.js`; `packages/core/lib/control-read/fs.js`; `packages/cli/lib/mcp-dispatch-runtime.js`; `plugins/agdf/host-templates/claude/companion/core.mjs`

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: host-neutral companion core used by the companion and the status card |
| authority_boundary | `pass` | No new authority; approval and gating are explicit non-goals |
| owner_consumer_coordination | `pass` | Owners (Core, MCP server, Claude mod) are in one repository and one release |
| full_depth_impacts_absent | `fail` | Architecture/runtime and external-contract impacts evidenced above |
| migration_propagation_bounded | `pass` | No data migration; payload and compatibility propagation via existing deterministic tooling |
| failure_recovery_local | `pass` | Companion is observation-only; MCP write semantics stay unchanged |
| independently_acceptable | `pass` | Acceptance signals in the UR are testable without the later Codex UI |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which event types, severities and texts reach the human, and when do notices interrupt (toast) vs. stay in the pane? | `PRD` | `revise` |
| Bounds, truncation and redaction for material previews in review facts | `PRD` | `revise` |
| What host-readable contract (MCP operation or result field) exposes the run view and events, and with which size limits? | `PRD` | `revise` |
| How is `evaluateGateCheck` split into capture and a pure projection without changing CLI/MCP outputs? | `SD` | `revise` |
| Event channel and lifetime (transient per MCP process vs. durable), and how the Claude mod and the Cockpit read it without a second SoT | `SD` | `revise` |
| What can the Claude mod sandbox import and access beyond pure modules and `$.fs` (probe)? | `SD` | `warn` |
| Where do figure states and companion texts live in `agdf-interaction-locales.json`? | `SD` | `warn` |

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md (no node for run presentation or companion today)
- context_graph_required_action: `create`
- context_graph_gate_effect: `none`
- context_graph_evidence: The ownership decision "run presentation semantics are owned by Core; hosts only render" is reusable cross-host knowledge. Create the node at OR after SD fixes the owner boundaries.

## Next Permissible Step

- next_allowed_action: Run UX Intent Definition for the companion's new visible states and notices, then draft the PRD.
- forbidden_until_then: SD, TP, implementation, Codex UI changes, any approval or gating function in the companion.

## Quality Outlook

- quality_outlook: Add a parity test between companion and status card and an event test through the real MCP tool path (facade and plugin generation). Pre-implementation Brownfield Analysis must confirm the evaluator split keeps CLI and MCP outputs byte-stable.
