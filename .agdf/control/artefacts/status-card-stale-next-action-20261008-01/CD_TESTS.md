# CD+Tests: Stale next step after internal step recording

- run_id: status-card-stale-next-action-20261008-01
- tp: re-approved TP after source revision `c197a5b8-48a2-4224-97c2-5383be039112` (forward-only rule)
- date: 2026-10-08
- status: done

## Implementation (SDD-01 to SDD-08)

| Task | Change | Path |
|---|---|---|
| T-002 | New precedence helper: `storedGateMoved` (forward move in the canonical gate order, active runs only), `storedNextActionApplies`, `effectiveNextAllowedAction` | `packages/core/lib/control-evaluation/next-action.js` |
| T-003 | Gate-check fallback and `continuePostTpWork` use the effective next step; Verified Change and source-revision branch unchanged; unused `isPlaceholderValue` import removed | `packages/core/lib/control-evaluation/gate-check.js` |
| T-004 | Delivery-map uses the helper; unused import removed | `packages/core/lib/control-evaluation/delivery-map.js` |
| T-005 | `run-update` refreshes `current_gate`, `next_allowed_action` and the four derived Current Control State rows only for forward-moved active runs | `packages/core/lib/control-state/run-recording.js` |
| T-006 | Shared `CD_TESTS_NEXT_ALLOWED_ACTION` constant, imported by the dispatcher | `packages/core/lib/control-evaluation/gate-policy.js`, `packages/core/lib/skill-dispatch/service.js` |
| T-007 | No cockpit code change (inherits from gate-check) | `packages/core/lib/control-inspect/cockpit.js` unchanged |
| T-008 | Generated copies regenerated with `npm run sync-package-assets`. Copilot payload baseline raised by the exact attributed growth of 1 file/3430 bytes. | `plugins/agdf/meta/copilot-payload-baseline.json` |

## Tests

| Suite | Result | Scenarios |
|---|---|---|
| `test:next-action` (new, `packages/core/test/next-action-test.js`) | pass | SCN-003, SCN-007, SCN-009, SCN-013 plus backward and unknown gate |
| `test:run-revision` (writer cases added) | pass | SCN-001, SCN-002, SCN-019; approval edit still rejected; refreshed run keeps valid seals and approvals in doctor |
| `test:cli-gates` (scenario `stale-next-step` added) | pass | SCN-004, SCN-005, SCN-011, SCN-020; blocker precedence; completed runs |
| `test:skill-dispatch` (implementation continuation cases added) | pass | SCN-012, SCN-014 |
| `node --test packages/core/test/cockpit-scoped-read-test.js` (forward and backward case added) | pass, 11/11 | SCN-006 |
| `test:control-state` (existing backward-move safety case in `artefact-recording-test.js` unchanged) | pass | SCN-021 |
| `test:interaction-presentation`, `test:run-step-transaction` | pass | regression |
| Runtime integrity, source and installed layout | pass | SCN-017 |
| Before/after comparison over 115 runs | 1 changed (the cockpit run, forward move) | SCN-008, SCN-010, see `evidence/NEXT_ACTION_COMPARISON.md` |
| `doctor --all-active` and `delivery-map --all-active` | identical to the unchanged runtime: 66 findings from other runs, 0 differences | SCN-018 |
| `smoke-test` chain | see Smoke Chain below | regression |

Mutation checks: reverting the helper to the old precedence fails `stale-next-step` ("gate-check uses the evaluated next step"), and disabling the writer refresh fails `test:run-revision` ("the moved gate is refreshed").

## Smoke Chain

Pending: results are recorded after the run completes.

## Open

- SCN-016: host observation after a consented plugin reinstall (see `evidence/COCKPIT_RUN_VERIFICATION.md`).
