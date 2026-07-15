# User Requirement: External Agentic Control-Layer Evidence

- work_item: `pages-agentic-control-layer-evidence`
- status: approved
- revision: 1
- date: 2026-07-15
- approval: exact `Approval: UR` received after the in-chat scope draft and placement refinement

## User Need

The public AGDF Pages site should use Mozilla's 2026 State of Open Source AI report as a small independent industry signal for the problem AGDF addresses: the increasingly important control layer around AI models. Mozilla must remain external evidence for the market problem, while AGDF remains the concrete response for coding-agent delivery.

## Required Presentation

Add one small external evidence card immediately after the existing `#race-control` section and before `#proof`.

- label: `Industry signal · Mozilla 2026`
- heading: `Beyond the model`
- body: no more than two short paragraphs
- link: `Read Mozilla’s State of Open Source AI report →`
- target: `https://stateofopensource.ai/`

The copy should explain that Mozilla identifies the agentic harness as the control layer determining what an agent can see, remember and do, then connect that problem framing to AGDF's explicit delivery authority: approved scope, required evidence, human decisions and a clearly defined next allowed step.

## Acceptance Criteria

1. The card appears directly after the race-car/control-system analogy and before Product Proof.
2. The exact label and heading are visible.
3. The body contains at most two short paragraphs plus one source link.
4. Mozilla is presented as independent evidence for the market problem, not as validation of AGDF effectiveness.
5. Existing Pages data ownership, card styling and reveal behavior are reused.
6. No new route, navigation item, component system or runtime behavior is introduced.
7. Pages check/build, rendered-content assertion, source-link validation and `git diff --check` pass.

## Scope Boundary

In scope: concise English Pages copy, the existing `pages/src/data/site.ts` content owner and composition in `pages/src/pages/index.astro`.

Out of scope: AGDF runtime or approval semantics, new research claims, Mozilla endorsement claims, navigation changes, new routes, legal interpretation, commit, push, PR or release.

## Source Evidence

- Mozilla launch article: `https://blog.mozilla.org/en/mozilla/mozilla-state-of-open-source-ai-report/`
- Full report: `https://stateofopensource.ai/`
