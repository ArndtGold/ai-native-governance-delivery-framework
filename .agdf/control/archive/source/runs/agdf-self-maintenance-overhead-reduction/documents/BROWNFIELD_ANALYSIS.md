# Brownfield Analysis: Reduce AGDF's Own Framework-Maintenance Overhead (Pre-Implementation)

Mode: pre_implementation_analysis
Status: done
Date: 2026-07-13
Based on: approved TP

## 1. Decision

`pass`. Every insertion point named in the SD/TP is confirmed to exist exactly as described, with no
parallel or partial pre-existing mechanism to reconcile. Implementation may begin.

## 2. Confirmed Insertion Points

| Task | Insertion point | Confirmed |
|---|---|---|
| OH-01 | `backlogStatusLabels` (create-agdf/bin/create-agdf.js:978), `backlogArtefactLabels` (:995) | Exact location confirmed; `backlogScopeLabels` added as a third parallel `Map`, same file, adjacent |
| OH-02 | `normalizeBacklogStatus` (:1046), `parseBacklogSection` compact-layout branch, `pointer.title = cells[2] ?? ""` at line 1183 | Confirmed exact line; `normalizeBacklogScope` added as a sibling function, called from the same branch on `cells[2]` (read-only regex extraction, does not mutate `pointer.title`) |
| OH-03 | `plugin/control/templates/MASTER_BACKLOG.md` Rules section, 14 existing numbered rules | Confirmed; new rule(s) appended as 15/16, matching existing wording style |
| OH-05 | `plugin/meta/agdf-runtime-contract.md` "Non-Normative Trivial Change Boundary" subsection | Confirmed exact end boundary: insertion point is immediately after the "A `MASTER_BACKLOG.md` entry is required only when..." paragraph and before the next `## Run Status Card` heading |
| OH-06 | Three generated Runtime Contract copies | Confirmed complete set: `create-agdf/generated/plugins/agdf/meta/agdf-runtime-contract.md` (Codex), `create-agdf/generated/.github/skills/agdf-runtime-contract.md` (Copilot), `create-agdf/generated/.opencode/agdf-runtime-contract.md` (OpenCode). Claude reads `plugin/` directly — no fourth copy exists or is needed. |
| OH-08 | `create-agdf/scripts/smoke-test.js` | Confirmed two existing fixture blocks: a valid compact-backlog block (~line 1668, calls `delivery-map` only, no `doctor` call) and an invalid compact-backlog block (~line 1742, calls `doctor` and asserts a `requiredCode` list including `AGDF_BACKLOG_STATUS_UNKNOWN`/`AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN` at lines 1764/1767). The invalid block is the correct extension point for the new `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` code (add a bad bracket tag to its "Invalid compact backlog" Work item cell, add the new code to `requiredCode`). The valid block should also gain one row with a *correct* tag (e.g. `[framework-maintenance]`) to positively demonstrate no spurious finding — this requires adding a `doctor` call to that block, a small, justified extension of test coverage, not a new mechanism. |

## 3. Current Coverage

`not_done` for both remaining candidates, confirmed via `grep -rn "backlogScopeLabels\|normalizeBacklogScope\|AGDF_BACKLOG_SCOPE"` across `create-agdf/` and `plugin/` returning zero matches — clean slate, no partial or abandoned prior attempt to reconcile.

## 4. Reuse Strategy

`extend` for both candidates, confirmed viable with no deviation from the SD's plan:
- Candidate 3 (backlog scope): extends the existing three-tier vocabulary-enforcement pattern
  (`backlogStatusLabels`/`backlogArtefactLabels` → `+backlogScopeLabels`) with the same `addFinding`
  call shape already used for the other two.
- Candidate 4 (boundary criterion): extends the existing Trivial Change Boundary subsection in place;
  the existing generation/propagation mechanism (`sync-package-assets.js`) requires no code change, only
  a re-run after the canonical source edit.

## 5. Change Impact

- Files/modules: `create-agdf/bin/create-agdf.js`, `plugin/control/templates/MASTER_BACKLOG.md`,
  `plugin/meta/agdf-runtime-contract.md`, `create-agdf/scripts/smoke-test.js`, this repository's own
  `.agdf/control/MASTER_BACKLOG.md` and `.agdf/control/CONTEXT_GRAPH.md`.
- Interfaces: one new `doctor` finding code (additive; does not change any existing finding's shape).
  No CLI flag change.
- Data model/migrations: none.
- Backwards compatibility: confirmed — absent `Scope` tags produce no finding (by construction of
  `normalizeBacklogScope`, which only fires on a present-but-unrecognized bracket, mirroring
  `normalizeBacklogStatus`'s existing `filled(cleaned)` guard at line 1052).
- Regression tests: `smoke-test.js` extension is additive; no existing assertion is modified or removed.
- Side effects: none identified beyond the intended new finding and documentation text.

## 6. Parallel-Structure Risk

None. Confirmed via direct grep that no `backlogScopeLabels`/`normalizeBacklogScope`/
`AGDF_BACKLOG_SCOPE_*` symbol exists anywhere yet, and no second vocabulary-enforcement code path exists
outside `create-agdf/bin/create-agdf.js`'s existing three (soon four) `Map`s.

## 7. SoT / Runtime / Product-Semantics Drift

None. No change to gate order, approval formulas, or product-facing behavior.

## 8. Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: not_applicable (deferred to OH-07, per TP)
- context_graph_required_action: none at this stage; OH-07 will update the node directly
- context_graph_gate_effect: none

## Required Next Step

Begin OH-01 (add `backlogScopeLabels`), then proceed through OH-02 → OH-09 in the TP's stated execution
order. After CD+Tests, run Task Plan Review, Clean Implementation Review and Code Review (second half of
OH-10) before QA.
