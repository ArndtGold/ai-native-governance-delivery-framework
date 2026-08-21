# User Requirements: Approval Orientation Internal-Step Integrity

Status: `approved`
Gate: UR
Revision: 1
Date: 2026-08-21
Run: `approval-orientation-internal-step-integrity`
Gate approval: exact `Approval: UR` on 2026-08-21 after same-run, same-gate, Revision-1 and durable-artefact revalidation

## 1. Problem

The canonical approval-orientation renderer describes the immediate post-approval process step as
the next user decision whenever `next_gate_after_approval` is not `none`. For `Approval: UR`, this
produces a transition such as "Brownfield Review is the next user decision" even though Brownfield
Review is an internal mandatory step and the canonical status card correctly reports
`next_user_gate: none` and `user_action_required: no`.

The snapshot validator reconstructs the same incorrect sentence from `next_gate_after_approval`, so
it accepts the faulty projection instead of detecting it. The defect can mislead the user about who
must act next, but no authority bypass or invalid persisted approval has been observed.

## 2. Expected Behaviour

- The transition card continues to name the immediate internal or process step after approval.
- Its user-decision sentence is derived from `next_user_gate` and `user_action_required`, not from
  the immediate process step.
- When no user action is required, the localized canonical no-action narration is rendered.
- When a genuine next user gate exists, the existing localized next-decision narration remains.
- Snapshot validation rejects a projection that contradicts the canonical status-card semantics.

## 3. Requirements

### AOI-1 — Preserve the immediate transition

Keep `next_gate_after_approval` as the owner of the immediate post-approval process step and preserve
the existing `next_gate` output field.

### AOI-2 — Derive user action from user-action fields

Derive the user-decision part of `next_transition` from `next_user_gate` and
`user_action_required`. An internal next step must not be presented as a user decision.

### AOI-3 — Fail closed on inconsistent inputs

The builder and validator must reject contradictory or incomplete post-approval user-action
semantics instead of guessing from `next_gate_after_approval`.

### AOI-4 — Avoid same-bug validation

Builder and validator must use one necessarily coupled semantic derivation so the validator does not
independently reproduce the same faulty rule.

### AOI-5 — Regression coverage

Automated tests must cover at least:

- UR in English and German: Brownfield Review remains the immediate next step, with localized
  no-user-action narration and no "next user decision" claim;
- TP in English and German: Brownfield Analysis remains the immediate next step, with the same
  no-user-action boundary;
- a gate with a genuine next user decision retains the existing localized decision narration;
- contradictory user-action fields fail closed.

### AOI-6 — Compatibility

Do not change gate names, gate order, approval formulas, schema field names, persistence semantics or
the interaction contract's authority boundary.

## 4. Fix Boundary

The implementation candidate is limited to the approval-orientation snapshot construction and its
necessarily coupled validation in `create-agdf/lib/interaction-presentation.js`, plus directly
affected regression tests. Locale copy and normative contracts change only if Brownfield Review
finds that the existing canonical strings are insufficient; the current evidence indicates they are
already sufficient.

Any need for a new schema field, new product semantics, a second presentation owner or changes beyond
this boundary escalates the run before implementation.

## 5. Non-Goals

- no change to the Codex harness conformance scope;
- no new approval or gate type;
- no redesign of the approval cards;
- no host-specific presentation implementation;
- no automatic VCS, package, release, reinstall or live-host action;
- no claim that repository tests prove installed-cache or authenticated-host behaviour.

## 6. Evidence Plan

- reproduce the current UR and TP projections in both supported locales;
- add focused semantic assertions to the interaction-presentation suite;
- run the directly affected interaction and control-state tests;
- run `doctor` and the package smoke/runtime-integrity checks required by the selected path;
- perform mandatory Code Review and record OR/QA evidence required by the selected path;
- keep installed-package and direct-host evidence separate from repository evidence.

## 7. Source Of Truth

- `plugin/meta/contracts/interaction.md` owns the internal-step versus user-decision boundary;
- `plugin/meta/contracts/gate-transition.md` owns post-approval transitions;
- `create-agdf/lib/control-evaluation/gate-check.js` provides the canonical status-card fields;
- `create-agdf/lib/interaction-presentation.js` builds and validates approval orientation;
- `plugin/meta/agdf-interaction-locales.json` owns localized no-action and next-decision copy.

## 8. Open Questions

- Brownfield Review must confirm whether the implementation can satisfy the Narrow Code-Fix
  Criterion or requires a larger verified path.
- Direct-host evidence is not required to prove repository correctness, but remains unverified until
  a released and installed surface is observed separately.

## 9. Gate Boundary

This UR does not authorize implementation. After exact `Approval: UR`, the next internal step is
Brownfield Review and a visible Mode/Slice Decision.

Exact approval value:

`Approval: UR`
