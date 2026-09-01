# Brownfield Review: Pre-Decision Status Card Visibility

Mode: post_ur_review
Date: 2026-09-01
Decision: pass
Mode/Slice Decision: structured_slice
Required next gate: PRD
Owner: agent

## Routing Classification

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The approval-time presentation sequence every user sees before every gate
  decision changes (full card or visible offer added); layout and fields of the card itself are
  unchanged; product semantics of the addition are clear from the approved UR.
- ux_intent_definition_required: not_applicable — the UR fixes intent (complete authority context
  before deciding), success (card present or visibly offered), and the design tension is an explicit
  PRD question, not an ambiguous product semantic.

## Existing System View

| Concern | Owner | Coverage today |
|---|---|---|
| Approval-time sequence normative text | `plugin/meta/contracts/interaction.md` (§ envelope, lines ~141-158) | fully_done for compact view; explicitly states the full card "remains available … outside the approval-time compact view" but mandates no offer |
| First-visible-line rule | same contract §141-149: decision title must be the first visible line of the envelope | conflicts with naively prepending the full card — must be amended or the card offered instead |
| Code sequence + validators | `create-agdf/lib/interaction-presentation.js` `APPROVAL_SEQUENCE` (3 blocks), `validateApprovalOrientationSnapshot` sequence check | fully_done for current shape |
| Envelope rendering | `gate-check.js#printApprovalEnvelope`; full card already available in the same report as `status_presentation.markdown` | reuse point: no new data needed, only rendering/wording |
| Skill guidance | `plugin/skills/gate-check/SKILL.md` §Output (compact projection first, then Gate Transition Card) | states the replacement this run revisits |
| Locale copy | `agdf-interaction-locales.json` with length budgets | a visible offer line would need one new localized key; always-render needs none |
| Tests | `interaction-presentation-test.js` (sequence, envelope), skill-eval fixtures | pin current shape; must follow the chosen design |
| Generated surfaces | `sync-plugin-runtime.js` / `sync-package-assets.js` | deterministic propagation |

## Reuse Strategy

- `extend`: `printApprovalEnvelope` can render the already-computed `status_presentation.markdown`
  (option A: always-render) or one localized offer line (option B) before the compact blocks — no new
  data source, no snapshot change if the card stays outside `APPROVAL_SEQUENCE`.
- `extend`: contract and skill wording amended in place; the first-visible-line rule must be
  explicitly reconciled (amend the rule or place the card/offer after the decision title).
- No new block semantic id; the full card keeps its existing `run_status_card` status-surface role.

## Compact-Path Evaluation (unchanged rules first)

- `quick_task`: ineligible — touches `plugin/meta/**`, `plugin/skills/**` and `create-agdf/lib/**`
  (excluded paths) and changes user-facing product behavior.
- `verified_change`: ineligible — more than one canonical owner (contract, skill text, envelope code,
  tests, possibly locale registry) and user-visible interaction behavior changes.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none evidenced — no authority/approval semantics change (blocks stay
  non-authorizing, exact approval unchanged), no runtime/persistence/migration impact, no external
  consumer coordination (all consumers in-repo plus deterministic generated mirrors), no release plan
  beyond normal version flow.
- rejected_alternative: `verified_change` (multiple owners, user-visible behavior);
  `structured_delivery` (no full-depth trigger: the interaction contract changes presentation policy,
  not authorization, and every affected owner and consumer is inventoried in-repo)
- missing_or_conflicting_facts: none
- depth_evidence_refs: `plugin/meta/contracts/interaction.md:141-158`;
  `create-agdf/lib/interaction-presentation.js:8,635,670`;
  `create-agdf/lib/control-evaluation/gate-check.js#printApprovalEnvelope`;
  `plugin/skills/gate-check/SKILL.md:205-218`; locale registry length budgets

| Check ID | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One outcome: full card present or visibly offered before every ready-gate decision; acceptance boundary UR §5. |
| `authority_boundary` | pass | Approval values, gates and non-authorizing card semantics untouched (UR non-goal); contract remains the single sequence owner. |
| `owner_consumer_coordination` | pass | Owners: contract, skill, envelope code, tests, locale registry — all in-repo; mirrors via canonical sync; no external cutover. |
| `full_depth_impacts_absent` | pass | No schema/persistence change; JSON additions (if any) additive; no cross-host activation beyond routine sync. |
| `migration_propagation_bounded` | pass | Propagation = sync regeneration; no data migration; old rendering simply superseded. |
| `failure_recovery_local` | pass | Pure rendering/wording change with deterministic tests; rollback is a local revert plus re-sync. |
| `independently_acceptable` | pass | Acceptance signals testable in envelope/validator tests; no hidden prerequisite. |

## Parallel-Structure Risk

Main risk: a second block claiming the `run_status_card` semantic id inside the approval sequence.
Mitigation is a PRD/SD decision: either the full card renders outside the validated three-block
sequence (before/after the decision title per the amended rule) or as a visible offer line. One
sequence owner (the contract) must describe the final shape; skill text follows it.

## SoT / Product-Semantics Drift

None beyond the change itself; contract, skill and code currently agree on the compact-replacement
behavior and must agree again on the new behavior (UR acceptance signal 5).

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Chat noise / re-introduced ceremony with always-render | medium | PRD decides always-render vs localized offer with explicit rationale |
| First-visible-line (decision title) rule conflict | medium | Explicit contract amendment decided in PRD/SD, not implied |
| New locale key exceeds length budgets or misses a locale | low | Registry completeness validation fails closed; only needed for option B |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_required_action: none

## Required Next Step

Draft the PRD deciding always-render vs visible offer, the placement relative to the decision title,
and the sequence/validator consequences; then request exact `Approval: PRD`.
