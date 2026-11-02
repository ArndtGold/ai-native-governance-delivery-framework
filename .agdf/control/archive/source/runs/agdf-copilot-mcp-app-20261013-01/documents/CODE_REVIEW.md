# Code Review: Plugin-Owned Canonical Artefact Template Resolution

- run_id: `agdf-copilot-mcp-app-20261013-01`
- reviewed_at: 2026-10-13
- reviewed_scope: shared resolver, Core resource binding, projected plugin runtime, all nine continuation owners, localized recovery, package projection, focused tests and generated compatibility evidence

## Code Review

- decision: pass
- findings:
  - [resolved] `packages/core/lib/resources/artefact-templates.js` - normal object indexing allowed inherited keys such as `constructor` or `toString` to pass the initial allow-list lookup and reach path construction with the wrong error classification - replaced with `Object.hasOwn(TEMPLATE_FILES, templateId)` and added prototype-key regression cases in `packages/core/test/artefact-template-resolver-test.js`
- missing_evidence: none within the reviewed TP scope
- risks: the dependency-neutral build continues to report the existing npm audit advisory; no dependency manifest changed. QA, UAT and release authority remain separate.
- required_next_step: run `qa-gate` against the current CD+Tests, TP Review, Clean Implementation Review and Code Review evidence

## Reviewed Dimensions

| Dimension | Result | Evidence |
|---|---|---|
| Resolver correctness | pass | Exact own-property allow-list, absolute root, root kind, symlink/junction rejection, real-path containment and regular-file checks |
| Error behavior | pass | Four stable resolver codes remain distinct and dispatch diagnostics preserve them |
| Runtime authority | pass | Projected authoring resolves only from `AGDF_DISPATCH_PLUGIN_ROOT/control/templates`; missing root blocks authoring |
| Owner mapping | pass | UR, PRD, SD, TP, UX, Brownfield Review, Verified Change, QA and OR use existing owners |
| Exclusions | pass | Six scaffold/control filenames have no resolver identifier or authoring continuation |
| Mutation safety | pass | Resolver errors are read-only; repository scaffold and run fixtures remain unchanged |
| Compatibility | pass | Copilot retains seven tools; Codex cockpit/MCP, stdio continuations and host compatibility pass |
| Packaging | pass | Nine templates are source-mapped and occur exactly once in Copilot and npm inventories |
| Diff integrity | pass | `git diff --check` passes; unrelated mockup deletions remain untouched |

## Post-Fix Verification

| Command | Result |
|---|---|
| `node packages/core/test/artefact-template-resolver-test.js` | pass |
| `npm --prefix packages/cli run test:skill-dispatch` | pass after an initial parallel-run process timeout; isolated rerun passed completely |
| `npm --prefix packages/cli run test:plugin-mcp-runtime` | pass |
| `npm --prefix packages/mcp-server run test:continuation` | pass |
| `npm run build:prepare` | pass |
| `npm run compatibility:record` | pass: 56 evaluated, 0 failed; source fingerprint `d0109ac89412648c2fd3027ad6597338d40a0c8f7e4ece29d8ffed33e10f3693` |
| `npm run build` | pass |
| `git diff --check` | pass |

The initial dispatch-suite retry was required only because the suite's child process timed out while four heavy suites ran concurrently. The immediate isolated rerun passed every dispatch and binding case; no product failure was hidden.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | Own-property resolver guard, prototype-key negative tests and complete post-fix verification above | Consume the resolved finding and current evidence in QA |
