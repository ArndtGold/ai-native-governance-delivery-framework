# CD+Tests: Cross-Host Plugin Runtime Integrity

Status: done; revision 3
Based on: approved TP revision 3
Date: 2026-08-26
Owner: agent

## 1. Result

The bounded implementation is complete within the approved TP revision 2 path set. Both
runtime-free source-root marketplaces are removed. The generated runtime-complete `agdf-repo`
projection remains supported and is accepted only after content, profile, version and runtime digest
validation. Runtime-bearing installations receive one canonical provenance marker and the existing
local validator now separates generated-bundle, staged-installation, installed-root and loaded-session
evidence without registry fallback.

After explicit user authority, the supported local-development installers updated Codex, Claude Code
and OpenCode. Final isolated fresh sessions were observed for all three hosts. No cache was edited
directly, and no publication, deployment or VCS delivery action was performed.

## 2. Task Evidence

| task_id | status | implementation and evidence |
|---|---|---|
| CRI-01 | done | Baseline and approved path boundary preserved. Protected `docs/presentation/agdf_cto_praesentation.key` remains at SHA-256 `377d5af865f37632f888ecda76da4d3eb11acf38805976a6e9b4ab455dce047f`. |
| CRI-02 | done | Deleted `.agents/plugins/marketplace.json` and `.claude-plugin/marketplace.json`; removed the source renderer; added schema-versioned distribution profiles; public and Runtime Integrity tests assert source non-installability while generated repository composition remains complete. |
| CRI-03 | done | Added `create-agdf/lib/runtime/plugin-provenance.js` as the shared pure owner for profile validation, normalized source digest, runtime digest, installed provenance and generated-repository inspection. Existing installer and resolver digest logic now delegates to it. |
| CRI-04 | done | `local-marketplace.js` writes `.agdf-installation.json` for canonical and cachebuster stages, validates before promotion, includes it in the outer digest, preserves rollback and accepts only exact digest-matched legacy marker evidence during explicit reinstall. Real old-definition migration passes; missing, arbitrary and tampered provenance fail. |
| CRI-05 | done | `local-validator.js` exposes additive profile, plane, version, digest, root and provenance fields. Missing provenance, invalid provenance, source/runtime digest mismatch, invalid profile, root mismatch and runtime absence fail independently. Markerless execution is accepted only inside a validated generated `agdf-repo` bundle. |
| CRI-06 | done | The existing SessionStart hook renders one compact runtime line. Fixtures cover installed healthy state, canonical path aliases, Claude root mismatch, malformed output, missing runtime and runtime-free source state without recovery mutation. |
| CRI-07 | done | Installer evidence now names staged provenance without claiming a host-loaded root. Lifecycle and status accept `agdf@agdf-repo` only for a validated complete generated repository or deliberate legacy recovery; malformed source-like marketplaces are degraded. |
| CRI-08 | done | Runtime payload includes the shared helper exactly once. Runtime Integrity validates profile coherence, source marketplace absence, generated/installed runtime behavior and provenance tamper. Portable and OpenCode regressions pass. |
| CRI-09 | done | Temporary filesystem fixtures isolate source shadowing, missing provenance, wrong Claude root, malformed probe output, marker tamper and runtime/source digest corruption. Separately authorized direct probes verify the final Codex cache root, effective Claude loaded root and OpenCode config-local runtime. |
| CRI-10 | done | `CONTRIBUTING.md`, `INSTALL.md` and `create-agdf/README.md` distinguish canonical runtime-free source, complete generated plugin, durable marketplace staging, restart and fresh-session proof. |
| CRI-11 | done | Canonical generation is reproducible; package build and contents tests pass; two final complete smoke suites pass after host-driven corrections; Codex prompt limits are regression-tested; `git diff --check` passes; the unrelated Keynote baseline is preserved. |
| CRI-12 | done | This evidence record separates repository/package, installed-root and fresh-host observations and makes no UAT claim. |

## 3. Verification Evidence

- `npm --prefix create-agdf run smoke-test`: pass, including release preparation, CLI modularization,
  validator, marketplace, local development install, package build and contents, lifecycle, control
  state, interaction presentation, Runtime Integrity, Agent Skills conformance, 66/66 skill evals,
  proportionality, delivery path search, OpenCode hardening and routing render.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass in source mode.
- `node create-agdf/generated/plugins/agdf/runtime/agdf-local.js --resolve-only --json`: pass with
  `owned_version_matched`, `generated_bundle`, version `0.13.5`, runtime digest match and no registry
  access.
- `npm --prefix create-agdf run test:local-development-install`: pass with isolated
  `npm_config_cache=/private/tmp/agdf-npm-cache` because the user npm cache is not writable.
- `git diff --check`: pass.
- `npm --prefix create-agdf audit`: not applicable. The package has no dependencies and intentionally
  has no lockfile; npm returns `ENOLOCK`. No lockfile was created outside the approved design.
- `npm run install:codex`: pass; final installed version
  `0.13.5+codex.local-2532e2f19e67`; final isolated `codex exec --ephemeral --sandbox read-only`
  reports `SessionStart Completed` and returns the expected fixed response. The installed cache probe
  reports `owned_version_matched`, `loaded_session`, matched provenance and registry access false.
- `npm run install:claude`: host operation pass; `claude plugin list --json` reports enabled 0.13.5.
  A final fresh `claude --print` emits a successful AGDF `SessionStart` hook response and
  `init.plugins` names the final durable marketplace root. The later model response stops only because
  this separate CLI is not logged in.
