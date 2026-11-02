# Code Review: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Decision: pass
Status: `pass`

## Scope

- run_id: `agdf-companion-followup-20261027-01`
- reviewed_at: 2026-10-27 and 2026-10-28
- reviewers: an independent review subagent (diff against `main` ce127553 and `notice.mjs`, read against PRD, SD and `CD_TESTS.md`, with its own probes; it did not see the implementer's assessment) and the Claude Code implementing agent (corrections and mutation checks)
- diff: `plugins/agdf/host-templates/claude/companion/` (`register.mjs`, `run-state.mjs`, `state.mjs`, `gate-bar.mjs`, `figure.mjs`, new `notice.mjs`, `persistence.mjs`, `localization.mjs`, `locales.json`), `plugins/agdf/scripts/check-runtime-integrity.mjs`, the three companion suites under `packages/cli/scripts/`, `INSTALL.md`, regenerated compatibility evidence
- basis: approved PRD (AC-001 to AC-012), SD (SDD-01 to SDD-12), TP; `CD_TESTS.md`

## Code Review

- decision: pass
- summary: The review found no blocking defect, one revise finding (CR-F01) and five minor findings. CR-F01 to CR-F05 are corrected with tests, and each correction is mutation-checked. CR-F06 is the SDD-07 wording deviation of the LT-F01 fix; the owner decided on 2026-10-28 to record it as a justified deviation without an SD revision.
- checked without findings: chime header, sizes and base64 encoder; figure bounds over the whole swing; placeholder rule equal to the core; identical en and de label keys; persistence defaults and upgrade; mood precedence fertig > blockiert > wartet > baut > läuft, turns never reaching the status line or toasts; every new host call in its own catch path and spelled `$.noun.method(...)`; one write site; `notice.mjs` in the runtime integrity file list.

## Findings And Corrections

| Finding | Severity | Correction | Test | Mutation check |
|---|---|---|---|---|
| CR-F01: a chime played although `$.ui.toast` threw (AC-005, SDD-06) | revise | `register.mjs` `announce`: a failed toast returns before the chime; the chime plays only after a shown toast | adapter suite: host with only the toast failing, sound on, transition into blocked → 0 toasts, 0 chimes | removing the early return fails "no chime when the toast could not be shown" |
| CR-F02: a read still running when the companion was switched off could land after the switch-on and turn the switch-on read into a toast (PRD §4, SDD-05) | minor | `silence` sets `appliedRead` past every running read, so such reads are discarded | adapter suite: the read held before the switch-off finishes first, the switch-on read second → no toast | removing the reset fails "switching on stays a fresh baseline although an older read finished later" |
| CR-F03: with a failing state-file write, switching off left the timer running, the status line frozen and the pane open (AC-006, SDD-08) | minor | `command.run`: switching off stops reading, clears the status line and closes the pane before the choice is written; the choice is written even if closing fails | adapter suite: failing `fs.write` → reply names the error, status line cleared, no live timer, pane closed | the old order fails "a failing write still clears the status line, stops reading and closes the pane" |
| CR-F04: an Approvals status written as `` `approved` `` did not count, while the core strips the backticks (AC-003) | minor | `run-state.mjs` `approvedGates` accepts an optional backtick pair | logic suite: canonical structured run with a backticked UR approval → approved gates and path equal the core reader and the status card | the old pattern fails "backticked approval parity" |
| CR-F05: the adapter-level language test did not prove that an AGDF config wins over Claude's setting | minor | test only | adapter suite: config `en`, setting `de` → the shown run carries "Next step" and not "Nächster Schritt" | not applicable (test-only finding) |
| CR-F06: LT-F01 sets the status line after every applied read, SDD-07 says "when the text changed" | minor | none; recorded as a deviation (see below) | adapter suite and native test assert the repeated set | not applicable |

## Documented Deviations And Limits

- **SDD-07 wording (CR-F06).** The status line is set after every applied read, unchanged text included, because the Windows desktop dropped the set made during session start (`T-009_EVIDENCE.md`, LT-F01). Visible behaviour of AC-006 is unchanged. Owner decision 2026-10-28: „Abweichung festhalten“, no SD revision.
- **Completed runs (CR-F04 remainder, by design in SDD-02).** A read-only probe over the repository's 149 runs showed route parity 149/149 and equal marks for every active run. For completed runs, the companion marks OR done whenever the run is completed at OR, while the core requires its completion check; 38 historical completed runs differ there, and 10 completed quick-task or verified-change runs differ where the core's evaluated gate is the execution step. Completed runs are shown only when they changed in the session. The logic suite compares completed canonical fixtures by path, not by mark.
- **Reviewer notes, accepted as designed:** after the shown run switches by assignment, the next transition of the earlier run is a new baseline (SDD-05); `.agdf/control` without `config.json` uses Claude's `language` setting (SDD-11).

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | `register.mjs` `announce` returns after a failed toast; adapter suite assertion "no chime when the toast could not be shown" passes and fails under mutation | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | `register.mjs` `silence` discards running reads; adapter suite race assertion passes and fails under mutation | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | `register.mjs` switch-off order; adapter suite failing-write assertion passes and fails under mutation | none |
| CR-F04 | implementation_gap | CD+Tests | resolved | `run-state.mjs` `approvedGates`; logic suite backticked-approval parity passes and fails under mutation | none |
| CR-F05 | evidence_gap | evidence_obligation | resolved | adapter suite asserts the English "Next step" with config `en` and setting `de` | none |
| CR-F06 | design_gap | SD | resolved | owner decision 2026-10-28 to record the SDD-07 wording deviation without an SD revision; behaviour of AC-006 unchanged; repeated set asserted by the adapter suite and the native test | none |

## Verification After Corrections

- `npm run test:claude-companion`: logic, adapter and integrity tests passed.
- Mutation checks: four of four corrections caught by their tests (CR-F01 to CR-F04).
- `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check`, the Windows CI lanes `windows-22-installation-part-2` and `-part-3`, `claude plugin validate` and `claude plugin test` are rerun on the corrected tree before recording; results in `CODE_REVIEW_VERIFICATION.md`.
