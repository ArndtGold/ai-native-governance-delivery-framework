# Task Plan Review: AGDF Local Marketplace Family Label

Status: revise
Date: 2026-08-23

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| AFL-T1 | fully_done | Brownfield Analysis pass; clean candidate paths; baseline regressions pass | none | none |
| AFL-T2 | fully_done | Canonical mapping implemented in the approved projector path | none | none |
| AFL-T3 | fully_done | Exact current/legacy/invalid classifier and atomic migration tests pass | none | none |
| AFL-T4 | fully_done | Four identity layers, idempotence, migration and tamper rejection asserted | none | none |
| AFL-T5 | fully_done | All declared repository and fixture-only install regressions pass; exact implementation paths confirmed | none | none |
| AFL-T6 | fully_done | AFL-TPR-03 implementation, TP Review, Clean Review and Code Review are complete; QA rerun consumes the remaining host evidence gap | none | none |
| AFL-T7 | fully_done | Repository-owned exact-selector reinstall is healthy; native inventory and sole cache directory use `0.13.5+codex.local-619acdcbd1f9`; installed Marketplace declares `AGDF` | none | none |
| AFL-T8 | partially_done | Fresh post-change app-server observation selects `.agents/plugins/marketplace.json` with Marketplace `displayName: AGDF`, repository version `0.13.5` and unchanged core plugin name | Direct rendered Plugins-screen observation | AFL-TPR-09 routes to the evidence obligation |
| AFL-T9 | fully_done | Canonical repository Marketplace renderer and sync projection generate `.agents/plugins/marketplace.json` from `publicDistribution.publicDisplayName` with lowercase technical IDs and source `./plugin` | none | none |
| AFL-T10 | fully_done | Renderer equality, fresh app-server selection, Claude strict validation, unchanged Claude diff, Runtime Integrity, public contract and full smoke pass | none | none |
| AFL-T11 | partially_done | Brownfield Analysis, CD+Tests, TP Review, Clean Review, Code Review and QA are refreshed; backend evidence passes | Direct rendered Plugins-screen observation remains missing | AFL-TPR-09 routes to the evidence obligation |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AFL-1 | Repository projection | AFL-T2, AFL-T4 | Generated fixture contains Marketplace `displayName: AGDF` | fulfilled | none |
| AFL-2 | Technical identity | AFL-T2, AFL-T4 | Tests retain Marketplace/plugin `name: agdf`; install fixtures pass | fulfilled | none |
| AFL-3 | Core product identity | AFL-T2, AFL-T4 | Test retains `AI Governance & Delivery Framework` in plugin manifest | fulfilled | none |
| AFL-4 | Public contract isolation | AFL-T5 | Public plugin test passes with unchanged semantic digest | fulfilled | none |
| AFL-5 | Installed Codex use | AFL-T7 | Corrected exact-selector install, registration revision 1, owned source, enabled cachebuster plugin and installed `displayName: AGDF` verified | fulfilled | none |
| AFL-6 | Installed Codex use | AFL-T8, AFL-T10, AFL-T11 | Fresh app-server evidence exposes `AGDF` through the exact Plugins data contract, but the native rendered screen remains inaccessible to this task | not_verifiable | evidence_gap |
| AFL-7 | Companion boundary | AFL-T5 | Exact implementation paths exclude Inventory | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| AFL-TPR-01 | evidence_gap | evidence_obligation | resolved | Supported refresh completed after explicit authorization; registered source, installed version, Marketplace manifest and ownership markers agree | Preserve the installed-state evidence for UAT |
| AFL-TPR-02 | evidence_gap | evidence_obligation | resolved | User-provided fresh Codex Plugins screenshot after verified refresh and restart shows lowercase `agdf` | Preserve the host-limitation evidence and present it honestly for UAT |
| AFL-TPR-03 | implementation_gap | CD+Tests | resolved | Existing Codex install transaction now refreshes `owned_local_current` only when `transaction.changed === true`; ownership revision 1 migrates stale prior registrations once; focused tests prove current idempotence and recovery after remove, add and plugin-operation failures | Preserve the corrected transaction, registration revision and focused regressions |
| AFL-TPR-04 | evidence_gap | evidence_obligation | resolved | User reports no visible change after restart; live inspection confirms Codex loaded cache and version `0.13.5` while the Marketplace source projected the cachebuster | Preserve this failed observation as diagnostic evidence |
| AFL-TPR-05 | implementation_gap | CD+Tests | resolved | Installer now uses workflow-standard `codex plugin add agdf@agdf --json`; command fixtures and full smoke test pass; corrected repository install removes base cache and leaves only the cachebuster directory | Preserve exact-selector dispatch and regression coverage |
| AFL-TPR-06 | evidence_gap | evidence_obligation | resolved | Fresh app-server `plugin/list` supplies the missing host-backend observation and shows why the corrected installed cache is not selected in this checkout | Preserve the direct backend evidence |
| AFL-TPR-07 | design_gap | SD | resolved | SD revision 2 approved the Codex-native repository Marketplace owner and explicitly preserves the Claude manifest | Preserve SD revision 2 boundaries |
| AFL-TPR-08 | plan_gap | TP | resolved | TP revision 2 approved AFL-T9 through AFL-T11 with renderer, cross-host and host-evidence tasks | Preserve TP revision 2 coverage |
| AFL-TPR-09 | evidence_gap | evidence_obligation | open | Fresh app-server `plugin/list` passes with `AGDF`, but this task cannot inspect the native rendered Plugins screen because internal `codex://` navigation is blocked and macOS accessibility is unavailable | Capture one direct rendered Plugins-screen observation without further implementation or reinstall |

## Summary

- fully_done: 9/11
- partially_done: 2/11
- not_done: 0/8
- out_of_scope_changes: none; the temporary diagnostic change was reverted
- risks: Backend projection is strong host evidence but cannot substitute for the required rendered-screen observation.
- required_next_step: Capture one direct rendered Plugins-screen observation for AFL-TPR-09; do not reinstall or change code.
