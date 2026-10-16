# OR-lite: Skip file-symlink negative checks where Windows refuses symlinks

Report mode: OR-lite
Run: `symlink-test-robustness-20261015-01`
Route: `quick_task` (Compact Delivery)
Date: 2026-10-15

## Result

Four file-symlink negative checks use tryLinkFile and are skipped visibly where Windows refuses symlinks; skill-dispatch, control-inspect and run-command-flow pass on this host.

## Evidence

.agdf/control/artefacts/symlink-test-robustness-20261015-01/CD_TESTS.md; .agdf/control/artefacts/symlink-test-robustness-20261015-01/CODE_REVIEW.md

## Risk

Reduced negative coverage on Windows hosts without symlink privilege; hosts with symlinks still run the checks.

## Next Step

Commit together with the pending installer-hardening changes when the user requests it; no VCS action taken.
