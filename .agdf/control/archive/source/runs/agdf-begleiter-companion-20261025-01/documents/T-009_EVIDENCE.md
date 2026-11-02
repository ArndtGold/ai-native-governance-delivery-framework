# T-009 Evidence: Native and Live Checks

Run: `agdf-begleiter-companion-20261025-01`
Task: T-009 (scenarios SCN-002, SCN-004, SCN-012, SCN-019, SCN-022)
Recorded: 2026-10-26, Windows 11, Claude Code 2.1.302 (CLI and desktop app Code tab)
Participants: Arndt Gold (live desktop session and screenshots); Claude Code implementing agent (setup, harness and checks)
Result: pass, with findings F1 to F5

## Native (SCN-022)

- `claude plugin validate packages/cli/generated/plugins/agdf` passed without warnings. It lists:
  - hooks: `session.start`, `command.run{command=agdf-companion}`, `turn.start`, `turn.complete`, `ui.close{id=agdf-companion}`, `ui.render{component=Pane, requestId=agdf-companion}`;
  - `.catch` on both gating-capable hooks;
  - env reads: `CLAUDE_CONFIG_DIR`, `HOME`, `USERPROFILE`.
- `claude plugin test` passed 2 of 2 on a scratch copy of the generated runtime plugin. The test file and its generator stay outside the plugin payload. The test file embeds the real `locales.json`, the real interaction locale registry and run states written by the canonical writers. Each `$` call is answered by the test, and the engine validates every drawn tree against the surface's element table.
  - Test 1 covers, in order:
    - off by default and the German command description registered;
    - `/agdf-companion` switching on and persisting `companion-state.json` in the plugin data directory;
    - the desktop pane drawing the no-run state with an Svg;
    - pressing a run, then drawing "Von dir ausgewählt", "wartet auf Freigabe" and the gate bar `●UR ○PRD ○SD ○TP ○QA ○UAT ○OR`;
    - the still pose persisting;
    - the terminal text without Svg;
    - vscode and mobile trees validating;
    - switching off closing the pane;
    - writes going only to the state file.
  - Test 2: unreadable plugin data leaves `session.start` to the engine and registers nothing; the pane draws a neutral line.

## Installation

- `node packages/cli/bin/create-agdf.js claude --json` ran outside the desktop app package (via `explorer.exe`) against the real Claude configuration and returned:
  - `result: success`;
  - `plugin.operation: update`;
  - verification `healthy` with `staged_installation_provenance:matched` and `installation_verification:matched`;
  - `restart.required: true`.
- `claude plugin list` shows `agdf@agdf` 0.20.1 enabled from the AGDF marketplace. `claude mcp list` shows `plugin:agdf:agdf` connected.
- The installed `.claude-plugin/plugin.json` declares `"hooks": "./companion/hooks.json"`, and the 12 companion files are present in the marketplace root and the plugin cache.
- A CLI session in the live project logged:
  - `hooks module agdf@agdf loaded (worker, environment 2, tier user)`;
  - `$.command.register (agdf): /agdf-companion listed`.
- Sent `/agdf-companion` twice: on, then off, persisted in the real data directory.

## Live Desktop Session (SCN-002, SCN-004, SCN-019)

Setup: the live project `C:\Workspace\agdf-companion-live` (git, `create-agdf init --language de`) holds four runs written by the canonical writers and the core test builders:

- `live-laeuft`: created, drafting the UR.
- `live-wartet`: canonical `ur` step, exact `Approval: UR` pending.
- `live-blockiert`: decision `revise`.
- `live-fertig`: lifecycle `completed`.

During the session, a harness marked one run at a time as changed (`updated_at` now, sealed). Screenshots are stored in `live/`.

