# QA Report: AGDF Operating Model Sharpening

Run: `agdf-operating-model-sharpening`
Gate: QA
Status: pass
Date: 2026-07-08

## Decision

- qa_decision: pass
- scope: Additive AGDF operating-model sharpening for runtime rules, router guidance, gate-check skill, templates, quality contracts, CLI delivery-map/gate-check JSON exposure and Pages explanation.
- basis: Approved UR, Brownfield Review `structured_slice`, implementation evidence, TP coverage, clean review, code review and targeted validation.

## Evidence

| Evidence | Result | Covers |
|---|---|---|
| `node plugin\scripts\check-runtime-integrity.mjs` | pass | Runtime Contract sections and generated skill/control integrity |
| `npm --prefix create-agdf run smoke-test -- --quiet` | pass | Generated scaffold, routing render and package asset sync |
| `npm --prefix pages run check` | pass | Astro/type diagnostics |
| `npm --prefix pages run build` | pass | Static Pages build |
| `npm --prefix pages run check` after Core Control Flow revision | pass | Astro/type diagnostics for revised Pages copy |
| `npm --prefix pages run build` after Core Control Flow revision | pass | Static Pages build for revised Pages copy |
| `npm --prefix pages run check` after Operating Model icon | pass | Astro/type diagnostics |
| `npx --yes node@22 .\node_modules\astro\astro.js build` from `pages\` after Operating Model icon | pass | Static Pages build on Node 22 LTS |
| `npm --prefix pages run check` after additional section icons | pass | Astro/type diagnostics |
| `npx --yes node@22 .\node_modules\astro\astro.js build` from `pages\` after additional section icons | pass | Static Pages build on Node 22 LTS |

## Acceptance Coverage

| Acceptance signal | Status | Evidence |
|---|---|---|
| Runtime Contract names new guardrails in reusable AGDF language | done | `plugin/meta/agdf-runtime-contract.md` |
| Control templates have a per-run persistence decision | done | `plugin/control/templates/AGDF_RUN.md`; `plugin/control/templates/artefacts/OR.md` |
| Quality contracts include ambiguity/source/branch/persistence guardrails | done | `plugin/control/templates/AGENT_QUALITY_CONTRACTS.json` |
| Pages explains operating-model sharpening clearly | done | `pages/src/data/site.ts`; `pages/src/pages/index.astro` |
| Core Flow reflects operating-model sharpening | done | Workflow section renamed to Core Control Flow and now includes active scope, source authority and Bug Lightweight |
| Operating Model section has visual anchor | done | `pages/src/components/Icon.astro` adds `operating-model`; `pages/src/pages/index.astro` renders it in the section header |
| Early warning and control flow sections have visual anchors | done | `pages/src/components/Icon.astro` adds `early-warning` and `control-flow`; `pages/src/pages/index.astro` renders them in the relevant section headers |
| Runtime integrity, smoke and Pages checks pass | done | Validation commands above |
| Post-QA status projects to UAT gate | done | `create-agdf/scripts/smoke-test.js`; local `gate-check --json` shows `current_gate: UAT` and `missing_approval: Approval: UAT` |

## Risks

| Risk | Status | Mitigation |
|---|---|---|
| Rule density increases ceremony | acceptable | Concepts are framed as ambiguity reducers, lightweight bug path and project-specific packs, not new gate order. |
| Parallel source of truth | acceptable | Runtime Contract remains canonical; Router/skill/template changes reference or project the concepts. |
| Local Node 25.8.2 Windows build assertion | acceptable | Astro completes output but Node exits with `UV_HANDLE_CLOSING`; Node 22 LTS build passes and `astro check` passes. |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: QA pass confirms the reusable operating-model guardrails are implemented and validated.

## Next Permissible Step

- next_allowed_action: Prepare OR closeout and request UAT if a commit/release handoff is desired.
- quality_outlook: Watch first downstream repo use for whether the new guardrails reduce ambiguity without adding avoidable ceremony.
