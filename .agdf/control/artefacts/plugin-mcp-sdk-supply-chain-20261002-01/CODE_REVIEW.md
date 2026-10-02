# Code Review: Pinned and verified plugin MCP SDK acquisition

Status: done
Gate: CR
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01

## Code Review

- decision: pass
- scope reviewed: `packages/cli/lib/mcp-lifecycle/package.js`, `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`,
  `scripts/sync-plugin-mcp.js`, `scripts/write-mcp-sdk-digest.mjs`, `scripts/support/plugin-mcp-fixture.js`,
  `plugins/agdf/scripts/check-runtime-integrity.mjs`, tests, docs; neighbours `inspectMcpServerPackage`,
  `mcp-dispatch-runtime.js` marker check, Claude/Codex host adapters (`--prepare` stdout contract).
- findings:
  - [resolved] `plugin-runtime.js` `launchPluginMcpServer` — with the override active, a reused runtime
    whose marker said `verified` produced no warning, contrary to AC-005 ("prepare and start emit a visible
    warning"). Fixed: the warning is emitted whenever the override is active; regression test added.
- checked without finding:
  - Package-set check runs before any digest, so a missing package yields the stable code instead of an
    `ENOENT` crash (SCN-003).
  - Registered MCP path calls `prepareMcpServerPackage` without `expectedSdk`; behaviour unchanged
    (`mcp-lifecycle-test.js` pass).
  - Marker stays schema 2; extra field ignored by `inspectMcpServerPackage` and `mcp-dispatch-runtime.js`.
  - `--prepare` stdout JSON unchanged; warnings only on stderr.
  - Concurrent-session fallback applies the same `usable` predicate, so it cannot accept an unverified tree.
  - Build does not need `packages/mcp-server/node_modules`: the bundle is rendered from the committed lock
    and digest source; only the drift test needs the installed tree.
- evidence:
  - Real `npm ci --ignore-scripts --omit=dev` against the generated `mcp/sdk/` bundle from the npm registry
    installed exactly `@modelcontextprotocol/core`, `@modelcontextprotocol/server`, `zod`, and
    `digestMcpSdkRuntime` matched `expected-sdk.json` (Windows, npm 11.12.1, Node 22.22.3).
  - Test suites listed in `CD_TESTS.md` rerun after the fix: pass.
- missing_evidence: no loaded-host observation of the plugin MCP start under Claude Code or Codex.
- risks: an SDK upgrade requires `npm ci` in `packages/mcp-server` plus `npm run mcp:sdk-digest`; the drift
  test catches a forgotten step only where `packages/mcp-server/node_modules` is installed (CI).
- required_next_step: QA gate.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | `plugin-runtime.js` override warning only on marker state; fixed with `sdkOverrideActive(env)` check and reuse-warning test in `plugin-mcp-runtime-test.js` | none — fixed and retested |
