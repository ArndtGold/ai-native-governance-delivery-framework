# Code Review

- decision: pass
- run_id: late-source-revision-20261005-01
- reviewer: Codex, cooperative review by the implementing assistant; no independent review claim
- candidate_digest: sha256:16268eddabada1e7d2cbc35688cbc3d064bfd009693703d1aea77cbfc215d2b9
- scope: all 56 original capability paths plus the one-line archive consumer correction (57 total) against captured T-000 starting bytes (CAPABILITY_DIFF_FINAL.patch), impacted proof/writer/evaluator/dispatcher consumers (CURRENT_PROOF_CONSUMERS.json), tests, derivation and exact separately approved generated/payload changes
- findings: no unresolved concrete defect found in the reviewed candidate
- missing_evidence: none for required CI platforms; optional native installed-host/model behavior unverified
- risks: same author/reviewer assurance; source/protocol fixtures are not live installed-host/model evidence; Windows durability follows the preserved fsync platform contract, exercised by actual native CI fixtures
- required_next_step: consume completed supporting reviews and exact CI evidence in QA

## Actual scope and checks

The diff was reconstructed from raw starting bytes, including shared files already dirty for
SD authoring, rather than assigning the entire Git HEAD diff to this capability. Every before
and after digest matches the candidate inventory. Independent CI edits, approved inputs and
original design Run are unchanged (PROTECTED_PATHS_OPERATIONAL_FINAL.json).

Reviewed strict input identity/shape, exact earliest-source/upstream and analytical assessment,
nonmutating bound preview, locked recomputation, replay before stale checks, effective versus
historically latest source bindings, raw versus canonical presentation hashing, receipt closure
and renewal eligibility. Source Revisions remain sealed in the selected Run. Current authority
requires fresh recording/presentation/approval; archive readers resolve original proofs from
contained pinned bytes. Replay reports its historical effect separately from current revision.
Malformed archives, foreign identities and missing current proof fail closed.

Reviewed existing Run-then-Backlog lock order, version-2 journal discrimination, ownership marker,
archive publication, atomic Run rename commit point, fsync failures, unknown completion and
explicit old/committed recovery. Deletion requires exact owned directory/file inventory and hashes;
foreign/tampered staging is retained/refused. Status and MCP inspection do not recover/write.
Existing version-1 recovery and no-options early PRD path remain covered by unchanged regressions.

Reviewed CLI option exclusivity, explicit target requirement, duplicate inputs, shared Core call,
actual preview identity/impact, registered en/de text and English fallback for valid fr-CA.
MCP remains the existing two-tool inventory with unchanged write/input boundary. Test registration
runs actual CLI and stdio packages; process interruption exits a real process, not a mock result.
The full frozen final 20-stage plan, actual packages/archives and consumer smoke tests passed.

Reviewed qualification changes: four new SD cases use reviewed deterministic instruction replay;
the existing gate-check case reflects the new SD responsibility. Existing 98 prompts are retained;
thresholds, activation policy and grader checks are unchanged. Test snapshots add only the actual
SD contract and sdAction field. Generated compatibility facts preserve observed adapter results;
the new immutable observation is source-bound. Exact payload approval has no reserve and preserves
all limits/enforcement rather than bypassing a failed guard. Final package trees are byte-identical
to the fully tested isolated candidate.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | AC-001 preview previously omitted intended change/source hashes/renewed approval and analysis impact; logs/HUMAN_PREVIEW_BEFORE_FIX.log, actual packaged 51-observation suite and final shared plan prove corrected output | Preserve the actual packaged preview regression in the next source change |
| CR-002 | implementation_gap | CD+Tests | resolved | New analysis routing/forbidden hints lacked operationalValues translations; preserved failed full-plan log, logs/OPERATIONAL_LOCALIZATION_ACTUAL_BLOCK.log and final unchanged strict scanner/full plan prove en/de/fr-CA output | Preserve the unchanged localization scan for later gate-policy strings |

Required CI evidence TPR-001 is resolved by Task Plan Review and consumed by QA. Code review remains cooperative and bounded to reviewed source and observed local/CI behavior.

## CI Correction Reassessment

CI_MATRIX_FINAL.json; CI_PORTABILITY_SOURCE_RECONCILIATION.json; CI_PORTABILITY_REVIEW.md. Actual Windows run 37307012984 rejected archives because its native
resources\binding.js spelling failed the existing descriptor exception comparison. Reviewed
one-line normalization preserves native filesystem paths and every other canonical-byte assertion.
Actual archive checks and all three new lanes pass for d3683df. No extra exception or skip.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-003 | implementation_gap | CD+Tests | resolved | CI_PORTABILITY_REVIEW.md; actual Windows before-fix failure and complete after-fix matrix in CI_MATRIX_FINAL.json | Preserve the actual archive-consumer check in future CI runs |
