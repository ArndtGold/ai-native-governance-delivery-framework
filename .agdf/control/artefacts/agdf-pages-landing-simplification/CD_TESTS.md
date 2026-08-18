# CD+Tests: AGDF Landing Page Simplification

Status: done
Run: `agdf-pages-landing-simplification`
Date: 2026-08-18
Approved basis: PRD Revision 3, SD Revision 3, TP Revision 2

## Delivered Candidate

- replaced the approximately 4,987-word, twenty-section homepage with exactly seven static sections;
- implemented the exact approved audience line, Hero heading, control-layer lead, Formula 1 paragraph,
  responsibility mapping and CTA targets;
- moved the before/after comparison to Problem and retained one four-step primary control loop;
- retained repository-derived evaluation proof, protected public-plugin boundaries and one static Codex image;
- retained the canonical Codex installation command, alternative installation path, handbook and policy links;
- removed homepage client scripts, modal/lightbox/reveal/scroll owners, live GitHub-stat fetching and the
  duplicate Pages skill catalogue;
- added canonical/Open Graph/Twitter metadata and a deterministic landing-page regression suite;
- updated only the source-mode Pages assertions in Runtime Integrity to match the approved concise
  projection and canonical detail owners.

No Pages deployment, live-domain mutation, public-directory action, host claim, VCS delivery or release
was performed.

## Automated Evidence

| ID | Result | Evidence |
|---|---|---|
| LPS-V01 | pass | Pre-change Astro check/build/public-document suite passed; baseline recorded in Brownfield Analysis. |
| LPS-V02–V13 | pass | `npm --prefix pages run test:landing`; positive checks and isolated mutation probes. |
| LPS-V14 | pass | Astro check: 0 errors, 0 warnings, 0 hints. |
| LPS-V15 | pass | Astro static build: four routes. |
| LPS-V16 | pass | Landing-page and public-document tests pass. |
| LPS-V17 | pass | Runtime Integrity: source mode ok, 10 skills and 16 control files; selected-run gate-check reports Doctor pass. |
| LPS-V18 | pass | `git diff --check`; final consumer/retired-fragment scans empty; shared assets retained. |
| LPS-V19–V20 | pass | Exact Hero and Formula 1 boundary assertions plus negative probes pass. |

Measured candidate:

- visible section words: 1,520, inside the 1,500–1,800 editorial target;
- built homepage HTML: 26,036 bytes, down from 163,779 bytes;
- built client scripts: zero, down from 5,621 inline-script bytes;
- unique referenced local images: two (`logo.png`, `codex-agdf-plugin-ui.png`);
- referenced local image bytes: 1,210,792, down from 8,570,997;
- static routes: `/`, `/privacy`, `/terms`, `/support`.

## Visible Evidence

| ID | Result | Observation |
|---|---|---|
| LPS-L01 | pass | 1440x900: Hero fills 800 px, exact hierarchy and both CTAs are visible; no horizontal overflow. |
| LPS-L02 | pass | 390x844: responsive Hero/cards/code/image, native mobile menu and no horizontal overflow. |
| LPS-L03 | pass | Native summary is keyboard-operable and focused state is visibly outlined; link order follows DOM reading order. |
| LPS-L04 | pass | Built homepage contains no script element; all content and native navigation are present in static HTML. |
| LPS-L05 | pass | Audience/problem are explicit before taxonomy; decision, operator and review ownership remains distinguishable; 1,520 words. |
| LPS-L06 | pass | One proof screenshot loads at natural width 3,284 with bounded alt/caption; metadata uses existing `logo.png`. |

## Editorial QA Revision 2

- Replaced specialist phrases with direct first-reader language while preserving the approved Hero,
  product boundaries, evidence classes and public-plugin statements.
- Renamed navigation labels from `Proof` and `Docs` to `Evidence` and `Handbook`.
- Shortened the Problem, control-loop, outcomes, evidence, installation and responsibility copy;
  removed duplicated restart guidance and five specifically guarded unclear phrases.
- Rebuilt and rechecked the candidate at 1,520 visible words. Section-average sentence length is
  11.5–16.6 words; the longest sentence is 29 words in the evidence section.
- Repeated local 1440x900 and 390x844 inspection: exact Hero and seven-section hierarchy remain,
  navigation is correct, images load and no horizontal overflow occurs.
- Astro check/build, focused landing-page tests, public-document tests, Runtime Integrity and
  `git diff --check` pass after the revision.

Visible evidence proves only the local built candidate. It does not prove deployed `agdf.iself.eu`, an
installed host, publisher verification, portal review, directory availability or publication.

## Scope And Reconciliation

- unrelated active runs and worktree paths were not changed;
- `projectStats.ts` and `skills.ts` were deleted after final consumer proof;
- shared image assets remain present;
- source-mode Runtime Integrity no longer requires obsolete detailed Homepage content and instead checks
  canonical evaluation evidence plus handbook, contract and installation destinations;
- Context Graph node `CG-PUBLIC-PLUGIN-DISTRIBUTION` records the concise-projection and detail-owner invariant.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The one-model homepage and homepage-to-handbook authority boundary are reusable public constraints.
- memory_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`

## Context Graph Output

- context_graph_impact: update_existing_node
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#cg-public-plugin-distribution`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Node now records the seven-section concise projection, canonical detail owners,
  measured candidate evidence and external-state boundary.
