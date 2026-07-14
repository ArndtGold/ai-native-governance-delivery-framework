# Task Plan Review: Reliable Native Gate-Approval Invocation

Status: complete; QA input
Run: `native-gate-buttons-live`
Date: 2026-07-14

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| NGB-01 | `fully_done` | Brownfield Analysis and canonical owner trace | none | none |
| NGB-02 | `fully_done` | Runtime Contract and gate-check skill now state one first attempt and no retry; integrity guard passes | none for contract wording | none |
| NGB-03 | `fully_done` | Codex surface guidance updated and generated copies synchronized | visible first-attempt Codex probe | supporting evidence gap |
| NGB-04 | `fully_done` | Claude surface guidance updated with non-applied-control fallback | visible first-attempt Claude probe | supporting evidence gap |
| NGB-05 | `fully_done` | OpenCode source unchanged; routing, control-state and smoke checks preserve existing behavior | none identified | none |
| NGB-06 | `partially_done` | Existing control-state/routing regressions pass; integrity guard covers the new source contract | no dedicated executable native adapter fixture for first-attempt host non-application | test coverage gap |
| NGB-07 | `fully_done` | Existing control-state authority and revalidation tests pass; no persistence path added | none | none |
| NGB-08 | `partially_done` | Existing Codex fresh-session rendering observation; current implementation records contract/fallback | current-session first-attempt visible result and fallback probe | supporting evidence gap |
| NGB-09 | `partially_done` | Existing Claude observation records delayed application after follow-up request; new fallback rule is documented | current-session first-attempt result and immediate fallback probe | supporting evidence gap |
| NGB-10 | `partially_done` | Runtime integrity, routing, control-state and diff checks passed; smoke completed without a captured summary line | clean captured smoke exit/evidence after final diff | evidence gap |
| NGB-11 | `fully_done` | Brownfield Analysis, Clean Implementation Review and Code Review are persisted | none | none |

## Summary

- fully_done: NGB-01, NGB-02, NGB-03, NGB-04, NGB-05, NGB-07, NGB-11
- partially_done: NGB-06, NGB-08, NGB-09, NGB-10
- not_done: none
- out_of_scope_changes: none; no custom UI, host configuration, alternate
  approval store or OpenCode redesign was introduced
- risks: Host-owned button rendering remains unproven. The implementation can
  now select exact text immediately when native presentation is not applied,
  but it cannot force the host to display buttons.
- required_next_step: QA Gate must classify the partial live/test evidence;
  do not claim completed native-button reliability or proceed to UAT yet.
