# CD+Tests: Clarify the Narrow Bug Track on Pages

## Status

- status: `done`
- based_on: `TP.md`
- date: 2026-07-14

## Delivered Implementation

- Updated only the existing second `requirementPaths` object in `pages/src/data/site.ts`.
- Renamed the card to `Narrow Bug Track`.
- Clarified that the track applies to a reproducible, bounded defect with explicit evidence and a fix boundary.
- Stated that it is not a gate bypass: required QA, OR and repository approvals remain.
- Distinguished Verified Change as the separate machine-validated compact change path.
- Preserved the data shape, three-card order and the existing `index.astro` renderer without changing plugin or Runtime Contract files.

## TP Coverage

| task_id | status | evidence |
|---|---|---|
| NBT-01 | done | Existing second data object now contains the approved label, trigger, path and outcome. |
| NBT-02 | done | Static assertion confirms the unchanged `Quick Task` → `Narrow Bug Track` → `Controlled Delivery` order; `index.astro` remains unchanged and maps the data array. |
| NBT-03 | done | Static assertion confirms reproducible-defect wording, retained required controls and the machine-validated Verified Change distinction; no `plugin/**` or Runtime Contract source changed for this scope. |
| NBT-04 | done | Astro check/build, doctor and diff checks pass. |

## Test Evidence

- `npm --prefix pages run check` → pass: 0 errors, warnings and hints.
- `npm --prefix pages run build` → pass: static `index.html` built successfully.
- Focused Node assertion → pass: exact three-card order and all required copy fragments present.
- `node create-agdf/bin/create-agdf.js doctor --json` → pass: 0 findings.
- `git diff --check` → pass.

## Intentionally Not Performed

- No Runtime Contract, plugin, gate, component, route, anchor, navigation or card-count change.
- No commit, push, pull request, publication or release.

## Required Next Step

Task Plan Review, Clean Implementation Review and Code Review pass; run QA Gate.
