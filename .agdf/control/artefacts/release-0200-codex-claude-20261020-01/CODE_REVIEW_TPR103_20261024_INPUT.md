# Code Review — TPR-103 fix (host-compatibility test fixture)

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Claude (Claude Desktop Code, Windows), with an independent read-only review by a separate agent that
  did not see this assessment
- reviewed_diff: 7a41879e..460027fa (candidate 8e2b8699); code change only in af660509; previous review
  CODE_REVIEW_CLI_MATRIX_20261023_02_INPUT.md (pass, candidate 5e84374e)

## Scope

- **af660509: scripts/host-compatibility/test.mjs.** This is the only candidate source change. The same commit
  re-records the generated compatibility evidence: docs/compatibility/HOST_COMPATIBILITY.md,
  evidence/snapshot.json, evidence/facts.json and the new observation file adce6730….json.
- **898f6c97 and 460027fa.** These contain only run records and handoffs.

## Review

**Correctness of the inputs.** `evidenceInputs`/`copyEvidenceInputs` copy everything that `record()` and
`checkComparison()` in run.mjs read from the repository root:
- the owner file, `native_sources` and `public_evidence`;
- reported sources and their references;
- the source snapshot files, generated payloads and historical directory, all copied as before.

The references of native observations need no extra copy: run.mjs:260-261 requires every such reference to be
listed in `public_evidence`. `native_targets` and `publication.evidence` read no files. The independent review
checked this against the real 5e84374e import and found three `fresh_host` rows whose only reference is the
public evidence file. Nothing is missing.

**No-promotion check.** It now compares the sorted ids of published non-deterministic rows with the ids of the
imported native sources:
- With empty `native_sources` it is equivalent to the old `length === 0`.
- With imports present, a promoted fixture row adds an id and fails the check.
- An id collision fails earlier with `duplicate_observation_id`.
- There is neither a vacuous pass nor a spurious failure.

**Regression check.** "A repository with an imported native release yields complete fixture inputs" is meaningful:
dropping `native_sources` from the inputs fails it with ENOENT, as the mutation check confirmed. It cleans up its
temporary directory in `finally` and uses `safePath` throughout.

**Generated evidence.** It is consistent: the observation file hash equals `snapshot.observation_source`,
`input_sources` is empty, and the only change to the source fingerprint is the hash of test.mjs. The
`permission_before`/`permission_after` fixture fingerprints in facts.json changed; they come from the
deterministic fixture suite this change does not touch. Remote CI for 460027fa is the commit-bound proof.

**Verification evidence.** CD_TESTS_TPR103_8E2B8699_20261024_INPUT.md (run evidence at revision 50) records:
- the real-import run;
- the mutation check;
- clean-worktree host compatibility (71 checks);
- compatibility 56/0;
- maintenance contracts, including release qualification 32/32.

## Advisory

- The regression check exercises the shared helper with a synthetic native release, not the main fixture path with
  a release shaped by `projectNativeRelease`. While the committed manifest has no native sources, reverting the
  main fixture to an inline copy without native sources, or the no-promotion check to `length === 0`, would still
  pass CI.
- The real-data path was verified manually against the 5e84374e import, which is set aside as a stash. It will run
  in CI on the first committed import, before publication.
- Optional hardening: build a second fixture from the native-import fixture and run record, check and the
  no-promotion check on it. This would change a candidate source again. It is a maintainer decision whether to do
  it before the native runs on 8e2b8699.
- The no-promotion check compares ids, not row content. Changed native content is caught separately by the
  `native_input_changed` checks.

## Decision and normalized findings

Decision: pass. No open correctness, regression, security or maintainability finding remains in the reviewed scope.
The remote CI result for 460027fa and the ten native CLI records for 8e2b8699 are evidence obligations outside
Code Review.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-103 | implementation_gap | CD+Tests | resolved | af660509; real-import verification; mutation check; independent review pass | none |

No QA, UAT, OR, release or publication authority is inferred.
