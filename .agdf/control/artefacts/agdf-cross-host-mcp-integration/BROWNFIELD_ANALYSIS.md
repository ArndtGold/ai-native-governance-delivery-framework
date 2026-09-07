# Brownfield Analysis: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_ANALYSIS.md`
- run: `agdf-cross-host-mcp-integration`
- revision: 1
- based_on: approved TP Revision 1, SD Revision 1 and PRD Revision 1
- source_baseline: `d9d7be70945d4ead16de6fb12830afb7e2c3325d`
- scope: Verify the approved four-host lifecycle, shared-runtime migration, Copilot adapter,
  presentation contract and evidence plan against the actual existing server, lifecycle, package,
  installer, generation and test owners before implementation.
- evidence: Direct repository inspection of the current diff, MCP lifecycle service, host-config
  facade, runtime package/ref transactions, CLI registry/application, capability metadata,
  localization registry, release generation, public-plugin exclusion, MCP server/package suites,
  historical direct-host records and official host configuration contracts.
- transparency: The implementation path passes because every existing concern has one reusable
  owner and the new work is limited to an adapter leaf, a closed common contract and approved
  refactors inside the existing lifecycle. No second server, dispatcher, installer, target resolver,
  gate evaluator, renderer or approval path is required.
- missing_evidence: Direct fresh-session evidence for the new lifecycle on Copilot, Codex, Claude
  Code and OpenCode remains intentionally absent before implementation. OpenCode 2.x, Windows and
  Linux remain unqualified unless directly observed later.

## 1. Current Coverage And Reuse

| Approved area | Current coverage | Reuse strategy | Existing owner and consequence |
|---|---|---|---|
| MCP tool semantics and server | `fully_done` | `reuse` | `skill-dispatch/contract.js`, dispatcher service and `agdf-mcp-server/` remain unchanged. Lifecycle work may identify but not redefine the tool. |
| Lifecycle orchestration | `partially_done` | `refactor` | `mcp-lifecycle/service.js` already owns status/enable/disable and rollback composition. Extend it through a registry instead of adding services. |
| Host configuration | `partially_done` | `refactor` and `extend` | `host-config.js` contains working Codex, Claude and OpenCode leaves. Split them behind one facade and add only the Copilot leaf. |
| Runtime acquisition and ownership | `partially_done` | `refactor` | `package.js` already verifies exact package/digests, stages atomically and tracks refs. Change the root/reference identity without another package owner. |
| Capability metadata | `partially_done` | `extend` | `agdf-mcp-capability.json` has exact package/protocol facts but is not a runtime contract. Upgrade and validate it through generation/runtime context. |
| Lifecycle result and text | `partially_done` | `refactor` | `service.js` currently mixes state construction and free-form English text. Add one result validator and one locale-backed presentation owner. |
| CLI command | `partially_done` | `extend` | Existing registry/parser/application already route three hosts. Add Copilot to the same grammar and handler. |
| Plugin separation | `fully_done` | `preserve` | Host installers and public plugin already exclude MCP auto-activation. Add regression assertions and canonical next-action projection only. |
| Host evidence | `partially_done` historical baseline | `extend` | Prior server-run records prove earlier Codex/OpenCode/Claude behavior only. New lifecycle needs fresh independent records for all four hosts. |
| Context Graph | `partially_done` | `update` | Existing `CG-MCP-DISPATCH-ADAPTER` owns the server boundary. Update it after final source and evidence exist. |

- current_coverage: The server and three-host lifecycle are implemented. The common profile/result
  contract, shared cross-host runtime root, all-source effective inspection and Copilot adapter are
  not yet implemented.
- reuse_strategy: Reuse the semantic, server, package provenance, CLI, installer, locale, atomic
  swap and test owners. Refactor the monolithic host-config and result text only where required by
  the approved common contract. Add one Copilot adapter leaf and one profile/result validator.
- required_next_step: Begin CD+Tests with TP-02 negative controls, then implement TP-03 through
  TP-17 before any real host mutation.

## 2. Dependency And Data Flow

The clean dependency direction is:

```text
CLI -> lifecycle service -> validated profile/result owners
                         -> closed adapter registry -> one host leaf
                         -> existing package/provenance transaction
host registration -> existing exact MCP server -> canonical dispatch contract
```

Adapters return facts and transactions. They do not import CLI presentation, package acquisition,
semantic dispatch or another adapter. The lifecycle service never imports host installers. The
server package remains independent of all lifecycle mutation modules.

No application database or `.agdf/control/` schema migration is required. The only persistent-data
change is the owned runtime directory layout and its marker references. Exact legacy paths are
derived from the registered entrypoint and verified marker. Arbitrary data-root scanning is not
needed and is prohibited.

## 3. Parallel-Structure And Drift Check

| Risk | Assessment | Required control |
|---|---|---|
| second semantic function or schema | clear | Import and test the existing semantic owner only. Capability metadata stores owner identity, not copied schemas. |
| second lifecycle or installer | clear | Keep `service.js` as orchestrator and plugin installers separate. |
| second renderer | controlled | Move lifecycle text to the existing locale registry through one MCP presentation module; remove free-form adapter text. |
| second runtime/provenance model | controlled | Refactor current `package.js` marker and refs. Do not create a new store or accept unowned packages. |
| host-symmetry fiction | controlled | Common contract holds shared states while each leaf reports native scope, source, precedence and version variant. |
| static support replacing live state | controlled | Profile qualification is immutable evidence only; current discovery remains host-observed. |
| plugin install implying MCP | clear | Existing separation is preserved and asserted. |
| gate authorization through MCP | clear | Existing semantic result and every lifecycle envelope remain `authorizes: false`. |

