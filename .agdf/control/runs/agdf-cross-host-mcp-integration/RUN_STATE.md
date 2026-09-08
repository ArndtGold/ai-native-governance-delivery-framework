# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-cross-host-mcp-integration
- lifecycle: completed
- revision: 29
- revision_id: 4A7D2445-3D59-42FA-84F1-8397D7F80098
- started_at: 2026-09-06
- mode: `structured_delivery`
- current_gate: `OR`
- decision: `completed`
- owner: Arndt Gold

## Objective

Provide one versioned MCP integration contract and reversible lifecycle across Copilot, Codex,
Claude Code and OpenCode while preserving host-native configuration and the existing AGDF server,
dispatcher, activation, target, gate and approval owners.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The run is complete. QA Report Revision 6 passed, bounded UAT Report Revision 4 is accepted and the OR retains every host qualification limit. The later Codex terminal-fidelity and QA-run-discovery observations are routed to a separate correction scope. |
| What is approved? | UR Revision 1, PRD Revision 2, SD Revision 2, TP Revision 2, QA Report Revision 6 and UAT Report Revision 4 are approved through exact gate approvals. Earlier contract revisions remain historical. |
| What is missing? | No approval is missing for governance closeout. Authenticated Claude, callable Copilot MCP, complete OpenCode argument fidelity, direct failure paths, other OS/client and public package evidence remain explicit non-claims. |
| What is the next allowed action? | Handle the post-acceptance Codex findings in one separately governed correction scope. |
| What is explicitly forbidden right now? | Publication, release, automatic commit, push or PR and any unsupported host, client or OS claim. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User selected the common four-host adapter and installation layer on 2026-09-06 after committing the completed MCP server run.
- competing_scope_lines: The completed `agdf-mcp-dispatch-server` run remains the server baseline; `agdf-copilot-plugin-integration` retains plugin installation and discovery ownership; the draft `opencode-native-dispatch-tool` remains separate until direct MCP permission evidence supports retirement or continued need.
- branch_workspace_evidence: Branch `main` contains implementation commit `c95874957ac78bbccd8b7b31a90b71dbe50ce677` and current HEAD `599b23b` contains the entry-level architecture documentation. The current uncommitted scope contains the completed strict language correction, generated projections, strengthened evals, Copilot evidence corrections, final governance reviews, the retained deterministic compatibility observation and the 25-file direct language-host record.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- target_source: `continued_target`
- evidence_sources: completed MCP run; current MCP lifecycle, capability metadata and host-adapter source; current Copilot plugin integration; official host documentation; installed Codex, Claude Code and OpenCode probes
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: bounded revision of the existing cross-host MCP presentation-language contract
- excluded_mutation_targets: MCP tool count and protocol versions; AGDF target, gate and approval authority; remote MCP; public release; unrelated active runs

## Run Status Card

