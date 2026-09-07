# TP: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: approved
Gate: TP
Gate approval: Exact `Approval: TP` accepted on 2026-09-06 after same-target, same-run,
same-gate and run revision `2492951D-2FD8-4AA2-BC58-502B6A6E8EC0` revalidation.
Revision: 1
Date: 2026-09-06
Owner: Arndt Gold / Codex
Run: agdf-cross-host-mcp-integration
Based on: approved SD Revision 1 and approved PRD Revision 1, CHMCP-01 through CHMCP-18 and CHMCP-AC-01 through CHMCP-AC-20
Delivery depth: Structured Delivery

This plan extends the existing MCP lifecycle to Copilot, Codex, Claude Code and OpenCode without
changing the MCP server or canonical `agdf_dispatch` semantics. It implements one common lifecycle
result, four native adapters, shared runtime references, explicit plugin separation and independent
host evidence.

## 1. Baseline And Scope

- Source baseline: commit `d9d7be70945d4ead16de6fb12830afb7e2c3325d`.
- Planning runtime observed on 2026-09-06: Node.js `v22.22.3`, npm `11.12.1`.
- Product version at planning: `0.14.5`.
- Existing server package: `agdf-mcp-server/`, SDK v2 and dual-protocol lanes already delivered.
- Existing semantic owner: `create-agdf/lib/skill-dispatch/contract.js`.
- Existing lifecycle owner: `create-agdf/lib/mcp-lifecycle/service.js`.
- Existing registration and package seams: `host-config.js` and `package.js`.
- Current worktree contains the planning-time localization correction that prevents free-form SD/TP
  next steps from causing `next_step_unlocalized`. Brownfield Analysis must reconcile it with this
  run before further product changes.

Included:

- capability profile schema v2 and lifecycle result schema v2;
- one closed host-adapter contract and registry;
- refactoring the three existing host leaves without changing their native behavior;
- new Copilot project/user adapter with fail-closed precedence inspection;
- runtime sharing within project or user scope and exact legacy-layout migration;
- common status, enable, disable, rollback, ownership and presentation behavior;
- plugin-versus-MCP separation and installer next-action projection;
- deterministic four-host tests and retained package/protocol regressions;
- independent direct project-scope evidence for each host, followed by complete removal;
- exact release qualification tuples, documentation, Context Graph update, mandatory reviews and QA.

Excluded:

- MCP server protocol, transport, tool count or semantic-contract changes;
- remote MCP, accounts, authentication services, telemetry or repository upload;
- plugin-bundled automatic MCP activation;
- automatic permission widening, trust acceptance, login or gate approval;
- generic shell, file-write, Git, release or workflow MCP tools;
- public npm, marketplace or plugin publication;
- direct user-scope host mutation without separate explicit authorization;
- claiming Windows, Linux, OpenCode 2.x or another unobserved client tuple;
- closing `opencode-native-dispatch-tool` without the planned direct permission evidence.

## 2. Task List

Effort is a bounded engineering estimate rather than elapsed agent time: S = 1 to 2 hours,
M = 2 to 4 hours, L = 4 to 8 hours. Dependencies define execution order.

