# CD+Tests repair: Cockpit in the AGDF plugin

- decision: revise
- Run: agdf-cockpit-plugin-integration-20261016-01
- Target: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework
- Binding before recording: 2c0ff5a5-c472-4d5b-af90-4358c580964f
- Baseline HEAD: 16d088885fc2d0383f3850a4bbd20789a8b8ff0f
- Approved UR, PRD, SD and TP remain byte-identical. Existing approvals remain valid; no TP renewal is requested.

This is the current implementation owner's execution report, not final QA or human acceptance. It supplements the previously recorded `CD_TESTS.md` (SHA-256 `4b4cd5e9c1b49913553b5e52ea3e519bec36da3311b8ab1ca054ed1230b73405`) without editing that report or its bound evidence. The test failures reported there have been repaired. Required visible native-host observations remain outstanding, so CD+Tests cannot yet be marked complete.

## Changes and verification

`REPAIR_NOTES.md` explains the causes, repairs and evidence limits. The shared approval fixture supplies its exact prepared presentation ID instead of relying on directory order. Reader and browser scenarios requiring complete decision content use the existing prepared fixture; a separate negative scenario still requires the real content blocker to override stale stored guidance without modifying source bytes. The production decision and UI qualification checks remain intact.

The existing locale validator now reuses successful validation of recursively frozen plain data via weak object identity. It caches no Run, target, approval or filesystem observation. Tests require fresh validation for mutable nested data, accessors and custom prototypes, and prevent caller-mutated results from poisoning later success. The measured shared payload increase over the preceding integration candidate is exactly 943 bytes (2,262,058 → 2,263,001): 260 files / 2,263,001 bytes, zero extra budget headroom and no Copilot tools/assets added. Both performance limits and all sample counts are unchanged.

| Check | Actual result | New evidence |
|---|---|---|
| Core Cockpit group | 61 passed, zero failed | evidence/repair-20261017/agdf-cockpit-repair-core-all-20261017.log |
| Locale validation unit suite | Passed, including mutable-child/getter/prototype/result guards | evidence/repair-20261017/agdf-cockpit-repair-locales-final-20261017.log |
| TypeScript, HTTP, component UI | TypeScript passed; 8 HTTP tests and 236 component tests passed | evidence/repair-20261017/agdf-cockpit-repair-ui-tests-20261017.log |
| Full browser suite, normally rebuilt isolated resources | 44 passed; zero failures or skipped cases | evidence/repair-20261017/agdf-cockpit-repair-browser-final-20261017.json |
| Unchanged performance test after repair | Cold p95 930.808 ms (<1,500); warm p95 755.741 ms (<1,000), 20 samples each | evidence/repair-20261017/agdf-cockpit-repair-performance-optimized-20261017.log |
| Build preparation and compatibility record/check | Pass; 56 scenarios, zero failures | evidence/repair-20261017/agdf-cockpit-repair-build-prepare-20261017.log; agdf-cockpit-repair-compatibility-20261017.log |
| Actual installed CLI host attribution/render/read/close | Plugin `agdf@agdf`, server `agdf-cockpit`, exact target and Run, successful close | evidence/repair-20261017/agdf-cockpit-repair-cli-evidence-20261017/ui-host-probe.json |
| Actual CLI without UI capability | Zero Cockpit tools/resources | evidence/repair-20261017/agdf-cockpit-repair-cli-evidence-20261017/host-status.json |
| Actual CLI same-key and alias conflicts | Both refused; foreign config and installed publication preserved | evidence/repair-20261017/agdf-cockpit-repair-cli-evidence-20261017/conflicts.json |
| Actual CLI candidate uninstall | Both plugin providers absent; foreign canary preserved; no auth file retained | evidence/repair-20261017/agdf-cockpit-repair-cli-evidence-20261017/cleanup-summary.json |
| Existing Cockpit and scoped-reader STDIO suites | Passed against installed immutable generation on both protocols | evidence/repair-20261017/agdf-cockpit-repair-cockpit-mcp-20261017.log; agdf-cockpit-repair-cockpit-scoped-mcp-20261017.log |
| Same performance test inside the canonical lane | Cold p95 1,026.894 ms; warm p95 724.733 ms; both unchanged limits passed | evidence/repair-20261017/canonical-performance.json |
| Final canonical repository lane | Pass, exit code 0; all 26 stages in one uninterrupted execution | evidence/repair-20261017/agdf-cockpit-repair-verify-ci-20261017.log |

The earlier failed attempts remain evidence, including the original Core/browser/performance reproductions and an additional browser attempt that failed the original checkout's stale UI-build prerequisite. The successful full browser run uses normally rebuilt, current-source resources; no integrity validation or test assertion was disabled.

## Installed candidate and source binding

