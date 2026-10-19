# Brownfield Review: Cockpit as an AGDF plugin feature

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: agdf-cockpit-plugin-integration-20261016-01
- related_ur: .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-16

## Objective

Size the approved outcome: a Codex AGDF plugin installation provides the existing Cockpit without separate setup, manages compatible assets and lifecycle, and safely replaces an owned local connection. Preserve the visible name Cockpit, canonical read/context boundaries and explicit project binding.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The activation and recovery journey changes materially from a separately configured, directory-bound server to a plugin-provided capability. Project binding, duplicate/legacy handling and truthful effective-state feedback must be explicit even though the Cockpit's content views are reused.
- ux_intent_definition_required: yes
- ux_intent_definition_result: pending

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; docs/architecture/06-agdf-cockpit.md | Existing Codex workflow explicitly uses a separate local connection; source and live-host evidence remain distinct | medium |
| Source of truth | plugins/agdf/; packages/core/lib/runtime/plugin-provenance.js; canonical .agdf/control | renderCodexPluginMcpConfig owns the single agdf declaration and normalization for installed absolute paths | medium |
| Runtime path | packages/cli/lib/mcp-lifecycle/plugin-runtime.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/main.js | Codex launcher takes surface/data only; createMcpCockpitRuntime currently requires an absolute directory at startup; default runtime already composes a Decision App | high |
| UI / UX | packages/control-ui/; packages/core/lib/control-inspect/cockpit-contract.js and cockpit-session.js | Existing render/read tools, UI URI, read sessions and checked context journey can be reused | medium |
| Persistence / data | packages/cli/lib/mcp-lifecycle/service.js and adapters/codex.js | Role-specific ownership, runtime references and transactions exist; foreign configuration must survive; no control schema change is requested | medium |
| Tests / QA | packages/cli/scripts/plugin-mcp-cockpit-variant-test.js; codex-cockpit-config-test.js; cockpit-mcp-test.js; packages/mcp-server/test/cockpit-gating.test.js | Existing tests intentionally preserve separate registrations and establish Claude-only plugin variant behavior | medium |
| Release / operations | scripts/sync-package-assets.js; scripts/sync-plugin-mcp.js; scripts/assemble-npm.mjs | Only the Claude plugin build passes cockpitUi; local Codex cockpit assembly is an explicit separate profile; exact-byte UI and runtime provenance already exist | high |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: A globally installed Codex plugin must offer a Cockpit currently bound to one directory at startup. Runtime composition, externally consumed tool/declaration behavior, payload identity and a coordinated legacy-registration cutover are affected. This is more than adding a display name to a manifest.
- architecture_evidence: scripts/sync-plugin-mcp.js; scripts/sync-package-assets.js; packages/core/lib/runtime/plugin-provenance.js; packages/cli/lib/mcp-lifecycle/plugin-runtime.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/main.js; packages/cli/lib/mcp-lifecycle/service.js.
- architecture_missing_evidence: The exact project-binding and runtime-composition design must be decided by SD; native acceptance requires the installed final Codex tuple. These are bounded later design and verification obligations, not missing facts about whether the changed boundaries exist.
- architecture_next_owner_and_action: Existing Core target/read-session owners and CLI runtime/lifecycle owners must define one compatible composition and cutover in SD after the product states are fixed in PRD.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Directory-bound Cockpit cannot simply be declared globally | createMcpCockpitRuntime requires cockpitDir; Codex launcher has no project argument | warn | SD must establish checked per-project binding using existing target and session owners; do not infer a project from cwd |
| problem: Cockpit assets are intentionally absent from normal Codex plugin generation | sync-package-assets passes cockpitUi only for Claude; assembly uses a separate codex-cockpit profile | warn | Extend the existing build/provenance pipeline and test exact installed UI bytes; do not introduce a parallel bundle builder |
| problem: Existing local connection and plugin feature have distinct lifecycles | service.js role cockpit, runtime references, codexAdapter and SCN-032 | warn | PRD specifies owned/foreign/duplicate outcomes; SD assigns transition and rollback to existing lifecycle transactions |
| problem: Reusing the read-tool name may collide with the regular server's bounded Cockpit reader | Existing regular and Cockpit surfaces have different target/session contracts | warn | SD must choose an explicit compatible composition with one semantic owner per tool and no silent schema replacement |
| problem: Shared-checkout operations removed this Run's uncommitted intake files | RUN_RECOVERY.md and exact restored original snapshot | warn | Preserve recovery archive outside the checkout; isolate later source/build verification; do not treat chat isolation as checkout isolation |

