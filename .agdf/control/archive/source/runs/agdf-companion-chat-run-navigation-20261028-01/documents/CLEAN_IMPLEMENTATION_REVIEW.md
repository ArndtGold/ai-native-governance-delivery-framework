# Clean Implementation Review: AGDF Companion Chat-Run Navigation and Panel Changes

Decision: pass
Status: `pass`

## Decision

- decision: pass
- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- reviewed_at: 2026-10-28
- reviewer: Claude Code implementing agent
- basis: approved SD (SDD-01 to SDD-12), `CD_TESTS.md`, `CODE_REVIEW-input-01.md`, the companion sources and the suites.

## Clean Implementation Review

- primary_solution:
  - Run assignment stays in one owner, `assignment.mjs`. `namedRun` finds the mention and `assignRun` decides between mention, change, selection and browsing.
  - `view.mjs` only passes these inputs through and returns `chatRunId`.
  - `state.mjs` holds the waiting rule as one set (`THROUGH_TURN`).
  - `notice.mjs` passes the mention, but never browsing, so the status line and toasts follow the chat run.
  - `register.mjs` holds the session memory (`chatMention`, `isBrowsing`, `conversation`), the two turn hooks and the return control. It needs no new hook and no new host capability beyond `$.session.id()`, which it already had through the host API.
- evidence:
  - The logic suite tests `namedRun` and `assignRun` as pure functions. The adapter suite tests the hooks on a fake host, and the native test runs them on the host's own engine.
  - 12 mutation checks show that each rule and each correction is held by a test.
- fallbacks_retained:
  - Every turn-hook path keeps its catch path and passes its event on.
  - A failed clock read leaves the chat run as it was, because the detached promise catches the failure.
  - A host without `$.session.id()` keeps the session's conversation.
  - A non-string answer changes nothing.
  - The stale snapshot and the stored selection behave as before.
  - No new fallback hides a failure from the tests.
- workaround_or_shim_risk:
  - None new. The detached clock read in `turn.start` keeps `next(e)` undelayed (SDD-11) while taking the time from `$.clock.now()` (SDD-02).
  - Matching the answer after the post-turn read is an ordering choice within SDD-02, not a workaround.
- parallel_structure_risk:
  - None. The companion reads no new core rule.
  - Whole-token matching is the companion's own rule (SDD-01) and has no core counterpart to drift from.
  - The delivered core mirrors (status-card path, `modeSliceDecision`, placeholder rule) are unchanged and keep their parity tests.
- brownfield_fit:
  - Fits. The change reuses the delivered panel parts: footer menu, stepping row, sized run list, gate bars and locale registry. It also reuses the existing persistence and its one write site, and the fake host and native test generator.
  - It changes nothing outside the companion folder, its suites, `INSTALL.md` and the regenerated compatibility evidence.
- missing_evidence: none for solution integrity.
- required_next_step: Prepare the QA report.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-F01 | design_gap | SD | resolved | The answer source deviates from the SDD-02 wording (`e.answer` before `next(e).text`). The host declares `TurnCompleteFields.answer` as "the assistant's final visible text this turn" (`claude-code.d.ts` 2.1.308), which is the text T-001 observed. Visible behaviour of AC-001 is unchanged. Owner decision 2026-10-28 ("Abweichung festhalten"): recorded as a justified deviation without an SD revision (`CODE_REVIEW-input-01.md`, CR-F06). | none |
