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
- Internal mandatory steps: `Brownfield Review -> Mode/Slice Decision -> Brownfield Analysis -> CD+Tests -> CR -> OR`
- Exact approval formula: `Approval: <GateName>`
- Legacy alias: `Freigabe: <GateName>` may be accepted when reviewing older German runs, but all new outputs must use `Approval: <GateName>`.
- Implicit consent is not approval. Phrases such as "ok", "go ahead", "do it", "approved", "continue", "leg los" or "looks good" are work intent, not gate approval.
- The earliest blocking gate wins.
- For UR, PRD, SD, TP and QA, approval and durable artefact presence are separate requirements. A gate is not satisfied by approval text alone when its artefact is missing from `.agdf/control/` or not linked to the authoritative repository SoT.
- Approval of one user gate permits work on the next allowed gate artefact or required internal step only. It does not permit implementation unless the approved gate is `TP` and required internal implementation prerequisites are satisfied.
- Gates must never be skipped or inferred from urgency, tone, chat history, task wording or an instruction to "start". The next allowed action is always the next unsatisfied gate or internal mandatory step.
- `Approval: UR` permits Brownfield Review after G-00 first, then a Mode/Slice Decision. It never permits implementation by itself.
- PRD, SD and TP depth is chosen after Brownfield Review through the Mode/Slice Decision, not before existing-system impact is understood.
- `Approval: PRD` permits Solution Design drafting, not implementation.
- `Approval: SD` permits Task/Test Plan drafting, not implementation.
- `Approval: TP` permits implementation-preparation Brownfield Analysis and then CD+Tests when Brownfield evidence supports it.
- `CD+Tests` is implementation and test status only, not a delivery signal.
- `code-review` standardizes the mandatory `CR` step, but does not replace QA.
- `qa-gate` decides final `pass | revise | block`.
- `release-or` reports the run, but does not replace QA or produce the operative commit/PR handoff.
- `delivery-closeout` owns the operative Git handoff text when QA/OR/UAT state allows it.

## Brownfield Review After G-00

After an approved and durable UR, perform a lightweight `Brownfield Review` before PRD when Brownfield, UI, UX, admin, runtime, policy, persistence, architecture, ownership or source-of-truth impact is possible.

This review is not a new user approval gate, not PRD, not SD, not TP and not implementation permission.
It is the sizing and routing step that decides how much later gate discipline is actually needed.

Its output is limited to:

- workstream or follow-up-slice classification
- `Mode/Slice Decision`: `quick_task | structured_slice | structured_delivery | block`
- affected existing owners, source-of-truth artefacts, contracts, policies, runtime paths or tests
- reuse-before-create risks and parallel-structure risks
- open questions that PRD or SD must resolve
- whether implementation-preparation Brownfield Analysis will also be needed after TP

Mode/Slice Decision rules:

- `quick_task`: use only when Brownfield Review shows a narrow local change, no new product semantics beyond the approved UR, no architecture/policy/persistence/contract expansion, and evidence is sufficient to proceed with a small implementation plus relevant checks.
- `structured_slice`: use when some formal artefacts are needed, but they can stay intentionally small and scoped to the approved slice.
- `structured_delivery`: use when the change has broad product, architecture, runtime, policy, persistence, release or cross-owner impact.
- `block`: use when ownership, SoT, impact, evidence or product direction is not clear enough to choose a safe path.

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
- OR reports live under `.agdf/control/artefacts/<key>/OR.md` when a run closeout is steering-relevant or should be auditable beyond the chat.

The scaffold is not a second documentation site. Link to authoritative artefacts instead of copying them.

## Native Runtime

AGDF must work natively through the plugin router, skills and live `.agdf/control/` artefacts.
Agents should read the live control state and apply the gate model directly before reaching for helper commands.

Machine-readable commands such as `doctor --json`, `gate-check --json` and `delivery-map --json` are validators and automation interfaces.
They make the repository state checkable, but they do not replace the native skill workflow or the durable control artefacts.

## Delivery Map

`delivery-map --json` is the machine-readable delivery picture for the active control state.
It derives, but does not replace, the live `.agdf/control/AGDF_RUN.md` and `MASTER_BACKLOG.md` state.

It must expose:

- approved or active artefacts and approvals
- `UR -> PRD -> SD -> TP -> QA_REPORT` relationships
- evidence refs, missing evidence and declared risks
- Context Graph impact and gate effect
- findings that explain why the delivery picture is `pass | warn | revise | block`

Missing relationship evidence in the Artefact Chain is at least `revise` once the related gate artefact is approved or passed.
Declared missing evidence, declared risk or Context Graph gate effect may escalate the delivery map to `warn`, `revise` or `block`.

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
