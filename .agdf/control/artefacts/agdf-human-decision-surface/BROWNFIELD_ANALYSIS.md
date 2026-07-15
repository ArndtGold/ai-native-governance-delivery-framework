# Brownfield Analysis: Human Decision Surface

Status: done
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-07-14
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/TP.md`

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: none
- artefact: `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_ANALYSIS.md`
- scope: Implement HDS-01 through HDS-15 by extending the existing Gate Transition Card, Run Status Card and native-interaction owners without changing gate authority or JSON compatibility.
- evidence: `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; `plugin/meta/agdf-plugin.definition.json`; `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/bin/create-agdf.js`; `create-agdf/lib/control-state/run-state-parser.js`; `create-agdf/scripts/smoke-test.js`; `create-agdf/scripts/sync-package-assets.js`.
- transparency: PRD, SD and TP are already approved. This analysis opens CD+Tests only because the existing semantic, presentation, adapter, generated-copy and test owners are identified and the implementation can extend them without a second gate evaluator or persisted state model.
- missing_evidence: Live rendering details remain host-owned and cannot be proven by repository tests alone; repository verification can prove payload semantics, ordering, fallback, links, locale resolution and authorization boundaries.
- current_coverage: partially_done. Approval-time Gate Transition Card guidance, exact approval revalidation, native-first fallback behavior, English/German CLI status labels, adapter declarations and generated-surface checks already exist. Extensible locale packs, one shared presentation helper, full outcome normalization, deterministic human titles, canonical artefact-link projection and all-gate/long-locale tests are not yet implemented.
- reuse_strategy: extend the Runtime Contract and `gate-check`; refactor hard-coded CLI labels into a pure shared presentation module; extend the existing plugin definition; reuse parsed selected-run artefact paths; extend runtime-integrity and smoke tests; propagate through the existing package asset synchronizer. Add only the canonical locale registry and shared pure presentation helper required by the approved SD.
- risks: instruction-driven native adapters cannot guarantee host rendering; Markdown-link behavior varies by host; incomplete language packs must fail to English; a helper that evaluates gates or persists approvals would create forbidden parallel ownership; broad CLI output changes could regress consumers unless JSON remains unchanged.
- context_graph_impact: link_only. The durable run and this analysis link the reusable decision-surface invariants; no new Context Graph node is justified before implementation evidence establishes a stable reusable owner.
- required_next_step: Enter CD+Tests and implement the approved TP in owner-first order: canonical locale data and pure presentation helpers, focused tests, runtime/skill/adapter integration, generated synchronization and full verification.

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

## Compatibility And Regression Boundary

- Preserve exact `Approval: <GateName>` values, existing gate evaluation and persisted approval workflow.
- Preserve all existing JSON keys and machine values; localization affects human projections only.
- Preserve host-owned UI chrome, technical permission controls and dismissal behavior.
- Treat unsupported, incomplete or invalid locale packs as deterministic English fallback.
- Keep outcome order stable and all non-approval outcomes non-authoritative.
- Keep missing artefacts as localized non-links and reject invalid or guessed paths.

## Minimal Clean Path

1. Introduce one validated locale registry and one pure presentation module with no persistence or gate authority.
2. Cover locale, title, artefact, option and outcome semantics with focused unit fixtures.
3. Refactor the human CLI projection and extend runtime/skill/adapter declarations to use the same contract.
4. Synchronize generated surfaces and run focused, integrity, control-state and package smoke checks.
5. Complete TP Review, Clean Implementation Review and Code Review before QA.
