# Claude Code CLI on Windows — run for candidate 5e84374e

Candidate 5e84374e54be68685b1ded7edf71e1e1688d58011db405c87c50aa4a3121a130, commit 7a41879e742a95579755020b04ccb6e93b81d257.
The general rules are in WINDOWS_TEST.md; this page is the concrete sequence on this computer.

Inside the checkout the candidate file is named .release-candidate.json, which git ignores. A candidate.json in
the repository root, as the generic steps suggest, would make the checkout dirty and every record invalid.

## Prepared state

- Clean worktree C:\Workspace\agdf-rc-7a41879e at the candidate commit, built with build:prepare and the
  MCP package install; .release-candidate.json there equals candidate.json in this directory.
- Script C:\Workspace\agdf-rc-7a41879e\probe-results\run-claude-cli-cases.cmd (copy here as
  run-claude-cli-cases.cmd). It freezes the tuple with preflight using model claude-sonnet-5-5, then runs
  dispatch, failure_case, skill_continuation, upgrade and recovery once each.

## Run

Start the script outside the packaged Claude Desktop app, because the app virtualizes %LOCALAPPDATA% for
its child processes:

```bat
explorer.exe C:\Workspace\agdf-rc-7a41879e\probe-results\run-claude-cli-cases.cmd
```

Progress goes to probe-results\claude-cli-run.log; probe-results\claude-cli-run.done appears when it has
finished. Each case installs AGDF into an isolated Claude configuration, uses the existing sign-in only for
its own sessions and removes its installation again.

## Afterwards

The reviewer checks the primary captures of every probe-results\claude-host-e2e-* result, prepares the review
with review-template and imports with --host claude --surface cli from a clean checkout. Failed cases stay as
they are and are reported. Nothing here grants a gate approval or publication.
