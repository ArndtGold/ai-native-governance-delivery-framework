# Clean Implementation Review: MCP error contract Phase 1

Decision: pass
Date: 2026-10-19
Owner: Codex
Run: mcp-error-contract-phase1-20261019-01

- decision: pass
- primary_solution: One pure operation-aware Core projection describes existing domain outcomes. Existing runtime producers, adapter delivery, generation lifecycle, locale registry and UI consumers each retain their own bounded responsibility. No second approval, effect, recovery, acceptance or policy owner is introduced.
- evidence: Actual reviewed implementation diff and source-final.json; current CD/CR reports; all 28 scenario mappings; actual SDK/stdio/archives/generations/commands and visible browser evidence; two unchanged final performance passes.
- workaround_or_shim_risk: No production workaround is retained. SDK initialization delegates to its existing public validator provider; the modern fault fixture uses the public STDIO entry rather than private SDK negotiation hooks. npm archive-report shape handling and adjacent browser teardown ordering repair their own test boundaries.
- parallel_structure_risk: No parallel durable source of truth. The private descriptor carries transport facts and grants no authority. Evidence manifests are observations. CD_TESTS.md remains canonical; CD_TESTS-02.md is the identical reviewed recording input, with publication clarified by the registered provenance note.
- brownfield_fit: Reuses Core domain/receipt/recovery, locale, worker, generation, UI and existing npm/CI owners. The source-assessed latency repair removes duplicate validation and eager unused schema work without changing policy, schemas, worker lifecycle, timeouts or approval authority.
- missing_evidence: None for structural integrity in the approved local qualification scope. Native host/model and remote CI qualification is not claimed.
- required_next_step: qa-gate consumes this and the separate TP/CR evidence for its sole final decision.

## Retained guards and fallbacks

| Path | Rationale and owner | Target state | Exit/cleanup condition |
|---|---|---|---|
| Unknown cause / untrusted exception | Pure projector stops with bounded known-safe guidance; arbitrary exception strings cannot choose a repair or effect. | Honest cause/effect limits with existing domain authority. | A supported typed cause and tested mapping becomes available; otherwise the safe stop remains required. |
| Uncertain write / missing original confirmation | Existing Core operation-status/receipt owner retains original UUID/payload; no blind replay or invented rollback. | Confirmed original effect or explicitly supported recovery. | Actual original receipt/state resolves uncertainty; replay remains subject to existing guards. |
| Oversized response | Existing limit yields one checked bounded failure, including full public wire bytes. | Valid response inside the unchanged cap. | Ordinary output fits the existing cap; no cap increase or recursive retry is introduced. |
| Unsupported valid locale | Existing whole-pack English fallback prevents mixed/incomplete copy. | One complete supported pack. | A complete approved locale is added to the existing registry, otherwise existing fallback applies. |
| Doctor does not return selected state | Gate uses its existing reader for missing-Control or aggregate paths; no caller-supplied prevalidated state. | Correct existing selection/error reporting. | Doctor supplies the exact selected observation for that call; subsequent invocations always read afresh. |

These are bounded compatibility/failure invariants, not a competing primary solution or temporary parallel architecture. No fallback executes another write, selects another target, transfers an old approval or treats an error as success.

## Root-cause and lifetime assessment

The error-channel defect is fixed at the shared producing-runtime/checked-delivery seam, with model-visible corrective text and independent error-domain validation. Consumers adapt to actual errors rather than suppressing flags. Versioned producing-generation identity prevents reclassifying old results through a new runtime.

The routed latency repair removes a demonstrable duplicate complete Run inventory/state validation within one gate evaluation. The shared observation has only that synchronous call's lifetime; all subsequent reads and mutation verification remain fresh. SDK schema compilation now occurs only when that fixed tool schema is actually validated, using the same provider/default options. Only compiled validators are retained for the bounded SDK server lifetime; no caller data, governance state or decision is cached. First-use negative input/output tests and complete real command flows prove validation is retained.

Historical unsuccessful timing runs and corrected test/setup failures remain explicit. The current candidate passes cold/warm p95 1088.087/876.261 and 701.275/611.639 ms with the original 1500/1000 ms bounds and every 20/20 sample. Evidence is source-qualified local/synthetic; it grants no native rollout or human acceptance.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CD-PERF-001 | emergent_risk | CD+Tests | resolved | PERFORMANCE_FIX.md; current CD report; actual fresh-read/SDK-first-use regressions; both unchanged performance passes | None for the routed finding; final QA remains separate. |
