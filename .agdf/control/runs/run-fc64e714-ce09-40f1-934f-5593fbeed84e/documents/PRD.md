# PRD: Lean Codex continuation handoff

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Reduce the Codex continuation admission of PR #84 to the one thing that needs its own protection: the handoff from the Codex Companion card to Codex chat.

- **One bounded handoff per Run.** Clicking "Run fortsetzen" or "Freigabe prüfen" reserves the Run and publishes exactly one handoff message. A reservation that is not published ends after 2 minutes; a published handoff that Codex does not pick up ends after 10 minutes. Finished and ended handoffs leave no record behind.
- **Picking up the handoff.** Codex picks up the handoff once with the attempt identity from the handoff message. The pickup shows "Codex arbeitet bereits an diesem Run." for at most 1 minute until the Codex activity takes over. A second pickup of the same handoff, a pickup after the handoff ended, or a pickup after the Run changed is refused in chat and starts nothing.
- **Running state from Codex activity.** While the Codex activity lease shows work on the shown Run's current agent step, the Companion card shows "Codex arbeitet bereits an diesem Run." and offers no start. When the turn ends or is interrupted, or the lease passes its bound, the card offers the start again.
- **Ordinary continuations are never refused.** A Codex `continue_delivery` without a Companion attempt is never stopped by the admission, whatever the admission or activity state. Two concurrent continuations stay consistent because every canonical write is bound to its expected revision.
- **No owner chain.** The dispatch input `continuation_owner`, the owner in the returned `work_admission` and in `resume_call`, and the hook-side association of turns with admissions are removed.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics (Brownfield Review: no new screen or action; the Companion keeps its states except "stopping", and "running" gets its source from the activity lease)
- primary_user_intent: As a project owner I can continue a Run from the Codex Companion card without starting it twice, and I can always continue it in Codex chat without being told that Codex already works on it.
- success_signal: A double click or a second Companion window publishes one handoff; an abandoned handoff offers the start again after its bound; the card shows that Codex works while the activity lease says so; a chat continuation is never refused with "Codex is already working on this Run." or "Codex has not confirmed the original handoff yet."
- primary_decision_or_action: not_applicable. No new action; "Run fortsetzen", "Freigabe prüfen" and "Übergabe prüfen" keep their meaning.

No UI preview was required by the UR or created; the behaviour below is specified in text.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| M1 Codex Companion card of a selected Run with the continuation action | ready, pending (handoff reserved or published), running (handoff picked up or Codex activity on the current agent step), stale, unavailable | action button, waiting text with "Übergabe prüfen", running text, stale or unavailable text with "Run neu laden" | handoff record below the companion data root; Codex activity lease | Codex Companion card |
| M2 Codex chat, ordinary continuation (`agdf_dispatch` with `continue_delivery`, no attempt) | The governed continuation is returned | the continuation in chat | Core gate evaluation and the revision check of each write | Codex chat |
| M3 Codex chat, pickup of a Companion handoff (`agdf_dispatch` with `continuation_attempt_id`) | Picked up (governed continuation returned) or refused (one terminal sentence) | the continuation or the refusal sentence in chat | handoff record | Codex chat |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Unchanged. The Companion continuation action exists only for a qualified Codex runtime with a companion data root; M2 is unaffected everywhere.
- blockers_and_visible_next_actions: A Companion start is blocked only by a live handoff of the same Run (reserved, published or just picked up), by Codex activity on the Run's current agent step, or by a changed Run (stale). Nothing blocks an ordinary chat continuation.
- recovery_paths: An unpublished reservation recovers after 2 minutes, an unclaimed handoff after 10 minutes, a pickup display after 1 minute; afterwards the card offers the start again. A handoff record that cannot be read blocks Companion starts of that Run for at most 10 minutes and never affects chat. A refused pickup can always be followed by an ordinary chat continuation.
- relevant_state_transitions:
  - ready -> click -> reserved (up to 2 minutes) -> publish -> pending (up to 10 minutes) -> Codex pickup -> picked up (shown as running, up to 1 minute) -> removed; Codex activity then shows running until the turn ends.
  - reserved -> cancel or stale before publication -> removed, ready or stale shown.
  - Any handoff phase -> its bound passes -> treated as absent and removed on the next access; ready shown.
  - ready -> Codex activity on the current agent step -> running shown, no start offered -> turn ends, interrupt or lease bound -> ready.
  - pickup with an unknown, ended, consumed or non-matching attempt -> refusal sentence in chat, no continuation.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: M1
  - source_state: The Run is ready; two Companion windows or a double click compete
  - trigger: Both try to start the Run at the same time
  - expected_effective_state: Exactly one reservation is published as a handoff; the other sees pending
  - visible_feedback: One card shows the waiting text; no second handoff message is sent
  - failure_behavior: not_applicable
  - recovery: not_applicable
  - observable_success: Two independent processes reserving and publishing the same Run yield exactly one send permit, and an unrelated Run can still be reserved
  - required_evidence: Admission test with two processes.

