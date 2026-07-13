# Solution Design

## Document Control

- work item: `agdf-pages-limits-and-risks`
- derived from: `.agdf/control/artefacts/agdf-pages-limits-and-risks/PRD.md`
- gate approval: `Approval: SD` pending post-artefact confirmation

## 1. Design Decision

Extend the existing public positioning model in `pages/src/data/site.ts` with one paired limits-and-dependencies content model, then render it in `pages/src/pages/index.astro` between the existing `What AGDF Is Not` section and the AI-governance evidence section. Reuse the current card/grid styling and reveal behavior. Do not create a new route, component system, navigation entry or runtime owner.

## 2. Content Ownership

| Component | Responsibility | Change |
|---|---|---|
| `pages/src/data/site.ts` | Source of truth for public positioning copy | Add structured limits/dependencies content and process-overhead framing. |
| `pages/src/pages/index.astro` | Page composition and visual placement | Render the paired content using existing section/card conventions. |
| Existing `notFor` | Broad non-purpose boundaries | Preserve and remove only exact duplication if required by the final diff. |
| Existing `aiActFit` | Governance evidence and non-certification framing | Preserve its distinct evidence-focused role. |

## 3. Proposed Page Flow

```text
What AGDF Is Not
        |
        v
Limits, Responsibility And Operating Conditions
  - What AGDF Does Not Replace
  - What AGDF Depends On
  - Process-overhead framing
        |
        v
AI Governance Needs Evidence
```

The new section should be visually recognizable as a qualification of the product promise, not as a legal disclaimer detached from the value proposition.

## 4. Content Contract

The rendered copy must communicate:

- architecture, security/privacy, domain, regulatory, testing and human-judgment boundaries;
- control-state, evidence, executed-test, UAT and disciplined-use dependencies;
- the principle that AGDF makes delivery more governable but does not make judgment or responsibility optional;
- the principle that proportional paths reduce, but do not eliminate, process overhead.

## 5. Layout And Compatibility

- Reuse current `max-w`, spacing, border, background, typography and `data-reveal` conventions.
- Use responsive grids that remain readable at mobile, tablet and desktop widths.
- Preserve the existing section IDs and navigation anchors.
- Avoid adding a new reusable component for a single bounded content section.

## 6. Verification Design

1. Review the data and template diff for semantic placement and duplication.
2. Run the Pages package validation/build/check commands defined by the repository.
3. Run relevant repository guardrails and `doctor --json`.
4. Inspect the rendered page or generated build output at responsive breakpoints.
5. Run `git diff --check` and confirm only approved Pages content/composition changed.

## 7. Risks And Handling

- Repetition with `notFor` or `aiActFit`: keep broad non-purpose, paired responsibility/dependency guidance and evidence-specific claims in distinct roles.
- Defensive tone: pair every limit with an operational dependency or proportionality explanation.
- Legal overclaim: preserve explicit non-certification language and avoid legal conclusions.

## 8. Implementation Boundary

Only `pages/src/data/site.ts` and `pages/src/pages/index.astro` may be changed, plus generated/build outputs if the repository's existing Pages workflow requires them. No AGDF runtime or control-state files beyond the delivery artefacts may be changed.

## 9. Gate Decision

This Solution Design is ready for user confirmation. After valid post-artefact `Approval: SD`, create the focused Task Plan. Implementation remains forbidden until `Approval: TP` and pre-implementation Brownfield Analysis are complete.
