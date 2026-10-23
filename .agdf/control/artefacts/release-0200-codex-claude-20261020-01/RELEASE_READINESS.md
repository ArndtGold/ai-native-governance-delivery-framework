# AGDF 0.20.0 release readiness — clean candidate af150d33

Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Status: clean candidate prepared and verified; Desktop qualification pending; CD+Tests revise
Gate authority: none. No QA, UAT, OR or publication approval is asserted.

## Candidate

| Field | Value |
|---|---|
| Verified commit | 17a82bf6a8476c7a0c1380d6476537bf256659a8 (contains handoff commit 2e79783863d00f4d3b9b86776f36d8d59bcff165; PR 29 head; merge base main 7ce6e838) |
| Candidate ID | af150d337fbf47abcfea5f03ae06a53b15107a4b219495ab54ea424c869f1158 |
| Clean status | dirty false; isolated worktree with porcelain 0 throughout; main checkout's untracked .claude/ preserved |
| Policy digest | 1bf3c8c9d3a23cfc4ee2f5b672fd15d6c913095116736682ffd557c54b6fffbf |
| Loaded identity | agdf 0.20.0, source 6eeb51bb9050fb0806f7dd1b32a4e0672d0753d666e0249095c3112942b9f048, runtime 89c28ecbdac8ff15f0091df6f0e29810957e4b70f3d715eb45922d3a7cbe7fcf |
| MCP dispatcher | 61e3e38eeaca4af5c3494156e7e1fe58ac0db37daf25229d06f203bf460ca485 |
| Source / payload | 1,591 source files, inventory digest 27a5b71dd61d6c6fb9ef662294280bad3f0bd0cf319ec90c89f551dc02f03b7a; five payload inventories byte-identical to the macOS diagnostic build |

Details: evidence/CANDIDATE_17A82BF6_20261022/CANDIDATE_IDENTITY.json and CANDIDATE.json.

## Release scope

| Host / surface | Required cases | Available evidence | Qualification |
|---|---|---|---|
| Codex Desktop Code; OS as observed | session, upgrade, recovery | Maintainer reports all three passed; no recoverable original reference; Codex Desktop absent on the Windows host | Pending: 0/3 candidate-bound records |
| Claude Desktop Code, Windows | session, upgrade, recovery | Maintainer reports all three passed; no original session in this host's Desktop session store; F-001 rejects native Desktop captures | Pending: 0/3; blocked by F-001 |
| Claude CLI, Windows | Outside mandatory matrix | Five cases on original candidate 830d8b94 | Historical CLI evidence only |
| Codex CLI, Windows/Linux | Outside mandatory matrix | Optional diagnostics | Unqualified |
| Copilot / OpenCode | Adapters and regression tests | Experimental support intent | Experimental |

No CLI result, repository fixture, Windows CI lane or human report qualifies a Desktop surface.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests, local Windows (win32 x64, Node v22.22.3) | 26 of 27 canonical stages pass. verify:commit --ref HEAD and verify:ci both stop at mcp-ergonomics, 43/44: native.test.mjs:271/275 pass URL.pathname to node (Windows-only, from 8ad683bc on main). All later stages pass individually, cli-smoke 6,831 s. 24 symlink assertions SKIPPED (EPERM) |
| Commit-bound remote CI | AGDF Guardrails run 39770870527, head 17a82bf6, success 118/118 (48 Windows jobs) |
| Native host observations | 0 qualified Desktop records. Current Claude Desktop 3.1623.1.0 executes the candidate's dispatcher and runtime digests from a non-identical daily development install; no isolated scope |
| Human acceptance | Two human_reported handchecks retained; no UAT |

Release tool: handoff prepared (six required cases); validate --all-hosts rejects because no
candidate-bound import exists. Compatibility reports are unchanged: no import occurred, and the
committed snapshot passes compatibility:check (56/0, fingerprint cc7fa169…).

## Blocking findings and obligations

| ID | Type / route | State | Next bounded action |
|---|---|---|---|
| F-001 | implementation_gap / CD+Tests | open | Accept native Claude Desktop session transcripts in the existing capture owner with equivalent strictness and tests; recompute candidate |
| E-WIN-TEST-PATH | evidence_gap / evidence_obligation | open | Maintainer-authorized portability fix outside this run; rerun verify:commit on the resulting commit |
| E-DESKTOP-CODEX | evidence_gap / evidence_obligation | open | Codex Desktop executor: three cases for the final candidate in an isolated scope |
| E-DESKTOP-CLAUDE | evidence_gap / evidence_obligation | open | After F-001: Windows Claude Desktop executor, three cases in a dedicated isolated scope |
| E-CLEAN-SOURCE | evidence_gap / evidence_obligation | resolved | none |

A formatting diagnostic in sealed run artefacts (BROWNFIELD_REVIEW.md EOF blank line and two
recorded JSON files) remains unchanged; implementation paths pass git diff --check.

## Gate position

CD+Tests is revise. Core admits TP Review, Clean Implementation Review and CR only after
CD+Tests is done, so reviews and QA have not started. Publication stays ineligible. Repairing F-001
changes scripts/ and therefore the candidate; any commit, push, merge, tag or publish needs explicit
maintainer authorization.

Previous readiness bytes: evidence/CANDIDATE_17A82BF6_20261022/READINESS_BEFORE_CANDIDATE_AF150D33.md
(sha256 84266bff1b55e7731dd2c07e8add38df39e0b678fffb4002a96869824d24619c).
