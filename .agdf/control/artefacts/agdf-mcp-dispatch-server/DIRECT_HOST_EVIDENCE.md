# Direct Host Evidence: Cross-Host AGDF Dispatch Through MCP

Status: direct OpenCode-plus-Codex host lane complete; controlled dual-protocol lane complete
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Authorization: the user explicitly authorized project registration, direct testing and complete removal for OpenCode, Claude Code and, separately, Codex.

## Evidence boundary

This observation used an exact local-development runtime assembled from the current checkout. It is
not npm publication or clean consumer-install evidence. The server and dispatcher were copied into
separate project-scoped runtime roots, checked against the production ownership and digest inspector,
registered through the production lifecycle command and removed afterward.

The digest below identifies the runtime used for these retained host observations. A later source
correction to PRD-gate localization and ordered approval presentation has deterministic regression
evidence but has not been substituted into the completed host observations.

| Field | Observed value |
|---|---|
| Operating system | macOS Darwin x86_64 |
| Node.js | 22.22.3 at `/usr/local/Cellar/node@22/22.22.3/bin/node` |
| AGDF server and dispatcher | 0.14.5 |
| MCP SDK server/core | 2.0.0 |
| Server digest | `eea5fb02b369c77e61307145e18b604a65432f256b87202e5e9424461e2c32cf` |
| Dispatcher digest used by the direct host runs | `56f95fa650ca29e9079e3bb362c083c2bb96fac33d061515059c7fe6c37cc5d3` |
| SDK runtime digest | `b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb` |
| Transport | local STDIO |
| Protocol evidence | server tests negotiate 2026-07-28 and 2025-11-25; neither OpenCode nor Codex reports its selected generation |

Before testing, production lifecycle status returned `not_configured` for all three hosts, the
repository had no `opencode.json` or `.codex` directory, and the native Claude and Codex commands
reported no `agdf` registration.

## OpenCode 1.18.3

The production lifecycle registered the project-scoped flat 1.x form. `opencode mcp list` started the
owned server and reported `agdf connected` with the exact Node executable, exact versioned entrypoint
and `--surface opencode`. Each model observation used a separate `opencode run` process and exactly
one `agdf_agdf_dispatch` tool call. No other tool call appears in the retained NDJSON.

| Observation | Session | Result |
|---|---|---|
| Valid deterministic call | `ses_f893811e6ffen1bMc8s3qH5nmM` | `control_result`, `terminal: true`, `authorizes: false`, empty diagnostics; the visible German status card is byte-for-byte equal to `host_action.text` and the model stops. |
| Controlled semantic failure | `ses_f893741ddffeSymlJMn0iQ0Ln3` | `invalid_input`, `terminal: true`, `authorizes: false`, diagnostic `dispatch_input_invalid` for `skill_id`; the visible localized recovery equals `host_action.text` and the model stops. |
| Bounded continuation | `ses_f8935e899ffeZCcuhKZ2Z849I7` | `skill_continuation`, `terminal: false`, `authorizes: false`; `qa-gate`, repository target, run and current gate `QA` are preserved in the visible response. The model adds the prefix `skill_continuation:` although the requested one-line field format did not include it. |

Retained raw evidence:

- `evidence/opencode-mcp-valid-terminal.ndjson`, SHA-256 `da97f48e49c8b3f53c293b2e70a434abf5b1857e7753d2d609ae05bbc19e1303`
- `evidence/opencode-mcp-controlled-failure.ndjson`, SHA-256 `4b8465cf94c09f8ee03266b94df88dc4052a6e522ad8b3c226c60cca9b35a017`
- `evidence/opencode-mcp-continuation.ndjson`, SHA-256 `f319ec0ec435ea47e4d3fa7633658d788f0975039fc1613db94d7adc0a42ef44`

The first real removal exposed that OpenCode inserts a top-level `$schema` value and the lifecycle
left that generated shell behind when `opencode.json` had not existed before enablement. The adapter
now stores `AGDF_MCP_CREATED_CONFIG=true` only on entries for which AGDF created the configuration.
A direct retry showed `$schema` plus the owned entry after OpenCode discovery. `mcp disable` then
removed both the originally absent configuration file and the unreferenced runtime. A regression
test also proves that a pre-existing empty configuration is preserved.

## Codex CLI 0.145.0 with gpt-5.6-sol

The production lifecycle created the project-scoped `.codex/config.toml` and versioned runtime.
`codex mcp list` discovered `agdf` as enabled with the exact Node executable, versioned entrypoint
and `--surface codex`. Each observation used a fresh ephemeral read-only Codex process and exactly
one `agdf/agdf_dispatch` call. The user-default `gpt-6-astra` was rejected by Codex CLI 0.145.0
before any MCP call because that model requires a newer Codex version, so the evidence tuple records
the explicit compatible `gpt-5.6-sol` override.