The separately installed/tested CLI candidate is `0.14.5+codex.local-3753a404b41f`, with source digest `3753a404b41f4d3a60ed17454511bf7410ba438a389dbd53f944e8870cbe1653` and runtime digest `7c746260ba2447d1d5322072c4ef40a2dce360ff264bc473f4302547009029b2`. Both match the normally generated final profile. UI digest is `sha256:19f6546a5401d9f89a0e78b5500f131b650de4e89b278883e2ee64101368a979`; source binding is `sha256:ba482e2d5fdbc9a72a0b3f6c49dde9d8baa140247d46ffc124cfb3537745fc45`. Compatibility fingerprint is `6590756d05f858dcff08ba18c7f4cdb83d47ed595d37abb53de07059f1edd47e`.

The normal CLI installer successfully publishes the plugin and reports optional hook trust separately as `mcp_ready_hook_review_required`; its aggregate partial status is not hidden or relabeled as full host trust. CLI observations use an actual installed Codex App Server with a test client, without a model turn or visible native UI. No standalone MCP registration was used for the clean test profile. Earlier candidate tuples remain historical evidence.

## TP and finding disposition

The approved integration continues to use the original package/provenance/session/lifecycle/configuration owners described by `IMPLEMENTATION_NOTES.md`. T-001 through T-006 implementation remains present. T-007 automated verification is complete: repaired focused suites and the entire canonical repository lane passed. T-008 native visible-UI/cutover work remains unexecuted where the required supported isolated native context is unavailable. T-009 evidence reporting preserves that boundary; it does not declare delivery complete.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-E02 | evidence_gap | evidence_obligation | closed | Exact presentation selection and valid decision-content fixtures; Core 61/61 and browser 44/44 pass, with separate negative blocker coverage. | No repair remains for the formerly failing expectations. |
| CPI-E04 | evidence_gap | evidence_obligation | closed | Same unchanged performance test passes in the focused repeat and canonical lane; canonical cold p95 1,026.894 ms and warm p95 724.733 ms. | No threshold or sample-count change; retain actual samples. |
| CPI-E03 | evidence_gap | evidence_obligation | closed | Complete canonical lane passed once on the repaired final snapshot; exit code 0, no resumes or participating source changes. | No repository commands remain pending. |
| CPI-E01 | evidence_gap | evidence_obligation | open | SCN-010/014/022/024/025 and native activation/cache compensation in SCN-016 remain unexecuted; separate CLI, source, SDK and browser observations are bounded evidence. | Complete approved native visible initialization/render/interaction/teardown, lifecycle and same-target isolation/legacy-cutover procedures against the final tuple when a supported isolated native context is available. Preserve the original route; no CLI substitution or pre-proof retirement. |

All automated scenario evidence from the preceding report retains its stated level. The repaired Core/browser checks strengthen SCN-004/005/007/018; final source/CLI bindings refresh SCN-001/002/006/011/012/019/020/021/023/026. The 23 criterion/decision pairs and 26 scenarios retain their approved definitions; no native procedure is inferred from an automated pass.

The real Desktop installation and legacy declaration remain active. Project configuration SHA-256 remains `20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8`; the user configuration is stable during this repair at `8d679c4eb79ea0cd8bc999ed9d955c387176481e63ed4d5dfa554ed5b34d0601`. This does not revise the earlier report's bounded observation about a prior, unattributed user-config change. Git HEAD remains the baseline; no commit, push, public release, real legacy retirement, native UI qualification, CR/TP Review/Clean Review/QA/UAT/OR pass or human approval is implied.

## Evidence closure

The canonical lane and final compatibility check passed. `evidence/repair-20261017/verification-ledger.json` records the exact stage list, actual process result, focused results and remaining native boundary. The new manifest covers 81 evidence files. The prior report, four bound inputs and all 64 indexed prior evidence files remain unchanged.

| Bound supplement | SHA-256 |
|---|---|
| `REPAIR_NOTES.md` | `sha256:105d72b8b1452237105b9df7dbe1d40601664bc022bda2c05ba909f16ec90c8e` |
| `evidence/repair-20261017/source-manifest.json` | `sha256:854f8008198955476d26b286920b6a7cecd6727792b129fdaaadad55bb99c374` |
| `evidence/repair-20261017/installed-source-comparison.json` | `sha256:16f89b1366b69c496346f9eb74b2137aae3210712e85c24538f5e06262c20437` |
| `evidence/repair-20261017/final-generated-tuple.json` | `sha256:374ba06bc06730794fd88466b17ed02a04c3b0218693474bd8052a40daf1d102` |
| `evidence/repair-20261017/verification-ledger.json` | `sha256:f5ee12bce72db324fd26f38eb27e6dc1e98ff6ce3f58d36509251749da0793d0` |
| `evidence/repair-20261017/SHA256SUMS.json` | `sha256:fa535c364353b00d0f77490f51b10a93ce2d10f0feec1a31d4b830b835591b79` |

