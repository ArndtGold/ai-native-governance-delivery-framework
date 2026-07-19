# UR: Define UX Intent And Route Review Gaps Upstream

Status: approved
Gate: UR
Gate approval: approved (`Approval: UR`, 2026-07-19; revision 14)
Date: 2026-07-19
Owner: user

## 1. Problem

AGDF currently leaves most UX intent implicit until post-implementation review. The PRD template
contains only a general `Users And Roles` prompt, so implementations can be technically functional
while failing to represent the user's intended decisions, working modes, effective state, state-type
boundaries, activation paths or recovery paths.

When a later review invents these criteria, requirement defects become retrospective remediation.
QA can then judge the implementation against review sentiment instead of an approved product promise.

## 2. Goal

Make UX intent an explicit pre-implementation requirement and preserve a clean verification chain:

- UR captures user intent, context, primary decision and success signal.
- A conditional `ux-intent-definition` skill creates structured analytical input before PRD drafting
  when user-facing modes, states, activation, blockers, recovery or transitions need deeper definition.
- PRD turns capability scope, working modes, effective state, state-type separation, activation and
  recovery paths into observable acceptance criteria.
- TP maps every applicable UX-intent acceptance criterion to an implementation task, test and
  required visible evidence.
- Task Plan Review includes a mandatory `UX Intent Fidelity` dimension that verifies both PRD-to-TP
  traceability and TP-to-code/surface fulfilment without creating missing product requirements.
- QA consumes that review evidence and evaluates the implementation against approved PRD acceptance
  criteria; `qa-gate` remains the sole final QA decision owner.

## 3. Scope

This first slice covers the conditional `ux-intent-definition` skill, the canonical PRD template and
the AGDF workflow guidance that assigns UX intent definition, traceability and verification
responsibilities across UR, proportional routing, PRD, TP, Task Plan Review and QA.

The skill routing must distinguish Greenfield and Brownfield work:

- **Greenfield:** run after `Approval: UR` and after proportional routing has classified UI/UX impact,
  before PRD drafting begins.
- **Brownfield:** run after `Approval: UR` and Brownfield Review has classified UI/UX impact, before
  PRD drafting begins.
- **Required:** run when UI/UX impact is `medium` or `high`.
- **Optional:** run when impact is `low` and the mandatory PRD UX fields are already unambiguous.
- **Not applicable:** record when no user-facing capability, decision, state or recovery behavior is
  affected.

The skill is an internal analytical step, not a user approval gate. Optional invocation at low impact
must not make the PRD's minimum UX requirements optional.

For medium-or-higher UI/UX impact, the `ux-intent-definition` output and PRD must explicitly cover:

1. user intent, context, primary decision and observable success signal;
2. capability boundaries and real working modes;
3. effective state per working mode, including what applies, what blocks and which state type is visible;
4. separation of relevant state types, such as configured, activated, available, effective, blocked
   and failed;
5. activation, deactivation and recovery paths, including visible retry for transient failures; and
6. testable acceptance criteria and later visible-evidence expectations for each relevant mode and
   state transition.

The skill must separate two ownership concepts:

- `effective_state_authority_by_mode`: the product or system authority that decides what is
  effectively true in each working mode; and
- `primary_state_presentation_owner_by_mode`: the primary surface that communicates that state in a
  user-visible and action-guiding way.

Technical storage, derivation and component ownership remain Solution Design concerns.

The skill must return exactly one analytical decision:

- `ready`: reliable analytical input exists for PRD drafting;
- `blocked`: required semantics or evidence are unresolved; or
- `not_applicable`: no relevant user-facing intent, state or recovery behavior is affected.

A blocked result must expose `blocking_reason`, `open_product_questions`, `affected_outputs`,
`required_next_step`, `evidence` and `missing_evidence`. Conflicts with approved UR intent must route
to UR revision rather than being silently reinterpreted. Material change discovered after PRD
approval must route to PRD revision or, when user intent or scope changes, to UR revision.

Each proposed PRD acceptance criterion must include a stable criterion identifier, relevant working
mode, source state, trigger, expected effective state, visible feedback, blocker or failure behavior,
recovery or next action, observable success and required evidence. The skill proposes these criteria;
only the approved PRD makes them authoritative.

For each applicable UX-intent acceptance criterion, the TP must preserve an explicit chain:

`PRD acceptance criterion -> working mode/state -> task_id -> implementation/test -> visible evidence`

Task Plan Review must evaluate this chain in two directions:

1. **PRD to TP:** every applicable approved UX-intent criterion is represented by an executable task
   and evidence obligation; and
2. **TP to code/surface:** the delivered implementation and visible surface fulfil the mapped promise.

If the PRD lacks a required UX criterion, Task Plan Review must report `requirements_gap` and route
the work back to PRD revision. It must not derive, invent or silently add the missing criterion.

## 4. Non-Goals

- Prescribing visual styling, colors or component-library details in the PRD.
- Creating a standalone post-implementation `ux-intent-review` skill or a second review authority.
- Letting Task Plan Review create or silently expand approved product scope.
- Making `ux-intent-definition` a new user approval gate or an authoritative alternative to the PRD.
- Replacing detailed interaction design that legitimately belongs in Solution Design.
- Claiming that repository tests alone prove live host-visible behavior.
- Implementing a particular product surface as part of this framework-maintenance request.

