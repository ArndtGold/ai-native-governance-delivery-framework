# QA Report

Run: agdf-host-adapter-compatibility
Revision: 2
Date: 2026-09-05

## QA Gate

- decision: pass
- evidence: Approved TP Revision 1; passing pre-implementation Brownfield Analysis; Code Review pass,
  Clean Review pass, TP Review 12/12 fully_done and all HAC-01–HAC-12 UX/AC rows fulfilled;
  CD_TESTS.md and evidence/FINAL_VERIFICATION.json with 31 successful final command groups,
  56 actual common scenarios, 64 evidence checks, runtime/package and documentation/site proof.
- missing_evidence: Current native installed-root/fresh-session evidence, native Windows execution,
  model/path-specific governance/enforcement and human UAT. No such support claim is made. These
  remain explicit inventory gaps allowed by the approved deterministic/report slice.
- risks: Exact host/version/OS behavior can drift. A source or evidence change requires the comparison
  to be re-recorded after verification; check mode rejects stale state. Review is agent-performed,
  not an independent second human review. Generated-output/local-build proof is not deployed UI proof.
- required_next_step: Request exact Approval: QA for this run and revision before UAT preparation.
- impact_codes: HAC-01, HAC-02, HAC-03, HAC-04, HAC-05, HAC-06, HAC-07, HAC-08, HAC-09, HAC-10, HAC-11, HAC-12

This is the qa-gate quality decision, not user Approval: QA, UAT acceptance or release authorization.
All five normalized Code Review findings are resolved with concrete correction and executed evidence.
No applicable open/invalid normalized finding, partial TP task or unfulfilled UX criterion remains.
Baseline failures, corrections and rerun results are retained in evidence/VERIFICATION_HISTORY.json;
redundant raw logs were removed at the user's request. Final success never erases failed observations
or baseline limitations. Native capabilities stay unverified in the actual generated comparison.

Revision 2 includes the CI prerequisite correction under HAC-CR-05. The reported clean-checkout
failure was reproduced before repair. Release preparation, runtime integrity, both community-health
commands and CLI smoke now pass in an initially ungenerated local clone; both reversed-order
mutations are rejected. Code Review, Clean Review and TP Review pass on the actual correction.
`evidence/CI_CHECK_ORDER.json` records the bounded evidence. QA decision remains pass for the
repository correction. An actual GitHub-hosted Ubuntu rerun remains unobserved and is not claimed
as passing. Human QA and UAT approvals remain missing.

## Context Graph and SoT

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY; CG-NATIVE-INTERACTION-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing CLI node links CD_TESTS.md/QA_REPORT.md and the native owner;
  SOT_REGISTRY.md preserves existing authority and classifies the report as a secondary reference.

No unrelated run, host installation, cache, general permission, version, tag or deployed website was
changed. The untracked asset present at baseline is excluded from this run.

## Final control validation

The installed version-matched AGDF 0.14.5 validator confirms QA as the current gate with zero selected-run findings. All-active findings are identical to the prior baseline: 55 warnings, one unrelated revise finding and no blockers. The read-only compatibility check and diff check pass after report/control updates. Evidence: evidence/CONTROL_VALIDATION.json; evidence/FINAL_VERIFICATION.json. These compact records replace redundant full CLI exports and console logs after user-authorized cleanup.
