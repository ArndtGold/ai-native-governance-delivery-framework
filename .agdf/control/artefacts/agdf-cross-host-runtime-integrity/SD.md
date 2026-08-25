# SD: Cross-Host Plugin Runtime Integrity

Status: approved; revision 2  
Gate: SD  
Gate approval: approved by exact `Approval: SD` on 2026-08-25 after same-run, same-gate and revision-2 revalidation.  
Based on: approved `PRD.md`  
Date: 2026-08-25  
Owner: agent

## 1. Solution Overview

Remove both runtime-free source-repository marketplaces as installable plugin sources. Keep `plugin/` as
canonical editable source only. Every executable Codex and Claude Code installation continues to be
built by the existing package pipeline and staged through the single AGDF-owned durable marketplace.
OpenCode continues to use its existing config-local package.

Add one distribution-profile contract and one installation-provenance record to the existing
metadata and installer owners. Extend the existing local-validator resolution envelope so a runtime
invoked from the effective plugin root can prove its profile, evidence plane, version and digest.
The shared SessionStart hook exposes a compact result from that same probe. It does not implement a
second validator.

```text
plugin/ source (editable, non-installable, no runtime)
            |
            v
sync-package-assets + sync-plugin-runtime
            |
            v
generated/plugins/agdf (complete runtime-bearing bundle)
            |
            v
local-marketplace transaction + installation provenance
            |
      +-----+-----+
      |           |
      v           v
 Codex cache   Claude plugin root
      |           |
      +-----+-----+
            |
            v
shared agdf-local resolve probe + host-native loaded-root evidence

OpenCode config-local package -> existing shared validator application
Portable Skills-only profile -> agent-native path, no local validator claim
```

No runtime is copied into individual skills. A skill resolves the runtime relative to its enclosing
installed plugin. Host-specific code is limited to native root evidence, lifecycle invocation and
presentation.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design action |
|---|---|---|
| Product, surface and distribution profile metadata | `plugin/meta/agdf-plugin.definition.json` | Add normalized profile declarations; remove the installable repository-marketplace declaration. |
| Editable plugin source | `plugin/` excluding `runtime/` | Preserve as non-installable source. |
| Complete plugin composition | `create-agdf/scripts/sync-package-assets.js` | Continue to copy source and generate one runtime-bearing bundle. Stop writing the root repository marketplace. |
| Validator payload composition | `create-agdf/scripts/sync-plugin-runtime.js` | Preserve one focused runtime payload and deterministic runtime digest. |
| Local validator resolution | `create-agdf/lib/runtime/local-validator.js` and generated `runtime/agdf-local.js` | Extend the existing resolution envelope with profile and provenance evidence. |
| Durable marketplace and installation provenance | `create-agdf/lib/installers/local-marketplace.js` | Stage one complete plugin, write and validate one marker, preserve ownership, atomic promotion and rollback. |
| Codex and Claude lifecycle | `create-agdf/lib/installers/plugin-installers.js` | Preserve host commands; add post-install profile/provenance verification and explicit restart state. |
| Repository lifecycle state | `create-agdf/lib/lifecycle/operations.js` and `status.js` | Stop treating root marketplace presence as active AGDF; retain legacy selector recognition only for safe cleanup. |
| OpenCode executable profile | `create-agdf/lib/installers/opencode.js` | Preserve the config-local package and current exact-version checks. |
| Runtime Integrity policy | `plugin/scripts/check-runtime-integrity.mjs` | Assert source non-installability, profile coherence and installed provenance without duplicating validator semantics. |
| Session activation feedback | `plugin/hooks/session-start.sh` | Invoke the existing local resolve probe from the loaded plugin root and render its compact result. |
| Portable public profile | `create-agdf/lib/public-plugin/` and `plugin/submission/openai/` | Preserve runtime-free packaging and explicit agent-native boundary. |

Generated bundles, installed caches, host adapters and individual skills remain derived consumers.
None becomes a second source of validator or gate semantics.

## 3. Architecture Decisions

### AD-1: Remove the repository marketplace instead of repairing it

Delete the root `.agents/plugins/marketplace.json` and `.claude-plugin/marketplace.json`. Stop
generating the former through `createRepositoryCodexMarketplace`; the latter is no longer a source
repository marketplace owner. Remove the active source-repository marketplace declaration from the
canonical plugin definition. A fresh source checkout therefore cannot advertise `plugin/` or an
ignored, not-yet-generated directory as an installable runtime-bearing plugin on either Codex or
Claude Code.

