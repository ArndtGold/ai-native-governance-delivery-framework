# SD: Static Seven-Section AGDF Landing Page

Status: approved
Gate: SD
Gate approval: Revision 3 approved on 2026-08-18; Revision 1 approval remains historical
Revision: 3
Date: 2026-08-18
Run: `agdf-pages-landing-simplification`

## 1. Design Outcome

Refactor the existing Astro homepage in place into seven static content sections backed by one
landing-page data model. Preserve the visual identity and canonical content owners while removing
competing explanation models, unused interactive surfaces and build-time social-stat requests.

The resulting homepage has:

- one product position;
- one first-viewport problem framing for the intended engineering audience;
- one four-step control loop;
- one progressive first-reader journey;
- no client-side JavaScript requirement;
- canonical links for every detailed topic removed from the homepage;
- deterministic section, copy, link, metadata and payload validation.

No runtime, plugin, gate, mode, policy, public-directory or deployment architecture changes.

## 2. Existing Owner Mapping

| Concern | Existing owner | Design action |
|---|---|---|
| Product identity, URLs and version | `plugin/meta/agdf-plugin.definition.json`; `pages/src/data/site.ts` | Reuse approved values; do not introduce a listing-specific copy owner. |
| Landing content | `pages/src/data/site.ts` | Refactor many parallel exports into one typed `landingPage` projection plus the existing global `site` identity. |
| Visible composition | `pages/src/pages/index.astro` | Replace twenty content bands with exactly seven sections in approved order. |
| Metadata and document shell | `pages/src/layouts/BaseLayout.astro` | Add explicit canonical/Open Graph/Twitter inputs and remove homepage-only interaction JavaScript. |
| Visual identity | existing global CSS, `Icon.astro`, logo assets and surface classes | Reuse colour, type, cards and responsive spacing; prune only CSS made obsolete by removed interactions. |
| Detailed operation guidance | bilingual handbook and `INSTALL.md` | Link from concise summaries; do not copy detailed workflow policy back into Pages. |
| Public policy meaning | root policy documents plus `/privacy`, `/terms`, `/support` adapters | Keep routes and source links unchanged. |
| Proof values | `evaluationEvidence`, plugin definition and repository sources | Keep repository-derived counts and evidence boundaries; no build-time live social metrics. |
| Validation | Astro check/build and `pages/scripts/public-documents-test.mjs` | Extend with one focused landing-page validator rather than a parallel framework. |

## 3. Landing Data Model

`pages/src/data/site.ts` retains `site` for shared identity and adds one `landingPage` object with this
bounded shape:

```text
landingPage
  navigation[]
  hero
    audience
    problemFrame
    productPosition
    roleMapping
  problem
  controlLoop.steps[4]
  outcomes[3]
  proof
    metrics
    surfaces
    publicPluginBoundary
    optionalScreenshot
  installation
  responsibility
    limits
    project
    links
```

The data model is a presentation projection, not a second runtime or product-policy owner. Exact
approval values, complete gate chains, mode/depth matrices, full skill descriptions and regulatory
detail do not live in this object.

Homepage-only parallel exports currently consumed only by `index.astro` are removed after the new
projection is wired and consumer search proves no remaining use. `projectStats.ts` and `skills.ts`
are removed if they have no remaining consumer: live GitHub social counts and a duplicate skill
catalogue are not part of the concise homepage. `evaluationEvidence.ts` remains because it derives
proof directly from canonical plugin/evaluation sources.

## 4. Composition And Stable Sections

`index.astro` renders one `<main data-homepage>` containing exactly these non-nested major sections:

| Order | ID | Composition |
|---:|---|---|
| 1 | `home` | Problem-first Formula 1 framing, explicit engineering-team audience, approved position, agent/AGDF/human role mapping, **Install AGDF** primary CTA and GitHub/docs secondary actions. |
| 2 | `problem` | Two concise cards: uncontrolled agent continuation and AGDF-governed progression. |
| 3 | `how-it-works` | Four ordered control-loop steps and one handbook link. |
| 4 | `outcomes` | Three cards for controlled scope, evidence-backed decisions and auditable closeout. |
| 5 | `proof` | Repository-derived metrics, concise compatibility/public-plugin boundaries and at most one static proof screenshot. |
| 6 | `setup` | **Recommended for Codex**, canonical command, activation distinction and full-installation link. |
| 7 | `responsibility` | Human responsibility, concise non-goals, independent/open-source project, author/contact/license links. |

