# Reviews: Surface Bootstrap and Registry Readiness

## Task Plan Review

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T01 | fully_done | Codex adapter now runs marketplace add, marketplace upgrade, plugin add and list; fake Codex smoke test asserts exact order. | none | none |
| T02 | fully_done | Codex version mismatch path compares against `pluginDefinition.version` and emits expected, observed and corrective command; fake Codex mismatch test covers failure. | none | none |
| T03 | fully_done | Claude adapter uses marketplace add/update plus install or update; fake Claude tests cover absent and present plugin states and assert old `plugin add` is absent. | none | none |
| T04 | fully_done | Claude exposed-version and no-version cases are covered by fake CLI tests; no-version output reports verification limitation. | none | none |
| T05 | fully_done | Copilot rerun fixtures show generated files refresh, config language is preserved, user root `AGENTS.md` is preserved and fragment is refreshed. | none | none |
| T06 | fully_done | AGDF-owned root `AGENTS.md` fixture refreshes root file without creating a fragment; user-owned fixture preserves root file. | none | none |
| T07 | fully_done | `assertGeneratedWritePlan` precomputes blocked writes before writes; existing smoke fixtures exercise allowed reruns. | none | none |
| T08 | fully_done | Publish workflow waits for `create-agdf` readiness before publishing `@agdf/cli`, then waits for `@agdf/cli` readiness; smoke test asserts exact snippets and ordering. | Live GitHub Actions execution not performed. | QA should note static-only workflow validation. |
| T09 | fully_done | `npm --prefix create-agdf run smoke-test` ran `sync-package-assets` before smoke and routing tests. | none | none |
| T10 | fully_done | Smoke tests assert version verification, mismatch diagnostics, Claude no-version limitation, refreshed output and preserved file output. | none | none |

## TP Summary

- fully_done: T01, T02, T03, T04, T05, T06, T07, T08, T09, T10
- partially_done: none
- not_done: none
- out_of_scope_changes: none identified
- risks: publish workflow readiness was validated statically, not by a live tagged release run; the 0.4.5 observation drove the intermediate readiness gate correction
- required_next_step: QA gate review

## Clean Implementation Review

- decision: pass
- primary_solution: The implementation extends existing owners: `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/smoke-test.js` and `.github/workflows/publish-agdf.yml`.
- evidence: No new bootstrap executable, release workflow, generated-source authority or duplicated runtime rule set was introduced.
- fallbacks_retained: Claude no-version output is a bounded transparency path because the external CLI may not expose version metadata.
- workaround_or_shim_risk: low; fake executable tests are test isolation, not production shims.
- parallel_structure_risk: low; source-of-truth and sync paths remain unchanged.
- brownfield_fit: pass; existing adapter, generator, smoke-test and publish owners were reused.
- missing_evidence: live GitHub Actions publish execution
- required_next_step: Code Review, then QA

## Code Review

- decision: pass
- findings: none
- missing_evidence: live GitHub Actions publish execution for the new readiness step
- risks: Codex and Claude Code CLI list output may evolve; parser is intentionally tolerant and covered by controlled command-output tests
- required_next_step: QA gate review
