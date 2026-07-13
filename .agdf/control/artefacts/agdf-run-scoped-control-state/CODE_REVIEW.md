# Code Review: Run-Scoped AGDF Control State

- decision: pass
- findings:
  - none; final review covered state validation, path safety, selector ambiguity, lost-update prevention, atomic durability, migration rollback, projection drift, aggregate fail-closed behavior, CLI propagation and generated/package parity.
- missing_evidence: none.
- risks: Explicit legacy compatibility remains until older consumers are retired; it is non-authoritative and mechanically drift-checked.
- required_next_step: Run `qa-gate`; CR does not grant QA pass.

## Delta — 2026-07-13 (post-QA, pre-UAT)

- decision: pass
- findings:
  - [advisory] `create-agdf/lib/control-state/run-state-writer.js:18` - no inline comment explains why `win32` is excluded from `fsyncDirectory` - a future maintainer could revert the guard without knowing Windows cannot fsync a directory file descriptor at all. Non-blocking.
- missing_evidence: none remaining after the delta fix; the control-state suite (previously unable to complete on this platform) now runs to completion.
- risks: Skipping directory-fsync on `win32` is the only viable behavior on that platform (not a tunable trade-off); strictly stronger than the pre-fix state, which failed every write on Windows outright.
- required_next_step: none for CR; delta covered by `task-plan-review` and `qa-gate` below.
- context: Live UAT-preparation verification (`delivery-map --all-active`) surfaced `AGDF_LEGACY_PROJECTION_DRIFT`, traced to `fsyncDirectory()` throwing `EPERM` on Windows (no platform guard existed). Fixed with a single-line platform check. A second, unrelated pre-existing gap in `create-agdf/scripts/control-state-test.js` (a symlink-creation fixture aborting the entire test process without Windows Developer Mode/elevation) was also fixed by skipping only the two dependent assertions with a logged warning on `EPERM`, leaving production symlink-rejection logic untouched.
