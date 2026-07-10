# Brownfield Review: Reduce Documentation Ceremony For Trivial, Non-Normative Changes

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-micro-tier-below-quick-task
- related_ur: .agdf/control/artefacts/agdf-micro-tier-below-quick-task/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Size and route the approved UR scope: an explicit, narrow, path-based boundary for trivial
non-normative changes, and a Runtime Contract amendment allowing such changes to skip the full
`AGDF_RUN.md` in favor of the existing compact Quick Task Output shape.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/agdf-runtime-contract.md` ("Mode Selection", "Quick Task Output", "Relevant Run") | This changes what ceremony a `quick_task` run requires — governance product semantics, even though narrowly scoped | medium |
| Source of truth | `plugin/meta/agdf-runtime-contract.md` is the single normative source for gate/output rules | Must stay the single source; no duplicate rule table in skills | medium |
| Runtime path | `plugin/control/templates/AGDF_RUN.md` (single template, no size variant); `plugin/skills/gate-check/SKILL.md`; `plugin/skills/release-or/SKILL.md` | Confirmed only one `AGDF_RUN.md` template exists, applied regardless of run size | high |
| UI / UX | none | | none |
| Persistence / data | `create-agdf/scripts/sync-package-assets.js` propagates `plugin/meta/` and `plugin/control/templates/` into generated Codex/Claude/Copilot/OpenCode surfaces | Any Runtime Contract wording change must be confirmed to propagate through the existing sync, across all four surfaces | medium |
| Tests / QA | `create-agdf/bin/create-agdf.js` (`doctor` validation logic) | Not yet confirmed whether `doctor` assumes `AGDF_RUN.md` must always exist once `.agdf/control/` is live — open question for PRD | medium |
| Release / operations | none | | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A new "when can we skip the file" rule risks becoming a second, informal gate/tier model if it isn't tied tightly into the existing Quick Task Output shape | UR scope note; existing `Mode Selection` table already distinguishes Quick Task Mode vs Structured Delivery Mode | warn | Express the fix as a boundary clarification inside the existing "Quick Task Output" / "Relevant Run" sections, not as a new named tier or a competing section |
| A prose-only "trivial" boundary is not mechanically checkable and can be argued around under time pressure | This session's own critique: heavy documentation load is exactly what teams skip under pressure | warn | Define the boundary as explicit file path prefixes in the Runtime Contract text itself, so it is deterministic rather than a judgment call |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: This introduces new governance product semantics (an explicit ceremony-skip boundary
  inside the mode model), touches a normative document (`agdf-runtime-contract.md`) and must propagate
  correctly across four generated surfaces plus possibly `doctor` validation logic. That exceeds
  `quick_task`'s requirement of "no new product semantics beyond the approved UR, no
  architecture/policy/persistence/contract expansion." The change stays narrow and boundable, so full
  `structured_delivery` is not warranted either.
- evidence: Confirmed single `AGDF_RUN.md` template with no size variants
  (`plugin/control/templates/AGDF_RUN.md`); confirmed existing but underspecified "Quick Task Output"
  and "Relevant Run" sections in `agdf-runtime-contract.md`; confirmed `doctor`/vocabulary logic lives
  in `create-agdf/bin/create-agdf.js`, not yet checked for an `AGDF_RUN.md`-presence assumption.
- transparency_note: The next allowed action is drafting a small PRD, not implementation.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Does `doctor` currently assume `AGDF_RUN.md` must exist whenever `.agdf/control/` is live? | PRD | `revise` if yes and unaddressed |
| Should a skipped-file run still require a one-line `MASTER_BACKLOG.md` pointer, or can some trivial runs skip the backlog entirely? | PRD | `warn` |

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: `plugin/meta/agdf-runtime-contract.md`, `plugin/control/templates/AGDF_RUN.md`, `create-agdf/bin/create-agdf.js`
- context_graph_required_action: `create`
- context_graph_gate_effect: none
- context_graph_evidence: Durable, reusable Brownfield finding — ceremony weight is structural (template-driven, one-size-fits-all), not agent over-application; the fix boundary must be path-based to avoid becoming a scope-creep loophole. Worth surviving this run so future work does not rediscover it. Node creation deferred to this run's closeout/OR.

## Next Permissible Step

- next_allowed_action: Draft a small PRD scoping the exact non-normative boundary and the Runtime Contract amendment; request `Approval: PRD`.
- forbidden_until_then: Implementation, changes to `AGDF_RUN.md` template, Runtime Contract edits, `doctor` logic changes.

## Quality Outlook

- quality_outlook: Once resolved, this closes the exact gap identified in this session's project evaluation — trivial changes will carry proportionate ceremony while runtime-governing changes keep full rigor.
