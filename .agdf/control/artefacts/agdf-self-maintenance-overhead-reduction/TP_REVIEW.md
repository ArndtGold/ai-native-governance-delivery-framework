# Task Plan Review: Reduce AGDF's Own Framework-Maintenance Overhead (Narrowed Slice)

Status: done
Decision: pass (after implementation completion; initial pass was partial pending OH-08/09/10 completion)
Reviewed at: 2026-07-13

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| OH-01 | fully_done | `backlogScopeLabels` Map present in create-agdf/bin/create-agdf.js, adjacent to the two existing vocabulary maps; exercised successfully by every `doctor`/`delivery-map` call run against this repository and the standalone verification script (high) | none | none |
| OH-02 | fully_done | `normalizeBacklogScope` wired into `parseBacklogSection`'s compact branch; standalone verification script confirmed all three cases (recognized tag -> `framework_maintenance`, absent tag -> `""`, bogus tag -> `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN`) (high) | none | none |
| OH-03 | fully_done | `plugin/control/templates/MASTER_BACKLOG.md` Rules 15-16 added, consistent wording/numbering with existing Rules 12-14 (high) | none | none |
| OH-04 | fully_done | This repository's own live `.agdf/control/MASTER_BACKLOG.md` Active Backlog row carries `[framework-maintenance]`; `doctor --json` on the real repository confirms 0 findings (high) | none | none |
| OH-05 | fully_done | `plugin/meta/agdf-runtime-contract.md` diff confirms the exact four-condition, fail-closed wording including the SD-3.4-corrected condition 1 (high) | none | none |
| OH-06 | fully_done | `sync-package-assets` run; grep confirms the new criterion text present verbatim in all three generated copies (Codex/Copilot/OpenCode) (high) | none | none |
| OH-07 | fully_done | `CONTEXT_GRAPH.md` node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` diff shows new invariant/evidence/decision text added, nothing existing removed (high) | none | none |
| OH-08 | partially_done | Fixture/assertion code written correctly; logic independently proven via a standalone script exercising the identical fixtures against the real CLI, all three cases passing (medium-high on correctness) | The TP's own literal required evidence — `npm --prefix create-agdf run smoke-test` passing with the new assertion included — was not produced because the suite fails at an earlier, unrelated, pre-existing step (Windows `execFileSync` gap in a fake Codex-CLI test fixture; same class of gap the actual product's `installCodexGlobalPlugin()`/`installClaudeGlobalPlugin()` use, now tracked as its own separate follow-up investigation) | Low/P2 — disclosed, pre-existing, unrelated to this run's new code |
| OH-09 | partially_done | `check-runtime-integrity.mjs` ok, `test:control-state` passes, `@agdf/cli` smoke-test passes, `doctor --json` on this repository passes 0 findings, `git diff --check` clean (high for everything that ran) | `create-agdf`'s own full smoke-test aggregate completing end-to-end (blocked at the same pre-existing gap as OH-08) | Low/P2 — identical carried-forward, pre-existing gap |
| OH-10 | fully_done | Pre-implementation Brownfield Analysis (`pass`), this Task Plan Review, Clean Implementation Review (`pass`) and Code Review (`pass`) all complete (high) | none | none |

## Summary

- fully_done: OH-01, OH-02, OH-03, OH-04, OH-05, OH-06, OH-07, OH-10
- partially_done: OH-08, OH-09
- not_done: none
- out_of_scope_changes: none — all changes map directly to TP tasks; the Windows `execFileSync` investigation was explicitly routed elsewhere, not folded into this run's scope
- risks: The `create-agdf` full smoke-test aggregate's Windows incompatibility is a repeated, carried-forward gap across two consecutive runs in this repository; low severity for this slice's correctness (independently proven), tracked as its own separate investigation task
- required_next_step: Proceed to `qa-gate` for the formal QA decision, which must weigh the OH-08/OH-09 evidence gap (logic-verified but not end-to-end-automated) as low/P2, not blocking
