# CD+Tests: Run-Recovery

Run: `restore-unsealed-active-run-records-20260929-01`
Scope: approved TP implementation only.

## Implementation

- Added explicit `run-recovery` CLI actions for one Run ID: `inspect`, `preview`, and digest-confirmed `apply`.
- Reused the canonical run parser, contained-file validation, gate policy, existing run lock, atomic writer, revision increment, and run seals.
- Recovery accepts only active, validly parsed unsealed/invalid runs; all prior approval rows without independent provenance are reset, derived current-gate fields are recalculated, and later approval history is retained in the private recovery journal.
- Preview confirmation binds the Run ID, source state, listed artefact digests, approval plan, next gate and candidate content. Apply rereads that binding under the run lock and refuses stale artefacts, changed source, symlinks, malformed paths, unknown journal phases and noncanonical candidates.
- The journal resumes idempotently after a crash before or after the Run State rename. Ordinary `run-update` remains fail-closed for unsealed/invalid runs.

## Verification

Passed on the current macOS host:

- `npm run test:run-recovery`
- `npm run test:control-state`
- `npm run test:run-lock`
- `npm run test:run-step-transaction`
- `npm run test:run-revision`
- `npm run test:cli-gates`
- `npm run test:lifecycle`
- `npm run test:package-build`
- `npm run test:payload-budget`

The recovery fixture verifies preview immutability, exact confirmation, approval reset, correct first gate, writer candidate restrictions, an occupied lock, a changed artefact, symlink denial, tampered preview and unknown-phase denial, idempotent reapplication, post-rename resume and byte equality for a non-selected Run State. CLI tests exercise inspect, preview and apply.

The new read-only inspector was then run for all 23 specifically named production runs. All 23 report `unsealed`; Git history yielded no candidate with both seal lines. Nineteen have fully resolvable current artefact paths. Four Preview attempts must remain blocked until their artefacts are handled: `agdf-cross-host-runtime-integrity` (missing `VERIFIED_CHANGE.md`), `agdf-guided-mcp-activation` (the Artefacts table contains the non-path text `three linked review artefacts`), `claude-loaded-host-conformance-observation` (missing `CLAUDE_LOADED_HOST_MATRIX.json` and `OBSERVATION_REPORT.md`), and `opencode-surface-hardening-parity` (missing `VERIFIED_CHANGE.md`). These inspections did not create previews or modify any Run State or Artefact.

## Remaining Evidence

- Fixture tests ran in an isolated temporary repository. Read-only inspection covered the 23 affected production Run States; no production preview or apply was run.
- Linux and native Windows test runs were not available in this session; cross-platform filesystem and locking evidence remains open.
- A post-implementation `doctor --all-active --json` still reports 86 aggregate findings (23 block, 1 revise, 62 warn); these findings are not claimed fixed. The selected implementation run passes Doctor and its gate-check remains open at `CD+Tests`.
