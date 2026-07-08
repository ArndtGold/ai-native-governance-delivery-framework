# Reviews: AGDF Operating Model Sharpening

Run: `agdf-operating-model-sharpening`
Status: done
Reviewed at: 2026-07-08

## TP Coverage

This structured slice intentionally has no separate TP artefact. Coverage is evaluated against the approved UR acceptance signals and Brownfield Review scope.

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| runtime-rules | fully_done | `plugin/meta/agdf-runtime-contract.md` adds Source Precedence, Workstate And Scope Ambiguity, Knowledge Persistence Decision, Bug Lightweight Track, Domain Guardrail Packs and Support Answer Bridge. | none | Supports QA pass for runtime contract scope. |
| router-and-gate-check | fully_done | `plugin/meta/agdf-agent-router.md` and `plugin/skills/gate-check/SKILL.md` add branch/workspace evidence limits, multi-scope fail-closed routing, bug-lightweight routing and memory closeout routing. | none | Supports QA pass for routing scope. |
| templates-and-contracts | fully_done | `plugin/control/templates/AGDF_RUN.md`, `plugin/control/templates/artefacts/OR.md` and `plugin/control/templates/AGENT_QUALITY_CONTRACTS.json` add source/scope state, knowledge persistence decision and reusable quality contract signals. | none | Supports QA pass for durable control state. |
| cli-validator-surface | fully_done | `create-agdf/bin/create-agdf.js` parses `source_scope` and `memory`, exposes them in `gate-check --json` / `delivery-map --json`, and reports ambiguity/branch/memory findings. `plugin/scripts/check-runtime-integrity.mjs` asserts the new runtime sections. | none | Supports QA pass for machine-readable evidence. |
| gate-status-projection | fully_done | `create-agdf/bin/create-agdf.js` normalizes QA `passed` status and treats approved UAT as approval-only so QA pass projects to `current_gate: UAT` with `missing_approval: Approval: UAT`. `create-agdf/scripts/smoke-test.js` covers this regression. | none | Supports QA pass for post-QA status accuracy. |
| pages-copy | fully_done | `pages/src/data/site.ts` adds Bug Lightweight, operating guards, branch/scope drift risks and updated public positioning. `pages/src/pages/index.astro` renders a new Operating Guards section. | none | Supports QA pass for Pages sharpening. |

## Summary

- fully_done: runtime-rules, router-and-gate-check, templates-and-contracts, cli-validator-surface, gate-status-projection, pages-copy
- partially_done: none
- not_done: none
- out_of_scope_changes: none observed
- risks: Added rules increase density, mitigated by keeping them as ambiguity reducers and lightweight paths rather than new gate order.
- required_next_step: QA gate decision based on validation and review evidence.

## Clean Implementation Review

- decision: pass
- primary_solution: Additive updates in existing owners: Runtime Contract for canonical rules, Router and gate-check skill for routing, control templates and quality contracts for durable state, CLI validator for JSON exposure/status projection, Pages data/layout for public explanation.
- evidence: No new parallel gate model, no new approval formula, no MarzipanWeb-specific domain rules imported, no fallback-heavy execution paths added.
- fallbacks_retained: none
- workaround_or_shim_risk: low; the new CLI findings are direct projections of explicit template fields.
- parallel_structure_risk: low; source precedence and memory routing are centralized in Runtime Contract and referenced elsewhere.
- brownfield_fit: pass; all changes use existing AGDF ownership surfaces and generated assets were synchronized.
- missing_evidence: none
- required_next_step: Code Review and QA gate.

## Code Review

- decision: pass
- findings: none
- missing_evidence: none
- risks: The new CLI parser only emits findings when explicit source/scope/memory fields are present; empty legacy scaffolds remain compatible. QA `passed` status is now normalized to avoid stale post-QA status projections.
- required_next_step: QA gate.
