# AGDF 0.20.0 release readiness — final candidate 8e2b8699

Date: 2026-10-24
Run: release-0200-codex-claude-20261020-01 (revision 53, gate QA)
Status: TPR-103 fixed, CD+Tests and Code Review pass. Commit-bound CI and native CLI qualification are pending,
so publication is ineligible.
Gate authority: none. No QA approval, UAT, OR or publication is asserted.

## Candidate

| Field | Value |
|---|---|
| Verified commit | 460027fabc58fe0da041bbabe117519dd1f696b7 (PR 30). The PR head 08bb962f adds only run records. |
| Candidate ID | 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692 |
| Clean status | dirty false, built in the isolated worktree C:/Workspace/agdf-rc-460027fa |
| Change against 5e84374e | Exactly one candidate source: scripts/host-compatibility/test.mjs (TPR-103) |
| Policy digest | 8d7ff1967b9f6d6be94b050aeff2aebf243905c48eb920c9fa1382be74d87af8 (hostSupport schema 3, unchanged) |
| Loaded identity | agdf 0.20.0, source 99053ec3…, runtime 6c5ec6dd… (unchanged) |
| MCP dispatcher | 3caf8c2a… (unchanged) |
| Source files | 1,592 |

Details are in evidence/CANDIDATE_460027FA_20261024/: CANDIDATE.json, CANDIDATE_STEPS.txt and VERIFY_STEPS.txt.

The superseded candidates 5e84374e (7a41879e), 90f6552a (151b4a04), aa3e4b02, af150d33 and 830d8b94 stay
historical and are never relabelled.

## Release scope

| Host / surface | 0.20.0 scope | Available evidence | Qualification |
|---|---|---|---|
| Claude Code CLI, Windows | Mandatory: dispatch, failure_case, skill_continuation, upgrade, recovery | No record for 8e2b8699. Five passing, reviewed records for 5e84374e are historical (evidence/CLAUDE_CLI_5E84374E_20261024/), and their import was set aside. | Pending: 0/5 |
| Codex CLI, macOS | Mandatory: the same five cases | No record for 8e2b8699. Earlier dirty-candidate runs passed all five cases as diagnostics (DARWIN_HARNESS_APPLICABILITY.json). | Pending: 0/5 |
| Codex Desktop | Manually checked, not required for publication | Maintainer reports invocation, upgrade and recovery passed; identity unknown | Not qualified (human_reported) |
| Claude Desktop, Windows | Manually checked, not required for publication | Same reported manual passes; identity unknown | Not qualified (human_reported) |
| Codex CLI, Windows/Linux | Outside the mandatory matrix | Pinned diagnostic probes (0.157.1, gpt-6-luna) | Unqualified |
| Copilot / OpenCode | Adapters and regression tests | Experimental support intent | Experimental |

No CLI result qualifies a Desktop surface, and no result for one operating system qualifies another.

## Verification, separated by kind

| Kind | Result |
|---|---|
| Repository tests, clean worktree, win32 x64, Node v22.22.3 | test:host-compatibility 71 checks. compatibility:check 56/0, fingerprint ad31f063…. test:maintenance-contracts: verification, node support, interaction catalog, payload budget, release workflow, release evidence, Codex activation matrix and release qualification 32/32. git diff --check is clean. |
| Fix against the real failure | With the real 5e84374e Claude CLI import applied, the fixed test passes, as do compatibility:record and compatibility:check. Before the fix the same state failed with ENOENT. A mutation check confirms the regression. |
| Preparation | build:prepare passes in the clean worktree; the Copilot payload baseline is unchanged |
| Commit-bound remote CI | AGDF Guardrails for the PR head 08bb962f, pending at writing. 08bb962f is an evidence-only descendant of 460027fa. |
| Reviews | CD+Tests (revision 50) and Code Review pass (revision 51, with an independent review), both recorded as run evidence. TP Review is revise while the native records are open. Clean Implementation Review pass. |
| Native host observations | 0 of 10 mandatory CLI records for 8e2b8699 |
| Human acceptance | None. Two human_reported Desktop handchecks are retained. |

## Open obligations

| ID | Type / route | Owner | Next bounded action |
|---|---|---|---|
| TPR-104 | evidence_gap / evidence_obligation | Claude (Auto-fix on PR 30) | Record the green remote CI for the PR head, or fix a failing check |
| TPR-101 | evidence_gap / evidence_obligation | Maintainer on the Windows test computer | Run explorer.exe C:\Workspace\agdf-rc-460027fa\probe-results\run-claude-cli-cases.cmd with a sign-in valid for at least an hour (evidence/HANDOFF_8E2B8699_20261024/claude/WINDOWS_RUN.md), then review and import --host claude --surface cli |
| TPR-102 | evidence_gap / evidence_obligation | Maintainer on the Mac | Run codex login, then bash run-codex-cli-cases.sh (evidence/HANDOFF_8E2B8699_20261024/codex/MAC_RUN.md), then return the bundle for review and import --host codex --surface cli |

After both imports: compatibility:record and compatibility:check, validate --all-hosts, then QA again. Only a QA
pass opens Approval: QA, UAT and OR. The publication job validates the same ten rows independently.

## Notes

- Codex records are bound to the commit they ran on. Git proves it to be an ancestor of the release checkout with
  only evidence-output changes; the candidate file's commit field is not trusted.
- The first real native import exposed TPR-103: the host-compatibility test assumed an empty native inventory.
  The import commit's CI runs the fixed test with real data before publication.
- The published Claude captures contain account-level connector names, organisation skill names and the overage
  setting. The maintainer accepted this for the public repository on 2026-10-24.
- The sealed earlier BROWNFIELD_REVIEW material keeps its EOF blank-line finding unchanged.
- The previous readiness bytes are in evidence/TP_REVIEW_8E2B8699_20261024/READINESS_BEFORE_CANDIDATE_8E2B8699.md
  (sha256 b2fb5ef6c70772d6725bafc0d8f6194dc06776c06fa8f89bd8e3e8d3a2f797b4).