Every major section carries `data-home-section`. No section is nested inside another major section,
which makes section-count and visible-word validation deterministic.

Header, footer and policy redirect pages remain outside this count. The author becomes compact
project copy inside `responsibility`; the multi-megabyte author photo is no longer referenced.

### 4.1 Hero Copy And Visual Boundary

The Hero retains the current dark AGDF background, large brand presence, centred composition,
typography and visual atmosphere. It removes the current headline, extra value cards and badges. The
before/after comparison begins in the following `problem` section rather than competing inside the
first viewport.

The Hero uses this approved-requirement-derived copy hierarchy:

```text
For engineering teams using coding agents on real repositories

Agent speed needs a control system.

AGDF is the control layer for governed AI-assisted delivery.

In Formula 1, the engine creates speed. Rules, evidence, strategy and human decisions determine what
happens next. AI-assisted delivery has the same challenge: agent output is fast, but teams still need
approved scope, visible evidence and controlled transitions.

Agent: speed · AGDF: delivery control · People: decisions

Install AGDF · View on GitHub
```

The audience line is the eyebrow, **Agent speed needs a control system.** is the single `h1`, and
the control-layer sentence is the lead. **Install AGDF** links to `#setup`; **View on GitHub** links
to the canonical repository. The role mapping is a compact accessible list, not decorative badge
noise and not another workflow model.

The Hero does not use the word `telemetry`, does not claim AGDF observes execution, and does not call
AGDF an operating system, runtime, orchestration platform or race-control system. Formula 1 appears
nowhere else on the page.

## 5. Content Consolidation

| Current content | New owner or placement |
|---|---|
| Hero plus four value cards and badges | Problem-first Hero, audience line, one bounded Formula 1 paragraph, three role labels and two actions; proof values move to `proof`. |
| Why, Race Control and Beyond the Model | Formula 1 appears only once in the Hero; one `problem` comparison follows; the separate race-control section and image are removed. |
| Product proof, highlights and operating guards | Three `outcomes` plus bounded proof values. |
| Intake, paths, depth choice, workflow and gate map | Four-step `how-it-works`; detail links to handbook and normative repository sources. |
| Limits, AI Act and What AGDF Is Not | Required responsibility/non-certification summary in `responsibility`. |
| Control System and ten-skill catalogue | One control-layer/capability summary in `proof`; detailed source links, no modal. |
| Compatibility and public plugin | One compact surface/boundary block inside `proof`. |
| Large multi-surface setup gallery | One Codex command and at most one static Codex screenshot; all variants link to `INSTALL.md`. |
| Author and live GitHub stats | Compact static project/author copy and canonical GitHub/release links. |

Required public-distribution phrases remain in `site.ts` or rendered output so the existing public
document test continues to enforce them.

## 6. Navigation And Fragment Compatibility

Desktop navigation exposes `How it works`, `Proof`, `Install`, `Docs` and `GitHub`. Mobile navigation
uses native `<details>`/`<summary>` semantics with ordinary links, requiring no JavaScript and
remaining usable in static HTML.

The logo points to `/` or `#home`; it never uses the invalid bare `#` selector path.

Repository inventory found no inbound references to the old major fragments outside the current
homepage. Four old setup sub-fragments exist only inside the current `compatibility` data owner and
are removed with that obsolete model. The stable `#setup` anchor is retained for the installation
role. No hidden empty elements, duplicate sections or JavaScript redirects preserve unevidenced old
fragments. The focused validator repeats the repository scan and fails if an evidenced inbound
reference would break.

## 7. Metadata Design

`BaseLayout.astro` accepts explicit homepage metadata while retaining safe defaults:

