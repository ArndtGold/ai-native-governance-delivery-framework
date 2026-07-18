# CD+Tests: Release-Built Plugin Runtime Distribution

Status: done
Date: 2026-07-18
Based on: approved TP and passing pre-implementation Brownfield Analysis

## 1. Delivered By Task

| task_id | Status | Implementation evidence | Test evidence |
|---|---|---|---|
| RBP-01 | done | `.gitignore`; source-mode branches in `plugin/scripts/check-runtime-integrity.mjs`; source `plugin/runtime/` absent | RBP-T01; source integrity and negative source-runtime fixture pass |
| RBP-02 | done | explicit safe output root in `sync-plugin-runtime.js`; direct generated-runtime output and stale pruning in `sync-package-assets.js` | RBP-T02; package-build and local-validator tests pass |
| RBP-03 | done | source versus installed Runtime Integrity expectations; exact runtime version/digest/entrypoint checks | RBP-T01/RBP-T03; source and generated installed modes pass; negative suite passes |
| RBP-04 | done | complete generated plugin includes both host manifests, integrity script and runtime; tarball inventory test | RBP-T03/RBP-T04; 218-file dry-run package inventory contains every required path exactly once |
| RBP-05 | done | cross-platform data-root resolver, exact ownership marker and contained stable layout in `local-marketplace.js` | RBP-T05; platform, custom-root, unowned, invalid-marker and tamper fixtures pass |
| RBP-06 | done | marker-owned stage/backup/failed transaction, idempotent digest match, atomic rename, commit, rollback and interrupted recovery | RBP-T06; first stage, no-op, upgrade, interruption, rollback and recovery fixtures pass |
| RBP-07 | done | five-state JSON marketplace classifier with exact legacy normalization | RBP-T07; Codex and observed Claude JSON shapes, malformed, duplicate, foreign and legacy cases pass |
| RBP-08 | done | Codex local registration, exact legacy migration, plugin install/version verification and host/filesystem recovery | RBP-T08; absent, current, legacy failure/rollback, conflict and mismatch paths pass |
| RBP-09 | done | Claude user-scope local registration, update/install selection, version/degraded verification and recovery | RBP-T09; absent, current classification, conflict, version-visible and version-unavailable paths pass |
| RBP-10 | done | guardrail and publish workflows explicitly build, verify installed integrity and assert tarball contents before publish | RBP-T11; workflow-order smoke assertion and package tests pass |
| RBP-11 | done | installer lifecycle evidence plus `INSTALL.md` and `create-agdf/README.md` release-built/migration guidance | RBP-T12; lifecycle, CLI modularization and smoke copy assertions pass |
| RBP-12 | done | canonical sync refreshed generated assets; SOT Registry and `CG-CREATE-AGDF-CLI-COMPOSITION` reconciled | RBP-T13; selected-run doctor passes with no Context Graph finding |
| RBP-13 | done | complete focused/aggregate execution and durable evidence | RBP-T13; all verification below passes |

## 2. Test Evidence

| test_id | Result | Evidence |
|---|---|---|
| RBP-T01 | pass | Runtime Integrity source mode passes without runtime; source-runtime negative fixture fails as required. |
| RBP-T02 | pass | Two complete package builds are byte-identical; source digest and runtime absence remain unchanged; unsafe generator roots fail. |
| RBP-T03 | pass | Generated plugin installed mode passes exact manifest/digest/offline resolution; independent negative integrity cases pass. |
| RBP-T04 | pass | `npm pack --dry-run --json` reports 218 unique files and all seven critical plugin/runtime paths exactly once. |
| RBP-T05 | pass | Data-root, containment, ownership, foreign-root and tamper cases pass in temporary fixtures. |
| RBP-T06 | pass | Stage/no-op/update/rollback/interruption recovery and marker-proven cleanup cases pass. |
| RBP-T07 | pass | All five classifier states pass for Codex and Claude; a temporary isolated Claude config confirmed local entries use `source: directory` plus `path`. |
| RBP-T08 | pass | Codex command-order, current-local idempotency, exact legacy rollback, conflict and wrong-version cases pass. |
| RBP-T09 | pass | Claude user-scope add/update/install, current-local parsing, conflict and degraded-version cases pass. |
| RBP-T10 | pass | Staged runtime resolves with `registry_access: false`; installed `doctor`, `gate-check` and `delivery-map` return JSON with registry tooling removed from PATH. |
| RBP-T11 | pass | Workflow-order assertions prove source check/build/installed check/package inventory precede publish in validate and publish jobs; `contents: read` remains. |
| RBP-T12 | pass | CLI modularization, lifecycle and aggregate smoke tests preserve public commands, exact version evidence and restart-only success action. |
| RBP-T13 | pass | Full create-agdf smoke, 27/27 skill evals, `@agdf/cli` smoke, source/installed integrity and `git diff --check` pass. |

## 3. Commands Executed

- `npm --prefix create-agdf run smoke-test` — pass.
- `npm --prefix agdf run smoke-test` — pass.
- `npm --prefix create-agdf run test:local-marketplace` — pass.
- `npm --prefix create-agdf run test:package-build` — pass.
- `npm --prefix create-agdf run test:package-contents` — pass, 218 files.
- `node plugin/scripts/check-runtime-integrity.mjs` — pass, source mode.
- generated plugin `check-runtime-integrity.mjs` with explicit installed root — pass.
- deterministic skill evaluations — pass, 27/27 cases across nine skills.
- selected `gate-check --run automatic-version-asset-sync --json` — doctor pass, zero findings.
- `git diff --check` — pass.

## 4. Evidence Boundary

- No real Codex or Claude marketplace registration, plugin installation, restart or migration was
  performed. Host commands were executed only against injected fakes or an isolated temporary Claude
  config used to observe JSON shape.
- Repository tests prove package composition, safe command sequencing, rollback and offline runtime
  behavior. Authenticated host-visible installation and restart remain UAT evidence.
- No npm publication, tag, commit, push or pull request action was performed.
- Global `delivery-map --all-active` remains blocked by the pre-existing invalid
  `cli-interactive-wizard` run entry; selected-run doctor/gate evaluation for this scope passes.

## 5. Next Step

Run Task Plan Review, Clean Implementation Review and Code Review, then evaluate QA. No user action is
required during these internal quality steps.
