# PRD: Recoverable Codex continuation leases

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Make the Codex continuation admission of PR #84 recoverable and stop it from blocking the agent's own governed work, while it still prevents a second concurrent start of the same Run.

- **Bounded admissions.** Every unresolved admission ends on its own: a reservation after 2 minutes, a published handoff that Codex has not claimed after 10 minutes, and running work 60 minutes after its last confirmation (claim, re-admission of the same owner, or association with the Codex turn). An ended admission no longer blocks the Run. Admissions written before this change are aged by their last write.
- **The agent's own follow-up.** After an admitted dispatch, the next continuation that a canonical write returns for the same Run (`agdf_record`, `agdf_approve`, `agdf_run`) carries the owner of that admission when the serving MCP server admitted it and the admission still runs for that owner, so following the returned next action keeps working. The same owner continuing at an unchanged revision is admitted again.
- **Turn ends and cleanup.** A Stop or Interrupt of the Codex turn settles its admission however many admission records exist. Finished admissions (settled, cancelled, stale or expired) are removed instead of accumulating.
- **Ordinary continuations.** A Codex `continue_delivery` without a Companion attempt or owner is refused only when another live admission holds the Run. It is no longer refused because the Run does not meet the Companion start eligibility, and an admission record that cannot be read or locked does not stop it.
- **Companion protections unchanged.** One send permit per Run, the click-only start, the eligibility check for reservation, publication and the claim of the Companion attempt, and the rule that the Companion never records an approval stay as they are.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics (Brownfield Review: no new screen, text or action; existing Companion action states only change when they end)
- primary_user_intent: As a project owner I can always continue a Run in Codex, from the Companion card or in chat, and an interrupted or lost handoff never leaves the Run locked.
- success_signal: A Companion card that showed "Die Bestätigung von Codex steht noch aus." or "Codex arbeitet bereits an diesem Run." for an abandoned handoff offers "Run fortsetzen" again once the bound has passed; Codex completes a governed step and its follow-up in one turn without "Codex is already working on this Run."; a second Codex chat that tries to continue the same Run while the first works is still told that Codex already works on it.
- primary_decision_or_action: not_applicable. No new action; the existing "Run fortsetzen", "Freigabe prüfen" and "Übergabe prüfen" actions keep their meaning.

No UI preview was required by the UR or created; the behaviour below is specified in text.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| M1 Codex Companion card of a selected Run with the continuation action | Admission state of the Run: ready, pending, running, stopping, stale or unavailable | action button, waiting text, running text, stale or unavailable text | durable admission record below the companion data root | Codex Companion card |
| M2 Codex chat continuation (`agdf_dispatch` with `continue_delivery`) | Admitted (the governed continuation is returned) or refused (one terminal sentence) | returned continuation or the refusal sentence in chat | durable admission record; the dispatch result | Codex chat |
| M3 Codex turn events (PostToolUse, Stop, Interrupt hooks) | The admission is associated with the turn, settled at its end, or marked as stopping | none directly; M1 shows the resulting state | durable admission record | none (observed through M1 and M2) |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Unchanged. The admission is active only for a qualified Codex runtime with a companion data root; elsewhere nothing changes.
- blockers_and_visible_next_actions: A Run is blocked for a new start only by a live admission of another owner (reserved, pending or running and not ended). The refusal sentences and Companion texts stay as they are.
- recovery_paths: An abandoned reservation, an unclaimed handoff and running work without a turn end recover on their own after their bound; afterwards the Companion offers "Run fortsetzen" and an ordinary continuation is admitted. A record that cannot be read blocks Companion reservations until it ages past the running bound, but never stops an ordinary continuation.
- relevant_state_transitions:
  - Companion reserves -> reserved (2 minutes) -> publishes -> pending (10 minutes) -> Codex claims the attempt -> running.
  - Ordinary continuation without a live admission -> running for a new owner.
  - Running -> confirmation by claim, same-owner re-admission or turn association -> the 60-minute bound starts again.
  - Running -> turn Stop with no open write of the Run -> settled and removed; with an open write -> settles when the write is closed or the bound passes.
  - Running -> Interrupt -> stopping until Stop or the bound.
  - Any unresolved state -> its bound passes -> ended, treated as ready, removed on the next access.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: M1
  - source_state: A reservation, a published handoff or running work exists for the Run
  - trigger: Its bound passes without a further transition (2 minutes reserved, 10 minutes pending, 60 minutes running after the last confirmation)
  - expected_effective_state: The admission counts as ended; the Run is ready for a new reservation or claim
  - visible_feedback: The Companion card shows "Run fortsetzen" (or "Freigabe prüfen") again instead of the waiting or running text
  - failure_behavior: Before the bound the existing waiting or running text stays
  - recovery: not_applicable
  - observable_success: A reservation older than 2 minutes, a pending handoff older than 10 minutes, a running admission without a turn and a running admission whose last confirmation is older than 60 minutes are each reported as ready, and both a new Companion reservation and an ordinary continuation then succeed; an admission record written before this change without a time is aged by its last write
  - required_evidence: Admission tests with a controlled clock for each phase and for a record without a time field.

- criterion_id: AC-002
  - working_mode: M2
  - source_state: Codex holds a running admission for the Run, admitted by the serving MCP server
  - trigger: Codex records a canonical write for that Run (`agdf_record`, `agdf_approve` or `agdf_run`) and follows the returned next action
  - expected_effective_state: The returned `agdf_dispatch` continuation carries the admission's owner; the dispatch is admitted and the admission moves to the new revision
  - visible_feedback: The governed continuation is returned; no refusal sentence
  - failure_behavior: When the admission no longer runs for that owner (ended, interrupted or another owner) the next action carries no owner and an ordinary continuation is evaluated
  - recovery: not_applicable
  - observable_success: After an admitted dispatch and a canonical write in the same turn, the returned next action contains the owner and dispatching it is admitted
  - required_evidence: MCP server test through the dispatch runtime with a canonical write between two dispatches.

- criterion_id: AC-003
  - working_mode: M2
  - source_state: Codex holds a running admission for the Run at revision R
  - trigger: The same owner continues again at revision R (for example after a rejected write)
  - expected_effective_state: The dispatch is admitted for the same attempt and owner; the admission's bound starts again
  - visible_feedback: The governed continuation is returned; no "Codex is already working on this Run."
  - failure_behavior: An ended or interrupted admission still refuses its old owner
  - recovery: not_applicable
  - observable_success: A same-owner claim at an unchanged revision is admitted, while a claim by a different owner or without an owner is still refused
  - required_evidence: Admission test.

- criterion_id: AC-004
  - working_mode: M3
  - source_state: More than 512 admission records exist in the companion data folder, one of them running for the turn
  - trigger: The turn's Stop or Interrupt hook arrives
  - expected_effective_state: The matching admission is settled (Stop, no open write) or marked stopping (Interrupt); settled, cancelled, stale and expired admissions are removed
  - visible_feedback: The Companion card shows "Run fortsetzen" again after Stop
  - failure_behavior: An open write of the Run keeps the admission until the write is closed or the bound passes
  - recovery: not_applicable
  - observable_success: With 600 records present the matching admission settles on Stop, and after cancel, stale publication, settlement and expiry the corresponding record files are gone
  - required_evidence: Admission tests with many records and file checks after each finishing transition.

