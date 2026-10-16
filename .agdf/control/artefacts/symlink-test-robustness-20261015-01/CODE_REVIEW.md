# Code Review: Skip file-symlink negative checks where Windows refuses symlinks

Gate: CR
Type: Code Review
Status: done
Decision: pass
Reviewer: Claude Code (claude-opus-5-5)
Date: 2026-10-15

## Scope

Diff of `packages/core/test/artifact-readiness-test.js`, `packages/core/test/decision-qualification-test.js`,
`packages/core/test/presentation-document-test.js` and `packages/cli/scripts/compact-continuation-test.js`.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|

No findings.

## Checks

- Reuse: all four sites call the existing `tryLinkFile`; no new local try/catch copies and no change to the helper.
- Guard boundaries: only the assertions that depend on the link are inside the guard; the cleanup each site needs (`rmSync` of the link) moved inside it, and the following re-creation of the regular file stays outside, so later assertions see the same state as before on both paths.
- Failure semantics: the helper rethrows non-EPERM/EACCES errors and EPERM outside Windows, so genuine failures still fail.
- Imports: the unused `symlinkSync` imports were removed; relative helper paths resolve from both `packages/core/test` and `packages/cli/scripts`.
- No product code, other suites or the smoke-test chain changed.

## Decision

- decision: pass
- evidence: `.agdf/control/artefacts/symlink-test-robustness-20261015-01/CD_TESTS.md`
- required_next_step: OR-lite closeout.
