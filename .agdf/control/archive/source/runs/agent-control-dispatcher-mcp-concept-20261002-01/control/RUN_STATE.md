# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agent-control-dispatcher-mcp-concept-20261002-01
- lifecycle: active
- revision: 17
- revision_id: 3d9a7a03-ea22-4ae0-8c29-edd175ebf0b1
- content_seal: sha256:e3eaf35734b4153caa49a1b7c0d6a6f0ec3335120fa90854aa439ef0ac031575
- approval_seal: sha256:c66ca7b7f5b0d533c73df3d2c24a56ce02d887cd9fa6c2ec8e81ef0ce09bd6e5
- updated_at: 2026-10-02T14:44:29.064Z
- mode: structured_delivery
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Deliver a complete, evidenced joint concept for controlling coding-agent actions and verifying their work across canonical AGDF control, Dispatcher, MCP and hosts. Produce a validation and separately governed implementation roadmap; runtime implementation is excluded.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Concept produced and reviewed; canonical content moved to docs by explicit user request; QA report pass, human QA approval pending. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Present the refreshed QA report and request exact Approval: QA. |
| What is explicitly forbidden right now? | implement before Brownfield evidence supports the approved TP path; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-02 · revision 2 · `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/UR.md` sha256:7b8ac86901af2f70 · presentation 9a116b8b-4db6-4951-8a9d-c9baf2960814 sha256:3e16f437ef161d593da7565673a8df710e486b55423407af677ceba30e717b5d |
| PRD | approved | `Approval: PRD` · 2026-10-02 · revision 5 · `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/PRD.md` sha256:3fb1e765debfc306 · presentation 2a58c581-d089-4117-9527-94ff8a0465a8 sha256:8cdb7db42ad046c902f9c36cf18a2aa01175b0ebf64ac089dbbb8a94e0aae4aa |
| SD | approved | `Approval: SD` · 2026-10-02 · revision 8 · `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/SD.md` sha256:a4ab2b44b994bbff · presentation b211dcec-207e-455f-9799-295b442d9845 sha256:74c655f1b06771685619b3b958ae35e7684eaa04357db89c7165992f9d4ddf0f |
| TP | approved | `Approval: TP` · 2026-10-02 · revision 10 · `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/TP.md` sha256:f0df7c35d30032d5 · presentation e7a78017-ca78-4269-b683-a4bae340495f sha256:8a2e5ca51a59d1fad1a265eedd7721ea42eecc24cdc4597c65e77483ba5e7efd |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/PRD.md` | approved | Nine stable concept acceptance criteria; concept-only deliverable |
| SD | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/SD.md` | approved | Nine design decisions mapped to every PRD criterion; concept-only output |
| TP | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/TP.md` | approved | Ten concept-only tasks and 22 verification mappings |
| Brownfield Analysis | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/BROWNFIELD_ANALYSIS.md` | done | Passed concept-only preparation; no runtime implementation authority |
| CD+Tests | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/CD_TESTS.md` | done | Complete concept; 13 structural checks and 22 semantic walkthrough mappings; no runtime enforcement claim |
| CR | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/CODE_REVIEW.md` | done | Actual documentary change review passed; executable-code review not applicable; same-agent review disclosed |
| QA | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/QA_REPORT.md` | pass | qa-gate pass for concept-only deliverable; human QA approval pending |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: architecture_runtime_depth: integrated concept spans execution, trust, concurrency, recovery and host boundaries; a local structured_slice cannot satisfy the approved overall model. Concept only; runtime implementation excluded.
- evidence: .agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/BROWNFIELD_REVIEW.md: Architecture Impact and Structured Depth Evidence; approved UR sections 3-5

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| QA_REPORT | tests | TP | QA_REPORT.md criterion coverage and TP_REVIEW.md task matrix verify the concept-only TP against CD_TESTS.md and CONCEPT_CHECKS.json. |
| TP | derived_from | SD | TP sections 1-3 map all nine SD decisions and all nine PRD criteria to concept-only tasks, scenarios and evidence; no proposed runtime implementation task. |
| SD | derived_from | PRD | SD section 7 maps AC-001 through AC-009 exactly once to the proposed concept structure, existing owners and SDD-001 through SDD-009; approved PRD remains the acceptance source. |
| PRD | derived_from | UR | PRD sections 1, 5 and 6 derive the complete concept deliverable and nine criteria from approved UR sections 2-5; Brownfield Review records the existing owners and concept-only boundary. |
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-02 · revision 2 · `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/UR.md` sha256:7b8ac86901af2f70 · presentation 9a116b8b-4db6-4951-8a9d-c9baf2960814 sha256:3e16f437ef161d593da7565673a8df710e486b55423407af677ceba30e717b5d |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Canonical docs integration | `docs/architecture/agent-control-concept.md`; `docs/architecture/README.md`; `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/DOCS_INTEGRATION.md` | Explicit same-outcome location refinement; one concept copy; 17 checks and unchanged substantive digest verified | document/source checks and same-agent review |
| Complete concept and checks | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/CONCEPT.md`; `CONCEPT_CHECKS.json`; `CD_TESTS.md` | Nine criteria, nine decisions, seven UR signals; 13 structure checks, 22 inspected scenarios | source/document verified; not runtime prevention |
| Task Plan Review | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/TP_REVIEW.md` | All ten TP tasks and applicable concept UX fidelity | same-agent review |
| Clean Implementation Review | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/CLEAN_IMPLEMENTATION_REVIEW.md` | Canonical owners, fallback boundaries, absence of parallel control | same-agent review |
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: Existing dispatcher/interaction/MCP nodes remain reading references; no current runtime authority or SoT change.
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The concept is a run-scoped proposal; accepted future runtime changes require separate curation in their own scopes.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Preserve the whole proposed control concept and its evidence with this exact governed run; do not promote proposals into current runtime policy.
- memory_refs: .agdf/control/artefacts/agent-control-dispatcher-mcp-concept-20261002-01/CONCEPT.md

## Closeout

- next_allowed_action: Run the QA gate, persist the QA report, and request exact approval: Approval: QA
- quality_outlook:
