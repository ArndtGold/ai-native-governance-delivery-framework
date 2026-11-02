# Solution Design: Release-Built Plugin Runtime Distribution

Status: approved
Gate: SD
Date: 2026-07-18
Derived from: approved `PRD.md`
Gate approval: `Approval: SD` provided on 2026-07-18 after same-run, same-gate, revision-4 and
durable-artefact revalidation.

## 1. Design Summary

Separate the canonical source plugin from the built and installed plugin without adding a new runtime
owner:

```text
plugin/ source (no runtime)
  + create-agdf runtime owners
          |
          v
sync-package-assets / prepack
          |
          v
create-agdf/generated/plugins/agdf/ (complete built plugin)
          |
          v
@agdf/cli codex | claude
          |
          v
AGDF-owned durable local marketplace/plugins/agdf (complete installed source)
```

OpenCode continues to use its exact config-local `create-agdf` package. Gate evaluation and runtime
command semantics are unchanged.

## 2. Ownership Model

| Concern | Canonical owner | Derived consumer |
|---|---|---|
| Plugin skills, contracts, hooks and metadata | `plugin/` excluding `runtime/` | generated and installed plugin |
| Validator implementation | focused modules under `create-agdf/lib/` | generated runtime payload |
| Runtime payload composition | `create-agdf/scripts/sync-plugin-runtime.js` | built plugin `runtime/` |
| Complete plugin build | `create-agdf/scripts/sync-package-assets.js` | npm package `generated/plugins/agdf/` |
| Durable marketplace staging | new focused installer module under `create-agdf/lib/installers/` | Codex and Claude host adapters |
| Host command sequencing | `plugin-installers.js` | Codex/Claude CLI processes |
| Package publication | `.github/workflows/publish-agdf.yml` | npm registry |

No evaluator, gate table or runtime source is authored beneath `plugin/`, generated output or the
durable marketplace.

## 3. Source And Build Layout

### 3.1 Source layout

- Add `plugin/runtime/` to `.gitignore` and remove any source-mode expectation for that directory.
- Runtime Integrity in source mode rejects a present generated runtime rather than requiring it.
- `plugin/` remains a valid canonical source layout without being directly installable as an offline
  full plugin.

### 3.2 Build layout

Refactor `syncPluginRuntime` so `outputRoot` is mandatory and cannot resolve to source
`plugin/runtime/`. `sync-package-assets` performs this order:

1. refresh the generated plugin from canonical `plugin/` sources;
2. remove stale generated plugin content that no longer exists in source;
3. generate runtime directly into `create-agdf/generated/plugins/agdf/runtime/`;
4. generate package-local Codex and Claude marketplace manifests that both reference
   `./plugins/agdf`; and
5. validate the complete generated plugin as an installed layout.

Two builds from the same source must be byte-identical. Source files are never modified by package
build or prepack.

### 3.3 Package contents

The existing `create-agdf/package.json` `files` list retains `generated`. CI must inspect the actual
tarball file list, not merely trust the `prepack` exit status, and assert the plugin manifest,
runtime manifest, local entrypoint and focused payload are present exactly once.

## 4. Durable Local Marketplace

Add a shared staging module with injected filesystem root for deterministic tests. The default data
root is a cross-platform AGDF-owned user-data directory resolved by one helper; it must not use the
current repository or npm cache. Beneath it, maintain one stable marketplace root:

```text
<agdf-data>/marketplaces/agdf/
  .agdf-owned.json
  .agents/plugins/marketplace.json
  .claude-plugin/marketplace.json
  plugins/agdf/
```

The ownership manifest contains schema version, marketplace ID `agdf`, AGDF version, plugin digest,
source package version and staging state. Both marketplace manifests use stable name `agdf`; Codex
uses the canonical local-source object with policy/category fields, while Claude uses its supported
local source string. The plugin path is `./plugins/agdf` in both cases.

### 4.1 Atomic staging transaction

1. Resolve the complete built plugin under package `generated/`.
2. Copy it to a unique sibling staging directory using argument-safe filesystem APIs.
3. Write both marketplace manifests and ownership manifest.
4. Validate manifest version, runtime digest, plugin structure and marketplace references in stage.
5. If the stable root is absent, rename stage into place.
6. If the stable root is owned, rename it to a unique backup and rename stage into place.
7. Keep the backup until host marketplace registration, plugin installation and version verification
   succeed; then remove it.
8. On failure, remove the new owned root if safe and restore the backup. If rollback cannot be proven,
   retain both paths, report a blocking lifecycle result and delete neither.

Unowned stable roots, invalid ownership markers and path escapes block before mutation. An already
matching version/digest is idempotent and performs no copy or rotation.

## 5. Host Marketplace Migration

Host adapters receive a prepared staging transaction plus injected command executor. They inspect
marketplace state before changing it.

### 5.1 Common classification

Classify marketplace `agdf` as exactly one of:

- `absent`;
- `owned_local_current` — points to the stable AGDF root;
- `legacy_github` — points exactly to the known AGDF GitHub repository;
- `conflict` — same name with any other source; or
- `unknown` — state cannot be parsed.

Only `absent`, `owned_local_current` and exact `legacy_github` are mutable. `conflict` and `unknown`
fail closed without marketplace removal.

### 5.2 Codex sequence

