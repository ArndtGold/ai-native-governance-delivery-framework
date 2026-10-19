# TP Review: MCP ergonomics baseline evaluation

Type: TP Review
Status: done
Decision: pass

## Run

- run_id: mcp-ergonomics-baseline-20261016-01
- related_tp: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md (approved, 13 tasks, 24 scenarios, AC-001 to AC-015)
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-17
- code_state: reviewed on `16d08888` plus this run's change set (114 paths, all within SDD-014); re-verified after merging `origin/main` on 2026-10-19 (see Integration With main)
- supporting_evidence: `evidence/IMPLEMENTATION_STATUS.md`, `CD_TESTS.md`, `CODE_REVIEW.md`, `evidence/CR_FIX_VERIFICATION.json`, `evidence/CR13_NATIVE_SMOKE.md`, `evidence/BASELINE_COMPARE.json`, `evidence/CLEAN_CHECKOUT_VERIFICATION.md`, `evals/mcp-ergonomics/baselines/2026-10-16-win32-x64/`
- note: recorded after QA and UAT approval because the run reached OR without this internal step; the review ran the one TP scenario that had never been executed (SCN-019) and found a README gap, which was corrected (TPR-01, TPR-02).

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Branch from `main` before implementation (`IMPLEMENTATION_STATUS.md`); the owner moved the work to `feat/mcp-ergonomics-baseline-20261016-01` at `16d08888` after PR #17 and #18; protocol run C at `16d08888` equals run A at `5ff1b512` in every non-timing metric (`CD_TESTS.md`). Confidence: medium (owner action, git state). | none | none |
| T-002 | fully_done | `evidence/TOOLS_LIST_BEFORE.json` captured before any other change: 7 `agdf` tools, cockpit hidden without and 2 tools with UI capability. Confidence: high. | none | none |
| T-003 | fully_done | `evidence/SPIKE_T003.json`, `SPIKE_T003_FINDINGS.md`; MCP-only flags and stream-json fields verified; owner decisions on terminal, tool sets and ToolSearch recorded. Confidence: high. | none | none |
| T-004 | fully_done | `scripts/native-probes/lib/claude-session.mjs` shared by `claude-host-e2e.mjs`, the native runner, the spike and the re-evaluation script; parser and legacy-equivalence unit tests pass (SCN-010, SCN-015). Confidence: high for the TP evidence. | The native host E2E probe was not re-run after the Code Review changed the shared module; the TP maps T-004 to unit tests only. | none; stated as qualification limit |
| T-005 | fully_done | `METRICS.md`, `lib/normalize.js`, `lib/classify.js`; classification and normalization tests pass (SCN-003, SCN-006). Confidence: high. | none | none |
| T-006 | fully_done | Fixtures F1 to F5, `call-matrix.v1.json` (32 calls after CR-12), protocol runner; every call targets a fresh fixture root (SCN-001, SCN-002). Confidence: high. | none | none |
| T-007 | fully_done | `tasks.v1.json` T1 to T6, predicates with positive and negative cases (T6 corrected in CR-01), isolation manifests, scheduler with rounds and cap (SCN-008, SCN-009, SCN-024). Confidence: high. | none | none |
| T-008 | fully_done | `report.js`, `findings-map.v1.json` (twelve findings), promote with fail-closed redaction, compare for protocol, native and `tools/list` (SCN-005, SCN-016, SCN-021). Confidence: high. | none | none |
| T-009 | fully_done | 37 unit tests in `test:mcp-ergonomics`; root scripts registered; verify-ci repository stage `mcp-ergonomics` after `mcp-dependencies` (SCN-007, SCN-017). SCN-019 executed for the first time in this review: failed in a clean checkout until the README setup was corrected, then passed (`evidence/CLEAN_CHECKOUT_VERIFICATION.md`). Confidence: high. | Native command verified with `--dry-run` in the clean checkout; paid sessions ran from the working tree. | none after TPR-01 and TPR-02 |
| T-010 | fully_done | Protocol runs A/B, later D/E, identical in every non-timing metric; latency as median and p95 (SCN-004, `COMPARISONS.json`, `CR_FIX_VERIFICATION.json`). Confidence: high. | none | none |
| T-011 | fully_done | Native run 3: 48 of 48 sessions, 9.48 USD, `complete: true`, two sessions per cell, isolation manifests unchanged, credential copy removed (SCN-011, SCN-013, SCN-014); MCP-only isolation verified per session (SCN-012). Confidence: high. | Two repetitions show a range, not a spread (as planned). | none |
| T-012 | fully_done | Baseline and report promoted with provenance (SCN-018, SCN-022); compare `unchanged` for protocol run E and native run 3, and again for a protocol run from the clean checkout. Files are committed-ready (SCN-020); committing is the owner's step (TP section 5). Confidence: high. | none | none |
| T-013 | fully_done | `tools/list` byte-identical to T-002 (`TOOLS_LIST_AFTER.json`); diff scope within SDD-014, nothing under `packages/` (after the main merge one more line in `scripts/ci-plan.mjs`, see Integration With main); build, `test:verification`, `test:host-compatibility`, `compatibility:check`, mcp-server `test:package` and `test:sdk-digest` pass (SCN-023). Confidence: high. | none | none |

