# Task Plan Review: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`  
Revision: 2
Reference: approved TP Revision 1  
Review scope: committed implementation, post-commit entry-level architecture revision, deterministic suites,
direct project-scope host evidence and cleanup

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CHMCP-TP-01 | fully_done | `BROWNFIELD_ANALYSIS.md` revalidates the approved TP, baseline, owners, reuse path and localization correction before implementation. | none | none |
| CHMCP-TP-02 | fully_done | `mcp-lifecycle-test.js` contains isolated profile, result, adapter, transaction, migration, separation and evidence controls mapped to CHMCP-C01 through C20. | none | none |
| CHMCP-TP-03 | fully_done | Capability schema v2, generated profile loading and closed validation reject malformed, incomplete, duplicate-enum and version-skew profiles before adapter access. | none | none |
| CHMCP-TP-04 | fully_done | Result schema v2 and one locale-backed presenter enforce code-based English/German output, JSON/human meaning parity, localized diagnostics and `authorizes: false`. | none | none |
| CHMCP-TP-05 | fully_done | One closed registry exposes four conforming adapter leaves; the retained `host-config.js` facade preserves compatibility and validates source-resolution output. | none | none |
| CHMCP-TP-06 | fully_done | Shared project/user runtimes, deterministic references, exact legacy migration and last-reference retirement pass multi-host and rollback fixtures. | none | none |
| CHMCP-TP-07 | fully_done | The lifecycle validates profile, probe, source, read-back and transaction order; all injected fault phases restore state and `rollback_incomplete` stays blocking. | none | none |
| CHMCP-TP-08 | fully_done | CLI registry, parser, help and application accept four named surfaces, project default, explicit user scope, absolute target, JSON and human output. | none | none |
| CHMCP-TP-09 | fully_done | Codex fixtures and direct project lane cover native TOML, selected/effective scope, missing host, precedence, idempotency, rollback and cleanup. | Exact release qualification still lacks a direct failure-path record. | none; task scope permits a bounded unverified record |
| CHMCP-TP-10 | fully_done | Claude fixtures cover local/user scope, masking, command/auth failure and restoration; direct registration/read-back/cleanup passed and authentication stopped discovery honestly. | Authenticated fresh discovery and call are absent. | none; task acceptance explicitly preserves the authentication gap |
| CHMCP-TP-11 | fully_done | OpenCode fixtures cover 1.x/2.x shapes, custom and inline precedence, user scope, permission preservation and rollback; direct 1.18.3 dispatch and cleanup passed. | Exact release qualification still lacks a direct failure-path record; 2.x remains unobserved. | none; task scope permits a bounded unverified record |
| CHMCP-TP-12 | fully_done | Copilot fixtures cover `.mcp.json`, `.github/mcp.json`, user precedence, ownership, policy/trust unknown and absent CLI; direct project registration and cleanup passed. | A callable CLI or observable fresh Desktop session was unavailable. | none; task acceptance explicitly permits an unavailable record |
| CHMCP-TP-13 | fully_done | Installer and public-profile tests prove plugin install never registers or qualifies MCP; Copilot remains a Skills-only public plugin payload. | none | none |
| CHMCP-TP-14 | fully_done | Exact qualification and direct-evidence validators reject incomplete, cross-host, cross-OS, cross-package and failed-path tuples; all four current direct records remain `unverified`. | none | none |
| CHMCP-TP-15 | fully_done | MCP semantic contract, dual protocol, safety, provenance, performance, package and shutdown suites pass without a server semantic or transport change. | none | none |
| CHMCP-TP-16 | fully_done | Root, install and package documentation, `docs/architecture/README.md`, six rendered diagrams and `CG-MCP-DISPATCH-ADAPTER` explain the four-host journey, semantic owner, Skill/MCP paths, native sources, shared runtime, rollback, cleanup, authority boundary and exact evidence limits. All 55 local architecture links resolve and every diagram was visually inspected. | none | none |
| CHMCP-TP-17 | fully_done | `CD_TESTS.md`, generated release assets, focused suites, final serial smoke, 83/83 evals, 467-file package, refreshed 56/56 compatibility record, community-health checks and diff validation cover the stabilized implementation and documentation revision. | none | none |
| CHMCP-TP-18 | fully_done | Retained OpenCode baseline, enable, native list, fresh one-call dispatch, status, disable, permission observation and cleanup hashes form the required bounded direct record. | Failure-path qualification evidence remains missing and the native-tool draft stays open. | none; no support or retirement claim is made |
| CHMCP-TP-19 | fully_done | Retained Claude baseline, local registration, native get, fresh authentication stop, disable and cleanup hashes form the required bounded direct record. | Authentication prevented discovery and dispatch. | none; gap remains explicit and unverified |
| CHMCP-TP-20 | fully_done | Retained Codex baseline, native registration/read-back, fresh CLI 0.145.0 `gpt-5.6-sol` dispatch, status, disable and cleanup hashes form the required bounded record. | Failure-path qualification evidence remains missing. | none; no support claim is made |
| CHMCP-TP-21 | fully_done | Retained Copilot Desktop 1.1.15 baseline, project registration, client-unavailable record, status, disable and cleanup hashes form the required bounded record. | Native discovery, trust/policy and call evidence are absent. | none; no Copilot client claim is made |
| CHMCP-TP-22 | fully_done | Revision 2 of this review plus the refreshed clean, code and QA reports review the committed source and post-commit documentation after exact link, SVG, package, compatibility and community-health checks. | none | none |

