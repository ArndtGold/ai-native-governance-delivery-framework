# Code Review: scoped canonical archive correction
- decision: pass

Reviewed the added limit classification/private bounded reader, selected-Run collection condition, exact archive-row/snapshot verification and both new tests. Bounded reads check stat size before allocation. Archive snapshots still require contained paths, canonical source identity, declared length and matching raw/canonical digests; altered snapshots fail. Only the exact receipt Run state receives the control ceiling; source/proposal/report inputs, foreign rows and manifest remain 128 KiB. No historical receipt/source is rewritten, original eligibility/policy and seals remain enforced. Positive long-Run and existing phase/recovery/legacy tests pass. Previous broader CR is preserved separately; no independent model/native qualification is claimed.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TP46-REVISION-ARCHIVE-SIZE | implementation_gap | CD+Tests | resolved | VERIFICATION.json and exact long-Run preview/apply/archive/replay and negative bounds; existing phase/recovery tests | Preserve correction and obtain renewed source decisions for the proposed QA acceptance rule. |
