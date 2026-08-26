# UR: Fresh-Checkout Local Plugin Install Must Not Crash

Status: approved
Gate: UR
Gate approval: approved
Date: 2026-08-26
Owner: Arndt Gold

## 1. Problem

On a fresh repository checkout, `npm run install:claude` (and by construction `install:codex` and `install:opencode`) crashes with `ENOENT` before doing any work. `create-agdf/scripts/install-local-plugin.js` imports `runCli` and `pluginDefinition` at module load time; that import graph reaches `create-agdf/lib/cli/runtime-context.js`, which eagerly reads `create-agdf/generated/plugins/agdf/meta/agdf-plugin.definition.json` with `readFileSync` during module evaluation. The `generated/` directory is gitignored and is only produced by `release:prepare`, which the installer runs later inside `installLocalPlugin()`. The module graph therefore crashes before the preparation step that would have created the missing file can execute.

## 2. Goal

A contributor on a fresh checkout can run `npm run install:<surface>` as the single documented command; the script performs its own `release:prepare` step first and then completes the installation, without requiring a manual pre-build.

## 3. Scope

- Defer loading of generated-file-dependent modules in `install-local-plugin.js` until after `release:prepare` has run (for example dynamic `import()` after the preparation step, or lazy reading in `runtime-context.js`).
- Preserve identical behavior for checkouts where `generated/` already exists.
- Add regression evidence for the fresh-checkout path (install invocation with `generated/` absent).

## 4. Non-Goals

- Committing `generated/` to version control.
- Changing the generation pipeline, marketplace format, installer semantics or surface set.
- Changing public CLI or published package behavior beyond the load-order fix.

## 5. Acceptance Signals

- `npm run install:claude` proceeds past module load and runs `release:prepare` on a checkout without `create-agdf/generated/`.
- Existing installer, marketplace and lifecycle regression tests still pass.
- A focused test covers the fresh-checkout load path so the regression cannot silently return.

## 6. Existing Source Of Truth

- `create-agdf/scripts/install-local-plugin.js` owns the local install entry point (delivered by run `agdf-local-plugin-install-scripts`).
- `create-agdf/lib/cli/runtime-context.js` owns generated-definition loading.
- `create-agdf/scripts/sync-package-assets.js` (via `release:prepare`) owns generation of `create-agdf/generated/`.
- `.gitignore` line 29 excludes `create-agdf/generated*/`.

## 7. Risks And Unknowns

- `runtime-context.js` is imported eagerly by most of `lib/`; making it lazy globally could have wide blast radius. The narrow fix is to make only the installer script defer its imports.
- The prior run's QA/UAT executed with `generated/` present, so existing evidence does not cover the fresh-checkout path.

## 8. Next Step

Perform the post-UR Brownfield Review and proportional Mode/Slice Decision.
