# Clean Implementation Review: Release-Built Plugin Runtime Distribution

Status: pass
Date: 2026-07-18

## Clean Implementation Review

- decision: `pass`
- primary_solution: remove generated runtime from the source plugin, build the complete plugin once
  under the released package, and stage that same built plugin through one host-neutral durable
  marketplace transaction consumed by the existing Codex/Claude installer adapters.
- evidence: `sync-plugin-runtime.js` has no source default; `sync-package-assets.js` writes directly
  to generated plugin runtime; `local-marketplace.js` owns paths/manifests/transaction/recovery;
  `plugin-installers.js` owns only host classification and command sequencing; source/build/staging
  tests and both integrity modes pass.
- fallbacks_retained:
  - Exact former AGDF GitHub registration migration is a bounded compatibility path. It applies only
    to a normalized known source and exits naturally after one successful migration.
  - Claude's `host_did_not_expose_version` degraded result is retained because the host may omit a
    version. It never upgrades to verified success and exits when the host exposes a parseable exact
    version.
  - Backup/rollback paths are transaction safety, not a parallel installation owner; successful host
    verification commits and removes the backup.
- workaround_or_shim_risk: low. No registry fallback, Git fallback, background update, second runtime
  package or shell-based filesystem workaround was added.
- parallel_structure_risk: low. Editable validator/runtime ownership remains under `create-agdf`;
  package and user-data plugin trees are digest-verified derived artefacts. Cross-host staging rules
  have one owner and host adapters do not duplicate them.
- brownfield_fit: pass. Existing generator, Runtime Integrity, lifecycle, adapters, workflow and test
  harnesses were extended; only the approved host-neutral staging module is new.
- missing_evidence: authenticated Codex/Claude host installation/restart and native Windows
  interruption behavior remain UAT/release evidence.
- required_next_step: complete Code Review, then run QA Gate.