| task_id | Task and source boundary | Depends on | Acceptance mapping | Evidence required | Effort |
|---|---|---|---|---|---|
| CHMCP-TP-01 | Revalidate approved TP, final changed-path baseline and all SD owners. Run the required post-TP Brownfield Analysis at depth-policy v1 before product edits. Reconcile the planning-time localization correction, current three-host lifecycle, capability profile, runtime paths and direct-host baseline. | Exact TP approval | AC-10, 11, 14, 15, 18, 20 | Passing `BROWNFIELD_ANALYSIS.md` names reuse, integration points, exceptional paths, test seams and dependency direction. Any SD conflict returns to SD. | M |
| CHMCP-TP-02 | Establish the acceptance and negative-control inventory before implementation. Add schema, adapter, transaction, migration, installer-separation and host-evidence fixtures mapped once to CHMCP-C01 through C20. | TP-01 pass | all | Every criterion has a failing pre-change control or an explicit already-green regression. Fixture roots cannot reach real user host configuration. | M |
| CHMCP-TP-03 | Upgrade `plugin/meta/agdf-mcp-capability.json` to schema v2 and add the closed profile validator and generated runtime load path. Validate four surfaces, exact release/package identity, stable vocabularies and immutable qualification references. | TP-02 | AC-01, 03, 15, 17, 18 | Malformed, incomplete, unknown and version-skew profiles fail before adapter access. Source and generated profiles are equal and public skills-only payload excludes the file. | L |
| CHMCP-TP-04 | Add lifecycle result schema v2 and the shared constructor/validator. Add code-based English/German presentation for states, scope effects, permissions, diagnostics, fallback and next actions. Fold the current localization repair into this canonical presentation owner. | TP-02, 03 | AC-01 through 03, 06, 07, 10, 16, 20 | All valid combinations render from one normalized object; misleading combinations fail. JSON/human parity and zero unlocalized reachable strings pass. Every result is non-authorizing. | L |
| CHMCP-TP-05 | Define `adapter-contract.js`, a closed registry and common conformance harness. Split Codex, Claude and OpenCode from `host-config.js` into thin adapter leaves while retaining the public facade during this release. | TP-02, 03 | AC-01 through 05, 09, 10, 15 | The lifecycle imports one registry. Leaves cannot install packages, dispatch semantically, localize or branch to another host. Existing three-host behavior has explicit before/after regression coverage. | L |
| CHMCP-TP-06 | Refactor `package.js` to shared project/user runtime roots and stable reference identities. Add exact legacy surface-root inspection, explicit enable migration, direct legacy disable and zero-reference retirement. | TP-02, 03 | AC-04, 05, 09, 11 through 13 | Multiple host refs share one runtime; user refs ignore incidental target; old/current mixed states migrate or remove without early deletion, scan or residue. Every fault phase rolls back. | L |
| CHMCP-TP-07 | Refactor `service.js` around profile validation, host probing, all-source inspection, shared runtime preparation, registration read-back, reference change and reverse rollback. Preserve read-only status and closed failure mapping. | TP-04 through 06 | AC-02 through 13, 16, 17, 20 | Status produces no filesystem/package effect. Enable and disable match approved order. Foreign or higher-precedence conflicts stop before mutation. Rollback failure is blocking. | L |
| CHMCP-TP-08 | Extend CLI registry, parser, application and help to accept Copilot with the same explicit absolute target, project default, user option, JSON output and human renderer. Keep one command family and exit-code mapping. | TP-04, 07 | AC-01 through 07, 17, 20 | Four accepted surfaces and all rejected grammar cases pass. No omitted target, unknown surface or unsupported scope reaches lifecycle execution. | M |
| CHMCP-TP-09 | Complete the Codex adapter with executable/version probe, selected/effective project/user inspection, ownership-safe TOML merge, native supplemental read-back and exact raw-state rollback. | TP-05, 07 | AC-02 through 13, 16, 17 | Project/user, foreign, malformed, precedence, created shell, trust preservation, idempotency, rollback and removal fixtures pass. Existing direct Codex behavior stays compatible. | M |
| CHMCP-TP-10 | Complete the Claude adapter with requested project to native local mapping, explicit user scope, effective-scope detection, native add/get/remove transaction and prior-entry restoration. | TP-05, 07 | AC-02 through 13, 16, 17 | Local/user, shared-project masking, missing executable, command failure, authentication boundary, rollback and removal fixtures pass. Shared project scope is never selected. | M |
| CHMCP-TP-11 | Complete the OpenCode adapter for explicit 1.x and 2.x variants, all precedence-relevant sources, exact structural JSON transaction and unchanged general permissions. | TP-05, 07 | AC-02 through 13, 16, 17, 19 | Both variants, alternate variant, custom/inline conflict, created shell, user scope, permission preservation, rollback and removal fixtures pass. | M |
| CHMCP-TP-12 | Implement the Copilot adapter. Manage target `.github/mcp.json` and user `~/.copilot/mcp-config.json`, inspect target `.mcp.json` and project/user precedence, use exact ownership environment fields and tool allowlist, and supplement with closed `copilot mcp list/get --json` parsing. | TP-05, 07 | AC-02 through 13, 16, 17 | Project/user, `.mcp.json` conflict, nested-cwd qualification limit, foreign/malformed entry, unknown native JSON, absent CLI, policy/trust unknown, rollback and removal fixtures pass. No native project/user asymmetry leaks into common transactions. | L |
| CHMCP-TP-13 | Keep plugin installation and MCP activation separate across all installers. Add only canonical next-action projection where useful and assert that no plugin manifest or installer creates an MCP registration or discovery claim. | TP-04, 08, 09 through 12 | AC-14, 16, 20 | Plugin install state may change while exact before/after MCP state is equal. Generated public and host payload tests reject bundled or automatic MCP. | M |
| CHMCP-TP-14 | Implement immutable release qualification records and a direct-evidence result validator. Store only complete exact tuples as qualified; retain current registration and discovery as live facts. | TP-03, 04, 09 through 12 | AC-08, 15, 17 through 19 | Missing tuple fields remain `unverified`. Another host, OS, package or controlled client cannot fill them. Past qualification never becomes current-session discovery. | M |
| CHMCP-TP-15 | Re-run and, only where needed, extend server/package/protocol regressions. Prove that lifecycle refactoring does not change tool metadata, dual-era negotiation, Node boundary, SDK v2 closure, worker limits, read-only application graph or shutdown. | TP-03 through 14 | AC-08, 15, 16, 18 | Existing protocol generations and exact package checks pass separately from host lanes. No server semantic or transport diff remains. | M |
| CHMCP-TP-16 | Update CLI and installation documentation with the project-first four-host journey, exact native sources, precedence, restart/trust, compatible path, permission boundary and cleanup. Reconcile `CG-MCP-DISPATCH-ADAPTER` with delivered source and evidence limits. | TP-08 through 15 | AC-03 through 08, 14, 16 through 20 | Documentation commands match parser tests. Context Graph keeps semantic, target, gate, plugin, host and OS evidence boundaries explicit. | M |
| CHMCP-TP-17 | Stabilize the final implementation diff and produce `CD_TESTS.md`. Run the focused and full deterministic suites once against generated release assets and record exact commands, versions, results and remaining gaps. | TP-03 through 16 | all | No unexpected changed path, generated drift, whitespace error or weakened test. Every task and criterion has evidence or an explicit blocking gap. | L |
| CHMCP-TP-18 | Execute the authorized OpenCode project-scope direct lane. Snapshot host/config/permissions, enable, restart in a fresh session, discover and call once, record prompt behavior, status, disable and independently prove complete cleanup. | TP-17 green | AC-04, 06 through 08, 12, 13, 16 through 19 | Exact OpenCode tuple and retained raw evidence, or a bounded unavailable/blocked record. `opencode-native-dispatch-tool` stays open until the evidence is conclusive. | M |
| CHMCP-TP-19 | Execute the authorized Claude Code project-to-local direct lane with the same baseline, enable, native read-back, fresh authenticated session, discovery/call, status, disable and independent cleanup matrix. | TP-17 green | AC-04, 06 through 08, 12, 13, 16 through 18 | Exact Claude tuple and raw evidence. Authentication failure remains a host-specific gap and cannot be converted into invocation proof. | M |
| CHMCP-TP-20 | Execute the separately authorized Codex project-scope direct lane with the same matrix and exact CLI/Desktop distinction. | TP-17 green | AC-04, 06 through 08, 12, 13, 16 through 18 | Exact Codex client/model tuple, tool observation, bounded call and complete post-removal proof. Prior server-run evidence cannot substitute for the new shared lifecycle. | M |
| CHMCP-TP-21 | Execute the Copilot project-scope direct lane against the locally installed available client. Record CLI/app/cloud variant explicitly, target-root precedence and trust/policy facts, then disable and prove complete cleanup. | TP-17 green | AC-04, 06 through 08, 10, 12 through 18 | Exact Copilot tuple and raw evidence, or an explicit unavailable/policy/trust gap. Plugin presence alone is insufficient. | L |
| CHMCP-TP-22 | Run Task Plan Review, Clean Implementation Review and Code Review against the final source and all evidence. Correct in-scope findings, rerun affected checks, then invoke QA Gate without creating UAT or release claims. | TP-17 through 21 | all | Reviews are current, task coverage is explicit, no unresolved block/revise finding remains unless QA receives it as a blocker, and evidence lanes remain separate. | L |

