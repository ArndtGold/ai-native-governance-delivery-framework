# Task Plan Review: Cross-Host AGDF Dispatch Through MCP

Status: done
Decision: pass
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Based on: approved TP Revision 2, `CD_TESTS.md`, Brownfield Analysis Revision 2 and the final implementation diff

Current boundary: this report evaluates approved TP Revision 2. Directly observable host behavior
and controlled dual-protocol negotiation are independent required evidence lanes. Host-selected
protocol telemetry is optional and is not inferred.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| MCP-TP-01 | fully_done | Approved TP and final baseline were revalidated; `BROWNFIELD_ANALYSIS.md` records a pre-implementation pass and the selected reuse/refactor seams. | none | none |
| MCP-TP-02 | fully_done | Semantic, protocol, safety, provenance, package and lifecycle positive and negative controls execute through focused and aggregate test entrypoints. | none | none |
| MCP-TP-03 | fully_done | `skill-dispatch/contract.js` owns the exact name, semantic description, schemas, annotations and wire-argument adapter; contract and dispatcher regression tests pass. | none | none |
| MCP-TP-04 | fully_done | `mcp-dispatch-runtime.js` exposes the bounded canonical runtime interface; static graph tests exclude lifecycle, subprocess, approval and alternate-policy owners. | none | none |
| MCP-TP-05 | fully_done | `agdf-mcp-server/` has a separate Node.js 20 package, exact SDK v2 server/core closure, development-only client and validated package inventory. | none | none |
| MCP-TP-06 | fully_done | One SDK v2 STDIO factory exposes exactly one tool and negotiates MCP 2026-07-28 and 2025-11-25; Node 18 stops before SDK import. | none | none |
| MCP-TP-07 | fully_done | Trusted context, closed process arguments, strict canonical inputs and lossless structured/text result mapping pass positive and adversarial tests. Semantic validation remains in the canonical dispatcher service, including through the real worker. | none | none |
| MCP-TP-08 | fully_done | One active worker, busy response, timeout, cancellation, connection close and signal cleanup have deterministic passing evidence. | none | none |
| MCP-TP-09 | fully_done | Reachable-graph, runtime sentinels, control snapshots, symlink/special-file negatives and the one MiB serializer prove the bounded read-only/offline application contract. | none | none |
| MCP-TP-10 | fully_done | Exact-version package preparation, marker/provenance verification, stable reference transactions, rollback and old-version retirement pass. | none | none |
| MCP-TP-11 | fully_done | `agdf mcp status|enable|disable` implements project-first lifecycle, explicit user scope, actual executable reporting, read-only status and Node 18 `manual_compatible`. | none | none |
| MCP-TP-12 | fully_done | Codex structural TOML handling preserves unrelated settings, rejects foreign or ambiguous ownership, rolls back and restores an originally absent `.codex` directory without using user-scoped native registration for project scope. | none | none |
| MCP-TP-13 | fully_done | Claude project/user command shapes, native read-back, collisions, update rollback and removal pass in fixtures; isolated actual Claude CLI add/get/remove also passed. | none | none |
| MCP-TP-14 | fully_done | OpenCode 1.x flat and 2.x nested configuration variants preserve permissions, fail closed on foreign ownership, update across versions and disable cleanly. Origin tracking restores an originally absent file after OpenCode adds `$schema` and preserves pre-existing empty files. | none | none |
| MCP-TP-15 | fully_done | Version coherence, package inventory, release order and the Skills-only public-candidate exclusion pass in the aggregate release suite. | none | none |
| MCP-TP-16 | fully_done | Root, installation, package and release documentation plus capability metadata describe commands, access, fallback and evidence boundaries; Context Graph reconciliation records delivered owners, qualified exact tuples and remaining unverified lanes. | none | none |
| MCP-TP-17 | fully_done | Final focused suites, both package smoke suites, the complete exact-TP2 `create-agdf` smoke suite, 83/83 skill evaluations and measured performance budgets pass. | none | none |
| MCP-TP-18 | fully_done | User-authorized OpenCode 1.18.3 and Codex CLI 0.145.0 with `gpt-5.6-sol` pass project registration, fresh discovery, valid call, controlled failure, terminal transfer, bounded continuation and exact removal on macOS x64. Controlled clients separately negotiate both required protocol generations against the production definition. Claude Code registration/discovery remains separate boundary evidence. | none for the approved first-release claim; OpenCode 2.x, Linux and Windows remain unverified future lanes. | none |

