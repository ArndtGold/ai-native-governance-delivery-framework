# AGDF Runtime Contract — Gate Transition

## Source Precedence

Every governed repository should make the normative instruction source visible.
When several instruction files, generated copies, submodule rules, branch names, worktree diffs or chat summaries point in different directions, fail closed instead of inventing a primary authority.

Default precedence:

1. safety, security and compliance instructions
2. repository-declared normative agent instructions
3. live `.agdf/control/` state or a linked authoritative repository SoT
4. approved gate artefacts
5. source code and verified runtime evidence
6. branch names, workspace deltas, chat history and model memory

A branch name or uncommitted workspace delta is never sufficient scope proof by itself.
It may support a scope only when it does not conflict with durable artefacts, approvals or source-of-truth records.


## Workstate And Scope Ambiguity

If a repository contains multiple plausible active work lines, the agent must not silently choose one.
List the evidenced competing lines with their latest known gate, artefact pointers, approvals and missing evidence.
The next permissible step is scope clarification or the earliest common safe gate.

Use `multi_scope_state: clear | ambiguous | blocked` when the control state needs to make this visible.
`ambiguous` is at least a revise condition for delivery-map style reporting.
`blocked` applies when continuing would produce later-gate artefacts, implementation or release claims for the wrong scope.


## Domain Guardrail Packs

Repositories may define domain guardrail packs for recurring high-risk surfaces such as UI, persistence, integration, financial calculations, policy, security, migration or release operations.
A pack should define:

- trigger patterns
- required Brownfield touchpoints
- protected invariants
- required evidence
- review or QA escalation conditions

Domain guardrails are project-specific extensions.
They must not override AGDF gates, approvals or the Runtime Contract.


## Gate Rules

- User gates: `UR -> PRD -> SD -> TP -> QA -> UAT`
- Internal mandatory steps: `Brownfield Review -> Mode/Slice Decision -> Verified Change Execution | Brownfield Analysis -> CD+Tests -> CR -> OR`
- On the approved-TP path, `CD+Tests` and `CR` are satisfied only by `done`; `not_applicable` may satisfy Brownfield Review or Brownfield Analysis, but it must not bypass implementation/test evidence or mandatory Code Review.
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
- The Mode/Slice Decision must be visible before any PRD shortcut, Quick Task execution or implementation: record the decision, required next gate, scope reason and evidence in the selected canonical `RUN_STATE.md` or an equivalent linked control artefact.
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
- `Mode/Slice Decision`: `quick_task | verified_change | structured_slice | structured_delivery | block`
- affected existing owners, source-of-truth artefacts, contracts, policies, runtime paths or tests
- reuse-before-create risks and parallel-structure risks
- open questions that PRD or SD must resolve
- whether implementation-preparation Brownfield Analysis will also be needed after TP

Mode/Slice Decision rules:

- `quick_task`: use only when Brownfield Review shows a narrow local change, no new product semantics beyond the approved UR, no architecture/policy/persistence/contract expansion, and evidence is sufficient to proceed with a small implementation plus relevant checks.
- `verified_change`: use only when the compact record can prove one canonical owner, bounded clean-at-baseline paths, no prohibited impact, deterministic propagation/validation and a structured escalation target. It skips later approvals only after every condition is evidenced and machine-validated.
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
| Brownfield Review done or not_applicable, Mode/Slice Decision missing or incomplete | `Mode/Slice Decision` | decide `quick_task`, `verified_change`, `structured_slice`, `structured_delivery` or `block`; record scope reason, evidence and required next gate depth | PRD, SD, TP, implementation, QA, release | none |
| Mode/Slice Decision is `quick_task` | `Quick Task Execution` | implement only the narrow approved UR scope, run relevant checks, record evidence and OR-lite when the run is relevant | broad PRD/SD/TP by ritual, scope expansion, QA or release claims without evidence | none |
| Mode/Slice Decision is `verified_change`, record missing/draft/invalid | `Verified Change Execution` | create or repair compact record, capture baseline and prove eligibility with doctor/gate-check | implementation, QA, UAT, release | none |
| Verified Change record is `eligible` | `Verified Change Execution` | implement only declared paths, run declared propagation/validation, record mini-closeout | unlisted paths, prohibited impacts, QA/UAT/release claims | none |
| Verified Change record is `executed` | `OR` | use mini-closeout and offer delivery closeout when requested | PRD/SD/TP/QA/UAT by ritual; automatic VCS actions | none |
| Verified Change record is `escalated` | `PRD` | draft the PRD for declared `structured_slice` or `structured_delivery` escalation target | implementation through Verified Change | `Approval: PRD` |
| Mode/Slice Decision is `structured_slice` or `structured_delivery`, PRD missing or draft | `PRD` | draft/refine PRD at the smallest justified depth, define scope, acceptance criteria and non-goals, persist/link PRD, request `Approval: PRD` | SD, TP, implementation-preparation Brownfield Analysis, implementation, QA, release | `Approval: PRD` |
| `PRD` approved and PRD artefact persisted or linked, SD missing or draft | `SD` | draft/refine Solution Design, ownership and architecture, persist/link SD, request `Approval: SD` | TP, implementation, QA, release | `Approval: SD` |
| `SD` approved and SD artefact persisted or linked, TP missing or draft | `TP` | draft/refine Task/Test Plan, task IDs, evidence plan, persist/link TP, request `Approval: TP` | implementation, QA, release | `Approval: TP` |
| `TP` approved and TP artefact persisted or linked, Brownfield Analysis missing | `Brownfield Analysis` | run Brownfield Analysis for approved TP scope | implementation, QA, release | none |
| Brownfield Analysis passed for approved TP | `CD+Tests` | implement approved TP tasks and run tests | QA pass, UAT, release | none |
| `CD+Tests` done for approved TP, CR missing | `CR` | run mandatory Code Review and resolve blocking findings | QA pass, UAT, release | none |
| `CR` done, QA not approved | `QA` | run QA gate, persist/refine QA report, request `Approval: QA` | UAT, release | `Approval: QA` |
| `QA` approved but QA report missing or not pass | `QA` | persist/link QA report with `pass` decision or revise/block evidence | UAT, release | none |
| QA approved and QA report is `pass` or `passed`, UAT not approved | `UAT` | request `Approval: UAT`, prepare non-operative delivery summary | release and automatic VCS actions | `Approval: UAT` |
| UAT approved | `OR` | produce OR or delivery closeout; prepare VCS handoff only when requested | automatic commit, push, PR or release | none |


## Brownfield Modes

The `brownfield-analysis` skill has two explicit modes:

- `post_ur_review`: lightweight sizing and routing after approved durable UR; decides Mode/Slice Decision before PRD depth or implementation is chosen.
- `pre_implementation_analysis`: implementation-preparation analysis after approved durable TP; verifies reuse path, owners, regression risk and fit before `CD+Tests`.

Do not mix the modes silently. Name the active mode in Brownfield output.

