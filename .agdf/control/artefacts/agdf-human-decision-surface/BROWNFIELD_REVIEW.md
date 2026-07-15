# Brownfield Review: Human-Centered Decision Surface for AGDF

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: `agdf-human-decision-surface`
- related_ur: `.agdf/control/artefacts/agdf-human-decision-surface/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-14 (refreshed after clarified UR approval)

## Objective

Size and route the approved UX refinement without duplicating the existing Gate Transition Card owner or changing AGDF authority semantics. The refreshed scope includes extensible locale packs, localized gate titles, stable option ordering, accessibility constraints and distinct non-approval outcomes.

## Review Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: PRD
- reuse_strategy: `extend_existing_presentation_contract`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/agdf-runtime-contract.md` | Gate Transition Card already defines the approval-time user boundary and exact approval preservation; refreshed UR adds locale and outcome invariants | medium |
| Source of truth | Runtime Contract, `gate-check` skill and plugin definition | Existing integrity checks enforce canonical/generated alignment | medium |
| Runtime path | `create-agdf/bin/create-agdf.js` status-card projection and gate-check output | Machine-readable status fields and human labels are already separated partially | medium |
| UI / UX | `plugin/skills/gate-check/SKILL.md` plus surface adapters | Approval-ready cards are user-oriented; blocked/clarification/status paths, locale packs and accessibility remain the extension point | medium |
| Persistence / data | `.agdf/control/runs/<run_id>/RUN_STATE.md` | Canonical state must remain unchanged and authoritative | low |
| Tests / QA | `plugin/scripts/check-runtime-integrity.mjs`, `create-agdf/scripts/smoke-test.js`, negative presentation fixtures | Existing tests protect approval-card leakage and machine-output compatibility | medium |
| Release / operations | Generated mirrors via `create-agdf/scripts/sync-package-assets.js` | Any normative wording change must propagate to all surfaces | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The existing `native-gate-buttons-live` slice already introduced the three-part Gate Transition Card and explicitly separated it from the Run Status Card. | `.agdf/control/artefacts/native-gate-buttons-live/SD.md`, `TP.md`, `UAT_REPORT.md` | `warn` | Extend the existing contract; do not create a second card format or renderer. |
| The existing UAT was declined, so the new slice must clarify the broader primary-interaction scope rather than silently reopen the old acceptance. | `.agdf/control/artefacts/native-gate-buttons-live/UAT_REPORT.md` | `revise` | Use a new linked scope and define acceptance for status, clarification and blocked states. |
| Human-readable CLI labels already exist, but the canonical output still exposes internal status structure in diagnostic contexts. | `create-agdf/bin/create-agdf.js`, Runtime Contract | `warn` | Define primary vs detail vs machine presentation explicitly in PRD. |
| Locale and interaction behavior must be data-driven rather than limited to the current German/English pair. | Clarified UR sections 5.2-5.3 | `revise` | Define a locale-pack contract and stable semantic option mapping in PRD/SD. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: The core approval-time contract exists and is tested, but extending its presentation boundary to blocked, clarification and general primary status interactions changes user-visible product semantics across runtime guidance, CLI output and generated surfaces. The scope is bounded and can extend the existing owners without a new authority or UI layer.
- evidence: `.agdf/control/artefacts/native-gate-buttons-live/SD.md`; `.agdf/control/artefacts/native-gate-buttons-live/TP.md`; `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; `create-agdf/bin/create-agdf.js`; clarified UR sections 5.2-5.3.
- transparency_note: Quick Task is not appropriate because the change affects normative runtime/product semantics and multiple generated surfaces. Full structured_delivery is not yet required; PRD must first define the exact presentation states and compatibility boundary.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which states belong to the primary Decision Card, and which remain detail/diagnostic output? | PRD | revise |
| How should a human-readable run title be derived when the canonical state has only a run ID? | PRD | warn |
| Which human-facing CLI mode should render the compact card without changing JSON output? | SD | warn |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: existing decision-card / ceremony-boundary knowledge, if confirmed during PRD
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing `native-gate-buttons-live` artifacts already establish the separation between audit Run Status Card and primary Gate Transition Card.

## Next Permissible Step

- next_allowed_action: Draft the PRD for the bounded primary-interaction presentation slice.
- forbidden_until_then: Implementation, SD, TP, QA, UAT and release claims.

## Quality Outlook

Keep one canonical control-state projection and one presentation contract, with explicit primary, detail and machine layers; this is the main way to improve UX without weakening fail-closed behavior.