| Observation | Session | Result |
|---|---|---|
| Valid deterministic call | `01a0770d-0690-7ad2-af0e-fe9bf5a74d2f` | `control_result`, `terminal: true`, `authorizes: false`, empty diagnostics; the visible German status card exactly equals `host_action.text` and the model stops. |
| Controlled semantic failure | `01a0770e-0ab9-7cd2-b2de-e9a59a217f26` | `invalid_input`, `terminal: true`, `authorizes: false`, diagnostic `dispatch_input_invalid` for `skill_id`; the visible localized recovery exactly equals `host_action.text` and the model stops. |
| Bounded continuation | `01a0770e-835f-7452-a983-d87e9f545298` | `skill_continuation`, `terminal: false`, `authorizes: false`, empty diagnostics; the visible line preserves `qa-gate`, repository target, run and current gate `QA` exactly, and no skill is executed. |

Retained raw evidence:

- `evidence/codex-mcp-valid-terminal.ndjson`, SHA-256 `863d4d0d3949db5c97cbf1a8259d58e78e649e5b4d3e07a7ab452e03dcffde99`
- `evidence/codex-mcp-controlled-failure.ndjson`, SHA-256 `4a04e785eac981bf80bbd72d85fb768c513fb15a658aeca9ffa14b60c7c1aabf`
- `evidence/codex-mcp-continuation.ndjson`, SHA-256 `6ee6dab2978d4661f0a88ba182d271a473f24348995249c5ce3d070f191a7235`

Codex emitted pre-existing host warnings about its model cache, plugin hook/icon manifests and state
database fallback. The retained runs also contain a non-tool warning for an under-development
request-input feature. These warnings did not prevent discovery or any of the three calls and do not
change the AGDF result.

The first real Codex removal deleted the owned registration and runtime but left the generated empty
`.codex/config.toml` and directory. The adapter now records whether it created the Codex file and
directory, removes only those owned empty shells and preserves pre-existing directories and files.
Focused regressions and a second direct enable/disable cycle restore the absent `.codex` pre-state.

## Claude Code 2.1.193

The production lifecycle registered `agdf` with native local scope. `claude mcp get agdf` reported
`Connected`, local project scope, STDIO, the exact Node executable and the exact versioned entrypoint.
A fresh `claude -p` process loaded the project and reported the `agdf` MCP server in its initialization
record. It then stopped before a model turn with `authentication_failed` and the visible message
`Not logged in · Please run /login`. No MCP tool call occurred.

Retained boundary evidence:

- session `c5a3d70a-5a92-4ff1-a510-f36a527dc5f8`
- `evidence/claude-mcp-authentication-boundary.ndjson`, SHA-256 `6b9600040256179a8e42a048c6a65b3733c26280ff8a3e7adbe91499ac0a6656`

The lifecycle removed the local registration and its runtime. The final native read-back reports no
server. Claude Code therefore has direct registration and discovery evidence only. Its model lane
remains unavailable until an authenticated fresh host exists.

## Failures found and corrected

1. The first OpenCode gate call returned `dispatch_control_presentation_failed` because this run had
   free-form English status values outside the canonical locale registry. The durable run now uses
   registered semantic values. The prescribed single retry returned the localized status card.
2. A schema-valid unknown skill was normalized in the worker parser before the dispatcher service
   could produce its canonical result. Wire parsing now retains structural rejection but delegates
   semantic value validation to the canonical dispatcher service.
3. OpenCode's generated `$schema` shell survived disablement when AGDF had created the file. The
   owned entry now records file origin and removes only an AGDF-created shell.
4. Codex disablement left an empty AGDF-created `.codex/config.toml` and directory. Origin metadata
   now restores the exact absent pre-state while preserving any pre-existing directory or content.

## Final cleanup

- OpenCode lifecycle: `not_configured`; registration and runtime absent; `opencode.json` absent.
- Codex lifecycle: `not_configured`; registration and runtime absent; `.codex` absent.
- Claude lifecycle: `not_configured`; registration and runtime absent; native read-back finds no server.
- Temporary runtime roots and runtime-construction scripts: absent.
- Host authentication, unrelated configuration and installed AGDF plugins were not changed.

OpenCode and Codex complete the directly observable host matrix on macOS x64 with the exact
local-development runtime. Controlled clients separately negotiate MCP `2026-07-28` and
`2025-11-25` against the same production server definition. Neither host exposes its selected MCP
protocol generation in the retained CLI or model output. Under the historical approved PRD
Revision 3, SD Revision 2 and TP Revision 1, that missing telemetry prevented qualification.
Approved PRD Revision 4, SD Revision 3 and TP Revision 2 separate the two evidence lanes. Renewed
Task Plan, Clean Implementation and Code Reviews plus QA Revision 2 classify both lanes as complete
for the approved first-release scope. Generic capability metadata remains `unverified`; only the
recorded exact OpenCode and Codex macOS x64 observations are qualified.
