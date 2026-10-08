# OR-lite: Guard Windows symlink EPERM in install-control-repair test

Report mode: OR-lite
Run: `install-repair-symlink-eperm-20261008-01`
Route: `quick_task` (Compact Delivery)
Date: 2026-10-08

## Result

install-control-repair-test.js guards its two symlink cases with a win32/EPERM-only symlinkOrSkip helper; on Windows without Developer Mode the test now passes and logs two SKIPPED lines instead of aborting the smoke chain

## Evidence

npm --prefix packages/cli run test:install-control-repair exit 0 on Windows 11 with SKIPPED source-link and SKIPPED linked lines; Code Review pass

## Risk

On Windows without symlink permission the two symlink-rejection checks are not exercised there; CI and symlink-capable hosts still run them

## Next Step

none; VCS actions require a separate explicit instruction
