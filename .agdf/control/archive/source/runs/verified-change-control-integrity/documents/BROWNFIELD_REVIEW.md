# Brownfield Review: Verified Change Control Integrity and Proportionality

- revision: 2
- refreshed_for: approved UR revision 2

## Decision

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- related_ur: `.agdf/control/artefacts/verified-change-control-integrity/UR.md`

## Scope And Existing Ownership

The requested behavior already has clear canonical owners and focused test surfaces:

| Concern | Canonical owner | Derived or enforcing surfaces |
|---|---|---|
| Verified Change lifecycle and proportionality | `plugin/meta/agdf-runtime-contract.md` | Generated runtime-contract copies |
| Brownfield and closeout workflow guidance | `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/skills/release-or/SKILL.md` | Codex, Copilot and OpenCode generated skills |
| Native gate interaction contract and surface declaration | `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-plugin.definition.json`; `plugin/skills/gate-check/SKILL.md` | Interaction presentation builder, gate validator and generated surface definitions |
| Control-table parsing | `create-agdf/lib/control-state/run-state-parser.js` | `doctor`, `gate-check`, `delivery-map` |
| Verified Change scope enforcement | `create-agdf/bin/create-agdf.js` | Shared doctor/gate-check evaluator |
| Compact record schema | `plugin/control/templates/artefacts/VERIFIED_CHANGE.md` | Generated control templates |
| Regression proof | `create-agdf/scripts/control-state-test.js`; `create-agdf/scripts/verified-change-test.js`; `create-agdf/scripts/interaction-presentation-test.js` | `create-agdf` smoke aggregation |
| Propagation | `create-agdf/scripts/sync-package-assets.js` | `create-agdf/generated/**` |

The completed `pages-contact-email` run is reproduction evidence only. Its product paths remain outside this implementation scope.

## Current Coverage

- status: `partially_done`
- existing strengths: one canonical Runtime Contract, one parser, one Verified Change evaluator, focused fail-closed fixtures and deterministic generated-surface synchronization already exist.
- gaps: Brownfield guidance omits `verified_change`; artefact paths are not normalized consistently; permitted run-owned control paths are hard-coded too narrowly; the compact record is not yet allowed to carry Brownfield selection and mini-OR as one consolidated artefact; Codex `request_user_input` is declared merely `when_callable` even when its host-required recommendation decoration prevents exact canonical approval transport.

## Reuse Strategy

- strategy: `extend`
- parser: extend the existing table-cell normalization rather than introduce a second path parser.
- evaluator: derive permitted run-owned control paths from the selected run's normalized artefact links under its own control directory rather than add another static filename list.
- compact delivery: extend `VERIFIED_CHANGE.md` so the same record may serve as Brownfield evidence, eligibility/execution record and mini-OR for Verified Change only.
- native interaction: extend the existing surface capability declaration and preflight snapshot path; do not create a second approval validator and do not normalize decorated labels after input.
- propagation: continue using `sync-package-assets.js`; generated files remain derived, never hand-edited owners.

## Native Adapter Decision

The exact approval validator is correct and remains unchanged in authority: `Approval: PRD (Recommended)` is not `Approval: PRD`.

Before invocation, the surface adapter must prove either:

1. the visible option value remains exactly canonical; or
2. the host supports a separate display label and canonical returned value.

If neither can be proven, the interaction outcome is `unavailable_before_invocation` and AGDF immediately presents the exact-text fallback. The unavailable adapter is not invoked, so there is no futile native attempt and no user decision is discarded. Recommendation decoration may remain host-owned presentation only when it cannot alter the returned canonical value.

## Proportionality Decision

Do not create a `static_content` mode or a documentation/file-count exception. Static Pages copy is eligible only through the same generic Verified Change criteria as any other bounded user-visible change: one owner, bounded clean paths, explicit prohibited-impact exclusions, deterministic proof and structured escalation.

Proportionality comes from consolidating ceremony, not weakening eligibility: after approved UR, Brownfield Review may create a draft `VERIFIED_CHANGE.md` and link that same file as Brownfield Review evidence. After execution, its Mini-Closeout may satisfy compact OR and the run may link the same file as OR. Separate `BROWNFIELD_REVIEW.md` and `OR.md` remain valid but are not mandatory for an eligible Verified Change.

## Impact And Compatibility

- interfaces: existing Markdown control-state schema and `doctor`/`gate-check` JSON semantics are extended without a new public command.
- interaction compatibility: exact textual approvals remain universal; native controls become capability-gated rather than merely callable-gated.
- persistence or migration: none; legacy plain paths and separate Brownfield/OR artefacts remain valid.
- safety: normalization must strip only complete Markdown code spans before repository-relative safety checks; it must never relax path traversal rejection.
- active execution: newly introduced unlisted paths still fail closed.
- completed history: a completed executed record should retain field/evidence validation but must not be retroactively invalidated by later unrelated worktree changes.
- generated surfaces: all canonical skill/runtime/template changes must propagate through the existing sync script.

## Risks

- over-permissive control-path derivation could hide a real scope escape; mitigate by accepting only normalized paths beneath `.agdf/control/artefacts/<selected_run_id>/` that are explicitly linked from that run.
- compact multi-role records could blur evidence roles; mitigate with explicit Brownfield Selection, Eligibility, Execution Evidence and Mini-Closeout sections and distinct run-state artefact rows.
- completed-run live-worktree exemption could hide an incomplete active change; apply it only when run lifecycle is `completed` and record status is `executed`.
- stale or inaccurate adapter capability metadata could suppress a usable native control or invoke an unsafe one; fail closed to exact text and add negative fixtures for decorated-only transport.
- generated-surface drift; mitigate with sync plus runtime-integrity and smoke tests.

## Context Graph Impact

- impact: `update_existing_node`
- reference: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- reason: the change refines the existing proportional-ceremony boundary and its fail-closed evidence model.

## Missing Evidence And Open Questions

- PRD must define the externally observable consolidated-record behavior and compatibility boundary.
- SD must decide the exact parser/evaluator derivation and record-section schema.
- SD must define one capability vocabulary for exact-value transport and its deterministic pre-invocation decision; no post-response stripping is allowed.
- the completed-run live-worktree behavior is included because it is a direct lifecycle defect in the same evaluator; it must retain record/evidence validation.

## Required Next Step

Draft the smallest PRD for this structured slice and request exact `Approval: PRD`. Implementation remains forbidden.
