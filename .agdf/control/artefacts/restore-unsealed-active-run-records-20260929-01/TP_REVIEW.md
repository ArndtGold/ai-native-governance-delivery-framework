# Task Plan Review: Run-Recovery

Run: `restore-unsealed-active-run-records-20260929-01`
Decision: `revise`
Reference: approved TP revision 13.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-EVIDENCE | fully_done | Brownfield Analysis repository inventory: no local presentations, no approval presentation IDs, no sealed Run State revision among checked refs. | External host/session archives were not supplied. | Current unproven approvals are reset; no prior approval is trusted. |
| T-INSPECT | fully_done | Read-only `inspectRunRecovery` executed for all 23 named active runs; each is unsealed. The runtime listed current artefact digests and Git candidates; no candidate has both seal lines. | Four runs have unresolved listed artefacts and cannot proceed to Preview until corrected or explicitly routed. | Those four remain fail-closed. |
| T-PREVIEW | fully_done | Isolated fixture and end-to-end CLI preview tests prove source/artifact binding, exact confirmation and next-gate derivation. | No per-run preview was created for the 23 production runs; this remains a separate exact-preview/user-confirmation step. | No production run was changed. |
| T-APPROVAL | partially_done | Missing provenance causes every old approval row to be reset and the next gate to return to UR; prior rows remain in the private preview journal. | No accepted external evidence source or verifier exists for the TP's positive exact-binding case; no positive provenance fixture is implemented. | Do not preserve any old approval pending an authoritative source contract and validator. |
| T-WRITER | fully_done | Shared run lock, snapshot checks, atomic writer, revision increment and seals; standard update remains fail-closed. Recovery fixtures verify seals and reject a noncanonical candidate. | Native Linux/Windows writer behavior remains untested. | Selected fixture passes; cross-platform confidence remains open. |
| T-JOURNAL | partially_done | Exclusive preview journal; prepared/applying/committed states; exact digest binding; occupied-lock, unknown-phase, post-rename resume and repeat-apply tests. | Low-level injected I/O failures before/after journal writes and before atomic rename were not exercised. | QA must keep transaction interruption evidence open. |
| T-CLI | fully_done | CLI integration tests execute inspect, preview and apply using exact returned confirmation; bad confirmation and preview tampering block. | No host UI or MCP path is in scope. | CLI behavior is locally verified. |
| T-VERIFY | partially_done | macOS targeted regressions, package build, payload budget, selected-run Doctor/Gate-check and Delivery Map pass. All-active Doctor remains 86 findings (23 block, 1 revise, 62 warn). | Linux and native Windows suites were not run; local Docker daemon was unavailable. | Do not claim cross-platform pass or all-active recovery. |
| T-ISOLATION | fully_done | Isolated two-run fixture confirms non-selected Run State bytes remain identical. No production run was applied. | No full 23-run apply batch was performed, as required. | Isolation is proven for the fixture only. |

## Summary

- fully_done: T-EVIDENCE, T-INSPECT, T-PREVIEW, T-WRITER, T-CLI, T-ISOLATION
- partially_done: T-APPROVAL, T-JOURNAL, T-VERIFY
- not_done: none
- out_of_scope_changes: none in the approved recovery implementation; public plugin payload budget was raised only for the required offline CLI runtime.
- risks: the 23 prior approvals have no accepted external provenance; four artefact lists need repair; Linux/Windows and low-level transaction fault injection remain unverified.
- required_next_step: resolve the authoritative external approval-evidence contract and complete the missing platform/fault-injection evidence before asking QA to decide.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-APPROVAL-SOURCE | design_gap | SD | open | Brownfield Analysis records no external archive; implementation safely resets all but has no source-specific verifier for independently authenticated positive matches. | Define the authoritative evidence source and exact trust binding before implementing approval preservation. |
| TPR-TRANSACTION-FAULTS | evidence_gap | evidence_obligation | open | Recovery tests cover lock refusal, unknown phase and post-rename resume, but not injected filesystem failure before rename. | Add and run fault-injection cases for each journal/write boundary, proving no duplicate revision and unchanged non-selected bytes. |
| TPR-PLATFORM | evidence_gap | evidence_obligation | open | macOS tests passed; Linux and native Windows were not run because Docker was unavailable and no Windows host was present. | Run the approved recovery suites on Linux and native Windows and attach their results. |