| Screenshot | Observation |
|---|---|
| `01-no-run-real-repository.png` | In this repository with 57 open runs and no change in the session: neutral figure "bereit", "Kein Run zugeordnet", hint, six open runs to choose; no guessing (AC-004). |
| `02-no-run-live-project.png` | Live project: the same no-run state with exactly the three open test runs, newest first. |
| `03-laeuft.png` | Blue figure with the dots beside the head; "läuft", "Nutzeranforderungen in Arbeit"; gate bar on one line; "live-laeuft", "In dieser Sitzung geändert"; one-line objective with "Mehr"; next step. |
| `04-wartet.png` | Orange figure; the hourglass stands free beside the head (panel finding 2 fixed); "Freigabe ausstehend: Nutzeranforderungen"; next step as the German status-card value. |
| `05-blockiert.png` | Red figure with X eyes and the stop sign beside it; "Nutzeranforderungen: Überarbeitung nötig". |
| `06-fertig.png` | Green figure with check and sparkles beside it; "Run abgeschlossen"; all gates checked; no next step; a run completed in the session stays assigned (owner decision). |
| `07-fertig-refreshed.png` | The read time advanced from 13:04 to 13:05 without other changes. |
| `08-still-after-turn.png` | After the main-loop turn "OK.", the panel is back at "fertig" (13:08). "Bewegung an" is shown and `still: true` is stored. |
| `09-off-closed.png` | `/agdf-companion` reports "AGDF-Begleiter ausgeschaltet." and the panel is closed; `enabled: false` is stored. |
| `10-on-again-still.png` | Switched on again: the panel returns and the still pose is kept. |
| `11-new-session-auto-open-still.png` | A new session in the live project with only "Hallo": the panel opens by itself, in the still pose, with "Kein Run zugeordnet" and three open runs (SCN-002). |

- At the default docked width, the gate bar, state, reason and next step are readable without wrapping or cutting (SCN-004).
- The four states render without overlap (SCN-019).
- All labels are German. Only the objective (artefact language) and next steps without a status-card value stay English.

## Byte Identity (SCN-012, AC-007)

`live/harness-ledger.json` records the SHA-256 of all four run states after each harness write: setup at 11:46:40Z, then touches at 12:00:45Z, 12:01:56Z, 12:02:51Z and 12:03:34Z.

- Before each touch, the check found no change since the previous harness write.
- The final check at about 12:12Z found no change since 12:03:34Z.

In between, the companion read the run states in three desktop sessions, after several turns, on every "Neu lesen" and on the 30-second timer. It wrote nothing to them.

## Findings

- F1: The desktop app's slash-command menu does not list `/agdf-companion`; typed in full and sent, it works. Documented in INSTALL.md.
- F2: The short switch to "läuft" during the main-loop turn was not observed live; the turn was too quick to catch.
  - The return to the run-derived state after the turn was observed.
  - The turn overlay is covered by the adapter suite and `claude plugin test`.
  - The installed module's `turn.start` hook ran (debug log "turn.start settled").
  - INSTALL.md says so.
- F3: Next steps without a status-card value stay in their English source text (for example "Draft the UR."), as AC-005 specifies.
- F4: On Windows the engine passes `$.fs` paths with backslashes. The companion only passes paths on, so it is unaffected; the native test normalizes them.
- F5: `create-agdf claude` in a development checkout regenerates the shared runtime plugin for the Claude surface, which adds the existing `agdf-cockpit` MCP declaration. The source snapshot then drifts until the next `npm run build:prepare`; after that, `compatibility:check` passed again.
  - The installed copy differs from the all-surface build only in `mcp/claude.mcp.json` (cockpit) and the installer-written Codex manifest and `mcp.json`.
  - The companion files and the Claude manifest are byte-identical.
  - This is existing AGDF behaviour, not caused by the companion.

## Documentation Follow-up

INSTALL.md now also states:

- the slash-menu limit;
- `claude plugin test` and the desktop app on 2.1.302 in the observed range;
- the dated live result, including what was not observed.

`community-health-test`, `cli-modularization-test` and, after `build:prepare`, `compatibility:check` pass.

## Remaining Cleanup (outside this run's deliverable)

- The earlier prototype `agdf-begleiter@agdf-begleiter-test` is still installed in local scope (disabled).
- The live project `C:\Workspace\agdf-companion-live`, git-ignored probe results and scratch files remain on disk.
