# Task Plan Review: Global Native OpenCode Surface

## Decision

- status: `pass`
- coverage: `12/12 fully_done`
- implementation: aligned after one runtime-driven correction
- next_allowed_action: `Clean Implementation Review`

## Coverage

| task_id | status | Evidence |
|---|---|---|
| OGS-01 | fully_done | Isolated OpenCode `1.17.13` probes verified global discovery and repository/global separation. Same-name project/global probing showed that the runtime does not prefer the project skill; the implementation therefore uses `agdf-global-*`. |
| OGS-02 | fully_done | Canonical ownership markers, expected file set and fail-closed overwrite behavior are implemented and smoke-tested. |
| OGS-03 | fully_done | Global `AGDF.md`, Runtime Contract and nine `agdf-global-*` adapters are generated from canonical synchronized assets. |
| OGS-04 | fully_done | Existing `opencode` installs the plugin and global surface without changing the public command shape. |
| OGS-05 | fully_done | Global instructions and adapters require repository-local `.opencode/` and `.agdf/control/` evidence and direct missing repositories to `opencode-repo`. |
| OGS-06 | fully_done | `opencode-status --json` additively reports global native-surface paths, counts, presence and completeness while retaining schema-v1 fields. |
| OGS-07 | fully_done | Preservation probes cover unrelated plugins, instructions, permission rules and user-owned skills; `edit` and `bash` remain unchanged. |
| OGS-08 | fully_done | `create-agdf/opencode-plugin.js` remains lifecycle/status/compaction-only and does not load skill bodies or calculate gates. |
| OGS-09 | fully_done | Smoke, runtime-integrity and installed-runtime checks cover assets, markers, references, status separation and capability classification. |
| OGS-10 | fully_done | Runtime discovery proves nine `agdf-global-*` skills coexist with canonical local `agdf-*` skills without same-name masking; OpenCode remains `instruction_only`. |
| OGS-11 | fully_done | Install documentation, package README, generated guidance, Pages copy and CLI status output describe the global/repository boundary and namespace. |
| OGS-12 | fully_done | Implementation evidence records focused and aggregate checks, including doctor and diff validation. |

## Findings and deviation

The first implementation used the canonical `agdf-*` names globally. The installed runtime probe showed that an equal-name global skill can mask the project-local skill, so this was corrected before review by introducing the canonical definition field `opencode.globalSkillPrefix = "agdf-global-"`. This is a structural compatibility correction, not a scope expansion.

No task is missing, deferred or only partially implemented. No enforcement capability was inferred from discovery or permission evidence.

## Review path

Proceed to Clean Implementation Review, then Code Review and QA Gate.

