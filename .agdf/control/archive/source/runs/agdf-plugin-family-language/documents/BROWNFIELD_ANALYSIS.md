# Brownfield Analysis: AGDF Local Marketplace Family Label

Mode: `pre_implementation_analysis`
Decision: `pass`
Run: `agdf-plugin-family-language`
Based on: approved TP `.agdf/control/artefacts/agdf-plugin-family-language/TP.md`
Date: 2026-08-23

## Scope

Verify the clean implementation path for AFL-T1 through AFL-T5 before CD+Tests. AFL-T6 through
AFL-T8 remain later review, separately authorized installation and direct-host evidence tasks.

## Existing Owners And Coverage

| Area | Existing owner | Current coverage | Reuse strategy |
|---|---|---|---|
| Canonical uppercase brand | `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName` | fully_done | extend consumption only; do not change value |
| Technical Marketplace identity | `create-agdf/lib/installers/local-marketplace.js#MARKETPLACE_ID` | fully_done | preserve |
| Local Codex Marketplace projection | `codexMarketplace()` | partially_done | change display-value mapping only |
| Installed ownership and transaction | `ownership()`, `validateMarketplaceRoot()`, `prepareLocalMarketplace()` | partially_done | extend exact-shape validation; reuse atomic replacement and rollback |
| Focused regression suite | `create-agdf/scripts/local-marketplace-test.js` | partially_done | extend with identity and migration assertions |
| Runtime and public-contract validation | Runtime Integrity and public plugin tests | fully_done | run unchanged as regression evidence |
| Installed refresh and Codex UI | Existing source-checkout installer and Codex Plugins screen | not_done | later separately authorized evidence only |

## Implementation Boundary

Allowed implementation paths:

- `create-agdf/lib/installers/local-marketplace.js`
- `create-agdf/scripts/local-marketplace-test.js`

Evidence-only owners that must not change:

- `plugin/meta/agdf-plugin.definition.json`
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/public-plugin-test.js`
- `.agdf/control/runs/agdf-public-plugin-distribution/RUN_STATE.md`
- installed Marketplace paths and AGDF Project Inventory paths

The candidate implementation paths are clean at baseline commit
`cf1cb5d753feb5fb5e415f0e8c7f8442f204993e`. Existing uncommitted paths are limited to this run's
control artefacts and `MASTER_BACKLOG.md`.

## Reuse And Clean Solution

- Reuse the existing `AGDF` canonical value. Do not add another literal or metadata owner.
- Reuse `codexMarketplace()` as the only expected-manifest builder.
- Add one exact previous-shape builder or classifier beside the current builder. It may differ only
  at `interface.displayName` and must still compare the complete JSON shape.
- Reuse `validateMarketplaceRoot()` as the single ownership boundary. It may accept current or exact
  legacy Codex shape, while Claude remains exact-current only.
- Reuse `prepareLocalMarketplace()` for atomic stage, replacement and rollback. Do not add another
  updater, cache editor or filesystem path.
- Test migration through the existing transaction fixtures instead of a second test harness.

## Compatibility And Regression Impact

- Marketplace and plugin technical IDs stay `agdf`.
- Core plugin display name stays `AI Governance & Delivery Framework`.
- Claude Marketplace output stays unchanged.
- Public candidate output stays unchanged.
- An exact previous owned Marketplace can upgrade instead of being misclassified as tampered.
- Any other manifest difference remains a hard failure.
- No persistence schema, API, CLI, permission, security, architecture or release behavior changes.

## Evidence

- Candidate-path status before implementation: clean.
- `npm --prefix create-agdf run test:local-marketplace`: pass at baseline.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass at baseline.
- `npm --prefix create-agdf run test:public-plugin`: pass at baseline with 43 candidate files and
  digest `5e93c979972386a5b255c67bcbc491e13a21b7a6a046c292bd0fd4cfd60a72e0`.

## Risks And Stop Conditions

- Stop if implementation needs a new brand field or literal owner.
- Stop if exact legacy classification cannot distinguish tampering.
- Stop if public candidate, Claude Marketplace, technical IDs or core plugin identity change.
- Stop if an implementation path is unexpectedly dirty or a third source path becomes necessary.
- Keep install, restart and direct UI observation out of CD+Tests until separately authorized.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#release_built_plugin_distribution_2026_07_18`; `.agdf/control/SOT_REGISTRY.md`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing local Marketplace transaction and rollback ownership remains authoritative.

