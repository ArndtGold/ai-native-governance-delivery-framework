# PRD: Concise AGDF Public Landing Page

Status: approved
Gate: PRD
Gate approval: Revision 3 approved on 2026-08-18
Revision: 3
Date: 2026-08-18
Run: `agdf-pages-landing-simplification`

## 1. Product Outcome

The AGDF homepage shall become a concise first-reader product surface for engineering teams using
coding agents on business-relevant repositories, not a second operating manual. It shall make the
loss-of-control problem recognizable in the first viewport, explain the product through one thesis
and one control loop, show bounded evidence and a supported path to adoption, and route detailed
governance guidance to its canonical owners.

Primary position:

**Control layer for governed AI-assisted delivery.**

Primary explanatory model:

**approved scope -> evidence -> gate -> transition**

## 2. Audience And Jobs

### Audience hierarchy

- **Primary audience:** engineering teams using coding agents for business-relevant changes in real,
  often existing repositories;
- **Primary decision-maker:** Tech Lead, Engineering Manager, Platform Lead or technically
  responsible CTO accountable for AI-assisted delivery decisions;
- **Primary operator:** Senior Developer or Maintainer who installs and uses AGDF inside the coding
  agent workflow;
- **Secondary reviewers:** Product, QA, Security and Architecture roles assessing scope, evidence,
  limitations and delivery readiness;
- **Evaluation audience:** plugin reviewers and open-source adopters checking installability,
  capability boundaries and evidence.

The homepage is not primarily written for general ChatGPT users, prompt-skill beginners, buyers of a
compliance certification or organizations expecting an autonomous delivery platform.

### Primary jobs

1. recognize immediately why agent speed without delivery control is a team risk;
2. understand AGDF without prior framework knowledge;
3. distinguish AGDF from a generic skill collection or autonomous delivery platform;
4. evaluate its practical outcomes and evidence boundaries;
5. install it or reach the correct detailed guidance.

## 3. Information Architecture

The homepage shall contain exactly seven major `<section>` content bands. Header, footer, modal and
policy subroutes do not count as content bands.

| Order | Stable role | Required content |
|---:|---|---|
| 1 | Hero | Problem-first Formula 1 framing, explicit engineering-team audience, approved control-layer position, primary **Install AGDF** CTA and secondary GitHub/documentation action. |
| 2 | Problem and solution | One concise before/after comparison showing uncontrolled continuation versus governed progression. |
| 3 | Control loop | Four ordered steps: approved scope, evidence, gate and transition; link to detailed workflow guidance. |
| 4 | Practical outcomes | Three reader-facing outcomes: controlled scope, evidence-backed decisions and auditable closeout. |
| 5 | Proof and compatibility | Repository-derived proof, self-hosting signal, supported surfaces, public-plugin state and explicit evidence-class boundaries. |
| 6 | Installation | One supported recommended Codex installation command, prerequisites/activation boundary and link to every canonical installation path. |
| 7 | Responsibility and project | Human responsibility, important non-goals, independent/open-source status, author, contact and project links. |

Primary navigation shall expose only the anchors needed for this journey, plus GitHub. It shall not
present internal AGDF taxonomy as the top-level navigation model.

## 4. Requirements

### Positioning And First Impression

- **LPS-01:** The visible hero heading or immediately adjacent primary copy shall contain
  **Control layer for governed AI-assisted delivery.**
- **LPS-02:** The first viewport shall explain in plain English that fast agent output is useful but
  does not control delivery; AGDF keeps work within approved scope and requires evidence before
  consequential transitions.
- **LPS-03:** **Install AGDF** shall be the primary visible CTA and shall resolve to the installation
  section without implying public-directory availability.
- **LPS-04:** GitHub and detailed documentation shall remain discoverable secondary actions.

### Single Explanatory Model

- **LPS-05:** The homepage shall use **approved scope -> evidence -> gate -> transition** as its only
  primary process sequence.
- **LPS-06:** Race-control, beyond-the-model, full workflow, depth-choice, gate-map, operating-guard,
  skill-catalogue and control-system material shall be removed, merged or reduced so it no longer
  forms competing top-level explanatory models.
- **LPS-07:** One before/after comparison may remain, but it shall support the primary control loop
  rather than introduce another taxonomy.

### Outcomes, Evidence And Compatibility

- **LPS-08:** Three practical outcomes shall be expressed without requiring knowledge of gate names,
  skill names or mode values.
- **LPS-09:** Proof shall remain repository-derived where applicable and shall not turn screenshots,
  local builds or package declarations into host, portal, deployment or publication claims.
- **LPS-10:** Compatibility copy shall preserve common, surface-specific, advisory, unavailable and
  unverified distinctions where they affect a reader's decision.
- **LPS-11:** Public plugin copy shall preserve the Skills-only, no AGDF-operated MCP server,
  installation-not-enforcement, unverified publisher and independent-project boundaries required by
  the public distribution contract.

