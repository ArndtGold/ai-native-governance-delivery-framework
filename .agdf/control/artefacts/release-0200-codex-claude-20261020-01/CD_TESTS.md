# CD+Tests — 0.20.0 CLI matrix, final candidate 90f6552a

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- owner: Claude (Claude Desktop Code, Windows), current bound implementation and evidence review
- source_head: 151b4a042f8d3e2b2eafbb5dd5bb784ce57394cd
- source_state: clean isolated worktree of the pushed PR 30 head

## Bound sources and work boundary

Approved digests: UR sha256:2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248,
PRD sha256:7ff703b088b9db7a223b286c9f949de3ce20612d37d3615f4e9f648ed47c7daa,
SD sha256:2e1be758666cf513aae78309a301de1ea26536d5e156d84f430b493ff83577a1,
TP sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581.
Brownfield Analysis was recorded at revision 42. Earlier CD+Tests results for the Desktop matrix are historical.

Implementation on the PR 30 branch, committed and pushed with maintainer authorization:

| Commit | Change | Scope |
|---|---|---|
| 79df3564 | Run artefacts of the source revision, committed by the maintainer | Run records |
| 5bb9cc54 | hostSupport schema 3, scoped tuple and candidate-commit binding, policy-driven import scope, per-host handoff, Codex CLI preflight on macOS, optional strict Desktop validation, release-evidence publication job, CLI matrix in reports and guidance, exact Copilot payload baseline, plus run artefacts | T-002 to T-008 |
| 9c3131f5 | Verification summary for T-002 to T-008 | Run records |
| 151b4a04 | Re-pinned request activation source fingerprint after the definition change (Auto-fix for the Skills lanes) | T-002 follow-up |

Evidence: evidence/CLI_MATRIX_IMPLEMENTATION_20261023/ and evidence/CANDIDATE_151B4A04_20261023/ (relative to this run).

## Candidate (T-009)

- Candidate 90f6552aa15a6e18d8eee6d9ef410383d56bf52cd19fdc5acd9ef65d689880b7, commit 151b4a04, dirty false;
  CANDIDATE.json sha256 d37ae896cedc760dac96d40be0ed623180a6c76a00c0139c302b86aaf53dd726.
- Policy 8d7ff1967b9f6d6be94b050aeff2aebf243905c48eb920c9fa1382be74d87af8; loaded identity agdf 0.20.0 /
  source 5e3d634d… / runtime 8b9e789a…; MCP dispatcher 1c6c69c4…; 1,591 source files.
- Computed in the clean worktree C:/Workspace/agdf-rc-151b4a04 after npm ci, build:prepare and the MCP
  package install; git status stayed empty. The main checkout validates against the same candidate.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests, local win32 x64 Node v22.22.3 | test:release-qualification 31/31; release-evidence-test; test:release-workflows; ci-plan-test 9/9; test:host-compatibility 70 checks; test:community-health; test:maintenance-contracts in Git Bash; activation lane 23/23 after the re-pin |
| Local full plan on 151b4a04 | npm run build, release:prepare and npm run verify:ci all exit 0 (verify:ci 14:35 to 16:08 UTC, cli-smoke passed); Windows rewrote pages/.astro/content.d.ts (../src to ./../src), diff kept as windows-astro-content-dts.diff and committed bytes restored |
| Compatibility evidence | compatibility:record and compatibility:check 56/0, fingerprint 73050d43… |
| CI inventory | 161 commands and 117 jobs unchanged; only timeout change is the rename desktop-evidence to release-evidence at 10 minutes (CI_INVENTORY_COMPARISON.json) |
| Commit-bound remote CI | AGDF Guardrails run 39970720377 for 151b4a04: success, 119 of 119 checks; run 39969057580 for 9c3131f5 failed in the Skills lanes on the stale fingerprint and was superseded |
| Native host observations | 0 of 10 mandatory CLI records for 90f6552a |
| Human acceptance | None; two human_reported Desktop handchecks retained |

## Task disposition

| Task | State | Evidence / remaining work |
|---|---|---|
| T-001 | Complete | BROWNFIELD_ANALYSIS.md, baseline inventory and timeouts |
| T-002 to T-008 | Complete | Implementation and planned tests; affected suites green |
| T-009 | Complete | Clean candidate 90f6552a; local full verification and remote CI green |
| T-010 | Open, evidence obligation | Five Claude Code CLI cases on the Windows test computer and five Codex CLI cases on the maintainer's Mac for 90f6552a |
| T-011 | Ready | TP Review, Clean Implementation Review and Code Review can evaluate the final diff |

## Decision and normalized findings

Decision: pass. Implementation, repository tests and commit-bound verification for T-001 to T-009 are
complete for candidate 90f6552a. The ten native CLI records are evidence obligations, routed by quality.md
to evidence_obligation rather than CD+Tests. QA cannot pass while they are open; publication stays ineligible.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-SKILLS-FINGERPRINT | implementation_gap | CD+Tests | resolved | run 39969057580 Skills lanes SOURCE_FINGERPRINT; 151b4a04 re-pin; activation lane 23/23; run 39970720377 success | none |
| F-COPILOT-PAYLOAD | implementation_gap | CD+Tests | resolved | build-prepare-payload-budget-stop.log: 460 bytes over the baseline from the shipped schema-3 definition; copilot-payload-baseline.json set to the exact measured 3488952 bytes with rationale | none |
| F-CODEX-COMMIT-BINDING | implementation_gap | CD+Tests | resolved | release-handoff-test schema-3 cases: the macOS row binds the candidate commit so evidence-only commits keep it valid; the diagnostic scope keeps the checkout commit | none |
| E-CLI-CLAUDE-WIN | evidence_gap | evidence_obligation | open | 0 of 5 Claude Code CLI win32 records for 90f6552a | Maintainer runs the five cases on the Windows test computer from a process outside the Claude Desktop app package, then review-template, review and import with --host claude --surface cli |
| E-CLI-CODEX-MACOS | evidence_gap | evidence_obligation | open | 0 of 5 Codex CLI darwin records for 90f6552a | Maintainer runs preflight and the five cases on the Mac, then review-template, review and import with --host codex --surface cli |

No QA, UAT, OR, release or publication authority is inferred.
