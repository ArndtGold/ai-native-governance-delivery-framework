# PRD: Scope Classification Card Contract Hardening

Status: approved
Gate: PRD
Gate approval: approved on 2026-08-19 with exact `Approval: PRD`
Based on: approved UR, Brownfield Review and ready UX Intent Definition
Date: 2026-08-19
Owner: agent

## 1. Product Scope

Correct the existing Scope Classification Card contract without redesigning the card:

1. The card is available only for a valid fresh ungated `quick_task` classification.
2. `verified_change`, structured, gated, ambiguous, selected-run and unknown states never render it.
3. An unsupported requested locale uses the complete deterministic English pack.
4. A present but incomplete or otherwise invalid registry is not an unsupported locale; it is an
   invalid presentation source and fails closed without a card.
5. Dynamic classification fields are bounded single-line plain text. Markdown-bearing, multiline,
   missing, unknown, contradictory or over-limit input fails closed.
6. Escalation triggers are a bounded non-empty list of bounded single-line plain-text items.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: `.agdf/control/artefacts/scope-classification-card-contract-hardening/UX_INTENT_DEFINITION.md` (`ready`)
- primary_user_intent: Understand why a fresh request is safely ungated without seeing a misleading, malformed or authorization-like card.
- success_signal: Valid fresh Quick Tasks render one compact localized non-authorizing card; every other or invalid state follows the existing authoritative flow without a card.
- primary_decision_or_action: Continue within the shown Quick Task boundary or challenge the classification toward UR.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| valid fresh `quick_task` | ungated Quick Task classification | Scope Classification Card | `gate-check` evaluation against Runtime Contract | existing `renderScopeClassificationCard` owner |
| unsupported requested locale | unchanged ungated Quick Task classification | English Scope Classification Card | same classification authority; locale changes presentation only | existing renderer with complete English pack |
| invalid/incomplete registry or invalid dynamic input | no visible scope-classification state | existing fail-closed ceremony or clarification | Runtime Contract validation boundary | existing interaction presentation owners; no reconstructed card |
| `verified_change`, gated, ambiguous, selected-run or unknown | existing durable/gated/clarification state | Run Status Card, gate presentation or clarification as applicable | durable run state and Gate Transition Model | existing non-scope-card presentation owner |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Activate only for fresh resolved-target `quick_task` input with outcome `ungated`, valid boundary, valid bounded fields, valid trigger list and a complete locale source. Deactivate immediately when any condition ceases to hold.
- blockers_and_visible_next_actions: Non-Quick-Task or invalid state suppresses the card and continues with the existing applicable run, gate, ceremony or clarification action.
- recovery_paths: Unsupported locale retries deterministically with complete English; invalid registry/input does not retry with partial data and routes to existing fail-closed handling; user challenge routes to UR evaluation.
- relevant_state_transitions: Quick Task valid → card; unsupported locale → English card; invalid source/input → no card; semantics discovered → UR; Verified Change/structured selection → existing run presentation only.

## 5. Acceptance Criteria

| criterion_id | working_mode | source_state | Trigger/action | Expected effective state | Visible feedback | Blocker/failure behavior | Recovery/next action | Observable success | Required evidence |
|---|---|---|---|---|---|---|---|---|---|
| SCH-01 | valid fresh Quick Task | valid complete input | render twice | unchanged ungated classification | byte-identical localized card | none | none | identical Markdown and `authorizes: false` | focused renderer test |
| SCH-02 | non-Quick-Task | `verified_change`, gated, structured, ambiguous or unknown | attempt render | no scope-card state | no card | rendering is a defect | follow existing authoritative flow | renderer returns `null` for every case | negative tests and evals |
| SCH-03 | unsupported locale | valid Quick Task plus unavailable locale tag | render | unchanged classification | complete English card | mixed or partial locale is a defect | deterministic English fallback | `presentation_language: en` and English labels | focused locale test |
| SCH-04 | invalid locale source | present incomplete or invalid registry | render | no scope-card state | no card | partial/mixed fallback forbidden | existing fail-closed ceremony | renderer returns `null` | invalid-registry tests |
| SCH-05 | dynamic fields | Markdown-bearing, multiline, missing or over-limit value | render | no scope-card state | no card | sanitizing into an apparently valid card is forbidden | correct input or existing ceremony | every invalid case returns `null` | table-driven negative tests |
| SCH-06 | escalation triggers | empty, excessive, duplicate-empty or over-limit items | render | no scope-card state | no card | partial trigger list forbidden | correct list or existing ceremony | every invalid collection returns `null` | table-driven negative tests |
| SCH-07 | valid localized input | complete English and German packs | render | valid localized projection | canonical values remain untranslated; labels localized | mixed language forbidden | complete-pack selection | locale parity and output assertions pass | registry and renderer tests |
| SCH-08 | all | any renderer result | inspect result | non-authorizing presentation | no approval controls or approval vocabulary | authorization-like output is a defect | suppress invalid output | `authorizes: false`; no approval options | focused security assertion |
| SCH-09 | generated surfaces | synchronized source | build/install-layout integrity | same contract on every surface | no surface-local template or divergent behavior | drift blocks integrity | canonical sync | source and built-plugin integrity pass | sync idempotence and integrity |
| SCH-10 | existing gated UX | Run Status and approval flows | regression suite | unchanged existing authority | existing cards/options unchanged | regression blocks QA | fix within child scope | existing interaction suite remains green | regression suite |

## 6. Non-Goals

- No new renderer, classification engine, persistent state or JSON classification schema.
- No full-card redesign, additional user step or approval interaction.
- No change to exact approval values, gate ordering, Run Status Card or Gate Transition Card.
- No direct guarantee of exactly-once host rendering beyond the existing agent-native evidence boundary.
- No release, deployment, publication, VCS delivery or plugin reinstall.

## 7. Users And Roles

- Users: people receiving AGDF scope classification for fresh Quick Tasks.
- Classification authority: `gate-check` against the Runtime Contract.
- Product authority: this PRD after exact approval, derived from the approved UR.
- Presentation authority: existing interaction renderer and locale registry.
- Final acceptance: user through later QA/UAT gates as applicable.

## 8. Constraints

- Preserve one renderer and one locale owner.
- Invalid or contradictory input fails closed; it is never repaired into apparently valid content.
- Dynamic bounds must be explicit and testable; exact numerical values are approved here as product
  constraints: each dynamic scalar and each trigger is at most 240 Unicode code points, and the
  escalation list contains 1–3 items.
- Valid dynamic fields are single-line plain text and must not contain Markdown control characters
  used for headings, emphasis, code, links, images, blockquotes, lists or tables.
- Existing generated-surface sync and runtime packaging remain the only propagation path.

## 9. Evidence Requirements

- Table-driven renderer tests for every invalid mode, field, bound, Markdown class and trigger case.
- Unsupported-locale English fallback and invalid-registry fail-closed tests.
- Existing English/German deterministic render and non-authorizing assertions.
- Gate-check eval cases proving the card is suppressed outside fresh Quick Task scope.
- Runtime Integrity in source and built-plugin layouts plus sync idempotence.
- Current interaction regression suite and relevant package smoke checks.

## 10. Risks And Open Questions

- Unicode code-point counting must be deterministic and must not use UTF-16 code-unit length.
- Plain-text rejection must cover Markdown controls without rejecting ordinary German/English
  punctuation or URLs written as plain text.
- SD must place shared validation and constants without creating a second policy owner.
- Existing fixtures may encode permissive behavior and must be updated rather than weakened.

## 11. Next Step

The PRD is approved. Solution Design is the next allowed artefact; implementation remains forbidden.
