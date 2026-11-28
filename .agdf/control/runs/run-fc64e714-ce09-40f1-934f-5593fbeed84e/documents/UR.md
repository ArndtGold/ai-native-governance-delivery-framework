# UR: Lean Codex continuation handoff

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-27
Owner: Arndt Gold

## 1. Problem

PR #84 (branch `codex/agdf-companion-reader-and-continuation`) lets a person continue a Run from the Codex Companion card. To prevent a double start it adds a durable admission record per target and Run that every ordinary Codex `continue_delivery` with an agent operation must also pass, plus an owner token that is carried through the dispatch schema (`continuation_owner`), the `resume_call`, the `work_admission` result and the Codex hook observation (`observeContinuation`) until a Stop event settles the record.

A code review of PR #84 on 2026-11-27 found that this design can lock a Run permanently or stop the agent's own governed work: records never expire, a `running` record without a matched turn is never released, the plain next action after a canonical write is refused because it carries no owner, the owner itself is refused at an unchanged revision, turn ends stop being evaluated above 512 records, and every ordinary continuation now depends on the Companion start eligibility. A first repair run (run-5fbcb71f) added leases, holds and owner continuity around the lock and made the design larger instead of smaller.

The actual risk is narrower. Consistency of ordinary continuations is already protected: every canonical write is bound to an expected revision and a stale write is rejected. That Codex is working on a Run is already observed by the existing Codex activity lease (`codex-activity.js`, shown on the Companion card). The only gap that needs its own protection is the Companion handoff itself: between the click and the moment Codex picks up the handoff message, a second click or a second Companion window must not publish a second start.

## 2. Goal

The Codex continuation admission protects only the Companion handoff, with bounded lifetimes, and never gates ordinary continuations. Concretely:

- Reserving and publishing a Companion handoff grants exactly one send permit per Run; the pending handoff ends when Codex claims it or after a bounded time.
- The Companion shows that Codex works on the Run from the existing activity lease, not from a second lock.
- An ordinary Codex `continue_delivery`, with or without the Companion, is never refused by the admission; consistency stays with the revision check of every write.
- The owner chain (`continuation_owner`, owner in `resume_call`, `work_admission` owner, owner association in the hook observation) is removed.
- Admission records do not accumulate and no permanent lock state remains.

## Affected Users

- People who continue a Run from the Codex Companion card ("Run fortsetzen", "Freigabe prüfen").
- People and agents who continue a Run in Codex chat with an ordinary `continue_delivery`.
- Maintainers who would otherwise have to recover a Run reported as already running or pending.

## 3. Scope

- `packages/core/lib/companion/codex-continuation.js`: keep reserve, publish, cancel and the claim of a published attempt; bound the lifetime of reserved and pending records; let the attempt claim consume the pending record exactly once; remove the `running` phase, owner tokens, turn association and turn settlement (`associateTurn`, `observeRunning`, `settleRunning`, `settleTurn`); remove finished and expired records.
- Companion status: "running" is derived from the Codex activity lease for the shown Run instead of an admission record; whether a reservation is refused while that lease shows work is decided in SD.
- `packages/cli/lib/mcp-dispatch-runtime.js`: an ordinary Codex `continue_delivery` passes without admission; only a dispatch that names a Companion `continuation_attempt_id` claims that attempt; no owner in `work_admission`; the stop texts are reduced to the cases that remain.
- Remove `continuation_owner` from the dispatch contract (`packages/core/lib/skill-dispatch/contract.js`), from the owner-bound `resume_call` (`mcp-continuation.js`) and from prepared next calls (`prepared-control-calls.js`); remove `observeContinuation` from `codex-activity.js`.
- Align the Codex continuation qualification observations (`CODEX_CONTINUATION_OBSERVATIONS` in `plugin-provenance.js`) with the new behavior as decided in SD.
- Update the affected tests: Core admission test, MCP server Companion continuation test, dispatch function contract test, control-ui unit and browser continuation cases.
- Derived artefacts this change requires: Copilot payload baseline, host compatibility record.
- Merge the result upward into PR #85 and PR #86.

## 4. Non-Goals

- No change to approval semantics: the Companion still never records an approval.
- No change to the Codex activity lease itself (event handling, `codexTurnBound`, liveness); it is only read.
- No new Companion card flow; card texts change only where a state disappears or gets a different source.
- No native re-qualification on a real Codex host within this run.
- No change to the Claude Companion or the event journal.
- No merge of PR #84, #85 or #86.
- The code of run-5fbcb71f is not reused as a whole; it is discarded and that run is closed as superseded.

## 5. Acceptance Signals

- A test shows that two Companion reservations in two processes yield exactly one send permit, and an unrelated Run stays free.
- A test shows that a reserved and a pending record become available again after their bound and are removed, without any file limit.
- A test shows that the claim of a published attempt succeeds once and a repeated claim of the same attempt does not start a second continuation.
- A test shows that an ordinary Codex `continue_delivery` is not refused while a Companion handoff is pending or while Codex works on the Run, and that a concurrent stale canonical write is still rejected by its revision check.
- A test shows that the Companion reports "running" when the activity lease shows work on the shown Run and "ready" when it does not.
- The dispatch contract and the returned `resume_call` contain no `continuation_owner`; the contract test covers it.
- The existing Core, MCP server, control-ui and compatibility suites pass.

## 6. Existing Source Of Truth

