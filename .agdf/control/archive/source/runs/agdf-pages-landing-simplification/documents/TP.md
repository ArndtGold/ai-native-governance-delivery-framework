# TP: AGDF Landing Page Simplification

Status: approved
Gate: TP
Gate approval: Revision 2 approved on 2026-08-18
Revision: 2
Date: 2026-08-18
Run: `agdf-pages-landing-simplification`

## 1. Delivery Boundary

Implement approved PRD Revision 3 through approved SD Revision 3 as one bounded Structured Slice.
The implementation may refactor only the existing Pages content, composition, layout metadata,
styles and focused Pages validation owners plus the run's control evidence.

No task authorizes runtime/gate/mode changes, public-directory actions, deployment, release, installed
cache mutation or VCS delivery.

## 2. Baseline And Protected Invariants

Before implementation, verify and record:

- current worktree paths and isolate unrelated user work;
- current homepage: approximately 4,987 words and 20 major sections;
- built HTML: 163,779 bytes;
- inline script content: 5,621 bytes;
- referenced local images: ten files and 8,570,997 bytes;
- repository inbound references to current homepage fragments;
- currently passing Astro check/build and public-document tests.

Protected invariants:

- approved product position and the four-step control loop;
- engineering teams as primary audience with distinct technical delivery decision-maker, operator and
  secondary-review roles;
- exact Hero audience line, `h1`, control-layer lead, Formula 1 paragraph, role mapping and CTA labels;
- Formula 1 appears once and never implies AGDF telemetry, execution, orchestration or runtime;
- stable `/privacy`, `/terms` and `/support` routes;
- public-distribution protected phrases and evidence boundaries;
- German-canonical/English-derived handbook authority;
- no AGDF-operated MCP/service/account/telemetry claim;
- no host, publisher, portal, publication or deployment claim from repository evidence;
- existing visual identity, responsive design tokens and accessible focus treatment.

Any unexpected dirty candidate path, missing baseline or failed pre-change relevant test stops
implementation for reconciliation.

## 3. Implementation Tasks

