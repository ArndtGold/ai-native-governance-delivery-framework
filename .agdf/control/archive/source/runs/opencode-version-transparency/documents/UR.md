# User Request: OpenCode Version Transparency

## Request

Sharpen the `opencode` installer and status output so users can see the installed AGDF package version, the expected version, and whether the global installation is current, outdated or unverifiable.

## Problem

`npx --yes @agdf/cli@latest opencode` currently reports only the resolved plugin path and loadability. It does not show which AGDF package version is installed, which version the current CLI expects, or whether an update changed the installed version. The previous version is also not available after replacement because no transition is currently captured.

## Desired outcome

- Human output clearly reports installed version, expected version and version status.
- JSON status exposes the same information without breaking schema-v1 consumers.
- An update path may report a version transition when the previous package version is observable before installation.
- Unknown or unreadable versions fail visibly and provide an actionable reinstall/update command.
- Existing OpenCode command shape, plugin loading, global skill surface and repository activation boundary remain unchanged.

## Boundaries

- No new command or required parameter.
- No change to repository-local `.opencode/` or `.agdf/control/` authority.
- No claim of enforcement capability from version evidence.
- No commit, push, pull request or release in this scope.

## Acceptance criteria

- A normal current install reports matching installed and expected versions with `current` status.
- A stale install reports `outdated` and the expected refresh command.
- An observable update reports previous and new versions without claiming a transition when the previous version is unknown.
- `opencode-status --json` remains additive and machine-readable.
- Existing smoke, integrity, doctor and OpenCode runtime checks remain green.

## Approval

- `Approval: UR` provided on `2026-07-13`.

