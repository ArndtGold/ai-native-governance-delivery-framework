# CD+Tests: QA Revise Corrections for the AGDF Companion

Decision: pass
Status: `pass`

## Decision

- decision: pass
- scope: the open findings of the QA revise report (`QA_REPORT.md`, revision 45), namely TPR-F01, TPR-F02, CIR-F01 and the evidence obligation TPR-F03, plus owner requests 3 and 4 below, within approved TP tasks T-003, T-004, T-006, T-007 and T-008
- run_id: `agdf-begleiter-companion-20261025-01`
- recorded: 2026-10-26
- basis: `CD_TESTS-input-01.md` (T-001 to T-009) stays valid for every task not touched here.

## Owner Requests

Both corrections were requested by the owner on 2026-10-26. A peer session relayed them; the owner confirmed in this session that they are to be routed through QA revise. They are recorded here as asked:

1. **Lifecycle parity.** The core reader accepts the lifecycles `superseded` and `abandoned`, but the companion reported such runs as unreadable. They are now parsed as valid and treated as closed: they are never assigned, never listed as open, and a remembered selection on them is dropped.
2. **Folder name in the missing-control message.** In a project without `.agdf/control`, the panel now names the checked folder: its last path part in the message and the full path as a hint. This applies in English and German, on desktop and in the terminal text.

Two more corrections came from the owner's comparison of the companion with `docs/architecture/07-ui-konzept.md` and `08-ui-richtlinien.md`. The session "UI-Konzept und Cockpit-Abgleich" relayed the owner's words: „Ja, nimm die ehrliche Begründung bei „läuft“ und die zugänglichen Namen für ◀ ▶ in die laufende QA-Korrekturrunde auf.“ Both are corrections within AC-003 and AC-005, without a source revision:

3. **Honest reason for „läuft“.** Without an observed turn, the run-derived „läuft“ said „{gate} in Arbeit“ / „{gate} in progress“, although nothing was running. `07-ui-konzept.md:1187` allows a "working" claim only when the host confirms running work. `reasons.working` now reads „Als Nächstes: {gate}“ / „Next: {gate}“. The state name „läuft“ (AC-003) and the turn reason „Claude arbeitet gerade an diesem Turn“ stay.
4. **Accessible names for ◀ ▶.** The stepping buttons had only their glyphs as label. The mod API has no separate accessibility property, but a Button's `label` names the control while its children are drawn. The buttons now carry `actions.previous` / `actions.next` („Vorheriger Run“ / „Previous run“, „Nächster Run“ / „Next run“) as label and draw ◀ ▶ as their child, so the width is unchanged (AC-002). The unused label `actions.show` was removed.

## Changes

| Finding | Task | Change |
|---|---|---|
| TPR-F01 | T-003 | `run-state.mjs` exports `LIFECYCLES` (`active`, `completed`, `superseded`, `abandoned`) and parses all four. `assignment.mjs`: only `active` runs are open, and only `active` or `completed` runs can be assigned from a change in the session. |
| CIR-F01 | T-006 | The logic suite asserts that the companion `LIFECYCLES` equals the core `LIFECYCLES` from `packages/core/lib/control-state/run-state-parser.js`. |
| TPR-F01 | T-006 | Parity fixtures for `superseded` and `abandoned`, made with the core test builders (`createRun` plus a sealed lifecycle edit), are compared with the core reader. Each is closed, never assigned (even when changed in the session) and drops a selection. The adapter suite selects a run, supersedes it, and checks that the next read removes the selection from `companion-state.json` and no longer lists the run. |
| TPR-F02 | T-003 | `readSnapshot` returns the checked `root` in the `no_control` snapshot. `view.mjs` shows `messages.noControl` with `{folder}` (last path part, either separator) and `messages.noControlHint` with the full path. `locales.json` en/de: "No AGDF control folder in “{folder}”." / "Kein AGDF-Kontrollordner in „{folder}“." and "Checked project folder: {path}" / "Geprüfter Projektordner: {path}". |
| TPR-F02 | T-006 | Reader test of the `no_control` snapshot including `root`. View tests in German (Windows path) and English (POSIX path with a trailing slash). The terminal text shows message and hint on consecutive lines. |
| Owner request 3 | T-003 | `locales.json` `reasons.working`: „Als Nächstes: {gate}“ / „Next: {gate}“. |
| Owner request 3 | T-006 | The view suite checks the run-derived „läuft“ reason in de and en and the unchanged turn reason. |
| Owner request 4 | T-004 | `register.mjs`: the stepping buttons carry `label: t('actions.previous' \| 'actions.next')` with the child ◀ / ▶. `locales.json` drops `actions.show`. |
| Owner request 4 | T-006 | The adapter suite checks label and drawn glyph of both buttons in an English and a German session. |
| TPR-F01, TPR-F02, owner request 3 | T-008 | `INSTALL.md` companion section: only active runs are open, and superseded or abandoned runs are never shown and drop a selection. Without `.agdf/control` the panel names the checked folder. Without an observed turn, the reason names what comes next. |
| — | T-007 | Runtime plugin and provenance regenerated with `npm run build:prepare`. Compatibility re-recorded (56 scenarios, 0 failed), the check passes, and the superseded uncommitted observation `19c34dc7…` was removed. The Copilot payload, the contracts and the eval fingerprints are unchanged. |

## Verification

- `claude-companion-test`, `claude-companion-adapter-test`, `claude-companion-integrity-test`, `runtime-integrity-negative-test` and `public-plugin-test` pass. `check-runtime-integrity.mjs` passes on the regenerated plugin.
- Mutation check. Each old behaviour was re-introduced one at a time and failed its suite (10 of 10 killed):
  - the two-value lifecycle set;
  - the old open-runs rule (also caught by the adapter suite);
  - assignment of closed runs from a change in the session;
  - the `no_control` snapshot without `root`;
  - the full path instead of the folder name;
  - the missing hint;
  - the old de and en `reasons.working`;
  - glyph-only labels on ◀ and ▶.
- Native, Claude Code 2.1.302:
  - `claude plugin validate` on a scratch copy of the regenerated runtime plugin passes, with the same six hooks and calls and `.catch` on `command.run` and `ui.close`.
  - `claude plugin test` passes 3 of 3.
  - A new native case starts a session without a control folder and finds "No AGDF control folder in “live-project”." and "Checked project folder: C:/live-project" in the desktop pane.
  - In the selected-run pane the engine reports both stepping buttons with drawn text ◀ / ▶ and label „Vorheriger Run“ / „Nächster Run“.
- `npm run verify:ci` on the tree before requests 3 and 4: 23 of 27 stages passed. cli-smoke failed once in `packages/mcp-server/test/expanded-source-revision.test.js`, cell PRD/QA: the CLI replay returned `effect_unknown` instead of `already_applied`. The same cell passed alone (`--source-gate PRD --phase QA`). The corrections do not touch the core, and the cell predates the Brownfield Analysis core fix.
- `npm run verify:ci` on the final tree: passed all 27 stages (exit 0, 2026-10-26; cli-smoke 4926 s), including the three companion suites and all 22 source/phase cells of the MCP source-revision test

## Missing Evidence

- The installed desktop build predates the CR and QA corrections. A live spot check of the corrected build is planned before UAT.
- Linux and macOS run in pull-request CI.
