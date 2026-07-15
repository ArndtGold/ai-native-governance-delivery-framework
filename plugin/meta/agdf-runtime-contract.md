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

### Verified Change

`verified_change` is a compact, fail-closed path for a bounded user-visible change with one canonical owner and deterministic proof. It is neither a prose exception nor a new user approval gate.

After `Approval: UR`, Brownfield Review may select `verified_change` only when a durable `VERIFIED_CHANGE.md` record can prove all of the following before implementation:

1. exactly one repository-relative canonical owner and bounded source/derived paths;
2. no gate, permission, security, persistence, architecture, external API, CLI or release behavior impact;
3. deterministic propagation when derived paths exist, plus at least one deterministic validation command;
4. tracked and untracked worktree baseline paths captured before eligibility, with no candidate path already dirty; and
5. an explicit `structured_slice` or `structured_delivery` escalation target.

The record is the compact eligibility, execution and mini-closeout artefact. A missing, failed, unknown or ambiguous field/check must fail closed: mark the record `escalated` and continue at its declared structured target. Unrelated paths already dirty at baseline remain isolated; newly introduced unlisted paths invalidate the compact path. An executed record requires passing validation evidence and, where applicable, passing propagation evidence.

### Non-Normative Trivial Change Boundary

A `quick_task` whose entire diff stays fully outside all of the following paths may close using only
the compact output shape above, and must not create, rewrite or expand any selected canonical
`RUN_STATE.md` core
sections (Run Meta, Objective, Current Control State, Source And Scope State, Run Status Card,
Approvals, Artefacts, Mode/Slice Decision, Artefact Chain, Evidence, Missing Evidence, Risks, Context
Graph Impact, Knowledge Persistence Decision, Closeout):

- `plugin/skills/**`
- `plugin/control/templates/**`
- `plugin/meta/**`
- `create-agdf/lib/**`
- `create-agdf/bin/**`
- any other executable code file, in any language, anywhere in the repository

A `MASTER_BACKLOG.md` entry is required only when the change is otherwise a "Relevant Run" below. A
change that is not clearly and fully outside every listed path fails closed to the existing, unchanged
ceremony — ambiguity is never read as permission for the lighter path.

#### Narrow Code-Fix Criterion

A change that touches one of the otherwise-excluded code paths above may still close with only the
compact Quick Task Output shape — Code Review remains mandatory regardless — when **all** of the
following hold. Any single condition failing, or any ambiguity about whether a condition holds, keeps
the full existing ceremony unchanged:

1. The diff is confined to a single function, or a function together with its direct,
   necessarily-coupled caller, in exactly one file.
2. A new or updated automated regression test exercises the fixed behavior and passes.
3. No PRD, SD, TP, gate name, exact approval formula, or documented CLI flag/output-schema field is
   added, removed, or changed — only internal correctness of already-approved behavior.
4. `doctor` (or the locally available equivalent) and the directly affected existing test suite both
   pass unchanged in shape after the fix, with no assertion skipped or weakened beyond what the fix
   itself introduces.

## Run Status Card

When a run needs an operational status view, use the Run Status Card as a compact projection of existing control state.
It must not introduce a second gate model or override `gate-check`, `delivery-map`, QA, OR, or user approvals.

- `mode`: `quick_task | verified_change | structured_delivery | unknown`
- `run_id`: the exactly selected canonical run
- `presentation_language`: the resolved complete locale-pack tag; absent, unsupported or incomplete packs resolve to the registry's deterministic `en` fallback
- `status`: `open | blocked | pass | warn | revise | block | in_progress`
- `current_gate`: current user gate or internal step
- `mode_slice_decision`: `undecided | quick_task | verified_change | structured_slice | structured_delivery | block`
- `allowed_now`: outputs or actions currently permitted
- `forbidden_now`: outputs or actions currently forbidden
- `blocking_condition`: current blocker or `none`
- `missing_approval`: exact missing approval formula or `none`
- `next_gate_after_approval`: the next user gate or internal step unlocked by the missing approval, or `none`
- `allowed_after_approval`: concise description of what becomes allowed after the missing approval, or `none`
- `user_visible_outcome_after_approval`: concise user-facing result of approving the current gate
- `internal_next_step`: the next agent-controlled process step, or `none`
- `next_user_gate`: the next actual user approval gate, or `none`
- `user_action_required`: `yes` only when the user must provide another deliberate approval or decision; otherwise `no`
- `evidence`: concrete evidence references currently visible
- `next_skill`: next AGDF skill or `none`
- `next_step`: the single next permissible process action
- `quality_outlook`: the next meaningful quality-improvement focus, or `none`

