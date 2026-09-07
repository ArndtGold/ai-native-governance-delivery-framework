# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-cross-host-mcp-integration
- lifecycle: active
- revision: 17
- revision_id: B2915C62-3D42-42E8-B3F4-DCB5ACA39F73
- started_at: 2026-09-06
- mode: `structured_delivery`
- current_gate: `QA`
- decision: `awaiting_approval`
- owner: Arndt Gold

## Objective

Provide one versioned MCP integration contract and reversible lifecycle across Copilot, Codex,
Claude Code and OpenCode while preserving host-native configuration and the existing AGDF server,
dispatcher, activation, target, gate and approval owners.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The lifecycle implementation is committed as `c95874957ac78bbccd8b7b31a90b71dbe50ce677`. The user requested a documentation revision before UAT. The public architecture guide now explains the complete design for a first-time reader through six verified diagrams. Refreshed deterministic compatibility, documentation and community-health checks pass, 22/22 TP tasks remain fully done, mandatory reviews pass and QA Report Revision 2 records `pass`. All four exact host qualification tuples remain deliberately `unverified`. |
| What is approved? | UR Revision 1, PRD Revision 1, SD Revision 1 and TP Revision 1 are approved through exact gate approvals; Brownfield Review and pre-implementation Brownfield Analysis passed. QA Revision 1 was approved historically but was superseded by the user-requested documentation revision. |
| What is missing? | Exact `Approval: QA` for QA Report Revision 2. Authenticated Claude, callable Copilot, direct Codex/OpenCode failure-path, other OS/client and public package evidence remain later qualification or release limits. |
| What is the next allowed action? | request exact QA approval for Revision 2 |
| What is explicitly forbidden right now? | UAT approval request, publication, release, further commit or push and any unsupported host, client or OS claim. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User selected the common four-host adapter and installation layer on 2026-09-06 after committing the completed MCP server run.
- competing_scope_lines: The completed `agdf-mcp-dispatch-server` run remains the server baseline; `agdf-copilot-plugin-integration` retains plugin installation and discovery ownership; the draft `opencode-native-dispatch-tool` remains separate until direct MCP permission evidence supports retirement or continued need.
- branch_workspace_evidence: Branch `main` contains implementation commit `c95874957ac78bbccd8b7b31a90b71dbe50ce677`; the current uncommitted scope contains the requested architecture documentation, refreshed deterministic compatibility evidence and updated run artefacts.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- target_source: `continued_target`
- evidence_sources: completed MCP run; current MCP lifecycle, capability metadata and host-adapter source; current Copilot plugin integration; official host documentation; installed Codex, Claude Code and OpenCode probes
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: new cross-host integration contract and missing Copilot MCP adapter
- excluded_mutation_targets: MCP dispatcher semantics; AGDF gate and approval authority; remote MCP; public release; unrelated active runs

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | QA |
| Allowed now | Review QA Report Revision 2, request exact QA approval or request another revision. |
| Blocked by | Exact QA approval for the refreshed documentation revision is not yet recorded. |
| Missing approval | `Approval: QA` |
| Next step | request exact QA approval for Revision 2 |
| Quality outlook | Preserve the entry-level explanation and the distinction between deterministic protocol evidence and direct loaded-host behavior. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `AE03DD51-A43A-4C50-AF8C-1E5A2F9B3266` revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `575EE4E5-9B6E-43F0-AFAC-B264D22B27FF` revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `2CEBCE1F-ED4D-4FFF-827E-65B90C0F22DB` revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `2492951D-2FD8-4AA2-BC58-502B6A6E8EC0` revalidation. |
| QA | awaiting_approval | Revision 1 was approved on 2026-09-07. That approval is historical after the user's later documentation revision request. QA Report Revision 2 records `pass` and requires a new exact approval. |
| UAT | revise | Revision 1 readiness was superseded by the requested entry-level architecture documentation. No UAT decision is currently requested. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UR.md` | approved | Revision 1 defines the four-host integration need, boundaries and observable acceptance criteria. |
| Brownfield Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_REVIEW.md` | done | Existing lifecycle, capability, plugin and host owners inspected; reuse and full-depth triggers recorded. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UX_INTENT_DEFINITION.md` | ready | High-impact activation, state, blocker and recovery semantics are ready as PRD input. |
| Verified Change |  | not_applicable | Structured Delivery selected. |
| PRD | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/PRD.md` | approved | Revision 1 defines the common lifecycle, state vocabulary, plugin separation, host evidence and 20 acceptance criteria. |
| SD | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/SD.md` | approved | Revision 1 defines the common result contract, adapter boundary, Copilot source and precedence, shared runtime migration and separated evidence lanes. |
| TP | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TP.md` | approved | Revision 1 defines 22 ordered tasks, 20 acceptance tests, Brownfield scope, four direct-host lanes and QA stop conditions. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_ANALYSIS.md` | done | Revision 1 decision `pass`; existing owners and the approved minimal clean implementation path are confirmed. |
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CD_TESTS.md` | done | Final serial smoke passes with 83/83 evals and 467 package files; the post-commit architecture, 56-scenario compatibility and community-health checks pass with bounded direct qualification gaps. |
| CR | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CODE_REVIEW.md` | done | Revision 2 decision `pass`; five normalized implementation and evidence findings are resolved. |
| QA | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/QA_REPORT.md` | pass | Revision 2 decision `pass`; exact `Approval: QA` for this revision is pending. |
| UAT | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UAT_REPORT.md` | revise | Revision 1 readiness was superseded by the user-requested architecture documentation revision. |

## Mode/Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth` is decisive because the public lifecycle CLI and compatibility-sensitive host configuration contract expand to Copilot; host trust and permission boundaries plus coordinated four-host qualification also evidence `authority_policy_security_depth` and `release_cross_host_depth`. `structured_slice` is rejected because recovery, precedence, rollback and direct evidence span independent hosts and release boundaries.
- evidence: `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_REVIEW.md`
- transparency_note: The mode follows evidenced external-contract and cross-host effects, not file or owner count. Implementation authority was supplied later by exact TP approval and the passing pre-implementation Brownfield Analysis.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-09-06 after same-run, same-gate and revision-4 revalidation. |
| UR | follows | `run:agdf-mcp-dispatch-server` | completed server and initial lifecycle baseline |
| Brownfield Review | sizes | UR | passed; Structured Delivery selected |
| UX Intent Definition | informs | PRD | ready internal product-semantics input |
| PRD | derived_from | UR | Revision 1 draft consumes Brownfield and UX intent evidence |
| PRD | approved_by | `Approval: PRD` | Exact approval accepted on 2026-09-06 after same-target, same-run, same-gate and revision-8 revalidation. |
| SD | derived_from | PRD | Revision 1 consumes approved product requirements and existing lifecycle owners |
| SD | approved_by | `Approval: SD` | Exact approval accepted on 2026-09-06 after same-target, same-run, same-gate and revision-11 revalidation. |
| TP | derived_from | SD | Revision 1 maps the approved design to source changes, deterministic tests and separate host evidence |
| TP | approved_by | `Approval: TP` | Exact approval accepted on 2026-09-06 after same-target, same-run, same-gate and revision-12 revalidation. |
| Brownfield Analysis | validates | TP | Revision 1 decision `pass`; existing owners, reuse path, regression surface and migration controls are confirmed. |
| CD+Tests | implements_and_tests | TP | Final serial aggregate and focused suites pass; the entry-level architecture, refreshed 56-scenario compatibility record, four independent direct host records and exact cleanup are retained. |
| Task Plan Review | verifies | TP | Revision 2 confirms 22/22 tasks `fully_done`; bounded host evidence gaps remain explicit. |
| Clean Implementation Review | verifies | CD+Tests | Revision 2 decision `pass`; the architecture guide remains explanatory and creates no second source of truth. |
| Code Review | reviews | CD+Tests | Revision 2 decision `pass`; five implementation and evidence findings are resolved. |
| QA_REPORT | tests | TP | Revision 2 decision `pass`; exact `Approval: QA` is pending. |
| QA_REPORT Revision 1 | approved_by | `Approval: QA` | Historical approval accepted on 2026-09-07 after same-target, same-run, same-gate and revision-15 revalidation; superseded by the later documentation revision. |
| UAT_REPORT Revision 1 | revises | QA_REPORT | The user's entry-level architecture request supersedes the earlier UAT readiness and returns the run to QA. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Completed MCP delivery | `.agdf/control/artefacts/agdf-mcp-dispatch-server/OR.md` | server, package, three lifecycle adapters and bounded evidence | approved direct and deterministic |
| Current MCP lifecycle | `create-agdf/lib/mcp-lifecycle/` | shared lifecycle and host-specific adapter seams | direct repository inspection |
| Canonical server package | `agdf-mcp-server/` | SDK v2 process, protocol and package boundary | direct repository inspection |
| Copilot integration baseline | `.agdf/control/artefacts/agdf-copilot-plugin-integration/` and current installer sources | plugin discovery, target behavior and unresolved MCP boundary | direct repository and prior host evidence |
| Explicit target resolution | `target-check --target-source continued_target` on 2026-09-06 | one primary and governance target | deterministic local evidence |
| Brownfield owner inventory | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_REVIEW.md` | existing lifecycle, capability metadata, plugin and adapter boundaries | direct source and official-contract evidence |
| UX intent | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UX_INTENT_DEFINITION.md` | activation, effective state, blockers, recovery and evidence semantics | ready internal analysis |
| PRD Revision 1 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/PRD.md` | common product contract and 20 observable acceptance criteria | approved durable product contract |
| SD Revision 1 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/SD.md` | canonical owners, result schema v2, adapter contract, shared runtime, Copilot precedence and evidence design | approved durable design |
| TP Revision 1 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TP.md` | 22 tasks, 20 acceptance tests, post-TP Brownfield scope, four host lanes and QA stop conditions | approved durable plan |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_ANALYSIS.md` | existing owner reuse, dependency direction, parallel-structure, migration, regression and host-specific analysis | direct repository analysis; pass |
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CD_TESTS.md` | delivered implementation, CHMCP-C01 through C20, entry-level architecture, refreshed compatibility record, final serial aggregate and remaining limits | strong deterministic and direct bounded evidence |
| Direct host evidence | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md` | four project-scope registration, fresh-session or explicit client gap, disable and cleanup lanes | hashed directly observed macOS evidence |
| Entry-level architecture | `docs/architecture/README.md`; `docs/architecture/diagrams/` | system context, invocation paths, lifecycle, shared runtime, native sources, distribution, authority and evidence boundaries | six rendered and visually inspected diagrams; 55 local links resolve |
| Deterministic host compatibility | `docs/compatibility/HOST_COMPATIBILITY.md`; `evals/host-compatibility/observations/0e7808ffcb3af5c49d8f31c97faccd41f3d180d17ca07d6c0d769e673aea4cd7.json` | refreshed source-bound fixture evidence after serial Copilot payload reconciliation | 56/56 scenarios pass |
| Task Plan Review Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TASK_PLAN_REVIEW.md` | 22/22 task completion, documentation revision and UX Intent Fidelity | pass |
| Clean Implementation Review Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | owner reuse, explanatory documentation boundary, fallbacks, compatibility exits and Brownfield fit | pass |
| Code Review Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CODE_REVIEW.md` | correctness, rollback, generation, presentation, CLI documentation and evidence reconciliation findings | pass; all findings resolved |
| QA Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/QA_REPORT.md` | refreshed final QA decision and Quality Readiness | pass; exact approval pending |
| UAT Revision 1 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UAT_REPORT.md` | historical bounded user acceptance scope and subsequent revision request | revise; not ready for acceptance |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Copilot loaded behavior | blocks Copilot support qualification | Use a callable Copilot CLI or observable fresh Desktop/IDE session in a later authorized evidence run. |
| Claude authenticated discovery and call | blocks Claude support qualification | Authenticate a fresh Claude session and repeat the exact direct lane later. |
| Codex and OpenCode direct failure paths | block exact release qualification for those tuples | Capture the controlled failure and recovery path in a later authorized evidence run. |
| Exact OpenCode native-tool disposition | blocks retiring the separate draft | Keep `opencode-native-dispatch-tool` open until comparative permission evidence is conclusive. |
| Native Windows, Linux, OpenCode 2.x and other client behavior | limits cross-platform and cross-client claims | Keep separate exact evidence lanes until directly observed. |
| Published `@agdf/mcp-server@0.14.5` | blocks ordinary registry acquisition | Publish only through a later approved release action. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Host configuration, trust or policy changes after the observed client versions. | warn | Closed native-source inspection and exact qualification tuples fail closed; qualify every later version separately. |
| Positive Codex and OpenCode calls are overstated as complete release qualification. | warn | Keep both records `unverified` until direct controlled failure and recovery evidence is retained. |
| Claude registration is mistaken for loaded-tool behavior. | warn | Keep Claude `unverified` until an authenticated fresh session discovers and calls the tool. |
| Copilot file registration is mistaken for Desktop, IDE or CLI behavior. | warn | Keep Copilot `unverified` until one exact callable client supplies discovery, policy and dispatch evidence. |
| Local package evidence is mistaken for public acquisition readiness. | warn | Keep publication and release outside this run until separately authorized. |
| External filesystem synchronization recreates conflict-named entries in the generated Copilot root. | warn | Run canonical synchronization and all evidence recording serially; exact inventory pruning and package verification must pass before using generated evidence. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: none
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` records the delivered lifecycle owners, entry-level architecture projection, shared runtime, refreshed deterministic compatibility evidence, four direct outcomes, qualification limits and future release conditions.

## Knowledge Persistence

- memory_target: `context_graph`
- memory_reason: Common lifecycle ownership, adapter boundaries, two invocation paths and exact evidence qualification are reusable architecture facts.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`

## Closeout

- next_allowed_action: request exact QA approval for Revision 2
- quality_outlook: Preserve the entry-level explanation and the distinction between deterministic protocol evidence and direct loaded-host behavior.
