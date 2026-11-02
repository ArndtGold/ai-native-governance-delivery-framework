# UX Intent Definition: Close Active Runs as Superseded or Abandoned

Status: ready
Decision: ready
Based on: approved UR (revision 3, sha256:bec18d50b2b71a37c7c1c6bfceecb0c675082d2900e045dbabf870259386dda1) and post-UR routing evidence in BROWNFIELD_REVIEW.md (sha256:8069f7efa7445c58963f91c5b376d9bc78727e1e1bf1d7b67ab4a427c2ac32d1)
Date: 2026-10-28
Owner: Arndt Gold

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: An irreversible, possibly multi-run governance decision with new visible state types (`superseded`, `abandoned`) across CLI, MCP hosts, cockpit, companion and status presentation; on the MCP path the confirmation must stay with the human.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: As the owner I want to end runs that will not be continued, cleanly and traceably, so that every list of open runs shows only real work and later readers can see why, when and by whom a run ended.
- success_signal: After one confirmation, every listed run that was unchanged since the preview no longer appears as active in `doctor --all-active`, the companion and the cockpit; its history shows the outcome, the reason or successor, the confirming person and the time; every run that was not closed is named with its reason.
- primary_decision_or_action: Confirm one previewed closure list by supplying the exact confirmation phrase printed with that preview.

## 3. Working Modes And State

- working_modes:
  - M1 Prepare: the owner or an agent names one or more runs, each with an outcome and a reason or successor, and requests a preview. Nothing in any run changes.
  - M2 Review: the owner reads the preview, in the terminal or as the agent's verbatim rendering of the Core preview text in chat.
  - M3 Confirm and apply: the owner supplies the exact confirmation phrase of that preview; the operation closes each eligible run and reports a result per run.
  - M4 History: ended runs appear only as history, in the cockpit archive and run detail; no active-run list shows them.
  - M5 Attempted continuation: any delivery operation is attempted on an ended run.
- effective_state_by_mode:
  - M1 and M2: all runs unchanged; a stored, non-authorizing preview with an identity, a digest and each listed run's revision. The preview stays usable while the listed runs are unchanged; there is no time-based expiry.
  - M3: per listed run either closed (lifecycle `superseded` or `abandoned`, own receipt) or not closed with a reason; unlisted runs are untouched. A run that changed since the preview does not stop the closure of the other listed runs.
  - M4: the ended state is final.
  - M5: the operation is rejected and nothing is written.
- visible_state_types:
  - Preview header: number of listed runs, the finality notice ("an ended run cannot be reopened; continuing the work needs a new run") and the exact confirmation phrase.
  - Preview per run: title, run id, current gate, open approvals, last activity, number of registered artefacts, the intended outcome with successor or reason, and warnings where they apply: approved gates exist; implementation has started (CD+Tests or later); the successor is a free reference and is not verified.
  - Preview per run that cannot be closed: "not closable" with the reason (completed, already ended, invalid seal, pending recovery, unknown run) and the next action.
  - Result per run: "closed as superseded by <successor>" or "closed as abandoned", or "not closed: <reason>" with the next action.
  - History: "Superseded by <successor>" or "Abandoned", with reason, date and confirming person.
- effective_state_authority_by_mode: M1 and M2: the stored preview, which authorizes nothing. M3 to M5: the lifecycle in each sealed `RUN_STATE.md` and its closure receipt, owned by Core.
- primary_state_presentation_owner_by_mode: M1 to M3: the CLI output, or the agent's verbatim rendering of the Core preview and result text in chat. M4: the cockpit archive and run detail; `doctor --all-active`, delivery-map and the companion show the run by its absence. M5: the message of the rejected command.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: A CLI command with a preview and an apply action, and an MCP operation with which an agent prepares a preview and forwards the owner's verbatim confirmation. Nothing activates automatically; an agent may propose candidates but never supplies the confirmation phrase on its own.
- blockers:
  - A listed run has no reason: the preview is refused and names the run; next action: add the reason.
  - `superseded` without a successor: refused; next action: add a successor or choose `abandoned`.
  - A successor run id does not exist or names the run itself: refused; next action: correct it, or give it as a free reference.
  - A listed run is completed or already ended: shown as not closable; no action.
  - A listed run has an invalid seal or a pending run-step recovery: shown as not closable; next action: run recovery first, then a new preview.
  - The confirmation phrase is missing or differs: nothing is applied; next action: repeat with the exact phrase.
  - The preview is unknown: nothing is applied; next action: create a new preview.
