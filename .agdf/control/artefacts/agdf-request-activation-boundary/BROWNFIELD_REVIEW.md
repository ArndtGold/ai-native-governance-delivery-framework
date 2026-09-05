# Brownfield Review: Request-Intent Activation Boundary

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-request-activation-boundary`
- related_ur: `.agdf/control/artefacts/agdf-request-activation-boundary/UR.md`
- current_gate: `PRD`
- reviewer: Codex, with independent router, dispatcher and hook audits
- reviewed_at: 2026-09-04

## Objective

Size and route the approved change that makes AGDF applicability depend on the effect requested by
the user. Ordinary read-only work must stay outside AGDF, while delivery intent, explicit AGDF
operations and unambiguous active-run continuations must preserve the existing governed path.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The change alters silent versus visible activation, status and approval
  presentation, ambiguity handling, recovery and continuation behavior across Codex, Claude Code,
  GitHub Copilot and OpenCode.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

The linked UX Intent Definition defines the observable modes and recovery behavior without granting
product or implementation authority.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/agdf-agent-router.md`; `plugin/meta/contracts/modes.md`; completed `installer-output-parity` decisions | The router excludes questions and reviews from automatic `gate-check`, while Quick Task includes them and the earlier run requires a visible read-only orientation. | `high` |
| Source of truth | Router, skill frontmatter and `plugin/meta/agdf-plugin.definition.json`; `.agdf/control/SOT_REGISTRY.md` | Activation language is distributed across inventory, routing and host guidance; no single request-applicability owner exists. | `high` |
| Runtime path | `create-agdf/lib/skill-dispatch/contract.js`; `service.js`; task-target and control evaluators | Dispatcher v1 correctly starts after skill selection but has no pre-target abstention; target and control evaluation currently follow every dispatched selection. | `high` |
| UI / UX | `plugin/meta/contracts/interaction.md`; locale registry; interaction renderer | Existing cards and exact approvals remain reusable after legitimate activation, but ordinary read-only visibility is intentionally superseded. | `high` |
| Persistence / data | `.agdf/control/`; existing `init`, `status`, doctor and gate-check lifecycle paths | No new user-data schema or approval store is required; request class must select the correct existing lifecycle behavior before control evaluation. | `low` |
| Tests / QA | routing test, skill-dispatch test, interaction tests, skill-eval corpus, profile tests | Existing tests assume a selected skill or assert structure; no semantic no-skill, mixed-intent or continuation corpus exists. | `high` |
| Release / operations | `sync-plugin-runtime.js`; `sync-package-assets.js`; public-plugin builder; OpenCode adapter | One source change is projected to four host surfaces, and loaded-host behavior requires separate fresh-session evidence. | `high` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A second SessionStart or per-prompt hook would become another activation-policy owner. | Current hooks and generated bindings already duplicate broad `matching_delivery_intent` guidance. | `block` | Create one canonical request-activation contract; hooks only transport capability or later enforce a non-classifying mutation backstop. |
| Dispatcher v1 is a public post-selection orchestration contract. | `contract_version: 1`; closed input and outcome set; active dispatcher run is independently at QA revise. | `revise` | Keep v1 unchanged unless approved SD proves a code-owned backstop necessary; any new field or outcome must be additive and versioned. |
| Existing read-only orientation conflicts with the approved UR. | `installer-output-parity` UR and SD require one visible no-run/no-approval sentence for ordinary read-only work. | `revise` | Supersede that behavior only for ordinary non-AGDF requests; preserve explicit AGDF status and lifecycle presentation. |
| Generated host assets can become parallel sources. | Runtime profiles and OpenCode guidance are generated or adapter-specific consumers. | `block` | Change canonical owners and regenerate; do not edit generated outputs as policy owners. |
| Active-run context can leak into unrelated follow-up questions. | Current continuation semantics revalidate target but do not own a request-applicability lifetime. | `revise` | Define request-scoped continuation entry and exit rules in PRD. |
| Missing control currently collapses distinct request classes into one UR response. | `gate-check.js` maps `AGDF_CONTROL_FILE_MISSING` to the minimal UR flow. | `revise` | Route explicit lifecycle, explicit status and delivery intake before generic control evaluation; ordinary read-only abstains. |
| Repository tests can be mistaken for loaded-host proof. | Current profile tests verify bytes, structure and deterministic projection only. | `warn` | Keep source, generated package, installed root and fresh-session host evidence separate. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `authority_policy_security_depth` is decisive because this run defines when AGDF
  governance becomes applicable. `architecture_runtime_depth` and `release_cross_host_depth` also
  apply because the new boundary precedes target/dispatch/control and must remain equivalent across
  four independently loaded host surfaces. Structured Slice is rejected because those effects are
  not bounded to one reversible owner or one local runtime path.
