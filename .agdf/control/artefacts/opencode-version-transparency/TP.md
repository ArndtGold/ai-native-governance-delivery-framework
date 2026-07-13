# Task Plan: OpenCode Version Transparency

## Scope

Extend the existing OpenCode installer and status owner so users can see installed, expected and transition-aware AGDF package version information without changing command shape, governance authority or enforcement classification.

## Tasks

| task_id | Task | Owner | Evidence / acceptance |
|---|---|---|---|
| OVT-01 | Extend the OpenCode package resolver to return the installed package version from the package resolved in the configured OpenCode directory. | agent | Resolver returns entrypoint, loadability, installed version or explicit unknown state without importing plugin code. |
| OVT-02 | Add canonical expected-version comparison against `pluginDefinition.version` with `current`, `outdated`, `unknown` and `unloadable` classifications. | agent | Status classification is deterministic and does not change configured/loadable semantics. |
| OVT-03 | Extend `opencode-status --json` additively with installed/expected/version-status fields while preserving schema-v1 fields and session version separation. | agent | JSON fixtures cover all four statuses and existing consumers’ fields remain present. |
| OVT-04 | Sharpen human `opencode-status` and `opencode` installer output with package version, expected version, status and actionable mismatch wording. | agent | Current, outdated, unknown and unloadable output is compact, explicit and non-misleading. |
| OVT-05 | Capture an observable previous-to-installed version transition during the existing `opencode` update operation without creating persistent version history. | agent | `installed`, `updated`, `unchanged` and `unknown` transition cases are covered; no transition is invented when the previous version is unavailable. |
| OVT-06 | Preserve the existing global native-surface installer, ownership preflight, repository boundary, permission behavior and `instruction_only` capability classification. | agent | Existing OpenCode global/repository and preservation probes remain green; no second version or governance owner is introduced. |
| OVT-07 | Add focused smoke fixtures for current, outdated, unknown, unloadable, transition and schema compatibility behavior. | agent | Focused CLI tests pass and cover the acceptance criteria with isolated package/config fixtures. |
| OVT-08 | Run aggregate package/CLI/Pages/integrity/doctor/diff checks and assemble implementation evidence for review. | agent | All relevant checks pass; evidence maps each OVT task and names any environment limitation. |

## Dependencies

`OVT-01` precedes OVT-02 through OVT-05. OVT-03 and OVT-04 share the version classification contract. OVT-05 depends on installer ordering and must not mutate the global surface ownership path. OVT-06 is a regression constraint. OVT-07 validates OVT-01 through OVT-06. OVT-08 closes the evidence chain.

## Constraints

- Do not add a new command or required parameter.
- Do not persist version history or create a second package/version source.
- Do not change global skill names, repository activation, `.agdf/control/` authority or capability classification.
- Do not claim a version transition when the previous version is not observable.
- Do not commit, push, open a PR or release.

## Required review path

After `Approval: TP`, run Brownfield Analysis before `CD+Tests`; after implementation run Task Plan Review, Clean Implementation Review, Code Review, QA Gate and UAT.

## Traceability

- derived_from: `UR.md`, `BROWNFIELD_REVIEW.md`, `PRD.md`, `SD.md`
- expected version source: `plugin/meta/agdf-plugin.definition.json`
- installed version source: configured OpenCode `create-agdf/package.json`
- implementation owner: `create-agdf/bin/create-agdf.js`
- test owner: `create-agdf/scripts/smoke-test.js`
- capability invariant: OpenCode remains `instruction_only`

## Approval

- `Approval: SD` provided on `2026-07-13`.
- `Approval: TP` provided on `2026-07-13`.
