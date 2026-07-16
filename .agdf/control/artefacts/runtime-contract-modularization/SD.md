# SD: Runtime Contract Modularization

## Architecture

### Module Files

Create 7 files under `plugin/meta/contracts/`. Each file starts with `# AGDF Runtime Contract — <Name>` as the H1 heading. Original `##` and `###` section headings are preserved exactly so the integrity checker's `includes()` and `sectionAfterHeading()` regex checks work against concatenated module content.

Content is moved verbatim from the monolith — no wording changes, no section merges beyond what the PRD defines.

### Manifest

`plugin/meta/agdf-runtime-contract.md` becomes a ~20-line file:
- `# AGDF Runtime Contract` heading preserved
- One-sentence description
- Markdown table listing modules, paths, and coverage
- Closing paragraph referencing `docs/`, constitution, and tenets

### Integrity Checker Changes (`check-runtime-integrity.mjs`)

1. Add `contractsDir` and `contractModules` array after `runtimeContractPath`
2. Add `readAllContracts()` function that reads all 7 modules and joins with `\n\n`
3. Replace both `read(runtimeContractPath)` assignments for content checking with `readAllContracts()`
4. Update skill reference check: `../../meta/agdf-runtime-contract.md` → `../../meta/contracts/`
5. Update gate-check SoT string check: `"The canonical gate order and transition model live only in the Runtime Contract"` → `"The canonical gate order and transition model live only in \`../../meta/contracts/gate-transition.md\`"`
6. Update German-pattern check: read all contracts instead of monolith
7. Keep `assertFile(runtimeContractPath, "runtime contract")` — manifest still exists

### Sync Script Changes (`sync-package-assets.js`)

1. `syncRuntimeContract()`: after writing manifest to generated surfaces, loop through 7 contract modules, apply skill-name transforms and locale-path replacement, write to `generatedSkillsRoot/contracts/` and `generatedOpenCodeRoot/contracts/`
2. `syncSkill()`: add `.replaceAll("../../meta/contracts/", `../contracts/`)` before existing `agdf-runtime-contract.md` replacement
3. `writeOpenCodeSkill()`: add `.replaceAll("../../meta/contracts/", `../../contracts/`)` before existing replacement

### Installer Changes (`create-agdf.js`)

1. `codexPluginFiles`: add 7 `join("plugins", "agdf", "meta", "contracts", "<module>.md")` entries after `agdf-tenets.md`
2. `copilotSkillFiles`: add 7 `join(".github", "skills", "contracts", "<module>.md")` entries
3. `openCodeFiles`: add 7 `join(".opencode", "contracts", "<module>.md")` entries
4. `globalOpenCodeConfigPaths`: add `contracts: join(configDir, "contracts")`
5. `assertGlobalOpenCodeSurfaceWritable`: add contract module checks
6. `installOpenCodeGlobalSurface`: read generated modules, prepend ownership marker, write to `paths.contracts/<module>.md`
7. `evaluateGlobalOpenCodeSurface`: count contract modules, include in `complete` check

### Negative Test Changes (`runtime-integrity-negative-test.js`)

1. Add `interactionContractPath` pointing to `fixtureRoot/plugin/meta/contracts/interaction.md`
2. Replace all `runtimeContractPath` modifications that target interaction content with `interactionContractPath`

### Verified-Change Test Changes (`verified-change-test.js`)

1. Change `readFileSync(join(repoRoot, "plugin", "meta", "agdf-runtime-contract.md"))` to `readFileSync(join(repoRoot, "plugin", "meta", "contracts", "modes.md"))` since `verified_change` content is in `modes.md`

### Smoke Test Changes (`smoke-test.js`)

1. Update `transitionContractPaths` to point to `contracts/interaction.md` in all three generated surfaces instead of the manifest

### Agent Router Changes (`agdf-agent-router.md`)

1. Replace `agdf-runtime-contract.md` reference with a list of `meta/contracts/` modules

### Skill Changes (9 files)

Each skill's `## Runtime Contract` section:
- Replace `Use `../../meta/agdf-runtime-contract.md` for ...` with bullet list of specific module references
- Update in-context `../../meta/agdf-runtime-contract.md` references to specific module paths
- Update "Runtime Contract" prose references to specific module names

### SOT_REGISTRY Update

- Runtime contracts SoT: `plugin/meta/agdf-runtime-contract.md` → `plugin/meta/contracts/`

### CONTEXT_GRAPH Update

- Update node refs in CG-RUN-STATUS-CARD, CG-DELIVERY-PATH-SEARCH, CG-DOCUMENTATION-CEREMONY-BOUNDARY, CG-NATIVE-INTERACTION-AUTHORITY to point to specific modules where applicable

## Ownership

| Component | Owner file |
|---|---|
| Module content | `plugin/meta/contracts/*.md` |
| Manifest | `plugin/meta/agdf-runtime-contract.md` (thin index) |
| Integrity validation | `plugin/scripts/check-runtime-integrity.mjs` |
| Surface propagation | `create-agdf/scripts/sync-package-assets.js` |
| Installation | `create-agdf/bin/create-agdf.js` |
| Skill references | `plugin/skills/*/SKILL.md` |

## Regression Strategy

1. `check-runtime-integrity.mjs` — 0 findings
2. `runtime-integrity-negative-test.js` — all negative tests pass
3. `sync-package-assets.js` — contracts directory appears in all generated surfaces
4. `smoke-test.js` — full smoke passes
5. `git diff --check` — no whitespace errors
