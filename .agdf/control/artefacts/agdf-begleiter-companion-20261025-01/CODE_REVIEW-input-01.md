# Code Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: revise
Status: `revise`

## Scope

- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent, together with an independent read-only review by a separate agent instance. The author of the code is the same agent instance, so this is not independent human proof.
- diff: the uncommitted working tree of `feat/agdf-begleiter` against `c327c50d`, in two parts:
  - the companion: `plugins/agdf/host-templates/claude/companion/*`, the wiring in `scripts/public-plugin/{manifest,validator,copilot-profile}.js`, `scripts/sync-package-assets.js` and `plugins/agdf/scripts/check-runtime-integrity.mjs`, the tests and the registration;
  - the AGDF core fix: `packages/core/lib/control-state/{run-revision-boundary,run-source-revisions,recording-formats}.js`, `gate-transition.md` and its tests.
- excluded: generated evidence (`.agdf/`, `docs/compatibility/`, `evals/`) and documentation prose.

## Code Review

- decision: revise
- findings:
  - [high] `plugins/agdf/host-templates/claude/companion/register.mjs:195` - `ui.close` compares `e.origin === 'person'`, but the host's `PaneCloseInput.origin` is `{ kind: 'plugin' | 'person' | 'unload' }`. The "hide for this session" path (SDD-07) never runs, and the refresh timer keeps reading after the person closes the pane. The adapter test fires `origin: "person"` as a string and masks it.
  - [high] `plugins/agdf/host-templates/claude/companion/state.mjs:15-19` with `run-state.mjs:45` - "blockiert" (AC-003) depends on the Run Meta `decision`. The canonical writers only write `in_progress` and `completed` (`packages/core/lib/control-state/run-steps.js:381,405`). Revise and block results live in the current gate's Artefacts row, for example `QA | … | revise` in `gate-internal-continuation-recovery-20261008-01`, which the companion shows as "läuft". The parity test sets the Meta decision with a core builder instead of a writer step. SDD-04 names the Run Meta `decision` as the source, so this is a design gap.
  - [high] `plugins/agdf/host-templates/claude/companion/persistence.mjs:20,27` - for invalid or foreign state-file content, `parseCompanionState` returns the frozen default `selections`. `register.mjs` then throws when it assigns a selection, and `press` swallows the error, so choosing a run does nothing for the whole session. The test compares with `deepEqual`, which does not see the freezing.
  - [medium] `plugins/agdf/host-templates/claude/companion/register.mjs:35-39` - each session writes its whole in-memory copy of `companion-state.json`. A second session can therefore undo another session's on/off, still or selection choice, including through the background drop of a selection. This breaks AC-001: "the last choice applies to new sessions".
  - [medium] `plugins/agdf/host-templates/claude/companion/register.mjs:184` - `turn.complete` clears the turn overlay only while the companion is enabled. Switching off during a turn and on again leaves "Claude is working on this turn" on screen until the next turn.
  - [medium] `plugins/agdf/host-templates/claude/companion/register.mjs:156` - after the person hides the pane, `/agdf-companion` switches the companion off and persists that for new sessions, instead of showing the pane again. This contradicts SDD-07 ("hides it for the session only"). The live test confirmed the command toggles; the hidden case was not covered.
  - [low] `plugins/agdf/host-templates/claude/companion/register.mjs:41-67` - overlapping refreshes (timer, turn completion, "Neu lesen") are not ordered, so an older read can replace a newer one. Two overlapping `startRefreshing` calls can also leave a second timer that is never cancelled.
  - [low] `plugins/agdf/host-templates/claude/companion/register.mjs:72` - the project root is captured once at `session.start`. After `/cd` or a worktree move, the panel keeps reading the old project and keys selections under the old root.
  - [low] `plugins/agdf/host-templates/claude/companion/register.mjs:46-50` with `run-state.mjs:69` - a temporarily missing `runs/` directory, for example during a branch switch, counts as "no runs", and the remembered selection is dropped for good.
  - [low] `plugins/agdf/host-templates/claude/companion/register.mjs:186` - `turn.complete` awaits the full refresh before returning the host's result, which delays the host by the read time on a slow file system.
  - [medium] `packages/core/lib/control-state/run-source-revisions.js:132` and `run-revision-boundary.js:11-13` - the AGDF core fix accepts `initiating_phase: "Brownfield Analysis"` under the existing receipt `schema_version: '3'` and `policy_version: 2`. A runtime at 0.20.1 or older reads such a receipt as invalid, and `runSealState` then reports the whole run as damaged instead of rejecting an unsupported version concretely. Observed on this branch: the installed 0.20.1 reported `AGDF_RUN_NOT_SELECTABLE` for this run after the first source revision.
