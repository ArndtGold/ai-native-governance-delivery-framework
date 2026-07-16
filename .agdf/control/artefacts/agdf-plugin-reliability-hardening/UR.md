# UR: Make Runtime Integrity Verification Work From Installed Plugin Layouts

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-16
Date: 2026-07-16
Owner: agent

## 1. Problem

`plugin/scripts/check-runtime-integrity.mjs` passes from the AGDF source repository but fails when
executed from the installed Codex plugin cache. Its default root calculation assumes that the
script always lives below a repository root that contains a separate `plugin/` directory. In the
installed layout, the script already lives inside the plugin root, so it resolves a non-existent
`plugin/skills` path and exits with `ENOENT` before checking any invariants.

This leaves a gap between source-package validation and validation of the artifact users actually
install. A source checkout can be green while the shipped diagnostic is unusable in its installed
location.

## 2. Goal

Make the runtime-integrity checker reliably discover and validate both supported layouts:

- the AGDF source repository, where the plugin is located at `<repo>/plugin`; and
- an installed or staged plugin root, where `.codex-plugin`, `skills`, `meta`, `control` and
  `scripts` are direct children of the resolved root.

The release checks must fail if either layout stops working.

## 3. Scope

- Make runtime-integrity root and plugin-root resolution explicit, deterministic and fail-closed.
- Preserve `AGDF_RUNTIME_INTEGRITY_ROOT` as an explicit override with documented semantics.
- Add a regression test that validates a staged installed-plugin layout, not only the source tree.
- Wire the installed-layout regression into the existing `create-agdf` smoke or release-validation
  path.
- Keep source-repository integrity checks and their current invariants intact.

## 4. Non-Goals

- No broad refactor of the 3,342-line `create-agdf` command entry point in this slice.
- No redesign of native approval interactions or their live UAT process.
- No cross-platform replacement of the Bash SessionStart hook in this slice.
- No change to gate semantics, exact approval authority, control-state formats or generated user
  artefacts.

The larger maintainability, live-host UAT and platform-neutral-hook recommendations remain separate
candidate slices because they have different owners, risks and acceptance evidence.

## 5. Acceptance Signals

- `node plugin/scripts/check-runtime-integrity.mjs` passes from the repository root.
- The same checker passes against a staged directory shaped like the installed Codex plugin cache.
- A negative installed-layout fixture fails when a required skill, contract or control template is
  missing or inconsistent.
- `npm --prefix create-agdf run smoke-test`, `npm --prefix agdf run smoke-test` and
  `git diff --check` pass.
- The installed-layout test is part of CI or release validation and cannot be skipped silently.

## 6. Existing Source Of Truth

- `plugin/scripts/check-runtime-integrity.mjs`
- `plugin/.codex-plugin/plugin.json`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/meta/agdf-runtime-contract.md` and `plugin/meta/contracts/`
- `create-agdf/scripts/runtime-integrity-negative-test.js`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/package.json`
- `.github/workflows/agdf-guardrails.yml`
- `.github/workflows/publish-agdf.yml`

## 7. Risks And Unknowns

- The current checker also validates repository-only owners such as package manifests, Pages data,
  marketplace metadata and active control state. Brownfield Review must decide which invariants are
  meaningful in installed mode and which must remain source-only without weakening either mode.
- Root auto-detection must reject ambiguous or partial layouts instead of silently selecting the
  wrong validation mode.
- The staged test should reuse canonical plugin assets without introducing another independently
  maintained fixture copy.

## 8. Next Step

Run the post-UR Brownfield Review and record the Mode/Slice Decision. Implementation remains
forbidden until that internal routing step is complete.
