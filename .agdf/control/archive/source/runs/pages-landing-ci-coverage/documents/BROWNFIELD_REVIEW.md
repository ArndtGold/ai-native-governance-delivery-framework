# Brownfield Review: Pages Landing Test In GitHub Actions

Status: done
Mode: post_ur_review
Decision: pass
Date: 2026-08-20
Owner: Arndt Gold

## Scope And Routing

- mode_slice_decision: `quick_task`
- human_label: Compact Delivery
- required_next_gate: none
- scope: Extend the existing AGDF Guardrails Pages step with the existing `test:landing` command.
- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The change affects CI execution only and does not alter visible product behavior.
- ux_intent_definition_required: `no`
- transparency: PRD, SD and TP are skipped because the approved outcome has one existing workflow
  owner, one existing test command, no new semantics and a deterministic local verification path.

## Existing-System Evidence

- `.github/workflows/agdf-guardrails.yml` is the canonical PR/push guardrail workflow and already owns
  Pages dependency installation and validation.
- `pages/package.json` owns the existing `test:landing` command.
- `pages/scripts/landing-page-test.mjs` owns the landing regression assertions and is already modified
  by the completed conformance slice; this follow-up does not change it.
- The workflow path is clean at baseline; unrelated Pages and conformance work remains preserved.

## Coverage And Reuse

- current_coverage: `partially_done` — the landing test exists and passes locally but is not invoked by
  the standard guardrail workflow.
- reuse_strategy: `extend`
- canonical_owner: `.github/workflows/agdf-guardrails.yml`
- reused_command: `npm --prefix pages run test:landing`
- parallel_structure_risk: none; no workflow, package script or test owner is added.

## Impact And Risk

- files: one existing workflow file.
- interfaces: no API, CLI, file-format or host contract changes.
- data_or_migration: none.
- compatibility: existing PR/push triggers and checks remain unchanged.
- regression_evidence: landing test, public-document test, workflow inspection and `git diff --check`.
- operational_risk: one additional Pages build in CI increases job duration but is deterministic and
  fails the same existing verification job.
- rollback: remove the added command from the existing Pages step.

## Context And Persistence

- memory_target: `scope_artifact`
- memory_reason: The ownership and evidence apply only to this bounded follow-up.
- memory_refs: `.agdf/control/artefacts/pages-landing-ci-coverage/BROWNFIELD_REVIEW.md`
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: No reusable architecture, ownership or product invariant changes.

## Required Next Step

Add the existing landing test command to the existing Pages verification step and run the declared checks.
