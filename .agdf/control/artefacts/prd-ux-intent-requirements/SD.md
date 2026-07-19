# SD: Define UX Intent And Route Review Gaps Upstream

Status: approved
Gate: SD
Gate approval: approved (`Approval: SD`, 2026-07-19; revision 16)
Based on: approved PRD revision 15
Date: 2026-07-19
Owner: user

## 1. Solution Overview

Extend the existing AGDF lifecycle with one conditional, non-authorizing analysis skill and one
traceable fidelity dimension while preserving the current gate model and canonical owners.

The solution has five stages:

1. the existing post-UR routing owner records `delivery_context` and one shared `ui_ux_impact` value;
2. `ux-intent-definition` runs conditionally and produces a structured `ready | blocked |
   not_applicable` analysis;
3. the PRD absorbs accepted UX criteria and remains the sole product authority;
4. TP maps each applicable criterion to tasks, tests and visible evidence; and
5. Task Plan Review verifies UX Intent Fidelity before `qa-gate` makes the sole final QA decision.

No new user gate, approval value, runtime evaluator or parallel requirements store is introduced.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design boundary |
|---|---|---|
| Gate order and post-UR routing | `plugin/meta/contracts/gate-transition.md` | Own shared impact vocabulary and conditional placement; no second gate table |
| Post-UR classification | `plugin/skills/brownfield-analysis/SKILL.md` in `post_ur_review` mode | Remain the single routing owner for Greenfield and Brownfield contexts |
| Skill discovery and cross-surface names | `plugin/meta/agdf-plugin.definition.json` | Add one `automatic` canonical skill entry |
| UX analytical procedure | `plugin/skills/ux-intent-definition/SKILL.md` | Own inputs, output semantics and fail-closed decision only |
| Supporting analysis shape | `plugin/control/templates/artefacts/UX_INTENT_DEFINITION.md` | Non-authorizing, run-scoped input; never a gate artefact or product SoT |
| Product requirements | approved run PRD and `plugin/control/templates/artefacts/PRD.md` | Sole authority for accepted scope, behavior and acceptance criteria |
| Technical state ownership | Solution Design | Own component, storage and derivation decisions only |
| UX implementation fidelity | `plugin/skills/task-plan-review/SKILL.md` | Evidence dimension; cannot create criteria or decide QA |
| Final QA decision | `plugin/skills/qa-gate/SKILL.md` | Sole `pass | revise | block` owner |
| Router projection | `plugin/meta/agdf-agent-router.md` derived from plugin definition semantics | Expose the new skill and boundary without duplicating its contract |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | Generate Codex, Claude, Copilot and OpenCode copies from `plugin/` |
| Integrity checks | `plugin/scripts/check-runtime-integrity.mjs` | Enforce exact skill, router, template, Pages and generated parity |
| Behavioral evaluation | `evals/` plus `create-agdf/lib/skill-evals/` | Require normal, boundary and adversarial evidence for every canonical skill |
| Public skill catalogue | `pages/src/data/skills.ts` | Mirror canonical skill set and discovery metadata |

`plugin/` remains authoritative. `create-agdf/generated/` and installed surface copies remain derived.

## 3. Architecture Decisions

### AD-01: One post-UR routing owner

Extend `brownfield-analysis` `post_ur_review` output with:

- `delivery_context: greenfield | brownfield`
- `ui_ux_impact: none | low | medium | high`
- `ui_ux_impact_reason`
- `ux_intent_definition_required: yes | no`

Use the PRD classification meanings from UXI-AC-01. Greenfield uses the same owner with existing-system
checks explicitly not applicable; Brownfield requires repository evidence. Do not add a second
Greenfield router or evaluator.

Routing is deterministic:

- `medium | high` -> require `ux-intent-definition` before PRD readiness;
- `low` -> invoke only when mandatory PRD semantics remain ambiguous;
- `none` -> record the skill result as `not_applicable`.

### AD-02: Canonical skill contract

Create `plugin/skills/ux-intent-definition/SKILL.md` with valid two-field YAML frontmatter. Put the
complete trigger contexts in `description` so discovery works before the body is loaded. Mark the
skill `automatic` in the canonical plugin definition.

The skill loads only the focused contracts it needs:

- `../../meta/contracts/gate-transition.md` for routing, authority and revision behavior;
- `../../meta/contracts/quality.md` for evidence and fail-closed output discipline.

The skill body owns:

