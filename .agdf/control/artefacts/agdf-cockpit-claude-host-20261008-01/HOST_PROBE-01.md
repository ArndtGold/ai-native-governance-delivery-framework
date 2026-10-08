# Host Probe 01: Claude Code MCP App Capability

- run_id: agdf-cockpit-claude-host-20261008-01
- task: T-001 (scenario SCN-017)
- date: 2026-10-08
- host: Claude Code 2.1.268 on Windows 11 (win32)
- authority: evidence only; no approval, no control-state change

## Probe

A minimal stdio server, `agdf-ui-probe`, kept outside the repository in the session scratchpad, uses `@modelcontextprotocol/server` 2.0.0 from `packages/mcp-server/node_modules`. It records the protocol era and the declared client capabilities. It offers one tool, `agdf_probe_ui`, with `_meta.ui.resourceUri: ui://agdf-probe/v1.html`, and a resource of MIME type `text/html;profile=mcp-app`.

## Stage 1: SDK self-test (control)

A client built on `@modelcontextprotocol/client` 2.0.0 declares `extensions["io.modelcontextprotocol/ui"].mimeTypes = ["text/html;profile=mcp-app"]`. The probe recorded exactly that declaration (legacy era), listed the tool with its `_meta.ui`, served the resource with the MCP app MIME type and answered the call. So the probe records UI capability correctly when a client declares it.

## Stage 2: Claude Code client in a sandbox (no user configuration touched)

`CLAUDE_CONFIG_DIR` pointed to a scratchpad sandbox. The probe was added there at user scope, and `claude mcp list` ran from a scratchpad project directory. The result was `√ Connected`, and the probe recorded:

```json
{"event":"initialized","era":"legacy","clientCapabilities":{"elicitation":{"form":{}},"roots":{"listChanged":true}},"clientVersion":{"name":"claude-code","title":"Claude Code","version":"2.1.268"}}
```

- Claude Code 2.1.268 opened a 2025-era (legacy) connection.
- It declared no `extensions` and no `io.modelcontextprotocol/ui` capability.
- This matches the official documentation: Claude Code calls MCP app tools as text and does not render the UI.
- Under SDD-04 the Claude cockpit tools would therefore be hidden for this client.

Limitation: this observation comes from the health-check connection of the Claude Code CLI engine. An interactive desktop Code-tab session could declare additional capabilities; only stage 3 can show that.

## Stage 3: Claude desktop Code tab

With user consent on 2026-10-08, `agdf-ui-probe` was registered at local scope for this project (`claude mcp add --scope local`, written to `~/.claude.json`). The user opened new Code-tab sessions in this repository and invoked `agdf_probe_ui` twice; the second run used an extended probe that also logged tool calls and UI resource reads. The registration was then removed (`claude mcp remove agdf-ui-probe --scope local`). The repository control tree was not touched.

Recorded by the probe (second run, pid 39664):

```json
{"method":"server/discover","era":"modern","protocolVersion":"2026-07-28","clientInfo":{"name":"claude-code","version":"2.1.293"},"clientCapabilities":{"roots":{"listChanged":true},"elicitation":{"form":{},"url":{}}}}
{"event":"tool_call","era":"modern"}
```

- The desktop Code tab runs Claude Code 2.1.293 and connects with protocol revision 2026-07-28 (modern era, `server/discover` with a per-request envelope).
- The declared client capabilities contain no `extensions` and no `io.modelcontextprotocol/ui` entry.
- The tool was called, but the host never read the UI resource `ui://agdf-probe/v1.html`; no `ui_resource_read` event occurred. The host therefore made no attempt to render the MCP app UI.
- The model in the Code-tab session received the `structuredContent` (`{"probe":"called"}`) as text, consistent with the official Claude documentation.

Result for SCN-017: the Claude desktop Code tab on Windows (Claude Code 2.1.293) neither declares nor renders MCP app UI. Under the approved PRD and SD-04, the cockpit tools would be hidden there.

## Spike findings for T-003

1. Replacing `server.server.setRequestHandler` on the instance intercepted only `server/discover`, not the tool or resource handlers that `McpServer` installs. Wrapping those handlers this way is not viable.
2. In the modern era, the per-request envelope with `io.modelcontextprotocol/clientCapabilities` was visible in the `server/discover` handler context. Inside the `McpServer` tool callback, however, `ctx.mcpReq.envelope` and `getClientCapabilities()` were both `null`.

T-003 must therefore take the capabilities from a reliably observed source: the `initialize` capabilities in the legacy era, and the request envelope or `server/discover` in the modern era. It applies them per connection through `RegisteredTool.enable()`/`disable()` or through explicit low-level handlers. This stays within SDD-04 (per-connection gating on declared capabilities).
