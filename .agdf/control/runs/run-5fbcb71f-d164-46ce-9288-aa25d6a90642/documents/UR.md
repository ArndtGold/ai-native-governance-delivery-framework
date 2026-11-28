# UR: Recoverable Codex continuation leases

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-27
Owner: Arndt Gold

## 1. Problem

PR #84 (branch `codex/agdf-companion-reader-and-continuation`) adds a durable admission record per target and Run so that a Codex continuation started from the Companion and an ordinary Codex `continue_delivery` cannot run twice. A code review of PR #84 on 2026-11-27 found that this admission can lock a Run permanently or stop the agent's own governed work:

- A record never expires. A `running` record without an associated turn (the PostToolUse hook is not approved or fails, the dispatch result is lost or reported as an error, the turn association times out on the 250 ms lock wait, or the Stop event is processed before the PostToolUse association) and a `pending` record whose chat message never arrives after `publish` stay in force with no recovery except deleting the file in the plugin data folder.
- After an admitted dispatch, a canonical write (`agdf_record`, `agdf_approve`, run creation) returns a plain `agdf_dispatch` continuation as `next_action` without the continuation owner (`run-command-service.js`). Following that documented normal path in the same turn is refused as "Codex is already working on this Run."
- The admitted owner itself is refused when it continues at an unchanged revision, for example after a rejected write.
- `settleTurn` stops evaluating turn ends once more than 512 records exist, and records are never removed, so after enough Runs in one plugin data folder no Stop or Interrupt releases any lease.
- Every ordinary Codex `continue_delivery` with an agent operation now has to pass the Companion start eligibility (`continuationBinding`); a Run whose control assessment is not `open`, whose persisted and evaluated gate or next allowed action differ, or a lock timeout turns a previously working continuation into a terminal stop.

All of this applies only where the Codex continuation is qualified, which is exactly where the feature is meant to run.

## 2. Goal

The Codex continuation admission protects a Run against a second concurrent start without ever locking it permanently and without stopping the agent's own governed follow-up work. Concretely:

- An unresolved admission ends after a bounded time and the Run becomes available again; the Companion and an ordinary continuation see that state.
- The agent that holds an admission can follow the returned next action after a canonical write and can continue at an unchanged revision within its admitted work.
- Turn ends are evaluated independently of how many records exist, and finished records do not accumulate without bound.
- An ordinary Codex continuation without the Companion is refused only by a real conflicting admission, not by the Companion's start eligibility.

## Affected Users

- People who continue a Run from the Codex Companion card ("Run fortsetzen", "Freigabe prüfen").
- People and agents who continue a Run in Codex chat with an ordinary `continue_delivery`, with or without the Companion.
- Maintainers who have to recover a Run that is reported as already running or pending.

## 3. Scope

- Bounded lifetime for `reserved`, `pending` and `running` admission records in `packages/core/lib/companion/codex-continuation.js`, including the case of a `running` record without an associated turn; an expired record no longer blocks reservation or claims and is reported as available.
- Owner continuity for the agent's own follow-up: the continuation returned after a canonical write during admitted work, and a continuation by the same owner at an unchanged revision, are admitted instead of refused.
- Turn-end evaluation (`settleTurn`) that does not depend on a fixed maximum number of records, and removal or compaction of settled or expired records.
- Admission of ordinary Codex `continue_delivery` dispatches (`admitCodexContinuation` in `packages/cli/lib/mcp-dispatch-runtime.js`) refused only by a conflicting live admission; the Companion start eligibility remains required for Companion reservations and publications.
- Tests for each case in the existing admission, dispatch and MCP server test suites, and the derived artefacts this change requires (Copilot payload baseline, host compatibility record).

## 4. Non-Goals

- No change to the Companion card texts or flow beyond what the corrected lease states need.
- No change to approval semantics: the Companion still never records an approval.
- No change to the qualification observation list or to how a native qualification record is produced; re-qualification on a real Codex host is outside this run.
- No change to the Claude Companion, the event journal or PR #85/#86 content beyond merging the corrected base.
- No merge of PR #84.

## 5. Acceptance Signals

- A test shows that a `running` record without an associated turn and a `pending` record without a claim become available after their bound, and that both an ordinary continuation and a new Companion reservation then succeed.
- A test shows that after an admitted dispatch and a canonical write in the same turn, the returned next action is admitted for the same owner.
- A test shows that the same owner continuing at an unchanged revision is admitted.
- A test shows that a Stop or Interrupt settles the matching record with more than 512 records present, and that settled records do not accumulate without bound.
- A test shows that an ordinary continuation of a Run whose assessment or persisted next step does not meet the Companion eligibility is not stopped by admission when no conflicting admission exists, while a conflicting live admission still stops it.
- The existing admission, Companion continuation, MCP server, control-ui and compatibility suites pass.

