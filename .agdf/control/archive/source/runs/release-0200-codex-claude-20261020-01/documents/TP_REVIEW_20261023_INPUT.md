# TP Review — 0.20.0 Desktop release matrix

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- reviewer: Claude (Claude Desktop Code, Windows); cooperative task-plan review
- source_head: 2295730c4ed661f688ca5b0d10be335e945a7843
- based_on: TP sha256:0a00d7cd0c13858e038b38a8b18e6419cc4dc21375c4702db4c0d3e6b01a23ff

Reference is the approved TP, not plausible code. Scenario-to-test mapping was rechecked at
d4f39956 by an independent read-only pass and extended in 0e93784f; evidence below names the
covering suites. Candidate: aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | BROWNFIELD_ANALYSIS.md recorded (sha256:c8a8233d…); BASELINE.json with tracked/untracked/CI inventory and timeout baseline | — | none |
| T-002 | fully_done | plugins/agdf/meta/agdf-plugin.definition.json hostSupport schema 2; lib/release-policy.mjs; release-lifecycle-test "schema-2 Desktop policy rejects unknown schemas, changed targets and widened scope"; release-handoff-test optional_cli projection equality (SCN-001/003/011) | — | none |
| T-003 | fully_done | release-candidate-test source/new-file/lock/shipped-byte/payload mutations, normalization and binary cases; candidate aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 recomputed clean (SCN-005/006). Probe and policy files are covered as source-root files | explicit per-file probe and policy mutation cases (covered generically) | none |
| T-004 | fully_done | lib/release-observation.mjs human_report and schema-3 Desktop branch; d4f39956 native Claude Desktop transcript (F-001); 0e93784f Codex Desktop rollout session/source binding, scenario binding, distinct sessions, capture signature; release-handoff-test cases 1-6, 10, 11 and 15 (SCN-007/008/010/012/014) | — | none |
| T-005 | fully_done | lib/release-handoff.mjs handoff, preflight, desktop-template, review-template, scoped import, per-scope review tuple; release-handoff-test cases 7, 9, 12, 13 and 16 for templates, preflight, scoped imports, oversized and linked evidence (file symlink or Windows junction) and projection rollback (SCN-009/013) | — | none |
| T-006 | fully_done | release-lifecycle-test released baseline integrity and owned-stale injection; release-handoff-test Claude and Codex Desktop transition, owned repair, preservation and primary-proof negatives (SCN-015/016) | actual Desktop transitions belong to T-010 | none |
| T-007 | fully_done | .github/workflows/publish-agdf.yml Desktop gate; release-workflow-contract-test publish ancestry and bypass mutation; ci-plan-test inventory and timeouts; validate --host and Codex-only rejection (SCN-017/018/027); CI_COVERAGE.json baseline/current multiset | — | none |
| T-008 | fully_done | host-compatibility contract/producer/render with reported_sources; test:host-compatibility; compatibility:check 56/0; guidance in docs/maintenance/release-0.20.0.md, INSTALL.md, README.md; RELEASE_READINESS.md (SCN-004/028/029) | guidance consistency is inspection-based | none |
| T-009 | partially_done | Clean worktree candidate aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 at 2295730c; documented preparation green; remote CI run 39927176152 for 2295730c 99/100 (one runner git timeout in unchanged installer code, re-run pending); local verify:commit limited by a host-load MCP test flake (maintainer decision: remote CI is the commit-bound verification) (SCN-002/030) | Green re-run of Install · Win22 1of4 for 2295730c | QA cannot pass until the commit-bound CI is complete |
| T-010 | partially_done | Originals searched and unbindable (DESKTOP_EVIDENCE_REVIEW.md); Claude CLI 830d8b94 reviewed on its original candidate; handoff for aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 prepared; validate --all-hosts rejects (SCN-014/019/026) | Six candidate-bound Desktop records: Codex session/upgrade/recovery and Claude Windows session/upgrade/recovery (SCN-020 to SCN-025) | P0: release qualification and publication stay blocked |
| T-011 | partially_done | This TP Review; Clean Implementation Review and Code Review follow in this run | QA decision pending | QA consumes this review |

## Summary

- fully_done: T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008
- partially_done: T-009 (one CI job awaiting re-run), T-010 (native Desktop records absent), T-011 (in progress)
- not_done: none
- out_of_scope_changes: 215eccf2 also committed the session-local .claude/launch.json (maintainer commit, not part of the TP); 3ac401a5 fixes a Windows-only test path in evals/mcp-ergonomics (maintainer-authorized, outside the TP scope, test-only); 17a82bf6 CI fixture SHA binding (maintainer-requested, test-only)
- risks: Desktop qualification depends on executors with isolated Desktop scopes; no such scope exists on the Windows host that ran this review
- required_next_step: Desktop executors record the six cases for aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108, then review, import and validate --all-hosts

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-001 | evidence_gap | evidence_obligation | open | DESKTOP_EVIDENCE_REVIEW.md and validate --all-hosts rejection for aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108: 0 of 3 Codex Desktop records; Codex Desktop is not installed on the reviewing host | Codex Desktop executor records session, upgrade and recovery for aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 in a host-supported isolated scope via preflight and desktop-template and returns the bundle for review and import |
| TPR-003 | evidence_gap | evidence_obligation | open | evidence/CANDIDATE_2295730C_20261023/VERIFICATION_RESULTS.json: run 39927176152 for 2295730c 99/100; Install · Win22 1of4 failed on spawnSync git ETIMEDOUT in unchanged installer code; re-run needs repository admin | Maintainer re-runs the failed job of run 39927176152 and the green result is recorded for 2295730c |
| TPR-002 | evidence_gap | evidence_obligation | open | DESKTOP_EVIDENCE_REVIEW.md and validate --all-hosts rejection for aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108: 0 of 3 Claude Desktop Windows records; only the daily Desktop profile exists on the reviewing host | Windows Claude Desktop executor records session, upgrade and recovery for aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 in a dedicated isolated Desktop scope and returns the bundle for review and import |
