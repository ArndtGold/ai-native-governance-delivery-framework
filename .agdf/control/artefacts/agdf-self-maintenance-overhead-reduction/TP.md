# TP: Reduce AGDF's Own Framework-Maintenance Overhead (Narrowed Slice)

Status: approved
Gate: TP
Gate approval: Valid post-artefact `Approval: TP` provided on 2026-07-13
Based on: approved SD
Date: 2026-07-13
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| OH-01 | Add `backlogScopeLabels` vocabulary map to `create-agdf/bin/create-agdf.js`, parallel in shape to `backlogStatusLabels`/`backlogArtefactLabels` (accepts `framework-maintenance`, `external-delivery`) | PRD AC 2 | Unit assertion that both canonical values normalize correctly, case/hyphen/space-insensitive |
| OH-02 | Add `normalizeBacklogScope(cells[2], findings, backlogPath)` and wire it into `parseBacklogSection`'s compact-layout branch (reads the leading `[tag]` from the Work item cell, cell text itself is left intact); add `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` finding, severity `revise` | PRD AC 2, 3 | Fixture: unrecognized bracket tag fires the finding; absent tag and either canonical value do not |
| OH-03 | Document the new `Scope` tag convention in `plugin/control/templates/MASTER_BACKLOG.md` Rules section, mirroring the existing Status/Artefact-label rule wording and numbering | PRD AC 1 | Template diff review; consistent numbering with existing rules 12-14 |
| OH-04 | Worked example: tag this repository's own live `.agdf/control/MASTER_BACKLOG.md` Active Backlog row for `agdf-self-maintenance-overhead-reduction` itself with `[framework-maintenance]` | PRD AC 4 | `doctor --json` on this repository shows 0 findings after the tag is added |
| OH-05 | Append the Narrow Code-Fix Criterion (SD section 3.3, with the section-3.4-corrected condition 1 wording: "single function or a function together with its direct, necessarily-coupled caller") to the Non-Normative Trivial Change Boundary subsection in `plugin/meta/agdf-runtime-contract.md` | PRD AC 5, 6 | Diff review confirms explicit fail-closed, all-four-conditions wording; no existing boundary text removed or weakened |
| OH-06 | Run `npm --prefix create-agdf run sync-package-assets` and diff-review the three generated Runtime Contract copies (`create-agdf/generated/plugins/agdf/meta/agdf-runtime-contract.md`, `create-agdf/generated/.github/skills/agdf-runtime-contract.md`, `create-agdf/generated/.opencode/agdf-runtime-contract.md`) to confirm verbatim propagation; no code change to the sync script itself | PRD AC 5 | Propagation diff shows identical new text across all three generated copies |
| OH-07 | Update Context Graph node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` in `.agdf/control/CONTEXT_GRAPH.md`: add the new criterion, its rationale, and the SD 3.4 worked-evaluation finding (including the condition-1 wording correction) | PRD AC 9 | Node diff shows new invariant/evidence entries, no existing entries removed |
| OH-08 | Add a focused fixture to `create-agdf/scripts/smoke-test.js` (the existing home of `AGDF_BACKLOG_STATUS_UNKNOWN`/`AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN` coverage) proving `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` fires only for an unrecognized tag | PRD AC 2, 3 | `npm --prefix create-agdf run smoke-test` passes with the new assertion included |
| OH-09 | Run full validation: `check-runtime-integrity.mjs`, `test:control-state` (regression safety net, unaffected by this slice), `create-agdf` and `agdf` package smoke-tests, `doctor --json` on this repository | PRD AC 8 | All pass; `doctor --json` on this repository shows `pass`, 0 findings |
| OH-10 | Pre-implementation Brownfield Analysis (`pre_implementation_analysis` mode) before OH-01, then Task Plan Review, Clean Implementation Review and Code Review after CD+Tests, before QA | Governance coverage | Persisted reports with no unresolved blocking finding |

## 2. Execution Order And Dependencies

1. OH-10 pre-implementation Brownfield Analysis confirms the exact call sites and existing vocabulary
   pattern boundary before any edit.
2. OH-01 and OH-02 implement the backlog-scope mechanism (OH-02 depends on OH-01's map existing).
3. OH-03 documents the convention (can proceed in parallel with OH-01/02).
4. OH-04 applies the worked example once OH-01-03 are in place.
5. OH-05 and OH-06 implement and propagate the Trivial Change Boundary criterion (independent of OH-01-04).
6. OH-07 updates Context Graph once OH-05 wording is final.
7. OH-08 adds regression coverage once OH-01/02 are implemented.
8. OH-09 runs the full validation sweep last.
9. OH-10 (post-implementation half) runs TP Review, Clean Implementation Review and Code Review before QA.

No task may introduce a second backlog-vocabulary enforcement mechanism or a second Trivial Change
Boundary location to unblock a later task.

## 3. Test Plan

### Focused unit/fixture coverage

- `backlogScopeLabels` normalization (OH-01).
- `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` fires only for unrecognized tags, not absent ones (OH-02, OH-08).

### Integration/smoke coverage

- `create-agdf` smoke-test (includes OH-08's new fixture).
- `check-runtime-integrity.mjs`.
- `agdf` package smoke-test (regression safety net).
- `test:control-state` (regression safety net; unaffected by this slice, run to confirm no cross-contamination).

### Required commands

- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm --prefix create-agdf run smoke-test`
- `npm --prefix agdf run smoke-test`
- `npm --prefix create-agdf run test:control-state`
- `node create-agdf/bin/create-agdf.js doctor --json`
- `npm --prefix create-agdf run sync-package-assets` (propagation check)
- `git diff --check`

