# Solution Design: Clarify the Narrow Bug Track on Pages

## Status

- status: approved
- approval: `Approval: SD`
- approval date: 2026-07-14
- derived_from: `PRD.md`

## Design Decision

Edit only the existing second object in `pages/src/data/site.ts` `requirementPaths`. Keep its object shape and position unchanged so `pages/src/pages/index.astro` continues rendering the established three-card layout without a component or markup change.

## Copy Contract

The object will communicate four points in compact card copy:

1. label: `Narrow Bug Track`;
2. trigger: a reproducible, bounded defect with explicit reproduction, expected behavior and fix boundary;
3. path: record defect facts, verify the boundary, fix narrowly and test the symptom with evidence;
4. outcome: it is not a gate bypass; required QA, OR and repository approvals remain, while Verified Change is the separate machine-validated compact path.

This summarizes the Runtime Contract without copying its full rule table or creating a new user-facing mode.

## Ownership And Propagation

| Concern | Owner | Decision |
|---|---|---|
| Public card content | `pages/src/data/site.ts` | Edit the existing object only. |
| Card layout | `pages/src/pages/index.astro` | Preserve unchanged; inspect rendering after data update. |
| Canonical semantics | `plugin/meta/agdf-runtime-contract.md` | Read-only source of truth; no edit or duplicate policy. |
| Validation | `pages/package.json` | Run existing Pages check and production build. |

## Failure And Compatibility Rules

- Do not add a fourth card, anchor, route or component.
- Do not imply that all repositories require QA/OR; use “required” controls and repository approvals.
- Do not describe Bug Track as a new Mode/Slice Decision or as equivalent to Verified Change.
- If compact card copy cannot make the distinction accurately, stop and return to PRD rather than adding a parallel explainer.

## Test Strategy

1. Inspect the rendered section or its data consumption to confirm the existing three-card layout is preserved.
2. Run `npm --prefix pages run check`.
3. Run `npm --prefix pages run build`.
4. Run `git diff --check` and `node create-agdf/bin/create-agdf.js doctor --json`.

## Required Next Step

Draft the Task Plan and request `Approval: TP`.
