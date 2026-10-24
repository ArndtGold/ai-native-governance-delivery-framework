# TP Review — 0.20.0 CLI-qualified release matrix, after the first native import

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Claude (Claude Desktop Code, Windows); cooperative task-plan review
- source_head: 7a41879e742a95579755020b04ccb6e93b81d257 (candidate 5e84374e); PR branch 898f6c97
- based_on: TP sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581
- supersedes: TP_REVIEW_5E84374E_20261024_INPUT.md (revise, revision 47)

Reference is the approved TP, not plausible code. Evidence paths are relative to this run's artefact
directory unless a repository path is named. Candidate: 5e84374e54be68685b1ded7edf71e1e1688d58011db405c87c50aa4a3121a130.

## What changed since the previous TP Review

1. **Claude Code CLI win32 run on 5e84374e.** Preflight froze Claude Code 2.1.302, Node v22.22.3 and
   claude-sonnet-5-5 (tuple 6d128179).
   - First run: dispatch passed. failure_case, skill_continuation, upgrade and recovery failed before any
     AGDF call with `authentication_failed`.
   - Cause of the failures: the copied `.credentials.json` held an access token that had expired the day
     before. The dispatch session refreshed it and so rotated the refresh token, which then lived only in its
     removed copy.
   - After the maintainer signed in again, the four cases were rerun once with the same tuple and all passed.
2. **Review and import.** The reviewer checked all five primary captures; see
   evidence/CLAUDE_CLI_5E84374E_20261024/REVIEW.md and review.json.
   - The maintainer approved the review.
   - `release-evidence.mjs import --host claude --surface cli` passed into the clean PR checkout at 898f6c97.
     That checkout yields the same candidate 5e84374e.
   - After the import, `compatibility:record` and `compatibility:check` passed: 56 scenarios, 0 failures,
     source fingerprint cdf7d682.
3. **New defect (TPR-103).** `npm run test:host-compatibility` fails after this first real native import.
   CI runs it in its host-compatibility stage and in host-compatibility-evidence.yml.
   - Failure: `ENOENT: no such file or directory, open
     '<tmp>/agdf-compatibility-evidence-test-*/evals/host-compatibility/observations/claude-cli-release-5e84374e….json'`
   - Cause: scripts/host-compatibility/test.mjs builds its temporary repository copy from the real manifest,
     but copies no `native_sources`. Its first `recordComparison` therefore cannot read the imported observation.
   - Second assumption: the check "approved public evidence survives regeneration without native promotion"
     assumes the real manifest holds no native rows.
   - Both assumptions held only while `native_sources` was empty, so CI, CD+Tests and the reviews could not
     see the defect.
4. **Consequences.**
   - Committing the import would turn CI red.
   - scripts/host-compatibility/test.mjs is a candidate source (`isCandidateSource` true), so the fix yields a
     new candidate.
   - The uncommitted import and record output were set aside without deletion in two places:
     `git stash@{0}` on the PR branch, and `set-aside-pr-checkout` beside the bundle in the maintainer's
     returns folder.
   - The Codex CLI darwin run must not start on 5e84374e.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | unchanged from the previous TP Review | — | none |
| T-002 | fully_done | unchanged | — | none |
| T-003 | fully_done | unchanged | — | none |
| T-004 | fully_done | unchanged; the real Claude bundle passed `assertHostReleaseEvidence` | — | none |
| T-005 | fully_done | review-template, review and scoped import worked on real Claude records (REVIEW.md; import result pass, five cases) | — | none |
| T-006 | fully_done | unchanged; upgrade and recovery passed natively from released 0.14.5 with `owned_stale_install` | — | none |
| T-007 | fully_done | unchanged | — | none |
| T-008 | partially_done | Projection of the imported Claude tuple into manifest, observations, public evidence and HOST_COMPATIBILITY.md worked; compatibility record/check pass | The repository's own host-compatibility test fails once real native sources exist (TPR-103); the projected state cannot be committed with green CI | P0: blocks committing any native import |
| T-009 | partially_done | Candidate 5e84374e from 7a41879e remains clean and verified | The fix for TPR-103 changes a candidate source; a new final candidate, its verification and remote CI are required | P0: native records must bind the new candidate |
| T-010 | not_done | Claude Code CLI win32 5/5 reviewed and imported for 5e84374e (set aside, not committed) | Ten native records for the new candidate; validate --all-hosts; compatibility record | P0: qualification and publication stay blocked |
| T-011 | partially_done | Code Review pass (revision 46), Clean Implementation Review pass (revision 48), this TP Review | Renewed CD+Tests, Code Review, TP and Clean reviews for the fix; QA decision | QA consumes this review |

## Summary

- fully_done: T-001, T-002, T-003, T-004, T-005, T-006, T-007
- partially_done: T-008 (TPR-103), T-009 (new candidate needed), T-011
- not_done: T-010 (ten native CLI records for the new candidate)
- out_of_scope_changes: none since the previous TP Review
- risks:
  - A copied Claude credential can be consumed by one case's token refresh. Sign in freshly or use
    CLAUDE_CODE_OAUTH_TOKEN before each native run.
  - The account-level claude.ai connectors and organisation skills appear in the published captures; the
    maintainer accepted this.
  - Public matrix rows project only installed, updated and recoverable from native records; discovered and
    callable stay unverified by the existing projection design.
- required_next_step:
  1. Fix scripts/host-compatibility/test.mjs so that its fixture copy carries the real native sources and
     their references, and scope the no-native-promotion check to the fixture's own rows.
  2. Add a test with an imported native release, then renew CD+Tests and the reviews.
  3. Build the new candidate, rerun the ten native cases on it, then review, import, record and validate.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-002 | Mandatory CLI qualification, Desktop handcheck documentation and unqualified/experimental path | T-008 | HOST_COMPATIBILITY.md rendered the imported Claude CLI Windows tuple next to the mandatory matrix, but the state cannot be committed while TPR-103 is open | partial | implementation_gap |
| AC-008 | Release preparation, mandatory CLI qualification and Desktop handcheck documentation | T-008 | RELEASE_READINESS.md still describes 5e84374e and must be renewed for the new candidate | partial | implementation_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | open | Claude Code CLI win32 5/5 for 5e84374e reviewed and imported but set aside; the candidate will be superseded by the TPR-103 fix (evidence/CLAUDE_CLI_5E84374E_20261024/REVIEW.md) | After the new candidate: maintainer reruns preflight and the five native:claude-e2e cases outside the Claude Desktop app package with a fresh sign-in, then review and import |
| TPR-102 | evidence_gap | evidence_obligation | open | 0 of 5 Codex CLI darwin records; the run was held back before it started on 5e84374e | After the new candidate: maintainer runs handoff, preflight and the five native:codex-e2e cases on the Mac with a fresh codex login and returns the bundle |
| TPR-103 | implementation_gap | CD+Tests | open | test:host-compatibility fails with ENOENT in scripts/host-compatibility/test.mjs after the first real native import (non-empty manifest native_sources); compatibility check itself passes | Fix the test fixture copy and the no-native-promotion assertion, add a regression with a real imported native release, renew CD+Tests, Code Review, TP and Clean reviews, and build the new candidate |
