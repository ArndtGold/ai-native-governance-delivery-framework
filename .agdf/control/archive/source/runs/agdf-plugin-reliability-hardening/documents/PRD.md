# PRD: Installed Plugin Runtime-Integrity Verification

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided in session on 2026-07-16
Date: 2026-07-16
Owner: agent
Derived from: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/UR.md`

## 1. Outcome

AGDF maintainers and installed-plugin diagnostics can run the same canonical runtime-integrity
checker from either a source checkout or an installed plugin directory. Each mode validates every
invariant whose authoritative files are actually part of that layout, and neither mode can pass by
silently misclassifying a partial tree.

## 2. Functional Requirements

### PR-01 Deterministic Layout Resolution

The checker must classify exactly one of:

- `source`: a repository root with the canonical plugin at `<root>/plugin` and the repository-only
  owners required by the source validation; or
- `installed`: a plugin root containing the canonical plugin-owned manifests, metadata, skills,
  control templates, hooks and assets directly beneath it.

Unknown, partial or ambiguous roots must fail with one actionable layout-resolution error.

### PR-02 Explicit Override Compatibility

`AGDF_RUNTIME_INTEGRITY_ROOT` must remain supported. Its value may identify either the source
repository root or the installed plugin root. The same deterministic classifier and fail-closed
rules apply; the override must not force an invalid mode.

### PR-03 Invariant Ownership

Both modes must validate plugin-owned invariants, including canonical definition/manifest
consistency, runtime-contract modules, locale and interaction rules, skills, hooks, assets, license,
and control templates.

Source mode must additionally retain repository-only checks for marketplace metadata, npm package
versions and dependencies, Pages data, generated-asset synchronization, CLI/runtime owners,
root-license parity and active control-state consistency.

Installed mode must not report repository-only files as missing.

### PR-04 Installed-Artifact Regression Evidence

An automated test must stage the canonical `plugin/` directory into a temporary installed-plugin
shape and prove:

1. the complete staged plugin passes;
2. removal of a required plugin-owned file fails with a precise invariant error; and
3. a partial or unclassifiable root fails closed.

The test must not maintain an independent fixture copy.

### PR-05 Delivery Integration

The installed-layout regression must run in the existing `create-agdf` smoke chain used by AGDF
guardrails and release validation. Existing negative source-layout tests remain active.

## 3. Non-Functional Requirements

- No new runtime dependency.
- No network access or mutation outside temporary test directories.
- Node.js 20 and 22 compatibility, matching release and guardrail workflows.
- Stable source-mode behavior and existing invariant coverage.
- Clear failure output suitable for local diagnosis and CI logs.

## 4. Acceptance Criteria

- AC-01: Source execution reports success with all current source checks intact.
- AC-02: Direct execution from a staged installed plugin reports success.
- AC-03: Installed mode rejects a missing skill, contract or control template.
- AC-04: A partial root is rejected before invariant traversal causes `ENOENT`.
- AC-05: Existing runtime-integrity negative tests still pass unchanged in intent.
- AC-06: Both package smoke tests and `git diff --check` pass.
- AC-07: CI and release workflows reach the installed-layout regression through their existing
  smoke entry point.

## 5. Non-Goals

- CLI entry-point modularization
- native approval UX or live host UAT changes
- SessionStart shell portability changes
- gate, control-state or approval semantic changes
- a second runtime-integrity implementation

## 6. Risks

- An overly permissive classifier could convert missing source owners into an installed-mode pass.
- An overly strict installed classifier could reject legitimate Codex or Claude cache layouts.
- Error-message assertions may become brittle if they bind to incidental absolute paths rather than
  stable invariant labels.

## 7. Next Step

Review and approve the derived compact Solution Design. Implementation remains forbidden until the
Task/Test Plan is also approved and the pre-implementation Brownfield Analysis passes.