## 3. Test Plan

### 3.1 Acceptance Checks

| test_id | Acceptance behavior | Deterministic evidence | Direct or separate evidence |
|---|---|---|---|
| CHMCP-C01 | One command accepts all four named surfaces and rejects missing or unknown surface or non-absolute target. | CLI parser, registry, help and handler spies | None |
| CHMCP-C02 | Status against an unconfigured host is read-only and returns all required state groups. | Four adapter fixtures plus before/after filesystem and command-effect snapshots | Per-host native status baseline |
| CHMCP-C03 | Missing host, unknown variant, unsupported Node or observed policy denial returns exact capability and recovery without mutation. | Negative probes, Node 18 process and policy fixtures | Available native negative observations |
| CHMCP-C04 | Enable defaults to project scope and never widens silently. | Four project-scope fixtures and selected-source assertions | Four project registration observations |
| CHMCP-C05 | Explicit user scope uses only the native user source. | Isolated-home fixtures for all hosts | Direct user-scope tests only after separate authorization |
| CHMCP-C06 | Successful enable reports exact runtime, source, permission effect and pending restart or trust. | Transaction and result snapshots | Four enable captures |
| CHMCP-C07 | Matched configuration stays unverified before fresh discovery. | State-combination tests | Status before fresh session |
| CHMCP-C08 | Fresh session exposes canonical tool and one bounded non-authorizing dispatch. | Evidence-record validator and unchanged semantic contract | Independent host record for each surface |
| CHMCP-C09 | Repeat enable and status are idempotent and reference-stable. | Duplicate-operation and marker snapshots | Repeat native list/status where safe |
| CHMCP-C10 | Foreign, invalid and higher-precedence entries fail closed with named source. | Full adapter conflict matrix | Direct conflict only when safely reversible |
| CHMCP-C11 | Every partial failure restores exact config, presence and runtime references. | Injected failures at all prepare, apply, read-back, reference, retirement and rollback phases | No destructive direct fault injection |
| CHMCP-C12 | Disable removes only exact owned selected entry and retires runtime at last reference. | Multi-host, multi-scope and lower-precedence fixtures | Four disable observations |
| CHMCP-C13 | Post-disable state matches baseline with no AGDF-created shell or runtime residue. | Independent fixture inspector | Independent native/filesystem cleanup per host |
| CHMCP-C14 | Plugin installation never activates or qualifies MCP. | Four installer before/after MCP sentinels and payload checks | Copilot plugin-versus-MCP observation |
| CHMCP-C15 | Semantic tool metadata has one canonical owner. | Import/source inventory, schema equality and generated payload checks | Direct discovery metadata where exposed |
| CHMCP-C16 | Permissions and control approval state do not widen or change. | Permission/config/control snapshots and immutable `authorizes: false` | Four host permission/trust observations |
| CHMCP-C17 | Only complete exact direct tuples become qualified. | Qualification schema positive/negative matrix | Four independent host records |
| CHMCP-C18 | Protocol, package, lifecycle, host, OS and UAT lanes remain distinct. | Evidence-source validation and report mapping | Controlled protocol logs, host records and later UAT |
| CHMCP-C19 | OpenCode MCP prompt behavior is reported without changing unrelated permissions or pre-deciding native-tool retirement. | OpenCode permission fixtures and evidence validator | Direct OpenCode comparison |
| CHMCP-C20 | Human and JSON lifecycle output have the same meaning in English and German. | Exhaustive code, locale and state snapshots | Visible host output samples where applicable |

