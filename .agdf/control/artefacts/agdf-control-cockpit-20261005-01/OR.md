# OR: Local read-only AGDF control cockpit

Report mode: OR-full
Run: `agdf-control-cockpit-20261005-01`
Date: 2026-10-05
Gate: OR
Status: pass
Closeout input revision: `6b3b9137-7424-492c-b9bd-d0147e7b6e8f` (revision 20)
Scope: approved local source/package/browser delivery

## Delivered outcome

The private React package `packages/control-ui/` provides a German local read-only overview, selected-run detail and registered source-document view for the explicitly selected repository. Existing Core evaluators remain the sole authority for readiness, approvals, provenance and gate rules. The immutable control capture, scoped native-compatible read seam and Core projection retain original target identity and approval evidence.

The loopback service mediates bounded authenticated GET requests and serves captured static assets. It checks session, Host, Origin, method and resource selectors, applies a restrictive content policy, and gives the browser no control writer, approval, dispatch or Git capability. Snapshot identity represents an observation, never a run revision or authorization. Passive document rendering, keyboard journeys, focus restoration, unavailable sources, stale-data retention, deliberate refresh, retry and removed selection are implemented and visibly verified.

## Approval and quality evidence

The sealed RUN_STATE.md Approvals table is authoritative. UR, PRD, SD, TP, QA and UAT are deliberately approved. No approval is pending.

- QA decision: pass, owned solely by qa-gate in [QA_REPORT.md](QA_REPORT.md). Its original approval-open wording is historical; subsequent approval is recorded in the canonical run, without editing the approved report.
- Human QA approval: `Approval: QA`, presented revision 18, presentation `ea5d66f6-ac83-476c-af6e-acb20f2f6b35`.
- Human UAT approval: `Approval: UAT`, presented revision 19 (`3dafb789-ddaf-4dbb-9dcf-312f7884ce01`), presentation `090588e6-02ce-4dcb-8661-bf29251b1d82`; recorded as revision 20. It accepts the delivered browser scope and does not add chat embedding or authorize publication.
- [TP_REVIEW.md](TP_REVIEW.md): all ten approved TP tasks, 32 stable scenarios and eleven applicable UX fidelity rows fulfilled.
- [CLEAN_IMPLEMENTATION_REVIEW.md](CLEAN_IMPLEMENTATION_REVIEW.md): pass; single Core authority, bounded read consumer and no parallel policy/storage owner.
- [CR.md](CR.md): pass; four implementation findings resolved, no open applicable gap. Reviews and QA were performed by the implementing Codex agent; independent review is not claimed.

## Verification

[CD_TESTS.md](CD_TESTS.md), [QA_REPORT.md](QA_REPORT.md) and their [durable evidence](EVIDENCE/) record 26 passing new tests: four snapshot, two provider, four projection, five HTTP/worker, eight UI and three actual Chromium journeys. Ten affected existing suites pass: control-state, control-command, control-inspect, verified-change, interaction-presentation, plugin-mcp-runtime, runtime-integrity-layout, runtime-integrity-negative, payload-budget and package-contents. Clean lockfile installation with scripts disabled, synchronization, typecheck, build, exact payload inventory and diff checks passed.

Real browser journeys verify pointer/keyboard overview-detail-document-return behavior, focus, original documents, passive hostile content, no external requests/storage, German unavailable states, stale detection and explicit reload/retry. Real read windows preserved complete control membership and file bytes/digests. Deliberate mutation cases used temporary fixtures; evidence was persisted after those service windows closed. Approval/OR recording in this lifecycle legitimately changes control data and is not a browser-write claim.

The dated integration observation covered 111 runs, 2739 files and 48,417,688 captured bytes, with approximately 4.9 seconds for capture/projection/related read on this host under parallel validation. It is not a performance promise. Capture capacity boundaries used parameterized arithmetic; the actual 2 MiB preview and 8 MiB response boundaries were also tested. Public package/profile checks exclude the private UI dependencies and assets.

## Brownfield fit, documentation and durable knowledge

[BROWNFIELD_ANALYSIS.md](BROWNFIELD_ANALYSIS.md) and the reviews establish reuse of existing Core owners, native live CLI/MCP defaults and the pre-existing dirty-workspace boundary. Unrelated language/config changes remain outside this delivery; this report does not attribute the complete workspace diff to this run.

Local reproduction, build/start/stop and limits are documented in [packages/control-ui/README.md](../../../../packages/control-ui/README.md). [CONTEXT_RECONCILIATION.md](CONTEXT_RECONCILIATION.md) records the completed update to the existing control-state node and physical ownership registry. No external Codex memory folder was changed.

- memory_target: context_graph
- memory_reason: Reuse evidenced source/snapshot/authority separation and prevent a browser projection becoming parallel authority.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/SOT_REGISTRY.md#Physical-Package-Ownership; packages/control-ui/README.md
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: CONTEXT_RECONCILIATION.md; CD_TESTS.md; EVIDENCE/real-approved-run-parity.json; EVIDENCE/playwright-results.json

## Evaluated coordination

Canonical Delivery Map at the closeout input revision reports parent_reconciliation: outcome `not_applicable`, target_run_id empty, disposition `not_applicable`, evidence empty, missing_evidence `none`, next_action `none`. No Parent relationship is inferred and no other run is mutated. Programme aggregation is not applicable.

## Intentionally not delivered and evidence limits

Direct interactive embedding in the Codex chat, an MCP App UI, a public installable UI package, host installation, cross-OS qualification, deployment, release and measured user time savings are outside this approved browser scope. No commit, push, PR or publication was performed. UAT contains the exact deliberate user approval; there is no separate user-session telemetry or independent human-identity proof.

Missing evidence: none required for the approved local source/package/browser scope. Cross-platform/installed-host behavior, full-capacity stress results, chat embedding and quantified productivity remain unclaimed.

Risks: external writers are not locked by observational capture; changes are revalidated and become stale/unavailable. Two existing runs (`agdf-chat-noise-suppression`, `agdf-surface-parity-fix`) contain out-of-control source references and remain explicitly unavailable. Their repair belongs to their owning scopes; this delivery does not widen the read boundary.

Retained fallbacks: no new live filesystem or authority fallback. Ordinary CLI/MCP reads retain their native defaults by design. On failed refresh the browser retains clearly stale prior data; the exit is a successful deliberate reload/retry, or an explicit unavailable result if a resource is removed. No deferred implementation cleanup is accepted in this scope.

## Dispatcher recovery

After successful UAT approval, the agent incorrectly supplied `continue_delivery: true` to the judgement skill `release-or`. The dispatcher rejected that input before resolving a target or changing control state. The corrected release-or dispatch omits that field, resolves this same run/revision, confirms no missing approval or blocker, and instructs that `continue_delivery` is used only when redispatching gate-check. No framework code or runtime contract was changed for this caller error; UAT was neither repeated nor inferred.

## Final handoff

- decision: pass
- gate: OR
- delivered: approved local read-only browser cockpit and its test/review/documentation evidence
- missing_approval: none
- missing_evidence: none for approved scope
- required_next_step: Use the accepted local browser cockpit with deliberate reload after source changes.
- quality_outlook: No additional quality follow-up is required within this approved scope.
- delivery_closeout: Useful only when an operative commit/PR handoff is separately requested; no VCS action is automatic.

The local delivery is complete with QA and UAT recorded. Commit, push, PR, host installation, release and any new chat-embedding scope require the corresponding explicit instruction.