- evidence: Approved UR; canonical router, modes, interaction, target, dispatcher, lifecycle,
  generation and test owners; completed `installer-output-parity`; active
  `cross-surface-executable-skill-dispatcher` scope.
- transparency_note: The review selects depth and reuse boundaries only. It does not approve the
  product contract, choose a technical implementation or authorize code changes.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `authority_policy_security_depth`
- decisive_full_depth_triggers: `authority_policy_security_depth`, `architecture_runtime_depth`,
  `release_cross_host_depth`
- rejected_alternative: `structured_slice`; it would understate the new governance applicability
  authority, ordering change before target/control, coordinated host projection and separate
  rollout/rollback evidence.
- missing_or_conflicting_facts: none for the depth decision; public dispatcher compatibility remains
  a bounded SD decision and must not be changed implicitly.
- depth_evidence_refs: `plugin/meta/agdf-agent-router.md`; `plugin/meta/contracts/modes.md`;
  `plugin/meta/contracts/task-target-resolution.md`; `plugin/meta/contracts/interaction.md`;
  `create-agdf/lib/skill-dispatch/`; `create-agdf/scripts/sync-plugin-runtime.js`;
  `.agdf/control/artefacts/installer-output-parity/`;
  `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One approved activation and abstention boundary has explicit positive, negative, mixed and continuation acceptance signals. |
| authority_boundary | `fail` | The change creates a normative boundary for when AGDF governance may become active. |
| owner_consumer_coordination | `fail` | Router, skill discovery, session guidance, dispatcher boundary and four host projections must consume one rule. |
| full_depth_impacts_absent | `fail` | Policy, runtime ordering and cross-host release effects are present. |
| migration_propagation_bounded | `fail` | Compatibility with dispatcher v1 and installed profile propagation still requires coordinated SD and rollout evidence. |
| failure_recovery_local | `fail` | False activation, rollback and fresh-session recovery span generated and loaded host profiles. |
| independently_acceptable | `pass` | The activation boundary has an independently testable user outcome, but the full-depth triggers still require coordinated delivery. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What are the exact request classes, their precedence and their visible or silent outcomes? | `PRD` | `revise` |
| When does implementation advice remain read-only, and when does a requested formal delivery artefact activate AGDF? | `PRD` | `revise` |
| Which prior visible read-only behavior is superseded, and which explicit AGDF read-only operations remain visible? | `PRD` | `revise` |
| When is an active-run continuation unambiguous, and which events end that binding? | `PRD` | `revise` |
| How do explicit status and control-initialization requests behave when control state is absent? | `PRD` | `revise` |
| Where does the canonical activation contract live and how is it consumed before task-target resolution? | `SD` | `revise` |
| How can false-positive skill discovery abstain before dispatcher v1 without creating a second classifier? | `SD` | `revise` |
| Is a versioned executable backstop required, and how is v1 compatibility preserved if so? | `SD` | `revise` |
| How are canonical changes generated, rolled back and evidenced separately on every supported host? | `SD` | `warn` |

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: proposed `CG-REQUEST-ACTIVATION-AUTHORITY`;
  `CG-TASK-TARGET-AUTHORITY`; `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Request applicability is a new reusable authority before task-target,
  dispatch and interaction owners. Create the node and update those relationships only after an
  approved SD fixes the design; until then the gap is explicit and non-authorizing.

## Next Permissible Step

- next_allowed_action: Draft the PRD from the approved UR and ready UX Intent Definition, then
  request exact `Approval: PRD`.
- forbidden_until_then: Solution Design, Task Plan, implementation, hook changes, dispatcher changes,
  generated-profile changes, QA, UAT, release and Context Graph reconciliation.

## Quality Outlook

- quality_outlook: Preserve one activation owner, keep dispatcher v1 and post-activation authorities
  stable by default, and require semantic negative routing plus separate fresh-host evidence.