## Summary

- fully_done: 18 of 18 tasks
- partially_done: none
- not_done: none
- out_of_scope_changes: the OpenCode adapter adds the current 2.x nested `mcp.servers.agdf` form while preserving the TP-approved 1.x flat form. This is a tested version-aware host compatibility detail and does not add authority, transport or scope. The MCP read path also uses a structural Git-worktree reader because the approved read-only server boundary excludes the CLI Git subprocess owner.
- risks: OpenCode preserved terminal text exactly but added an unrequested prefix to the visible continuation line. Codex required an explicit compatible model override because the local CLI rejected the configured default before tool discovery. Claude model behavior, OpenCode 2.x and native Linux/Windows remain unverified and outside the qualified first-release tuples.
- required_next_step: pass the complete TP coverage to Clean Implementation Review, Code Review and QA. Keep every untested tuple `unverified`.

The negative `COPILOT_HOST_OBSERVATION.md` directly proves that the current Skills-only Copilot model
can ignore a valid dispatcher binding and perform broad filesystem discovery. Copilot remains outside
the approved first-release MCP adapter scope, so this does not alter task completion.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| One stable `agdf_dispatch` capability with its semantic limits visible before invocation | configured and available | MCP-TP-03, MCP-TP-06, MCP-TP-18 | Protocol clients discover exactly one canonical tool; OpenCode 1.18.3 and Codex CLI 0.145.0 directly discover and call their effective names. | fulfilled | none |
| Tool availability never changes target, repository or approval authority | all MCP modes | MCP-TP-03, MCP-TP-04, MCP-TP-09 | Contract, state snapshots and approval-regression tests preserve `authorizes: false` and existing authority owners. | fulfilled | none |
| Every terminal outcome presents one canonical action and stops further skill execution | target unresolved and deterministic skill | MCP-TP-07, MCP-TP-18 | OpenCode and Codex valid and semantic-failure sessions expose the exact `host_action.text`, make no other tool call and stop. | fulfilled | none |
| Every non-terminal outcome binds continuation to returned skill, target, run and control | judgement skill | MCP-TP-07, MCP-TP-18 | OpenCode and Codex preserve `qa-gate`, repository, run and gate. OpenCode adds one non-semantic prefix; Codex follows the requested one-line format exactly. | fulfilled | none |
| Configuration, unavailable, version-mismatch and unsupported states give one truthful recovery | unavailable or version-invalid | MCP-TP-06, MCP-TP-11, MCP-TP-18 | Lifecycle and Node 18 fixtures pass. Both functional hosts transfer localized semantic-input recovery; Claude exposes its authentication boundary. | fulfilled | none |
| Enabling is deliberate, least-scope and reversible without broad tool permissions | not configured, configured, disabled | MCP-TP-10 through MCP-TP-14, MCP-TP-18 | OpenCode, Codex and Claude were registered at project/local scope and fully removed. Direct retries restore originally absent OpenCode and Codex configuration containers. | fulfilled | none |
| Existing compatible behavior remains visible when MCP is unavailable or unverified | unsupported or MCP not enabled | MCP-TP-11, MCP-TP-16 | Lifecycle status, capability metadata and documentation name the version-matched CLI path without automatic fallback execution. | fulfilled | none |
| Support claims remain bound to exact host, version, configuration and evidence plane | all modes | MCP-TP-15, MCP-TP-16, MCP-TP-18 | `DIRECT_HOST_EVIDENCE.md` qualifies only the bounded OpenCode and Codex macOS x64 observations and links them to the separate passing protocol lane. Generic metadata and all other hosts or OS lanes remain `unverified`. | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| MCP-TPR-01 | evidence_gap | evidence_obligation | resolved | Approved PRD Revision 4, SD Revision 3 and TP Revision 2 explicitly separate directly observable host qualification from controlled protocol negotiation. The OpenCode-plus-Codex host lane and both controlled protocol generations pass independently, so unavailable host protocol telemetry is no longer required or inferred. | No further evidence correction is required for the approved first-release claim; retain all untested tuples as `unverified`. |
