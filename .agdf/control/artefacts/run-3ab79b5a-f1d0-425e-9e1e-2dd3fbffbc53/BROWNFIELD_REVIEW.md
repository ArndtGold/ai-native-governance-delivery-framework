# Brownfield Review: Plugin defaults and immediate MCP input relief

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run
- run_id: run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53
- related_ur: .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-30

## Objective

Size the approved configuration outcome: canonical versioned plugin JSON defaults, existing project overrides, one validated resolver and simultaneous reduction of suitable agent-supplied MCP inputs. A configuration-only delivery would not satisfy the approved Goal and Scope. Current target, Run, revision, presentation, digest and deliberate-action bindings remain operation-specific. G-00: target resolved, approved UR bound to this Run, selected doctor pass, no scope collision with the completed discovery-repair Run or unrelated installer changes.

## UI / UX Impact Routing
- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Preferences and optional stable inputs simplify existing operations without changing their primary actions, gate states, decision authority or fallback availability. No configuration UI or interactive preview was requested. Exact settings and diagnostics are product decisions for PRD; no new working mode is required.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View
| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Shared MCP discovery, normalization and command envelope | Core skill-dispatch/contract.js requires current-request language; control-inspect/contract.js rejects its omission; control-state/run-command-schema.js requires envelope constants, context and language | high |
| Source of truth | Project configuration, Core resources and plugin metadata | .agdf/control/config.json; packages/core/lib/resources/context.js and language-preference.js; plugins/agdf/meta/agdf-plugin.definition.json and agdf-interaction-locales.json | medium |
| Runtime path | Core resource binding and existing CLI/MCP adapter | resources/binding.js pins generated resources; packages/cli/lib/mcp-protocol-runtime.js uses trusted runtime context; packages/mcp-server/src/server.js validates discovery input before execution | medium |
| UI / UX | Existing presentation delivery and status selection | presentation.deliver route and inspect variant are existing explicit selectors; language helpers distinguish presentation and artefact languages | low |
| Persistence / data | Existing configuration and immutable presentations | control-state/control-configuration.js requires three language fields; run-presentation preserves selected language and identity; UR requires preservation of existing valid values | medium |
| Tests / QA | Existing language, dispatch, inspect, command and protocol coverage | artifact-language-test.js; fixtures/skill-dispatch-language.js; skill-dispatch-function-contract-test.js; control-inspect-test.js; Core run-command-contract-test.js; MCP contract/protocol tests | medium |
| Release / operations | Existing generated distributions and local source identity | sync-package-assets.js, core-projection.mjs and assemble-npm.mjs own propagation. Installed build 0.20.2+codex.local-05bb3d34cfa3 was observed through Codex CLI; its metadata still requires repeated stable inputs | low |

Current coverage is partially_done: project language configuration, locale fallback, target/revision binding and generators exist. A canonical JSON defaults layer, shared provenance-aware resolution and optional stable MCP inputs are not yet implemented. Reuse strategy: extend the existing Core resource/configuration owner and adapters; preserve the current exact command validators after resolution. Do not create a parallel configuration authority.

## Architecture Impact
- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Making previously required model inputs optional changes an externally consumed protocol contract. A plugin-owned defaults source must join existing version-matched resource packaging; project configuration access must follow target resolution, and malformed configuration must not be confused with missing control.
- architecture_evidence: SDK validation precedes handlers in packages/mcp-server/src/server.js; Core normalization currently requires presentation_language and working_directory. resources/context.js catches configuration errors and falls back, whereas control-configuration.js reports missing or invalid control. The accepted call set and configuration semantics therefore require explicit compatible design.
- architecture_missing_evidence: Exact optional-field inventory, defaults resource/schema placement and exposure of value provenance are deliberate later PRD/SD decisions; no missing fact prevents the evidenced external-contract depth classification.
- architecture_next_owner_and_action: prd-definition resolves the product settings/compatibility inventory; sd-definition decides integration with existing Core resources, target-first project access and the pre-validation adapter path.

