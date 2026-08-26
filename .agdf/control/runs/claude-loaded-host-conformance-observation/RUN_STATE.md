# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: claude-loaded-host-conformance-observation
- lifecycle: active
- revision: 2
- revision_id: fd42ab8c-9f8d-4ece-9c23-40e006944f10
- mode: verified_change
- current_gate: CD+Tests
- decision: pending
- owner: agent

## Objective

Observe the 12 predefined Claude conformance cases (HC-01–HC-12) on a real, freshly restarted Claude Code host running the locally installed 0.13.5 build, producing durable loaded-host evidence.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Case definitions, expected behaviors and the observation field vocabulary exist in the completed matrix run; a content-fresh local Claude install exists since 2026-08-26; the executable protocol is persisted. |
| What is approved? | UR is approved by exact user approval on 2026-08-26. Verified Change requires no further user gate. |
| What is missing? | Host restart by the user, then execution of `OBSERVATION_PROTOCOL.md` in a fresh session. |
| What is the next allowed action? | User restarts Claude Code; the first fresh session in this repository executes the protocol and records `CLAUDE_LOADED_HOST_MATRIX.json` plus `OBSERVATION_REPORT.md`. |
| What is explicitly forbidden right now? | Executing observations in the current stale-loaded session; mutating real gate authority through probes; rewriting historical matrix evidence; fixing findings inside this run; commit/push/release. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided by the user on 2026-08-26 for revision 1 (`fd42ab8c-9f8d-4ece-9c23-40e006944f10`) via native gate question and revalidated before persistence. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/UR.md` | approved | Loaded-host evidence goal, derivation boundary to the historical matrix. |
| Brownfield Review | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/BROWNFIELD_REVIEW.md` | done | Evidence-only extend strategy; `verified_change` selected. |
| Observation Protocol | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/OBSERVATION_PROTOCOL.md` | ready_for_execution | Self-contained 12-case protocol for the fresh post-restart session. |
| Observation Matrix | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/CLAUDE_LOADED_HOST_MATRIX.json` | pending | Written by the executing session. |
| Observation Report | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/OBSERVATION_REPORT.md` | pending | Written by the executing session. |

## Mode/Slice Decision

- decision: verified_change
- required_next_gate: none
- scope_reason: `bounded_evidence_collection`; approved definitions and vocabulary are reused, the deliverable is a durable observation artefact set, locally reversible and independently verifiable.
- evidence: `.agdf/control/artefacts/claude-loaded-host-conformance-observation/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | defines | loaded-host observation scope | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/UR.md` |
| UR | approved_by | `Approval: UR` | User input on 2026-08-26 after revalidation of revision 1. |
| UR | derives_cases_from | run `agdf-live-host-conformance-matrix` | Historical `HOST_CONFORMANCE_MATRIX.json` (12 `claude_code` rows) and `OBSERVATION_SCHEMA.json`; historical evidence stays immutable. |
| UR | enabled_by | runs `install-scripts-fresh-checkout-fix`, `windows-native-install-viability`, `claude-local-install-content-refresh` | Content-fresh local Claude install of 2026-08-26. |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/claude-loaded-host-conformance-observation/BROWNFIELD_REVIEW.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| 12 Claude rows `host_unavailable` | Historical `HOST_CONFORMANCE_MATRIX.json` | Standing evidence gap | direct |
| Content-fresh install with provenance | `claude-local-install-content-refresh` Verified Change | Usable observed host | direct |
| Standing Claude live-observation limitations | ORs of `deterministic-agent-ux`, `surface-native-interactions`, `agdf-skill-evaluation-framework`, `automatic-version-asset-sync` | Cross-run value of the observation | direct |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: none until observations complete
- context_graph_gate_effect: none
- context_graph_evidence: Observation-only run; follow-up nodes only for real findings.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Loaded-host conformance evidence and any enforcement-boundary findings are reusable across future host work.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- next_allowed_action: User restarts Claude Code; the first fresh session executes `OBSERVATION_PROTOCOL.md`.
- quality_outlook: pending observation results.
