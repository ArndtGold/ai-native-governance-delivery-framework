# UR: Simple Local Plugin Installation Scripts

Status: approved
Gate: UR
Gate approval: approved
Date: 2026-08-23
Owner: Arndt Gold

## 1. Problem

AGDF contributors can install or refresh the plugin through the published CLI, but the source repository does not provide the same simple npm-script entry points available in the Project Inventory plugin. This makes local Codex, Claude Code and OpenCode installation from the current checkout less discoverable and increases the risk of testing a published package instead of the source being developed.

## 2. Goal

An AGDF contributor can use clear repository-level npm scripts such as `npm run install:codex`, `npm run install:claude` and `npm run install:opencode` to install or update the plugin from the current checkout through the existing validated lifecycle owners.

## 3. Scope

- Provide one simple npm-script entry point for each supported plugin surface where a local development installation is valid.
- Install or update from the current AGDF checkout rather than resolving the public npm package.
- Reuse the canonical build, marketplace, lifecycle, ownership and verification paths.
- Make success, degraded verification and failure outcomes clear.
- Add focused automated coverage and concise contributor documentation.

## 4. Non-Goals

- Replacing the public `npx --yes @agdf/cli@latest ...` installation path.
- Introducing a second marketplace format or installer implementation.
- Publishing a package, releasing a plugin, restarting a host or claiming authenticated-host UAT.
- Deleting or replacing unowned marketplace or host configuration.
- Changing AGDF governance, gate or approval semantics.

## 5. Acceptance Signals

- The repository exposes discoverable `npm run install:<surface>` commands for the approved surfaces.
- Each command builds and validates the current source-owned plugin before applying an existing safe installation or update path.
- Re-running a command produces an idempotent update outcome rather than a conflicting parallel installation.
- Surface-specific verification distinguishes repository/package evidence from loaded-host and UAT evidence.
- Focused tests cover install, update, ownership conflict, verification failure and rollback behavior where applicable.
- Contributor documentation distinguishes local checkout installation from public npm bootstrap.

## 6. Existing Source Of Truth

- `create-agdf/lib/installers/plugin-installers.js` owns Codex and Claude Code plugin lifecycle operations.
- `create-agdf/lib/installers/local-marketplace.js` owns local marketplace preparation and ownership validation.
- `create-agdf/bin/create-agdf.js` and `create-agdf/lib/cli/` own the current CLI entry points.
- `plugin/meta/agdf-plugin.definition.json` owns plugin identity and version metadata.
- `create-agdf/scripts/build-public-plugin.js` and Runtime Integrity checks own generated plugin coherence.
- `INSTALL.md` and `agdf/README.md` own public installation guidance.

## 7. Risks And Unknowns

- Brownfield Review must determine whether the root package or `create-agdf/package.json` is the canonical npm-script owner.
- OpenCode uses a different npm-plugin and activation model, so its local-development command may not be semantically identical to Codex and Claude Code.
- The build and cachebuster order must not create drift between source, generated plugin, marketplace and installed cache.
- Local install verification must not be overstated as proof that a restarted host loaded the new plugin.
- Existing user-owned marketplace registrations and unrelated worktree changes must remain untouched.

## 8. Next Step

Perform the post-UR Brownfield Review and proportional Mode/Slice Decision.
