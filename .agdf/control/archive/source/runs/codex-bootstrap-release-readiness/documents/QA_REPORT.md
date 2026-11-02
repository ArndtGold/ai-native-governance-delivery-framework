# QA Report: Surface Bootstrap and Registry Readiness

## Status

- decision: pass
- gate: QA
- created_at: 2026-07-10

## QA Gate

- decision: pass
- evidence: TP coverage complete for T01-T10; Brownfield Analysis passed; Clean Implementation Review passed; Code Review passed with no findings; required validation passed.
- missing_evidence: live GitHub Actions execution of the npm readiness steps
- risks: Codex and Claude Code CLI list output may evolve; implementation uses tolerant parsing and focused stub coverage. Publish readiness was validated statically and should be proven by the next real tagged publish run. The 0.4.5 publish observation showed that the readiness check must gate `@agdf/cli` publication on `create-agdf` readiness, which is now reflected in the workflow and smoke assertions.
- required_next_step: Request `Approval: UAT` before delivery closeout, commit, push, PR, release, tag or publish.
- impact_codes: none

## Validation Evidence

| Check | Result |
|---|---|
| `npm --prefix create-agdf run smoke-test` | pass |
| `npm --prefix agdf run smoke-test` | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass |
| `npx --yes @agdf/cli@latest doctor --json` | pass, 0 findings |
| `git diff --check` | pass |

## TP Coverage Summary

- fully_done: T01, T02, T03, T04, T05, T06, T07, T08, T09, T10
- partially_done: none
- not_done: none
- out_of_scope_changes: none identified

## QA Decision Rationale

QA passes because the approved task plan is fully covered by implementation evidence, focused smoke tests, runtime integrity checks and reviews. The remaining live-release evidence is correctly classified as residual release-time evidence rather than an implementation blocker because the workflow cannot be executed locally without publishing. The release-readiness implementation now prevents the observed dependency gap by waiting for `create-agdf` before publishing `@agdf/cli`.