- required inputs and field semantics;
- the `ready | blocked | not_applicable` decision;
- blocking conditions and required output fields;
- state-authority versus presentation-owner separation;
- proposed PRD acceptance-criterion structure; and
- the prohibition on approval, product-scope mutation and implementation design.

It must not duplicate the impact classification table, gate model or QA rules.

### AD-03: Durable non-authorizing analysis

Add `plugin/control/templates/artefacts/UX_INTENT_DEFINITION.md` and distribute it with the control
scaffold. Store run-specific output at
`.agdf/control/artefacts/<key>/UX_INTENT_DEFINITION.md` when durable control state exists.

The template contains:

- status and analytical decision, but no `Gate` or approval field;
- routing evidence and impact classification;
- every required UX intent field;
- proposed acceptance criteria;
- open questions, evidence, missing evidence and next step; and
- a prominent statement that approved PRD content supersedes it for product authority.

The file may be linked from PRD `Based on`/evidence and run Evidence. It is not added to the user-gate
Artefact Chain, does not unlock transitions and requires no new parser status.

### AD-04: PRD template owns mandatory UX requirements

Expand `plugin/control/templates/artefacts/PRD.md` with focused sections for:

- UX intent and success;
- working modes and effective state;
- visible state types and ownership separation;
- activation, blockers, recovery and transitions; and
- structured UX acceptance criteria and evidence.

Every field must be populated or explicitly justified as not applicable. Medium/high PRDs reference a
`ready` UX analysis. Low-impact PRDs may fill the same mandatory minimum directly. The template does
not prescribe visual or technical implementation detail.

### AD-05: Task Plan Review owns UX Intent Fidelity

Extend `plugin/skills/task-plan-review/SKILL.md` without changing its overall completion authority.
When approved PRD criteria with the `UXI-` or equivalent UX applicability marker exist, produce a
separate matrix:

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|

Use `fulfilled | partial | missing | not_verifiable` for `fidelity_status`. Use
`requirements_gap | plan_gap | implementation_gap | evidence_gap | none` for `gap_type`.

- Missing product behavior in the approved PRD -> `requirements_gap`, route to PRD revision.
- PRD criterion absent from TP -> `plan_gap`.
- Mapped task not delivered -> `implementation_gap`.
- Visible claim backed only by code or insufficient observation -> `evidence_gap`.

Task Plan Review must not synthesize the missing requirement or decide QA.

### AD-06: QA consumes fidelity evidence

Extend `plugin/skills/qa-gate/SKILL.md` and the focused quality contract with one invariant: applicable
UX Intent Fidelity evidence is required for UI/UX-impacting work. Any `partial`, `missing` or
`not_verifiable` result prevents QA `pass`; `requirements_gap` routes to PRD revision. Preserve the
existing four-row Quality Readiness projection and `qa-gate` as sole decision owner.

### AD-07: Definition-driven propagation

Add `ux-intent-definition` to `plugin/meta/agdf-plugin.definition.json`. Extend the canonical router
source and Pages catalogue. Run `create-agdf/scripts/sync-package-assets.js` once to generate all
surface skill, router and control-template copies. Never edit `create-agdf/generated/` or surface
copies manually.

Existing dynamic consumers of `skillSet` automatically move from nine to ten skills. Static listings
and expected-path assertions must be updated explicitly.

### AD-08: Deterministic behavioral and integrity evidence

Add `evals/cases/ux-intent-definition.json` with:

- normal: medium-impact input produces `ready` criteria without gate authority;
- boundary: low-impact ambiguous semantics require the skill or return `blocked`; and
- adversarial: request to invent product intent or bypass PRD returns `blocked` and preserves authority.

Add only the minimum new repository/control fixtures required for these cases. Regenerate the
deterministic replay observation and source fingerprints through the existing eval workflow.

Extend Runtime Integrity assertions for:

- exact canonical skill and help presence;
- router/definition/Pages parity;
- UX analysis template propagation;
- mandatory PRD UX sections;
- Task Plan Review fidelity and QA fail-closed invariants; and
- no new approval value or gate name.

### AD-09: Context Graph lifecycle

Create one curated Context Graph node for the reusable invariant before clean closeout. The node owns
the lifecycle principle only: UX intent is defined before PRD approval, the PRD is authoritative,
Task Plan Review verifies fidelity and QA consumes the evidence. Do not store skill-version or local
implementation detail in the node.

## 4. Integration Flow

