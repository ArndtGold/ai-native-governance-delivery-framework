# TP: Context Graph Closeout Guard

Status: approved
Gate: TP
Gate approval: `Approval: TP`
Date: 2026-07-09
Owner: agent
Based on: `.agdf/control/artefacts/context-graph-closeout-guard/SD.md`

## Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CGC-01 | Update Runtime Contract with Context Graph reconciliation semantics and clean-handoff boundary. | AC-01 | Diff shows normative rule, no duplicate gate model. |
| CGC-02 | Update `release-or` skill guidance to require `context_graph_reconciliation` and explicit open-gap reporting. | AC-02 | Skill diff maps OR workflow/rules to resolved/not_applicable/open_gap. |
| CGC-03 | Update `delivery-closeout` skill guidance so unresolved graph follow-up prevents clean commit-ready handoff. | AC-03 | Skill diff shows handoff check and open-gap next step. |
| CGC-04 | Update AGDF_RUN and OR templates with additive `context_graph_reconciliation` field. | AC-04 | Template diff; generated/package consistency checked if affected. |
| CGC-05 | Extend Runtime Integrity to require the new field and detect obvious contradictory Context Graph active/template states without scanning historical artefact prose. | AC-05, AC-06 | Positive integrity run; targeted negative fixture or inline fixture check if practical. |
| CGC-06 | Run validation and record evidence. | AC-07, AC-08 | `node plugin/scripts/check-runtime-integrity.mjs`, `git diff --check`, and `npm --prefix create-agdf run smoke-test` if generated/package assets changed. |

## Implementation Order

1. Runtime Contract first.
2. Skills second.
3. Templates third.
4. Runtime Integrity last.
5. Validation and evidence recording.

## Test Plan

Required:

```bash
node plugin/scripts/check-runtime-integrity.mjs
git diff --check
```

Conditional:

```bash
npm --prefix create-agdf run smoke-test
```

Run the conditional smoke test if generated package assets or package-distributed control templates are changed or synced.

## Acceptance Criteria Coverage

| Acceptance criteria | Tasks |
|---|---|
| AC-01 | CGC-01 |
| AC-02 | CGC-02 |
| AC-03 | CGC-03 |
| AC-04 | CGC-04 |
| AC-05 | CGC-05 |
| AC-06 | CGC-05 |
| AC-07 | CGC-04, CGC-06 |
| AC-08 | CGC-06 |

## Out Of Scope

- Automatic Context Graph node generation.
- New graph storage format.
- Gate-order changes.
- Broad QA/OR/delivery-closeout redesign.
- Commit, push, PR, release, tag or publish.

## QA Blocking Conditions

| Condition | Expected QA effect |
|---|---|
| Clean handoff can still hide unresolved Context Graph action | block |
| Runtime Contract and skills define conflicting reconciliation semantics | block |
| Integrity check fails current valid templates | block |
| Historical completed artefacts are broadly reclassified as active failures | revise/block depending impact |
| Generated package assets drift from canonical source | block |

## Next Step

Implementation and reviews are complete. Next required step is QA gate evaluation.