| Task ID | Task | Primary paths | Requirement coverage | Completion evidence | Stop condition |
|---|---|---|---|---|---|
| **LPS-T01** | Run pre-implementation Brownfield Analysis against this approved TP; confirm exact reuse/deletion paths, baseline state, inbound fragments, test owners and unrelated-work isolation. | Brownfield artefact; Pages inventory | all; Brownfield prerequisite | passed `BROWNFIELD_ANALYSIS.md` with baseline and minimal path | owner, path, baseline or destination conflict |
| **LPS-T02** | Refactor `site.ts` into retained global `site` identity plus one bounded `landingPage` projection; preserve protected public copy, exact Hero hierarchy, audience/role mapping and canonical links; remove obsolete homepage-only exports only after consumer proof. | `pages/src/data/site.ts` | LPS-01–LPS-16, LPS-19, LPS-22–LPS-24 | type/build proof, export/consumer scan, protected-copy and exact-Hero tests | second policy owner, missing canonical destination, audience collapse or protected phrase loss |
| **LPS-T03** | Extend `BaseLayout.astro` with explicit canonical/Open Graph/Twitter metadata and remove homepage-only client interaction code. Preserve safe layout defaults. | `pages/src/layouts/BaseLayout.astro` | LPS-17, LPS-21, AC-09, AC-10, AC-14 | rendered metadata assertions and zero-script inspection | metadata claims unavailable state or static navigation becomes unusable |
| **LPS-T04** | Replace the header/navigation with desktop links and native mobile `<details>/<summary>` navigation; retain `#setup`, use valid home target and remove scroll-spy/progress behavior. | `pages/src/pages/index.astro`; focused CSS | LPS-03–LPS-04, LPS-17, LPS-20 | anchor resolution, keyboard/mobile evidence, no-script evidence | broken evidenced fragment, focus failure or JavaScript dependency |
| **LPS-T05** | Implement sections 1–4: Hero, Problem, How It Works and Outcomes using the exact SD Revision 3 Hero hierarchy, one-time Formula 1 framing, audience/role mapping, one before/after comparison, exactly four ordered control-loop steps and three reader-facing outcomes. | `pages/src/pages/index.astro`; `site.ts` | LPS-01–LPS-08, LPS-22–LPS-24, AC-01, AC-03, AC-15–AC-16 | exact rendered Hero, section/order/copy assertions and first-reader review | altered Hero hierarchy, recurring metaphor, runtime inflation, audience ambiguity or competing process model |
| **LPS-T06** | Implement Proof and Compatibility with repository-derived metrics, concise surface/public-plugin boundaries and at most one static Codex screenshot. Remove screenshot authority inflation and live social-stat fetching. | `index.astro`; `site.ts`; `evaluationEvidence.ts` | LPS-09–LPS-11, AC-04, AC-06 | proof-source assertions, screenshot boundary copy and asset inventory | host/portal/publication implication or non-canonical hard-coded metric |
| **LPS-T07** | Implement Setup with **Recommended for Codex**, canonical command, activation distinction and full-installation link; implement Responsibility/Project with limits, independent/open-source status, author/contact/license/GitHub and unchanged policy routes. | `index.astro`; `site.ts` | LPS-12–LPS-16, LPS-19, AC-02, AC-05, AC-06, AC-11 | link/command/policy/responsibility assertions | directory availability implication, missing alternative path or policy duplication |
| **LPS-T08** | Remove obsolete modal/lightbox/reveal/scroll markup, scripts and CSS; remove unreferenced homepage-only `projectStats.ts`/`skills.ts` only when final consumer search is empty; remove obsolete imports/anchors without deleting shared evidence assets. | `index.astro`; `BaseLayout.astro`; `global.css`; bounded unused data files | LPS-06, LPS-17, LPS-20–LPS-21, AC-10, AC-12–AC-14 | zero-script build, orphan scan, diff review and retained asset-source proof | remaining consumer, hidden content, parallel compatibility markup or shared asset deletion |
| **LPS-T09** | Add `landing-page-test.mjs` and a Pages package script implementing built-output section, word, structure, exact Hero/audience/formula, link, metadata, static-state and payload guards. Compose with existing public-document testing. | `pages/scripts/landing-page-test.mjs`; `pages/package.json` | LPS-01–LPS-24, AC-01–AC-16 | passing positive suite plus isolated negative fixtures or mutation probes for critical guards | guard silently ignores malformed HTML, altered Hero hierarchy, hidden text or missing destination |
| **LPS-T10** | Run focused automated validation and repair only approved-scope findings. | affected Pages and canonical validation owners | all automated criteria | V01–V18 pass | required test fails or fix needs scope expansion |
| **LPS-T11** | Perform visible desktop, mobile, keyboard and no-JavaScript inspection; capture measured reading flow, count and payload evidence without claiming deployment. | local built/preview site; CD evidence | AC-01–AC-10, AC-14 | L01–L06 evidence recorded | unreadable flow, overflow, inaccessible control, hidden content or unsupported claim |
| **LPS-T12** | Reconcile source/consumer inventory, SoT/Context Graph impact and durable CD+Tests evidence; preserve external deployment/publication boundaries. | run artefacts; registry/graph only where required | traceability and closeout preparation | reconciled evidence refs and no open graph gap attributable to implementation | missing owner, unresolved graph action or delivery claim beyond evidence |

## 4. Automated Verification

