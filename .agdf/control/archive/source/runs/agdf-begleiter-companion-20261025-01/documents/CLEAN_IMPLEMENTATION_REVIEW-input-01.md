# Clean Implementation Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: revise
Status: `revise`

## Decision

- decision: revise
- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent
- basis: approved SD (SDD-01 to SDD-11), TP, `CODE_REVIEW-input-02.md`, `TP_REVIEW-input-01.md`, the companion sources under `plugins/agdf/host-templates/claude/companion/` and the suites `packages/cli/scripts/claude-companion-{test,adapter-test,integrity-test}.js`.

## Clean Implementation Review

- primary_solution: A thin host adapter (`register.mjs`) over host-independent modules for reading, state rules, assignment, localization, gate bar, figure and persistence. It is wired only through the runtime-profile Claude manifest from a build-only descriptor (SDD-01, SDD-02). The root causes of the panel findings from the prototype are fixed in the owning modules, not masked in the drawing:
  - run assignment is in `assignment.mjs`;
  - the single-line gate bar is in `gate-bar.mjs`;
  - accessory geometry is in `figure.mjs`;
  - localization is in `localization.mjs`.
- evidence: The logic suite binds the mirrored rules to their core owners:
  - field parity with the core reader for canonical-writer fixtures;
  - `pluginDataDir` against `claudePluginDataRoot`;
  - `chatLocale` against `resolveConfiguredChatLanguage`;
  - next-step localization against `isOperationalValueRenderable`;
  - the locale set against the registry.

  The mutation check of the CR corrections killed 12 of 12 re-introduced defects.
- fallbacks_retained: All are approved and bounded:
  - Session-only choices when the plugin data directory is missing (SDD-07). Exit condition: the native checks after host updates; the path is bound to `claudePluginDataRoot`.
  - Catch paths on every hook, which pass the event on (SDD-10). They isolate failures and do not mask them: the command answers `agdf-companion: …` and the pane draws a neutral line with the error.
  - The last good snapshot, marked stale during a transient read failure (AC-006).
  - Defaults for an invalid state file (CR-F03). This touches only the companion's own file.
- workaround_or_shim_risk: The CR-F02 reading of the Artefacts row and the control-table presentation decision depends on canonical writer texts. It is a documented SDD-04 deviation by owner decision and is bound to the real writers in the logic suite. No other shim was found.
- parallel_structure_risk: The bounded parser is an approved second reader of `RUN_STATE.md` (SDD-04). Its stated safeguard is "format changes fail the parity tests instead of drifting silently". That safeguard covers field values that the canonical writers produce. It does not cover the vocabularies the companion copies. `run-state.mjs:10` keeps its own lifecycle set (`active`, `completed`), while core exports `LIFECYCLES` (`active`, `completed`, `superseded`, `abandoned`) in `packages/core/lib/control-state/run-state-parser.js:13`. No writer fixture produces the two other values, so the copy drifted unnoticed (TPR-F01).
- brownfield_fit: Fits. It reuses the generation pipeline, the integrity check, the Copilot exclusion, the locale registry and the CI plan. It adds no change to the shared plugin definition, `hooks/hooks.json` or the Codex manifest.
- missing_evidence: `npm run verify:ci` on the corrected tree (TPR-F03).
- required_next_step: In CD+Tests, bind the companion's lifecycle vocabulary to the core set, together with the TPR-F01 correction.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-F01 | implementation_gap | CD+Tests | open | SDD-04 requires that format changes fail the parity tests instead of drifting silently. `run-state.mjs:10` holds a private lifecycle set that differs from the exported core `LIFECYCLES` (`run-state-parser.js:13`). `claude-companion-test.js` compares only fixture field values, so the missing `superseded` and `abandoned` went undetected. | In CD+Tests, export the companion lifecycle set and assert in the logic suite that it equals the core `LIFECYCLES`, so a future core lifecycle fails the suite |
