# Implementation Evidence

## Outcome

The approved OpenCode-native plugin parity slice is implemented. OpenCode now receives nine native project skills generated from the canonical AGDF skills, while the npm plugin remains the lifecycle/status adapter and `.agdf/control/` remains the durable governance source of truth.

## Task coverage

| task_id | Status | Evidence |
|---|---|---|
| OC-01 | done | Installed OpenCode `1.17.13` verified; native `opencode plugin`, `opencode debug skill`, agent discovery and permission behavior inspected. |
| OC-02 | done | Repository search found the agent-only path in generated assets, tests, runtime detection and documentation; no independent OpenCode policy owner exists. |
| OC-03 | done | `sync-package-assets.js` now generates `.opencode/skills/agdf-*/SKILL.md` from canonical `plugin/skills/**` with prefixed names and corrected Runtime Contract references. |
| OC-04 | done | Generated `.opencode/AGDF.md` routes native `agdf-*` skills and keeps `.agdf/control/` authoritative without duplicating the gate model. |
| OC-05 | done | Default generated AGDF subagents removed; package docs, install docs, CLI guidance and Pages copy now describe the native skill surface. |
| OC-06 | done | Generated `opencode.json` keeps `edit`/`bash` at `ask` and explicitly allows `agdf-*` through `permission.skill`; existing-config protection remains tested. |
| OC-07 | done | OpenCode plugin and status detection now require `.opencode/skills/agdf-gate-check/SKILL.md`; lifecycle, environment and compaction responsibilities remain unchanged. |
| OC-08 | done | Smoke tests cover skill paths/frontmatter, permission config, absence of parallel AGDF agents, existing-config protection and safe migration preserving user-owned agents. |
| OC-09 | done | Native runtime discovery proves all nine skills. Capability remains `instruction_only`: discovery and permission prompts are not an independent AGDF gate guard, and no `tool.execute.before` enforcement adapter was introduced. |
| OC-10 | done | Runtime integrity, create-agdf aggregate smoke tests, @agdf/cli smoke tests, Astro checks, native OpenCode discovery probe, doctor and diff checks pass. |

## Native OpenCode evidence

- `opencode --version`: `1.17.13`
- clean temporary `opencode-repo` generation plus `opencode debug skill`: all nine canonical `agdf-*` skills discovered
- same temporary repository plus `opencode agent list`: no generated AGDF agent remains
- generated configuration accepted by the installed OpenCode runtime with explicit `edit`, `bash` and `skill` permissions

## Migration behavior

An explicit `opencode-repo` regeneration removes only known legacy AGDF agent files whose generated frontmatter and canonical heading match the owned legacy format. Unrelated user-owned files under `.opencode/agents/` are preserved. The migration is regression-tested.

## Verification

| Check | Result |
|---|---|
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; 9 skills and 14 control files checked |
| `npm --prefix create-agdf run smoke-test` | pass |
| `npm --prefix agdf run smoke-test` | pass |
| `npm --prefix pages run check` | pass; 0 errors, 0 warnings, 0 hints |
| native OpenCode skill discovery probe | pass; 9 AGDF skills |
| native OpenCode agent discovery probe | pass; 0 AGDF agents |
| local OpenCode plugin hook probe | pass; native skill surface, status log, environment signal and compaction reminder verified |
| `opencode-status` schema-v1 compatibility regression | pass; deprecated `gate_check_agent` aliases the valid native `gate_check_skill` path |
| `git diff --check` | pass |
| `doctor --json` | pass after canonical backlog-label correction |

## Deviations and limits

- The installed OpenCode runtime now exposes a native `opencode plugin <module>` installer. This slice does not replace the existing AGDF global install implementation because package loadability/status verification currently depends on the deterministic config-directory installation contract. The public AGDF command remains unchanged.
- OpenCode remains `instruction_only`; native skills provide packaging and discovery parity, not model-independent gate enforcement.
- `repository_surface.gate_check_agent` remains as a documented schema-version-1 compatibility alias and may be removed only through a future versioned status contract.
- No commit, push, pull request or release was performed.

## Next review step

Run Clean Implementation Review and Code Review before QA Gate. TP Review passed with 10/10 tasks `fully_done`.
