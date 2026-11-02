# QA Report: AGDF Local Marketplace Family Label

Status: revise
Decision: revise
Run: `agdf-plugin-family-language`
Date: 2026-08-23

## Quality Readiness

| Dimension | Owner | Status | Decisive evidence |
|---|---|---|---|
| Plan coverage | Task Plan Review | revise | 9/11 tasks are fully done; AFL-T8 and AFL-T11 still require one direct rendered Plugins-screen observation |
| Solution integrity | Clean Implementation Review | pass | Codex-native repository projection fixes the discovery owner without cache, identity or Claude workarounds |
| Code quality | Code Review | pass | Canonical renderer, sync projection and regression coverage have no open finding |
| QA decision | `qa-gate` | revise | Fresh app-server Plugins data reports `AGDF`, but the required native rendered-screen evidence is unavailable in this task |

## QA Gate

- decision: revise
- evidence: SD and TP revision 2 approved; refreshed Brownfield Analysis pass; canonical renderer equality, fresh app-server selection, Claude strict validation, Runtime Integrity, focused package suites and complete smoke test pass; TP and Clean/Code Reviews refreshed.
- missing_evidence: One direct native rendered Plugins-screen observation after the repository projection.
- risks: App-server output is the Plugins data contract but is not itself rendered UI evidence under AFL-6.
- required_next_step: Capture one direct rendered Plugins-screen observation without reinstalling or changing code.
- impact_codes: none

## TP And UX Decision Basis

- Implementation obligations AFL-T1 through AFL-T7 and AFL-T9 through AFL-T10 are complete and
  deterministically tested.
- AFL-T8 and AFL-T11 remain partial only on direct rendered host evidence.
- PRD criterion AFL-5 is fulfilled by corrected installed-state evidence; AFL-6 remains unverified until the fresh observation.
- Technical IDs remain unchanged; approved SD and TP revision 2 own the Codex-native repository
  projection and unchanged Claude boundary.

## Consumed Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| AFL-TPR-01 | evidence_gap | evidence_obligation | resolved | Supported refresh completed after explicit authorization; registered source, installed version, Marketplace manifest and ownership markers agree | Preserve the installed-state evidence for UAT |
| AFL-TPR-02 | evidence_gap | evidence_obligation | resolved | User-provided fresh Codex Plugins screenshot after verified refresh and restart shows lowercase `agdf` | Preserve the host-limitation evidence and present it honestly for UAT |
| AFL-TPR-03 | implementation_gap | CD+Tests | resolved | Corrected existing transaction refreshes only a changed owned Codex registration; ownership revision 1 forces stale prior registrations through one migration; focused tests prove idempotence and recovery for all mutation failure points | Preserve the corrected transaction, registration revision and regressions |
| AFL-TPR-04 | evidence_gap | evidence_obligation | resolved | User reported no visible change; live inspection proved the restarted host loaded base cache/version `0.13.5` | Preserve the failed restart observation |
| AFL-TPR-05 | implementation_gap | CD+Tests | resolved | Exact `agdf@agdf --json` installer dispatch, focused fixtures, full smoke and repository-owned reinstall now remove the stale base cache | Preserve the exact selector and tests |
| AFL-TPR-06 | evidence_gap | evidence_obligation | resolved | Fresh app-server `plugin/list` supplies the missing host-backend observation and proves the installed cache is not the Marketplace selected for this checkout | Preserve the direct backend evidence |
| AFL-TPR-07 | design_gap | SD | resolved | SD revision 2 approved the Codex-native `.agents` repository Marketplace and unchanged Claude boundary | Preserve the approved design |
| AFL-TPR-08 | plan_gap | TP | resolved | TP revision 2 approved AFL-T9 through AFL-T11 and their test/evidence mappings | Preserve the approved plan |
| AFL-TPR-09 | evidence_gap | evidence_obligation | open | Fresh app-server `plugin/list` selects `.agents/plugins/marketplace.json` and exposes `AGDF`; internal `codex://` navigation is blocked and macOS accessibility is unavailable, so this task cannot observe the rendered screen | Capture one direct rendered Plugins-screen observation without further implementation or reinstall |

## Brownfield, Integrity And Scope

- brownfield_fit: pass
- solution_integrity: pass
- documentation_impact: none beyond this run's durable AGDF artefacts
- context_graph_impact: link_only
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#release_built_plugin_distribution_2026_07_18`; `.agdf/control/SOT_REGISTRY.md`
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing canonical metadata and asset synchronization owners remain
  authoritative; the new host-specific projection does not create a new decision owner or graph node.

## Evidence Boundary

The repository-discovery root cause is implemented and verified through the Codex app-server data
contract: this checkout now selects `.agents/plugins/marketplace.json` with visible family value
`AGDF` and valid source version `0.13.5`. QA remains `revise` only because the native rendered screen
cannot be observed from this task. Technical IDs and Claude metadata remain unchanged.
