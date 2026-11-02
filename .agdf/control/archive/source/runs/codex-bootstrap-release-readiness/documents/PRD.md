# Product Requirements: Surface Bootstrap and Registry Readiness

## Status

- status: approved
- approval: Approval: PRD (2026-07-10)
- delivery_mode: structured_slice

## Product Outcome

An explicit AGDF bootstrap or update produces an observable, current result on every supported surface without silently retaining stale plugin state, overwriting user-owned repository instructions, or declaring a release ready before npm can resolve its packages.

## Users And Jobs

- A Codex user runs `npx --yes @agdf/cli@latest codex` to install or update the global AGDF plugin.
- A Claude Code user runs `npx --yes @agdf/cli@latest claude` to install or update the global AGDF plugin.
- A Copilot user reruns the repository bootstrap to update AGDF-owned instructions and skills while retaining their own `AGENTS.md` content.
- A release maintainer needs a completed publish workflow to mean that both public npm packages are retrievable by version.

## Functional Requirements

### Codex Global Bootstrap

1. The bootstrap must ensure the AGDF marketplace exists, refresh the configured AGDF Git marketplace, then install or refresh `agdf` from that marketplace.
2. It must report the installed plugin version and compare it with the expected release version from the package metadata.
3. If the installed version cannot be determined or differs from the expected version, the command must exit non-zero with an actionable message that names both versions and the corrective command.
4. The command must remain safe to rerun and must not require the user to remove the marketplace first.

### Claude Code Global Bootstrap

1. The bootstrap must use supported Claude Code commands: configure or refresh the marketplace, then install or update the AGDF plugin through the supported plugin command surface.
2. It must distinguish a first install from an update without relying on an unsupported command alias.
3. It must report the resulting plugin version when the Claude CLI exposes it; otherwise it must report the verification limitation and the supported manual verification command.
4. It must preserve the user's selected Claude Code installation scope unless the user explicitly supplies a different scope.

### Copilot Repository Bootstrap

1. A repeat invocation must update AGDF-owned generated files under `.github/` and `.agdf/` without requiring `--force`.
2. A pre-existing user-owned `AGENTS.md` must remain unchanged. The current AGDF fragment behavior must remain available and the command must state when a merge is still required.
3. An AGDF-owned root `AGENTS.md` may be refreshed only when ownership is positively identified from a durable AGDF marker or manifest.
4. When ownership is ambiguous, the command must preserve the file, create or refresh the AGDF fragment, and explain the required user action. It must not overwrite the file implicitly.
5. `--force` remains an explicit destructive override and its output must name the files it can replace.

### npm Release Readiness

1. After publishing `create-agdf` and `@agdf/cli`, the release workflow must poll npm for the exact tagged version of both packages.
2. Polling must have a bounded timeout and retry interval.
3. A timeout must fail the publish job and report the unresolved package names, version and last registry error.
4. The workflow must not create a new release path, tag or publish behavior beyond the existing ordered publish job.

## Acceptance Criteria

1. Focused tests show that Codex receives marketplace add/upgrade and plugin add commands in the required order, and a reported version mismatch fails.
2. Focused tests show that Claude uses valid CLI verbs for first install and update behavior; the old `plugin add` invocation is absent.
3. Focused tests show a second Copilot bootstrap succeeds, updates AGDF-owned files, and preserves a user-owned `AGENTS.md`.
4. Focused tests show an ambiguous or user-owned `AGENTS.md` does not get replaced without `--force`.
5. The publish workflow contains bounded checks for both exact package versions after both publish steps.
6. Existing runtime-integrity and package smoke checks remain green.

## Non-Goals

- Changing Codex or Claude Code marketplace/cache implementation.
- Automatically updating AGDF when a user has not invoked an AGDF bootstrap.
- Solving npm global CDN propagation beyond bounded readiness verification.
- Rewriting user-owned `AGENTS.md` content or automatically resolving merge conflicts.
- Publishing, tagging or releasing a new package as part of this delivery slice.

## Constraints And Risks

- Codex and Claude Code are external CLI contracts; adapter tests must use controlled stub executables rather than mutate actual user configuration.
- Copilot ownership detection must be explicit and conservative to avoid treating ordinary repository guidance as AGDF-owned.
- Registry polling should use `npm view <package>@<version> version --json` or an equivalently exact lookup, with diagnostics preserved on failure.

## Success Evidence

- `create-agdf/scripts/smoke-test.js` covers the global adapter invocations and repeatable Copilot generation scenarios.
- The release workflow diff shows exact-version readiness polling after publication.
- `npm --prefix create-agdf run smoke-test`, `node plugin/scripts/check-runtime-integrity.mjs`, and `git diff --check` pass.
