# UAT Preparation: Simple Local Plugin Installation Scripts

Status: prepared_not_executed
Run: `agdf-local-plugin-install-scripts`
Date: 2026-08-23

These steps are prepared for later UAT. They do not authorize installation and must not be executed before QA approval and an explicit UAT action.

## Codex

1. From the AGDF repository root, run `npm run install:codex`.
2. Record the canonical version and the exact `+codex.local-<digest>` installed version shown by lifecycle evidence.
3. Confirm the command reports restart required and does not claim host loading.
4. Restart Codex and start a fresh task.
5. In the fresh task, exercise one behavior changed in the checkout and record the observed loaded plugin version or equivalent host evidence.

## Claude Code

1. From the AGDF repository root, run `npm run install:claude`.
2. Record marketplace and `claude plugin list` evidence, including explicit degraded verification if Claude omits a version.
3. Confirm the canonical AGDF version remains unchanged and the shared Codex projection is not replaced.
4. Restart Claude Code and exercise one source-checkout behavior in a fresh session.

## OpenCode

1. From the AGDF repository root, run `npm run install:opencode`.
2. Record the marker-owned local tarball path, content digest, package transition, installed version and SDK alignment.
3. Run the existing `opencode-status --json` check and retain package, native-surface and activation evidence separately.
4. Restart OpenCode and exercise one source-checkout behavior.
5. Confirm no published `create-agdf` package was substituted. A later public install may intentionally replace the local file dependency through the registry path.

## Acceptance Boundary

- Installation success is not UAT acceptance.
- Host restart and loaded behavior require direct observation.
- Repository governance activation is a separate state.
- Human acceptance requires the exact later `Approval: UAT` after reviewing the observations.
