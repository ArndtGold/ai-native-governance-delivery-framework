# PRD: Define UX Intent And Route Review Gaps Upstream

Status: approved
Gate: PRD
Gate approval: approved (`Approval: PRD`, 2026-07-19; revision 15)
Based on: approved UR revision 14 and Brownfield Review revision 15
Date: 2026-07-19
Owner: user

## 1. Product Scope

AGDF must define UX intent before implementation and carry that intent through one traceable
requirements-to-evidence chain.

The product scope is:

1. add a conditional canonical `ux-intent-definition` skill that produces structured analytical
   input before PRD drafting;
2. use one UI/UX impact classification for Greenfield and Brownfield routing;
3. expand the canonical PRD template so UX intent, working modes, effective state, visible state
   types, activation, blockers, recovery and relevant transitions become explicit requirements;
4. keep the approved PRD as the sole authority for product behavior and acceptance criteria;
5. require TP traceability from each applicable UX criterion to tasks, tests and visible evidence;
6. add `UX Intent Fidelity` to Task Plan Review as implementation-fidelity evidence; and
7. require QA to consume that evidence without changing `qa-gate` ownership.

The canonical skill, routing and template changes must propagate to all supported generated package
surfaces through the existing synchronization owner.

## 2. Users And Roles

- **Product requester:** states user intent, context, primary decision/action and success signal and
  approves UR and PRD.
- **Delivery agent:** performs proportional routing, invokes the conditional skill when required,
  drafts the PRD and preserves traceability without inventing product decisions.
- **PRD reviewer:** decides whether the proposed product behavior and acceptance criteria are
  authoritative enough for Solution Design.
- **Implementation reviewer:** uses Task Plan Review to verify PRD-to-TP and TP-to-surface fidelity.
- **QA decision owner:** `qa-gate` makes the sole final `pass | revise | block` decision.
- **End user:** must be able to understand the effective state, primary action, blockers and recovery
  behavior of the affected capability.

## 3. UX Intent Definition And Routing

### 3.1 Shared impact classification

The routing contract must classify UI/UX impact as exactly one of:

- `none`: no user-facing capability, decision, state, feedback or recovery behavior changes;
- `low`: a bounded user-facing change preserves existing intent, working modes, state semantics,
  activation and recovery behavior and these remain unambiguous in the PRD;
- `medium`: the change introduces or materially alters a bounded capability's primary action,
  working mode, effective state, visible state type, blocker, activation or recovery behavior; or
- `high`: the change spans multiple capabilities or working modes, creates competing or safety-
  relevant state authorities, introduces irreversible/high-consequence decisions or materially
  changes cross-surface activation and recovery behavior.

The same vocabulary and decision meaning must apply to Greenfield and Brownfield work.

### 3.2 Greenfield trigger

After `Approval: UR`, post-UR proportional routing must classify UI/UX impact before PRD drafting.
Invoke `ux-intent-definition` for `medium` or `high`, allow it for `low` when product semantics remain
ambiguous and record `not_applicable` for `none`.

### 3.3 Brownfield trigger

After `Approval: UR`, Brownfield Review must classify UI/UX impact from existing-system evidence
before PRD drafting. Invoke `ux-intent-definition` for `medium` or `high`, allow it for `low` when
existing behavior or ownership remains ambiguous and record `not_applicable` for `none`.

The skill is an internal analytical step. It is not an AGDF user gate and cannot authorize later
artefacts or implementation.

## 4. UX Intent Definition Contract

The skill must produce these fields, populated or explicitly `not_applicable`:

- `primary_user_intent`
- `success_signal`
- `primary_decision_or_action`
- `working_modes`
- `effective_state_by_mode`
- `visible_state_types`
- `effective_state_authority_by_mode`
- `primary_state_presentation_owner_by_mode`
- `activation_paths`
- `blockers`
- `recovery_paths`
- `relevant_state_transitions`
- `proposed_prd_acceptance_criteria`
- `open_product_questions`
- `evidence`
- `missing_evidence`
- `required_next_step`

`effective_state_authority_by_mode` identifies the product or system source that decides what is
effectively true. `primary_state_presentation_owner_by_mode` identifies the primary user-facing
surface that communicates the effective state and next action. Technical storage, derivation and
component ownership remain Solution Design concerns.

The skill must return exactly one decision:

- `ready`: reliable analytical input exists for PRD drafting;
- `blocked`: required product semantics or evidence are unresolved; or
- `not_applicable`: no relevant user-facing intent, state or recovery behavior is affected.

