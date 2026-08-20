# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agent-skills-conformance-portability
- lifecycle: completed
- revision: 10
- revision_id: agent-skills-conformance-portability-r10
- mode: structured_slice
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Establish a deterministic Agent Skills conformance check and an explicit plugin-scoped portability
boundary without duplicating AGDF Runtime Contract ownership or changing skill behavior.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | All ten canonical skills currently satisfy the inspected core frontmatter, naming, description-length and size constraints; they intentionally reference shared plugin Runtime Contract modules. |
| What is approved? | UR, PRD, SD, TP, QA and UAT approved by exact approvals on 2026-08-19; Brownfield Analysis, CD+Tests, mandatory reviews and OR pass. |
| What is missing? | No approval is missing for run closeout; authenticated host and public distribution evidence remain intentionally unperformed. |
| What is the next allowed action? | Use delivery closeout only when an operative commit, push or pull-request handoff is explicitly requested. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, publication or release actions. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` received from the user on 2026-08-19; durable UR is approved. |
| PRD | approved | Exact `Approval: PRD` received from the user on 2026-08-19; durable PRD is approved. |
| SD | approved | Exact `Approval: SD` received from the user on 2026-08-19; durable SD is approved. |
| TP | approved | Exact `Approval: TP` received from the user on 2026-08-19; durable TP is approved. |
| QA | approved | Exact `Approval: QA` received from the user on 2026-08-19; durable QA decision is approved. |
| UAT | approved | Exact `Approval: UAT` received from the user on 2026-08-19 for the bounded repository/package evidence. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agent-skills-conformance-portability/UR.md` | approved | Exact approval received on 2026-08-19. |
| Brownfield Review | `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_REVIEW.md` | done | Brownfield existing-system review selects `structured_slice`; UI/UX impact is none. |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agent-skills-conformance-portability/PRD.md` | approved | Exact approval received on 2026-08-19. |
| SD | `.agdf/control/artefacts/agent-skills-conformance-portability/SD.md` | approved | Exact approval received on 2026-08-19. |
| TP | `.agdf/control/artefacts/agent-skills-conformance-portability/TP.md` | approved | Exact approval received on 2026-08-19. |
| Brownfield Analysis | `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_ANALYSIS.md` | done | `pre_implementation_analysis` passed; existing owners are extended and no blocking drift remains. |
| CD+Tests | `.agdf/control/artefacts/agent-skills-conformance-portability/CD_TESTS.md` | done | ASP-01 through ASP-07 implemented; focused, package, website and full smoke evidence pass. |
| Task Plan Review | `.agdf/control/artefacts/agent-skills-conformance-portability/TASK_PLAN_REVIEW.md` | done | `pass`; 7/7 tasks fully_done. |
| Clean Implementation Review | `.agdf/control/artefacts/agent-skills-conformance-portability/CLEAN_IMPLEMENTATION_REVIEW.md` | done | `pass`; no fallback, workaround or parallel owner. |
| CR | `.agdf/control/artefacts/agent-skills-conformance-portability/CODE_REVIEW.md` | done | `pass`; no open actual-diff finding. |
| QA | `.agdf/control/artefacts/agent-skills-conformance-portability/QA_REPORT.md` | approved | `qa-gate` pass decision approved by exact user approval on 2026-08-19. |
| OR | `.agdf/control/artefacts/agent-skills-conformance-portability/OR.md` | done | OR-full records UAT approval, bounded delivery, missing host evidence, risks and the delivery-closeout boundary. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — one coherent conformance outcome spans validation, negative tests, package propagation and compatibility documentation. Quick Task and Verified Change are ineligible because executable/normative paths and multiple canonical owners are involved; no full-depth trigger applies.
- evidence: `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_REVIEW.md`; `plugin/skills/*/SKILL.md`; `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/runtime-integrity-negative-test.js`; `create-agdf/scripts/sync-package-assets.js`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User request | captured_by | UR | `.agdf/control/artefacts/agent-skills-conformance-portability/UR.md` |
| User approval | approves | UR | Exact `Approval: UR` received on 2026-08-19 |
| Brownfield Review | sizes | Mode/Slice Decision | `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_REVIEW.md` |
| UR | defines | PRD | `.agdf/control/artefacts/agent-skills-conformance-portability/PRD.md` |
| User approval | approves | PRD | Exact `Approval: PRD` received on 2026-08-19 |
| PRD | constrains | SD | `.agdf/control/artefacts/agent-skills-conformance-portability/SD.md` |
| User approval | approves | SD | Exact `Approval: SD` received on 2026-08-19 |
| SD | constrains | TP | `.agdf/control/artefacts/agent-skills-conformance-portability/TP.md` |
| User approval | approves | TP | Exact `Approval: TP` received on 2026-08-19 |
| TP | scopes | Brownfield Analysis | `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_ANALYSIS.md` |
| Brownfield Analysis | permits | CD+Tests | Decision `pass` on 2026-08-19 |
| CD+Tests | implements | TP | `.agdf/control/artefacts/agent-skills-conformance-portability/CD_TESTS.md` |
| Task Plan Review | verifies | TP | `.agdf/control/artefacts/agent-skills-conformance-portability/TASK_PLAN_REVIEW.md` |
| Clean Implementation Review | verifies | SD | `.agdf/control/artefacts/agent-skills-conformance-portability/CLEAN_IMPLEMENTATION_REVIEW.md` |
| Code Review | verifies | CD+Tests | `.agdf/control/artefacts/agent-skills-conformance-portability/CODE_REVIEW.md` |
| Reviews | support | QA | `.agdf/control/artefacts/agent-skills-conformance-portability/QA_REPORT.md` |
| User approval | approves | QA | Exact `Approval: QA` received on 2026-08-19 |
| User approval | approves | UAT | Exact `Approval: UAT` received on 2026-08-19 |
| OR | summarizes | Run | `.agdf/control/artefacts/agent-skills-conformance-portability/OR.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Core metadata inspection | All ten `plugin/skills/*/SKILL.md` files | YAML frontmatter, names, descriptions and size | direct repository evidence |
| Existing Runtime Integrity | `node plugin/scripts/check-runtime-integrity.mjs` | Current AGDF-owned skill/package invariants | direct deterministic evidence |
| Packaged skill comparison | Installed AGDF 0.13.2 cache versus repository skills | Current installed skill content parity | direct local package evidence |
| Agent Skills specification | `https://agentskills.io/specification` | Public format baseline | external normative source |
| OpenAI skill guidance | `https://learn.chatgpt.com/docs/build-skills` | Current Codex adoption and optional metadata | official host documentation |
| Pre-implementation Brownfield Analysis | `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_ANALYSIS.md` | Existing owners, reuse path, regression and Context Graph fit | direct repository analysis |
| Agent Skills focused conformance suite | `npm --prefix create-agdf run test:agent-skills-conformance` | Ten canonical skills, metadata/profile boundaries, resources, symlinks and four generated surfaces | direct deterministic evidence |
| Full create-agdf smoke | `npm --prefix create-agdf run smoke-test` | Release preparation, package, runtime, 66/66 skill evals and routing | direct deterministic evidence |
| Pages compatibility checks | `npm --prefix pages run test:landing`; `npm --prefix pages run test:public-documents` | Bounded public copy and unchanged page structure/routes | direct deterministic evidence |
| Mandatory reviews | Task Plan Review, Clean Implementation Review and Code Review artefacts | Plan coverage, solution integrity and actual-diff quality | direct review evidence |

## Closeout

- next_allowed_action: Use `delivery-closeout` only when an operative commit, push or pull-request handoff is explicitly requested.
- quality_outlook: Separate strict standard constraints, advisory guidance, intentional plugin dependencies and host-visible behavior in both validation and claims.
