# Code Review preparation

Run: core-mcp-flow-coherence-20261010-01
Revision: 2b1b6d04-eceb-4a7e-bc56-e92344b934ae
Status: review preparation during CD+Tests; not canonically registered, no QA readiness or human approval.

## Code Review

- decision: revise
- reviewed_scope: actual Core evaluation/command/approval/recording/revision/history/transaction/owned-output/session/qualification paths; affected CLI group parsing/command-file handling; MCP main/server/worker/capability/resource diff; DecisionEntry/bootstrap/card and shared evidence projection. Baseline identity distinguishes prior authorized early-UR changes from this implementation. This report does not claim every remaining test/document diff was exhaustively reviewed.
- findings: canonical completed/unconfirmed policy introduced operational values absent from German locale projection. A real CLI regression reproduced dispatch_control_presentation_failed. Existing English/German locale owner now supplies all eight strings; canonical policy is unchanged. Both registered languages render the completion/recovery controls; full CLI gate scenarios and Inspect passed in COMPLETION_LOCALIZATION_VERIFICATION_02.json. Initial failing logs remain retained.
- missing_evidence: complete remaining diff/test assertion mapping and final candidate native qualification; no final CR pass from the green build.
- risks: supported disposal succeeds in an awaited bridge, while this Codex Host aborts the App MCP delivery before acknowledgement. Native idle expiry is being measured independently. Production App actions stay unqualified. New copy changes build identity; old native evidence cannot qualify the whole final candidate.
- required_next_step: finish the explicit evidence/diff coverage obligations, then canonically record a fresh CR in eligible order.

## Resolved implementation finding

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QAC-COPY-01 | implementation_gap | CD+Tests | resolved | REVIEW_COMPATIBILITY_RECHECK_02.log; canonical completed policy; COMPLETION_LOCALIZATION_VERIFICATION_02.json | Retain final source/build binding and affected generated-package regression results. |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QAC-NATIVE-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-039/040/042; NATIVE_OBSERVATION.md | Collect actual human all-gate and registered-locale card/document/keyboard/layout observations against the exact final loaded candidate; do not transfer synthetic clicks or older stability statements. |
| QAC-PERMISSION-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-041; production qualification stays false | Observe supported native consent deny/retry/remembered cases; tool consent must remain separate from the deliberate gate decision. Unsupported mediation stays unqualified. |
| QAC-BENEFIT-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-044; BEFORE_STATE_CORPUS.json | Complete the fixed before/after workflow corpus and comparable counters. Do not claim weaker-model improvement without an actual controlled model comparison. |
| QAC-CANDIDATE-01 | evidence_gap | evidence_obligation | open | QA_CONTINUATION_SOURCE_DELTA_01.json; completion-copy build/tests | Rebind the final exact rebuilt source/package/resource to native observations; the older loaded candidate remains evidence only for its unchanged scoped expiry behavior. |
| QAC-REVIEW-01 | evidence_gap | evidence_obligation | open | CD+Tests not done; internalStepEligibility; TP T-012 | Complete required implementation evidence, then canonically record fulfilled CD+Tests and refreshed TP/Clean/CR in eligible order. No manufactured pass to unlock reviews. |
