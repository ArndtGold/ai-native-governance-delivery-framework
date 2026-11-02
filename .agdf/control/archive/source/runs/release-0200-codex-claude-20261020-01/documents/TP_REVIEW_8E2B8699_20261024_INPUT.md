# TP Review — 0.20.0 CLI-qualified release matrix, candidate 8e2b8699

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Claude (Claude Desktop Code, Windows); cooperative task-plan review
- source_head: 460027fabc58fe0da041bbabe117519dd1f696b7 (candidate 8e2b8699); PR branch 08bb962f
- based_on: TP sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581
- supersedes: TP_REVIEW_5E84374E_20261024_02_INPUT.md (revise, revision 49)

Reference is the approved TP, not plausible code. Evidence paths are relative to this run's artefact
directory unless a repository path is named. Candidate: 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692.

## What changed since the previous TP Review

1. **TPR-103 fix (af660509).** scripts/host-compatibility/test.mjs now carries the manifest's native sources
   into its fixture. Its no-promotion check accepts exactly the imported native rows. A regression check
   covers fixture inputs from a repository with an imported native release.
2. **Verification against the real failure.** With the real 5e84374e Claude CLI import applied, the fixed test
   passes (71 checks), as do `compatibility:record` and `compatibility:check`. Before the fix the same state
   failed with ENOENT.
   - A mutation that drops native sources from the fixture inputs fails the new check.
   - The import itself stays set aside and is not relabelled for the new candidate.
3. **New candidate.** 8e2b8699 was built from 460027fa in a clean worktree. Exactly one candidate source differs
   from 5e84374e: scripts/host-compatibility/test.mjs. Policy, payload and runtime identities are unchanged.
   - Clean-worktree suites are green: host compatibility, compatibility 56/0 and maintenance contracts,
     including release qualification 32/32.
   - CD+Tests is recorded as run evidence at revision 50 (CD_TESTS_TPR103_8E2B8699_20261024_INPUT.md).
4. **Code Review pass.** CODE_REVIEW_TPR103_20261024_INPUT.md includes an independent read-only review. It is
   recorded as run evidence at revision 51, because the review step is rejected at the QA gate with
   review_step_not_ready.
   - One low advisory: the regression exercises the shared helper with a synthetic native release. The
     real-data path is proven by the manual real-import run, and CI runs it on the first committed import.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | unchanged | — | none |
| T-002 | fully_done | unchanged; the policy digest of 8e2b8699 equals the one of 5e84374e | — | none |
| T-003 | fully_done | unchanged | — | none |
| T-004 | fully_done | unchanged; a real Claude bundle passed the evaluator on 5e84374e | — | none |
| T-005 | fully_done | review-template, review and scoped import were exercised with real Claude records (evidence/CLAUDE_CLI_5E84374E_20261024/REVIEW.md) | — | none |
| T-006 | fully_done | unchanged; upgrade and recovery passed natively from released 0.14.5 on 5e84374e, and the harness is unchanged in 8e2b8699 | — | none |
| T-007 | fully_done | unchanged | — | none |
| T-008 | fully_done | af660509 fixes TPR-103; real-import verification, mutation check and clean-worktree host compatibility 71 checks; compatibility re-recorded (fingerprint ad31f063) | — | none |
| T-009 | partially_done | evidence/CANDIDATE_460027FA_20261024/ (CANDIDATE.json, CANDIDATE_STEPS.txt, VERIFY_STEPS.txt) | Green commit-bound remote CI for the PR head (08bb962f, an evidence-only descendant of 460027fa) | QA needs the green run |
| T-010 | not_done | Handoff, preflight, harness binding, review and import work on real records (5e84374e Claude run, set aside) | Ten native records for 8e2b8699: five Claude Code CLI win32 and five Codex CLI darwin, reviewed and imported; then compatibility record and validate --all-hosts | P0: qualification and publication stay blocked |
| T-011 | partially_done | Code Review pass (revision 51 evidence); this TP Review; Clean Implementation Review follows | Clean Implementation Review and QA decision | QA consumes this review |

## Summary

- fully_done: T-001 to T-008
- partially_done: T-009 (remote CI pending), T-011
- not_done: T-010 (ten native CLI records for 8e2b8699)
- out_of_scope_changes: none
- risks:
  - A copied Claude credential can be consumed by one case's token refresh. The handoff refuses to start without
    a sign-in valid for at least an hour, or with CLAUDE_CODE_OAUTH_TOKEN.
  - The Codex harness also copies auth.json, so the maintainer should sign in freshly before the Mac run.
  - The regression scope advisory from the Code Review applies.
- required_next_step:
  1. Record the green remote CI for the PR head.
  2. The maintainer runs the five Claude Code CLI cases for 8e2b8699 on the Windows test computer and the five
     Codex CLI cases on the Mac, each after a fresh sign-in.
  3. Review, import, compatibility record, validate --all-hosts, then QA.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-002 | Mandatory CLI qualification, Desktop handcheck documentation and unqualified/experimental path | T-008 | HOST_COMPATIBILITY.md renders the mandatory CLI matrix, the manually checked Desktop surfaces and the unqualified/experimental paths. With the real import applied, it also renders the imported Claude tuple, and the test suite accepts that state. | fulfilled | none |
| AC-008 | Release preparation, mandatory CLI qualification and Desktop handcheck documentation | T-008 | RELEASE_READINESS.md updated for 8e2b8699 with completed checks, historical records and one next action per host | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | open | 0 of 5 Claude Code CLI win32 records for 8e2b8699; the 5e84374e records stay historical | Maintainer runs the 8e2b8699 handoff (preflight and five native:claude-e2e cases) outside the Claude Desktop app package with a valid sign-in, then review and import |
| TPR-102 | evidence_gap | evidence_obligation | open | 0 of 5 Codex CLI darwin records for 8e2b8699 | Maintainer signs in freshly with codex login and runs the 8e2b8699 handoff on the Mac, then returns the bundle for review and import |
| TPR-103 | implementation_gap | CD+Tests | resolved | af660509; CD_TESTS_TPR103_8E2B8699_20261024_INPUT.md (revision 50); CODE_REVIEW_TPR103_20261024_INPUT.md (revision 51) | none |
| TPR-104 | evidence_gap | evidence_obligation | open | Remote CI for 08bb962f pending at recording | Record the green AGDF Guardrails run for the PR head, or fix a failing check through Auto-fix |
