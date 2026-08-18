# Brownfield Review: Handbook First-Reader Content Transfer

Status: done
Date: 2026-08-18
Run: `agdf-handbook-first-reader-content-transfer`
Mode: `post_ur_review`

## Brownfield Analysis

- mode: post_ur_review
- decision: pass
- mode_slice_decision: quick_task
- required_next_gate: none
- artefact: `.agdf/control/artefacts/agdf-handbook-first-reader-content-transfer/BROWNFIELD_REVIEW.md`
- scope: Extend the canonical German workflow and closeout chapters, then update only their mapped
  reviewed English translations and source digests.
- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: The work improves explanatory user-facing documentation but does not change a
  product capability, working mode, effective state, activation, blocker or recovery behavior.
- ux_intent_definition_required: no
- evidence: Approved UR Revision 1; clean target handbook paths; existing handbook authority and
  translation mapping; source-digest/parity validator; current Pages-to-handbook Context Graph invariant.
- transparency: PRD, SD and TP are skipped because the approved outcome is a bounded documentation
  extension with no new product semantics, runtime behavior, policy, public interface or release effect.
- missing_evidence: Machine validation is unavailable because the active AGDF 0.13.0 Codex cache has
  no version-matched surface-local validator. Agent-native control inspection is complete; existing
  deterministic documentation checks remain available for execution evidence.
- current_coverage: partially_done. Chapter 03 already explains delivery paths and good requests but
  lacks the bounded UX-intent and failure-pattern guidance. Chapter 05 already separates implementation,
  QA, UAT and delivery but compresses evidence classes into one closing paragraph.
- reuse_strategy: extend the existing canonical chapter sections in place; translate after the German
  source is stable; recompute exact German SHA-256 values; retain the existing validator and chapter inventory.
- risks: duplication with troubleshooting, accidental normative wording, obsolete Pages taxonomy,
  overlong warning content and English semantic drift.
- context_graph_impact: link_only
- required_next_step: Implement the approved German-first documentation revision, update the two mapped
  English translations and source revisions, then run focused documentation and integrity checks.

## Existing Owners And Boundaries

| Concern | Existing owner | Decision |
|---|---|---|
| Practical delivery-path guidance | `docs/handbook/de/03-typische-arbeitsablaeufe.md` | Extend in place with one UX-intent section and one concise failure-pattern section. |
| QA, UAT and delivery evidence | `docs/handbook/de/05-abschluss-und-auslieferung.md` | Extend in place with a compact evidence-boundary section. |
| English projection | matching files under `docs/handbook/en/` | Translate only after German is stable; keep frontmatter and reviewed status honest. |
| Translation authority and parity | `scripts/check-community-health.mjs` | Reuse unchanged; exact source digests and protected-value parity remain mandatory. |
| Normative gate/mode semantics | `plugin/meta/agdf-runtime-contract.md` and focused contracts | Link or summarize without re-authoring. No runtime edit. |
| Installation and host support | `INSTALL.md` | Remains outside the handbook revision. |
| Simplified public landing page | current `agdf-pages-landing-simplification` run | Do not modify; its QA evidence remains independent. |

## Compact Path Evaluation

- quick_task: eligible. The approved UR is narrow, target owners are known, all target paths are clean,
  no new product semantics exist and deterministic documentation checks cover the propagation boundary.
- verified_change: not selected. It would add machine-eligibility ceremony without improving this
  documentation-only outcome, and the version-matched surface validator is unavailable.
- structured path: rejected. No authority, policy, security, architecture, runtime, persistence, data,
  external contract, public CLI, release, deployment, cross-host or unbounded coordination effect exists.
- mode/slice decision: `quick_task`, presented to users as Compact Delivery.
- scope_reason: A bounded German-first documentation extension with two mapped English projections,
  clean owners, reversible changes and deterministic validation is the smallest durable intervention.

## Reuse And Parallel-Structure Review

- No new handbook chapter, taxonomy, validator or compatibility file is needed.
- The five failure patterns will be explanations of existing controls, not new rules or modes.
- The evidence section will distinguish proof classes without duplicating troubleshooting commands.
- Removed Pages copy is evidence for topic selection only and will not be copied verbatim or treated as
  a source of normative truth.
- No parallel source of handbook semantics is introduced.

## Context Graph Output

- Situation: The Pages simplification deliberately routes operational detail to the canonical handbook;
  this follow-up fills three evidenced first-reader gaps without restoring a Pages catalogue.
- context_graph_impact: link_only
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The existing node already records German-primary handbook authority, English
  derived translations and the homepage-to-handbook detail boundary; this review links the bounded reuse path.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The reusable authority invariant already exists in the Context Graph; implementation
  details and checks belong to this run's evidence.
- memory_refs: approved UR Revision 1; this Brownfield Review

