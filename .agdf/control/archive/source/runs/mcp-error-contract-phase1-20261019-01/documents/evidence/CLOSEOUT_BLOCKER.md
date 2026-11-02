# Closeout blocked after accepted UAT

Status: blocked

- run_id: mcp-error-contract-phase1-20261019-01
- observed_revision_id: 4a96e988-49b9-49ec-a806-204dfb160d9f
- approval_operation: 0a1d43b8-73c9-4926-8478-df063dc43efe
- closeout_operation: f94bcb60-c17b-481e-90b5-cbd8767a3ec6
- outcome: rejected
- reason: closeout_quality_unconfirmed
- reason_detail: Invalid or contradictory normalized finding: QA/CD-PERF-001.
- lifecycle: active; formal completion and clean commit handoff are not established.

## Concrete cause

The QA and three review reports record CD-PERF-001 as resolved, but their normalized row omits the required explicit earliest-owner assessment and starts its required_next_step with None. validNormalizedGap rejects both conditions even for a resolved row. Existing report-result, gate readiness, QA/UAT approval and prepared-OR readiness accepted the technical pass; the stricter final inspectQaReports check rejects its normalized row. This is a formal report-validation inconsistency, not evidence of a newly failing product test. The drafted OR was not registered and its status is now draft.

## Concrete correction prepared without changing approved evidence

closeout-format-diagnosis.json lists exact source and proposed digests. Four candidate report copies in closeout-format-candidates/ preserve their original result and evidence and make the existing CD+Tests earliest-owner assessment explicit, with a supported concrete continuation action. The actual existing inspectQaReports parser rejects the originals and returns kind none with zero findings for the in-memory candidate overlay. All four current original source bytes remain unchanged. These are proposals only, never current reports or substitute approval authority.

## Recovery boundary

The existing artefact.record owner replaces only unapproved drafts. The installed source-revision contract covers UR/PRD/SD/TP and explicitly prohibits that path after deliberate UAT approval; it cannot be repurposed to rewrite the approved QA report. No supported post-UAT QA/report amendment was found in the exposed exact operation contracts. No approval invalidation, lifecycle edit, installed runtime patch, validator weakening or direct seal edit was attempted.

The next required action is a separately governed repair of this post-UAT report-validation/recovery inconsistency, retaining the exact existing approvals and history and using the prepared candidates as review input. It must establish a supported amendment/renewal path before the owning QA/review reports can change and closeout can be retried. The existing UAT reply must never be applied to a changed report set.

## Qualification retained

All 40 source hashes and HEAD still match the final QA evidence; 28/28 scenarios and the two existing performance passes remain the recorded local qualification. New native recovery, Windows, remote CI, installation, VCS and publication remain unqualified or unperformed. No repeated implementation test is claimed for this administrative diagnosis.
