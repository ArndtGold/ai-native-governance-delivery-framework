# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-mcp-dispatch-server
- lifecycle: completed
- revision: 30
- revision_id: C0BB22B4-23EB-4E63-A510-3A0BABB4F55C
- started_at: 2026-09-05
- mode: `structured_delivery`
- current_gate: `OR`
- decision: `pass`
- owner: Arndt Gold

## Objective

Provide one standard, cross-host MCP interface for bounded AGDF skill dispatch while preserving the
existing dispatcher, CLI verification path, target authority, durable control state and exact gate
approval semantics.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Direct OpenCode and Codex evidence proves the functional host matrix, while controlled MCP clients prove both required protocol generations against the same production server definition. QA Report Revision 2 passes, UAT Report Revision 1 is accepted, and the German OR closeout projection passes after its final locale correction. |
| What is approved? | UR Revision 1, PRD Revision 4, SD Revision 3, TP Revision 2, QA Report Revision 2 and UAT Report Revision 1 are approved. TP Revision 1 remains a historical approved baseline only. |
| What is missing? | Nothing for the approved first-release scope. OpenCode 2.x, Linux, Windows and GitHub Copilot MCP remain separate unverified support lanes. |
| What is the next allowed action? | Provide the scoped delivery closeout and await an explicit VCS or release instruction. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, publication or release and any support claim beyond the qualified host tuples. |

## Source And Scope State

- normative_instruction_source: approved `.agdf/control/artefacts/agdf-mcp-dispatch-server/UR.md`, PRD Revision 4, SD Revision 3 and TP Revision 2; historical approved TP Revision 1; direct host and deterministic protocol evidence; live AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: The user explicitly requested that SD and TP separate directly observable host evidence from the dual-protocol proof. PRD Revision 4 contains the same minimal correction because Revision 3 held the conflicting product requirement. Exact `Approval: PRD` was accepted on 2026-09-06 only after revalidating target, run, gate and run revision 15. Exact `Approval: SD` was accepted for Revision 3 on 2026-09-06 only after revalidating target, run, gate and run revision `17085BD6-6F37-465E-B1D6-133596F235AE`. Exact `Approval: TP` was accepted for Revision 2 on 2026-09-06 only after revalidating target, run, gate and run revision `700BEC82-EA10-46BA-9F0C-DFADA23CC5E7`. Exact `Approval: QA` was accepted for QA Report Revision 2 on 2026-09-06 only after revalidating target, run, gate and run revision `66315C86-EA37-4571-A93E-4B64D8A95391`. Exact `Approval: UAT` was accepted for UAT Report Revision 1 on 2026-09-06 only after revalidating target, run, UAT gate and run revision `998853BA-48D0-49C2-BA0B-8F2133582536`. The canonical locale owner and regression suite cover the standard German gate actions and post-approval transitions.
- competing_scope_lines: `cross-surface-executable-skill-dispatcher` owns the existing dispatcher; `opencode-native-dispatch-tool` remains a separate unapproved OpenCode-only proposal; `agdf-public-plugin-distribution` retains its Skills-only public-candidate boundary.
- branch_workspace_evidence: Baseline commit `d0d4d9ff822f52521675a20bf49d7ae969978bd8`; the current uncommitted diff contains the approved MCP implementation, tests, documentation, direct-host evidence and governance artefacts. OpenCode, Claude Code and Codex project registrations were temporarily changed under explicit user authorization and restored to their exact pre-test absent state. No installed cache, release or VCS delivery state was changed.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: approved artefacts; final repository diff; focused and aggregate test output; retained OpenCode, Codex and Claude Code direct-host NDJSON; installed Node, Codex, Claude Code and OpenCode CLI observations; current official MCP and host documentation
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: the approved revised artefacts change evidence classification only; the implemented local, offline, read-only, one-tool MCP boundary and all host cleanup evidence remain unchanged
- excluded_mutation_targets: installed caches; public Skills-only MCP content; approval semantics; unrelated run artefacts; publication, release and VCS delivery state

## Run Status Card

