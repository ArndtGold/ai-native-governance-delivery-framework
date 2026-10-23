# Code Review — 0.20.0 CLI matrix implementation

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- reviewer: Claude (Claude Desktop Code, Windows), with an independent read-only reviewer pass
- reviewed_diff: 5fb2642c..151b4a04 (implementation for candidate 90f6552a), fixes reviewed in fb55e3f3

## Scope

Reviewed the implementation diff without run artefacts and generated compatibility evidence:
hostSupport schema 3 in plugins/agdf/meta/agdf-plugin.definition.json; scripts/native-probes/lib/
release-policy.mjs, release-observation.mjs, release-handoff.mjs, release-candidate.mjs; test-support and
the release test suites; scripts/host-compatibility run/render/test; .github/workflows/publish-agdf.yml and
its contract tests; the Copilot payload baseline; the request activation fingerprint re-pin; guidance.
The unchanged native harnesses (codex-host-e2e.mjs, claude-host-e2e.mjs) were checked for compatibility
with the new mandatory rows.

## Findings

- [block] scripts/native-probes/lib/release-observation.mjs and publish-agdf.yml: the publication job
  regenerates the candidate from the release checkout, whose commit is the commit that carries the
  imported evidence. A mandatory Codex record names the earlier commit it ran on, so the equality check
  rejected every real publication (native_codex_release_commit_mismatch). Reproduced with the full flow
  (import, commit, import, commit, regenerate, validate --all-hosts); the original candidate file
  passed only because it was supplied by hand. The guide claimed the opposite.
- [revise] same location: the compared commit came from the candidate file's source_revision, which
  validateCandidate strips before recomputing candidate_id, so the file's commit field was editable
  without detection.
- [revise] scripts/native-probes/codex-host-e2e.mjs: with --candidate but without --tuple the Codex
  harness emitted release records; the review template derives tuples from the records, so the newly
  mandatory macOS row did not enforce the preflight-frozen tuple that the Claude harness already requires.

## Resolution in fb55e3f3

- release-candidate.mjs: isCandidateSource mirrors the inventory rules; assertEvidenceOnlyDescendant
  proves through git that the record commit is an ancestor of the checked-out commit and that every later
  change is an evidence output (manifest compared without its evidence fields). The candidate file's
  commit field is no longer used. Without a repository the record commit must equal the checkout commit.
- release-observation.mjs and release-handoff.mjs pass the repository to import, validate and the
  optional Desktop evaluation; the diagnostic Linux/Windows scope keeps the exact checkout commit and pin.
- release-policy.mjs requiresFrozenTuple; codex-host-e2e.mjs refuses a mandatory row without --tuple
  (CODEX_RELEASE_PREFLIGHT_REQUIRED); the diagnostic workflow without --tuple is unaffected.
- Tests: a publication-flow test (import Claude, commit, import Codex, commit, regenerate the candidate,
  validate --all-hosts 10/10, an edited candidate commit field changes nothing) plus negatives for foreign
  and later commits, manifest input changes and source changes; a mutation run with the old equality check
  fails that test with native_codex_release_commit_mismatch. Release qualification 32/32, release-evidence,
  release workflows, host compatibility, community health, maintenance contracts, compatibility record and
  check (fingerprint 8a58e712…) and git diff --check pass (evidence/CR_FIX_20261023/).

## Checked without findings

Schema-3 policy pins and historical schema 1/2 predicates; the publication gate's ten rows and the
schema-1/2 rejection; --surface cli scope mapping and the single-tuple review scope; optional strict
Desktop validation; containment, symlink, staging and rollback paths; the publish graph and unchanged
timeouts; relabelling protection through policy and candidate identity; the report rendering; the
payload baseline and fingerprint re-pin; Claude harness records against the mandatory Windows row.

## Advisory

- The approved SD phrases the Codex binding as the record commit equal to the candidate commit. The fix
  implements that exact-source binding through git ancestry with an evidence-only diff, because the
  approved import flow commits the evidence and the release job regenerates the candidate at that later
  commit. TP Review and QA should confirm this reading; a different intent would need an SD revision.
- Records still carry operator-attested source.dirty; the harnesses validate the candidate content but not
  a clean checkout, as before.

## Decision and normalized findings

Decision: revise. The defects are fixed and tested in fb55e3f3, but the recorded CD+Tests result and the
final candidate 90f6552a predate that fix, so implementation evidence must be renewed before QA.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-101 | implementation_gap | CD+Tests | resolved | fb55e3f3 assertEvidenceOnlyDescendant; publication-flow test 10/10 with a regenerated candidate; mutation with the old check fails it | Re-review at the next Code Review after renewed CD+Tests |
| CR-102 | implementation_gap | CD+Tests | resolved | fb55e3f3: binding no longer reads the candidate file commit; test with an edited source_revision still validates 10/10 | Re-review at the next Code Review after renewed CD+Tests |
| CR-103 | implementation_gap | CD+Tests | resolved | fb55e3f3 requiresFrozenTuple and CODEX_RELEASE_PREFLIGHT_REQUIRED; release-lifecycle-test policy assertions | Re-review at the next Code Review after renewed CD+Tests |
| CR-104 | implementation_gap | CD+Tests | open | CD_TESTS.md and candidate 90f6552a are bound to 151b4a04, before the fixes in fb55e3f3 | Recompute the candidate from the final commit in a clean worktree, verify it and re-record CD+Tests |

No QA, UAT, OR, release or publication authority is inferred.
