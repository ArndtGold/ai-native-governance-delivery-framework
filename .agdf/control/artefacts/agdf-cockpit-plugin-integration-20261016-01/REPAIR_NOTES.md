# Cockpit integration: test repair, 2026-10-17

This supplement continues the unchanged approved TP for `agdf-cockpit-plugin-integration-20261016-01`. It preserves the previously recorded `CD_TESTS.md`, its source bindings and failed-attempt evidence. It grants no approval, native-host qualification or release permission.

## Causes and repairs

1. The approval-document test selected the first directory entry and parsed a presentation's `.document` file as JSON. The shared fixture now exposes the actual prepared presentation ID; the test addresses that exact `.json` record. Missing or changed document snapshots are also checked, including unchanged source bytes after reading.
2. The backward-gate reader test and two browser journeys assumed complete decision content while using an incomplete generic fixture. They now use the existing prepared approval fixture. A separate negative test verifies that the real decision-content blocker overrides the stored next step without repairing the source. The production blocker and UI qualification rules remain intact.
3. The unchanged performance test reproduced a warm p95 of 1,379.201 ms against its 1,000 ms limit. A local CPU profile identified repeated validation of the same immutable locale registry. Its existing validation owner now retains successful validation by weak object identity only for recursively frozen plain data graphs. Mutable children, accessors, custom prototypes, unsuccessful validations and caller-mutated result objects cannot reuse a stale success. No Run, target, approval or filesystem cache was introduced.
4. The same unchanged 20-cold/20-warm performance test then passed: cold p95 930.808 ms, warm p95 755.741 ms. Both limits and sample counts are unchanged. Compared with the preceding recorded integration candidate (2,262,058 bytes), the shared Copilot inventory increased by exactly 943 source bytes; its measured budget is 260 files / 2,263,001 bytes with zero headroom and unchanged tools/assets.
5. An additional browser attempt in the original checkout failed its current-source UI integrity prerequisite (`AGDF_DECISION_UI_INVALID`). The complete suite was rerun against the normally rebuilt isolated snapshot: 44 passed, zero skipped. The failed attempt and JSON report remain in the new evidence folder. Historical tracked screenshots accidentally refreshed by the suite's default evidence destination were restored from their original tracked bytes after retaining the new attempt separately; subsequent browser output uses an explicit temporary destination.

## Confirmed repair checks

- Core Cockpit group: 61 passed, zero failed.
- Locale validation unit suite: passed, including shallow freezing, changing getters, custom prototypes and result mutation.
- UI: TypeScript passed; eight HTTP tests and 236 component tests passed.
- Browser: all 44 passed, zero skipped, using freshly built resources.
- Build preparation and compatibility record/check: passed, 56 scenarios, zero failures; fingerprint `6590756d05f858dcff08ba18c7f4cdb83d47ed595d37abb53de07059f1edd47e`.
- Separate actual Codex CLI normal install: plugin publication succeeded; optional session-hook trust remains honestly reported as a separate host review requirement.
- Actual installed CLI App Server: `agdf-cockpit` belongs to `agdf@agdf`, exposes the two expected tools and UI URI to the UI-capable test client, reads the exact selected target/Run, and closes its session successfully. This is protocol evidence with no visible native UI or model-turn claim.
- Both actual CLI conflict cases (`agdf-cockpit`, `agdf_cockpit`): installation refused, foreign configuration and existing plugin publication unchanged.
- Existing Cockpit and scoped-reader STDIO suites: passed on both tested protocol versions against the actual installed immutable generation.
- Actual CLI without UI capability: plugin attribution remains visible, with zero Cockpit tools/resources. Normal global uninstall of only the isolated candidate then removes both plugin providers and preserves the foreign disabled canary; no authentication file was retained.

The new installed local plugin is `0.14.5+codex.local-3753a404b41f`, source digest `3753a404b41f4d3a60ed17454511bf7410ba438a389dbd53f944e8870cbe1653`, runtime digest `7c746260ba2447d1d5322072c4ef40a2dce360ff264bc473f4302547009029b2`. The UI digest remains `sha256:19f6546a5401d9f89a0e78b5500f131b650de4e89b278883e2ee64101368a979`. Earlier installed tuples remain historical evidence.

## Completion boundary

The canonical final repository lane is recorded separately with its actual result. The approved native visible-UI, same-target isolation/cutover and native lifecycle observations remain distinct from CLI/SDK/browser evidence. The active Desktop installation and real legacy configuration remain preserved. No CR, TP Review, Clean Review, QA, UAT or OR pass, commit, push or public release is implied.

The same performance test also passed inside the canonical repository lane: cold p95 1,026.894 ms and warm p95 724.733 ms. `canonical-performance.json` retains its samples, unchanged test-source digest and limits. The complete MCP suite, including package and SDK digest checks, passed before the remaining CLI checks.

The complete canonical `npm run verify:ci` repository lane finished with exit code 0 in one uninterrupted execution on the repaired snapshot. All 26 canonical stages passed. Final compatibility freshness passed again with the same fingerprint and 56/56 scenarios. All 56 manifest source/evidence files remain byte-identical to that isolated snapshot; both generated plugin/runtime identities match the actual installed CLI candidate. The remaining execution finding is native visible-UI/cutover evidence, not a test failure.
