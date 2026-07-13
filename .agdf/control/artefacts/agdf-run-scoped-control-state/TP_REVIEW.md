# Task Plan Review: Run-Scoped AGDF Control State

Status: done
Decision: pass
Reviewed at: 2026-07-12

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| RSC-01 | fully_done | Version-2 schema, typed findings, selector and aggregate fixtures in `control-state-test.js` (high) | none | none |
| RSC-02 | fully_done | Legacy normalization moved to `run-state-parser.js`; package smoke and routing fixtures remain equivalent (high) | none | none |
| RSC-03 | fully_done | Valid, duplicate, malformed-table, identifier, lifecycle, version, revision, UUID and path-mismatch tests (high) | none | none |
| RSC-04 | fully_done | Sorted immediate discovery, zero/many, hidden/path/type and symlink fail-closed behavior (high) | none | none |
| RSC-05 | fully_done | CLI, environment, equal/conflicting, automatic, unknown, missing, ambiguous and all-active selector coverage (high) | none | none |
| RSC-06 | fully_done | Revision token, exclusive write lock, fsync, atomic rename, validation and cleanup assertions (high) | none | none |
| RSC-07 | fully_done | Shared deterministic aggregate with severity precedence and configured/default empty policies (high) | none | none |
| RSC-08 | fully_done | Help and subprocess coverage for commands, selectors and illegal combinations (high) | none | none |
| RSC-09 | fully_done | Doctor selected/all-active integration plus fresh two-run CLI evidence (high) | none | none |
| RSC-10 | fully_done | Gate-check and delivery-map share selected parser/resolver; ambiguity and two-run aggregate evidence pass (high) | none | none |
| RSC-11 | fully_done | Delivery Path Search uses shared resolver and receives CLI `--run`; focused/unit/generator suites pass (high) | none | none |
| RSC-12 | fully_done | Explicit idempotent migration, semantic collision check, readback verification, injected-failure rollback and unchanged legacy assertions (high) | none | none |
| RSC-13 | fully_done | Explicit atomic projection, marker/run/revision/digest validation, source/body drift and mixed-authority handling (high) | none | none |
| RSC-14 | fully_done | Canonical template packaged; init smoke and run-create collision/selector subprocesses pass (high) | none | none |
| RSC-15 | fully_done | Runtime Contract and affected skills use selected canonical state; integrity reports 14 control files (high) | none | none |
| RSC-16 | fully_done | Source sync, docs/site updates, routing smoke and 111-file tarball inspection pass (high) | none | none |
| RSC-17 | fully_done | Workflow invokes `delivery-map --all-active`; equivalent two-run local command passes (high) | none | none |
| RSC-18 | fully_done | `CG-RUN-SCOPED-CONTROL-STATE` exists with resolved reconciliation and no parallel SoT (high) | none | none |
| RSC-19 | fully_done | Focused, migration, projection, concurrency, Git-conflict, smoke, Pages, package, integrity and diff checks pass (high) | none | none |
| RSC-20 | fully_done | Brownfield Analysis and final TP, Clean and Code reviews persisted with no open finding (high) | none | none |

## Summary

- fully_done: 20
- partially_done: 0
- not_done: 0
- out_of_scope_changes: none
- risks: No unresolved TP risk; legacy compatibility remains an intentional, explicit migration boundary.
- required_next_step: Run `qa-gate`; TP Review does not decide QA.

## Delta — 2026-07-13 (post-QA, pre-UAT)

UAT-preparation verification (`delivery-map --all-active`) surfaced `AGDF_LEGACY_PROJECTION_DRIFT`, traced
to an unguarded Windows failure (`EPERM` on directory fsync) in `run-state-writer.js`, the file RSC-06
created. Fixed with a single-line platform guard; a second, unrelated pre-existing gap in
`control-state-test.js` (a symlink fixture aborting the whole test process without Windows Developer
Mode/elevation) was also fixed by skipping only its two dependent assertions on `EPERM`, with a logged
warning, leaving production symlink-rejection logic untouched.

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| RSC-06 | fully_done | Full `test:control-state` suite now completes and passes on this platform after the fix (previously could not complete at all) (high) | none | none |
| RSC-12 | fully_done | Unaffected; migration shares the same now-fixed write primitive, no separate defect found (high) | none | none |
| RSC-13 | fully_done | Drift detection worked exactly as designed — it caught the RSC-06 defect before UAT (high) | none | none |
| RSC-19 | partially_done | `test:control-state` and `@agdf/cli` smoke suites pass; `create-agdf` full smoke-test aggregate still aborts at an unrelated, pre-existing gap: Codex CLI not installed on PATH in this local environment (`spawnSync codex ENOENT`), blocking CLI-installation-flow coverage unrelated to control-state write logic (medium) | Full create-agdf smoke-test aggregate completion on a machine with Codex CLI installed | Low — pre-existing environment dependency, not introduced by this delta; does not affect control-state correctness evidence |

### Delta Summary

- fully_done: RSC-06, RSC-12, RSC-13 (upgraded/reaffirmed)
- partially_done: RSC-19 (unrelated, pre-existing environment gap)
- not_done: none
- out_of_scope_changes: none — fix stays inside RSC-06's already-approved task boundary (`run-state-writer.js`, AC 18); no new task_id or TP amendment required. Note: PRD/SD never stated an explicit Windows/cross-platform acceptance criterion — this delta closes an implicit gap.
- required_next_step: Run `qa-gate` delta decision (see QA_REPORT.md Delta section).
