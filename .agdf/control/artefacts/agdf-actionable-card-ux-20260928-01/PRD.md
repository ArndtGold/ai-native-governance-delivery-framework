# PRD: Klare nächste Schritte in AGDF-Karten

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-09-28
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Make AGDF target-clarification, control-setup, blocked-status, run-status and gate-approval cards immediately actionable across Codex, Claude, Copilot and OpenCode. Each card identifies who acts, the exact user input when needed, what the agent does next when it is working, what decision or evidence progress is waiting for, why progress is blocked, and whether the user can wait without replying. Gate-approval cards also give a concise, complete and language-coherent summary of decision-relevant artefact content. Reuse the existing canonical renderers and preserve current target, run, gate and approval authority.

For the agent-controlled status, use the host-neutral label **“Ich arbeite weiter”** in all four hosts. Keep the concrete next action beside that label. Use “Du bist dran” when deliberate user input is required and “Keine Antwort nötig” when no user reply is needed.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready analysis in `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UX_INTENT_DEFINITION.md`
- primary_user_intent: Know at a glance whether to act, wait, or provide a specific answer so the current delivery can continue safely.
- success_signal: Users can give the requested target/decision/input or confidently wait; no card substitutes a generic action for the selected run's concrete next action.
- primary_decision_or_action: Clarify a target, explicitly authorize/cancel setup, answer a required run decision, or wait while the agent performs its named next step.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Target unresolved | Normalized task-target resolution is unresolved or resolved. | Missing target detail; resolved target; target changed. | Task Target Resolution contract and its normalized resolver result. | `interaction-presentation.js` target orientation. |
| Control setup required | Canonical control is missing or needs explicit setup/link authority. | Setup required; authorize setup; cancel. | Existing doctor/control-setup evaluation. | `interaction-presentation.js` control setup orientation. |
| Selected run needs user input | The selected canonical run requires one explicit decision or answer. | “Du bist dran” plus exact requested input. | Selected `RUN_STATE.md` and existing gate policy. | `interaction-presentation.js` operational status card. |
| Selected run has an agent step or needs no reply | The selected run permits an agent-controlled next step, or no user action is pending. | “Ich arbeite weiter” plus concrete action; or “Keine Antwort nötig” plus what happens next. | Selected `RUN_STATE.md` and existing gate policy. | `interaction-presentation.js` operational status card. |
| Selected gate artefact awaits user decision | The current gate is ready for an exact user decision on a sealed artefact revision. | The exact decision, what it approves, a concise complete summary in the selected presentation language, and a link to the exact artefact. | Selected `RUN_STATE.md`, gate policy and the digest-bound current artefact. | `run-presentation-render.js` approval presentation, composed with the canonical status and gate-transition cards. |

The card presents state; it does not resolve targets, select runs, infer gate state, or authorize actions.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Show target orientation after target-bound activation when the target is materially changed or unresolved. Show setup orientation only after canonical-control setup is required. Show operational status only for the explicitly selected or unambiguously continued run after gate-check.
- blockers_and_visible_next_actions: Unresolved target names the exact missing repository path/URL or existing run ID and offers a new-delivery choice. Setup states its exact authorize/cancel replies and their effects. A gate awaiting user input says “Wartet auf” and names the exact decision or information needed. “Blockiert durch” is reserved for an actual canonical blocker and gives its localized human-readable cause, concrete unresolved item(s) when available, responsible actor and exact next step. Internal diagnostic codes may be secondary context but never the only explanation.
- recovery_paths: Provide a copyable target/run answer example; make setup cancellation clear; show exact user input when required. If actor or next action cannot be safely determined from canonical state, ask one focused clarification and preserve the current state.
- relevant_state_transitions: `unresolved target -> resolved target`; `setup required -> explicitly authorized setup | cancelled`; `user input required -> exact response -> next permitted step`; `agent step -> next gate or no-response state`; `gate artefact ready -> exact approval | revise | decline`. Every transition displays the new actor and next action. A pending user decision is not mislabeled as an unrelated blocker. Failed or unavailable state evaluation remains blocked and offers its existing safe recovery.

## 5. Acceptance Criteria

### AC-001 — Unresolved target asks for the exact information

