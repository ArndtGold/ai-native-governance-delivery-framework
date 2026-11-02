# UR: Simplify the AGDF Public Landing Page

Status: approved
Gate: UR
Gate approval: approved on 2026-08-18
Revision: 1
Date: 2026-08-18
Owner: user
Run: `agdf-pages-landing-simplification`

## 1. Problem

The public AGDF landing page is accurate and visually established, but it currently performs three
jobs at once: product introduction, operating guide and governance reference. The rendered page has
about 5,000 words, 20 major sections and roughly 34 desktop viewport heights. Several sections
explain the same control-layer thesis through parallel models, which makes the first product
impression slower and more framework-internal than necessary.

The approved product position is clearer than the current page structure:

**Control layer for governed AI-assisted delivery.**

Its central operating logic is:

**approved scope -> evidence -> gate -> transition**

## 2. Goal

Make the AGDF landing page concise, understandable to first-time readers and action-oriented while
preserving truthful product boundaries, existing visual identity and access to deeper documentation.

A reader should quickly understand:

1. what AGDF is;
2. which delivery problem it addresses;
3. how its control loop works;
4. what practical outcomes it provides;
5. what evidence and compatibility exist;
6. how to install it; and
7. which responsibilities and limitations remain human-owned.

## 3. Scope

- Reduce the homepage to approximately seven coherent sections: hero, problem/solution, four-step
  control loop, practical outcomes, proof and compatibility, installation, and responsibility/project.
- Align the hero with the approved control-layer positioning and make the primary installation action
  visible without relying only on navigation.
- Keep one concise before/after explanation and remove or merge repeated value, metaphor, proof,
  workflow, depth and control-system explanations.
- Present **approved scope -> evidence -> gate -> transition** as the single primary explanatory model.
- Keep product proof, supported surfaces, self-hosting evidence and capability boundaries concise and
  evidence-backed.
- Keep one recommended installation path on the homepage and route variants to canonical installation
  documentation.
- Move detailed gate, mode, depth, workflow, skill and regulatory explanations out of the homepage to
  existing canonical handbook or repository documentation where appropriate.
- Preserve stable public privacy, terms and support routes and their canonical content ownership.
- Preserve responsive, keyboard-accessible and semantically structured presentation within the current
  Pages design system.
- Add focused checks for section inventory, required positioning, critical links, honest capability
  boundaries and the absence of removed duplicate homepage models.

## 4. Non-Goals

- no change to AGDF gates, approvals, modes, skills, runtime behavior or normative contracts;
- no new product capability, hosted service, MCP server, enforcement guarantee or live-host claim;
- no replacement of the current visual identity or broad component-system redesign;
- no duplication of handbook, runtime-contract, policy or installation authority on Pages;
- no removal of canonical documentation needed for experienced users;
- no deployment, release, portal submission, publication, commit, push or pull request;
- no claim that local rendering proves the deployed `agdf.iself.eu` state.

## 5. Acceptance Signals

The requirement is ready for further design when:

1. the homepage has one clear product thesis and one primary explanatory model;
2. a first-time reader can identify product, problem, process, outcomes, proof, installation and limits
   without learning internal AGDF taxonomy first;
3. the target information architecture contains approximately seven major sections and materially less
   copy than the current 5,000-word baseline;
4. detailed framework semantics remain available through canonical documentation links rather than
   duplicated homepage prose;
5. prior Structured Depth correctness is preserved even when its detailed comparison is no longer a
   primary homepage section;
6. the visible primary CTA leads to the canonical supported installation path;
7. independent-project, advisory/control-layer, human-responsibility and evidence-class boundaries
   remain explicit;
8. public policy routes and distribution-facing URLs remain stable;
9. desktop and mobile reading flow, keyboard navigation and semantic heading order are verifiable; and
10. implementation remains within the existing Pages content/data/composition owners.

## 6. Existing Sources Of Truth

- `plugin/meta/agdf-plugin.definition.json` for approved public product wording and URLs;
- `plugin/meta/contracts/` for normative runtime, mode, gate and evidence semantics;
- `pages/src/data/site.ts` for current landing-page content data;
- `pages/src/pages/index.astro` for current landing-page composition;
- `docs/handbook/de/` as canonical detailed user guidance and `docs/handbook/en/` as its reviewed
  translation;
- `INSTALL.md`, `SUPPORT.md`, `PRIVACY.md` and `TERMS.md` for canonical public guidance and policies;
- the completed implementation evidence of `agdf-pages-structured-depth-positioning`, which proves
  current depth-copy correctness but does not require that all detail remain on the homepage.

## 7. Risks And Open Decisions

- Excessive reduction could hide important limitations or make AGDF sound like a generic coding-skill
  collection.
- Keeping too many internal models would preserve the current comprehension problem.
- Moving detail requires stable, correct documentation destinations; missing destinations must block
  removal rather than silently discard required guidance.
- Word count is a diagnostic, not the sole quality threshold; clarity and truthfulness take precedence.
- Brownfield Review must confirm UI/UX impact, existing test ownership, documentation destinations and
  whether the bounded outcome requires `structured_slice` or `structured_delivery`.

## 8. Approval Boundary

Approval of this UR permits Brownfield Review, UI/UX impact routing and Mode/Slice Decision only. It
does not permit PRD, implementation, removal of homepage content, deployment or release.

The exact approval value is:

`Approval: UR`

## 9. Approval Evidence

Exact `Approval: UR` accepted on 2026-08-18 after revalidation of run
`agdf-pages-landing-simplification`, gate `UR` and revision
`a1acf2c4-c672-42f9-aeda-ad86b082aa56`.
