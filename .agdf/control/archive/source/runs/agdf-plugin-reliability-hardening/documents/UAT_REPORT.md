# UAT Report: Dual-Layout Runtime-Integrity Validation

Status: approved
Date: 2026-07-16
Owner: agent
UAT approval: `Approval: UAT` provided in session on 2026-07-16

## Acceptance Target

Accept the repository implementation that makes the canonical runtime-integrity checker usable in
both source and installed plugin layouts while preserving all source-only release checks.

## Observable Outcomes

1. Source execution completes with `mode=source`, 9 skills and 15 control files checked.
2. A canonical plugin staged in the same shape as the installed Codex cache completes with
   `mode=installed`.
3. `AGDF_RUNTIME_INTEGRITY_ROOT` accepts either the source root or installed plugin root and uses the
   same classifier.
4. A missing installed contract fails with the canonical invariant message.
5. A partial plugin fails with `AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID` and no raw `ENOENT`/`scandir`
   stack trace.
6. The installed-layout regression runs automatically inside the aggregate package smoke test.

## Evidence

- QA decision and exact QA approval: pass
- TP coverage: 7/7 fully done
- Clean Implementation Review and Code Review: pass
- source, focused layout, negative, aggregate, CLI and package validation: pass
- selected-run doctor: pass with zero findings

## Deliberate Boundary

This UAT accepts the project change, not a deployment. The immutable installed 0.9.0 cache was not
edited. A later explicitly authorized commit/release/reinstall path is required before that existing
cache contains the new checker.

The broader CLI modularization, live native-interaction matrix and platform-neutral SessionStart hook
remain separate improvements and are not implied by this acceptance.

## Decision

Exact `Approval: UAT` was provided on 2026-07-16 after same-run/same-gate revalidation. The
repository outcome is accepted with the explicit non-deployment boundary above.
