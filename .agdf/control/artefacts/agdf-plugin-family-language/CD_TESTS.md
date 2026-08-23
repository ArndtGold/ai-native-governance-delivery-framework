# Code Deliverables And Tests: AGDF Local Marketplace Family Label

Status: done
Run: `agdf-plugin-family-language`
Based on: approved TP
Date: 2026-08-23

## Revision 2 Repository Marketplace Delivery

- `create-agdf/lib/public-plugin/manifest.js`
  - adds the canonical Codex source-checkout Marketplace renderer;
  - consumes `publicDistribution.publicDisplayName` and preserves technical `name: agdf`.
- `create-agdf/scripts/sync-package-assets.js`
  - projects the renderer to `.agents/plugins/marketplace.json` through the existing source asset
    synchronization owner.
- `.agents/plugins/marketplace.json`
  - is the Codex-native repository Marketplace with visible `AGDF`, plugin source `./plugin` and
    unchanged technical identifiers.
- `create-agdf/scripts/public-plugin-test.js`
  - asserts byte equality with the canonical renderer and forbids Codex-only `interface` metadata in
    the Claude Marketplace.

Revision 2 evidence:

- focused public plugin, package build, package contents and local Marketplace tests: pass;
- Runtime Integrity: pass;
- `claude plugin validate --strict .claude-plugin/marketplace.json`: pass;
- fresh Codex app-server `plugin/list`: selects `.agents/plugins/marketplace.json`, Marketplace
  `displayName: AGDF`, repository plugin version `0.13.5`, unchanged core product display name and
  source `plugin/`;
- complete `npm --prefix create-agdf run smoke-test`: pass, including 66/66 deterministic skill evals;
- `git diff --check`: pass;
- `.claude-plugin/marketplace.json`: unchanged.

## Delivered

- `create-agdf/lib/installers/local-marketplace.js`
  - local Codex Marketplace `interface.displayName` now consumes the existing canonical
    `publicDistribution.publicDisplayName` value `AGDF`;
  - technical Marketplace/plugin IDs and the core plugin display name remain unchanged;
  - exact Codex Marketplace shape classification distinguishes `current`,
    `legacy_full_product_label` and `invalid`;
  - the existing ownership marker records Codex registration revision 1 so previously projected
    metadata is refreshed exactly once and later runs remain idempotent;
  - only the Codex installer requests that revision; shared non-Codex preparation preserves it.
  - the existing atomic transaction upgrades the exact legacy shape and remains idempotent after
    migration;
  - invalid, foreign or tampered shapes still fail closed.
- `create-agdf/scripts/local-marketplace-test.js`
  - asserts all four identity layers;
  - proves current idempotence, exact legacy migration, one-time registration-revision migration
    and cross-surface revision preservation;
  - proves a foreign display label remains rejected;
  - proves changed current Codex registrations are refreshed while unchanged registrations are not;
  - proves remove, add and plugin-operation failures restore the prior filesystem and registration state.
- `create-agdf/lib/installers/plugin-installers.js`
  - refreshes the existing owned Codex Marketplace registration only when the local projection changed;
  - reuses the existing migration and recovery transaction instead of introducing another updater;
  - restores the previous filesystem projection before re-registering it after refresh failures;
  - leaves Claude behavior and technical IDs unchanged;
  - invokes Codex with the workflow-standard exact selector `agdf@agdf --json`, which replaced the
    stale base cache in direct native evidence.
- Existing Codex command fixtures in `local-marketplace-test.js`,
  `local-development-install-test.js`, `cli-modularization-test.js`,
  `release-bootstrap-smoke-test.js` and `smoke-test.js` bind the exact selector.

## Task Evidence

| task_id | Result | Evidence |
|---|---|---|
| AFL-T1 | done | Pre-implementation Brownfield Analysis passes; candidate source paths were clean |
| AFL-T2 | done | Canonical `AGDF` mapping implemented without technical, Claude, core-plugin or public-contract delta |
| AFL-T3 | done | Exact current/legacy/invalid classifier reuses the existing transaction and rollback owner |
| AFL-T4 | done | Focused identity, migration, idempotence and tamper assertions added |
| AFL-T5 | done | Focused Marketplace, Runtime Integrity, public plugin, local development install and whitespace checks pass |
| AFL-T6 | done | TP Review, Clean Review and Code Review refreshed after AFL-TPR-03; QA remains revise only for installed/direct-host evidence |
| AFL-T7 | done | Corrected repository-owned reinstall dispatches `agdf@agdf --json`; native inventory and the sole cache directory both use `0.13.5+codex.local-619acdcbd1f9` |
| AFL-T8 | partial | Fresh restart evidence confirms the prior install reverted to base cache `0.13.5` and retained the lowercase heading; new-task evidence after the exact-selector reinstall is required |

## Validation

| Command | Result |
|---|---|
| `npm --prefix create-agdf run test:local-marketplace` | pass |
| `npm --prefix create-agdf run test:cli-modularization` | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; source mode, 10 skills and 16 control files |
| `npm --prefix create-agdf run test:public-plugin` | pass; 43 candidate files, unchanged digest `5e93c979972386a5b255c67bcbc491e13a21b7a6a046c292bd0fd4cfd60a72e0` |
| `npm --prefix create-agdf run test:local-development-install` | pass; release preparation, 29 version surfaces, public candidate and fixture-only cachebuster/install flow |
| `node create-agdf/scripts/smoke-test.js` | pass |
| `git diff --check` | pass |
| `npm --prefix create-agdf run install:codex` | pass; healthy local installation `0.13.5+codex.local-619acdcbd1f9`, registration revision 1, restart required |
| `codex plugin marketplace list --json` | pass; `agdf` registered to the owned local Marketplace root after the one-time refresh |
| `codex plugin list --json` | pass; `agdf@agdf` enabled from the owned local source at the verified cachebuster version |
| Installed Marketplace and ownership manifest inspection | pass; Marketplace `displayName: AGDF`, technical names `agdf`, ready marker and registration revision 1 |
| Active Codex cache inspection after exact-selector reinstall | pass; only `0.13.5+codex.local-619acdcbd1f9` exists; stale base cache `0.13.5` is absent |
| Fresh Plugins screen from a newly created task | pending |

## Changed Path Boundary

Implementation paths are exactly:

- `create-agdf/lib/installers/local-marketplace.js`
- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/scripts/local-marketplace-test.js`
- `create-agdf/scripts/local-development-install-test.js`
- `create-agdf/scripts/cli-modularization-test.js`
- `create-agdf/scripts/release-bootstrap-smoke-test.js`
- `create-agdf/scripts/smoke-test.js`

All other changed paths belong to this run's durable AGDF control state. AGDF Project Inventory,
canonical plugin metadata, public plugin test owners and installed Marketplace paths are unchanged.

## Evidence Boundary

Repository implementation and fixture-only installer tests pass. The prior post-restart observation
disproves the earlier persistence claim: Codex loaded base cache `0.13.5`. A direct exact-selector
reinstall now leaves only the cachebuster directory, but a new task remains a separate evidence
obligation. No release, publication or VCS action was performed.
