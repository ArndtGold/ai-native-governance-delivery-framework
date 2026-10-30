# MCP Ergonomics Evaluation

Measures how the AGDF MCP interfaces behave for agents, so later interface changes can be compared
against a committed baseline. Metric definitions and the counting rule are in [METRICS.md](METRICS.md).

| File | Purpose |
|---|---|
| `call-matrix.v1.json` | Protocol call matrix: valid, schema-invalid and semantically failing calls per tool. |
| `tasks.v1.json` | Native task set T1–T6, models, variants, repetitions and the cost cap. |
| `findings-map.v1.json` | Maps the twelve findings of the 2026-10-16 interface review to metrics. |
| `baselines/<date>-<platform>/` | Promoted `baseline.json` and `REPORT.md`. |
| `lib/`, `test/` | Implementation and offline unit tests (`npm run test:mcp-ergonomics`). |

Matrix revision `v1.1` adds pre-Run `agdf_run/run.create` success, schema rejection and target-binding
rejection. Coverage is checked against the canonical command-group registry rather than a copied
tool-name list. Historical `v1` baselines retain their original calls and provenance.
Revision `v1.2` adds explicit `agdf_project/project.initialize` observation of authored
control, rejection of generic force input and rejection of a foreign target binding.
Fresh Git-only initialization and original-operation recovery have separate setup tests.

## Setup

The unit tests and all three commands use the MCP test harness in `packages/mcp-server`, whose SDK
comes from its separate lock. In a clean checkout install both locks and build first (see
[CONTRIBUTING.md](../../CONTRIBUTING.md#local-validation)):

```bash
npm ci --ignore-scripts
npm run build
npm --prefix packages/mcp-server ci --ignore-scripts
```

## Protocol layer (deterministic, offline)

```bash
npm run eval:mcp-ergonomics:protocol -- --out probe-results/mcp-ergonomics/protocol.json
```

It starts the provenance-matched MCP server from the current build (`--surface claude`, plus the
cockpit server without and with the MCP App UI capability), runs every matrix call five times against
fresh fixture repositories and writes per-call and per-tool metrics. Two runs on unchanged interfaces
must be identical in every non-timing metric.

`--capture-tools <file>` writes only the normalized `tools/list` capture; two captures are compared with
`npm run eval:mcp-ergonomics:compare -- --tools-before <file> --tools-after <file>`.

## Native layer (Claude Code, costs money)

Run it from an ordinary terminal **outside** the Claude Desktop app: the AGDF installer refuses to
install from inside a packaged app. Use a Claude Code version that recognizes the configured models.

```bash
npm run eval:mcp-ergonomics:native -- --out probe-results/mcp-ergonomics/native.json
```

It installs the current checkout into an isolated Claude home. Sessions authenticate with
`CLAUDE_CODE_OAUTH_TOKEN` when it is set (a long-lived token from `claude setup-token`; the runner never
writes it to any output). Without the token the runner stops unless `--credentials-copy` is passed; it
then copies `~/.claude/.credentials.json` for the run and always removes the copy. The token is the
default because when a copied access token expires during a long run, the
isolated session refreshes it, the rotated refresh token lives only in the removed copy, and the real
login can no longer refresh (observed on 2026-10-16; sign in again with `claude auth login`). The runner
runs 2 models × 2 variants (`with_skills`, `mcp_only`) ×
6 tasks × 2 repetitions. Round 1 covers every cell before round 2; no session starts once the reported
cost reaches the cap from `tasks.v1.json` (25 USD), and each session gets the remaining budget.
Before the first paid session the runner checks with `claude mcp list` that the AGDF MCP server is
connected and that no other MCP server is loaded (claude.ai connectors are disabled for the isolated home);
otherwise it starts the plugin launcher once, records its `AGDF_*` diagnostic codes and stops. The same free
check runs before every session; when the server is still not connected after one retry 30 s later, the
cell is `aborted` with `mcp_unavailable` and launcher diagnostics, and no paid session starts.
`--mcp-timeout-ms` (default 60000) sets Claude Code's `MCP_TIMEOUT` for the server start. The isolated
home lives in a short directory under `%TEMP%` (or `--work-root <dir>`), because the plugin MCP runtime
needs up to 180 characters below `<home>/plugins/data/agdf-agdf` and Windows paths are limited to 260;
the runner stops before the install when the budget is exceeded.
`--dry-run` prints the plan without starting sessions; `--tasks`, `--models` and `--repetitions`
narrow a run for diagnosis. Each session's stream-json transcript is written to
`<out>-transcripts/<repetition>-<task>-<variant>-<model>.jsonl` next to the output file, cleaned of
local roots, the home and temp directories, the user name and non-AGDF MCP server names
(`<CONNECTOR-n>`). Transcripts stay in `probe-results` for checking the success predicates and are
never promoted. Before/after hashes prove that the repository's `.agdf/control` and the
real Claude configuration subset stay unchanged.

## Promote and compare

```bash
npm run eval:mcp-ergonomics:compare -- --promote --protocol probe-results/mcp-ergonomics/protocol.json --native probe-results/mcp-ergonomics/native.json --out evals/mcp-ergonomics/baselines/<date>-<platform>
```

Promote fails closed when the baseline or report would contain local paths, identity markers or
credential patterns. A later run is compared with:

```bash
npm run eval:mcp-ergonomics:compare -- --baseline evals/mcp-ergonomics/baselines/<date>-<platform> --protocol <file> --native <file>
```

Protocol metrics must match exactly, per call and per tool; native metrics are `unchanged` within the
baseline range, and a native layer with metrics that could not be compared is `incomplete`. The command
exits non-zero unless every compared layer is `unchanged`.

## Re-evaluate a recorded run

When a predicate that depends only on the tool-call record is corrected, a recorded run is re-evaluated
from its cleaned transcripts instead of being re-run; the raw output stays unchanged:

```bash
node evals/scripts/reevaluate-mcp-ergonomics-native.js --native probe-results/mcp-ergonomics/native.json --tasks T6 --out probe-results/mcp-ergonomics/native-reevaluated.json
```

It refuses transcripts that contain an evidence write, because classifying such a write needs the
fixture's stale revision; those runs must be re-run. The report states the re-evaluation.
