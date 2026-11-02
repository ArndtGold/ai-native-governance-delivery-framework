# User Requirement: Windows-portable Release-Bump Symlink Fixture

- revision: 1
- status: `approved`
- owner: Arndt Gold
- date: 2026-09-04

## Problem

`npm run install:copilot` always executes `release:prepare`. On native Windows without symbolic-link
privilege, `create-agdf/scripts/release-bump-test.js` calls `symlinkSync` unconditionally and fails
with `EPERM` before the intended recovery-safety assertion can run. This prevents installation even
though the production installer does not require that test symlink.

## Required Outcome

Make the release-bump negative symlink fixture capability-aware so that a non-elevated Windows user
can complete `release:prepare` and `install:copilot` without weakening recovery-path security checks
on hosts that can create symlinks.

## Scope

- Own the correction in `create-agdf/scripts/release-bump-test.js` and only directly necessary test
  support.
- Probe or safely attempt symlink creation before the symlink-specific negative recovery assertion.
- Skip only that assertion when Windows returns `EPERM`, with an explicit diagnostic message.
- Preserve failure for every non-`EPERM` error and preserve the existing assertion on symlink-capable
  hosts.
- Validate the complete `release:prepare` chain locally and directly on native Windows.

## Acceptance Criteria

1. Native Windows without Developer Mode or administrator elevation no longer fails at the fixture's
   `symlinkSync` call.
2. The output explicitly identifies the one skipped symlink-rejection assertion.
3. Symlink-capable hosts still prove that release-bump recovery rejects a symlink stage path.
4. Non-`EPERM` fixture errors still fail the test.
5. `npm --prefix create-agdf run release:prepare` passes on the development host and on the reported
   native-Windows environment.
6. `npm run install:copilot` reaches and completes the actual Copilot installation path on Windows,
   subject to unrelated host permissions.
7. No production recovery, installer, gate, approval or plugin-runtime semantics change.

## Non-goals

- Requiring users to run PowerShell as Administrator or enable Developer Mode.
- Changing production symlink rejection or recovery validation.
- Adding the executable skill dispatcher.
- Modifying or closing `cross-surface-skill-target-preflight`.

## Evidence

- Direct PowerShell failure supplied by the user on 2026-09-04: `EPERM` at
  `create-agdf/scripts/release-bump-test.js:224` during `install:copilot`.
- `git blame` shows the unguarded fixture was added by `a1dc166` after the earlier Windows capability
  guard in `b489c53` covered `public-plugin-test.js` only.
