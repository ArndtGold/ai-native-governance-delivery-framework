# T-002 design finding: pure split size and node-side alternative

- run_id: run-d2818184-27fc-40ae-9195-70d080d3e926
- phase: CD+Tests (T-002 not started; no source change)
- reviewer: Claude (agent analysis for Arndt Gold)
- date: 2026-11-05

## Measured size of the approved pure split

- The static import closure of `packages/core/lib/control-evaluation/gate-check.js` has 82 modules; 34 import Node directly (4,872 lines), for example `run-presentation-render.js` (`node:crypto`, `node:util`), `control-read/snapshot.js` (`node:fs`), `owned-file-lock.js`, `run-step-transaction.js`, `preview-render.js` (`node:module`).
- `ur-readiness.js` alone reaches 68 modules; `presentation-decision.js` reads presentation records with `statSync`; the central `digest` uses `node:crypto`.
- A pure status-field path would rework about 25 central modules (run-state preparation, presentation decisions, evidence bindings, QA acceptance, closeout evidence, all readiness checks, the approval-summary validator, next-step selection).

## Host facts

- Claude Code mods run without DOM and without Node; they may use web APIs (URL, TextEncoder, asynchronous `crypto.subtle`) and static imports only (plugin-authoring reference and `claude-code.d.ts`, build 2.1.317).
- Mods may run host commands with `$.process.run(argv, { timeoutMs })` (no shell).
- The plugin's SessionStart hook already starts `node` from PATH (`hooks/hooks.json`).

## Native probe 2026-11-05 (Claude desktop app, this session, Windows 11)

Evidence: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/evidence/T-002-process-probe-01.json`

- `$.process.run` worked in the desktop session (exit code 0 for all calls).
- Minimal node start: 368 ms.
- Node process loading the Core `evaluateGateCheck` and evaluating this run including the doctor: 644 ms and 509 ms (load 124-168 ms, evaluation 221-244 ms).
- Direct measurement outside the mod: load 91 ms, evaluation 171 ms.

## Owner decision

2026-11-05 Arndt Gold chose "Erst Probe, dann SD-Revision": with a positive probe the run view is computed node-side from the unchanged `evaluateGateCheck` report and delivered to the companion through a read-only local command called with `$.process.run`; SD SDD-001, SDD-002, SDD-008 and SDD-010 and the dependent TP tasks change.
