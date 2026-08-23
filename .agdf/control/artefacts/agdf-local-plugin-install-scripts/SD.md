# SD: Simple Local Plugin Installation Scripts

Status: approved
Gate: SD
Gate approval: approved
Based on: `.agdf/control/artefacts/agdf-local-plugin-install-scripts/PRD.md`
Date: 2026-08-23
Owner: Arndt Gold

## 1. Solution Overview

Add three thin root npm aliases that delegate to one development-only installer orchestrator under `create-agdf/scripts/`. The orchestrator validates the selected surface, runs canonical source preparation, derives a deterministic local-install identity from the prepared content, and invokes the existing lifecycle application with narrowly scoped internal adapters.

Codex and Claude Code continue to use the single owned local marketplace and their existing host command sequences. Codex receives an install-only cachebuster projection so changed same-semver source is loaded under a new cache key. Claude Code retains its canonical manifest version and current healthy/degraded verification semantics. OpenCode receives a durable, ownership-marked local tarball built from the current checkout instead of a registry package specifier, then continues through its existing configuration, SDK-alignment, native-surface and status owners.

No new public CLI command or marketplace format is introduced.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design use |
|---|---|---|
| Contributor command names | root `package.json` | Expose only `install:codex`, `install:claude` and `install:opencode`. |
| Development orchestration | new `create-agdf/scripts/install-local-plugin.js` | Validate surface, prepare current source, derive local identity, call existing lifecycle application and clean only owned temporary state. |
| Source-to-generated preparation | existing `create-agdf` `release:prepare` pipeline | Must complete before any host mutation. |
| Plugin identity and canonical product version | `plugin/meta/agdf-plugin.definition.json` and generated definition | Remain `0.13.5` or the repository's future canonical release version; local cache identity never becomes the product version SoT. |
| Codex and Claude marketplace | `create-agdf/lib/installers/local-marketplace.js` | Extend its transaction with an optional validated Codex install projection; retain one marketplace, ownership marker, atomic swap and rollback. |
| Codex and Claude host lifecycle | `create-agdf/lib/installers/plugin-installers.js` | Reuse command classification, migration, install/update, version verification and recovery. |
| OpenCode lifecycle | `create-agdf/lib/installers/opencode.js` | Accept one internal package-specifier adapter while preserving public registry behavior by default. |
| Lifecycle output | `create-agdf/lib/lifecycle/` and CLI application | Continue to present operation, verification, restart and next action. |
| Runtime/package integrity | existing Runtime Integrity, release coherence and package tests | Preserve exact base-version checks in canonical source/build mode and validate the one permitted installed Codex projection explicitly. |
| Public installation | `INSTALL.md`, `agdf/README.md` and current CLI help | Remain unchanged in behavior; documentation adds only a clearly separated contributor subsection. |

## 3. Architecture Decisions

### AD-1: Thin root aliases

Root scripts delegate with cross-platform npm prefix invocation:

- `install:codex` -> `npm --prefix create-agdf run install:codex`
- `install:claude` -> `npm --prefix create-agdf run install:claude`
- `install:opencode` -> `npm --prefix create-agdf run install:opencode`

The corresponding `create-agdf` scripts invoke one Node orchestrator with a surface argument. No shell-specific command chain or duplicated per-surface script body is allowed.

### AD-2: Preparation before mutation

The orchestrator executes the canonical `release:prepare` command through `execFileSync` using the platform-correct npm executable. A non-zero preparation result exits before marketplace, host configuration or package installation begins. Tests inject the command runner and assert ordering without touching real hosts.

### AD-3: Deterministic Codex cachebuster projection

The prepared canonical plugin remains version-coherent at the base AGDF version. The local marketplace transaction may project only its staged `.codex-plugin/plugin.json` version as:

`<base-version>+codex.local-<12-character prepared-content digest>`

This follows the Plugin Creator cachebuster boundary while using a content digest instead of a clock token. The digest makes unchanged reruns idempotent and ties the installed cache key to exact prepared content. The projection is allowed only inside an ownership-marked local development marketplace. Source files, generated canonical assets, Claude manifest, runtime manifest and public candidates retain the base version.

`prepareLocalMarketplace` returns both `version` (canonical base) and `codexInstallVersion`. `installCodexGlobalPlugin` verifies `codex plugin list` against `codexInstallVersion`; public CLI calls that do not supply a local projection retain exact base-version behavior. Existing marketplace validation accepts the suffix only when the ownership marker records the same base version, projected Codex version and plugin digest. Any other version skew fails closed.

Installed-mode Runtime Integrity explicitly permits this one manifest-only projection after validating its base version, suffix grammar, ownership context, runtime base version and payload digest. Source, generated and public-candidate modes continue to require exact manifest/definition equality.

### AD-4: One shared marketplace, distinct host transports

All three local scripts derive the same digest-based Codex install version for the prepared content. Therefore running the Claude command after Codex does not silently replace the shared marketplace with a different Codex cache identity. Claude continues to consume `.claude-plugin/plugin.json` at the canonical base version and does not inherit Codex cache semantics.

No second Codex-only or Claude-only marketplace is created.

### AD-5: Durable checkout-local OpenCode package

After canonical preparation, the orchestrator packs `create-agdf` with lifecycle scripts disabled into an ownership-marked local package directory under the existing AGDF data root:

`<agdf-data-root>/packages/local/<package-digest>/create-agdf-<base-version>.tgz`

The directory and metadata record owner, canonical version and SHA-256 digest. Existing owned identical content is reused. Cleanup may remove only obsolete marker-proven AGDF local-package directories and is not required for first-slice correctness.

