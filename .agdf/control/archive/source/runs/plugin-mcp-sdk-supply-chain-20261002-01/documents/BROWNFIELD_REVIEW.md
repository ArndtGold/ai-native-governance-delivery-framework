# Brownfield Review: Pinned and verified plugin MCP SDK acquisition

Status: done
Mode: post_ur_review
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01

## Decision

- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth — the change hardens the supply-chain trust boundary
  between the npm registry and the committed plugin MCP runtime for two hosts, and it changes
  user-visible failure behaviour (mirrors or re-resolved trees now fail closed). Rejected alternative:
  structured_slice, because a full-depth trigger is evidenced.

## Routing Fields

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: The only visible change is a new fail-closed error code during plugin MCP
  preparation; activation and recovery semantics stay unchanged (reinstall or retry).
- ux_intent_definition_required: no (not_applicable; error wording and recovery fit the existing
  `AGDF_MCP_*` diagnostics pattern)

## Existing Owners And Coverage

| Concern | Owner | Coverage |
|---|---|---|
| Stage install, version and identity checks, marker | `packages/cli/lib/mcp-lifecycle/package.js` (`prepareMcpServerPackage`, `inspectMcpServerPackage`) | partially_done: names/versions checked, `sdk_digest` written but self-referential |
| Plugin SDK spec and launcher | `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (`SDK_PACKAGE_SPEC`, `ensurePluginMcpRuntime`, `launchPluginMcpServer`) | not_done for lockfile and expected digest |
| SDK digest algorithm | `packages/core/lib/runtime/plugin-provenance.js` (`digestMcpSdkRuntime`, `MCP_SDK_RUNTIME_ENTRIES`) | fully_done, reusable |
| Dispatch-time provenance | `packages/cli/lib/mcp-dispatch-runtime.js:46-61` (compares marker `sdk_digest` with recomputed digest) | fully_done for post-install tampering, not for first install |
| Plugin `mcp/` payload generation | `scripts/sync-plugin-mcp.js` | extend: can emit lockfile and expected digest |
| Reviewed dependency tree | `packages/mcp-server/package-lock.json` (server, core, zod with sha512 integrity; dev-only client tree) | reuse as source |
| Offline test stand-in | `scripts/support/plugin-mcp-fixture.js` (`offlineNpm` asserts the bare spec) | must change with the new install form |
| Tests | `packages/cli/scripts/mcp-lifecycle-test.js`, `codex-plugin-mcp-test.js`, Claude plugin MCP tests using the fixture | extend |

## Findings

| Finding | Class | Treatment |
|---|---|---|
| F1: Digest covers only `server`, `core`, `zod`. A newly resolved transitive dependency outside these entries is neither digested nor rejected. | problem | PRD/SD must require that the committed tree equals the locked set (no extra packages). |
| F2: Expected SDK digest must be generated at build time from a reference install; digest stability across OS line endings and npm versions is unproven. | unresolved | SD decides the reference: digest from lockfile integrity (tarball sha512) vs. from installed files; owner: SD. |
| F3: The registered MCP path (`mcp enable`, OpenCode/Copilot) installs `@agdf/mcp-server@<version>` through the same `prepareMcpServerPackage` without a lockfile. | trade-off | Out of UR scope (non-goal). PRD records it as an explicit follow-up with owner and exit condition, or SD shows the shared code path covers it at no extra cost. |
| F4: Reusing `packages/mcp-server/package-lock.json` directly would pull dev dependencies; `npm ci --omit=dev` still requires a matching `package.json`. | unresolved | SD decides between a generated runtime-only lockfile plus manifest and reuse of the existing pair. |

No parallel structure is needed: lockfile, expected digest and checks extend the existing owners above.

## Architecture Impact

Relevant boundaries:

- Security/policy authority: trust in npm registry content for the committed runtime (primary trigger).
- Runtime/host contract: plugin `mcp/` payload gains generated files; provenance digests of the
  Claude and Codex runtime plugins change (`check-runtime-integrity.mjs`, profile manifests).
- Compatibility: existing prepared runtimes under `${CLAUDE_PLUGIN_DATA}` and the Codex data root were
  created without an expected digest. SD decides whether they are re-verified or replaced on the next
  start; missing fact owner: SD.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: authority_policy_security (supply-chain trust boundary for committed
  runtime code)
- rejected_alternative: structured_slice (blocked by the evidenced full-depth trigger);
  quick_task/verified_change ineligible (multi-file security change in `packages/cli/lib/**`, build
  scripts and plugin payload)
- missing_or_conflicting_facts: none decisive for the route; F2 and F4 are SD design decisions
- depth_evidence_refs: files listed under Existing Owners And Coverage

## Implementation-Preparation Brownfield Analysis

Required after `Approval: TP` (touches shared install code used by four hosts and the release payload).

## Context Graph Impact

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact

## Required Next Step

Draft the PRD at structured-delivery depth: acceptance criteria for locked-tree install, expected
digest comparison, exact-set check (F1), fail-closed error and recovery, docs/PRIVACY update; record
F3 as a decided follow-up.
