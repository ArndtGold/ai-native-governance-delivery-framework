# UX intent: Repository control compatibility

- decision: ready
- blocking_reason: none
- primary_user_intent: Recognize whether this repository needs maintenance and perform the available migration or repair here without reinstalling the plugin.
- success_signal: The user sees the correct repository, understands its compatibility state, chooses a concrete next action, and receives an accurately rechecked result with any remaining evidence needs.
- primary_decision_or_action: Start repository maintenance, defer it, or inspect details; separately apply only reviewed proposals.
- evidence: Approved `UR.md`; `BROWNFIELD_REVIEW.md`; existing control migration/repair, presentation/selection, session context and technical-consent owners inspected on 2026-09-30.
- missing_evidence: none for intent definition. New runtime integration and fresh-host execution are not implemented or evidenced yet.
- open_product_questions: none. The proposed product states below derive from the approved scope and preserve the existing maintenance safety rules; they become authoritative only through PRD approval.
- affected_outputs: Repository-facing compatibility notice, maintenance choices/proposals, final result, details and permitted retry guidance.
- required_next_step: Incorporate this input into the PRD and validate PRD readiness; technical ownership and transport remain SD decisions.

## Working Modes And Authority

| working_mode | effective_state_by_mode | visible_state_types | effective_state_authority_by_mode | primary_state_presentation_owner_by_mode |
|---|---|---|---|---|
| automatic_inspection | absent, current, migration required, repair required, unavailable | orientation, repository identity, compatibility summary and action hint | Current repository control compatibility inspection; the existing technical check permission decides whether it may run | Existing host startup/context surface presents a repository-facing notice; no interactive question in the hook |
| manual_inspection | Same states, freshly evaluated for the deliberately selected repository | Summary, details, unavailable reason and retry | Current compatibility inspection at the explicit target; Doctor delivery readiness is a separate fact | Existing maintenance text/structured result surface |
| guided_maintenance | Inspecting, proposals ready, deferred, applying, current, partial, repair still required or stale | Concrete affected runs, backup/reset consequence, selected originals, remaining inputs, progress and result | Canonical inspection and maintenance transactions; a deliberate repository-bound selection permits only the described maintenance | Existing maintenance assistant presents the reviewed choices, proposals and rechecked result |

These are conceptual user states, not a prescribed JSON schema, persisted workflow or component design. The PRD owns product behavior after approval; inspection and transactional outcomes remain factual authority.

## Activation And Deactivation

- activation_paths: Supported session-start inspection with effective existing technical consent; a deliberate repository maintenance invocation for the selected path; a fresh target check on a supported repository-oriented invocation when repository context changes.
- deactivation_paths: Existing technical manual/disabled mode stops automatic control inspection. Deferral leaves the repository unchanged and does not disable the global plugin. A later manual invocation re-evaluates the current repository.
- selection: The notice offers `1. Migration and repair`, `2. Later`, `3. Details` in the configured language. No selection is pre-submitted or inferred from inspection, plugin installation, previous repository choices, blank input or EOF.
- apply_boundary: Starting the assistant permits its read-only examination. Before writes the user sees exact repository, affected runs, backups and any approval reset; repair originals and differences are reviewed before deliberate application.
- escalation: Missing originals, unsafe control paths, unsupported formats or integrity conflicts remain visible required input. Available valid candidates may proceed under their own bound proposals without blessing the unresolved cases.

## Blockers And Recovery

| blocker | visible_feedback | permitted_recovery_or_next_action |
|---|---|---|
| Automatic checks disabled or not trusted | No claim that this repository was inspected; a manual entry remains available | Run a deliberate manual repository check within existing host permission |
| Repository identity unavailable | State unavailable, reason and one target-selection/retry action | Supply or reopen the intended repository; do not search adjacent repositories |
| Unreadable or transiently unavailable check | The check did not complete; compatibility is unknown | Retry read-only inspection for this path |
| Missing original or descriptive reference | Name the affected run and missing original/reference; no fabricated completion | Restore a provable original or correct the reference deliberately, then recheck |
| Stale proposal or repository changed | Explain that the displayed proposal no longer applies | Reinspect the selected repository and obtain a new proposal/selection |
| Lock contention or interrupted transaction | Identify the pending operation and preserved backup; do not claim success | Follow the existing transaction recovery or retry after the lock is released |
| Host denies maintenance execution | Visible host permission failure; repository unchanged unless a preceding completed transaction is reported separately | Obtain the existing native permission or use the documented permitted manual path; no broad bypass |

## Relevant State Transitions

| trigger | source | target | feedback_and_next_action | failure_or_rollback |
|---|---|---|---|---|
| Permitted startup or deliberate inspection | Unknown repository compatibility | Fresh inspected state | Show the exact repository and maintenance hint only when needed | Unavailable remains unknown and offers a read-only retry; no writes |
| Later, blank input or EOF | Notice/proposals | Deferred | Explain that maintenance was deferred | No journal, state update or default application |
| Details | Notice/proposals | Same effective state | Expand affected runs and concrete diagnostics; return to the same choices | No mutation or implied agreement |
| Start | Maintenance needed | Read-only assistant/proposals | Show migration consequences and concrete repair candidates before application | No missing evidence or approvals are invented |
| Deliberate apply | Reviewed repository-bound proposals | Current, partial or still requires repair | Recheck actual state; show backups, completed changes, approval reset and remaining inputs | Reject stale/unsafe writes; preserve completed transactions and the existing recoverable original snapshots |
| Repository switch | Previous repository notice | New repository unknown/freshly inspected | Discard the previous notice/selection as authority for this target; recheck on its supported entry path | Never apply the previous proposal to the new repository |
| Repeat after completion/interruption | Current or pending operation | Rechecked current state or supported recovery | No unnecessary second migration/revision; explain a required recovery explicitly | Existing journal/conflict checks retain ownership of rollback and resume |

## Proposed PRD Acceptance

Candidate dimensions are exact repository identity, separate compatibility/readiness, automatic read-only execution, context-change revalidation, deliberate 1/2/3 selection, canonical migration/reset, provable repair, local conflict/recovery behavior, direct installed-runtime reachability, accurate rechecked results, localization and honest host evidence. They are incorporated with stable IDs into `PRD.md`; this analysis creates no parallel acceptance register.
