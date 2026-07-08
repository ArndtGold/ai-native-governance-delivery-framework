# Brownfield Review: AGDF Operating Model Sharpening

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-operating-model-sharpening
- related_ur: .agdf/control/artefacts/agdf-operating-model-sharpening/UR.md
- current_gate: Quick Task Execution
- reviewer: agent
- reviewed_at: 2026-07-08

## Objective

Route a generic AGDF sharpening slice based on reusable MarzipanWeb operating-model patterns.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Runtime rules | plugin/meta/agdf-runtime-contract.md | Owns recurring runtime rules | high |
| Router | plugin/meta/agdf-agent-router.md | Owns mode and skill routing | medium |
| Control templates | plugin/control/templates/AGDF_RUN.md; OR.md; AGENT_QUALITY_CONTRACTS.json | Own durable state shape and reusable contracts | medium |
| CLI validation | create-agdf/bin/create-agdf.js; check-runtime-integrity.mjs | Own machine-readable checks | medium |
| Pages | pages/src/data/site.ts; pages/src/pages/index.astro | Own public AGDF explanation | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Runtime Contract is the correct owner for generic rules | Existing Do Not Duplicate section | warn | Add compact rules there; avoid duplicating full framework docs |
| Pages already centralizes text in data modules | pages/src/data/site.ts | none | Prefer data/copy updates over layout rewrite |
| MarzipanWeb rules are repo-specific | C:\Workspace\marzipanweb\AGENTS.md | warn | Generalize patterns, do not copy domain details |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: none
- scope_reason: The slice changes governance semantics and public messaging but remains bounded to additive, reusable guardrails.
- evidence: Existing owners are clear, and validation scripts already enforce runtime integrity and generated asset sync.
- transparency_note: PRD/SD/TP are intentionally skipped; the approved UR plus Brownfield Review are sufficient for this narrow framework-hardening slice.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Should AGDF adopt MarzipanWeb's `Freigabe:` formula? No; AGDF keeps `Approval:` and only legacy alias support. | none | block if violated |
| Should domain guardrails be concrete MarzipanWeb rules? No; AGDF should define reusable pack pattern only. | none | revise if violated |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The slice creates reusable operating-model guidance.

## Next Permissible Step

- next_allowed_action: Implement the structured slice and run targeted validation.
- forbidden_until_then: QA/UAT/release claims.

## Quality Outlook

- quality_outlook: Add guardrails as ambiguity reducers, not as mandatory ceremony.
