# CD+Tests: Fail-Closed Verified Change Path

## Status

- status: `done`
- based_on: `.agdf/control/artefacts/verified-change-path/TP.md`
- date: 2026-07-14

## Delivered Implementation

- Added canonical `verified_change` policy, lifecycle, eligibility, baseline, mini-closeout and escalation semantics to the Runtime Contract.
- Added the durable `VERIFIED_CHANGE.md` template and registered it in control/package manifests, generated-surface synchronization and runtime-integrity coverage.
- Extended run and Brownfield templates, router, tenets, constitution and control documentation with the single canonical mode vocabulary.
- Implemented a shared Verified Change record evaluator in `create-agdf/bin/create-agdf.js`; `doctor` and `gate-check` consume the same result.
- Added fail-closed checks for linked UR, record status, escalation target, exactly one owner, bounded paths, prohibited impacts, deterministic validation, derived propagation, tracked/untracked baseline, dirty candidate paths, post-baseline scope escape and executed evidence.
- Added gate transitions for record draft/invalid, eligible, executed and escalated states. Verified Change execution never receives a user approval bypass; escalation returns only to the declared structured target.
- Updated `CG-DOCUMENTATION-CEREMONY-BOUNDARY` with the final boundary, baseline isolation and escalation contract.

## TP Coverage

| task_id | Status | Evidence |
|---|---|---|
| VCP-01 | done | Runtime Contract defines `verified_change`, compact record requirements, fail-closed eligibility and canonical transition rows. |
| VCP-02 | done | `VERIFIED_CHANGE.md` exists, is registered in control/package manifests and is present in generated package assets. |
| VCP-03 | done | `AGDF_RUN.md`, `RUN_STATE.md` and Brownfield template expose the new mode/artefact vocabulary. |
| VCP-04 | done | Shared evaluator validates linked UR, required fields, owner, paths, impacts, propagation, validation and execution evidence; focused missing/malformed fixtures pass. |
| VCP-05 | done | Baseline fixture preserves pre-existing unrelated tracked/untracked work, proves eligible execution with a clean candidate, dirty-candidate rejection and new unlisted-path rejection. |
| VCP-06 | done | `doctor --json` emits structured findings and `gate-check --json` fixtures assert draft/eligible/executed/escalated transitions including their current gate, allowed/forbidden behavior, blocking reason and next action. |
| VCP-07 | done | Parser internal artefact vocabulary, next-skill map and status output recognize Verified Change; legacy control-state tests remain green. |
| VCP-08 | done | Escalated fixtures reach `PRD` with `Approval: PRD` for both declared targets; implementation remains forbidden. |
| VCP-09 | done | Agent router, tenets, constitution and control README direct selection to the canonical contract; focused guidance assertions verify the UR/Brownfield and escalation wording. |
| VCP-10 | done | Runtime integrity checks required record fields and template presence; isolated negative fixtures prove missing template and record anchor failures. |
| VCP-11 | done | `CG-DOCUMENTATION-CEREMONY-BOUNDARY` records final eligibility, baseline and escalation invariants. |
| VCP-12 | done | Generated sync, focused tests, full package smoke, runtime integrity, doctor and diff checks pass. |

## Test Evidence

- `npm --prefix create-agdf run test:verified-change` → pass: guidance, draft/eligible/executed/escalated transitions, linked UR, missing/multi-owner, missing/malformed paths, missing validation, prohibited impact, missing propagation, missing execution evidence, unrelated tracked/untracked baseline preservation, dirty candidate, scope escape and both escalation targets.
- `npm --prefix create-agdf run test:runtime-integrity-negative` → pass: isolated missing-template and missing-record-anchor failures.
- `node create-agdf/scripts/control-state-test.js` → pass.
- `npm --prefix create-agdf run smoke-test` → pass, including sync, control-state, Verified Change, Delivery Path Search, package smoke and routing tests.
- `node plugin/scripts/check-runtime-integrity.mjs` → pass (`9 skills and 15 control files checked`).
- `node create-agdf/bin/create-agdf.js doctor --json` → pass, 0 findings.
- `git diff --check` → pass.

## Intentionally Not Performed

- No change to existing approval names, external agent APIs or public CLI command shape.
- No attempt to reclassify previous runs through the new path.
- No commit, push, pull request, publication or release.
- No QA decision or UAT request; mandatory reviews remain next.

## Next Step

Run QA Gate; request `Approval: QA` only after a QA pass.
