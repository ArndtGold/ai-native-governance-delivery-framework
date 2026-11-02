# Verified Change: Fresh-Checkout Local Plugin Install Fix

- run_id: install-scripts-fresh-checkout-fix
- date: 2026-08-26
- decision: pass (with disclosed native-Windows evidence limitation)
- mode: verified_change

## Change

- `create-agdf/scripts/install-local-plugin.js`: removed the eager top-level imports of `application.js`, `runtime-context.js`, `local-marketplace.js` and `local-development.js`; these are now loaded via dynamic `await import()` inside `installLocalPlugin()` immediately after the `release:prepare` step has produced `create-agdf/generated/`. Invalid-surface rejection still happens before preparation; failed preparation still prevents any host lifecycle call. No installer semantics changed.
- `create-agdf/scripts/local-development-install-test.js`: added a fresh-checkout regression. A fixture copy of `package.json`, the installer script and `lib/` (without `generated/`) is created; a subprocess import of the installer script must succeed, and a subprocess import of `lib/cli/runtime-context.js` must fail, proving the fixture genuinely lacks generated metadata.

## Verification Evidence

| Check | Result | Evidence |
|---|---|---|
| Fresh-checkout module-load probe (installer script, no `generated/`) | pass | Subprocess `import()` of the fixture installer exited 0 (`INSTALLER_LOAD_OK`), 2026-08-26. |
| Negative control (fixture validity) | pass | Subprocess `import()` of fixture `runtime-context.js` failed with `ENOENT` on the generated definition, proving the probe is meaningful. |
| End-to-end `npm run install:claude` on the previously failing checkout | boundary moved as intended | The command now passes module load, runs `release:prepare` (`sync-package-assets` and version coherence `29 surfaces at 0.13.5` pass) and reaches `test:public-plugin`. The original `ENOENT` at load time is gone. |
| Invalid-surface and failed-preparation ordering | unchanged by inspection | `install-local-plugin.js:21-24`; existing assertions `invalid surfaces must fail before preparation` and `failed preparation must prevent host lifecycle calls` cover both. |
| Full `local-development-install-test.js` suite on this host | blocked by pre-existing host limitation | Native Windows run fails inside untouched `prepareLocalMarketplace` staging (`EPERM` on `renameSync` in `%TEMP%`, `local-marketplace.js:349`) both with and without this change (verified via `git stash` A/B on 2026-08-26). Consistent with the disclosed limitation "native Windows execution remains an explicit evidence limitation" in prior ORs. |

## Disclosed Limitations

- Full-suite green evidence for this change must come from a non-Windows or CI execution; on this host, two pre-existing native-Windows issues block the chain independently of this fix:
  1. `test:public-plugin` creates a symlink negative fixture, which fails with `EPERM` without Windows Developer Mode or elevation; this blocks `release:prepare` and therefore the real `npm run install:<surface>` on this host.
  2. Transient `EPERM` on directory `renameSync` in `%TEMP%` during test-fixture marketplace staging (likely antivirus handle lock).
- Both are out of this run's approved scope and are recorded as separate follow-up candidates.

## Rollback

Revert the two-file diff; no data, configuration or installed-host state was changed by this run.
