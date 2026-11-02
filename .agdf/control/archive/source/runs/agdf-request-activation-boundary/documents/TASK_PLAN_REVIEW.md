# Task Plan Review: AGDF Request Activation Boundary

Status: revise
Decision: revise
Revision: 3
Date: 2026-09-05
Run: `agdf-request-activation-boundary`
Based on: approved TP Revision 3, final Revision 3 diff and isolated full smoke

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| `RAB-TP-17` | fully_done | One 1,092-byte canonical kernel, exact fingerprint, unchanged operation catalog, complete budget contract and independent negative fixtures | none | none |
| `RAB-TP-18` | fully_done | Ten compact skill projections, aggregate discovery budget, compact `gate-check` and terminal dispatcher transfer pass projection and integrity checks | none | none |
| `RAB-TP-19` | fully_done | Source, generated, package and temporary-install checks prove the two-stage transports and on-demand router path without new hooks | Loaded-host route resolution remains part of `RAB-TP-15`, not this deterministic task | none within the task boundary |
| `RAB-TP-20` | partially_done | Shared footprint helper, all budgets, negative matrix, stable generation, composed-profile loader, closed schema and independent profile/evaluator identities pass | Four TP-required external model-backed composed-profile executions are unavailable | prevents a complete behavioral evidence claim |
| `RAB-TP-21` | fully_done | README, German and English handbooks, audit and Context Graph describe one eager kernel, on-demand detail and evidence limits consistently | none | none |
| `RAB-TP-15` | not_done | Host schema and truthful `unavailable` matrix exist | Exact install/readback/restart/fresh-session evidence for Codex, Claude Code, GitHub Copilot and OpenCode, including two OpenCode compaction probes | prevents QA pass and UAT |
| `RAB-TP-16` | fully_done | CD+Tests, this Task Plan Review, Clean Implementation Review, Code Review and QA Report use the final Revision 3 diff; full smoke passes | none; review decisions remain `revise` because their findings are open | no procedural review gap; substantive findings still prevent pass |
| `RAB-TP-07` protected baseline | fully_done | Strictly validated canonical runs survive exact-match retry and repair byte-for-byte; run drift and invalid/foreign structures fail closed; public `init -> run-create -> init` and full smoke pass | none | `RAB-CR-01` resolved |

## Summary

- fully_done: 6/8 relevant tasks
- partially_done: 1/8 relevant tasks
- not_done: 1/8 relevant tasks
- out_of_scope_changes: none identified; dispatcher v1, shared Claude live-agent adapter, hook inventories,
  OpenCode permissions and the unrelated untracked image remain outside the implementation diff
- risks: deterministic composition cannot substitute for model-backed or freshly loaded host behavior
- required_next_step: Obtain separate authorization for external model-profile transfer and each
  host lifecycle change, then complete the four composed-profile runs and exact four-host evidence
  before requesting QA approval.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| `RAB-01` | ordinary read-only | `RAB-TP-17`–`20` | Deterministic no-callback cases pass; no four-host transcript | partial | evidence_gap |
| `RAB-02` | advisory vs delivery | `RAB-TP-17`–`20` | Paired German/English cases and callback order pass | fulfilled | none |
| `RAB-03` | mixed intent | `RAB-TP-17`–`20` | Mixed delivery precedence passes | fulfilled | none |
| `RAB-04` | quoted/negated/hypothetical | `RAB-TP-17`–`20` | Adversarial corpus passes | fulfilled | none |
| `RAB-05` | explicit AGDF operation | `RAB-TP-17`–`20` | Operation routes pass deterministically; invocation provenance is unobserved on hosts | partial | evidence_gap |
| `RAB-06` | false discovery | `RAB-TP-17`–`20` | Zero-callback fixture passes; automatic host selection is unobserved | partial | evidence_gap |
| `RAB-07` | delivery without control | `RAB-TP-07` | Setup, gate, exact retry/repair and conflict/drift fixtures pass | fulfilled | none |
| `RAB-08` | explicit control lifecycle | `RAB-TP-07` | CLI lifecycle fixtures pass; clean-host behavior is unobserved | partial | evidence_gap |
| `RAB-09` | explicit status | `RAB-TP-17`–`20` | Missing-control/status regression passes; host output is unobserved | partial | evidence_gap |
| `RAB-10` | ambiguous effect | `RAB-TP-17`–`20` | Ambiguous cases abstain without callbacks | fulfilled | none |
| `RAB-11` | active-run action | `RAB-TP-17`–`20` | Action-vs-question and revalidation cases pass | fulfilled | none |
| `RAB-12` | deactivation/unrelated follow-up | `RAB-TP-17`–`20` | Multi-turn deterministic cases pass; resumed-host evidence is absent | partial | evidence_gap |
| `RAB-13` | downstream authority | `RAB-TP-17`–`20` | Approval regressions and unchanged dispatcher pass | fulfilled | none |
| `RAB-14` | cross-surface projection | `RAB-TP-17`–`20` | Runtime Integrity, package and exact inventory checks pass | fulfilled | none |
| `RAB-15` | fresh supported hosts | `RAB-TP-15` | Matrix truthfully reports `unavailable` for all four hosts | missing | evidence_gap |
| `RAB-16` | local/private routing | `RAB-TP-20`, `RAB-TP-16` | No new classifier, prompt store or network owner; code review covers the diff | fulfilled | none |
| `RAB-17` | activated recovery | `RAB-TP-17`–`20` | Failure fixtures pass; representative host recovery is absent | partial | evidence_gap |
| `RAB-18` | advisory vs binding artefact | `RAB-TP-17`–`20` | Paired artefact cases pass | fulfilled | none |
| `RAB-19` | operation families without control | `RAB-TP-17`–`20` | Complete deterministic family matrix passes | fulfilled | none |
| `RAB-20` | invocation provenance | `RAB-TP-20`, `RAB-TP-15` | Schema and fallback semantics pass; per-host provenance is unavailable | partial | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| `RAB-TPR-01` | evidence_gap | evidence_obligation | open | `HOST_OBSERVATION_MATRIX.json` is `unavailable` for all four hosts | Obtain separate lifecycle authorization per host, then complete exact install/readback/restart/fresh-session chains and all required case families. |
| `RAB-TPR-02` | evidence_gap | evidence_obligation | open | Deterministic composed-profile tests use stubs; four external model-backed commands did not execute | Authorize and execute the four TP-required model-backed composed-profile runs with correct provenance. |
| `RAB-CR-01` | implementation_gap | CD+Tests | resolved | Strict valid-run preservation, content/identity drift snapshots, focused negative matrix, public CLI reproduction, independent re-review and final full smoke pass | none |
