# SD: Context Graph Closeout Guard

Status: approved
Gate: SD
Gate approval: `Approval: SD`
Date: 2026-07-09
Owner: agent
Based on:

- `.agdf/control/artefacts/context-graph-closeout-guard/PRD.md`
- `.agdf/control/artefacts/context-graph-closeout-guard/BROWNFIELD_REVIEW.md`

## Design Summary

Implement Context Graph Closeout Guard as a small extension of existing AGDF control owners:

- Runtime Contract defines the normative reconciliation semantics.
- OR and delivery-closeout skills consume those semantics during closeout/handoff.
- AGDF_RUN and OR templates expose the reconciliation state.
- Runtime Integrity detects obvious active/template contradictions.

No new Context Graph storage model, gate order, package, graph generator or runtime authority is introduced.

## Target Semantics

Every relevant run with Context Graph impact should end in exactly one of these states:

| State | Meaning | Clean handoff? |
|---|---|---|
| `resolved` | Required Context Graph action is done and concrete refs are present. | yes |
| `not_applicable` | No durable graph relevance exists and `context_graph_impact: none`. | yes |
| `open_gap` | Required graph action remains unresolved or lacks concrete refs. | no; report as gap before commit/release handoff |

## Source Changes

### Runtime Contract

File: `plugin/meta/agdf-runtime-contract.md`

Add a compact `Context Graph Reconciliation` rule near `Context Graph Output`:

- `context_graph_required_action` must be `none` only when no graph work is pending.
- `link`, `update`, `create` and `resolve_drift` require either evidence that the action is resolved or a visible open gap.
- Concrete refs are required for resolved `link_only`, `update_existing_node` and `new_node_required`.
- OR/delivery-closeout must not present clean handoff when graph action is unresolved.

### Skills

Files:

- `plugin/skills/release-or/SKILL.md`
- `plugin/skills/delivery-closeout/SKILL.md`

Changes:

- OR workflow records `context_graph_reconciliation: resolved | not_applicable | open_gap`.
- OR rules require explicit open gap when graph work remains.
- Delivery-closeout checks unresolved graph follow-up before commit-ready handoff.

### Templates

Files:

- `plugin/control/templates/AGDF_RUN.md`
- `plugin/control/templates/artefacts/OR.md`

Changes:

- Add `context_graph_reconciliation: resolved | not_applicable | open_gap` to Context Graph Impact sections.
- Keep existing fields unchanged for compatibility.

### Runtime Integrity

File: `plugin/scripts/check-runtime-integrity.mjs`

Changes:

- Require templates to include `context_graph_reconciliation`.
- Detect contradictory template/active-state examples where:
  - `context_graph_refs` is empty/none-like, and
  - `context_graph_required_action` says or implies `link`, `update`, `create`, `resolve_drift`, `promote`, `reassess` or `after UAT`, and
  - reconciliation is not explicitly `open_gap`.
- Avoid scanning all historical artefact prose as active state.

### Generated Package Copies

If canonical control templates, skills or metadata produce generated package assets, run existing sync/smoke paths instead of manually creating a second source of truth.

## Compatibility

- Existing Context Graph field names remain valid.
- `context_graph_reconciliation` is additive.
- Historical completed artefacts are not retroactively reclassified unless they are active templates/current control state.
- `context_graph_impact: none` remains valid with `context_graph_reconciliation: not_applicable`.

## Validation Plan

Required:

```bash
node plugin/scripts/check-runtime-integrity.mjs
git diff --check
```

Conditional:

```bash
npm --prefix create-agdf run smoke-test
```

Run the package smoke test if generated package assets or package-distributed control templates change.

## Risks

| Risk | Mitigation |
|---|---|
| Over-strict check breaks harmless old artefacts | Limit deterministic checks to templates and active control state. |
| Runtime rule duplication | Keep normative semantics in Runtime Contract; skills/templates only reference operational behavior. |
| Generated output drift | Use existing sync/smoke path when package assets are affected. |

## Next Step

Review and approve the Task/Test Plan with:

`Approval: TP`
