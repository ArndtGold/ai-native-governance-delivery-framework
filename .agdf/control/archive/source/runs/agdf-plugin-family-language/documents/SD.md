# SD: AGDF Local Marketplace Family Label

Status: approved
Gate: SD
Revision: 2
Gate approval: revision 2 approved with exact `Approval: SD` on 2026-08-23 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/agdf-plugin-family-language/PRD.md`
Date: 2026-08-23
Owner: Arndt Gold

## 1. Solution Overview

Change the installed and source-checkout Codex Marketplace family-label projections and their
bounded compatibility paths:

1. `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName` remains the single
   canonical uppercase brand value and stays exactly `AGDF`.
2. `create-agdf/lib/installers/local-marketplace.js#codexMarketplace` projects that value into the
   installed local Codex Marketplace `interface.displayName`.
3. A Codex-specific source-checkout Marketplace at `.agents/plugins/marketplace.json` projects the
   same canonical value and becomes the repository-discovery owner selected by Codex ahead of the
   Claude Marketplace. It retains Marketplace and plugin technical name `agdf` and points to
   `./plugin`.
4. `create-agdf/lib/public-plugin/manifest.js` owns the repository Marketplace renderer and
   `create-agdf/scripts/sync-package-assets.js` writes the derived file. The source projection is
   compared with the renderer in deterministic tests so the JSON file is not a second brand owner.
5. `.claude-plugin/marketplace.json` remains unchanged and must continue to pass
   `claude plugin validate --strict`; Claude Code currently warns that `interface` is unknown, so the
   Codex label must not be added to that cross-host file.
6. `MARKETPLACE_ID`, plugin ID, install commands and core plugin manifest remain lowercase technical
   identities or the existing full core product name as applicable.
7. The owned Marketplace validator recognizes the one exact previous installed Codex Marketplace projection
   whose display label came from `definition.displayName`. This is an explicit migration shape, not
   a general fallback. All other fields must still match the owned manifest exactly.
8. The existing atomic stage, replacement and rollback transaction upgrades the owned previous
   projection to the new `AGDF` label. Direct cache editing remains forbidden.
9. Focused regression tests prove both Codex projections, exact legacy migration, idempotence and
   rejection of foreign or tampered shapes.

No Claude Marketplace metadata, public plugin metadata, core plugin display name, description,
capability or runtime behavior is changed.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design use |
|---|---|---|
| Visible AGDF family brand | `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName` | Reuse the existing exact value `AGDF`; introduce no second string owner |
| Local Marketplace ID | `create-agdf/lib/installers/local-marketplace.js#MARKETPLACE_ID` | Preserve exact technical ID `agdf` |
| Codex Marketplace projection and owned migration | `create-agdf/lib/installers/local-marketplace.js` | Project the visible brand and recognize only current or exact previous owned shapes |
| Source-checkout Codex Marketplace projection | `create-agdf/lib/public-plugin/manifest.js`; `create-agdf/scripts/sync-package-assets.js` | Render `.agents/plugins/marketplace.json` from the same canonical definition without changing Claude metadata |
| Core plugin product identity | Canonical definition and generated `.codex-plugin/plugin.json` | Preserve `AI Governance & Delivery Framework` and the existing icon |
| Deterministic regression evidence | `create-agdf/scripts/local-marketplace-test.js` | Prove projection, upgrade, idempotence and tamper rejection |
| Public distribution contract | Existing public distribution definition, projector and tests | Evidence-only boundary; must remain unchanged |
| Installed Marketplace state | Existing owned user-data Marketplace transaction | Derived state; never a source file or authority for product copy |
| Visible Codex rendering | Codex Plugins screen | Direct UAT evidence only after installed-state verification |

## 3. Architecture Decisions

### SD-AFL-1 Reuse the canonical AGDF value

The local Marketplace display label reads `definition.publicDistribution.publicDisplayName`. No new
`AGDF` literal is introduced in the projector. The canonical value is already constrained and tested
by the public plugin contract, but consuming it locally does not make local installation dependent on
public submission or publication state.

### SD-AFL-2 Preserve separate visible and technical identity

- Marketplace `name`: `agdf`
- Marketplace `interface.displayName`: `AGDF`
- Plugin `name`: `agdf`
- Core plugin `interface.displayName`: `AI Governance & Delivery Framework`

Tests assert all four values together so future copy changes cannot collapse the family and product
levels or rename technical references accidentally.

### SD-AFL-3 Exact owned-shape migration

The current validator compares an installed Marketplace manifest with one generated expected shape.
After the label projection changes, the existing owned manifest would otherwise be rejected as
tampered before the atomic update can run.

Introduce one comparison that classifies the Codex Marketplace manifest as:

- `current`: exact new shape using `AGDF`;
- `legacy_full_product_label`: exact old shape using `definition.displayName`, with every other field
  identical to the current owned contract;
- `invalid`: any other difference.

Only the first two shapes are AGDF-owned. `invalid` remains a hard error. The stage always writes the
current shape. After one successful update the legacy shape disappears, and the next preparation is
idempotent. This compatibility branch has one explicit exit condition: no supported installed AGDF
Marketplace remains on the previous full-product label shape. Removal is a later separately governed
maintenance decision, not part of this slice.

### SD-AFL-4 Preserve the existing transaction and rollback owner

Do not create a new updater. `prepareLocalMarketplace()` continues to own staging, validation,
atomic replacement, rollback and the ownership marker. The migration classifier is used only inside
its existing validation boundary.

### SD-AFL-5 Keep evidence planes separate

Repository tests prove source behavior. A separately authorized local refresh plus manifest
inspection proves installed state. Only a fresh Codex Plugins observation proves visible host
rendering. None substitutes for another.

