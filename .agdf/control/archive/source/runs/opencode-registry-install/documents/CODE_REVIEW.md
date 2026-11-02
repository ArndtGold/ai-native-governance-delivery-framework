# Code Review: OpenCode Registry Installation and Runtime Integrity

Status: pass
Based on: final implementation diff after review fixes, approved TP, TP Review and Clean Implementation Review
Date: 2026-07-13

## Code Review

- decision: `pass`
- findings: none remaining in the reviewed scope.
- resolved_findings:
  - `[resolved P1]` Approved-TP internal prerequisites are now evaluated before QA/UAT. Premature QA and premature UAT fixtures remain at Brownfield Analysis and CD+Tests respectively.
  - `[resolved P1]` Internal-step satisfaction is step-specific: `not_applicable` is accepted for Brownfield Review/Analysis only; CD+Tests and mandatory CR require `done` on the approved-TP path. A regression fixture proves the bypass is rejected.
  - `[resolved P2]` The fake npm test seam uses `NODE_ENV=test` plus `AGDF_TEST_NPM_CLI_PATH`, which runs as `process.execPath <fake-cli>` before platform-specific npm selection. It no longer depends on PATH and therefore covers the Windows command path deterministically without changing the production package source.
- evidence:
  - Eleven CLI transition cases assert status, current gate, missing approval, allowed, forbidden and next action.
  - Existing QA/UAT/OR fixtures with TP `not_applicable` remain compatible; approved TP requires the internal implementation sequence.
  - Full `npm --prefix create-agdf run smoke-test` passes after fixes.
  - Runtime integrity, release-bootstrap smoke, doctor and diff checks pass.
  - Generated Runtime Contract is synchronized with the step-specific satisfaction rule.
- missing_evidence: none for Code Review. Native Windows execution is not available in this session, but the previously platform-dependent branch is removed from the test path by construction and covered through the platform-prioritized injection code.
- risks:
  - Real global OpenCode update remains an explicit UAT action, not Code Review evidence.
  - The test-only npm CLI injection is enabled only when `NODE_ENV=test`; production continues to use the existing platform-specific npm command selection.
- reviewed_scope:
  - installer command construction and cross-platform test seam;
  - parser normalization and heading compatibility;
  - step-specific internal satisfaction;
  - earliest-gate transition ordering through OR;
  - Runtime Contract/template propagation;
  - migration, source-removal and full transition fixtures.
- evidence_strength: `high` for correctness and regression behavior; `medium-high` for Windows compatibility because the branch is deterministic by construction but not executed on native Windows in this session.
- context_graph_impact: `link_only`; no new node or reconciliation action required.
- required_next_step: Run QA Gate using the final TP Review, Clean Implementation Review, Code Review and regression evidence.
