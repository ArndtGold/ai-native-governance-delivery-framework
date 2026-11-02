# SCN-019 Native Observation: Run Closure Through MCP in Claude Code

- Date: 2026-10-29, 08:05 to 08:11 (Europe/Berlin)
- Host: Claude Code Desktop on Windows 11, model Opus 5.5, new session in `C:\agdf-close-probe`
- Plugin: branch build of `feat/run-lifecycle-close` installed with `npm run install:claude` (launched outside the packaged app through `explorer.exe`), reported as `agdf@agdf` 0.20.2 with `run-closure.js` present in the installed runtime
- Repository: scratch repository created with `create-agdf init`, fixture runs `probe-alpha` and `probe-beta` from `run-create`, both active at UR; no run of this repository was touched

## Observed

1. Before: the companion listed "2 von 2 offenen Runs" with `probe-alpha` at UR (`scn-019-before.png`).
2. The owner asked the agent to close `probe-alpha` as abandoned and `probe-beta` as superseded by "PR #41", reason "native Probe".
3. The agent used the AGDF plugin MCP tool twice (preview and apply) and showed the preview with the phrase `Close runs: 68826cf4`; the session also shows one shell command whose content was not inspected.
4. The owner replied with exactly `Close runs: 68826cf4`; the agent forwarded it and reported both runs closed, final, the free reference as unverified, the Git identity as cooperative statement and both runs as unlinked in the backlog (`scn-019-after.png`).
5. After: the companion showed "Keine offenen Runs in diesem Projekt".

## Verified afterwards from the files

- `probe-alpha`: lifecycle `abandoned`, decision `abandoned`, current_gate `UR` kept, revision 2, seal `valid`; receipt `lifecycle_close.record` with reason "native Probe", successor null, confirmed_by Arndt Gold (arndt.gold@msg.group, cooperative), preview `68826cf4` with digest `sha256:e250e4b4a43d613176a879574d681604d4208b36c3a4fd4768e718246d670fee`, assurance `cooperative_local` with `caller_forwarded_deliberate_reply`.
- `probe-beta`: lifecycle `superseded`, same checks, successor `{kind: reference, value: "PR #41", verified: false}`.
- Preview file kept as `scn-019-preview-68826cf4.json`.
- `doctor --all-active --json`: inventory complete, `active_count: 0`, no findings. Its status `revise` for zero active runs is the existing unchanged `allowNoActiveRuns` behavior of `doctor.js`, not a closure effect.

## Limits

- One observation on one host (Claude Code Desktop, Windows); Codex, Copilot and OpenCode were not observed natively.
- The agent's shell command in that session was not inspected; the closure itself ran through the MCP tool.
- The confirmation is the owner's typed reply forwarded by the agent; independent human proof is unavailable, as for approvals.
