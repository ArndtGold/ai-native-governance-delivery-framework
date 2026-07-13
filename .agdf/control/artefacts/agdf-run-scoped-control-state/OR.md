# OR: Run-Scoped AGDF Control State

Gate: OR
Report mode: OR-full
Date: 2026-07-13
Status: pass

## Delivered

- Run-scoped control state fully implemented per approved PRD/SD/TP: one canonical `RUN_STATE.md` per
  run under `.agdf/control/runs/<run_id>/`, one shared parser/repository/resolver/writer, explicit
  idempotent legacy migration, explicit non-authoritative legacy projection with drift detection, and
  deterministic all-active aggregation. 20/20 TP tasks (RSC-01 through RSC-20) `fully_done` at original
  QA (2026-07-12), with `Approval: UR`/`PRD`/`SD`/`TP`/`QA` all recorded on 2026-07-11/12.
- **2026-07-13 UAT-preparation delta 1**: live `delivery-map --all-active` surfaced a real blocking
  finding, `AGDF_LEGACY_PROJECTION_DRIFT`. Root cause: `fsyncDirectory()` in
  `create-agdf/lib/control-state/run-state-writer.js` — the sole directory-fsync call site behind every
  canonical write (`atomicWrite`/`writeRun`, used by both run writes and legacy migration/projection) —
  had no Windows platform guard; Windows does not support fsync on a directory file descriptor at all, so
  every canonical write failed outright on that platform. Fixed with a single-line `win32` guard. A
  second, unrelated pre-existing gap in `create-agdf/scripts/control-state-test.js` (a symlink-creation
  fixture aborting the entire test process without Windows Developer Mode/elevation) was fixed by
  skipping only its two dependent assertions with a logged warning on `EPERM`, leaving production
  symlink-rejection logic untouched. Code Review, Clean Implementation Review, Task Plan Review and a
  QA-gate delta decision all `pass`; renewed `Approval: QA` recorded on 2026-07-13.
- **2026-07-13 UAT-preparation delta 2**: a live UAT demonstration (full scaffold, two active runs)
  found that `doctor`, `gate-check` and `delivery-map` (single-run path, no `--run`/`--all-active`)
  crashed with an uncaught `AGDF_ACTIVE_RUN_AMBIGUOUS` exception and a raw stack trace instead of the
  structured `--json` finding this run's own PRD/TP required (RSC-09/RSC-10). Root cause: `readRunState()`
  called `resolveRuns()` with no try/catch, and none of the three CLI evaluators caught it either. Fixed
  at the single root (`readRunState` returns a `resolution_error` instead of throwing;
  `evaluateDoctor` turns it into one `block` finding via the existing `addFinding` mechanism), with a
  permanent regression test added covering `doctor`/`gate-check`/`delivery-map` together. QA-gate decision
  `pass` (no separate CR/Clean/TP-Review cycle repeated for this narrower, already double-verified fix —
  a documented, not silent, judgment call).
- `Approval: UAT` provided on 2026-07-13, accepting the delivered (and now delta-fixed) behavior.
- Three invariants persisted to Context Graph node `CG-RUN-SCOPED-CONTROL-STATE`: Windows directory-fsync
  is unsupported and must be explicitly guarded; symlink-dependent test fixtures must tolerate `EPERM`
  without aborting the whole suite; every CLI entry point that resolves a run must treat the shared
  resolver's typed errors as structured findings, never as uncaught exceptions.

## Intentionally Not Delivered

- Hosted locks, databases, services or cross-repository run registries — explicitly out of scope per TP
  section 5, unchanged.
- Semantic merge of concurrent same-run changes — explicitly out of scope, unchanged.
- A change to gate order, names, exact approval syntax, or decision legality — none introduced by either
  delta.
- Commit, push, PR, or release of any of this run's changes — require separate, explicit user
  instruction per delivery-closeout boundary; nothing has been committed.

## TP Coverage

