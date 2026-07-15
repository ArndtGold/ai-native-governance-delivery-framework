# User Requirements: Approval Orientation Completeness

Status: approved
Gate: UR
Owner: AGDF
Date: 2026-07-15
Gate approval: `Approval: UR` provided on 2026-07-15 after same-run/same-gate revalidation.

## Objective

Make native AGDF gate approvals consistently orienting by presenting both the
operational Run Status Card and the decision-focused Gate Transition Card from
one selected, revalidated control state before a native approval control.

## Scope

- Define a concise two-card approval presentation that preserves the distinct
  operational and decision purposes of both cards.
- Require both cards before the first native approval attempt and before the
  exact-text fallback.
- Preserve exact approval tokens, localized presentation, selected-run and
  stale-gate revalidation, ambiguity suppression and non-authorizing cards.
- Add deterministic coverage for ready, ambiguous, stale, fallback and
  decline/revise outcomes.

## Out Of Scope

- A custom host UI, a second approval store, automatic approval, automatic
  retry, or a changed gate authority model.
- Reopening or changing the current UAT scope of `agdf-human-decision-surface`.

## Acceptance Criteria

- No native gate approval is presented without both cards derived from the
  same selected run and current gate.
- The cards remain concise, localized and non-duplicative while preserving the
  operational status and transition consequence needed for a decision.
- Ambiguous, stale, missing-artefact and unavailable-native cases suppress the
  native approval control and retain exact-text authority boundaries.
- Tests cover the two-card ordering and the no-authorization/no-retry rules.

## Approval

Exact `Approval: UR` was provided on 2026-07-15 after this artefact and the
selected run were revalidated at gate UR.
