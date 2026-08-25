# CD+Tests: Cross-Host Plugin Runtime Integrity

Status: done  
Based on: approved TP revision 2  
Date: 2026-08-25  
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
