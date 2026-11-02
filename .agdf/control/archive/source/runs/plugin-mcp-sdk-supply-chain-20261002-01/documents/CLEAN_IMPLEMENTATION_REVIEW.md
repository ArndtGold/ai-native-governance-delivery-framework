# Clean Implementation Review: Pinned and verified plugin MCP SDK acquisition

Status: done
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01

## Clean Implementation Review

- decision: pass
- primary_solution: Root cause (free resolution plus trust-on-first-use digest) is fixed at the single
  install owner. The plugin ships a generated runtime-only lock and expected digest; `npm ci` enforces
  integrity; `prepareMcpServerPackage` checks the exact package set and digest before the marker is
  written; `ensurePluginMcpRuntime` applies one `usable` predicate to fresh, existing and concurrent
  runtimes.
- evidence: diff of `package.js`, `plugin-runtime.js`, `sync-plugin-mcp.js`, `write-mcp-sdk-digest.mjs`;
  tests per `CD_TESTS.md`; real `npm ci` digest match per `CODE_REVIEW.md`.
- fallbacks_retained:
  - `AGDF_MCP_ALLOW_UNVERIFIED_SDK=1` keeps the previous `npm install` path. Rationale: approved PRD
    decision and SDD-005 (mirrors with differing tarballs). Target state: verified install. Exit
    condition: per runtime, unsetting the variable re-verifies on the next start (SCN-009); the path is
    always announced on stderr and recorded in the marker.
  - Concurrent-session fallback (pre-existing) now uses the same `usable` predicate, so it cannot admit
    an unverified tree.
- workaround_or_shim_risk: none. `installLocked` sits next to the existing `install` helper with the
  same error mapping; the small duplication keeps both npm forms explicit at one owner.
- parallel_structure_risk: none. Digest algorithm (`digestMcpSdkRuntime`), marker, owned-root
  replacement and npm invocation are reused; the expected digest has one committed source
  (`packages/mcp-server/sdk-runtime-digest.json`) and one derived copy in the plugin payload, guarded by
  the drift test and the render-time staleness check.
- brownfield_fit: matches `BROWNFIELD_ANALYSIS.md` (extend existing owners, registered MCP path
  untouched, marker schema 2 compatible, `--prepare` stdout contract unchanged).
- missing_evidence: loaded-host start under Claude Code/Codex not observed (optional per TP).
- required_next_step: QA gate.