## Acceptance Criteria Coverage

| criterion_id | status | basis |
|---|---|---|
| AC-001 to AC-005 | done | SCN-001 to SCN-009 |
| AC-006 to AC-009 | done | SCN-010 to SCN-014 |
| AC-010, AC-011 | done | SCN-015 to SCN-018 |
| AC-012 | done | SCN-019 (clean checkout, after TPR-01) and SCN-020 (committed-ready; the commit itself is the owner's action) |
| AC-013 to AC-015 | done | SCN-021 to SCN-024 |

UX Intent Fidelity: not applicable; the approved PRD contains no UX criteria.

Context Graph: `context_graph_required_action: link` is an intentionally open gap until OR, visible in `QA_REPORT.md` and the Brownfield Analysis; no TP task depends on it.

## Summary

- fully_done: 13 of 13 (T-001 to T-013)
- partially_done: none
- not_done: none
- out_of_scope_changes: one line in `scripts/ci-plan.mjs`, outside the SDD-014 path list (see Integration With main); no product code. Every other changed or new path lies within the SDD-014 scope; the README correction after UAT stays inside `evals/`.
- risks: the README setup changed after QA and UAT approval (documentation only, no code, no metric). The native host E2E probe was not re-run after the shared session module changed. The native command was verified in the clean checkout with `--dry-run` only.
- required_next_step: record the Clean Implementation Review, then the OR closeout once AGDF permits both internal steps at OR.

## Integration With main

- date: 2026-10-19
- change: `origin/main` was merged into `feat/mcp-ergonomics-baseline-20261016-01` for PR #21 (Cockpit plugin integration #19, CI functional groups #20 and `1ff067c7`). Conflicts were only in `.agdf/control/MASTER_BACKLOG.md` (this run's backlog summary; the current one was kept) and in the generated host-compatibility evidence, which was re-recorded after `npm run build:prepare` (56 scenarios, 0 failed).
- out_of_scope_change: main's new CI check areas in `scripts/ci-plan.mjs` require exactly one owner per check stage, so without an owner the approved repository-lane stage `mcp-ergonomics` (SDD-013, T-009) made the CI plan fail. One line registers the stage in the existing `compatibility` area, next to `host-compatibility`; it then runs in `linux-22-checks-compatibility` after `mcp-dependencies`. SDD-014's path list predates this owner table and does not name `scripts/ci-plan.mjs`.
- evidence on the merged tree: `npm run build`, `test:mcp-ergonomics` 37 of 37, `test:verification` 15 of 15, `scripts/ci-plan-test.mjs` 8 of 8, `test:host-compatibility` and `compatibility:check` pass; a protocol run compares `unchanged` against the baseline and `tools/list` is identical to the T-002 capture, so main's changes did not alter the measured interfaces.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | implementation_gap | CD+Tests | resolved | `evals/mcp-ergonomics/README.md` named only `npm run build`; in a clean checkout all three documented commands and 4 unit-test entries failed with `ERR_MODULE_NOT_FOUND` (`@modelcontextprotocol/client` from the separate `packages/mcp-server` lock), against AC-012. The README now has a Setup section with `npm ci --ignore-scripts`, `npm run build`, `npm --prefix packages/mcp-server ci --ignore-scripts`; attempt 2 in `evidence/CLEAN_CHECKOUT_VERIFICATION.md` passes. | none |
| TPR-02 | evidence_gap | evidence_obligation | resolved | SCN-019 (root scripts from a clean checkout after build) had never been executed; QA listed it as a limit only. Executed in this review on a fresh clone plus the change set: tests 37 of 37, protocol run, compare `unchanged`, native `--dry-run` 48 cells (`evidence/CLEAN_CHECKOUT_VERIFICATION.md`). | none |
