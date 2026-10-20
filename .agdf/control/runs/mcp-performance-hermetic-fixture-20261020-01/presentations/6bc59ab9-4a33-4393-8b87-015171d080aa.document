# UR: Hermetic control fixture for the MCP performance test

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-20
Owner: Arndt Gold

## 1. Problem

The CI partition "CI / MCP · Win22" repeatedly fails `packages/mcp-server/test/performance.test.js`
on warm `agdf_dispatch` p95 just above the approved 1000 ms budget (PR #22: 6bf406ec 1043 ms,
258b6635 1007 ms), while the same code passes on other runs (main 613-967 ms, other branches
895-947 ms). An interleaved in-process A/B showed no code difference, so the failures are not caused
by the change under test.

The analysis of 2026-10-19 (side-session notes `mcp-performance-test-flakiness-analysis.md`) found
the structural cause. The test fixture (`createOwnedRuntimeFixture` in
`packages/mcp-server/test/owned-runtime.js`) copies the entire repository `.agdf/control` (137 runs,
9,365 files, 337 MB on a8a867a3) into the governance target. Every warm dispatch walks that whole tree
(`assertMcpControlReadBoundary`) and reads every run state (`discoverRuns`), so control evaluation
grows linearly with the repository's run history: about 90 ms with only the target run versus about
345 ms with all runs on a Windows 11 machine. When the budget was set (SD AD-15 of run
`agdf-mcp-dispatch-server`, 2026-09-06) the control held 83 runs and 1,168 files and warm p95 was
324 ms. The measured work also depends on control content outside the target run: the legacy
projection `.agdf/control/AGDF_RUN.md` points to another run, and removing that run changes the
gate-check blocking reason. A partially committed run on main (a8a867a3) already broke other tests that
copy the same control.

## 2. Goal

The MCP performance test measures the approved budgets on a fixed, recorded fixture that does not grow
with the repository's run history and does not depend on unrelated runs, so that its result reflects
the dispatch path and runner variance only. The budgets stay unchanged.

## Affected Users

- AGDF maintainers and contributors whose pull requests run the AGDF Guardrails CI.
- The owner, who decides performance budgets and reads the recorded evidence.

## 3. Scope

- Give `test:performance` a hermetic governance target that contains exactly the run
  `agdf-mcp-dispatch-server` (its `runs/` and `artefacts/` directories) plus the control root files,
  without the legacy projection `AGDF_RUN.md`. The owner chose this option (Option A) on 2026-10-19.
- Keep both budgets unchanged: cold `tools/list` p95 <= 1500 ms and warm `agdf_dispatch`
  p95 <= 1000 ms over 20 runs.
- Record the fixture size (runs, files, bytes) in the test's evidence line, as SD AD-15 requires.
- Keep the default behavior of `createOwnedRuntimeFixture` unchanged for all its other consumers.

## 4. Non-Goals

- Changing either budget, introducing per-OS budgets or a relative regression check.
- Changing product code: MCP server, worker, dispatcher, provenance checks, control evaluation or
  read-boundary behavior. Reducing the per-dispatch cost itself is a separate follow-up.
- Changing the control fixture of any other test.
- Repairing or migrating `agdf-mcp-dispatch-server` or any other run's control state.
- Committing a duplicated copy of the control files as a static fixture.

## 5. Acceptance Signals

- The performance test's governance target contains only the target run and the control root files
  without `AGDF_RUN.md`, independent of how many runs the repository holds.
- The gate-check result for the target run on the hermetic fixture is identical in content (excluding
  timing, paths and runtime evidence) to the result on the full repository control.
- The evidence line records runs, files and bytes of the fixture next to the raw samples.
- Both budgets are unchanged and the test passes repeatedly on the local Windows machine.
- All other consumers of `createOwnedRuntimeFixture` still receive the full repository control.

## 6. Existing Source Of Truth

- `packages/mcp-server/test/performance.test.js`: the budget assertions and evidence line.
- `packages/mcp-server/test/owned-runtime.js`: `createOwnedRuntimeFixture`, shared by 13 other
  consumers in `packages/mcp-server/test`, `packages/control-ui/test` and `scripts`.
- `.agdf/control/artefacts/agdf-mcp-dispatch-server/SD.md` AD-15: approved budgets, "on the same
  fixture", and the duty to record fixture size.
- `packages/core/lib/control-evaluation/doctor.js`: legacy projection drift check for `AGDF_RUN.md`.
- `scripts/ci-plan.mjs`: serial execution of the performance test inside its CI partition.

## 7. Risks And Unknowns

- The hermetic fixture deliberately stops measuring how dispatch latency grows with a long run
  history. That product signal moves to the proposed follow-up on per-dispatch cost.
