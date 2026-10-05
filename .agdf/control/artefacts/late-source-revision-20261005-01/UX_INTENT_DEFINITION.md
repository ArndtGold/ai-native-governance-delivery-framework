# UX Intent Definition: Controlled late source revision

- decision: ready
- blocking_reason: none
- run_id: late-source-revision-20261005-01
- date: 2026-10-05
- analyst: Codex
- analytical_authority: Supporting PRD input from approved UR and Brownfield Review; no gate, approval or technical design authority.
- primary_user_intent: Resolve a justified late requirement/design/planning change in the same active implementation run while understanding what was previously approved, which permission stops being effective, and which renewed decisions permit continuation.
- success_signal: The maintainer can inspect the bounded change and its consequences, deliberately request its application, inspect the returned source gate and exact preserved history, and follow the existing approval path without guessing whether old code, tests or approvals remain current.
- primary_decision_or_action: Review and explicitly request reopening at the earliest source gate whose meaning must change. Reopening itself is not approval of the replacement requirement, product, design or plan.
- working_modes: Current approved implementation; read-only revision preview; requested application; reopened source work; refused request; interrupted/retry recovery; historical inspection.
- visible_state_types: current/effective; proposed/non-authorizing; historical/superseded; awaiting renewed approval; stale/refused; outcome unknown/recovery required; committed revision with pending projection recovery.

## State and presentation by working mode

| working_mode | effective_state_by_mode | effective_state_authority_by_mode | primary_state_presentation_owner_by_mode | observable user outcome |
|---|---|---|---|---|
| Current approved implementation | Existing approved TP with required prerequisites permits its bound scope | Canonical evaluated run, exact current source/proof bindings and existing human approvals | Existing AGDF current-run control view | Current allowed work and selected run are visible; the proposed source change is not yet authorized |
| Read-only revision preview | Existing state remains effective; preview changes nothing | Same evaluated run; preview has no authority | Revision-impact view for the selected current run | Target/run/revision, reason, earliest changed source gate, approvals to preserve/supersede, affected artifacts/analyses/evidence and next approval path are reviewable |
| Requested application | Current authority is unchanged until a validated complete authority transition commits | Canonical revision owner validating exact target/run/current revision and current sources | Current-run revision outcome | Explicit intent applies only to the reviewed bound revision; an acknowledgement is not a gate approval |
| Reopened source work | Superseded approvals cannot permit current implementation; unaffected valid upstream authority remains | Fresh canonical gate evaluation and exact retained upstream sources | Existing AGDF current-run control view with historical references | Earliest affected gate and its permitted authoring work are visible; renewed decisions and invalidated downstream readiness are explicit |
| Refused request | No new authority or partial reset; current valid state remains, or existing integrity blocker remains closed | Existing canonical state and validation result | Selected-run blocker/recovery message | The refusal names a concrete reason and a useful correction; no success or approval is implied |
| Interrupted/retry recovery | Outcome may be unknown or committed but not fully reconciled; no assumption of permission | Canonical validated recovery/operation outcome, never a stale preview or the caller's guess | Selected-run recovery outcome | Show what is known, which revision is effective if proved, what remains incomplete, and the supported inspect/retry/recovery action |
| Historical inspection | Historical content/approvals do not authorize current work | Exact preserved historical evidence; current authority remains in the evaluated current run | Historical evidence view linked to the current run | Prior contents, digests, decisions and source relationships are attributable and clearly labeled as previous versions |

## Activation, blockers and recovery

- activation_paths: Explicit revision work intent for one confirmed target/run/current revision after review of the impact. Direct invocation and host interaction must carry the same meaning. Loading a skill, viewing history, running status or receiving a preview never applies a revision.
- deactivation_paths: Declining/cancelling before application leaves current run authority unchanged. Once committed, cancellation is not an automatic rollback and cannot reinstate old approvals. A different change requires a fresh supported current-revision request.
- blockers: Wrong or unbound target/run; stale revision or preview; invalid/missing source or approval integrity; unsupported lifecycle; unclear earliest source or contradictory impact; concurrent edit; unresolved prior operation outcome.
- recovery_paths: Select/correct the intended bound run; inspect current state and regenerate a stale preview; use the existing integrity recovery owner for an actually damaged state; narrow unsupported lifecycle/scope; resolve contradictory impact at its source owner. For a recoverable transient failure expose a supported visible retry after fresh state/operation inspection. Never blindly repeat an application when its commit outcome is unknown, and never ask a new gate approval as a substitute for fixing an integrity failure.
- relevant_state_transitions: Current implementation -> read-only preview -> cancel with no change OR explicit validated application -> reopened earliest source gate -> fresh source approval and required analyses -> renewed downstream artifacts/approvals -> revalidated implementation/test evidence. Any refused application leaves the previous effective state or existing blocker unchanged. Interruptions move to visible recovery rather than presumed success. Historical inspection stays read-only.

## Proposed PRD acceptance criteria

These are analytical proposals; the approved PRD will be the sole acceptance authority.

- The preview makes identity, source gate, reason, affected approvals/artifacts/analyses/evidence, retained work and next permitted action understandable before application.
- Read-only preview and cancellation have no effect on run content, revisions, approvals or implementation permission.
- The applied result distinguishes re-opening from approval, lists preserved and superseded approvals, names the new current gate and blocks implementation until renewed prerequisites permit it.
- Historical source versions and old approvals are inspectable but visibly separated from current permission; old replies cannot approve new content.
- Source-bound retained code/tests/reviews are not silently described as current successful evidence. Their required revalidation is visible.
- Stale/invalid/unsupported/concurrent requests show a concrete blocker and correct next action; recoverable failures expose inspect/retry/recovery without guessing the commit outcome.
- The earliest source gate is chosen from the change's meaning. A UR change cannot be presented as a design-only update just because the conflict was found during implementation.

## Evidence and decision boundary

- open_product_questions: none that prevent a PRD proposal within approved intent. The PRD must resolve the impact matrix and proportional analysis reuse/repetition; SD must choose archive, active-proof, atomicity and retry mechanics. This analysis does not choose component, endpoint, storage or layout.
- affected_outputs: PRD UX semantics and acceptance criteria; later SD realization, TP behavioral scenarios and visible evidence; existing control/status/history/recovery presentations.
- evidence: Approved UR Scope and Acceptance Signals 1-7; BROWNFIELD_REVIEW.md medium-impact route and owner findings; inspected Core run-revision, writer, source-proof and presentation paths; the separately recorded installed rejection in the design-author run.
- missing_evidence: No implemented late-revision interface or native-host observation exists yet. Product/design/plan and implementation evidence remain pending; readiness here means reliable analytical input for PRD drafting only.
- required_next_step: Record this ready analytical result with the current selected run and return to prd-definition from its exact approved UR and completed analyses.
