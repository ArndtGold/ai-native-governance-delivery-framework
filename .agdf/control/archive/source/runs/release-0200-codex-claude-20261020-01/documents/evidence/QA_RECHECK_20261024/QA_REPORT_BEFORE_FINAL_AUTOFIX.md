# QA Report: AGDF 0.20.0 CLI release evidence and Codex import correction

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, native captures, local correction and recorded reviews
Date: 2026-10-24
Owner: Codex using qa-gate; maintainer owns human acceptance

## 1. QA Decision

Decision: revise

The sole QA decision owner is qa-gate. The mandatory matrix is Claude Code CLI on Windows and
Codex CLI on macOS, five cases each. The previous Desktop report is historical; its exact bytes
are preserved at evidence/QA_RECHECK_20261024/QA_REPORT_PREVIOUS.md.

All ten original cases technically validate with the corrected evaluator. Codex review/import on
Windows is still outstanding. The new local import correction is outside the earlier Code/Clean
review scope. These evidence gaps prevent QA pass; no completed case needs to be repeated here.

| Quality Readiness | Evidence owner | Result |
|---|---|---|
| Plan coverage | task-plan-review | revise: T-010 lacks Codex review/import and complete publication validation |
| Solution integrity | clean-implementation-review | Earlier scope passed; current correction needs review |
| Code quality | code-review | Earlier scope passed; current correction needs review |
| QA decision | qa-gate, sole decision owner | revise |

## 2. TP Coverage

- delivered_result: The clean 460027fabc58fe0da041bbabe117519dd1f696b7 candidate has five reviewed/imported Claude Windows cases and five completed Codex macOS cases. The local correction writes authorizes in future Codex failure-case summaries and accepts its omission in older Codex failure-case summaries only when the hash-checked primary capture explicitly proves authorizes false. All ten original cases pass read-only validation; all completed records and the Codex archive remain byte-identical.

Reference: approved TP.md, sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581.
T-001 to T-008 retain their recorded evidence for its stated scope. T-009 has the clean 8e2b8699
candidate and green CI for 94ef61c9, but that does not qualify the new working-tree diff. T-010
is partially done: Codex review/import, validate --all-hosts and resulting compatibility evidence
remain outstanding. T-011 has this QA decision; renewed reviews/reconciliation remain necessary.

## 3. Evidence

- QA preflight: Run release-0200-codex-claude-20261020-01 at QA, revision
  682f28a6-1e9c-463c-917c-1d8eda603796; Doctor pass and source revisions verified.
- Approved PRD/SD/TP require the CLI matrix. Desktop is manually checked and non-gating.
  BROWNFIELD_ANALYSIS.md assigns the existing candidate, observation, import and reporting owners.
- TP_REVIEW.md: revise, TPR-101/102/104 open, TPR-103 resolved. CLEAN_IMPLEMENTATION_REVIEW.md
  and CODE_REVIEW_TPR103_20261024_INPUT.md pass the prior scope, not the new local correction.
- evidence/QA_RECHECK_20261024/VALIDATION.json: clean original candidate; ten-case technical
  validation with the two frozen tuples; Claude review verified; 44 original files unchanged.
- evidence/QA_RECHECK_20261024/release-qualification.log: 34/34 local tests pass. Negative tests
  reject unsafe summary/primary authority, missing primary authority, changed capture hashes
  and omissions outside Codex failure_case. release-evidence-test, syntax and diff checks passed.
- AGDF Guardrails run 40079920556 succeeded for PR 30 head
  94ef61c9f0aa5a2041269236affc6556c33ed5a3; it excludes the uncommitted correction:
  https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/40079920556.
- Claude review/import exists under evals/host-compatibility/native/8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692/claude/cli/.
  Original Codex results remain in /Users/arndtgold/agdf-rc-460027fa/probe-results/.
- Codex tuple: CLI 0.163.0, gpt-6-luna, darwin/x64, Node v22.22.3; macOS 15.7.7 observed.
  /Users/arndtgold/codex-cli-bundle-8e2b8699.tar.gz SHA-256:
  2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36.

## 4. Missing Evidence

- qualification_limits: Codex review/import on Windows and complete reviewed publication validation remain absent. Current Code/Clean/TP reviews do not cover the uncommitted correction. Candidate 8e2b8699 identifies the original clean source, not the changed working tree; no new candidate, full verification or remote CI is claimed for that diff. Older Desktop results and Codex Windows/Linux diagnostics provide no substitute qualification.

TP_REVIEW.md and RELEASE_READINESS.md retain old zero-case/CI-pending counts from their writing
time. These are not current counts; QA does not silently close their owner findings.

## 5. Risks

- delivery_risks: Treating local validation as reviewed/imported qualification would skip T-010. Applying old candidate/CI evidence to the new source diff would lose exact-source provenance. The archive contains 20 absolute /Users/ path occurrences in 16 files; the performed scan found no token-like secrets, email addresses, auth.json, configuration directories or work-tmp entries. No work-tmp remains. Installations report hook_review_required, accepted by the CLI harness; this is no separate native hook qualification. Dependency installation emitted moderate/high audit warnings without remediation.

## 6. Required Next Step

Complete the outstanding evidence review for the actual scope: review the current correction and
the immutable Codex bundle on Windows, then perform only a separately authorized scoped import
and complete matrix validation. Reconcile TP Review/readiness and re-run QA. Keep the clean
candidate checkout and original records unchanged. This report authorizes no native repeat,
commit, push, import, merge or publication.

## Normalized Findings

Upstream types, routes and statuses are consumed unchanged. New observations do not rewrite the
review owner's disposition.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | open | TP_REVIEW remains open; five Claude records and their review are now imported | TP Review owner reconciles the finding against the imported Claude evidence |
| TPR-102 | evidence_gap | evidence_obligation | open | Five original Codex cases technically pass; required Windows review/import is absent | Review the immutable Codex bundle before a separately authorized import |
| TPR-103 | implementation_gap | CD+Tests | resolved | Recorded af660509 correction and its bound reviews | Preserve the recorded resolution evidence; no corrective work remains for this finding |
| TPR-104 | evidence_gap | evidence_obligation | open | TP_REVIEW remains open; run 40079920556 now succeeds for 94ef61c9 | TP Review owner records the exact current CI evidence |
| QA-101 | evidence_gap | evidence_obligation | open | Three uncommitted producer/evaluator/test changes are outside the recorded Code/Clean scope | Review the actual correction and record its candidate/source applicability |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing Brownfield owners remain; this report holds Run-specific results and limits.
- memory_target: scope_artifact
- memory_reason: Candidate-specific QA results and unresolved evidence obligations belong to this Run.
- memory_refs: QA_REPORT.md; evidence/QA_RECHECK_20261024/VALIDATION.json

## 7. Gate Approval

Approval: QA is not requested. No deviation acceptance is proposed while current-diff reviews and
mandatory qualification evidence are incomplete. UAT, OR, release and publication remain closed.
