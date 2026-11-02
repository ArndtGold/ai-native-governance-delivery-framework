# Brownfield Analysis: Immutable Local Build Snapshot

Status: done
Decision: pass
Mode: `pre_implementation_analysis`
Revision: 8
Date: 2026-09-02
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 9

## Baseline And Scope

- baseline_commit: `2cc30a6`
- affected_tasks: `CAT-T13` through `CAT-T16`
- affected_surfaces: Codex, Claude and Copilot local plugin preparation; OpenCode retains its
  separately owned package archive path.
- current_coverage: marketplace staging, ownership validation, source provenance, stable/backup
  swap and rollback already reside in `local-marketplace.js`; local orchestration currently derives
  the same source digest and Codex local version once more before invoking that owner.
- decision: pass; the approved change can remove duplicate orchestration ownership and extend the
  existing marketplace preparation owner with one bounded immutable source snapshot.

## Existing Owners And Reuse

| Concern | Existing owner | Implementation action |
|---|---|---|
| Normalized source identity | `lib/runtime/plugin-provenance.js` | reuse `digestNormalizedPluginSource`; do not add another digest algorithm |
| Marketplace preparation and transaction | `lib/installers/local-marketplace.js` | capture, validate and clean one owned temporary snapshot before the existing stage/swap path |
| Codex local identity format | `codexLocalInstallVersion` in `local-marketplace.js` | derive internally from the validated snapshot digest; keep the exact format |
| Claude identity | shared runtime-plugin preparation | retain canonical Claude version while reusing the same snapshot bytes and digest |
| Copilot identity | `prepareCopilotMarketplace` | retain canonical version and route through the same snapshot mechanism |
| Local command orchestration | `scripts/install-local-plugin.js` | select surface and source only; stop computing or supplying a digest-derived version |
| Host mutation sequencing | `lib/installers/plugin-installers.js` | unchanged; preparation completes before any host command and its transaction object remains the rollback boundary |
| Regression evidence | existing local marketplace and local development install suites | add stable, injected mutation, cleanup, zero-host-call and per-surface assertions |

## Reuse And Compatibility Strategy

1. Add a testable snapshot helper inside the existing marketplace module. It owns its temporary
   root and returns one immutable descriptor containing canonical version, profile, source digest,
   source root and surface-specific install version.
2. Compute normalized digest before copy, on the copied snapshot and again on the source. All three
   values must match before recovery, staging, stable-root replacement or host invocation.
3. Stage only from the validated snapshot. The existing stage validation, installation provenance,
   marketplace manifests, plugin digest, swap, commit and rollback logic remain authoritative.
4. Clean the snapshot in both success and failure paths after staging has copied its bytes. Cleanup
   targets only the exact helper-created temporary root.
5. Keep explicit caller-provided Codex versions available to existing internal fixture coverage;
   the production local-install path requests owned source derivation and cannot supply an arbitrary
   suffix.
6. Preserve OpenCode package preparation because it already binds installation to its own durable
   package archive and is outside the approved marketplace snapshot scope.

## Interfaces, Migration And Side Effects

- public_commands: unchanged.
- persisted_marketplace_layout: unchanged.
- ownership_and_provenance_schema: unchanged.
- stable_backup_swap_authority: unchanged.
- migration: none; existing owned marketplaces are still classified and rebuilt by the current
  transaction owner.
- filesystem_side_effect: one temporary directory beneath the AGDF data root, removed before the
  prepare call completes or throws.
- host_side_effect: none on `local_install_source_unstable`; host adapters are reached only after a
  successful prepared transaction is returned.
- parallel_structure: none; the snapshot is a precondition inside the existing preparation owner,
  not a second marketplace or transaction implementation.

## Risk And Stop-Condition Result

- mutable_source_risk: resolved by pre-source, snapshot and post-source normalized digest equality.
- duplicate_identity_risk: resolved by removing digest/version derivation from
  `install-local-plugin.js`.
- cleanup_risk: bounded to the helper-created exact temporary root and covered on success and error.
- host_mutation_risk: resolved by current sequencing; `prepare` runs before Codex, Claude or Copilot
  host commands.
- compatibility_risk: bounded because Codex remains digest-qualified and Claude/Copilot retain the
  canonical version.
- source_of_truth_drift: none; `digestNormalizedPluginSource` remains the only byte-identity
  algorithm and the marketplace marker/provenance values remain generated from one descriptor.
- regression_risk: existing direct callers retain canonical behavior unless they deliberately select
  snapshot derivation; production local orchestration always selects it.
- unapproved_path_risk: resolved by TP Revision 9 Section 3.

No TP Revision 9 stop condition remains. Implementation may proceed only for CAT-T13 through CAT-T16
and only within the approved paths.

## Required Regression Evidence

- Stable source produces one snapshot digest, exact Codex local version, identical staged provenance
  and canonical Claude/Copilot versions.
- Injected source mutation rejects with `local_install_source_unstable`, removes the snapshot and
  leaves stable marketplace, backup and host-call evidence unchanged.
- Existing marketplace classification, rollback/recovery, lifecycle, Runtime Integrity and release
  suites remain green or disclose separately owned baseline failures.
- Complete smoke uses an isolated npm cache; remote GitHub Actions remains a separate evidence plane.

## Context Graph

- impact: update_existing_node
- ref: `CG-CREATE-AGDF-CLI-COMPOSITION`
- reconciliation: resolved
- required update: record that local Codex/Claude/Copilot installation derives source identity and
  staged bytes from one immutable snapshot within the existing marketplace transaction owner.
- gate effect: none; Brownfield pass authorizes only the approved implementation tasks and does not
  grant QA, UAT, host mutation, release or VCS authority.