- criterion_id: AC-002
  - working_mode: M1
  - source_state: A reservation or a published handoff exists for the Run
  - trigger: 2 minutes pass without publication, or 10 minutes pass without pickup
  - expected_effective_state: The handoff counts as absent; its record is removed on the next access
  - visible_feedback: The card shows "Run fortsetzen" (or "Freigabe prüfen") again instead of the waiting text
  - failure_behavior: Before the bound the waiting text stays
  - recovery: not_applicable
  - observable_success: With a controlled clock a reservation older than 2 minutes and a pending handoff older than 10 minutes are reported ready, a new reservation succeeds, and the old record file is gone; a record written by PR #84 never blocks the Run
  - required_evidence: Admission tests with a controlled clock and a PR #84 record.

- criterion_id: AC-003
  - working_mode: M3
  - source_state: A published handoff exists for the Run
  - trigger: Codex picks it up with its attempt identity, then the same attempt is used again
  - expected_effective_state: The first pickup returns the governed continuation and consumes the handoff; every later pickup of that attempt, a pickup after expiry and a pickup after the Run changed is refused
  - visible_feedback: First pickup: the continuation; refused pickup: one sentence in chat saying the Companion handoff was already used, has expired or the Run has changed
  - failure_behavior: A refused pickup starts no continuation and changes no Run state
  - recovery: The person can continue the Run with an ordinary chat continuation
  - observable_success: A pickup succeeds exactly once; the second pickup of the same attempt is terminal with the refusal sentence
  - required_evidence: Admission test and MCP server test through the dispatch runtime.

- criterion_id: AC-004
  - working_mode: M2
  - source_state: A handoff is pending or picked up, Codex activity shows work on the Run, the handoff record cannot be read, or the Run does not meet the Companion start eligibility
  - trigger: Codex continues the Run in chat without an attempt identity
  - expected_effective_state: The governed continuation is returned; a canonical write with a stale expected revision is still rejected by Core
  - visible_feedback: No refusal sentence from the admission
  - failure_behavior: not_applicable
  - recovery: not_applicable
  - observable_success: In each listed source state an ordinary `continue_delivery` returns its continuation, and a concurrent write against an outdated revision is rejected
  - required_evidence: MCP server test for each source state, including a stale write.

- criterion_id: AC-005
  - working_mode: M1
  - source_state: The Companion shows a Run whose current step is agent work
  - trigger: The Codex activity lease reports work on that Run and step, then the turn ends or is interrupted
  - expected_effective_state: running while the lease shows work, ready afterwards; no start can be reserved while running
  - visible_feedback: "Codex arbeitet bereits an diesem Run." while running; the start button afterwards; the former "Der Abbruch wurde angefordert" text no longer appears
  - failure_behavior: Without a sign of life of the Companion hooks the card cannot know about chat work and shows the handoff state only
  - recovery: not_applicable
  - observable_success: Status and reservation report running while matching activity exists and ready after its end; a picked-up handoff reports running for at most 1 minute
  - required_evidence: Cockpit continuation test with a controlled activity store and control-ui unit test.

