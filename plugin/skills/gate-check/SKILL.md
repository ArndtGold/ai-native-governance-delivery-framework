---
name: gate-check
description: Use this skill as the default first AGDF skill for any new build, change, extension, refactor, feature, CLI, app, fix with product semantics, Structured Delivery request, unclear approval, later-gate artefact request, or unclear next permissible step. Use it before brownfield-analysis, implementation, formal artefacts, QA, or release when approval/evidence/next action is not already explicit.
---

# gate-check

## Purpose
Determine the earliest blocking user approval gate and derive:

- the active or blocking gate
- whether the process is open or blocked
- currently allowed outputs
- currently forbidden outputs
- the exact missing approval
- the next permissible step

This skill must not create later artefacts such as PRD, SD, TP, CD, CR, QA, or UAT when the gate does not allow them.

## Runtime Contract
Use these focused runtime-contract modules:

- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/modes.md`
- `../../meta/contracts/quality.md`
The canonical gate order and transition model live only in `../../meta/contracts/gate-transition.md`. This skill evaluates the current state against that model; it must not maintain a second complete gate table.

## Agent-Native Control Path

AGDF is agent-native first and CLI-verifiable by design.
This skill is the primary operating path for gate judgement.

First inspect the durable control state directly:

- selected `.agdf/control/runs/<run_id>/RUN_STATE.md` (or legacy `AGDF_RUN.md` before explicit migration)
- `.agdf/control/MASTER_BACKLOG.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

If required control files are missing, do not automatically create a full `.agdf/control/` scaffold for a fresh small request.
The default first action is to draft the minimal UR in the response and request `Approval: UR`.
Use `init` only when the user explicitly asks for durable AGDF control state, the repository already uses `.agdf/control/` as its live working state, or a deterministic CLI/CI setup path is being executed.

Use the executable control path when a machine-readable check is requested, when the gate state is ambiguous, when CI or PR evidence is needed, when deterministic ready-gate rendering is required, or when a repository-local automation needs JSON output. Prefer an already installed `agdf` executable; use registry-resolved `npx ...@latest` only for bootstrap, installation, explicit refresh or when no local executable exists:

```bash
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest doctor --json
npx --yes @agdf/cli@latest gate-check --json
npx --yes @agdf/cli@latest delivery-map --json
```

For repeated local checks, use `agdf doctor --json`, `agdf gate-check --json` or
`agdf gate-check --approval-envelope`. The last command prints the validated
two-card exact-text interaction; JSON exposes the same `approval_presentation`
for a native-capable adapter.

`init` creates the control scaffold. `doctor` checks whether `.agdf/control/` is actionable. `gate-check` consumes that result and the selected canonical run record to report the operative process decision: `open | blocked`, current gate, blocking reason, missing approval, allowed outputs, forbidden outputs, next allowed action and evidence references.
`delivery-map` reports the durable delivery picture: active artefacts, approvals, Artefact Chain relationships, evidence refs, missing evidence, risks, Context Graph gate effect and machine-readable findings.

The CLI reports are validators and JSON evidence, not the primary user experience, not a required ritual for normal work and not a second rule system. If a report says `blocked`, do not continue with later-gate artefacts until the reported blocker is resolved.

## Native Interaction Path

Use the Runtime Contract's Native Interaction Contract to classify every candidate interaction as `clarification`, `tool_permission`, `gate_approval`, `blocked` or `status` before selecting a host control.

Prefer inspection over asking. Do not invoke a structured question for status reporting, facts available in the repository, routine read-only work or a gate that is not ready. Do not repeatedly prompt for the same non-ready gate.

For a fresh request classified as read-only with no required run decision, emit the locale pack's
`primary.readOnlyOrientationDescription` sentence once before the findings. This path creates no run, persists
nothing, requests no approval and reuses the existing status projection. Do not repeat the sentence
during the same request.

For a ready `gate_approval`:

1. Resolve exactly one selected run and evaluate the current gate.
2. Confirm the required durable artefact is present and ready before presenting a question.
3. Consume the validated canonical `approval_presentation` for the same selected run, gate and revision. Do not compose or rewrite headings, fields, card order, locale copy or Markdown in the model.
4. Emit its complete `run_status_card` block first and `gate_transition_card` block second in one immediately preceding assistant message. The first heading is neutral; the five status fields are selected run, readiness, current gate, human-readable required decision and a neutral approve/revise/decline instruction. The exact approval value appears only in the transition card across these two blocks.
5. Never put either card only into the question, button description or hidden tool context. Do not invoke a native question until both rendered blocks are visible.
6. If the projection is absent or invalid, render no partial card and invoke no native control. Re-evaluate the gate. Use only the exact-text request when the same gate is still ready and its canonical value is independently valid; otherwise report the non-ready reason and request no decision.
7. Distinguish internal process steps from user decisions in natural language. For example, after `Approval: TP`, say that pre-implementation Brownfield Analysis runs next and that no further user action is required now; do not expose `next_user_gate: none` or `user_action_required: no`, and do not ask for a second approval for Brownfield Analysis.
8. Ask exactly one question that names the selected `run_id` and `current_gate`.
9. Offer options in stable order: exact `Approval: <GateName>`, localized revise and localized decline. Add explicit cancel only where supported after decline; otherwise host dismissal maps to cancel. Never preselect, skip, auto-submit or reorder an option.
10. Use the surface adapter declared in the canonical plugin definition only when it can wait for deliberate input without auto-resolution and can transport `exact_option_value` or `separate_label_and_value`; never invoke a `decorated_label_only` adapter. Otherwise request the same exact approval in concise text.
11. Render both supplied cards once in that single complete assistant message. Never merge, reverse, omit, duplicate or reconstruct them; the decision heading does not replace either card. If the native attempt is unavailable or not applied, continue to exact text without repeating either card.
12. Re-run gate evaluation for the same run and expected gate after the response and immediately before persistence.
13. Reject a missing artefact, ambiguous or wrong run, wrong gate, stale expected gate, timeout/default, hook-supplied answer, agent message, technical permission outcome or plan approval.
14. Persist accepted input only through the existing control-state workflow.

Before projecting a ready gate, evaluate adapter callability, deliberate wait safety and canonical
approval-value transport. Expose `native_attempt_required: true` only when that preflight proves
`exact_option_value` or `separate_label_and_value` transport with safe deliberate waiting. Decorated-only,
missing, conflicting or unknown capability exposes false and `unavailable_before_invocation`; unsafe
waiting exposes false and `unsafe_to_wait`. In both cases use exact text without invoking the adapter.
A hook, permission result or session context message cannot replace an eligible attempt or supply its answer.

Before composing the question, resolve the configured chat locale from `.agdf/control/config.json` through `plugin/meta/agdf-interaction-locales.json`: exact complete pack, language subtag, then English fallback. German and English are initial packs, not a closed language list. Keep `Approval: <GateName>` exactly unchanged in every language, and do not mix presentation languages within one interaction. Labels and descriptions use the same resolved locale; host-owned UI chrome remains host-owned and may use a different language.

The canonical renderer resolves the complete locale pack. The initial German pack includes `Bereit für deine Entscheidung`, `Jetzt freigeben` and `Danach`; the initial English pack includes `Ready for your decision`, `Approve now` and `Next`. Verify that the supplied blocks use one locale and a neutral decision heading while leaving the exact gate identifier and approval value unchanged. Do not model-edit the supplied Markdown.

The primary option is derived exactly as `Approval: <GateName>` from the evaluated current gate; only explanatory copy and non-authoritative outcome labels are localized. Concrete localized copy belongs to the user-facing interaction layer or the approved delivery artefact, not to English runtime rules.

Make exactly one native-attempt for the eligible ready gate. If the host does not render,
apply or safely return the native question on that attempt, switch immediately
to the exact textual approval. Do not ask the user to request the buttons again
and do not create a retry loop or simulated control.