SoT drift is absent: PRD, SD and TP consistently retain the semantic and governance owners. Runtime
drift is present and planned: existing roots are surface-specific and references include incidental
target for user scope. The approved shared root/reference migration corrects this within the current
package owner. Presentation drift is present and planned: the existing lifecycle emits free-form
English next actions, while the planning-time gate localization correction shows why a closed
code-to-locale path is required.

## 4. Change Impact By Dimension

| Dimension | Impact and evidence | Implementation control |
|---|---|---|
| business rules | Project-first explicit activation, no scope widening and separate plugin/MCP state are approved product rules. | Enforce before package/config mutation and cover all branches. |
| dependency impact | `create-agdf` gains only local lifecycle modules and generated profile data. The server dependency graph does not change. | Static import and package-inventory tests. |
| integration | Four native config contracts differ in path, scope, precedence, trust and CLI behavior. | Closed adapter contract plus per-host conformance and direct records. |
| data flow | Target/profile/probe facts flow into desired registration; selected/effective sources and runtime refs flow back into one result. | Immutable inputs, normalized result and no adapter text. |
| error handling | Existing lifecycle catches broadly and loses rollback-failure detail. | Stable diagnostic mapping, explicit reverse rollback verification and blocking `rollback_incomplete`. |
| test impact | Current lifecycle test is monolithic but has valuable package and adapter fixtures. | Retain it as integration coverage and add focused profile/result/adapter cases without duplicating policy. |
| data/schema | Capability and lifecycle envelope move to schema v2; runtime marker/reference identity changes. | Closed validation, explicit migration and no dual execution path. |
| security and authority | Local process inherits host access; config mutation and trust remain sensitive. | Exact owned paths, no permission widening, no arbitrary shell, `authorizes: false`. |
| upgrade and rollback | Several hosts may share one runtime; a failed migration could delete an active package. | Add new ref before removing old, zero-ref retirement and phase fault injection. |
| observability | Current text hides selected versus effective source and current versus qualified discovery. | Structured fields, stable codes and separate direct evidence. |
| performance | Status adds bounded source/probe inspection. Package install remains enable-only. | Command spies and performance regression; no recursive configuration scan. |
| UX and contract | Users need exact state, source, next action and cleanup outcome in German/English. | One normalized result and locale-complete renderer. |

## 5. Host-Specific Findings

| Host | Existing fact | Minimal clean implementation |
|---|---|---|
| Codex | Working exact TOML section owner and cleanup markers exist; no executable probe or all-source effective model exists. | Move existing code into a leaf, add probe and selected/effective inspection, preserve raw rollback. |
| Claude Code | Native add/get/remove transaction exists and requested project already maps to local. | Move it into a leaf and make scope masking and rollback facts explicit. |
| OpenCode | 1.x/2.x variants, created-shell cleanup and permission-preserving JSON merge exist. | Move into a leaf and add precedence/custom-inline conflict inspection without changing permissions. |
| Copilot | No lifecycle adapter exists. Official local/user schema and precedence are documented; project and user removal semantics differ in the native CLI. | Use one atomic JSON transaction for `.github/mcp.json` and user config, inspect `.mcp.json` first and use native JSON only as supplemental read-back. |

## 6. Regression And Evidence Impact

Required deterministic evidence is profile/result contract validation, four adapter conformance,
selected/effective precedence, shared runtime/ref migration, fault injection, plugin separation,
locale parity, public payload exclusion, server/package/protocol no-change and aggregate smoke.

Real host configuration is excluded from deterministic implementation. After the final source diff
passes, each authorized project-scope host lane must start from a captured baseline and end with
independent cleanup. A host or authentication gap remains unverified for that tuple and cannot be
replaced by fixtures, historic records or controlled MCP clients.

## 7. Risks

| Risk | Impact | Required response |
|---|---|---|
| Copilot precedence or native JSON differs from documentation | revise | Fail closed, retain file evidence separately and do not qualify the host. |
| Adapter split changes working three-host behavior | block | Preserve facade signatures and run old integration cases beside new conformance cases. |
| Shared runtime migration drops a live ref | block | Verify exact old/new refs with multi-host and failure matrices before direct testing. |
| Result schema mixes current and historical evidence | revise | Keep registration, discovery and qualification independently sourced. |
| Localization returns free-form fallback | revise | Require locale completeness and fail closed on an unknown code. |
| Direct host cleanup is incomplete | block | Stop the next host lane, restore from captured baseline and report the residue. |

## 8. Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-REQUEST-ACTIVATION-AUTHORITY`;
  `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `design_resolved_implementation_pending`
- required_action: Update the existing node during TP-16 only after delivered owners, native paths
  and exact evidence limits are known.

## 9. Decision And Minimal Clean Path

Decision: `pass`.

1. Add negative controls for profile, result, adapter and runtime migration.
2. Implement profile/result owners and locale projection.
3. Split current adapter leaves behind the existing facade.
4. Migrate current package/reference ownership to shared roots.
5. Compose the existing lifecycle and CLI over the closed registry.
6. Add the Copilot leaf and retain native host differences.
7. Prove plugin separation plus server/package/protocol non-regression.
8. Stabilize deterministic evidence before any real host mutation.
9. Execute one direct host lane at a time and prove cleanup.
10. Run the mandatory reviews and QA.

No blocking drift or parallel owner remains. CD+Tests may begin within approved TP Revision 1.