- criterion_id: AC-005
  - working_mode: M2
  - source_state: No live admission of another owner exists for the Run, and the Run does not meet the Companion start eligibility (control assessment not open, or persisted and evaluated next step differ), or its admission record cannot be read or locked
  - trigger: Codex continues the Run in chat without a Companion attempt or owner
  - expected_effective_state: The governed continuation is returned (with a new admission where the record is usable, without one where it is not)
  - visible_feedback: No refusal sentence
  - failure_behavior: A live admission of another owner still refuses with "Codex is already working on this Run." (running) or "Codex has not confirmed the original handoff yet." (pending)
  - recovery: not_applicable
  - observable_success: An ordinary continuation is refused only by a live foreign admission; Companion eligibility and an unreadable record no longer stop it
  - required_evidence: Admission and MCP server tests for an ineligible Run, an unreadable record and a live foreign admission.

- criterion_id: AC-006
  - working_mode: M1
  - source_state: The Companion card offers the continuation action
  - trigger: The person clicks, a second Companion or a chat continuation competes, or the Run changes before publication
  - expected_effective_state: Exactly one send permit per Run; a changed Run gives "stale"; the Companion attempt is claimed only while the Run is still eligible; the Companion never records an approval
  - visible_feedback: Unchanged Companion texts
  - failure_behavior: Unchanged
  - recovery: Unchanged
  - observable_success: The existing admission, MCP server and control-ui continuation tests pass unchanged in meaning
  - required_evidence: Existing tests `packages/core/test/codex-continuation-admission-test.js`, `packages/mcp-server/test/companion-continuation.test.js`, `packages/control-ui/test/companion-continuation.test.tsx`.

- criterion_id: AC-007
  - observable_success: The admission, MCP server, control-ui and companion run-view suites and `npm run compatibility:check` pass, and the contract text change chain (Copilot payload baseline, `npm run build:prepare`, `npm run compatibility:record`) is completed.
  - required_evidence: Recorded command output of these suites in the run evidence.

## 6. Non-Goals

- No new Companion text, action or setting.
- No change to approval semantics, the qualification observation list or how a native qualification record is produced.
- No change to the Claude Companion, the event journal or the content of PR #85 and PR #86 beyond merging this base.
- No configurable bounds; the bounds are fixed values of this build.
- No merge of PR #84.

## 7. Users And Roles

- Project owner continuing a Run from the Codex Companion card or in Codex chat.
- The Codex agent following governed next actions.
- Maintainers recovering a Run reported as already running or pending.
- Product owner and decider for this run: Arndt Gold.

## 8. Constraints

- The admission stays one record per target and Run below the companion data root; no second lease store.
- Admissions stay non-authorizing (`authorizes: false`); the Companion never records an approval.
- Records written by the PR #84 version must be readable and must expire under the new rule.
- The continuation owner is carried only in bound next calls for the same target and Run and only when the serving MCP server admitted it; it never appears for another Run.
- Changes under `packages/core` and `packages/cli` follow the contract text change chain.

## 9. Evidence Requirements

- Admission tests with a controlled clock for the bounds and old records (AC-001), same-owner re-admission (AC-003), many records and cleanup (AC-004), ineligible Run and unreadable record (AC-005).
- MCP server test with a canonical write between two dispatches (AC-002) and for ordinary continuations against a live foreign admission (AC-005).
- Existing continuation tests (AC-006) and the regression suites with `npm run compatibility:check` (AC-007).

## 10. Risks And Open Questions

- A Codex turn that works longer than 60 minutes without any admitted dispatch loses its admission; a second start in that window is possible. This matches the existing Codex activity bound.
- An unreadable record lets an ordinary continuation proceed without an admission; a concurrent Companion start is still refused until the record ages out.
- The owner is carried by the serving MCP server; if one server process served two Codex chats on the same Run, both would receive the owner after a canonical write.
- Any change to this code invalidates an existing native continuation qualification record until it is recorded again on a real Codex host.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Bounds of unresolved admissions | before_prd | resolved | Reserved 2 minutes from reservation, pending 10 minutes from publication, running 60 minutes from the last confirmation (claim, same-owner re-admission, turn association); fixed values, adopted with this PRD | Arndt Gold |
| Behaviour when the admission record cannot be read or locked | before_prd | resolved | An ordinary continuation proceeds without an admission; a Companion reservation, publication or attempt claim is refused as today | Arndt Gold |
| Which continuations are refused | before_prd | resolved | Only a live admission of another owner refuses an ordinary continuation; Companion eligibility applies only to reservation, publication and the Companion attempt claim | Arndt Gold |
| How the owner reaches the next call after a canonical write, the record time field and the migration of version-1 records | later_sd | deferred | Decided in the SD within the constraints of section 8 | SD author (sd-definition) |
| How settled and expired records are removed and found by turn ends | later_sd | deferred | Decided in the SD | SD author (sd-definition) |

