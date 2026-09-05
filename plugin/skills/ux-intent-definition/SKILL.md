---
name: ux-intent-definition
description: "Use this skill for this scope: after approved UR and post-UR routing for medium/high UI/UX impact or ambiguous low-impact product semantics before PRD readiness. Boundary: non-authorizing analytical PRD input; never creates product intent, gate permission, technical design or a parallel product source of truth. Automatic discovery alone does not activate AGDF."
---

# ux-intent-definition

## Purpose

Create structured, testable UX intent input before PRD approval so implementation reviews verify an
approved product promise instead of inventing requirements after code exists.

## Runtime Contract

After `skill_continuation`, use:

- `../../meta/contracts/gate-transition.md` for impact routing, authority and revision behavior;
- `../../meta/contracts/quality.md` for evidence and fail-closed output discipline.

`instruction_only`: first load `../../meta/contracts/task-target-resolution.md` and `../../meta/contracts/interaction.md`.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `plugin/meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`

Decide effect from loaded instructions before AGDF action/output.

Abstain silently, call no AGDF owner, for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate only for actual delivery/mutation, binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then choose one catalog route. Non-authorizing; downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Executable Dispatch

Use supplied binding schema 2 only: executable, child-only environment and immutable argv_prefix.
Follow binding.arguments exactly with `--skill ux-intent-definition`, language and working directory. Carry
established explicit/continued/current-repository target evidence as both target fields; otherwise
omit both. Cwd or skill invocation alone is not target authority. Quote shell values as data.
On `terminal: true`, transmit host_action.text verbatim and stop; on skill_continuation use only its
target/control. Missing/failed/old binding: `dispatcher_unavailable`; no search, environment repair
or help retries. Dispatch never authorizes.

## Authority

This is an internal analytical skill, not a user gate. It cannot approve artefacts, grant
implementation permission, change approved UR/PRD intent, prescribe technical design or become a
parallel product source of truth. Proposed criteria become authoritative only when incorporated into
and approved as PRD content. Technical storage, derivation and component ownership remain SD concerns.

## Inputs

- approved UR and its intent, success signal, primary action and persona/context;
- post-UR `delivery_context`, `ui_ux_impact`, reason and required flag;
- existing behavior/ownership evidence for Brownfield work;
- known working modes, state semantics, activation, blockers, recovery and transitions.

## Workflow

1. Confirm the approved UR and routing evidence. If required evidence is absent or conflicts, block.
2. Identify the primary user intent, observable success and primary decision/action.
3. For every relevant working mode, define effective state and visible state types.
4. Separate `effective_state_authority_by_mode` from
   `primary_state_presentation_owner_by_mode`; do not turn either into technical ownership.
5. Define activation/deactivation, blockers with visible next actions, actionable recovery (including
   visible retry for recoverable transient failure) and relevant state transitions.
6. Propose observable PRD acceptance criteria and identify open product questions.
7. Return exactly one decision: `ready | blocked | not_applicable`.

## Decision Rules

- `ready`: every required output is reliable enough for PRD drafting.
- `blocked`: user intent, modes, effective state, authority, activation, blockers, recovery, transitions
  or Brownfield evidence is missing, contradictory or materially ambiguous.
- `not_applicable`: routing proves that no relevant user-facing intent, state or recovery behavior changes.

A conflict with approved UR routes to UR revision. A material product change discovered after PRD
approval routes to PRD revision, or UR revision when intent/scope changes. Never resolve the conflict
silently. A required blocked result prevents PRD readiness.

## Output

Populate each field or use an explicit, justified `not_applicable`:

```text
- decision: ready | blocked | not_applicable
- blocking_reason:
- primary_user_intent:
- success_signal:
- primary_decision_or_action:
- working_modes:
- effective_state_by_mode:
- visible_state_types:
- effective_state_authority_by_mode:
- primary_state_presentation_owner_by_mode:
- activation_paths:
- blockers:
- recovery_paths:
- relevant_state_transitions:
- proposed_prd_acceptance_criteria:
- open_product_questions:
- affected_outputs:
- evidence:
- missing_evidence:
- required_next_step:
```

For `blocked`, `blocking_reason`, `open_product_questions`, `affected_outputs`, `evidence`,
`missing_evidence` and `required_next_step` are mandatory. When durable control state exists, write
the result to `.agdf/control/artefacts/<key>/UX_INTENT_DEFINITION.md` without a Gate or approval field.

## Forbidden

- invent product intent or silently choose between conflicting modes/state authorities;
- bypass UR/PRD revision or claim PRD readiness from a blocked result;
- add a gate, approval value or implementation permission;
- prescribe components, persistence, endpoints, styles or other technical design;
- treat supporting analysis as authoritative beside the approved PRD.
