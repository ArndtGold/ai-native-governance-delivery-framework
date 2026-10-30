# TP Review: Versioned defaults and immediate MCP input relief

- decision: pass
- Reviewer: Codex, plan-coverage assessment; no independent human acceptance
- Date: 2026-10-30
- Run: run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53
- Basis: approved TP sha256:5256fc869495413d7806da6e4ba0f30b238205d947fbbf6b25216bf8392aaeda; approved PRD sha256:81229effc36ffb32a5606bb7b666ecada7de9f747e4901bba7082f1f79d51dc8 and SD sha256:c3b0dbfa250a7e991e4a02e30221d19baf1456592016eac37153b46e506d1791.

## Assessment boundary

Assess implementation due before QA, not pretend that downstream human gates already occurred. Current revision b40588c9-2ddf-4b9d-945b-a9f81677bc6e is at CR after recorded CD+Tests. All bound authoring pages were consumed under manifest sha256:fad126570bd0f47cf9b7a16b6d1c97e30ae0992f164ae584cdd598cb2f8549ee; identical authoring calls/contracts from the three review dispatches share those inputs. CD_TESTS.md sha256:0eedbc2dbdf3f1423239bb7afd0c53a7e251daeca46aa926b120a8d40e75d027 contains the exact executed/reused result matrix and failure history.

Delivered candidate B: 99 intended files, base 1833c8b4a5e3184bbcb1dde97c09a33f086dd3eb; current-candidate-inputs.json compact-manifest SHA-256 1a1279afd089b79da451a50448a8eacc280bef55b60f222da508ffcf29a35a5a. Source/candidate parity and ten protected hashes matched. Raw evidence below is relative to probe-results/mcp-defaults-run-3ab79b5a/. A green build alone does not supply this assessment.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Approved TP receipt, canonical Brownfield Analysis sha256:880178de0e51b814f5e9007b5be594af9405cd1097b23b5cab2726d9bf8b7844; baseline/source/protected manifest and required-field inventory | none for this task; confidence high | Approved sources and unrelated work preserved |
| T-002 | fully_done | Defaults/schema, shared resources/configuration and locale separation; delivered-artifact-language.log, bounded-config-sdk.log, config-size-regression.json | none; AC-001/002/006/010 done, confidence high | Strict precedence/errors/activation and project preservation proven |
| T-003 | fully_done | Existing family resolved/1 readers/writers, original lookup; recovery-final.log 22+22 interruptions, bounded-config-create.log, current-expanded-revision.log 22 cells, family flow segments and old-reader-proof.json | none in approved retained-context boundary; confidence high | Original identity/recovery and legacy compatibility checked; volatile loss policy disclosed |
| T-004 | fully_done | Schema-comparison.json, definition-measurements.json, delivered-mcp-contract.log, final both-SDK public/full and negative cases | none; AC-003/008/011 done, confidence high | Only eligible omissions; complete Core authority checks retained |
| T-005 | fully_done | Shared normalizer/private context, full current-protocol.log and current-generation.log, final SDK tests and native cwd error/success | none; confidence high | Parent/Worker resolve once, no native trusted-cwd support invented |
| T-006 | fully_done | Model-visible effective configuration, selector/delivery matrices, Core presentation and SDK decision/document flow, final typed error-facts | none; AC-005/007/009 done, confidence high | Actual model-facing feedback/provenance/replay observed |
| T-007 | fully_done | Canonical 14 skills/contracts/docs, existing graph-linked architecture document; generated conformance/footprint, delivered-build/package/runtime logs | none; confidence high | Existing owners/generators retained; context graph link_only resolved |
| T-008 | fully_done | Registered configuration/defaulted-inputs suites plus both SDKs, original family regression segments and targeted repair re-verification in CD+Tests | none for scoped claims; confidence high | Original orchestration failures not hidden or relabelled; no tests dropped or deadlines raised |
| T-009 | fully_done | Native harness 4/4; codex-delivered.json complete, six direct calls, zero models, exit 0, cleanup/settings preservation; delivered-native-assembly-parity.json true | none for native Codex CLI MCP transport; confidence high | Native discovery and shortened/explicit equivalence proven; UI/installation separate |
| T-010 | fully_done | Final manifest parity, build, package/resource/safety checks, fixed descriptor/performance limits, compatibility freshness 56/0, protected files | none; confidence high | Evidence bound to B; reviewed exact Copilot baseline regeneration; no generic caps raised |
| T-011 | partially_done | CD+Tests complete, current TP/Clean/Code assessments authored and being canonically recorded; SCN-025 evidence/candidate mapping prepared | Sole qa-gate result and fresh QA presentation follow the current review recordings; confidence high about current state | Expected in-progress gate work, not missing implementation or a waived test; QA must finish before asking human approval |
| T-012 | not_done | TP expressly requires valid QA/UAT approvals before UAT/OR closeout | Future deliberate human decisions and actual UAT/OR; not currently eligible | Human-gated downstream work; no QA/UAT/OR completion claim |