- recovery_paths:
  - A run changed after the preview: that run is not closed, the others are; the result names it; next action: a new preview for the remaining run.
  - An interrupted apply: the existing operation recovery completes or rolls back each run's write; the result states which runs are closed.
  - A transient lock conflict: visible retry with the same preview while the listed runs are unchanged.
- relevant_state_transitions: `active` to `superseded` or `abandoned`, final; no transition out of `superseded` or `abandoned`; `completed` runs are not affected.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria:
  - The preview shows, per listed run, title, run id, gate, open approvals, last activity, artefact count, outcome with reason or successor, and the applicable warnings, and changes no run.
  - The preview states the finality of a closure and prints the exact confirmation phrase.
  - Apply happens only with the exact phrase of the named preview; otherwise no run changes.
  - The result reports every listed run as closed or not closed with a reason; unchanged runs are closed even when another listed run changed.
  - Each closed run carries its own receipt with time, operation identity, outcome, reason, successor (a verified run id or a free reference marked unverified), the confirming person taken from the local Git identity and marked as a cooperative statement, and the preview digest.
  - A reason is required; `superseded` requires a successor; a successor run id must exist and differ from the run.
  - Completed, already ended, seal-invalid and recovery-pending runs are shown as not closable with the next action and are never closed.
  - An ended run rejects gate steps, artefact recording, approvals, presentation decisions, revisions, updates, recovery and delivery continuation with a message naming the closure and, for `superseded`, the successor.
  - After closure the run seal is valid and all registered artefacts are byte-identical.
  - `doctor --all-active`, `delivery-map --all-active` and the companion no longer list ended runs.
  - The cockpit archive shows the run with its outcome and reason, and the run detail shows outcome, reason, successor, confirming person and time.
  - The run's Active Backlog row moves to Completed / Superseded Pointers; a backlog that cannot be updated does not block the closure and the result names it.
  - Through MCP an agent can prepare the preview and forward the owner's verbatim confirmation; the receipt records the same cooperative assurance as approvals.
  - Contract, CLI help and handbook describe both outcomes, the preview and confirmation, and the finality.

## 6. Decision Evidence

Illustrative preview walkthrough (agent inspection, not a user observation; data illustrative):

```text
Closure preview 3f2a9c1e · 3 runs · cannot be reopened afterwards
1  agdf-host-adapter-compatibility   UR  0 of 6 approvals   last activity 2026-09-30
   → abandoned: "approvals reset without provenance; scope replaced by 0.20.x host work"
2  mcp-routing-guard-20260929-01     UR  0 of 6 approvals   last activity 2026-09-30
   → superseded by agdf-request-activation-boundary (run exists)
3  plugin-mcp-sdk-supply-chain-20261002-01   not closable: already completed
Confirm with: close runs 3f2a 2 of 3
```

- decision: ready
- blocking_reason: none
- open_product_questions: Answered by the owner on 2026-10-28 in this session: one list with one confirmation; CLI and MCP; closures are final; unchanged runs are closed even when another listed run changed; a successor is a run id or a free reference marked unverified; the confirming person comes from the local Git identity; seal-invalid runs are not closable until repaired. Proposal for the PRD to confirm: no chat decision card in this slice, only the exact phrase; a card can follow later.
- affected_outputs: PRD acceptance criteria, Approval Decisions and Evidence Requirements.
- evidence: approved UR revision 3; BROWNFIELD_REVIEW.md; owner answers of 2026-10-28; existing confirmation patterns in `packages/core/lib/control-state/run-recovery.js` (preview identity and exact recovery confirmation) and `packages/core/lib/control-state/run-steps.js:376-377` (closeout confirmation selector).
- missing_evidence: none for PRD readiness; the walkthrough above is an optional aid, no UR-required preview exists.
- required_next_step: Draft the PRD from the approved UR, the Brownfield Review and this analysis.
