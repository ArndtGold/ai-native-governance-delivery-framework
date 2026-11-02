# UR: Compact closeout after a CLI-recorded Code Review

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-20
Owner: Arndt Gold

## 1. Problem

In run `mcp-performance-hermetic-fixture-20261020-01` (2026-10-20, Compact Delivery, installed AGDF
0.14.5 on Windows) the mandatory Code Review was recorded with the documented CLI step
`run-step --step review --decision pass --evidence TEXT --source FILE`. The CLI step writes the
`CR` row of the run's Artefacts table with status `done` but an empty path; `--source` only appears in
the Evidence row. Gate-check itself then reports the next operation `record_closeout`, but the
following `gate-check` dispatch with `continue_delivery` fails with `evaluator_error`
(`dispatch_control_evaluation_failed`, "Gate-Auswertung reparieren und einmal erneut versuchen").
The cause is `compactContinuation` in `packages/core/lib/skill-dispatch/compact-continuation.js`: for
the compact closeout it reads the registered CR file and throws when the CR row has no path.

The CLI lane without a registered review file is supported elsewhere: `packages/core/test/control-state-test.js`
records a Quick Task review without `--source` and closes the run with `run-step --step closeout`.
Only the dispatcher's closeout continuation rejects that state, so every Compact Delivery run that
records its Code Review through the CLI dead-ends at closeout with a generic repair message. The
workaround (re-recording the review through MCP `agdf_record` with a bound source) is not
discoverable from the recovery text and cost an extra user round trip.

## 2. Goal

After a Code Review recorded through the CLI step, `gate-check` with `continue_delivery` returns the
regular compact closeout continuation for `release-or`, so the run can be closed without a workaround.
Fail-closed behaviour for registered sources that are missing, replaced or redirected stays unchanged.

## Affected Users

- Users and coding agents running Compact Delivery (`quick_task`) runs through the CLI binding on any
  host.
- AGDF maintainers who rely on the dispatcher's fail-closed source binding.

## 3. Scope

- The compact closeout continuation accepts a `done` Code Review whose Artefacts row has no registered
  path, which is what the CLI review step writes, and returns the `release-or` closeout continuation
  without a CR source binding.
- A Code Review with a registered path keeps its current binding: missing, symlinked or otherwise
  invalid registered files still fail closed.
- Regression tests: the actual CLI lane (CLI review step, then dispatch with `continue_delivery`,
  then CLI closeout) and the dispatcher boundary for an unregistered versus a broken registered CR.

## 4. Non-Goals

- Changing the CLI review step, its flags or its output, or registering `--source` as an artefact path.
- Changing gate policy, Code Review obligations, closeout readiness, run seals or the MCP
  `agdf_record` and `closeout.record` paths.
- Changing structured routes or the `verified_change` closeout.
- Releasing or reinstalling AGDF; the installed 0.14.5 runtime keeps the defect until a release.

## 5. Acceptance Signals

- In a disposable repository, a Quick Task run whose Code Review was recorded with the CLI review step
  gets `phase: compact_closeout` with `skill_id: release-or` from `gate-check` with
  `continue_delivery`, and its CLI closeout then completes the run.
- The closeout continuation for that run lists UR and Brownfield Review sources but no CR source.
- A CR row with a registered path whose file is missing or a symlink still yields `evaluator_error`.
- Existing compact continuation, quick closeout, control-state and run-step tests pass unchanged.

## 6. Existing Source Of Truth

- `packages/core/lib/skill-dispatch/compact-continuation.js`: compact continuation translation and
  source binding.
- `packages/core/lib/control-state/run-steps.js`: CLI review step (`review` branch) and Quick Task
  closeout (`closeout` branch, requires CR `done`).
- `packages/core/lib/control-evaluation/gate-policy.js`: decides `record_closeout` for Compact Delivery.
- Tests: `packages/cli/scripts/compact-continuation-test.js`, `packages/core/test/quick-closeout-command-test.js`,
  `packages/core/test/control-state-test.js`, `packages/core/test/run-step-transaction-test.js`.
- Memory of the incident: run `mcp-performance-hermetic-fixture-20261020-01` (CODE_REVIEW.md re-recorded
  via `agdf_record`).

## 7. Risks And Unknowns

- A CR row without a path could also result from a manual edit; such edits change the run's content
  seal, which gate-check reports as a blocking reason before any continuation is built. Brownfield
  Review must confirm this.