## 4. Brownfield Scope

Pre-implementation Brownfield Analysis must inspect and freeze the reuse boundary for:

- `create-agdf/bin/create-agdf.js` (`backlogStatusLabels`, `backlogArtefactLabels`, `parseBacklogSection`,
  `normalizeBacklogStatus`, `addFinding`)
- `plugin/control/templates/MASTER_BACKLOG.md` (Rules section)
- `.agdf/control/MASTER_BACKLOG.md` (this repository's own live instance)
- `plugin/meta/agdf-runtime-contract.md` (Non-Normative Trivial Change Boundary subsection)
- `create-agdf/scripts/sync-package-assets.js` (propagation mechanism, read-only verification, no edit)
- `create-agdf/scripts/smoke-test.js` (existing backlog-vocabulary fixture location)
- `.agdf/control/CONTEXT_GRAPH.md` node `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- Current staged and unstaged control artefacts, which must not be overwritten or normalized away

## 5. Out Of Scope

- Any change to `check-runtime-integrity.mjs`'s manifest field-check logic (confirmed already sufficient
  by Brownfield Review).
- Any change to `sync-package-assets.js` itself (confirmed already sufficient by Brownfield Review).
- A computed framework-maintenance-vs-external-delivery ratio metric or dashboard (PRD Non-Goal).
- Retroactive `Scope` tagging of `Completed / Superseded Pointers` rows (PRD Non-Goal).
- Adding Windows to CI (`agdf-guardrails.yml` runs on `ubuntu-latest`) — flagged as a separate, unrelated
  follow-up in Brownfield Review, not part of this slice.

## 6. Risks And QA Classification

| Risk | QA effect | Required evidence |
|---|---|---|
| `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` fires on an absent tag (over-eager) | block | Fixture proving absent-tag rows produce zero findings |
| A second, parallel scope-vocabulary mechanism is introduced instead of extending the existing one | block | Code review confirms single `backlogScopeLabels` map, same `addFinding` mechanism |
| Trivial Change Boundary wording becomes a prose judgment call instead of a fail-closed allow-list | block | Diff review confirms explicit four-condition list, "any ambiguity keeps full ceremony" framing preserved |
| Generated Runtime Contract copies drift from canonical after the edit | block | OH-06 propagation diff evidence |
| Context Graph node reconciliation remains open at closeout | revise | Concrete node diff before QA/OR |

## 7. Acceptance Traceability

| PRD acceptance range | Primary tasks | QA evidence owner |
|---|---|---|
| AC 1 | OH-03 | Template diff review |
| AC 2, 3 | OH-01, OH-02, OH-08 | Fixture and smoke-test evidence |
| AC 4 | OH-04 | This repository's own `doctor --json` evidence |
| AC 5, 6 | OH-05, OH-06 | Diff review and propagation evidence |
| AC 7 | (covered in SD section 3.4, already persisted) | SD.md worked evaluation |
| AC 8 | OH-09 | Full validation suite evidence |
| AC 9 | OH-07 | Context Graph diff |

## 8. Next Step

Review this TP and approve only after it exists with:

`Approval: TP`
