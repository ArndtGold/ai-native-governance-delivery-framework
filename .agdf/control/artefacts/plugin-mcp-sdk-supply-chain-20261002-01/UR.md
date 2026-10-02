# UR: Pinned and verified plugin MCP SDK acquisition

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-02
Owner: Repository owner

## 1. Problem

Architecture review run 4 (`docs/reviews/REVIEW_ai-native-governance-delivery-framework_v4_Architektur.md`,
finding L1, priority high): when the Claude Code or Codex plugin prepares its MCP runtime, the launcher
runs `npm install --ignore-scripts --save-exact @modelcontextprotocol/server@2.0.0` in a stage
directory with an empty `{private:true}` manifest
(`packages/cli/lib/mcp-lifecycle/plugin-runtime.js`, `packages/cli/lib/mcp-lifecycle/package.js`).

- No lockfile is used, so transitive dependencies (today `@modelcontextprotocol/core`, `zod`) are
  resolved fresh on every first install. The repository already holds
  `packages/mcp-server/package-lock.json` with integrity hashes for exactly these packages.
- The checks cover package names and versions only. The SDK digest is computed after download and
  never compared with an expected value shipped in the plugin (trust on first use).

A compromised or re-resolved transitive dependency would therefore be accepted without any deviation
from a reference value.

## 2. Goal

The plugin MCP runtime only accepts the exact SDK dependency tree that was reviewed and shipped with
the plugin version; any deviation fails closed before the runtime is committed.

## 3. Scope

- Stage install of the plugin MCP SDK resolves from a lockfile shipped in the runtime plugin, with
  npm integrity verification, instead of free resolution.
- The plugin ships the expected SDK runtime digest; the launcher compares it before committing the
  stage and rejects a mismatch with a stable error code.
- The shipped lockfile and expected digest are generated from the repository source of truth during
  the existing build/sync step, not maintained by hand.
- Regression tests: a manipulated SDK (wrong digest or tampered package content) is rejected and
  leaves no committed runtime; the normal path still prepares a matching runtime.
- Update the plugin MCP text in `docs/architecture/README.md` §6.1 and `PRIVACY.md` to the new
  behaviour.

## 4. Non-Goals

- No vendoring of the SDK into the plugin (would remove the network step entirely; separate decision).
- No change to the registered MCP path for OpenCode and GitHub Copilot (`mcp enable`), unless it
  shares the same code path and the change is free.
- No change to MCP protocol behaviour, tools, dispatch semantics or host registration.
- No release or publish of a new version.

## 5. Acceptance Signals

- A stage install with a tampered or re-resolved SDK tree fails with a named error and no runtime under
  the data root is marked as matched.
- A clean install produces a runtime whose SDK digest equals the shipped expected value.
- Lockfile and expected digest are reproduced by the build from the repository; integrity checks fail
  when they drift.
- Existing MCP lifecycle, plugin runtime and package tests stay green.

## 6. Existing Source Of Truth

- `packages/mcp-server/package-lock.json` and `package.json` (pinned SDK `2.0.0`).
- `packages/cli/lib/mcp-lifecycle/package.js` (`prepareMcpServerPackage`, `digestMcpSdkRuntime`,
  marker `sdk_digest`).
- `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (`SDK_PACKAGE_SPEC`, `launchPluginMcpServer`).
- `scripts/sync-plugin-mcp.js`, `scripts/sync-plugin-runtime.js`, `packages/core/lib/runtime/plugin-provenance.js`.
- `plugins/agdf/scripts/check-runtime-integrity.mjs` (runtime integrity pins).

## 7. Risks And Unknowns

- `npm ci` requires a matching `package.json`; Brownfield Review must decide whether a dedicated
  runtime-only lockfile (without the `devDependencies`) is generated or the existing one is reused.
- The digest must be stable across platforms (line endings, file modes) and npm versions.
- Users behind a registry mirror get integrity-identical tarballs only if the mirror is faithful; a
  mismatch now fails instead of silently installing.
- The shipped plugin profiles and provenance digests change, which touches release and integrity
  checks.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)
- Problem: Der Plugin-MCP installiert das SDK beim ersten Start ohne Lockfile und prüft die Prüfsumme nicht gegen einen ausgelieferten Sollwert (Befund L1, Priorität hoch).
- Ziel: Die Plugin-MCP-Laufzeit akzeptiert nur den geprüften, mit der Plugin-Version ausgelieferten SDK-Abhängigkeitsbaum; jede Abweichung bricht vor der Übernahme ab.
- Umfang: Stage-Install aus mitgeliefertem Lockfile mit Integritätsprüfung, mitgelieferte Soll-Prüfsumme, Erzeugung im Build, Tests mit manipuliertem SDK, Doku und PRIVACY.md nachziehen; kein Vendoring, kein Release.