- criterion_id: AC-001
- working_mode: Target unresolved
- source_state: Normalized target resolution is `unresolved` with a reason code and no primary target.
- trigger/action: A target-bound skill is dispatched without one reliable target.
- expected_effective_state: Target remains unresolved; repository control, run selection, gate evaluation and mutation do not occur.
- visible_feedback: The localized card states whether the user must supply a repository path/URL, the exact run ID for continuation, or choose a new delivery. It includes copyable examples for resuming and starting new work.
- blocker/failure_behavior: Multiple plausible targets are named; unavailable or mismatched targets are described specifically. The card never treats the working directory or an evidence source as target authority.
- recovery/next_action: Ask only for the missing target detail and re-evaluate after the user's response.
- observable_success: A user can reply with one unambiguous target without guessing which identifier is needed.
- required_evidence: Rendered-output assertions for every unresolved reason code and registered locale; four fresh-host checks for user-visible delivery.

### AC-002 — Control setup makes both choices and consequences clear

- criterion_id: AC-002
- working_mode: Control setup required
- source_state: Existing control/doctor evaluation determines that setup or linking is required for one resolved target.
- trigger/action: The user sees the control-setup card.
- expected_effective_state: No setup occurs until explicit authorization; cancellation leaves setup unapplied.
- visible_feedback: The card provides the exact localized replies “Einrichtung autorisieren” and “Abbrechen” (or their registered-locale equivalents), states the concrete scaffold/link effect of authorization, and states that cancellation stops setup.
- blocker/failure_behavior: Setup is not presented as a gate approval or implementation permission; no run or UR is implied as automatically approved.
- recovery/next_action: The user chooses one displayed reply. After successful authorization the existing intake continues without another setup prompt; cancellation ends this setup path.
- observable_success: The user can distinguish setup authorization from gate approval and knows what each response does.
- required_evidence: Rendered control-setup card and response handling for each registered locale; host-native visible output on all four requested hosts.

### AC-003 — Status cards identify the next actor

- criterion_id: AC-003
- working_mode: Selected run needs user input, an agent step, or no reply.
- source_state: Current gate, required user action, internal next step and selected run's next action are available from canonical control evaluation.
- trigger/action: The user requests or receives the selected run's status card.
- expected_effective_state: The actor label matches the canonical state: user input, agent-controlled work, or no user reply required.
- visible_feedback: “Du bist dran” includes the exact required response or decision; “Wartet auf” names the exact gate decision when the user must decide; “Ich arbeite weiter” names the concrete agent action; “Keine Antwort nötig” explains what happens next. “Blockiert durch” appears only for a real canonical blocker.
- blocker/failure_behavior: If actor or next action cannot be established safely, the card says what cannot be determined and asks a focused clarification.
- recovery/next_action: Provide the stated response or wait while the agent performs the stated action.
- observable_success: A user does not need to infer whether to reply, approve, wait or let the agent continue, and can distinguish a pending decision from a blocked run.
- required_evidence: Canonical rendered cards for user-action, agent-action and no-response states in every registered locale; fresh-session checks on Codex, Claude, Copilot and OpenCode.

### AC-004 — The selected run's concrete action is not silently replaced

- criterion_id: AC-004
- working_mode: Selected run status
- source_state: Gate-check provides the selected run's canonical `next_allowed_action` and relevant blocker/transition state.
- trigger/action: The selected action is absent from the operational localization catalogue or otherwise cannot be safely rendered.
- expected_effective_state: The selected run and its canonical next action remain unchanged; no unrelated QA/gate transition is substituted as if it applied to this run.
- visible_feedback: Show the concrete run action when safe; otherwise show a localized, targeted clarification that identifies the unresolved action/actor.
- blocker/failure_behavior: Unknown or conflicting action/actor fails closed to clarification, not a plausible-looking generic instruction.
- recovery/next_action: Resolve the named ambiguity from canonical state, then render the selected run's action.
- observable_success: The card's action matches the selected run's machine-readable action, or visibly requests the missing fact.
- required_evidence: Regression case reproducing the current German free-text fallback; both registered locales retain the action or render the safe clarification.

### AC-005 — Localization and authority boundaries remain intact

- criterion_id: AC-005
- working_mode: All card modes
- source_state: A valid normalized target/setup/run projection is rendered for a registered locale.
- trigger/action: The canonical renderer produces a user-facing card.
- expected_effective_state: All human-readable card text follows the selected presentation language and preserves the same actor/action semantics, even when the linked source artefact uses another language.
- visible_feedback: All registered locales render coherent localized labels, explanations and summaries; exact protocol values such as `Approval: PRD`, run IDs, file paths and diagnostic codes remain unchanged where needed. Do not include unmarked source-language excerpts in a localized summary. Every card remains `authorizes: false`.
- blocker/failure_behavior: Missing localization or stale selected run/revision/gate identity uses the existing fail-closed recovery; card text/examples never count as approval.
- recovery/next_action: Repair the localization or refresh the canonical state through its existing owner.
- observable_success: The same test scenarios retain meaning across registered locales, and exact gate approval remains handled only by existing approval processing.
- required_evidence: Locale registry validation and rendered-card checks in English and German, including a German presentation of an English source artefact; non-authorizing envelope assertions.

