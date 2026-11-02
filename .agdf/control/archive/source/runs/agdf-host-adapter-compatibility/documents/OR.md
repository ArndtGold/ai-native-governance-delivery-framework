# Orchestration Report

Run: agdf-host-adapter-compatibility
Revision: 4
Date: 2026-09-09

## OR

- gate: UAT, awaiting human review and exact UAT approval
- report_mode: OR-full for the approved deterministic evidence refresh
- artefact: .agdf/control/artefacts/agdf-host-adapter-compatibility/OR.md
- status: QA Report Revision 3 pass and exact user QA approval accepted; UAT remains pending
- delivered: Fresh source-bound compatibility comparison and immutable 56-scenario observations;
  64 evidence checks, 30 current verification groups and release preparation pass; Code/Clean/TP
  reviews and QA Report Revision 3 refreshed; all twelve tasks remain fulfilled. Exact QA approval
  is recorded with its revision/content identity; UAT_PREPARATION.md supplies five pending human checks.
- intentionally_not_delivered: Other run implementations or closeout, native-host certification,
  fresh sessions, native Windows, human UAT, host lifecycle mutation, commit, push, PR, publication or release.
- evidence: CD_TESTS.md; CODE_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; TASK_PLAN_REVIEW.md;
  QA_REPORT.md; evidence/COMPATIBILITY_REFRESH_20260909.json; evidence/QA_APPROVAL_20260909.json;
  UAT_PREPARATION.md; docs/compatibility/HOST_COMPATIBILITY.md.
- missing_evidence: Native installed/fresh-host, native Windows, GitHub-hosted Ubuntu rerun and human UAT
  remain explicitly unverified within the approved comparison scope. Exact UAT approval is absent.
- risks: Later source/payload changes invalidate the dated comparison. One initial local-install
  content-ID assertion mismatch did not reproduce in the complete rerun without source/test edits;
  the original failure is retained and its exact cause remains unestablished. No native proof is inferred.
- retained_fallbacks: Existing Codex registration restoration, Claude bounded cache retry, Copilot
  manual handoff/prior-state restoration, OpenCode retry and unknown-surface facade behavior remain
  unchanged. Replacement requires a separately approved change with matching native/recovery proof.
- required_next_step: Human reviews UAT_PREPARATION.md and the supplied report, then decides on Approval: UAT.
- quality_outlook: Stale compatibility evidence has been replaced by fresh executed observations;
  all final required results pass for the current recorded snapshot.
- delivery_closeout_next: no; exact UAT approval remains a separate prerequisite.

## Scope and historical evidence

The prior accepted raw observation file and all 36 historical observations remain intact. The
comparison recorder, evaluator and assertions were reused without changes. The current 16-file
participating dependency delta was reviewed within compatibility scope. Separately owned guided
installation and dispatcher changes are regression inputs and retain their own delivery authority.

The original private host-owner refactor and CI prerequisite correction remain recorded in
FINAL_VERIFICATION.json, VERIFICATION_HISTORY.json and CI_CHECK_ORDER.json. Their local clean-clone
proof remains historical; no new GitHub-hosted result is claimed. QA Revision 2 and the earlier
rejected Approval: QA are not silently promoted to approval of the newly evidenced Revision 3.

## Knowledge and Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY; CG-NATIVE-INTERACTION-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing Context Graph/SoT links still reference the same refreshed
  CD_TESTS.md and QA_REPORT.md and canonical owners. Evidence refresh requires no new node.
- memory_target: scope_artifact
- memory_reason: Retain current identities, executed results, original failure and native limits in this run.
- memory_refs: evidence/COMPATIBILITY_REFRESH_20260909.json; this report.

## Evaluated coordination

The selected canonical control evaluation reports parent_reconciliation.outcome: not_applicable.
No relationship was inferred and no parent was changed. Programme aggregation is not applicable.
Final evaluated objects and selected-run control readback are retained in the refresh evidence.

## QA approval and UAT preparation

Exact `Approval: QA` accepted on 2026-09-09T08:46:43.047Z for QA Report Revision 3 after same-run/gate/revision revalidation of revision 9 (f13a6fb9-e77b-4e5c-b55c-a88fe8280820). QA SHA-256 ffec24638b226d873563f3fb19d95e9103674e8bf273dbab1989286c09c26768; source fingerprint dc967b46e93bf214abe12d61c18101cc798e68da9faf1690166d9025b01bb734. See evidence/QA_APPROVAL_20260909.json.

The approved QA Report remains unchanged. UAT_PREPARATION.md records only pending human checks,
not a completed human review. Native capability gaps retain their existing evidence status.

Next permissible step: human UAT of the supplied report and its relevant workflow, followed by the exact UAT decision.