### Installation And Detail Handoffs

- **LPS-12:** The recommended on-page command shall be the canonical supported Codex global command:
  `npx --yes @agdf/cli@latest codex`, visibly labelled **Recommended for Codex** rather than
  presented as the only supported AGDF surface.
- **LPS-13:** The page shall state that installation and repository activation/delivery state are
  distinct, and shall link to `INSTALL.md` for Codex repository-local, Claude Code, OpenCode and other
  documented paths.
- **LPS-14:** Detailed gate, mode, depth, workflow, skill, regulatory and troubleshooting content may
  leave the homepage only when its canonical handbook, installation or repository destination is
  linked and verified.
- **LPS-15:** Privacy, terms and support shall continue to resolve through `/privacy`, `/terms` and
  `/support` without creating independent policy prose.

### Responsibility, Accessibility And Density

- **LPS-16:** The final section shall state that AGDF does not replace engineering judgment, security
  or privacy review, domain acceptance, regulatory assessment, test quality or human responsibility.
- **LPS-17:** The page shall retain the current visual identity and provide semantic heading order,
  keyboard-operable navigation and actions, visible focus, responsive reading flow and useful static
  HTML without client-side enhancement.
- **LPS-18:** The built homepage shall contain exactly seven major content sections. Its editorial
  target is 1,500–1,800 normalized visible words inside those sections, with a hard maximum of 2,200,
  excluding navigation, footer, accessible labels, code tokens and non-rendered metadata. The target
  guides editorial review; the maximum is a deterministic guard and not a substitute for clarity.
- **LPS-19:** The author, Apache-2.0 license, contact address, trademarks, GitHub project and
  independent-project statement shall remain available in the final project/responsibility area or
  footer.
- **LPS-20:** Before an existing homepage anchor is removed or renamed, repository-wide inbound
  fragment references shall be inventoried. Referenced links shall be updated or a justified
  compatibility treatment shall be defined without retaining hidden duplicate content or parallel
  explanatory sections.
- **LPS-21:** Page title, meta description, canonical URL and social-preview metadata shall be
  reviewed against the approved control-layer positioning. The simplified page shall not increase
  shipped client-side JavaScript or total referenced image bytes relative to the recorded baseline;
  removed proof surfaces should reduce payload where their assets are no longer referenced.
- **LPS-22:** Engineering teams using coding agents on business-relevant repositories shall be named
  as the primary audience. Technical delivery leaders shall be distinguishable as decision-makers,
  experienced developers/maintainers as operators, and Product/QA/Security/Architecture as secondary
  reviewers.
- **LPS-23:** The first viewport shall use one concise Formula 1 framing to make the problem
  recognizable: an engine creates speed, while telemetry, rules, strategy and human decisions
  determine what happens next; similarly, agent output is fast while delivery still requires approved
  scope, visible evidence and explicit transitions.
- **LPS-24:** The Formula 1 framing shall map the coding agent to execution speed, AGDF to the
  governance/control layer around delivery, and people to decision authority. It shall not claim that
  AGDF itself provides telemetry, agent execution, orchestration or a runtime, and it shall not become
  a separate section or recurring metaphor.

## 5. Detail Destination Matrix

| Current homepage detail | Required destination or retained summary |
|---|---|
| Full delivery paths, modes and Structured Depth comparison | Concise four-step summary plus bilingual handbook and normative repository links. |
| Full gate/workflow sequence and exact approvals | Handbook chapters on gates, approvals and common workflows. |
| Ten-skill catalogue and modal details | Repository/plugin skill directory or a compact proof count with a documentation link. |
| Runtime/control-system internals | Repository architecture/runtime documentation; retain only decision-relevant capability boundaries. |
| AI Act mapping | Retain human responsibility and non-certification boundary; route detailed governance discussion to canonical project documentation when available. |
| Installation variants and host caveats | `INSTALL.md`; homepage keeps one recommended supported command and a concise activation boundary. |
| Policy details | Stable `/privacy`, `/terms` and `/support` routes backed by canonical root documents. |
| Self-hosting and evaluation evidence | Compact proof/compatibility section with evidence source and limitation. |
| Removed or renamed homepage anchors | Update evidenced inbound repository links or define a bounded compatibility treatment; never retain duplicate sections solely as aliases. |

## 6. UX Acceptance Criteria

