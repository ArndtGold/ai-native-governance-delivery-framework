# SD: Dual-Layout Runtime-Integrity Validation

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided in session on 2026-07-16
Date: 2026-07-16
Owner: agent
Derived from: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/PRD.md`

## 1. Design Summary

Keep one canonical integrity implementation in `plugin/scripts/check-runtime-integrity.mjs`. Add a
small fail-closed layout resolver at the top of that script and divide existing assertions into a
common plugin-owned phase plus a source-repository-only phase. No second validator, generated
fixture tree or runtime dependency is introduced.

## 2. Layout Resolution

The script first derives `scriptPluginRoot` from `import.meta.url` (`..` from
`scripts/check-runtime-integrity.mjs`). It then resolves the validation target as follows.

### Default execution

1. Inspect the parent of `scriptPluginRoot` as a potential source repository.
2. Select `source` only when `<parent>/plugin` resolves to `scriptPluginRoot` and all stable
   source-layout markers exist.
3. Otherwise inspect `scriptPluginRoot` as an installed plugin root.
4. Select `installed` only when all stable plugin-layout markers exist.
5. Otherwise exit with one `AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID` diagnostic before reading skill
   or contract directories.

### Explicit override

When `AGDF_RUNTIME_INTEGRITY_ROOT` is set, classify that exact path:

- if `<root>/plugin` has the plugin markers and the root has the source markers, use `source`;
- if `<root>` has the plugin markers, use `installed`;
- if both or neither classification is valid, fail closed with the same stable diagnostic.

The override therefore identifies a validation root rather than forcing a mode.

## 3. Stable Markers

Plugin-layout markers:

- `.codex-plugin/plugin.json`
- `.claude-plugin/plugin.json`
- `meta/agdf-plugin.definition.json`
- `meta/agdf-runtime-contract.md`
- `skills/`
- `control/`
- `hooks/hooks.json`
- `scripts/check-runtime-integrity.mjs`

Source-layout markers add:

- `.claude-plugin/marketplace.json`
- `agdf/package.json`
- `create-agdf/package.json`
- `pages/package.json`
- `LICENSE`

Marker checks use filesystem type checks and real path equality where identity matters. Directory
traversal happens only after successful classification, preventing the current raw `ENOENT` crash.

## 4. Validation Phases

### Common plugin phase

Run in both modes:

- Runtime Contract index and seven modules
- canonical plugin definition and locale registry
- Codex and Claude manifests
- router, hooks, SessionStart script and assets
- skill-set identity, frontmatter, help files and contract references
- control scaffold and artefact templates
- plugin license presence
- interaction, approval, mode and quality invariants already enforced by the checker

### Source repository phase

Run only in `source` mode:

- root marketplace entry
- root/plugin license byte parity
- `@agdf/cli`, `create-agdf` and Pages package-version alignment
- Pages skill/version/copy invariants
- asset-sync and canonical CLI owner checks
- OpenCode npm plugin owner checks
- active repository control-state reconciliation

The common phase retains canonical-definition-to-manifest checks, so installed mode still detects
version, metadata and declared-surface drift inside the shipped artifact.

## 5. Test Design

Add `create-agdf/scripts/runtime-integrity-layout-test.js`:

1. Copy canonical `plugin/` to a temporary installed-plugin directory.
2. Execute its copied checker without an override and expect an installed-mode pass.
3. Execute it with `AGDF_RUNTIME_INTEGRITY_ROOT` pointing to the plugin root and expect a pass.
4. Remove one required contract module and expect the stable missing-invariant failure.
5. Stage only the script in a partial tree and expect `AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID`, not
   an uncaught filesystem exception.
6. Execute the source checker with the source repository override and expect a source-mode pass.

Wire the test into `create-agdf/package.json` before the broader negative integrity suite. Existing
negative tests remain the detailed source-mode invariant regression owner.

## 6. Output And Compatibility

- Preserve `[agdf-runtime-integrity] FAIL` and the existing invariant messages.
- Successful output may add `mode=source|installed` while retaining skill/control counts.
- Layout errors use the stable `AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID` code and identify the rejected
  root without dumping unrelated environment data.
- No CLI command, gate schema, approval behavior or generated repository artifact changes.

## 7. Security And Side Effects

- Validation remains read-only.
- Tests mutate only fresh temporary directories and remove them in `finally`.
- Root resolution never searches arbitrary ancestors; it checks only the explicit root or the
  script plugin root and its direct parent.
- Symlinked roots are normalized before identity comparison to avoid ambiguous classification.

## 8. Rejected Alternatives

- Separate installed validator: rejected as a second policy owner.
- Make every repository-only file optional: rejected because source validation could silently
  weaken.
- Require callers to always set an environment variable: rejected because the shipped checker
  should work directly from its own installed location.
- Package a synthetic repository around the installed plugin: rejected because it would test a
  layout users do not receive.

## 9. Next Step

Review and approve the derived Task/Test Plan. Implementation remains forbidden until the exact TP
approval is persisted and the pre-implementation Brownfield Analysis passes.
