# Brownfield Analysis: Release-Built Plugin Runtime Distribution

Status: done
Mode: `pre_implementation_analysis`
Decision: `pass`
Date: 2026-07-18
Owner: agent
Based on: approved TP; exact `Approval: TP` revalidated against run revision 5

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/automatic-version-asset-sync/BROWNFIELD_ANALYSIS.md`
- scope: RBP-01 through RBP-13 and RBP-T01 through RBP-T13.
- transparency: repository implementation may proceed through existing package, integrity, installer,
  lifecycle and workflow owners; live host mutation, publication and release remain excluded.

## 1. Worktree And Parallel-Scope Boundary

- The dirty worktree contains the earlier `agdf-interaction-ownership-quick-path-ux` implementation,
  this run's control artefacts, and a separate active OpenCode activation line. Those changes are
  user-owned and must be preserved.
- The earlier run already introduced the focused validator modules, runtime generator and an
  untracked generated `plugin/runtime/`. This run reuses those canonical generator/runtime owners but
  supersedes only the earlier assumption that generated runtime belongs in the source plugin.
- Interaction ownership, Compact Delivery and OpenCode global activation changes are outside this
  delta. Files overlapping those concerns may change only where package composition or shared test
  expectations require it.
- `plugin/runtime/` is untracked and reproducible from the generator; removing it as a source
  expectation does not discard an independent implementation owner.

## 2. Existing Coverage And Reuse Strategy

| TP scope | Existing owner | Current coverage | Reuse strategy |
|---|---|---|---|
| RBP-01 through RBP-04 source/build/layout | `sync-plugin-runtime.js`; `sync-package-assets.js`; Runtime Integrity; local-validator/layout tests | `partially_done`: runtime generation, digest and generated plugin already exist, but generation still writes source first and installed integrity assumes runtime in source. | `refactor`: generate directly into the packaged plugin and split layout expectations in existing integrity owners. |
| RBP-05 through RBP-07 durable staging | installer directory and platform-neutral Node filesystem conventions | `not_done`: no durable local-marketplace transaction exists. | `new` focused infrastructure module only; inject roots/executors and keep product policy in existing installer flow. |
| RBP-08/RBP-09 host migration | `plugin-installers.js`; lifecycle application/result/presentation; CLI modularization and smoke fixtures | `partially_done`: host installation/version verification exists, but registration targets GitHub. | `extend`: preserve adapters and lifecycle envelope while adding classification, staging and rollback. |
| RBP-10 release build | `publish-agdf.yml`; package `prepack`; release bootstrap and smoke tests | `partially_done`: prepack sync exists, but workflow validates source runtime before explicit package build and does not assert the tarball inventory. | `extend`: make build/order and package-file checks explicit. |
| RBP-11/RBP-12 copy and ownership records | lifecycle copy, install docs, sync flow, SOT Registry and `CG-CREATE-AGDF-CLI-COMPOSITION` | `partially_done`: current public commands are compatible; architecture wording and ownership evidence are stale. | `update_existing`: change only distribution ownership and migration guidance. |
| RBP-13 evidence | focused and aggregate repository suites | `fully_done` as harness infrastructure. | `extend`: add package/staging/migration fixtures and rerun aggregate checks. |

## 3. Minimal Clean Implementation Path

1. Make `syncPluginRuntime` require an explicit safe output directory and make package sync exclude
   source runtime while copying all install-required plugin manifests/scripts.
2. Extend Runtime Integrity to treat the source repository as runtime-free and generated/installed
   plugin roots as runtime-bearing, without creating a second integrity script.
3. Add one pure local-marketplace module for data-root resolution, manifests, ownership,
   classification and atomic stage/rollback. Host adapters consume that module; they do not duplicate
   filesystem policy.
4. Keep Codex and Claude command order in `plugin-installers.js`, using JSON inspection and exact
   legacy matching before any removal. Keep lifecycle result construction in the existing CLI owner.
5. Build and verify the generated plugin explicitly in release CI, then update canonical ownership
   records and documentation.

## 4. Compatibility, Side Effects And Visible Ownership

- Public `@agdf/cli` commands, plugin ID `agdf`, marketplace name `agdf`, exact gate semantics and
  OpenCode package architecture remain unchanged.
- Installed Codex currently reports marketplace `agdf` as the exact known GitHub URL; Claude reports
  no registered marketplace. These read-only observations confirm both migration branches without
  authorizing a live change.
- Installed Codex and Claude CLIs expose local-path marketplace sources and JSON marketplace listing.
  Tests must still use injected executors and temporary roots.
- The CLI installer remains the primary visible owner for install/update status and recovery. The
  staging module returns evidence and rollback outcomes but does not print competing lifecycle copy.
- No data-model migration or target-repository dependency is required. The durable root is user-data
  state owned solely through an exact marker.

## 5. Parallel-Structure And Drift Check

- `create-agdf/cli` remains the only validator implementation and runtime generator owner.
- The generated plugin and durable marketplace are derived distribution artefacts, never editable
  source trees.
- The existing `.claude-plugin/marketplace.json` remains the repository marketplace and is not reused
  as the global durable marketplace owner; package-local manifests are generated from the canonical
  plugin definition.
- Host-specific command sequencing stays in one adapter module; cross-host ownership and filesystem
  rules stay in one shared staging module.
- No unresolved product semantics or second SoT remains. A need for background updates, a new public
  command, a new marketplace identity or mutation of unowned state would reopen SD/TP.

## 6. Risks And Regression Controls

| Risk | Required control |
|---|---|
| Source sync accidentally recopies untracked runtime | Explicit `runtime` exclusion plus source-mode negative integrity and untouched-source digest tests. |
| Generated plugin is incomplete for Claude or integrity | Copy both host manifests and integrity script; validate the generated root before pack. |
| Marketplace parser removes a foreign registration | Exact five-state classification; conflict/unknown execute no remove command. |
| Failed host operation strands a new root | Staging transaction keeps the owned backup until host verification and restores on failure. |
| Platform rename/path behavior causes unsafe cleanup | Containment checks, unique sibling stage/backup paths and injected temp-root fixtures. |
| CI relies on prepack side effects | Explicit sync and tarball-file assertion in validate and publish jobs. |
| Prior run evidence is overstated | Re-run all runtime packaging/installer evidence and keep real host UAT separate. |

## 7. Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `open_gap`
- context_graph_gate_effect: `warning`
- context_graph_required_action: `update`
- rationale: the existing CLI composition node already owns generated package assets and release
  command behavior; final implementation evidence must add the runtime-free source and durable
  marketplace distribution boundaries.

## 8. Decision

- decision: `pass`
- current_coverage: `partially_done`; runtime generation, package sync, host adapters, lifecycle and
  tests are reusable, while one focused durable-staging module is genuinely new.
- reuse_strategy: `refactor` source/build composition; `extend` integrity, adapters, lifecycle,
  workflows and docs; create only host-neutral staging infrastructure.
- parallel_structure_risk: controlled by explicit ownership split and derived-output integrity.
- missing_evidence: transaction failure coverage, tarball inventory, offline staged validation and
  authenticated host migration remain implementation/test/UAT evidence, not blockers to CD+Tests.
- required_next_step: proceed to `CD+Tests` for RBP-01 through RBP-13 and record evidence by task and
  test ID. No earlier gate reopens.
