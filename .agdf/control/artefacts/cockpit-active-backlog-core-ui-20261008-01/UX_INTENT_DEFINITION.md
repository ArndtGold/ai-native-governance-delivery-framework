# UX Intent Definition: Active-backlog selection

Status: ready
- decision: ready
Based on: approved UR.md and completed BROWNFIELD_REVIEW.md for this run
Date: 2026-10-08
Owner: Codex, analytical input to the PRD owner
Run: cockpit-active-backlog-core-ui-20261008-01

This is non-authorizing analytical input. It carries no approval and prescribes no technical design. The approved UR owns intent; the eventual approved PRD alone owns the product criteria.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The primary list control, initial area, search coverage and visible no-result states change within the existing overview capability.
- ux_intent_definition_required: yes
- evidence: Approved UR and BROWNFIELD_REVIEW.md; current Overview.tsx, mcp/CompactCockpit.tsx, useBacklogTitles.ts and existing Core read owners.

## 2. Intent And Success

- primary_user_intent: Find a current undertaking quickly, recognize its stored state and deliberately inspect its actual run without searching through archive/planned work or decoding concatenated technical labels.
- success_signal: The initial compact list contains Active Backlog only, with the last source-table row first. Titles are readable and a declared query returns the same matches independently of scrolling or incidental metadata loading. Opening a row reaches exactly the intended run or an explicit unavailable state.
- primary_decision_or_action: Choose a named undertaking to read its actual run; expand the overview for other backlog areas or the full result set. Selection approves nothing and starts no AI delivery action.

## 3. Working Modes And State

- working_modes: compact overview; expanded/browser overview; selected-run inspection; read unavailable/stale/expired.
- effective_state_by_mode:
  - Compact overview: observed Active Backlog membership and stored row order, plus temporary search input and result bounds. No run is implicitly selected.
  - Expanded/browser overview: observed membership of the explicitly chosen area, its reverse table sequence and section-scoped query. The compact overview remains an active-only entry point.
  - Selected-run inspection: the explicitly requested run's canonical evaluation, registered resources and source observation. Stored backlog status is separate from current run authority.
  - Read unavailable/stale/expired: current truth is unconfirmed. Prior data may remain visible as prior data; it does not permit current selection or continuation.
- visible_state_types: loading; readable complete list; partial readable list; empty area; complete scoped no-match; incomplete coverage; limited visible result subset; unavailable area; ambiguous/nonselectable row; missing/invalid run; stale source; failed refresh; expired session.
- effective_state_authority_by_mode:
  - All overview modes: Master Backlog owns stored membership/order/data; the existing Core read result owns observed readability and completeness. Temporary query or display limits do not alter source membership.
  - Selected run: canonical run state and existing Core evaluation own current control truth; no label or row count confers authority.
  - Read failure/recovery: existing Core read/session validation determines whether a current observation is confirmed. The user deliberately requests retry/reload where available.
- primary_state_presentation_owner_by_mode:
  - Compact overview: the compact cockpit communicates the active area, count, search coverage, result subset and expansion action.
  - Expanded/browser overview: the overview communicates chosen area, query, counts, results and sources.
  - Selected run: the existing run view communicates current evaluation and registered sources.
  - Unavailable/stale/expired: the existing read feedback on the affected surface states the limitation and next action; unrelated readable areas remain available where the Core result permits them.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Opening the overall cockpit without an explicit run shows compact Active Backlog. An explicitly named run continues to open that run directly. Expanding the overview gives access to Active, Planned and Archive. Selecting a readable, unambiguous row opens only its own run.
- blockers: An unreadable area cannot claim zero entries or exhaustive no-match. An invalid/duplicate identity cannot be selected. A stale or expired session cannot validate a new action using prior selectors. A missing run cannot be replaced by another run. Unsupported host expansion has a visible limitation rather than a success claim.
- recovery_paths: Clear or revise a query; choose another readable area; inspect row diagnostics; deliberately retry a transient read/refresh; reload after source change; reopen after session expiry; use the existing supported overview fallback when expansion is unavailable. All recovery preserves explicit target/run authority and grants no approval.
- relevant_state_transitions:
  - Open overview -> loading -> current active list, or explicit failure with retry; no automatic first-row selection.
  - Edit query -> same source/area with filtered reverse-order matches; visible match count and declared coverage; no background title load silently expands that corpus.
  - Expand -> full overview of the same active area/query; changing area resets the previous area's query visibly, matching existing behavior.
  - Open row -> loading -> exact selected run, or requested identity plus explicit failure; return restores relevant area/query and focus when the row still exists.
  - Source changes -> previous observation marked stale -> deliberate reload -> new membership/order/counts; removed row is not substituted.
  - Refresh fails -> previous observation remains visibly unconfirmed with retry; retry success restores current reads.
  - Session expires -> explicit expiry -> reopen/reconnect through the existing supported path; no silent reuse of expired selectors.

## 5. Proposed PRD Acceptance Criteria

- Initial compact membership is exactly the readable Active Backlog section in reverse source-table order. Stored Completed statuses remain visible there without lifecycle reclassification.
- Both list surfaces use one Core-owned reading policy; area/query/source identity yield the same ordered matches before any presentation limit.
- Proposed stable search corpus: original stored backlog work-item title, key and stored status. The primary list title is the stored work-item title with its recognized scope prefix omitted only for presentation. UR headings are supplementary source information and do not replace the list title or enter search opportunistically. This proposal is explicit for PRD review, not an approved change to product authority.
- Compact presentation shows a small explicitly counted subset and a clear route to all matches; expanded presentation offers all readable section results. Long titles wrap; technical identity and original source remain inspectable; keyboard selection and return focus are observable.
- Area total, query match count and displayed subset are distinguished. Partial/unavailable data prevents exhaustive no-match claims; unavailable counts do not appear as zero.
- Search, area choice, metadata and reordering do not reassign the chosen row to another run. Run opening validates through the current read path, preserving existing session/source-change and pending-title navigation safeguards.
- Neither overview nor run inspection writes canonical state, sends a contextual question, approves a gate or starts work merely by selection.
- Rendered compact and expanded evidence and a fresh actual Codex compact observation establish the result; source/protocol/browser evidence does not prove other host support.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions: none requiring new user-intent information. PRD must explicitly choose and present the proposed search/title policy, compact result bound and return behavior; these are refinements within the approved need, not hidden implementation assumptions.
- affected_outputs: PRD.md, followed by SD/TP evidence mappings after their permitted routing.
- evidence: User screenshot and answered conversation; approved UR.md; BROWNFIELD_REVIEW.md; current Core projection, separate run evaluation, two list surfaces, cache-dependent search and existing refresh/session behavior.
- missing_evidence: New implementation and native acceptance evidence are not available and belong to later execution/QA; they do not prevent product drafting.
- required_next_step: Draft a focused PRD through its bound owner, including the chosen product policy and unique observable criteria; present it for Approval: PRD only after canonical readiness validation.
