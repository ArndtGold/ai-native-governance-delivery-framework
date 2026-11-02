# UR: Native-Windows Viability Of The Local Install Chain

Status: approved
Gate: UR
Gate approval: approved
Date: 2026-08-26
Owner: Arndt Gold

## 1. Problem

On native Windows without symlink privilege (Developer Mode off, non-elevated), `npm run install:<surface>` always fails: `test:public-plugin` (part of `release:prepare`) creates a symlink as a negative fixture (`public-plugin-test.js:161`) and the fixture creation itself throws `EPERM` before the guarded validator check can run. Independently, directory `renameSync` swaps of freshly written trees (`public-plugin/builder.js:71`, `installers/local-marketplace.js:349`) intermittently throw transient `EPERM` on Windows (antivirus/indexer handle locks), observed directly on 2026-08-26 in both the repo workspace and `%TEMP%`.

## 2. Goal

A contributor on native Windows without symlink privilege can run `npm run install:<surface>` and the associated test chain to completion; transient Windows file-lock renames no longer abort installs or tests.

## 3. Scope

- `create-agdf/scripts/public-plugin-test.js`: probe symlink availability; when symlink creation is unavailable (`EPERM`), skip only the symlink negative fixture with an explicit log line. The guarded condition cannot be constructed on such hosts.
- Bounded retry with short backoff for directory `renameSync` `EPERM` on Windows in the staging/backup/rollback/recovery swaps of `lib/public-plugin/builder.js` and `lib/installers/local-marketplace.js`, via one small shared helper, without changing swap or rollback semantics.

## 4. Non-Goals

- Weakening the builder/validator symlink rejection itself (`symlink not allowed` stays enforced whenever testable).
- Retrying non-Windows platforms or non-`EPERM` errors.
- New install surfaces, CI workflow changes, or changes to marketplace/identity semantics.

## 5. Acceptance Signals

- `node ./scripts/public-plugin-test.js` passes on this host (symlink fixture skipped with a visible log line).
- On symlink-capable hosts the negative fixture still runs (probe-gated, not platform-gated).
- `npm run install:claude` completes end-to-end on this host.
- Existing suites unaffected on capable hosts; retry helper is covered by a focused test.

## 6. Existing Source Of Truth

- `create-agdf/scripts/public-plugin-test.js` owns public-plugin regression fixtures.
- `create-agdf/lib/public-plugin/builder.js` owns candidate staging swaps.
- `create-agdf/lib/installers/local-marketplace.js` owns marketplace staging, rollback and recovery swaps.
- Run `install-scripts-fresh-checkout-fix` (2026-08-26) documents both blockers as out-of-scope findings.

## 7. Risks And Unknowns

- Retry can mask a persistent permission problem for up to the bounded attempts; the final error is still thrown unchanged.
- Enterprise policy may keep Developer Mode locked, so the probe-gated skip is the only viable path for the symlink fixture on such hosts.

## 8. Next Step

Perform the post-UR Brownfield Review and proportional Mode/Slice Decision.
