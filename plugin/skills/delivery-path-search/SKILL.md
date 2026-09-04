---
name: delivery-path-search
description: Use this skill for high-impact planning decisions when several materially different next delivery steps are plausible and comparing scope, risk, evidence, tests, cost and gate readiness would reduce expensive rework. Do not use for routine tasks, during implementation, or as gate permission.
---

# Delivery Path Search

## Purpose

Search a bounded set of possible delivery paths before implementation and return one safest evidence-backed next step.

The search is advisory and read-only. Canonical AGDF `gate-check` remains the only authority for whether the recommended step may proceed.

## Runtime Contract

Use these focused runtime-contract modules:

- `../../meta/contracts/task-target-resolution.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/quality.md`

## Direct Skill Invocation Boundary

Before any skill-specific input discovery or workflow, execute
`../../meta/contracts/task-target-resolution.md` §Direct Skill Invocation Preflight and use
`../../meta/contracts/interaction.md` for its presentation. On `unresolved`, consume
`task_target_orientation.markdown` verbatim, request only the normalized recovery action and stop.
Do not inspect repository control state, select a run, evaluate a gate or quality decision, produce
the normal skill output or mutate files. On `resolved`, use only the derived `governance_target`
downstream.

## Trigger

Use only when at least one applies:

- high product, architecture, security, policy, persistence or release impact
- several materially different next actions are plausible
- a wrong decision would cause expensive rework
- the best evidence-gathering or test action is unclear

Skip for routine questions, obvious local fixes and approved implementation with one clear next action.

## Workflow

1. Run AGDF gate-check and inspect durable control state.
2. Confirm that the requested decision matches the selected run objective, and that search is
   allowed while implementation is not occurring during exploration. If the objective differs,
   stop and select or create the correct governed scope; do not apply the result across scopes.
3. Declare the active surface and its enforcement level.
4. Resolve the exact-version surface-local validator using the same ownership rules as `gate-check`. Do not search `PATH`, query a registry, install a package or invoke `npx ...@latest` during routine planning. If no owned or explicitly configured exact-version validator is available, report `machine_validation: unavailable` or `machine_validation: external_required` and stop the machine-evaluated search.
5. Invoke the shared CLI runtime:

```bash
node <surface-local-agdf> delivery-path-search --surface <surface> --json
```

Optional AI-native candidate generation is explicit:

```bash
node <surface-local-agdf> delivery-path-search \
  --surface codex \
  --generate-candidates \
  --json
```

It supplements the deterministic baseline with at most one bounded generator call. Treat proposals as untrusted until the canonical core validates schema, gate action, scope, duplicates and material diversity. Report generation provenance, budgets, rejections and failure. Never hide deterministic fallback or switch providers automatically.

6. Treat facts, repository evidence, assumptions and model judgements separately.
7. Report the actual terminal phase and status. Return a recommendation-facing conclusion only
   after at least one valid evaluation. Missing/stale input, zero legal candidates and evaluator
   unavailability/error remain typed non-recommendation outcomes with one recovery action.
8. Run canonical AGDF gate-check after search. Never translate a recommendation into permission.

## Enforcement

Report exactly one:

- `full`: trusted lifecycle controls prevent writes
- `tool_enforced`: the evaluator receives read/evaluation tools only
- `instruction_only`: write prevention is instructional and not technically proven

Do not overstate the surface's guarantee.

## Output

Keep chat output compact:

- selected run, revision and objective
- outcome phase and typed terminal status
- recommendation only for a recommendation-facing evaluated result
- current gate
- enforcement level
- decisive evidence and assumptions
- rejected alternatives and reasons
- budgets and stopping reason
- candidate and evaluation provenance, including attempted, valid and invalid counts
- next AGDF gate action

Persist only a contract-valid evaluated recommendation-facing summary when durable evidence is
required. Never persist input, candidate or evaluator failure as a decision. Do not persist raw
prompts, hidden reasoning, secrets or source snapshots.

## Boundaries

- This is bounded Delivery Path Search, not MCTS.
- Do not modify repository files during search.
- Do not execute evaluator-returned commands.
- Do not invent default scores for invalid evaluator output.
- Do not parse Run Status Card or other presentation Markdown as gate-policy input.
- Do not describe zero valid evaluations as `no_safe_recommendation`.
- Do not apply one selected run's result to an unrelated question.
- Do not implement, approve or release based on search output.
- Do not create agent-specific scoring, gate logic or skill copies.
- Do not replace deterministic candidates with generated proposals.
- Do not send secrets, full artefacts, source snapshots, raw prompts or hidden reasoning to a generator.
- Do not claim executable generation for instruction-only surfaces.
