# Clean Implementation / Architecture Review

- decision: pass
- reviewer: Codex (cooperative review, same implementing assistant)
- candidate: CANDIDATE_OPERATIONAL_FINAL.json
- primary_solution: existing Core Run lifecycle, source-proof registry, locks/journal and contained file owners; CLI delegates, MCP observes
- evidence: SD.md; BROWNFIELD_ANALYSIS.md; CAPABILITY_DIFF_FINAL.patch; CURRENT_PROOF_CONSUMERS.json; CODE_REVIEW.md; FINAL_SHARED_VERIFICATION.json; PERFORMANCE.json
- fallbacks_retained: existing early no-options PRD behavior and version-1 journals; complete English pack for a well-formed unsupported locale; existing Windows directory-fsync platform treatment
- workaround_or_shim_risk: no new production retry, policy bypass, blanket repair or success default
- parallel_structure_risk: none found; Source Revisions are a sealed subordinate Run section, archives immutable subordinate evidence, not a second mutable workflow/acceptance store
- brownfield_fit: planned focused run-source-revisions/run-revision-history helpers remain under control-state; existing writers, resolver and relationship registry stay authoritative
- missing_evidence: required native Windows/Linux/Node24 CI remains missing for final QA; no source-only inference of cross-platform behavior
- required_next_step: complete Task Plan fulfillment review and hand its open required evidence to QA

The root authority problem is addressed at the shared effective-binding projection, not by hiding
old files in one surface. Historical latest records retain append-only supersedes ordering while
current bindings exclude explicitly invalidated IDs. Source renewal checks exact raw presentation
bytes and canonical approved artefact hashes separately, and archives reconstruct pinned request,
preview and original proof closure. Existing unrelated current status reads zero archived bytes.
No eager recursive history copying was introduced. One/ten-cycle diagnostics show the actual
history byte/read counts; raw prior Run snapshots grow, so this review does not claim linear total
history size or invent an extra SLA. Historical inputs retain the existing bounded 131072-byte
contained-file limit; unsupported oversized input refuses rather than being silently truncated.

Version-2 source_revision transactions reuse Run-then-Backlog locks, atomic write and the existing
pending journal. Run rename commits the authority effect. Unknown/pending state prevents ordinary
writes/readiness; explicit recovery proves old state or exact committed effect. Proven ownership
and exact bytes govern cleanup; foreign additions fail closed. Archive evidence never auto-grants
fresh approval. Recovery does not pretend an old replayed effect is the current revision.

Retained compatibility has concrete boundaries: no late QA/UAT/closed/history reopening; no old
approval transfer; no generic corruption repair; unchanged v1 journal and early PRD regression
coverage. Locale fallback is presentation only and does not create governance authority. Existing
Windows fsync behavior is preserved, but native platform qualification is explicitly outstanding.

The child-only disposable npm cache and temporary quarantine/restoration of pre-existing duplicate
compatibility outputs are isolated qualification conditions, not production architecture fallbacks.
Their exit condition is end of qualification; neither modified global cache, workspace duplicates,
verifier policy nor installed plugin cache. No installer/runtime or release version was changed.

Context Graph reconciliation is recorded in CONTEXT_GRAPH_RECONCILIATION.md. It curates the proved
Run invariant and observed limits into the existing node; it changes no source-of-truth owner.
This evidence dimension does not decide QA and carries no implementation/release approval.