| Verification ID | Check | Covers |
|---|---|---|
| **LPS-V01** | Pre-change `npm --prefix pages run check`, `npm --prefix pages run build` and `npm --prefix pages run test:public-documents` pass before candidate mutation. | T01; baseline integrity |
| **LPS-V02** | Built homepage contains exactly seven non-nested `data-home-section` elements in order: `home`, `problem`, `how-it-works`, `outcomes`, `proof`, `setup`, `responsibility`. | T04–T07; LPS-18; AC-07 |
| **LPS-V03** | Normalized visible section text is reported; 1,500–1,800 is the editorial target and more than 2,200 fails. Excluded nodes cannot hide required prose or whole content cards. | T05–T09; LPS-18; AC-07 |
| **LPS-V04** | One `h1`, six following section `h2` headings and valid local `h3` headings exist; primary Install CTA and secondary GitHub/docs actions resolve. | T04–T07; LPS-01–LPS-04; AC-01–AC-02 |
| **LPS-V05** | **approved scope**, **evidence**, **gate**, **transition** render once as the only ordered primary process model; three approved outcome roles render. | T05; LPS-05–LPS-08; AC-03 |
| **LPS-V06** | Protected public-plugin phrases remain: Skills-only candidate, no AGDF-operated MCP server, advisory/unverified boundary, installation-not-enforcement, OpenAI publisher authority and independent-project status. | T02, T06–T07; LPS-09–LPS-11, LPS-16; AC-04, AC-06 |
| **LPS-V07** | Canonical command equals `npx --yes @agdf/cli@latest codex`, is labelled **Recommended for Codex**, and alternatives link to canonical `INSTALL.md`. | T07; LPS-12–LPS-14; AC-02 |
| **LPS-V08** | Handbook, installation, GitHub and `/privacy`, `/terms`, `/support` links resolve to intended owners; existing public-document tests remain green. | T07, T09; LPS-14–LPS-15; AC-05, AC-11 |
| **LPS-V09** | Every local homepage fragment resolves; repository scan finds no inbound reference to a retired fragment and no old compatibility-only setup anchor remains. | T04, T08–T09; LPS-20; AC-12–AC-13 |
| **LPS-V10** | Rendered title, description, canonical URL, Open Graph and Twitter fields match SD values and contain no directory/publisher/deployment claim. | T03, T09; LPS-21; AC-14 |
| **LPS-V11** | Built homepage contains no client script and no content hidden behind script-dependent initial state. | T03–T04, T08–T09; LPS-17, LPS-21; AC-09–AC-10, AC-14 |
| **LPS-V12** | Referenced local image bytes do not exceed 8,570,997; race-control, author, Claude, OpenCode, gate-proof and UAT-proof assets are absent from homepage references; at most one proof screenshot remains. | T06, T08–T09; LPS-21; AC-14 |
| **LPS-V13** | Source scan finds no unused homepage import/export, `data-skill`, modal, lightbox, reveal, scroll-spy or progress owner after consolidation. | T02, T08–T09; LPS-06, LPS-20; AC-12–AC-13 |
| **LPS-V14** | `npm --prefix pages run check` reports zero errors and warnings. | T10; type/template integrity |
| **LPS-V15** | `npm --prefix pages run build` succeeds and produces the expected static routes. | T10; build integrity |
| **LPS-V16** | Focused landing-page and public-document test scripts pass from the built candidate. | T09–T10; all deterministic criteria |
| **LPS-V17** | `node plugin/scripts/check-runtime-integrity.mjs` and the selected-run AGDF Doctor pass, proving no runtime projection or control-state regression. | T10, T12; boundary integrity |
| **LPS-V18** | `git diff --check`, final changed-path inventory and consumer scan pass; unrelated work remains untouched and no shared proof asset is deleted. | T08, T10, T12; Brownfield/worktree integrity |
| **LPS-V19** | Exact Hero audience line, `h1`, control-layer lead, Formula 1 paragraph, role mapping and CTA labels/targets match SD Revision 3; the before/after comparison is outside `home`. | T02, T04–T05, T09; LPS-01–LPS-04, LPS-22–LPS-24; AC-01, AC-15–AC-16 |
| **LPS-V20** | Formula 1 occurs only inside the Hero; `telemetry`, operating-system, runtime, orchestration and race-control capability wording is absent from the analogy; decision-maker/operator/reviewer roles remain distinguishable. | T02, T05, T09; LPS-22–LPS-24; AC-15–AC-16 |

Critical focused guards must also be exercised with isolated negative fixtures or temporary mutation
probes for: eighth/missing/reordered section, word count above maximum, missing control-loop step,
missing protected phrase, broken anchor, missing canonical destination, script introduction, malformed
metadata, altered Hero copy or role mapping, repeated Formula 1 framing, prohibited runtime wording and
image-byte regression. These probes must not mutate the real candidate after completion.

## 5. Manual And Visible Evidence

| Evidence ID | Inspection | Acceptance boundary |
|---|---|---|
| **LPS-L01** | Desktop viewport around 1440 px: inspect hero priority, seven-section rhythm, reading width, proof/setup balance and footer transition. | Local rendered candidate only |
| **LPS-L02** | Mobile viewport around 390 px: inspect native `<details>` navigation, cards, code wrapping, image sizing, policy/project links and absence of horizontal overflow. | Local rendered candidate only |
| **LPS-L03** | Keyboard-only traversal: summary/menu, CTAs, documentation, proof, installation, policy and project links; verify visible focus and logical order. | Local accessibility observation only |
| **LPS-L04** | Disable JavaScript and reload: all sections, mobile navigation, links and required content remain visible and usable. | Static candidate evidence only |
| **LPS-L05** | First-reader editorial review with both a technical delivery decision-maker and operating-developer perspective: intended audience and speed-without-control problem are recognizable in the first viewport; product, loop, outcomes, evidence boundary, installation and responsibility remain understandable without prior taxonomy; record exact word count and justify any result above 1,800. | Human content review, not UAT approval |
| **LPS-L06** | Inspect source/built metadata and the one retained proof image, if any, for accurate alt text, evidence class and no availability inflation. | Repository/rendered candidate only |

No manual item proves deployed `agdf.iself.eu`, installed-host behavior, OpenAI publisher verification,
portal state, directory review or publication.

## 6. Implementation Order

1. LPS-T01 baseline and pre-implementation Brownfield Analysis.
2. LPS-T02 data projection and protected copy.
3. LPS-T03 metadata/static shell.
4. LPS-T04 navigation and section skeleton.
5. LPS-T05 through LPS-T07 approved content bands.
6. LPS-T08 obsolete-owner cleanup.
7. LPS-T09 focused guards and negative probes.
8. LPS-T10 automated validation.
9. LPS-T11 visible inspection.
10. LPS-T12 durable evidence and graph reconciliation.