- The test still depends on the content of the target run and the control root files; they change
  rarely (the target run last changed on 2026-09-06), but a future migration of that run changes the
  measured work.
- CI runner variance remains; the expected effect on Win22 is roughly 250-340 ms lower warm p95, to be
  confirmed by CI after the change.
- Brownfield Review must confirm the smallest fixture option shape and that no other consumer relies on
  the performance test's fixture.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- Problem: Der CI-Job „CI / MCP · Win22“ scheitert wiederholt an `test:performance`, weil der warme `agdf_dispatch`-p95 knapp über dem freigegebenen Budget von 1000 ms liegt (PR #22: 1043 ms und 1007 ms), während derselbe Code in anderen Läufen besteht. Ursache ist die Fixture: Sie kopiert die gesamte Repository-Control (137 Runs, 9.365 Dateien, 337 MB). Jeder Dispatch läuft über diesen ganzen Baum und liest alle Run-Zustände, daher wächst die Messung linear mit der Run-Historie (etwa 90 ms nur mit dem Ziel-Run gegenüber etwa 345 ms mit allen Runs). Bei der Festlegung des Budgets am 2026-09-06 gab es 83 Runs und warm p95 324 ms. Zusätzlich hängt das Ergebnis von fremdem Control-Inhalt ab, etwa der Legacy-Projektion `AGDF_RUN.md`.
- Ziel: Der Performance-Test misst die freigegebenen Budgets auf einer festen, dokumentierten Fixture, die nicht mit der Run-Historie wächst und nicht von fremden Runs abhängt. Die Budgets bleiben unverändert.
- Betroffene: AGDF-Maintainer und Beitragende, deren Pull Requests die AGDF-Guardrails-CI durchlaufen, sowie der Owner, der Budgets entscheidet und die Evidenz liest.
- Umfang: `test:performance` erhält ein hermetisches Governance-Ziel mit genau dem Run `agdf-mcp-dispatch-server` (Run- und Artefaktverzeichnis) und den Control-Wurzeldateien ohne `AGDF_RUN.md` (Owner-Entscheidung Option A vom 2026-10-19). Budgets bleiben bei cold p95 1500 ms und warm p95 1000 ms über 20 Läufe. Die Fixture-Größe (Runs, Dateien, Bytes) wird in der Evidenzzeile festgehalten. Alle anderen Nutzer von `createOwnedRuntimeFixture` erhalten weiterhin die volle Repository-Control.
- Nicht-Ziele: Keine Budgetänderung, keine OS-spezifischen Budgets, kein relativer Regressionsvergleich. Keine Änderung am Produktcode (MCP-Server, Worker, Dispatcher, Provenance, Control-Auswertung, Read Boundary); die Senkung der Dispatch-Kosten ist ein eigener Folgeschritt. Keine Änderung anderer Test-Fixtures, keine Reparatur von Run-Zuständen, keine statische Kopie der Control-Dateien im Repository.
- Abnahme: Das Governance-Ziel des Tests enthält nur den Ziel-Run und die Wurzeldateien ohne `AGDF_RUN.md`, unabhängig von der Zahl der Runs im Repository. Das gate-check-Ergebnis für den Ziel-Run ist inhaltlich identisch mit dem auf voller Control (ohne Zeiten, Pfade und Runtime-Evidenz). Die Evidenzzeile enthält Runs, Dateien und Bytes. Beide Budgets sind unverändert und der Test besteht wiederholt auf dem lokalen Windows-Rechner. Die übrigen Fixture-Nutzer bleiben unverändert.
- Quellen: `packages/mcp-server/test/performance.test.js`, `packages/mcp-server/test/owned-runtime.js` mit 13 weiteren Nutzern, SD AD-15 des Runs `agdf-mcp-dispatch-server` (Budgets und Pflicht zur Angabe der Fixture-Größe), die Drift-Prüfung der Legacy-Projektion in `packages/core/lib/control-evaluation/doctor.js` und die serielle Ausführung in `scripts/ci-plan.mjs`.
- Risiken: Der Test misst bewusst nicht mehr, wie die Dispatch-Latenz mit der Run-Historie wächst; dieses Produktsignal gehört zum vorgeschlagenen Folgeschritt. Der Test hängt weiter vom Inhalt des Ziel-Runs und der Wurzeldateien ab, die sich selten ändern. Die Streuung der CI-Runner bleibt; erwartet sind auf Win22 etwa 250 bis 340 ms weniger warm p95, was die CI nach der Änderung bestätigen muss. Das Brownfield Review klärt die kleinste Form der Fixture-Option.
- Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben.
