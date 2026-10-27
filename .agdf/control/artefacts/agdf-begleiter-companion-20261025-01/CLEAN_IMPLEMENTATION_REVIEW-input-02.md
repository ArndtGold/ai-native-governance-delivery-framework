# Clean Implementation Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: pass
Status: `pass`

## Decision

- decision: pass
- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent
- basis: approved SD, `CLEAN_IMPLEMENTATION_REVIEW-input-01.md` (revise; CIR-F01), `CD_TESTS-input-02.md`, `CODE_REVIEW-input-03.md` and the companion sources and suites.

## Clean Implementation Review

- primary_solution: Unchanged from review 01: a thin host adapter over host-independent modules, wired only through the runtime-profile Claude manifest. The corrections sit in their owning modules:
  - the lifecycle vocabulary in the reader;
  - open and assignable runs in `assignment.mjs`;
  - the folder name in the view model and labels.

  The adapter is unchanged.
- evidence: The companion exports `LIFECYCLES`, and the logic suite asserts that it equals the core `LIFECYCLES`. The mirrored rules are bound to their core owners as before: fields, plugin data directory, chat language, next-step localization and locale set.
- fallbacks_retained: Unchanged and approved: session-only choices (SDD-07), catch paths (SDD-10), the stale snapshot (AC-006) and state-file defaults (CR-F03). The corrections add no fallback. `folderName` falls back to the full root only when the root has no separator.
- workaround_or_shim_risk: Unchanged. The CR-F02 row reading is a documented deviation and is bound to the canonical writers.
- parallel_structure_risk: The approved bounded parser (SDD-04) remains. Its lifecycle vocabulary is no longer a private copy that can drift unnoticed.
- brownfield_fit: Fits. It reuses the core `LIFECYCLES` export as the test reference instead of adding a second definition of closed runs.
- missing_evidence: none for solution integrity.
- required_next_step: Rerun the QA gate.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-F01 | implementation_gap | CD+Tests | resolved | `run-state.mjs` exports `LIFECYCLES` with all four core lifecycles; `claude-companion-test.js` asserts it equals core `LIFECYCLES` from `run-state-parser.js`; restoring the two-value set fails the suite (`CD_TESTS-input-02.md`, mutation check) | none |
