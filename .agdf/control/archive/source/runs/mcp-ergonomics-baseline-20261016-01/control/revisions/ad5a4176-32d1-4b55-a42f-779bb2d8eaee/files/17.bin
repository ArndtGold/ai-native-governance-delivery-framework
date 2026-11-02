# SD: MCP ergonomics baseline evaluation

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

One new evaluation owner, `evals/mcp-ergonomics/`, measures the current AGDF MCP interfaces in two
layers and writes a reproducible baseline. It reuses the existing MCP test harness, the Claude native
probe mechanics and the `evals/` layout. No AGDF product source changes.

- **Protocol layer.** A script starts the provenance-matched AGDF MCP server built from the current
  checkout through the existing stdio test client, runs a versioned call matrix against deterministic
  fixture targets and records per-call and per-tool metrics after a fixed normalization.
- **Native layer.** A script installs the current checkout into an isolated Claude Code home, then runs
  non-interactive `claude -p --output-format stream-json` sessions for every model × variant × task cell
  in two rounds under a 25 USD cap, parses the stream into per-session metrics, evaluates deterministic
  success checks against the fixture state and proves isolation.
- **Baseline and comparison.** Runs write to the gitignored `probe-results/`; an explicit promote step
  writes the redacted baseline and report to a tracked directory. A compare script checks a fresh run
  against the committed baseline.

## 2. Ownership And Source Of Truth

- Tool definitions, outcomes and result shapes stay owned by the Core contracts
  (`packages/core/lib/skill-dispatch/contract.js`, `control-inspect/contract.js`,
  `control-state/run-command-contract.js`, `control-inspect/cockpit-contract.js`) and the server
  adapter `packages/mcp-server/src/`. The evaluation only observes them.
- MCP client harness: `packages/mcp-server/test/helpers.js` (`withStdioClient`) and
  `packages/mcp-server/test/owned-runtime.js` (`createOwnedRuntimeFixture`) remain the owners; the
  evaluation imports them.
- Claude session parsing, path redaction and host isolation move from inline code in
  `scripts/native-probes/claude-host-e2e.mjs` into one shared module
  `scripts/native-probes/lib/claude-session.mjs`, owned by the native probes and consumed by both the
  probe and the evaluation.
- Fixture mutation proof stays with `evals/lib/skill-evals/workspace.js`.
- New owner `evals/mcp-ergonomics/` owns: metric definitions (`METRICS.md`), the versioned call matrix,
  task set and findings map, the measurement and comparison code, and the committed baselines.

## 3. Architecture Decisions