`next_step` and `quality_outlook` are intentionally different:

- `next_step` is process permission: what may happen next.
- `quality_outlook` is quality direction: what would most improve confidence, maintainability, evidence, or delivery integrity if further investment is made.

`quality_outlook` must not unlock gates, imply QA pass, or substitute for missing evidence.

`allowed_now` and `allowed_after_approval` are intentionally different:

- `allowed_now` is current authority under the active gate.
- `allowed_after_approval` is the immediate authority unlocked only after the exact `missing_approval` is supplied.

`next_gate_after_approval` and `allowed_after_approval` must be `none` when no approval is missing, when the current step is internal, or when the run is in OR/completed handoff. They must not imply implementation, QA, release, commit, push or PR authority unless the existing gate model already allows that authority.

## Delivery Path Search

Delivery Path Search is an optional read-only planning step for high-impact decisions with several materially different next actions.

- It consumes current AGDF state and must reject gate-illegal candidates before model evaluation.
- It returns one advisory recommendation or `no_safe_recommendation`.
- It must report budgets, stopping reason and `full | tool_enforced | instruction_only` enforcement.
- Model scores are judgements, not measurements.
- Search output is evidence only. Canonical `gate-check` independently decides what may proceed.
- The bounded first-release algorithm must not be labelled MCTS.
- Surface adapters may translate transport and presentation, but must not fork scoring, search or gate semantics.
- Optional AI-native candidate generation supplements the deterministic candidate baseline; it never replaces it.
- Generated proposals are untrusted. The core must validate schema, exact canonical gate action, scope, duplicates and material diversity before evaluation.
- Generation is opt-in and bounded to one call, five proposals, 30 seconds and five abstract cost units by default, within whole-run budgets.
- External generation receives only bounded normalized control summaries and references, never secrets, full artefacts, raw prompts, hidden reasoning or source snapshots.
- Generator status, provenance, accepted/rejected counts, separate budget use and typed failure must remain visible. Failure retains the deterministic baseline; automatic provider fallback is forbidden.
- Codex and Claude Code may provide tool-enforced generator transports. Copilot, OpenCode and generic surfaces remain instruction-only without conforming evidence.

The field names above are the stable machine-readable contract used by JSON
reports and automation. Human-facing Markdown must present the same projection
with readable labels such as `Current gate`, `Allowed now`, `Blocked by`,
`Next step` and `Quality outlook`; do not expose snake_case keys as the visible
Run Status Card. Keep that card compact: show `Status`, `Current gate`,
`Allowed now`, `Blocked by`, `Missing approval`, `Next gate after approval`
and `Allowed after approval` when a missing approval exists, `Next step` and
`Quality outlook`. Keep mode, forbidden actions, evidence and next-skill detail
in the surrounding control artefact when they are relevant.

## Gate Transition Card

The Gate Transition Card is the primary user-facing orientation message for a
ready `gate_approval`. It is derived from the Run Status Card and canonical
post-approval transition, but it is not another state model, persisted record,
renderer or approval authority. The Run Status Card remains the operational,
CLI and audit projection; the Gate Transition Card turns only the decision-
relevant subset into concise product copy immediately before the host-native
question or exact-text fallback.

The card answers exactly three user questions, in this order:

1. **Where am I?** A localized human-readable gate title, deterministic human
   run title, selected `run_id` as secondary context, compact `UR · PRD · SD · TP`
   artefact links and a clear ready-for-decision state.
2. **What does this decision do?** The exact `Approval: <GateName>` value, its
   concrete next outcome and the most important boundary that remains.
3. **What happens next?** The immediate agent-controlled action and the next
   actual user decision when one exists; otherwise a plain statement that no
   further user action is required now.

Use this compact composition:

```text
<localized gate title> · <human run title> · <run_id>
<UR link or localized missing text> · <PRD link or localized missing text> · <SD link or localized missing text> · <TP link or localized missing text>
<localized ready-for-decision line>

<localized approve heading>
`Approval: <GateName>` <localized concrete effect>. <localized remaining boundary>.

<localized next heading>
<localized immediate agent action>. <localized next user decision or no-action statement>.
```

Resolve all AGDF-owned explanatory text through the canonical Interaction
Locale Registry. `en` and `de` are initial reviewed packs, not a closed locale
list. English is the deterministic fallback for absent, unsupported or
incomplete packs. Gate identifiers, `run_id`, canonical paths and exact
approval values are never translated. The visible gate title is localized;
for example, the German title may be `Lösungsdesign` while the authorization
value remains `Approval: SD`. Meaning, ordering and authority boundaries are
identical across locale packs.

The approval-time card must not be a Markdown table or dashboard. It must not
present raw control-state keys, machine status values, diagnostic codes,
evidence lists, allowed/forbidden inventories or implementation detail that is
not needed for the decision. It must not repeat the native question. The card
normally fits in one title, one readiness line and two short content blocks.

For `Approval: TP`, the effect is permission to run pre-implementation
Brownfield Analysis, implementation remains gated until that analysis passes,
and the next block states plainly that no further user decision is required
now. Brownfield Analysis must not be presented as a user gate.

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

## Knowledge Persistence Decision

Every relevant run should decide what happens to new durable knowledge.
The decision is not a memory dump; it routes only reusable, evidenced information to the right owner.

Use:

- `memory_target: context_graph | sot_registry | scope_artifact | open_questions | none`
- `memory_reason`: short reason for the target
- `memory_refs`: paths or nodes affected

Guidance:

- Use `context_graph` for reusable Brownfield findings, decisions, risks, invariants and exit criteria.
- Use `sot_registry` when source-of-truth ownership changes or drift is found.
- Use `scope_artifact` for run-specific evidence, ticket details, screenshots, logs or local reproduction data.
- Use `open_questions` when a durable question should survive the run but no answer is evidenced yet.
- Use `none` for one-off observations without future decision value.

## Bug Lightweight Track

For narrow defect work, a repository may use a lightweight bug scope instead of the full UR/PRD/SD/TP chain when all of the following are true:

- the defect is tied to a concrete symptom or ticket
- the expected behavior is clear enough to test
- no new product semantics, architecture, policy, persistence or cross-owner decision is introduced
- a durable bug artefact or linked authoritative issue records reproduction, actual behavior, expected behavior, fix boundary, open questions and evidence plan

The Bug Lightweight Track does not remove QA, OR, evidence, Brownfield fit or exact approvals required by the target repository.
If the bug grows beyond the stated boundary, escalate to normal AGDF gate flow.

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

## Support Answer Bridge

When the user asks about a concrete ticket, issue, incident or support question, end with exactly one smallest useful next step.
Do not treat that next step as approval.
When the next step is gated, name the required approval or AGDF skill instead of implying work may proceed.

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

A `quick_task` fully inside the Non-Normative Trivial Change Boundary above stays exempt from the full
selected-run ceremony even when it is otherwise a relevant run. If a selected canonical
`RUN_STATE.md` currently reflects another scope, append exactly one line to that run's
`Prior Run Pointers` section noting what changed and that it is unrelated; do not edit any other
section or any other existing line.

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

## Native Interaction Contract