The development orchestrator calls the existing CLI application with an internal `openCodePackageSpecifier` adapter pointing to that durable file. `installOpenCodeGlobalPlugin` defaults to the current registry specifier when the adapter is absent, so public CLI behavior is unchanged. When present, it installs the local tarball with the existing npm/config ownership checks and returns local-package path and digest evidence. The durable path remains valid for the saved dependency and later npm operations.

### AD-6: Evidence and activation remain separate

A successful script proves canonical preparation plus the existing installation verification for that surface. It reports restart required. It does not claim the restarted host loaded the plugin, that a new task discovered new skills, that repository governance is active, or that UAT passed.

Codex local install output may show the projected install version while also retaining the canonical AGDF version in evidence. General status treats the exact validated local suffix as healthy local-development evidence, not as release-version drift. Unknown suffixes remain degraded.

### AD-7: No automatic registry or transport fallback

The development commands never substitute `@agdf/cli@latest` or a published `create-agdf` package when checkout preparation or local packaging fails. The failure names its phase and the contributor reruns the same command after correction.

## 4. Integration Points

| Integration point | Change |
|---|---|
| root `package.json` | Add three contributor aliases only. |
| `create-agdf/package.json` | Add three development scripts invoking one orchestrator. |
| `create-agdf/scripts/install-local-plugin.js` | New development-only orchestration owner. |
| `create-agdf/lib/installers/local-marketplace.js` | Optional validated Codex install projection and marker evidence; public default unchanged. |
| `create-agdf/lib/installers/plugin-installers.js` | Verify Codex against transaction install version and expose canonical/install evidence. |
| `create-agdf/lib/installers/opencode.js` | Accept an internal local package specifier and return its provenance without changing the default registry specifier. |
| `create-agdf/lib/cli/application.js` | Forward the internal OpenCode adapter; keep public argument grammar unchanged. |
| Runtime Integrity | Add installed-local cachebuster validation while retaining exact source/build/public checks. |
| lifecycle, marketplace, package and smoke tests | Add isolated fixtures for aliases, ordering, cachebuster, same-content rerun, conflicts, rollback and local OpenCode package provenance. |
| `CONTRIBUTING.md` and installation reference | Add concise source-checkout commands and distinguish them from public bootstrap and restarted-host UAT. |

## 5. Constraints And Compatibility

- Canonical release versions and every existing release-coherence surface remain unchanged.
- The Codex cachebuster is SemVer build metadata and preserves the complete prefix before `+`.
- The local suffix is never written back into canonical source manifests or public candidates.
- Marketplace configuration is generated through the existing transaction; no hand editing of marketplace or Codex config files.
- Existing legacy marketplace migration, ownership conflict detection, atomic replacement and rollback remain binding.
- Existing Claude degraded verification when the host omits version information remains valid and visible.
- Public `npx` Codex, Claude Code and OpenCode installs retain registry/default behavior.
- OpenCode explicit user permissions, unowned configuration and SDK alignment rules remain unchanged.
- The orchestrator and tests must work on macOS, Linux and native Windows without Bash-only path or command assumptions.
- Tests never install into real user host directories and never require network or registry access.

## 6. Test And Evidence Strategy

| Evidence group | Required proof |
|---|---|
| Script contract | Root and package manifests expose exactly the three approved aliases and one shared orchestrator. |
| Ordering | A failed preparation fixture records zero marketplace, host or OpenCode mutations. |
| Codex projection | Base version remains canonical; valid digest suffix installs and verifies; malformed, stale or unowned suffix fails; unchanged content yields the same install version. |
| Marketplace integrity | Initial install, same-content rerun, changed-content update, legacy migration, interruption recovery, tamper detection and Claude-after-Codex preservation pass. |
| Claude parity | Existing install/update/degraded-version fixtures pass unchanged with the local marketplace projection present. |
| OpenCode provenance | Local tarball is built without registry resolution, stored under marker-proven digest ownership, installed through the existing lifecycle and reported as current checkout evidence. |
| Public compatibility | Existing CLI parsing/help, public install, release coherence, package contents and public candidate tests pass unchanged. |
| Runtime Integrity | Source/generated exact version checks pass; installed-local cachebuster acceptance is restricted to the declared grammar and evidence. |
| Documentation | Contributor commands, public bootstrap, restart requirement, new-task pickup and UAT boundary are asserted. |
| Full verification | Focused tests, `release:prepare`, relevant complete smoke suite, `doctor`, `delivery-map`, package dry run, audit and `git diff --check`. |

Authenticated host observations are UAT evidence only. If installation is exercised during UAT, Codex must start a new task before discovery is judged.

## 7. Risks And Open Questions

- The current installed-mode Runtime Integrity invocation must expose enough path/marker context to validate the cachebuster without allowing arbitrary version skew. TP must include a negative matrix proving the restriction.
- Codex may retain historical cache directories. This slice owns the active installed version and evidence, not destructive cache garbage collection.
- OpenCode's saved file dependency is intentionally development-local. Public reinstall must replace it through the existing registry-default command; documentation must state this clearly.
- Native Windows npm executable resolution must reuse or centralize the existing platform-aware pattern rather than copy it inconsistently.
- The exact package-digest algorithm must include every packed file deterministically and must not include unstable tar metadata as its input identity.
- No blocking product or architecture question remains for Task/Test Plan drafting.

## 8. Next Step

Draft the executable Task/Test Plan while implementation remains forbidden.
