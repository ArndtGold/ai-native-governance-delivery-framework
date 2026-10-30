---
name: ux-intent-definition
description: "Use this skill for this scope: approved UR with routed medium/high UX impact or ambiguous low-impact semantics before PRD. Boundary: analytical PRD input only; no intent, gate, design or parallel product authority. The requested effect, not discovery, decides AGDF activation."
---

# ux-intent-definition

## Purpose

Create structured, testable UX intent input before PRD approval so implementation reviews verify an
approved product promise instead of inventing requirements after code exists.

## Runtime Contract

Use `continuation.runtime_contracts` after `skill_continuation`. If absent: listed MCP `agdf_inspect` (`operation: contract`, `module: <name>`); else supplied schema-2 executable/argv_prefix[0] `contract --module <name>`; else bundled files below. MCP reads need no hook or shell. Missing module: stop; never infer/search for runtime.

- `../../meta/contracts/gate-transition.md` for impact routing, authority and revision behavior;
- `../../meta/contracts/quality.md` for evidence and fail-closed output discipline.

`instruction_only`: first load `../../meta/contracts/task-target-resolution.md` and `../../meta/contracts/interaction.md`.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:af2f01f9e18a3ba1c520faf0691aa1cd4a4299bdfa027cf83651c5d14319bfdc`

Decide effect from loaded instructions before AGDF action.

Abstain silently (no AGDF call) for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate for any requested file/code change however small, a binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then pick one catalog route; non-authorizing, downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Executable Dispatch

Use listed MCP `agdf_dispatch` (load deferred; host prefix allowed): `skill_id` `ux-intent-definition`, `presentation_language` (optional override), `working_directory`, and only bound `target_source`/`primary_target` and `run_id`. Never search unlisted tools.
If absent/failing: supplied schema-2 executable, child-only environment, immutable argv_prefix, declared arguments; `--skill ux-intent-definition`, language and working directory.
MCP: MCP reply-language override (BCP 47). Omit for a matching configured preference; otherwise supply the current request's language (explicit instruction, then dominant language, en if ambiguous). Invalid explicit tags fail; valid unsupported tags use the complete English pack. Core input remains complete.
For `--language`: Required; apply the same current-request selection and locale validation.
`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.
Quote shell values as data.
For a result with `terminal: true`, the entire assistant response must consist only of host_action.text, copied verbatim. Add no question, explanation, heading, citation, link or other surrounding text; do not translate or reformat it; invoke no later tool and stop.
On skill_continuation use only its target/control. Without that tool and a valid binding: `dispatcher_unavailable`; no runtime search, environment repair
or help retries. Dispatch never authorizes.

## Authority

This is an internal analytical skill, not a user gate. It cannot approve artefacts, grant
implementation permission, change approved UR/PRD intent, prescribe technical design or become a
parallel product source of truth. Proposed criteria become authoritative only when incorporated into
and approved as PRD content. Technical storage, derivation and component ownership remain SD concerns.

## Inputs

- approved UR and its intent, success signal, primary action and persona/context;
- requested clarification deliverables, preview scenarios, interaction needs and timing in UR scope;
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
6. Use UI previews as described below when seeing or trying the proposed behavior materially helps
   resolve a product question. Propose observable PRD acceptance criteria and identify open questions.
7. Return exactly one decision: `ready | blocked | not_applicable`.

### UI previews for clarification

Use a focused preview during UX intent clarification and reuse its findings during PRD alignment.
Start with the user's task and unresolved decision, not a decorative dashboard. Show the relevant
starting state, primary action, visible outcome and, where relevant, a blocker or recovery path.
For example: can the user find what was checked, identify an open risk and decide whether to approve?
Match known product context; identify illustrative data and unconfirmed assumptions explicitly.