Native host controls improve how a decision is presented; they do not create a second approval model or authority source.

Every AGDF interaction belongs to exactly one semantic kind:

- `clarification`: asks for missing intent or a choice that does not itself authorize a gated transition.
- `tool_permission`: requests host-owned authority for a command, file change, network access, external path, app action or comparable technical side effect.
- `gate_approval`: requests deliberate user input for the one current AGDF user gate after its durable artefact and selected run are ready.
- `blocked`: explains a blocker and the one permissible recovery action without offering approval controls.
- `status`: reports current state without asking for a decision.

The semantic interaction envelope is:

```text
interaction_kind: clarification | tool_permission | gate_approval | blocked | status
surface: codex | claude | opencode | fallback
run_id: required for gate_approval
current_gate: required for gate_approval
prompt: required
options: required for a structured question
effects: required when the interaction can cause side effects
required_evidence: required for gate_approval
auto_resolution: forbidden for gate_approval
response_origin: deliberate_user_input for gate_approval
```

This envelope is not a new persisted record. The selected canonical `RUN_STATE.md` and existing artefact chain remain the durable authority.

Before presenting `gate_approval` for any user gate (`UR`, `PRD`, `SD`, `TP`,
`QA`, or `UAT`), the agent must emit the localized Gate Transition Card as a
separate, immediately preceding interaction block. The card is not optional,
not hidden in the question text and not replaced by a host button label.
Native buttons or exact-text fallback may appear only after this card. The
underlying Run Status Card fields remain available to evaluation and audit,
but their dashboard projection must not be pasted into this approval-time
message.

Before presenting `gate_approval`, the agent must:

1. resolve exactly one selected run;
2. run the canonical gate evaluation and confirm that the current gate's durable artefact is present and ready;
3. emit the separate localized Gate Transition Card immediately before the gate question, then ask exactly one gate question that identifies `run_id` and `current_gate` and offers the exact approving value `Approval: <GateName>` followed by stable `revise` and `decline` outcomes; host-owned dismissal maps to `cancel` where only three choices are available;
4. wait for deliberate user input without a timeout, default, preselection, hook-supplied answer or agent-to-agent substitute;
5. re-run canonical gate evaluation against the same `run_id` and expected gate immediately before persistence;
6. reject missing evidence, ambiguous or wrong run, wrong gate, stale state and any response that is no longer valid;
7. persist an accepted approval only through the existing control-state workflow.

The first eligible native-attempt has a single bounded outcome: the declared
host control is presented, or the agent immediately uses the exact-text
fallback. A host that does not apply the control does not trigger a second
native prompt. AGDF must not simulate or force host-owned presentation.

An eligible interaction must make its presentation outcome visible and
distinguishable: `presented`, `unavailable_before_invocation`,
`attempted_not_applied`, or `unsafe_to_wait`. This is transient presentation
evidence only, never a persisted approval, selected-run authority or substitute
for post-response revalidation. A textual fallback names the outcome, gives the
exact approval value and confirms that authority is unchanged. A fresh explicit
user request may reopen the unchanged decision after revalidation; it is not an
automatic retry.

A free-form native response is valid only when the existing exact-approval validator accepts it for the current gate after revalidation. A localized label, description, option position, recommendation style or host action never authorizes a gate. Revise, decline and cancel outcomes never advance a gate.

Surface adapter rules:

| Surface | Native question adapter | Gate-safe use | Technical permission boundary |
|---|---|---|---|
| Codex | native `request_user_input` or equivalent short-question control when callable | on the first eligible attempt, present one gate question with auto-resolution omitted; if unavailable or not applied, use exact text without retry | Codex command, edit, network, external-directory and app-action approvals remain host-owned `tool_permission`. |
| Claude Code | `AskUserQuestion` | on the first eligible attempt, use only when no timeout can auto-continue and no hook supplies `answers` or `updatedInput`; if unavailable or not applied, use exact text without retry | Claude permissions and `ExitPlanMode` are not AGDF approval. |
| OpenCode | built-in `question` | use with exact approval/revise/cancel options when `permission.question` permits it; explicit user deny selects exact-text fallback | `once`, `always`, `reject`, permission suggestions and auto mode are technical outcomes only. |
| Fallback or non-interactive | concise exact text | wait for a new explicit user response; never synthesize or auto-resolve one | Host-specific technical permission remains separate. |