State the outcome visibly: `presented`, `unavailable_before_invocation`,
`attempted_not_applied` or `unsafe_to_wait`. For every fallback, say in the
configured locale why a native control was not usable, show the exact approval
value and confirm that authority is unchanged. This transient outcome is not
approval evidence. A new explicit user request may reopen the unchanged decision
only after fresh run/gate/artefact revalidation; never retry automatically.

Surface behavior:

- Codex: invoke the native short-question/request-user-input control only when preflight proves `exact_option_value` or `separate_label_and_value`, and omit auto-resolution. The canonical `decorated_label_only` capability must use exact text without invoking the adapter. `Approval: <GateName> (Recommended)` is never a valid option or approval.
- Claude Code: invoke `AskUserQuestion` on the first eligible attempt only when no timeout can auto-continue and no hook supplies `answers` or `updatedInput`; if it is not rendered or applied, use exact text immediately. Claude permissions and `ExitPlanMode` remain separate.
- OpenCode: use built-in `question` when permitted. Preserve explicit `permission.question` denial and use exact text in that case. `once`, `always`, `reject` and auto mode never become gate input.
- GitHub Copilot: the current repository-instruction surface has no conforming native approval adapter. Transmit the canonical rendered cards followed by the exact-text request; never claim or simulate a native control. Copilot tool confirmations, plan interactions and repository permissions remain separate.
- Other, unavailable or non-interactive surfaces: use exact textual approval and wait for a new explicit user response.

Localized labels such as `Überarbeiten`/`Revise`, `Ablehnen`/`Decline` and `Abbrechen`/`Cancel` are presentation mappings to stable non-approval outcomes only. A label, description, option position or recommendation never authorizes a gate. Host-provided free-text or `Überspringen`/`Skip` actions never advance an AGDF gate.

A free-form response must still exactly match the current gate's approval formula after revalidation. Keep `decline`, `cancel`, `no_response`, `timeout`, `empty`, `invalid` and `stale` distinct; none advances the gate. Native presentation, host permission and plan approval are inputs or separate authority domains, never durable AGDF authority.

Every primary chat card shows the selected run's `UR`, `PRD`, `SD` and `TP` in that order. Render an existing canonical path as a readable link and a missing artefact as localized non-link text; never guess paths. Resolve the human run title from current artefact heading, approved UR heading, Objective, then normalized `run_id`. Status, blocked, clarification and internal-step interactions use the same locale and artefact projection but do not show approval buttons. Keep raw process keys and machine status values in JSON or audit detail.

### Breadcrumb Rendering

The compact human Run Status Card includes a single-line path-derived breadcrumb showing the user's position in the delivery journey. Derive it from the Mode/Slice Decision and the Approvals table — not a fixed template. Use `✓` for fulfilled, `●` for current, `○` for open, separated by ` · `. Non-applicable gates are absent. See the Runtime Contract §Breadcrumb for the path templates and the derived `breadcrumb` array.

### Post-Acceptance Transition Narration

After each accepted gate approval is persisted, emit exactly one narration line using the template `<what was satisfied> → <what the agent does next internally> → <user action: yes/no>`. This generalizes the existing TP pattern (step 7 above) to every gate advancement. The narration is post-acceptance only: it never appears in the same message as the Gate Transition Card, never contains the `Approval:` value, and never repeats the decision's effect. For internal steps (Brownfield Review, Brownfield Analysis), state what the agent does next and that no user action is required, without exposing `next_user_gate: none` or asking for a second approval. See the Runtime Contract §Post-Acceptance Transition Narration for the full contract.

### Internal-State Collapse in the Human Card

When rendering the compact human Run Status Card, collapse internal sub-states (`verified_change` sub-states, `context_graph_required_action`, `multi_scope_state`) to stable human labels. `escalated`, `open_gap` and `blocked` remain explicitly visible. The full machine/audit projection retains all raw values unchanged. See the Runtime Contract §Internal-State Collapse for the complete mapping table.