First preserve any preview explicitly required by approved UR scope, including its interaction,
format and timing. Use an available visualization capability such as `visualize` when suitable.
For an optional aid, a wireframe or written scenario walkthrough may answer the same question.
For an explicitly requested interactive preview, unavailable tooling requires concrete recovery or
an explicit scope revision; do not silently downgrade it or report the obligation fulfilled.
Do not invent a preview requirement for already clear semantics, add a gate or install a dependency.
Keep prototype interactions local; they cannot submit real approvals, modify delivery state or start
implementation. A requested change to the actual product still follows its existing delivery path.

#### Retain a run-bound preview

For a preview used in this bound analysis, save a durable, reopenable copy under
`.agdf/control/artefacts/<run_id>/previews/<short-name>-v<N>/index.html`, relative to the supplied
governance target. Derive the run from the valid assignment, not cwd, recency or another run.
Resolve containment and reject symlink escapes before writing; never put preview content in
`runs/<run_id>/RUN_STATE.md`. Use a new unused version for revisions and preserve reviewed versions.
Store a standalone document, preferably self-contained; bundle any local assets with relative
references. For an inline visualization, keep its editable source in the host's permitted location
and export a standalone copy to the run directory using that capability's supported flow. Remove
host-only dependencies from the durable copy. Reopen it from its saved location and exercise the
relevant interaction before claiming portability; an export or screenshot alone is insufficient.
For required interactive PRD review, make that durable copy offline with local classic scripts,
styles and images, without modules, remote resources or host calls. The PRD author owns the
`Preview Review` descriptor and final criterion mapping; UX supplies the exact files and findings.

Record the target run, source UR revision/digest, preview version, relative entry path, SHA-256 of
the saved file (and local assets), covered scenarios and actual validation limits in the existing
analysis `evidence` field. Keep observations tied to that version; a changed preview needs fresh
inspection and affected user feedback. The UX report and PRD link the same evidence, not divergent
copies. Use existing canonical recording/revision owners for their updates; preview bytes are
supporting evidence, not a new approval authority or an automatically sealed artefact type.
An unbound conversation preview remains advisory; do not create or select a run just to attach it.

For PRD alignment, hand off a concise user review task, the readable versioned preview reference,
covered scenarios and proposed criterion IDs alongside the observations. The existing presentation
owner uses this material under interaction.md PRD Preview Review At Approval. Distinguish the
proposed experience from delivered functionality and record any unavailable review access explicitly.

Walk through the concrete task with the user and record observed behavior, feedback, unresolved
assumptions and resulting proposed criteria in the existing `evidence`, `open_product_questions`
and `proposed_prd_acceptance_criteria` fields. Distinguish agent inspection from user observation;
check rendering and the relevant interaction before claiming they work. If no inspection or user
observation occurred, say so. Retain the scenario and findings as well as the durable preview
reference; chat-only or missing preview evidence cannot fulfill an explicit preview requirement.
Preview feedback is analytical
input, not PRD approval, implementation evidence or host qualification. Layout and component choices
remain illustrative; only explicitly adopted product behavior becomes approved PRD content.

## Decision Rules

- `ready`: every required output is reliable enough for PRD drafting, including a requested preview
  at the agreed fidelity, its durable evidence and resolution of material product questions.
- `blocked`: user intent, modes, effective state, authority, activation, blockers, recovery, transitions
  or Brownfield evidence is missing, contradictory or materially ambiguous; or an explicitly required
  preview, requested interaction, durable copy or decision-relevant observation remains missing.
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
the result to `.agdf/control/artefacts/<run_id>/UX_INTENT_DEFINITION.md` without a Gate or approval field.

## Forbidden

- invent product intent or silently choose between conflicting modes/state authorities;
- bypass UR/PRD revision or claim PRD readiness from a blocked result;
- add a gate, approval value or implementation permission;
- prescribe components, persistence, endpoints, styles or other technical design;
- treat supporting analysis as authoritative beside the approved PRD.

Apply interaction.md Bounded internal recovery and prepared observation for eligible bound follow-up. It adds no gate or approval authority.