Contributor discovery remains through repository instructions and the existing explicit
`npm run install:codex`, `npm run install:claude` and `npm run install:opencode` workflows. Codex and
Claude Code receive the complete generated plugin only through the durable marketplace owned by
`local-marketplace.js`.

The package-generated, runtime-complete Codex repository projection remains supported for explicit
`codex-repo` scaffolding and keeps identity `agdf-repo`. Therefore `agdf@agdf-repo` is current only
when a target repository actually contains that generated complete marketplace. The source checkout
no longer contains one. Existing file-presence selection remains valid only with Runtime Integrity
proof that any present generated repository marketplace targets the complete bundled plugin.

Rejected alternatives:

- Point the repository marketplace to `plugin/`: rejected because source intentionally has no
  runtime.
- Point it to ignored generated output: rejected because a fresh checkout would advertise a missing
  or stale target before preparation.
- Add runtime to `plugin/`: rejected because it collapses source and generated authority and reopens
  the completed runtime-distribution architecture.

### AD-2: One canonical distribution-profile contract

Extend `agdf-plugin.definition.json` with a versioned `distributionProfiles` section. It declares
only stable product semantics:

| profile_id | runtime expectation | installable | machine evidence |
|---|---|---|---|
| `source-development` | absent | no | unavailable from source itself |
| `runtime-plugin` | required shared payload | yes through owned marketplace | local exact-version and digest required |
| `opencode-config-local` | required config-local package | yes through existing OpenCode lifecycle | local exact-version required |
| `portable-skills` | absent | yes as declared portable content | unavailable or externally required |

The contract does not encode host paths, cache locations or commands. Those remain adapter concerns.
The generated plugin definition and portable candidates are projections of the same declaration.

### AD-3: One non-self-referential installation-provenance marker

Generalize the current local-development marker into `.agdf-installation.json` at the staged plugin
root. The marker is written by `local-marketplace.js` for canonical and local-development
installations and copied by the host into its cache or plugin root.

Required fields:

```text
schema_version
owner = create-agdf
profile_id = runtime-plugin
marketplace_id = agdf
canonical_version
codex_install_version
source_digest
runtime_digest
```

`source_digest` is calculated from normalized plugin content while excluding the marker and
normalizing the allowed Codex development-version projection to the canonical version. This avoids a
self-referential digest. `runtime_digest` must equal the existing runtime manifest digest. The outer
marketplace ownership marker continues to store the full staged plugin digest for transaction and
tamper checks.

The existing `.agdf-local-install.json` format is accepted only as migration input for already
owned local-development installations. A successful explicit reinstall writes the canonical new
marker. No cache is migrated in place.

### AD-4: Extend the existing resolve envelope, do not create a status engine

`resolveLocalValidator` keeps its existing machine-validation values and registry-free behavior. Its
additive envelope fields are:

```text
distribution_profile
evidence_plane
canonical_version
plugin_version
runtime_digest
source_digest
plugin_root
provenance_status
```

For an installed `runtime-plugin`, the resolver reads the adjacent plugin definition, runtime
manifest, Codex or Claude manifest and installation marker. It recomputes the runtime digest and
normalized source digest. `owned_version_matched` is returned only when all applicable values agree.
Missing or inconsistent installed provenance returns the existing fail-closed unavailable or
version-mismatch class plus one stable reason code.

For a generated bundle without an installation marker, the same runtime can validate the bundle but
labels `evidence_plane = generated_bundle`; it cannot claim installed or loaded-host health. For
OpenCode, the existing package resolution labels `opencode_config_local`. Portable profiles never
discover or download a validator automatically.

Absolute `plugin_root` is local diagnostic evidence. It must not be persisted into portable
artefacts, public telemetry or repository control state.

### AD-5: Loaded-session evidence comes from the loaded plugin itself

The shared SessionStart hook derives its plugin root from its own script location. On Claude Code it
also compares that root with `${CLAUDE_PLUGIN_ROOT}` when the variable is present. It invokes:

```text
node <observed-plugin-root>/runtime/agdf-local.js --resolve-only --json
```

The hook renders one compact, deterministic line containing profile, canonical or install version,
provenance status and machine-validation availability. A successful installation that has not been
loaded by a fresh session remains `restart required` in lifecycle output and has no loaded-session
proof.

Probe failure never triggers registry access or a cache edit. It tells the agent that machine
validation is unavailable or mismatched and points to the existing surface install/update command.
Agent-native work may continue only where the gate-check contract permits it.

### AD-6: Host adapters stay thin

