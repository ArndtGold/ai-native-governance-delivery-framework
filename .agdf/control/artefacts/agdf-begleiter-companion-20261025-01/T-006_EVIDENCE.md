# T-006 Evidence: Companion Tests in the Repository Verification

Run: `agdf-begleiter-companion-20261025-01`
Task: T-006 (scenarios SCN-001, SCN-003, SCN-005 to SCN-011, SCN-014 to SCN-016, SCN-018, SCN-020)
Recorded: 2026-10-26
Result: done

## Suites

- `packages/cli/scripts/claude-companion-test.js` (logic):
  - SCN-005, canonical-writer fixtures in a temporary target.
    - Fixtures: created run (`fixture()`), UR open and UR approved (`approvalFixture()` with the canonical `ur` and `route` steps and `approveRunGate`), completed run, and runs set to `revise`, `block`, `blocked`, `decline`, `pending`, `awaiting_uat` (core builders `createRun` and `replaceFirstScalar`, sealed).
    - Lifecycle, current gate, decision, `updated_at` and the approved gates equal the core `readRunState` values.
    - After canonical steps, the next step equals the core `next_allowed_action`.
    - Moods are läuft, fertig, wartet, läuft after approval, blockiert ×4 and wartet ×2.
  - SCN-009 and SCN-010 reader conditions: no control folder, no runs, an unreadable file (`format`), a missing file (`missing`), an oversized file, a run id not matching its folder, a failing directory read, and the stale settlement.
  - SCN-006 state rules: a main-loop turn overlay that never hides an unreadable state; completed beats revise.
  - SCN-007 assignment:
    - the most recent change in the session wins;
    - a run completed during the session stays assigned (owner decision of 2026-10-26);
    - a change in the session beats the selection, which beats no run;
    - a vanished or completed selection is dropped, and run states without `updated_at` never count as changed;
    - stepping through the runs.
  - SCN-008 localization:
    - the chat language equals core `resolveConfiguredChatLanguage` for missing, invalid, `de`, `de-AT`, `fr` and malformed configs;
    - next-step localization equals core `isOperationalValueRenderable` for every status-card source value and a free text;
    - the companion locale set and fallback equal the core registry, and `en` and `de` have identical label keys;
    - none of nine German views shows an English-only label.
  - SCN-003 gate bar: full form within 40 and 60 columns, 29 columns exactly, the condensed form below that (with and without a current gate), all done when completed, never wrapping. The view carries the origin, a collapsed objective and the last read time.
  - SCN-018 figure: accessory region disjoint from the figure box, every accessory inside its region, well-formed SVG for five poses moving and still, no animation in the still pose, title escaping, source below the host's 131,072-character limit, terminal faces. The terminal text carries title, state, gate bar, next step and read time.
  - SDD-07 persistence: `pluginDataDir` equals `claudePluginDataRoot`, with the profile and home fallbacks, the round trip, and invalid content falling back to the defaults.
- `packages/cli/scripts/claude-companion-adapter-test.js` (fake host on a canonical fixture target, module loaded fresh per session):
  - SCN-011: six hooks, `.catch` on all but `ui.render`, catch handlers pass the event on, the adapter source has one `$.fs.write` site and no `$.state.set` or `$.store` use, no approval or continuation control.
  - SCN-001: off by default; on and off persisted with pane open and close and the 30 s timer; a new session restores the choice and the selection.
  - AC-004: no run assigned without a change; selecting persists per project root; a canonical approval during the session takes over as "Changed in this session".
  - SCN-006: subagent turns are ignored; main-loop turns show läuft and re-read on completion.
  - AC-010: the still pose persists and the Svg is non-interactive without animation; the terminal draws text without Svg.
  - The person's close stops the timer.
  - SCN-010: a failing list keeps the last run with "Read failed at …"; retry clears it.
  - SCN-014: a failing `session.start` passes its event on and registers nothing; a failing render draws one neutral line; a failing command answers with text; the command's catch answers "unavailable".
  - SDD-07: without the plugin data directory nothing is written or created.
  - AC-007: every write went to `companion-state.json` and none under `.agdf`. Companion reads leave the `.agdf/control` tree byte-identical (SHA-256 over all files).
- `packages/cli/scripts/claude-companion-integrity-test.js` (SCN-015, SCN-016 on copies of the generated runtime plugin):
  - eight mutations each add their expected integrity failure;
  - the portable runtime validator rejects a manifest without the companion and a missing descriptor;
  - the Copilot payload check rejects companion files;
  - the generated Copilot profile has no `companion/`.
- `packages/cli/scripts/runtime-integrity-negative-test.js` (source mode) gained six companion cases. Each is rejected:
  - the source Claude manifest declaring `hooks`;
  - a redirected descriptor;
  - a missing `register.mjs`;
  - a second module;
  - the shared definition referencing the companion;
  - the shared hooks template referencing the companion.

## Registration (SCN-020)

- `packages/cli/package.json`:
  - `test:claude-companion` runs the three new suites;
  - `smoke-test` calls it right after `test:claude-plugin-mcp`;
  - the `cli-smoke` stage of `scripts/verify-ci.mjs` runs `smoke-test`, so `npm run verify:ci` executes the suites.
- `scripts/ci-test-domains.mjs` classifies `test:claude-companion` in the `installation` domain. `testInventory()` lists the three suite commands with domain `installation`.

## Results (Windows, Node v22.22.3)

- `npm run test:claude-companion`: logic, adapter and integrity suites passed.
- `node scripts/runtime-integrity-negative-test.js`: passed.
- `node scripts/ci-plan-test.mjs`: 9/9 passed.
- `public-plugin-test` and `portable-plugin-test` passed; the public candidate is unchanged.
- Mutation check (scratch): ten deliberate defects across `state.mjs`, `gate-bar.mjs`, `figure.mjs`, `localization.mjs`, `assignment.mjs`, `run-state.mjs`, `view.mjs` and `register.mjs` (subagent turns, write without a data directory, a missing catch) each made the owning suite fail. The sources were restored afterwards.
- One defect in the first integrity suite was found and fixed before recording: its loop copied the plugin but never applied the mutation.

## Not Yet Covered

The full `npm run verify:ci` and the payload, fingerprint and compatibility refresh follow in T-007. Native `claude plugin test` and the live session follow in T-009.