No deliberate debt exception or second owner is accepted by this review. These findings route decisions to the existing product/design owners; they do not authorize implementation.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth and release_cross_host_depth: plugin-provided tool/runtime behavior and a coordinated transition from an independently registered server affect compatibility and rollback. Quick Task and Verified Change are ineligible because activation, runtime composition and lifecycle behavior change. Reject structured_slice because the installed-plugin/local-registration cutover and externally consumed target/tool contract cannot be shown absent.
- evidence: This review's Existing-System View and Structured Depth Evidence; approved UR; RUN_RECOVERY.md.
- transparency_note: Reuse the existing Cockpit and keep source changes scoped. Full depth refers to affected runtime, installation, migration and evidence boundaries; it does not add other hosts or new Cockpit features. UX Intent Definition precedes PRD readiness because activation/recovery semantics change.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: externally consumed Codex plugin/tool integration changes; compatible runtime/UI distribution; coordinated installed-plugin and legacy local-registration cutover with rollback.
- rejected_alternative: structured_slice; full_depth_impacts_absent fails because these changes are explicit approved requirements and present runtime constraints, not an owner/file-count heuristic.
- missing_or_conflicting_facts: none decisive for route selection; later project-binding, migration design and native evidence remain named obligations.
- depth_evidence_refs: scripts/sync-plugin-mcp.js; scripts/sync-package-assets.js; scripts/assemble-npm.mjs; packages/core/lib/runtime/plugin-provenance.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/cli/lib/mcp-lifecycle/plugin-runtime.js; packages/cli/lib/mcp-lifecycle/service.js; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: install AGDF and open Cockpit without separate setup |
| authority_boundary | pass | Existing Core control/read owners remain authoritative; no new approval or filesystem permission is requested |
| owner_consumer_coordination | fail | Plugin declaration, installed runtime and legacy local registration require coordinated compatibility handling |
| full_depth_impacts_absent | fail | Tool/project contract, plugin payload and installed-registration cutover have evidenced effects |
| migration_propagation_bounded | pass | First surface is Codex; only positively owned legacy entries are eligible; foreign settings remain outside mutation scope |
| failure_recovery_local | fail | Recovery spans the installed plugin/runtime and project configuration, so it is not confined to a manifest/UI edit |
| independently_acceptable | pass | Clean install, existing-setup transition and actual Codex opening can be accepted for this scope independently of Claude work |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which visible states explain project-required, ready, update failure and duplicate/foreign local connection? | PRD | revise |
| Which existing target/session API binds a globally provided Cockpit, and how does it coexist with existing bounded readers? | SD | revise |
| How are compatible UI/runtime assets generated, digested, installed and updated through existing owners? | SD | revise |
| How does verified replacement precede legacy retirement, including native reconnect and local rollback? | SD | revise |
| Which automated and installed/native scenarios demonstrate clean installation, migration, lifecycle and preserved control/read invariants? | TP | revise |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md; docs/architecture/06-agdf-cockpit.md; BROWNFIELD_REVIEW.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: link
- context_graph_gate_effect: warning
- context_graph_evidence: Existing Cockpit architecture and session evidence remain applicable within their original limits. Link this integration's final evidence at closeout; do not rewrite historical host qualification or create an alternate graph.
- memory_target: scope_artifact
- memory_reason: Current integration findings and operational recovery belong to this Run; final reusable integration knowledge may be linked at closeout.
- memory_refs: BROWNFIELD_REVIEW.md; RUN_RECOVERY.md

## Next Permissible Step

- next_allowed_action: Record this review and route together; complete the required UX Intent Definition, then author the bound PRD and present it for deliberate approval.
- forbidden_until_then: No SD/TP/implementation, active-installation replacement or legacy retirement before applicable later gates. UR approval covers the current analysis and product preparation only.

## Quality Outlook

- quality_outlook: Recovery checks and route evidence are established. Product readiness, design, tests, actual installed Codex behavior, QA and UAT remain pending. No integration completion is claimed.
