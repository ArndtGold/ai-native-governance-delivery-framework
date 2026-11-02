# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: github-community-health-governance
- lifecycle: active
- revision: 2
- revision_id: ec8f97b8-0a6b-4cbb-8e0f-ab8af6e3a035
- content_seal: sha256:ad67a873b6e28706a63f76ad7f5c0502e7cf08ed5ab3d545261efe173ba441dd
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-09-30T08:31:14.803Z
- mode: structured_delivery
- current_gate: UR
- decision: revise
- owner: agent

## Objective

Establish a truthful, project-appropriate and GitHub-recognized community health and maintainer governance surface for AGDF.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Recovery reset approvals without independent provenance; the ordinary approval sequence resumes. |
| What is approved? | Nothing yet. |
| What is missing? | Exact Approval: UR. |
| What is the next allowed action? | Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR. |
| What is explicitly forbidden right now? | create later-gate artefacts beyond the current allowed gate; run Brownfield Analysis as implementation preparation; implement code; claim QA or release readiness |

## Source And Scope State

- normative_instruction_source: Repository instructions, AGDF Runtime Contract and selected run control state
- multi_scope_state: `clear`
- active_scope_evidence: Approved UR and dedicated run `github-community-health-governance`
- competing_scope_lines: Existing OpenCode and other active runs remain separate and are not modified by this scope.
- branch_workspace_evidence: Existing untracked OpenCode control artefacts are unrelated; the Community Health run has its own paths.
- branch_workspace_scope_effect: `supports`

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing |  |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/github-community-health-governance/UR.md` | approved | Project-appropriate community health and governance scope |
| Brownfield Review | `.agdf/control/artefacts/github-community-health-governance/BROWNFIELD_REVIEW.md` | done | Structured Delivery selected; high public UX and security-routing impact |
| UX Intent Definition | `.agdf/control/artefacts/github-community-health-governance/UX_INTENT_DEFINITION.md` | done | Ready; recommended product-decision package accepted on 2026-07-23 |
| Verified Change |  | missing | Not eligible unless Brownfield evidence proves the compact boundary |
| PRD | `.agdf/control/artefacts/github-community-health-governance/PRD.md` | approved | Exact approval accepted on 2026-07-23 |
| SD | `.agdf/control/artefacts/github-community-health-governance/SD.md` | approved | Exact approval accepted on 2026-07-23 |
| TP | `.agdf/control/artefacts/github-community-health-governance/TP.md` | approved | Exact approval accepted on 2026-07-23 |
| Brownfield Analysis | `.agdf/control/artefacts/github-community-health-governance/BROWNFIELD_ANALYSIS.md` | done | Pass; existing owners, reuse path, scope isolation, compatibility and host-evidence gaps verified |
| CD+Tests | `.agdf/control/artefacts/github-community-health-governance/CD_TEST_EVIDENCE.md` | done | Repository scope delivered and focused/regression evidence recorded; unrelated full-suite blockers isolated |
| Clean Implementation Review | `.agdf/control/artefacts/github-community-health-governance/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Pass; no workaround or parallel structure |
| Task Plan Review | `.agdf/control/artefacts/github-community-health-governance/TASK_PLAN_REVIEW.md` | done | Revise; 18/20 tasks fully done with two open evidence obligations |
| CR | `.agdf/control/artefacts/github-community-health-governance/CODE_REVIEW.md` | done | Pass; no code finding |
| QA | `.agdf/control/artefacts/github-community-health-governance/QA_REPORT.md` | revise | Open evidence obligations prevent pass |

## Mode/Slice Decision

