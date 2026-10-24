# CD+Tests — 0.20.0 CLI matrix, final candidate 5e84374e

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- owner: Claude (Claude Desktop Code, Windows), current bound implementation and evidence review
- source_head: 7a41879e742a95579755020b04ccb6e93b81d257
- source_state: clean isolated worktree of the pushed PR 30 head

## Bound sources and work boundary

Approved digests: UR sha256:2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248,
PRD sha256:7ff703b088b9db7a223b286c9f949de3ce20612d37d3615f4e9f648ed47c7daa,
SD sha256:2e1be758666cf513aae78309a301de1ea26536d5e156d84f430b493ff83577a1,
TP sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581.
This result supersedes the CD+Tests result at revision 43 (candidate 90f6552a, commit 151b4a04), which
predates the Code Review fixes (Code Review revise at revision 44, CR-104).

Changes since 151b4a04 on the PR 30 branch:

| Commit | Change | Scope |
|---|---|---|
| fb55e3f3 | Git-proven ancestry binding for mandatory Codex rows (assertEvidenceOnlyDescendant), requiresFrozenTuple and CODEX_RELEASE_PREFLIGHT_REQUIRED, publication-flow and negative tests, guide correction, refreshed compatibility evidence | CR-101 to CR-103 fixes (T-004, T-005, T-006) |
| 0ac2ac9e | Merge of main 1c66c2c3 (bounded MCP worker shutdown reserve and termination diagnostics); only conflict the Copilot payload baseline, set to the exact merged 397 files / 3491406 bytes and documented in payload-budget-history.md | Base sync (Auto-fix) |
| 102025fa | candidate_ancestor_unavailable for a missing ancestor object; comments state the stricter git comparison; compatibility evidence for the merged sources | Review advisories |
| 077713f7, 7a41879e | Code Review report, complete fix logs, merge verification logs | Run records |

Evidence: evidence/CR_FIX_20261023/, evidence/MERGE_MAIN_1C66C2C3_20261023/ and
evidence/CANDIDATE_7A41879E_20261023/ (relative to this run).

## Candidate (T-009)

- Candidate 5e84374e54be68685b1ded7edf71e1e1688d58011db405c87c50aa4a3121a130, commit 7a41879e, dirty false;
  CANDIDATE.json sha256 a51bfbcc7c81f6393a2c526298d39de5de190e72d48e2ef654f791d2210c21e0.
- Policy 8d7ff1967b9f6d6be94b050aeff2aebf243905c48eb920c9fa1382be74d87af8 (unchanged); loaded identity
  agdf 0.20.0 / source 99053ec3… / runtime 6c5ec6dd…; MCP dispatcher 3caf8c2a…; 1,592 source files.
- Computed in the clean worktree C:/Workspace/agdf-rc-7a41879e after npm ci, build:prepare and the MCP
  package install; git status stayed empty. The main checkout validates against the same candidate.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests after the fixes and the merge, local win32 x64 Node v22.22.3 | test:release-qualification 32/32 (including the publication-flow test and its mutation check); release-evidence-test; test:release-workflows; host-compatibility 70 checks; community health; maintenance contracts in Git Bash; git diff --check |
| Preparation after the merge | build:prepare passes with the exact payload baseline (first run stopped at 3491406 observed against 3491362 computed; the baseline file itself ships in the payload) |
| Compatibility evidence | compatibility:record and compatibility:check 56/0, fingerprint 84fffb44… |
| Local full plan | npm run build, release:prepare and npm run verify:ci passed on 151b4a04; not repeated after the fixes and the merge, the commit-bound full verification is the remote CI run for the final commit |
| Commit-bound remote CI | Run for 7a41879e pending at recording; earlier run 39970720377 for 151b4a04 passed 119 of 119 |
| Independent review | Re-review of fb55e3f3 closed CR-101 to CR-103 with no new block or revise findings |
| Native host observations | 0 of 10 mandatory CLI records for 5e84374e |

## Task disposition

| Task | State | Evidence / remaining work |
|---|---|---|
| T-001 to T-008 | Complete | Implementation, review fixes and planned tests |
| T-009 | Complete except the pending remote CI result | Clean candidate 5e84374e; local suites green; remote CI for 7a41879e pending |
| T-010 | Open, evidence obligation | Five Claude Code CLI cases on the Windows test computer and five Codex CLI cases on the maintainer's Mac for 5e84374e |
| T-011 | Ready | Code Review can be repeated on the final diff; TP Review and Clean Implementation Review follow |

## Decision and normalized findings

Decision: pass. Implementation, repository tests and preparation for T-001 to T-009 are complete for candidate
5e84374e. The remote CI result for the final commit and the ten native CLI records are evidence obligations.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-104 | implementation_gap | CD+Tests | resolved | CANDIDATE_7A41879E_20261023/CANDIDATE.json: candidate 5e84374e from 7a41879e, which contains fb55e3f3 and the main merge | none |
| F-MAIN-MERGE | implementation_gap | CD+Tests | resolved | 0ac2ac9e: single payload-baseline conflict resolved to the measured 3491406 bytes; build:prepare, compatibility 56/0 and release qualification 32/32 after the merge | none |
| E-REMOTE-CI-FINAL | evidence_gap | evidence_obligation | open | Remote CI for 7a41879e pending at recording | Record the green remote CI result for 7a41879e, or fix the failing check through Auto-fix |
| E-CLI-CLAUDE-WIN | evidence_gap | evidence_obligation | open | 0 of 5 Claude Code CLI win32 records for 5e84374e | Maintainer runs the five cases on the Windows test computer from a process outside the Claude Desktop app package, then review-template, review and import with --host claude --surface cli |
| E-CLI-CODEX-MACOS | evidence_gap | evidence_obligation | open | 0 of 5 Codex CLI darwin records for 5e84374e | Maintainer runs preflight and the five cases on the Mac, then review-template, review and import with --host codex --surface cli |

No QA, UAT, OR, release or publication authority is inferred.
