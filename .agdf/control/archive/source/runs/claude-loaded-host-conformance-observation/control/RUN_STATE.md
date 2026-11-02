# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: claude-loaded-host-conformance-observation
- lifecycle: active
- revision: 3
- revision_id: 29ff4a75-39fd-45e1-9970-5308963b5889
- content_seal: sha256:199b01db0b361883564119880f6da254dc019eae44622652c10c5c06ef5191b4
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-09-30T10:44:38.357Z
- mode: verified_change
- current_gate: UR
- decision: pending
- owner: agent

## Objective

Observe the 12 predefined Claude conformance cases (HC-01–HC-12) on a real, freshly restarted Claude Code host running the locally installed 0.13.5 build, producing durable loaded-host evidence.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Recovery reset approvals without independent provenance; the ordinary approval sequence resumes. |
| What is approved? | Nothing yet. |
| What is missing? | Exact Approval: UR. |
| What is the next allowed action? | Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR. |
| What is explicitly forbidden right now? | create later-gate artefacts beyond the current allowed gate; run Brownfield Analysis as implementation preparation; implement code; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing |  |

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

- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook: pending observation results.
