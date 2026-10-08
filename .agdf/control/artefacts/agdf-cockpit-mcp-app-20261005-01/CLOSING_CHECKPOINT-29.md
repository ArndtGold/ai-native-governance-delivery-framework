# Owned rollback, navigation fix and closing review checkpoint

Run: agdf-cockpit-mcp-app-20261005-01
Reviewed revision: 109 / 043bf9c7-f24c-4830-92a0-2905277dd029
Date: 2026-10-07
Reviewer: Codex implementing agent (cooperative; no independent reviewer claim)
Authorizes: false

Status: revise for the remaining native reconnection evidence. CD+Tests is not complete; QA/UAT/OR are not granted.

## Completed owned lifecycle operation

The configuration was stable and exclusively contained the exact 500-byte named project registration, SHA-256 9a0a10a5ff4eb139d05946ec610ae7432bf595bfca469ad8a07ad6bd0f4401a9. Exact process inspection found no running named server. Package ownership, version, server/dispatcher/SDK digests and zero managed references were checked before mutation. The existing retirement transaction removed the owned runtime after guarded removal of only that registration. Its rollback restored all 1449 files, modes and symlinks and the exact configuration bytes. No foreign configuration, global/plugin state or unknown process was changed.

The operation was performed first on the starting tuple and again on the final rebuilt tuple. Both passed. Scripts, results and hashes are retained in closing-evidence-29. This proves actual removal and restoration; it does not prove native host reconnection.

## Concrete defect and durable repair

A browser Run selection overlapped a visible linked-UR title request. Title reading had already replaced the server capture, while the response had not reached the app. Cancelling the response cannot undo that server commit. Navigation nevertheless sent the old snapshot selector and received resource_denied.

App.tsx now notices the pending title transition before aborting it and captures the deliberately selected Run afresh by its explicit run_id. Existing target checks, replacement validation, cancellation and generation guards remain authoritative. No read limit or discovery scope was widened, and no retry, control write or publication was added.

The corrected SCN-092 UI regression fails without this production change and passes with it; the full UI suite passes 114/114 in ten files with no skips. The real HTTP browser test holds the title response after the production server commits its replacement, selects the Run, then checks the named request, document scope and returned source focus. It passes in light/dark at 320, 560, 800 and 1280 pixels and preserves fixture control bytes.

## Renewed checks and honest failure accounting

- TypeScript and both browser/MCP builds pass. The prepared runtime uses the resulting packaged HTML, not an edited compiled file.
- Both full and scoped Cockpit stdio tests pass separately for 2025-11-25 and 2026-07-28 on the final tuple. The default server language-matrix protocol test also passes.
- All six HTTP service cases pass outside the sandbox. The original sandbox attempt passed the non-listening case and denied five local socket binds with EPERM before their service checks; that failed attempt is retained.
- The full fixed browser run passed fourteen journeys and failed the copied-source journey. A width observer established that Chromium full-page screenshot capture temporarily changed the viewport from 1280 to one pixel. The app correctly enforced the approved narrow summary rule. That journey now records the visible wide viewport and additionally asserts that Details remains selected; all original navigation, keyboard, passive-source, storage and no-write checks remain. Its isolated final rerun passes. Fifteen journeys are qualified from fourteen unchanged passes plus that corrected rerun, not a single final fifteen-pass run.
- Browser and native evidence remain distinct. Screenshots for light/dark at 800 pixels were visually inspected; no overlap or inconsistent source identity was observed.

## Final prepared tuple and retained native evidence

| Component | SHA-256 |
|---|---|
| Server package | 713ba212c8e63e54c8cab6287d8d310a38ba439393b40334742b7fe41d04d1f0 |
| Dispatcher package | 8366988e6bc057a8ce67fc533dc51c030c3dfb0ae9446280801921595c65c15c |
| SDK closure | 02e7212cc00a844c08ac190c572b98dd9aa52671936cb4900808460d44c543d9 |
| Packaged HTML (1046118 bytes) | 04591c9ade70eb28a8c204f255ec0f4dd8b5665f92b22164a5a66857695de815 |
| Embedded module | e2e55196492c73c1412be00eb190cf66234c76ae7d034eff7154fa2b9b999a1e |
| Embedded style | 07acb2ca2db3798a00b2b16cefea06f11319e986e3ed3b5cd46bc5099e41b479 |

HOST_SESSION_HANDOFF-27.md and MODEL_RECEIPT-28.json remain actual historical two-view and model-receipt evidence on their recorded tuple. Neither is relabelled as a native observation of this new module. A final opening request with run_id=agdf-cockpit-mcp-app-20261005-01 returned Transport closed. No additional question was sent or accepted question replayed. The host must reopen the connection before loaded identity and recovery can be observed.

The approved UR/PRD/SD/TP and protected lifecycle diagram remain byte-identical. CODE_REVIEW-29.md and CLEAN_IMPLEMENTATION_REVIEW-29.md pass their scoped evidence dimensions; TASK_PLAN_REVIEW-29.md retains incomplete T-012 and native recovery. Documentation and the existing Context Graph node are updated without granting permission. No commit, push, PR or release occurred.

The canonical review writer recorded the scoped Code Review pass at revision 110 / 3500d1fc-ba89-4a58-84a6-c352e02da93f; Backlog was unchanged. Fresh bound gate-check returned open CD+Tests with no missing upstream approval, requiring completion of approved evidence before CR/QA. It did not mark delivery complete. REVIEW_CHECKPOINT-29.json retains the receipt and resulting route.

## Knowledge reconciliation

- memory_target: context_graph
- memory_reason: Reusable capture-cancellation and owned lifecycle facts belong with the existing MCP boundary; run-specific logs remain scope artifacts.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter; docs/architecture/06-agdf-cockpit.md; closing-evidence-29/verification.json
- context_graph_impact: update_existing_node
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: Current verified removal/restoration and navigation knowledge are curated in checkpoint 29 of the existing node. Final loaded-host recovery is still missing and must update that same dated knowledge before clean closeout; no new knowledge authority is introduced.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR29-TITLE-NAVIGATION | implementation_gap | CD+Tests | resolved | App.tsx; controlled red/green regression; real HTTP committed-title barrier | None for this repaired defect |
| CR28-SCOPE | evidence_gap | evidence_obligation | resolved | Actual Cockpit diff and neighbours reviewed; CODE_REVIEW-29.md and final tuple qualification | None for the scoped code review |
| R28-ROLLBACK | evidence_gap | evidence_obligation | open | Both actual owned rollback/restoration operations pass; current named native opening still returns Transport closed | Reopen Codex connection and verify loaded final tuple, exact Run and recovery without replaying accepted questions |
