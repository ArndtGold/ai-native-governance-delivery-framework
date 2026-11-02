# Brownfield Review: Agent Skills Conformance And Portability Baseline

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: agent-skills-conformance-portability
- related_ur: `.agdf/control/artefacts/agent-skills-conformance-portability/UR.md`
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-08-19

## Objective

Size and route the approved slice that makes AGDF's Agent Skills conformance and supported
plugin-scoped portability boundary deterministic without changing skill behavior or duplicating
shared Runtime Contract ownership.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The slice changes repository validation, evidence and compatibility documentation only; it does not change a user-facing capability, state, activation or recovery behavior.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR and current skill descriptions | `UR.md`; `plugin/skills/*/SKILL.md` | `low` |
| Source of truth | Canonical plugin definition, skills and focused Runtime Contract modules | `plugin/meta/agdf-plugin.definition.json`; `plugin/skills/*`; `plugin/meta/contracts/*` | `medium` |
| Runtime path | Runtime Integrity and generated package assets | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/sync-package-assets.js` | `medium` |
| UI / UX | No applicable surface behavior | Repository inspection | `none` |
| Persistence / data | No persistent schema or migration | Repository inspection | `none` |
| Tests / QA | Existing positive/negative integrity, skill-eval and package-smoke owners | `create-agdf/scripts/runtime-integrity-negative-test.js`; `create-agdf/package.json` | `medium` |
| Release / operations | Existing guardrail and publish workflows consume Runtime Integrity and generated assets | `.github/workflows/agdf-guardrails.yml`; `.github/workflows/publish-agdf.yml` | `low` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Runtime Integrity already owns canonical skill-layout and semantic checks | `plugin/scripts/check-runtime-integrity.mjs` | `warn` | Extend or compose this owner; do not create an unrelated second CI authority. |
| Negative fixture infrastructure already exercises fail-closed integrity behavior | `create-agdf/scripts/runtime-integrity-negative-test.js` | `none` | Reuse its temporary-plugin fixture pattern. |
| Skill content intentionally depends on shared plugin contracts | All ten `SKILL.md` files reference `../../meta/contracts/*` | `warn` | Declare plugin-scoped portability and validate resolution without copying contracts into skills. |
| Generated Copilot/OpenCode surfaces rewrite shared-contract paths | `create-agdf/scripts/sync-package-assets.js` | `warn` | Preserve deterministic path rewriting and validate generated output separately. |
| Upstream Agent Skills guidance can drift | Public specification and OpenAI documentation | `warn` | Persist the claimed constraint set locally; routine CI must not depend on an unpinned network fetch. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — one coherent conformance outcome spans canonical validation, negative tests, package propagation and compatibility documentation. Quick Task is ineligible because executable validation and normative plugin paths change; Verified Change is ineligible because there is more than one canonical owner. No full-depth trigger is present, and all bounded-slice checks pass.
- evidence: Approved UR; canonical skill inventory; Runtime Integrity; negative-test fixture; package synchronizer; guardrail and publish workflows.
- transparency_note: PRD, SD and TP remain required but may stay compact and cover only the bounded compatibility claim, validator ownership, propagation and tests.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: `none`
- rejected_alternative: `structured_delivery` rejected because there is no authority/security, architecture/runtime, persistence/migration, external API/public CLI, release/cross-host or unbounded coordination change.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: `plugin/skills/*/SKILL.md`; `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/runtime-integrity-negative-test.js`; `create-agdf/scripts/sync-package-assets.js`; `.github/workflows/agdf-guardrails.yml`; `.github/workflows/publish-agdf.yml`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One acceptance boundary: deterministic validation plus an explicit plugin-scoped portability claim. |
| authority_boundary | `pass` | Existing Agent Skills specification, plugin definition, Runtime Contract and Runtime Integrity owners remain authoritative; no new approval or trust boundary is introduced. |
| owner_consumer_coordination | `pass` | Owners and consumers are repository-local and propagate through the existing sync, guardrail and publish paths without an external cutover. |
| full_depth_impacts_absent | `pass` | No architecture, runtime execution, persistence, data, external API, public CLI, deployment or cross-host activation semantics change. |
| migration_propagation_bounded | `pass` | No migration exists; source-to-generated propagation is already deterministic and testable. |
| failure_recovery_local | `pass` | A failed conformance check blocks repository CI/package preparation and can be recovered by correcting or reverting the bounded validator/metadata change. |
| independently_acceptable | `pass` | The slice is independently acceptable when all canonical and generated skills pass the declared baseline and existing regressions remain green. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which public-standard rules are hard failures and which recommendations remain advisory? | `PRD` | `revise` |
| Where is the supported plugin-scoped portability claim documented canonically? | `PRD` | `warn` |
| Does Runtime Integrity embed the checks or call one focused reusable validator module? | `SD` | `revise` |
| How are intentional out-of-skill-root dependencies declared without accepting arbitrary traversal? | `SD` | `revise` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing public-plugin node already owns package composition, honest evidence boundaries and public-distribution compatibility; this review links the bounded conformance slice without changing that node yet.

## Next Permissible Step

- next_allowed_action: Draft the compact PRD for the bounded structured slice and request `Approval: PRD`.
- forbidden_until_then: Solution Design, Task Plan, implementation, QA, release and standalone-portability claims.

## Quality Outlook

- quality_outlook: Make the validator deterministic, fixture-tested and explicit about strict rules, advisory guidance and allowed plugin-scoped dependencies.
