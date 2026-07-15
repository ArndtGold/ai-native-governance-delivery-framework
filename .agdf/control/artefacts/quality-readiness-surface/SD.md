# SD: Quality Readiness Surface

Status: approved
Gate: SD
Gate approval: `Approval: SD`
Date: 2026-07-15
Owner: agent

## 1. Design Decision

Add a derived Quality Readiness presentation projection at the existing human-interaction
presentation boundary. The projection consumes existing review/QA evidence and renders a compact
human view. It does not persist a second status, decide a gate, or replace any formal report.

## 2. Ownership

| Concern | Canonical owner | Quality Readiness role |
|---|---|---|
| Approved plan coverage | `task-plan-review` | Supplies the Plan coverage row and evidence link |
| Implementation structure | `clean-implementation-review` | Supplies the Solution integrity row and evidence link |
| Diff defects | `code-review` | Supplies the Code quality row and evidence link |
| Final delivery decision | `qa-gate` | Supplies the QA decision row, decisive reason and next action |
| Severity aggregation | `create-agdf/lib/control-state/aggregate.js` | Supplies deterministic overall status ordering |
| Human rendering | `create-agdf/lib/interaction-presentation.js` | Formats primary/detail projections only |
| Normative rules | `plugin/meta/agdf-runtime-contract.md` | Defines authority and projection boundaries |

## 3. Projection Contract

### Primary human projection

```text
Quality Readiness: <status>

Plan coverage       <status>
Solution integrity  <status>
Code quality        <status>
QA decision         <status>

Reason: <decisive reason or none>
Next action: <single permissible next action>
Decision owner: QA Gate
```

The primary projection is localized, compact and free of raw machine keys. It must not include
full report bodies, duplicate approval questions or a second gate decision.

### Detail projection

The detail view adds the affected row's canonical owner, report path/link, evidence summary and
blocking or missing-evidence reason. It is shown by default only for `revise`, `block` or an
explicit detail request.

### Machine projection

Existing JSON fields remain authoritative and backwards compatible. If a new field is required,
it must be additive, derived, documented and covered by negative tests proving that it cannot
authorize a transition. Human labels must not replace machine status values.

## 4. Status Rules

- Overall status is derived using the existing canonical aggregate severity ordering.
- `block` dominates `revise`, which dominates `warn`, which dominates `pass`.
- Missing or conflicting required evidence cannot be rendered as `pass`.
- The QA row remains the only row that represents a final gate decision.
- A non-pass supporting review may produce a `revise`/`block` quality result, but never advances
  or declines a gate by itself.
- The decisive reason is selected deterministically from the highest-severity actionable finding;
  ties preserve canonical source order.

## 5. Surface Adapters

- Chat/native: render the primary projection before any QA decision interaction; use detail only
  when needed and keep exact approval text separate.
- Compact CLI/status card: render the same human labels and next action without raw snake_case
  fields.
- JSON: preserve machine projection and add only tested additive fields if implementation proves
  them necessary.
- Pages/help: explain the four roles as one review-to-QA flow, not as four competing verdicts.

## 6. Compatibility And Boundaries

- Existing skill identifiers, help commands, report templates, approval formulas, run state and
  aggregate status fields remain stable.
- No new review skill, report type, approval store, gate or host-native UI is introduced.
- Existing detailed reports remain the audit source; the projection links to them rather than
  copying their bodies.
- The projection is presentation-only and cannot be accepted as `Approval: QA`.

## 7. Validation Design

- Pure presentation tests: exactly four unique rows, canonical owner mapping, deterministic
  status aggregation, decisive-reason selection and compact-copy limits.
- Negative tests: projection cannot authorize, missing evidence cannot become `pass`, QA owner
  cannot be replaced, and duplicated rows fail.
- Runtime-integrity tests: Runtime Contract, router, plugin definition and generated surfaces
  remain synchronized.
- Routing/package smoke: all existing skills remain discoverable and generated assets propagate.
- `git diff --check` remains required.

## 8. Implementation Boundary

Implementation is limited to extending existing presentation/routing owners and adding focused
tests. No redesign of the four review skills' internal workflows is permitted in this slice.

## 9. Next Step

Review this SD and approve only with:

`Approval: SD`
