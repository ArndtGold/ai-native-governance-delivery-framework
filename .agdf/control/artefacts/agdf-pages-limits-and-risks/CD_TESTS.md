# Code Deliverables And Test Evidence

## Status

- decision: `done`
- verified: `2026-07-15`
- approved plan: `.agdf/control/artefacts/agdf-pages-limits-and-risks/TP.md`

## Deliverables

- `pages/src/data/site.ts` remains the canonical owner for all six non-replacement boundaries, all five operating dependencies, human-responsibility framing and proportional-governance overhead copy.
- `pages/src/pages/index.astro` renders the existing `What AGDF Is Not`, `Limits and operating conditions` and `AI Governance Needs Evidence` sections in the approved order.
- The two limits-card labels now use the explicit supported Tailwind class `text-sm`; the previous undefined `text-xm` fallback was removed within the approved section.
- No new route, component, content owner, runtime behavior or navigation anchor was introduced.

## Automated Evidence

| Check | Result | Evidence |
|---|---|---|
| Pages type/content validation | pass | `npm --prefix pages run check`: 0 errors, 0 warnings, 0 hints |
| Static production build | pass | `npm --prefix pages run build`: 1 page built successfully |
| Control-state doctor | pass | `node create-agdf/bin/create-agdf.js doctor --json --run agdf-pages-limits-and-risks`: 0 findings |
| Content contract | pass | Deterministic assertion found all 11 required items, process-overhead copy and explicit limits typography |
| Section order | pass | Deterministic assertion confirmed `design` → `limits` → `ai-act` |
| Diff format | pass | `git diff --check` returned no findings |

## Responsive Render Evidence

The final local Pages render was inspected directly after the final typography correction:

| Viewport | Layout evidence | Overflow | Visual result |
|---|---|---|---|
| 390 × 844 | one-column section/card layout; 14 px card labels | none (`scrollWidth == clientWidth`) | pass |
| 768 × 1024 | two-column non-replacement list inside stacked primary cards; 14 px card labels | none (`scrollWidth == clientWidth`) | pass |
| 1440 × 900 | two primary cards side by side; two-column non-replacement list; 14 px card labels | none (`scrollWidth == clientWidth`) | pass |

At all three widths, the section was visibly readable, the heading and list content were not clipped, the approved grouping was preserved, and browser console inspection returned no errors or warnings.

## Scope Evidence

- The run-owned implementation remains limited to the existing Pages content and composition owners plus run control artefacts.
- Other dirty worktree paths belong to separate active work and were not modified for this implementation.
- The separately approved Mozilla evidence run has no Pages source implementation and remains blocked until this run is resolved.

## Required Next Step

Refresh TP Review, Clean Implementation Review and Code Review, then run the QA gate.