### 3.2 Adapter Fixture Isolation

All deterministic tests use temporary target, home, AGDF data and host-config roots. Injected command
runners record executable, argv, cwd, environment, output and declared effects. Tests cannot read or
modify real Copilot, Codex, Claude Code, OpenCode or npm state.

Each adapter fixture records raw configuration bytes and original presence, selected and
precedence-relevant sources, exact owned and foreign identities, host version variants, runtime
references, command calls, unrelated settings and permission rules.

### 3.3 Transaction Fault Matrix

Inject failure before and after package preparation, native transaction preparation, registration
apply, first read-back, reference apply, superseded-reference removal, runtime retirement and commit.
Inject rollback failure separately. Each recoverable case must restore raw bytes, file/directory
presence and references exactly. `rollback_incomplete` remains blocking and never returns an
unchanged, disabled or supported state.

### 3.4 Direct Host Protocol

Each direct lane uses this order:

1. capture exact executable/version, session/model variant, OS/architecture and authentication state;
2. snapshot repository and user host configuration, plugin state and relevant permissions;
3. run read-only status;
4. run explicit project enable;
5. inspect native selected and effective registration;
6. start a fresh host session from the recorded repository directory;
7. observe the exact canonical tool and perform one bounded dispatch;
8. run lifecycle status without interpreting configuration as discovery;
9. run explicit disable;
10. inspect native state, runtime roots, temporary data and repository/user config independently;
11. compare with the baseline and retain a redacted evidence record plus hashes for raw logs.

