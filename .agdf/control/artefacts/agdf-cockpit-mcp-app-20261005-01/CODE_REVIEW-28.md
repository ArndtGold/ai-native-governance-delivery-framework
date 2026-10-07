# Code Review

Run: agdf-cockpit-mcp-app-20261005-01
Reviewed revision: 108 / 03c983b4-1e44-4aeb-8e5d-40d5ec36dcc2
Date: 2026-10-07
Reviewer: Codex implementing agent (cooperative; no independent reviewer claim)
Authorizes: false

- decision: revise
- findings: No concrete functional/security/data-integrity defect established in the reviewed Cockpit read/title/session/DTO/navigation/publication paths. This is a bounded finding, not a completed whole-Run CR.
- review_scope: Actual baseline delta at 31cb3af126d224a6e3dd356d7e796d610e5b9fe1 to current HEAD 5444aab1a5567d77cc13bfe11df11f596e642703 plus current dirty Cockpit paths. Reviewed capture/replay/containment, session/worker retirement, title extraction/provenance/cache/lazy loading, HTTP selectors, strict DTO parent identities, reducer/navigation freshness, immutable receiving-session transports, passive document/status presentation and publication/question/invalidation controller. Reviewed changed source and affected neighbours, not build success alone.
- checks: Foreign selectors rejected before capture replacement; failed candidate discards scope; descriptor/ancestor revalidation rejects drift; bounded metadata cache contains no original body; callback loader catches errors and generation guards reject route changes; owner reservation precedes async prepare; nonowner never writes host context; host-acknowledged release precedes matched completion; uncertainty never automatically resends a question. Production resource verifies packaged digest and self-contained CSP. Existing limit/selector/race/ownership tests and actual two-view observations support these checks.
- missing_evidence: Entire final review scope cannot be declared closed from targeted inspection and historical qualifications; final owned rollback/reconnect remains unverified after native transport closure. Broad canonical status-writer changes in baseline delta are separately owned work, not silently claimed as reviewed Run implementation.
- risks: External setup/config changes interrupt reproducible current lifecycle qualification; no unknown process is terminated and no shared registration is overwritten. Old native/model records remain historical on their recorded tuple.
- required_next_step: Complete owned rollback/reconnection, then finish and record final CR for the resulting unchanged-or-reviewed source tuple.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| R28-ROLLBACK | evidence_gap | evidence_obligation | open | SCN-031 / T-012; Transport closed; named process absent; config changed externally; retirement guard aborted before mutation | Complete one exclusive owned removal/restoration and fresh native reconnect verification |
| CR28-SCOPE | evidence_gap | evidence_obligation | open | Targeted current diff inspection plus 26/27 retained proofs; full final review remains incomplete | Finish the actual remaining Run diff review before recording CR pass |
