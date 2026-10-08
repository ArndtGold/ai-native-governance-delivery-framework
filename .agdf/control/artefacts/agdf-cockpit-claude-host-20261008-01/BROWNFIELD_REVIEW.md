# Brownfield Review: AGDF Cockpit MCP App in Claude Code

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: agdf-cockpit-claude-host-20261008-01
- related_ur: .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UR.md
- current_gate: Brownfield Review
- reviewer: Claude Code implementing agent; no independent review claimed
- reviewed_at: 2026-10-08
- decision: pass

## Objective

Size the approved Claude Code availability of the existing cockpit MCP app: allow the existing cockpit mode for the Claude surface, ship the UI resource in the Claude plugin with a separate cockpit server entry, and verify the actual Claude host behavior. This review authorizes no implementation.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The cockpit UI itself is reused unchanged, but activation and recovery change materially. Plugin installation would make the cockpit available without the Codex opt-in preparation. Official Claude documentation states that Claude Code calls MCP app tools as text and does not render the UI, so in Claude Code the textual tool result can become the primary visible state and the browser cockpit the recovery path. What the user sees and can do in that case is not yet defined.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/UX_INTENT_DEFINITION.md; completed 2026-10-08 before PRD authoring. Two product confirmations (text-only behavior, acceptance-relevant surfaces) are carried into the PRD Approval Decisions.

## Existing-System View

