# MCP Ergonomics Metrics

This document is the single written counting rule for the MCP ergonomics evaluation. Code under
`evals/mcp-ergonomics/lib/` implements exactly these definitions; unit tests in
`evals/mcp-ergonomics/test/` pin them.

## Normalization (SDD-004)

Every byte metric is taken from the content the MCP client actually received, after two
replacements:

1. Every known root (fixture repository, owned MCP runtime, temporary directory) is replaced by a
   fixed placeholder, in its raw, forward-slash, JSON-escaped, doubly JSON-escaped and slash-escaped
   forms. Longer roots are replaced first.
2. Every value of a JSON key ending in `_ms` is replaced by `0`.

Raw byte counts are kept as `text_bytes_raw` for information only. They are not compared.

Estimated tokens are `ceil(normalized UTF-8 bytes / 4)`. This is a fixed estimate rule, not a
tokenizer count.

## Protocol layer

Per call (call matrix v1, `call-matrix.v1.json`):

| Field | Definition |
|---|---|
| `tool` | Tool name as listed by `tools/list`. |
| `call_class` | Matrix category: `valid`, `schema_invalid` or `semantic_failure`. |
| `class` | Classification below. |
| `outcome` | `structuredContent.outcome`, else `outcome` parsed from the text content; cockpit results with `state: "blocked"` report `blocked:<code>`; else `null`. |
| `is_error` | `result.isError === true`; `null` for a protocol error. |
| `text_bytes` | Normalized UTF-8 bytes of all text content items joined. |
| `structured_bytes` | Normalized UTF-8 bytes of `JSON.stringify(structuredContent)`; `0` when absent. |
| `est_tokens` | Estimated tokens of `text_bytes`. Text content is what Claude Code passes to the model. |
| `latency_ms` | Median and p95 over five executions of the same call. |

Per tool (`tools/list`):

| Field | Definition |
|---|---|
| `definition_bytes` | Normalized UTF-8 bytes of the tool's `tools/list` entry as JSON. |
| `params_total` | Number of top-level properties in `inputSchema.properties`. |
| `params_documented` | Number of those properties with a non-empty `description`. |
| `documented_share` | `params_documented / params_total`, `null` when `params_total` is 0. |
| `description_chars` | Length of the tool description. |
| `has_output_schema` | The tool declares an `outputSchema`. |
| `has_title` | The tool declares a non-empty `title`. |
| `annotations` | The declared annotations, recorded as is. |

## Classification (SDD-005)

Each call or native tool result has exactly one `class`:

| Class | Rule |
|---|---|
| `protocol_error` | The request ended with a JSON-RPC error (no tool result). |
| `sdk_validation` | `isError` is true and the text starts with `Input validation error:` (MCP server SDK 2.0.0). |
| `agdf_failure` | The outcome is one of `invalid_input`, `evaluator_error`, `target_unresolved`, `rejected`, `effect_unknown`, or a cockpit `blocked:<code>`. |
| `tool_error_other` | `isError` is true and none of the rules above applies. |
| `ok` | Everything else. |

Rules apply in the order of the table. `failure_without_isError` is a flag, not a class: it is
true when `class` is `agdf_failure` and `isError` is not true. It measures review finding 1.

## Native layer

Per session (`claude -p --output-format stream-json --verbose`):

| Field | Definition |
|---|---|
| `model`, `variant`, `task`, `repetition` | Cell identity; `variant` is `with_skills` or `mcp_only`. |
| `tool_calls` | Count of `tool_use` items per tool name. AGDF MCP tool names are normalized to their `agdf_*` suffix. |
| `invalid_argument_calls` | `tool_result` items with `is_error` true and SDK input-validation text. |
| `is_error_results` | `tool_result` items with `is_error` true. |
| `agdf_failure_results` | AGDF tool results classified `agdf_failure`. |
| `agdf_shell_calls` | `Bash` or `PowerShell` calls that invoke the AGDF CLI (`agdf-local.js`, `create-agdf`, `agdf-validator`). |
| `agdf_tools_discovered` | AGDF MCP tools returned by `ToolSearch` (`tool_reference` results); Claude Code loads MCP tools on demand. |
| `mcp_status`, `agdf_skill_entries`, `hook_guard` | What the session loaded: AGDF MCP server status at init, AGDF skill entries and the AGDF hook guard in context. |
| `other_mcp_servers`, `builtin_tools` | Number of MCP servers other than `plugin:agdf:agdf` at init and the built-in (non-`mcp__`) tools offered at init. |
| `mcp_check` | The free `claude mcp list` check before the session: status and duration per attempt, plus launcher diagnostics when it failed. |
| `permission_denials`, `denied_tools` | Number of `permission_denials` in the `result` event (else `unavailable`) and the distinct denied tool names, normalized like `tool_calls`. |
| `response_tokens` | Estimated tokens of normalized `tool_result` text, per tool. |
| `total_tokens` | Sum of `usage` input, output, cache read and cache creation tokens from the `result` event, else `unavailable`. |
| `cost_usd` | `total_cost_usd` from the `result` event (Claude Code's API-equivalent figure), else `unavailable`. |
| `wall_time_ms` | `duration_ms` from the `result` event, else the measured process time. |
| `success` | The task's deterministic success predicate (`tasks.v1.json`). |
| `transcript` | Repository-relative path of the cleaned session transcript in `probe-results`; never part of a promoted baseline. |
| `status` | `measured`, `not_measured` (variant verification failed, with reason) or `aborted` (budget, host failure or `mcp_unavailable` from the pre-session check, with reason; an aborted pre-check costs nothing). Variant verification requires the AGDF MCP server `connected` or `pending` at init (Claude Code connects servers in the background), no other MCP server, no built-in tool outside the variant, AGDF skills present for `with_skills`, and neither skills nor the hook guard for `mcp_only`. |

Tools per variant (SD SDD-007): `with_skills` gets the seven AGDF MCP tools, `Skill`, `Read`, `Bash` and
`PowerShell` (Claude Code's shell on Windows); `mcp_only` gets the seven AGDF MCP tools and `Read`. Both also
keep `ToolSearch`, through which Claude Code loads MCP tools on demand. `--allowedTools` pre-approves these
tools; `--tools` limits the built-in set, because Claude Code otherwise offers every built-in tool and runs
read-only ones (`Glob`, `Grep`, read-only shell commands) without approval. claude.ai connectors are
disabled (`ENABLE_CLAUDEAI_MCP_SERVERS=false`). `mcp_only` also runs with `--disable-slash-commands` and all
hooks disabled.

Aggregates per model × variant × task: both repetition values and their range (minimum and
maximum). Two repetitions show a range, not a robust spread.

## Comparison

- Protocol layer: every non-timing metric must be equal, per call and per tool (tool names, total and
  per-tool definition bytes, documented parameters, description length, output schema, title and
  annotations); latency is reported but not compared.
- Native layer: a metric is `unchanged` when the new value lies within the recorded range of the
  baseline cell, otherwise `changed`; metrics missing on either side are `not_comparable`. The overall
  native status is `changed` when any metric changed, otherwise `incomplete` when any metric was not
  comparable, otherwise `unchanged`. The compare command exits non-zero unless every layer is `unchanged`.
