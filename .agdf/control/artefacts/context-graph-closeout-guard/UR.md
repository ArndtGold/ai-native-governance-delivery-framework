# UR: Context Graph Closeout Guard

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## User Need

Prevent future Governance-Closeout-Gaps where QA, OR or delivery-closeout identifies durable Context Graph relevance but the actual `.agdf/control/CONTEXT_GRAPH.md` node or link is not created before the run is considered cleanly closed.

## Problem

The `agdf-delivery-path-search` run showed a closeout weakness:

- QA correctly identified reusable invariants that should be promoted after UAT.
- OR initially recorded `context_graph_impact: link_only` with no concrete node reference.
- The run could appear closed even though the durable Context Graph reconciliation was incomplete.

This creates review ambiguity: important reusable governance knowledge may remain buried in scope artefacts instead of being visible in the Context Graph.

## Desired Outcome

AGDF should make Context Graph reconciliation a visible closeout invariant:

- If a run declares Context Graph impact, it must either resolve the action or explicitly keep it as an open gap.
- `link_only`, `update_existing_node` and `new_node_required` must have concrete and auditable semantics.
- OR and delivery-closeout must not quietly present a clean handoff while Context Graph action remains unresolved.
- Runtime integrity or deterministic checks should detect contradictory closeout states.

## Scope

In scope:

- Sharpen Runtime Contract language for Context Graph reconciliation.
- Sharpen OR and delivery-closeout skill guidance so Context Graph action is checked before clean handoff.
- Add or update deterministic integrity checks for obvious contradictions, such as:
  - `context_graph_refs: none` with action terms like `promote`, `create`, `update`, `after UAT` or `reassess`
  - OR marked complete while `context_graph_required_action` is unresolved
  - `link_only` without a concrete node when a durable invariant is named
- Update control templates if needed so future artefacts capture the reconciliation result.
- Add focused smoke/integrity coverage for the new guard.

Out of scope:

- Redesigning the entire Context Graph format.
- Creating an automatic graph generator.
- Changing AGDF gate order.
- Reopening the delivered `agdf-delivery-path-search` implementation scope.
- Commit, push, PR, release or publish.

## Acceptance Criteria

1. Runtime Contract defines Context Graph reconciliation as a closeout responsibility.
2. OR guidance requires a resolved Context Graph state or an explicit open gap.
3. Delivery-closeout guidance checks Context Graph follow-up before commit-ready handoff.
4. Integrity checks catch the contradictory states observed in the prior run.
5. Existing completed runs are not retroactively broken by harmless historical notes unless they are part of the active closeout state.
6. Validation passes with the repository's relevant smoke/integrity checks.

## Evidence Plan

- Inspect existing Runtime Contract, OR template, delivery-closeout skill and runtime-integrity script.
- Apply the smallest coherent source-of-truth changes.
- Run:
  - `node plugin/scripts/check-runtime-integrity.mjs`
  - `npm --prefix create-agdf run smoke-test` if generated/package checks are affected
  - `git diff --check`

## Next Step

Brownfield Review is complete. Review and approve the focused PRD with:

`Approval: PRD`
