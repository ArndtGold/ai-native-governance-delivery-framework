# Brownfield Review — Versioned AGDF Skill Evaluation Framework

## Decision

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- run_id: agdf-skill-evaluation-framework

## Scope

Add one repository-owned evaluation system for all canonical AGDF skills without creating a parallel skill catalog, gate model, quality authority or CI policy source.

## Existing Coverage

- current_coverage: partially_done
- The canonical skill inventory and routing boundaries already live in `plugin/meta/agdf-plugin.definition.json`.
- Canonical skill instructions live in `plugin/skills/*/SKILL.md` and reference focused Runtime Contract modules.
- `plugin/scripts/check-runtime-integrity.mjs` already validates structural, cross-surface and selected semantic invariants.
- `create-agdf/scripts/*-test.js` already provides deterministic fixture, negative, routing, control-state and mutation-oriented test patterns.
- `create-agdf/lib/delivery-path-search/` already provides bounded model transports, fixture protocols and a reusable read-only repository-state guard, but its candidate scoring is specific to Delivery Path Search and must not become the skill-evaluation grading model.
- `.github/workflows/agdf-guardrails.yml` and `.github/workflows/publish-agdf.yml` are the existing CI and release validation owners.

## Reuse Strategy

- reuse_strategy: extend
- Derive the evaluated skill inventory from `plugin/meta/agdf-plugin.definition.json`; do not maintain a second list under `evals/`.
- Compose with the current smoke and integrity suites rather than copying their assertions into eval cases.
- Reuse disposable-workspace patterns and the repository mutation guard, generalized only where required by the approved design.
- Reuse deterministic JSON/schema validation conventions from `create-agdf/lib/` while keeping skill-evaluation contracts separate from Delivery Path Search scoring semantics.
- Add the resulting evaluation command to existing guardrail and release-validation workflows instead of creating an independent workflow authority.

## Affected Owners

- Skill and routing SoT: `plugin/meta/agdf-plugin.definition.json`
- Skill behavior instructions: `plugin/skills/`
- Runtime and gate semantics: `plugin/meta/contracts/`
- Executable evaluation and grading: expected under the existing `create-agdf` runtime/package boundary, with exact ownership to be decided in SD
- Versioned cases and disposable repository fixtures: new root `evals/` corpus, derived from the canonical skill inventory
- CI policy: `.github/workflows/agdf-guardrails.yml`
- Release validation: `.github/workflows/publish-agdf.yml`
- Aggregate local verification: `create-agdf/package.json`

## Impact

- architecture: new evaluation contracts, runner, graders and report schema spanning the repository corpus and executable package boundary
- interfaces: new maintainer-facing evaluation command and stable machine-readable report
- data or migration: no production data migration; evaluation schema versions require explicit compatibility handling
- backwards compatibility: existing smoke, integrity and package commands must retain their current responsibilities and outcomes
- regression surface: all nine canonical skills, routing, gate safety, allowed/forbidden action projection, mutation enforcement, artefact output and both CI workflows
- release impact: evaluation thresholds become release-blocking policy

## Parallel-Structure Risks

- A hard-coded eval skill list would drift from the plugin definition.
- A second gate evaluator or approval table would compete with the Runtime Contract and canonical control-state logic.
- A new quality score could compete with `qa-gate` unless it remains case-level evidence only.
- A separate eval-only CI workflow could diverge from the existing guardrail and publish validation chain.
- Delivery Path Search scores are unsuitable as generic skill-quality metrics and must not be reused as if they measured behavioral correctness.

## Open Product Questions For PRD

1. Define the deterministic baseline CI contract and the optional live-model evidence lane without making credentials mandatory.
2. Define minimum realistic coverage per canonical skill, including positive, boundary and adversarial cases.
3. Define which failures are absolute blockers and which aggregate quality dimensions may use thresholds.
4. Define artefact-quality assessment authority and how non-deterministic judgement remains subordinate to safety grading.
5. Define the public support boundary: repository-maintainer evaluation only versus a packaged CLI surface.

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH; CG-NATIVE-INTERACTION-AUTHORITY; CG-DOCUMENTATION-CEREMONY-BOUNDARY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes already own bounded evaluator transports, approval authority and fail-closed proportionality constraints; this run links them without changing their decisions yet.

## Risks

- Fixture realism may be overstated if cases only mirror implementation internals.
- A deterministic replay lane alone cannot prove live-model behavior.
- Live-model evaluations can introduce cost, latency and nondeterminism.
- Thresholds can hide severe regressions unless safety-critical dimensions remain zero-tolerance.

## Transparency

`quick_task` and `verified_change` are not suitable because the request introduces cross-owner executable behavior, CI/release policy and a new versioned contract surface. A `structured_delivery` path is required, but the PRD, SD and TP should remain focused on this evaluation subsystem rather than expanding general AGDF semantics.

## Required Next Step

Draft a focused PRD that resolves coverage, safety authority, quality assessment, CI thresholds and the supported execution boundary, then request `Approval: PRD`.
