# Task Plan

## Scope

Implement the approved OpenCode-native AGDF plugin parity slice from the PRD and SD. The canonical AGDF policy remains unchanged; only the OpenCode adapter, generated surface and evidence are in scope.

## Tasks

| task_id | Task | Owner | Evidence / acceptance |
|---|---|---|---|
| OC-01 | Verify the installed/current OpenCode runtime contract for npm plugins, project skills, skill permissions, project agents and config precedence. | agent | Captured runtime probe or authoritative docs; unresolved differences recorded before implementation. |
| OC-02 | Audit existing generated OpenCode agents and repository usage to confirm whether removing agent generation is compatible and define explicit migration behavior. | agent | Search evidence, compatibility decision and migration test boundary. |
| OC-03 | Extend the canonical plugin definition and asset synchronizer to generate OpenCode-native `.opencode/skills/agdf-*/SKILL.md` assets with valid frontmatter and canonical body content. | agent | Generated skills cover the complete canonical skill set; names, descriptions and relative references validate. |
| OC-04 | Rewrite generated `.opencode/AGDF.md` as a thin OpenCode router that invokes `agdf-gate-check` first for new change intent and preserves `.agdf/control/` authority. | agent | Router contains canonical entry rule, no duplicate gate policy and no unprefixed OpenCode routing. |
| OC-05 | Remove the generated-agent-only workflow path from the default OpenCode surface and update package metadata, README/help text and generated-surface expectations. | agent | No parallel generated policy route remains; compatibility decision from OC-02 is honored. |
| OC-06 | Extend generated `opencode.json` permissions to explicitly cover mutating tools and skill loading while preserving existing-config protection and global/repository separation. | agent | Focused config tests show expected `edit`, `bash` and `skill` behavior and no silent overwrite. |
| OC-07 | Keep `create-agdf/opencode-plugin.js` limited to lifecycle/status/compaction responsibilities and align its repository-surface detection and reminder text with the native skill layout. | agent | Plugin unit/probe evidence shows status separation and no duplicated gate calculation. |
| OC-08 | Add or update focused smoke and routing tests for native skill discovery, frontmatter, canonical propagation, permissions, migration, status separation and config preservation. | agent | Focused OpenCode test suite passes; generated assets are checked against canonical sources. |
| OC-09 | Evaluate OpenCode enforcement evidence with a bounded runtime probe; update `capabilities.js` only if a model-independent, reproducible guard is demonstrated. | agent | Probe output and mutation evidence; otherwise classification remains `instruction_only` with explicit rationale. |
| OC-10 | Run package/runtime integrity checks and prepare implementation evidence for Brownfield Analysis, reviews and QA. | agent | `git diff --check`, relevant package smoke tests, runtime integrity and task-to-evidence mapping are recorded. |

## Dependencies

`OC-01` and `OC-02` precede implementation design finalization. `OC-03` through `OC-07` depend on those findings. `OC-08` depends on the generated surface. `OC-09` is independent of native discovery but must not override the fail-closed capability default without evidence. `OC-10` closes the implementation evidence bundle.

## Constraints

- Do not change the shared Runtime Contract or gate semantics in this slice.
- Do not create a second OpenCode policy or router owner.
- Do not claim `tool_enforced` from permissions or skill discovery alone.
- Do not commit, push, open a PR or release.

## Required review path

Before CD+Tests, run `pre_implementation_analysis` Brownfield Analysis against this TP. After implementation, run TP Review, Clean Implementation Review, Code Review and QA Gate before UAT or closeout.

## Traceability

- derived_from: `UR.md`, `BROWNFIELD_REVIEW.md`, `PRD.md`, `SD.md`
- source owners: `plugin/meta/agdf-plugin.definition.json`, `plugin/meta/agdf-agent-router.md`, `plugin/meta/agdf-runtime-contract.md`, `plugin/skills/**`
- implementation owners: `create-agdf/opencode-plugin.js`, `create-agdf/scripts/sync-package-assets.js`, generated OpenCode assets and focused tests
