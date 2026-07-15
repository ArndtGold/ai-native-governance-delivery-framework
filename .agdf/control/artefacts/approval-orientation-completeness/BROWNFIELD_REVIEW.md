# Brownfield Review: Approval Orientation Completeness

Status: done
Mode: post_ur_review
Decision: pass
Date: 2026-07-15
Owner: AGDF

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/approval-orientation-completeness/BROWNFIELD_REVIEW.md`
- scope: Deliberately revise the existing approval-time presentation boundary
  so a compact operational Run Status Card and the decision-focused Gate
  Transition Card are both shown before native or exact-text gate approval.
- evidence: `plugin/meta/agdf-runtime-contract.md` and
  `plugin/skills/gate-check/SKILL.md` explicitly forbid both cards today;
  `agdf-human-decision-surface` owns the shared human-presentation model and is
  awaiting separate live UAT; `native-gate-buttons-live` owns the native-first
  transition-card path and has a historical declined UAT; the completed
  `quality-readiness-surface` remains a separate post-review projection.
- transparency: Quick Task is unsafe because the requested behavior reverses a
  normative product rule across runtime guidance, interaction copy and tests.
  Full structured delivery is unnecessary at this stage because the existing
  owners and adapters can be extended; PRD must first define the compactness,
  non-duplication and authority boundary of the two-card composition.
- missing_evidence: Direct cross-host rendering remains unavailable. It is not
  required for PRD, but later UAT must keep repository-proven behavior separate
  from host-rendering evidence.
- current_coverage: `partially_done`. Both cards and their shared canonical
  state already exist, but the approval-time product contract currently chooses
  the Gate Transition Card alone and treats the Run Status Card as audit/detail
  input. No canonical two-card ordering or compact status subset exists.
- reuse_strategy: `extend`. Reuse the Runtime Contract, `gate-check`, locale
  registry, interaction-presentation helper and current integrity/control-state
  test owners. Do not add a second renderer, gate evaluator, approval store or
  persisted presentation state.
- risks: Showing the full operational dashboard would recreate the cognitive
  overload that the transition card removed; duplicated or stale state could
  undermine trust; changing the active `agdf-human-decision-surface` UAT scope
  silently would invalidate its acceptance boundary.
- context_graph_impact: `none`; this is a bounded refinement of existing
  approval-presentation ownership, with linked run artefacts sufficient for
  traceability.
- required_next_step: Draft a bounded PRD that defines one-source derivation,
  exact ordering, compact Run Status Card content, non-duplication rules,
  stale/ambiguous suppression and cross-surface evidence boundaries; then
  request exact `Approval: PRD`.

## Existing Ownership And Reuse

| Area | Existing owner | Coverage | Required treatment |
|---|---|---|---|
| Gate and approval authority | Canonical run state and gate evaluation | fully_done | Preserve unchanged. |
| Approval-time transition copy | Runtime Contract and `gate-check` | fully_done for one-card behavior | Extend the composition rule. |
| Operational status projection | Run Status Card and interaction-presentation helper | fully_done outside approval-time primary view | Define a compact approval-safe subset; do not paste the diagnostic dashboard. |
| Human primary interaction model | `agdf-human-decision-surface` | partially_done; separate UAT pending | Link as predecessor and preserve its historical UAT boundary. |
| Native adapter behavior | `native-gate-buttons-live` | partially accepted; historical UAT declined | Reuse native-first and fallback semantics without reopening that run. |
| Quality Readiness | `quality-readiness-surface` | completed | Keep separate; it must not become a third approval card. |

## Parallel-Structure Boundary

The solution must remain a presentation composition derived from one selected,
revalidated run. A second status model, second card renderer, copied locale
pack, approval cache or host-specific gate policy would be a blocking defect.
