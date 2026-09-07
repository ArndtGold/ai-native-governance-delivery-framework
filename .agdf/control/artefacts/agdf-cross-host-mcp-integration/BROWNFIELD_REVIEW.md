# Brownfield Review: Cross-Host MCP Integration Contract

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_REVIEW.md`

## Run

- run_id: `agdf-cross-host-mcp-integration`
- related_ur: approved UR Revision 1
- reviewed_at: 2026-09-06
- reviewer: Codex
- baseline_commit: `d9d7be70945d4ead16de6fb12830afb7e2c3325d`
- evidence_boundary: repository source and control-state inspection, current official host
  documentation, and installed CLI help for Codex 0.145.0, Claude Code 2.1.193 and OpenCode 1.18.3;
  Copilot CLI is absent from this shell, and no host registration or configuration was changed

## Scope

Extend the completed local MCP lifecycle into one versioned four-host integration contract. Reuse
the existing server, semantic function definition, lifecycle service, runtime package owner and
three adapters. Add the missing Copilot adapter and make support, scope, effective configuration,
provenance, recovery and evidence states consistent without erasing host-native differences.

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The outcome spans four coding-agent hosts and changes capability activation,
  effective scope, trust and permission feedback, fresh-session discovery, degraded-state recovery
  and removal behavior across surfaces.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence:
  `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UX_INTENT_DEFINITION.md`

## Existing-System View

| Area | Existing owner or artefact | Current coverage | Reuse strategy | Impact |
|---|---|---|---|---|
| Semantic MCP tool | `create-agdf/lib/skill-dispatch/contract.js` | Fully owns the model-facing `agdf_dispatch` name, description and schemas. | retain unchanged | low |
| Dispatcher and governance | `create-agdf/lib/skill-dispatch/service.js`; `.agdf/control/` | Fully owns dispatch, target, gate, presentation and approval semantics. | retain unchanged | low |
| MCP process and package | `agdf-mcp-server/`; `create-agdf/lib/mcp-dispatch-runtime.js` | The SDK v2 STDIO server and exact-version runtime boundary are delivered. | retain unchanged | low |
| Lifecycle result and transaction flow | `create-agdf/lib/mcp-lifecycle/service.js` | `status`, `enable` and `disable`, runtime references, rollback and common result fields exist for three hosts. | extend | high |
| Native configuration adapters | `create-agdf/lib/mcp-lifecycle/host-config.js` | Codex TOML, Claude native CLI and OpenCode 1.x/2.x JSON variants are covered; Copilot is explicitly rejected. | extend the same adapter seam | high |
| Release capability metadata | `plugin/meta/agdf-mcp-capability.json` | Owns versioned tool, package, transport, lifecycle and honest host-support metadata. | extend as the declarative integration profile projection | medium |
| Plugin identity and generated profiles | `plugin/meta/agdf-plugin.definition.json`; package generators | Own host identities and distribution profiles, but not effective native MCP state. | retain as identity and generation input, not a second lifecycle owner | medium |
| Copilot plugin delivery | `create-agdf/lib/host-adapters/copilot/`; `create-agdf/lib/installers/`; generated Copilot plugin | Skills, hooks, installation and discovery already exist. The generated plugin intentionally contains no MCP declaration. | preserve and link to explicit MCP lifecycle | high |
| Verification | `create-agdf/scripts/mcp-lifecycle-test.js`; completed MCP direct-host and dual-protocol evidence | Lifecycle tests cover three hosts; direct functional evidence exists for Codex and OpenCode; Claude discovery is authentication-blocked; Copilot MCP has no direct evidence. | extend with a separate four-host matrix | high |

Current coverage is `partially_done`. The common server, semantic contract, package lifecycle and
three native adapters are complete. The four-host product contract, Copilot adapter, capability
projection, cross-host result parity and four-host direct evidence are not complete.

## Owner And Reuse Decision

- `create-agdf/lib/mcp-lifecycle/` remains the executable lifecycle and result-contract owner.
- `plugin/meta/agdf-mcp-capability.json` remains the release-coherent declarative capability and
  support-evidence projection. The Solution Design may normalize its host profile shape, but must
  not move effective host-state decisions into static metadata.
- `plugin/meta/agdf-plugin.definition.json` remains the host identity and distribution-profile
  source. It must not become a second runtime capability evaluator.
- `create-agdf/lib/skill-dispatch/contract.js` remains the sole semantic function-description and
  schema owner. No adapter or plugin manifest may copy and independently evolve that definition.
- Existing host-adapter and installer modules retain native installation, configuration, consent,
  update and recovery ownership. The MCP lifecycle coordinates them through their supported seams.
- The Copilot adapter should use explicit lifecycle-managed native configuration. A plugin-bundled
  MCP declaration is not the primary path because it couples MCP activation to plugin enablement,
  cannot supply one common project-first lifecycle across all four hosts, and would create a second
  status and removal owner. It remains a possible later distribution projection only after a
  separately approved need.

## Host Capability Boundary

| Surface | Observable current contract | Brownfield constraint |
|---|---|---|
| Codex | Official documentation and installed CLI support project and user configuration for local STDIO servers. | Preserve TOML ownership markers, trusted-project behavior and shared Codex configuration precedence. |
| Claude Code | Official documentation and installed CLI support local, project, user and plugin MCP sources with explicit precedence and project trust. | Preserve the existing project-targeted local scope; never confuse plugin, project and user sources or overwrite a higher-precedence foreign entry. |
| OpenCode | Installed 1.18.3 uses the flat configuration generation; current v2 documentation uses `mcp.servers` and `disabled`. | Keep version-aware 1.x/2.x projections and report the observed variant. Do not infer 2.x host behavior from fixtures. |
| GitHub Copilot | Official CLI documentation supports user configuration, repository `.mcp.json` or `.github/mcp.json`, plugin-provided MCP servers, trust and organization policy. The CLI is absent locally. | Select one lifecycle-managed source per scope, account for precedence and policy, and keep plugin presence separate from MCP registration and loaded-tool evidence. |

Protocol and configuration documentation prove compatibility candidates, not loaded AGDF support.
Every support claim needs the exact host, version, configuration source, registered entrypoint,
discovery, invocation, status, recovery and removal observations.

## Considered Paths

| Path | Decision | Reason |
|---|---|---|
| Extend the existing lifecycle and native adapter seam | selected | Reuses the delivered transaction, runtime-reference, version and result owners and adds only the missing host projection. |
| Bundle MCP automatically inside every host plugin | rejected as primary path | Codex, Claude and Copilot support plugin-provided MCP differently, OpenCode has no equivalent common bundle path, and plugin enablement would become a second activation and removal lifecycle. |
| Create a new cross-host installer or configuration file | reject | Duplicates current installer, host configuration and support-state owners. |
| Standardize all hosts on one physical configuration file | reject | Host scope, precedence, trust and configuration formats differ; a common product contract does not require identical storage. |
| Keep Copilot outside the lifecycle | reject | Leaves the accepted four-host outcome incomplete and preserves the observed discovery ambiguity. |

## Parallel-Structure And Drift Assessment

- Parallel-structure risk is high if an adapter owns another tool description, target resolver,
  approval store, support vocabulary, package installer or recovery model.
- A static host profile may declare expected capabilities and evidence state. It cannot decide the
  effective live configuration without native inspection.
- Plugin installation and MCP activation are separate effective states. Installing the AGDF Copilot
  plugin must not be presented as proof that `agdf_dispatch` is registered or loaded.
- The existing public OpenAI skills-only candidate remains outside this run and continues to reject
  MCP content.
- No SoT drift was found. The new run extends `CG-MCP-DISPATCH-ADAPTER`; it does not replace the
  completed server decision or `.agdf/control/` authority.

## OpenCode Native-Tool Relationship

`opencode-native-dispatch-tool` remains a draft, unapproved OpenCode-only permission-experience
scope. This run does not silently approve, merge or close it. The later direct OpenCode lane must
record whether MCP invocation avoids repeated general shell approval while keeping unrelated shell
and edit permissions unchanged. Positive direct evidence may justify retiring that draft at
closeout; negative or incomplete evidence leaves it separate.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: `authority_policy_security_depth`; `external_contract_depth`;
  `release_cross_host_depth`
- rejected_alternative: `quick_task` and `verified_change` are ineligible because the change alters
  public CLI behavior, host configuration and permission boundaries. `structured_slice` is rejected
  because one compatibility-sensitive lifecycle contract must coordinate four independent hosts,
  release-coherent package identity, rollback and direct support qualification.
- missing_or_conflicting_facts: none
- depth_evidence_refs: approved UR Revision 1; completed `agdf-mcp-dispatch-server` artefacts;
  `create-agdf/lib/mcp-lifecycle/`; `plugin/meta/agdf-mcp-capability.json`; current CLI and adapter
  tests; official OpenAI, Anthropic, OpenCode and GitHub documentation; installed host CLI probes

| Check ID | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One common lifecycle contract has a clear four-host acceptance boundary and preserves one MCP tool. |
| `authority_boundary` | fail | Copilot trust and organization policy plus the other hosts' native permission and precedence rules are technical authority boundaries that require explicit treatment. |
| `owner_consumer_coordination` | fail | One lifecycle and capability owner must coordinate four independently versioned host consumers and their plugin or configuration paths. |
| `full_depth_impacts_absent` | fail | Public CLI, compatibility-sensitive configuration, permission, package and cross-host release effects are present. |
| `migration_propagation_bounded` | pass | No data migration is required; AGDF-owned configuration entries and runtime references can be tested and removed transactionally. |
| `failure_recovery_local` | fail | Trust, precedence, partial registration, restart, authentication, organization policy and loaded-session recovery differ by host. |
| `independently_acceptable` | pass | The bounded outcome has independent per-host support results; one unverified host cannot fabricate parity for another. |

## Product And Design Questions

- Define the exact stable common result vocabulary while retaining host-native scope, trust,
  precedence, policy and discovery details.
- Define which Copilot configuration source implements project and user scope and how foreign or
  higher-precedence definitions are detected without destructive normalization.
- Define how plugin installation surfaces the separate optional MCP next action without automatic
  activation or an implied support claim.
- Define how static capability metadata is generated from release facts and reconciled with direct
  host evidence without becoming a live-state evaluator.
- Define transactional cleanup and runtime reference sharing when multiple hosts or scopes use the
  same exact-version server package.
- Define direct-host evidence for Copilot when the CLI or authenticated app is unavailable on the
  implementation machine.

## Context Graph Impact

- Situation: The completed MCP node gains a common four-host lifecycle profile and a Copilot
  configuration boundary while preserving its semantic and governance owners.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; related `CG-PUBLIC-PLUGIN-DISTRIBUTION` and
  `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The existing node already owns server and three-host lifecycle invariants;
  this run adds the missing Copilot adapter and common profile only after approved design and direct
  evidence.
- memory_target: `context_graph`
- memory_reason: The reusable lifecycle owner, plugin-versus-MCP activation boundary and per-host
  evidence rule extend the existing MCP architecture knowledge.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`

## Missing Evidence

- Direct Copilot CLI or app registration, discovery, invocation, status and cleanup evidence.
- Direct Claude tool invocation remains blocked by host authentication in the current environment.
- Direct OpenCode 2.x, Linux and Windows behavior.
- The final Copilot configuration and precedence design, which belongs to SD after PRD approval.

These gaps bound later support claims and test planning. They do not prevent PRD drafting because
the existing owners, external contracts and full-depth triggers are sufficient for routing.

## Required Next Step

Draft PRD Revision 1 from the approved UR, this Structured Delivery decision and the ready UX Intent
Definition. Implementation remains forbidden until PRD, SD and TP are each durably approved and
implementation-preparation Brownfield Analysis passes.

## Sources

- `https://learn.chatgpt.com/docs/extend/mcp?surface=cli`
- `https://code.claude.com/docs/en/mcp`
- `https://code.claude.com/docs/en/plugins-reference`
- `https://opencode.ai/v2/docs/mcp-servers`
- `https://opencode.ai/docs/tools/`
- `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers`
- `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference`

