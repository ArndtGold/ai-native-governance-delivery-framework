# UR: Release-Built Plugin Runtime Distribution

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-18 after same-run, same-gate and revision-2 revalidation.
Date: 2026-07-18
Owner: agent

## 1. Problem

The generated validator payload currently lives under source-controlled `plugin/runtime/`, even
though `create-agdf` is its only editable owner. Moving generation only into the GitHub publish job
would make the source tree cleaner, but the current Codex and Claude installers load `./plugin/`
directly from the GitHub marketplace and therefore would receive no runtime from a build-only asset.

## 2. Goal

Keep `plugin/` source-only in Git. The `Publish AGDF packages` workflow must generate the exact-version
runtime during packaging, include the complete generated plugin in the published `create-agdf`
package, and make supported installers consume that built plugin rather than the repository source
folder.

## 3. Scope

- Stop tracking the generated `plugin/runtime/` payload in the source plugin.
- Generate the runtime and complete plugin only inside the canonical package build/prepack path used
  by `.github/workflows/publish-agdf.yml`.
- Keep the generated full plugin inside the published exact-version `create-agdf` package.
- Change Codex and Claude installation/update adapters to stage that built plugin in a durable local
  AGDF-owned location and install/update from that location instead of registering the GitHub source
  repository as the runtime-bearing marketplace.
- Preserve OpenCode's existing exact config-local package path.
- Add release/package/install fixtures proving the source tree contains no runtime while published
  and installed full-plugin layouts do.
- Update release guidance and assertions only where the automatic behavior changes the documented
  sequence.

## 4. Non-Goals

- Creating tags, committing, pushing or performing a real publication during implementation tests.
- Replacing the canonical `sync-package-assets` or `sync-plugin-runtime` owners.
- Changing package/version policy, supported installation surfaces or runtime contents.
- Adding another runtime package or independently maintained evaluator implementation.

## 5. Acceptance Signals

- `plugin/runtime/` is absent from the committed source layout and cannot be required by source-mode
  integrity checks.
- Package prepack generates one exact-version plugin runtime and `npm pack --dry-run` proves the
  published `create-agdf` tarball contains the complete built plugin.
- Codex and Claude install fixtures use a durable local built-plugin marketplace and execute doctor,
  gate-check and delivery-map offline after installation.
- The GitHub publish job builds before package verification/publication and never commits or retags
  generated files.
- Existing version, lifecycle, aggregate smoke and installed-layout Runtime Integrity checks remain
  green.

## 6. Existing Source Of Truth

- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/sync-plugin-runtime.js`
- `create-agdf/lib/installers/plugin-installers.js`
- `.github/workflows/publish-agdf.yml`
- `plugin/meta/agdf-plugin.definition.json`
- `RELEASE.md`

## 7. Risks And Unknowns

- Codex and Claude local-marketplace behavior and durable storage ownership must be verified against
  their actual CLI contracts; an ephemeral npm/npx cache path is not acceptable.
- Existing installations currently registered to the GitHub marketplace require an explicit,
  ownership-safe migration/update path.
- Brownfield Review must determine the smallest structured depth because distribution and installer
  behavior change across two hosts.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
