# TP: Simple Local Plugin Installation Scripts

Status: approved
Gate: TP
Gate approval: approved
Based on: `.agdf/control/artefacts/agdf-local-plugin-install-scripts/SD.md`
Date: 2026-08-23
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| LPI-T01 | Capture the implementation baseline and assert that every candidate source, test and documentation path is clean or explicitly isolated from unrelated user work. | LPI-2, LPI-8 | `git status --short` path snapshot; candidate-path list; no overwrite of unrelated `.agdf` or user changes. |
| LPI-T02 | Add one local-development identity module that computes a deterministic prepared-content digest, validates the Codex suffix grammar and resolves only ownership-bounded local package paths. | LPI-2, LPI-5, LPI-6, LPI-7, LPI-10 | Unit matrix for same/different content, malformed suffixes, unsafe paths, missing/invalid markers and platform path variants. |
| LPI-T03 | Extend `prepareLocalMarketplace` with an optional Codex install projection, ownership-marker evidence and exact revalidation of base version, install version and plugin digest. | LPI-3, LPI-4, LPI-6, LPI-7, LPI-8 | Marketplace fixtures for initial install, same-content no-change, changed-content update, Claude-after-Codex preservation, legacy migration, tamper, interruption and rollback. |
| LPI-T04 | Update Codex installation and status verification to distinguish canonical AGDF version from the validated local cache version while preserving exact public-install behavior. | LPI-3, LPI-6, LPI-9 | Fake Codex list/install fixtures for base version, valid local suffix, stale digest, arbitrary suffix, missing version and mismatch recovery text. |
| LPI-T05 | Preserve Claude Code installation behavior against the shared projected marketplace without applying Codex cache semantics to Claude verification. | LPI-4, LPI-6, LPI-9 | Existing and focused Claude install/update/degraded-version fixtures pass with a projected Codex manifest present. |
| LPI-T06 | Add an ownership-marked durable local-package builder for the prepared `create-agdf` package, using deterministic packed-content evidence and registry-free packing. | LPI-2, LPI-5, LPI-6, LPI-7, LPI-8, LPI-10 | Isolated package fixtures for first build, identical reuse, changed digest, invalid marker, unsafe cleanup target and pack failure before host mutation. |
| LPI-T07 | Add an internal OpenCode package-specifier adapter that defaults to the current registry specifier for public CLI use and accepts only validated local package evidence from the developer orchestrator. | LPI-5, LPI-6, LPI-7, LPI-8, LPI-9 | OpenCode fixtures prove local file specifier use, exact content/version resolution, default registry compatibility, ownership rejection, SDK alignment and failure presentation. |
| LPI-T08 | Implement one development-only Node orchestrator that validates the surface, executes canonical `release:prepare` before mutation, derives local identities and invokes the existing lifecycle application. | LPI-1, LPI-2, LPI-3, LPI-4, LPI-5, LPI-8, LPI-10 | Ordered call recorder for all surfaces; preparation failure yields zero host calls; invalid surface exits before preparation; lifecycle exit code is preserved. |
| LPI-T09 | Add exactly three `create-agdf` npm scripts and three thin root aliases for Codex, Claude Code and OpenCode. | LPI-1, LPI-10 | Manifest assertions for exact names, shared orchestrator and prefix delegation; no status/uninstall/all aliases. |
| LPI-T10 | Restrict installed-mode Runtime Integrity to the one declared Codex local suffix projection while retaining exact version equality for source, generated and public candidates. | LPI-2, LPI-3, LPI-7, LPI-9 | Positive owned-local fixture plus negative arbitrary suffix, wrong base, wrong digest, missing marker and source-mode suffix cases. |
| LPI-T11 | Add one focused aggregate test command for the local-development installation slice and include it in the relevant complete smoke path. | LPI-1 through LPI-10 | New test command passes independently; smoke ordering proves it runs after preparation-compatible unit suites without real host mutation. |
| LPI-T12 | Document the three source-checkout commands for contributors, their prerequisites, public-bootstrap distinction, restart requirement, Codex new-task pickup and evidence limitations. | LPI-9, LPI-11 | Documentation assertions and link checks; no claim of release, host load, repository activation or UAT. |
| LPI-T13 | Synchronize generated package assets only through the canonical pipeline and verify that canonical release manifests retain the base version. | LPI-2, LPI-9 | Repeated sync is idempotent; release coherence, Runtime Integrity, package build/content and public candidate tests pass. |
| LPI-T14 | Run Task Plan Review, Clean Implementation Review and mandatory Code Review; resolve all blocking or revise findings before QA. | LPI-1 through LPI-11 | Durable review reports with task coverage, solution integrity, normalized findings and exact changed-path evidence. |
| LPI-T15 | Run full QA evidence without invoking real user installations, then prepare explicit fresh-host UAT instructions for each surface. | LPI-3, LPI-4, LPI-5, LPI-6, LPI-8, LPI-9, LPI-11 | QA report separates repository/package evidence from installed-cache and restarted-host evidence; UAT instructions require a new Codex task after install. |

## 2. Test Plan

### Focused automated tests

