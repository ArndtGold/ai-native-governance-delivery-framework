# Task Plan: Global Native OpenCode Surface

## Scope

Implement the approved global native OpenCode skill surface as a generated adapter of canonical AGDF skills. Preserve repository-local `.opencode/` and `.agdf/control/` authority, existing command shapes and the `instruction_only` capability classification unless independent enforcement evidence is proven.

## Tasks

| task_id | Task | Owner | Evidence / acceptance |
|---|---|---|---|
| OGS-01 | Verify the installed OpenCode global skill directory, instruction loading, project/global collision behavior and discovery behavior using an isolated `OPENCODE_CONFIG_DIR`. | agent | Runtime probe captures the supported global paths and runtime precedence; the collision-safe namespace is recorded before implementation. |
| OGS-02 | Define the canonical global ownership marker, expected generated file set and safe update behavior for AGDF-owned global files. | agent | Marker/path contract is encoded in the generator and tests; unrelated or unmarked files are preserved. |
| OGS-03 | Extend the canonical OpenCode asset synchronizer to render global `AGDF.md`, `agdf-runtime-contract.md` and nine global `skills/agdf-global-*/SKILL.md` adapters from `plugin/**`. | agent | Global assets contain valid OpenCode frontmatter, canonical content, boundary preamble and valid Runtime Contract references. |
| OGS-04 | Extend the existing `opencode` global installer to install/update the global native skill surface and instruction path alongside the npm plugin without adding a public command or parameter. | agent | Isolated install produces plugin, global instructions, Runtime Contract and all nine owned skills; existing config entries are preserved. |
| OGS-05 | Add global fail-closed routing text that distinguishes global discoverability from repository governance and directs missing repositories to `opencode-repo`. | agent | Global `AGDF.md` and global `agdf-global-gate-check` explicitly require local `.opencode/` and `.agdf/control/` evidence before governance application. |
| OGS-06 | Extend `opencode-status --json` with additive global-native-surface fields for path, instruction/contract files, expected/actual counts, presence and completeness while preserving schema-v1 fields and aliases. | agent | Status fixtures cover complete, incomplete, missing and repository-present states; existing consumers remain compatible. |
| OGS-07 | Preserve global configuration and permission boundaries, adding only AGDF-owned instruction/plugin/skill entries and never silently broadening `edit` or `bash`. | agent | Config-preservation tests cover unrelated plugins, instructions, permission rules and user-owned global skills. |
| OGS-08 | Keep `create-agdf/opencode-plugin.js` as lifecycle/status/compaction adapter only and verify it does not become a second gate or global skill policy owner. | agent | Source/probe evidence shows no duplicate gate calculation and correct separation of global hook, global skills and repository surface. |
| OGS-09 | Extend runtime-integrity checks and package smoke tests for global asset counts, ownership markers, relative references, discovery, migration safety, status separation and capability classification. | agent | Focused and aggregate tests pass; canonical/global/repository generated surfaces remain aligned. |
| OGS-10 | Run bounded installed-runtime probes for global `opencode debug skill`, project/global collision avoidance and repository activation; do not upgrade enforcement capability from discovery evidence. | agent | Nine `agdf-global-*` skills discover alongside canonical local skills without masking; `capabilities.js` remains `instruction_only` with explicit evidence. |
| OGS-11 | Update `INSTALL.md`, `create-agdf/README.md`, Pages copy and CLI output to explain global native skills, repository activation and status fields without claiming global governance. | agent | Documentation and generated help match the implemented global/repository boundary. |
| OGS-12 | Assemble implementation evidence and run final integrity checks for TP Review, Clean Implementation Review, Code Review and QA. | agent | Task-to-evidence map, `doctor --json`, runtime integrity, package smoke tests, Pages checks and `git diff --check` are recorded. |

## Dependencies

`OGS-01` and `OGS-02` precede OGS-03 through OGS-07. OGS-03 is the canonical generator prerequisite for OGS-04, OGS-05 and OGS-09. OGS-06 and OGS-07 must preserve existing schema/config behavior. OGS-08 is independent but must remain bounded. OGS-10 depends on OGS-04 and OGS-05. OGS-11 depends on the final behavior. OGS-12 closes the evidence chain.

## Constraints

- Do not change shared AGDF gate semantics or the Runtime Contract's normative model.
- Do not create global `.agdf/control/` state or a second policy/router owner.
- Do not overwrite unrelated global OpenCode files.
- Do not add a new public command or required parameter.
- Do not claim `tool_enforced` from global skill discovery or permissions alone.
- Do not commit, push, open a PR or release.

## Required review path

Run `pre_implementation_analysis` Brownfield Analysis against this approved TP before CD+Tests. After implementation run TP Review, Clean Implementation Review, Code Review and QA Gate before UAT and delivery closeout.

## Traceability

- derived_from: `UR.md`, `BROWNFIELD_REVIEW.md`, `PRD.md`, `SD.md`
- canonical owners: `plugin/skills/**`, `plugin/meta/agdf-runtime-contract.md`, `plugin/meta/agdf-plugin.definition.json`
- implementation owners: `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/sync-package-assets.js`, `create-agdf/scripts/smoke-test.js`, `plugin/scripts/check-runtime-integrity.mjs`, documentation owners
- capability invariant: existing Delivery Path Search OpenCode classification remains `instruction_only`

## Approval

- `Approval: TP` provided on `2026-07-13`.
