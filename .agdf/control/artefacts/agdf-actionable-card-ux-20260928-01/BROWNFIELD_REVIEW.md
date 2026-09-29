# Brownfield Review: Klare nächste Schritte in AGDF-Karten

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-actionable-card-ux-20260928-01`
- related_ur: `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UR.md` (approved)
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-09-28

## Objective

Size and route the approved change to target clarification, control setup, operational status and gate-approval cards before PRD drafting. The gate-approval card's artefact summary is included after the user asked to fix the English excerpts and incomplete PRD summary shown in the German presentation.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The requested card changes alter the primary visible action, identify who acts next, and clarify recovery and response expectations.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

The user resolved the cross-host wording: use the host-neutral label “Ich arbeite weiter”. This clarifies the existing actor-state requirement without changing the approved scope or authority boundary. Preserve the original approved UR; carry this later wording decision into PRD as run evidence.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; `plugin/meta/contracts/interaction.md`; `plugin/meta/contracts/task-target-resolution.md` | The UR defines who acts and the response needed. Current blocked cards can expose only a raw reason code, leaving the cause and recovery opaque. Contracts keep target authority, run state and approval authority separate. | `medium` |
| Source of truth | `RUN_STATE.md` fields, task-target resolution result and gate policy; locale source at `plugin/meta/agdf-interaction-locales.json` | `gate-check.js` retains the selected run's `next_allowed_action`, but replaces it for the card when it is not in the operational locale registry. PRD readiness also has structured `open_decisions`, while the status card shows `AGDF_PRD_DECISIONS_OPEN` without those details. | `medium` |
| Runtime path | `create-agdf/lib/skill-dispatch/service.js`, `create-agdf/lib/control-evaluation/gate-check.js`, `create-agdf/lib/interaction-presentation.js` | Target orientation, control setup and run status are projected through existing dispatch and gate-check paths. | `medium` |
| UI / UX | `interaction-presentation.js` is the sole status-card renderer; target orientation uses the same module | `interaction.md` requires adapters to pass the canonical rendered Markdown verbatim. | `medium` |
| Gate-approval summary | `create-agdf/lib/control-state/run-presentation-render.js` builds the digest-bound approval summary from the current gate artefact and uses the selected presentation locale for labels | On a German `run-present`, PRD source excerpts remained English and the displayed output contained only AC-001; the code caps extracted PRD acceptance snippets at two, and `create-agdf/scripts/control-state-test.js` asserts that original-language excerpts are preserved. | `medium` |
| Persistence / data | Existing run state and normalized target-resolution data | No schema, durable state, migration or new source of truth is needed for this bounded card change. | `none` |
| Tests / QA | `create-agdf/scripts/interaction-presentation-test.js`; `create-agdf/scripts/operational-localization-test.js` | Existing tests cover locale rendering. The latter currently asserts that German cards omit the free-text run action, reproducing the approved UR symptom. | `medium` |
| Release / operations | Existing packaged renderer and host adapters | No install or activation change is requested. User-requested fresh-session checks remain necessary on Codex, Claude, Copilot and OpenCode after implementation. | `low` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: The change affects externally visible orientation/status cards and the digest-bound gate-approval summary. Each existing renderer retains its distinct purpose and consumes canonical resolver/run state; neither creates a competing state or approval authority. Existing semantic-block names, machine-readable state, command flags, approval authority and host-adapter contracts can remain unchanged.
- architecture_evidence: `plugin/meta/contracts/interaction.md` assigns status-card rendering to `interaction-presentation.js` and requires host adapters to consume its Markdown verbatim; `plugin/meta/contracts/task-target-resolution.md` assigns target orientation rendering to the same module; `create-agdf/lib/control-evaluation/gate-check.js` substitutes the generic transition action when the canonical run action is not registered for localization; `create-agdf/lib/control-state/run-presentation-render.js` renders the digest-bound approval summary from the current gate artefact and limits PRD acceptance extracts to two items.
- architecture_missing_evidence: none for selecting the bounded route. Fresh native-session rendering on Codex, Claude, Copilot and OpenCode is implementation/UAT evidence and is not claimed as already verified.
- architecture_next_owner_and_action: PRD owner Arndt Gold to carry the cross-host visible outcomes into PRD and TP evidence obligations; no new technical owner or adapter is introduced.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem — run-specific actions disappear from localized status cards; target clarification uses generic copy; actor is not visible in all status states; blocked cards expose a code without the concrete unresolved items; German gate-approval cards preserve raw English excerpts and omit acceptance criteria | `gate-check.js` lines 344–351 records `AGDF_PRD_DECISIONS_OPEN` and holds structured `prd_readiness.open_decisions`; lines 383–395 selects a generic fallback for an unregistered action. The presented card has only the blocker code and generic next step. `operational-localization-test.js` lines 161–176 asserts the German card excludes the free-text action. `renderTaskTargetOrientation` selects generic locale copy by reason code. `run-presentation-render.js` lines 146–153 detects a source-language mismatch but emits original excerpts; lines 107–110 caps PRD acceptance snippets at two. The revision-6 card contained only AC-001. `control-state-test.js` line 454 locks the excerpt behavior in as expected. | `revise` | Extend the existing canonical interaction and approval renderers and locale source: show actual blocker details, distinguish a named pending decision from a blocker, and provide a complete concise approval summary in the requested presentation language. Preserve canonical resolver/run/artefact authority and `authorizes: false`; update the existing renderer/presentation regression expectations and verify all four requested hosts in fresh sessions. |
| No parallel presentation owner is evidenced | `interaction.md` lines 53–59 requires the canonical renderer and forbids adapters from rebuilding status-card tables. | `none` | Reuse the single renderer; do not add host-local or skill-local card templates. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — one coherent outcome improves actionable guidance across existing target, setup, status and gate-approval cards. The canonical state owners, distinct renderers, shared localization source and consumers are identified. The change adds no authority, persisted data, migration, adapter, command flag or deployment cutover. The user selected the host-neutral “Ich arbeite weiter” label for the four requested surfaces.
- evidence: Approved UR; the interaction and target-resolution contracts; the gate-check fallback at `create-agdf/lib/control-evaluation/gate-check.js`; the status renderer and digest-bound approval summary renderer; the German run-present output and existing localization regression cases. The seven bounded-slice checks below are complete. No evidenced full-depth trigger applies.
- transparency_note: `quick_task` and `verified_change` are ineligible because this changes approved user-facing action/actor semantics across several existing card states and touches the canonical renderer and locale contract. `structured_delivery` is unnecessary because no public machine schema, CLI option, authority boundary, persistence, migration, host adapter, rollout or coordinated cutover changes. PRD is not ready until the pending cross-host actor-label decision is resolved.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery` — no full-depth trigger or coordinated rollout is evidenced; the unchanged semantic block and machine schema keep this slice within the existing renderer boundary.
- missing_or_conflicting_facts: none that affect depth selection. Product copy for the acting-agent label remains open and blocks UX/PRD readiness, not the bounded route.
- depth_evidence_refs: `plugin/meta/contracts/interaction.md`; `plugin/meta/contracts/task-target-resolution.md`; `create-agdf/lib/control-evaluation/gate-check.js`; `create-agdf/lib/interaction-presentation.js`; `create-agdf/lib/control-state/run-presentation-render.js`; `create-agdf/scripts/interaction-presentation-test.js`; `create-agdf/scripts/operational-localization-test.js`; `create-agdf/scripts/control-state-test.js`; `plugin/meta/agdf-interaction-locales.json`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | The approved UR defines one outcome: users can tell who acts next, what exact input is needed, and what follows across existing AGDF cards. |
| authority_boundary | `pass` | Existing resolver, canonical run state and gate policy remain authoritative; cards continue to be non-authorizing and approvals remain handled by existing exact-approval processing. |
| owner_consumer_coordination | `pass` | Distinct canonical renderers own target/status presentation and digest-bound approval summaries; the existing locale source and CLI/skill/host adapters remain the only projection path; the four requested host checks are evidence obligations, with no shared deployment or cutover. |
| full_depth_impacts_absent | `pass` | No command flag, machine schema, protocol, persisted data, host adapter, security/policy authority, deployment or release behavior change is required. |
| migration_propagation_bounded | `pass` | Locale copy and renderer output propagate through existing package generation; no persisted state migration is needed. |
| failure_recovery_local | `pass` | Ambiguous actor/action can remain a targeted clarification; no state mutation or irreversible operation is introduced. |
| independently_acceptable | `pass` | Target, setup and status card acceptance signals can be verified in this slice; no later feature is a prerequisite. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Map the canonical actor/action fields and safe behavior for unrenderable run-specific text without inferring actor from prose. | `SD` | `revise` |
| Include fresh-session rendered-card evidence for Codex, Claude, Copilot and OpenCode in the acceptance/evidence plan. | `TP` | `revise` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: This review records run-specific reuse and failure evidence; no durable architecture or ownership node changes.

## Next Permissible Step

- next_allowed_action: Refine the structured-slice PRD using the ready UX Intent Definition, the user's host-neutral actor-label clarification and the requested cross-language gate-approval card correction.
- forbidden_until_then: Do not draft SD or TP, change code, or claim any host's card behavior has been verified before its fresh-session check.

## Quality Outlook

- quality_outlook: Preserve one renderer and one canonical actor/action source; test the original localized regression and all supported card states before fresh-session checks on the four requested hosts.
