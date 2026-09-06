# Brownfield Review: Cross-Host AGDF Dispatch Through MCP

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/agdf-mcp-dispatch-server/BROWNFIELD_REVIEW.md`

## Run

- run_id: `agdf-mcp-dispatch-server`
- related_ur: approved UR Revision 1
- reviewed_at: 2026-09-06
- reviewer: Codex
- baseline_commit: `d0d4d9ff822f52521675a20bf49d7ae969978bd8`
- evidence_boundary: repository source and control-state inspection, current official host
  documentation, and installed CLI help for Codex 0.145.0, Claude Code 2.1.193 and OpenCode 1.18.3;
  no MCP server was implemented, installed, registered or invoked

## Scope

Expose the existing bounded `agdf_dispatch` capability through one standard MCP interface. Reuse
the dispatcher, target, gate, presentation, locale and approval owners. Add only the protocol,
packaging, host-registration and compatibility behavior required to make the same tool discoverable
and callable on supported coding-agent hosts.

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The capability spans multiple coding-agent hosts and changes effective tool
  availability, invocation, permission, first-visible status, terminal recovery and fallback behavior.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence:
  `.agdf/control/artefacts/agdf-mcp-dispatch-server/UX_INTENT_DEFINITION.md`

## Existing-System View

| Area | Existing owner or artefact | Current coverage | Reuse strategy | Impact |
|---|---|---|---|---|
| Semantic tool definition | `create-agdf/lib/skill-dispatch/contract.js` | `SKILL_DISPATCH_FUNCTION_DEFINITION` owns the model-facing name, purpose and strict input schema. | extend with an output contract only if design proves it necessary | low |
| Dispatcher execution | `create-agdf/lib/skill-dispatch/service.js` | Target resolution, gate evaluation, presentation, terminal action and bounded continuation already compose through one service. | call directly without another workflow engine | low |
| CLI transport | `create-agdf/lib/cli/`; `skill-dispatch/binding.js` | Versioned CLI and binding contracts already launch the dispatcher through a fixed executable and arguments. | retain for CI, diagnostics and fallback; do not make MCP shell out to reconstructed commands | medium |
| Runtime packaging | `sync-plugin-runtime.js`; `sync-package-assets.js`; `create-agdf/package.json` | Dispatcher modules are packaged, but no MCP entrypoint, MCP runtime dependency or MCP package inventory exists. | extend the existing package and generated-runtime owners | high |
| Host adapters | `create-agdf/lib/host-adapters/`; installer owners | Session command and install behavior already differ per host. No AGDF MCP registration owner exists. | add thin configuration projections under existing host-adapter and installer ownership | high |
| Codex | Installed CLI 0.145.0 and official OpenAI Docs | Local Codex supports configured STDIO and Streamable HTTP servers and shares host MCP configuration. No AGDF server is registered. | use the supported local configuration path and preserve project trust boundaries | medium |
| Claude Code | Installed CLI 2.1.193 and official Anthropic docs | Local STDIO and HTTP configuration plus project-scoped approval are present. No AGDF server is registered. | project or user registration must remain explicit and reversible | medium |
| OpenCode | Installed CLI 1.18.3 and current OpenCode docs | MCP management exists; current docs describe local STDIO tools and tool-specific permission matching. Installed-version configuration compatibility is not yet proven. | verify the installed schema before choosing the adapter; keep the custom-tool proposal separate until evidence resolves overlap | high |
| GitHub Copilot | Current official GitHub docs | Copilot CLI and cloud-agent documentation supports local/STDIO and remote MCP configuration with tool allowlists. The Copilot CLI is not installed here, and the existing AGDF Copilot surface is not direct host proof. | keep support unverified until an installed target host proves registration, discovery and invocation | high |
| Public plugin candidate | `create-agdf/lib/public-plugin/validator.js`; public distribution artefacts | The first public candidate explicitly rejects MCP configuration and remains skills-only. | preserve this boundary; any public MCP publication is a separate scope | low |
| Verification | dispatcher, binding, integrity, package and host tests | Deterministic dispatcher coverage exists. MCP handshake, discovery, call mapping, shutdown and host registration coverage do not. | extend existing contract and package suites with a distinct MCP evidence lane | high |

## Reuse And Parallel-Structure Assessment

- The MCP server is a transport adapter over `createSkillDispatchService`, not a new evaluator.
- `SKILL_DISPATCH_FUNCTION_DEFINITION` remains the semantic tool owner. MCP metadata must project from
  it rather than copy its schema into host manifests.
- Server-bound values such as surface, expected package version, skill registry and locale registry
  must come from trusted package or host configuration. They are not model inputs.
- `.agdf/control/` remains the only durable workflow and approval authority.
- Existing CLI and binding contracts remain compatibility and machine-validation paths.
- Host configuration belongs to existing host-adapter and installer owners. A second installer or
  user-consent store is prohibited.
- Parallel-structure risk becomes blocking if MCP adds another target resolver, gate table, locale
  registry, Markdown renderer, approval store, run state or host-specific semantic fork.

## Host Capability Boundary

| Surface | Current evidence | Brownfield constraint |
|---|---|---|
| Codex | Official OpenAI Docs plus installed `codex mcp --help` | Supported configuration is evidenced. AGDF registration and loaded tool behavior remain unverified. |
| Claude Code | Official Anthropic docs plus installed `claude mcp --help` | STDIO support and project approval are evidenced. AGDF registration, permission and tool behavior remain unverified. |
| OpenCode | Current official docs plus installed `opencode mcp --help` | MCP management is evidenced. Current-docs versus installed-schema compatibility and AGDF tool permissions require direct proof. |
| GitHub Copilot | Official GitHub docs only | Local and cloud MCP configuration is documented. No installed CLI or AGDF MCP observation is available on this machine. |

Protocol support does not establish AGDF support. Every future support claim requires exact package,
host version, configuration, tool discovery, invocation, result and recovery evidence.

## Considered Paths

| Path | Decision | Reason |
|---|---|---|
| Local MCP server over STDIO | leading design input | Uses the shared protocol, keeps repository access local and is documented across the relevant host families. Exact package and lifecycle design remains for SD. |
| Separate native custom tool per host | reject as primary path | Recreates host-specific contracts and does not satisfy the approved cross-host intent. It may remain a bounded fallback where MCP permission behavior is insufficient. |
| Continue only with CLI commands from skills | retain as compatibility path | Already works as deterministic infrastructure but retains model command construction and generic shell-permission friction. |
| Hosted remote MCP service | reject for this delivery | Adds authentication, repository transfer, privacy, operations and remote failure boundaries excluded by the UR. |
| Replace existing dispatcher with MCP-owned logic | reject | Creates a second governance owner and breaks reuse-before-create. |

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: `authority_policy_security_depth`; `architecture_runtime_depth`;
  `external_contract_depth`; `release_cross_host_depth`
- rejected_alternative: `structured_slice`, because a new compatibility-sensitive tool protocol,
  local process boundary, host permissions, package entrypoint and coordinated activation across
  several hosts require explicit design, test, rollback and release treatment.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: approved UR Revision 1; semantic contract and dispatcher service; runtime and
  package generators; host adapters and installers; public-plugin no-MCP validator; installed CLI
  help; official OpenAI, Anthropic, OpenCode, GitHub and MCP documentation.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | The first outcome is one discoverable, read-only `agdf_dispatch` tool with a terminal-or-continuation result. |
| authority_boundary | `fail` | MCP tool registration and host permission introduce a new trusted execution boundary even though AGDF approval authority remains unchanged. |
| owner_consumer_coordination | `fail` | One package and semantic owner must coordinate Codex, Claude Code, OpenCode and Copilot registration and evidence. |
| full_depth_impacts_absent | `fail` | Runtime, public tool schema, host permissions, packaging and cross-host release effects are present. |
| migration_propagation_bounded | `pass` | No data migration is planned; generated package and configuration projections can be versioned, tested and removed. |
| failure_recovery_local | `fail` | Startup, version, configuration and permission recovery differ across installed hosts and operating systems. |
| independently_acceptable | `pass` | The first tool has a self-contained acceptance boundary, with unsupported hosts allowed to retain the existing compatible path. |

## Product And Design Questions

- Exact MCP protocol and SDK version ownership in a currently dependency-light package.
- Fixed package entrypoint and provenance check for generated and installed layouts.
- Server-owned injection of surface, expected version, skill and locale registries.
- Output schema, controlled AGDF outcomes and MCP protocol-error separation.
- Host registration scope, explicit consent, update, disable and rollback per surface.
- Tool permission behavior and whether it removes generic shell prompts on each installed host.
- Cold start, warm call, timeout, cancellation, output-size and shutdown behavior.
- Native Windows and Linux command, path and process behavior.
- Whether proven MCP behavior fully satisfies the separate OpenCode-native dispatch need.

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: proposed `CG-MCP-DISPATCH-ADAPTER`; related
  `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The approved intent introduces a reusable protocol and process boundary
  between host tool invocation and the existing dispatcher. Final ownership and failure rules require
  approved design before graph curation.

## Transparency

Quick Task and Verified Change are ineligible because the work adds a tool protocol, runtime process,
permission boundary, package entrypoint and cross-host activation behavior. Structured Slice is too
shallow because four full-depth triggers are evidenced. Structured Delivery with UX Intent, PRD, SD
and TP is required before implementation.

## Missing Evidence

- Direct AGDF MCP registration and loaded invocation on every claimed host.
- Installed GitHub Copilot target-host evidence.
- Native Windows and Linux execution evidence.
- Selected MCP runtime dependency and package ownership design.

## Required Next Step

Review PRD Revision 1 after consuming the ready UX Intent Definition. Implementation remains
forbidden until PRD, SD and TP are each durably approved and implementation-preparation Brownfield
Analysis passes.

## Sources

- `https://learn.chatgpt.com/docs/extend/mcp?surface=cli`
- `https://docs.anthropic.com/en/docs/claude-code/mcp`
- `https://opencode.ai/v2/docs/mcp-servers`
- `https://opencode.ai/docs/tools/`
- `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers`
- `https://modelcontextprotocol.io/specification/2025-11-25/`