| Run status | Value |
|---|---|
| Status | pass |
| Current gate | OR |
| Allowed now | Report the completed delivery state and prepare a scoped VCS handoff. |
| Blocked by | none |
| Missing approval | none |
| Next step | Produce delivery closeout or requested handoff; do not perform VCS actions automatically. |
| Quality outlook | Preserve the distinction between installed state and fresh-session loaded behavior. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-06 after same-target, same-run, same-gate and revision `B2B7A53C-8A4B-44C5-8E97-D996B17F4C26` revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted for Revision 4 on 2026-09-06 after same-target, same-run, same-gate and run revision `334AE415-18B0-4A89-9035-06AFE6834F88` revalidation. |
| SD | approved | Exact `Approval: SD` accepted for Revision 3 on 2026-09-06 after same-target, same-run, same-gate and run revision `17085BD6-6F37-465E-B1D6-133596F235AE` revalidation. |
| TP | approved | Exact `Approval: TP` accepted for Revision 2 on 2026-09-06 after same-target, same-run, same-gate and run revision `700BEC82-EA10-46BA-9F0C-DFADA23CC5E7` revalidation. |
| QA | approved | Exact `Approval: QA` accepted for QA Report Revision 2 on 2026-09-06 after same-target, same-run, same-gate and run revision `66315C86-EA37-4571-A93E-4B64D8A95391` revalidation. |
| UAT | approved | Exact `Approval: UAT` accepted for UAT Report Revision 1 on 2026-09-06 after same-target, same-run, same-gate and run revision `998853BA-48D0-49C2-BA0B-8F2133582536` revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-mcp-dispatch-server/UR.md` | approved | Revision 1. |
| Brownfield Review | `.agdf/control/artefacts/agdf-mcp-dispatch-server/BROWNFIELD_REVIEW.md` | done | Structured Delivery selected. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-mcp-dispatch-server/UX_INTENT_DEFINITION.md` | ready | High-impact activation, state and recovery semantics. |
| Verified Change |  | not_applicable | External contract, runtime, permission and cross-host release boundaries changed. |
| PRD | `.agdf/control/artefacts/agdf-mcp-dispatch-server/PRD.md` | approved | Revision 4; exact approval accepted against run revision 15. |
| SD | `.agdf/control/artefacts/agdf-mcp-dispatch-server/SD.md` | approved | Revision 3; exact approval accepted against run revision 17. |
| TP | `.agdf/control/artefacts/agdf-mcp-dispatch-server/TP.md` | approved | Revision 2; exact approval accepted against run revision 20. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-mcp-dispatch-server/BROWNFIELD_ANALYSIS.md` | done | Revision 2 revalidation against approved TP Revision 2; decision `pass`. |
| CD+Tests | `.agdf/control/artefacts/agdf-mcp-dispatch-server/CD_TESTS.md` | done | Current TP Revision 2 classifications, separated evidence lanes and the final clean-snapshot OR locale regression pass. |
| Direct Host Evidence | `.agdf/control/artefacts/agdf-mcp-dispatch-server/DIRECT_HOST_EVIDENCE.md` | done | OpenCode and Codex observable host tuples complete and fully removed; controlled clients separately prove both required protocol generations. |
| TP Review | `.agdf/control/artefacts/agdf-mcp-dispatch-server/TP_REVIEW.md` | done | Revision 2 decision `pass`; 18/18 tasks fully done. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-mcp-dispatch-server/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Revision 2 decision `pass`; no parallel owner or workaround finding remains. |
| CR | `.agdf/control/artefacts/agdf-mcp-dispatch-server/CODE_REVIEW.md` | done | Revision 2 decision `pass`; six corrections resolved and no open finding remains. |
| QA | `.agdf/control/artefacts/agdf-mcp-dispatch-server/QA_REPORT.md` | pass | Revision 2 decision `pass`; exact QA approval recorded against run revision 26. |
| OR | `.agdf/control/artefacts/agdf-mcp-dispatch-server/OR.md` | pass | Final OR-full records exact UAT acceptance and the completed bounded delivery. |
| UAT | `.agdf/control/artefacts/agdf-mcp-dispatch-server/UAT_REPORT.md` | accepted | Revision 1 accepts the directly observable outcome and bounded support claims. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `UAT`
- scope_reason: `external_contract_depth`; this work adds a compatibility-sensitive MCP tool and process boundary, changes host registration behavior and extends package/runtime ownership across multiple hosts
- evidence: `.agdf/control/artefacts/agdf-mcp-dispatch-server/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-mcp-dispatch-server/UX_INTENT_DEFINITION.md`
- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: MCP changes visible tool availability, invocation, permission, status, terminal recovery and fallback behavior across coding-agent hosts.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval and revision revalidation. |
| PRD | derived_from | UR | Approved Revision 4 retains the UR scope and separates host from protocol evidence. |
| SD | derived_from | PRD | Approved Revision 3 implements the revised evidence ownership without architecture changes. |
| TP | derived_from | SD | Approved Revision 2 maps host and protocol evidence to separate acceptance cases. |
| Brownfield Analysis | analyzes | TP | Revision 2 decision `pass`; all TP Revision 2 paths reuse existing canonical owners and evidence. |
| CD+Tests | implements_and_tests | TP | Current Revision 2 evidence maps all 18 tasks and 22 test cases to the separated functional host and controlled protocol lanes; exact-snapshot aggregate validation passes. |
| TP Review | verifies | TP | Revision 2 result `pass`; 18/18 tasks fully done. |
| Clean Implementation Review | verifies | CD+Tests | Revision 2 decision `pass`; the solution retains one clean owner per concern. |
| Code Review | verifies | CD+Tests | Revision 2 decision `pass`; no open correctness, security, regression or maintainability finding. |
| QA_REPORT | tests | TP | Revision 2 decision `pass`; approved for the exact bounded scope. |
| QA | approved_by | `Approval: QA` | Exact approval accepted on 2026-09-06 after target, run, gate and revision-26 revalidation. |
| UAT | evaluates | QA_REPORT | Revision 1 exposes the qualified OpenCode and Codex outcomes, protocol evidence and unverified host boundaries for user acceptance. |
| UAT | approved_by | `Approval: UAT` | Exact approval accepted on 2026-09-06 after target, run, UAT gate, persisted report revision and run revision 27 revalidation. |
| OR | closes_out | UAT | Final OR-full records all approved gates and the completed bounded delivery. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Gate approvals | Source AGDF 0.14.5 gate-check on 2026-09-06 | UR Revision 1, PRD Revision 4, SD Revision 3, TP Revision 2, QA Report Revision 2 and UAT Report Revision 1 target/run/gate/revision binding; historical TP Revision 1 | current plus historical deterministic evidence |
| Brownfield Analysis | `BROWNFIELD_ANALYSIS.md` | existing owner reuse and bounded refactors | direct repository analysis; pass |
| Canonical MCP contract | `skill-dispatch/contract.js`; MCP contract and protocol tests | one semantic owner, exact schemas, annotations and two protocol generations | deterministic implementation evidence |
| Read-only server boundary | `mcp-dispatch-runtime.js`; control/repository readers; safety/provenance tests | no generic write, subprocess, network or approval path; exact runtime identity | deterministic implementation evidence |
| Lifecycle adapters | `mcp-lifecycle/`; lifecycle tests | Codex, Claude Code and OpenCode enable/status/disable/update/rollback with project-first scope | deterministic fixture evidence |
| Final aggregate validation | `npm --prefix create-agdf run smoke-test` in `/tmp/agdf-mcp-uat-closeout.jHCooB`, a Git-backed copy of the exact final working tree without ignored generated-directory contamination | complete package, runtime, release, adapter, German OR presentation and 83/83 skill-evaluation regression suite | strong isolated local evidence; pass |
| Package suites | `npm --prefix agdf-mcp-server test`; `npm --prefix agdf run smoke-test` | MCP package and existing CLI package | strong local evidence; pass |
| Performance | `CD_TESTS.md` | cold p95 791.930 ms and warm p95 324.108 ms within approved budgets | measured macOS x64 evidence |
| Node boundary | real Node 18.20.8 plus Node 22.22.3 | Node 18 early non-mutating failure and Node 20+ operation | direct process evidence |
| Claude lifecycle | actual Claude Code 2.1.193 project registration under explicit authorization | native add/get/remove and fresh connection compatibility | direct CLI evidence; model lane blocked by authentication |
| Direct OpenCode functional evidence | `DIRECT_HOST_EVIDENCE.md`; retained OpenCode NDJSON | OpenCode 1.18.3 registration, discovery, valid call, controlled failure, terminal transfer, continuation and cleanup on macOS x64 | qualified bounded host evidence under approved TP Revision 2 |
| Direct Codex functional evidence | `DIRECT_HOST_EVIDENCE.md`; retained Codex NDJSON | Codex CLI 0.145.0 with `gpt-5.6-sol` registration, discovery, valid call, controlled failure, terminal transfer, continuation and cleanup on macOS x64 | qualified bounded host evidence under approved TP Revision 2 |
| Claude authentication boundary | `DIRECT_HOST_EVIDENCE.md`; retained Claude NDJSON | Claude Code 2.1.193 project registration and fresh server discovery before authentication stopped model execution | direct boundary evidence; incomplete qualification |
| Copilot Skills-only negative observation | `COPILOT_HOST_OBSERVATION.md`; retained screenshot and session records | two fresh `mai-code-1.1-flash` sessions ignored a valid schema-2 dispatcher binding; the second safely avoided a QA decision but still synthesized a non-canonical target response | direct loaded-host evidence; negative; not MCP qualification |
| Current PRD dispatcher | source `skill-dispatch --skill gate-check --surface codex --language de` | terminal German approval sequence, non-empty `host_action.text`, exact `Approval: PRD`, no presentation diagnostics | deterministic source evidence; pass |
| Current SD dispatcher | source `skill-dispatch --skill gate-check --surface codex --language de` | terminal German approval sequence, non-empty `host_action.text`, exact `Approval: SD`, no presentation diagnostics | deterministic source evidence; pass |
| Current TP dispatcher | source `skill-dispatch --skill gate-check --surface codex --language de` | terminal German approval sequence, non-empty `host_action.text`, exact `Approval: TP`, no presentation diagnostics | deterministic source evidence; pass |
| Current QA and OR dispatcher | source `gate-check --run agdf-mcp-dispatch-server --json` with German configured language | terminal German gate sequence before UAT and complete German OR status after acceptance, with no presentation diagnostics | deterministic source evidence; pass |
| Mandatory reviews | TP, Clean Implementation and Code Review Revision 2 reports | complete plan coverage, solution integrity and actual final diff including presentation corrections | durable current evidence; pass |
| QA decision | `QA_REPORT.md` Revision 2 | complete approved-scope evidence with bounded residual support risks and exact approval | durable `qa-gate` decision; approved pass |
| UAT acceptance | `UAT_REPORT.md` Revision 1 and exact `Approval: UAT` | accepted directly observable OpenCode and Codex outcomes with disclosed support boundaries | direct user acceptance after revalidation |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| OpenCode 2.x direct behavior | blocks OpenCode 2.x support | run the same matrix on an installed 2.x tuple in a future evidence lane |
| Native Linux and Windows behavior | blocks corresponding OS claims | execute native lanes; fixture paths remain non-authorizing |
| GitHub Copilot target-host evidence | blocks Copilot support | retain `unverified` until a later approved integration and direct host run |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Loaded host or model behavior differs from deterministic protocol fixtures. | warn | OpenCode and Codex pass the direct observable host matrix, while controlled clients independently prove both protocol generations and Copilot proves the separate Skills-only risk. |
| Host support is inferred from configuration or publication. | warn | Capability metadata remains `unverified`; only exact direct evidence may change it. |
| Claude CLI output changes. | warn | Native read-back fails closed; retest the exact host version before a support claim. |
| OpenCode configuration changes across major versions. | warn | One version-aware adapter covers tested 1.x/2.x shapes; direct qualification remains per tuple. |
| Retired runtime cleanup is interrupted. | warn | Host references are removed transactionally; an unreferenced retired directory may require later owned cleanup. |
| Process access is mistaken for sandboxing. | warn | Documentation and capability metadata state inherited OS identity and only claim an application-level read boundary. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; related request activation, dispatcher, target, native interaction and public distribution nodes
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node records approved PRD Revision 4, SD Revision 3, TP Revision 2, QA Report Revision 2 and accepted UAT Report Revision 1, the completed OpenCode-plus-Codex host matrix, independent dual-protocol proof, Claude authentication boundary and the final German OR presentation correction with a complete clean-snapshot smoke pass.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Preserve implementation, evidence boundaries and the exact open host obligation inside this run.
- memory_refs: `.agdf/control/artefacts/agdf-mcp-dispatch-server/`

## Closeout

- next_allowed_action: Produce delivery closeout or requested handoff; do not perform VCS actions automatically.
- quality_outlook: Preserve the distinction between installed state and fresh-session loaded behavior.
