# PRD: Complete Approval Orientation

Status: approved
Gate: PRD
Based on: `.agdf/control/artefacts/approval-orientation-completeness/UR.md` and
`.agdf/control/artefacts/approval-orientation-completeness/BROWNFIELD_REVIEW.md`
Date: 2026-07-15
Owner: AGDF
Gate approval: `Approval: PRD` provided on 2026-07-15 after same-run/same-gate revalidation.

## 1. Product Outcome

Every ready AGDF user-gate approval presents complete orientation before the
native question or exact-text fallback: first a compact operational Run Status
Card, then a decision-focused Gate Transition Card. Both views are derived from
the same selected and revalidated run state and remain non-authorizing.

## 2. User Problem

A native approval control without operational status can feel contextless. A
transition card alone explains the decision consequence but does not provide
the stable run-level status users expect. Conversely, the complete diagnostic
dashboard is too dense for an approval moment. The product needs both concepts
with explicit, non-duplicative responsibilities.

## 3. Required Experience

### 3.1 Fixed ordering

For every ready user gate (`UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`), the visible
sequence is exactly:

1. compact Run Status Card;
2. Gate Transition Card;
3. one native approval question, or the one exact-text fallback.

The two cards must be separate visible interaction blocks. Neither may be
hidden in the question payload, button description or tool context.

### 3.2 Compact Run Status Card responsibility

The approval-time status card answers only the stable operational questions:

- which run is selected;
- whether it is ready or blocked;
- which gate is current;
- which exact approval is missing;
- what the single next allowed action is;
- what the current quality outlook is.

It uses human-readable localized labels. It does not include full evidence,
diagnostic codes, raw keys, allowed/forbidden inventories or machine values.
The complete operational and JSON projections remain available in detail and
CLI surfaces.

### 3.3 Gate Transition Card responsibility

The transition card answers only:

- what the current decision does;
- which authority boundary remains;
- what happens immediately after approval and which actual user gate follows.

It retains the current human title, run context and `UR · PRD · SD · TP`
artefact links. It must not repeat the status rows or the native question.

### 3.4 One-source consistency

Both cards and the question must be built from one immutable presentation
snapshot produced after selected-run and current-gate readiness evaluation.
Immediately after deliberate input and before persistence, canonical gate
evaluation must revalidate the same `run_id`, expected gate and required
artefact. The presentation snapshot never authorizes or persists approval.

### 3.5 Non-ready behavior

Ambiguous run, stale gate, missing artefact, blocked state or incomplete
readiness must suppress the native gate question. Status, clarification and
blocked interactions continue to use their existing primary presentation; the
two-card approval sequence applies only to a ready `gate_approval`.

### 3.6 Native and fallback parity

The same two-card sequence precedes the first eligible native attempt and the
exact-text fallback. A failed native attempt does not cause either card to be
repeated and does not create a retry loop. Exact approval values and authority
remain unchanged.

## 4. Scope

- Amend the canonical Runtime Contract and `gate-check` instructions.
- Extend the existing shared interaction-presentation and locale owners.
- Preserve current native adapter declarations and gate persistence.
- Add deterministic fixtures for every user gate and non-ready suppression.
- Synchronize generated plugin surfaces through the existing asset workflow.

## 5. Non-Goals

- No custom host UI or repository-owned button renderer.
- No second gate evaluator, approval store, persisted presentation snapshot or
  automatic run selection.
- No third approval card and no embedding of Quality Readiness as another gate
  authority surface.
- No retroactive change to the UAT decisions of `native-gate-buttons-live` or
  `agdf-human-decision-surface`.
- No claim that every host renders native controls identically.

## 6. Acceptance Criteria

- A ready gate always renders the compact Run Status Card, then Gate Transition
  Card, then exactly one approval interaction.
- Both cards identify the same selected run and current gate and derive from one
  immutable, non-authorizing presentation snapshot.
- The compact status card contains exactly the six operational fields defined
  in section 3.2 and no raw keys, diagnostics, evidence lists or inventories.
- The transition card contains decision effect and next-transition copy without
  duplicating the status fields or native question.
- Native and exact-text paths preserve the same order, locale, exact approval
  token, no-retry rule and post-response revalidation boundary.
- Ambiguous, stale, missing-artefact and blocked fixtures show no native gate
  question and no misleading ready-state two-card composition.
- Tests cover all six user gates, German and English, incomplete-locale fallback,
  revise, decline, cancel/no-response and stale revalidation.
- Existing machine-readable CLI/JSON fields remain backward compatible.
- Runtime Integrity verifies canonical/generated alignment and rejects removal
  or reversal of the two-card requirement.

## 7. Evidence Boundary

Repository tests can prove composition, order, content boundaries, locale,
fallback and authority invariants. Host-native visual rendering remains a UAT
observation and must be reported separately rather than inferred from tests.

## 8. Related Scope

`agdf-human-decision-surface` remains an independent predecessor run with its
own UAT boundary. This PRD extends the resulting presentation ownership for a
new approved requirement; it does not reopen or rewrite that run's acceptance.

## 9. Approval

Exact `Approval: PRD` was provided on 2026-07-15 after same-run/same-gate
revalidation. Solution Design is now allowed; implementation remains forbidden.