- `npm run install:opencode`: pass; 0.13.5 package, 1.18.3 matching SDK, complete 10/10 skills and
  7/7 contract modules. A final `opencode run` fresh session returns the expected fixed response.
- Portable public candidate: no `runtime/agdf-local.js`, no runtime manifest and no installation
  provenance marker; deterministic public/package tests pass.

## 4. Evidence Plane Boundary

- repository and generated-bundle fixtures: passed;
- package composition and deterministic generation: passed;
- staged durable-marketplace provenance: passed in temporary roots and real owned migration;
- real Codex installed cache and fresh loaded task: passed;
- real Claude Code enabled plugin, fresh `SessionStart` and effective loaded root: passed; authenticated
  model response not applicable to runtime loading and unavailable until Claude login;
- real OpenCode 0.13.5 config-local installation and fresh session: passed;
- portable Skills-only runtime absence: passed;
- human UAT: not started.

Direct host observations are recorded independently and are not inferred from repository, package,
installer or temporary-root evidence.

## 5. Next Step

Consume the refreshed Task Plan Review, Clean Implementation Review and Code Review in QA Gate.

## 6. Revision 3 Reliability Delta

| task_id | status | implementation and evidence |
|---|---|---|
| CRI-13 | done | The implementation baseline contained only this run's control artefacts. The delta changed the approved existing installer owners and their directly corresponding test only; no unrelated user path was modified. |
| CRI-14 | done | `local-marketplace.js` now separates `current_or_marker_migration`, `owned_pre_provenance_rebuild` and `invalid_or_unowned`. Rebuild eligibility requires the exact outer owner, ready state, version and plugin digest, both owned marketplace manifests, coherent plugin and runtime versions, complete runtime payload, absent `distributionProfiles` and absence of both provenance markers. Current marker absence, malformed marker, tamper and incomplete historical roots remain blocking. |
| CRI-15 | done | Eligible recovery reuses the existing stage, backup, failed-root, commit and rollback transaction. The fixture adds a historical-only file and proves it never enters the new canonical stage; rollback restores the exact old-root digest; commit removes the backup only after simulated host success. Installer evidence names the rebuild and `restart_required` without a loaded-session match claim. |
| CRI-16 | repository_done; native_host_pending | Injected darwin and linux paths now use `path.posix`; injected win32 paths use `path.win32`, including data-root overrides and marketplace roots. The complete local-marketplace suite passes on macOS with all Windows semantics and retry assertions present. Direct native-Windows execution CRI-H05 remains required. |
| CRI-17 | repository_done; native_host_pending | Focused validator, marketplace, local-development install, lifecycle, Runtime Integrity, portable, OpenCode, package build and package contents tests pass. Canonical release preparation, independent source Runtime Integrity and the complete smoke suite pass. Native-Windows execution remains separately open. |
| CRI-18 | in_progress | CD+Tests and Context Graph are refreshed. Task Plan Review, Clean Implementation Review, Code Review and QA follow in the mandated order. |

### Revision 3 verification

- `npm --prefix create-agdf run test:local-marketplace`: pass, including positive rebuild,
  markerless-current rejection, malformed-current rejection, digest tamper, incomplete historical
  root, canonical-only stage, exact rollback, commit and evidence-plane assertions.
- `npm --prefix create-agdf run test:local-validator`: pass.
- `NPM_CONFIG_CACHE=/private/tmp/agdf-npm-cache npm --prefix create-agdf run test:local-development-install`: pass.
- `npm --prefix create-agdf run test:lifecycle`: pass.
- `npm --prefix create-agdf run test:runtime-integrity-layout`: pass.
- `npm --prefix create-agdf run test:runtime-integrity-negative`: pass.
- `npm --prefix create-agdf run test:public-plugin`: pass.
- `npm --prefix create-agdf run test:opencode-hardening`: pass.
- `NPM_CONFIG_CACHE=/private/tmp/agdf-npm-cache npm --prefix create-agdf run test:package-build`: pass.
- `NPM_CONFIG_CACHE=/private/tmp/agdf-npm-cache npm --prefix create-agdf run test:package-contents`: pass.
- `NPM_CONFIG_CACHE=/private/tmp/agdf-npm-cache npm --prefix create-agdf run release:prepare`: pass.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass in source mode.
- `NPM_CONFIG_CACHE=/private/tmp/agdf-npm-cache npm --prefix create-agdf run smoke-test`: pass,
  including 66/66 deterministic skill evaluations and routing render.
- generated `agdf-local.js --resolve-only --json`: pass with 0.13.6 `owned_version_matched`,
  `generated_bundle`, matching runtime digest and no registry access.
- `AGDF_EXPECTED_VERSION=0.13.6 node create-agdf/scripts/release-bootstrap-smoke-test.js`:
  pass against the public npm registry. The script executed exact `@agdf/cli@0.13.6`; the workflow
  retains a separate bounded check that the `latest` dist-tag resolves to 0.13.6.
- `node create-agdf/scripts/smoke-test.js`: pass with a permanent assertion that the public
  bootstrap uses the exact expected release and does not resolve `@latest` a second time.
- selected-run generated validator `doctor --json`: pass with zero findings.
- `npm --prefix create-agdf audit --audit-level=high`: not applicable because the package has no
  lockfile; npm returns `ENOLOCK`. No lockfile was created.

Direct native-Windows CRI-H05 is not available from this macOS workspace and is not inferred from
target-platform fixtures. Consequently the later QA decision must remain `revise` until that evidence
is supplied. No real plugin installation, cache edit, fresh-host claim, UAT, release or VCS delivery
action was performed for revision 3.