- SDD-001: Place the evaluation in `evals/mcp-ergonomics/` (`lib/`, `call-matrix.v1.json`, `tasks.v1.json`, `findings-map.v1.json`, `METRICS.md`, `baselines/{date}-{platform}/`) with entry scripts `evals/scripts/run-mcp-ergonomics-protocol.js`, `run-mcp-ergonomics-native.js` and `compare-mcp-ergonomics.js`, registered as `eval:mcp-ergonomics:protocol|native|compare` and `test:mcp-ergonomics` in the private root `package.json`; rationale: follows the existing eval layout and keeps the published `create-agdf` manifest untouched; consequence: the root `package.json` is part of the compatibility snapshot, so compatibility evidence must be re-recorded from LF bytes.
- SDD-002: The protocol layer imports `withStdioClient` and `createOwnedRuntimeFixture` and starts the server with `--surface claude`; the cockpit server is started with `--cockpit-dir` and measured twice, once without and once with the declared MCP App UI capability, so gated tools are either measured or reported as not exposed; rationale: no second server bootstrap and the same mechanism for later phases; consequence: requires a current package build (`dist/npm/create-agdf`) before measuring.
- SDD-003: Measured targets are deterministic fixture repositories generated per run in temporary directories through the canonical CLI and the existing fixture builders in `packages/cli/scripts/fixtures/`, with fixed run IDs and synthetic artefacts; the repository's own `.agdf/control` (copied by the owned-runtime fixture) is never a measured target; rationale: reproducible response content; consequence: fixture builders become a dependency of the evaluation.
- SDD-004: Byte metrics use the exact text content and structured content the client received after normalization: every occurrence of fixture and runtime roots (raw, forward-slash and JSON-escaped forms) is replaced by fixed placeholders and every value of a key ending in `_ms` is set to 0; raw bytes are kept as informational; estimated tokens are `ceil(normalized UTF-8 bytes / 4)`; rationale: exact repeatability across runs and machines; consequence: token figures are estimates, not tokenizer counts.
- SDD-005: One written counting rule in `METRICS.md` classifies every call as `ok`, `sdk_validation` (`isError` with SDK input-validation text), `agdf_failure` (structured outcome in `invalid_input`, `evaluator_error`, `target_unresolved`, `rejected`, `effect_unknown`), `protocol_error` (JSON-RPC error) and flags `failure_without_isError`; native invalid-argument calls are `tool_result.is_error` items carrying SDK validation text; rationale: separates schema errors from AGDF's own failure signalling as the review requires; consequence: the classifier depends on the SDK error text, which a test pins.
- SDD-006: Extract a generalized `scripts/native-probes/lib/claude-session.mjs` (isolated home and data root, install of the current checkout through `create-agdf`, credential copy removed in `finally`, stream-json parsing of all tool_use/tool_result pairs with tool name, `is_error` and content bytes, init and result events, path redaction); `claude-host-e2e.mjs` consumes it with unchanged observable output; rationale: no copy-paste and one seam for the later Codex slice; consequence: the existing probe is refactored and must be re-verified.
- SDD-007: Variants share one isolated installation; `with_skills` runs as installed with allowed tools AGDF MCP tools, `Skill`, `Read` and `Bash`; `mcp_only` adds `--disable-slash-commands` and `--settings` with `disableAllHooks: true` and allows only AGDF MCP tools and `Read`; each session verifies from its init event and transcript that the AGDF MCP server is connected and, for `mcp_only`, that no AGDF skill or hook output is present, otherwise the cell is `not_measured` with reason; rationale: host configuration only, no product change; consequence: depends on Claude Code flag behavior, verified first in TP.
- SDD-008: Native metric sources are the stream-json `result` event (`total_cost_usd`, `usage`, `num_turns`, `duration_ms`), the `init` event (model, tools, MCP server status) and tool_use/tool_result items (per-tool calls, `is_error`, content bytes normalized per SDD-004); cost is Claude Code's reported API-equivalent cost; absent fields become `unavailable` with reason; rationale: only host-provided data, no extra API keys; consequence: per-tool tokens are estimates.
- SDD-009: Sessions run sequentially; round 1 visits all 24 cells (2 models × 2 variants × 6 tasks) in a fixed order alternating models, then round 2 repeats them; before each session the runner stops if the cumulative reported cost is at least 25 USD and passes `--max-budget-usd` equal to the remaining budget; an interrupted run is marked `incomplete`; rationale: every cell is measured at least once even if the cap is hit; consequence: a cap hit leaves repetition 2 partial.
- SDD-010: Each task's success check is a deterministic predicate over the fixture's control state after the session (read through canonical read-only CLI JSON such as `gate-check --json`) and the structured tool-call record; no model prose is judged; rationale: verifiable outcomes; consequence: tasks are limited to effects the control state can prove.
- SDD-011: Isolation proof uses SHA-256 manifests before and after a native run for the repository `.agdf/control` tree and for the real Claude configuration subset (`settings.json`, `settings.local.json`, `plugins/installed_plugins.json`, `plugins/known_marketplaces.json`); volatile operator-session data (`projects/`, `todos/`, `statsig/`, counters in `~/.claude.json`) is excluded because the operator's own session writes it; fixture mutation uses `snapshotWorkspace`/`changedPaths`/`mutationViolations` against each task's allowed paths; rationale: concrete, checkable isolation; consequence: the configuration subset is a defined boundary, not the whole directory.
- SDD-012: Runs write observations (JSONL) and aggregates to `probe-results/mcp-ergonomics-{stamp}/`; `--promote` runs the redaction check (fails closed on absolute paths, credential patterns or unbounded prose) and writes `baseline.json` (provenance: AGDF version, server/dispatcher/SDK digests from the owned-runtime marker, Claude Code version, models, platform, Node version, date, task-set and call-matrix versions, completeness flag) and `REPORT.md` with the findings mapping; the compare script checks non-timing protocol metrics for exact equality and native metrics against the recorded range; rationale: committed artefacts only after explicit review; consequence: an extra promote step for the maintainer.
- SDD-013: Offline unit tests (`test:mcp-ergonomics`) cover normalization, classification, stream parsing, scheduling and budget, redaction and comparison with recorded synthetic stream fixtures, and join the repository lane in `scripts/verify-ci.mjs`; the protocol and native layers stay manual commands; rationale: guards the evaluation code without hosts or credentials; consequence: the verification plan and its test change.
- SDD-014: Before implementation the protocol layer's normalized `tools/list` output of `agdf` and `agdf-cockpit` is captured; after implementation it must be byte-identical, and a diff-scope check allows changes only in `evals/`, `scripts/native-probes/`, root `package.json`, `scripts/verify-ci.mjs` with its test, compatibility evidence and this run's control artefacts; rationale: proves the interfaces stayed unchanged; consequence: the first capture happens before any other implementation step.

