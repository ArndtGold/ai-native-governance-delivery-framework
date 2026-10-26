# Code Review: QA Revise Corrections for the AGDF Companion

Decision: pass
Status: `pass`

## Scope

- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent
- diff: the corrections recorded in `CD_TESTS-input-02.md`, including owner requests 3 (honest „läuft“ reason) and 4 (accessible names for ◀ ▶):
  - `plugins/agdf/host-templates/claude/companion/{run-state,assignment,view,register}.mjs` and `locales.json`;
  - `packages/cli/scripts/claude-companion-{test,adapter-test}.js`;
  - the companion section of `INSTALL.md`;
  - the regenerated runtime plugin and the compatibility evidence.
- basis: `CODE_REVIEW-input-02.md` (pass; CR-F01 to CR-F11 resolved) covers the rest of the change set, which these corrections do not touch.

## Code Review

- decision: pass
- findings: none. Checked in the diff:
  - **Correctness.** All four core lifecycles parse. Only `active` runs are open. A run changed in the session is assigned only when it is `active` or `completed`. A remembered selection on a `superseded` or `abandoned` run is dropped, because it is no longer open and is not unreadable (`register.mjs` `refresh` unchanged).
  - **Unchanged paths.** Step navigation and the run list use the same open set. The gate bar and the fertig state are unchanged for `completed`.
  - **Missing-control message.** The `no_control` snapshot carries the root. A later transient failure keeps that snapshot with its root through `settleSnapshot`. `folderName` handles both separators and a trailing separator.
  - **„läuft“ reason.** It now names the next step („Als Nächstes: {gate}“ / „Next: {gate}“) unless a main-loop turn is observed. That matches `07-ui-konzept.md:1187`. The state rules, moods and the turn overlay are unchanged; only the label text differs.
  - **Stepping buttons.** They keep their key and `onPress` and draw the same glyph as a child. Their label is now the localized accessible name; the 2.1.308 `ButtonProps` documents this as "the label then names the control". The engine keeps both under 2.1.302 (native test). Removing the unused `actions.show` keeps the en/de key parity.
  - **Read-only.** The corrections add no write path, no host call and no gating hook. `claude plugin validate` lists the same six hooks and calls.
  - **Tests.** The new assertions fail on each old behaviour (mutation check 10/10).
- verification: VERIFY_RESULT
- missing_evidence: a live spot check of the corrected build in the desktop app, planned before UAT; Linux and macOS in pull-request CI.
- risks: The companion still mirrors the core run-state format by design (SDD-04). Its lifecycle vocabulary is now bound to the core set. A new core lifecycle fails the logic suite instead of reading as unreadable.
- required_next_step: Record the TP Review and Clean Implementation Review for the corrections, then rerun QA.
