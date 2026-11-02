# UAT Report: Versioned AGDF Skill Evaluation Framework

Status: approved
Gate: UAT
Date: 2026-07-16
Owner: user
UAT approval: `Approval: UAT` provided in session on 2026-07-16

## Acceptance Target

Accept the repository-owned evaluation framework that covers every canonical AGDF skill with
versioned behavioral fixtures, fail-closed deterministic grading, optional live-host evidence and
mandatory CI/publish thresholds.

## Observable Outcomes

1. `npm --prefix create-agdf run eval:skills` completes credential-free and reports 27/27 passing
   cases across 9/9 canonical skills while explicitly stating that replay is not live execution.
2. Normal, boundary and adversarial cases cover every canonical skill and are bound to skill,
   router, fixture and declared contract fingerprints.
3. Missing, stale, unknown or malformed evidence; routing, gate, approval or action regressions;
   undeclared mutations; and artefact-quality failures block rather than reduce a score.
4. Disposable repositories contain realistic control and source artefacts, and before/after
   snapshots enforce mutation limits on success, failure and timeout paths.
5. `eval:skills:record` supports bounded Codex and Claude live observations with explicit
   `live_codex` or `live_claude` provenance and refuses to persist failing results.
6. A real Codex CLI 0.142.4 run selected `gate-check`, returned gate `PRD`, required
   `Approval: PRD`, selected only `draft PRD`, changed no files and passed deterministic grading.
7. Aggregate smoke, AGDF Guardrails and publish validation run the required deterministic lane at
   100% thresholds.
8. Maintainer documentation distinguishes replay evidence, live-host evidence and the deliberate
   fingerprint refresh workflow.

## Current Evidence

- QA decision and exact QA approval: pass
- TP Review: 13/13 fully done
- Clean Implementation Review and Code Review: pass
- focused skill-eval tests and deterministic replay rerun on 2026-07-16: pass
- Runtime Integrity, package smokes, Pages, selected-run doctor/map, both package dry-runs and diff
  validation: pass
- real Codex observation: pass with zero mutation; deliberately not persisted as CI authority

## Deliberate Boundary

This UAT accepts the repository implementation, not a publication, plugin reinstall or claim that
all future model behavior is proven. Deterministic replay is the mandatory CI authority. Live-host
recordings are variable supporting evidence and cannot override a deterministic safety failure.

The optional Pages mention discussed after QA is a separate public-communication change and is not
part of this UAT scope.

## UAT Decision

- decision: accepted
- missing_evidence: none
- required_next_step: Finalize the OR and prepare a commit-ready handoff without performing VCS or
  release actions automatically.