### SD-AFL-6 Prefer the Codex-native repository manifest

Codex repository discovery considers both `.agents/plugins/marketplace.json` and
`.claude-plugin/marketplace.json`. Without the Codex-native file, the Plugins screen selects the
Claude Marketplace, which has no Codex Marketplace display metadata and exposes the source plugin's
base version. Add the Codex-native repository projection rather than teaching the Claude manifest a
field that Claude Code ignores and rejects under strict validation.

The source-checkout Plugins screen may continue to report product version `0.13.5` because it is
showing `plugin/.codex-plugin/plugin.json` from the repository. That is distinct from the separately
installed cachebuster version. Acceptance concerns the `AGDF` heading and correct source ownership,
not forcing an installation cache version into repository discovery.

## 4. Integration Points

- `create-agdf/lib/installers/local-marketplace.js`: local Codex and Claude Marketplace generation,
  ownership validation and atomic update. Claude metadata remains unchanged.
- `create-agdf/scripts/local-marketplace-test.js`: focused deterministic transaction and migration
  coverage.
- `plugin/scripts/check-runtime-integrity.mjs`: existing canonical value and generated plugin
  integrity assertions; no new owner is introduced.
- `create-agdf/scripts/public-plugin-test.js`: unchanged public candidate contract used as regression
  evidence plus exact source-checkout Marketplace projection equality.
- `create-agdf/lib/public-plugin/manifest.js`: canonical renderer for the Codex-specific repository
  Marketplace.
- `create-agdf/scripts/sync-package-assets.js`: writes `.agents/plugins/marketplace.json` as a
  derived source-checkout projection.
- `.agents/plugins/marketplace.json`: Codex-native repository Marketplace selected by the Plugins
  screen in this checkout.
- `.claude-plugin/marketplace.json`: unchanged Claude owner; strict validation remains required.
- Codex plugin CLI and Plugins screen: later installed-package and host evidence surfaces; no direct
  mutation during implementation.

## 5. Constraints And Compatibility

- Technical IDs and install commands remain exactly `agdf`.
- The core plugin product name remains exactly `AI Governance & Delivery Framework`.
- The visible Marketplace family label is exactly `AGDF`.
- The public plugin candidate remains byte-for-byte equivalent in its approved semantic fields.
- No Inventory repository, package, registration or cache is modified.
- No direct cache edit is allowed.
- Claude strict Marketplace validation must remain green; the Codex-only `interface` field must not
  be added to `.claude-plugin/marketplace.json`.
- The compatibility path accepts only a marker-proven, digest-valid installed Marketplace and one
  exact old manifest shape. It must not accept partial or foreign similarities.
- Repository implementation performs no reinstall, restart, release, publication or VCS action.

## 6. Test And Evidence Strategy

| Evidence ID | Requirement coverage | Evidence |
|---|---|---|
| AFL-E1 | AFL-1, AFL-2, AFL-3 | Focused test asserts `name: agdf`, Marketplace `displayName: AGDF`, plugin `name: agdf` and unchanged core plugin display name |
| AFL-E2 | AFL-1, AFL-2, AFL-5 | Existing exact previous owned Marketplace shape upgrades successfully to the current shape |
| AFL-E3 | AFL-2, AFL-5 | Current shape remains idempotent; tampered and foreign shapes still fail closed |
| AFL-E4 | AFL-3, AFL-4 | Runtime Integrity and public plugin contract tests pass unchanged |
| AFL-E5 | AFL-7 | Exact changed-path snapshot contains only approved AGDF repository paths and control artefacts |
| AFL-E6 | AFL-5 | After separate authorization, registered Marketplace and installed manifest show the refreshed version and `AGDF` label |
| AFL-E7 | AFL-6 | After installed verification and restart/reload, direct Codex Plugins evidence shows `AGDF` or records the host limitation honestly |
| AFL-E8 | AFL-1, AFL-2, AFL-3, AFL-6 | Fresh app-server `plugin/list` with the repository cwd selects `.agents/plugins/marketplace.json`, exposes Marketplace `displayName: AGDF`, retains plugin display name and reports the repository source explicitly |
| AFL-E9 | AFL-4 | `claude plugin validate --strict .claude-plugin/marketplace.json` passes unchanged |

Required repository commands will include the focused local Marketplace test, Runtime Integrity,
public plugin contract regression and `git diff --check`. Task planning must name the exact commands
and keep installation/UAT work separately sequenced.

## 7. Risks And Open Questions

- Codex may change repository Marketplace precedence in a later host version. App-server projection
  evidence and direct UI observation remain required; technical IDs must not be renamed.
- Codex may retain registered Marketplace metadata across a plugin-only refresh. Task planning must
  establish the existing supported cachebuster/update sequence and a visible restart/reload retry.
- The exact legacy classifier must be narrow enough that a tampered manifest cannot be mistaken for
  an upgrade candidate.
- Reusing `publicDistribution.publicDisplayName` is a semantic reuse of the brand value, not a claim
  that public distribution is complete or active.

## 8. Revision 2 Decision Boundary

- New approved path requested: `.agents/plugins/marketplace.json` generated from the existing
  canonical brand value.
- Explicitly rejected path: adding `interface` to `.claude-plugin/marketplace.json`, because Claude
  strict validation reports it as unknown.
- Unchanged boundaries: technical IDs, core product identity, Inventory, installed cache, public
  candidate semantics and release behavior.

## 9. Next Step

Revision 2 approved. Draft Task/Test Plan revision 2; implementation remains forbidden until exact
`Approval: TP` is revalidated for this run and its durable plan revision.