- Codex: the effective root is the cache/plugin root from which the SessionStart hook and runtime are
  executing. Codex-specific lifecycle code verifies the installed selector and version, then reports
  restart required.
- Claude Code: the effective root is the executing plugin root, cross-checked with
  `${CLAUDE_PLUGIN_ROOT}` when available. Claude-specific lifecycle code preserves its current
  version-unavailable degraded state.
- OpenCode: the existing config-local package and runtime-context hook remain authoritative. Only
  additive profile labels are shared.

Adapters must not contain approval validation, gate tables, runtime payload copies, profile-policy
fallbacks or duplicated digest algorithms. Shared digest and profile evaluation helpers live beside
the existing runtime and installer owners and are tested directly.

### AD-7: Status is a layered evidence projection

Lifecycle and status output distinguish these planes:

1. source checkout;
2. generated complete bundle;
3. registered durable marketplace;
4. installed cache or plugin root;
5. fresh loaded session.

Each plane reports `healthy`, `degraded`, `unverified`, `not_applicable` or `restart_required` as
appropriate. A lower plane cannot promote a higher plane. The current general status owner consumes
these results; no second status file or host-specific state store is introduced.

## 4. Integration Points

| Integration point | Required change |
|---|---|
| `.agents/plugins/marketplace.json` | Delete the runtime-free repository marketplace projection. |
| `.claude-plugin/marketplace.json` | Delete the runtime-free Claude Code source-repository marketplace projection. |
| `plugin/meta/agdf-plugin.definition.json` | Add versioned distribution profiles; remove current repository-marketplace ownership metadata. |
| `create-agdf/lib/public-plugin/manifest.js` | Remove repository marketplace rendering; preserve Codex, Claude and portable manifest generation. |
| `create-agdf/scripts/sync-package-assets.js` | Stop rewriting the root marketplace; keep complete generated plugin and package-local marketplace generation. |
| `create-agdf/lib/installers/local-marketplace.js` | Write and validate canonical installation provenance; migrate legacy local marker only through explicit reinstall. |
| `create-agdf/lib/runtime/local-validator.js` | Validate adjacent profile, manifests, marker, normalized source digest and runtime digest; emit additive provenance fields. |
| generated `runtime/agdf-local.js` | Pass the observed plugin root to the existing resolver. |
| `plugin/hooks/session-start.sh` | Emit compact loaded-root integrity orientation from the existing resolve probe. |
| `create-agdf/lib/installers/plugin-installers.js` | Verify post-install provenance and preserve separate restart state. |
| `create-agdf/lib/lifecycle/operations.js` | Preserve generated complete `agdf@agdf-repo` selection when a valid repository marketplace exists; otherwise use durable `agdf@agdf`. |
| `create-agdf/lib/lifecycle/status.js` | Treat source-repository marketplace absence as normal while preserving generated complete repository activation and layered installation evidence. |
| `plugin/scripts/check-runtime-integrity.mjs` | Replace source-marketplace-presence assertions with source-non-installability and profile/provenance invariants. |
| focused build, installer, lifecycle and integrity tests | Add positive and negative profile, provenance, shadowing, migration and evidence-plane coverage. |
| contributor and installation documentation | Point source contributors to explicit local install commands and document restart/fresh-session proof. |

Generated files are refreshed only through the existing canonical sync commands. No manual edit to a
generated bundle or installed cache is part of implementation.

## 5. Constraints And Compatibility

- Gate semantics, exact approval values and the AGDF Runtime Contract are unchanged.
- The focused validator payload remains generated once from `create-agdf`; individual skills never
  carry runtime copies.
- Existing durable marketplace ID `agdf`, ownership checks, atomic promotion and rollback remain
  authoritative.
- Existing Codex `+codex.local-<digest>` development projection remains valid only with matching
  owned provenance.
- Existing public CLI behavior remains unchanged. Source contributors use the already approved root
  npm aliases.
- OpenCode config-local installation and public portable package behavior remain compatible.
- No automatic registry fallback, network access, host configuration scraping outside existing
  lifecycle commands or direct cache mutation is introduced.
- A present `agdf-repo` repository projection is current only when it targets the generated complete
  plugin; older or runtime-free registrations are recovery input and are not silently deleted.
- Digest computation, path containment and filesystem ownership checks remain argument-safe and
  cross-platform.
- Direct host evidence is required separately for Codex and Claude Code; one host cannot prove the
  other.

## 6. Test And Evidence Strategy

