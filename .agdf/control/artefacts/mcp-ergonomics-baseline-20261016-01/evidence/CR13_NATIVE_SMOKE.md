# CR-13 Native Smoke Evidence

Run: mcp-ergonomics-baseline-20261016-01 · Date: 2026-10-16 · Code state: `main` `16d08888` plus this run's uncommitted changes

Obligation (CODE_REVIEW.md, CR-13): run the corrected native runner in native Claude Code sessions.
Each attempt: owner, external terminal, Claude Code 2.1.296, task T1, one round, 4 sessions
(2 models × 2 variants). Cleaned transcripts stay in gitignored `probe-results`.

## Attempts

| Attempt | Recorded (UTC) | Result | Cost (USD) | Consequence |
|---|---|---|---|---|
| 1 | 16:08 | 4 of 4 cells `aborted` with `runner_error`; no paid session | 0 | Regression from the CR-05 fix: `config.tasks` (ids) replaced the task objects in `planCells`. Fixed; a test now checks the runner's dry-run plan. The attempt showed CR-06 natively: cell errors stayed in their cells, the run finished, the plugin was uninstalled and the credential removal was checked. |
| 2 | 16:13 | 4 sessions ended with `Failed to authenticate: OAuth session expired and could not be refreshed` | 0 | New gap: the runner counted these error results as `measured`. Fixed: `sessionDisposition` makes error results `aborted`, with a test. Run 3 of the baseline has no error result (48 of 48 `success`, `is_error` false). Likely cause: the copied credentials were refreshed inside the isolated home during the long baseline run, so the real login kept a used refresh token. The runner now prefers `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`) and never writes it to output; the owner signed in again. |
| 3 | 16:20 | 4 of 4 `measured`, `complete: true`, isolation unchanged, credential copy removed (checked) | 0.52 | Pre-session MCP check connected at the first attempt (3.3 to 5.4 s); no MCP server besides `plugin:agdf:agdf`; built-in tools exactly the variant sets; authentication `credentials_copy` (the token was not in the runner's environment). |

## Coverage of the corrected runner

- Exercised natively: variant tool sets (`--tools`), disabled claude.ai connectors, pre-session MCP check, per-cell error containment (CR-06), checked credential removal, cleaned transcripts, session cost accounting for measured sessions.
- Unit tests only, not reachable in a regular run: signal cleanup (CR-08), charging an unknown session cost (CR-07). The empty-plan guard (CR-09) was checked locally without installing.

## Changes after the Code Review record

- `evals/scripts/run-mcp-ergonomics-native.js`: plan merge fix, error results through `sessionDisposition`, token authentication with redaction of the token value, `auth` mode in the output.
- `evals/mcp-ergonomics/lib/native-run.js`: `sessionDisposition`.
- `scripts/native-probes/lib/claude-session.mjs`: `withCopiedCredentials` uses `CLAUDE_CODE_OAUTH_TOKEN` when set and reports the mode.
- `evals/mcp-ergonomics/README.md`: authentication guidance.
- Tests: `test:mcp-ergonomics` 36 of 36 pass.

The baseline is unaffected: these changes touch only how sessions are run and classified, and no baseline session ended in an error.