Original: 20/20 tasks (RSC-01 through RSC-20) `fully_done`, verified in `task-plan-review` on 2026-07-12.
Delta 1 re-verification: RSC-06, RSC-12, RSC-13 reconfirmed `fully_done` with new cross-platform test
evidence; RSC-19 remains `partially_done` — the `create-agdf` package's full smoke-test aggregate still
cannot complete in this local environment because the Codex CLI is not installed on PATH
(`spawnSync codex ENOENT`). This is a pre-existing, unrelated environment dependency, not a control-state
defect, and does not affect the write-path correctness evidence gathered via `test:control-state`,
`delivery-map --all-active`, and the `@agdf/cli` smoke-test, all of which pass. Delta 2 stays inside
RSC-09/RSC-10's already-approved scope (doctor/gate-check integration with the shared resolver); no new
task_id was required.

## Brownfield Fit

`pass`. Both deltas were fixed at their single existing owner module (`run-state-writer.js` for delta 1;
`readRunState`/`evaluateDoctor` in `create-agdf/bin/create-agdf.js` for delta 2) with no new abstraction,
wrapper, or parallel error-handling structure introduced. Clean Implementation Review (delta 1) confirmed
the fix is root-cause-aligned, not a workaround.

## Solution Integrity

Both delta fixes are minimal, single-call-site changes that encode real, permanent platform/behavioral
constraints (Windows cannot fsync a directory handle; CLI entry points must not let resolver ambiguity
escape as an uncaught exception) rather than papering over symptoms. Both now have permanent automated
regression coverage, not just manual verification.

## Evidence

- `delivery-map --all-active`: `block` (`AGDF_LEGACY_PROJECTION_DRIFT`) → `pass`, 0 findings, before/after
  delta 1.
- `test:control-state`: previously unable to complete on this native Windows environment at all; now
  completes end-to-end, including a new permanent regression test for the delta-2 ambiguity-crash fix
  across `doctor`/`gate-check`/`delivery-map`.
- `test:delivery-path-search`, `test:delivery-path-search-unit`, `test:delivery-path-search-generator`,
  `test:routing`, `@agdf/cli` smoke-test: all pass, no regression from either delta.
- `check-runtime-integrity.mjs`: ok (9 skills, 14 control files) throughout.
- `git diff --check`: clean.
- Live `gate-check --json` on this repository: `open` → `UAT` (missing `Approval: UAT`) → `open` → `OR`
  (`missing_approval: none`) after `Approval: UAT`, confirming the gate transition worked exactly as
  designed once the crash was fixed.

## Missing Evidence

`create-agdf`'s full smoke-test aggregate has not completed end-to-end in this local environment due to
the Codex CLI not being installed on PATH — pre-existing, disclosed, unrelated to control-state
correctness. Recommended: run the aggregate in an environment/CI with the Codex CLI present.

## Risks

- PRD/SD never stated an explicit Windows/cross-platform acceptance criterion, which is how the
  directory-fsync gap reached UAT preparation undetected. Mitigated: the invariant is now durable in
  Context Graph so a future change does not silently reintroduce a POSIX-only assumption.
- No existing test previously exercised the CLI (not just the library) with more than one active run and
  no selector, which is how the ambiguity-crash gap also reached UAT preparation undetected. Mitigated:
  permanent regression test added.
- Unclear whether the project's CI (`agdf-guardrails.yml`) runs on native Windows at all; if not, a
  similar platform-specific gap could recur despite the documented invariants. Not resolved in this run;
  worth a follow-up backlog item.

## Retained Fallbacks

None. Both fixes are permanent, root-cause corrections, not temporary workarounds or shims.

## Documentation Impact

None beyond the durable artefacts and Context Graph node updated in this run; no user-facing docs
required changes.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Node now records the original invariants plus three additions from the
  2026-07-13 deltas (Windows directory-fsync; symlink-fixture EPERM fallback; CLI ambiguous-selection
  handling), each with concrete evidence references.

## Required Next Step

Offer delivery closeout (commit-ready handoff summary). Commit, push, or PR require a separate, explicit
user instruction — none has been given yet.

## Quality Outlook

This run's own UAT-preparation step caught two real, previously undetected defects — one a categorical
platform gap (Windows write path), one a missing negative-path test (CLI crash on ambiguity) — which is
itself the strongest available evidence that the gate discipline works as intended: problems surfaced
before UAT acceptance, not after. Suggested follow-up: confirm whether CI runs on native Windows, and if
not, consider adding it so this class of gap is caught automatically rather than by incidental live
demonstration.