| Evidence group | Required proof |
|---|---|
| Repository source | Root Codex and Claude Code installable marketplaces are absent; `plugin/runtime/` is absent; source integrity and repository instructions remain healthy. |
| Generated bundle | Complete plugin contains one runtime manifest, one entrypoint, one focused payload and coherent profile metadata. |
| Marketplace transaction | Canonical and local-development stages write valid provenance; unchanged rerun is idempotent; tamper, interruption and rollback fixtures remain fail closed. |
| Repository-marketplace migration | Source sync recreates neither root marketplace; explicit `codex-repo` generation still creates a complete `agdf-repo` projection and lifecycle selection distinguishes it from the absent source projection. |
| Runtime resolution | Exact version, runtime digest, normalized source digest, marker owner and profile pass; each independent mismatch has a stable reason and no executable result. |
| Codex cache fixture | A copied installed plugin resolves from its cache root and reports installed profile and loaded evidence; runtime-free source and stale cache fail. |
| Claude plugin-root fixture | Executing root and `${CLAUDE_PLUGIN_ROOT}` agreement passes; root mismatch, missing marker and version-unavailable behavior remain explicit. |
| OpenCode regression | Existing config-local resolution, permissions, SDK alignment and status suites pass with additive profile labels. |
| Portable profile | Skills-only candidate contains no runtime and reports unavailable or externally required without being classified as corrupt. |
| Evidence planes | Lifecycle and status fixtures prove install success, restart required and fresh loaded state cannot satisfy one another. |
| Full regression | Canonical sync, runtime integrity, lifecycle, package dry run, public candidate, smoke, doctor, delivery map and diff checks pass without weakened assertions. |
| Direct host evidence | Fresh Codex and Claude Code sessions separately show the intended observed root, matching provenance and successful focused `doctor --json`. |

Task Plan must map every `PRD-RI-*` criterion to at least one automated test or direct-host evidence
obligation. Host UAT remains later evidence and is not inferred from fixtures.

## 7. Acceptance Traceability

| PRD criterion | Design owner |
|---|---|
| `PRD-RI-01` | AD-2 and profile-contract tests |
| `PRD-RI-02` | AD-1, Runtime Integrity and negative install-target tests |
| `PRD-RI-03` | AD-1 and legacy migration tests |
| `PRD-RI-04` | AD-4 and AD-6 |
| `PRD-RI-05` | AD-3 and AD-4 |
| `PRD-RI-06` | AD-5 and AD-7 |
| `PRD-RI-07` | AD-2 and portable-profile tests |
| `PRD-RI-08` | AD-3 through AD-7 and lifecycle recovery tests |
| `PRD-RI-09` | AD-7 and evidence-plane matrix |
| `PRD-RI-10` | Constraints and full regression strategy |

## 8. Risks And Open Questions

- Codex may not expose a separate loaded-root environment variable. The executing hook path is the
  authoritative observed root; direct host UAT must confirm that this remains true in the supported
  Codex version.
- Claude Code may invoke hooks through a resolved or copied path. Direct fixture and host evidence
  must confirm the relationship between the executing script and `${CLAUDE_PLUGIN_ROOT}`.
- Removing both source-repository marketplaces changes direct Codex and Claude Code discovery from
  this checkout. Existing explicit local installation plus repository instructions are the intended
  replacement; explicit `codex-repo` scaffolding remains supported only with its complete generated
  plugin. Documentation and fresh-clone tests must make these boundaries explicit.
- Installed provenance is integrity evidence, not a cryptographic signature or host attestation.
  The design must not claim stronger trust.
- The exact stable reason-code names and additive envelope field serialization belong in TP fixtures;
  no product or architecture decision remains open.

## 8.1 Revision 2 Trigger

Implementation-preparation inspection found that root `.claude-plugin/marketplace.json`, like the
Codex root marketplace, points directly to runtime-free `./plugin/`. PRD-RI-02 already requires both
Codex and Claude Code to reject that condition, but SD revision 1 named only the Codex root file.
Revision 2 adds the missing Claude source path and clarifies that package-generated, runtime-complete
`agdf-repo` scaffolding remains a valid distinct consumer. No PRD scope or user intent changes.

## 9. Rejected Parallel Structures

- Per-skill validator runtimes.
- Separate Codex and Claude validator builds.
- A second marketplace or installer implementation for repository development.
- A session-specific runtime state file.
- A hosted validator, MCP validator or automatic registry fallback.
- A second digest algorithm or profile registry outside the canonical metadata and shared helpers.

## 10. Next Step

Review this Solution Design. Approval permits only Task and Test Plan drafting. Implementation
remains forbidden.

Approve only with:

`Approval: SD`