Native structured questions are for real decision points. Prefer repository inspection over clarification and do not show them for status reporting, discoverable facts, routine read-only work or repeated non-ready gate prompts.

Exact textual approvals remain canonical and fully supported on every surface. If native capability availability or safety is unknown, use the textual fallback. Host permission, plan approval, native question presentation, timeout/default behavior, hook output and agent messages never carry AGDF gate authority by themselves.

### Interaction Locale Contract

User-facing native questions, option descriptions, primary chat cards, exact-text
fallback and human CLI output use the configured project chat language from
`.agdf/control/config.json` and the canonical registry
`plugin/meta/agdf-interaction-locales.json`:

- resolve an exact complete pack, then its language subtag, then deterministic English fallback;
- `en` and `de` are the initial complete packs; additional reviewed complete packs are supported without changing runtime logic;
- an incomplete pack is unsupported and must fail to English as a unit;
- one interaction must not mix presentation languages, including labels and descriptions;
- durable artefacts, runtime rules, task identifiers and machine-facing approval values remain English;
- the exact approval value remains `Approval: <GateName>` in every locale;
- localized `revise`, `decline` and `cancel` labels are presentation text only and never carry gate authority;
- host-owned chrome follows the host's own UI language and must not be presented as AGDF-translated chat copy.

The locale changes presentation only. It must not change gate meaning, option ordering, readiness, validation, revalidation or persistence. Host-provided free-text labels and skip actions are not AGDF-owned approval options and must never advance a gate.

### Human Decision Presentation Contract

The primary user surface is a pure projection of the selected canonical run.
It must never become a second evaluator, state store, renderer authority or
approval path. Native controls, exact-text fallback and human CLI output use
the same semantic payload and outcome ordering; machine JSON retains its
stable field names and diagnostic values.

For every primary chat card:

1. Resolve a human run title deterministically from the current artefact
   heading, approved UR heading, first non-empty Objective line, then normalized
   `run_id`.
2. Show `UR · PRD · SD · TP` in that stable order. Existing selected-run
   artefacts are links with readable labels; missing artefacts use localized
   non-link text. Never guess a path or emit a broken link.
3. Use a localized visible gate title while preserving the exact gate identifier
   and `Approval: <GateName>` authorization value.
4. Keep primary copy decision-oriented. Raw keys such as `next_user_gate`,
   `mode_slice_decision` and `required_next_gate`, diagnostic codes and machine
   status values belong to JSON or audit detail, not the primary interaction.

For a ready approval, explicit options are ordered `approve`, `revise`,
`decline`; an explicit `cancel` follows only on surfaces that support it, while
host dismissal maps to `cancel` on three-choice surfaces. Do not preselect,
auto-submit, recommend as authorization, skip or reorder an option. Labels and
descriptions use the same resolved locale and must have distinct, non-empty
accessible names. Translation length budgets must preserve meaning without
truncation being the only distinction.

Normalize outcomes as distinct values:

```text
approve | revise | decline | cancel | no_response | timeout | empty | invalid | stale
```

Missing input, timeout, cancellation and empty input are not decline. Only
`approve` backed by the exact revalidated `Approval: <GateName>` value may
advance a gate. Clarification, blocked, internal-step and status-only
interactions must not display gate-approval controls.

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
- `context_graph_reconciliation`: `resolved | not_applicable | open_gap`
- `context_graph_required_action`: `none | link | update | create | resolve_drift`
- `context_graph_gate_effect`: `none | warning | revise | block`
- `context_graph_evidence`

Do not create a new node for a mere version, a general chat summary, or a local observation without a concrete next clean step.
`sot_drift` must not pass silently as a warning.

