# CD+Tests: Installation Consent for Automatic Runtime Checks

## Codex Hook Correction, 2026-09-05

This section supersedes the earlier Codex native-observation claim for the bounded correction.
Approved scope: SD Revision 3 AD-2/AD-6; TP Revision 2 IRC-07/10/14/16.

- `runtime-check-consent/codex-hooks.js` now reads the native hook state through a bounded,
  injectable app-server client. Initialization and `hooks/list` are its only requests. Malformed,
  ambiguous, unsupported, failed, timed-out or oversized responses remain unverified.
- The existing consent adapter gives native review precedence over an apparent enabled state and
  distinguishes review-required, disabled, unverified and trusted-but-session-unverified hooks.
- The existing async CLI handlers use that observation after enabled Codex installation and for
  status. Manual, failed and identity-renewal states retain their owners and skip the probe.
- Compact install output no longer asks for approval of an already trusted hook. General status
  preserves its repository/delivery next action and exposes the separate runtime verification.
- The hook command, capability identity, receipt schema and native trust store are unchanged.
- The canonical install guide, package README and two existing Context Graph nodes record the
  observation/execution boundary. No installation, commit, push or publication was performed.

| task_id | correction evidence | result and limit |
|---|---|---|
| IRC-07 | native parser/transport tests, review precedence regression, actual CLI and desktop-binary metadata | repository pass; native observation pass; fresh execution remains open |
| IRC-10 | CLI install and runtime-check status fixtures for trusted, modified and disabled hooks; compact rendered output; general-status recovery preservation | repository pass; revised installed installer rendering remains open |
| IRC-14 | focused runtime-check suite now includes the native observer regression suite and is included in aggregate smoke | focused pass; final aggregate result below |
| IRC-16 | this section and `CODEX_HOOK_EVIDENCE.md` | evidence planes and original-hash uncertainty preserved |

Verification on this correction:

- `node create-agdf/scripts/codex-hook-observation-test.js`: pass.
- Runtime-check consent, CLI modularization and lifecycle suites: pass.
- The implemented observer returns the same enabled, trusted hook/hash from Codex CLI 0.145.0
  and desktop binary 0.153.4. This does not prove a loaded fresh-session context.
- Initial full smoke stopped on npm cache `EPERM`; no code assertion failure was reported at
  that stop. Retest uses a dedicated temporary npm cache without changing the user cache.
- Final aggregate verification: pass with
  `npm_config_cache=/private/tmp/agdf-codex-hook-fix-npm-cache npm --prefix create-agdf run smoke-test`.
  This includes release preparation, package build/content checks, runtime integrity negatives,
  83/83 deterministic skill cases, OpenCode hardening and routing. Log:
  `/private/tmp/agdf-codex-hook-fix-smoke-final.log`.
- A final malformed-hash type guard was added during review. The native observer, full consent,
  CLI modularization and lifecycle suites were rerun afterward and pass; log:
  `/private/tmp/agdf-codex-hook-fix-focused-final.log`.
- Source Runtime Integrity: pass. `git diff --check`: pass. Baseline staged diff remains identical;
  the changed file set contains only the declared correction and its evidence.
- Current version-matched installed-validator gate-check: open at QA, `qa_revise_required`.
  All-active doctor remains at its baseline 0 block / 1 revise / 55 warnings; the sole revise
  belongs to the unrelated `cross-surface-plugin-opt-out` run.

Finding `IRC-CODEX-01` is resolved by the implementation and focused/native evidence.
`TPR-01` remains open for revised installed-host rendering and the declared host matrix.

Status: `done_with_declared_host_evidence_gaps`
Run: `installation-consent-runtime-checks`
Approved plan: TP Revision 2
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
  `cancel`; every interactive install or update asks even when a matching receipt exists, displays
  the current decision only as context and leaves non-interactive installation manual by default;
- one beginner-first terminal disclosure with plain-language scope, timing, safety, authority,
  renewal and revocation; implementation paths and persistence details remain available through
  `D` without forcing a decision, and successful local release preparation no longer pollutes the choice;
- target AGDF version in the decision header, verified installed version or update transition in the
  compact result, and one quiet interactive setup-progress line without affecting JSON or non-TTY output;
- retained intent is labelled as a previous choice rather than effective permission; automatic intent
  says host permission is checked after installation, manual mode explains that AGDF still works, and
  invalid input redisplays the valid keys instead of waiting silently;
- one compact completion card that translates internal lifecycle states into `Ready`, `Waiting for
  <host> permission` and one concrete next action while `--verbose` and JSON retain full diagnostics;
- truthful lifecycle titles distinguish a cancelled installation from a completed installation and
  retain a separate uninstall preview;
- direct TTY choices accept `1` or `E` for enable, `2` or `M` for manual and `Esc` for immediate
  cancellation without Enter, then restore raw mode and pause the one-time input stream;
