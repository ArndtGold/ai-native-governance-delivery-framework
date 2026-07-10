# Solution Design: Surface Bootstrap and Registry Readiness

## Status

- status: approved
- approval: Approval: SD (2026-07-10)

## Architecture Decision

Extend the existing `create-agdf/bin/create-agdf.js` command owner, its single smoke-test harness, and the existing ordered `publish` job. Generated assets remain sourced from `plugin/` through the current sync flow; no parallel bootstrapper or release workflow is introduced.

## Global Plugin Adapters

Add narrow helpers in `create-agdf/bin/create-agdf.js` for command execution, marketplace refresh, plugin-list inspection, version extraction, and actionable mismatch errors. Tests provide stub `codex` and `claude` executables through `PATH`; production code keeps inherited command output.

### Codex Flow

1. Add the AGDF marketplace.
2. Run `codex plugin marketplace upgrade agdf`.
3. Run `codex plugin add agdf --marketplace agdf`.
4. Run `codex plugin list`, extract the `agdf@agdf` row, and compare its version to `pluginDefinition.version`.
5. Missing or mismatched evidence exits non-zero and names expected version, observed version, and corrective command.

### Claude Code Flow

1. Add and refresh the AGDF marketplace with Claude's supported marketplace commands.
2. Read `claude plugin list`.
3. Use `claude plugin install agdf@agdf` when absent; otherwise use `claude plugin update agdf@agdf`.
4. Read the list again and compare the version when it is exposed. If the CLI does not expose a version, report that limitation and the supported verification command without claiming a verified version.

No scope flag is added, preserving Claude's default user scope.

## Copilot Update Ownership

Use existing generated-file lists and a target-aware overwrite policy:

- Refresh AGDF-owned `.github/copilot-instructions.md`, `.github/instructions/agdf-governance.instructions.md`, `.github/skills/**`, `.agdf/control/README.md`, and `.agdf/control/templates/**` on a Copilot rerun.
- Preserve `.agdf/control/config.json` as user language preference; only the dedicated `config` target updates it normally.
- Preserve a user-owned or ambiguous `AGENTS.md` and refresh `AGENTS.agdf.md` as the merge fragment.
- Refresh a root `AGENTS.md` only when it has the canonical AGDF root heading.
- Keep `--force` as the sole explicit path to overwrite arbitrary existing files; its output names affected files.

Determine all write permissions before writing any file, preventing partial update results. The completion output names preserved and refreshed files.

## Publish Readiness

After the existing `@agdf/cli` publish step, add one bounded bash polling step. It reads the package version, repeatedly checks `npm view create-agdf@<version> version --json` and `npm view @agdf/cli@<version> version --json`, and fails with package, version, attempts, and last error on timeout. Publish commands themselves are not retried.

## Test Design

- Extend `create-agdf/scripts/smoke-test.js` with temporary executable stubs to assert Codex refresh/install/list ordering and version mismatch failure.
- Assert Claude valid install and update paths and the absence of `plugin add`.
- Add Copilot rerun fixtures for AGDF-owned root `AGENTS.md`, user-owned `AGENTS.md`, and existing language config.
- Add focused static validation for the publish workflow's two exact package checks and bounded retry controls.

## Compatibility

First-run behavior and existing fragment behavior remain. The release sequence remains `create-agdf` publish, `@agdf/cli` publish, then registry readiness verification. No private CLI cache paths are treated as version authority.

## Traceability

| Requirement | Design owner |
|---|---|
| Codex refresh and version verification | global plugin adapter helpers |
| Claude supported install/update | global plugin adapter helpers |
| Copilot safe rerun | target-aware overwrite policy |
| npm exact-version readiness | existing publish job readiness step |
| isolated regression coverage | create-agdf smoke-test harness |