A `blocked` result must include `blocking_reason`, `open_product_questions`, `affected_outputs`,
`required_next_step`, `evidence` and `missing_evidence`. It must prevent the PRD from being treated as
ready while the blocking questions remain unresolved.

Conflicts with approved UR intent must route to UR revision. Material product change found after PRD
approval must route to PRD revision or, when user intent or scope changes, UR revision. The skill must
not silently reinterpret an approved artefact.

When durable AGDF state exists, the structured result may be persisted as run-scoped supporting
analysis and linked from the PRD. It remains non-authorizing analytical input. Upon PRD approval, the
PRD is the sole authority for accepted product behavior and acceptance criteria.

## 5. Mandatory PRD UX Contract

Every PRD must explicitly state applicability for:

- primary user intent and observable success signal;
- primary decision or action;
- user-relevant working modes;
- effective state by mode;
- visible state types;
- effective-state authority and primary presentation owner;
- activation and deactivation behavior;
- blockers and their user-visible next action;
- recovery paths, including visible retry for recoverable transient failure; and
- relevant state transitions and visible feedback.

For `medium` and `high` impact, these requirements must be derived from a `ready`
`ux-intent-definition` result. For `low`, the PRD author may define them directly. `not_applicable`
must be explicit and justified; omission is not equivalent to not applicable.

Each UX acceptance criterion must include:

- stable `criterion_id`;
- relevant `working_mode`;
- `source_state`;
- triggering action or condition;
- expected effective state;
- visible feedback;
- blocker or failure behavior;
- recovery or next action;
- observable success; and
- required evidence.

The criteria specify observable product behavior and user outcomes, not components, frameworks,
styles, data structures, endpoints or other implementation mechanisms.

## 6. Acceptance Criteria

### Routing and proportionality

- **UXI-AC-01:** Greenfield and Brownfield routes use the same `none | low | medium | high` impact
  vocabulary and the classification meaning defined in this PRD.
- **UXI-AC-02:** `medium` and `high` classifications deterministically require
  `ux-intent-definition` before PRD readiness; `low` permits omission only when mandatory PRD fields
  are unambiguous; `none` records `not_applicable`.
- **UXI-AC-03:** The conditional skill is represented as an internal analytical step and never as a
  user gate, approval value or implementation permission.

### Skill decision and fail-closed behavior

- **UXI-AC-04:** The skill emits exactly `ready | blocked | not_applicable` and provides every required
  output or an explicit justified `not_applicable` value.
- **UXI-AC-05:** Ambiguous user intent, conflicting working modes, ambiguous effective state,
  unresolved state authority, material activation/blocker/recovery decisions or missing/
  contradictory Brownfield evidence produce `blocked` with the required decision fields.
- **UXI-AC-06:** A blocked result prevents PRD readiness and names the next product decision without
  silently resolving it.
- **UXI-AC-07:** Conflicts with approved UR or PRD semantics route to the correct artefact revision and
  never mutate approved intent through analysis output.

### State and ownership semantics

- **UXI-AC-08:** Every relevant working mode identifies its effective state, visible state types and
  `effective_state_authority_by_mode`.
- **UXI-AC-09:** Every relevant working mode identifies one
  `primary_state_presentation_owner_by_mode`; supporting representations may exist but cannot become
  competing sources of truth.
- **UXI-AC-10:** Product/system authority and presentation ownership remain distinct from technical
  component, persistence and derivation ownership reserved for Solution Design.
- **UXI-AC-11:** Each blocker states what is blocked, why, the available next action and whether the
  condition is temporary, resolvable or final.
- **UXI-AC-12:** Each recoverable failure has a visible, actionable recovery path; transient failures
  include visible retry behavior.
- **UXI-AC-13:** Relevant transitions identify trigger, source state, target state, visible feedback,
  next action and failure or rollback behavior where applicable.

### PRD authority and traceability

- **UXI-AC-14:** The canonical PRD template contains explicit UX-intent, working-mode, effective-state,
  activation/blocker/recovery and state-transition prompts rather than relying only on `Users And Roles`.
- **UXI-AC-15:** Proposed criteria from the skill become authoritative only after incorporation into
  and approval of the PRD; supporting analysis never becomes a parallel product SoT.
- **UXI-AC-16:** Every applicable approved UX criterion is mapped in TP as
  `PRD criterion -> working mode/state -> task_id -> implementation/test -> visible evidence`.

### Review and QA

