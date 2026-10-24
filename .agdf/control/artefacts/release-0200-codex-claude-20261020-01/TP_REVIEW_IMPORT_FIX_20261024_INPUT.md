# TP Review: current native evidence and Codex import correction

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Codex agent, cooperative task-plan review
- based_on: TP sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Recorded Brownfield Analysis; same source owners | none for its scoped task | none |
| T-002 | fully_done | Existing schema-3 policy; 34/34 release tests | none for its scoped task | none |
| T-003 | fully_done | Original clean candidate revalidated; source mutation remains candidate-sensitive | none for identity mechanism | none |
| T-004 | fully_done | Existing primary evaluator plus reviewed import correction; original ten-case validation passes | none for evaluator behavior | none |
| T-005 | fully_done | Existing handoff/scoped import mechanism; immutable-record compatibility reviewed | Execution of Codex Windows import belongs to T-010 | none for mechanism |
| T-006 | fully_done | Original native upgrade/recovery captures and recorded baseline tests | none for original candidate transitions | none |
| T-007 | fully_done | Publication dependency tests and original-head green CI; no workflow changed locally | none for workflow task | none |
| T-008 | partially_done | Current CLI support projection retained; QA evidence records actual counts | Readiness/compatibility projection after both imports | keep reporting boundary visible |
| T-009 | partially_done | Clean candidate 8e2b8699; green CI 40079920556 on 94ef61c9; 34/34 local tests for the correction | Final snapshot/full CI evidence for any source-changing release of this correction | old candidate is not relabelled |
| T-010 | partially_done | Five reviewed/imported Claude cases; five Codex cases technically pass and agent primary review completed | Import on the specified Windows computer and complete publication validation | mandatory release evidence remains incomplete |
| T-011 | partially_done | Current Code/Clean review inputs and this TP Review | Final QA after remaining obligations | no QA pass yet |

## Current evidence and limits

QA_RECHECK_20261024/VALIDATION.json validates all ten original cases mechanically. Claude review
exists in the candidate's claude/cli scope. CODEX_PRIMARY_REVIEW.json checks original Codex primary
responses; CODEX_BUNDLE_REVIEW.json locks their actual bundle digest/tuple and identifies the
agent reviewer. It is not a claim that the requested Windows review/import ran. The original
archive and all 44 watched files are unchanged. No native case was repeated.

Guardrails 40079920556 succeeds for 94ef61c9. That closes the original TPR-104 CI obligation only;
it does not establish CI for the three uncommitted source/test changes. The approved candidate
source inventory includes those paths, so the changed working tree is not candidate 8e2b8699.
An external patched evaluator may validate the original clean candidate without changing its
identity; releasing the changed source itself requires its own final-snapshot evidence.

## Summary

- fully_done: T-001 to T-007
- partially_done: T-008 to T-011
- not_done: none
- out_of_scope_changes: No product/runtime scope expansion; the correction stays with existing evidence owners.
- risks: No Windows execution surface is connected in this chat. The user's location and immutable
  evidence constraints remain in force. No commit, push or release is inferred from autofix.
- required_next_step: Complete the specified Windows import and resulting final qualification checks.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-002 | Mandatory CLI qualification and manually checked Desktop scope | T-008 | Existing HOST_COMPATIBILITY.md; current QA evidence separates observed/reviewed/imported states | fulfilled | none |
| AC-008 | Final release readiness reporting | T-008 | Current QA and evidence logs exist; final post-import readiness is outstanding | partial | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | resolved | Five original candidate-bound Claude CLI records and exact review already imported under 8e2b8699/claude/cli | Preserve that imported candidate-bound proof |
| TPR-102 | evidence_gap | evidence_obligation | open | Five original Codex cases pass; agent primary review completed; specified Windows import has not run | Import the reviewed immutable bundle on the specified Windows computer and validate the full matrix |
| TPR-103 | implementation_gap | CD+Tests | resolved | Recorded af660509 repair and original reviewed evidence, retained in BEFORE_TP_REVIEW.md | Preserve the recorded fix and its exact evidence |
| TPR-104 | evidence_gap | evidence_obligation | resolved | Guardrails 40079920556 success for exact PR head 94ef61c9 | Preserve the original-head CI link without extending it to uncommitted source |
| TPR-105 | evidence_gap | evidence_obligation | open | The three changed candidate-source/test files have local tests and current reviews but no new final release snapshot or remote CI | Establish final-snapshot applicability before releasing the changed source |
| TPR-106 | evidence_gap | evidence_obligation | open | Final post-import compatibility/readiness projection is not available | Refresh the existing projection after the specified import and complete matrix validation |

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
