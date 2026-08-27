# Direct Host Evidence: macOS

Run: `installation-consent-runtime-checks`

Date: 2026-08-27

Scope: real installed Codex, Claude Code and OpenCode hosts on macOS

## Authority And Boundary

The user explicitly authorized bounded real installation, configuration, fresh-session and
revocation tests for all three hosts. Backups were captured before mutation. No broad shell rule,
Codex trust-store write, trust bypass, publication, release or VCS action was used.

Observed versions: Codex CLI `0.145.0`, Claude Code `2.1.193`, OpenCode `1.18.3`, AGDF `0.13.7`.

## IRC-H01: Codex macOS

Status: `partial`, fail closed at native trust.

- The final installer verified local Codex version `0.13.7+codex.local-b397dc228a8a` and wrote
  enabled intent with identity `a5b5d2d285d9bb60d48bc2b58648b31813ae805cfee3e46e853e8e3774f4e7c7`.
- A fresh native TUI displayed `Hooks need review`, one new or changed hook, and SessionStart
  `Installed 1`, `Active 0`, `Review 1`.
- No `trust all`, trust-store mutation or bypass was selected. The generated entrypoint now also
  exits silently unless a valid enabled AGDF receipt exists.
- An enabled fresh session is not claimed. Exact native trust, changed-hook renewal and disable
  remain user-controlled evidence obligations.

## IRC-H02: Claude Code macOS

Status: `substantial`, with declared authentication and policy-case limits.

- The installer replaced stale AGDF `0.13.5` with `0.13.7` and added exactly one owned rule:
  `Bash(node "${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/runtime/agdf-session-check.js")`.
- Existing settings were preserved. No wildcard, compound command or broad Node/Bash rule was added.
- Final fresh session `dfb44221-cd8b-4e4a-9da3-827d89f9dc7c` loaded AGDF and logged
  `Hook SessionStart:startup ... success` with `status=warn findings=22`.
- The hook succeeded before model use. Claude then stopped with `Not logged in`; authenticated model
  output is not claimed.
- A real manual transition removed only the exact rule. Reinstall restored it and renewed identity
  to `1f2dc760174e2b6b94032d89fc90d47536a4719015a103da6beb9556fb0ca11f`.
- Managed conflict and induced rollback remain repository-fixture evidence only.

## IRC-H03: OpenCode macOS

Status: `substantial`, including fresh-session enable and revoke.

- Initial testing found that a bare npm plugin entry resolved through a stale Bun cache and that no
  automatic check ran. The repair binds `./node_modules/create-agdf/opencode-plugin.js`, uses explicit
  Node execution and injects only successful bounded output.
- Final configuration loads `0.13.7` and preserves `edit: ask` and `bash: ask` without widening Bash.
- Final enabled session `ses_fbd061fe5ffedtan6qp8C314cz` logged `effective=enabled` and `ran=true`.
  The host therefore observed successful bounded output injection; the model declined to reproduce
  the system-context line verbatim in this final probe. An earlier same-version probe reproduced
  `AGDF automatic runtime check: status=warn findings=22`.
- Real revocation reported `mutation=receipt_updated`. Session `ses_fbd0e76c4ffeSTSQSuk3QCajuX`
  logged `effective=manual`, `ran=false`, and returned `AGDF_AUTOMATIC_RUNTIME_CHECK_ABSENT`.
- The final install restored enabled intent with identity
  `e247d4a1a6ed880cbacd5cd64aa59be2f54cf41c47b1b180cfaab3403b8077bc`.
- Induced destructive rollback remains repository-fixture evidence only.

## Evidence Matrix

| obligation | result | direct evidence | remaining gap |
|---|---|---|---|
| IRC-H01 Codex macOS | partial | real install and native review | user trust, enabled/change/disable cycle |
| IRC-H02 Claude macOS | substantial | exact rule, hook success, revoke and renewal | authenticated model, managed conflict, induced rollback |
| IRC-H03 OpenCode macOS | substantial | enabled/manual fresh sessions and preserved permissions | induced rollback |
| IRC-H04 Codex Windows | not run | none | complete native-Windows obligation |
| IRC-H05 Claude Windows | not run | none | complete native-Windows obligation |
| IRC-H06 OpenCode Windows | not run | none | complete native-Windows obligation |
| IRC-H07 public candidate | not run | repository candidate only | rendered listing and portal evidence |

## Honest Boundary

This proves actual macOS behavior only. It does not prove Linux, native Windows, rendered public
listing, publication, release, UAT or gate approval. OpenCode warnings about `git add --sparse` were
unrelated host noise and did not change the repository index.
