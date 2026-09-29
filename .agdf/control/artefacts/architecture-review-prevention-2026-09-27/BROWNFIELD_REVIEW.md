# Brownfield Review: Prevent Architecture Debt Before Implementation

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`
Review decision: `pass`

## Run

- run_id: `architecture-review-prevention-2026-09-27`
- related_ur: `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/UR.md` (approved revision 2)
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-09-27

## Objective

Size and route the approved UR to strengthen the existing Brownfield Analysis so that architecture impact, evidence gaps, justified trade-offs, and any retained debt are explicit before implementation planning.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: This changes internal AGDF review instructions and routing evidence. It adds no user-facing product capability, visible state, blocker, activation, or recovery behavior.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved run UR | The UR defines architecture-risk analysis and trade-off handling for relevant changes; it does not change a domain product's behavior. | `low` |
| Source of truth | `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/meta/contracts/gate-transition.md`; `plugin/meta/contracts/modes.md`; `plugin/meta/contracts/quality.md` | The skill owns Brownfield analysis; gate-transition owns the post-UR step; modes owns the sole structured-depth matrix; quality owns normalized review-gap routing. | `high` |
| Runtime path | Canonical `plugin/` source and generated host plugin profiles | `create-agdf/scripts/sync-package-assets.js` projects the canonical plugin tree into generated packages. `create-agdf/package.json` includes generated AGDF and Copilot plugin profiles; install scripts exist for Claude, Codex, Copilot, and OpenCode. | `medium` |
| UI / UX | No product UI owner is in scope | The reviewed change affects internal agent guidance, not a product surface or user-visible state. | `none` |
| Persistence / data | Existing run artefacts and `RUN_STATE.md` | No product data schema or migration is required. Findings belong in the existing Brownfield Review and run state, not a second debt registry. | `low` |
| Tests / QA | `plugin/scripts/check-runtime-integrity.mjs`; `evals/fixtures/catalog.json`; `create-agdf` skill-evaluation scripts | Runtime-integrity checks cover Brownfield contract fields and the eval catalogue has Brownfield control states. No architecture-debt-specific scenario was found in the reviewed eval catalogue. | `medium` |
| Release / operations | `create-agdf` generated plugin profiles and host installers | A shared skill change can alter behavior on several host surfaces. The source-to-payload path is present, but acceptance evidence for every supported host must be planned. | `high` |

## Architecture Impact

- Current coverage: `partially_done`. Brownfield Analysis already covers architecture, compatibility, migration, reuse, evidence gaps, parallel-structure risks, source-of-truth drift, and structured-depth routing. The Brownfield Review template captures existing owners and risks.
- Specific gap: no explicit architecture-impact result and trigger threshold; no explicit distinction between evidence-backed architecture problems and justified trade-offs; no required rationale, owner, mitigation, and review/exit condition when debt is retained.
- Review boundary: `clean-implementation-review` already checks implementation architecture fit, root-cause fixes, workarounds, parallel structures, and fallback exit criteria after implementation. `code-review` checks actual diff defects, regressions, and security findings. Brownfield should identify and route upstream architecture decisions before PRD/SD; it must not duplicate either downstream review.
- Reuse path: extend the existing `brownfield-analysis` skill and `BROWNFIELD_REVIEW.md` evidence. Keep the existing `modes.md` Structured Depth Decision as the sole owner of full-depth and bounded-slice criteria; use existing `quality.md` routes for later design gaps.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A new architecture-review skill or gate would duplicate the approved Brownfield route. | The UR explicitly excludes a new gate; `gate-transition.md` assigns post-UR sizing to the existing Brownfield Review. | `block` | Extend the existing skill and review artefact only. |
| Repeating the seven-check depth matrix in the Brownfield skill would create competing policy ownership. | `modes.md` names itself the sole normative owner; runtime-integrity checks enforce that relationship. | `revise` | Keep only architecture-specific evidence prompts in Brownfield and reference the existing matrix. |
| A separate technical-debt backlog would split ownership from run evidence. | The UR excludes a parallel registry; `context-graph.md` says run-specific evidence belongs in scope artefacts. | `revise` | Record findings and any accepted debt in the existing run artefacts; create no separate registry. |
| The UR names no accountable owner yet. | `UR.md` has `Owner: TBD`; no `AGENTS.md` or `CODEOWNERS` file was found in the repository inventory. | `warn` | Assign the responsible policy/product owner in PRD before asking for `Approval: PRD`. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `authority_policy_security_depth` — the UR changes normative pre-implementation review policy. The shared plugin source and separate host installer profiles also require explicit cross-host acceptance and rollout scope. This is not an implementation-only change.
- evidence: Approved UR; `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/meta/contracts/gate-transition.md`; `plugin/meta/contracts/modes.md`; `create-agdf/scripts/sync-package-assets.js`; `create-agdf/package.json`.
- transparency_note: `quick_task` and `verified_change` are ineligible because this changes normative policy and architecture review behavior. `structured_slice` is rejected because its bounded-slice checks do not all pass. PRD is the next gate; SD, TP, and implementation remain closed until their existing gates are reached and approved.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete` — the decisive policy trigger and all seven bounded-slice checks have been evaluated. Open design and ownership questions are listed below for PRD; they do not change the selected depth.
- primary_reason_code: `authority_policy_security_depth`
- decisive_full_depth_triggers: `authority_policy_security_depth` — the existing Brownfield review's normative obligations change; `release_cross_host_depth` — the canonical plugin tree is projected into multiple host plugin profiles and must be accepted on the supported host surfaces.
- rejected_alternative: `structured_slice` — `authority_boundary` and `full_depth_impacts_absent` do not pass because normative review policy and cross-host behavior are in scope. `quick_task` and `verified_change` exclude this policy/architecture impact.
- missing_or_conflicting_facts: No mode-selection fact is missing. PRD must resolve the accountable owner (`UR.md` currently says `TBD`), exact architecture trigger threshold, minimum evidence and retained-debt fields, supported-host acceptance matrix, and whether the generic `RUN_STATE.md` objective needs alignment with the approved UR title and scope.
- depth_evidence_refs: `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/UR.md`; `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/meta/contracts/gate-transition.md`; `plugin/meta/contracts/modes.md`; `plugin/meta/contracts/quality.md`; `create-agdf/scripts/sync-package-assets.js`; `create-agdf/package.json`; `plugin/scripts/check-runtime-integrity.mjs`; `evals/fixtures/catalog.json`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | The approved UR gives one outcome: identify relevant architecture risks and trade-offs before implementation planning, with explicit acceptance signals. |
| authority_boundary | `fail` | The UR adds normative review obligations. It does not add a gate or approval authority, but that policy change fails the bounded-slice condition. |
| owner_consumer_coordination | `fail` | The source owners are identifiable by existing skill and contract responsibilities, but the accountable human owner is `TBD`; the shared source feeds distinct host profiles. |
| full_depth_impacts_absent | `fail` | Normative review policy changes, and the shared plugin behavior spans supported host profiles; these are in-scope full-depth effects. |
| migration_propagation_bounded | `pass` | No product-data migration is involved. `sync-package-assets.js` derives host payloads from canonical `plugin/` sources, and a source revert is local; host-specific acceptance remains a PRD/TP obligation. |
| failure_recovery_local | `pass` | The change is reversible through the canonical source and package refresh; no product state migration or irreversible cutover is identified. Fresh-session behavior must be checked during host acceptance. |
| independently_acceptable | `pass` | The outcome and acceptance signals stand alone within the existing Brownfield skill and review artefact; they require no new gate, registry, or unrelated feature. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Who owns the Brownfield policy and approves its future maintenance? | `PRD` | `revise` |
| What observable conditions trigger architecture-specific scrutiny, and when is `architecture-not-applicable` sufficient? | `PRD` | `revise` |
| What evidence distinguishes a structural problem from an intentional trade-off, and where are rationale, owner, mitigation, and review/exit condition recorded in the existing run artefact? | `PRD` | `revise` |
| Which supported host profiles need direct acceptance, and what verifies generated payloads and fresh-session loading? | `PRD` | `revise` |
| Which architecture details belong in SD, and when would a diagram materially clarify a boundary rather than add ceremony? | `SD` | `warn` |
| How should the generic run objective be reconciled with the approved UR scope without broadening it? | `PRD` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: These are run-specific findings and open design questions. `context-graph.md` assigns run-specific evidence to scope artefacts and forbids creating nodes for local observations without a concrete reusable decision. The Brownfield Review and UR retain the evidence.

## Next Permissible Step

- next_allowed_action: Draft a structured-delivery PRD that resolves the owner, proportional trigger, evidence and retained-debt record, host acceptance, and acceptance criteria; then request exact `Approval: PRD`.
- forbidden_until_then: SD, TP, implementation, a new gate or approval authority, a parallel architecture findings/debt registry, and mandatory architecture diagrams for every change.

## Quality Outlook

- quality_outlook: Routing is evidence-backed at `structured_delivery`. Existing structural checks and skill-evaluation infrastructure can be extended, but no dedicated architecture-debt scenario or cross-host acceptance evidence has been found yet. No tests were run as part of this Brownfield Review.
