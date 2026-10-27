# T-003 Evidence: Companion Logic Modules

Run: `agdf-begleiter-companion-20261025-01`
Task: T-003 (SDD-03 to SDD-06, SDD-09; formal suites follow in T-006)
Recorded: 2026-10-26
Result: done, with one interpretation of SDD-06 for owner review

## Modules

All modules are host-independent ES modules without imports from the host, under `plugins/agdf/host-templates/claude/companion/`:

- `run-state.mjs` (SDD-04)
  - Bounded parser that reads only Run Meta, Objective, Current Control State and Approvals, with a 1 MiB limit.
  - `readSnapshot` takes injected file access (`exists`, `list`, `read`) and never writes.
  - `settleSnapshot` keeps the last good snapshot, marked stale, after a transient failure (AC-006).
- `state.mjs` (AC-003)
  - Mood rules:
    - `fertig` when the lifecycle is `completed`;
    - `blockiert` when the decision is `revise`, `block`, `blocked` or `decline`;
    - `wartet` when the run names a pending approval, or the decision is `pending` or `awaiting_uat`;
    - `läuft` when the decision is `in_progress`, `pass`, `qa_approved` or `completed`.
  - Anything else is an unknown state, which the view shows as unreadable.
  - A main-loop turn overlays `läuft`.
- `assignment.mjs` (SDD-06, AC-004)
  - Resolution order: the run changed in this session (the most recent wins), then the remembered selection if that run is still open, then no run.
  - A remembered run that is no longer open is reported for dropping.
  - Stepping through open runs is supported.
- `localization.mjs` (SDD-05, AC-005)
  - Mirrors `resolveConfiguredChatLanguage` and `localizedOperationalValue` for the chat language and the next step.
  - Gate titles come from `gateTitles`.
  - Companion labels are looked up by key path and fall back to the fallback locale.
- `gate-bar.mjs` (SDD-09, AC-002)
  - Full form `✓UR ✓PRD ✓SD ●TP ○QA ○UAT ○OR` (29 columns) without separators.
  - Below that width, a condensed form `✓✓✓●○○○ TP` that still names the current gate.
- `figure.mjs` (SDD-09, AC-010)
  - SVG figure for the four moods plus a neutral pose, in a 200×140 view.
  - Accessories are drawn only inside `ACCESSORY_REGION` (x 148–196). It lies outside `FIGURE_BOX` (x 20–140), which includes the figure's motion.
  - The still pose emits no animation element.
  - A terminal face per mood.
- `view.mjs`
  - Builds the localized panel view model: state, reason, gate bar, run identity, objective, next step, origin, last read time, stale note, run list.
  - Covers the specific messages for no control folder, no open runs, no run assigned and an unreadable run state.
  - `terminalText` returns the text fallback.
- `locales.json`
  - Companion labels for `en` and `de`, the same locale set and fallback as the core registry.
  - Panel title "AGDF Companion" / "AGDF-Begleiter".
  - State labels "läuft", "wartet auf Freigabe", "blockiert", "fertig".

## Verification Against This Repository (Node 22, not yet the T-006 suites)

- `readSnapshot` over all 145 run states:
  - all 145 readable, in about 33–45 ms;
  - moods: 88 fertig, 16 läuft, 27 wartet, 14 blockiert;
  - no run matching no rule.
- First run: 70 states were classified unreadable. Cause: 67 older run states have no `updated_at` and 2 have no Current Control State table. The parser now treats both as optional:
  - a run state without `updated_at` never counts as changed in this session;
  - a run state without the table has no missing approval or next step.
- Parity with the core reader `readRunState`:
  - lifecycle, current gate, decision and `updated_at` are identical for all 145 runs.
  - The next step follows SDD-04 (the Current Control State answer). For 50 of the 51 active current-format runs it equals the core's `next_allowed_action`. The exception is a hand-edited legacy run whose Closeout field differs from its control table.
- Assignment with this session started now and no selection gives "Kein Run zugeordnet" with 57 open runs. This matches AC-004's observable success (no guessing of the newest run).
- German view of this run:
  - `läuft · Implementierung und Tests in Arbeit` with gate bar `✓UR ✓PRD ✓SD ✓TP ○QA ○UAT ○OR`;
  - the next step is localized from the status-card value ("Den freigegebenen TP-Umfang implementieren, …").
- English view at 20 columns uses the condensed gate bar.
- SVG documents are well-formed for all five poses, moving and still, including an escaped title.
- Still poses contain no `<animate>` or `<set>`.
- Accessory bounds lie inside the region, and the region is disjoint from the figure box.
- `public-plugin-test`, `portable-plugin-test` and the source runtime integrity check pass. The public candidate stays at 63 files with an unchanged digest.

## Interpretation For Owner Review

SDD-06 calls "open runs" with `updated_at` at or after session start "changed in this session". Read literally, a run that the session completes would leave the panel at once, so `fertig` (AC-003, AC-010, SCN-019) could never be shown.

`assignRun` therefore also keeps a run that changed in this session and is now completed. The remembered selection and the run list still contain only open runs.
