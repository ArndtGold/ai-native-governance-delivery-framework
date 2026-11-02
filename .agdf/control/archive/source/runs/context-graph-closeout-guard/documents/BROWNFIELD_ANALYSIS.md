# Brownfield Analysis: Context Graph Closeout Guard

Status: passed
Mode: pre_implementation_analysis
Date: 2026-07-09
Owner: agent
Based on: `.agdf/control/artefacts/context-graph-closeout-guard/TP.md`

## Decision

- decision: pass
- scope: CGC-01 through CGC-06
- reuse_strategy: extend existing Runtime Contract, skills, templates, package sync and runtime-integrity checks
- parallel_structure_risk: low
- required_next_step: CD+Tests for the approved TP

## Existing Owners

| Owner | Role | Implementation approach |
|---|---|---|
| `plugin/meta/agdf-runtime-contract.md` | Normative Context Graph and closeout semantics | Extend with reconciliation rule. |
| `plugin/skills/release-or/SKILL.md` | OR workflow and reporting guidance | Require reconciliation result and open-gap visibility. |
| `plugin/skills/delivery-closeout/SKILL.md` | Commit/PR handoff discipline | Prevent clean commit-ready handoff while graph follow-up is unresolved. |
| `plugin/control/templates/AGDF_RUN.md` | Current run template | Add additive `context_graph_reconciliation` field. |
| `plugin/control/templates/artefacts/OR.md` | OR template | Add additive `context_graph_reconciliation` field. |
| `plugin/scripts/check-runtime-integrity.mjs` | Deterministic integrity validation | Require field and detect obvious template/active-state contradictions. |
| `create-agdf/scripts/sync-package-assets.js` | Generated package control copy owner | Use existing smoke/sync command after source changes. |

## Risks

| Risk | Mitigation |
|---|---|
| Breaking historical artefacts | Limit deterministic contradiction checks to templates and active `.agdf/control/AGDF_RUN.md` / active OR when present. |
| Creating duplicate graph semantics | Runtime Contract remains the normative owner; skills/templates consume it. |
| Generated asset drift | Run create-agdf smoke test, which includes package asset sync. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This guard extends the closeout lesson captured in `CG-DELIVERY-PATH-SEARCH`.