- title: `AGDF — Governed AI-assisted delivery`;
- description: `For engineering teams using coding agents on real repositories: AGDF keeps scope approved, evidence visible and delivery decisions under human control.`;
- canonical URL: `https://agdf.iself.eu/`;
- Open Graph type/title/description/URL/image/image-alt;
- Twitter summary-large-image card/title/description/image/image-alt.

The existing `/assets/logo.png` is reused as the initial social image; no parallel social-preview
asset or external runtime dependency is created in this slice. Metadata claims the product position,
not directory availability, publisher verification or deployed runtime behavior.

## 8. Static Interaction And Accessibility

The simplified homepage removes:

- skill modal and its HTML/JavaScript;
- proof-image lightbox and its HTML/JavaScript;
- scroll-progress indicator and scroll listener;
- JavaScript smooth-scroll interception;
- reveal-on-scroll behavior that hides content before script execution;
- mobile-menu JavaScript.

Native anchors, CSS `scroll-behavior` with the existing reduced-motion override, semantic
`<details>/<summary>`, static figures and ordinary links provide all required interaction. The page
therefore remains complete without client-side enhancement and targets zero homepage inline/client
script bytes.

Heading order is one `h1`, one `h2` per following major section and local `h3` card headings. Focus
styles use the existing design tokens and remain visible for summary, CTAs and links. Section scroll
offsets account for the sticky header through CSS rather than JavaScript.

## 9. Assets And Payload

Measured pre-change rendered baseline from `pages/dist/index.html` on 2026-08-18:

- HTML: 163,779 bytes;
- inline script content: 5,621 bytes;
- ten referenced local images: 8,570,997 bytes total;
- rendered content: about 4,987 words and 20 major sections.

The target references only the existing logo/icon assets and at most
`/assets/codex-agdf-plugin-ui.png` as a static proof screenshot. Race-control, workflow, Claude,
OpenCode, gate-proof, UAT-proof and author images are no longer referenced by the homepage. Assets
remain in the repository when owned by installation documentation or other evidence; this slice
removes references, not shared evidence files.

Acceptance is fail-closed when post-change inline/client script bytes or total homepage-referenced
local image bytes exceed the recorded baseline. The intended design is materially below both.

## 10. Validation Design

Add `pages/scripts/landing-page-test.mjs` and compose it through a Pages package script. It consumes
the built `dist/index.html` plus bounded source inventories and verifies:

1. exactly seven non-nested `[data-home-section]` elements with the approved IDs and order;
2. one `h1`, valid ordered section headings and required primary/secondary actions;
3. exact control-layer position and one ordered scope/evidence/gate/transition sequence;
4. explicit primary engineering-team audience and distinguishable decision-maker, operator and
   secondary-review roles;
5. exactly one first-viewport Formula 1 framing with the required engine/agent-speed,
   AGDF/control-layer and people/decision-authority mapping and no telemetry/runtime claim;
6. the exact Hero audience line, `h1`, lead, analogy paragraph, role mapping and CTA labels/targets;
7. target reporting and hard failure above 2,200 normalized visible section words;
8. the three required outcome roles;
9. required public-plugin, human-responsibility, no-service, evidence and activation boundaries;
10. canonical handbook, installation, GitHub and public policy links;
11. all local homepage fragment targets resolve;
12. repository-wide source scan finds no inbound references to retired fragments and no orphaned
   homepage import/export/scroll-spy/modal/lightbox owner;
13. title, description, canonical, Open Graph and Twitter metadata values;
14. zero homepage client script bytes, or at minimum no increase from the recorded 5,621-byte
    baseline if implementation evidence shows an unavoidable approved exception;
15. referenced local image bytes do not exceed 8,570,997 and the expected removed assets are absent
    from rendered references;
16. static HTML contains all content/actions without a script-dependent hidden state;
17. existing public-document routes and protected distribution phrases still pass.

Use `Intl.Segmenter('en', { granularity: 'word' })` for deterministic word-like token counting after
extracting the seven marked sections, excluding elements explicitly marked
`data-word-count-exclude`. No external DOM/test dependency is introduced.

