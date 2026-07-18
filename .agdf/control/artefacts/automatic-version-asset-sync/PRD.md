# PRD: Release-Built Plugin Runtime Distribution

Status: approved
Gate: PRD
Date: 2026-07-18
Derived from: approved `UR.md` and completed `BROWNFIELD_REVIEW.md`
Gate approval: `Approval: PRD` provided on 2026-07-18 after same-run, same-gate and revision-3 revalidation.

## 1. Product Requirement

AGDF must keep its Git source plugin free of generated runtime bytes while still delivering a
complete, exact-version, offline-capable plugin to Codex and Claude through the normal
`@agdf/cli` installation and update commands.

## 2. Users And Outcomes

- Maintainers commit only canonical plugin and `create-agdf` sources, not a generated runtime copy.
- The publish workflow creates one reproducible built plugin inside the released `create-agdf`
  package without modifying or retagging Git history.
- Codex and Claude users receive a durable, complete plugin installation whose local validator works
  without PATH, registry or network access after installation.
- Existing AGDF installations migrate safely from the GitHub marketplace path when the installer is
  rerun; unrelated marketplaces and user configuration remain untouched.

## 3. Functional Requirements

### PRD-01 — Source, Build And Install Layouts

Define and enforce three layouts:

1. source layout: `plugin/` contains canonical plugin sources and no `runtime/` directory;
2. package layout: `create-agdf/generated/plugins/agdf/` contains the complete plugin including the
   generated runtime, manifest and focused validator entrypoint; and
3. installed layout: an AGDF-owned durable host-local marketplace contains the same complete plugin.

Source-mode Runtime Integrity must not require runtime files. Package and installed-layout integrity
must require and verify exact version, digest, focused contents and offline resolution.

### PRD-02 — Canonical Package Build

`sync-package-assets` remains the only complete-plugin builder and `sync-plugin-runtime` remains the
runtime-payload generator. They must write runtime directly into the generated package plugin rather
than first materializing it under source `plugin/runtime/`.

Package prepack and the `Publish AGDF packages` workflow must run this canonical build before package
content verification and publication. The workflow must never commit generated files, rewrite the
release tag or treat runner-only files as source changes.

### PRD-03 — Durable Local Marketplace Staging

Before invoking Codex or Claude marketplace commands, `@agdf/cli` must atomically stage the complete
built plugin and its marketplace metadata under an AGDF-owned durable per-surface root. The root must
not depend on an ephemeral npm cache, current working directory or target repository.

Only marker- and manifest-proven AGDF-owned versions may be refreshed or retired. Failed staging or
host installation must preserve the last known valid version and provide actionable lifecycle
evidence.

### PRD-04 — Codex And Claude Migration

The global `codex` and `claude` targets must register/update the durable local marketplace, install
`agdf`, and verify the installed version. They must no longer depend on the GitHub repository as the
runtime-bearing global marketplace.

Migration from the existing `arndtgold/ai-native-governance-delivery-framework` registration must be
idempotent and ownership-safe. The installer must not remove or overwrite unrelated marketplaces,
plugins or configuration and must not claim success when the host still exposes the wrong version.

Repository-local `codex-repo` may continue to generate a complete local plugin from package assets;
OpenCode retains its existing exact config-local npm package architecture.

### PRD-05 — Release And Package Evidence

Deterministic tests must prove:

- source `plugin/runtime/` is absent;
- two clean package builds are byte-identical;
- `npm pack --dry-run` includes the complete runtime-bearing plugin;
- Codex and Claude staging uses durable paths and literal argument vectors;
- first install, update, legacy GitHub-marketplace migration, failure and rollback preserve ownership;
- installed doctor, gate-check and delivery-map execute offline with the published version; and
- source, package and installed Runtime Integrity classifications cannot be confused.

## 4. Compatibility And Migration

- Public commands remain `npx --yes @agdf/cli@latest codex` and `... claude`.
- Existing plugin IDs, marketplace display identity, skill names and exact gate semantics remain
  unchanged.
- Existing GitHub marketplace installations remain usable until the user explicitly reruns the AGDF
  installer; no background mutation is introduced.
- A failed migration retains the existing usable installation and reports degraded verification.
- Windows path and rename behavior must be covered through platform-neutral Node filesystem APIs and
  argument-vector host invocation.

## 5. Non-Functional Requirements

- one editable evaluator and runtime owner under `create-agdf`;
- reproducible package bytes and exact-version digest verification;
- no network access for routine validation after installation;
- no shell interpolation for filesystem or host commands;
- atomic, ownership-proven durable staging;
- bounded retained versions with explicit rollback behavior; and
- no source-controlled generated runtime payload.

## 6. Non-Goals

- A new npm runtime package.
- Automatic background plugin updates.
- Real publication, tags, commits or pushes during implementation.
- Changes to OpenCode activation or validator architecture.
- Changes to gate policy, approvals, interaction semantics or runtime command behavior.

## 7. Acceptance Criteria

- AC-01: Git source contains no `plugin/runtime`, while packed and installed plugins contain a valid
  exact-version runtime.
- AC-02: The publish workflow builds and verifies the package artifact before publication without
  mutating Git history.
- AC-03: Codex and Claude global install/update use durable local marketplaces and preserve unrelated
  host state.
- AC-04: Legacy GitHub marketplace migration is idempotent, ownership-safe and rollback-capable.
- AC-05: Full focused and aggregate tests pass, including offline installed validator execution and
  three-layout Runtime Integrity.

## 8. Risks

- Host marketplace semantics may vary across versions; mitigate with capability checks, fixtures and
  fail-closed lifecycle evidence.
- Durable staging can accumulate versions; define bounded retention and never delete an active or
  unowned path.
- A package can publish without the plugin if file-list assumptions drift; assert tarball contents in
  CI rather than relying only on `prepack` success.
- The prior run's QA evidence is partially superseded; re-run all local-validator packaging and
  installer evidence before either run can return to QA pass.

## 9. Next Step

Review this PRD. Approve only with:

`Approval: PRD`
