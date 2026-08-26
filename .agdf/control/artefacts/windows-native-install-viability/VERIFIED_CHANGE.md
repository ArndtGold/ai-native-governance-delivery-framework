# Verified Change: Native-Windows Viability Of The Local Install Chain

- run_id: windows-native-install-viability
- date: 2026-08-26
- decision: pass
- mode: verified_change

## Change

- `create-agdf/lib/fs-swap.js` (new): `renameSyncWithRetry` — bounded retry (5 attempts, 50 ms linear backoff, dependency-free sync sleep) for `EPERM` on `renameSync`, active only on `win32`; all other platforms and error codes throw unchanged on first failure. Adapters are injectable for tests, matching the installer convention.
- `create-agdf/lib/public-plugin/builder.js`: candidate swap renames (backup, stage→stable, rollback) now use `renameSyncWithRetry`; transaction semantics unchanged.
- `create-agdf/lib/installers/local-marketplace.js`: all eight owned-root swap renames (recovery, staging, rollback) now use `renameSyncWithRetry`; transaction semantics unchanged.
- `create-agdf/scripts/public-plugin-test.js`: the symlink negative fixture is capability-gated by a probe. When symlink creation is unavailable (`EPERM`), only that fixture is skipped with an explicit log line; on symlink-capable hosts it runs unchanged. Non-`EPERM` probe errors still fail the test.
- `create-agdf/scripts/local-marketplace-test.js`: four focused assertions cover retry-then-success with backoff, bounded persistent-failure attempts (5), no retry on non-Windows, and no retry for non-`EPERM` codes.

## Verification Evidence

| Check | Result | Evidence |
|---|---|---|
| `public-plugin-test.js` on this host | pass, 3/3 consecutive runs | `Skipped symlink negative fixture: symlink creation is unavailable on this host (EPERM).` followed by `Public plugin tests passed (43 inventoried candidate files; ...)`, 2026-08-26. |
| Retry helper behavior | pass | Standalone run of the four focused assertions (identical to the ones added to `local-marketplace-test.js`) passed on this host, 2026-08-26. |
| End-to-end `npm run install:claude` | complete | `release:prepare` fully green on this host; installation reported `AGDF installation complete`, `Restart required: yes (host_reload)`; rebuilt marketplace copy carries `distributionProfiles`, `.agdf-installation.json` provenance, digest and `0.13.5+codex.local-16d77782b406`. |
| Runtime payload boundary | unchanged by inspection | `sync-plugin-runtime.js` payload excludes `lib/installers/` and `lib/public-plugin/`; `fs-swap.js` ships via the package `files: ["lib", ...]` entry. |
| Validator symlink rejection | untouched | `validator.js` `symlink not allowed` enforcement unchanged; only fixture constructibility is probed. |

## Out-Of-Scope Findings Surfaced During Verification

1. **Provenance migration gap (belongs to run `agdf-cross-host-runtime-integrity`, currently Awaiting QA):** a pre-provenance installed marketplace copy (0.13.5 without `distributionProfiles`, without `.agdf-installation.json`, without `.agdf-local-install.json`) makes `prepareLocalMarketplace` fail closed with `Built plugin distribution profile contract is invalid.` even though the transaction would replace that copy. `inspectInstallationProvenance` accepts only marker-bearing legacy copies. Real-host repro on 2026-08-26; manual recovery: the stale root was set aside as `%LOCALAPPDATA%/agdf/marketplaces/agdf-pre-provenance-manual-backup-20260826` and the reinstall rebuilt a complete copy. This directly contradicts that run's QA-pass claim for real-host migration and should enter its QA decision.
2. **`local-marketplace-test.js` is not native-Windows-portable:** the `defaultAgdfDataRoot` assertions (line ~59) expect POSIX separators for darwin/linux inputs and can never pass on win32 (`path.join` is platform-bound). Pre-existing; the new retry assertions therefore only execute on POSIX hosts/CI until that is fixed.

## Rollback

Revert the five-file diff. The set-aside marketplace backup directory can be restored by renaming it back, or deleted by the user once the restarted host is verified.
