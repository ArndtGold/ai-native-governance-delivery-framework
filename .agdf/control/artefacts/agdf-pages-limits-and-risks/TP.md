# Task And Test Plan

## Document Control

- work item: `agdf-pages-limits-and-risks`
- derived from: `.agdf/control/artefacts/agdf-pages-limits-and-risks/SD.md`
- gate approval: `Approval: TP` pending post-artefact confirmation

## 1. Implementation Tasks

| Task ID | Task | Acceptance mapping | Evidence |
|---|---|---|---|
| PLR-01 | Add the paired limits/dependencies content model to `pages/src/data/site.ts`, including all required boundaries, dependencies and process-overhead framing. | PRD-01, PRD-02, PRD-03, PRD-04; AC-01 through AC-04 | Data diff and content review |
| PLR-02 | Render the new content in `pages/src/pages/index.astro` between the existing boundary and AI-governance evidence sections using existing layout conventions. | PRD-05, PRD-06; AC-05, AC-06 | Template diff and rendered/build evidence |
| PLR-03 | Remove or adjust only exact duplicate public claims if the new section would repeat existing `notFor` or `aiActFit` wording, preserving their distinct semantic roles. | PRD-05; AC-04, AC-05 | Cross-section content review |
| PLR-04 | Confirm no unintended files, routes, anchors, runtime behavior or non-Pages ownership changed. | PRD-06; AC-05, AC-06 | Final diff inspection |

## 2. Verification Tasks

| Task ID | Verification | Acceptance mapping | Evidence |
|---|---|---|---|
| PLR-05 | Run the Pages package validation/build/check commands defined by the repository. | PRD-06; AC-06 | Command results |
| PLR-06 | Inspect the rendered page/build output at mobile, tablet and desktop widths for readable grouping and preserved section flow. | PRD-06; AC-05, AC-06 | Visual/render evidence |
| PLR-07 | Run `npx --yes @agdf/cli@latest doctor --json` and relevant repository guardrails. | PRD-06; AC-06 | JSON and guardrail results |
| PLR-08 | Run `git diff --check` and review the final diff for scope and copy consistency. | PRD-05, PRD-06; AC-05, AC-06 | Clean diff-check and review note |

## 3. Implementation Order

1. PLR-01: define the canonical content data.
2. PLR-02: render the paired section.
3. PLR-03: resolve exact duplication without broad copy rewriting.
4. PLR-04: inspect ownership and scope.
5. PLR-05 through PLR-08: execute build, render, guardrail and diff verification.

## 4. Risk Coverage

| Risk | Covered by |
|---|---|
| Required boundary or dependency is omitted | PLR-01, PLR-06 |
| Copy duplicates or contradicts existing sections | PLR-03, PLR-08 |
| Process overhead sounds like an unqualified product weakness | PLR-01, PLR-06 |
| Layout breaks at a responsive breakpoint | PLR-02, PLR-06 |
| Unintended product/runtime scope expands | PLR-04, PLR-08 |
| Legal/compliance overclaim is introduced | PLR-01, PLR-03, PLR-08 |

## 5. Boundaries

- No AGDF runtime, plugin, gate, control-state or legal-interpretation change is permitted.
- Any copy that claims certification, correctness guarantees or autonomous responsibility requires stopping and returning to scope review.
- Any failing build, visual check, doctor result or diff check requires revise/block rather than silent acceptance.

## 6. Completion Evidence

The slice is complete only when PLR-01 through PLR-08 have traceable evidence, the rendered section is readable and coherent, and the final diff remains limited to the approved Pages content/composition boundary.

## 7. Gate Decision

This Task And Test Plan is ready for user confirmation. After valid post-artefact `Approval: TP`, perform pre-implementation Brownfield Analysis, then CD+Tests.
