# Implementation Evidence: Global Native OpenCode Surface

## Outcome

The global `opencode` installation now installs the existing npm plugin together with nine generated native `agdf-global-*` skill adapters, a global `AGDF.md` boundary instruction and a generated global Runtime Contract adapter. The global surface is discoverability-only and fail-closed; repository-local `.opencode/` and `.agdf/control/` remain authoritative.

## Task coverage

| task_id | status | evidence |
|---|---|---|
| OGS-01 | done | Installed OpenCode `1.17.13` discovered all nine `agdf-global-*` skills from an isolated `OPENCODE_CONFIG_DIR/skills/` path; same-name project/global probing showed no project precedence, and the implementation uses a distinct global namespace. |
| OGS-02 | done | Global instruction, Runtime Contract and skill adapters carry exact AGDF ownership markers; unowned `AGDF.md` collision is rejected. |
| OGS-03 | done | Global `agdf-global-*` adapters are rendered from the synchronized canonical `.opencode` skill assets, with global boundary text and valid relative Runtime Contract references. |
| OGS-04 | done | Existing `opencode` target installs plugin, `AGDF.md`, Runtime Contract and nine global skills without changing the public command shape. |
| OGS-05 | done | Global instructions and every global skill include fail-closed guidance requiring local `.opencode/` and `.agdf/control/` evidence before governance application. |
| OGS-06 | done | `opencode-status` now reports `global_native_surface` path, instruction/contract paths, expected/actual counts, presence and completeness additively in schema v1. |
| OGS-07 | done | Focused preservation probe confirms unrelated plugins, instructions, permissions and user-owned skills survive; AGDF adds only its owned entries. |
| OGS-08 | done | `opencode-plugin.js` remains lifecycle/status/compaction-only; no global skill body loading or duplicate gate calculation was added. |
| OGS-09 | done | Smoke tests cover global assets, markers, status, permissions, repository separation and preservation; runtime-integrity checks the global installer boundary. |
| OGS-10 | done | Installed runtime probe passed with nine `agdf-global-*` skills alongside canonical local skills without masking; OpenCode remains `instruction_only` and no enforcement claim was added. |
| OGS-11 | done | `INSTALL.md`, `create-agdf/README.md`, generated OpenCode guidance, Pages copy and status output describe the global/repository boundary. |
| OGS-12 | done | Aggregate package smoke, CLI smoke, Pages check, runtime integrity, doctor and diff checks passed. |

## Runtime evidence

- OpenCode version: `1.17.13`
- global discovery: `OPENCODE_CONFIG_DIR=<temp>/skills` → 9 unique `agdf-global-*` skills through `opencode debug skill`
- collision behavior: same-name local/global probe on OpenCode `1.17.13` showed global masking; distinct `agdf-global-*` names allowed local `agdf-*` and global adapters to coexist
- global status: `global_native_surface.complete=true`, `skill_count=9`, repository surface remains absent in the global-only probe
- fail-closed boundary: present in global `AGDF.md` and `agdf-global-gate-check/SKILL.md`
- ownership safety: unowned global `AGDF.md` overwrite rejected
- capability: `enforcementForSurface("opencode")` remains `instruction_only` with empty evidence

## Verification

| Check | Result |
|---|---|
| `node create-agdf/scripts/smoke-test.js` | pass |
| `npm --prefix create-agdf run smoke-test` | pass; aggregate suite and routing render pass |
| `npm --prefix agdf run smoke-test` | pass |
| `npm --prefix pages run check` | pass; 0 errors, 0 warnings, 0 hints |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; 9 skills and 14 control files checked |
| installed OpenCode global discovery probe | pass; 9 skills |
| global config/preservation probe | pass |
| global status/separation probe | pass |
| unowned global file collision probe | pass; overwrite refused |
| preflight/partial-install probe | pass; unowned collision rejected before config mutation, npm install or global surface writes |
| marker placement probe | pass; marker-in-body collision rejected unless the marker occupies the expected ownership position |
| `node create-agdf/bin/create-agdf.js doctor --json` | pass; 0 findings |
| `git diff --check` | pass |

## Boundaries and deviations

- No global `.agdf/control/` state was created.
- No new public command or parameter was added.
- No tool-enforcement hook or capability upgrade was added.
- No commit, push, pull request or release was performed.

## Required next review

QA Gate is the next required decision point; UAT and delivery closeout remain after QA approval.