- criterion_id: AC-006
  - working_mode: M2
  - source_state: Any Codex chat dispatch
  - trigger: Codex passes `continuation_owner` or reads the returned continuation
  - expected_effective_state: `continuation_owner` is not part of the dispatch contract and is rejected as an unknown field; no result carries an owner in `work_admission` or `resume_call`
  - visible_feedback: not_applicable
  - failure_behavior: not_applicable
  - recovery: not_applicable
  - observable_success: The dispatch function contract test shows the field is gone and rejected, and a picked-up continuation contains no owner
  - required_evidence: Dispatch function contract test and MCP server test.

- criterion_id: AC-007
  - working_mode: M1
  - source_state: The card offers the continuation action
  - trigger: The person cancels before publication, the Run changes before publication, or the approval step is handed off
  - expected_effective_state: Cancel and stale publish no handoff; the Companion never records an approval
  - visible_feedback: Unchanged Companion texts
  - failure_behavior: Unchanged
  - recovery: Unchanged
  - observable_success: The existing cancel, stale, lost-publication and approval handoff tests keep passing in meaning
  - required_evidence: Existing admission, MCP server and control-ui continuation tests.

- criterion_id: AC-008
  - observable_success: The Core, MCP server and control-ui suites and `npm run compatibility:check` pass, and the contract text change chain (Copilot payload baseline, `npm run build:prepare`, `npm run compatibility:record`) is completed.
  - required_evidence: Recorded command output in the run evidence.

## 6. Non-Goals

- No change to the Codex activity lease itself (hook events, `codexTurnBound`, liveness).
- No new Companion action or setting; texts change only for the removed "stopping" state and the new pickup refusal sentence.
- No change to approval semantics; the Companion never records an approval.
- No native re-qualification on a real Codex host in this run.
- No change to the Claude Companion or the event journal.
- No configurable bounds; the bounds are fixed values of this build.
- No merge of PR #84, #85 or #86.

## 7. Users And Roles

- Project owner continuing a Run from the Codex Companion card or in Codex chat.
- The Codex agent following governed next actions.
- Maintainers who would otherwise recover a Run reported as already running or pending.
- Product owner and decider for this run: Arndt Gold.

## 8. Constraints

- The handoff stays one record per target and Run below the companion data root; the activity lease stays the only source of running work outside the pickup display.
- Handoffs stay non-authorizing (`authorizes: false`).
- Records written by PR #84 must never block a Run.
- Changes under `packages/core` and `packages/cli` follow the contract text change chain.
- The branch is the base of PR #85 and PR #86 and is merged upward afterwards.

## 9. Evidence Requirements

- Admission tests: two processes (AC-001), controlled clock and PR #84 record (AC-002), single pickup (AC-003).
- MCP server tests through the dispatch runtime: pickup and refused pickup (AC-003), ordinary continuation in each source state with a stale write (AC-004), no owner (AC-006), approval handoff (AC-007).
- Cockpit continuation test with a controlled activity store and control-ui unit test (AC-005).
- Dispatch function contract test (AC-006).
- Suite and compatibility output (AC-008). The browser continuation cases cannot run on this Windows host; their update is checked by review and CI.

## 10. Risks And Open Questions