## 4. Integration Points

- MCP stdio protocol against `packages/mcp-server/bin/agdf-mcp.js` in an owned-runtime fixture
  (`--surface claude`, optionally `--cockpit-dir`), protocol 2026-07-28 through the existing client.
- Canonical CLI (`packages/cli/bin/create-agdf.js`) and fixture builders for fixture generation and
  read-only success checks.
- Claude Code CLI 2.1.268: `claude plugin` / install through `create-agdf claude --json` into an
  isolated `CLAUDE_CONFIG_DIR`; `claude -p` with `--model`, `--output-format stream-json`, `--verbose`,
  `--allowedTools`, `--disable-slash-commands`, `--settings`, `--max-budget-usd`.
- Real `~/.claude/.credentials.json` is read once per session and copied into the isolated home, then
  removed.
- `scripts/verify-ci.mjs` repository lane; compatibility evidence `docs/compatibility/evidence/`.

## 5. Constraints And Compatibility

- No AGDF product source, plugin payload, CLI or MCP behavior changes (PRD constraints, AC-014).
- The published `create-agdf` package manifest stays unchanged; new scripts live in the private root
  `package.json`.
- `claude-host-e2e.mjs` keeps its observable output and exit semantics after the extraction.
- Compatibility evidence is re-recorded with `npm run compatibility:record` from LF bytes; on Windows the
  working copy must be normalized first (see run `compat-evidence-lf-20261016-01`).
- Node 22 or later; the protocol layer and unit tests run on Windows, macOS and Linux; the native layer
  runs on this Windows machine.
- Native runs never write outside the isolated home, the fixtures and `probe-results/`.

## 6. Test And Evidence Strategy

- Unit tests (SDD-013) with synthetic stream and response fixtures, run offline in CI.
- Refactor check: `claude-host-e2e.mjs` output before and after extraction on a recorded transcript.
- Before-capture and after-comparison of normalized `tools/list` (SDD-014).
- Two consecutive protocol runs and their comparison (AC-003).
- One native run (rounds per SDD-009) with observations, cost, isolation manifests and fixture
  mutation checks; spike evidence for the MCP-only configuration before the full run.
- Redaction check output, promoted baseline and report, compare run against the promoted baseline.
- Existing suites (`npm test` lanes touched: verify-ci repository lane, mcp-server tests) stay green;
  code review of the evaluation owner.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Versioned call matrix runs valid, schema-invalid and semantically failing calls per `agdf` tool; cockpit measured with and without declared UI capability | evals/mcp-ergonomics call matrix; mcp-server test harness | SDD-002, SDD-003 | Requires current package build; gated cockpit may stay hidden and is then reported with reason |
