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
| T-009 | partially_done | Original clean candidate and original-head green CI; all 27 shared verification stages now pass in the exact current-source snapshot, including complete CLI smoke | New clean final commit/candidate and its required evidence if the changed probes enter the release; no VCS step is authorized | old candidate is not relabelled |
| T-010 | partially_done | Ten original cases and their exact reviews pass the full canonical read-only validate --all-hosts command | Specified Windows review/import is accepted as a residual gap by the maintainer; no repository import is claimed | retain original candidate-only qualification and accepted gap |
| T-011 | fully_done | Current Code/Clean reviews cover actual source, derived outputs and metadata corrections; this TP Review and the actual QA revise decision retain all remaining gaps | Deliberate human QA/UAT decisions are not inferred | review work is complete; technical QA still revise |

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

## Final local verification and residual limits

QA_FINISH_20261024/FINAL_VERIFICATION.md and VERIFICATION.json record the complete 27-stage
repository plan passing on the exact isolated current-source snapshot. The complete CLI/MCP
smoke chain now passes. The reviewed traceability corrections clear the three aggregate map
blockers while preserving every approval and listed artefact; thirteen old objective warnings
remain. The current Code/Clean reviews cover the additional metadata and projection changes.
REVIEWED_MATRIX_VALIDATION.json proves a complete canonical read-only ten-case matrix pass.
No repository import or native scenario repetition occurred.

The maintainer accepts the specified Windows review/import as a residual evidence gap, as
registered in WINDOWS_GAP_MAINTAINER_DISPOSITION.json. This acceptance does not resolve the
missing test/import findings. The final source/probe commit/candidate obligation remains open
under the explicit no-commit/no-push boundary; original native records cannot qualify a new
source identity. SOURCE_APPLICABILITY.json and SNAPSHOT_IDENTITY.json make that distinction exact.

## Summary

- fully_done: T-001 to T-007 and T-011
- partially_done: T-008 to T-010
- not_done: none
- out_of_scope_changes: No product/runtime scope expansion; the correction stays with existing evidence owners.
- risks: No Windows execution surface is connected in this chat. The user's location and immutable
  evidence constraints remain in force. No commit, push or release is inferred from autofix.
- required_next_step: Present the current bounded evidence-only QA deviation proposal; keep the final-candidate obligation and the accepted Windows limitation explicit.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-002 | Mandatory CLI qualification and manually checked Desktop scope | T-008 | Existing HOST_COMPATIBILITY.md; current QA evidence separates observed/reviewed/imported states | fulfilled | none |
| AC-008 | Final release readiness reporting | T-008 | Current QA and evidence logs exist; final post-import readiness is outstanding | partial | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | resolved | Five original candidate-bound Claude CLI records and exact review already imported under 8e2b8699/claude/cli | Preserve that imported candidate-bound proof |
| TPR-102 | evidence_gap | evidence_obligation | open | Five original Codex cases and the full read-only reviewed matrix pass; specified Windows review/import remains unexecuted and is explicitly accepted as a residual gap | Retain the unchanged return package and execute the documented Windows review/import before claiming that execution |
| TPR-103 | implementation_gap | CD+Tests | resolved | Recorded af660509 repair and original reviewed evidence, retained in BEFORE_TP_REVIEW.md | Preserve the recorded fix and its exact evidence |
| TPR-104 | evidence_gap | evidence_obligation | resolved | Guardrails 40079920556 success for exact PR head 94ef61c9 | Preserve the original-head CI link without extending it to uncommitted source |
| TPR-105 | evidence_gap | evidence_obligation | open | The changed source passes the complete 27-stage isolated snapshot verification, but no new final commit/candidate or native qualification exists for that changed identity | Establish the expressly authorized clean final commit/candidate and its required CI/native evidence before releasing the changed source |
| TPR-106 | evidence_gap | evidence_obligation | open | Full reviewed ten-case read-only validation passes and readiness is current, but the final combined repository-import projection remains absent | Refresh the existing projection after an actual authorized import if the later qualification claim requires it |
| TPR-107 | evidence_gap | evidence_obligation | resolved | All 27 shared verification stages pass in the exact isolated snapshot; reviewed relationship corrections clear aggregate blockers; complete CLI/MCP smoke passes | Preserve the full verification log, source identity and unchanged-source guards |

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