- Without trusted Companion hooks a handoff can overlap with chat work on the same Run; consistency holds through the revision check, duplicate work stays possible and is reported as residual risk.
- A pickup display shorter than the time until Codex's first activity can show ready briefly; the 1-minute bound covers normal hook latency.
- Existing native qualification evidence no longer matches after this change; re-qualification on a real Codex host is a later step.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| How long may a handoff stay unresolved before the card offers the start again? | before_prd | resolved | Reservation 2 minutes, published handoff 10 minutes, pickup display 1 minute; fixed values | Arndt Gold |
| What does the card show while Codex works on the Run, and may a start be reserved then? | before_prd | resolved | "Codex arbeitet bereits an diesem Run." from the activity lease on the current agent step; no reservation while running | Arndt Gold |
| Is the "stopping" state kept? | before_prd | resolved | Dropped: an interrupt ends the activity and the card offers the start again | Arndt Gold |
| What happens to a second or late pickup of a handoff? | before_prd | resolved | Refused in chat with one sentence; an ordinary chat continuation stays possible | Arndt Gold |
| How are records in the PR #84 format and unreadable records handled internally? | later_sd | deferred | SD decides within AC-002 and AC-004 | Arndt Gold |
| Which native qualification observations replace the owner-bound ones? | later_sd | deferred | SD decides | Arndt Gold |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

The approval confirms the specified behaviour, scope and criteria and permits the SD step.

## AGDF Approval Summary (de; source=en)

- Ziel: Die Codex-Fortsetzung aus dem Begleiter schützt nur noch die Übergabe selbst; Fortsetzungen im Chat werden nie abgewiesen, und „Codex arbeitet bereits an diesem Run.“ kommt aus dem vorhandenen Aktivitätsnachweis.
- Umfang: eine Übergabe pro Run mit Ablaufzeiten (Reservierung 2 Minuten, veröffentlichte Übergabe 10 Minuten, Abholanzeige 1 Minute) und ohne zurückbleibende Dateien; einmaliges Abholen per Versuchskennung; Laufanzeige und gesperrter Start während Codex-Aktivität; keine Abweisung gewöhnlicher Chat-Fortsetzungen; Owner-Kette (`continuation_owner`, Owner in `work_admission` und `resume_call`, Hook-Zuordnung) entfernt.
- Entscheidungen: Ablaufzeiten 2/10/1 Minuten fest; Laufanzeige aus dem Aktivitätsnachweis ohne Start während der Arbeit; Zustand „Abbruch angefordert“ entfällt; zweites oder spätes Abholen wird im Chat mit einem Satz abgewiesen; Umgang mit alten Sperrdateien und die neue Qualifizierungsliste legt das SD fest.
- AC-001: Zwei gleichzeitige Starts aus Begleiterfenstern ergeben genau eine Übergabe; ein anderer Run bleibt frei.
- AC-002: Unveröffentlichte Reservierungen enden nach 2 Minuten, nicht abgeholte Übergaben nach 10 Minuten; danach bietet die Karte den Start wieder an, die Datei ist weg, und PR-#84-Dateien sperren nie.
- AC-003: Codex holt eine Übergabe genau einmal ab; erneutes, abgelaufenes oder veraltetes Abholen wird im Chat abgewiesen und startet nichts.
- AC-004: Gewöhnliche Chat-Fortsetzungen laufen in jedem Zustand durch; ein Schreibvorgang gegen eine veraltete Revision wird weiter abgewiesen.
- AC-005: Die Karte zeigt „Codex arbeitet bereits an diesem Run.“, solange der Aktivitätsnachweis Arbeit am aktuellen Schritt meldet, und bietet danach den Start wieder an; „Abbruch angefordert“ erscheint nicht mehr.
- AC-006: `continuation_owner` ist aus dem Dispatch-Vertrag entfernt und wird abgelehnt; kein Ergebnis enthält mehr einen Owner.
- AC-007: Abbrechen, veralteter Run und Freigabe-Übergabe verhalten sich wie bisher; der Begleiter zeichnet nie eine Freigabe auf.
- AC-008: Core-, MCP-Server- und control-ui-Suiten sowie die Kompatibilitätsprüfung sind grün, die abgeleiteten Nachweise aktualisiert.
