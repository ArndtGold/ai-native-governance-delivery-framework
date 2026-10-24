# Code Review — 0.20.0 CLI matrix, repeat on the final commit

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- reviewer: Claude (Claude Desktop Code, Windows), with an independent read-only re-review of the fixes
- reviewed_diff: 5fb2642c..7a41879e (candidate 5e84374e); previous review CODE_REVIEW_CLI_MATRIX_20261023_INPUT.md (revise)

## Scope

The implementation diff of the first review plus everything added since: the fixes in fb55e3f3, the
merge of main in 0ac2ac9e and the advisory follow-up in 102025fa. The merged main commit 1c66c2c3 (MCP
worker shutdown reserve) was reviewed on main; here only its merge into this branch and the conflict
resolution are in scope. Run records in 077713f7 and 7a41879e contain no code.

## Review of the fixes and the merge

- fb55e3f3: assertEvidenceOnlyDescendant checks that the record commit is present, is an ancestor of the
  checked-out commit, and that every later change is outside the candidate source identity (manifest
  compared without its evidence fields). The independent re-review confirmed the CI flow now passes 10/10,
  rejects reversed, foreign and source-changing histories, renames and deletions of source paths, and
  handles unusual path characters through -z. It also confirmed that git failures and shallow clones fail
  closed and that a forged candidate commit field has no effect. requiresFrozenTuple stops a mandatory
  Codex run without --tuple before any record is written; diagnostics and schema 2 are unaffected.
- 0ac2ac9e: the only conflict was the Copilot payload baseline. Both sides had raised it from 3488492. The
  resolution records the exact generated payload of the merged tree, 397 files / 3491406 bytes, verified by
  build:prepare, and documents it in payload-budget-history.md. Nothing else differs from a clean merge.
- 102025fa: a missing ancestor object now reports candidate_ancestor_unavailable before the ancestry check;
  the comments state that the git comparison is stricter than the normalized inventory. Covered by the
  updated publication-flow test.
- The renewed implementation evidence (CD_TESTS_CANDIDATE_5E84374E_20261023_INPUT.md, recorded as run
  evidence at revision 45) shows release qualification 32/32, compatibility 56/0, host compatibility,
  community health, maintenance contracts and the clean candidate 5e84374e from 7a41879e.

## Advisory

- The SD phrases the Codex binding as the record commit equal to the candidate commit; the implementation
  proves exact candidate source through git ancestry with an evidence-only diff. TP Review and QA should
  confirm that reading.
- The git comparison is stricter than the inventory: a mode-only or line-ending-only change to a source path
  after the record commit rejects valid evidence. This fails closed.
- Review tuples are built from the records, so a preflight is proven only by the harness refusal; this is the
  same residual trust as for Claude.

## Decision and normalized findings

Decision: pass. No open correctness, regression, security or maintainability finding remains in the
reviewed scope. The remote CI result for 7a41879e and the ten native CLI records are evidence obligations
outside Code Review.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-101 | implementation_gap | CD+Tests | resolved | fb55e3f3; publication-flow test 10/10 with a regenerated candidate; independent re-review | none |
| CR-102 | implementation_gap | CD+Tests | resolved | fb55e3f3: the candidate file commit field takes no part in the binding; forged field test | none |
| CR-103 | implementation_gap | CD+Tests | resolved | fb55e3f3 requiresFrozenTuple and CODEX_RELEASE_PREFLIGHT_REQUIRED; policy assertions | none |
| CR-104 | implementation_gap | CD+Tests | resolved | CD_TESTS_CANDIDATE_5E84374E_20261023_INPUT.md recorded as run evidence at revision 45; candidate 5e84374e from 7a41879e | none |

No QA, UAT, OR, release or publication authority is inferred.
