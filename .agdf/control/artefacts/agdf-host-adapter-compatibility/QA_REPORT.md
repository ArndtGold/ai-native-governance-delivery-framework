# QA Report

Run: agdf-host-adapter-compatibility
Revision: 3
Date: 2026-09-09

## QA Gate

- decision: pass
- evidence: Approved TP Revision 1; passing Brownfield basis; refreshed Code Review and Clean Review;
  TP Review 12/12 fully_done and HAC-01 through HAC-12 fulfilled. `evidence/COMPATIBILITY_REFRESH_20260909.json` records successful release
  preparation and 30 verification groups, 56 fresh common scenarios, 64 evidence checks,
  current package/runtime and community-health evidence and a passing final source-bound check.
- missing_evidence: Current native installed-root/fresh-session evidence, native Windows execution,
  model/path-specific governance/enforcement, GitHub-hosted Ubuntu rerun observation and human UAT.
  The approved deterministic/report slice permits these explicit inventory limits; no stronger claim is made.
- risks: Any later participating source, generated payload or observation change invalidates the comparison.
  The working checkout contains separately owned changes whose product delivery is not approved here.
  One initial local-install content-ID assertion mismatch did not reproduce in the complete rerun
  without source/test edits; its exact cause remains unestablished and the failed attempt is retained.
  Reviews are agent-performed, not an independent human review.
- required_next_step: Request exact Approval: QA for this run and QA Report Revision 3 before UAT.
- impact_codes: HAC-01, HAC-02, HAC-03, HAC-04, HAC-05, HAC-06, HAC-07, HAC-08, HAC-09, HAC-10, HAC-11, HAC-12

This is the qa-gate quality decision. It is neither user QA approval nor UAT acceptance.

## Refreshed evidence and decision basis

The previous comparison fingerprint `af6a4d8a0ccfb0cdd3bcd1b4ee6c5c5b6da0ab67888992414b29f90f9ea9cbb4` was stale against the current checkout.
The existing source generators and recorder produced `dc967b46e93bf214abe12d61c18101cc798e68da9faf1690166d9025b01bb734` across 110 participating
files and current generated payload identities. All four hosts have 14 executed scenarios. The 24
expected negative cases still report failed observed capabilities while passing scenario conformance.
The rendered report preserves all twelve unverified native inventory rows. All 36 historical records
and the prior accepted raw observation remain retained.

HAC-TPR-01 is resolved by fresh execution, passing evidence sensitivity tests and final source/readback
validation. HAC-CR-01 through HAC-CR-05 retain their historical routed corrections and passing relevant
regressions. No applicable normalized finding, incomplete TP task or unfulfilled UX row remains.
The current source delta was reviewed within compatibility evidence scope. New installer/MCP product
work and independent host-observation obligations remain owned by their existing runs.

## Prior decision and approval provenance

QA Revision 2 passed on 2026-09-05. Its historical execution and clean-checkout CI correction remain
in FINAL_VERIFICATION.json and CI_CHECK_ORDER.json. The newer pre-refresh comparison dated 2026-09-07
also ceased to match current sources. On 2026-09-09 the user's exact Approval: QA was not accepted
because source_snapshot_changed still held. It is not silently transferred to this newly evidenced
Revision 3. No QA or UAT approval was fabricated or inferred from the evidence-update request.

## Context Graph and SoT

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY; CG-NATIVE-INTERACTION-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing graph and SoT links still point to the same refreshed CD_TESTS.md
  and QA_REPORT.md and existing owners. No new ownership or node is required by evidence refresh.
