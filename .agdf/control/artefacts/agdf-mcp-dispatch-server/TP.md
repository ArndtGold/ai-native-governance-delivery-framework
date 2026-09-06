# TP: Cross-Host AGDF Dispatch Through MCP

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` accepted for Revision 2 on 2026-09-06 after same-target,
same-run, same-gate and run revision `700BEC82-EA10-46BA-9F0C-DFADA23CC5E7` revalidation.
Revision: 2
Date: 2026-09-06
Owner: Arndt Gold / Codex
Run: agdf-mcp-dispatch-server
Based on: approved SD Revision 3 and approved PRD Revision 4, MCP-01 through MCP-22
Delivery depth: Structured Delivery

This plan implements one local `agdf_dispatch` MCP tool through a separate Node.js 20
`@agdf/mcp-server` package while preserving the Node.js 18 AGDF CLI, existing semantic and
dispatcher owners, target authority, exact gate approvals and durable control state.

Revision 1 was approved and implemented. Revision 2 changes only the evidence decomposition exposed
by direct host testing: observable host behavior and controlled dual-protocol negotiation are
independent evidence lanes. Revision 2 was approved on 2026-09-06 after exact current-run and
revision revalidation. It does not authorize new product, host, publication, release or VCS actions.
Revised reviews and QA must evaluate the approved PRD Revision 4, SD Revision 3 and TP Revision 2.

## 1. Baseline And Scope

- Source baseline: commit `d0d4d9ff822f52521675a20bf49d7ae969978bd8`.
- Planning runtime observed on 2026-09-06: Node.js `v22.22.3`, npm `11.12.1`.
- Product version at planning: `0.14.5`.
- Existing semantic owner: `create-agdf/lib/skill-dispatch/contract.js`.
- Existing dispatcher owner: `create-agdf/lib/skill-dispatch/service.js`.
- Existing lifecycle, package, host-adapter and cross-platform data-root owners remain reuse points.
- Approved Context Graph node: `CG-MCP-DISPATCH-ADAPTER`.

Included:

- canonical input/output schema completion and SDK v2 schema adaptation;
- narrow version-matched dispatcher runtime export;
- separate MCP server package, Node preflight, STDIO serving and worker lifecycle;
- explicit managed server-package acquisition under Node.js 20 after `enable`;
- project-first status, enable and disable lifecycle for Codex, Claude Code and OpenCode;
- exact package, protocol, provenance, read-only, performance and regression evidence;
- direct host qualification for OpenCode plus at least one of Codex or Claude Code;
- documentation, Context Graph reconciliation, mandatory reviews, QA and OR preparation.

Excluded:

- GitHub Copilot mutation or support claim in the first release;
- Streamable HTTP, remote service, network tool, authentication or account state;
- a second target resolver, gate evaluator, locale renderer, approval store or workflow engine;
- automatic scope widening, Node download, `npx` server launch, PATH-based Node selection or
  silent CLI fallback;
- operating-system sandbox claims;
- public Skills-only candidate MCP content;
- real installation, publication, VCS delivery or external model execution without its applicable
  authorization.

## 2. Task Plan

Effort is a bounded engineering estimate, not elapsed agent time: S = 1–2 hours, M = 2–4 hours,
L = 4–8 hours. Dependencies determine execution order.

| task_id | Task and source boundary | Depends on | Acceptance mapping | Completion evidence | Effort |
|---|---|---|---|---|---|
| MCP-TP-01 | Revalidate approved TP, final changed-path baseline and all named owners. Produce the required post-TP `BROWNFIELD_ANALYSIS.md` before product edits. Resolve version/package graph, npm invocation, host-config and rollback reuse against current source. | Exact TP approval | MCP-AC-09, 10, 16, 19, 20 | Passing analysis records source state, reuse, exceptional paths, test seams, dependency direction and any SD conflict. A conflict returns to SD before implementation. | M |
| MCP-TP-02 | Establish red semantic, protocol, package and lifecycle tests plus isolated fixture roots. Add one test inventory mapped to MCP-C01 through MCP-C22 without duplicating the canonical skill or host inventories. | MCP-TP-01 pass | all | Every planned behavior has a failing positive or negative control against production entry points; fixture filesystem, environment, config and network effects are isolated. | M |
| MCP-TP-03 | Extend `skill-dispatch/contract.js` with the canonical output schema, MCP safety annotations and schema-derived wire argument adapter. Preserve current dispatcher protocol and CLI inputs. | MCP-TP-02 | MCP-AC-01, 02, 03, 04, 05, 06, 08 | One semantic definition owns name, description and both schemas. Unknown and prohibited fields fail before target access. Existing scenario outputs and `authorizes: false` remain unchanged. | L |
| MCP-TP-04 | Extract a pure owned-runtime/provenance inspector and publish the narrow `create-agdf/mcp-dispatch-runtime` export containing only the semantic definition, normalizer, serializer, dispatcher factory and immutable runtime evidence interfaces. | MCP-TP-02, 03 | MCP-AC-03 through 09, 15, 19, 22 | Server-facing import graph contains no installer, lifecycle writer, subprocess fallback, approval persistence or private alternate policy. Existing CLI behavior remains byte/shape compatible. | L |
| MCP-TP-05 | Create `agdf-mcp-server/` with its own manifest, lockfile, Node `>=20` engine and executable. Pin exact same-version `create-agdf` and `@modelcontextprotocol/server@2.0.0`; add core only for a direct public import and client only as a development dependency. | MCP-TP-02, 04 | MCP-AC-01, 09, 15, 17, 18, 19 | Clean package install and inventory prove dependency roles, no SDK v1, no production client, no remote transport and no transitive MCP requirement in `create-agdf` or `@agdf/cli`. | M |
| MCP-TP-06 | Implement the closed bin preflight and one SDK v2 server factory. Adapt canonical schemas with `fromJsonSchema()`, expose exactly `agdf_dispatch` and start through `serveStdio(() => buildServer())` for 2026-07-28 and 2025-11-25. | MCP-TP-03 through 05 | MCP-AC-01, 02, 06, 17, 18 | Node below 20 fails before SDK import. Both protocol generations discover the same tool/schema and no direct `McpServer.connect(StdioServerTransport)` path exists. STDOUT contains only MCP frames. | L |
| MCP-TP-07 | Implement trusted-context construction and lossless call/result mapping. Accept only the closed surface process argument and canonical model fields; derive version, roots, registries and digests from package/runtime identity. | MCP-TP-04, 06 | MCP-AC-02 through 06, 08, 15, 22 | Environment/model overrides fail; mismatch stops before target resolution; structured and text results are deeply equal; controlled terminal and continuation outcomes preserve canonical `host_action`. | L |
| MCP-TP-08 | Implement one worker-thread execution owner with single-active-call enforcement, 10-second timeout, cancellation, connection-close and signal cleanup. Add stable sanitized failure mapping. | MCP-TP-07 | MCP-AC-03, 05, 06, 07, 13, 16 | Busy, timeout, cancellation, broken-pipe and signal tests prove bounded worker termination, clean process exit and no raw errors or secret leakage. | L |
| MCP-TP-09 | Enforce the read-only/offline reachable server graph and one MiB result bound. Add static dependency-closure checks plus runtime filesystem, host-config, network and approval-state sentinels. | MCP-TP-04 through 08 | MCP-AC-06, 07, 08, 09, 15, 17, 22 | No reachable generic write, subprocess, network, lifecycle mutation or approval owner. Before/after snapshots are identical for every result class. Documentation states inherited OS access without a sandbox claim. | L |
| MCP-TP-10 | Implement explicit same-version server-package preparation under the existing lifecycle transaction and cross-platform npm invocation owners. Run only after `mcp enable` under Node 20, install into the versioned AGDF data root, verify package/provenance before registration and roll back partial preparation. | MCP-TP-01, 05, 09 | MCP-AC-09, 10, 15, 16, 18, 19 | Node 18 and status paths perform no package download/import. Exact package spec, stage, digest, atomic replacement and rollback are tested. No Node download, `npx` launch or alternate runtime search occurs. | L |
| MCP-TP-11 | Add `agdf mcp status|enable|disable --surface ... [--scope project|user] --dir ... [--json]` to existing registry/parser/application owners and compose the shared lifecycle transaction. Register `process.execPath` and the exact versioned entrypoint. | MCP-TP-09, 10 | MCP-AC-09, 10, 12, 16, 18, 19, 20 | Status is read-only; project is default; explicit user scope is visible; unavailable scope and Node 18 return non-mutating results; foreign entries fail closed; owned disable/update rollback preserves prior state. | L |
| MCP-TP-12 | Implement the Codex adapter as a structural merge of the selected target's `.codex/config.toml` `mcp_servers.agdf` entry. Reuse existing TOML section and ownership utilities and preserve trust, approval and unrelated server settings. | MCP-TP-11 | MCP-AC-10, 11, 16, 20, 21 | Absent, owned, foreign, malformed, project, explicit user, read-back failure, rollback and removal fixtures pass. Project default does not call user-scoped `codex mcp add`. | M |
| MCP-TP-13 | Implement the Claude Code adapter with native `claude mcp add --scope local` in the selected target and explicit `--scope user` only for user scope. Preserve native read-back, approval and removal semantics. | MCP-TP-11 | MCP-AC-10, 11, 16, 20, 21 | Structured command observations, collisions, failed native calls, rollback and removal pass. Shared repository scope is not silently selected. | M |
| MCP-TP-14 | Implement the OpenCode adapter as a structural merge of `mcp.agdf` in the target `opencode.json`, with local type, command array, cwd and enabled state. Preserve all permissions and expose the effective host tool name `agdf_agdf_dispatch`. | MCP-TP-11 | MCP-AC-10, 11, 16, 20, 21 | Missing/malformed/owned/foreign configuration, explicit user scope, permission preservation, rollback, removal, inactive repository and tool-name fixtures pass. No Bash/Edit widening occurs. | M |
| MCP-TP-15 | Extend stable plugin capability metadata, package/version coherence, release bump and publication workflow. Publish and wait in exact `create-agdf -> @agdf/mcp-server -> @agdf/cli -> plugin` order. Keep the public Skills-only candidate free of MCP assets. | MCP-TP-05, 10 through 14 | MCP-AC-09, 12, 15, 16, 17, 19, 21 | Exact-version clean-install and skew negatives pass; manifests and NOTICE are complete; package bytes are deterministic; public validation rejects MCP content; no support state is inferred from publication. | L |
| MCP-TP-16 | Add lifecycle and user documentation for project-first enable/status/disable, exact Node/runtime behavior, effective tool names, permissions, inherited process access, fallback and per-host support evidence. Reconcile `CG-MCP-DISPATCH-ADAPTER` with delivered facts. | MCP-TP-11 through 15 | MCP-AC-08, 10 through 12, 18, 20 through 22 | Documentation matches actual commands and states, never equates permission with approval, and labels Copilot unverified. Context Graph references final owners and evidence. | M |
| MCP-TP-17 | Run focused, package, integration, performance and full regression suites on the final source snapshot. Record commands, versions, raw performance samples, failures and exact evidence in `CD_TESTS.md`. | MCP-TP-03 through 16 | all | Every MCP-C test has nonzero execution and mapped evidence; repeated generation is idempotent; full existing smoke passes or an unrelated failure is reported without weakening checks. | L |
| MCP-TP-18 | After separate host-setting authorization, collect direct registration, fresh-host discovery, valid call, controlled failure, terminal/continuation behavior and removal evidence on OpenCode plus Codex or Claude Code. Keep host and OS tuples separate. Link these observations to the independent dual-protocol result from MCP-TP-06 and MCP-C18 without requiring unavailable host protocol telemetry. Then perform Task Plan Review, Clean Implementation Review and Code Review, resolve material findings, rerun affected tests and execute QA Gate and OR. | MCP-TP-17 | MCP-AC-03 through 06, 10 through 14, 16, 18, 20, 21 | Exact observable host/model/OS/Node/AGDF/SDK/entrypoint evidence supports only tested tuples. Controlled clients separately prove both required protocol generations against the production server definition. Missing hosts remain unverified. Reviews cover the actual final diff and QA reports every residual gap. | L |

MCP-TP-10 may reuse the current cross-platform npm invocation and atomic staging mechanics but must
not reuse their product-specific OpenCode path or error wording as a second package owner. If current
source cannot install the exact server package without violating the approved Node, package or
offline server boundaries, stop and revise SD rather than adding runtime search or a hidden
dependency.

## 3. Test Plan

### 3.1 Deterministic Test Matrix

| test_id | Stimulus and decisive assertion | Primary task |
|---|---|---|
| MCP-C01 | Discover the server through both approved protocol generations. Exactly one tool appears and its name, description and adapted input/output schemas deep-equal the canonical owner. | MCP-TP-03, 05, 06 |
| MCP-C02 | Supply every valid field plus unknown, malformed, oversized, unpaired target and prohibited executable/command fields. Invalid input stops before target access. | MCP-TP-03, 07 |
| MCP-C03 | Invoke one deterministic resolved gate case. Result preserves protocol/schema versions, target, control, presentation, terminal action and `authorizes: false`. | MCP-TP-04, 07 |
| MCP-C04 | Invoke absent, ambiguous and mismatched target evidence. One localized terminal orientation is returned and no repository control callback executes. | MCP-TP-04, 07 |
| MCP-C05 | Invoke a judgement skill. One continuation is bound to the returned skill, target, run and control snapshot without hidden prompt, source dump or unrelated path. | MCP-TP-04, 07 |
| MCP-C06 | Induce malformed MCP, package skew, provenance mismatch, renderer failure, timeout, broken pipe and injected secret-bearing exceptions. Failure classes stay distinct and output is sanitized. | MCP-TP-06 through 09 |
| MCP-C07 | Instrument filesystem mutation, child process and network entry points. Every tool path is read-only/offline and repository/control/config snapshots remain equal. | MCP-TP-09 |
| MCP-C08 | Invoke approval presentation, grant host tool permission and send decorated/stale/wrong-run approvals. No MCP path writes approval; existing exact same-run/gate/revision behavior remains authoritative. | MCP-TP-07, 09, 17 |
| MCP-C09 | Run existing CLI dispatch, doctor, gate-check, generation and integrity suites under the supported CLI baseline. Prove CLI imports do not resolve the MCP server or SDK v2. | MCP-TP-04, 05, 17 |
| MCP-C10 | Exercise lifecycle absent, owned, foreign, malformed, failed write/read-back, rollback, update and disable cases per adapter. Unrelated settings and prior state survive. | MCP-TP-10 through 14 |
| MCP-C11 | For each claimed host, record directly observable project registration and config identity, fresh discovery, valid call, controlled failure, terminal/continuation behavior and removal. Configuration-only evidence never yields supported, and host-selected protocol telemetry is optional. | MCP-TP-18 |
| MCP-C12 | Disable MCP or select an unsupported/unverified host. Present the named compatible CLI path without automatic alternate execution or parity claim. | MCP-TP-11, 16 |
| MCP-C13 | Measure at least 20 cold lists and 20 warm calls, hard timeout, cancellation, output size and clean shutdown against SD budgets. Record raw samples and machine identity. | MCP-TP-08, 17 |
| MCP-C14 | Execute native OS lanes required by the final support matrix. Path-string fixtures remain labeled as fixtures and cannot satisfy native proof. | MCP-TP-17, 18 |
| MCP-C15 | Build and validate the public Skills-only candidate. Any MCP manifest, runtime, command or capability leakage fails. | MCP-TP-15 |
| MCP-C16 | Disable, update and uninstall exact owned registrations/runtimes with interruption at each meaningful stage. Foreign or referenced versions remain untouched. | MCP-TP-10 through 14 |
| MCP-C17 | Inspect published package closure. Exact v2 server dependency exists; core is conditional; client is development-only; SDK v1 and remote transport are absent. | MCP-TP-05, 15 |
| MCP-C18 | Run Node 20 positive and Node 18 preflight/lifecycle negatives. With controlled clients, request and confirm exact 2026-07-28 and 2025-11-25 negotiation against the same production server definition, independently from host evidence. No SDK import occurs on failed preflight. | MCP-TP-05, 06, 11 |
| MCP-C19 | Attempt server/dispatcher/plugin version skew and interrupted publication/preparation. Every skew fails before registration or target resolution; prior runtime is restorable. | MCP-TP-10, 15 |
| MCP-C20 | Omit scope, choose user scope and request an unavailable scope on every adapter. Project is default and broader scope never occurs implicitly. | MCP-TP-11 through 14 |
| MCP-C21 | Build a support matrix from OpenCode plus another direct host and from insufficient/failed evidence. Only complete directly observable host tuples linked to the passing independent protocol lane qualify. Copilot stays unverified. | MCP-TP-16, 18 |
| MCP-C22 | Review the reachable server graph and exercise reads outside the target/package boundary. No generic operation is exposed; documentation accurately states inherited OS permissions. | MCP-TP-09, 16 |

### 3.2 Host-Configuration Isolation

All deterministic lifecycle tests use temporary home, data-root, target and host-config directories.
Injected command runners capture executable, argv, cwd, environment and effects. Tests never read or
mutate the user's real Codex, Claude Code, OpenCode or npm configuration.

Direct host evidence in MCP-TP-18 is a distinct lane. It requires the applicable user authorization
before host configuration changes and must record exact before/after state and removal. It records a
host-selected protocol generation only when the host exposes that value through a stable supported
interface; otherwise MCP-C18 remains the sole protocol compatibility evidence.

### 3.3 Package Acquisition And Offline Boundary

The lifecycle package-preparation test uses an injectable npm command owner and an isolated registry
or exact local package fixture. It proves:

- acquisition starts only from explicit `enable` under a verified Node 20 process;
- the requested package is exactly `@agdf/mcp-server@<current-version>`;
- lifecycle staging verifies manifest, engine, dependency and provenance before stable mutation;
- failed acquisition or verification leaves host configuration untouched;
- the registered server performs no registry or other network access;
- Node 18 status/manual-compatible paths do not import, resolve or acquire the package.

### 3.4 Planned Verification Entrypoints

The implementation may add focused scripts, but their final names must be declared once in package
manifests and included in normal smoke coverage. The planned command set is:

```text
npm --prefix create-agdf run test:skill-dispatch
npm --prefix create-agdf run test:mcp-lifecycle
npm --prefix agdf-mcp-server run test:contract
npm --prefix agdf-mcp-server run test:protocol
npm --prefix agdf-mcp-server run test:safety
npm --prefix agdf-mcp-server run test:package
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:task-target-resolution
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run release:prepare
npm --prefix create-agdf run smoke-test
git diff --check
```

These commands are planning targets, not present execution evidence. Exact command availability and
the minimum sufficient set are revalidated during MCP-TP-01 and recorded during MCP-TP-17.

## 4. Acceptance Traceability

| PRD acceptance criterion | Primary tasks | Test evidence |
|---|---|---|
| MCP-AC-01 | MCP-TP-03, 05, 06 | MCP-C01 |
| MCP-AC-02 | MCP-TP-03, 07 | MCP-C02 |
| MCP-AC-03 | MCP-TP-04, 07 | MCP-C03 |
| MCP-AC-04 | MCP-TP-04, 07 | MCP-C04 |
| MCP-AC-05 | MCP-TP-04, 07 | MCP-C05 |
| MCP-AC-06 | MCP-TP-06 through 09 | MCP-C06 |
| MCP-AC-07 | MCP-TP-09 | MCP-C07 |
| MCP-AC-08 | MCP-TP-07, 09, 17 | MCP-C08 |
| MCP-AC-09 | MCP-TP-04, 05, 17 | MCP-C09 |
| MCP-AC-10 | MCP-TP-10 through 14 | MCP-C10 |
| MCP-AC-11 | MCP-TP-18 | MCP-C11 |
| MCP-AC-12 | MCP-TP-11, 16 | MCP-C12 |
| MCP-AC-13 | MCP-TP-08, 17 | MCP-C13 |
| MCP-AC-14 | MCP-TP-17, 18 | MCP-C14 |
| MCP-AC-15 | MCP-TP-15 | MCP-C15 |
| MCP-AC-16 | MCP-TP-10 through 14 | MCP-C16 |
| MCP-AC-17 | MCP-TP-05, 15 | MCP-C17 |
| MCP-AC-18 | MCP-TP-05, 06, 11 | MCP-C18 |
| MCP-AC-19 | MCP-TP-10, 15 | MCP-C19 |
| MCP-AC-20 | MCP-TP-11 through 14 | MCP-C20 |
| MCP-AC-21 | MCP-TP-16, 18 | MCP-C21 |
| MCP-AC-22 | MCP-TP-09, 16 | MCP-C22 |

## 5. Execution Order

1. After exact TP approval, execute MCP-TP-01 and stop if Brownfield Analysis does not pass.
2. Establish MCP-TP-02 negative controls before implementation.
3. Build the semantic/runtime boundary in MCP-TP-03 and 04.
4. Build the isolated package and protocol path in MCP-TP-05 through 09.
5. Build managed package preparation and shared lifecycle in MCP-TP-10 and 11.
6. Add adapters independently in MCP-TP-12 through 14, running focused preservation tests after each.
7. Complete release coherence, documentation and Context Graph reconciliation in MCP-TP-15 and 16.
8. Stabilize the final source diff and run MCP-TP-17 once.
9. Obtain separate authorization for real host mutation and execute MCP-TP-18.
10. Perform mandatory reviews, QA and OR from the actual evidence.

## 6. Required Evidence Before QA

- exact TP approval and passing post-TP Brownfield Analysis;
- implementation/test record mapped to MCP-TP-01 through MCP-TP-18;
- nonzero MCP-C01 through MCP-C22 results;
- exact dependency tree, package inventory, license and version-coherence evidence;
- Node 18 CLI separation and Node 20 server/preflight evidence;
- both required protocol generations confirmed by controlled clients through one production server
  definition, independently from host observations;
- read-only/offline dependency and runtime snapshots;
- project/user/unavailable-scope and rollback evidence per delivered adapter;
- raw performance samples and budget calculation;
- direct observable OpenCode plus Codex or Claude Code evidence for every first-release cross-host
  claim, without treating unavailable host protocol telemetry as missing evidence;
- native OS evidence or an explicit support limitation for each claimed tuple;
- public Skills-only exclusion proof;
- current Task Plan Review, Clean Implementation Review and Code Review;
- reconciled `CG-MCP-DISPATCH-ADAPTER`;
- explicit open gaps in QA and OR without inferred parity.

## 7. Stop And Escalation Conditions

Stop and return to SD or PRD if implementation would:

- introduce a second semantic schema, target resolver, gate evaluator, renderer or approval owner;
- require SDK v1, direct 2025-only transport connection or another protocol generation;
- raise the general CLI Node baseline or make MCP a transitive CLI dependency;
- require PATH-based Node selection, automatic Node download, `npx` server launch, silent runtime
  fallback or unapproved remote transport;
- expose a generic filesystem, shell or network operation;
- write approval or governance state through the MCP call;
- widen project scope silently or overwrite foreign host configuration;
- claim sandboxing or infer support from config, fixtures, another host or another OS;
- put MCP content into the public Skills-only candidate;
- weaken existing tests, limits, permissions, activation or exact approval rules.

Stop direct host evidence when authorization, installed capability, authentication or exact rollback
is unavailable. Record the gap without substituting repository or simulated evidence.

## 8. Context Graph And Knowledge Decision

- context_graph_impact: `new_node_created`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-REQUEST-ACTIVATION-AUTHORITY`;
  `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `design_resolved_implementation_pending`
- context_graph_required_action: update the new node with delivered implementation and evidence
  during MCP-TP-16
- memory_target: `scope_artifact`
- memory_reason: The approved design, plan and Context Graph are the durable project record.

## 9. Next Step

TP Revision 2 is approved based on approved SD Revision 3. Run the implementation-preparation
Brownfield Analysis, then refresh CD+Tests and the mandatory reviews before QA. The earlier TP
approval remains historical and creates no separate authority.
