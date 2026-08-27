# CD+Tests: Installation Consent for Automatic Runtime Checks

Status: `done_with_declared_host_evidence_gaps`
Run: `installation-consent-runtime-checks`
Approved plan: TP Revision 1
Date: 2026-08-27

## Delivered Implementation

- one canonical `automaticRuntimeChecks` capability contract with a closed operation vocabulary,
  argument-free/read-only/offline constraints and explicit per-profile behavior;
- one deterministic SHA-256 capability identity over the canonical capability, surface, exact
  command, runtime digest and normalized source digest;
- one per-surface AGDF-owned intent receipt under the existing AGDF data root, with atomic
  replacement, ownership validation, identity renewal and no permission or gate authority;
- one generated native `runtime/agdf-session-check.js` which rejects arguments, runs only the
  surface-local read-only doctor projection and emits bounded AGDF session orientation;
- one pre-mutation install decision with complete disclosure and explicit `enable`, `manual` and
  `cancel`; interactive enablement has no default and non-interactive installation defaults manual;
- one exact Claude Bash or PowerShell rule with atomic settings preservation, conflict handling,
  exact-rule revocation and rollback when receipt persistence fails;
- Codex native-trust observation and OpenCode plugin-evidence adapters without trust-store writes or
  Bash widening;
- CLI `--runtime-checks enable|manual|cancel` and `runtime-checks status|enable|manual`, plus additive
  lifecycle requested/effective/identity/verification/mutation/rollback projection;
- content-equivalent Codex/Claude updates retain the matching prior intent; material command,
  runtime, source, scope or adapter identity changes route to renewal;
- canonical install documentation and public OpenAI submission sources which keep the public
  `portable-skills` profile executable-free and label automatic runtime checks unavailable there;
- Runtime Integrity, generated hook, public-profile and negative permission assertions; and
- Context Graph updates to `CG-NATIVE-INTERACTION-AUTHORITY` and
  `CG-CREATE-AGDF-CLI-COMPOSITION`.

## Task Evidence

| task_id | implementation evidence | test evidence | status |
|---|---|---|---|
| IRC-01 | Baseline `753124e20adebb44acf53817823300cf73ea0ac8`; Brownfield Analysis; selected-run gate-check | source-matched gate-check open at CD+Tests | done |
| IRC-02 | canonical definition; `runtime-check-consent/contract.js` | capability/identity negatives in `runtime-check-consent-test.js` | done |
| IRC-03 | generated `agdf-session-check.js`; existing local validator composition | no-argument, source-scan and live bounded-output checks | done |
| IRC-04 | POSIX and PowerShell hook projections; OpenCode plugin-internal session event | hook parity, win32 quoting and OpenCode hardening tests | done at repository plane |
| IRC-05 | `state.js`; atomic per-surface receipts; effective-state derivation | missing, malformed, unowned, mismatch and rollback fixtures | done |
| IRC-06 | coordinator, full disclosure and CLI interaction | enable/manual/cancel, invalid and no-TTY fixtures | done |
| IRC-07 | Codex evidence adapter; no trust mutation path | observed/mismatch/review fixtures and Runtime Integrity scans | done at repository plane |
| IRC-08 | Claude exact-rule and atomic settings owner | POSIX/win32 rule, conflict, preservation, revoke and rollback fixtures | done at repository plane |
| IRC-09 | OpenCode evidence adapter plus existing missing-only permission merge | OpenCode hardening and unchanged-Bash regressions | done at repository plane |
| IRC-10 | parser, registry, application and lifecycle extensions | CLI modularization, lifecycle human/JSON and cancellation tests | done |
| IRC-11 | pre-mutation consent, retained identity and partial permission failure handling | install transactions, exact-rule rollback and aggregate smoke | done at repository plane |
| IRC-12 | native command projection and existing bounded win32 `EPERM` owner | injected win32 command/settings/rollback fixtures | partial: direct native-Windows evidence missing |
| IRC-13 | `INSTALL.md`, package README and public submission sources | public builder/contract tests, 43-file inventory | done |
| IRC-14 | Runtime Integrity capability, entrypoint, Windows and portable-profile assertions | positive and negative Runtime Integrity suites | done |
| IRC-15 | canonical sync, Context Graph updates and focused-to-aggregate verification | full smoke, source integrity and `git diff --check` | done |
| IRC-16 | this evidence record | task and PRD matrices below | done |