- one exact Claude Bash or PowerShell rule with atomic settings preservation, conflict handling,
  exact-rule revocation and rollback when receipt persistence fails;
- Codex native-trust observation and OpenCode plugin-evidence adapters without trust-store writes or
  Bash widening;
- CLI `--runtime-checks enable|manual|cancel` and `runtime-checks status|enable|manual`, plus additive
  lifecycle requested/effective/identity/verification/mutation/rollback projection;
- content-equivalent updates may preserve native host trust only after a new interactive choice;
  material command, runtime, source, scope or adapter identity changes still route to renewal;
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
| IRC-06 | shared CLI consent composition always asks on interactive install/update and shows retained state only as context | first install, enabled receipt, manual receipt, enable/manual/cancel and zero-mutation cancellation fixtures | done at repository plane |
| IRC-07 | Codex evidence adapter; no trust mutation path | observed/mismatch/review fixtures and Runtime Integrity scans | done at repository plane |
| IRC-08 | Claude exact-rule and atomic settings owner | POSIX/win32 rule, conflict, preservation, revoke and rollback fixtures | done at repository plane |
| IRC-09 | OpenCode evidence adapter plus existing missing-only permission merge | OpenCode hardening and unchanged-Bash regressions | done at repository plane |
| IRC-10 | parser, registry, application and lifecycle extensions plus beginner-first disclosure, version identity, truthful previous intent, on-demand technical details, compact result and single-key TTY choice | target/installed/update version, setup progress, scope/safety/manual explanation, invalid-key recovery, D details loop, 1/E, 2/M and Esc, raw-mode cleanup, no-TTY/JSON manual, compact result, cancelled-install title and uninstall-preview tests | done |
| IRC-11 | pre-mutation consent, retained identity and partial permission failure handling | install transactions, exact-rule rollback and aggregate smoke | done at repository plane |
| IRC-12 | native command projection and existing bounded win32 `EPERM` owner | injected win32 command/settings/rollback fixtures | partial: direct native-Windows evidence missing |
| IRC-13 | `INSTALL.md`, package README, release notes and reviewer cases explicitly forbid silent interactive reuse | public builder/contract tests, 43-file inventory | done |
| IRC-14 | Runtime Integrity capability, entrypoint, Windows and portable-profile assertions | positive and negative Runtime Integrity suites | done |
| IRC-15 | canonical sync, Context Graph updates and focused-to-aggregate verification | final full smoke, source integrity and `git diff --check` after the Revision 2 delta | done |
| IRC-16 | this evidence record | task and PRD matrices below | done |

## PRD Acceptance Evidence

| criterion | repository/package evidence | higher-plane evidence | result |
|---|---|---|---|
| PRD-IC-01 | disclosure plus current-state rendering on every interactive first install/update fixture | revised real-host installer output not yet observed | repository pass; host evidence open |
| PRD-IC-02 | deterministic enable/manual/cancel; retained receipt cannot bypass prompt; cancel before all host calls | revised real enable/manual/cancel transitions not yet observed | repository pass; host evidence open |
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
- Revision 2 interaction regressions in `npm --prefix create-agdf run test:cli-modularization`
- beginner summary, on-demand `D` details, compact result and quiet-success preparation regressions in CLI modularization, lifecycle and local development install suites
- target and installed version, update transition, previous-choice/permission distinction, manual-mode explanation, interactive progress and invalid-key recovery regressions
- real non-mutating pseudoterminal `D` then `Esc` observation: details return to the choice, immediate cancel needs no Enter, exit code 0 and no host adapter call
- `npm --prefix create-agdf run release:prepare`
- TP focused suites: CLI modularization, local validator, local marketplace, local development
  install, lifecycle, OpenCode hardening, public plugin, Runtime Integrity layout/negative, package
  build and package contents
- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm_config_cache=/tmp/agdf-npm-cache.SNEMUQ npm --prefix create-agdf run smoke-test`
- aggregate result includes 66/66 deterministic skill cases, byte-identical package builds and a
  complete 313-file release-built plugin
- final aggregate rerun passed after moving diagnostic smoke assertions to explicit `--verbose`;
  compact default output and full diagnostic output are therefore verified as separate contracts
- public candidate validation passed with 43 inventoried files and digest
  `8fa143c25cb16bfa5ad28dc4d3a5fb61a19c502b7f83a3a37827671c20b981d2`
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
- installed host macOS: prior evidence exists for all three, but the Revision 2 repeated-choice
  behavior has not been rerun on a real host
- fresh session macOS: prior Claude/OpenCode evidence exists; Codex enabled session and revised
  update-choice observations remain open
- native Windows: `not_run`
- public portal/publisher/publication: `not_run`

`HOST_EVIDENCE_MACOS.md` records the direct observations and mutations. IRC-H01 remains partial;
IRC-H04 through IRC-H07 remain open. No Windows, public readiness, release or publication claim is
made from the macOS evidence.