- **UXI-AC-17:** Task Plan Review contains a distinct `UX Intent Fidelity` result with PRD criterion,
  working mode/state, mapped `task_id`, visible evidence and `fulfilled | partial | missing` status.
- **UXI-AC-18:** Task Plan Review verifies both PRD-to-TP coverage and TP-to-code/surface fulfilment.
- **UXI-AC-19:** When an implementation-relevant UX requirement is absent from the PRD, Task Plan
  Review reports `requirements_gap` and routes to PRD revision instead of inventing a criterion.
- **UXI-AC-20:** QA cannot return `pass` when an applicable UX Intent Fidelity criterion is partial,
  missing, not verifiable or backed only by code evidence where visible behavior is claimed.
- **UXI-AC-21:** `qa-gate` remains the sole final Quality Readiness decision owner.

### Distribution and evidence integrity

- **UXI-AC-22:** The canonical skill inventory, router and Pages catalogue expose
  `ux-intent-definition` with consistent discovery and authority boundaries.
- **UXI-AC-23:** Existing synchronization generates matching Codex, Claude Code, GitHub Copilot and
  OpenCode skill surfaces without hand-edited derived copies.
- **UXI-AC-24:** Behavioral evaluations include at least one normal, boundary and adversarial case for
  the new skill, including ready output, fail-closed ambiguity and attempted authority expansion.
- **UXI-AC-25:** Runtime integrity, routing, package and Pages validation fail on missing skill assets,
  router drift, evaluation gaps or generated-surface mismatch.

## 7. Non-Goals

- Adding a new AGDF user gate or approval value.
- Creating a standalone post-implementation `ux-intent-review` skill.
- Making analytical output authoritative alongside the PRD.
- Prescribing UI styling, component libraries or technical architecture in product requirements.
- Replacing Solution Design ownership of technical state storage, derivation and component boundaries.
- Replacing Code Review, Clean Implementation Review, Task Plan Review, QA or UAT.
- Requiring the full skill for `none` or unambiguous `low` UI/UX impact.
- Claiming live host-visible behavior from repository tests alone.

## 8. Constraints

- Existing gate order and exact approval values remain unchanged.
- Durable artefacts remain English; configured user-facing interaction remains German.
- `plugin/meta/agdf-plugin.definition.json` remains the canonical skill inventory.
- `plugin/` source is authoritative; `create-agdf/generated/` remains derived output.
- Existing synchronization, integrity and skill-evaluation owners must be extended rather than
  duplicated.
- The skill body must remain concise, use valid skill metadata and carry complete trigger information
  in its discovery description.
- Existing consumers of the nine-skill inventory must migrate atomically to the new canonical count.

## 9. Evidence Requirements

QA evidence must include:

- focused tests for Greenfield and Brownfield impact routing across all four impact values;
- focused skill contract tests for `ready`, `blocked` and `not_applicable`;
- negative tests for ambiguous effective state, unresolved ownership, contradictory Brownfield
  evidence, missing recovery and attempted UR/PRD authority expansion;
- PRD template assertions for every mandatory UX requirement group;
- Task Plan Review tests for full fidelity, partial/missing surface evidence and `requirements_gap`;
- QA tests proving applicable UX gaps cannot pass;
- normal, boundary and adversarial deterministic skill evaluations;
- source-to-generated synchronization and idempotence evidence;
- runtime-integrity and routing-render evidence;
- package contents/smoke evidence for supported coding-agent surfaces;
- Pages data/evaluation checks and build evidence; and
- direct visible runtime or UI evidence whenever the delivered claim depends on host-visible behavior.

## 10. Risks And Open Questions

- SD must choose one canonical runtime-contract location for impact classification and conditional
  skill routing without duplicating the gate transition model.
- SD must define the run-scoped supporting-analysis path and lifecycle without making it a recognized
  user-gate artefact or second SoT.
- SD must determine the smallest router, manifest, Pages and help-copy changes needed for discoverability.
- TP must enumerate every explicit generated-surface and skill-count consumer identified by
  Brownfield Review.
- Context Graph reconciliation remains required before clean closeout for the reusable UX definition
  and verification invariant.

No product decision remains open that prevents Solution Design after PRD approval.

## 11. Shared Review Gap Contract

The existing Quality Contract must become the single authority for normalized review-gap semantics.
An applicable finding carries exactly one `gap_type` and one explicit `routing_target`:

| gap_type | meaning | routing_target |
|---|---|---|
| `requirements_gap` | approved product behavior or acceptance criterion is missing or contradictory | PRD revision; UR revision when user intent or scope changed |
| `design_gap` | technical ownership, architecture, fallback policy, exit criterion or prohibited parallel structure was not decided | SD revision |
| `plan_gap` | an approved requirement or design obligation lacks an executable task, test or evidence mapping | TP revision |
| `implementation_gap` | code or surface does not fulfil an approved requirement, design or task | CD+Tests correction |
| `evidence_gap` | implementation may be correct, but required test, runtime or visible evidence is absent or insufficient | mapped test or evidence obligation |
| `emergent_risk` | the implementation exposes a concrete risk not reasonably decidable from existing approved artefacts | explicit assessment, then the earliest affected artefact or execution step |

`task-plan-review`, `clean-implementation-review`, `code-review` and `qa-gate` must reference this
contract rather than maintain private taxonomies. Unknown, missing or contradictory classifications
fail closed. Classification routes work; it never edits an artefact, approves a gate or replaces the
review skill's own decision.

Review boundaries remain distinct:

- Task Plan Review verifies approved requirement-to-task-to-evidence coverage.
- Clean Review verifies the implementation against approved ownership, reuse, fallback, exit and
  parallel-structure decisions; an absent upstream decision is a `design_gap` or `plan_gap`.
- Code Review owns concrete diff defects, security/data-integrity issues, regressions and emergent
  implementation risks; it routes missing upstream constraints without inventing them.
- QA remains the sole final `pass | revise | block` owner and consumes normalized unresolved gaps.

## 12. Revision 15 Acceptance Criteria

- **UXI-AC-26:** `plugin/meta/contracts/quality.md` defines exactly the six applicable review-gap
  types, their meanings and authoritative routing targets shown in this PRD.
- **UXI-AC-27:** Every applicable finding from Task Plan Review, Clean Review or Code Review includes
  exactly one canonical `gap_type`, one `routing_target`, concrete evidence and one required next step.
- **UXI-AC-28:** Unknown, omitted or contradictory gap types or routing targets fail closed and cannot
  be normalized silently by a consumer skill.
- **UXI-AC-29:** Task Plan Review consumes the shared contract for requirements, plan,
  implementation and evidence gaps while preserving its UX Intent Fidelity matrix and review-only authority.
- **UXI-AC-30:** Clean Review classifies absent canonical ownership, fallback policy, exit criteria or
  parallel-structure decisions as `design_gap` or `plan_gap`, while actual non-conforming code remains
  `implementation_gap`; it does not invent the missing decision.
- **UXI-AC-31:** Code Review preserves ownership of concrete correctness, security, data-integrity,
  compatibility and regression findings; missing upstream constraints route to PRD, SD or TP and
  genuinely new risks use `emergent_risk` with explicit earliest-owner assessment.
- **UXI-AC-32:** QA cannot return `pass` while any applicable normalized gap remains unresolved,
  unclassified, contradictory or supported by insufficient evidence; `qa-gate` remains the sole decision owner.
- **UXI-AC-33:** Classification and routing never mutate PRD, SD or TP, create a user gate, approve a
  transition or create a second review/QA decision owner.
- **UXI-AC-34:** Normal, boundary and adversarial evaluations cover all six types, upstream routing,
  concrete Code Review defects, emergent-risk assessment, unknown values and attempted authority expansion.
- **UXI-AC-35:** Runtime Integrity and generated-package tests fail on taxonomy drift, private consumer
  mappings, missing output fields or cross-surface skill drift; canonical sync remains idempotent.

## 13. Revision 15 Evidence Requirements

- focused contract assertions for the six values and routing targets;
- consumer assertions proving all three review skills reference the shared owner;
- positive cases for each gap type and negative cases for missing, unknown and contradictory values;
- Code Review cases separating concrete implementation defects from missing upstream constraints;
- Clean Review cases separating absent design/plan decisions from non-conforming implementation;
- QA cases proving every unresolved or invalid classification prevents `pass`;
- normal, boundary and adversarial deterministic skill evaluations for affected consumers;
- Runtime Integrity, generated-surface synchronization/idempotence, package contents and aggregate smoke; and
- direct visible evidence only if public or host-visible behavior is changed or claimed.

No product question remains open that prevents Solution Design after PRD approval. SD must select
one compact finding shape, define resolution semantics without adding a state store and identify the
minimal test owners.

## 14. Next Step

Review this PRD and approve only with:

`Approval: PRD`