## PRD Acceptance Evidence

| criterion | repository/package evidence | higher-plane evidence | result |
|---|---|---|---|
| PRD-IC-01 | complete disclosure object and interactive rendering | real installer output and Codex native review observed | macOS evidenced |
| PRD-IC-02 | deterministic enable/manual/cancel; cancel before all host calls | real enable and manual transitions observed | macOS evidenced |
| PRD-IC-03 | fixed command, closed scope, wildcard/operator negatives, no write/network | exact Claude rule and OpenCode no-Bash path observed | macOS evidenced |
| PRD-IC-04 | receipt plus identity plus host-evidence derivation; receipt-only never enabled | Claude hook, OpenCode effective state and Codex review observed | partial; Codex trust open |
| PRD-IC-05 | exact-rule preservation and OpenCode missing-only merge | Claude exact rule and OpenCode permissions preserved | macOS evidenced; managed conflict open |
| PRD-IC-06 | independent identity drift and retained-equal identity | real reinstall renewed Claude/OpenCode identity | macOS evidenced |
| PRD-IC-07 | exact-rule removal and manual receipt without uninstall | Claude revoke and OpenCode manual fresh session observed | macOS evidenced |
| PRD-IC-08 | no-TTY manual, exact explicit option, JSON state | CI host run missing | repository done; host not verified |
| PRD-IC-09 | deterministic degraded/unavailable states; portable profile unavailable | macOS matrix recorded; Windows and public rendering missing | partial |
| PRD-IC-10 | native PowerShell/path/atomic fixtures | direct native-Windows IRC-H04 through IRC-H06 missing | not verified |
| PRD-IC-11 | repository, package, installed and fresh-session planes stay separate | `HOST_EVIDENCE_MACOS.md` keeps cells explicit | done |
| PRD-IC-12 | lifecycle, installer, control, skill and aggregate regression clean | real Claude/OpenCode hosts clean after repair | partial higher-plane evidence |

## Verification

Passed on 2026-08-27:

- `npm --prefix create-agdf run test:runtime-check-consent`
- `npm --prefix create-agdf run release:prepare`
- TP focused suites: CLI modularization, local validator, local marketplace, local development
  install, lifecycle, OpenCode hardening, public plugin, Runtime Integrity layout/negative, package
  build and package contents
- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm_config_cache=/tmp/agdf-npm-cache.SNEMUQ npm --prefix create-agdf run smoke-test`
- aggregate result includes 66/66 deterministic skill cases, byte-identical package builds and a
  complete 313-file release-built plugin
- live repository invocation of generated `agdf-session-check.js` and argument rejection
- source-matched local validator `0.13.7`
- `git diff --check`
- real Codex `Hooks need review` observation with SessionStart `Active 0`, `Review 1`
- real Claude Code SessionStart hook success before the declared model-login failure
- real OpenCode enabled fresh session, manual/revoke fresh session and final re-enable

`create-agdf` has no package lock, so its direct `npm audit` is not applicable (`ENOLOCK`). A root
online audit was not performed because sending dependency metadata to the public npm registry was
not authorized. No audit bypass or lockfile mutation was attempted.

## Evidence Planes And Open Obligations

- repository/source: `pass`
- generated/package: `pass`
- installed host macOS: `pass` for installation on all three; Codex runtime remains `decision_required`
- fresh session macOS: `pass` for Claude hook and OpenCode enable/manual; Codex enabled session open
- native Windows: `not_run`
- public portal/publisher/publication: `not_run`

`HOST_EVIDENCE_MACOS.md` records the direct observations and mutations. IRC-H01 remains partial;
IRC-H04 through IRC-H07 remain open. No Windows, public readiness, release or publication claim is
made from the macOS evidence.
