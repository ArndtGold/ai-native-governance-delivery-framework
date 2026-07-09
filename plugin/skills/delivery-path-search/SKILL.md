---
name: delivery-path-search
description: Use this skill for high-impact planning decisions when several materially different next delivery steps are plausible and comparing scope, risk, evidence, tests, cost and gate readiness would reduce expensive rework. Do not use for routine tasks, during implementation, or as gate permission.
---

# Delivery Path Search

## Purpose

Search a bounded set of possible delivery paths before implementation and return one safest evidence-backed next step.

The search is advisory and read-only. Canonical AGDF `gate-check` remains the only authority for whether the recommended step may proceed.

## Runtime Contract

Use `../../meta/agdf-runtime-contract.md` for canonical gate state, output discipline and Delivery Path Search boundaries. This skill must not maintain a second gate or scoring model.

## Trigger

Use only when at least one applies:

- high product, architecture, security, policy, persistence or release impact
- several materially different next actions are plausible
- a wrong decision would cause expensive rework
- the best evidence-gathering or test action is unclear

Skip for routine questions, obvious local fixes and approved implementation with one clear next action.

## Workflow

1. Run AGDF gate-check and inspect durable control state.
2. Confirm that search is allowed and implementation is not occurring during exploration.
3. Declare the active surface and its enforcement level.
4. Invoke the shared CLI runtime:

```bash
npx --yes @agdf/cli@latest delivery-path-search --surface <surface> --json
```

5. Treat facts, repository evidence, assumptions and model judgements separately.
6. Return exactly one recommendation or `no_safe_recommendation`.
7. Run canonical AGDF gate-check after search. Never translate a recommendation into permission.

## Enforcement

Report exactly one:

- `full`: trusted lifecycle controls prevent writes
- `tool_enforced`: the evaluator receives read/evaluation tools only
- `instruction_only`: write prevention is instructional and not technically proven

Do not overstate the surface's guarantee.

## Output

Keep chat output compact:

- recommendation or `no_safe_recommendation`
- current gate
- enforcement level
- decisive evidence and assumptions
- rejected alternatives and reasons
- budgets and stopping reason
- next AGDF gate action

Persist only the redacted decision summary when durable evidence is required. Do not persist raw prompts, hidden reasoning, secrets or source snapshots.

## Boundaries

- This is bounded Delivery Path Search, not MCTS.
- Do not modify repository files during search.
- Do not execute evaluator-returned commands.
- Do not invent default scores for invalid evaluator output.
- Do not implement, approve or release based on search output.
- Do not create agent-specific scoring, gate logic or skill copies.