1. `gate-check` validates the approved UR and routes to post-UR review.
2. `brownfield-analysis` records `delivery_context`, impact, reason and whether UX definition is required.
3. When required or justified, `ux-intent-definition` reads approved UR plus routing/Brownfield evidence.
4. `blocked` stops PRD readiness; `ready` supplies structured PRD input; `not_applicable` records why.
5. PRD incorporates the accepted behavior and criteria and becomes authoritative only after approval.
6. TP maps each applicable criterion to tasks, tests and visible evidence.
7. Task Plan Review produces UX Intent Fidelity evidence.
8. QA consumes that evidence and fails closed for unresolved gaps.

No runtime command or new state evaluator is required. Agent-native skills and durable artefacts
remain the primary path; existing validators prove consistency.

## 5. PRD Acceptance-Criteria Mapping

| PRD criteria | Design owner |
|---|---|
| UXI-AC-01..03 | AD-01, AD-02, gate-transition contract and post-UR review |
| UXI-AC-04..07 | AD-02, AD-03 and skill behavioral evaluations |
| UXI-AC-08..13 | AD-02, AD-03 and expanded PRD template |
| UXI-AC-14..16 | AD-04 and TP traceability contract |
| UXI-AC-17..21 | AD-05, AD-06 and focused quality contract |
| UXI-AC-22..25 | AD-07, AD-08, synchronization, integrity and Pages owners |

## 6. Constraints And Compatibility

- Preserve `UR -> PRD -> SD -> TP -> QA -> UAT` and every exact approval value.
- Do not make UX analysis a prerequisite for `none` or unambiguous `low` impact.
- Do not add a runtime JSON schema or CLI command unless implementation evidence proves the agent-native
  contract cannot be validated through existing owners; any such expansion requires SD revision.
- Preserve existing skill prefixes: none for Codex/Claude, `agdf-` for repository Copilot/OpenCode and
  `agdf-global-` for global OpenCode.
- Preserve installed/source/runtime-integrity layout support.
- Keep durable artefacts and runtime rules English and user-facing chat localized by existing policy.
- Preserve deterministic evaluation thresholds at 100%.
- Repository tests can prove contract behavior and package parity, not live host-visible rendering.

## 7. Test And Evidence Strategy

TP must include focused evidence for:

1. Greenfield and Brownfield classification for `none | low | medium | high`;
2. required, optional and not-applicable routing without a new gate;
3. skill output completeness and `ready | blocked | not_applicable`;
4. ambiguous intent, conflicting modes/state authority, missing recovery, contradictory evidence and
   unauthorized product-intent creation;
5. durable supporting-analysis template authority boundaries;
6. mandatory PRD UX sections and explicit not-applicable handling;
7. PRD-to-TP and TP-to-surface fidelity statuses and gap types;
8. QA rejection of incomplete applicable UX fidelity evidence;
9. canonical skill definition, router and Pages parity;
10. normal/boundary/adversarial deterministic skill evaluations;
11. source-to-generated sync idempotence and package contents;
12. runtime integrity, routing, aggregate smoke and Pages check/build; and
13. Context Graph reconciliation before closeout.

## 8. Risks And Open Questions

- Static nine-skill statements or expected-file lists may exist outside dynamic `skillSet` consumers;
  TP must inventory them before implementation.
- The supporting analysis template must remain outside the user-gate artefact parser and cannot be
  mistaken for PRD authority.
- The post-UR review name is Brownfield-oriented, but it remains the existing unified proportional
  routing owner; Greenfield records must make their context and not-applicable Brownfield evidence clear.
- A terse skill could omit enough semantics to make results inconsistent; behavioral cases and template
  fields must prove completeness without duplicating the PRD.

No unresolved architecture decision prevents Task/Test Plan drafting after SD approval.

## 9. Revision 16 Architecture: Normalized Review Gaps

### AD-10: One normative taxonomy owner

Add a `Normalized Review Gaps` section to `plugin/meta/contracts/quality.md`. It is the only complete
owner of the six gap meanings and their default routing targets. Consumer skills load this focused
contract and may name allowed values in output guidance, but must not reproduce the complete mapping.

`none` remains a presentation sentinel for a fulfilled UX Intent Fidelity row. It is not a seventh
finding type and cannot appear in a normalized finding.

### AD-11: One compact finding shape

When a review reports an applicable gap, it emits one or more rows with fields in this order:

`finding_id | gap_type | routing_target | gap_status | evidence | required_next_step`

- `finding_id`: stable within the durable review report;
- `gap_type`: exactly one of the six PRD values;
- `routing_target`: exactly one of `UR | PRD | SD | TP | CD+Tests | evidence_obligation`;
- `gap_status`: exactly `open | resolved`;
- `evidence`: concrete source, diff, test, observation or missing-proof statement; and
- `required_next_step`: one executable next action consistent with the route.

Default target validation is deterministic for the first five types. `requirements_gap` may target
UR only when evidence shows changed user intent or scope; otherwise it targets PRD. `emergent_risk`
must include an explicit earliest-owner assessment and select one allowed target. A missing field,
unknown value, impossible fixed mapping or contradictory next step remains `open` and fails closed.

The shape is Markdown contract output, not a new persisted runtime model, parser, schema, CLI command
or mutable finding registry. Durable review artefacts remain the evidence owners.

### AD-12: Consumer boundaries

- `task-plan-review` retains its TP Coverage and UX Intent Fidelity outputs. A non-fulfilled fidelity
  row uses the shared finding semantics; `none` is allowed only on a fulfilled row. Any additional
  normalized finding uses AD-11.
- `clean-implementation-review` appends normalized findings only for actual gaps. Missing ownership,
  fallback policy, exit criterion or parallel-structure decision routes as `design_gap` or `plan_gap`;
  implementation that violates an approved decision is `implementation_gap`.
- `code-review` appends normalized findings for meaningful defects or upstream gaps. Concrete diff
  defects normally route to CD+Tests as `implementation_gap`; absent constraints route upstream;
  genuinely new risk uses `emergent_risk` and an earliest-owner assessment.
- `qa-gate` consumes all applicable normalized findings plus existing review decisions. It does not
  reclassify them. Any `open`, missing, unknown or contradictory finding prevents `pass`.

Compact pass output remains unchanged. Normalized finding detail lives in durable reports and appears
in chat only at `revise` or `block` according to existing output discipline.

### AD-13: Validation without a second engine

Extend `plugin/scripts/check-runtime-integrity.mjs` to assert the canonical contract fields, all six
types, target vocabulary, sentinel boundary and consumer references. It also rejects a consumer that
contains the complete private mapping table. Reuse existing deterministic skill-evaluation cases for
Task Plan, Clean, Code and QA, expanding their normal/boundary/adversarial expectations rather than
adding a new evaluator or skill.

Run existing `sync-package-assets` after canonical changes; derived Codex, Claude, Copilot and
OpenCode surfaces remain generated. Existing package contents, layout/negative integrity, routing and
aggregate smoke owners validate propagation. Pages changes are required only if public workflow copy
would otherwise contradict the normalized review contract; no new public section is designed.

### AD-14: Resolution and authority

Classification is non-authorizing. A route identifies where correction or decision must occur; only
the existing gate/artefact workflow can revise and approve UR, PRD, SD or TP. `resolved` requires
direct evidence in the review report that the routed correction or decision is complete. Review
skills cannot mark an upstream artefact approved, and QA remains the sole final Quality Readiness owner.

## 10. Revision 16 Acceptance Mapping

| PRD criteria | Design owner |
|---|---|
| UXI-AC-26 | AD-10 and canonical Quality Contract |
| UXI-AC-27..28 | AD-11, Runtime Integrity and negative cases |
| UXI-AC-29 | AD-12 Task Plan Review consumer |
| UXI-AC-30 | AD-12 Clean Review consumer |
| UXI-AC-31 | AD-12 Code Review consumer |
| UXI-AC-32..33 | AD-12 QA consumer and AD-14 authority boundary |
| UXI-AC-34..35 | AD-13 evaluation, integrity, sync and package evidence |

## 11. Revision 16 Test Ownership

- Runtime Integrity owns static contract vocabulary, output fields, sentinel and consumer-reference drift.
- Existing skill eval cases own normal, boundary and adversarial behavioral expectations for the four consumers.
- Focused evaluation fixtures cover every type and route at least once across the affected skills.
- Existing sync idempotence, package contents, installed layout, negative integrity and aggregate smoke
  prove generated multi-surface propagation.
- `git diff --check` and actual-diff Code Review remain mandatory before QA.

No unresolved technical decision prevents Task/Test Plan drafting after SD approval.

## 12. Next Step

Review this solution design and approve only with:

`Approval: SD`
