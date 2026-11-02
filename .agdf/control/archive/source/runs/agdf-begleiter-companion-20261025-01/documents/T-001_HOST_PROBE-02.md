# T-001 Host Probe, Renewed Failure Variants

Run: `agdf-begleiter-companion-20261025-01`
Task: T-001 (scenario SCN-013), renewal required by the approved TP after the first run (`T-001_HOST_PROBE.md`)
Recorded: 2026-10-26
Result: pass

## Setup

The setup matches the first run, with these differences:

- Claude Code CLI 2.1.302 on win32/x64, Node v22.22.3, model `claude-haiku-5-5`.
- The CLI login was fresh: the access token was valid until 15:02 UTC, so the credential copy was not refreshed.
- Launched outside the Claude desktop app package via `explorer.exe`.
- Short probe path `probe-results/t1f/`, git-ignored.
- Runtime plugin: AGDF 0.20.1 built from `feat/agdf-begleiter`, wired as SDD-01 with a throwing companion module, installed with `create-agdf claude --json` into an isolated `CLAUDE_CONFIG_DIR` per variant.

## Observations

| Variant | Companion | SessionStart command hook | AGDF MCP | agdf_dispatch |
|---|---|---|---|---|
| throw-load | `[ERROR] hooks module agdf@agdf failed to load: … deliberate load failure` | success | connected before, during and after the session | 1 call, outcome `control_result`, `authorizes: false`, session result `DONE` |
| throw-hook | `agdf: session.start hook skipped: threw … deliberate hook failure` | success | connected before, during and after the session | 1 call, outcome `control_result`, `authorizes: false`, session result `DONE` |

- In both sessions the host rollout flag `tengu_plugin_hooks_modules` payload landed.
- `claude plugin uninstall agdf@agdf` removed the MCP registration and the plugin data directory.
- The throw-hook probe module still wrote a `$.store` key on purpose, and that store file again remained after uninstall. This matches the first run. The corrected SDD-07 does not use `$.store`.

## Consequence

SCN-013 is fully evidenced: a companion module that fails to load, or fails in its hook, leaves the AGDF SessionStart hook, the MCP connection and the dispatch call working.

Together with `T-001_HOST_PROBE.md`, T-001 is complete:

- loading and validation in an installed build;
- failure isolation;
- `$.store` retained after uninstall, which led to SDD-07 being corrected;
- the plugin data directory state file removed on uninstall, with MCP still connected.

T-002 may proceed.
