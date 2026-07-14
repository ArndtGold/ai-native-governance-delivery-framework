# Brownfield Analysis: Reliable Native Gate-Approval Invocation

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_ANALYSIS.md`

## Scope

Implement NGB-01 through NGB-11 from the approved Task Plan. The clean slice is
the canonical Runtime Contract plus the canonical `gate-check` skill and their
existing generated-surface propagation. No host UI or alternate approval path
is in scope.

## Evidence

- `plugin/meta/agdf-runtime-contract.md` owns the Native Interaction Contract
  and surface adapter rules.
- `plugin/skills/gate-check/SKILL.md` owns readiness, adapter selection and
  deliberate-input handling.
- `plugin/meta/agdf-plugin.definition.json` declares the existing adapters and
  exact-text fallback.
- `plugin/scripts/check-runtime-integrity.mjs` validates the interaction
  metadata and prevents an unsynchronized canonical definition.
- `create-agdf/scripts/sync-package-assets.js` owns generated surface copies.
- Existing control-state tests already own same-run, same-gate and artefact
  revalidation; no native-response persistence owner exists.

## Current coverage

| Area | Coverage | Finding |
|---|---|---|
| Approval semantics and persistence | `fully_done` | Existing control-state workflow remains authoritative. |
| Adapter declarations | `fully_done` | Codex, Claude, OpenCode and fallback mappings exist. |
| First-attempt invocation outcome | `partially_done` | Existing wording says `when_callable` but does not require an immediate fallback or prohibit a retry after the host fails to apply the control. |
| Deterministic native/fallback contract | `partially_done` | Authority rejection cases exist; first-attempt adapter outcome needs explicit coverage. |
| Live host rendering | `partially_done` | Codex rendered after enabling the host feature in a fresh session; Claude required a follow-up request and therefore exposes the exact reliability gap. |

## Reuse strategy

`extend_existing_native_adapter`. Strengthen the existing canonical contract and
gate-check instructions, then regenerate the existing package surfaces. Do not
add a new adapter, renderer, state machine or persistence path.

## Impact and compatibility

- Source impact: Runtime Contract, `gate-check` skill and their generated copies.
- Interface impact: no public command, approval formula or host permission is
  changed.
- Backwards compatibility: exact textual approvals remain unchanged and become
  the immediate fallback for unknown or failed native presentation.
- Test impact: runtime-integrity, routing/control-state tests and package smoke;
  add only the missing first-attempt/fallback assertions.
- Side effects: none beyond clearer agent invocation behavior and generated
  documentation/instruction copies.

## Risks and boundaries

Host presentation remains outside AGDF control. If the host does not expose or
apply the native question on the first eligible attempt, AGDF cannot force a
button; it must use exact text. This is a host-capability result, not permission
to add a custom UI or retry loop.

## Context Graph impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_gate_effect: `none`
- required_action: Preserve the existing authority boundary; no new node.

## Required next step

Implement the canonical wording/decision-point guard, synchronize generated
assets, then run CD+Tests. Live probes remain supporting evidence only.
