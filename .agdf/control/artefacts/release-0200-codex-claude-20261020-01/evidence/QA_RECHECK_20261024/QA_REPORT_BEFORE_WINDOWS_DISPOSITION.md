# QA Report: AGDF 0.20.0 CLI evidence and Codex import correction

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, original native captures, current Code/Clean/TP reviews and local verification
Date: 2026-10-24
Owner: Codex using qa-gate; maintainer owns human acceptance

## 1. QA Decision

Decision: revise

qa-gate is the sole final Quality Readiness decision owner. The mandatory matrix remains
Claude Code CLI on Windows and Codex CLI on macOS, five cases each. All ten original records
technically validate with the corrected evaluator. Current Code and Clean Implementation Reviews
pass the scoped correction; the missing-field import defect is fixed and reviewed.
QA cannot pass because the specified Windows Codex import, final combined publication validation
and applicable final-source verification remain incomplete. No native case was repeated.

| Quality Readiness | Evidence owner | Result |
|---|---|---|
| Plan coverage | task-plan-review | revise: T-008 to T-011 retain concrete final evidence obligations |
| Solution integrity | clean-implementation-review | pass for the three-file import correction |
| Code quality | code-review | pass for the three-file import correction |
| QA decision | qa-gate, sole decision owner | revise |

## 2. TP Coverage

- delivered_result: Five original Claude Windows cases are reviewed and imported; five original Codex macOS cases passed and received agent primary-capture/bundle review. The producer now records failure-case authority explicitly. The existing validator accepts an absent legacy Codex failure-case summary field only after contained hash-checked primary evidence proves authorizes false. Both original evidence sets and the original Codex bundle are unchanged. The deterministic compatibility projection was refreshed through its existing owner.

Reference: approved TP.md, sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581.
Current TP_REVIEW.md covers T-001 to T-007 as fully_done, T-008 to T-011 as partially_done.
T-009 distinguishes original candidate/CI from the current uncommitted source correction.
T-010 still lacks the specified Windows import and resulting complete reviewed publication
validation. T-008/T-011 retain the final projection/verification and QA obligations.
The approved CLI scope, manual non-gating Desktop scope and Brownfield owners remain unchanged.

## 3. Evidence

- QA continuation resolves this target and release Run at QA; Doctor passes, source revisions
  verify, and the renewed TP Review is recorded at revision 59,
  0732cced-b874-4198-a65a-ae2bb049d9e9. No QA or UAT acceptance is inferred.
- CODE_REVIEW.md and CLEAN_IMPLEMENTATION_REVIEW.md pass the exact three-file correction.
  These are cooperative agent reviews, not independent human acceptance. TP_REVIEW.md is revise.
- evidence/QA_RECHECK_20261024/VALIDATION.json: original clean candidate and ten-case mechanical
  validation with the original tuples. CODEX_PRIMARY_REVIEW.json and CODEX_BUNDLE_REVIEW.json
  identify actual primary checks, agent reviewer and exact immutable bundle digest.
- release-qualification.log: 34/34 tests pass, including unsafe authority values, missing primary
  authority, hash tampering and forbidden omissions in all other host/scenario scopes.
  release-evidence-test, syntax and diff checks passed.
- LOCAL_VERIFICATION.md records canonical passed stages, failed attempts and exact retry limits.
  Compatibility recording/check passed 56 scenarios with zero unexpected failures. Package
  consumer/archive, runtime, community, host-compatibility, transaction, wrapper smoke and pages
  checks passed. Full verify:ci is not green; complete CLI smoke is not claimed as passed.
- DELIVERY_MAP_SUMMARY.json: this release Run's map passes; aggregate findings remain in other
  Runs. The empty untracked invalid Run directory alone was removed after inspection. Actual
  foreign source/approval/relationship content was not changed.
- Original-head CI: AGDF Guardrails 40079920556 succeeded for PR 30 head
  94ef61c9f0aa5a2041269236affc6556c33ed5a3. It excludes this uncommitted correction:
  https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/40079920556.
- IMMUTABILITY_FINAL.json: all 44 protected original Codex files and 26 imported Claude files
  are byte-identical. Native source is clean commit 460027fabc58fe0da041bbabe117519dd1f696b7,
  candidate 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692.
- Codex frozen tuple: CLI 0.163.0, gpt-6-luna, darwin/x64, Node v22.22.3. Observed macOS 15.7.7.
  Tuple digest: 8299345338bf8687140d55d13cdc8242137cb7da0fbfeaeee4e3f57cda18e347.