Manual evidence covers desktop/mobile reading flow, native mobile navigation, keyboard focus,
responsive cards, contrast, line length and the at-most-one proof figure. Local inspection remains
repository/rendered-candidate evidence only.

## 11. Failure And Recovery

- Missing canonical detail destination: keep the minimum truthful homepage content and fail the
  destination check until the link is repaired.
- Broken inbound fragment: update the evidenced repository reference or explicitly revise the design;
  do not add a hidden duplicate section.
- Word count above 2,200: edit copy; do not hide text from the measurement.
- Editorial count above 1,800 but at or below 2,200: record the exact count and require manual
  justification before QA.
- Protected boundary phrase missing: fail existing/focused tests and restore the canonical meaning.
- Metadata or payload regression: fail the focused test and remove the regression before QA.
- Static/no-script inspection failure: restore native HTML/CSS behavior rather than add a silent
  fallback path.
- Formula 1 appears outside the Hero, repeats as a second model or implies AGDF telemetry/runtime:
  simplify the copy and restore the approved one-time problem framing.
- Audience roles collapse into a generic "developers" label: restore the engineering-team,
  decision-maker, operator and secondary-review hierarchy.

## 12. Requirement Mapping

| PRD scope | Design owner |
|---|---|
| LPS-01–LPS-04 | Hero/navigation data and sections; BaseLayout metadata |
| LPS-05–LPS-07 | `controlLoop`, problem comparison and content consolidation |
| LPS-08–LPS-11 | Outcomes/proof data, evaluation evidence and public-plugin boundary copy |
| LPS-12–LPS-15 | Setup section, canonical repository links and unchanged policy routes |
| LPS-16–LPS-19 | Responsibility section, static accessibility, section/word measurement and footer/project data |
| LPS-20 | Fragment inventory, stable `#setup` and focused link validation |
| LPS-21 | BaseLayout metadata, zero-script target and referenced-image measurement |
| LPS-22–LPS-24 | Hero audience/problemFrame/roleMapping data and first-viewport composition |
| LPS-AC-01–LPS-AC-16 | Focused built-output test plus desktop/mobile/keyboard/manual evidence |

## 13. Approval Boundary

Approval of this Solution Design permits drafting the Task/Test Plan only. It does not permit source
implementation, file deletion, content removal, test mutation, deployment, release or VCS delivery.

The exact approval value is:

`Approval: SD`

## 14. Historical Approval Evidence

Exact `Approval: SD` accepted on 2026-08-18 after revalidation of run
`agdf-pages-landing-simplification`, gate `SD` and revision
`aa40a0ba-573f-424f-b7b1-9910ab1dc289`.

PRD Revision 3 subsequently changed audience priority and first-viewport problem communication.
The Revision 1 approval is retained as historical evidence and does not approve Revision 2.

## 15. Revision 2 Rationale

- derives the engineering-team, decision-maker, operator and secondary-review hierarchy from approved
  PRD Revision 3;
- places one bounded Formula 1 problem framing in the Hero rather than restoring a separate metaphor
  section;
- makes the agent/AGDF/human mapping explicit and rejects telemetry/runtime inflation;
- extends metadata, validation, failure and requirement mappings through LPS-24 and LPS-AC-16;
- leaves the seven-section, static/no-script, canonical-owner and payload design unchanged.

## 16. Revision 3 Rationale

- makes the Hero copy hierarchy durable before approval;
- retains the current AGDF visual identity while removing the current headline, cards and badges;
- moves the before/after comparison to the following Problem section;
- removes `telemetry` from the final analogy and explicitly forbids runtime/race-control inflation;
- fixes the exact audience line, `h1`, lead, Formula 1 paragraph, role mapping and CTA labels/targets;
- adds exact rendered-Hero assertions without changing the approved PRD scope or seven-section design.

## 17. Revision 3 Approval Evidence

Exact `Approval: SD` accepted on 2026-08-18 after revalidation of run
`agdf-pages-landing-simplification`, gate `SD` and revision
`b587e0f4-2711-4584-8deb-e0258e67014e`.
