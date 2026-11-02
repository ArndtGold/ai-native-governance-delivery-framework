# Brownfield Analysis: Pinned and verified plugin MCP SDK acquisition

Status: done
Mode: pre_implementation_analysis
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01
Based on: approved TP

## Decision

- decision: pass
- required_next_step: CD+Tests for T-001 to T-008

## Evidence

- Free resolution today really drifts: the lock entry of `@modelcontextprotocol/server@2.0.0` depends on
  `zod: ^4.2.0`; `npm install <spec>` resolves the newest matching `zod`, while the reviewed lock pins
  `zod@4.5.4` with sha512 integrity (`packages/mcp-server/package-lock.json`, lockfileVersion 3).
- Runtime-only closure from the lock: `@modelcontextprotocol/server@2.0.0`, `@modelcontextprotocol/core@2.0.0`,
  `zod@4.5.4` — identical to `MCP_SDK_RUNTIME_ENTRIES` (`packages/core/lib/runtime/plugin-provenance.js:118-122`).
- Install call site: `prepareMcpServerPackage` builds the npm call internally (`package.js` `install`
  helper, `npm install --ignore-scripts --no-audit --no-fund --omit=dev --save-exact ...specs`) and passes
  `install` to the `acquire` callback used by `ensurePluginMcpRuntime` (`plugin-runtime.js:91-99`).
  Minimal path: add an `installLocked()` helper next to `install` that runs `npm ci` with the same flags
  (minus `--save-exact`) in the stage, and an optional `expectedSdk` argument checked before the marker.
- Existing-runtime check: `ensurePluginMcpRuntime` already discards owned `matched`/`mismatch` roots and
  re-prepares (`plugin-runtime.js:84-90`); SDD-004 only extends `matchesPlugin`.
- Marker: written in `prepareMcpServerPackage` (`package.js:208-217`); `inspectMcpServerPackage` accepts
  schema 1 and 2 and ignores unknown fields, so `sdk_verification` is backward compatible.
- Payload provenance: `digestNormalizedPluginSource` hashes every file of the runtime plugin
  (`plugin-provenance.js:213-243`), so new `mcp/sdk/*` files are covered without code changes;
  `check-runtime-integrity.mjs:1348` lists required `mcp/` files — add the three new files there.
- Copilot runtime plugin excludes MCP (`scripts/sync-plugin-runtime.js:131`); no change there.
- Fixture users: `packages/cli/scripts/plugin-mcp-runtime-test.js`, `claude-plugin-mcp-test.js`,
  `codex-plugin-mcp-test.js` via `scripts/support/plugin-mcp-fixture.js`; the fixture copies the closure
  from `packages/mcp-server/node_modules`.
- npm 11.12.1 / Node 22.22.3 locally; npm's default `replace-registry-host=npmjs` rewrites the locked
  `registry.npmjs.org` URLs to a configured registry, so mirrors keep working when they serve identical
  tarballs; integrity is still enforced.

## Missing Evidence

- `packages/mcp-server/node_modules` is absent locally; the fixture tests and the T-001 drift test need
  `npm ci` in `packages/mcp-server` first (one registry access, dev install).

## Reuse Strategy

extend — no new module: `package.js` (verification), `plugin-runtime.js` (bundle, override, re-check,
messages), `sync-plugin-mcp.js` (bundle rendering), `plugin-mcp-fixture.js` (offline `ci`), integrity
required-file list. Registered MCP path keeps calling `prepareMcpServerPackage` without `expectedSdk`.

## Regression Risk

- `install-local-plugin.js` and `local-development-install-test.js` inject their own
  `prepareMcpServerPackage`; the optional argument keeps their signature compatible.
- `--prepare` stdout JSON consumed by host adapters (`plugin-mcp.js`) must stay unchanged; warnings go to
  stderr only.

## Context Graph Impact

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