The 25 approved scenarios map one-to-one to the CD+Tests scenario table without replacing their PRD/SD ownership. SCN-001..024 have valid evidence. SCN-025 completes through current review/sole QA recording and presentation, not through this review's own pass. AC-001..011 are done within their specified evidence classes; AC-012 remains current process work. All eight design decisions are represented. No implementation-relevant task or mandatory test was omitted merely to save time.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| UX-S1 | configured/defaulted call | T-002, T-004, T-005, T-006, T-009 | Real SDK effective_configuration value/source results; final native shortened/explicit direct read/write equivalence and exposed reduced discovery definitions; no config preflight call | fulfilled | none |
| UX-S2 | explicit override | T-002, T-004, T-006 | SDK explicit/project/plugin provenance, invalid explicit rejection and fixture config byte hashes; separate chat/artifact values remain stable | fulfilled | none |
| UX-S3 | representation preference | T-006, T-008 | Actual protocol delivery/status results, immutable presentation/document bytes, no repeat question, existing exact UI capability/display gating and Markdown fallback; no native UI interaction claim | fulfilled | none |
| UX-S4 | configuration error/recovery | T-002, T-005, T-006 | Actual SDK localized error source/allowlisted field/action and no-write snapshots, missing-control checks, final native working_directory_required, original UUID replay after changed config and corruption/checkpoint fixtures | fulfilled | none |

The approved UX is MCP-visible state/feedback/recovery, with no product UI preview requested. The rows therefore use actual protocol/native observations, not code existence as a substitute for visible behavior. Native UI clicks and human UAT are outside the claimed evidence.

## Summary

- fully_done: T-001 through T-010 (10/12 total tasks; all 10 implementation tasks due before QA).
- partially_done: T-011, because its sole QA/presentation must follow the current mandatory review recordings.
- not_done: T-012, gated on future human approvals.
- out_of_scope_changes: none in the intended product manifest; protected unrelated pre-existing changes excluded. The reviewed exact payload baseline and deterministic source fingerprints follow approved SD/TP regeneration owners.
- risks: Narrow existing descriptor/resource headroom; metadata shares fixed budgets; volatile retention/expiry and source-preview recomputation retain established limits. Old broad results retain actual tested candidate identity. No evidence of measured cost/token improvement, host installation or human acceptance.
- context_graph_impact: link_only
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER; docs/architecture/core-mcp-command-flow.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing graph node references this maintained document; the document now links back and names resource, schema, resolver, replay and transport owners.
- required_next_step: Complete the remaining current review recordings and sole qa-gate assessment, then obtain a fresh QA presentation without inferring approval.

No applicable open normalized review gap is found. Downstream tasks above are explicitly conditional planned lifecycle work, not reclassified implementation gaps or falsely marked completed tasks.
