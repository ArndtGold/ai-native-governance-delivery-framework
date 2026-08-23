# TP: AGDF Local Marketplace Family Label

Status: approved
Gate: TP
Revision: 2
Gate approval: revision 2 approved with exact `Approval: TP` on 2026-08-23 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/agdf-plugin-family-language/SD.md`
Date: 2026-08-23
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| AFL-T1 | Revalidate the pre-implementation Brownfield path, current canonical brand value, exact candidate files, clean candidate baseline, public-run isolation and existing Marketplace transaction owner | AFL-1, AFL-2, AFL-4, AFL-7 | Brownfield Analysis with pass/revise/block decision and exact allowed paths |
| AFL-T2 | Update the local Codex Marketplace projection to consume the existing canonical `AGDF` brand value while leaving all technical IDs, Claude metadata and the core plugin manifest unchanged | AFL-1, AFL-2, AFL-3, AFL-4 | Focused diff and projected manifest assertions |
| AFL-T3 | Add an exact owned-shape classifier for `current`, `legacy_full_product_label` and `invalid`; route only the exact legacy shape through the existing atomic update and rollback owner | AFL-1, AFL-2, AFL-5 | Regression fixtures for current, legacy, tampered and foreign Marketplace manifests |
| AFL-T4 | Extend focused tests to assert all four identity layers together: Marketplace `name: agdf`, Marketplace `displayName: AGDF`, plugin `name: agdf`, core plugin display name unchanged | AFL-1, AFL-2, AFL-3 | Passing `test:local-marketplace` assertions |
| AFL-T5 | Run repository, Runtime Integrity and public-contract regressions; capture the exact changed-path snapshot and verify no Inventory or public candidate semantic change | AFL-2, AFL-3, AFL-4, AFL-7 | Passing declared commands, `git diff --check`, changed-path evidence |
| AFL-T6 | Complete Task Plan Review, Clean Implementation Review, Code Review and QA for repository behavior, resolving every blocking finding before any installed-host claim | AFL-1 through AFL-7 | Durable review and QA reports with evidence mappings |
| AFL-T7 | Only after separate explicit authorization, run the existing cachebuster/local refresh path and inspect registered Marketplace plus installed manifest without direct cache edits | AFL-5 | Installer output, `codex plugin marketplace list --json`, `codex plugin list --json`, installed manifest inspection |
| AFL-T8 | After installed-state proof and required restart/reload, inspect the Codex Plugins screen once; record `AGDF` success or the host limitation without renaming technical IDs | AFL-6 | Fresh direct Codex UI observation or screenshot and bounded UAT result |
| AFL-T9 | Add a canonical renderer for the Codex-native source-checkout Marketplace and project `.agents/plugins/marketplace.json` from `publicDistribution.publicDisplayName`; keep Marketplace/plugin IDs lowercase and source path `./plugin` | AFL-1, AFL-2, AFL-3 | Renderer equality assertion and focused generated-manifest inspection |
| AFL-T10 | Prove repository Marketplace precedence and cross-host isolation: fresh app-server `plugin/list` selects the Codex-native Marketplace with `displayName: AGDF`, while `.claude-plugin/marketplace.json` remains byte-unchanged and passes Claude strict validation | AFL-1, AFL-3, AFL-4, AFL-6 | App-server projection assertion, Claude strict validation and public-contract regression |
| AFL-T11 | Refresh Brownfield Analysis, CD+Tests, Task Plan Review, Clean Review, Code Review and QA; repeat direct Plugins observation without another install or cache mutation | AFL-1 through AFL-7 | Updated durable reviews, QA decision and fresh visible evidence |

## 2. Test Plan

### Repository implementation checks

1. `npm --prefix create-agdf run test:local-marketplace`
   - asserts the new exact display projection;
   - asserts all technical identities remain unchanged;
   - proves current-shape idempotence;
   - proves exact legacy-shape migration;
   - proves tampered and foreign shapes fail closed.
2. `node plugin/scripts/check-runtime-integrity.mjs`
   - preserves canonical plugin identity, generated-manifest integrity and AGDF runtime contracts.
3. `npm --prefix create-agdf run test:public-plugin`
   - proves the approved public candidate name, copy, prompts and evidence contract remain unchanged.
4. `git diff --check`
   - rejects whitespace errors.
5. `git status --short` plus candidate-path comparison
   - proves no AGDF Project Inventory or unplanned repository path changed.
6. Source-checkout Marketplace regression
   - runs the canonical asset projection;
   - asserts `.agents/plugins/marketplace.json` equals the canonical renderer;
   - queries fresh Codex app-server `plugin/list` with this repository cwd and asserts Marketplace
     `displayName: AGDF`, technical `name: agdf`, repository plugin source and unchanged core product
     display name;
   - runs `claude plugin validate --strict .claude-plugin/marketplace.json` and verifies that file is
     unchanged.

### Review and QA checks

- Task Plan Review maps AFL-T1 through AFL-T8 and AFL-1 through AFL-7.
- Clean Implementation Review rejects a second brand owner, general fallback, cache-edit path or
  parallel updater.
- Code Review checks exact-shape classification, ownership validation, rollback preservation and
  regression coverage.
- QA separates repository result, installed-package result and direct Codex host result.

### Installed and host checks

These checks are not automatically authorized by `Approval: TP`:

1. Obtain separate explicit authorization for the local plugin refresh.
2. Use the existing supported source-checkout installer/cachebuster path.
3. Inspect the registered Marketplace, installed plugin version and installed Marketplace manifest.
4. Restart or reload Codex when required and inspect the Plugins screen once.
5. If the heading remains `agdf`, record the host limitation and stop. Do not rename the technical ID
   or edit cache files manually.

## 3. Brownfield Scope

Pre-implementation Brownfield Analysis must inspect and bind:

- `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName` as the only brand
  value owner;
- `create-agdf/lib/installers/local-marketplace.js` as the only Marketplace projection, ownership,
  transaction and rollback owner;
- `create-agdf/scripts/local-marketplace-test.js` as the focused regression owner;
- `plugin/scripts/check-runtime-integrity.mjs` and
  `create-agdf/scripts/public-plugin-test.js` as required regression evidence;
- `create-agdf/lib/public-plugin/manifest.js` and `create-agdf/scripts/sync-package-assets.js` as the
  canonical source-checkout Marketplace renderer and projection path;
- `.agents/plugins/marketplace.json` as the new derived Codex repository projection;
- `.claude-plugin/marketplace.json` as unchanged Claude-owned evidence;
- the clean baseline state of every planned implementation path;
- `.agdf/control/runs/agdf-public-plugin-distribution/RUN_STATE.md` as a separate active UAT scope that
  must not be revised by this change;
- the installed Marketplace and screenshot as evidence sources only, never mutation targets.

Brownfield Analysis must stop implementation if it finds a second brand owner, public-contract
delta, technical identity change, unsafe legacy acceptance, unplanned dirty candidate path or required
Inventory change.

## 4. Out Of Scope

- AGDF Project Inventory source, package, icon, registration or cache.
- Technical Marketplace/plugin IDs, commands, packages, repositories or install references.
- Core plugin product name, icon, capabilities, prompts, governance or runtime behavior.
- Public candidate semantics, portal action, submission, publication or release.
- Direct installed-cache edits.
- Automatic local reinstall, Codex restart, commit, push or pull request.
- Forcing the cachebuster version into repository discovery; the source checkout legitimately reports
  the base plugin product version from `plugin/.codex-plugin/plugin.json`.
- Removal of the exact legacy compatibility classifier; its later exit decision is separately governed.

## 5. Risks And Blockers

- **Block:** any implementation changes `MARKETPLACE_ID`, plugin ID, install commands or the core
  plugin display name.
- **Block:** the legacy classifier accepts anything beyond the exact old owned manifest shape.
- **Block:** public plugin contract output changes.
- **Block:** candidate implementation paths were dirty before implementation.
- **Revise:** tests do not prove current, legacy and invalid shapes independently.
- **Revise:** repository evidence is presented as installed-package or Codex UI proof.
- **Warn:** Codex still renders the technical ID after a verified refresh and restart. Record the host
  limitation; do not expand the implementation to force the label.
- **Warn:** the exact legacy classifier remains after all supported installed projections have moved;
  track later removal only with real migration evidence.
- **Block:** `.claude-plugin/marketplace.json` gains the Codex-only `interface` field or fails Claude
  strict validation.
- **Revise:** the source-checkout Marketplace is hand-maintained without renderer equality or fresh
  app-server precedence evidence.

## 6. Next Step

Task/Test Plan revision 2 approved. Run pre-implementation Brownfield Analysis against the expanded
candidate paths before code changes.
