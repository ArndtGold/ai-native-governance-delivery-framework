# PRD: Quality Readiness Surface

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Date: 2026-07-15
Owner: agent

## 1. Product Outcome

After CD+Tests, AGDF presents one compact Quality Readiness projection that helps a user
understand the current quality state and next action without reading four similar reports.
The projection is derived from existing review and QA evidence. It does not create a new
authority, approval, report type or persistence model.

## 2. User Problem

The current sequence exposes `task-plan-review`, `clean-implementation-review`, `code-review`
and `qa-gate` as separate pass/revise/block-style outputs. Their formal questions differ, but
their visible shape and timing make them appear redundant to users without AGDF background.

## 3. Product Principles

- One visible quality picture; four auditable evidence owners.
- `qa-gate` is the only final `pass | revise | block` decision owner.
- A projection may summarize; it may not approve, suppress evidence or change gate authority.
- Show the decisive reason and next action before optional detail.
- Keep machine output and durable reports stable.

## 4. Primary Experience

Render a compact, localized card after the relevant review evidence exists and before the QA
decision is requested:

```text
Quality Readiness: <pass | revise | block>

Plan coverage       <status>
Solution integrity  <status>
Code quality        <status>
QA decision         <status>

Reason: <single decisive reason or none>
Next action: <single permissible next action>
Decision owner: QA Gate
```

The exact status vocabulary and aggregation rules must reuse canonical control state. The card
must link or name the underlying detailed reports without pasting their full bodies.

## 5. Detail Behavior

- On `pass`, keep the four rows compact and offer detail only when requested.
- On `revise` or `block`, expand the decisive row and evidence reference by default.
- If evidence is missing or conflicting, show `revise` or `block` according to canonical QA
  rules; never infer a green result from a passing build alone.
- Boundary explanations remain available in skill detail and runtime rules, but are not
  repeated as four visible disclaimers in the primary card.

## 6. Review Dimensions

| User-facing row | Canonical owner | Question |
|---|---|---|
| Plan coverage | `task-plan-review` | Was the approved Task Plan fulfilled? |
| Solution integrity | `clean-implementation-review` | Is the implementation structurally clean? |
| Code quality | `code-review` | Are correctness, regression, security and maintainability risks addressed? |
| QA decision | `qa-gate` | Can the delivery pass, must it revise, or is it blocked? |

## 7. Scope

- Extend the existing human-facing interaction/presentation contract with a derived Quality
  Readiness projection.
- Add deterministic labels, ownership and expansion rules to the canonical runtime guidance.
- Align router/plugin discovery copy so each review has one clear role.
- Preserve existing skill identifiers, detailed report formats, JSON fields and exact approvals.
- Add focused tests for row uniqueness, owner mapping, status aggregation, decisive-reason
  selection and no-authority behavior.

## 8. Non-Goals

- Merging or renaming the four skills.
- Creating a fifth review or a second QA decision.
- Replacing detailed reports or removing audit evidence.
- Changing gate order, approval formulas, aggregate severity semantics or host permission rules.
- Adding a dashboard, custom approval UI or new durable control-state model.

## 9. Acceptance Criteria

- A user can identify the single current quality outcome and next action from the compact card.
- All four dimensions appear exactly once with the canonical owner visible or deterministically
  recoverable.
- Only `qa-gate` is labeled as decision owner; other rows are explicitly evidence dimensions.
- `revise` and `block` expose one decisive reason and one permissible next action.
- Passing technical checks alone cannot produce a misleading `pass` card.
- Detailed reports, JSON output, exact approval values and durable artefact links remain intact.
- Runtime integrity, routing, focused interaction tests and package smoke pass.

## 10. Evidence And Risks

- Evidence must cover chat/compact presentation and machine-readable compatibility separately.
- Host-native rendering may impose shorter limits; primary, detail and machine projections must
  be defined before implementation.
- The projection must remain derived from canonical state to prevent a second authority model.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