- `packages/core/lib/companion/codex-continuation.js` (admission records and transitions).
- `packages/core/lib/companion/codex-continuation-binding.js` (Companion start eligibility).
- `packages/core/lib/companion/codex-activity.js` and `packages/core/lib/companion/activity.js` (activity lease, `readCodexObservation`, `matchesActivity`).
- `packages/core/lib/control-inspect/cockpit-session.js` (Companion `continue` operations and `companion_observation`).
- `packages/cli/lib/mcp-dispatch-runtime.js` (`admitCodexContinuation`, `stopCodexContinuation`).
- `packages/core/lib/skill-dispatch/contract.js`, `packages/core/lib/skill-dispatch/mcp-continuation.js`, `packages/core/lib/control-state/prepared-control-calls.js` (owner chain).
- `packages/core/lib/runtime/plugin-provenance.js` (qualification observations).
- `packages/control-ui/src/mcp/companion-continuation.ts`, `packages/control-ui/src/mcp/CompanionContinuationAction.tsx`, `packages/control-ui/src/mcp/CompanionCard.tsx`.
- Tests: `packages/core/test/codex-continuation-admission-test.js`, `packages/mcp-server/test/companion-continuation.test.js`, `packages/cli/scripts/skill-dispatch-function-contract-test.js`, `packages/control-ui/test/browser/companion-continuation-cases.mjs`, `packages/control-ui/test/browser/companion-continuation-fixture.mjs`.
- Review findings of 2026-11-27 on PR #84, the superseded run-5fbcb71f, and the contract text change chain (Copilot payload baseline, eval fingerprints, `npm run build:prepare`, `npm run compatibility:record`).

## 7. Risks And Unknowns

- Bounds for reserved and pending records must be decided (proposal: about 2 minutes reserved, about 10 minutes pending).
- How the Companion maps the activity lease to its states must be decided: match on Run and current gate as the card does today, whether the "stopping" state stays, and whether a reservation is refused while Codex works.
- Without trusted Companion hooks the activity lease is unknown; the Companion then cannot show that Codex works, and a handoff may overlap with chat work. Consistency still holds through the revision check, but duplicate work is possible and must be stated.
- Admission records written by the PR #84 format (phase `running`, owner, turn) may exist in a plugin data folder; their treatment must be decided.
- Removing `continuation_owner` changes the public dispatch schema and the contract text chain; existing native qualification evidence no longer matches and the observation list changes.
- The branch is the base of PR #85 and PR #86; baseline and compatibility conflicts have to be resolved again when merging upward.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, Brownfield Review decides the delivery route.

## AGDF Approval Summary (de; source=en)

- Ziel: Die Codex-Fortsetzung aus dem Begleiter schützt nur noch die Übergabe selbst (ein Sendeschein pro Run, mit Ablaufzeit), gewöhnliche Fortsetzungen werden nie gesperrt, und „Codex arbeitet“ kommt aus dem vorhandenen Aktivitätsnachweis.
- Problem: Die Sperre aus PR #84 gilt für jede Codex-Fortsetzung, verfällt nie, braucht eine Owner-Kette durch Schema, Folgeaufrufe und Hooks und hält den Agenten bei seiner eigenen Arbeit auf; der Reparaturversuch run-5fbcb71f hat das Konstrukt nur vergrößert.
- Betroffene: Wer einen Run aus der Codex-Begleiterkarte oder im Codex-Chat fortsetzt, und wer einen fälschlich gesperrten Run sonst freibekommen müsste.
- Umfang: Zulassung nur für Reservieren, Senden und Abholen der Begleiter-Übergabe mit Ablaufzeiten und Aufräumen; Laufzustand aus dem Aktivitätsnachweis; gewöhnliche Fortsetzungen ohne Zulassung; Owner-Kette und Hook-Zuordnung entfernt; Qualifizierungsliste angepasst; Tests, Payload-Baseline und Kompatibilitätsnachweis; Nachziehen von #85 und #86.
- Nicht-Ziele: keine Änderung an Freigaben oder am Aktivitätsnachweis selbst, kein neuer Kartenablauf, keine native Neuqualifizierung, kein Claude-Begleiter, kein Merge; der Code von run-5fbcb71f wird verworfen.
- Abnahmesignale: Tests für einen Sendeschein über zwei Prozesse, Ablauf und Entfernen von Einträgen, einmaliges Abholen, keine Sperre gewöhnlicher Fortsetzungen bei weiter greifender Revisionsprüfung, Laufanzeige aus dem Aktivitätsnachweis, kein `continuation_owner` mehr; bestehende Suiten grün.
- Quellen: `codex-continuation.js`, `codex-continuation-binding.js`, `codex-activity.js`, `activity.js`, `cockpit-session.js`, `mcp-dispatch-runtime.js`, `contract.js`, `mcp-continuation.js`, `prepared-control-calls.js`, `plugin-provenance.js`, die Begleiter-Komponenten und die zugehörigen Tests.
- Risiken: Ablaufzeiten, Zuordnung des Aktivitätsnachweises (inklusive „Abbruch angefordert“) und Umgang mit alten Sperrdateien sind im SD festzulegen; ohne vertrauenswürdige Hooks ist doppelte Arbeit möglich, aber keine inkonsistente; das Dispatch-Schema ändert sich, der native Qualifizierungsnachweis passt danach nicht mehr; #85 und #86 müssen erneut nachgezogen werden.
- Nächster Schritt: UR prüfen und mit `Approval: UR` freigeben; danach Brownfield Review und Festlegung der Lieferform.