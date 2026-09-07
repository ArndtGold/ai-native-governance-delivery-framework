# CD+Tests: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: done  
Decision: pass with bounded release and host-evidence gaps  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`  
Baseline: `d9d7be70945d4ead16de6fb12830afb7e2c3325d`  
Runtime: Node.js `v22.22.3`, npm `11.12.1`, Darwin `x64`

## Delivered implementation

The implementation extends the existing MCP lifecycle with one profile/result contract, one adapter
registry, four native host leaves and one shared runtime/reference model. The semantic function owner
remains `create-agdf/lib/skill-dispatch/contract.js`. The MCP server remains one read-only
`agdf_dispatch` tool using SDK v2 and separate 2025-11-25 and 2026-07-28 protocol lanes.

The lifecycle now supports `codex`, `claude`, `opencode` and `copilot` through the same explicit
`mcp status|enable|disable` command family. Project scope is the default. User scope stays explicit.
Configuration, fresh discovery, direct dispatch, protocol conformance and release qualification are
separate evidence states. Every lifecycle result is non-authorizing.

The final regression exposed and fixed a generated Copilot profile race. Repeated generation had
removed and recreated the complete profile/runtime directories, allowing macOS to create conflict
siblings such as `runtime 17` and `plugin 2.json`. The generator now synchronizes the owned roots
in-place, prunes files outside the computed mapping and tests stale Copilot root/runtime entries.

After implementation commit `c95874957ac78bbccd8b7b31a90b71dbe50ce677`, the user requested a
revision before UAT: the public architecture documentation must explain the complete MCP design at
an entry-level depth. `docs/architecture/README.md` now connects system context, semantic ownership,
the Skill and MCP invocation paths, reversible lifecycle, shared runtime, native host sources,
distribution and exact evidence qualification. Five existing diagrams were revised and one focused
MCP lifecycle diagram was added. This documentation projection does not change runtime, product or
governance semantics.

## Task coverage

| task_id | CD+Tests status | Primary evidence |
|---|---|---|
| CHMCP-TP-01 | done | Approved TP revalidated; `BROWNFIELD_ANALYSIS.md` passed before product edits |
| CHMCP-TP-02 | done | `mcp-lifecycle-test.js` contains isolated profile, result, adapter, transaction, migration, separation and evidence fixtures |
| CHMCP-TP-03 | done | `plugin/meta/agdf-mcp-capability.json`, `profile.js`, `profile-context.js`; malformed and version-skew cases fail closed |
| CHMCP-TP-04 | done | `result.js`, `presentation.js`, localized registry and presentation tests enforce schema v2, JSON/human parity and `authorizes: false` |
| CHMCP-TP-05 | done | `adapter-contract.js`, four-leaf registry and `host-config.js` compatibility facade; lifecycle imports the registry |
| CHMCP-TP-06 | done | Shared runtime/reference roots, marker schema v2, exact legacy migration and last-reference retirement in `package.js` and lifecycle fixtures |
| CHMCP-TP-07 | done | `service.js` validates profile/probe/source/read-back/reference order and reverse rollback; `rollback_incomplete` is blocking |
| CHMCP-TP-08 | done | CLI registry, application and help accept all four surfaces with explicit absolute target and project/user scope |
| CHMCP-TP-09 | done | Codex adapter fixtures cover TOML merge, project/user identity, precedence, missing host and cleanup; direct project lane passed |
| CHMCP-TP-10 | done | Claude adapter covers project-to-local mapping, user scope, shared-project masking, native restore and missing/auth boundaries |
| CHMCP-TP-11 | done | OpenCode adapter covers v1/v2 shapes, custom/inline precedence, user target independence, permission preservation and cleanup |
| CHMCP-TP-12 | done | Copilot adapter covers `.mcp.json`, `.github/mcp.json`, user precedence, exact owned entry, absent CLI and lower effective scope |
| CHMCP-TP-13 | done | Public payload and installer regressions keep plugin installation separate from MCP registration; public Skills-only payload excludes lifecycle/server metadata |
| CHMCP-TP-14 | done | `evidence.js` validates complete exact qualification tuples and direct evidence; every incomplete direct tuple stays `unverified` |
| CHMCP-TP-15 | done | MCP contract, dual protocol, safety, provenance, performance and package suites passed with unchanged semantic owner/tool count |
| CHMCP-TP-16 | done | Root, install and package READMEs, the entry-level architecture guide with six verified diagrams and `CG-MCP-DISPATCH-ADAPTER` document native sources, ownership, lifecycle, evidence and authority boundaries |
| CHMCP-TP-17 | done | Release assets regenerated; focused and complete suites, documentation checks and the refreshed 56-scenario compatibility record passed; this report records failures, corrections and remaining gaps |
| CHMCP-TP-18 | done with bounded gap | OpenCode project registration, native list, fresh one-call dispatch and exact cleanup retained; failure-path qualification evidence remains missing |
| CHMCP-TP-19 | done with bounded gap | Claude project-to-local registration and cleanup passed; fresh session stopped at host authentication before discovery/call |
| CHMCP-TP-20 | done with bounded gap | Codex project registration, native read-back, fresh one-call dispatch and exact cleanup retained; failure-path qualification evidence remains missing |
| CHMCP-TP-21 | done with bounded gap | Copilot project registration and cleanup passed; no callable CLI or automated Desktop fresh-session interface was available |
| CHMCP-TP-22 | done | Refreshed TP, clean and code reviews cover the post-commit documentation revision; QA Revision 2 records `pass` and awaits exact approval |

## Acceptance coverage

| test_id | status | Evidence |
|---|---|---|
| CHMCP-C01 | pass | Four-surface CLI and rejected grammar matrix in `cli-modularization-test.js` |
| CHMCP-C02 | pass | Four isolated status fixtures prove no filesystem or package effect |
| CHMCP-C03 | pass | Missing Codex/OpenCode/Claude, unobserved Copilot, unsupported OpenCode and Node/package negative cases |
| CHMCP-C04 | pass | All four enable fixtures and direct lanes select project scope by default |
| CHMCP-C05 | pass | All four user-scope paths tested only in isolated homes; OpenCode and Codex refs ignore incidental target |
| CHMCP-C06 | pass | Result snapshots report runtime identity, selected/effective source, permissions and restart state |
| CHMCP-C07 | pass | State invariants reject configuration-as-discovery and misleading `discovered_ready` combinations |
| CHMCP-C08 | pass with bounded direct gaps | Codex/OpenCode one-call evidence passed; Claude auth and Copilot client gaps retained; no tuple falsely qualified |
| CHMCP-C09 | pass | Repeated enable/status and multi-host references remain idempotent and stable in fixtures |
| CHMCP-C10 | pass | Foreign, malformed, inline/custom, `.mcp.json` and higher/lower precedence fixtures fail closed |
| CHMCP-C11 | pass | Package, native apply/read-back, reference and rollback failure paths preserve state; rollback failure returns `rollback_incomplete` |
| CHMCP-C12 | pass | Multi-host/multi-scope disable removes only owned selected entries and retires at the last reference |
| CHMCP-C13 | pass | Fixture cleanup plus direct `90-cleanup.json` prove baseline restoration and no retained runtime |
| CHMCP-C14 | pass | Installer and public payload tests prove plugin state cannot activate or qualify MCP |
| CHMCP-C15 | pass | Semantic contract test and import/package inventory preserve `skill-dispatch/contract.js` as canonical owner |
| CHMCP-C16 | pass | Permission snapshots remain unchanged; result and direct records require `authorizes: false` |
| CHMCP-C17 | pass | Qualification positive/negative matrix rejects missing tuple fields, other host/OS/package and incomplete direct evidence |
| CHMCP-C18 | pass | Reports and validators keep controlled protocol, lifecycle, package, direct host and later UAT evidence separate |
| CHMCP-C19 | pass with bounded qualification gap | Direct OpenCode call produced no shell prompt or unrelated permission change; native-tool retirement remains outside this run |
| CHMCP-C20 | pass | Closed English/German code registry, JSON projection and human rendering pass exhaustive state tests |

## Verification results

| Command | Result |
|---|---|
| `npm --prefix create-agdf run release:prepare` | pass: generated assets, 8 profile histories, 16-file release transaction, 39 version surfaces and public plugin |
| `npm --prefix create-agdf run test:mcp-lifecycle` | pass: lifecycle, package acquisition and four host adapters |
| `npm --prefix create-agdf run test:cli-modularization` | pass |
| `npm --prefix create-agdf run test:interaction-presentation` | pass |
| `npm --prefix create-agdf run test:skill-dispatch` | pass: semantic contract and 40 generated/source-composed bindings |
| `npm --prefix create-agdf run test:runtime-integrity-layout` | pass |
| `npm --prefix create-agdf run test:runtime-integrity-negative` | pass |
| `npm --prefix create-agdf run test:package-build` | pass twice after correction; byte-identical complete builds and stale Copilot entry removal |
| `npm --prefix create-agdf run test:local-development-install` | pass after correction |
| `npm --prefix create-agdf run smoke-test` | final serial pass after correction, including 83/83 deterministic skill evals and 467-file release package |
| Six `dot -Tsvg` architecture renders plus `xmllint --noout` | pass; five diagrams refreshed and one MCP lifecycle diagram added |
| Architecture local-link and image-reference audit | pass; 55 local links, 45 unique targets, zero missing targets and six SVG references |
| `npm run test:community-health` | pass; reviewed baseline and 29 negative contracts |
| `npm run compatibility:record` | pass after canonical serial synchronization; 56 scenarios, zero failures, source fingerprint `af6a4d8a0ccfb0cdd3bcd1b4ee6c5c5b6da0ab67888992414b29f90f9ea9cbb4` |
| `npm run compatibility:check` | pass; refreshed public report, facts, snapshot and immutable observation agree |
| `npm run check:community-health` | pass; 39 required files and 4 issue forms |

The MCP server performance test passed in the final serial full suite on Node.js `v22.22.3`, Darwin
`x64`: cold tools/list p95 `545.143 ms`, warm dispatch p95 `314.568 ms`. An earlier run launched
concurrently with package tests exceeded the cold threshold at `1716.489 ms`; an immediate isolated
rerun passed at cold `574.357 ms` and warm `336.017 ms`. A later accidentally overlapping aggregate
run temporarily timed out a five-second OpenCode version probe after SDK alignment; the same smoke
script passed in isolation and the final non-overlapping aggregate passed. The report retains these
load-sensitive observations instead of treating them as product evidence.

The first full smoke attempt failed at `test:local-development-install` with
`copilot_payload_inventory_mismatch`. Inspection found nine conflict-named files/directories outside
the signed 95-file inventory. The in-place generator/pruning correction and two stale-entry regression
fixtures resolved the failure. The affected focused tests and the complete smoke suite then passed.

The first post-commit compatibility recording attempt found another set of conflict-named directories
in the generated Copilot root and stopped before replacing public evidence. A serial
`release:prepare` used the corrected synchronizer to remove every entry outside the exact inventory.
The failed temporary observations were removed. The next recorder run passed 56/56 scenarios, the
focused package build proved byte-identical complete builds, and both compatibility and community
health checks passed. This is deterministic fixture evidence and does not upgrade a direct host tuple.

## Direct host evidence

`DIRECT_HOST_EVIDENCE.md` and `evidence/direct-host/manifest.json` retain the direct matrix and hashes.
The machine-readable `direct-evidence-results.json` passes `validateMcpDirectEvidenceResult` for four
honest `unverified` results. Existing user Codex and OpenCode configuration hashes match baseline;
the Copilot user file stayed absent; all project registrations and temporary runtime/cache roots are
absent after removal.

## Remaining gaps and limits

- `@agdf/mcp-server@0.14.5` is not published. Ordinary end-user package acquisition cannot succeed
  until a later authorized release. Publication is explicitly outside this TP.
- Codex and OpenCode have positive fresh-host dispatch evidence but no direct failure-path record, so
  neither exact tuple is release-qualified.
- Claude Code requires an authenticated fresh session to observe discovery and dispatch.
- Copilot requires a callable CLI or observable fresh Desktop/IDE MCP session for native discovery,
  trust/policy and dispatch evidence.
- Windows, Linux, OpenCode 2.x and every unobserved host/client/package tuple remain unqualified.

These limits do not alter the implemented fail-closed behavior. They prevent support and release
claims beyond the evidence actually retained.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` names the delivered common lifecycle owners, four native leaves, separate evidence lanes and exact unverified host limits.

## Next step

Review `TASK_PLAN_REVIEW.md`, `CLEAN_IMPLEMENTATION_REVIEW.md`, `CODE_REVIEW.md` and QA Report
Revision 2, then provide exact `Approval: QA` or request a revision.
