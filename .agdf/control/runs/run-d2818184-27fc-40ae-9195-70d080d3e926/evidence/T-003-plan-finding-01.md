# T-003 plan finding: run-view command needs a run selector

- run_id: run-d2818184-27fc-40ae-9195-70d080d3e926
- phase: CD+Tests (T-002 done, T-003 in progress)
- reviewer: Claude (agent analysis for Arndt Gold)
- date: 2026-11-05

## Finding

The approved TP (sha256:fed031ff19c38edaba33e0c63cf8a8090b2792e406b439390842345681b14780) is internally inconsistent:

- SCN-002 expects the spawned `run-view` command to print the status card fields for F01 to F13.
- T-002 summarizes terminal runs without evaluating them (F06 and F07 are completed), and with an unsupported control layout (F09) the run inventory lists no runs.
- The Planning Decision "Run-view command shape" fixes the flags to `--dir`, `--json` and `--language`, so the command cannot request a terminal run or a run behind an unreadable store.

`readRunView(root, { runIds })` already evaluates explicitly requested runs (SCN-001, `packages/core/test/companion-run-view-test.js`). The companion also needs this to show a selected completed run in full.

## Owner decision

2026-11-05 Arndt Gold chose "TP-Revision mit --run": the command gets an optional repeatable `--run ID` selector, SCN-002 uses it for the fixture run, SD stays unchanged.
