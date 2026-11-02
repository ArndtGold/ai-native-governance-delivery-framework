# Clean Implementation Review

Run: agdf-host-adapter-compatibility
Revision: 3
Date: 2026-09-09

- decision: pass
- primary_solution: One private native owner per host mechanism, shared policy and transactions in
  existing facades/services, one repository-only evidence contract/evaluator and shared scenario suite.
- evidence: Actual owner/caller diff; BROWNFIELD_ANALYSIS.md; CD_TESTS.md; 23 focused regression/package
  groups; common 56 scenarios; 64 evidence tests including executed host-local mutation isolation.
- fallbacks_retained: Existing Codex legacy registration restoration, Claude bounded cache retry,
  Copilot packaged CLI/manual handoff and prior state restoration, OpenCode explicit retry, and legacy
  unknown-surface facade behavior. These remain compatibility requirements, not new parallel policy.
- workaround_or_shim_risk: Thin old exports preserve existing consumers; native bodies have a single
  owner. Five runtime command files are the explicit approved package closure. The pinned development
  parser avoids a fragile text-based import approximation; no runtime parser dependency was added.
- parallel_structure_risk: No second target resolver, gate engine, consent store, lifecycle transaction,
  runtime status renderer or persistent capability authority. The dated report is derived evidence.
- brownfield_fit: Existing transaction, CLI, consent, package generator, handbook and website owners
  are reused. OpenCode's established installer remains its owner. No plugin/cache source is edited.
- missing_evidence: Native host and human-UAT evidence remain separate inventory gaps, visibly unverified.
- required_next_step: Consume solution-integrity evidence in qa-gate.

Retained fallback rationale and exit: preserve approved public behavior while host APIs differ.
Cleanup belongs to a separately approved native compatibility change only after the relevant host,
version, OS and failure/recovery proof establishes a replacement. No unbounded retry or new general
permission grant was introduced. Reporter failure guards protect evidence integrity and exact owned
output; they do not create a weaker alternate successful result.

CI follow-up: pass. The existing workflow now produces required assets before consuming them.
This reuses the single release preparation and existing smoke-test owner. No runtime fallback,
missing-file skip, automatic evidence refresh or additional build path was introduced. The clean
clone and two order-reversal probes are recorded in `evidence/CI_CHECK_ORDER.json`; an actual
GitHub-hosted rerun remains unobserved.


## Evidence refresh scope (2026-09-09)

This review covers the current compatibility evidence under approved TP Revision 1.
`evidence/COMPATIBILITY_REFRESH_20260909.json` binds 56 fresh scenarios, 64 evidence checks and current regression results to
source `dc967b46e93bf214abe12d61c18101cc798e68da9faf1690166d9025b01bb734`. The 16-file dependency delta was inspected, and the generated report retains
its outcome semantics and native gaps. Separately owned checkout changes remain outside this run's
implementation authority. Previous implementation/CI reviews below are retained historical evidence.

## Refresh integrity outcome

- decision: pass
- primary_solution: Reuse the existing release preparation, common production-fixture runner and
  atomic source-bound recorder to replace stale evidence with newly executed observations.
- fallbacks_retained: Existing recovery paths and their documented exit conditions remain unchanged.
- workaround_or_shim_risk: None introduced. No new reporter, parallel grading, manual digest patch or
  automatic read-only-check repair was added.
- parallel_structure_risk: None introduced; canonical control remains separate from derived evidence.
- brownfield_fit: Existing approved ownership is preserved.
- required_next_step: Consume refreshed evidence in qa-gate.