### AC-006 — Verify visible output in the four requested hosts

- criterion_id: AC-006
- working_mode: All card modes on Codex, Claude, Copilot and OpenCode
- source_state: The implementation is available to each host's fresh session.
- trigger/action: Start a fresh session on each host and exercise unresolved target, setup, representative run-status and gate-approval states.
- expected_effective_state: Each host presents the canonical card with the same actor, exact next action, recovery and authority boundary.
- visible_feedback: The card is visible and readable; “Ich arbeite weiter” is host-neutral and the concrete action is adjacent.
- blocker/failure_behavior: A missing, truncated or rebuilt card is recorded as a host-specific evidence gap; do not claim cross-host success from renderer tests alone.
- recovery/next_action: Repair the canonical renderer/locale integration or host consumer, then repeat that host's fresh-session check.
- observable_success: All four fresh sessions visibly satisfy AC-001 through AC-005 and AC-008 for the exercised states.
- required_evidence: Dated direct observations or captured outputs from fresh Codex, Claude, Copilot and OpenCode sessions.

### AC-007 — Blocked cards explain the cause and recovery

- criterion_id: AC-007
- working_mode: Any selected run or setup state with `status: blocked`.
- source_state: The canonical evaluation supplies a blocker code and, when available, detailed unresolved findings and the permitted next action.
- trigger/action: The user views a blocked status card.
- expected_effective_state: The card preserves the canonical blocker and remediation state; it does not infer a different cause or advance the run.
- visible_feedback: For actual blockers, “Blockiert durch” is a localized, human-readable explanation. Show concrete unresolved decision/criterion/evidence items when available, name who must act, and state the exact next action. For a gate awaiting a user decision, use “Wartet auf” and name the exact decision instead. An internal diagnostic code may appear as secondary detail.
- blocker/failure_behavior: A raw code such as `AGDF_PRD_DECISIONS_OPEN` alone, or a generic gate action that does not address the actual blocker, is insufficient. A pending approval must not be described as “Blockiert durch: keine” without also making the pending decision explicit. If details are unavailable, say what detail is missing and how to retrieve or resolve it.
- recovery/next_action: Give one permitted action that resolves or exposes the named cause; for open PRD readiness items, identify each item and say to update the PRD and record the revision.
- observable_success: The user can explain in plain language whether progress is waiting for a user decision or blocked by a specific cause, which item needs attention, who acts, and what to do next without decoding an AGDF code.
- required_evidence: Rendered blocked cards for PRD readiness, missing control and at least one evidence blocker, plus a ready-gate card waiting for user approval, in each registered locale; fresh-session visibility on all four requested hosts.

### AC-008 — Gate-approval cards summarize the decision coherently and completely

- criterion_id: AC-008
- working_mode: Selected gate artefact awaits user decision.
- source_state: A sealed current-gate artefact is ready for approval and its source language may differ from the selected presentation language.
- trigger/action: The user receives the digest-bound `run-present` approval presentation.
- expected_effective_state: The exact current artefact and revision remain authoritative; the presentation is a faithful review aid and does not grant approval.
- visible_feedback: The summary follows the selected presentation language for all human-readable text. It states the user goal and scope, includes a concise localized representation of every acceptance criterion and any decision-relevant resolved or open decision, distinguishes the source artefact language in localized wording when it differs, and shows the exact approval/revise/decline choices and artefact link. The summary contains no unmarked source-language prose, internal field names, or ellipsis that hides omitted criteria.
- blocker/failure_behavior: Do not claim that the artefact is localized when only its surrounding card is localized. If a faithful localized summary cannot be produced, state that clearly in the selected language and keep the exact artefact link and decision state visible; never invent or silently omit acceptance criteria.
- recovery/next_action: The user can understand what the decision covers from the card, open the linked revision for full detail, and choose the displayed outcome without first translating the summary.
- observable_success: A German user can correctly describe the goal, scope and acceptance criteria of an English-authored PRD from its German card summary, while `Approval: PRD` remains the exact protocol value.
- required_evidence: Rendered approval presentations for PRD artefacts in English and German, with a cross-language case containing more than two acceptance criteria and multiple approval decisions; digest binding and non-authorizing assertions; visible checks on all four requested hosts.