## 5. Acceptance Signals

- The PRD template no longer treats `Users And Roles` as the only UX-related prompt.
- Greenfield and Brownfield routing deterministically classifies UI/UX impact before PRD drafting.
- Medium-or-higher UI/UX impact requires `ux-intent-definition`; low-impact work retains mandatory
  PRD minimums even when the skill is skipped.
- The skill returns only `ready | blocked | not_applicable`, fails closed for unresolved semantics or
  contradictory evidence and never advances an AGDF user gate.
- Effective-state authority and primary state presentation ownership are separately defined by mode.
- Proposed PRD acceptance criteria use stable identifiers and observable behavior/evidence fields.
- Workflow ownership clearly distinguishes requirement definition from implementation review.
- Every applicable UX-intent PRD criterion is traceable through a TP task to implementation, tests
  and visible evidence.
- Task Plan Review reports a distinct `UX Intent Fidelity` result with the PRD criterion, relevant
  working mode/state, mapped `task_id`, visible evidence and `fulfilled | partial | missing` status.
- Missing PRD criteria produce `requirements_gap` and PRD revision rather than post-hoc recommendations.
- QA requires the Task Plan Review's UX-intent evidence for applicable modes, state types, activation
  and recovery paths and cannot pass a relevant gap silently.
- Canonical source, generated package assets and behavioral validation remain synchronized.

## 6. Existing Source Of Truth

- `plugin/control/templates/artefacts/PRD.md`
- `plugin/control/templates/artefacts/UR.md`
- `plugin/meta/contracts/gate-transition.md`
- `plugin/meta/contracts/modes.md`
- `plugin/meta/contracts/quality.md`
- `plugin/skills/brownfield-analysis/SKILL.md`
- `plugin/skills/ux-intent-definition/SKILL.md` as the intended new conditional analysis owner
- `plugin/skills/task-plan-review/SKILL.md`
- `plugin/skills/qa-gate/SKILL.md`
- `create-agdf/generated/` as derived package output only

The new `ux-intent-definition` skill is an analytical PRD input only. No standalone post-implementation
`ux-intent-review` skill is intended. `plugin/skills/task-plan-review/SKILL.md` remains the canonical
implementation-fidelity owner, while `plugin/skills/qa-gate/SKILL.md` remains the final QA decision
owner.

## 7. Risks And Unknowns

- Proportional routing and Brownfield Review must use one canonical UI/UX-impact vocabulary and
  evidence rule without creating divergent Greenfield and Brownfield semantics.
- Requiring every UX field for low-impact or non-UI work would create disproportionate ceremony.
- Effective-state requirements must remain product semantics without collapsing into SD-level widget detail.
- The analytical output must remain linked PRD input and must not become a parallel requirements SoT.
- PRD-to-TP traceability could be lost if Task Plan Review checks only TP completion and not the
  approved PRD criteria that the TP was required to carry forward.
- Generated assets and runtime-integrity checks must prevent template and skill drift.

## 8. Revision 14 Scope Extension: Shared Review Gap Routing

The user requested that the same definition-before-verification authority boundary apply across the
other post-implementation review skills. AGDF must define one shared, machine-checkable gap taxonomy
and route each finding to the earliest authoritative artefact or execution step that can resolve it:

- `requirements_gap` -> PRD revision;
- `design_gap` -> SD revision;
- `plan_gap` -> TP revision;
- `implementation_gap` -> CD+Tests correction;
- `evidence_gap` -> the mapped test or visible-evidence obligation; and
- `emergent_risk` -> explicit assessment followed by the earliest affected artefact or execution step.

The shared Quality Contract must own the taxonomy and routing semantics. `task-plan-review`,
`clean-implementation-review`, `code-review` and `qa-gate` consume it without maintaining divergent
copies. Review skills may verify approved requirements and designs and may discover concrete defects
or emergent risks, but they must not create missing product requirements, architecture decisions or
plan obligations retrospectively.

Acceptance signals for this extension:

- every applicable review finding carries exactly one canonical gap type and one explicit routing target;
- Clean Review routes missing canonical ownership, fallback policy, exit criteria and prohibited
  parallel structures to SD or TP instead of treating them as newly invented review expectations;
- Code Review continues to own concrete diff defects and emergent implementation risks while routing
  missing upstream constraints to their authoritative artefact;
- Task Plan Review retains `requirements_gap`, `plan_gap`, `implementation_gap` and `evidence_gap`
  semantics through the shared contract rather than a private taxonomy;
- QA consumes the normalized findings and cannot pass an unresolved applicable gap;
- the change creates no new approval gate, review decision owner or automatic artefact rewrite; and
- focused normal, boundary and adversarial tests prove classification, upstream routing, fail-closed
  unknown values and generated-surface parity.

Non-goals for this extension:

- predicting every defect before implementation;
- turning Code Review into a static requirements checklist;
- allowing review skills to modify PRD, SD or TP automatically; or
- changing the existing user-gate order or final QA authority.

## 9. Next Step

Review this durable UR and approve only with:

`Approval: UR`