- Original bundle: /Users/arndtgold/codex-cli-bundle-8e2b8699.tar.gz, SHA-256
  2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36.
  WINDOWS_RETURN.md prepares the specified external review/import sequence and separate tool root.

## 4. Missing Evidence

- qualification_limits: The specified Codex import on Windows and complete reviewed combined matrix/publication validation have not run. No Windows executor is connected. Candidate 8e2b8699 identifies the original clean source, not the three changed source/test files. No new final release snapshot or remote CI exists for that correction. Full local verify:ci remains unsuccessful, and the supplemental complete CLI smoke retry is incomplete. Repository and disposable fixture tests supply no additional native-host qualification.

The initial full verifier's stale derived snapshot was corrected through prescribed regeneration.
Subsequent aggregate Delivery Map findings remain concrete foreign-owner obligations. CLI retry
failures and its deliberately stopped broader retry stay visible in their logs. No passed stage
is substituted for the absent complete stage. The no-commit/no-push restriction remains in force.

## 5. Risks

- delivery_risks: Local technical validation cannot be called the completed Windows import or final release qualification. Applying old candidate/CI evidence to changed source would break exact-source provenance. The archive retains 20 absolute /Users/ path occurrences in 16 files; the scan found no token-like secrets, email addresses, auth.json, configuration directories or work-tmp entries. No native work-tmp remains. CLI hook_review_required is accepted by the harness and is not separate hook qualification. Dependency installations emitted audit warnings; no broad dependency remediation is claimed.

## 6. Required Next Step

Transfer the prepared Windows return package to C:\Workspace\agdf-native-returns\ and execute
the documented reviewed import against the clean original candidate with the separate corrected
tool checkout. Then validate the combined reviewed matrix, refresh its existing projection and
obtain applicable final-snapshot verification before renewed QA. The import workflow was requested
by the maintainer; its execution is unavailable here. No further consent question is introduced.
No completed native record may be edited or repeated to change a result. No commit, push, merge,
tag or import was performed in this local closeout.

## Normalized Findings

The current TP owner's types, routes and statuses are consumed unchanged. QA-101's missing
current-diff reviews are now resolved by the actual recorded Code/Clean reviews.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | resolved | Five original candidate-bound Claude CLI records and exact review already imported under 8e2b8699/claude/cli | Preserve that imported candidate-bound proof |
| TPR-102 | evidence_gap | evidence_obligation | open | Five original Codex cases pass; agent primary review completed; specified Windows import has not run | Import the reviewed immutable bundle on the specified Windows computer and validate the full matrix |
| TPR-103 | implementation_gap | CD+Tests | resolved | Recorded af660509 repair and original reviewed evidence, retained in BEFORE_TP_REVIEW.md | Preserve the recorded fix and its exact evidence |
| TPR-104 | evidence_gap | evidence_obligation | resolved | Guardrails 40079920556 success for exact PR head 94ef61c9 | Preserve the original-head CI link without extending it to uncommitted source |
| TPR-105 | evidence_gap | evidence_obligation | open | The three changed candidate-source/test files have local tests and current reviews but no new final release snapshot or remote CI | Establish final-snapshot applicability before releasing the changed source |
| TPR-106 | evidence_gap | evidence_obligation | open | Current deterministic projection is refreshed, but the final combined imported native matrix is absent | Refresh the existing projection after the specified import and complete matrix validation |
| TPR-107 | evidence_gap | evidence_obligation | open | Full local verification is not green; aggregate foreign relationships remain unresolved and complete CLI smoke has not passed | Resolve the concrete verification blockers through their existing owners and obtain complete applicable final verification |
| QA-101 | evidence_gap | evidence_obligation | resolved | Current Code Review and Clean Implementation Review pass the actual three-file correction | Preserve those recorded reviews and keep their exact scope limits |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing Brownfield producer/validator/reporting owners are retained; scope-specific evidence belongs to this Run.
- memory_target: scope_artifact
- memory_reason: Exact candidate, native tuple and remaining qualification obligations are Run evidence.
- memory_refs: QA_REPORT.md; evidence/QA_RECHECK_20261024/LOCAL_VERIFICATION.md

## 7. Gate Approval

Approval: QA is not requested from this revise report. No deviation acceptance, UAT, OR or release
approval is inferred. The reviewed local correction does not close the remaining evidence obligations.