If a host is missing, unauthenticated, policy-blocked or cannot expose the required fresh-session
behavior, the lane stops before unsafe mutation or after verified rollback. The record stays
`unverified` for that exact tuple. Fixtures and another host cannot replace it.

### 3.5 Planned Verification Entrypoints

Implementation may add focused scripts, but final names must appear once in package manifests and
normal smoke coverage. Planned verification includes:

```text
npm --prefix create-agdf run test:mcp-lifecycle
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:skill-dispatch
npm --prefix create-agdf run test:mcp-server
npm --prefix create-agdf run test:copilot-installer
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run release:prepare
npm --prefix create-agdf run smoke-test
git diff --check
```

These commands are planning targets rather than current implementation evidence. TP-01 revalidates
the minimum sufficient set and TP-17 records the final executed commands once.

## 4. Acceptance Traceability

| PRD criterion | Primary tasks | Primary test |
|---|---|---|
| CHMCP-AC-01 | TP-03, 04, 05, 08 | C01 |
| CHMCP-AC-02 | TP-04, 05, 07, 09 through 12 | C02 |
| CHMCP-AC-03 | TP-03, 04, 07 through 12 | C03 |
| CHMCP-AC-04 | TP-07 through 12, 18 through 21 | C04 |
| CHMCP-AC-05 | TP-07 through 12 | C05 |
| CHMCP-AC-06 | TP-04, 06, 07, 09 through 12, 18 through 21 | C06 |
| CHMCP-AC-07 | TP-04, 07, 14 | C07 |
| CHMCP-AC-08 | TP-14, 18 through 21 | C08 |
| CHMCP-AC-09 | TP-06, 07, 09 through 12 | C09 |
| CHMCP-AC-10 | TP-05, 07, 09 through 12 | C10 |
| CHMCP-AC-11 | TP-06, 07, 09 through 12 | C11 |
| CHMCP-AC-12 | TP-06, 07, 09 through 12, 18 through 21 | C12 |
| CHMCP-AC-13 | TP-06, 07, 18 through 21 | C13 |
| CHMCP-AC-14 | TP-13, 21 | C14 |
| CHMCP-AC-15 | TP-03, 05, 14, 15 | C15 |
| CHMCP-AC-16 | TP-04, 09 through 13, 18 through 21 | C16 |
| CHMCP-AC-17 | TP-03, 14, 18 through 21 | C17 |
| CHMCP-AC-18 | TP-14, 15, 17 through 22 | C18 |
| CHMCP-AC-19 | TP-11, 14, 18 | C19 |
| CHMCP-AC-20 | TP-04, 08, 13, 17 | C20 |

