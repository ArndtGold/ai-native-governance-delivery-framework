# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-intermediate-status-card-reduction-20261002-01
- lifecycle: active
- revision: 17
- revision_id: d68f6c55-70d7-41ec-9f76-920948d100cd
- content_seal: sha256:bad7c19464c6c170ec11171e4a8695efe3b6c4618878130bbc6a4d3f72fe2a10
- approval_seal: sha256:d7cd16fea822b45440c914db298bc9a56cd0f329ef24e0e6b26e5f769daca804
- updated_at: 2026-10-03T12:48:26.609Z
- mode: structured_delivery
- current_gate: CD+Tests
- decision: in_progress
- owner: agent

## Objective

SYNTHETIC NON-AUTHORIZING fixture: already permitted W-01 source inspection, required validation and evidence maintenance, with unchanged binding/scope and no new event.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | TP approved; implementation-preparation Brownfield Analysis completed; production edits still depend on positive T-001 baseline. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR. |
| What is explicitly forbidden right now? | production edits before TP T-001 baseline; claim QA pass; request UAT approval; release |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-02 · revision 3 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` sha256:6a8256dc7008418a · presentation 64424942-d080-486f-a42f-63916aaaa071 sha256:86b144d38e2a3947af97db9192086eb17181b2d0c752a2d08289ec4f592aeab3 |
| PRD | approved | `Approval: PRD` · 2026-10-02 · revision 10 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/PRD.md` sha256:7fb12689ba373280 · presentation 8565db75-00f0-4cb0-b7e6-7341c237d66e sha256:9a242c49a41ab1d771944e6258569f049a65887389ca5ca4fd692d03ff8b2733 |
| SD | approved | `Approval: SD` · 2026-10-03 · revision 13 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/SD.md` sha256:8cf5bba39274d39a · presentation faced45f-3855-4f23-9370-c9197e1a9a80 sha256:e6e7605b5736a02ca42c8b3a8c77cbd4419b5c50f1401cf432488022340b50fa |
| TP | approved | `Approval: TP` · 2026-10-03 · revision 15 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP.md` sha256:14ee4988b4e42ab4 · presentation f23c19e0-bbf8-4f3a-a185-520a357effd8 sha256:d9d13607bda246cc8620ec5abc2728d9574c7cd6208b0cc774cb0ebece704b63 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/PRD.md` | approved | Derived from approved UR and completed Brownfield/UX analysis; criteria-chain-v1 |
| SD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/SD.md` | approved | Derived from approved PRD Revision 2; criteria-chain-v1; SDD-001 through SDD-006 |
| TP | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP.md` | approved | criteria-chain-v1; T-001 through T-006 and SCN-001 through SCN-025; baseline prerequisite before production edits |
| Brownfield Analysis | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_ANALYSIS.md | done | pre_implementation_analysis; reuse/owners/regression path verified; TP T-001 positive baseline remains required before production edits |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: normative interaction/output policy changes; structured_slice rejected because the full-depth policy trigger applies; Quick Task and Verified Change ineligible
- evidence: .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-02 · revision 3 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` sha256:6a8256dc7008418a · presentation 64424942-d080-486f-a42f-63916aaaa071 sha256:86b144d38e2a3947af97db9192086eb17181b2d0c752a2d08289ec4f592aeab3 |
| PRD | derived_from | UR | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/RELATIONSHIP_EVIDENCE.md`: exact current source/destination digests, preparation binding and reviewed intent mapping; Revision 2 remains draft |
| SD | derived_from | PRD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/SD.md` sections 2–7 map every approved PRD criterion exactly once to owners and SDD decisions; source PRD Revision 2 sha256:7fb12689ba373280448c5826458e12d0d967d7eeb98fb4a4cfd595ac0c76d3d0; this design remains draft |
| TP | derived_from | SD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP.md` Task List and Verification Traceability map all nine PRD criteria and six approved SD decisions to tasks/scenarios/evidence; source SD sha256:8cf5bba39274d39a833d3676e3317eea223ac44b1c4d3602c84a44fd0d4e506a; plan remains draft |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Superseded PRD approval | `Approval: PRD` · 2026-10-02 · revision 7 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/PRD.md` sha256:fb805a3915959337 · presentation 35bf6abf-9bc7-4d21-9fcf-ff9d9d376b42 sha256:ac49ed802493ad81b17e861e3f46486c5ceaa1a17cd7280d74f5ab3b06571217 | Prior PRD revision only; renewed Approval: PRD required | direct |
| Implementation-preparation Brownfield Analysis | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_ANALYSIS.md | Existing owners, reuse, compatibility and regression/test path; baseline prerequisite retained | direct |

## Closeout

- next_allowed_action: Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.
- quality_outlook:
