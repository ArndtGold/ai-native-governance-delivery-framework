# UR: Publish a Runtime-Clean AGDF npm Package

Status: approved
Gate: UR
Gate approval: `Approval: UR` recorded 2026-08-30
Date: 2026-08-30
Owner: Arndt Gold

## 1. Problem

The published `create-agdf` npm tarball currently includes generated material that is useful for
release preparation and external review but is not consumed by installation, scaffolding or runtime
execution. The measured 0.14.2 dry-run contains 373 files and 2,399,718 unpacked bytes. At least 51
files and 261,008 unpacked bytes belong to generated OpenAI submission projections rather than the
installed product.

This weakens the package boundary, makes the runtime payload harder to audit and increases the risk
that development or release-only artefacts drift into the public installation surface.

## 2. Goal

Make the published `create-agdf` package an explicit, auditable runtime and installation payload.
Every packed path must have a documented installation, scaffolding, validation or runtime purpose.
Generated review, submission and temporary build material must remain available to maintainers where
needed but stay outside the npm tarball.

## 3. Scope

- Define the semantic publish inventory for `create-agdf` instead of publishing the broad
  `generated/**` tree by default.
- Preserve all files required by the supported Codex, Claude Code, OpenCode and GitHub Copilot
  installation and runtime paths.
- Exclude generated submission projections and plugin-local submission copies from the npm tarball.
- Assess other generated metadata individually and exclude it only when deterministic evidence shows
  that no packed runtime or installation path consumes it.
- Add positive completeness checks and negative package-boundary checks.
- Measure the resulting file count and packed and unpacked sizes with `npm pack --dry-run --json`.

## 4. Non-Goals

- Deleting canonical submission sources or stopping local submission-candidate generation.
- Removing installed diagnostics, the offline validator or files merely because they resemble source
  code or tests when they serve an operational runtime purpose.
- Changing public CLI commands, plugin identities, supported hosts, gate semantics or approval
  authority.
- Reopening or expanding the independent `agdf-copilot-plugin-integration` QA scope.
- Publishing a release, changing the npm version, committing, pushing or creating a pull request.
- Claiming a target package size before the dependency and ownership review is complete.

## 5. Acceptance Signals

The need is clear enough for Brownfield Review when:

1. runtime-required and maintainer-only generated material are explicitly distinguished;
2. the existing package, release-build, installer, validator and Runtime Integrity owners to inspect
   are named;
3. removal is based on proven non-consumption rather than filename or directory heuristics;
4. package tests must prove both required-file presence and forbidden-file absence;
5. release preparation may continue to create local submission artefacts without publishing them;
6. all supported installation and runtime profiles remain complete; and
7. the existing Copilot delivery run and unrelated dirty worktree paths remain outside this scope.

## 6. Existing Source Of Truth

- `create-agdf/package.json` owns the npm publish allowlist.
- `create-agdf/scripts/sync-package-assets.js` and its focused builders own generated package assets.
- `create-agdf/scripts/package-contents-test.js` owns tarball inventory assertions.
- `create-agdf/scripts/sync-plugin-runtime.js` owns the exact offline validator runtime payload.
- `plugin/submission/openai/**` owns canonical public-submission material.
- `create-agdf/generated/submissions/openai/agdf/**` is a generated review candidate, not an installed
  runtime authority.
- `plugin/meta/agdf-plugin.definition.json` owns shared plugin identity and profile metadata.
- The `agdf-copilot-plugin-integration` run owns the separate Copilot plugin-only delivery scope.

## 7. Risks And Unknowns

- A broad exclusion may remove a file consumed only by a clean-client, update, rollback or
  cross-platform installation path.
- Narrow file-by-file exclusions may become a brittle second inventory and reintroduce drift.
- Submission generation and npm package composition currently share release-preparation owners, so
  their boundary must be separated without creating duplicate build logic.
- Packed runtime diagnostics can look development-only even when they are required after install.
- Existing package tests currently require some submission artefacts and will need a deliberate
  contract change rather than weakened assertions.
- The final size reduction is evidence, not the primary acceptance criterion; runtime completeness
  remains the protected invariant.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
