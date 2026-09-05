# Clean Implementation Review: AGDF Request Activation Boundary

Status: pass
Decision: pass
Revision: 5
Date: 2026-09-05
Run: `agdf-request-activation-boundary`
Based on: approved SD Revision 5, TP Revision 3 and final implementation diff

## Clean Implementation Review

- decision: `pass`
- primary_solution: The Request Activation correction is structurally clean. One 1,092-byte
  host-neutral kernel decides applicability before existing operational owners. Detailed routing,
  gate, quality and closeout instructions load only after positive activation. No second hook,
  classifier, dispatcher version, raw-prompt transport or host-specific policy was added.
- evidence: One canonical kernel fingerprint is projected to the router and ten skills; compact
  discovery totals 2,512 bytes; SessionStart and OpenCode surfaces remain within their definition-owned
  budgets; deterministic composition, Runtime Integrity, package build and the isolated full smoke pass.
  The post-activation route points to the separately packaged canonical operation catalog.
- fallbacks_retained: The marker-bounded kernel in each selected skill remains a justified direct- or
  automatic-selection safeguard until all four loaded hosts prove common eager-kernel availability.
  OpenCode retains one kernel-only compaction block until same-version and same-digest probes prove
  system-transform reapplication and binding availability. Both fallbacks have bounded owners,
  budgets and explicit evidence-based exit criteria.
- workaround_or_shim_risk: The activation solution contains no avoidable shim or symptom-masking
  path. The canonical-init retry defect found during review was corrected in its existing owner with
  strict valid-run preservation and drift checks; no permissive `runs/**` bypass was introduced.
- parallel_structure_risk: No parallel activation owner exists. Canonical source, mechanical
  projections, dynamic facts and on-demand catalog have distinct, tested responsibilities.
- brownfield_fit: Existing contract, router, skill, SessionStart, OpenCode, package and integrity
  owners are reused. Dispatcher v1, the shared Claude live-agent adapter, hook inventories and
  OpenCode permissions remain protected and unchanged.
- missing_evidence: Four required external model-backed composed-profile executions and exact
  install/readback/restart/fresh-session observations for four hosts are unavailable.
- required_next_step: Preserve the clean two-stage owners, obtain separate authorization for
  external model-profile transfer and each host lifecycle change, then complete both evidence
  obligations before QA can pass.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| `RAB-CIR-02` | emergent_risk | SD | resolved | Approved SD Revision 5 replaced full eager routing and repeated policy channels with the implemented two-stage model and explicit budgets. | Preserve the canonical owners and evidence-based fallback exit criteria. |
| `RAB-CR-01` | implementation_gap | CD+Tests | resolved | Valid canonical runs are strictly parsed and snapshot-bound across retry/repair; invalid, extra, empty, mismatched, Symlink, Hardlink and concurrent-drift cases fail; focused and full smoke pass. | none |
