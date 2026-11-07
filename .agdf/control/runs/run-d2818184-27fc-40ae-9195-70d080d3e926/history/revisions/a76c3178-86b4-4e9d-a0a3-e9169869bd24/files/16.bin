# UX Intent Definition: Companion core in Core

Status: ready
Based on: approved UR (sha256:00a55324a4a40f6abe5b0abd7194572ffa6623c4764787758e5a50cd9ae2ed95) and Brownfield Review (sha256:de8a3f6d5551917fc9a027c1e90f3a7fcc3622854a5068aae242c5635e2752a7)
Date: 2026-11-05
Owner: Arndt Gold

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The companion gains new visible state types and feedback:
  - a hint for unreadable or unsupported runs and stores;
  - event notices for AGDF MCP outcomes;
  - a review view of recorded material.

  Its next-step text changes to the shared run view. All of this stays within the existing companion capability and adds no authority.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: As a project owner, I want to see at a glance, and truthfully, where each AGDF run stands and what the agent has just done through AGDF. I want to notice immediately when something needs me (an approval), when something went wrong (effect unknown, recovery required), or when recorded material differs from what was intended.
- success_signal:
  - The companion and the MCP status card never disagree on state, path, missing approval or next step for the same run.
  - Legacy or unreadable runs are never hidden.
  - After an AGDF MCP outcome, the matching notice appears without waiting for the next 30-second poll.
  - For a recorded document, the owner can see what was actually recorded (preview, size, digest) and whether it matches its source file.
- primary_decision_or_action: The owner decides whether to act: answer an approval request in the chat, look at a warning (effect unknown, recovery required, digest mismatch), or simply continue. The companion itself never approves, blocks or writes.

## 3. Working Modes And State

- working_modes:
  - M1: companion pane open (Claude desktop or terminal);
  - M2: pane hidden by the person, status line and notices still active;
  - M3: companion switched off;
  - M4: host-neutral consumer of the same Core outputs. This is the MCP status card for agents today; a Codex surface follows in a later run and is out of scope here.
- effective_state_by_mode:
  - M1/M2: the effective run state is the shared Core run view for the current project root, plus the most recent events of that project.
  - M3: no reading, no status line, no notices (unchanged).
  - M4: the same run view fields as M1, in the MCP status card.
- visible_state_types:
  - existing figure moods (läuft/baut/wartet/blockiert/fertig/bereit), now taken from the central figure-state set;
  - new project-level states: control store unsupported (for example legacy v2 layout) and unreadable runs present (count and reason, alongside readable runs);
  - new event notices: approval requested, approval recorded, write rejected (not dispatched), effect unknown, recovery required, run completed;
  - new review facts for recorded material: preview, size, digest and source-match status, with digest mismatch as a warning state.
- effective_state_authority_by_mode:
  - Run state: canonical RUN_STATE.md and its Run Operations, evaluated by the single Core run-view projection. The same authority holds in all modes.
  - Transient outcomes (rejected, effect unknown): the AGDF MCP server's own observation of tool outcomes.
  - The companion has no authority of its own.
- primary_state_presentation_owner_by_mode:
  - M1: companion pane;
  - M2: status line and toasts;
  - M4: MCP status card text returned to the agent.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths:
  - The companion is switched on or off with the existing /agdf-companion command, and stored choices are unchanged.
  - Events become visible when an AGDF MCP operation finishes in the same project root while the companion is on.
  - Review facts appear on events for material staging and recording (UR/PRD/SD/TP/QA documents, evidence and reviews).
- blockers:
  - B1: control store unsupported. Visible hint naming the folder and reason, with next action "AGDF doctor via MCP or owner decision on the legacy store". Readable runs are listed when present.
  - B2: event channel unavailable (MCP server not running, other host). The companion keeps polling run state and marks events as unavailable. It never invents events.
  - B3: review facts unavailable or too large. Bounded preview with an explicit truncation note; digest and size remain visible.
- recovery_paths:
  - The existing "read again" menu action re-reads run state and events.
  - A stale snapshot keeps the last good view with its existing stale marker.
  - A digest mismatch or effect-unknown warning names the concrete next action (inspect the operation status, re-stage the material) but never performs it.
- relevant_state_transitions:
  - Run state moves on recorded operations (UR → … → OR) and the run view follows on the next event or poll.
  - Notices are transient. They clear on acknowledgement or on the next main-loop turn, as notices do today.
  - A run completed event moves the figure to fertig.
  - Effect unknown and recovery required keep a warning visible until the run state no longer carries the uncertainty.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria:
  - AC-01: For the same run, companion and MCP status card show identical state, gate path, missing approval and next step.
  - AC-02: In a project with only unreadable or unsupported runs, the companion shows their count and reason instead of "No open runs".
  - AC-03: In a mixed project, readable runs are listed and the unreadable-runs hint is still shown.
  - AC-04: A host-neutral consumer (test harness, not the Claude mod) renders the same run view, events and figure state from Core outputs alone.
  - AC-05: After an AGDF MCP outcome, the corresponding event is available to the companion before its next 30-second poll.
  - AC-06: Events exist for approval requested, approval recorded, write rejected (not dispatched), effect unknown, recovery required and run completed, each derived from real MCP outcomes.
  - AC-07: Review facts show a bounded preview, the size, the digest of what was recorded, and whether it matches the referenced source file.
  - AC-08: A material transfer whose recorded digest differs from the intended source is shown as a warning.
  - AC-09: The companion never writes under .agdf/control, never gates or blocks an MCP call and never records an approval.
  - AC-10: Figure states and companion texts come from the central catalog, in German and English.
  - AC-11: Existing companion behavior, its tests and all MCP tool results stay unchanged except for the corrected next-step text and the new hints and events.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none
- open_product_questions: No blocking question remains. Three product choices are proposed defaults for the PRD Approval Decisions table:
  - P1, notice interruption: approval requested, effect unknown, recovery required, run completed and digest mismatch interrupt as toast; approval recorded and write rejected stay in the pane only.
  - P2, preview bound: at most 40 lines or 4 KiB, whichever is smaller, with a truncation note; no redaction, since the display is local to the owner's machine.
  - P3, delivery increments: increment 1 is the shared run view, diagnostics, figure states and texts; increment 2 is events and review facts, inside the same run.
- affected_outputs: PRD (UX Intent And Success; Working Modes And Effective State; Activation, Blockers, Recovery And Transitions; Acceptance Criteria; Approval Decisions); later SD for event channel, lifetime and the MCP surface.
- evidence:
  - Approved UR and Brownfield Review of this run.
  - Agent inspection on 2026-11-05 of the current companion (`view.mjs:39-42` hides unreadable runs; live render shows "fertig · Run abgeschlossen" for a completed quick_task run).
  - Status-card divergence (`gate-check.js:465-470` vs `gate-policy-pure.js:56`).
  - The native Claude CLI probe showing silent base64 corruption (ignored probe-results/cli-mcp-20261105/).
  - No UI preview was created; the UR requires none.
  - No user observation of new states has taken place yet; these are proposed behaviors.
- missing_evidence: none for PRD drafting. Host capability evidence for Codex is out of scope (separate run).
- required_next_step: Draft the PRD from the approved UR, this analysis and the Brownfield Review. Carry P1–P3 into the PRD Approval Decisions table for confirmation at PRD approval.