## Reuse And Parallel-Structure Risk
| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Scattered presentation/configuration fallback policies | resources/context.js, language-preference.js, plugin interactions metadata and repeated MCP fields | revise | PRD defines one coherent precedence/error policy; SD extends the existing Core owner and preserves locale-registry ownership. |
| unresolved: Transport validation happens before a resolver could fill missing values | server.js registers schema validators; current Core input schemas require the values | revise | SD specifies the reduced public schema and complete validated internal envelope together; TP covers both old explicit and new omitted forms. |
| unresolved: Working-directory provenance depends on the invoking host | MCP runtime trusted context identifies surface/version; request arguments currently supply working_directory | revise | PRD/SD may remove this input only with a trustworthy execution-context source and multi-project isolation proof; otherwise preserve explicit input. Never substitute primary_target or plugin location. |
| problem: Configuration fallback must not activate missing or invalid control | control-configuration.js versus resources/context.js | revise | Preserve activation classification and immutable decision bindings; distinguish absence from invalid recognized settings with actionable diagnostics. |
| problem: A new defaults JSON may duplicate existing locale or contract constants | Plugin interactions.fallbackLocale, locale registry and RUN_COMMAND_VERSION/COOPERATIVE_ASSURANCE | warn | Define one source per value. Runtime constants are adapter-owned, not user preferences. No accepted debt or temporary second resolver is proposed. |

These are specification/design obligations, not claims of implemented fixes or accepted debt. Their owners and stages are known; none requires a competing source or a user scope decision before routing.

## Mode / Slice Decision
- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: optional MCP inputs and changed default/error resolution alter an externally consumed contract. Quick/Compact Delivery is ineligible because this introduces product/configuration semantics. Verified Change is ineligible because external interface and resource/configuration behavior change. Structured Slice is rejected because full-depth trigger 4 is evidenced, independently of file or consumer counts.
- evidence: Approved UR; Existing-System View and Architecture Impact; current canonical required fields and pre-execution SDK validation; observed installed Codex CLI tool metadata.
- transparency_note: Existing UR -> PRD -> SD -> TP -> QA -> UAT gates remain; depth is required for the affected public interface and configuration boundaries. This decision approves no implementation, Git operation, host installation or release.

## Structured Depth Evidence
- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: 4: external/public MCP input contract and compatible configuration-resolution semantics
- rejected_alternative: structured_slice fails full_depth_impacts_absent; compact alternatives are ineligible for the explicit new accepted-input/configuration behavior
- missing_or_conflicting_facts: none for route selection; later settings and technical decisions are assigned to PRD/SD above
- depth_evidence_refs: This report's Existing-System View, Architecture Impact and parameter-boundary findings; approved UR

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Plugin defaults and MCP input relief are one accepted outcome; a JSON-only intermediate delivery is excluded. |
| authority_boundary | pass | Approved UR explicitly excludes configurable target, Run, revision, digest and approval authority; existing Core owners retain validation. |
| owner_consumer_coordination | pass | Core resource/contract owners, CLI/MCP adapters, plugin metadata and generators are identified; shared contract propagation is owned in this Run. |
| full_depth_impacts_absent | fail | Omitting currently required MCP fields expands the public accepted input contract and changes visible configuration error behavior. Trigger 4 applies. |
| migration_propagation_bounded | pass | UR requires compatibility with existing valid config and explicit calls, uses existing package generators and authorizes no live configuration migration or host cutover. Exact compatibility tests belong to TP. |
| failure_recovery_local | pass | New resolution must complete before the existing operation owner executes; no new persistence/recovery journal or automatic configuration write is requested. Existing operation/replay owners remain. |
| independently_acceptable | pass | Resolution, immediate MCP input relief, documentation and focused evidence can satisfy this UR together without a prerequisite implementation in another Run. |

## PRD / SD Open Questions
| Question | Required gate | Impact |
|---|---|---|
| Which settings are configurable in this delivery, and which MCP arguments actually become omittable immediately? | PRD | revise |
| What are the default values, precedence, invalid-value behavior and compatible explicit-call behavior? | PRD | revise |
| How are defaults packaged and effective values/provenance exposed using the existing Core owner? | SD | revise |
| Which host context is trustworthy enough to supply a working directory, and what remains explicit if it is unavailable? | SD | revise |
| How do SDK discovery, Core validation, old config readers and immutable presentations remain consistent? | SD | revise |

## Context Graph Impact
- context_graph_impact: link_only
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The existing node links canonical ownership, model-visible schema/SDK parity, full follow-up bindings and task-based evaluation. PRD/SD must preserve these invariants and reassess graph updates when a new defaults resource owner is finalized; no node is created during this review.

## Next Permissible Step
- next_allowed_action: Draft a bounded PRD defining configuration eligibility and immediate MCP relief, compatibility and acceptance; resolve every before_prd product decision before presenting it.
- forbidden_until_then: Implementation, new defaults/configuration files in product sources, changing approved UR, native installation, VCS actions or release.

## Quality Outlook
- quality_outlook: Use existing language/contract/protocol suites and targeted new resolution-matrix cases. Preserve invalid-input/target/revision/replay checks; prove actual field relief and loaded-host behavior separately when claimed. No implementation tests or new native acceptance were performed for this analytical step.
