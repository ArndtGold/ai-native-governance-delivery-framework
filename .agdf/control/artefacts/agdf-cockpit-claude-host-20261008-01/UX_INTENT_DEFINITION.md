# UX Intent Definition: AGDF Cockpit MCP App in Claude Code

- run_id: agdf-cockpit-claude-host-20261008-01
- decision: ready
- blocking_reason: none
- primary_user_intent: With the AGDF plugin installed in Claude Code, open the existing cockpit for an explicitly named run and inspect its control state and registered sources. Where Claude cannot show the embedded view, learn that plainly and reach the same information through existing paths.
- success_signal: In an actual Claude Code session the user opens the cockpit for a named run and either sees the embedded cockpit for that run or receives an honest text result that names the limitation, the bound project and run, and the existing alternatives. The observed outcome is recorded per Claude surface.
- primary_decision_or_action: Open the cockpit for a run. Reading, selection and context actions never approve a gate or authorize implementation.
- working_modes: availability after plugin installation; embedded view (host renders the UI resource); text-only result (host shows only the tool result); browser fallback; binding or startup failure.
- affected_outputs: PRD behavior, acceptance criteria and Approval Decisions; later SD/TP mapping and per-surface host evidence.
- evidence: Approved UR sections 1-5; BROWNFIELD_REVIEW.md (official Claude sources, existing owners). The render result is inspected in packages/core/lib/control-inspect/cockpit-session.js:59-75: it returns only `schema_version`, `authorizes` and `target`, with the session id in `_meta`. packages/mcp-server/src/server.js:8-21 moves `_meta` out of `structuredContent`. Official MCP Apps quickstart: Claude Code calls the tool as text, does not render the UI and passes `structuredContent` to Claude as JSON text. The prior Codex UX intent (`agdf-cockpit-mcp-app-20261005-01/UX_INTENT_DEFINITION.md`) defines the embedded working modes and is reused unchanged.
- missing_evidence: Actual rendering and bridge capabilities in the Claude desktop Code tab and in the terminal are unobserved. Whether `_meta` reaches the model or the host in Claude Code is unobserved.
- open_product_questions: Two decisions for the PRD Approval Decisions table: (1) the text-only behavior proposed below versus suppressing the cockpit tool in hosts without UI support; (2) which Claude surfaces are acceptance-relevant (proposed: terminal and desktop Code tab, both observed). Neither blocks PRD drafting; both need confirmation before PRD approval.
- required_next_step: Register this analytical result, set the Brownfield routing evidence to ready, then prepare the PRD through prd-definition.

This is analytical input. Its proposed behavior becomes product authority only through the approved PRD. It contains no gate decision, approval or technical design prescription.

## Working Modes and State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| Availability | Cockpit offered as its own connection after plugin installation and Claude restart, separate from the regular AGDF connection | Connected; failed to start (with reason); not installed | Plugin installation and the started cockpit server | Claude's MCP server status view; AGDF installation output names the restart |
| Embedded view | Existing cockpit for the explicitly requested run, or the overview when none was requested | Same as the Codex cockpit: loading, current, partial, invalid, missing, stale, unsupported action | Core cockpit services and canonical control files | The embedded cockpit, unchanged from the Codex journey |
| Text-only result | The host shows the tool result as text; no embedded view exists | Embedded view not shown in this host; requested run accepted or unknown; project bound or binding failed | Core binding and run validation; observed host behavior for the limitation | The Claude conversation, relaying the tool's plain-language result |
| Browser fallback | Existing local browser cockpit for the same project | Available with its existing start path | Existing Core reads and browser session contract | Existing browser cockpit |
| Binding or startup failure | No usable project, control tree or UI resource | Project not bound; control absent; UI resource invalid; capacity reached | Cockpit server validation | Claude's MCP status view (startup) or the tool result (per call) |

## Activation Paths

- Installing the AGDF plugin and restarting Claude provides the cockpit connection. There is no separate opt-in preparation as on Codex. The regular AGDF connection keeps its tools and behavior.
- The user asks to open the cockpit, naming a run or continuing an unambiguously established run. The run is never inferred from directory, recency or inventory. This is the existing tool rule.
- When the host renders the UI, the existing embedded journey applies unchanged, including capability-gated context actions.
- When the host shows only text, opening produces a plain-language result instead of an empty technical object. It states that the embedded view is not shown in this host and names the bound project and the requested run. It names the existing alternatives: AGDF status through the existing read-only inspection, and the local browser cockpit. It claims no rendering, no selection and no current approval state.
- Uninstalling the plugin removes the cockpit connection with the plugin.

## Blockers and Recovery

| Blocker | Visible explanation | Permitted next action |
|---|---|---|
| Cockpit connection fails to start | Startup reason in Claude's MCP status (for example invalid UI resource, runtime preparation failure); regular AGDF connection unaffected | Reinstall the plugin and restart Claude; use the regular AGDF tools meanwhile |
| Plugin installed but Claude not restarted | Cockpit connection not yet listed | Restart Claude |
| No bound project or no AGDF control tree | Names the project identity the server received; no fallback to another directory | Open Claude in the intended project; initialize AGDF there if appropriate |
| Unknown, removed or invalid run | Names the requested run identity; no other run is selected | Name an existing run or open the overview explicitly |
| Host shows only text | Embedded view not shown in this host | Use AGDF status inspection or the local browser cockpit |
| Session capacity reached or session expired | Capacity or expiry is named | Close another cockpit view or reopen with the same run |
| Host lacks context or message capability | The existing cockpit disables those actions with its explanation | Read only; ask the question in the Claude composer manually |
| Tool permission prompt declined | The cockpit does not open; nothing changes | Allow the tool when wanted |

## Relevant State Transitions

1. Plugin installed → Claude restarted → cockpit connection connected, or failed with reason.
2. Open with run → embedded view for that run, or text-only result naming the run, or explicit unknown-run result.
3. Open without run → overview in the embedded view, or text-only result naming the project.
4. Embedded journey transitions are exactly those of the Codex cockpit (refresh, stale, document navigation, capability-gated context).
5. Session expiry or capacity → explicit message → reopen with the same run.
6. Plugin uninstalled → cockpit connection gone; regular AGDF connection gone with the plugin.

## Proposed PRD Acceptance Criteria

1. After plugin installation and restart, Claude Code lists the cockpit as its own connection. A failing cockpit connection leaves the regular AGDF tools usable.
2. In a Claude surface that renders the UI, opening the cockpit for an explicitly named run shows the existing cockpit for that run. An unknown run is reported with its requested identity and no other run is selected.
3. In a Claude surface that shows only text, opening the cockpit returns a plain-language result. The result states that the embedded view is not shown, names the bound project and the requested run, and names the AGDF status inspection and the local browser cockpit as alternatives. It contains no claim of rendering or current approval state, and it is not only a technical object.
4. Context and question actions are available only where the host demonstrably supports them; otherwise the existing explanation is shown.
5. A missing project binding or control tree is reported explicitly with the received project identity; the cockpit never reads another directory instead.
6. Opening, reading and failing never write control files or approve anything.
7. The observed outcome (rendered, text-only or failed) is recorded for each acceptance-relevant Claude surface, separately from protocol and automated evidence.
