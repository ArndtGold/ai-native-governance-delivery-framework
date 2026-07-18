# Code Review: Release-Built Plugin Runtime Distribution

Status: pass
Date: 2026-07-18
Reviewed scope: source/build composition, Runtime Integrity, local marketplace staging,
Codex/Claude adapters, workflow ordering, package tests, lifecycle documentation and directly
overlapping aggregate expectations.

## Code Review

- decision: `pass`
- findings: none remaining.
- resolved_during_review:
  - [correctness] `local-marketplace.js` originally treated a stable root plus backup as committed on
    recovery. It now restores the backup first, retires the uncommitted swapped root through an owned
    failed sibling, and has a regression for interruption after swap.
  - [integrity] Existing local marketplace manifests were originally checked only indirectly through
    the plugin digest. They are now compared against both complete canonical host manifests on every
    preparation, with tamper regression coverage.
  - [integrity] Staging originally checked runtime digest syntax but not the bundled payload bytes.
    It now recomputes the focused runtime payload digest before staging and rejects corruption.
  - [compatibility] Claude local marketplace JSON was verified in an isolated config and the parser
    now supports the observed `source: directory` plus `path` shape as well as the exact legacy GitHub
    shape.
- missing_evidence: no live authenticated host installation, native Windows filesystem execution or
  live tag-triggered GitHub Actions publication was reviewed; these remain explicit UAT/release
  boundaries.
- risks:
  - Host JSON schemas may evolve; unknown or conflicting shapes fail closed without marketplace
    removal and must be added through evidence-backed parser tests.
  - A process-kill boundary cannot be exhaustively simulated, but every persisted sibling requires
    an exact ownership marker and deterministic next-run recovery.
  - The repository has unrelated dirty changes and an existing invalid `cli-interactive-wizard` run;
    review scope preserved those changes and used selected-run validation.
- required_next_step: run QA Gate using TP Review, Clean Review, Code Review and CD+Tests evidence.