- Add `npm --prefix create-agdf run test:local-development-install` as the isolated aggregate for identity, orchestration, local package and manifest contracts.
- Extend `test:local-marketplace` for optional cache projection, marker compatibility, same-content idempotence, shared Claude preservation, tamper detection and rollback.
- Extend `test:lifecycle` and `test:cli-modularization` for canonical versus Codex install version, public default compatibility and OpenCode internal adapter behavior.
- Extend Runtime Integrity positive and negative suites for the installed-local projection boundary.
- Use only temporary AGDF data/config roots, injected host command recorders and a test npm executable. Tests must not call real `codex`, `claude`, `opencode`, the npm registry or user configuration.

### Required regression commands

```text
npm --prefix create-agdf run test:local-development-install
npm --prefix create-agdf run test:local-marketplace
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run release:prepare
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run smoke-test
```

### Package, security and control evidence

```text
npm --prefix create-agdf pack --dry-run --json
npm --prefix create-agdf audit --audit-level=high
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js doctor --run agdf-local-plugin-install-scripts --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js delivery-map --run agdf-local-plugin-install-scripts --json
git diff --check
```

### Manual inspection before QA

- Confirm the root and `create-agdf` manifests expose only the approved aliases.
- Confirm no canonical source or generated manifest contains a local cachebuster after tests.
- Confirm no real user marketplace, host configuration or package directory changed during automated verification.
- Inspect packed local-package fixtures for exact checkout provenance and stable ownership metadata.
- Inspect lifecycle output for canonical version, local install evidence, restart requirement and no host-load/UAT overclaim.

### UAT preparation, not implementation evidence

- Codex: run the real command only in explicit UAT, inspect the installed/cache version, restart Codex, start a new task and verify one updated AGDF skill/runtime behavior.
- Claude Code: run the real command only in explicit UAT, inspect plugin list evidence, restart and verify loaded behavior without inventing version evidence the host omits.
- OpenCode: run the real command only in explicit UAT, inspect the saved local package provenance and `opencode-status`, restart and verify discovery/behavior separately.
- A successful repository test or install command alone must not be recorded as human UAT acceptance.

## 3. Brownfield Scope

Implementation-preparation Brownfield Analysis must revalidate these owners and invariants after TP approval:

- Root `package.json` as the only contributor-alias owner.
- `create-agdf/package.json` and one development script as the only orchestration entry.
- `create-agdf/lib/installers/local-marketplace.js` as the only Codex/Claude marketplace writer and transaction owner.
- `create-agdf/lib/installers/plugin-installers.js` as the only Codex/Claude host lifecycle owner.
- `create-agdf/lib/installers/opencode.js` as the only OpenCode install/config/SDK owner.
- `create-agdf/lib/cli/application.js` and lifecycle presentation as the existing result owner.
- Canonical release preparation, version coherence, Runtime Integrity and package tests as build truth.
- Existing user-owned dirty state, including unrelated `.agdf` changes, must remain isolated.

Brownfield Analysis must block implementation if the planned cache projection requires canonical version mutation, if OpenCode cannot retain a durable owned local dependency path, or if a second marketplace/lifecycle/status owner would be necessary.

## 4. Out Of Scope

- Real installation into Codex, Claude Code or OpenCode during CD+Tests without a later explicit UAT action.
- Public npm publication, plugin release, push, pull request, deployment or host restart.
- Status, uninstall, repository-local, combined or automatic all-surface npm aliases.
- Cache garbage collection or deletion of historical Codex cache directories.
- Public CLI argument or output-schema redesign.
- Marketplace hand editing, host configuration replacement or any fallback to published packages.
- AGDF gate, approval, activation or governance-semantic changes.

## 5. Risks And Blockers

| risk_id | condition | QA effect | required handling |
|---|---|---|---|
| LPI-R01 | A host mutation can occur before canonical preparation passes. | block | Enforce and test strict ordering with zero-call failure fixtures. |
| LPI-R02 | The Codex suffix is accepted outside an owned installed-local projection or does not bind to the prepared digest. | block | Restrict grammar, base version, marker and digest; negative matrix must pass. |
| LPI-R03 | Canonical source, generated or public versions acquire local cache metadata. | block | Exact release-coherence and Runtime Integrity checks must remain green. |
| LPI-R04 | Claude installation rewrites or invalidates the current Codex local marketplace projection. | revise | Same-content shared projection and Claude-after-Codex fixture must pass. |
| LPI-R05 | OpenCode resolves the registry package or stores an ephemeral/deleted local path. | block | Durable marker-proven digest path and installed provenance are mandatory. |
| LPI-R06 | Tests mutate actual user configuration, invoke real hosts or depend on network/registry state. | block | Temporary roots and injected executables only; verify no external paths changed. |
| LPI-R07 | Lifecycle output implies restarted-host activation or UAT. | revise | Preserve explicit restart and evidence-boundary assertions. |
| LPI-R08 | Same prepared content creates a different Codex install key or local package path. | revise | Digest-derived identity and repeated-run fixtures must pass. |
| LPI-R09 | Existing public `npx` install behavior changes unintentionally. | block | Existing CLI, lifecycle, package and smoke suites must pass unchanged. |
| LPI-R10 | Implementation touches unapproved or unrelated dirty paths. | block | Compare exact changed paths to the approved TP and baseline before reviews and QA. |

## 6. Next Step

Perform implementation-preparation Brownfield Analysis. Begin CD+Tests only if it passes.
