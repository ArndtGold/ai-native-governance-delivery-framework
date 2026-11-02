# Clean Implementation Review: Repository-specific migration and repair

Date: 2026-09-30

## Clean Implementation Review

- decision: pass
- primary_solution: Move installer-owned compatibility/migration/repair to the shared maintenance capability and expose a dedicated direct runtime adapter; project startup facts from that same classifier. Existing canonical transaction owners remain unchanged.
- evidence: Scoped source/import inventory and extraction parity, original installer regressions, actual source/generated direct invocation and hook/consent output, 29 focused suites, deterministic regeneration and provenance guards. Count projection has one owner, no persisted compatibility cache, and the command adapter contains no eligibility/approval policy.
- fallbacks_retained: Existing EN fallback for unregistered valid language tags; honest unavailable startup plus explicit fixed manual invocation when deadline/parse/identity checks fail; thin legacy installer exports and d/details aliases preserve existing consumers. Their target is the same shared capability and their exit condition is successful canonical inspection, not installer rerun or automatic repair. OpenCode uses its adapter's explicit child cwd when stdin is ignored; other hosts retain their event-context contract.
- workaround_or_shim_risk: Thin compatibility exports preserve public imports; no duplicate repair implementation or test-only route. No new arbitrary repair source, noninteractive application API, authority cache, host configuration path inference or installation side effect.
- parallel_structure_risk: None evident. Canonical control-state owns seals, locked writes, proof and journals; shared maintenance owns inventory/orchestration/presentation. Doctor remains separate delivery readiness; its block cannot become compatibility damage.
- brownfield_fit: Reuses approved SDD-001 through SDD-007 owners and existing Context Graph nodes. Measured nine-file runtime closure is documented with the exact payload boundary; no integrity or budget guard is disabled.
- missing_evidence: T-008 installed and native Codex evidence is now present; no missing structural evidence within the approved scope.
- required_next_step: Evaluate QA using this structural pass and the completed live-host evidence.

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-NATIVE-INTERACTION-AUTHORITY; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: BROWNFIELD_ANALYSIS.md and the reviewed shared owner/import inventory.

## Installed live evidence refresh

2026-09-30: CODEX_LIVE_OBSERVATION.md identifies the exact reinstalled candidate and current refreshed model-visible context, actual installed startup hooks with unchanged real consent, and real PTY migration/repair/deferral/no-original/repeat outcomes. The source candidate has not changed. No new implementation or structural finding is evident. The subsequent NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json resolves TP-E01 through actual native fresh-session events, independently of source-review pass. Source digests remain unchanged.
