# AGDF 0.20.0 release readiness — final candidate 5e84374e

Date: 2026-10-24
Run: release-0200-codex-claude-20261020-01 (revision 46, gate QA)
Status: implementation, Code Review and commit-bound CI complete; native CLI qualification pending; publication ineligible
Gate authority: none. No QA approval, UAT, OR or publication is asserted.

## Candidate

| Field | Value |
|---|---|
| Verified commit | 7a41879e742a95579755020b04ccb6e93b81d257 (PR 30; includes main 1c66c2c3 merged as 0ac2ac9e) |
| Candidate ID | 5e84374e54be68685b1ded7edf71e1e1688d58011db405c87c50aa4a3121a130 |
| Clean status | dirty false; isolated worktree C:/Workspace/agdf-rc-7a41879e; the main checkout validates against it |
| Policy digest | 8d7ff1967b9f6d6be94b050aeff2aebf243905c48eb920c9fa1382be74d87af8 (hostSupport schema 3) |
| Loaded identity | agdf 0.20.0, source 99053ec3…, runtime 6c5ec6dd… |
| MCP dispatcher | 3caf8c2a… |
| Source files | 1,592 |

Details: evidence/CANDIDATE_7A41879E_20261023/CANDIDATE.json and CANDIDATE_STEPS.txt. Superseded candidates
90f6552a (151b4a04), aa3e4b02, af150d33 and 830d8b94 stay historical and are never relabelled.

## Release scope

| Host / surface | 0.20.0 scope | Available evidence | Qualification |
|---|---|---|---|
| Claude Code CLI, Windows | Mandatory: dispatch, failure_case, skill_continuation, upgrade, recovery | No record for 5e84374e; five records for 830d8b94 are rejected for it (historical-evidence.log) | Pending: 0/5 |
| Codex CLI, macOS | Mandatory: the same five cases | No record for 5e84374e; earlier dirty-candidate runs passed all five cases as diagnostics (DARWIN_HARNESS_APPLICABILITY.json) | Pending: 0/5 |
| Codex Desktop | Manually checked, not required for publication | Maintainer reports invocation, upgrade and recovery passed; identity unknown | Not qualified (human_reported) |
| Claude Desktop, Windows | Manually checked, not required for publication | Same reported manual passes; identity unknown | Not qualified (human_reported) |
| Codex CLI, Windows/Linux | Outside the mandatory matrix | Pinned diagnostic probes (0.157.1, gpt-6-luna) | Unqualified |
| Copilot / OpenCode | Adapters and regression tests | Experimental support intent | Experimental |

No CLI result qualifies a Desktop surface, and no result for one operating system qualifies another.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests, local win32 x64 Node v22.22.3 | release qualification 32/32 (including the publication-flow test with a regenerated candidate and its mutation check); release-evidence, release workflows, host compatibility, community health, maintenance contracts, git diff --check |
| Preparation | build:prepare passes after the main merge with the exact Copilot payload baseline 397 files / 3491406 bytes |
| Compatibility evidence | compatibility:record and compatibility:check 56/0, fingerprint 84fffb44… |
| Local full plan | build, release:prepare and verify:ci passed on 151b4a04 before the Code Review fixes and the merge |
| Commit-bound remote CI | AGDF Guardrails run 39994196802 for 7a41879e: 118 of 118 jobs pass |
| Reviews | Code Review pass (revision 46) after CR-101 to CR-104 were resolved; independent re-review without new findings |
| CI inventory | 161 commands and 117 jobs unchanged by this change; only the publication gate was renamed (desktop-evidence to release-evidence, 10 minutes) |
| Native host observations | 0 of 10 mandatory CLI records |
| Human acceptance | None; two human_reported Desktop handchecks retained |

## Open obligations

| ID | Type / route | Owner | Next bounded action |
|---|---|---|---|
| E-CLI-CLAUDE-WIN | evidence_gap / evidence_obligation | Maintainer on the Windows test computer | handoff --host claude, preflight, five native:claude-e2e cases from a terminal outside the Claude Desktop app package, then review-template, review and import --host claude --surface cli |
| E-CLI-CODEX-MACOS | evidence_gap / evidence_obligation | Maintainer on the Mac | handoff --host codex, preflight with the actual Codex CLI (CODEX_BIN if needed), five native:codex-e2e cases, then review-template, review and import --host codex --surface cli |

After both imports: validate --all-hosts, compatibility:record/check, then QA again. Only a QA pass opens
Approval: QA, UAT and OR. The publication job validates the same ten rows independently.

## Notes

- Codex records are bound to the commit they ran on, proven through git as an ancestor of the release
  checkout with only evidence-output changes; the candidate file's commit field is not trusted. The SD
  phrases this as equality with the candidate commit; TP Review and QA confirm the reading.
- The sealed earlier BROWNFIELD_REVIEW material keeps its EOF blank-line finding unchanged.
- Previous readiness bytes: evidence/TP_REVIEW_5E84374E_20261024/READINESS_BEFORE_CANDIDATE_5E84374E.md
  (sha256 65148aca10e09b9eb9ed95dc8d6b28a15633389f6cbb7942211ce43f26acb592).
