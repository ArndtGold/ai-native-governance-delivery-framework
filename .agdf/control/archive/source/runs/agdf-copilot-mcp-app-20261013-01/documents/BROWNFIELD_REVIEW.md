# Brownfield Review: Plugin-Owned Canonical Artefact Templates

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

- decision: pass

## Run

- run_id: agdf-copilot-mcp-app-20261013-01
- related_ur: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/UR.md`
- current_gate: Brownfield Review
- reviewer: Copilot delivery agent
- reviewed_at: 2026-10-13

## Objective

Size and route the approved change that makes the installed, version-matched AGDF plugin the sole authoring source for the nine canonical artefact templates while preserving existing scaffold writers, host behavior and repository state.

- current_coverage: `partially_done`
- reuse_strategy: `extend`
- minimal_clean_path: Generalize the existing UR template resolver into one shared validated resource owner, then add its absolute result to existing authoring continuations or their existing owner without creating another dispatch surface.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The change affects internal authoring resource provenance and continuation metadata only; no user-facing capability, decision, visible state, feedback or recovery semantics change.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and current skill contracts | `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/UR.md`; `plugins/agdf/meta/contracts/*.md` | `low` |
| Source of truth | Plugin resource binding and control templates | `packages/core/lib/resources/context.js`; `packages/core/lib/resources/binding.js`; `plugins/agdf/control/templates/artefacts/` | `medium` |
| Runtime path | Core projection and plugin MCP launcher | `scripts/core-projection.mjs`; `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` | `medium` |
| UI / UX | Existing Copilot and Codex MCP presentation paths | `packages/core/lib/skill-dispatch/service.js`; `packages/control-ui/` remains unchanged | `none` |
| Persistence / data | Canonical run writers and repository scaffold | `packages/core/lib/control-state/run-steps.js`; `.agdf/control/templates/` remains scaffold-owned | `none` |
| Tests / QA | Dispatch, stdio, payload, runtime and package tests | `packages/cli/scripts/skill-dispatch-test.js`; `packages/mcp-server/test/continuation.test.js`; `packages/cli/scripts/plugin-mcp-runtime-test.js`; `packages/cli/scripts/copilot-profile-test.js`; `packages/cli/scripts/package-contents-test.js` | `medium` |
| Release / operations | Deterministic package asset projection | `scripts/sync-package-assets.js`; `plugins/agdf/meta/copilot-payload-baseline.json` | `low` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `low`
- architecture_reason: The change moves canonical authoring-template authority across an existing resource boundary from repository-style scaffold paths to the trusted installed-plugin root and adds provenance metadata to existing dispatch continuations. It does not add a new service, protocol, persistence model or execution owner.
- architecture_evidence: `packages/core/lib/resources/context.js`, `scripts/core-projection.mjs`, `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`, and `packages/core/lib/skill-dispatch/service.js` already own resource identity, host projection, trusted plugin-root propagation and continuation composition.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: Core skill dispatch extends the existing resource context and continuation builders; CLI packaging/runtime tests verify isolation and host compatibility.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: UR-only template resolution would encourage per-skill resolvers | `packages/core/lib/skill-dispatch/delivery-intake.js` currently exports `resolveUrTemplatePath()` while PRD, SD and generic continuations have no shared template owner | `revise` | Extract one typed allow-listed resolver under the existing Core resource owner and reuse it everywhere |
| problem: generated or repository scaffold paths could become an implicit fallback | `packages/core/lib/resources/context.js` and projected bindings currently permit a generated `.agdf/control/templates/` default | `revise` | Bind authoring to the trusted plugin root and fail closed when it is absent, missing or unsafe |
| problem: direct and generic authoring continuations have different construction sites | `delivery-intake.js`, `prd-definition.js`, `sd-definition.js` and `skill-dispatch/service.js` own existing continuations | `warn` | Add `template_path` at each existing owner; do not introduce a parallel dispatcher |
| problem: Verified Change has no direct authoring continuation | `packages/core/lib/control-evaluation/gate-policy.js`, `packages/core/lib/control-evaluation/verified-change.js`, `plugins/agdf/meta/contracts/modes.md` own compact-path guidance and validation | `warn` | Integrate plugin-template provenance at the existing gate-check/Verified Change owner rather than adding a new skill |
| Package copies can drift if projection is incomplete | `scripts/sync-package-assets.js` already recursively copies `plugins/agdf/control/**` and inventory tests validate source mapping | `none` | Extend tests from UR-only assertions to all nine canonical artefact templates |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — one coherent internal provenance outcome spans existing Core resource, dispatch, runtime projection and packaging owners, but introduces no new authority, persistence, public CLI behavior, migration, rollout or external cutover. Quick Task is rejected because formal runtime and contract artefacts are affected; Verified Change is rejected because multiple existing owners and derived package paths are involved and candidate paths already contain pre-existing edits.
- evidence: Approved UR; current partial implementation in `packages/core/lib/resources/`, `packages/core/lib/skill-dispatch/delivery-intake.js`, `scripts/core-projection.mjs`, `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`, and focused package/runtime tests; complete bounded-slice checks below.
- transparency_note: PRD, SD and TP should remain proportional to the bounded internal contract change. Implementation is not permitted until those gates and implementation-preparation Brownfield Analysis are complete.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: `none`
- rejected_alternative: `structured_delivery` rejected because no authority/security, non-local runtime recovery, persistence/migration, external/public contract break, release rollout or unbounded owner/consumer coordination trigger is evidenced. `quick_task` and `verified_change` are rejected for the reasons recorded in the Mode / Slice Decision.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: Approved UR; `packages/core/lib/resources/context.js`; `packages/core/lib/skill-dispatch/`; `scripts/core-projection.mjs`; `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`; `scripts/sync-package-assets.js`; focused CLI/MCP tests.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: every in-scope authoring owner receives a validated absolute path to its plugin-owned canonical template, with explicit fail-closed behavior |
| authority_boundary | `pass` | Installed plugin remains the sole authoring authority; repository scaffold writers and gate authority are unchanged |
| owner_consumer_coordination | `pass` | Core resource context, existing continuation builders, plugin launcher and package projection are all repository-owned and can change compatibly in one slice |
| full_depth_impacts_absent | `pass` | No security/permission, persistence/data, external API, public CLI, deployment, feature-flag or coordinated host activation change is required |
| migration_propagation_bounded | `pass` | Propagation is deterministic through existing package projection; no data migration exists; changes are additive and locally reversible |
| failure_recovery_local | `pass` | Missing, unsupported or unsafe template resources fail before authoring and do not mutate repository control; recovery is reinstalling or repairing the matched plugin |
| independently_acceptable | `pass` | Acceptance is independently measurable across exactly nine templates, six excluded scaffold files, existing continuations, package contents, runtime isolation and Codex regression behavior |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Define the exact shared template identifier type, error taxonomy and continuation-to-template mapping without changing existing authoring ownership | `PRD` | `warn` |
| Specify path containment and plugin-root validation, including behavior when the trusted root is unavailable | `SD` | `warn` |
| Enumerate focused validation commands for all continuation, package and host surfaces | `TP` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: `none`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The change clarifies an existing runtime/resource ownership boundary in code and contracts; it does not introduce a durable cross-run domain concept or new curated context relationship.

## Next Permissible Step

- next_allowed_action: Draft the proportional PRD for the bounded structured slice and request `Approval: PRD`.
- forbidden_until_then: SD, TP, implementation-preparation Brownfield Analysis, implementation, QA and release remain forbidden.

## Quality Outlook

- quality_outlook: Focused dispatch, resolver safety, plugin runtime isolation, Copilot payload/package and Codex regression tests are mandatory; the known unrelated package-boundary cycle remains out of scope.
