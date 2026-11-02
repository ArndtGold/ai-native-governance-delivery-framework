# CD+Tests: State Orientation Visibility Implementation (Slice A)

Status: done
Date: 2026-07-15
Owner: agent

## Implemented Tasks

| task_id | Task | Evidence |
|---|---|---|
| SO-01 | `buildBreadcrumbPath()` + `breadcrumb` field in `buildStatusCard()` | `create-agdf/bin/create-agdf.js:2336-2398`; live `gate-check --json` returns `breadcrumb: [UR ✓, PRD ✓, SD ✓, TP ✓, QA ○, UAT ○]` |
| SO-02 | `buildBreadcrumb()` export | `create-agdf/lib/interaction-presentation.js`; BT-01–BT-04 pass |
| SO-03 | `buildTransitionNarration()` export | `create-agdf/lib/interaction-presentation.js`; BT-05–BT-07 pass |
| SO-04 | `collapseInternalState()` export | `create-agdf/lib/interaction-presentation.js`; BT-08–BT-12 pass |
| SO-05 | Locale keys (`breadcrumb*`, `internalStateLabels`, `narration`, `gateTitles`) for `en`/`de` | `plugin/meta/agdf-interaction-locales.json`; JSON valid; BT-14 pass |
| SO-06 | Runtime Contract subsections (§Breadcrumb, §Post-Acceptance Narration, §Internal-State Collapse) | `plugin/meta/agdf-runtime-contract.md`; propagated to generated surfaces |
| SO-07 | Gate-check skill guidance (breadcrumb rendering, narration guidance, collapse rules) | `plugin/skills/gate-check/SKILL.md`; propagated to generated surfaces |
| SO-08 | Propagation to generated surfaces | `create-agdf/scripts/sync-package-assets.js`; generated locale JSONs, runtime contract and skill confirmed |
| SO-09 | 14 regression assertions (BT-01–BT-14) | `create-agdf/scripts/control-state-test.js`; all pass |
| SO-10 | Locale-key completeness checks | `plugin/scripts/check-runtime-integrity.mjs`; runtime integrity passes |

## Test Results

```
control-state tests passed
[agdf-runtime-integrity] ok (9 skills and 15 control files checked)
create-agdf smoke test passed
doctor: pass (0 findings)
gate-check: open, CD+Tests, breadcrumb present
git diff --check: clean
```

## Review Findings Fixed

1. **[advisory] `buildBreadcrumbPath` explicit `undecided` key:** Added `undecided: ["UR"]` to `BREADCRUMB_PATH_TEMPLATES` instead of relying on `?? ["UR"]` fallback. Explicit key is more maintainable.
2. **[advisory] `buildTransitionNarration` fail-closed on empty `agentNext`:** Added early return `""` when `agentNext` is empty. Prevents malformed narration with empty middle segment. The `check-runtime-integrity.mjs` validates `agentNext` presence, but the function now fails closed defensively.

## Release Note

The `status_card` JSON output from `gate-check --json` and `delivery-map --json` now
includes an additive `breadcrumb` field: `[{gate: string, status: "fulfilled" | "current" | "open"}]`.
This is a new derived field for the presentation layer. Existing consumers ignore unknown
fields; no breaking change. The field will appear in the next npm publish.