- rejected candidate: the gate bar shows no current gate at internal steps (CR, CD+Tests, Brownfield Analysis). This matches the canonical status-card path (`✓ UR · ✓ PRD · ✓ SD · ✓ TP · ○ QA …` at CD+Tests), and the reason line names the internal step. Not a defect.
- missing_evidence:
  - The new suites ran on Windows only. Linux and macOS CI runs follow with the pull request.
  - The `ui.close` path and a canonical revise result were not part of the live session.
- risks:
  - Mixed AGDF versions on one repository cannot read runs revised from Brownfield Analysis.
  - Concurrent companion sessions can lose user choices until fixed.
- required_next_step: Return to CD+Tests to fix the implementation findings with tests that use the host's real event shapes and canonical writer steps. Prepare the SD source revision for the AC-003 state source, and the owner decision on CR-F11, before re-running Code Review.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | open | `register.mjs:195` compares `e.origin === 'person'`; host type `PaneCloseOrigin` is `{ kind }`; the adapter test fires a string origin | Compare `e.origin?.kind === 'person'` and fire the host's object shape in the adapter test and the native plugin test |
| CR-F02 | design_gap | SD | open | `state.mjs:15-19` reads the Run Meta decision; `run-steps.js:381,405` write only `in_progress`/`completed`; `gate-internal-continuation-recovery-20261008-01` QA `revise` row shows "läuft" | Revise SDD-04 so that a `revise` or `block` status of the current gate's Artefacts row also yields blockiert, then renew SD and TP approval |
| CR-F03 | implementation_gap | CD+Tests | open | `persistence.mjs:20,27` return the frozen default `selections`; `register.mjs:91` assignment throws in strict mode | Return a fresh mutable default from `parseCompanionState` and assert extensibility in the logic suite |
| CR-F04 | implementation_gap | CD+Tests | open | `register.mjs:35-39` writes the whole stale copy; two sessions overwrite each other's choices | Re-read `companion-state.json` before each write and apply only the changed field, with a two-session adapter test |
| CR-F05 | implementation_gap | CD+Tests | open | `register.mjs:184` clears `isTurnActive` only while enabled | Clear the turn overlay on every main-loop `turn.complete` and test switching off and on during a turn |
| CR-F06 | implementation_gap | CD+Tests | open | `register.mjs:156` toggles `enabled` while the pane is hidden for the session | Make `/agdf-companion` show a hidden pane without changing the stored choice, with an adapter test |
| CR-F07 | implementation_gap | CD+Tests | open | `register.mjs:41-67` apply unordered refresh results and can start a second timer | Apply only the newest refresh result and guard `startRefreshing` against a second timer, with a test |
| CR-F08 | implementation_gap | CD+Tests | open | `register.mjs:72` reads `$.session.root()` once | Read the project root at each refresh and test a root change |
| CR-F09 | implementation_gap | CD+Tests | open | `register.mjs:46-50` drop the selection when `runs/` is temporarily missing | Keep the selection while the snapshot has no runs and test the missing-directory case |
| CR-F10 | implementation_gap | CD+Tests | open | `register.mjs:186` awaits the refresh inside `turn.complete` | Start the post-turn refresh without awaiting it and test that `turn.complete` returns first |
| CR-F11 | emergent_risk | CD+Tests | open | `run-source-revisions.js:132` widens schema 3 / policy 2; the installed 0.20.1 reported `AGDF_RUN_NOT_SELECTABLE` for this run; earliest-owner assessment: the carried core fix is outside this run's UR/PRD/SD/TP, so CD+Tests after an owner decision | Obtain the owner decision between a new receipt policy version for Brownfield Analysis-initiated revisions and a documented mixed-version limit, then implement it |

Earliest-owner assessment for CR-F11: the risk lies in the carried AGDF core fix. The approved UR, PRD, SD and TP of this run do not govern that fix; the owner decided on 2026-10-25 that it ships on this branch. The earliest owner able to act is therefore the implementation step (CD+Tests), after an explicit owner decision.
