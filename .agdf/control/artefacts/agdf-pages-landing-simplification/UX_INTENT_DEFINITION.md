# UX Intent Definition: AGDF Pages Landing Simplification

Status: ready
Decision: ready
Revision: 2
Date: 2026-08-18
Run: `agdf-pages-landing-simplification`

## 1. Routing Evidence

- approved_input: UR Revision 1, approved 2026-08-18
- delivery_context: brownfield
- ui_ux_impact: medium
- ux_intent_definition_required: yes
- blocking_reason: none

## 2. Primary Intent And Success

- primary_user_intent: An engineering team using coding agents on business-relevant repositories
  wants to recognize its loss-of-control risk immediately, while its technical delivery decision-maker
  and operating developer each need a clear path to evaluate and use AGDF without first learning
  internal framework taxonomy.
- success_signal: In the first viewport, the reader recognizes that agent speed alone does not control
  delivery. The reader can then state the control-layer purpose, understand the
  **approved scope -> evidence -> gate -> transition** loop, distinguish repository proof from live
  host or publication proof, and reach a supported installation or deeper canonical guidance.
- primary_decision_or_action: A Tech Lead, Engineering Manager or technically responsible CTO decides
  whether AGDF fits the team's delivery problem; a Senior Developer or Maintainer selects
  **Install AGDF**. Secondary actions are review evidence, inspect GitHub or open detailed documentation.

## 3. Working Modes And Effective State

| Working mode | Effective state | Primary visible state |
|---|---|---|
| Orientation | Decision-maker and operator both recognize the same problem: fast agent output without sufficient control of scope, evidence and transitions. | Problem-first hero with bounded Formula 1 framing, concise comparison and four-step loop. |
| Evaluation | Outcomes, evidence, compatibility and limitations are visible without inflated capability claims. | Outcome cards, proof/compatibility summary and evidence boundaries. |
| Adoption | One currently supported installation path is prominent and alternatives remain discoverable. | Install CTA, verified command and link to full installation guidance. |
| Deep reference | Detailed gates, modes, workflow, skills and policies remain available from canonical owners. | Clearly labelled documentation, handbook and policy links. |

- visible_state_types: default static content; responsive navigation open/closed; anchor focus/target;
  actionable link and button states; installation command; optional proof-image disclosure; explicit
  evidence/availability boundary copy.
- effective_state_authority_by_mode: approved PRD for the landing-page promise; canonical plugin
  definition for product identity; runtime contracts for governance semantics; `INSTALL.md` for
  installation; handbook for detailed guidance; root policy documents for policy meaning.
- primary_state_presentation_owner_by_mode: `pages/src/pages/index.astro` for visible order and
  interaction; `pages/src/data/site.ts` for landing content data; existing Pages layout/styles for
  responsive presentation.

## 4. Activation, Blockers And Recovery

- activation_paths: direct visit to `/`; deep link to a stable section; primary CTA to installation;
  navigation or footer link to GitHub, handbook and policies.
- deactivation_paths: leaving through a canonical external/documentation link; no persisted session or
  hidden activation state exists.

| Blocker | Visible next action | Recovery path |
|---|---|---|
| Reader needs a non-Codex installation path | Open full installation guidance. | Select Claude Code, OpenCode, repository-local Codex or another documented surface in `INSTALL.md`. |
| Public directory availability is not verified | Do not present directory installation as available. | Use the supported CLI installation path or inspect current repository evidence. |
| Reader needs detailed gate/mode semantics | Follow the handbook/reference link. | Canonical documentation provides detail without expanding the homepage. |
| A proposed removal has no valid canonical destination | Keep the content until a destination is evidenced. | Add or repair the canonical link, then re-evaluate removal. |
| Client-side enhancement is unavailable | Core content and links remain usable as static HTML. | Native anchor navigation and ordinary links continue to work. |
| Proof is repository-only or screenshot-only | Show its evidence class and limitation. | Follow repository source or perform separately authorized host/publication verification. |

## 5. Relevant State Transitions

1. arrival -> orientation through hero and problem/solution;
2. orientation -> understanding through the four-step control loop;
3. understanding -> evaluation through outcomes, proof and compatibility;
4. evaluation -> adoption through the installation section;
5. any mode -> deep reference through canonical handbook, installation, repository or policy links;
6. blocked installation or evidence question -> explicit alternative or deeper reference, never an
   unsupported availability claim.

## 6. Proposed PRD Acceptance Criteria

1. Exactly seven major homepage content sections form one progressive first-reader journey.
2. The hero uses the approved control-layer positioning and exposes **Install AGDF** as the primary
   action without hiding GitHub or documentation access.
3. One concise before/after explanation replaces competing problem metaphors.
4. **approved scope -> evidence -> gate -> transition** is the only primary process model.
5. Practical outcomes are stated in reader language rather than skill or gate taxonomy.
6. Proof and compatibility distinguish repository, package, host, portal and publication evidence.
7. The primary install command is currently supported and full alternatives remain linked.
8. Detailed gate, mode, depth, workflow, skill and regulatory material has verified canonical
   destinations before it leaves the homepage.
9. Human responsibility, advisory/control-layer behavior, independent-project status and no-service
   boundaries remain visible.
10. Static HTML remains useful without client-side enhancement; responsive navigation, focus order and
    semantic headings remain verifiable.
11. Stable privacy, terms and support routes remain unchanged.
12. Rendered content and section inventory are materially smaller than the measured baseline and are
    protected by focused checks.
13. Engineering teams are the explicit primary audience; technical delivery decision-makers,
    operating developers and secondary reviewers have distinct roles.
14. The first viewport uses one bounded Formula 1 analogy to make the problem recognizable: the agent
    provides speed, AGDF provides a governance/control layer and people retain decisions. It does not
    claim AGDF supplies telemetry, execution or a runtime.

## 7. Open Product Questions

- none blocking;
- primary CTA decision: **Install AGDF** targets the on-page installation section;
- recommended on-page command: the currently supported Codex global CLI path, with `INSTALL.md` linked
  for all other surfaces;
- author/project material remains, but is compressed into the final responsibility/project section;
- detailed Structured Depth correctness remains accessible through canonical documentation rather than
  a primary homepage comparison;
- Formula 1 is a single first-viewport problem framing, not a separate section or recurring metaphor.

## 8. Evidence And Next Step

- affected_outputs: landing content, composition, navigation, focused validation and browser evidence
- evidence: approved UR; Brownfield Review; rendered baseline; existing Pages owners; canonical
  plugin definition, handbook, installation and policy documents
- missing_evidence: none for PRD drafting; implementation and visible evidence remain future work
- required_next_step: Incorporate these proposed criteria into the PRD and request
  `Approval: PRD`.

## 9. Revision 2 Rationale

The audience is now explicitly hierarchical: engineering teams are primary, technical delivery
leaders decide, experienced developers operate AGDF, and Product/QA/Security/Architecture review.
The first visible problem framing uses Formula 1 once to connect speed with the control system around
delivery while preserving AGDF's non-runtime boundary.
