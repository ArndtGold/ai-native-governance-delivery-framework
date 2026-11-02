# Brownfield Review: Portable AGDF Plugin and Package Structure

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Decision: pass (sizing and routing only)

## Run

- run_id: agdf-portable-plugin-package-structure-20261001-01
- related_ur: .agdf/control/artefacts/agdf-portable-plugin-package-structure-20261001-01/UR.md
- current_gate: Brownfield Review after revision-bound UR approval
- reviewer: Codex
- reviewed_at: 2026-10-01

## Objective

Route the approved portable-plugin organization scope using existing owners. First normalize the
portable plugin contract and its derived host/profile formats; subsequently implement only runtime
boundaries justified by consumers and dependency direction. The example repository layout is not
an approved design. Existing independent CLI and MCP packages are retained as evidence, not recreated.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Package discovery and maintainer navigation change; the approved scope preserves activation, consent, supported host capabilities and recovery semantics. No new end-user UI or ambiguous action semantics.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable; clear low-impact semantics are defined directly in PRD.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and canonical plugin definition | UR scope/non-goals; plugin/meta/agdf-plugin.definition.json | low: clearer packaging with preserved capability profiles |
| Source of truth | Plugin definition, skills, contracts, templates; registered owners | .agdf/control/SOT_REGISTRY.md; plugin/meta/; plugin/skills/; plugin/control/templates/ | high: any movement must relocate owners and update derivations together |
| Runtime path | create-agdf runtime/core, thin CLI and MCP adapter | create-agdf/package.json exports; agdf/package.json and agdf-mcp-server/package.json exact create-agdf dependency | high: extraction affects offline bundles and version-matched consumers |
| UI / UX | Host-native discovery and existing installer/status presentation | manifest.js profile-specific interface; sync-package-assets.js host projections | low: preserve capabilities and state presentation; no panel |
| Persistence / data | Repository-local sealed run state and approval writer | create-agdf/lib/control-state/run-steps.js; approved UR invariant | none: no state migration or new approval owner is requested |
| Tests / QA | Existing profile, package, provenance and installation checks | create-agdf/package.json test:public-plugin, test:package-contents, test:local-marketplace, test:runtime-check-consent; agdf-mcp-server/package.json protocol/provenance/safety tests | high: old-format assumptions require deliberate adaptation |
| Release / operations | Existing distribution builder and package versions | sync-package-assets.js; sync-plugin-runtime.js; sync-plugin-mcp.js; public-plugin/builder.js | high: source, generated, runtime, public and installed profiles differ |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Root portable identity/schema and optional-component discovery are externally consumed contracts; moving canonical sources or extracting runtime affects host generation and installed provenance.
- architecture_evidence: create-agdf/lib/public-plugin/manifest.js and validator.js use legacy Codex fields and manifest location; builder.js emits .codex-plugin/plugin.json; sync-package-assets.js derives local/runtime/public and Copilot/OpenCode projections; sync-plugin-mcp.js produces host-specific transport launchers.
- architecture_missing_evidence: Exact portable field mapping, host-version acceptance, complete path consumers and extraction cost are SD/TP investigations owned by the existing package/runtime maintainer. These do not leave the full-depth routing trigger uncertain.
- architecture_next_owner_and_action: Arndt Gold as maintainer; SD must map old and new contracts and choose canonical source organization; TP must enumerate affected consumers and validate rollback before implementation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Existing Codex projector uses legacy manifest shape | public-plugin/manifest.js: skills, interface, mcpServers; public-plugin/validator.js: .codex-plugin path | warn | Existing manifest/build owner extends projection for portable identity and OpenAI extensions; legacy output remains derived only when required |
| problem: Runtime is hosted inside installation package despite independent entry-point packages | create-agdf/package.json exports; agdf/package.json and agdf-mcp-server/package.json dependencies | warn | Existing runtime/package owner maps dependency direction in SD; retain current npm identities unless approved compatibility design proves a change necessary |
| unresolved: Direct portable discovery can accidentally activate optional MCP or hooks | sync-package-assets.js deliberately omits source .mcp.json; sync-plugin-mcp.js host-specific paths | warn | SD profile mapping must preserve explicit source/runtime/public capability selection and consent; packaging must not silently add auto-discovered optional files |
| problem: Source and generated paths are embedded in builders and skill references | public-plugin/builder.js pluginRoot; sync-package-assets.js source and output roots; validator.js relative meta reference resolution | warn | Existing builders derive paths from the chosen canonical root and validate actual distributed resources; avoid hand-maintained duplicate trees |
| unresolved: Related active runs touch shared owners | UR lists public distribution, payload cleanup and host compatibility scopes | warn | Before implementation, compare current revisions/diffs through existing Brownfield preparation; reuse evidence with limits, never approvals |
| problem: Workspace already contains unrelated deletion and duplicate untracked files | git status on 2026-10-01 | warn | Preserve these files; TP/pre-implementation review identifies baseline interference before broad builds |