- decision: `structured_delivery`
- required_next_gate: Brownfield Analysis
- scope_reason: Public security and contributor policy, safety-relevant recovery paths, GitHub-hosted settings and multiple existing repository owners require explicit product, authority and validation decisions.
- evidence: `.agdf/control/artefacts/github-community-health-governance/BROWNFIELD_REVIEW.md`; GitHub repository and Community Profile APIs; repository owner and workflow inventory.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` | Exact user response recorded on 2026-07-23 |
| Brownfield Review | `derived_from` | UR | Repository, GitHub host and ownership evidence recorded on 2026-07-23 |
| PRD | `derived_from` | UR | Brownfield Review, ready UX Intent Definition and accepted product decisions on 2026-07-23 |
| PRD | `approved_by` | `Approval: PRD` | Exact user response recorded on 2026-07-23 |
| SD | `derived_from` | PRD | All 19 approved product criteria mapped to technical owners and evidence routes on 2026-07-23 |
| SD | `approved_by` | `Approval: SD` | Exact user response recorded on 2026-07-23 |
| TP | `derived_from` | SD | Twenty executable tasks map all approved criteria to deterministic, live-host and post-delivery evidence on 2026-07-23 |
| TP | `approved_by` | `Approval: TP` | Exact user response recorded on 2026-07-23 |
| Brownfield Analysis | `derived_from` | TP | Pre-implementation analysis passed on 2026-07-23 with reuse, scope and regression boundaries |
| CD+Tests | `implements` | TP | Repository-owned implementation and test evidence recorded on 2026-07-23 |
| CR | `reviews` | CD+Tests | Clean and Code Reviews pass; Task Plan Review records 16/20 complete |
| QA_REPORT | `tests` | TP | Revise decision consumes two open evidence obligations without reclassification |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| GitHub Community Profile screenshot | User-provided observation | Missing public community profile components | direct host-visible observation |
| Repository community-file inventory | `.github/`, repository root | Existing README/License and missing policy/templates | direct repository evidence |
| Approved UR | `.agdf/control/artefacts/github-community-health-governance/UR.md` | Intended outcome, scope, non-goals and acceptance signals | authoritative scope evidence |
| Brownfield Review | `.agdf/control/artefacts/github-community-health-governance/BROWNFIELD_REVIEW.md` | Existing owners, coverage, host state and Structured Delivery routing | direct repository and host evidence |
| UX Intent Definition | `.agdf/control/artefacts/github-community-health-governance/UX_INTENT_DEFINITION.md` | Working modes, state authority, blockers, recovery and resolved product choices | structured analytical evidence |
| Approved PRD | `.agdf/control/artefacts/github-community-health-governance/PRD.md` | Product scope, nineteen observable criteria, evidence and public policy boundaries | authoritative product evidence |
| Approved Solution Design | `.agdf/control/artefacts/github-community-health-governance/SD.md` | Canonical policy owners, GitHub adapters, validation, external integration and evidence separation | authoritative technical evidence |
| Approved Task/Test Plan | `.agdf/control/artefacts/github-community-health-governance/TP.md` | Twenty tasks, test matrix, Brownfield scope, QA rules and post-delivery evidence boundary | authoritative execution evidence |
| Brownfield Analysis | `.agdf/control/artefacts/github-community-health-governance/BROWNFIELD_ANALYSIS.md` | Existing coverage, reuse path, exact scope, compatibility, risks and evidence gaps | implementation-preparation evidence |
| CD+Tests Evidence | `.agdf/control/artefacts/github-community-health-governance/CD_TEST_EVIDENCE.md` | Delivered files, passing checks and isolated unrelated failures | implementation evidence |
| Clean Implementation Review | `.agdf/control/artefacts/github-community-health-governance/CLEAN_IMPLEMENTATION_REVIEW.md` | Primary solution, fallback and parallel-structure assessment | pass |
| Code Review | `.agdf/control/artefacts/github-community-health-governance/CODE_REVIEW.md` | Correctness, security, compatibility and maintainability review | pass |
| Task Plan Review | `.agdf/control/artefacts/github-community-health-governance/TASK_PLAN_REVIEW.md` | 20-task coverage and UX Intent Fidelity | revise |
| QA Report | `.agdf/control/artefacts/github-community-health-governance/QA_REPORT.md` | Formal QA decision and consumed findings | revise |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Private vulnerability reporting availability | `warn` | Confirm the host capability during implementation; use the approved email fallback if unavailable. |
| Default-branch Community Profile recognition | `warn` | Verify after repository files are delivered to the default branch. |
| Applied GitHub metadata and social preview | `warn` | Verify through public or authenticated host observation after application. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Public policy text could promise unsupported response behavior | `warn` | Enforce the approved no-SLA and current-release-only boundaries through deterministic policy assertions. |
| New files could duplicate existing Pages or runtime documentation instead of routing to canonical owners | `warn` | Brownfield Review must identify canonical owners and link rather than copy where appropriate. |
| Host metadata and repository files could drift because they have separate mutation paths | `warn` | Define separate validation and delivery evidence for repository files and GitHub-hosted settings. |

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `create`
- context_graph_gate_effect: `none`
- context_graph_evidence: `CG-PUBLIC-COMMUNITY-GOVERNANCE` now records the durable ownership, security, host-state and exit-criteria decisions.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Public governance, security and contribution rules are durable project policy and must remain repository-owned.
- memory_refs: `.agdf/control/artefacts/github-community-health-governance/UR.md`

## Closeout

- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook: Reuse existing product, runtime and release owners while making externally visible policy truthful and maintainable.
