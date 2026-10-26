# T-004 Evidence: Companion Host Adapter

Run: `agdf-begleiter-companion-20261025-01`
Task: T-004 (SDD-07, SDD-08, SDD-10; formal suites follow in T-006, native and live evidence in T-009)
Recorded: 2026-10-26
Result: done

## Changes

Under `plugins/agdf/host-templates/claude/companion/`:

- `hooks.json`: `{ "modules": ["./register.mjs"] }`.
- `persistence.mjs` (SDD-07):
  - `pluginDataDir` mirrors `claudePluginDataRoot`: `CLAUDE_CONFIG_DIR`, otherwise the user profile or home `.claude`, then `plugins/data/agdf-agdf`.
  - The `companion-state.json` schema is `schema_version` 1 with `enabled`, `still` and `selections` keyed by project root. Invalid content reads as the defaults.
- `register.mjs`, the host adapter:
  - `/agdf-companion` is registered at `session.start` with a localized description and `immediate: true`. It toggles `enabled`, persists it, then opens the pane with the localized title and starts refreshing, or closes the pane and stops refreshing.
  - Choices are written only when the AGDF plugin data directory already exists; otherwise they last for the session. `$.store` is not used. The state file is the module's only write.
  - Refresh runs at `session.start` when enabled, after each main-loop `turn.complete`, on "Neu lesen" and every 30 s. It reads through `$.fs.exists`, `$.fs.list` and `$.fs.read`. A transient failure keeps the last snapshot, marked stale.
  - Main-loop `turn.start` (no `agentId`) shows läuft; subagent turns are ignored.
  - A remembered selection whose run is neither open nor unreadable is dropped.
  - Closing the pane with its own close mark (`ui.close`, origin `person`) hides it for the session only.
  - The pane is built from the surface table with the global `h`:
    - on desktop: the `Svg` figure (`isInteractive` unless still), state label, reason, gate bar sized to `bodyColumns`, run identity and origin, a one-line objective with a toggle, the next step, stepping or a list of up to six open runs, a stale note, the still and retry buttons, and the last read time;
    - in the terminal: `terminalText` with the same actions.
  - Every gating-capable registration carries `.catch` that passes the event on. Each hook body also catches its own errors, and a failed render draws one neutral line.
  - Session state is held in the module, which the host loads once per session, and redrawn through `$.ui.invalidate`. This avoids a `$.state` contract, so the Claude manifest needs no `types` entry.

### Deviations From The SD Wording

- The project root comes from `$.session.root()`, not `$.session.cwd()`. The root stays fixed for the session, while a subagent or worktree may change the working directory. It is used for display and as the selection key only, never as target authority.

## Verification

- Native: `claude plugin validate` (Claude Code 2.1.302) on a scratch plugin wired exactly as the runtime manifest (`"hooks": "./companion/hooks.json"`) passed. Its listing:
  - hooks: `session.start`, `command.run{command=agdf-companion}`, `turn.start`, `turn.complete`, `ui.close{id=agdf-companion}`, `ui.render{component=Pane, requestId=agdf-companion}`;
  - gating-capable hooks `command.run` and `ui.close` both carry `.catch`;
  - calls: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.env.get`, `$.fs.exists`, `$.fs.list`, `$.fs.read`, `$.fs.write` (via `persist` only), `$.session.root`, `$.ui.close`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`;
  - env reads: `CLAUDE_CONFIG_DIR`, `HOME`, `USERPROFILE`; env writes: nothing.
  - Remaining warning: the scratch manifest has no author. The real runtime manifest has one.
- The first validation refused `register` exported as the result of a factory call. The adapter now exports `register` as a function literal and passes its file access as wrappers that call `$.fs.*` directly.
- Node fake-host check against this repository's 145 run states (module loaded fresh per session):
  - off by default: the command is registered with the German description, no pane opens, nothing is written;
  - switching on persists `enabled`, opens "AGDF-Begleiter" and starts the 30 s timer;
  - with no change in the session the pane shows "Kein Run zugeordnet" with six run buttons;
  - selecting a run persists it per project and shows "Von dir ausgewählt" with stepping;
  - the gate bar fits 40 columns;
  - a main-loop turn shows läuft, a subagent turn does not, and completion returns to the run-derived state;
  - the still pose persists and removes all animation;
  - the terminal text carries the gate glyphs and the next step;
  - the person's close stops the timer; switching off persists and closes the pane;
  - a new session reopens the pane and keeps the selection;
  - a failing list keeps the last run with the stale note;
  - a failing `session.start` still passes its event on and registers nothing;
  - a missing data directory leads to no write and no directory created;
  - all writes went to `companion-state.json` and none under `.agdf/control`.
- After the view change, the T-003 checks still pass (145 runs readable, 57 open, no-run state). `public-plugin-test` passes with the unchanged public candidate.

## Not Yet Covered

The companion is not yet copied into the generated runtime plugin (T-005). `claude plugin test`, the installed-build check and the live desktop session follow in T-009.