## 5. Brownfield Scope

Before implementation, Brownfield Analysis must inspect the approved PRD, SD, TP and run revision,
all current uncommitted paths, the existing lifecycle/package/CLI/presentation owners, the
capability profile and generation path, all four official host contracts, the server no-change
boundary, historical direct-host evidence, Context Graph node, separate OpenCode native-tool run
and every real configuration/cleanup seam.

The analysis uses depth-policy v1 and explicitly covers business rules, dependency impact,
integration, data flow, errors, tests, data/schema, security, upgrade/rollback, observability,
performance and UX/contract dimensions. A conflict with the approved architecture returns to SD.

## 6. Execution Order

1. After exact TP approval, execute TP-01 and stop on any blocking Brownfield conflict.
2. Establish TP-02 negative controls before changing product owners.
3. Implement profile and result owners in TP-03 and TP-04.
4. Refactor the adapter seam and shared runtime in TP-05 and TP-06.
5. Compose the lifecycle and CLI in TP-07 and TP-08.
6. Complete the four adapters in TP-09 through TP-12 with focused conformance checks after each.
7. Complete plugin separation, evidence qualification and package/protocol regressions in TP-13
   through TP-15.
8. Update documentation and Context Graph through TP-16.
9. Stabilize the diff and run deterministic validation through TP-17.
10. Execute direct host lanes TP-18 through TP-21. Finish or roll back one host and verify cleanup
    before beginning the next.
11. Run mandatory reviews and QA preparation through TP-22.

## 7. Required Evidence Before QA

- exact TP approval and passing post-TP Brownfield Analysis;
- `CD_TESTS.md` mapping TP-01 through TP-22 and C01 through C20;
- profile/result schema, adapter conformance and all-source precedence results;
- shared runtime, legacy migration, multi-reference and fault-injection evidence;
- plugin/MCP separation and public skills-only exclusion proof;
- exact server/package/protocol regression evidence kept separate from host results;
- independent direct records for all four hosts, including explicit gaps;
- complete cleanup and unrelated-state preservation for every mutated direct host;
- exact host/OS/package tuples for each support claim;
- OpenCode permission/prompt observation without premature native-tool closure;
- English/German presentation parity and no localization diagnostic;
- reconciled Context Graph and current documentation;
- current Task Plan Review, Clean Implementation Review and Code Review;
- `git diff --check`, focused tests, release preparation and full smoke result.

## 8. QA Severity And Stop Conditions

QA blocks when the design duplicates or bypasses semantic, target, gate, approval or plugin owners;
status mutates; scope or runtime changes silently; foreign configuration is overwritten; rollback or
cleanup is incomplete; permissions widen; plugin install activates MCP; evidence lanes are
substituted; support lacks a complete tuple; public skills-only content gains MCP; or required tests
fail or weaken.

QA revises when delivered behavior differs materially from approved result vocabulary, scope
mapping, runtime migration, Copilot precedence, recovery text or acceptance criteria without an
approved SD or TP revision.

A missing executable, authentication, trust or organization policy blocks the support claim for
that exact tuple. It is recorded rather than repaired through fixtures. Whether it blocks overall
QA depends on whether the delivered product or documentation claims the missing host behavior.

## 9. Context Graph And Knowledge Decision

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-REQUEST-ACTIVATION-AUTHORITY`;
  `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `design_resolved_implementation_pending`
- context_graph_required_action: update the existing MCP adapter node with the delivered common
  lifecycle, native-source, plugin-separation and direct-evidence boundaries during TP-16
- memory_target: `scope_artifact`
- memory_reason: Approved design, plan and Context Graph remain the durable project record.

## 10. Next Step

Task Plan Revision 1 is approved through exact `Approval: TP`. Run the post-TP Brownfield Analysis,
then implement the approved tasks in dependency order only if the analysis passes. Publication,
release, commit, push and unrelated user-scope host mutation remain outside this approval.
