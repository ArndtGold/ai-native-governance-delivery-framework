# Code Review: AGDF Companion Chat-Run Navigation and Panel Changes

Decision: pass
Status: `pass`

## Scope

- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- reviewed_at: 2026-10-28
- reviewers: an independent review subagent and the Claude Code implementing agent. The subagent reviewed the diff since ab41fe26, which covers commits 3444befe and 2f54fbcc and the uncommitted working tree. It read the diff against the PRD, the SD, the TP and `claude-code.d.ts` 2.1.308, used its own probes, and did not see the implementer's assessment. The implementing agent made the corrections and ran the mutation checks.
- diff: `plugins/agdf/host-templates/claude/companion/`: `assignment.mjs`, `state.mjs`, `view.mjs`, `notice.mjs`, `register.mjs` and `locales.json`. Also the logic and adapter companion suites under `packages/cli/scripts/`, `INSTALL.md` and the regenerated compatibility evidence.
- basis: approved PRD (AC-001 to AC-012), SD (SDD-01 to SDD-12), TP (T-001 to T-009, SCN-001 to SCN-023); `CD_TESTS.md`

## Code Review

- decision: pass
- summary:
  - The review found no blocking defect. It found four revise findings (CR-F01 to CR-F04) and six notes (CR-F05 to CR-F10).
  - All ten are corrected. Every code correction has a test, and every correction except the test-only CR-F04 and the wording-only CR-F10 fails its test under mutation.
  - CR-F06 changes the answer source that SDD-02 names; the owner is asked to confirm it at QA.
- checked without findings:
  - Whole-token matching, including prefixes, suffixes, ids with dots, a trailing full stop, paths and non-string input.
  - The mention wins over a change at the same time; a completed run falls back to "changed in this session".
  - `dropSelection` and the status line ignore browsing.
  - The return control sits under the stepping row and is the first menu entry.
  - `minHeight` equals `bodyRows`, and the `turn.complete` and subagent guards work as designed.
  - The companion stays observation-only: one `$.fs.write` site, and every hook passes its event on.
  - `namedRun` takes about 1 ms for 60 ids over a 64K text, so it does not delay `next(e)`.

## Findings And Corrections

| Finding | Severity | Correction | Test | Mutation check |
|---|---|---|---|---|
| CR-F01: a chat run or browsed run in an unknown state had no `chatRunId` and no position. Stepping from it looked broken, and the way back was missing (AC-005). | revise | `view.mjs` gives the unknown-state branch and the unreadable-selection branch `chatRunId` and `openCount`. | Adapter suite: extra-11 in an unknown state as the chat run steps to extra-12 and browses. Browsing back to extra-11 offers the return button and the menu entry. | Dropping `chatRunId` from the unknown-state view fails it. |
| CR-F02: a repeated mention of a run moved the panel but did not announce it, so panel and status line disagreed (AC-006, AC-007). | revise | `register.mjs` `noteMention` returns true for every recorded mention, and each one is announced. | Adapter suite: "a repeated mention sets the status line". | Skipping `announce` for a mention fails it. |
| CR-F03: `/clear` and a resumed transcript kept the chat run and browsing, against the PRD decision "a new session starts without a chat run". | revise | `register.mjs` `followConversation` reads `$.session.id()` on every read. On a new id it clears the chat run, browsing and the observation, and restarts the session clock. No new hook. | Adapter suite: after the conversation changes there is no "Named in the chat", no return button and no menu entry. | Keeping `chatMention` across the id change fails it. |
| CR-F04: a test could pass with the defect still in the code. The overlay checks ran on a waiting run, which the overlay no longer covers. The "no toast while browsing" check changed no state. Nothing asserted that the return control is absent without a chat run. | revise | Test-only. The overlay checks run on a blocked run. The browsed run changes state while it is browsed. After a new conversation the adapter suite asserts that there is no return control. | Adapter suite: "no toast and an unchanged status line for the browsed run"; "a new conversation has no chat run and no way back". | Not applicable (test-only). The surrounding defects are covered by the SCN-011 and CR-F03 mutations. |
| CR-F05: the answer was matched against the snapshot from before the turn, so a run created during the turn did not count. | note | `register.mjs` `turn.complete` reads the clock at turn end, refreshes, then matches the answer. | Adapter suite: "a run created during the turn counts" (extra-13). | Matching before the read fails it. |
| CR-F06: the answer came from `next(e).text`, which a nested plugin may rewrite. | note | `register.mjs` prefers `e.answer`, the host's declared final assistant text, and falls back to `next(e).text`. | Adapter suite: "e.answer is the turn's answer". | Reading `next(e)` only fails it. |
| CR-F07: stepping onto the chat run itself counted as browsing. | note | `register.mjs` `select` browses only for a run other than the chat run. | Adapter suite: "a step onto the chat's run is no browsing". | Always browsing fails it. |
| CR-F08: when a long text was cut, a cut inside a longer id turned its tail into a mention. | note | `assignment.mjs` `namedRun` scans from a start offset in the original text, so the character before the window still bounds a mention. | Logic suite: a window that starts inside a longer id finds no mention. | Treating the window start as a boundary fails it. |
| CR-F09: the mention time came from `Date.now()`, while SDD-02 names `$.clock.now()`. | note | `register.mjs` reads `$.clock.now()` in a detached promise beside the event. The hook never waits for it (SDD-11). | Native `claude plugin test`: "a run named in the chat is followed …" runs on the host's clock mock. | Covered by the CR-F02 mutation, which removes the announcement in that promise. |
| CR-F10: `INSTALL.md` said notices follow "the shown run", and that "the next message you send" ends browsing. | note | `INSTALL.md`: notices follow the shown run except while browsing; any main-loop turn, including a continuation without typed text, ends browsing. | Documentation. | Not applicable. |

