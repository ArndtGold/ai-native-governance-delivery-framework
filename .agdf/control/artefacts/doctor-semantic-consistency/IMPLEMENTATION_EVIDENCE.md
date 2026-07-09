# Implementation Evidence: Doctor Semantic Consistency

Status: CD+Tests complete
Date: 2026-07-09
Owner: agent
Approved scope: `.agdf/control/artefacts/doctor-semantic-consistency/UR.md`

## Delivered

- `doctor` now checks semantic consistency between approved gates and durable artefact status vocabulary before later `gate-check` failures become confusing.
- QA durable artefacts now produce a clear `AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT` doctor finding when the artefact row uses `approved` instead of the QA-specific `pass` or `passed`.
- Existing valid QA-passed/UAT-ready gate-check behavior remains covered.
- New smoke coverage reproduces the observed mismatch with a focused fixture.

## Changed Files

| File | Change |
|---|---|
| `create-agdf/bin/create-agdf.js` | Added durable gate artefact status expectation helpers and `analyzeDurableGateArtefactConsistency()` into doctor evaluation. |
| `create-agdf/scripts/smoke-test.js` | Added regression fixture proving doctor revises on QA durable status mismatch and reports expected QA vocabulary. |

## Verification

Passed:

```bash
npm --prefix create-agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npx --yes @agdf/cli@latest doctor --json
git diff --check
```

Observed:

- create-agdf smoke test passed, including package asset sync, Delivery Path Search tests, scaffold smoke and routing render test.
- Runtime Integrity passed with 9 skills and 13 control files checked.
- Repository `doctor --json` returned `pass`.
- `git diff --check` produced no whitespace errors.

## Scope Notes

- No new gate model was introduced.
- No new control-state storage format was introduced.
- No historical artefact migration was added.
- The check is scoped to active parsed gate artefact rows, not arbitrary archived prose.
