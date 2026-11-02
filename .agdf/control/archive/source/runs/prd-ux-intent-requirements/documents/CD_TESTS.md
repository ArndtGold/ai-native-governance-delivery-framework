# Code Deliverables And Tests — Define UX Intent Before Implementation

- status: done
- approved_tp: .agdf/control/artefacts/prd-ux-intent-requirements/TP.md
- implemented_tasks: UXI-T01..UXI-T12
- implementation_scope: canonical routing and quality contracts; Brownfield, UX definition, Task Plan
  Review and QA skills; Brownfield/UX/PRD templates; canonical inventory/router; scaffold/sync/integrity;
  behavioral evals; Pages catalogue; generated package surfaces; Context Graph
- test_result: pass
- evidence: Runtime Integrity 10 skills/16 control files; deterministic evals 30/30; routing; package
  build/contents; installed-layout and negative integrity; Pages check/build; sync idempotence; aggregate smoke
- evidence_boundary: deterministic replay and repository/package checks are not authenticated live-host execution
- required_next_step: mandatory reviews before QA

## Revision 11 — Pages Fidelity Sharpening

- status: done
- scope: public workflow ordering and authority; UX Intent Fidelity visualization; canonical runtime
  skill tree; Pages drift prevention
- changed_owners: `pages/src/data/site.ts`, `pages/src/pages/index.astro`,
  `plugin/scripts/check-runtime-integrity.mjs` and sync-derived package assets
- test_result: pass
- evidence: Pages check/build pass with zero diagnostics; rendered browser evidence shows all ten
  controls, Greenfield/Brownfield trigger wording, fidelity statuses, QA blocker and
  `ux-intent-definition/` with no desktop horizontal overflow; Runtime Integrity passes; package
  contents pass; aggregate smoke passes; `git diff --check` passes
- evidence_boundary: local rendered Pages evidence is direct surface evidence for the static site,
  not production deployment or authenticated coding-host evidence
- required_next_step: refresh mandatory reviews, then run QA Gate

## Revision 18 — Normalized Review Gaps

- status: done
- approved_tp_scope: UXI-T13..UXI-T19
- implemented: one normalized gap contract in `plugin/meta/contracts/quality.md`; Task Plan, Clean and
  Code Review emit contract-shaped findings; QA consumes without reclassification; Runtime Integrity,
  deterministic evals, generated surfaces and Context Graph are updated
- test_result: pass
- focused_evidence: Runtime Integrity source mode passes for 10 skills/16 control files; controlled
  removal of `design_gap` and injection of a private consumer mapping both fail; restored negative suite passes
- behavioral_evidence: 30/30 deterministic cases pass and cover all six gap types, `none` sentinel,
  fixed routes, emergent earliest-owner assessment, open/invalid QA rejection and authority boundaries
- propagation_evidence: canonical sync repeated idempotently; package contents/build, installed layout,
  negative integrity and routing pass across generated surfaces
- aggregate_evidence: complete `create-agdf` smoke passes; `git diff --check` passes
- evidence_boundary: deterministic replay and repository/package evidence are not live authenticated
  coding-host execution; no host-visible behavior changed or is claimed
- required_next_step: run Task Plan, Clean Implementation and Code Review, then QA Gate
