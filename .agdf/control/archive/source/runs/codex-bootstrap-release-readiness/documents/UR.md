# User Requirement: Surface Bootstrap and Registry Readiness

## Status

- status: approved
- approval: Approval: UR (2026-07-10)
- owner: agent

## Problem

`npx --yes @agdf/cli@latest codex` can report a successful global installation while keeping a stale AGDF plugin because Codex reuses an existing local marketplace snapshot. The Claude Code bootstrap invokes `claude plugin add`, but the installed Claude CLI exposes `install` and `update`, not `add`. Copilot receives copied repository files and cannot rerun its bootstrap non-destructively once those files exist. Immediately after publishing, npm can also resolve `latest` to a version that is not yet consistently retrievable, producing `ETARGET` for the first user invocation.

## Objective

Make global Codex and Claude Code bootstraps perform reliable refresh/install operations and verify the resulting plugin version where the surface exposes it. Give Copilot a non-destructive upgrade path for AGDF-owned generated files. Make the release workflow wait until both npm packages for the release version are resolvable before declaring publishing complete.

## Acceptance Criteria

1. The `codex` bootstrap refreshes the configured `agdf` marketplace before adding the plugin and fails with an actionable error when the installed version differs from the expected AGDF version.
2. The `claude` bootstrap uses supported Claude CLI installation/update commands and verifies the resulting plugin version when available.
3. A rerun of the Copilot bootstrap updates AGDF-owned generated files without overwriting user-owned `AGENTS.md`; ambiguous ownership must fail clearly instead of requiring a blanket `--force`.
4. The release workflow polls npm until `create-agdf` and `@agdf/cli` are resolvable at the tagged version, with a bounded timeout and clear failure output.
5. Focused automated coverage verifies the surface-specific command sequences, version mismatch behavior, and Copilot rerun safety without modifying real user configurations.

## Scope

- In scope: `create-agdf` Codex and Claude Code global-bootstrap behavior, Copilot repository-bootstrap update semantics, focused tests, and `.github/workflows/publish-agdf.yml` readiness checks.
- Out of scope: changing the Codex CLI, changing npm registry behavior, automatic plugin updates outside an explicit AGDF bootstrap invocation, or publishing a new release.

## Risks

- Codex and Claude Code CLI output and plugin cache layouts are external interfaces; validation must avoid assuming undocumented paths where possible.
- Registry propagation can be delayed; polling must be bounded to avoid hanging a release indefinitely.
- Copilot update behavior must preserve user-owned instructions while keeping AGDF-owned files current.