| Criterion | Observable acceptance |
|---|---|
| **LPS-AC-01** | A first-time reader can identify product, problem, control loop and primary action from the hero through the third section without encountering internal mode/gate taxonomy. |
| **LPS-AC-02** | The primary CTA reaches a supported installation command; alternative surfaces require no search outside the linked canonical installation guide. |
| **LPS-AC-03** | The four control-loop steps appear once, in order, and are not contradicted by another primary sequence. |
| **LPS-AC-04** | Proof and compatibility claims visibly identify their evidence boundary and do not imply live-host, portal or publication state. |
| **LPS-AC-05** | Every removed detailed topic has a verified canonical destination or remains as the minimum truthful summary. |
| **LPS-AC-06** | Human responsibility, advisory/control-layer behavior, independent-project status and no-service boundaries remain visible. |
| **LPS-AC-07** | Exactly seven major content sections and the 2,200-word hard maximum pass deterministic rendered-output checks; editorial review records whether the 1,500–1,800-word target is met and explains any justified overage. |
| **LPS-AC-08** | Desktop and mobile layouts preserve logical order, readable line length and non-overlapping content. |
| **LPS-AC-09** | Keyboard traversal reaches navigation, CTAs, documentation, policies and any retained disclosure in a logical order with visible focus. |
| **LPS-AC-10** | The page remains understandable and navigable when client-side enhancement is unavailable. |
| **LPS-AC-11** | `/privacy`, `/terms` and `/support` plus their canonical source links still pass existing tests. |
| **LPS-AC-12** | Source search shows no orphaned homepage-only content export, import, anchor or scroll-spy target after consolidation. |
| **LPS-AC-13** | Repository-wide fragment-link inventory shows no broken evidenced inbound homepage anchor; no hidden duplicate section exists solely for compatibility. |
| **LPS-AC-14** | Title, description, canonical URL and social-preview metadata match the approved positioning, while measured client-side JavaScript and referenced image-byte totals do not exceed the recorded baseline. |
| **LPS-AC-15** | The rendered first-reader journey names the primary audience and makes decision-maker, operator and secondary-review roles distinguishable without creating separate persona pages. |
| **LPS-AC-16** | In the first viewport, an intended reader can identify the problem before learning AGDF taxonomy; Formula 1 appears once, preserves the agent/AGDF/human mapping and makes no runtime or telemetry capability claim. |

## 7. Non-Goals

- changing gates, approvals, modes, skills, runtime semantics or public capability contracts;
- creating a hosted AGDF service, MCP server, telemetry path, account or authentication feature;
- redesigning the visual system or replacing Astro/Tailwind ownership;
- changing the handbook's German-canonical/English-derived relationship;
- changing root policy meaning or public policy routes;
- claiming OpenAI publisher verification, directory submission, approval, publication or deployment;
- deployment, release, commit, push, pull request or installed-cache mutation.

## 8. Evidence Plan

- source inventory for imports, exports, anchors, consumers and canonical destinations;
- focused source and rendered-output assertions for LPS-01 through LPS-24;
- Astro `check` and `build`;
- existing public-document route and positioning tests;
- rendered word/section measurement;
- pre-change and post-change client-side JavaScript and referenced-image byte measurement;
- repository-wide inbound fragment-link scan and built-anchor resolution check;
- title, description, canonical URL and social-preview metadata inspection;
- desktop and mobile browser inspection;
- keyboard/focus and static-HTML inspection;
- post-change consumer scan and diff review.

Repository evidence proves the source/build candidate only. It does not prove deployed
`agdf.iself.eu`, installed-host behavior, OpenAI portal state or public-directory availability.

## 9. Approval Boundary

Approval of this PRD permits drafting the Solution Design only. It does not permit implementation,
content removal, test mutation, deployment, release or VCS delivery.

The exact approval value is:

`Approval: PRD`

## 10. Revision History

### Revision 2 — 2026-08-18

- added an editorial target of 1,500–1,800 visible words while retaining 2,200 as the hard maximum;
- required repository-wide fragment-link inventory and bounded compatibility handling;
- required positioning-aligned metadata and non-increasing JavaScript/image payload evidence;
- clarified that the recommended command is labelled **Recommended for Codex** and does not imply
  single-surface support.

### Revision 3 — 2026-08-18

- made engineering teams the primary audience and separated technical delivery decision-makers,
  operating developers, secondary reviewers and evaluation readers;
- required first-viewport problem recognition before AGDF taxonomy;
- introduced one bounded Formula 1 framing that separates agent speed, AGDF delivery control and
  human decision authority without implying telemetry or runtime capability;
- added requirements LPS-22–LPS-24 and acceptance criteria LPS-AC-15–LPS-AC-16.

## 11. Approval Evidence

Revision 2 exact `Approval: PRD` accepted on 2026-08-18 after revalidation of run
`agdf-pages-landing-simplification`, gate `PRD` and revision
`ad5ecd96-9a97-4ab4-b480-be7bc38a66f4`. Revision 3 changes audience priority and first-viewport
product communication. Exact `Approval: PRD` for Revision 3 was accepted on 2026-08-18 after
revalidation of the same run, gate and revision `7bdd4586-946b-4feb-ae57-902067ea1870`.
