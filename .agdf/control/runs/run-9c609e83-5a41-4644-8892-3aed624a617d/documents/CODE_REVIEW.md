# Code Review: Companion shows planned URs instead of an empty state

Gate: CR
Type: Code Review
Status: `done`

## Run

- run_id: run-9c609e83-5a41-4644-8892-3aed624a617d
- approved_tp: sha256:6254af66bc0d28ccac7c827da33d71fdb8d33323f71a584ac5a4617e657a2198
- reviewer: independent review subagent (read-only, given the code and spec, not the author's assessment) plus Claude (agent) verification and fixes
- reviewed_at: 2026-11-16

## Scope

Actual uncommitted diff on `feat/companion-planned-ur` against base `13c10af7`: `packages/core/lib/companion/run-view.js`, `packages/core/lib/interaction-catalog-validation.js`, `plugins/agdf/host-templates/claude/companion/{assignment,run-state,view,register,notice}.mjs`, `plugins/agdf/meta/agdf-interaction-locales.json`, and the tests `packages/core/test/companion-run-view-test.js`, `packages/cli/scripts/claude-companion-test.js`, `packages/cli/scripts/claude-companion-adapter-test.js`. Generated files (`docs/compatibility/**`, payload baseline, observation) were checked only for regeneration consistency.

Checked and fine: the `readUrFacts` refactor keeps all safety checks (safe relative path, `.agdf/control/` prefix, no symlink component, contained regular file, size limit) and the `source_changed` rethrow; `last_change` comes from the snapshot stat copy; the planning read only runs with `store.status === 'ok'` in its own captured read with `[]` fallback and excludes transferred entries; `pickPlan` handles empty/undefined lists and invalid dates without crashing; `snapshotFromRunView` drops malformed entries; no state leaks between run and plan views (figure scope by plan id, `events(null)`, null `chatRunId`, notice reset, refresh run ids); `observedRun` and `buildPanelView` share the order unreadable selection, plan, idle; de/en catalog keys are complete; the host template reads only directory listings of the planning folder.

## Findings

- [low] `plugins/agdf/host-templates/claude/companion/register.mjs` refresh: the fingerprint taken before the read was reused when the run ids were unchanged, although it was built from the old planned list; a new or removed planned UR therefore caused one extra run-view process on the next tick. Fixed: the stored fingerprint is reused only when both the run ids and the planned ids are unchanged (`plannedIds()`). Re-verified: new adapter assertion "a new planned UR is read once, not twice" fails with the old condition (AssertionError observed) and passes with the fix.
- [low] `register.mjs` `listCapacity`: beside a planned UR the open-run list was sized without the plan's name, route, goal, turn box, gate bar, note and id, so the desktop body could overflow. Fixed: these blocks count when `view.planId` is set. Re-verified: new adapter assertion that a planned view leaves at least eight fewer list rows passes.
- [low] `view.mjs` planned name: an untitled plan read "New run", and a placeholder entry titled with its plan id showed the id twice. Fixed: an empty title or a title equal to the plan id shows the new catalog text `companion.planned.untitled` ("Untitled UR" / "UR ohne Titel"). Re-verified: updated English assertion and new German placeholder assertion pass.
- [low] `packages/core/test/companion-run-view-test.js`: the localized-goal path for planned URs and a planning store that exists but is not a folder were not exercised. Fixed: added a German summary case (de goal from the summary, en goal authored) and a case with `.agdf/control/planned` as a regular file (`planned: []`, runs still listed). Both pass.

## Re-verification After Fixes

Derived chain re-run in order: `npm run build:mcp`, `node scripts/sync-package-assets.js` (first failed with `AGDF_COPILOT_PAYLOAD_GROWTH` as expected for the new catalog text), exact baseline set from the generated inventory to 459 files / 4,826,070 bytes, sync passed, `node scripts/host-compatibility/run.mjs record` and `check` (0 failed); the observation `54804015...json` is now referenced and the superseded unreferenced `64ad0d2f...json` was removed. Full TP check list re-run and green: `test:claude-companion`, `test:companion-run-view`, interaction-catalog, payload-budget, copilot-profile, package-contents, `test:skill-evals`, `eval:skills`, `test:operational-localization`, `test:interaction-presentation`, host-compatibility-test, run-view-command-test, `test:planned-urs`, `npm run build:prepare`, community health, control-ui typecheck and `npm test` (353/353).

## Missing Evidence

- The live Claude companion pane is not exercised (stated gap since PRD).
- `npm run test:browser` of packages/control-ui not run (outside TP).

## Risks

- Readiness of planned URs follows the display language (accepted PRD risk).

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | register.mjs refresh fingerprint reuse; adapter test red without fix, green with fix | none |
| CR-02 | implementation_gap | CD+Tests | resolved | register.mjs listCapacity planned blocks; adapter listCapacity assertion passes | none |
| CR-03 | implementation_gap | CD+Tests | resolved | view.mjs untitled/placeholder name with catalog key planned.untitled; claude-companion-test assertions pass | none |
| CR-04 | evidence_gap | evidence_obligation | resolved | companion-run-view-test.js localized goal and file-instead-of-folder cases pass | none |

## Required Next Step

QA gate.

## Decision

- decision: pass
