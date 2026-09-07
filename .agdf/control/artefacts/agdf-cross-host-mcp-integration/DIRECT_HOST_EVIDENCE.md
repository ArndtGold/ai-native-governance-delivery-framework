# Direct Host Evidence: Common AGDF MCP Lifecycle

Status: complete with bounded gaps  
Date: 2026-09-06  
Run: `agdf-cross-host-mcp-integration`  
Scope: authorized project-scope registration, fresh-session observation and complete removal  
Authority effect: none

## Evidence boundary

This report records directly observed host behavior. It does not replace the controlled MCP protocol
suite, deterministic adapter tests, QA, UAT or release qualification. Configuration read-back is not
treated as tool discovery. A successful dispatch in one host does not qualify another host, version,
client, operating system, architecture or package build.

The direct lanes used Node.js `v22.22.3`, npm `11.12.1`, Darwin `x64`, AGDF MCP server `0.14.5` and
server digest `97c2222a6651262486c31fd0acf5532d4a1ea9e8728ee735aa71b0ae72b26cd2`.
The test package was installed into an isolated temporary runtime. Public publication was not part of
this run.

## Common lifecycle operation form

The public command form for the lifecycle family uses an explicit absolute repository target:

```text
npx --yes @agdf/cli@0.14.5 mcp status  --surface <surface> --dir /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework --json
npx --yes @agdf/cli@0.14.5 mcp enable  --surface <surface> --dir /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework --json
npx --yes @agdf/cli@0.14.5 mcp disable --surface <surface> --dir /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework --json
```

The direct harness invoked the equivalent packaged local CLI entrypoint because
`@agdf/mcp-server@0.14.5` is not currently published. The block above documents the intended public
form; it is not a claim that registry acquisition was used. Native host inspection and fresh-session
commands were captured in the raw files named below. One bounded semantic dispatch was permitted per
usable fresh-host lane.

## Observed matrix

| Surface | Exact client | Registration | Fresh discovery and call | Cleanup | Qualification result |
|---|---|---|---|---|---|
| Codex | CLI `0.145.0`, fresh ephemeral session with `gpt-5.6-sol` | Project `.codex/config.toml` matched; native `mcp get` captured | One `agdf_dispatch` call observed. It returned the terminal, non-authorizing German control result for the explicit run at `CD+Tests`. | Registration and temporary runtime removed; baseline restored | `unverified`: direct failure-path evidence was not executed |
| OpenCode | CLI `1.18.3`, fresh JSON event session | Project `opencode.json`, `flat_v1`, matched; native list captured | One host tool call named `agdf_agdf_dispatch` invoked canonical server tool `agdf_dispatch`. It returned the same terminal result. No unrelated permission change was made. | Registration and temporary runtime removed; baseline restored | `unverified`: direct failure-path evidence was not executed |
| Claude Code | CLI `2.1.193`, fresh session reported `claude-opus-4-8[1m]` | Native local registration matched and native get captured | Initialization reported the AGDF MCP server as pending, then the session stopped with `authentication_failed` and `Not logged in`. No tool call occurred. | Registration and temporary runtime removed; baseline restored | `unverified`: authentication blocked discovery and dispatch |
| GitHub Copilot | Desktop application version `1.1.15`; no callable Copilot CLI | Project `.github/mcp.json` matched by independent file inspection | No automated fresh Desktop MCP session interface was available. Discovery, trust/policy and dispatch were not observed. | Registration and temporary runtime removed; baseline restored | `unverified`: direct client evidence is incomplete |

## Separated evidence layers

| Layer | Codex | OpenCode | Claude Code | Copilot |
|---|---|---|---|---|
| Configuration | matched | matched | matched | matched |
| Native read-back | observed | observed | observed | unavailable |
| Fresh-session discovery | observed | observed | blocked before discovery | unavailable |
| Canonical dispatch | passed once | passed once | not executed | not executed |
| Protocol contract | separate deterministic suite | separate deterministic suite | separate deterministic suite | separate deterministic suite |
| Baseline restoration | proved | proved | proved | proved |

No complete release qualification record was created. The machine-readable
`direct-evidence-results.json` deliberately keeps all four exact tuples `unverified`. Codex and
OpenCode have positive direct invocation evidence, while the immutable qualification contract also
requires direct failure-path evidence. Claude Code and Copilot have the additional gaps shown above.

## Cleanup proof

The reverse-order disables removed all four registrations. Independent post-removal inspection found
project `.codex/config.toml`, `opencode.json`, `.mcp.json` and `.github/mcp.json` absent. Existing user
Codex and OpenCode configuration hashes exactly matched the baseline; the Copilot user MCP file stayed
absent. Native Codex and Claude lookups reported no `agdf` server, and OpenCode reported no configured
MCP servers. The isolated direct-test runtime and cache roots were removed after the cleanup capture.

## Raw evidence

Raw evidence is retained under
`.agdf/control/artefacts/agdf-cross-host-mcp-integration/evidence/direct-host/`:

- `00-baseline.json` and `90-cleanup.json` bound the reversible mutation window.
- `10` through `14` contain Codex enable, native read-back, fresh session, lifecycle status and disable.
- `20` through `24` contain the equivalent OpenCode evidence.
- `30` through `34` contain the Claude Code evidence and authentication stop.
- `40` through `44` contain Copilot registration, client gap, lifecycle status and disable.
- `direct-evidence-results.json` contains the validated non-authorizing tuple results.
- `manifest.json` contains SHA-256 hashes for every retained raw and derived evidence file other than itself.

The first isolated npm acquisition attempt used an empty sandbox cache and stalled on restricted
registry access. It was interrupted and its partial stage was removed. The later authorized package
acquisition succeeded. This is environment evidence for package acquisition and is not a host defect.