Baseline commit: `fe02a54afb001072cb56eb7fbefce805acf394b1`. At review, the tracked delta is `MASTER_BACKLOG.md` (this run's row), and the only untracked paths are this run's artefact and state directories. The run `agdf-cockpit-mcp-app-20261005-01` (Codex cockpit) is awaiting UAT; its implementation is reused, not changed by this review.

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Server entry and mode | MCP server CLI and cockpit runtime factory | packages/mcp-server/bin/agdf-mcp.js:10 accepts `--cockpit-dir` only with `--surface codex`; packages/cli/lib/mcp-dispatch-runtime.js:26 `createMcpCockpitRuntime` rejects any surface other than `codex` | high: two surface guards must be extended consistently |
| Tool, resource and session contract | Core cockpit contract and services | packages/core/lib/control-inspect/cockpit-contract.js (tools, `ui://agdf/cockpit/v1.html`, `text/html;profile=mcp-app`, limits); cockpit-session.js; cockpit.js | low: reused unchanged |
| UI resource payload | Private React build and npm assembly | packages/control-ui/dist-mcp/cockpit.html (1,050,665 bytes) and manifest.json; scripts/assemble-npm.mjs:50-53 adds `ui/` to `@agdf/mcp-server` only for cockpit builds; packages/mcp-server/src/cockpit-resource.js loads `../ui/` with digest check | high: the plugin server copy has no `ui/` |
| Plugin MCP declaration | Plugin MCP sync | scripts/sync-plugin-mcp.js:14-24 `claudePluginMcpConfig` declares only `agdf`; SERVER_ENTRIES excludes `ui`; shared and copilot profiles share the server copy | high: new server entry and payload; profile boundaries must hold |
| Plugin launcher and data | Plugin runtime launcher | packages/cli/lib/mcp-lifecycle/plugin-runtime.js:146-156 parses no cockpit arguments; :212 spawns `--surface <surface>` only; runtime digests cover `mcp/server` | high: launcher contract and provenance digests change |
| Project binding | Task-target rules; Claude host variables | plugins/agdf/meta/contracts/task-target-resolution.md (cwd is not target authority); Claude Code MCP docs: plugin `.mcp.json` substitutes `${CLAUDE_PROJECT_DIR}` ("stable project root") in stdio `args` | medium: host-provided project root is a candidate binding; SD decides |
| Codex local profile | Opt-in preparation | scripts/prepare-cockpit-local.mjs writes `[mcp_servers.agdf-cockpit-local]` with `--surface codex` | low: must stay unchanged |
| Tests / QA | MCP, cockpit, plugin and UI suites | packages/cli/scripts/cockpit-mcp-test.js; packages/mcp-server/test/; packages/core/test/cockpit-*.js; packages/control-ui/test/; npm run native:claude-e2e | high: new protocol, packaging and live-host lanes |
| Release / operations | Plugin payload baselines and provenance | plugins/agdf/meta/copilot-payload-baseline.json; scripts/payload-budget.js; plugin source/runtime digests | medium: about 1 MB of new payload must be bounded per profile |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: The change adds a second plugin-declared MCP server to the Claude host contract, extends the launcher and server entry-point arguments, adds the UI resource to the plugin payload and its provenance digests, and introduces a host-provided project binding for a globally installed server.
- architecture_evidence: packages/mcp-server/bin/agdf-mcp.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/cli/lib/mcp-lifecycle/plugin-runtime.js; scripts/sync-plugin-mcp.js; scripts/assemble-npm.mjs; packages/mcp-server/src/cockpit-resource.js; Claude Code MCP docs (code.claude.com/docs/en/mcp); Claude MCP Apps quickstart (claude.com/docs/connectors/building/mcp-apps/quickstart).
- architecture_missing_evidence: Whether the Code tab of the Claude desktop app renders MCP app resources is undocumented and unobserved. The official quickstart states that Claude Code calls the tool as text and does not render the UI. Whether `${CLAUDE_PROJECT_DIR}` is a sufficient target authority is undecided. Owner: SD author, with an early host feasibility obligation in TP.
- architecture_next_owner_and_action: The SD author decides the cockpit launch contract (separate entry, launcher arguments, surface guard), the project-binding source, the UI payload placement per plugin profile with provenance, and the text-only result shape within approved PRD behavior.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: cockpit mode is Codex-only in two places | agdf-mcp.js:10; mcp-dispatch-runtime.js:26 | warn | SD: extend both guards together; keep the regular `agdf` server in dispatch mode only |
| problem: plugin server copy lacks the UI resource | sync-plugin-mcp.js SERVER_ENTRIES; assemble-npm.mjs cockpit branch | warn | SD: reuse the same `ui/manifest.json` and digest contract as the npm cockpit build; do not create a second UI packaging format |
| problem: launcher starts one server shape only | plugin-runtime.js parseLauncherArguments and spawn | warn | SD: extend the existing launcher and runtime data root; no second launcher or data directory |
| unresolved: host rendering in Claude | Official quickstart: Claude Code renders no MCP app UI; Code tab undocumented | warn | TP: early live probe in the Code tab and terminal; record the observed result; PRD/UX define the text-only experience |
| unresolved: project binding | `${CLAUDE_PROJECT_DIR}` documented for plugin args; cwd is not authority | warn | SD: decide and test the binding, including its failure state; no inference from cwd |
| trade-off risk: payload growth in shared profiles | Shared server copy also feeds the Codex runtime plugin and Copilot payload sync | warn | SD: limit the UI payload to the profiles that need it; keep the Copilot baseline unchanged unless reviewed |

No retained debt is accepted. All findings are scoped design obligations with named owners; none prevents the sizing route.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: release_cross_host_depth. The work activates an existing capability in another host through the distributed plugin payload: a new plugin MCP server declaration, launcher contract, payload and provenance, and installation/uninstallation behavior. structured_slice is rejected because full_depth_impacts_absent and authority_boundary fail. quick_task and verified_change fail on new host activation and the plugin contract.
- evidence: This review; approved UR; packages/mcp-server/bin/agdf-mcp.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/cli/lib/mcp-lifecycle/plugin-runtime.js; scripts/sync-plugin-mcp.js; official Claude Code MCP docs and MCP Apps quickstart.
- transparency_note: Full depth follows from the cross-host plugin contract and the new project-binding boundary, not from file count. The artefacts stay limited to the Claude Code cockpit availability and its honest host verification. Claude Desktop chat, connectors and publication remain excluded.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: release_cross_host_depth
- decisive_full_depth_triggers: Release, deployment or cross-host. Coordinated activation of the cockpit in Claude Code through the distributed plugin: a new server declaration, launcher and payload contract, and a lifecycle change. Secondary: an external contract change to the plugin MCP declaration and server entry-point arguments. No gate-policy change or durable data migration is proposed.
- rejected_alternative: quick_task and verified_change fail on new host activation and the plugin contract; structured_slice fails full_depth_impacts_absent and authority_boundary.
- missing_or_conflicting_facts: None for the depth decision. The rendering behavior of the Code tab and the binding sufficiency of `${CLAUDE_PROJECT_DIR}` remain explicit later evidence obligations and do not erase the evidenced cross-host trigger.
- depth_evidence_refs: Approved UR sections 3 and 5; agdf-mcp.js:10; mcp-dispatch-runtime.js:26; plugin-runtime.js:146-156 and :212; sync-plugin-mcp.js:14-24; https://code.claude.com/docs/en/mcp; https://claude.com/docs/connectors/building/mcp-apps/quickstart.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: the cockpit is available from the Claude plugin and its actual host behavior is verified (UR acceptance 1-2) |
| authority_boundary | fail | A globally installed server needs a new host-provided project binding; cwd is not target authority |
| owner_consumer_coordination | pass | Owners identified: mcp-server, cli launcher and runtime factory, plugin MCP sync, control-ui build, core cockpit services |
| full_depth_impacts_absent | fail | The plugin MCP declaration, launcher arguments, payload and provenance digests change for every Claude plugin installation |
| migration_propagation_bounded | pass | No data migration; propagation through the existing sync and reinstall; Codex profile untouched |
| failure_recovery_local | pass | Separate server entry keeps the regular `agdf` server isolated; plugin uninstall or reinstall restores state; browser cockpit remains |
| independently_acceptable | pass | The Claude host verification is independently acceptable; it does not depend on publishing or on Codex run completion |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| User-visible behavior when the host shows only text: content of the textual result, how the user is pointed to the browser cockpit, and whether the cockpit server is offered by default or opt-in | UX Intent / PRD | warn |
| Which Claude surfaces count for acceptance (Code tab, terminal), and what is recorded per surface | PRD | warn |
| Cockpit server declaration, launcher arguments, surface guard and project binding (`${CLAUDE_PROJECT_DIR}` or alternative) with failure states | SD | warn |
| UI payload placement per plugin profile, provenance digests, payload budgets and Copilot baseline | SD | warn |
| Early live probe in the Code tab and terminal before detailed packaging work; byte-identical control-state check | TP | warn |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The plugin MCP adapter node will gain a second, cockpit-mode server declaration for Claude. Curate it only after implementation and host evidence, before clean closeout. No graph change was made by this review.

## Next Permissible Step

- next_allowed_action: Execute the required UX Intent Definition, then draft the PRD through its owner and request a fresh Approval: PRD.
- forbidden_until_then: SD/TP authoring, implementation, plugin or installed runtime changes, host registration changes, QA/UAT/publication claims.

## Quality Outlook

- quality_outlook: The reuse path is clear: extend the existing guards, launcher, sync and UI manifest without a second cockpit. The decisive risk is host behavior. Official documentation indicates no UI rendering in Claude Code, so the most likely honest outcome for the terminal is a documented text-only limitation. The Code tab needs live evidence.

## Official Source Evidence

Fetched 2026-10-08:
- https://code.claude.com/docs/en/mcp states that plugin `.mcp.json` substitutes `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}` and `${CLAUDE_PROJECT_DIR}` ("stable project root") in stdio `command`, `args` and `env`. It also states that MCP Apps UI resources (`ui://`, `text/html;profile=mcp-app`) are pages for a host application to render; they are excluded from `@` suggestions and resource listings but remain readable by URI.
- https://claude.com/docs/connectors/building/mcp-apps/quickstart states: "Rendering the UI takes a host that supports MCP Apps, such as the Claude desktop app. Claude Code calls the tool as text and doesn't render the UI." It also notes that when a tool returns `structuredContent`, Claude Code passes that JSON object to Claude instead of the `content` text.
- https://code.claude.com/docs/en/desktop (search excerpt only, page not fetched) states that the desktop app loads MCP servers into local Code tab sessions; the excerpt does not state whether Code tab sessions render MCP app UI.

No Claude cockpit server was installed or tested during this review.
