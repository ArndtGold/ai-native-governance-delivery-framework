# Code Review: Windows-portable Release-Bump Symlink Fixture

- decision: `pass`
- reviewed_scope: `create-agdf/scripts/release-bump-test.js`
- findings: none
- missing_evidence: Native-Windows rerun of `npm run install:copilot` after this change.
- risks: A macOS run proves the symlink-capable branch but cannot directly prove the reported Windows `EPERM` branch.
- required_next_step: Record the Verified Change mini-closeout, then rerun `npm run install:copilot` on the reported native-Windows host.

## Review Evidence

| Concern | Result | Evidence |
|---|---|---|
| Correctness | pass | The capability probe gates only the symlink-specific negative fixture. The surrounding recovery tests remain unconditional. |
| Error handling | pass | Only `EPERM` returns `false`; every other probe error is rethrown. |
| Security regression | pass | On a symlink-capable host, the unchanged assertion still requires `release_version_bump_recovery_invalid` for a symlink stage path. |
| Compatibility | pass | The helper mirrors the established Windows guard in `create-agdf/scripts/public-plugin-test.js`. |
| Cleanup | pass | The probe directory is removed in `finally` for success and failure paths. |
| Scope integrity | pass | No production recovery, installer, release or plugin-runtime code changed. |

## Validation Reviewed

- `node create-agdf/scripts/release-bump-test.js`: pass
- `npm --prefix create-agdf run release:prepare`: pass
- `git diff --check`: pass

## Host Boundary

The local host exercised the symlink-capable branch. The user-supplied Windows failure identifies the
target branch precisely, but a post-change native-Windows result is still required before claiming
that `install:copilot` completes there.
