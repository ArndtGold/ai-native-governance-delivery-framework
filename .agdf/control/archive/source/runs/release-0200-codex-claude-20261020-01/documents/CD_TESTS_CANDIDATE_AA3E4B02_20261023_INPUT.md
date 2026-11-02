# CD+Tests — 0.20.0 final candidate aa3e4b02

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- owner: Claude (Claude Desktop Code, Windows), current bound implementation and evidence review
- source_head: 2295730c4ed661f688ca5b0d10be335e945a7843
- source_state: clean isolated worktree of the pushed PR 30 head; main is b75e50c5 (merge of PR 29 at 17a82bf6)

## Bound sources and work boundary

Approved digests are unchanged: UR sha256:2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248,
PRD sha256:1d6bf911c1d9229d6c54ddfc0fc74bb3402d0e1a8efff775ad5903d81b657a9e,
SD sha256:0a1f8de1bb71b1ffbb317af7f5977dc9c0b617d3080fc62d7d998528fe7f11f1,
TP sha256:0a00d7cd0c13858e038b38a8b18e6419cc4dc21375c4702db4c0d3e6b01a23ff.
This result supersedes the CD+Tests result recorded at revision 28 (candidate af150d33, revise).

Implementation since then, all on the PR 30 branch and authorized by the maintainer:

| Commit | Change | Scope |
|---|---|---|
| 3ac401a5 | Windows path for the Codex T4 dry-run probe test | Outside TP, test-only, separately authorized |
| d4f39956 | F-001: native Claude Desktop transcripts in Desktop records; regenerated compatibility evidence | T-004 |
| 0e93784f | Review fixes F1-F4 (Codex Desktop rollout session/source, scenario and fresh-session binding, scoped review tuple, capture signature) and planned TP negative tests | T-002, T-004, T-005, T-006, T-007 |
| 215eccf2 | Run artefacts committed by the maintainer | Run records |
| 2295730c | Link check in the import test runs before the fixture is dirty (CI Contracts fix) | T-005 test |

Evidence directory: evidence/CANDIDATE_2295730C_20261023/ (relative to this run).

## Candidate (T-009)

- Candidate aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108, commit 2295730c,
  dirty false; CANDIDATE.json sha256 7bbaa028061cdc95b45739e62cf6e2821897fffd74c25659c8a42960a0412451.
- Policy 1bf3c8c9…; loaded identity agdf 0.20.0 / source 6eeb51bb… / runtime 89c28ecb…; MCP dispatcher
  61e3e38e…; 1,591 source files, inventory digest b4c40944dd2650b8130cbff28607ac0a50e4ea7622ed7721d1a558dfc4401a28.
- Payloads and loaded identity are byte-identical to af150d33; exactly the seven expected source files differ.
- Documented preparation in the clean worktree: all steps exit 0; compatibility 56/0, fingerprint
  832d2e0a…; platform-only re-record output preserved and committed bytes restored.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests, local win32 x64 Node v22.22.3 | test:release-qualification 25/25; release-handoff-test 16/16; release-lifecycle-test 6/6; release-evidence-test, test:maintenance-contracts, test:community-health and build pass; test:mcp-ergonomics 44/44; documented preparation all exit 0 |
| Local full plan | verify:commit for 0e93784f passed every stage through archives; cli-smoke stopped at packages/mcp-server/test/structured-flow.test.js:96 (approval past the MCP worker deadline under host load, then dispatch_busy), reproduced 3/3 including 17a82bf6; verify:ci not repeated for 2295730c by maintainer decision |
| Commit-bound remote CI | AGDF Guardrails run 39927176152 for 2295730c: 99 of 100 jobs pass (44 Windows). Install · Win22 1of4 failed on spawnSync git ETIMEDOUT in unchanged packages/cli installer code; packages/cli is unchanged in PR 30; re-run requires repository admin |
| Native host observations | 0 qualified Desktop records |
| Human acceptance | None; two human_reported handchecks retained |

## Desktop evidence (T-010)

DESKTOP_EVIDENCE_REVIEW.md: F-001 resolved and proven on real Claude Desktop lines; originals stay
unbindable; 0 of 6 candidate-bound Desktop records; handoff prepared; validate --all-hosts rejects.
No targeted observation: the only Claude Desktop profile here is the daily one with a non-identical
development install; Codex Desktop is absent.

## Task disposition

| Task | State | Evidence / remaining work |
|---|---|---|
| T-001 to T-008 | Complete | Implementation, fixes and planned negative tests; test:release-qualification 25/25 |
| T-009 | Complete | Clean pushed candidate aa3e4b02; preparation green; remote CI 99/100 with one runner git timeout awaiting re-run |
| T-010 | Partial, evidence obligation | Six Desktop records require executors with isolated Desktop scopes |
| T-011 | Ready | TP Review, Clean Implementation Review and Code Review can now evaluate the final diff |

## Decision and normalized findings

Decision: pass. Implementation and repository tests for T-001 to T-009 are complete for candidate
aa3e4b02. The remaining items are evidence obligations, routed by quality.md to evidence_obligation
rather than CD+Tests: six candidate-bound Desktop records and the re-run of one CI job that failed on
a runner git timeout. QA cannot pass while they are open; publication stays ineligible.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-001 | implementation_gap | CD+Tests | resolved | d4f39956 and CLAUDE_DESKTOP_CAPTURE_PROBE_AFTER_FIX.json: real Desktop dispatch excerpt yields model and session | none |
| E-WIN-TEST-PATH | evidence_gap | evidence_obligation | resolved | 3ac401a5; test:mcp-ergonomics 44/44 and verify:commit stage mcp-ergonomics passed on win32 | none |
| E-CLEAN-SOURCE | evidence_gap | evidence_obligation | resolved | CANDIDATE.json: commit 2295730c, dirty false, pushed PR 30 head | none |
| E-DESKTOP-CODEX | evidence_gap | evidence_obligation | open | DESKTOP_EVIDENCE_REVIEW.md: 0 of 3 Codex Desktop records for aa3e4b02 | Codex Desktop executor records session, upgrade and recovery for aa3e4b02 in an isolated scope and returns the bundle for review and import |
| E-DESKTOP-CLAUDE | evidence_gap | evidence_obligation | open | DESKTOP_EVIDENCE_REVIEW.md: 0 of 3 Claude Desktop Windows records for aa3e4b02 | Windows Claude Desktop executor records the three cases for aa3e4b02 in a dedicated isolated Desktop profile and returns the bundle for review and import |
| E-LOCAL-SMOKE-FLAKE | evidence_gap | evidence_obligation | resolved | evidence/CANDIDATE_0E93784F_20261023/logs/structured-flow-diagnosis.txt: host-load flake reproduced on 17a82bf6; maintainer decision 2026-10-23 to use remote CI; MCP lanes incl. structured-flow pass in run 39927176152 | none |
| E-CI-INSTALL-RERUN | evidence_gap | evidence_obligation | open | logs/ci-install-win22-1of4-failed.log: Install · Win22 1of4 spawnSync git ETIMEDOUT in unchanged installer code, run 39927176152 | Maintainer re-runs the failed job of run 39927176152 and the result is recorded for 2295730c |

No QA, UAT, OR, release or publication authority is inferred.