## Summary

- fully_done: 22
- partially_done: 0
- not_done: 0
- out_of_scope_changes: none identified; the architecture guide is an explanatory projection of the already approved TP-16 documentation and SD ownership model, with no new product or runtime semantics
- risks: Exact host qualification remains unavailable for all four tuples; this limits support and release claims but does not leave an approved TP obligation incomplete because TP-18 through TP-21 explicitly accept bounded unavailable or blocked records.
- required_next_step: Supply this refreshed TP coverage to `qa-gate` together with the clean review, code review, Brownfield Analysis, CD+Tests and direct evidence.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| CHMCP-AC-01 through AC-03 | lifecycle selection, compatible state and unavailable state | CHMCP-TP-03, 04, 07, 08 | CLI/result snapshots, absent-host cases and localized recovery output cover all four surfaces. | fulfilled | none |
| CHMCP-AC-04 through AC-07 | project-first enable, explicit user scope, pending restart and configured-unverified | CHMCP-TP-04, 06 through 12 | Human/JSON fixtures and four direct enable/status records show scope, runtime, source, permissions, restart and unverified discovery separately. | fulfilled | none |
| CHMCP-AC-08 | discovered-ready or bounded unavailable direct outcome | CHMCP-TP-14, 18 through 21 | Codex/OpenCode fresh calls are visible; Claude authentication and Copilot client absence are visible bounded gaps and cannot become support claims. | fulfilled | none |
| CHMCP-AC-09 through AC-13 | idempotency, degraded/foreign, rollback, disable and cleanup | CHMCP-TP-06 through 12, 18 through 21 | Adapter, transaction and cleanup snapshots show exact state preservation, blocking rollback failure and baseline restoration. | fulfilled | none |
| CHMCP-AC-14 through AC-16 | plugin separation, semantic owner and authority boundary | CHMCP-TP-03, 04, 13, 15 | Installer/public-payload tests, semantic contract tests and visible `authorizes: false` records prove the separation. | fulfilled | none |
| CHMCP-AC-17 through AC-19 | qualification, separated evidence and OpenCode permission observation | CHMCP-TP-14, 15, 18 through 21 | Four validated `unverified` tuples, separate protocol logs and retained OpenCode permission state show the evidence boundary without closing the native-tool draft. | fulfilled | none |
| CHMCP-AC-20 | English/German human and JSON presentation | CHMCP-TP-04, 08 | Exhaustive locale/result tests and direct German terminal output show one meaning and one next action. | fulfilled | none |

No normalized finding remains open.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` records the delivered owners, exact direct outcomes, qualification limits and later release conditions.
