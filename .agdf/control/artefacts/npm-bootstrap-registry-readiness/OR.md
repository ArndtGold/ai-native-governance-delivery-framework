# Orchestration Report: Reliable npm Bootstrap Readiness

- gate: QA
- report_mode: OR-full
- artefact: `.agdf/control/artefacts/npm-bootstrap-registry-readiness/OR.md`
- status: revise
- current_authority: QA is not passed; release, commit, push, PR and UAT are not authorized by this scope.
- missing_approval: `Approval: QA` after the QA gate is rerun and passes

## Delivered

- Added explicit bounded verification that `@agdf/cli@latest` resolves to the release version.
- Added disposable npm-cache/HOME release execution context.
- Added a clean public bootstrap smoke test using exactly `npx --yes @agdf/cli@latest codex`.
- Added isolated installation-output evidence and public command-contract assertions.
- Updated maintainer release documentation without changing user-facing commands.
- Persisted UR, Brownfield Review, PRD, SD, TP, Brownfield Analysis, TP Review, Clean Review, Code Review and QA Report.

## Intentionally Not Delivered

- No additional public `npx` flags or parameters.
- No alternate bootstrap syntax, wrapper package, cache-clearing instruction, or user-side retry flow.
- No commit, push, PR, release execution, UAT, or QA approval.

## Evidence And Quality

- TP coverage: NBR-01 through NBR-08 locally fully covered.
- Brownfield fit: pass; existing workflow, package, sync, and test owners reused.
- Solution integrity: pass; no fallback-heavy or parallel ownership structure introduced.
- Code Review: pass; no actionable finding.
- Local validation: package smoke tests, clean bootstrap test, runtime integrity, package dry-runs, and diff check passed.
- Documentation impact: `RELEASE.md` only; public command shape remains unchanged.
- Context Graph impact: `no_new_node`; `context_graph_reconciliation: not_applicable`.

## Missing Evidence And Risks

- The real GitHub Actions publish workflow has not yet run the new readiness and clean-client steps against a release.
- npm/CDN propagation remains externally eventually consistent.
- Local evidence cannot prove behavior for an already-stale arbitrary user cache.

## Retained Fallbacks

- None in the product path. Bounded polling is release-side readiness control, not a user-facing workaround.

## Required Next Step

Run the next real `agdf-v<version>` GitHub Actions publish workflow, retain its exact-version,
`latest`, and clean-client evidence, then rerun the QA Gate.

## Quality Outlook

The release-side race is structurally covered; remaining uncertainty is limited to live external
registry propagation evidence.
