# Solution Design: Global Native OpenCode Surface

## 1. Design decision

Extend the existing global `opencode` installer to install generated AGDF native skill adapters into OpenCode's global configuration directory, while keeping repository-local OpenCode files and `.agdf/control/` authoritative.

The global surface is discoverability and fail-closed guidance. It is not a global governance state or a second gate engine.

## 2. Verified runtime contract

- OpenCode's global configuration root is `~/.config/opencode/` by default and is overrideable through `OPENCODE_CONFIG_DIR` for deterministic tests and alternate installations.
- OpenCode discovers global skills from the global `skill(s)` directory; the selected implementation uses `<configDir>/skills/<name>/SKILL.md`.
- Global config may load instruction files and plugins; project configuration remains the more specific repository surface.
- Project-local `.opencode/skills/` entries use canonical `agdf-*` names. OpenCode 1.17.13 does not prefer a same-named project skill over a global skill, so global adapters use the collision-safe `agdf-global-*` namespace.

The installed runtime probe must remain part of implementation evidence because OpenCode global discovery and precedence are runtime contracts, not assumptions from generated filenames alone.

## 3. Architecture

```text
Canonical AGDF sources
  plugin/skills/*/SKILL.md
  plugin/meta/agdf-agent-router.md
  plugin/meta/agdf-runtime-contract.md
  plugin/meta/agdf-plugin.definition.json
          |
          v
create-agdf/scripts/sync-package-assets.js
          |
          +--> repository adapters: .opencode/AGDF.md, .opencode/skills/agdf-*/SKILL.md
          +--> global adapters: <configDir>/AGDF.md, <configDir>/skills/agdf-global-*/SKILL.md
          +--> global config: opencode.json plugin/instructions/skill permission
          |
          v
create-agdf/bin/create-agdf.js
  opencode: global plugin + global native surface
  opencode-repo: repository-local surface + control templates
  opencode-status: separate global, repository and session signals
          |
          v
      .agdf/control/                         repository-owned governance source of truth
```

## 4. Global asset rules

1. Generate exactly one global directory per canonical skill under `<configDir>/skills/agdf-global-*/SKILL.md`.
2. Generate `<configDir>/agdf-runtime-contract.md` as a surface adapter from the canonical Runtime Contract so existing relative references remain valid.
3. Generate `<configDir>/AGDF.md` as a short global boundary instruction. It may direct users to the global native skills and `opencode-repo`, but it must not represent repository control state.
4. Add the global AGDF instruction path to the global OpenCode config only through the existing `opencode` installer and preserve unrelated instruction entries.
5. Add or preserve the explicit `skill` permission for `agdf-*`; do not overwrite unrelated permission policies or silently broaden `edit`/`bash`. The permission remains broad enough for both canonical project skills and `agdf-global-*` adapters.
6. Prepend a generated global-surface boundary to every global skill: verify the current repository's local AGDF surface before applying governance; if missing, stop and direct the user to `opencode-repo`.
7. Generate global assets from the canonical skills and surface definition; no hand-maintained global policy copy is allowed.

## 5. Ownership and migration

- Every generated global file carries an exact AGDF ownership marker containing its canonical surface and skill slug.
- Regeneration may replace only files with the expected AGDF marker and canonical path.
- Existing user-owned global skills, instructions and permission entries are preserved.
- If an expected AGDF-owned file is malformed or unmarked, the installer must fail closed with an actionable message rather than overwrite it.
- No automatic removal of unrelated global skills is introduced; cleanup of obsolete AGDF-owned global files is a bounded future migration task unless the TP explicitly includes a safe owned-file list.

## 6. Status contract

Extend the existing schema-v1 `opencode-status --json` output additively:

```json
{
  "global_native_surface": {
    "path": "<configDir>/skills",
    "instructions": "<configDir>/AGDF.md",
    "runtime_contract": "<configDir>/agdf-runtime-contract.md",
    "expected_skill_count": 9,
    "skill_count": 9,
    "present": true,
    "complete": true
  }
}
```

The existing `status` meaning remains global plugin configuration/loadability. Repository-surface fields remain separate. A missing global native surface is reported as a finding and next step but does not cause repository governance to appear active.

## 7. Plugin responsibilities

`create-agdf/opencode-plugin.js` remains unchanged unless the TP proves a read-only global-surface signal is required for runtime logging. It must not load global skill bodies, calculate gates or decide repository activation. The CLI owns deterministic install/status evidence; the plugin owns runtime lifecycle context.

## 8. Compatibility and configuration merge

- The public `opencode` command remains unchanged.
- `OPENCODE_CONFIG_DIR` remains the deterministic test and alternate-config override.
- Existing `opencode.json` JSON, plugin entries, instructions and permission rules are preserved; AGDF adds only its owned plugin/instruction/skill-permission entries.
- `opencode-repo` remains the explicit repository bootstrap and continues to protect existing project config.
- Project-local AGDF skills remain the repository-specific adapter and are authoritative by boundary and canonical naming; global adapters use `agdf-global-*` so OpenCode cannot mask the local skill through same-name precedence.
- Schema-v1 status consumers continue to receive existing fields, including the deprecated `gate_check_agent` alias where applicable.

## 9. Fail-closed behavior

The global `agdf-gate-check` and global instructions must state:

- global plugin/skill presence is not repository governance activation;
- first inspect the current repository's `.opencode/AGDF.md`, `.opencode/skills/agdf-gate-check/SKILL.md` and `.agdf/control/`;
- if the local surface is absent, do not apply later AGDF artefacts or implementation rules and direct the user to `opencode-repo`;
- if the local surface is present, use the local instructions and control files as authority.

This is a boundary adapter, not a second gate transition model.

## 10. Validation design

- isolated global install: global config, instructions, Runtime Contract and all nine skills are generated;
- installed OpenCode probe: `opencode debug skill` discovers all nine global skills;
- repository separation: global-only status reports no repository surface, while `opencode-repo` adds the local surface without changing global ownership;
- configuration preservation: unrelated plugin/instruction/permission entries and unowned global skills survive regeneration;
- ownership safety: unmarked or unrelated global files are never overwritten;
- status: schema-v1 additive global-native fields report complete/incomplete counts and paths;
- runtime integrity: canonical/global/repository skill counts, markers and references are validated;
- capability: OpenCode remains `instruction_only` with no tool-enforcement claim.

## 11. Deferred decisions

- A future cleanup command may remove obsolete AGDF-owned global assets, but it is not needed for the first global-surface slice.
- A future enforcement slice may inspect OpenCode tool hooks, but global native discovery alone cannot change capability classification.

## 12. Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing Delivery Path Search surface capability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

## 13. Required next step

Create the Task Plan with explicit implementation, migration, status, permission, runtime-discovery and regression-test tasks; request `Approval: TP`.

## Approval

- `Approval: SD` provided on `2026-07-13`.
