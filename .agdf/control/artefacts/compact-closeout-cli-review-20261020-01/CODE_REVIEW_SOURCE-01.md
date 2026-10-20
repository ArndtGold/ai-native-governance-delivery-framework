# Code Review: Compact closeout after a CLI-recorded Code Review

Gate: CR
Type: Code Review
Status: done
Decision: pass

## Run

- run_id: compact-closeout-cli-review-20261020-01
- related_ur: .agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md (approved)
- reviewer: Claude Code (claude-opus-5-5) plus one independent read-only reviewer agent
- reviewed_at: 2026-10-20
- code_state: fix commit `d6df0a36` merged with main `377b7547`, plus the two test nits below
- supporting_evidence: `CD_TESTS.md`

## Code Review

- decision: pass
- scope: `packages/core/lib/skill-dispatch/compact-continuation.js`; the new regressions in `packages/cli/scripts/compact-continuation-test.js` and `packages/core/test/quick-closeout-command-test.js`; neighbouring owners `packages/core/lib/control-state/run-steps.js` (review and closeout branches), `packages/core/lib/control-state/run-state-document.js` (Artefacts path cell parsing), `packages/core/lib/control-evaluation/closeout-readiness.js`, `packages/core/lib/control-state/run-seal-compute.js`; the payload baseline re-pin and the re-recorded compatibility evidence.
- findings: two test-precision findings, both resolved (see Normalized Findings).
- missing_evidence: CI runs pending; file-symlink assertions skipped on this Windows machine and covered by Linux CI.
- risks: host-compatibility evidence now names Windows as the recording environment; PR #22 and this branch both move pinned values.
- required_next_step: OR-lite closeout.

### Review evidence

- Condition: `parseArtefactPathCell` trims the cell, so an empty or whitespace-only cell yields `''` and skips the CR binding. A malformed code span also yields `''` but sets `path_format: invalid`, which doctor reports as a block, so `compactContinuation` returns before this branch. A non-empty placeholder such as `-` is still read and fails closed, as before.
- Routes: only `quick_task` reaches the branch; `verified_change` uses its own record branch.
- Closeout writers agree: for `quick_task`, the CLI closeout and `evaluateCloseoutReadiness` require only CR status `done`, so no continuation is offered that a writer then rejects.
- Security: blanking a CR path by hand changes `content_seal` (it covers the full run text), which blocks before any continuation is built. Clearing a bound CR path through the sealed CLI review writer predates this change, and closeout never depended on the CR binding.
- Tests: both regressions failed before the fix with the observed incident and pass after it; they use `execFileSync` without a shell, `process.execPath`, `path.join`, `--json` for parsed CLI output and re-read the revision before each step.
- Pins: the payload baseline grows by exactly the fix's 152 bytes with no headroom; the compatibility evidence differs only in digests, timestamps and recording environment.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | evidence_gap | evidence_obligation | resolved | `quick-closeout-command-test.js`: the CLI lane wrote `CODE_REVIEW.md` and passed `--source` without asserting that the CLI step leaves the CR path empty, so the test did not state its own precondition. | No further action; resolved by asserting the empty CR Artefacts path after the CLI review step. |
| CR-02 | evidence_gap | evidence_obligation | resolved | `quick-closeout-command-test.js`: the CLI lane did not check the run seal after the CLI closeout, unlike the MCP lane. | No further action; resolved by asserting `runSealState(...).status === 'valid'` after the CLI closeout. |
