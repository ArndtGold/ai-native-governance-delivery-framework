# Code Review Verification: Reruns On The Corrected Tree

- run_id: `agdf-companion-followup-20261027-01`
- date: 2026-10-28
- tree: the corrections CR-F01 to CR-F05 applied (`register.mjs`, `run-state.mjs`, companion suites)

| Check | Result |
|---|---|
| `npm run test:claude-companion` | logic, adapter and integrity tests passed |
| Mutation checks | CR-F01, CR-F02, CR-F03 (`mutate-register.mjs`) and CR-F04 (`mutate-runstate.mjs`) each fail their new assertion; the file was restored byte-identically and the suite passed again |
| `npm run build:prepare` | passed |
| `npm run compatibility:record` / `npm run compatibility:check` | pass, 56 evaluated, 0 failed, source fingerprint `dd21868ee39f5459eb0a0958e2a176071ee2f66470c07edd8b45c9cb0a0b6f87` |
| `windows-22-installation-part-2` | 12 commands, all exit 0 (341 s), incl. `claude-companion-test.js` |
| `windows-22-installation-part-3` | first rerun: `control-maintenance-test.js` failed with `EPERM` on a rename in `%TEMP%` (a transient Windows file lock; the test passed 3 of 3 alone, and this run changes nothing under `scripts/`, `packages/core` or `packages/cli/lib`); second rerun: 23 commands, all exit 0 (233 s), incl. `claude-companion-adapter-test.js` and `claude-companion-integrity-test.js` |
| `claude plugin validate packages/cli/generated/plugins/agdf` | passed |
| `claude plugin test` (scratch copy, generated test) | 5 of 5 passed |
| Installation of the corrected build (`probe-results/f9c`) | `result: success`, `operation: update`, all 13 installed companion files byte-identical to the generated ones, `plugin:agdf:agdf` connected |
