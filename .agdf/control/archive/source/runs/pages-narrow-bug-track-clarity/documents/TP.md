# Task Plan: Clarify the Narrow Bug Track on Pages

## Plan Meta

- workstream: `pages-narrow-bug-track-clarity`
- derived_from: `PRD.md`, `SD.md`
- mode: `structured_slice`
- implementation_permission: granted via `Approval: TP` on 2026-07-14

## Tasks

| Task ID | Change | Acceptance evidence |
|---|---|---|
| NBT-01 | Update the existing second `requirementPaths` object with the approved Narrow Bug Track identity, trigger, path and outcome. | Data retains the three-card object shape and uses the approved public distinction. |
| NBT-02 | Preserve the existing `index.astro` data-driven layout and inspect rendered/data evidence for unchanged card count/order. | No new component, route, anchor or fourth card; existing section still consumes three entries. |
| NBT-03 | Verify public wording against the canonical Bug Lightweight and Verified Change boundaries without changing the Runtime Contract. | Focused source assertions show retained-controls wording and Verified Change distinction; no `plugin/**` or runtime-contract change. |
| NBT-04 | Run Pages and repository validation, then record visible evidence. | Pages check/build, `doctor --json` and `git diff --check` pass. |

## Test Plan

1. Assert the `requirementPaths` array still has three entries in the original order and the second label is `Narrow Bug Track`.
2. Assert the second card names reproducible defect evidence, retained required controls and the distinct machine-validated Verified Change path.
3. Run `npm --prefix pages run check` and `npm --prefix pages run build`.
4. Run `node create-agdf/bin/create-agdf.js doctor --json` and `git diff --check`.

## Guardrails

- No Runtime Contract, plugin, gate or approval behavior change.
- No new delivery mode, route, component, anchor or card.
- Do not claim QA/OR universally apply; refer only to required controls and repository approvals.
- No commit, push, pull request or release.

## Approval

- status: approved
- approval: `Approval: TP`
- approval date: 2026-07-14

## Required Next Step

Run pre-implementation Brownfield Analysis before CD+Tests.
