# Direct Host Evidence: Common AGDF MCP Lifecycle

Status: complete with bounded gaps  
Date: 2026-09-08
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

## Language-selection follow-up

The approved Revision 2 language contract was exercised on 2026-09-08 with another exact local
`0.14.5` package build, runtime digest
`22d784d9bef670ef4ba56cbd3404dc2b2cf95c40f8514a6fdcf99fdf9d9e3dce`. Each request used a new
client process. The controlled set covered an explicit German response, an explicit English
response, a German-dominant request, a request with no dominant language and an explicit valid but
unsupported `fr-FR` response language.

| Surface | Direct result | Observed language behavior | Host boundary |
|---|---|---|---|
| Codex CLI `0.145.0` | pass in five fresh ephemeral `gpt-5.6-sol` sessions | submitted `de`, `en`, `de`, `en` and `fr-FR`; resolved complete packs were `de`, `en`, `de`, `en` and `en`; every result was `authorizes: false` | An initial run with the configured `gpt-6-astra` failed before MCP because this CLI version requires a newer client. The retained matrix uses the already evidenced compatible model. |
| OpenCode CLI `1.18.3` | pass after controlled retry, with retained host variance | successful observations submitted `de-DE`, `en`, `de-DE`, `en` and `fr-FR`; resolved packs were `de`, `en`, `de`, `en` and `en`; every successful result was `authorizes: false` | Two initial fresh sessions did not expose the connected tool. Another supplied the OpenCode Skill name as `skill_id` and failed closed. The first mixed request selected `de-DE`; its retry selected `en` after native MCP preflight and explicit no-dominant-language wording. That retry omitted the requested run and used `current_repository`, so language selection passed while full argument fidelity did not. |
| Claude Code CLI `2.1.193` | unverified | no language call | Native project registration verification failed and left no registration; prior fresh-session evidence is also blocked by missing authentication. |
| GitHub Copilot Desktop `1.1.15` | unverified | no language call | No callable local Copilot MCP client was available for this follow-up. No temporary registration was created. |

These observations show that the canonical tool description can guide Codex and OpenCode, while an
LLM host can still omit or alter unrelated arguments and a fresh OpenCode process can transiently
miss a natively connected MCP server. The server cannot infer the user's language or repair a host's
argument selection because it does not receive the conversation. Strict schema and service checks
therefore remain the enforcement boundary, and loaded-host selection remains qualified separately.

The raw follow-up evidence is under `evidence/language-host/`. `language-host-results.json` separates
language selection, dispatch success and full context fidelity. `manifest.json` records SHA-256 and
byte length for all 25 retained files. The project `.codex/config.toml` and `opencode.json` were
removed through the lifecycle service. Native Codex and Claude lookups report no `agdf` server,
OpenCode reports no configured MCP server, and the isolated runtime root was removed after its last
reference.

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