Use JSON-capable host commands and literal argument vectors:

1. `codex plugin marketplace list --json`;
2. for exact legacy source only, `codex plugin marketplace remove agdf --json`;
3. when absent after classification, `codex plugin marketplace add <stable-root> --json`;
4. `codex plugin add agdf --marketplace agdf`;
5. `codex plugin list` and exact-version verification.

Local marketplaces are not passed through Git-only `marketplace upgrade`. If registration or plugin
verification fails after removing the legacy source, rollback re-registers the exact previous source
and restores the prior staged root where available.

### 5.3 Claude sequence

Use user scope and literal argument vectors:

1. `claude plugin marketplace list --json`;
2. for exact legacy source only, `claude plugin marketplace remove agdf --scope user`;
3. when absent after classification, `claude plugin marketplace add <stable-root> --scope user`;
4. `claude plugin marketplace update agdf`;
5. install or update `agdf@agdf` based on current plugin list;
6. verify exposed version when available and retain the existing explicit degraded result when the
   host does not expose a version.

Rollback restores the exact prior marketplace source and staged root. It never removes plugin data
or unrelated scopes.

### 5.4 Existing installations

No background migration occurs. Existing GitHub marketplace installations remain unchanged until
the user explicitly reruns `npx --yes @agdf/cli@latest codex` or `claude`. The lifecycle card reports
`install` or `update`, exact expected/installed version, migration status and restart requirement.

## 6. Publish Workflow

Update `Publish AGDF packages` so both validate and publish jobs explicitly run canonical package
sync before package integrity and tarball checks. The validate job must:

1. assert source `plugin/runtime/` is absent;
2. run source-mode Runtime Integrity;
3. build package assets;
4. run installed-layout Runtime Integrity against the generated plugin;
5. run aggregate smoke and skill evals; and
6. create a dry-run tarball and assert required built-plugin paths.

The publish job runs the same build immediately before `npm publish`. `prepack` remains a redundant
safe guard. Workflow permissions remain read-only for repository contents; no commit, branch update
or tag rewrite is allowed.

## 7. Integrity Modes

Runtime Integrity gains explicit layout expectations:

| Mode | Runtime expectation |
|---|---|
| source repository | `plugin/runtime/` absent; canonical source and generator owners present |
| generated package plugin | runtime required; version/digest/focused payload valid |
| installed durable plugin | same runtime requirements plus valid marketplace ownership evidence where invoked by installer tests |

Negative tests independently cover source runtime presence, generated runtime absence, mismatch,
digest corruption, installer/scaffold leakage, invalid marketplace references and ownership-marker
tampering.

## 8. Failure And Recovery

- Build failure: package publication stops; source tree remains unchanged.
- Invalid source/runtime version parity: generator stops before package creation.
- Unowned durable root: installer stops without overwrite.
- Marketplace name conflict: installer stops without removal.
- Host add/install failure: restore prior marketplace source and staged root; report both primary and
  rollback outcomes.
- Process interruption: next run recognizes owned stage/backup markers and either completes or
  restores deterministically; it never guesses from directory names alone.
- Wrong installed version: lifecycle verification is degraded/failed and restart success is not
  claimed.

## 9. Security And Compatibility

- All paths are resolved and containment-checked before copy, rename or cleanup.
- No shell interpolation, recursive deletion of unresolved paths or use of ephemeral package roots.
- User marketplace/config files are modified only through host CLI commands.
- Existing explicit OpenCode permissions and repository activation remain untouched.
- Plugin ID, marketplace name, public bootstrap commands, skills, hooks and gate semantics remain
  compatible.
- Host local-path support is verified from the installed Codex and Claude CLI command contracts;
  tests still inject executors and never mutate a developer's real marketplace.

## 10. Planned Module Changes

| Module | Change |
|---|---|
| `.gitignore` | exclude source `plugin/runtime/` |
| `sync-plugin-runtime.js` | mandatory safe output root; no source default |
| `sync-package-assets.js` | build runtime directly into generated plugin and remove stale output |
| new local-marketplace installer module | durable root, manifests, ownership, transaction and rollback |
| `plugin-installers.js` | marketplace classification, legacy migration and host sequencing |
| Runtime Integrity | separate source and generated/installed expectations |
| publish and guardrail workflows | explicit build plus package/installed-layout verification |
| lifecycle/package/smoke tests | source/build/install, migration, rollback and offline command evidence |
| installation/release docs | built-plugin distribution and explicit rerun migration |

## 11. Acceptance Traceability

| PRD criterion | Design evidence |
|---|---|
| AC-01 | Sections 3 and 7 |
| AC-02 | Sections 3.3 and 6 |
| AC-03 | Sections 4 and 5 |
| AC-04 | Sections 5 and 8 |
| AC-05 | Sections 6, 7 and planned tests |

## 12. Superseded Evidence Boundary

The prior run's interaction, Compact Delivery and OpenCode boundary implementation remains in scope
and does not need redesign. Its Codex/Claude runtime source layout, installer evidence, clean review
and QA decision must be reconciled after this design is implemented. No prior exact QA approval is
being overridden.

## 13. Next Step

Derive the Task and Test Plan. Implementation remains forbidden until exact TP approval and the
mandatory pre-implementation Brownfield Analysis pass.
