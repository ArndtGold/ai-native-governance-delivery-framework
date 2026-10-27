# T-001 Host Probe: Companion Wiring, Isolation and Uninstall

Run: `agdf-begleiter-companion-20261025-01`
Task: T-001 (scenarios SCN-013, SCN-017)
Recorded: 2026-10-25
Result: block (store data retained after uninstall; alternative verified)

## Setup

- Host: Claude Code CLI 2.1.302 on win32/x64, Node v22.22.3, model `claude-haiku-5-5`, launched outside the Claude desktop app package via `explorer.exe`.
- AGDF: 0.20.1 runtime plugin built from the working tree on `feat/agdf-begleiter` (HEAD `c327c50d` plus uncommitted changes). It was installed with `create-agdf claude --json` into an isolated `CLAUDE_CONFIG_DIR` and `AGDF_DATA_DIR` per variant.
- Wiring as SDD-01:
  - the runtime `.claude-plugin/plugin.json` gained `"hooks": "./companion/hooks.json"`;
  - `companion/hooks.json` declares `{ "modules": ["./register.mjs"] }`;
  - the generated plugin was restored right after each install.
- Probe script and raw outputs: `probe-results/companion-t001/` and `probe-results/t1d/` (git-ignored, local only).

## Observations

| Variant | Module | SessionStart command hook | AGDF MCP | agdf_dispatch | `$.store` after uninstall |
|---|---|---|---|---|---|
| ok | loaded as worker, tier user, `session.start` | success | connected (`claude mcp list` and `system/init`) | 1 call, outcome `control_result`, `authorizes: false` | retained: `<CLAUDE_CONFIG_DIR>/plugins/store/agdf_agdf-<hash>.json` with the probe key |
| throw-load | `[ERROR] hooks module agdf@agdf failed to load: … deliberate load failure` | success | connected | not observed (session authentication failed) | none written |
| throw-hook | loaded; `agdf: session.start hook skipped: threw … deliberate hook failure` ("what is below it ran in its place") | success (status 0) | connected | not observed (session authentication failed) | retained, same file |
| datadir (alternative) | loaded; wrote `<CLAUDE_CONFIG_DIR>/plugins/data/agdf-agdf/companion-state.json` via `$.fs.write` and read it back | success | connected before and after the write | not attempted | no store file; state file removed with the plugin data directory |

Further facts:

- `claude plugin validate` passed on each installed plugin root and listed the module's hooks and `$` calls.
- `claude plugin uninstall agdf@agdf` removed the MCP registration and `plugins/data/agdf-agdf` in every variant.
- `CLAUDE_PLUGIN_DATA` is not visible to the module through `$.env`. `CLAUDE_CONFIG_DIR` (when set) and `USERPROFILE` are visible, so the data directory is derivable as `<config dir>/plugins/data/agdf-agdf`.
- Installed-plugin hooks modules are gated by the host rollout flag `tengu_plugin_hooks_modules`. In the authenticated session the flag payload landed. Without a payload the module still loaded on this build.
- The two failure variants could not prove a successful dispatch call. The copied CLI credentials were refreshed by the first session, so the later sessions failed with "OAuth session expired and could not be refreshed". SessionStart hook and MCP connection are proven for both failure variants; the dispatch call is proven only for the working variant.
- A first datadir run under a longer probe path failed to connect the AGDF MCP server before any session ("CONNECTION_CLOSED"). The rerun under a shorter path connected, which is consistent with the known Windows MAX_PATH limit of the plugin MCP runtime. The companion was not involved.

## Consequence For The Approved Plan

- TP Risks And Blockers: "Block: T-001 shows that the host keeps companion store data after uninstall … the run returns to SD." The SD states the same rule.
- SDD-07 (`$.store` for `enabled`, `still` and per-project `selection`) cannot meet SCN-017 / AC-009 ("After uninstalling the plugin no companion files, store data or settings remain").
- Verified alternative for the SD revision: persist the three choices in one JSON file inside the AGDF plugin data directory `<config dir>/plugins/data/agdf-agdf/`. Claude removes that directory on uninstall, and the AGDF MCP server keeps working beside it.
- Open evidence to renew after the SD revision: the dispatch call under a throwing companion, with fresh CLI authentication.