### Context Graph Reconciliation

Relevant-run closeout must reconcile Context Graph impact before presenting a clean delivery handoff.

- Use `not_applicable` only when `context_graph_impact: none` and no durable graph knowledge is claimed.
- Use `resolved` when required graph work is complete and concrete refs are present.
- Use `open_gap` when graph work remains pending, refs are missing, or a node/update must still be curated.
- `link`, `update`, `create` and `resolve_drift` require either `resolved` evidence or an explicit `open_gap`.
- Resolved `link_only`, `update_existing_node` and `new_node_required` states require concrete `context_graph_refs`; `none`, empty refs or vague future-action language are not enough.
- OR and delivery-closeout must not present commit-ready, release-ready or otherwise clean handoff while `context_graph_reconciliation: open_gap` remains.

## Control Scaffold

### Run-Scoped Control State

Canonical mutable run state lives at `.agdf/control/runs/<run_id>/RUN_STATE.md`, one file per run.
Repository-level discovery is derived; do not maintain a writable active-run dashboard. Select with
`--run`, then `AGDF_RUN_ID`, or automatically only when exactly one run is active. Ambiguity fails
closed. Legacy `AGDF_RUN.md` is migration input or an explicitly rendered non-authoritative projection,
never a second writable owner. Read-only commands must not migrate state.

When a repository needs durable AGDF state, use the plugin-local `control/` scaffold as the starting point.

- `config.json` stores project language preferences. Use `artifact_language` for generated AGDF artefacts and `chat_language` for user-facing responses unless the user explicitly asks otherwise. Runtime rules remain English.
- `.agdf/control/runs/<run_id>/RUN_STATE.md` is the canonical current-run dashboard; legacy `AGDF_RUN.md` is migration input or an explicit non-authoritative projection.
- `MASTER_BACKLOG.md` is the living pointer for active delivery work.
- `BROWNFIELD_REVIEW.md` records the post-UR existing-system view and Mode/Slice Decision before PRD depth or Quick Task execution is chosen.
- `SOT_REGISTRY.md` prevents parallel sources of truth.
- `CONTEXT_GRAPH.md` stores durable Brownfield findings, decisions, risks, evidence and exit criteria.
- `AGENT_QUALITY_CONTRACTS.json` stores reusable block, revise and warning conditions.
- `memory_target`, `multi_scope_state` and branch/workspace evidence fields make ambiguity and persistence decisions visible without turning chat history into the source of truth.
- OR reports live under `.agdf/control/artefacts/<key>/OR.md` when a run closeout is steering-relevant or should be auditable beyond the chat.

### Human-readable Master Backlog

The Markdown backlog is a human steering view; CLI reports are its normalized
machine projection.

- Use readable status labels such as `In progress`, `Awaiting UAT` and
  `Completed` in Markdown.
- Use links relative to `MASTER_BACKLOG.md`, such as
  `[UR](artefacts/<key>/UR.md)`, instead of exposing long raw paths.
- Keep `Priority`, `Key`, `Work item`, `Status`, `Artefacts`, `Current spec`
  and `Next step` visible for active and planned work.
- Keep one canonical template. Generated surface copies remain derived output.
- Normalize human labels and link targets only at the CLI parser boundary.
- Existing wide rows, raw paths and snake_case statuses remain supported for
  backward compatibility.

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

`delivery-map --json` is the machine-readable delivery picture for the selected canonical control state.
It derives, but does not replace, the selected `RUN_STATE.md` and `MASTER_BACKLOG.md` state.

It must expose:

- approved or active artefacts and approvals
- `UR -> PRD -> SD -> TP -> QA_REPORT` relationships
- evidence refs, missing evidence and declared risks
- multi-scope ambiguity and branch/workspace evidence limits when present
- memory persistence target, reason and references when present
- Context Graph impact and gate effect
- the Run Status Card as a compact projection of current gate, next step and quality outlook
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
