# Brownfield Review: AGDF Pages Landing Simplification

Status: done
Mode: `post_ur_review`
Decision: pass
Date: 2026-08-18
Run: `agdf-pages-landing-simplification`

## 1. Scope And Routing

- delivery_context: brownfield
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- ui_ux_impact: medium
- ui_ux_impact_reason: The change materially alters the landing page's first-reader journey,
  information hierarchy, navigation emphasis and primary installation action, but remains bounded to
  one static public surface and does not change AGDF capability, authority or runtime behavior.
- ux_intent_definition_required: yes
- implementation_preparation_brownfield_analysis_required: yes

The approved UR changes one coherent outcome: a first-time reader should understand AGDF and reach
a supported installation or deeper evidence without traversing the framework's internal taxonomy.

## 2. Existing Coverage And Owners

| Area | Current coverage | Existing owner | Brownfield finding |
|---|---|---|---|
| Product identity | fully_done | `plugin/meta/agdf-plugin.definition.json`; `pages/src/data/site.ts` | Approved control-layer wording and public URLs already exist; reuse them. |
| Landing content | partially_done | `pages/src/data/site.ts` | Accurate content exists, but several parallel models repeat the same thesis. Refactor in place. |
| Page composition | partially_done | `pages/src/pages/index.astro` | Existing layout, navigation, disclosure and proof patterns work; section count and reading length are excessive. |
| Visual system | fully_done | existing Astro/Tailwind layout, components and styles | Preserve rather than replace. No new design system is needed. |
| Detailed guidance | fully_done | `docs/handbook/de/`, `docs/handbook/en/`, `INSTALL.md` | Canonical destinations exist for workflow, gate, mode and installation detail. |
| Public policies | fully_done | root `PRIVACY.md`, `TERMS.md`, `SUPPORT.md`; Pages route adapter | Routes and ownership are stable and must remain unchanged. |
| Public-copy tests | partially_done | `pages/scripts/public-documents-test.mjs`; Astro check/build | Critical distribution phrases and policy routes are guarded; section inventory, content density and documentation handoffs are not. |
| Visible proof assets | fully_done | `pages/public/assets/`; current proof composition | Assets can be reused selectively; screenshots remain examples, not release or host authority. |

Observed baseline on 2026-08-18: approximately 4,987 rendered words, 20 major sections and 33.6
desktop viewport heights. The largest content bands are Workflow, Intake, Depth Choice, Why, Control
System, Skills and the Hero.

## 3. Reuse Strategy

- strategy: refactor
- keep `pages/src/data/site.ts` as the landing content/data owner;
- keep `pages/src/pages/index.astro` as the composition and visible-state owner;
- retain the current logo, colour, typography, surface, responsive navigation and disclosure patterns;
- derive proof counts from existing repository-backed data instead of hard-coding new claims;
- retain canonical policy routes and footer links;
- link to `INSTALL.md` and the bilingual handbook for details removed from the homepage;
- remove homepage-only data structures only after consumer search proves they are unused elsewhere;
- extend existing Pages validation rather than introduce a second test harness.

No new framework, component library, documentation tree, policy file or product semantics are needed.

## 4. Impact And Regression Surface

- files/modules: primarily `pages/src/data/site.ts`, `pages/src/pages/index.astro` and focused Pages
  validation; existing layout/components only if a demonstrated small extraction improves clarity;
- interfaces: stable anchor targets and public documentation routes; no API or CLI change;
- data/persistence/migration: none;
- compatibility: static rendering, existing supported browsers and responsive breakpoints remain;
- visible-state ownership: `index.astro` continues to own section order, navigation, disclosure,
  lightbox and static CTA presentation;
- side effects: removal of unused imports/data and obsolete navigation anchors may affect source tests
  or client-side scroll-spy behavior and must be verified;
- regression evidence: Astro check/build, public-document tests, focused section/copy/link assertions,
  keyboard navigation and responsive browser inspection.

## 5. Drift And Parallel-Structure Checks

- source-of-truth drift: none observed; the risk is Pages duplicating normative detail, which the
  approved scope reduces;
- runtime/product-semantics drift: none required; all claims remain projections of existing owners;
- parallel content owner: forbidden; removed details link to existing handbook/INSTALL owners;
- parallel UI system: forbidden; the current Pages design system is reused;
- policy drift: forbidden; privacy, terms and support remain canonical root documents with stable
  Pages routes;
- live-state drift: local rendering must not be described as deployed `agdf.iself.eu` evidence.

## 6. Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: `quick_task` and `verified_change` are rejected because the change affects
  several visible sections, navigation, content owners and tests and materially changes the first-reader
  journey. `structured_delivery` is rejected because no authority, security, runtime, persistence,
  external interface, release, migration or cross-host trigger applies.
- missing_or_conflicting_facts: none
- depth_evidence_refs: approved UR Revision 1; `pages/src/data/site.ts`;
  `pages/src/pages/index.astro`; `pages/scripts/public-documents-test.mjs`; `INSTALL.md`;
  `docs/handbook/`; existing public policy routes.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One independently reviewable outcome: a concise first-reader landing page with canonical detail handoffs. |
| `authority_boundary` | pass | Content, composition, runtime semantics, installation and policy owners are identified; no new trust or policy authority is introduced. |
| `owner_consumer_coordination` | pass | Changes remain inside the Pages source and its existing documentation/test consumers. |
| `full_depth_impacts_absent` | pass | No architecture, runtime, persistence, data, public API/CLI, deployment or cross-host behavior changes. |
| `migration_propagation_bounded` | pass | Static content/anchor changes are local, testable and revertible; no data migration exists. |
| `failure_recovery_local` | pass | Build/test failures or poor reading flow can be corrected within the same bounded Pages slice. |
| `independently_acceptable` | pass | The page can be accepted through content, responsive, accessibility and evidence-boundary checks without another release prerequisite. |

## 7. Risks And Controls

- Over-reduction could hide safety, evidence or responsibility boundaries: make them required PRD
  criteria and focused assertions.
- Under-reduction could preserve the current problem: define a deterministic major-section and
  rendered-copy budget.
- Removed detail could become undiscoverable: require a verified destination matrix before deletion.
- The installation CTA could imply directory availability: use a currently supported canonical CLI
  path and keep public-directory state explicitly separate.
- Proof images could dominate the shortened page: select only evidence that materially supports the
  product decision and keep its evidence class visible.

## 8. Context Graph And Knowledge Persistence

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; prior Pages positioning/evidence nodes
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The new reusable decision is that the homepage is a concise explanatory
  projection while detailed governance guidance remains handbook/runtime owned.
- memory_target: context_graph
- memory_reason: Preserve the landing-page-to-documentation authority boundary and the single primary
  explanatory model for future public-copy work.
- memory_refs: this review; approved UR; existing Pages and handbook owners

## 9. Decision

- current_coverage: partially_done
- reuse_strategy: refactor existing owners in place
- missing_evidence: none for routing; UX Intent Definition is required before PRD readiness
- transparency: Structured Slice is required because the visible journey and several existing owners
  change together; full delivery would add depth without an evidenced full-depth trigger.
- required_next_step: Complete UX Intent Definition, draft the slice-depth PRD and request
  `Approval: PRD`.