| AC-002 | Per-call and per-tool metrics after normalization; definition bytes and documented-parameter share from tools/list | evals/mcp-ergonomics metrics; Core contracts as observed source | SDD-004 | none — read-only observation of existing responses |
| AC-003 | Normalization makes non-timing metrics exact; latency summarized as median and p95; compare script checks equality | evals/mcp-ergonomics compare | SDD-004, SDD-012 | Unnormalized nondeterminism found later must be added to the rule and documented |
| AC-004 | One written counting rule with call classes and `failure_without_isError` flag | evals/mcp-ergonomics METRICS.md | SDD-005, SDD-013 | SDK error text may change with an SDK update; pinned by a unit test |
| AC-005 | `tasks.v1.json` with T1 to T6, fixture builder, prompt, success predicate and allowed paths | evals/mcp-ergonomics task set | SDD-001, SDD-010 | none — new versioned file |
| AC-006 | Stream parsing of init, tool and result events into per-session records | scripts/native-probes/lib/claude-session.mjs; evals/mcp-ergonomics | SDD-006, SDD-008 | Claude Code stream fields may change; missing fields become unavailable |
| AC-007 | Two variants from one installation; MCP-only via host flags and verified per session | evals/mcp-ergonomics native runner | SDD-007 | Flag behavior verified first; failure yields not_measured, not a product change |
| AC-008 | Two rounds over all cells; report shows both values and range | evals/mcp-ergonomics native runner and report | SDD-009 | none — two repetitions only show a range, stated in the report |
| AC-009 | Before/after manifests for repository control and Claude configuration subset; fixture mutation check | evals/lib/skill-evals/workspace.js; evals/mcp-ergonomics | SDD-011 | Volatile session data is excluded by definition |
| AC-010 | Redaction check before promote; structured fields only | scripts/native-probes/lib/claude-session.mjs; evals/mcp-ergonomics | SDD-006, SDD-012, SDD-013 | Fails closed; a false positive blocks promote until reviewed |
| AC-011 | Provenance block from owned-runtime marker, host and environment facts | evals/mcp-ergonomics baseline | SDD-012 | none — read-only facts |
| AC-012 | Promoted baseline and report under `evals/mcp-ergonomics/baselines/`; root scripts for each layer and compare | evals/mcp-ergonomics; root package.json | SDD-001, SDD-012 | Root package.json change requires compatibility re-recording |
| AC-013 | `findings-map.v1.json` maps the twelve review findings to metric IDs or a reason; rendered in the report | evals/mcp-ergonomics findings map | SDD-001, SDD-012 | none — new versioned file |
| AC-014 | Normalized tools/list captured before and compared after; diff-scope check | evals/mcp-ergonomics; git diff | SDD-014 | Probe refactor and CI lane change are inside the allowed scope |
| AC-015 | Sequential rounds, cumulative cost check before each session, per-session `--max-budget-usd` | evals/mcp-ergonomics native runner | SDD-009 | Reported cost is an API-equivalent figure |

## 8. Risks And Open Questions

- `--disable-slash-commands` and `disableAllHooks` might not suppress every AGDF influence in Claude
  Code 2.1.268; TP starts with a spike, and failure yields `not_measured` instead of a product change.
- Claude Code stream-json fields can change between versions; the parser records the host version and
  marks missing fields `unavailable`.
- Opus cost may hit the cap during round 2; the run is then `incomplete` but covers every cell once.
- The package build must be current before the protocol layer runs; the runner fails with a clear
  message otherwise.
- Re-recording compatibility evidence on Windows can capture CRLF bytes; follow the LF normalization of
  run `compat-evidence-lf-20261016-01`.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Harness reuse by import or shared extraction | before_sd | resolved | Import the MCP test harness; extract Claude session parsing, redaction and isolation into a shared native-probe module (SDD-002, SDD-006). | Arndt Gold |