Do not clean old data, files or CSS before the new consumers build and their final consumer scan is
available. Do not add compatibility markup for unknown external fragments.

## 7. Requirement And UX-Fidelity Mapping

| PRD coverage | Tasks | Automated evidence | Visible evidence |
|---|---|---|---|
| LPS-01–LPS-04 | T02–T05 | V02, V04, V10 | L01, L02, L05 |
| LPS-05–LPS-08 | T02, T05 | V02–V05, V13 | L01, L05 |
| LPS-09–LPS-11 | T02, T06, T09 | V06, V12, V16 | L05, L06 |
| LPS-12–LPS-15 | T02, T07, T09 | V07–V08 | L01–L05 |
| LPS-16–LPS-19 | T03–T09 | V02–V04, V06, V11–V13 | L01–L05 |
| LPS-20 | T01, T04, T08–T09 | V09, V13, V18 | L03–L04 |
| LPS-21 | T01, T03, T06, T08–T09 | V10–V12 | L01–L04, L06 |
| LPS-22–LPS-24 | T02, T04–T05, T09, T11 | V19–V20 | L01, L02, L05 |
| LPS-AC-01–LPS-AC-06 | T04–T07, T11 | V02, V04–V08 | L01–L06 |
| LPS-AC-07–LPS-AC-10 | T03–T05, T08–T11 | V02–V05, V11, V16 | L01–L05 |
| LPS-AC-11–LPS-AC-14 | T03–T10 | V08–V13, V16–V18 | L02–L04, L06 |
| LPS-AC-15–LPS-AC-16 | T02, T04–T05, T09, T11 | V19–V20 | L01, L02, L05 |

UX Intent Fidelity remains traceable across all four working modes:

| Working mode | Product state | Tasks | Evidence |
|---|---|---|---|
| Orientation | product/problem/loop understandable | T04–T05 | V02–V05; L01, L02, L05 |
| Evaluation | proof, compatibility and limits bounded | T06–T07 | V06, V08, V12; L05, L06 |
| Adoption | supported command and alternatives visible | T04, T07 | V04, V07–V09; L02–L05 |
| Deep reference | canonical details and policies reachable | T07, T09 | V08–V09; L03–L05 |

## 8. QA Blocking Conditions

QA cannot pass when any of the following remains:

- not exactly seven approved sections or more than 2,200 measured words;
- unreviewed result above the 1,800-word editorial target;
- competing top-level workflow/gate/depth/skill model;
- first viewport does not identify the engineering-team problem, collapses audience roles or changes
  the exact approved Hero hierarchy;
- Formula 1 repeats outside the Hero or implies telemetry, execution, orchestration or runtime;
- broken canonical destination or evidenced fragment;
- missing protected public-plugin, evidence or responsibility boundary;
- script-dependent content/navigation or any unexplained client script;
- metadata or payload regression;
- incomplete automated/visible evidence or UX Intent Fidelity mapping;
- orphaned owner, duplicate policy/content source or hidden compatibility section;
- unresolved Brownfield, Context Graph, worktree or unrelated-change conflict;
- any deployment, host, portal or publication claim supported only by local evidence.

## 9. Explicitly Excluded Work

- plugin/runtime/gate/mode/skill contract changes;
- new documentation or policy authority;
- public plugin build, portal, identity, submission or publication action;
- Pages deployment or live-domain mutation;
- npm release or installed-cache changes;
- commit, push or pull request;
- deletion of shared screenshots/evidence assets merely because the homepage no longer references them.

## 10. Approval Boundary

Approval of this Task/Test Plan permits pre-implementation Brownfield Analysis only. Implementation
remains blocked until that analysis passes and confirms the approved reuse path.

The exact approval value is:

`Approval: TP`

## 11. Revision 2 Rationale

- re-derives planning from approved PRD Revision 3 and approved SD Revision 3;
- maps audience hierarchy and exact Hero copy through LPS-T02, T05 and T09;
- adds LPS-V19 and LPS-V20 plus corresponding negative probes;
- extends visible first-reader review to decision-maker and operator perspectives;
- extends requirement and UX fidelity coverage through LPS-24 and LPS-AC-16;
- leaves the approved implementation order, static seven-section architecture and external-state
  boundaries unchanged.

TP Revision 1 remains historical planning evidence and was never approved.

## 12. Revision 2 Approval Evidence

Exact `Approval: TP` accepted on 2026-08-18 after revalidation of run
`agdf-pages-landing-simplification`, gate `TP` and revision
`caf9f4b1-3154-4d36-9879-96af4a4ee87a`.
