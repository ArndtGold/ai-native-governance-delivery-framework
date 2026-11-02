# Brownfield Review

## Review Meta

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- workstream: `verified-change-path`
- related_ur: `.agdf/control/artefacts/verified-change-path/UR.md`

## Scope

Add a new fail-closed `verified_change` lifecycle path. It must sit between the existing non-normative Trivial Change boundary and structured work, and it must be enforced consistently across the canonical Runtime Contract, gate transitions, durable state parsing, templates, agent guidance, package propagation and regression tests.

## Existing Owners And Evidence

| Owner | Existing artefact / implementation | Finding |
|---|---|---|
| Canonical lifecycle and transition terms | `plugin/meta/agdf-runtime-contract.md` | Owns the Trivial Change boundary, Quick Task Output, Mode/Slice values and canonical gate transition table. It currently permits only `quick_task`, `structured_slice`, `structured_delivery` and `block`. |
| Runtime guidance | `plugin/meta/agdf-agent-router.md`, `plugin/meta/agdf-tenets.md`, `plugin/meta/agdf-constitution.md` | Repeats selected guidance and mode terminology but must not own a second complete transition table. |
| Durable templates | `plugin/control/templates/AGDF_RUN.md`, `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` | Restrict mode fields to the existing values and guide persisted decisions. |
| Executable control model | `create-agdf/bin/create-agdf.js` | Owns parser vocabulary, transition decisions, next skills and JSON status output. |
| Deterministic coverage | `create-agdf/scripts/control-state-test.js`, package smoke tests, `plugin/scripts/check-runtime-integrity.mjs` | Already protects late gates, heading compatibility and selected Runtime Contract/guidance invariants; no Verified Change fixtures or validator exists. |
| Propagation | `create-agdf/scripts/sync-package-assets.js` | Copies canonical plugin/runtime assets to packaged surfaces. |
| Existing decision boundary | `CG-DOCUMENTATION-CEREMONY-BOUNDARY` | Explicitly protects the path-based Trivial Change boundary and requires ambiguity to fail closed. |

## Current Coverage

- `fully_done`: path-based Trivial Change boundary, narrow code-fix criterion, Quick Task compact output, structured paths, canonical transition table, parser/transition test infrastructure and generated-surface propagation.
- `partially_done`: existing `quick_task` can be chosen after Brownfield Review, but it cannot express machine-evidenced eligibility for bounded user-visible canonical metadata changes; normative path touch forces structured ceremony.
- `not_done`: `verified_change` vocabulary, eligibility contract, compact record, transition/validator support, deterministic acceptance and escalation coverage.

## Reuse Strategy

- strategy: `extend`
- reuse: existing Mode/Slice Decision, Quick Task compact-output conventions, canonical runtime transition model, control-state parser, integrity checker, package sync and regression-test harness.
- no parallel model: add the new mode only to the canonical Runtime Contract; all other surfaces derive or reference it.
- no exception list in chat or skill prose: deterministic conditions and a single canonical transition owner are required.

## Impact Assessment

- files/modules: canonical Runtime Contract; selected meta guidance; control templates; control-state parser and transition logic; doctor/gate-check validation; tests; generated surface sync.
- interfaces: user-visible gate status, durable control-record vocabulary and agent guidance.
- compatibility: existing modes and selected run records must remain parseable; legacy headings remain unaffected.
- data/migration: no data migration, but existing records that lack `verified_change` must retain current semantics.
- regression risk: high if a new mode bypasses approvals or if a malformed record silently selects the light path; requires explicit disqualifier and escalation tests.
- security/policy risk: eligibility must prohibit permission, security, persistence, architecture, gate and external-behavior changes.

## SoT And Product-Semantics Findings

This is a governance-runtime and product-semantics change, not a documentation tweak. The canonical Runtime Contract must decide the conditions; executable parser/transition logic must enforce them. A prose-only “light path” would become a loophole and is rejected.

## Context Graph Impact

- context_graph_impact: `update_required`
- context_graph_ref: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- rationale: the existing node owns the decision boundary that this work intentionally extends. It must record the new mode, its fail-closed conditions, relationship to Trivial Change and the qualifying worked example.

## Transparency

`structured_delivery` is required. Although the desired user path is compact, implementing it changes core governance semantics and a multi-owner executable runtime. It cannot legitimately use the path it is defining, and it needs PRD, SD and TP depth to prove that it does not weaken current controls.

## Missing Evidence

- The PRD must decide the exact eligibility fields, which conditions are checked mechanically versus evidenced in the compact record, and the precise escalation behavior.
- The SD must decide whether `verified_change` uses a dedicated artefact name, a constrained Quick Task Output variant, or both without introducing a second source of truth.

## Required Next Step

Draft the PRD for the fail-closed Verified Change path. Do not change Runtime Contract, parser, templates or tests before `Approval: PRD`.
