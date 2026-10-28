# UX Intent Definition: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Status: ready
Decision: ready
Based on: approved UR (revision 5) and post-UR routing evidence (`BROWNFIELD_REVIEW.md`)
Date: 2026-10-28
Owner: Arndt Gold

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Which run the companion shows gains a signal (named in the chat), changes by itself at the next main-loop turn, gets a return control and allows browsing from the chat's run; "waiting" moves ahead of the turn overlay; the footer sits at the bottom edge. All inside the one companion capability, without authority.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: See the run the chat is working on without doing anything; look at other runs when wanted and find the way back at once; see at a glance when that run waits for me.
- success_signal: After browsing, the next chat message brings the panel back to the chat's run, or one click on "Zurück zum Chat-Run" does; while an approval question is open, the panel says "wartet auf Freigabe", like the status line; the footer menu sits at the panel's bottom edge.
- primary_decision_or_action: Keep working in the chat (the panel follows); optionally browse with "Vorheriger Run" / "Nächster Run" or the run list and return with "Zurück zum Chat-Run".

## 3. Working Modes And State

- working_modes: (1) Following the chat: a chat run is known and the user has not browsed away since the last main-loop turn start or return. (2) Browsing: the user stepped, picked a run from the list or picked a run while a chat run is known. (3) No chat run: no run was named in a main-loop prompt or answer and none changed in this session; the remembered selection or the run list applies as today.
- effective_state_by_mode: Following: the panel shows the chat run, its origin reads "Im Chat genannt" / "Named in the chat" when the latest signal was a mention, "In dieser Sitzung geändert" / "Changed in this session" when it was a change. Browsing: the panel shows the browsed run with "Von dir ausgewählt" / "Selected by you" and offers "Zurück zum Chat-Run" / "Back to chat run". No chat run: today's behavior.
- visible_state_types: The existing states läuft, baut, wartet auf Freigabe, wartet auf Entscheidung, blockiert, fertig, bereit, nicht lesbar; during a main-loop turn the overlay "läuft · Claude arbeitet gerade an diesem Turn" applies only to a run that is neither waiting nor building.
- effective_state_authority_by_mode: The run's `RUN_STATE.md` for the state; the chat's text and the session's changes for which run is the chat run; the user's browsing for a temporary view. The companion never decides delivery.
- primary_state_presentation_owner_by_mode: The companion panel; the status line and toasts follow the chat run (or, without one, the run the panel shows), so they do not jump while the user browses.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: The companion is switched on with `/agdf-companion` as today. A run becomes the chat run when a main-loop prompt or answer names its id as a whole token (the last id named in a text wins, an answer after the prompt), or when its `RUN_STATE.md` changes during the session; the more recent of the two signals counts. Subagent turns never set or change the chat run.
- blockers: A text that names no open run changes nothing. A run id inside a longer id does not count. A completed, superseded or abandoned run never becomes the chat run by a mention.
- recovery_paths: "Zurück zum Chat-Run" in the panel (below the stepping buttons) and as an entry of the footer menu, both only while another run than the known chat run is shown; the start of the next main-loop turn returns automatically. Without a chat run there is nothing to return to and no control.
- relevant_state_transitions: following → browsing (step, pick from the list or pick a run while following); browsing → following (next main-loop turn start, or the return control); following → following with another run (a newer mention or change). The chat run lives for the session only; a new session starts without one. Browsing keeps storing the picked run as today's remembered selection.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: (1) recognition of a named open run with whole-token matching and "last named wins"; (2) following the chat run with its origin; (3) browsing from the chat run; (4) automatic return at the next main-loop turn; (5) the return control in panel and footer menu; (6) status line and toasts follow the chat run while browsing; (7) "waiting" ahead of the turn overlay; (8) the footer at the bottom edge without an extra empty row or scrollbar; (9) the delivered panel of commits `3444befe` and `2f54fbcc` as baseline with its evidence; (10) observation only; (11) verification and live evidence; (12) documentation.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions: none for PRD. Proposed resolutions adopted with the PRD: the more recent signal of mention and change wins; browsing lasts until the next main-loop turn or the return control; the chat run is session-only; status line and toasts follow the chat run; only "waiting" (approval or decision) wins over the turn overlay, "blocked" keeps the overlay because the chat is usually resolving it.
- affected_outputs: PRD acceptance criteria and approval decisions; SD for the assignment owner (`assignment.mjs`), recognition, the overlay rule (`state.mjs`) and footer sizing (`register.mjs`).
- decision: ready
- evidence: Approved UR revision 5; `BROWNFIELD_REVIEW.md` of this run; owner findings of 2026-10-28 (screenshot of the panel showing "läuft" while the status line showed `AGDF · UR · wartet`; the gap below the footer); live screenshots of 2026-10-28 for the footer, menu, sized list and gate bars; `register.mjs:255,278,344-366`, `assignment.mjs:16-32`, `state.mjs:39-43`.
- missing_evidence: Whether the desktop hands the main-loop answer text to `turn.complete` (TP host probe); a finer body sizing without a scrollbar (live probe).
- required_next_step: Draft the PRD from the approved UR with these resolutions as approval decisions.
