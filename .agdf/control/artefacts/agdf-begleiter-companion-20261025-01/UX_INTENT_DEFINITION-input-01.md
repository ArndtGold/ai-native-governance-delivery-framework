# UX Intent Definition: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: ready
Decision: ready
Based on: approved UR (revision 5, sha256:336e861fadbe3a95a53198f6a25b8c38d213d2c2e56ad91772188a2a79d3664b) and post-UR routing evidence in BROWNFIELD_REVIEW.md
Date: 2026-10-25
Owner: Arndt Gold

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: A new visible status surface with its own state types, an opt-in activation and a display-only run assignment the user can override (Brownfield Review, UI / UX Impact Routing).
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: While working with AGDF in Claude Code, see at a glance in which state the run of the current session is (working, waiting for an approval, blocked, done), which gate it is at and what the next step is, without asking the agent.
- success_signal: The user who switched the companion on can tell the state, current gate and next step of the session's run from the panel alone, and the panel never shows a run that has nothing to do with the session as if it were the session's run.
- primary_decision_or_action: Switch the companion on or off; secondarily, choose which open run the panel shows when no run is assigned automatically.

## 3. Working Modes And State

- working_modes: (1) off — default after installation, no panel, no refresh; (2) on, run assigned automatically — the run whose `RUN_STATE.md` changed during this session; (3) on, run selected by the user — explicit selection remembered per project; (4) on, no run assigned — no change in this session and no remembered selection; (5) on, status unreadable — no AGDF control in the project or an unreadable run state; (6) on, terminal surface — text fallback instead of the figure.
- effective_state_by_mode: off shows nothing. In the assigned or selected modes the figure state is derived as: läuft while a main-loop turn is active or the run is in progress without a pending approval; wartet auf Freigabe when the run names a pending gate approval or awaits a decision; blockiert when the run decision is revise, block, blocked or decline; fertig when the lifecycle is completed. No run assigned shows a neutral idle figure with "Kein Run zugeordnet" and the list of open runs. Status unreadable shows a neutral figure with the reason and a retry.
- visible_state_types: figure pose and colour per state; state label; one-line reason; single-line gate bar with done, current and open gates; run identity; one-line objective with optional expansion; next step; assignment origin (automatic from this session, selected by you, none); time of the last read; still-pose control; run stepping; retry.
- effective_state_authority_by_mode: The run state is owned by AGDF control (`RUN_STATE.md` written by the canonical writers); the companion never decides or changes it. Whether a turn is active is owned by the Claude host. The on/off choice and the remembered selection are owned by the user. The automatic assignment is a display rule only and binds no AGDF delivery.
- primary_state_presentation_owner_by_mode: In the Claude desktop app the side panel is the primary presentation owner for the companion state; in the terminal the text fallback in the same panel. The authoritative gate presentation and approvals stay with the AGDF status card and approval cards in chat; the companion never asks for or records an approval.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: The slash command `/agdf-companion` switches the companion on and opens the panel; running it again while on switches it off and closes the panel. The choice persists across sessions. The panel title is "AGDF-Begleiter" in German and "AGDF Companion" in English. The panel never opens unasked; after installation the companion is off.
- blockers: (1) No AGDF control in the project: the panel says so and offers no run list. (2) Run state unreadable or in an unknown format: neutral figure with the concrete reason and a retry. (3) Incompatible Claude host or mod API change: the companion stays unavailable; AGDF control functions keep working (failure isolation, UR acceptance 3). (4) No open runs: the panel says so instead of showing a completed run as current.
- recovery_paths: Retry ("Neu lesen") re-reads the run state immediately; a recoverable transient read failure keeps the last good state visible with a marker until the retry succeeds. Switching the companion off and on reopens the panel. When no run is assigned, the user selects one of the open runs; the selection is remembered for the project. When the selected run is no longer open, the panel returns to "Kein Run zugeordnet" with the run list.
- relevant_state_transitions: off to on (command); on to off (command, or closing the panel counts as off for the session only); no run assigned to automatic assignment (a run's `RUN_STATE.md` changes during the session); automatic assignment to a newer automatic assignment (another run changes later; the most recently changed run wins); user selection to automatic assignment (a run changes during the session; the selection remains as fallback); any state to läuft while a main-loop turn is active and back to the run-derived state when the turn completes; any state to unreadable on read failure and back on successful retry.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: (1) After AGDF installation in Claude Code the companion is off; `/agdf-companion` switches it on and opens the panel, the same command switches it off; the choice persists across sessions. (2) The panel shows exactly one of the four states with label and one-line reason, a single-line gate bar at the default panel width, run identity, a one-line objective with expansion and the next step. (3) Panel labels and states follow the chat language through the AGDF locale packs (German and English); the next step uses the localized status-card value where one exists; the objective stays in the artefact language. (4) The panel shows the run whose run state changed in the current session; with none changed it shows the remembered selection; with neither it shows "Kein Run zugeordnet" and the open runs to choose from, and never guesses a run. (5) The assignment origin is visible (from this session, selected by you). (6) While a main-loop turn is active the figure shows läuft; after the turn it shows the run-derived state within the same turn completion. (7) No AGDF control, unreadable state and no open runs each show a specific message with a retry where useful; a failing companion never affects AGDF dispatch, MCP tools or the SessionStart hook. (8) The still pose stops all motion; the terminal shows a text fallback with the same state, gate bar and next step. (9) Accessories never overlap the figure. (10) The companion writes nothing to `.agdf/control` and offers no approval or continuation action.
- assumptions: The default panel width is the Claude desktop app's docked side panel as observed on 2026-10-25 on Windows; "most recently changed run wins" is the tie-break for several runs changing in one session.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none
- open_product_questions: none before PRD. Decided by the user on 2026-10-25: activation by slash command only with a persisted choice; language localized where possible (labels and states via locale packs, next step from localized status-card values, objective in artefact language); empty state "Kein Run zugeordnet" with open-run selection instead of guessing; name `agdf-companion` with titles "AGDF-Begleiter" and "AGDF Companion". Remaining owner-bound questions for SD: canonical status source, Claude-only wiring, failure-isolation proof, persistence of the choice and selection.
- affected_outputs: PRD sections Product Scope, UX Intent And Success, Working Modes And Effective State, Activation/Blockers/Recovery/Transitions and Acceptance Criteria; SD for status source, wiring and isolation; TP for host probe and visual evidence.
- evidence: Approved UR revision 5; BROWNFIELD_REVIEW.md of this run; prototype mod `agdf-begleiter` seen by the user in a Claude desktop test session on 2026-10-25 (user screenshot: waiting state, gate bar wrapping, hourglass overlapping the ear, English run texts, "1 von 56 offenen Runs", objective on three lines); headless load of the prototype (`session.start` 239 ms with 144 runs, turn hooks 65–77 ms); agent-rendered figure preview of the four states (first animation frame only). User decisions recorded in this conversation on 2026-10-25. Agent inspection and user observation are distinguished: the panel layout was observed by the user, the timing by the agent; the animation was inferred from the tilted hourglass in the user screenshot, not measured.
- missing_evidence: none for PRD drafting. Host evidence for module loading from the Claude manifest, failure isolation and animation behaviour is a later SD/TP obligation.
- required_next_step: Draft the PRD from the approved UR, this UX intent and the Brownfield Review.
