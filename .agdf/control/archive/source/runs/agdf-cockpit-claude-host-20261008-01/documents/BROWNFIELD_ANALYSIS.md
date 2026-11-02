# Brownfield Analysis: AGDF Cockpit MCP App in Claude Code

Type: Brownfield Analysis
Mode: pre_implementation_analysis
Status: done

## Run

- run_id: agdf-cockpit-claude-host-20261008-01
- approved_sources: UR, PRD, SD, TP of this run (all approved 2026-10-08)
- reviewer: Claude Code implementing agent; no independent review claimed
- reviewed_at: 2026-10-08
- decision: pass

## Scope

Implementation preparation for TP tasks T-001 to T-010 against the existing system. This analysis grants no approval and changes no gate.

## Existing Coverage And Reuse Path

| TP task | Existing owner | Coverage | Reuse strategy |
|---|---|---|---|
| T-001 | none in repository (probe lives in the session scratchpad) | not_done | new, temporary, outside the repository. A preliminary capability read with `claude -p --mcp-config` (Claude Code engine, no user configuration change) may precede the Code-tab probe. The Code-tab registration needs user consent. |
| T-002 | `packages/mcp-server/bin/agdf-mcp.js:10`; `packages/cli/lib/mcp-dispatch-runtime.js:26` | partially_done (Codex only) | extend both guards; no new runtime |
| T-003 | `packages/mcp-server/src/server.js` (`buildAgdfServer`, `serveAgdfStdio`) | not_done | extend |
| T-004 | `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (`parseLauncherArguments`, `launchPluginMcpServer`) | partially_done | extend with one Claude form |
| T-005 | `scripts/assemble-npm.mjs:13-20` (inline UI validation) | partially_done | refactor into one shared helper; keep the npm cockpit assembly guard Codex-only |
| T-006 | `scripts/sync-plugin-mcp.js` (`claudePluginMcpConfig`, `SERVER_ENTRIES`, prune), `scripts/sync-package-assets.js:538` `syncPackageAssets({ surface })`, `packages/cli/scripts/prepare-local-plugin.js:19` | partially_done | extend with an explicit Claude variant |
| T-007 | existing isolated-install pattern (memory of 2025-09-25 sandbox E2E); `npm run native:claude-e2e` | partially_done | reuse the `CLAUDE_CONFIG_DIR` sandbox approach |
| T-008 | `packages/mcp-server/test/`, `packages/cli/scripts/cockpit-mcp-test.js`, `plugin-mcp-runtime-test.js`, `copilot-profile-test.js`, `mcp-lifecycle-test.js`, `packages/core/test/cockpit-*.js`, `packages/control-ui` tests | fully_done (existing suites) | rerun, extend where the tasks require |
| T-009 | `npm run install:claude` | partially_done | reuse; Claude restart required |
| T-010 | `docs/architecture/06-agdf-cockpit.md`, `packages/control-ui/README.md` | partially_done | extend |

## Implementation Path And Interfaces

- SDK capability access (SDK `@modelcontextprotocol/server` 2.0.0):
  - The server factory used by `serveStdio` receives only the protocol era, not client capabilities.
  - Capabilities are available as `initialize` capabilities (2025 era) and as the per-request envelope (2026-07-28).
  - `Server.getClientCapabilities()` is backfilled per request; the low-level `Server` offers `setRequestHandler` and `removeRequestHandler`, and the handler context carries the envelope.
  - T-003 therefore gates inside request handling: the tools/list, resources/list and resources/read results for the Claude cockpit are filtered by the current client capabilities, and the cockpit tool handlers check them before delegating to the session service.
  - Preferred mechanism: wrap the handlers that `McpServer` installs, with a minimal spike as the first step of T-003. Fallback that still satisfies SDD-04: toggle `RegisteredTool.enable()`/`disable()` per connection before list handling, because stdio serves exactly one client per connection.
  - The Codex cockpit path keeps the unwrapped registration.
- Capability predicate: `capabilities.extensions?.["io.modelcontextprotocol/ui"]?.mimeTypes` includes `text/html;profile=mcp-app`. It is a pure function with unit tests; no ext-apps runtime dependency on the server.
- Launcher: Claude cockpit form `--cockpit-dir VALUE` with `CLAUDE_PLUGIN_DATA` data root. `VALUE` must be absolute and must not contain `${`. The spawned server receives `--surface claude --cockpit-dir VALUE`. `ensurePluginMcpRuntime` is shared and unchanged.
- Sync:
  - `syncPluginMcp` gains an explicit option for the Claude cockpit variant; with it, `ui/manifest.json` and `ui/cockpit.html` go into the expected-file set, so the existing prune keeps them.
  - `syncPackageAssets({ surface: "claude" })` passes the option.
  - `copyPluginPackages` already copies the whole `mcp/server` directory, so the runtime data root receives `ui/` with no further change.
  - `cockpit-resource.js` resolves `../ui/` relative to `src/`, which matches the plugin copy layout.
- Provenance: `digestDirectory(mcp/server)` covers `ui/` automatically. Generated plugin trees are git-ignored local build outputs, so the variant does not change tracked files.

## Regression Risks And Test Impact

| Risk | Evidence | Mitigation |
|---|---|---|
| Wrapping SDK handlers depends on SDK internals | `McpServer` installs its handlers privately (`setToolRequestHandlers`) | Spike first; fallback per-connection enable/disable; tests in both protocol eras |
| Codex cockpit behavior drift | `packages/cli/scripts/cockpit-mcp-test.js:21-24,62,105` asserts the Codex registration | Keep the Codex path unwrapped; rerun the test unchanged |
| Default plugin output drift | `copilot-profile-test.js`, `plugin-mcp-runtime-test.js` assert generated MCP files | Default sync stays one-entry; new tests for the Claude variant only |
| Copilot payload baseline | `plugins/agdf/meta/copilot-payload-baseline.json` | Copilot profile never receives `ui/`; baseline check must pass unchanged |
| Concurrent runtime preparation | `ensurePluginMcpRuntime` catch path re-inspects after a failed prepare | T-007 exercises concurrent first start of both servers |
| Windows paths with spaces | `${CLAUDE_PROJECT_DIR}` may contain spaces | Passed as one argv element; T-004 tests a path with spaces |
| UI build missing on fresh checkout | `packages/control-ui/dist-mcp/` is git-ignored | Claude variant fails closed with `AGDF_COCKPIT_UI_BUILD_REQUIRED`; other surfaces unaffected |
| Installed plugin cache is used by this session | Reinstall changes the running session's plugin | T-009 only with user consent; restart required |

## Parallel-Structure Check

No second server, launcher, data root, UI packaging format or cockpit contract is introduced. UI validation is consolidated rather than duplicated (SDD-06). The Claude gating is a surface-specific wrapper around the existing registration, not a second registration path.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The plugin MCP adapter node will record the second Claude cockpit server declaration and capability gating after implementation evidence, before clean closeout.

## Required Next Step

Start CD+Tests with T-001. Report the probe result to the user before T-002. T-001 and T-009 change local Claude configuration and run only with explicit user consent.