| Baseline location and data format | before_sd | resolved | Runs in gitignored probe-results; promoted `baseline.json` and `REPORT.md` under `evals/mcp-ergonomics/baselines/` (SDD-012). | Arndt Gold |
| MCP-only configuration in Claude Code | before_sd | resolved | Same installation plus `--disable-slash-commands` and `disableAllHooks`, verified per session; otherwise not_measured (SDD-007). | Arndt Gold |
| Token estimation rule and metric sources | before_sd | resolved | Normalized bytes divided by four; stream-json result, init and tool items as sources (SDD-004, SDD-008). | Arndt Gold |
| Session order and budget enforcement | before_sd | resolved | Two sequential rounds over all cells; cumulative check plus per-session budget flag (SDD-009). | Arndt Gold |
| Isolation boundary for real configuration | before_sd | resolved | Manifests for repository control and a defined Claude configuration subset; volatile session data excluded (SDD-011). | Arndt Gold |
| Command and CI registration | before_sd | resolved | Scripts in private root package.json; unit tests in the verify-ci repository lane (SDD-001, SDD-013). | Arndt Gold |
| Exact call matrix, fixture states, prompts and success predicates | later_tp | open | Fixed in TP with tests; execution detail within SDD-003 and SDD-010. | Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Eine neue Messkomponente unter `evals/mcp-ergonomics/` misst die heutigen AGDF-MCP-Schnittstellen in zwei Ebenen und erzeugt einen reproduzierbaren Ausgangswert. Sie nutzt den vorhandenen MCP-Testclient, die Mechanik der nativen Claude-Probe und die bestehende `evals/`-Struktur; AGDF-Produktcode bleibt unverändert.
- Umfang: Die Protokollebene startet den aus dem aktuellen Checkout gebauten Server über den vorhandenen Testclient mit `--surface claude`, misst das Cockpit einmal ohne und einmal mit erklärter UI-Fähigkeit und arbeitet auf deterministischen Fixture-Repositories, nie auf dem echten `.agdf/control`. Bytes werden nach einer festen Normalisierung gemessen (Pfade durch Platzhalter ersetzt, Zeitwerte `_ms` auf 0), Tokens als normalisierte Bytes geteilt durch vier geschätzt. Die native Ebene installiert den Checkout in ein isoliertes Claude-Code-Verzeichnis und führt `claude -p` mit stream-json für alle 24 Kombinationen in zwei Runden aus; Kosten, Tokens und Tool-Aufrufe kommen aus dem Stream, der Erfolg aus deterministischen Prüfungen des Fixture-Zustands.
- Umfang (Ablage und Prüfung): Läufe schreiben nach `probe-results/`; erst ein ausdrücklicher Promote-Schritt mit Bereinigungsprüfung legt `baseline.json` und `REPORT.md` unter `evals/mcp-ergonomics/baselines/` ab. Ein Vergleichsskript prüft neue Läufe gegen den Ausgangswert. Unit-Tests ohne Host und Zugangsdaten laufen in der Repository-Lane der CI. Vor der Umsetzung wird die `tools/list`-Ausgabe festgehalten und danach auf Byte-Gleichheit geprüft.
- Entscheidungen: Testclient und Fixture werden importiert; Parser, Bereinigung und Isolation der Claude-Probe werden in ein gemeinsames Modul ausgelagert, das die Probe und die Messung nutzen. „Nur MCP“ heißt dieselbe Installation plus `--disable-slash-commands` und `disableAllHooks`, je Sitzung geprüft, sonst „nicht gemessen“. Zwei Runden nacheinander mit Kostenprüfung vor jeder Sitzung und Budget je Sitzung. Isolation über Prüfsummen von `.agdf/control` und einer festgelegten Teilmenge der Claude-Konfiguration. Befehle im privaten Root-`package.json`, daher müssen die Kompatibilitätsnachweise neu aufgezeichnet werden. Aufrufmatrix, Fixtures, Prompts und Erfolgsprüfungen legt der TP fest.
- Risiken: Die Claude-Code-Schalter könnten AGDF-Einflüsse nicht vollständig abschalten; der TP beginnt deshalb mit einem Vorabtest. Stream-Felder können sich mit Claude-Code-Versionen ändern. Opus-Kosten können den Deckel in Runde 2 erreichen. Der Paket-Build muss aktuell sein. Kompatibilitätsnachweise unter Windows müssen aus LF-Bytes aufgezeichnet werden.
- Nächster Schritt: Dieses Solution Design prüfen und nur mit `Approval: SD` freigeben.
