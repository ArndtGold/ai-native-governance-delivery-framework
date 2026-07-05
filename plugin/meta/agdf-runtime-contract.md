# AGDF Runtime Contract

This contract centralizes recurring runtime rules for AGDF skills.
It is the operational reference for skill outputs, but it is not a second copy of the framework documentation.

## Mode Selection

| Mode | Default | Escalate When |
|---|---|---|
| Quick Task Mode | small questions, reviews, debugging, local fixes without new product semantics | a new user capability, architecture/policy/persistence impact, formal artefacts, or approvals are involved |
| Structured Delivery Mode | formal delivery runs, gate-relevant work, release-critical changes | always use gate discipline, internal reviews, and OR |

Quick Task Mode must not become ritual gate overhead.
Structured Delivery must not bypass missing approvals.
New product semantics, functional change, user-visible behaviour, policy, persistence, architecture or release-critical work requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT before later artefacts or implementation.
UR, PRD, SD, TP and QA report approvals require durable artefacts or linked authoritative repository SoT entries before the next gate can open.

## Gate Rules

- User gates: `UR -> PRD -> SD -> TP -> QA -> UAT`
- Internal mandatory steps: `Brownfield Analysis -> CD+Tests -> CR -> OR`
- Exact approval formula: `Approval: <GateName>`
- Legacy alias: `Freigabe: <GateName>` may be accepted when reviewing older German runs, but all new outputs must use `Approval: <GateName>`.
- Implicit consent is not approval.
- The earliest blocking gate wins.
- For UR, PRD, SD, TP and QA, approval and durable artefact presence are separate requirements. A gate is not satisfied by approval text alone when its artefact is missing from `.agdf/control/` or not linked to the authoritative repository SoT.
- Approval of one user gate permits work on the next gate artefact only. It does not permit implementation unless the approved gate is `TP` and required internal implementation prerequisites are satisfied.
- `Approval: UR` permits PRD drafting, not implementation.
- `Approval: PRD` permits Solution Design drafting, not implementation.
- `Approval: SD` permits Task/Test Plan drafting, not implementation.
- `Approval: TP` permits Brownfield Analysis and then CD+Tests when Brownfield evidence supports it.
- `CD+Tests` is implementation and test status only, not a delivery signal.
- `code-review` standardizes the mandatory `CR` step, but does not replace QA.
- `qa-gate` decides final `pass | revise | block`.
- `release-or` reports the run, but does not replace QA or produce the operative commit/PR handoff.
- `delivery-closeout` owns the operative Git handoff text when QA/OR/UAT state allows it.

## Quality Contract Output

Structured Delivery skills use this shape when relevant:

- `decision`: `pass | revise | block | not_applicable`
- `evidence`: concrete artefacts, files, tests, logs, diffs, or observations
- `missing_evidence`: missing proof needed for a stronger claim
- `risks`: remaining risks, assumptions, fallbacks, drift, or blockers
- `required_next_step`: exactly the next clean step
- `impact_codes`: affected Quality Contract codes, if the target repo has a registry

A skill may briefly remind this shape, but must not duplicate a complete code or rule matrix.

## Context Graph Output

When a run affects project memory or a Context Graph, use:

- `Situation:` short plain-language summary when the impact is non-trivial
- `context_graph_impact`: `none | link_only | update_existing_node | new_node_required | sot_drift`
- `context_graph_refs`
- `context_graph_required_action`: `none | link | update | create | resolve_drift`
- `context_graph_gate_effect`: `none | warning | revise | block`
- `context_graph_evidence`

Do not create a new node for a mere version, a general chat summary, or a local observation without a concrete next clean step.
`sot_drift` must not pass silently as a warning.

## Control Scaffold

When a repository needs durable AGDF state, use the plugin-local `control/` scaffold as the starting point.

- `AGDF_RUN.md` is the current run dashboard.
- `MASTER_BACKLOG.md` is the living pointer for active delivery work.
- `SOT_REGISTRY.md` prevents parallel sources of truth.
- `CONTEXT_GRAPH.md` stores durable Brownfield findings, decisions, risks, evidence and exit criteria.
- `AGENT_QUALITY_CONTRACTS.json` stores reusable block, revise and warning conditions.

The scaffold is not a second documentation site. Link to authoritative artefacts instead of copying them.

## Skill Output

Every skill output should be as short as possible and as concrete as needed.
It must distinguish:

- facts
- evidence
- assumptions
- interpretations
- missing evidence
- the next permissible step

## Do Not Duplicate

The explanatory framework lives in `docs/`.
The operating philosophy lives in `plugin/meta/agdf-constitution.md`.
The principles live in `plugin/meta/agdf-tenets.md`.
This contract is only the compact runtime interface for skills.