## 11. Next Step

Present this PRD only after every `before_prd` row is `resolved` with a concrete answer and
the named PRD Owner is filled. Then review and approve only with:

`Approval: PRD`

The approval confirms the specified behavior, scope and criteria and permits the existing SD step.

## AGDF Approval Summary (de; source=en)

- Ziel: Die Codex-Fortsetzungssperre verhindert weiter einen doppelten Start desselben Runs, sperrt aber nie dauerhaft und lässt Codex seine eigene gesteuerte Arbeit fortsetzen.
- Umfang: begrenzte Lebensdauer jeder offenen Sperre; der Folgeaufruf nach einem Schreibvorgang trägt die Owner-Kennung, wenn derselbe MCP-Server sie vergeben hat und die Sperre noch für sie läuft; derselbe Owner wird bei gleicher Revision erneut zugelassen; Turn-Enden werden unabhängig von der Anzahl der Sperrdateien ausgewertet und erledigte Sperren gelöscht; gewöhnliche Fortsetzungen scheitern nur an einer fremden, gültigen Sperre; die Schutzregeln des Begleiters bleiben unverändert.
- AC-001: Eine Reservierung verfällt nach 2 Minuten, eine nicht angenommene Übergabe nach 10 Minuten und laufende Arbeit 60 Minuten nach der letzten Bestätigung; danach bietet die Karte wieder „Run fortsetzen“ an und Reservierung wie gewöhnliche Fortsetzung gelingen; alte Sperren ohne Zeitangabe altern nach ihrem letzten Schreibzeitpunkt.
- AC-002: Nach einem zugelassenen Dispatch und einem Schreibvorgang im selben Turn trägt der zurückgegebene Folgeaufruf die Owner-Kennung und wird zugelassen.
- AC-003: Derselbe Owner wird bei unveränderter Revision erneut zugelassen; ein anderer Owner oder ein Aufruf ohne Owner wird weiter abgewiesen.
- AC-004: Bei 600 Sperrdateien setzt Stop die passende Sperre zurück; abgebrochene, veraltete, erledigte und abgelaufene Sperren werden gelöscht.
- AC-005: Eine gewöhnliche Fortsetzung wird nur durch eine fremde, gültige Sperre abgewiesen, nicht mehr durch fehlende Begleiter-Eignung oder eine unlesbare Sperrdatei.
- AC-006: Ein Sendeschein pro Run, Klick-Start, Eignungsprüfung für Reservierung, Veröffentlichung und Begleiter-Claim sowie „keine Freigabe durch den Begleiter“ bleiben unverändert.
- AC-007: Sperr-, MCP-Server-, control-ui- und run-view-Suiten sowie `npm run compatibility:check` laufen durch; die Änderungskette ist abgeschlossen.
- Entscheidungen: Grenzen 2 / 10 / 60 Minuten als feste Werte; bei unlesbarer oder gesperrter Sperrdatei läuft eine gewöhnliche Fortsetzung ohne Sperre weiter, der Begleiter lehnt weiter ab; nur eine fremde, gültige Sperre weist ab, die Begleiter-Eignung gilt nur für Reservierung, Veröffentlichung und Begleiter-Claim; Weg der Owner-Kennung, Zeitfeld, Migration und Aufräumen entscheidet das SD.
