# Code Review: Run-Recovery

Run: `restore-unsealed-active-run-records-20260929-01`
Decision: `pass`
Scope: actual source diff for the approved recovery CLI, shared writer capability, package runtime inclusion and focused regression tests.

## Findings

None. The review confirmed that normal `run-update` still rejects unsealed/invalid states; recovery is limited to an explicit active Run ID and the canonical approval-reset candidate; preview confirmation binds the plan and source digests; artifact changes, symlinks, malformed paths, lifecycle mismatches, preview tampering and unknown journal phases block before the Run State write; and recovery shares the existing lock, atomic replacement, revision and seal owners.

## Evidence

- `create-agdf/lib/control-state/run-recovery.js`
- `create-agdf/lib/control-state/run-state-writer.js`
- `create-agdf/lib/cli/command-registry.js`, `parse-args.js`, `validation-handlers.js`
- `create-agdf/scripts/run-recovery-test.js`
- Passed: recovery, Control-State, lock, run-step transaction, run-revision, CLI-gates, lifecycle, package-build and payload-budget suites.
- Selected Run Doctor and gate-check pass; current gate is CR at review time.

## Missing Evidence And Risk

- Linux and native Windows test runs were unavailable. Docker daemon access was denied in this session. Cross-platform filesystem and lock behavior remains an open Task Plan evidence item.
- No recovery preview or apply was run against the 23 affected production Run States.
- All-active Doctor remains `block` with 86 aggregate findings; this change is not presented as resolving those findings.

## Required Next Step

Run Task Plan Review and account for the outstanding cross-platform evidence before QA.
