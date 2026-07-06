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

## Quick Task Output

Quick Tasks are intentionally lightweight, but they must not become invisible.
Use this compact output shape when no formal gate artefact is required:

- `result`: what changed or was concluded
- `evidence`: files, commands, observations, or reasoning that support the result
- `risk`: remaining risk or `none`
- `next_step`: the single next useful action or `none`

Do not add a separate `Quality outlook` line for pure Quick Tasks unless the task became a relevant run.

## Chat Output Discipline

Durable artefacts are for the repository, not for flooding the chat.
When a skill creates or updates `.agdf/control/` files, gate artefacts, reviews, QA reports or OR reports, the chat response must stay compact:

- name the artefact path and status
- summarize the decision or content in a few lines
- state the current gate, forbidden work and next permissible step
- mention validation evidence when available

Do not paste full control files, full artefact bodies, full templates or full generated reports into the chat unless the user explicitly asks to see the full content.
For larger or more formal work, create or update the durable artefacts fully, then reference them by path and summarize what changed.

## Relevant Run

A relevant run is any run that changes durable state, creates or updates an AGDF artefact, changes code or runtime behaviour, performs a gate decision, blocks on a governance condition, produces QA/UAT/release evidence, or closes a delivery slice.

OR is not mandatory for a pure explanation, read-only inspection, small review, or local debugging step that produces no durable state change and no gate consequence.
When in doubt, use a short OR-lite only if it clarifies gate state, evidence, risk, or the next permissible step.

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
- Missing control files or missing current-state fields do not forbid the agent from preparing the current allowed artefact. They forbid later-gate work and implementation. For a fresh request, the default allowed work is to draft a minimal UR in the response and request `Approval: UR`. Initialize or write `.agdf/control/` only when the user explicitly asks for durable AGDF control state, the repository already uses `.agdf/control/` as its live working state, or a deterministic CLI/CI setup path is being executed.
- `Approval: UR` permits Brownfield Review after G-00 first, then a Mode/Slice Decision. It never permits implementation by itself.
- PRD, SD and TP depth is chosen after Brownfield Review through the Mode/Slice Decision, not before existing-system impact is understood.
- The Mode/Slice Decision must be visible before any PRD shortcut, Quick Task execution or implementation: record the decision, required next gate, scope reason and evidence in `AGDF_RUN.md` or an equivalent linked control artefact.
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

A Mode/Slice Decision without scope reason and evidence is not recorded. Treat it as missing and keep the next step at `Mode/Slice Decision`.

## Gate Transition Model

This table is the canonical transition model. Skills may reference it, but must not carry a second complete copy.

| State | Current gate or step | Allowed | Forbidden | Missing approval |
|---|---|---|---|---|
| No approved UR | `UR` | clarify user need, formulate and persist UR, request `Approval: UR` | PRD, SD, TP, Brownfield Analysis, implementation, QA, release | `Approval: UR` |
| `UR` approved and UR artefact persisted or linked, Brownfield Review missing | `Brownfield Review` | classify workstream, existing owners, SoT, reuse risks, change size and PRD/SD open questions; mark review done or not_applicable | PRD, SD, TP, implementation, QA, release | none |
| Brownfield Review done or not_applicable, Mode/Slice Decision missing or incomplete | `Mode/Slice Decision` | decide `quick_task`, `structured_slice`, `structured_delivery` or `block`; record scope reason, evidence and required next gate depth | PRD, SD, TP, implementation, QA, release | none |
| Mode/Slice Decision is `quick_task` | `Quick Task Execution` | implement only the narrow approved UR scope, run relevant checks, record evidence and OR-lite when the run is relevant | broad PRD/SD/TP by ritual, scope expansion, QA or release claims without evidence | none |
| Mode/Slice Decision is `structured_slice` or `structured_delivery`, PRD missing or draft | `PRD` | draft/refine PRD at the smallest justified depth, define scope, acceptance criteria and non-goals, persist/link PRD, request `Approval: PRD` | SD, TP, implementation-preparation Brownfield Analysis, implementation, QA, release | `Approval: PRD` |
| `PRD` approved and PRD artefact persisted or linked, SD missing or draft | `SD` | draft/refine Solution Design, ownership and architecture, persist/link SD, request `Approval: SD` | TP, implementation, QA, release | `Approval: SD` |
| `SD` approved and SD artefact persisted or linked, TP missing or draft | `TP` | draft/refine Task/Test Plan, task IDs, evidence plan, persist/link TP, request `Approval: TP` | implementation, QA, release | `Approval: TP` |
| `TP` approved and TP artefact persisted or linked, Brownfield Analysis missing | `Brownfield Analysis` | run Brownfield Analysis for approved TP scope | implementation, QA, release | none |
| Brownfield Analysis passed for approved TP | `CD+Tests` | implement approved TP tasks and run tests | QA pass, UAT, release | none |
| `QA` approved but QA report missing or not pass | `QA` | persist/link QA report with `pass` decision or revise/block evidence | UAT, release | none |

## Brownfield Modes

The `brownfield-analysis` skill has two explicit modes:

- `post_ur_review`: lightweight sizing and routing after approved durable UR; decides Mode/Slice Decision before PRD depth or implementation is chosen.
- `pre_implementation_analysis`: implementation-preparation analysis after approved durable TP; verifies reuse path, owners, regression risk and fit before `CD+Tests`.

Do not mix the modes silently. Name the active mode in Brownfield output.

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

- `config.json` stores project language preferences. Use `artifact_language` for generated AGDF artefacts and `chat_language` for user-facing responses unless the user explicitly asks otherwise. Runtime rules remain English.
- `AGDF_RUN.md` is the current run dashboard.
- `MASTER_BACKLOG.md` is the living pointer for active delivery work.
- `BROWNFIELD_REVIEW.md` records the post-UR existing-system view and Mode/Slice Decision before PRD depth or Quick Task execution is chosen.
- `SOT_REGISTRY.md` prevents parallel sources of truth.
- `CONTEXT_GRAPH.md` stores durable Brownfield findings, decisions, risks, evidence and exit criteria.
- `AGENT_QUALITY_CONTRACTS.json` stores reusable block, revise and warning conditions.
- OR reports live under `.agdf/control/artefacts/<key>/OR.md` when a run closeout is steering-relevant or should be auditable beyond the chat.

The scaffold is not a second documentation site. Link to authoritative artefacts instead of copying them.

## Agent-Native Runtime And CLI Verification

AGDF is agent-native first and CLI-verifiable by design.

The primary operating path is the active skill plus the live `.agdf/control/` artefacts.
Agents should read the repository state, apply this Runtime Contract, create or update only the currently allowed artefact, and make the next permissible step explicit.
When control state is missing for a fresh request, keep the first step lightweight: draft the minimal UR in the response and request `Approval: UR`.
Initialize a control scaffold only when durable AGDF control state is explicitly requested, already used by the repository, or required by a deterministic CLI/CI setup path.

Helper commands are deterministic proof and automation interfaces, not the normal-work ritual:

- `init` creates the machine-readable control scaffold.
- `doctor --json` checks whether `.agdf/control/` is consistent and actionable; it is not the reviewer.
- `gate-check --json` reports reproducible gate state; it does not replace the gate-check skill judgement.
- `delivery-map --json` reports the delivery picture for CI, PRs, regression checks and audit trails.

Machine-readable outputs should stay agent-friendly: stable decisions, blocking gate or current gate, missing approval, allowed outputs, forbidden outputs, next step, evidence and findings.
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
