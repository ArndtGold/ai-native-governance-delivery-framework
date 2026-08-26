# Brownfield Review: Claude Loaded-Host Conformance Observation

- mode: post_ur_review
- decision: pass
- mode_slice_decision: verified_change
- required_next_gate: none
- date: 2026-08-26
- run_id: claude-loaded-host-conformance-observation

## Scope

Evidence collection only: execute the 12 predefined Claude cases on the freshly restarted local host and persist schema-aligned observation records plus a compact report. No product, plugin or installer code changes.

## UI/UX Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: Observation of existing behavior; nothing user-facing changes.
- ux_intent_definition_required: not_applicable

## Current Coverage

| Concern | Status | Evidence |
|---|---|---|
| Case definitions HC-01–HC-12 | fully_done | `HOST_CONFORMANCE_MATRIX.json` (12 `claude_code` rows with `expected_behavior`) |
| Observation vocabulary | fully_done | `OBSERVATION_SCHEMA.json` (run-id-pinned; field set reusable) |
| Claude loaded-host evidence | not_done | All 12 rows `host_unavailable`; four completed runs disclose the same limitation |
| Usable local Claude host | fully_done since today | Runs `install-scripts-fresh-checkout-fix`, `windows-native-install-viability`, `claude-local-install-content-refresh`; restart pending |

## Reuse Strategy

- strategy: extend (evidence only)
- Reuse case ids, expected behaviors and the observation field set verbatim; record under this run's id. The historical matrix stays immutable (precedent: protected historical evidence in the staged-proportionality runs).
- The executing session follows the durable `OBSERVATION_PROTOCOL.md` in this run's artefact folder — required because execution must happen in a fresh post-restart session that does not share this conversation's context.

## Parallel-Structure Risk

None. No second case catalog, no second schema; a run-scoped derived recording under new artefact paths.

## SoT / Runtime / Product-Semantics Drift

None. Findings are recorded, not fixed; gate authority is not mutated by probes (read-only probes and controlled approval phrasing are mandated by the protocol).

## Risks

- Self-observation bias: the observing agent is part of the observed system; the protocol mandates verbatim evidence capture (hook output, validator JSON) over self-assessment.
- Probes for HC-09/HC-10/HC-11 touch approval semantics; the protocol confines them to a disposable probe scope so no real run's authority changes.

## Mode/Slice Decision

- decision: verified_change
- scope_reason: `bounded_evidence_collection`; all definitions and vocabulary exist and are approved, the deliverable is a durable observation artefact set, locally reversible (delete artefacts), independently verifiable (recorded evidence). No PRD/SD/TP trigger; Quick Task cannot carry 12 structured observations with schema alignment.
- evidence: `.agdf/control/artefacts/claude-loaded-host-conformance-observation/UR.md`; matrix and schema artefacts named above.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- required_action: none until observations complete; report follow-up nodes only for real findings.
- gate_effect: none

## Required Next Step

User restarts Claude Code; a fresh session in this repository executes `OBSERVATION_PROTOCOL.md` and records `CLAUDE_LOADED_HOST_MATRIX.json` plus `OBSERVATION_REPORT.md`.
