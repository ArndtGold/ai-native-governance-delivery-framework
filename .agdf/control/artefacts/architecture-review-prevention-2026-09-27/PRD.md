# PRD: Architecture Debt Prevention in Brownfield Analysis

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-09-27
Owner: Arndt Gold (AGDF Brownfield policy)

## 1. Product Scope

Strengthen the existing post-UR Brownfield Review so that, for changes with material architecture impact or unresolved architectural uncertainty, it records the impact, repository evidence, missing evidence, and the owner of the next decision before PRD/SD depth or implementation is chosen.

The review must distinguish an evidence-backed architecture problem from an intentional trade-off. If a trade-off retains or adds debt, the existing run artefact records its rationale, accountable owner, mitigation, and review date or exit condition. Low-impact changes may be marked `architecture-not-applicable` with a reason and no additional gate or review ceremony.

Use repository evidence to assess affected ownership and module boundaries, interfaces, coupling, data and source-of-truth ownership, compatibility, and migration impact when relevant. Use a diagram only when it clarifies an affected boundary or dependency. Route unresolved product, architecture, and implementation decisions to their existing authoritative phase and owner.

Keep the existing Brownfield Review as the sole pre-PRD sizing and routing step. Reuse the existing `BROWNFIELD_REVIEW.md` and run control. Preserve the existing Modes contract as the sole owner of structured-depth rules, and the existing Quality contract as the owner of normalized review-gap routes.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: justified not_applicable — this changes internal AGDF delivery guidance, not a product interface or user-facing capability.
- primary_user_intent: AGDF contributors and agents should see architecture risks and evidence gaps before committing to implementation choices, while low-impact changes remain lightweight.
- success_signal: Relevant reviews explain architecture impact and evidence before planning; justified trade-offs are explicit; low-impact reviews name why deeper analysis is not applicable; no new gate is added.
- primary_decision_or_action: The Brownfield reviewer records impact and chooses the existing proportional route or sends an unresolved decision to its current owner.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Architecture-relevant Brownfield change | Brownfield Review contains an evidence-backed impact assessment and a next route before PRD/SD depth is chosen. | `none`, `low`, `medium`, `high`; evidence; missing evidence; problem or trade-off; owner and next action. | Approved UR plus repository evidence and the existing Brownfield/Mode-Slice contracts. | Existing `BROWNFIELD_REVIEW.md` and Run Status Card. |
| Low-impact change | Review records `architecture-not-applicable` and a reason; no extra approval or analysis stage is introduced. | Not-applicable reason and existing next gate. | Existing Brownfield reviewer under the approved UR and gate-transition contract. | Existing `BROWNFIELD_REVIEW.md` and Run Status Card. |
| Unresolved architecture decision | The review keeps the uncertainty visible and routes it to the existing product, architecture, or implementation owner; implementation stays closed until its existing required decisions are resolved. | Open evidence/decision gap, named owner when known, current gate, and precise next action. | Existing phase owner and current AGDF control state. | Existing `BROWNFIELD_REVIEW.md` and Run Status Card. |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Run this analysis only in the existing post-UR Brownfield Review when repository evidence indicates material architecture impact or unresolved architecture uncertainty. For low-impact changes, record `architecture-not-applicable` with a reason in the same review. It adds no new activation command, gate, approval, or deactivation behavior.
- blockers_and_visible_next_actions: Missing or conflicting facts that decide a safe route remain explicit and use the existing `block`/Mode-Slice recovery path. Other unresolved product, architecture, and implementation decisions name the existing owner and required gate. Do not claim a risk is absent when repository evidence is missing.
- recovery_paths: Record the missing source or evidence owner and the exact re-evaluation step in the existing Brownfield Review. If a host has stale plugin content, refresh through its existing installation lifecycle and start a fresh session before claiming that host loaded the change.
- relevant_state_transitions: After approved UR, Brownfield Review records the architecture impact and Mode/Slice Decision in one internal operation. The existing route determines PRD depth. `Approval: UR` alone never opens implementation; later user gates remain unchanged.

## 5. Acceptance Criteria

### AC-ARCH-01 — Evidence-backed impact before planning

- criterion_id: `AC-ARCH-01`
- working_mode: Architecture-relevant Brownfield change
- source_state: Approved UR; Brownfield Review is the current internal step.
- trigger/action: The reviewer assesses repository evidence for a change with material architecture impact or architectural uncertainty.
- expected effective state: The review names the impact, evidence, missing evidence, and affected existing owners/source-of-truth boundaries before PRD/SD depth is selected.
- visible feedback: The existing Brownfield Review artefact shows the finding and next action.
- blocker/failure behavior: Missing or conflicting decisive facts remain open and use the existing fail-closed route.
- recovery/next action: Obtain the named evidence from its owner, then re-evaluate Brownfield/Mode-Slice using the same run.
- observable success: A reader can trace each material architecture conclusion to repository evidence or see it marked unknown.
- required evidence: Completed Brownfield Review with impact and evidence references.