## 6. Non-Goals

- Change Request Activation, target authority/resolution, run selection, gate transitions, approval handling or permission semantics.
- Change the canonical status-card JSON schema, semantic-block names, CLI flags, durable run-state schema or persisted data.
- Install, update, enable, trust or restart any host plugin.
- Close or alter any finding, approval or evidence obligation in the existing `agdf-request-activation-boundary` run.
- Add a host-local or skill-local presentation template.

## 7. Users And Roles

- Primary users: people continuing an AGDF task through Codex, Claude, Copilot or OpenCode.
- Product and PRD owner: Arndt Gold.
- Effective-state authorities: the existing task-target resolver, control/doctor evaluation, selected canonical run state, gate policy and digest-bound artefact.
- Presentation owners: `interaction-presentation.js` for target/setup/status orientation; `run-presentation-render.js` for the digest-bound artefact summary inside a gate-approval card.
- Decision authority: the user supplies exact current-gate approval only through existing approval processing; this PRD and its cards grant no authority.

## 8. Constraints

- Preserve the normalized resolver, selected run/revision identity and current transition policy.
- Reuse `interaction-presentation.js`, `run-presentation-render.js` and the existing locale source; do not infer actor from free-text wording.
- The explicit per-turn `presentation_language` controls all user-facing card copy. The source artefact's language is a content property, not permission to mix unmarked source-language excerpts into the selected presentation language.
- Keep UI language localized for all registered locales; user-sourced/canonical action text must never be replaced with an unrelated instruction solely because it lacks a locale entry.
- Preserve `authorizes: false` and all current exact-approval requirements.
- Fresh-session host checks are required evidence; source-level and locale tests alone do not prove native host rendering.

## 9. Evidence Requirements

- Regression evidence for unresolved target, setup authorize/cancel, all status actor states, the selected-run free-text action case, and gate-approval summaries across source/presentation language combinations.
- Rendered output evidence for every registered locale, including complete acceptance-criteria summaries, waiting-versus-blocked distinction, non-authorizing fields and safe failure behavior.
- Direct fresh-session visible-output evidence from Codex, Claude, Copilot and OpenCode. Do not infer any host result from another host.
- Evidence must identify the scenario, host, locale, rendered action and next step; failures remain open until corrected and rechecked.

## 10. Risks And Open Questions

- Free-text run actions can differ by language. SD must choose a safe presentation rule that preserves their meaning without guessing the actor from prose.
- Host adapters may render canonical Markdown differently; the four fresh-session checks are therefore part of acceptance.
- No further product-scope question is open. The user selected the portable agent label “Ich arbeite weiter” for all four hosts.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Agent-working label across the four hosts | before_prd | resolved | Use the host-neutral German label “Ich arbeite weiter” and its registered-locale equivalent; show the concrete next action beside it. The user selected this wording on 2026-09-28. | Arndt Gold |
| Control-setup response clarity | before_prd | resolved | Show explicit localized choices “Einrichtung autorisieren” and “Abbrechen”, their effects, and the fact that setup does not approve UR or another gate. | Arndt Gold |
| Blocker explanation | before_prd | resolved | “Blockiert durch” must name the human-readable cause, concrete unresolved items, responsible actor and exact recovery action; diagnostic codes alone are not user guidance. | Arndt Gold |
| Gate-card language and review-summary completeness | before_prd | resolved | The selected per-turn presentation language applies to all human-readable card content. If the source artefact differs, give a faithful localized summary and a localized source-language note; do not expose unmarked excerpts or silently omit acceptance criteria. Keep exact approval literals and identifiers unchanged. | Arndt Gold |
| Scope and release acceptance | before_prd | resolved | Change only existing cards; no host installation/update/restart. Require direct fresh-session visible checks on Codex, Claude, Copilot and OpenCode. | Arndt Gold |
| Canonical actor/action derivation and safe free-text fallback | later_sd | open | Solution Design maps canonical state fields to actor/action, distinguishes waiting from blocked, and chooses a safe localized artefact-summary strategy without changing the machine schema or creating a parallel source of truth. | Arndt Gold |
| Automated and fresh-host evidence mapping | later_tp | open | Task/Test Plan maps AC-001 through AC-008 to executable scenarios and named evidence, including cross-language approval-summary cases and fresh-session checks on all four hosts. | Arndt Gold |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
