# Task Plan Review: Reliable npm Bootstrap Readiness

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| NBR-01 | fully_done | `.github/workflows/publish-agdf.yml` retains ordered publication and bounded readiness helper; `create-agdf/scripts/smoke-test.js` asserts ordering. | none | no blocker |
| NBR-02 | fully_done | Workflow polls `@agdf/cli@latest`, compares the resolved version, and fails with bounded actionable output; package smoke asserts the contract. | live GitHub Actions publish evidence not available in this local run | QA must verify source/test evidence and retain live-publish caveat |
| NBR-03 | fully_done | `create-agdf/scripts/release-bootstrap-smoke-test.js` uses disposable HOME/cache/target, fake Codex, and exact `npx --yes @agdf/cli@latest codex`. | none for local isolated evidence | no blocker |
| NBR-04 | fully_done | Clean bootstrap test verifies package dispatch, expected version, command sequence, and isolated installation marker; existing smoke tests cover Codex/Claude/Copilot/OpenCode target behavior. | live registry run is CI-only | QA must validate workflow placement |
| NBR-05 | fully_done | Existing help/reference assertions plus workflow/package smoke checks preserve documented command shape; no user-facing flags were added. | exhaustive semantic scan across all prose references remains a review check | no blocker |
| NBR-06 | fully_done | Existing asset sync and `plugin/scripts/check-runtime-integrity.mjs` pass. | none | no blocker |
| NBR-07 | fully_done | `RELEASE.md` documents internal readiness evidence and explicitly preserves public command syntax. | none | no blocker |
| NBR-08 | fully_done | `create-agdf` smoke, `@agdf/cli` smoke, runtime integrity, clean bootstrap, package dry-runs, and `git diff --check` pass. | live GitHub Actions execution remains unverified | QA must record the limitation honestly |

## Summary

- fully_done: NBR-01 through NBR-08 for the approved local/structural slice
- partially_done: none
- not_done: none
- out_of_scope_changes: none observed
- risks: live npm publish workflow and external registry propagation are not exercised by this local run
- required_next_step: QA Gate evaluation with the live-publish limitation visible