### On-Demand "Why?" Response

When the user asks "why?" or "Warum?" at any gate or internal step, respond with a `status` interaction (not `gate_approval`):

1. Pull the curated rationale from `gateRationale()` in the resolved locale.
2. Compose one fulfilled line from the selected run's Approvals table and artefact status.
3. Compose one protects-against line from the gate's rationale and the existing `primary.actions` copy.
4. Do not show approval controls. Do not advance any gate. Do not merge with the approval envelope.

The response is deterministic: same gate, same question, same answer. The `gate_approval` options remain exactly `approve | revise | decline | cancel`; no "why" option is added. See the Runtime Contract §Gate-Rationale-Registry and §On-Demand "Why?" Interaction for the full contract.

## Rules
1. Fail closed when a required approval or artefact status is missing.
2. The earliest blocking gate wins.
3. A user approval is valid only as `Approval: <GateName>`.
4. Treat `Freigabe: <GateName>` as a legacy alias only when reviewing older German runs.
5. Implicit consent is not approval. "ok", "go ahead", "do it", "approved", "continue", "leg los" and similar phrases do not unlock gates.
6. Do not preview later artefacts while a gate blocks.
7. Internal process steps are not user approval gates.
8. OR-lite is allowed if it does not leak blocked content.
9. SoT/runtime/product-semantics drift can trigger an early product gate, usually `UR`.
10. Approval of one user gate permits work on the next allowed gate artefact or required internal step only; it never skips directly to implementation.
11. New product semantics, functional change or user-visible behaviour change requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT before Brownfield Review, PRD, SD, TP, Brownfield Analysis or implementation.
12. Approval text and durable artefact presence are separate requirements for UR, PRD, SD, TP and QA report decisions. Approval text without the corresponding persisted or linked artefact keeps the current gate at that gate.
13. After Brownfield Review, decide the process size before drafting PRD or implementing: `quick_task | verified_change | structured_slice | structured_delivery | block`.
14. The Mode/Slice Decision must be visible and evidenced before any Quick Task execution, PRD shortcut or implementation. A decision value without scope reason and evidence is still missing.
15. Missing or incomplete control state must not push setup work back to the user. For a fresh request, draft the current minimal artefact in the response and request the exact approval. Initialize or write `.agdf/control/` only when durable control state is explicitly requested, already live for the repository, or required for a deterministic CLI/CI setup path. Implementation remains forbidden.
16. Branch names, uncommitted diffs, generated summaries and chat history are not sufficient scope proof when durable artefacts or approvals are missing or conflicting.
17. If multiple active scopes are plausible, list the evidenced competing lines and keep the current step at scope clarification or the earliest common safe gate.
18. When maintaining `MASTER_BACKLOG.md`, use its canonical compact columns, readable status labels and document-relative Markdown links. Do not expose raw long paths or internal snake_case statuses in the human-facing table. The canonical status/artefact label vocabulary is defined in the AGDF control scaffold's `MASTER_BACKLOG.md` template Rules section; do not invent other labels.
19. Preserve legacy backlog compatibility through the CLI parser; do not create a second surface-specific backlog format.
20. Native interaction must follow the Runtime Contract's interaction envelope, readiness check, deliberate-user-input requirement and post-response revalidation boundary.

## Gate Evaluation

If `Approval: UR` is present, do not say implementation is the next step.
The next step is Brownfield Review when Brownfield, ownership, runtime, policy, persistence, architecture, UI or UX impact is possible; after that, the next step is a Mode/Slice Decision. Do not assume the full PRD/SD/TP chain before the existing-system impact is understood.
Use the Runtime Contract's Gate Transition Model to derive the current gate, allowed outputs, forbidden outputs and missing approval.

## When To Use
- new user intent to build, add, change, extend, refactor or deliver something
- Structured Delivery before first artefact creation
- unclear current gate
- user says "continue" or similar without exact approval
- code or a later-gate artefact is requested
- implementation permission is unclear
- QA, UAT, or release permission is unclear