### AC-ARCH-02 — Problem versus intentional trade-off

- criterion_id: `AC-ARCH-02`
- working_mode: Architecture-relevant Brownfield change
- source_state: Approved UR; relevant architecture finding or alternative is observed.
- trigger/action: The reviewer classifies the finding before implementation planning.
- expected effective state: An evidence-backed problem is distinguished from a justified trade-off, with the affected owner and next step visible.
- visible feedback: The existing review identifies the classification, rationale, evidence, and owner/route.
- blocker/failure behavior: Unsupported claims and unresolved classification remain explicit; the reviewer does not normalize a workaround as acceptable solely because it is documented.
- recovery/next action: Route the missing product decision to PRD, the technical design decision to SD, or the missing plan/evidence to its existing owner.
- observable success: The finding has one defensible classification and one existing authoritative next owner.
- required evidence: Review finding linked to source, contract, or other concrete repository evidence.

### AC-ARCH-03 — Recording accepted debt

- criterion_id: `AC-ARCH-03`
- working_mode: Architecture-relevant Brownfield change with retained debt
- source_state: A justified trade-off knowingly retains or introduces debt.
- trigger/action: The reviewer records acceptance of that trade-off.
- expected effective state: The same run artefact records rationale, accountable owner, mitigation, and a review date or exit condition.
- visible feedback: The accepted debt and its owner/condition are visible in the existing Brownfield Review.
- blocker/failure behavior: A retained debt item without these fields remains unresolved and cannot be described as accepted.
- recovery/next action: Resolve the missing decision with the existing owner before the next applicable gate.
- observable success: No second debt backlog or architecture finding registry is required to understand the decision.
- required evidence: Completed Brownfield Review entry with concrete rationale, owner, mitigation, and review/exit evidence.

### AC-ARCH-04 — Proportionate not-applicable path

- criterion_id: `AC-ARCH-04`
- working_mode: Low-impact change
- source_state: Repository evidence shows no material architecture impact or unresolved architecture question.
- trigger/action: The reviewer completes the post-UR assessment.
- expected effective state: The review may say `architecture-not-applicable` and gives a reason.
- visible feedback: The reason appears in the existing review; no extra approval, mandatory diagram, or separate audit is requested.
- blocker/failure behavior: A low-impact label without evidence or reason does not satisfy this criterion.
- recovery/next action: Add the rationale or route any uncovered material impact through the existing Mode/Slice Decision.
- observable success: The same existing Brownfield step remains sufficient for low-impact work.
- required evidence: Completed review showing the not-applicable reason and existing route.

### AC-ARCH-05 — Existing decision owners and review boundaries

- criterion_id: `AC-ARCH-05`
- working_mode: Any Brownfield change with an unresolved decision or later implementation
- source_state: Brownfield Review, PRD/SD, implementation, or post-implementation review.
- trigger/action: A finding is routed or later evaluated.
- expected effective state: Product intent goes to its existing product owner/UR/PRD; technical architecture decisions go to SD; plan gaps follow the existing quality routes; actual implementation defects remain in Code Review; solution cleanliness remains in Clean Implementation Review.
- visible feedback: The current artefact names the existing owner and next gate without adding a competing route.
- blocker/failure behavior: No new gate, approval authority, finding taxonomy, or duplicate checklist is created.
- recovery/next action: Return the decision to its authoritative existing owner and update the same run evidence.
- observable success: Brownfield provides earlier evidence and routing without replacing downstream reviews.
- required evidence: Brownfield Review, existing gate-transition/modes/quality contracts, and later review artefacts when applicable.

### AC-ARCH-06 — Shared plugin delivery

- criterion_id: `AC-ARCH-06`
- working_mode: Plugin update on Codex, Claude, Copilot or OpenCode
- source_state: Canonical `plugin/` content has been updated and generated payloads prepared.
- trigger/action: The update is installed and loaded on each host claimed as supported for the change.
- expected effective state: Each of Codex, Claude, Copilot and OpenCode exposes the same approved guidance from the generated source; stale sessions are not reported as current.
- visible feedback: Host-specific version/provenance and a fresh-session observation are recorded for the tested surface.
- blocker/failure behavior: A source/package match alone does not claim live behavior on an unobserved host.
- recovery/next action: Refresh through that host's existing installation flow, restart it, and repeat the bounded observation.
- observable success: Each of the four agreed hosts has direct fresh-session evidence of the loaded guidance before cross-host acceptance is claimed; unobserved surfaces are named.
- required evidence: Generated payload integrity plus direct fresh-session observation for each host in the agreed release scope.