## Result

- decision: pass
- current_coverage: partially_done
- reuse_strategy: extend
- parallel_structure_risk: none with the bounded path above
- missing_evidence: implementation, post-change tests, reviews, installed-state proof and direct Codex UAT
- required_next_step: Implement AFL-T2 through AFL-T4 only in the two allowed source paths, then run AFL-T5 validation.

## QA Revision: AFL-TPR-03

Mode: `pre_implementation_analysis`
Decision: `pass`
Date: 2026-08-23

The direct Plugins-screen evidence shows that the updated Codex Marketplace manifest alone is not
sufficient for an already registered local Marketplace. The equivalent AGDF Project Inventory
manifest renders its uppercase display name, while the existing AGDF registration still renders
the technical name. The implementation gap is therefore in the existing Codex installer lifecycle,
not in the manifest shape or canonical copy.

The bounded repair may additionally change:

- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/scripts/local-marketplace-test.js`

It must reuse `installCodexGlobalPlugin()`, `migrateMarketplace()` and `recoverMarketplace()`. When
`prepareLocalMarketplace()` reports `changed: true` and the Codex registration is
`owned_local_current`, the installer may remove and re-add that same owned local Marketplace before
the plugin update. When `changed` is false or absent, it must not refresh the registration. Recovery
must restore both the previous filesystem projection and its registration after remove, add, or
plugin-operation failures. Technical Marketplace and plugin IDs remain `agdf`; Claude and AGDF
Project Inventory remain outside the change boundary.

Because the native Marketplace inventory does not expose registered display metadata, the existing
ownership marker may carry a numeric Codex registration revision. Only the Codex installer may
request the current revision; other surfaces preserve the stored value. A missing prior revision
must make the Codex projection transaction change exactly once; the current revision must then be
idempotent. This field belongs to the existing ownership and migration owner and is not a second
state store.

Required focused evidence:

- changed current Codex registration is refreshed;
- unchanged current Codex registration is not refreshed;
- a missing registration revision migrates once and the current revision is idempotent;
- non-Codex preparation preserves and cannot advance the Codex registration revision;
- remove failure rolls back without attempting an add;
- add failure restores the previous filesystem projection before re-registration;
- plugin failure removes the refreshed registration, restores the filesystem projection, and then
  re-registers the restored Marketplace;
- existing absent, legacy, conflict, Claude and version checks remain green.

Result: `pass`. Reuse strategy: extend the existing installer transaction. Parallel structure risk:
none. Required next step: repair AFL-TPR-03 in the two paths above, refresh reviews, and rerun QA.

## QA Revision: Restart-Persistent Codex Cache Selection

Mode: `pre_implementation_analysis`
Decision: `pass`
Date: 2026-08-23

Fresh post-restart evidence shows that the prior supported install did not remain active: the
registered Marketplace source still projected `0.13.5+codex.local-619acdcbd1f9`, while Codex loaded
cache directory `0.13.5`, reported version `0.13.5`, and continued to render the stale Marketplace
heading. A direct reinstall with the plugin workflow's unambiguous selector
`codex plugin add agdf@agdf --json` removed the base cache and created only
`0.13.5+codex.local-619acdcbd1f9`.

The minimal repair reuses `installCodexGlobalPlugin()` and changes only its native plugin-add
selector from the equivalent split form to the workflow-standard exact selector plus JSON output.
Existing command fixtures must follow that native contract in:

- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/scripts/local-marketplace-test.js`
- `create-agdf/scripts/local-development-install-test.js`
- `create-agdf/scripts/cli-modularization-test.js`
- `create-agdf/scripts/release-bootstrap-smoke-test.js`
- `create-agdf/scripts/smoke-test.js`