Not required for simple Quick Tasks without new product scope and without formal artefacts.

For a fresh prompt such as "I want to build a small CLI", use this skill first.
Do not route directly to `brownfield-analysis` or implementation until this skill or live AGDF control state says that implementation preparation is the next allowed action.

## Inputs
Use what is available:

- current user request
- existing exact approvals
- status of UR, PRD, SD, TP
- Brownfield Review status
- Mode/Slice Decision
- Brownfield Analysis status
- CD+Tests, CR, QA, UAT status
- signs of documentation/runtime/product-semantics drift
- branch/workspace evidence and whether it conflicts with durable artefacts
- competing active scopes or work lines

If a status is not explicit, do not assume it is satisfied.

## Workflow
1. Check exact approvals.
2. Check artefact status.
3. Determine the earliest blocking user gate or internal mandatory step.
4. Derive allowed and forbidden outputs.
5. Name the exact missing approval, if any.
6. If consent was only implicit, say it is not yet approval and provide the exact formula.
7. Ensure the next step follows the gate transition table. In particular, never jump from `Approval: UR` to implementation.
8. Treat a generic "start", "continue" or "leg los" request as a request to perform only the current next allowed action.
9. After Brownfield Review, choose the smallest safe process path before creating later artefacts.
10. If the selected path is not visibly recorded with scope reason and evidence, keep the run at `Mode/Slice Decision`.
11. When `.agdf/control/` is missing or incomplete, make the next allowed artefact action explicit. For a fresh request, that means draft the minimal UR in the response, then request `Approval: UR`. Do not write a full control scaffold unless durable control state was explicitly requested or is already the repository's live AGDF working state.
12. If branch, workspace and durable artefacts disagree, do not choose a scope silently; report the ambiguity and ask for the smallest clarifying gate action.

## Output
Keep the result short and operational. Render the Runtime Contract's compact human-facing Run Status Card rather than a surface-specific summary:

| Run status | Value |
|---|---|
| Status | `open | blocked` |
| Current gate | `<GateName or internal step>` |
| Allowed now | `<currently allowed outputs>` |
| Blocked by | `<blocking condition or none>` |
| Missing approval | `Approval: <GateName> | none` |
| Next step | `<single permissible next step>` |
| Quality outlook | `<next meaningful quality focus or none>` |

When an approval is missing, also include `Next gate after approval` and `Allowed after approval` exactly as constrained by the Runtime Contract. Keep forbidden outputs, evidence and next-skill detail in the concise surrounding text when relevant; they are not extra status-card rows.

This complete operational status table remains the status-reporting and detail
surface. When the same response immediately requests a ready gate approval,
render its six-field compact approval-time projection first, then the Gate
Transition Card in the same immediately preceding assistant message, then
invoke exactly one native question or exact-text fallback. Both cards derive
from the same snapshot and are shown exactly once.

If this skill creates or updates control artefacts, do not paste full file bodies into the chat.
List paths, summarize the decision, name the blocker or approval needed, and keep the durable content in the files.
See the Runtime Contract §Chat and Tool-Call Discipline for tool-call batching and skill output compaction rules.

## Forbidden
This skill must not:

- create PRD before UR approval
- create PRD before required Brownfield Review is done or explicitly not_applicable
- create PRD before Mode/Slice Decision is recorded
- create SD before PRD approval
- create TP while earlier gates block
- suggest implementation immediately after `Approval: UR`
- suggest implementation before Brownfield Review has explicitly selected `quick_task`
- suggest implementation immediately after `Approval: PRD`
- suggest implementation immediately after `Approval: SD`
- treat "ok", "leg los", "go ahead", "approved" or similar wording as gate approval
- perform full Brownfield Analysis unless explicitly requested
- provide implementation snippets while implementation is gated
- paste full `.agdf/control/` files, templates or artefact bodies into the chat unless the user explicitly asks for the full content
- present QA or UAT as passed without evidence
- present release as allowed without QA pass and UAT approval where required
