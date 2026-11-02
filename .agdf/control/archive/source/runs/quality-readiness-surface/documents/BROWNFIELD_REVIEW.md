# Brownfield Review: Quality Readiness Surface

Gate: Brownfield Review
Type: Brownfield Review
Status: done

## Review Meta

- mode: `post_ur_review`
- run_id: `quality-readiness-surface`
- related_ur: `.agdf/control/artefacts/quality-readiness-surface/UR.md`
- reviewed_at: 2026-07-15
- reviewer: agent

## Review Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- reuse_strategy: `extend_existing_owners`

## Existing-System View

| Area | Existing owner or artefact | Coverage | Impact |
|---|---|---|---|
| Review semantics | `plugin/skills/task-plan-review/SKILL.md`, `clean-implementation-review/SKILL.md`, `code-review/SKILL.md` | `fully_done`: distinct responsibilities and reports already exist | high |
| Final QA decision | `plugin/skills/qa-gate/SKILL.md` | `fully_done`: sole `pass | revise | block` authority | high |
| Shared runtime rules | `plugin/meta/agdf-runtime-contract.md` | `partially_done`: boundaries and aggregate status rules exist; no compact quality-readiness projection | high |
| Skill routing and discovery | `plugin/meta/agdf-agent-router.md`, `plugin/meta/agdf-plugin.definition.json`, `pages/src/data/skills.ts` | `partially_done`: skills are discoverable and correctly separated, but visible differentiation is weak | medium |
| Human interaction projection | `create-agdf/lib/interaction-presentation.js`, Run Status Card contract | `partially_done`: status and gate cards exist; post-review synthesis is not a dedicated projection | high |
| Aggregate quality state | `create-agdf/lib/control-state/aggregate.js` | `fully_done`: deterministic severity aggregation exists and can support a summary | medium |

## Reuse And Parallel-Structure Risk

| Finding | Risk | Required action |
|---|---|---|
| Four skills already own distinct evidence questions. | A new review skill would duplicate authority and increase routing complexity. | Extend shared presentation and routing copy; do not add a fifth review. |
| `qa-gate` is explicitly the only final decision point. | A separate Quality Readiness status could be mistaken for QA authority. | Make it a projection with an explicit `qa-gate` decision-owner row. |
| Aggregate status ordering already exists. | A UI-specific severity algorithm could drift from machine state. | Reuse the canonical aggregate and define only human labels/copy in the PRD. |
| Chat, CLI and native surfaces have different display limits. | A single verbose report shape would flood some hosts. | Define primary, detail and machine projections before implementation. |

## Impact Assessment

- files/modules: runtime contract, router/plugin discovery copy, interaction presentation and
  aggregate projection; four skill help/summary surfaces may receive concise role labels.
- interfaces: human-facing post-review status; existing JSON fields, report paths, approval
  formulas and skill identifiers remain stable.
- data model/migrations: no new authority model or durable state required; a presentation
  projection may be derived from existing review and QA statuses.
- regression tests: focused projection/collision tests, runtime-integrity checks, routing and
  package smoke checks.
- side effects: users see one synthesized quality picture before QA; formal detail remains
  available and no gate is advanced by the projection.

## SoT And Product-Semantics Findings

This is a user-visible orchestration change, not a documentation-only change. The Runtime
Contract remains normative. The Quality Readiness surface must remain a derived presentation
projection and must not become a second approval, QA or review authority.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: existing review separation, aggregate quality state and human decision
  surface boundaries
- context_graph_required_action: link the new reusable presentation invariant if the PRD makes
  it stable across supported surfaces
- context_graph_gate_effect: none

## Transparency

`structured_slice` is the smallest safe path. Quick Task is not appropriate because the change
alters normative user-visible review orchestration across runtime and host-facing surfaces.
Full structured delivery is not required yet because the existing owners, aggregate state and
authority boundaries are known; a focused PRD must define the exact projection, labels,
expansion rules and evidence behavior.

## Missing Evidence

- No live first-time-user observation of the current four-review sequence was collected.
- Host-specific display limits for the compact projection require validation in the PRD/SD.
- The exact aggregate-to-human-label mapping must be specified before implementation.

## Next Permissible Step

- next_allowed_action: Draft the focused PRD for the Quality Readiness projection.
- forbidden_until_then: SD, TP, implementation, QA, UAT and release claims.

## Quality Outlook

Keep the four formal review owners intact while making `qa-gate` the visible decision anchor and
deriving one compact, evidence-linked quality projection from existing state.
