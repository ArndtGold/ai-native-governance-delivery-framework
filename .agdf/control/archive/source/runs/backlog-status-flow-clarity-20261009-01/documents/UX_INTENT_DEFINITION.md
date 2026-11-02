# UX Intent Definition: Clear backlog status and reliable update flow

- decision: ready
- blocking_reason: none
- run_id: backlog-status-flow-clarity-20261009-01
- source_ur: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/UR.md
- routing_evidence: BROWNFIELD_REVIEW.md; brownfield, medium UI/UX impact, required analysis
- primary_user_intent: Understand directly which undertaking still needs work or a decision, why it is open, and what permitted action comes next.
- success_signal: From a saved row the user can distinguish QA evidence collection from implementation, QA pass from human approval, and active membership from completion; source/freshness limitations are explicit without opening several reports.
- primary_decision_or_action: Select the undertaking requiring attention and inspect its bound current Run before a governed action. No approval or delivery action is added to the list.
- working_modes: Saved Markdown backlog reading; compact Cockpit overview; expanded Cockpit list; selected current Run detail; unavailable/partial/stale observation and explicit recovery.

## Effective State And Visible Authority

| Working mode | Effective state | Effective-state authority | Primary presentation owner | Visible state types |
|---|---|---|---|---|
| Markdown backlog | Saved summary at its recorded synchronization boundary; older rows may have unverified origin | Canonical Run/evidence owners produce the saved summary; the file is orientation, never an approval | Addressed backlog row and its inspectable references | phase; open obligation/result; next action; saved provenance/limitations |
| Compact overview | Same saved summary, bounded visible subset and current list query | Same saved source; no independent gate calculation | Compact undertaking row | short phase/open work and concrete next action; source details on demand |
| Expanded list | Same saved meaning for selected section/query | Same saved source; supplementary titles cannot change status or membership | Expanded undertaking row | readable full summary, next action and source details |
| Selected Run detail | Current bound evaluation of the explicitly selected Run | Existing Run/control and registered report evaluators; qa-gate and human approvals retain their authority | Existing selected Run state card/detail | evaluated gate, missing evidence/approval, permitted next action, disagreement with saved source |
| Partial/stale/unavailable | Known saved content with a limitation, or unavailable data; never an invented current status | Existing bound read/diagnostic owners | Existing read feedback and affected row/details | source unavailable, unsupported/ambiguous/unverified or stale; explicit recovery action |

- effective_state_by_mode: Defined in the table; saved and evaluated observations remain distinct even if their wording agrees.
- visible_state_types: Work phase, QA outcome when recorded, specific open obligation, exact approval state, lifecycle, saved/evaluated/limited observation. Report existence alone is not a quality outcome.
- effective_state_authority_by_mode: Defined in the table; the UX analysis and React presentation are non-authorizing.
- primary_state_presentation_owner_by_mode: Defined in the table; the same row answers where/what/next before source details are opened.

## Activation And Deactivation

- activation_paths: The existing Cockpit open action displays saved Active Backlog rows. Existing section/query actions choose saved entries; selecting a uniquely identified undertaking opens its current bound detail. Markdown reading follows the stored row and references.
- deactivation_paths: Return to overview or close the current detail. A new observation invalidates stale selectors and requires existing explicit reload behavior. Closing a view never changes Run lifecycle.
- blockers: Missing/unsafe/unsupported sources, malformed or duplicate identity, stale capture, failed/skipped synchronization, and a selected Run/report that cannot substantiate the saved summary. A QA revise/block is visible open work, not necessarily a failed list read.
- recovery_paths: Explain what is missing and name the existing owner/action; offer visible retry/reload for transient read or stale-observation failure. A skipped saved-pointer update names its reason and explicit scoped synchronization/repair route. Reads do not write state, retry does not approve, and unsupported sources do not gain invented freshness.

## Relevant State Transitions

| Observed transition | Intended visible result | Invariant |
|---|---|---|
| QA report absent to recorded revise | QA outcome/open-work summary replaces coarse implementation impression | Recording a report does not approve QA |
| Open normalized evidence obligation remains | Concrete evidence action remains visible; unrelated code work is not implied | Finding route and existing owner determine the permitted work |
| QA revise to pass | QA passed with exact human approval still open when required | QA pass and Approval: QA are distinct |
| Exact QA approval recorded | Further OR/UAT or applicable closeout work becomes visible | Approval does not mean completed lifecycle |
| Supported closeout completed | Completion/outcome appears only through the authorized canonical operation | No automatic archival from a report |
| Synchronization skipped or source mismatch | Saved value remains with a disclosed limitation; no success/freshness claim | Legitimate control result and pointer synchronization outcome are separate |
| Scroll or title request resolves | Same query, membership, status and row position except deliberate refresh | Incidental title observation is presentation only |
| New read invalidates old observation | Explicit stale feedback and visible reload | Never merge contradictory observations |

## Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: The PRD owner should define stable criteria for saved phase/open obligation/action/source clarity; QA/approval/lifecycle distinctions; Core-owned bounded evidence summary; canonical write coverage/idempotence/recovery and skip diagnostics; explicit source correspondence and old-row limitations; identical Markdown/Core/compact/expanded meaning; readable narrow/wide and accessible feedback with scroll/query stability; architecture/flow and compatibility documentation plus evidence boundaries.
- open_product_questions: None requiring user clarification for drafting. PRD must choose concise vocabulary, visible compact next-action content and the precise backward-interpretation promise within the approved UR. Technical field/storage/derivation choices remain SD work.
- affected_outputs: PRD product promise; saved backlog rows; existing Core read projection; compact/expanded undertaking rows; selected current-state and read-feedback explanation.
- evidence: Approved UR acceptance 1–7; BROWNFIELD_REVIEW.md BF-01–06 and actual owner trace; inspected QA_REPORT.md QF-001; BacklogRows.tsx; cockpit-backlog.js; cockpit-list.js; docs/architecture/06-agdf-cockpit.md.
- missing_evidence: none for analytical readiness. New code/tests and actual current host presentation remain later TP/QA evidence, not claimed here.
- required_next_step: Canonically record this ready analysis, update the review's analytical result, then draft the smallest complete PRD for the selected structured_delivery scope. A new deliberate Approval: PRD is required before SD.

This analysis proposes UX intent input only. It neither adds a gate nor approves product acceptance, technical design or implementation.