No deliberate additional or retained debt is accepted by this review. Keeping compatibility
projections from one owner is a migration requirement; extraction choices remain explicit SD decisions.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth; portable root identity and component discovery change a distributed integration contract; release_cross_host_depth also applies to runtime and supported host projections.
- evidence: approved UR scope and acceptance signals; manifest.js; validator.js; public-plugin/builder.js; sync-package-assets.js; the three package manifests.
- transparency_note: Quick Task and Verified Change cannot cover the changed public package contract. A plugin-first stage can be small, but remains within full Structured Delivery because that stage changes an external format. File or owner counts do not determine depth.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: externally consumed portable package format/component discovery; cross-host distribution and migration compatibility
- rejected_alternative: structured_slice; full_depth_impacts_absent fails because the first stage itself changes the external manifest contract. Quick/Verified paths were rejected for the same material scope, not for file count.
- missing_or_conflicting_facts: none decisive for route selection; technical mapping/host proof remain owned downstream
- depth_evidence_refs: UR.md sections 3/5/6; create-agdf/lib/public-plugin/manifest.js; validator.js; builder.js; sync-package-assets.js; package manifests

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR: portable installable plugin with explicit ownership and staged responsibilities |
| authority_boundary | pass | UR explicitly preserves target-local control, gate semantics and revision-bound approval; no new policy source |
| owner_consumer_coordination | pass | Existing definition/build/runtime owners and CLI/MCP/host consumers identified above; related-run reconciliation assigned before implementation |
| full_depth_impacts_absent | fail | Root manifest, portable MCP format and optional discovery are external integration contracts |
| migration_propagation_bounded | fail | Existing source/runtime/public and four host surfaces require coordinated compatibility mapping, not a single local consumer update |
| failure_recovery_local | fail | Broken bundled paths/provenance can affect installed host startup; build-only rollback does not prove host recovery |
| independently_acceptable | pass | Portable-format first stage has UR acceptance signals and can be accepted separately when profile/compatibility evidence is complete |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Is first stage portable-format alignment with existing capabilities and no active install/publication? Resolved by approved UR. | PRD | warn |
| Which canonical source root and package boundaries reduce actual dependency coupling? | SD | warn |
| Which portable fields and overlay precedence preserve each supported host profile? | SD | warn |
| Which exact host versions, package fixtures and migration rollback provide adequate evidence? | TP | warn |
| How do current related-run revisions and unrelated workspace changes constrain shared-owner edits? | TP | warn |

## Context Graph Impact

- Situation: Existing distribution and local dispatch invariants already cover the boundaries; the new format and extraction decisions are not implemented facts.
- memory_target: scope_artifact
- memory_reason: Keep this run's routing and proposed migration in its own artefacts until design and implementation establish reusable decisions.
- memory_refs: This review; .agdf/control/CONTEXT_GRAPH.md#cg-public-plugin-distribution; .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter
- context_graph_impact: link_only
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-MCP-DISPATCH-ADAPTER in .agdf/control/CONTEXT_GRAPH.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Both existing nodes are linked above for identity/profile separation and version-matched local dispatch. No graph claim is updated to assert future portable support. Reassess graph/SoT changes after SD and at closeout.

## Next Permissible Step

- next_allowed_action: Record this review and structured_delivery route using revision-bound run-step, then gate-check continuation prepares PRD and presents it.
- forbidden_until_then: No SD/TP drafting ahead of their gates, implementation, host cache installation, release/publication or VCS action.

## Quality Outlook

Reuse strategy: extend current projectors/builders and refactor only evidenced dependency seams.
Current coverage: partially_done; identity, profiles, resource validation and separate CLI/MCP
entry points exist, while portable root-manifest generation is not established by current source.
The sizing review passes; no tests or fresh-host support are claimed. QA later needs schema and
negative-profile checks, packed resource resolution, migration/provenance/consent regressions,
and separately labelled installed/fresh-host evidence.

