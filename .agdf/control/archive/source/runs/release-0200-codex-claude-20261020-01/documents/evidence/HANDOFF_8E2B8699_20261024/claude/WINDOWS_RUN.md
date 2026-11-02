# Claude Code CLI on Windows — run for candidate 8e2b8699

Candidate 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692, commit 460027fabc58fe0da041bbabe117519dd1f696b7.
The general rules are in WINDOWS_TEST.md; this page is the concrete sequence on this computer. It replaces the
5e84374e handoff, whose records stay historical.

Inside the checkout the candidate file is named .release-candidate.json, which git ignores. A candidate.json in
the repository root, as the generic steps suggest, would make the checkout dirty and every record invalid.

## Prepared state

- The clean worktree C:\Workspace\agdf-rc-460027fa is at the candidate commit. It is built with build:prepare
  and the MCP package install. Its .release-candidate.json equals candidate.json in this directory.
- The script C:\Workspace\agdf-rc-460027fa\probe-results\run-claude-cli-cases.cmd has a copy here.
  1. It checks the sign-in with check-claude-signin.cjs, also copied here.
  2. It freezes the tuple with preflight, using model claude-sonnet-5-5.
  3. It runs dispatch, failure_case, skill_continuation, upgrade and recovery once each.

## Sign-in

Each case copies `%USERPROFILE%\.claude\.credentials.json` into its isolated configuration. If the access token
expires during the run, the first case refreshes it inside its copy. That rotates the refresh token, and every
later case fails with `authentication_failed`. This happened on 2026-10-24 with candidate 5e84374e.

The script therefore refuses to start unless the sign-in is valid for at least another 60 minutes, or
CLAUDE_CODE_OAUTH_TOKEN is set. To renew it, start `claude` in a terminal outside the Desktop app and run
`/login`.

## Run

Start the script outside the packaged Claude Desktop app, because the app virtualizes %LOCALAPPDATA% for its child
processes:

```bat
explorer.exe C:\Workspace\agdf-rc-460027fa\probe-results\run-claude-cli-cases.cmd
```

Progress goes to probe-results\claude-cli-run.log, and probe-results\claude-cli-run.done appears when the script
has finished. Each case installs AGDF into an isolated Claude configuration, uses the existing sign-in only for
its own sessions, and removes its installation again.

## Afterwards

1. The reviewer checks the primary captures of every probe-results\claude-host-e2e-* result.
2. The reviewer bundles exactly one passing record per case and prepares the review with review-template.
3. After maintainer approval, the bundle is imported with --host claude --surface cli from a clean checkout.

Failed cases stay as they are and are reported. A rerun of a failed case uses the same tuple and leaves the failed
record unchanged. Nothing here grants a gate approval or publication.
