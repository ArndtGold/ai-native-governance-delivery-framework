# QA Report: Lean Codex continuation handoff

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-11-27
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: The Codex continuation admission of PR #84 is replaced by a lean Companion handoff. `packages/core/lib/companion/codex-continuation.js` keeps one version-2 record per target and Run only while a handoff is reserved (2 minutes), published (10 minutes) or just picked up (1 minute); finished, ended, PR #84 and aged unreadable records disappear, so no permanent lock state remains. Codex picks a handoff up once with its attempt identity; a repeat, expired or outdated pickup is refused with one chat sentence, and a pickup with nothing to continue ends the handoff. An ordinary Codex `continue_delivery` is never refused by the admission. The Companion shows "Codex arbeitet bereits an diesem Run." from the existing activity lease and offers no start then; the "stopping" state is gone. `continuation_owner`, the owner in `work_admission`/`resume_call` and the hook-side turn association are removed; three files are back at their pre-PR-#84 content. The native qualification observations are renamed to `ordinary_continuation_unblocked` and `running_from_activity`.

All ten TP tasks (T-001 to T-010) are fully done and all thirteen scenarios (SCN-001 to SCN-013) are fulfilled (TP_REVIEW.md). The Code Review found three implementation gaps and one evidence gap (CR-01, CR-03, CR-04, CR-05); all are fixed and re-verified, the three implementation fixes shown failing on the previous code (CODE_REVIEW.md). Clean Implementation Review: pass, no finding.

## 3. Evidence

- `node --test packages/core/test/codex-continuation-admission-test.js`: 7 of 7 pass (two-process permit, pending and lost publication, bounds per phase with a controlled clock, pruning with explicit file times, PR #84 and unreadable records including a far-future file time, single pickup and `release`, cancel and stale publication).
- `node --test packages/mcp-server/test/companion-continuation.test.js`: 3 of 3 pass through the real dispatch and Cockpit runtimes (qualification names; approval handoff once, refusal sentence, terminal pickup releases; ordinary continuations in every handoff state, running from `observeCodexActivity`, ready after Stop, ended own reservation, outdated-revision write rejected).
- `npm --prefix packages/mcp-server test` (all groups incl. safety with the store's single `removeFile`): pass; `test:continuation` and `test:safety` re-run after the CR fixes: pass.
- `npm --prefix packages/cli run test:companion-run-view`: 77 pass after the CR fixes; `test:skill-dispatch` pass (`continuation_owner` rejected by schema and parser); `node --test packages/core/test/cockpit-session-test.js`: 18 of 18.
- packages/control-ui `npm test`: 35 files, 441 tests pass; `npx tsc --noEmit` clean.
- `git diff 6e166cab` on `codex-activity.js`, `prepared-control-calls.js`, `mcp-continuation.js`: empty.
- `npm run build:prepare` pass without Copilot payload growth (baseline unchanged); `npm run compatibility:record` and `npm run compatibility:check` on the final code: 56 scenarios, 0 failed, source fingerprint 7812664f...
- Reviews: TP Review pass (UX Intent Fidelity rows AC-001, AC-002, AC-005, AC-007 fulfilled with rendered component output), Clean Implementation Review pass, Code Review pass with CR-01, CR-03, CR-04 and CR-05 resolved.

## 4. Missing Evidence

- qualification_limits: The browser continuation cases (updated) run only in the native release probe and were checked here by review and `node --check`; no live Codex app was exercised, and the native continuation qualification record no longer matches the changed server and must be recorded again on a real Codex host. `test:cockpit-core` has one failure that is a host limit on this Windows machine, not a result of this change (`cockpit-draft-check-test.js` cannot create a symlink without privilege; the file is untouched). CI on the pull request has not run yet.

## 5. Risks

- delivery_risks: After the 1-minute pickup display only the activity lease holds a new Companion start back; for an approval handoff, agent phases without an activity lease or hosts without trusted Companion hooks a second click can publish a new handoff for the same step (accepted in the PRD; a repeated approval handoff only reopens the decision, repeated agent work stays consistent through the revision check). The public `agdf_dispatch` schema loses `continuation_owner`, which only the unreleased PR #84 introduced. The branch is the base of PR #85 and PR #86, which must merge it again and resolve their payload baseline and compatibility conflicts.

## 6. Required Next Step

Owner decision on this QA report with `Approval: QA`; then UAT and OR.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ergebnis: Die Codex-Fortsetzungssperre aus PR #84 ist durch eine schlanke Begleiter-Übergabe ersetzt: ein Datensatz pro Run nur während Reservierung (2 Minuten), veröffentlichter Übergabe (10 Minuten) und Abholanzeige (1 Minute), danach keine Datei mehr; einmaliges Abholen per Versuchskennung, wiederholtes oder veraltetes Abholen wird im Chat mit einem Satz abgewiesen; gewöhnliche Chat-Fortsetzungen werden nie gesperrt; „Codex arbeitet bereits an diesem Run.“ kommt aus dem Aktivitätsnachweis, „Abbruch angefordert“ entfällt; die Owner-Kette ist entfernt. Alle Tasks T-001 bis T-010 und Szenarien SCN-001 bis SCN-013 sind erfüllt, die vier Code-Review-Befunde behoben und nachgeprüft; alle Suiten des Testplans und `compatibility:check` (56/56) laufen durch.
- Grenzen: Die Browserfälle und die echte Codex-App wurden auf diesem Rechner nicht ausgeführt (Browserfälle nur geprüft und syntaktisch kontrolliert); der native Qualifizierungsnachweis muss auf einem echten Codex-Host neu aufgenommen werden; ein Cockpit-Core-Test scheitert an der Windows-Symlink-Grenze unabhängig von dieser Änderung; die CI des Pull Requests steht noch aus.
- Risiken: Nach der Abholanzeige hält nur der Aktivitätsnachweis einen neuen Start zurück, bei Freigabe-Übergaben oder ohne Hooks ist ein zweiter Klick möglich (in der PRD akzeptiert, Konsistenz über die Revisionsprüfung); das Dispatch-Schema verliert `continuation_owner` aus dem unveröffentlichten PR #84; #85 und #86 müssen den Stand erneut nachziehen.