The Marketplace projector, ownership transaction, cachebuster algorithm, technical IDs and Project
Inventory remain unchanged. The direct reinstall is current-runtime evidence, not proof that a later
restart will preserve the result. Required next step: update the exact native command and fixtures,
run the declared regressions, reinstall through the corrected repository owner, then request a new
task rather than claiming visible success.

## QA Revision: Repository Marketplace Precedence

Mode: `pre_implementation_analysis`
Decision: `revise`
Date: 2026-08-23

A fresh `plugin/list` request against the same app-server contract consumed by the Codex Plugins
screen discovered a previously unbound repository Marketplace at
`.claude-plugin/marketplace.json`. For this checkout Codex selects that entry before the installed
Marketplace duplicate. The selected entry has Marketplace `name: agdf`, no Marketplace
`interface.displayName`, plugin version `0.13.5`, and source `plugin/`. This directly explains both
the lowercase heading and the base version reported by the user even though the separately
installed Marketplace and cachebuster package are correct.

Adding `interface.displayName: AGDF` to that cross-host repository Marketplace makes a fresh
app-server `plugin/list` response expose `marketplaceDisplayName: AGDF`; the diagnostic change and
test were then reverted because the approved SD and TP explicitly keep Claude Marketplace metadata
unchanged and do not authorize `.claude-plugin/marketplace.json` as an implementation path.

The repair therefore requires a bounded SD and TP revision before implementation. The revised
design must reuse `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName`,
preserve Marketplace and plugin technical IDs, define the Claude compatibility boundary for the
additional `interface` field, and add deterministic repository-Marketplace plus app-server
projection coverage. No cache edit, technical rename, Inventory change or further reinstall is
required for this root cause.

## Revision 2 Pre-Implementation Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- approved_scope: TP revision 2 tasks AFL-T9 through AFL-T11
- current_coverage: `partially_done`; installed Marketplace projection is correct, while the
  Codex-native source-checkout projection is absent
- reuse_strategy: `extend`
- canonical_owner: `plugin/meta/agdf-plugin.definition.json#publicDistribution.publicDisplayName`
- renderer_owner: extend `create-agdf/lib/public-plugin/manifest.js`
- projection_owner: extend `create-agdf/scripts/sync-package-assets.js`
- derived_path: `.agents/plugins/marketplace.json`
- regression_owner: extend `create-agdf/scripts/public-plugin-test.js`
- protected_cross_host_path: `.claude-plugin/marketplace.json` remains byte-unchanged and strict-valid
- candidate_baseline: all four implementation source/derived paths clean before implementation;
  `.agents/plugins/marketplace.json` absent
- baseline_evidence: public plugin test pass; Runtime Integrity pass; Claude strict Marketplace
  validation pass; fresh app-server diagnosis already proves the missing Codex-native projection
- compatibility: no technical identity, public candidate, installed cache, release, runtime,
  persistence, API or migration change
- parallel_structure_risk: none; one additional host-native projection is rendered from the existing
  canonical definition through the existing asset synchronization owner
- visible_state_owner: Codex app-server `plugin/list` plus Plugins screen; repository product version
  `0.13.5` remains valid source-checkout state and is not replaced by an install cache version
- context_graph_impact: `link_only`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#release_built_plugin_distribution_2026_07_18`;
  `.agdf/control/SOT_REGISTRY.md`
- missing_evidence: post-change renderer equality, fresh app-server selection, unchanged Claude
  strict validation, mandatory reviews, QA and direct Plugins observation
- required_next_step: implement AFL-T9 and AFL-T10 only in the approved paths, then refresh AFL-T11
  evidence
