# Brownfield Review: Run Status Card and Quality Outlook

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: run-status-card-quality-outlook
- related_ur: .agdf/control/artefacts/run-status-card-quality-outlook/UR.md
- current_gate: Quick Task Execution
- reviewer: agent
- reviewed_at: 2026-07-08

## Objective

Route the approved UR for adding a compact status-card projection and first-class quality outlook to AGDF runtime/CLI surfaces.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Runtime semantics | plugin/meta/agdf-runtime-contract.md | Defines gate-check, delivery-map and skill output rules | medium |
| CLI status output | create-agdf/bin/create-agdf.js | Implements gate-check and delivery-map JSON/text reports | medium |
| Control templates | plugin/control/templates/AGDF_RUN.md; plugin/control/templates/artefacts/OR.md | Already store `next_allowed_action` and `quality_outlook` | low |
| Tests | create-agdf/scripts/smoke-test.js; plugin/scripts/check-runtime-integrity.mjs | Validate routing, delivery-map and runtime contracts | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Existing gate-check/delivery-map logic already owns process state | create-agdf/bin/create-agdf.js | warn | Derive status card from existing outputs; do not add a second transition model |
| Existing templates already contain quality outlook fields | AGDF_RUN.md and OR.md templates | none | Reuse fields and expose them consistently |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: none
- scope_reason: The change affects operational semantics and machine-readable outputs, but is narrow, additive and bounded to an ergonomic projection plus quality-outlook visibility.
- evidence: Existing runtime contract, CLI report functions and templates provide the owners to extend without architecture redesign.
- transparency_note: PRD/SD/TP are skipped for this structured slice because the approved UR and Brownfield evidence are sufficient and no new product capability beyond AGDF runtime ergonomics is introduced.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Should the status card unlock any gate? No; it must remain a projection only. | none | block if violated |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-STATUS-CARD
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Context node records the status-card projection boundary.

## Next Permissible Step

- next_allowed_action: Implement the structured slice and run targeted validation.
- forbidden_until_then: QA/UAT/release claims.

## Quality Outlook

- quality_outlook: Keep `quality_outlook` as quality guidance, distinct from process permission.