### AC-ARCH-07 — Optional diagrams

- criterion_id: `AC-ARCH-07`
- working_mode: Architecture-relevant Brownfield change
- source_state: A boundary or dependency may be unclear from existing repository evidence.
- trigger/action: The reviewer considers whether a diagram helps resolve that specific uncertainty.
- expected effective state: A diagram is used only when it clarifies affected boundaries/dependencies; otherwise repository references and concise prose suffice.
- visible feedback: The review states why a diagram was or was not useful when the question is relevant.
- blocker/failure behavior: No diagram is required for every change and no diagram substitutes for source evidence.
- recovery/next action: Route unresolved ownership or dependency questions to the existing owner.
- observable success: The review adds no diagram ceremony where it would not change a decision.
- required evidence: Relevant repository links and, only when useful, the focused diagram.

## 6. Non-Goals

- Add a new gate, approval authority, parallel architecture findings registry, or debt backlog.
- Run an exhaustive architecture audit for every delivery.
- Replace Code Review, Clean Implementation Review, or QA.
- Remediate all existing technical debt as part of this change.
- Import ASE's checklist or findings format wholesale.
- Mandate an architecture diagram for every change.

## 7. Users And Roles

- Affected users: AGDF contributors and agents preparing changes in existing repositories; repository maintainers deciding product and technical direction.
- Brownfield reviewer: gathers repository evidence, names uncertainty, and routes decisions; does not approve product or architecture policy on behalf of the owner.
- Product/requirements owner: resolves user intent and acceptance scope through existing UR/PRD ownership.
- Technical/design owner: resolves architecture, source-of-truth, migration, and interface decisions through existing SD ownership.
- Policy owner: Arndt Gold, confirmed by the user on 2026-09-28.
- Approval authority: existing exact gate approval only; no new approver or delegated authority is introduced.

## 8. Constraints

- `plugin/` is the canonical source projected by `create-agdf/scripts/sync-package-assets.js`; generated profiles must not become parallel sources of truth.
- `modes.md` remains the sole owner of structured-depth triggers and bounded-slice checks.
- `quality.md` remains the sole owner of normalized review-gap classes and routing.
- The Brownfield Review stays an internal post-UR step; no new approval or implementation authority is introduced.
- Findings and accepted-debt rationale remain in the existing run artefacts. Context Graph changes are curated separately and are not automatic.
- Host claims must match direct evidence; an installed package or source digest alone does not prove a fresh host loaded the behavior.

## 9. Evidence Requirements

- Source review of the Brownfield skill, gate-transition/modes/quality contracts, and existing Clean Implementation/Code Review boundaries.
- Skill evaluation cases for: evidence-backed architecture risk; justified retained debt; missing owner/evidence; low-impact `architecture-not-applicable`; and no duplicate gate, debt registry, or review checklist.
- Structural/runtime-integrity evidence that generated host profiles preserve the canonical skill and contract content.
- Direct fresh-session evidence for Codex, Claude, Copilot and OpenCode before claiming acceptance on those hosts; separately report unobserved hosts. The delivery implementer records the observations for the policy owner's review.
- Later QA evidence mapped to these criteria; no test or host pass is presumed by this PRD.

## 10. Risks And Open Questions

- Define the proportional trigger threshold with examples that distinguish material architecture impact from low-impact work without turning the review into an exhaustive checklist.
- Confirm the smallest evidence format for findings and retained debt, including the review date/exit condition, within `BROWNFIELD_REVIEW.md`.
- Determine whether any architecture diagram adds decision value for the selected boundaries; diagrams remain optional.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Accountable AGDF Brownfield policy owner | before_prd | resolved | Arndt Gold, confirmed by the user on 2026-09-28. | Arndt Gold |
| Direct fresh-session host acceptance scope | before_prd | resolved | Codex, Claude, Copilot and OpenCode, confirmed by the user on 2026-09-28. | Arndt Gold |
| Proportional architecture trigger and compact finding format | later_sd | open | Define in SD within the approved Brownfield route. | Arndt Gold |
| Direct host observation assignments and evidence | later_tp | open | Assign execution and evidence review in TP; record each host observation. | Arndt Gold |

## 11. Next Step

This revision includes the decisions confirmed after the earlier PRD approval. Review this revised PRD
as a new approval decision. The previous approval does not carry forward. Approve only with:

`Approval: PRD`
