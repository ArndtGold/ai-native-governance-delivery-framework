# Brownfield Analysis: Human Decision Surface

Status: done
Mode: pre_implementation_analysis
Decision: pass
Revision: 2
Date: 2026-07-15
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/TP.md`

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: none
- artefact: `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_ANALYSIS.md`
- scope: Implement HDS-16 through HDS-23 by extending the existing immutable approval-orientation snapshot, locale registry, adapter capability metadata and integrity tests without changing gate authority or JSON compatibility.
- evidence: approved TP revision 3; `create-agdf/lib/interaction-presentation.js`; `create-agdf/scripts/interaction-presentation-test.js`; `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; `plugin/meta/agdf-interaction-locales.json`; `plugin/meta/agdf-plugin.definition.json`; `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/runtime-integrity-negative-test.js`.
- transparency: Runtime and skill guidance already mandate Run Status Card, Gate Transition Card and then control/fallback. Implementation therefore strengthens the existing executable snapshot and checks instead of adding another renderer or orchestration owner.
- missing_evidence: Live rendering details remain host-owned and cannot be proven by repository tests alone; repository verification can prove payload semantics, ordering, fallback, links, locale resolution and authorization boundaries.
- current_coverage: partially_done. The immutable snapshot already exposes `run_status_card`, `gate_transition_card`, `approval_interaction` in order and Runtime Integrity protects the normative wording. It still uses generic status-card titles, lacks an exported structural sequence preflight and does not declare whether each adapter transports a canonical value separately from its decorated label.
- reuse_strategy: extend `interaction-presentation.js` with action headings and one pure preflight; extend existing locale packs and adapter metadata; add focused positive/negative fixtures; reuse the existing sync and integrity paths. Do not add a renderer, state store, gate evaluator or surface-specific sequence.
- risks: repository tests can prove payload structure and mapping but not host-visible rendering; adapter capability claims must fail closed where separate canonical transport is unproven; changing enumerable CLI JSON would be a compatibility regression, so the attached snapshot remains non-enumerable.
- context_graph_impact: link_only. The durable run and this analysis link the reusable decision-surface invariants; no new Context Graph node is justified before implementation evidence establishes a stable reusable owner.
- required_next_step: Enter CD+Tests and implement HDS-16 through HDS-23 in the existing presentation, locale, adapter metadata and integrity owners.

## Existing Owners And Reuse Map

| Concern | Existing owner | Implementation action |
|---|---|---|
| Gate authority and transition semantics | `plugin/meta/agdf-runtime-contract.md`; control-state evaluator | Extend presentation rules only; do not add gate evaluation to the new helper. |
| Agent approval interaction | `plugin/skills/gate-check/SKILL.md` | Consume semantic locale keys and canonical artefact/title rules. |
| Human CLI status projection | `create-agdf/bin/create-agdf.js` | Replace the binary German/English label branch with shared locale resolution and presentation lookup. |
| Selected-run artefacts | `create-agdf/lib/control-state/run-state-parser.js` | Derive links only from parsed canonical run content; never guess paths. |
| Surface capability mapping | `plugin/meta/agdf-plugin.definition.json` | Add locale/presentation metadata and stable semantic outcome mapping. |
| Generated copies | `create-agdf/scripts/sync-package-assets.js` | Reuse recursive canonical copy behavior and add sync assertions. |
| Integrity and regression proof | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/smoke-test.js` | Extend prohibited-drift assertions and add a focused presentation test matrix. |
| Ordered approval snapshot | `create-agdf/lib/interaction-presentation.js` | Extend the existing constant sequence with structural block IDs, an action heading and pure preflight validation. |

## Compatibility And Regression Boundary

- Preserve exact `Approval: <GateName>` values, existing gate evaluation and persisted approval workflow.
- Preserve all existing JSON keys and machine values; localization affects human projections only.
- Preserve host-owned UI chrome, technical permission controls and dismissal behavior.
- Treat unsupported, incomplete or invalid locale packs as deterministic English fallback.
- Keep outcome order stable and all non-approval outcomes non-authoritative.
- Keep missing artefacts as localized non-links and reject invalid or guessed paths.

## Minimal Clean Path

1. Extend the existing locale registry with reviewed user-gate action headings.
2. Extend the existing snapshot with semantic block IDs and pure sequence preflight; keep attachment non-enumerable.
3. Declare fail-closed canonical-value transport capability per adapter and protect it with integrity tests.
4. Synchronize generated surfaces and run focused, integrity, control-state and package smoke checks.
5. Complete TP Review, Clean Implementation Review and Code Review before QA.