- The `release-or` skill receives no CR source in this lane; the Code Review result remains visible
  only through the Evidence row. Brownfield Review must confirm that the closeout writers do not need
  more.
- The fix reaches users only after the next AGDF release and reinstall.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- Problem: Im Run `mcp-performance-hermetic-fixture-20261020-01` wurde das Pflicht-Code-Review mit dem dokumentierten CLI-Schritt `run-step --step review` aufgezeichnet. Der Schritt schreibt die CR-Zeile mit Status `done`, aber ohne Pfad. Gate-check meldet danach `record_closeout`, doch der folgende Dispatch mit `continue_delivery` scheitert mit `evaluator_error` („Gate-Auswertung reparieren und einmal erneut versuchen“), weil `compactContinuation` beim Compact-Closeout die registrierte CR-Datei lesen will und bei leerem Pfad abbricht. Der CLI-Weg ohne registrierte Review-Datei wird an anderer Stelle ausdrücklich unterstützt; nur die Closeout-Fortsetzung lehnt ihn ab. Jeder Compact-Delivery-Run mit CLI-Review endet so in einer Sackgasse; der Umweg über `agdf_record` ist aus der Meldung nicht erkennbar.
- Ziel: Nach einem per CLI aufgezeichneten Code Review liefert `gate-check` mit `continue_delivery` die reguläre Closeout-Fortsetzung für `release-or`. Das Fail-closed-Verhalten für registrierte Quellen, die fehlen, ersetzt oder umgeleitet sind, bleibt unverändert.
- Betroffene: Nutzer und Coding-Agenten, die Compact-Delivery-Runs über die CLI-Bindung ausführen, sowie AGDF-Maintainer, die sich auf die Fail-closed-Quellbindung verlassen.
- Umfang: Die Closeout-Fortsetzung akzeptiert ein Code Review mit Status `done` ohne registrierten Pfad und gibt die `release-or`-Fortsetzung ohne CR-Quellbindung zurück. Ein CR mit registriertem Pfad behält seine Bindung; fehlende, verlinkte oder ungültige registrierte Dateien scheitern weiterhin. Regressionstests für den echten CLI-Ablauf (CLI-Review, Dispatch mit `continue_delivery`, CLI-Closeout) und für die Grenze zwischen nicht registriertem und defektem registriertem CR.
- Nicht-Ziele: Keine Änderung am CLI-Review-Schritt, seinen Flags oder seiner Ausgabe, keine Registrierung von `--source` als Artefaktpfad. Keine Änderung an Gate-Policy, Code-Review-Pflicht, Closeout-Bereitschaft, Run-Siegeln oder den MCP-Pfaden `agdf_record` und `closeout.record`. Keine Änderung an strukturierten Routen oder am `verified_change`-Closeout. Kein Release und keine Neuinstallation.
- Abnahme: In einem Wegwerf-Repository erhält ein Quick-Task-Run mit CLI-Review von `gate-check` mit `continue_delivery` die Phase `compact_closeout` mit `release-or`, und der CLI-Closeout schließt den Run ab. Die Fortsetzung nennt UR und Brownfield Review als Quellen, aber keine CR-Quelle. Eine CR-Zeile mit registriertem Pfad, deren Datei fehlt oder ein Symlink ist, ergibt weiterhin `evaluator_error`. Die bestehenden Tests zu Compact Continuation, Quick Closeout, Control-State und Run-Step bestehen unverändert.
- Quellen: `packages/core/lib/skill-dispatch/compact-continuation.js`, die Review- und Closeout-Zweige in `packages/core/lib/control-state/run-steps.js`, `packages/core/lib/control-evaluation/gate-policy.js` sowie die Tests `compact-continuation-test.js`, `quick-closeout-command-test.js`, `control-state-test.js` und `run-step-transaction-test.js`.
- Risiken: Eine CR-Zeile ohne Pfad könnte auch durch manuelles Editieren entstehen; das verletzt das Inhaltssiegel, das gate-check vor jeder Fortsetzung als Blocker meldet. Das Brownfield Review bestätigt das. `release-or` erhält in diesem Weg keine CR-Quelle; das Review-Ergebnis bleibt nur über die Evidence-Zeile sichtbar. Der Fix erreicht Nutzer erst mit dem nächsten AGDF-Release.
- Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben.