## 6. Existing Source Of Truth

- `packages/core/lib/companion/codex-continuation.js` (admission records, transitions, `settleTurn`).
- `packages/core/lib/companion/codex-continuation-binding.js` (Companion start eligibility).
- `packages/core/lib/companion/codex-activity.js` (hook observation, turn association, `codexTurnBound` in `activity.js`).
- `packages/cli/lib/mcp-dispatch-runtime.js` (`admitCodexContinuation`, `stopCodexContinuation`).
- `packages/core/lib/control-state/run-command-service.js` and `packages/core/lib/control-state/prepared-control-calls.js` (`continueDeliveryCall` for next calls after canonical writes).
- `packages/core/lib/skill-dispatch/mcp-continuation.js` (owner-bound `resume_call`).
- `packages/core/lib/control-inspect/cockpit-session.js` (Companion `continue` operations).
- Tests: `packages/core/test/codex-continuation-admission-test.js`, `packages/mcp-server/test/companion-continuation.test.js`, `packages/control-ui/test/companion-continuation.test.tsx`.
- Review findings of 2026-11-27 on PR #84 and the contract text change chain (Copilot payload baseline, eval fingerprints, `npm run build:prepare`, `npm run compatibility:record`).

## 7. Risks And Unknowns

- Lease durations must be decided: how long a `pending` admission waits for Codex to claim it and how long a `running` admission without turn evidence or without a recent confirmation stays in force. The existing Codex activity bound of 60 minutes is one reference.
- The mechanism for owner continuity must be decided: carrying the owner in next calls after canonical writes, or recognizing the owner on the serving side.
- Whether an ordinary continuation should still take a lease at all, so that the Companion can show that Codex works on the Run, has to be decided together with the conflict rule.
- Changing the admission code changes the server digest, so an existing native continuation qualification record no longer matches until it is recorded again on a real Codex host.
- The branch is the base of PR #85 and PR #86; the change has to be merged upward again.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- Ziel: Die Codex-Fortsetzungssperre aus PR #84 verhindert weiter einen doppelten Start, sperrt einen Run aber nie dauerhaft und hält den Agenten nicht bei seiner eigenen gesteuerten Arbeit auf.
- Problem: Sperren verfallen nie (fehlender Hook, verlorene Nachricht oder Antwort, Lock-Timeout); der normale Folgeaufruf nach einem Schreibvorgang wird im selben Turn abgewiesen; der eigene Owner wird bei gleicher Revision abgewiesen; ab 512 Sperrdateien werden Turn-Enden nicht mehr ausgewertet; gewöhnliche Fortsetzungen ohne Begleiter scheitern an der Begleiter-Eignung.
- Betroffene: Wer einen Run aus der Codex-Begleiterkarte oder im Codex-Chat fortsetzt, und wer einen fälschlich gesperrten Run wieder freibekommen muss.
- Umfang: begrenzte Lebensdauer für reservierte, wartende und laufende Sperren; Owner-Kontinuität für Folgeaufrufe und gleiche Revision; Turn-Ende-Auswertung ohne feste Obergrenze und Aufräumen erledigter Sperren; gewöhnliche Fortsetzung nur bei echtem Konflikt abweisen; Tests und abgeleitete Nachweise.
- Nicht-Ziele: keine neuen Kartentexte, keine Änderung an Freigaben, an der Qualifizierungsliste, am Claude-Begleiter oder an #85/#86 außer dem Nachziehen; kein Merge von #84.
- Abnahmesignale: je ein Test für Verfall, Folgeaufruf nach Schreibvorgang, gleiche Revision, mehr als 512 Sperren und gewöhnliche Fortsetzung ohne Konflikt; bestehende Suiten und Kompatibilitätsprüfung grün.
- Quellen: `codex-continuation.js`, `codex-continuation-binding.js`, `codex-activity.js`, `mcp-dispatch-runtime.js`, `run-command-service.js`, `prepared-control-calls.js`, `mcp-continuation.js`, `cockpit-session.js` und die zugehörigen Tests; Review-Befunde vom 27.11.2026.
- Risiken: Sperrdauern und der Weg für die Owner-Kontinuität sind noch festzulegen; jede Codeänderung macht einen vorhandenen nativen Qualifizierungsnachweis ungültig; #85 und #86 müssen erneut nachgezogen werden.
- Nächster Schritt: UR prüfen und mit `Approval: UR` freigeben; danach Brownfield Review und Festlegung der Lieferform.
