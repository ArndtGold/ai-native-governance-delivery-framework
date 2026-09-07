# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-cross-host-mcp-integration
- lifecycle: active
- revision: 16
- revision_id: BA91873C-57D0-4A24-B3E0-0EFE08CE59CD
- started_at: 2026-09-06
- mode: `structured_delivery`
- current_gate: `UAT`
- decision: `awaiting_approval`
- owner: Arndt Gold

## Objective

Provide one versioned MCP integration contract and reversible lifecycle across Copilot, Codex,
Claude Code and OpenCode while preserving host-native configuration and the existing AGDF server,
dispatcher, activation, target, gate and approval owners.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The approved lifecycle is implemented through one common contract and four native adapters. Final deterministic and aggregate tests pass, direct project-scope lanes are cleaned up, 22/22 TP tasks are fully done, mandatory reviews pass and QA Report Revision 1 is approved. UAT Report Revision 1 presents the bounded acceptance scope. All four exact host qualification tuples remain deliberately `unverified`. |
| What is approved? | UR Revision 1, PRD Revision 1, SD Revision 1, TP Revision 1 and QA Revision 1 are approved through exact gate approvals; Brownfield Review and pre-implementation Brownfield Analysis passed. |
| What is missing? | Exact `Approval: UAT`. Authenticated Claude, callable Copilot, direct Codex/OpenCode failure-path, other OS/client and public package evidence remain later qualification or release limits. |
| What is the next allowed action? | request exact UAT approval |
| What is explicitly forbidden right now? | Publication, release, commit, push and any unsupported host, client or OS claim. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User selected the common four-host adapter and installation layer on 2026-09-06 after committing the completed MCP server run.
- competing_scope_lines: The completed `agdf-mcp-dispatch-server` run remains the server baseline; `agdf-copilot-plugin-integration` retains plugin installation and discovery ownership; the draft `opencode-native-dispatch-tool` remains separate until direct MCP permission evidence supports retirement or continued need.
- branch_workspace_evidence: Branch `main` at baseline `d9d7be70945d4ead16de6fb12830afb7e2c3325d`; the branch was clean before this run.
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
| Current gate | UAT |
| Allowed now | Review the UAT report, request exact UAT approval or prepare a non-operative delivery summary. |
| Blocked by | Exact UAT approval is not yet recorded. |
| Missing approval | `Approval: UAT` |
| Next step | request exact UAT approval |
| Quality outlook | Preserve the distinction between installed state and fresh-session loaded behavior. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `AE03DD51-A43A-4C50-AF8C-1E5A2F9B3266` revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `575EE4E5-9B6E-43F0-AFAC-B264D22B27FF` revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `2CEBCE1F-ED4D-4FFF-827E-65B90C0F22DB` revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `2492951D-2FD8-4AA2-BC58-502B6A6E8EC0` revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-09-07 after same-target, same-run, same-gate and run revision `084A94EE-FB7B-433F-968C-CEF41C75AEF6` revalidation. |
| UAT | missing | none |

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
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CD_TESTS.md` | done | Final serial smoke passes with 83/83 evals, 467 package files and bounded direct qualification gaps. |
| CR | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CODE_REVIEW.md` | done | Revision 1 decision `pass`; all three normalized implementation findings are resolved. |
| QA | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/QA_REPORT.md` | pass | Revision 1 decision `pass`; exact `Approval: QA` accepted after revision-stable revalidation. |
| UAT | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UAT_REPORT.md` | ready | Revision 1 presents the bounded acceptance scope and exact host qualification limits. |

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
| CD+Tests | implements_and_tests | TP | Final serial aggregate and focused suites pass; four independent direct host records and exact cleanup are retained. |
| Task Plan Review | verifies | TP | 22/22 tasks are `fully_done`; bounded host evidence gaps remain explicit. |
| Clean Implementation Review | verifies | CD+Tests | Decision `pass`; no second source of truth or unjustified fallback remains. |
| Code Review | reviews | CD+Tests | Decision `pass`; three implementation findings are resolved with regression evidence. |
| QA_REPORT | tests | TP | Revision 1 decision `pass`; exact `Approval: QA` accepted after revision-stable revalidation. |
| QA_REPORT | approved_by | `Approval: QA` | Exact approval accepted on 2026-09-07 after same-target, same-run, same-gate and revision-15 revalidation. |
| UAT_REPORT | accepts | QA_REPORT | Revision 1 presents the bounded user acceptance scope without release or support qualification claims. |

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
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CD_TESTS.md` | delivered implementation, CHMCP-C01 through C20, final serial aggregate and remaining limits | strong deterministic and direct bounded evidence |
| Direct host evidence | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md` | four project-scope registration, fresh-session or explicit client gap, disable and cleanup lanes | hashed directly observed macOS evidence |
| Task Plan Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TASK_PLAN_REVIEW.md` | 22/22 task completion and UX Intent Fidelity | pass |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | owner reuse, fallbacks, compatibility exits and Brownfield fit | pass |
| Code Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CODE_REVIEW.md` | correctness, rollback, generation and presentation findings | pass; all findings resolved |
| QA Revision 1 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/QA_REPORT.md` | final QA decision and Quality Readiness | pass; approved |
| UAT Revision 1 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UAT_REPORT.md` | bounded user acceptance scope, observed host facts and deliberate limits | ready for acceptance |

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

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: none
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` records the delivered lifecycle owners, shared runtime, four direct outcomes, qualification limits and future release conditions.

## Knowledge Persistence

- memory_target: `context_graph`
- memory_reason: Common lifecycle ownership, adapter boundaries and exact evidence qualification are reusable architecture facts.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`

## Closeout

- next_allowed_action: request exact UAT approval
- quality_outlook: Preserve the distinction between installed state and fresh-session loaded behavior.
