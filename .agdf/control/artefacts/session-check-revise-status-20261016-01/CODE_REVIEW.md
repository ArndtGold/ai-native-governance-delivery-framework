# Code Review: Report doctor status revise in session runtime facts

Gate: CR
Type: Code Review
Status: done
Decision: pass
Reviewer: Claude Code (claude-opus-5-5)
Date: 2026-10-16

## Scope

Diff of `scripts/sync-plugin-runtime.js` (session-check template) and
`packages/cli/scripts/repository-control-startup-test.js`; regenerated projections and re-recorded
host-compatibility evidence as listed in `CD_TESTS.md`.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|

No open findings. One test-robustness issue was found and fixed during review: the first test draft pinned the
exact finding counts (3 and 0), which would break on unrelated changes to doctor's warning set; the test now
asserts the status and, for the gapped run, a positive finding count.

## Checks

- Correctness: the allow-list equals `STATUS_RANK` in `packages/core/lib/control-state/aggregate.js` and the
  single-run status values in `packages/core/lib/control-evaluation/doctor.js:309-311`; `--all-active` returns
  `block` or the aggregate, so every doctor status passes through. Unexpected values still fall back to
  `unknown`; parse failure still yields `unavailable`; no repository still yields `skipped`.
- Removed values (`blocked`, `error`, `failed`, `unknown`, `unavailable`): `doctor` never emits them; the
  bundled validator ships with the same plugin, so no version skew can introduce them. `unknown` remains the
  fallback value, so dropping it from the set changes no output.
- Consumers: `plugins/agdf/scripts/instruction-footprint.mjs` checks only type and shape of `automatic_check`;
  no consumer branches on the removed values (repository-wide search for `automatic_check`).
- All surfaces: the line sits in the shared template part; the Claude/Codex/OpenCode and Copilot generated
  checks carry the identical new line.
- Budgets: Copilot payload 260 files / 2256827 bytes within the unchanged baseline 260 / 2256982;
  `sessionStartBase` budget unchanged; footprint and runtime-integrity suites pass.
- Test quality: the new fixtures exercise the real generated session check and real doctor output (red
  against the previous build, green after regeneration); fixture repositories are verified byte-unchanged,
  matching the existing read-only startup guarantee.
- Scope: no change to doctor, its severities, its aggregation or the runtime-facts shape.

## Decision

- decision: pass
- evidence: `.agdf/control/artefacts/session-check-revise-status-20261016-01/CD_TESTS.md`
- required_next_step: OR-lite closeout.