| Run status | Value |
|---|---|
| Status | Completed with bounded UAT acceptance and explicit host qualification limits |
| Current gate | OR |
| Allowed now | Prepare a VCS handoff only when explicitly requested; start the separate Codex correction through its own gates. |
| Blocked by | none |
| Missing approval | none |
| Next step | Handle the post-acceptance Codex findings in one separately governed correction scope. |
| Quality outlook | Retain host-specific runtime verification and exact evidence boundaries. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `AE03DD51-A43A-4C50-AF8C-1E5A2F9B3266` revalidation. |
| PRD | approved | Exact `Approval: PRD` for Revision 2 accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `61989C89-12F3-48B9-BAA2-ECEFED642710` revalidation. Revision 1 remains historical. |
| SD | approved | Exact `Approval: SD` for Revision 2 accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `2E1B7AA5-DE70-4E48-81FA-D4BE87535168` revalidation. Revision 1 remains historical. |
| TP | approved | Exact `Approval: TP` for Revision 2 accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `A1667D1E-1C90-487D-A439-90572F52625D` revalidation. Revision 1 remains historical. |
| QA | approved | Exact `Approval: QA` for QA Report Revision 6 accepted on 2026-09-08 after revalidating target, run, gate and run revision `910C5F55-6AA0-4FE4-BD70-D3C8A8174DCA`. Historical Revision 1 approval remains superseded. |
| UAT | approved | Exact `Approval: UAT` for bounded UAT Report Revision 4 accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `C8CD4D2B-CC33-4294-B149-2C01C4B43BCF` revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UR.md` | approved | Revision 1 defines the four-host integration need, boundaries and observable acceptance criteria. |
| Brownfield Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_REVIEW.md` | done | Existing lifecycle, capability, plugin and host owners inspected; reuse and full-depth triggers recorded. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UX_INTENT_DEFINITION.md` | ready | High-impact activation, state, blocker and recovery semantics are ready as PRD input. |
| Verified Change |  | not_applicable | Structured Delivery selected. |
| PRD | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/PRD.md` | approved | Revision 2 defines the four language states, current-request precedence, strict public tag contract, complete English fallback and semantic/registry ownership. |
| SD | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/SD.md` | approved | Revision 2 separates host selection, strict external validation, pack resolution and system-locale adaptation and defines one shared dual-protocol matrix. |
| TP | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TP.md` | approved | Revision 2 maps eight pending correction tasks, six acceptance checks and separate dual-protocol and loaded-host evidence. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_ANALYSIS.md` | done | Revision 2 decision `pass`; existing semantic, presentation, CLI and MCP owners support the approved correction without a parallel source of truth. |
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CD_TESTS.md` | done | Revision 6 records strict input, registry invariants, both protocol reports, final smoke, direct language observations and complete cleanup. |
| TP Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TASK_PLAN_REVIEW.md` | done | Revision 5 decision `pass`; all 30 tasks are fully done and C21 through C26 map to evidence. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Revision 6 decision `pass`; one primary solution and no parallel semantic, registry or host-language owner. |
| CR | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CODE_REVIEW.md` | done | Revision 6 decision `pass`; CR-07 through CR-13 are resolved and no open finding remains. |
| QA | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/QA_REPORT.md` | pass | Revision 6 decision `pass`; exact `Approval: QA` accepted after run-revision revalidation. |
| UAT | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UAT_REPORT.md` | approved | Revision 4 bounded acceptance approved exactly on 2026-09-08; Claude, Copilot and argument-fidelity limits remain disclosed. |
| OR | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/OR.md` | pass | Full closeout; bounded UAT accepted, host limits retained and the later Codex observation routed separately. |

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
| PRD Revision 1 | approved_by | `Approval: PRD` | Historical approval accepted on 2026-09-06 after same-target, same-run, same-gate and revision-8 revalidation. |
| PRD Revision 2 | supersedes | PRD Revision 1 | The language weakness review requires explicit missing, invalid, unsupported and mixed-language behavior. |
| PRD | derived_from | UR | Revision 2 consumes the approved scope plus direct production MCP and registry-mutation evidence. |
| PRD Revision 2 | approved_by | `Approval: PRD` | Exact approval accepted on 2026-09-08 after same-target, same-run, same-gate and revision-20 revalidation. |
| SD Revision 2 | supersedes | SD Revision 1 | The approved language contract requires strict validation, enforced English fallback and one shared matrix. |
| SD | derived_from | PRD | Revision 2 consumes approved PRD Revision 2 and the direct weakness evidence. |
| SD Revision 2 | approved_by | `Approval: SD` | Exact approval accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `2E1B7AA5-DE70-4E48-81FA-D4BE87535168` revalidation. |
| SD Revision 1 | approved_by | `Approval: SD` | Historical approval accepted on 2026-09-06 after same-target, same-run, same-gate and revision-11 revalidation. |
| TP Revision 1 | derived_from | SD Revision 1 | Historical plan maps the previous design to source changes and evidence. |
| TP Revision 1 | approved_by | `Approval: TP` | Historical approval accepted on 2026-09-06 after same-target, same-run, same-gate and revision-12 revalidation. |
| TP Revision 2 | supersedes | TP Revision 1 | The approved language design requires strict validation, registry invariants and separate protocol and host evidence. |
| TP | derived_from | SD | Revision 2 consumes approved SD Revision 2 and maps CHMCP-AC-21 through CHMCP-AC-24 to pending work. |
| TP Revision 2 | approved_by | `Approval: TP` | Exact approval accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `A1667D1E-1C90-487D-A439-90572F52625D` revalidation. |
| Brownfield Analysis | validates | TP | Revision 1 decision `pass`; existing owners, reuse path, regression surface and migration controls are confirmed. |
| Brownfield Analysis Revision 2 | validates | TP Revision 2 | Decision `pass`; strict validation, immutable English fallback, detected-system-locale separation and evidence lanes reuse existing owners. |
| CD+Tests Revision 6 | implements_and_tests | TP Revision 2 | Strict validation, registry invariants, trusted system locale, shared dual-protocol matrix, direct host observations and exact cleanup pass. |
| Task Plan Review Revision 5 | verifies | TP Revision 2 | All 30 tasks are fully done; C21 through C26 map to current evidence. |
| Clean Implementation Review Revision 6 | reviews | CD+Tests Revision 6 | One primary solution passes without a parallel semantic, registry or host-language owner. |
| Code Review Revision 6 | reviews | CD+Tests Revision 6 | CR-07 through CR-13 are resolved and no open review finding remains. |
| QA_REPORT | tests | TP | Revision 6 decision `pass`; exact current QA approval is recorded. |
| QA_REPORT | approved_by | `Approval: QA` | Exact approval accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `910C5F55-6AA0-4FE4-BD70-D3C8A8174DCA` revalidation. |
| QA_REPORT Revision 1 | approved_by | `Approval: QA` | Historical approval accepted on 2026-09-07 after same-target, same-run, same-gate and revision-15 revalidation; superseded by the later documentation revision. |
| UAT_REPORT Revision 3 | superseded_by | UAT_REPORT Revision 4 | QA Revision 6 approval permits a current bounded acceptance decision. |
| UAT_REPORT Revision 4 | evaluates | QA_REPORT Revision 6 | Deterministic behavior, direct Codex and retried OpenCode outcomes are ready; Claude, Copilot and exact qualification gaps stay disclosed. |
| UAT_REPORT Revision 4 | approved_by | `Approval: UAT` | Exact approval accepted on 2026-09-08 after same-target, same-run, same-gate and run revision `C8CD4D2B-CC33-4294-B149-2C01C4B43BCF` revalidation. |
| OR | closes | UAT_REPORT Revision 4 | Full closeout retains accepted scope, evidence limits, compatible fallback and separately routed Codex findings. |

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
| PRD Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/PRD.md` | common product contract plus deterministic presentation-language states and 24 observable acceptance criteria | approved durable product contract |
| SD Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/SD.md` | strict tag boundary, English registry invariant, semantic projection, separate system locale and shared protocol matrix | approved durable solution design |
| TP Revision 2 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TP.md` | eight pending correction tasks, six new acceptance checks and separate protocol and host evidence | approved durable task and test plan |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_ANALYSIS.md` | existing owner reuse, dependency direction, parallel-structure, migration, regression and host-specific analysis | direct repository analysis; pass |
| CD+Tests Revision 6 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CD_TESTS.md` | all 30 tasks, C21 through C26, full smoke and bounded host results | current passing implementation evidence |
| Direct host evidence | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md`; `evidence/language-host/` | five Codex and retried OpenCode language cases, explicit Claude/Copilot gaps and complete removal | 25-file hashed directly observed macOS evidence |
| Entry-level architecture | `docs/architecture/README.md`; `docs/architecture/diagrams/` | system context, invocation paths, lifecycle, shared runtime, native sources, distribution, authority and evidence boundaries | six rendered and visually inspected diagrams; 55 local links resolve |
| Deterministic host compatibility | `docs/compatibility/HOST_COMPATIBILITY.md`; `evals/host-compatibility/observations/0e7808ffcb3af5c49d8f31c97faccd41f3d180d17ca07d6c0d769e673aea4cd7.json` | refreshed source-bound fixture evidence after serial Copilot payload reconciliation | 56/56 scenarios pass |
| Task Plan Review Revision 5 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/TASK_PLAN_REVIEW.md` | 30/30 completion and C21 through C26 trace | pass |
| Clean Implementation Review Revision 6 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | primary solution, owner reuse and fallback review | pass |
| Code Review Revision 6 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/CODE_REVIEW.md` | correctness, regression, security, maintainability and resolved CR-07 through CR-13 | pass |
| QA Revision 6 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/QA_REPORT.md` | complete quality decision and bounded qualification limits | pass; exact user approval accepted |
| UAT Revision 4 | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UAT_REPORT.md` | bounded deterministic and direct-host acceptance scope with explicit qualification limits | approved |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Copilot loaded behavior | blocks Copilot support qualification | Use a callable Copilot CLI or observable fresh Desktop/IDE session in a later authorized evidence run. |
| Claude authenticated discovery and call | blocks Claude support qualification | Authenticate a fresh Claude session and repeat the exact direct lane later. |
| Complete OpenCode argument fidelity and direct failure paths | block exact OpenCode release qualification | Retain the observed 1.18.3 variance and qualify a future exact tuple with discovery, intended arguments, controlled failure and cleanup. |
| Codex direct failure path | blocks exact Codex release qualification | Capture the controlled failure and recovery path in a later authorized evidence run. |
| Exact OpenCode native-tool disposition | blocks retiring the separate draft | Keep `opencode-native-dispatch-tool` open until comparative permission evidence is conclusive. |
| Native Windows, Linux, OpenCode 2.x and other client behavior | limits cross-platform and cross-client claims | Keep separate exact evidence lanes until directly observed. |
| Published `@agdf/mcp-server@0.14.5` | blocks ordinary registry acquisition | Publish only through a later approved release action. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Loaded models can select a valid language or other argument that does not match the current request. | warn | Keep selection in the function contract, enforce only observable input at the server and retain direct host argument evidence separately. |
| OpenCode fresh-session discovery and argument fidelity vary. | warn | Require native connected preflight for qualification, preserve first attempts and do not infer complete support from a retry. |
| Host configuration, trust or policy changes after the observed client versions. | warn | Closed native-source inspection and exact qualification tuples fail closed; qualify every later version separately. |
| Positive Codex and OpenCode language calls are overstated as complete release qualification. | warn | Keep release qualification `unverified` until each exact tuple includes direct controlled failure and recovery evidence; retain the OpenCode mixed-run fidelity gap. |
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
- context_graph_evidence: Approved PRD, SD and TP Revision 2, CD+Tests Revision 6, Task Plan Review
  Revision 5, Clean Implementation Review Revision 6, Code Review Revision 6, QA Revision 6 and
  hashed loaded-host evidence record the corrected language boundary and remaining qualification limits.

## Knowledge Persistence

- memory_target: `context_graph`
- memory_reason: Common lifecycle ownership, adapter boundaries, strict language validation,
  locale-pack resolution and exact evidence qualification are reusable architecture facts.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`

## Closeout

- next_allowed_action: Handle the post-acceptance Codex terminal-fidelity and QA-run-discovery findings in one separately governed correction scope.
- quality_outlook: Retain host-specific runtime verification and exact evidence boundaries.