## Documented Deviations And Limits

- **SDD-02 answer source (CR-F06).**
  - SDD-02 says the chat signal at turn end comes from "the `text` that `next(e)` returns".
  - The code takes `e.answer` first. The host declares it as the assistant's final visible text, before any other plugin's `turn.complete` hook can return its own text.
  - It falls back to `next(e).text` when the host gives no `e.answer`.
  - Visible behaviour of AC-001 is unchanged: the turn's final answer names the chat run.
  - The owner is asked at QA to record this as a justified deviation without an SD revision.
- **Matching order (CR-F05).** SDD-02 does not fix whether the answer is matched before or after the post-turn read. Matching after the read is within the SD, and `at` still comes from `$.clock.now()`.
- **Reviewer probes.** The subagent's scratchpad probes (`probe.mjs`, `probe2.mjs`) are not part of the delivery. The mutation checks in `nav-mutations.mjs` replace them as regression evidence.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | `view.mjs` unknown-state branch carries `chatRunId` and `openCount`. The adapter suite's extra-11 assertions pass and fail under mutation. | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | `register.mjs` `noteMention` returns true per recorded mention. The adapter assertion "a repeated mention sets the status line" passes and fails under mutation. | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | `register.mjs` `followConversation` resets on a new `$.session.id()`. The adapter assertion "a new conversation has no chat run and no way back" passes and fails under mutation. | none |
| CR-F04 | evidence_gap | evidence_obligation | resolved | The adapter suite runs the overlay checks on a blocked run, changes the browsed run's state, and asserts that there is no return control without a chat run. | none |
| CR-F05 | implementation_gap | CD+Tests | resolved | The `register.mjs` `turn.complete` match runs after the read. The adapter assertion "a run created during the turn counts" passes and fails under mutation. | none |
| CR-F06 | implementation_gap | CD+Tests | resolved | `register.mjs` prefers `e.answer`. The adapter assertion "e.answer is the turn's answer" passes and fails under mutation. The SDD-02 wording deviation goes to the owner at QA. | none |
| CR-F07 | implementation_gap | CD+Tests | resolved | `register.mjs` `select` browses only off the chat run. The adapter assertion "a step onto the chat's run is no browsing" passes and fails under mutation. | none |
| CR-F08 | implementation_gap | CD+Tests | resolved | `assignment.mjs` `namedRun` scans from an offset in the original text. The logic suite's window-cut case passes and fails under mutation. | none |
| CR-F09 | implementation_gap | CD+Tests | resolved | `register.mjs` reads `$.clock.now()` in a detached promise. The native test passes 6 of 6 on the host clock mock. | none |
| CR-F10 | evidence_gap | evidence_obligation | resolved | The `INSTALL.md` wording for notices while browsing and for the end of browsing is corrected. | none |

## Verification After Corrections

- `npm run test:claude-companion`: logic, adapter and integrity tests passed.
- Mutation checks (`nav-mutations.mjs`): 12 of 12 caught. Five cover the approved navigation behaviour (SCN-001, SCN-007, SCN-009, SCN-011, SCN-012) and seven cover the corrections (CR-F01, CR-F02, CR-F03, CR-F05, CR-F06, CR-F07, CR-F08).
- Build, compatibility, `claude plugin validate`, `claude plugin test` and the reinstallation were rerun on the corrected tree. The results are in `CODE_REVIEW_VERIFICATION.md`.
