# AGDF 0.20.0 release readiness — final candidate aa3e4b02

Date: 2026-10-23
Run: release-0200-codex-claude-20261020-01 (revision 33, gate QA, QA decision revise)
Status: implementation, reviews and QA recorded; Desktop qualification pending; publication ineligible
Gate authority: none. No QA approval, UAT, OR or publication is asserted.

## Candidate

| Field | Value |
|---|---|
| Verified commit | 2295730c4ed661f688ca5b0d10be335e945a7843 (PR 30 head; main b75e50c5 = merge of PR 29 at 17a82bf6) |
| Candidate ID | aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 |
| Clean status | dirty false; isolated worktree C:/Workspace/agdf-rc-2295730c |
| Policy digest | 1bf3c8c9d3a23cfc4ee2f5b672fd15d6c913095116736682ffd557c54b6fffbf |
| Loaded identity | agdf 0.20.0, source 6eeb51bb9050fb0806f7dd1b32a4e0672d0753d666e0249095c3112942b9f048, runtime 89c28ecbdac8ff15f0091df6f0e29810957e4b70f3d715eb45922d3a7cbe7fcf |
| MCP dispatcher | 61e3e38eeaca4af5c3494156e7e1fe58ac0db37daf25229d06f203bf460ca485 |
| Source / payload | 1,591 source files, inventory digest b4c40944dd2650b8130cbff28607ac0a50e4ea7622ed7721d1a558dfc4401a28; payloads byte-identical to the earlier candidates af150d33 and 5143cc19 |

Details: evidence/CANDIDATE_2295730C_20261023/CANDIDATE_IDENTITY.json, CANDIDATE.json and
VERIFICATION_RESULTS.json. Superseded: af150d33 (17a82bf6), local ca829515 (d4f39956).

## Release scope

| Host / surface | Required cases | Available evidence | Qualification |
|---|---|---|---|
| Codex Desktop Code; OS as observed | session, upgrade, recovery | Maintainer reports all three passed; no recoverable original reference; Codex Desktop absent on the Windows host | Pending: 0/3 records for aa3e4b02 |
| Claude Desktop Code, Windows | session, upgrade, recovery | Maintainer reports all three passed; F-001 fixed, real Desktop transcript lines now pass the capture rules; no isolated Desktop profile on this host | Pending: 0/3 records for aa3e4b02 |
| Claude CLI, Windows | Outside mandatory matrix | Five cases on original candidate 830d8b94 | Historical CLI evidence only |
| Codex CLI, Windows/Linux | Outside mandatory matrix | Optional diagnostics | Unqualified |
| Copilot / OpenCode | Adapters and regression tests | Experimental support intent | Experimental |

No CLI result, repository fixture, Windows CI lane or human report qualifies a Desktop surface.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests, local Windows | test:release-qualification 25/25, release-handoff-test 16/16, release-lifecycle-test 6/6, release-evidence-test, test:maintenance-contracts, test:mcp-ergonomics 44/44, test:community-health, build; documented preparation all exit 0; compatibility 56/0 |
| Local full plan | verify:commit for 0e93784f passed every stage through archives; cli-smoke stopped at a host-load MCP test flake (structured-flow, dispatch_busy after the worker deadline), reproduced on 17a82bf6; local verify:ci not repeated by maintainer decision |
| Commit-bound remote CI | Run 39927176152 for 2295730c: 99 of 100 jobs pass (44 Windows); Install · Win22 1of4 failed on a runner git timeout in unchanged installer code; re-run needs repository admin |
| Native host observations | 0 qualified Desktop records |
| Human acceptance | None; two human_reported handchecks retained |

Release tool: handoff prepared for aa3e4b02 (six required cases); validate --all-hosts rejects because
no candidate-bound import exists. Compatibility reports are current (fingerprint 832d2e0a…).

## Run decisions

| Step | Result | Artefact |
|---|---|---|
| CD+Tests | pass (revision 29) | CD_TESTS.md |
| Code Review | pass, CR-001 to CR-007 resolved (revision 30) | CODE_REVIEW.md |
| TP Review | revise, TPR-001 to TPR-003 open (revision 31) | TP_REVIEW.md |
| Clean Implementation Review | pass (revision 32) | CLEAN_IMPLEMENTATION_REVIEW.md |
| QA | revise, QA-001 to QA-003 open (revision 33) | QA_REPORT.md |

## Open obligations

| ID | Type / route | Owner | Next bounded action |
|---|---|---|---|
| QA-001 | evidence_gap / evidence_obligation | Codex Desktop executor | Record session, upgrade and recovery for aa3e4b02 in an isolated scope from evidence/CANDIDATE_2295730C_20261023/handoff/ |
| QA-002 | evidence_gap / evidence_obligation | Windows Claude Desktop executor | Record the three cases for aa3e4b02 in a dedicated isolated Desktop profile |
| QA-003 | evidence_gap / evidence_obligation | Maintainer (repository admin) | Re-run the failed job of run 39927176152 and record the green result |

After the records exist: evidence review, scoped import per host, validate --all-hosts,
compatibility:record/check, then QA again. Only a QA pass opens Approval: QA, UAT and OR.

Advisory items (CODE_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md): baseline digests are format-checked
and must be compared with BASELINE_REGISTRY_CHECK.json during review; preflight version evidence is the
captured tuple; failed imports can leave empty parent directories; the publish job relies on a
deterministic rebuild; unreachable legacy routes remain. The sealed BROWNFIELD_REVIEW.md EOF blank
line is unchanged. A test-robustness fix for the MCP structured-flow flake is proposed separately.

Previous readiness bytes: evidence/CANDIDATE_2295730C_20261023/READINESS_BEFORE_CANDIDATE_AA3E4B02.md
(sha256 32c1510feee4e0d0cf00d71738d4d5b104932ca29fdd4c0b5560bda3360a90bb).
