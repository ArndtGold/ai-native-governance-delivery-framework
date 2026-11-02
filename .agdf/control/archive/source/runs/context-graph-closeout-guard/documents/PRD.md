# PRD: Context Graph Closeout Guard

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Date: 2026-07-09
Owner: agent
Based on:

- `.agdf/control/artefacts/context-graph-closeout-guard/UR.md`
- `.agdf/control/artefacts/context-graph-closeout-guard/BROWNFIELD_REVIEW.md`

## Product Goal

Make Context Graph reconciliation an explicit closeout invariant so AGDF runs cannot appear cleanly closed while durable Context Graph work remains silently unresolved.

## Requirements

1. Define Context Graph reconciliation in the Runtime Contract.
2. Clarify that `context_graph_required_action` must be either resolved or visibly open before OR/delivery-closeout can present a clean handoff.
3. Require concrete `context_graph_refs` when:
   - `context_graph_impact` is `link_only`, `update_existing_node` or `new_node_required`, and
   - the run claims durable invariants, decisions, risks or exit criteria were promoted or should be promoted.
4. Preserve a valid explicit no-graph path for cases where `context_graph_impact: none`.
5. Update OR guidance to report graph reconciliation state.
6. Update delivery-closeout guidance to block/avoid commit-ready handoff when graph action is unresolved.
7. Update templates if needed so future OR/run artefacts capture the reconciliation result.
8. Add deterministic integrity coverage for obvious contradictions without scanning all historical prose as if it were active state.

## Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | Runtime Contract names Context Graph reconciliation as part of relevant-run closeout. |
| AC-02 | OR skill guidance requires resolved graph action or explicit open gap before clean closeout. |
| AC-03 | Delivery-closeout guidance checks unresolved Context Graph follow-up before commit-ready handoff. |
| AC-04 | OR and AGDF_RUN templates make resolved/open Context Graph action visible. |
| AC-05 | Runtime integrity detects active/template contradictions such as `context_graph_refs: none` paired with promote/create/update/reassess/after-UAT action language. |
| AC-06 | Runtime integrity does not fail merely because old historical artefacts contain now-resolved Context Graph notes outside active template/current-state checks. |
| AC-07 | Generated package/control copies remain consistent with canonical sources. |
| AC-08 | Validation evidence is recorded before QA. |

## Non-Goals

- No automatic Context Graph node generation.
- No new graph storage format.
- No change to AGDF gate order.
- No broad redesign of QA, OR or delivery-closeout.
- No release, tag, publish, push or PR.

## User-Facing Behavior

Future closeout should force one of these explicit states:

- `resolved`: Graph action is done and concrete refs are present.
- `not_applicable`: No durable graph relevance exists and `context_graph_impact: none`.
- `open_gap`: Graph action remains open and clean commit/release handoff must say so.

## Evidence Plan

- Source inspection of Runtime Contract, OR/delivery-closeout skills, templates and integrity checks.
- Focused diff review proving no second Context Graph model is introduced.
- Validation:
  - `node plugin/scripts/check-runtime-integrity.mjs`
  - `npm --prefix create-agdf run smoke-test` if package/generated control output changes
  - `git diff --check`

## Next Step

Review and approve the Solution Design with:

`Approval: SD`
