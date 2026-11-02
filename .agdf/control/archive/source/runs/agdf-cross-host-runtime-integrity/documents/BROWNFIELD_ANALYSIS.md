# Brownfield Analysis: Cross-Host Plugin Runtime Integrity

Status: passed; revision 3
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-08-26
Based on: approved `TP.md` revision 3

## Scope And Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- scope: CRI-13 through CRI-18 only; historical CRI-01 through CRI-12 remain unchanged
- transparency: the approved delta reuses the existing marketplace transaction, provenance,
  lifecycle and test owners. No new executable owner, public command, persistent store or host
  permission boundary is required.
- required_next_step: implement the approved delta through existing owners, then run the complete
  review and QA sequence. Real host installation remains outside CD+Tests authority.

## Baseline And Evidence

- current tracked changes before implementation are limited to this run's Context Graph, backlog,
  QA, SD, TP and run-state updates.
- no implementation file is modified at the revision-3 baseline.
- `create-agdf/lib/installers/local-marketplace.js` already owns the canonical data root, outer
  ownership marker, plugin validation, marketplace validation, stage creation, atomic swap,
  interruption recovery, commit and rollback.
- `create-agdf/lib/runtime/plugin-provenance.js` already owns distribution-profile validation,
  normalized source digest and current and exact legacy provenance inspection.
- `create-agdf/lib/installers/plugin-installers.js` already owns Codex and Claude host-command
  sequencing, evidence projection and filesystem rollback after host failure.
- `create-agdf/lib/fs-swap.js` already owns bounded Windows `EPERM` rename retry.
- `create-agdf/scripts/local-marketplace-test.js` already covers canonical staging, exact legacy
  marker migration, current marker absence rejection, tamper, interruption, commit and rollback.
- direct native-Windows evidence in
  `.agdf/control/artefacts/windows-native-install-viability/VERIFIED_CHANGE.md` proves the two open
  reliability gaps: markerless pre-provenance reinstall and host-dependent simulated paths.

## Current Coverage And Reuse

| Concern | Coverage | Existing owner | Reuse strategy |
|---|---|---|---|
| Current and exact legacy provenance | fully_done | `plugin-provenance.js`, `local-marketplace.js` | preserve without weakening |
| Markerless pre-provenance root | partially_done | `local-marketplace.js` | extend with a separate bounded classification |
| Structural plugin validation | partially_done | `validateBuiltPlugin` | refactor options so historical shape can be checked without treating it as trusted provenance |
| Marketplace ownership and manifests | fully_done | `ownership`, `validateMarketplaceRoot` | reuse as mandatory eligibility checks |
| Atomic replacement and recovery | fully_done | `prepareLocalMarketplace`, `fs-swap.js` | reuse unchanged transaction paths |
| Installer evidence | partially_done | `plugin-installers.js` | add a bounded rebuild label without loaded-host claims |
| Simulated platform paths | partially_done | `defaultAgdfDataRoot` | select `path.win32` or `path.posix` from injected platform |
| Regression fixtures | partially_done | `local-marketplace-test.js` | extend existing file; do not create another harness |

## Minimal Clean Implementation

1. Make `defaultAgdfDataRoot` and `localMarketplaceRoot` use target-platform path semantics while
   preserving native default behavior.
2. Add one internal existing-root classifier in `local-marketplace.js` with the exact classes
   `current_or_marker_migration`, `owned_pre_provenance_rebuild` and `invalid_or_unowned`.
3. Permit the rebuild class only when the current provenance marker and legacy marker are both
   absent, `distributionProfiles` is absent, the outer marker digest matches, versions and runtime
   digest are coherent, and both marketplace manifests pass the existing validator.
4. Build the replacement only from canonical `builtPluginRoot`; write and validate current
   provenance before moving the stable root. Reuse existing backup, commit, rollback and interrupted
   transaction recovery without copying historical plugin content.
5. Project the rebuild classification through the existing installer evidence list, explicitly
   separate from installed cache and loaded-session evidence.
6. Extend the existing test matrix with positive rebuild, negative markerless-current, malformed,
   tampered and incomplete cases, source-only stage proof, rollback proof and target-path semantics.

## Compatibility, Risks And Boundaries

- backwards compatibility: current matched provenance and exact legacy-marker migration keep their
  existing validation and idempotency behavior.
- security boundary: missing provenance never becomes trust. Eligibility authorizes only an owned
  atomic set-aside and canonical rebuild. A current-profile markerless root, any present malformed
  marker, digest mismatch, version mismatch, invalid marketplace or unowned root remains blocking.
- data and migration: no new schema and no in-place cache mutation. The current stage marker and
  outer ownership marker remain authoritative.
- parallel-structure risk: low because classification stays inside the existing installer owner and
  path semantics stay inside the existing path owner.
- runtime and product-semantics drift: none found beyond the two gaps already approved by SD and TP
  revision 3.
- visible state owner: lifecycle output remains the installer-state owner; SessionStart remains the
  loaded-root owner. The rebuild label must not promote installer evidence to loaded-session proof.
- native-Windows CRI-H05 remains missing until direct host execution. Repository fixtures cannot
  substitute for that evidence.
- context_graph_impact: `update_existing_node`; the already-added
  `pre_provenance_recovery_gap_2026_08_26` invariant is the correct reusable owner.

## Missing Evidence

- implementation and CRI-T18 through CRI-T25 results;
- direct native-Windows CRI-H05 execution;
- refreshed Task Plan Review, Clean Implementation Review, Code Review and QA decision.

The reuse path is clear, all implementation paths are inside TP Section 3, and no blocking owner,
scope or product decision conflict remains. CD+Tests may begin for CRI-13 through CRI-18.

## Native-Windows Delta — 2026-09-01

- mode: `pre_implementation_analysis`
- decision: `pass`
- scope: CRI-17 native-Windows release preparation and generated-package verification
- evidence: `npm run install:copilot` failed before host mutation because the generated payload was
  569327 bytes against a reviewed 568459-byte ceiling; normalizing its 11659 CRLF pairs to LF yields
  557668 bytes, proving checkout line endings rather than semantic payload growth caused the failure.
- current_coverage: generation is idempotent on one host, but `write()` preserves checkout-specific
  CRLF bytes and the package-build test does not assert cross-platform line-ending stability.
- reuse_strategy: extend the existing `sync-package-assets.js` write owner and its existing
  `package-build-test.js`; do not raise the reviewed payload baseline or create another generator.
- risks: normalization must remain text-only and must not mutate source files; existing sync already
  reads and writes these assets as UTF-8 strings.
- context_graph_impact: `none`; this is direct CRI-17/CRI-H05 evidence for the existing cross-host
  determinism invariant.
- required_next_step: normalize generated UTF-8 text to LF, assert LF-only generated outputs, rerun
  package/release checks, then retry the explicitly authorized Copilot installation.
