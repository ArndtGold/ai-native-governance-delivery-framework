# OR: Pinned and verified plugin MCP SDK acquisition

Status: done
Gate: OR
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01
Route: structured_delivery

## Result

The Claude Code and Codex plugin MCP runtime now installs its MCP SDK only from a lockfile shipped in
the plugin (`mcp/sdk/`), with npm integrity verification, an exact package-set check and an expected
digest comparison before the runtime is committed. Existing runtimes are re-verified on every start.
A deliberate override (`AGDF_MCP_ALLOW_UNVERIFIED_SDK=1`) is announced and recorded. Closes review v4
finding L1 for the plugin path.

## Approvals

`Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP`, `Approval: QA`, `Approval: UAT` — all
recorded in `RUN_STATE.md` with presentation bindings.

## Artefacts

UR, BROWNFIELD_REVIEW, PRD, SD, TP, BROWNFIELD_ANALYSIS, CD_TESTS, TP_REVIEW,
CLEAN_IMPLEMENTATION_REVIEW, CODE_REVIEW, QA_REPORT (pass), OR — all under
`.agdf/control/artefacts/plugin-mcp-sdk-supply-chain-20261002-01/`.

## Changed Files

- `packages/cli/lib/mcp-lifecycle/package.js`, `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`
- `scripts/sync-plugin-mcp.js`, `scripts/write-mcp-sdk-digest.mjs` (new), `scripts/support/plugin-mcp-fixture.js`
- `packages/mcp-server/sdk-runtime-digest.json` (new), `packages/mcp-server/test/sdk-digest.test.js` (new),
  `packages/mcp-server/package.json`, root `package.json`
- `packages/cli/scripts/plugin-mcp-runtime-test.js`, `claude-plugin-mcp-test.js`, `codex-plugin-mcp-test.js`
- `plugins/agdf/scripts/check-runtime-integrity.mjs`
- `docs/architecture/README.md`, `PRIVACY.md`

## Evidence

SCN-001 to SCN-015 pass (`CD_TESTS.md`); TP Review, Clean Implementation Review and Code Review pass;
QA pass; real `npm ci` against the generated bundle matched the expected digest; runtime integrity
(source and generated) pass.

## Missing Evidence

- No loaded-host observation in a freshly started Claude Code or Codex session.
- Not released; payloads are regenerated locally only.

## Risks

- SDK upgrades require `npm ci` in `packages/mcp-server` and `npm run mcp:sdk-digest`.
- The registered MCP path (`mcp enable`, OpenCode/Copilot) still lacks lock and expected digest.
- The worktree also contains uncommitted changes from other runs (artifact language, A9 docs,
  `docs/architecture/dispatcher.md`); a commit for this run must select only the files above.

## Follow-ups

- Separate run: harden the registered MCP path (`prepareMcpServerPackage` without `expectedSdk`) — PRD
  decision, exit condition: run created after this OR.
- Optional: host observation of `--prepare` and first start in Claude Code.

## Context Graph And Knowledge

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: run-specific evidence; follow-up recorded in PRD and here.
- Parent reconciliation: not_applicable

## Next Step

Delivery closeout (commit/PR handoff) only on explicit request; no VCS action was performed.
