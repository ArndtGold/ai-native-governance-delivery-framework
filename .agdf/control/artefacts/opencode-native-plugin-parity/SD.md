# Solution Design

## 1. Design decision

Use OpenCode's native project skill mechanism as the primary AGDF workflow surface and retain the npm plugin only for lifecycle context, status signals and compaction reminders. Remove the current generated-agent-only presentation from the primary OpenCode surface rather than maintaining two equivalent routing structures.

This creates native OpenCode discoverability without moving AGDF policy into the OpenCode plugin. The canonical AGDF skills remain the only policy owners; OpenCode receives generated adapters with valid OpenCode frontmatter and names prefixed with `agdf-`.

## 2. Runtime facts used

- OpenCode loads npm plugins from `opencode.json` and local/global plugin directories.
- OpenCode discovers project skills under `.opencode/skills/<name>/SKILL.md` and loads them on demand through its native `skill` tool.
- OpenCode supports permission control for `skill`, `edit` and `bash`, including per-agent overrides.
- OpenCode plugins can observe or modify tool execution through plugin hooks, but loadability alone does not prove AGDF gate enforcement.

Evidence: current OpenCode plugin, skills and agents documentation; existing `create-agdf/opencode-plugin.js`; generated OpenCode configuration and smoke tests.

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
          +--> .opencode/skills/agdf-*/SKILL.md   OpenCode-native workflow surface
          +--> .opencode/AGDF.md                  thin routing/instruction adapter
          +--> opencode.json                      plugin, instructions, permissions
          +--> create-agdf/opencode-plugin.js     lifecycle/status/compaction hook
          |
          v
      .agdf/control/                            durable governance source of truth
```

## 4. Asset rules

1. Generate one OpenCode skill directory per canonical skill under `.opencode/skills/`.
2. Use the `agdf-` prefix because OpenCode has no AGDF plugin namespace for skill names.
3. Convert canonical frontmatter to OpenCode-valid `name` and `description` fields; retain the canonical body and replace only surface-relative Runtime Contract references.
4. Generate `.opencode/AGDF.md` as a short router that instructs OpenCode to use `agdf-gate-check` first for new change intent and to treat `.agdf/control/` as authoritative.
5. Stop generating `.opencode/agents/agdf-*.md` as the primary workflow representation. Existing generated agents are internal scaffolding, not a documented public API; their removal avoids parallel routing owners.
6. Keep `opencode.json` loading the npm plugin and `.opencode/AGDF.md`, with `edit`, `bash` and `skill` explicitly permissioned according to the approved default.

## 5. Plugin responsibilities

`create-agdf/opencode-plugin.js` remains deliberately small. It may:

- expose package/version and repository-surface status through environment and structured logs;
- inject a compaction reminder that points to `.opencode/AGDF.md`, native `agdf-*` skills and `.agdf/control/`;
- report that global plugin activation is not repository governance activation.

It must not duplicate the Runtime Contract, calculate gate transitions independently or claim tool enforcement. A future evidence-backed enforcement adapter may use OpenCode tool hooks, but that is not part of this slice unless the TP explicitly includes it and tests can prove it.

## 6. Permissions

The generated repository configuration will keep mutating tools explicit (`edit: ask`, `bash: ask`) and set skill access explicitly rather than relying on OpenCode defaults. The exact `skill` value and any per-agent overrides must be verified against the installed runtime and documented in the TP evidence plan.

## 7. Capability classification

The implementation will initially retain OpenCode as `instruction_only`. Native skill discovery is not enforcement evidence. The capability classification may be upgraded only after a reproducible OpenCode runtime probe demonstrates a guard that is independent of model compliance and is covered by regression tests.

## 8. Compatibility and migration

- `opencode` continues to configure the global npm plugin.
- `opencode-repo` continues to protect existing `opencode.json` unless force is explicit.
- Existing `.opencode/AGDF.md` and generated agent directories are regenerated into the new canonical skill layout on the next explicit repository setup.
- No automatic destructive migration runs against existing repositories; migration behavior must be explicit and tested.
- Status continues to distinguish global configuration, package loadability, repository surface and active session signals.

## 9. Test design

- generated skill names and frontmatter satisfy OpenCode naming/description rules;
- all canonical skills are discoverable under `.opencode/skills/`;
- `.opencode/AGDF.md` routes to `agdf-gate-check` and contains no unprefixed or duplicate policy routing;
- `opencode.json` loads the npm plugin and instructions and preserves explicit permissions;
- global-only status remains distinct from repository-surface status;
- existing-config protection remains intact;
- source changes propagate to generated OpenCode skills;
- no generated `.opencode/agents/` parallel route remains unless an explicit compatibility decision is recorded;
- capability classification remains `instruction_only` unless runtime enforcement evidence is captured.

## 10. Risks and decisions deferred

- Whether OpenCode's installed version supports every required skill-permission combination must be confirmed before implementation.
- Removing generated agents may affect undocumented local usage; the TP must include a repository search and explicit migration note.
- A native skill surface improves discoverability but does not make AGDF gate decisions tool-enforced; this distinction remains visible in the Runtime Contract and capability matrix.

## 11. Ownership and source of truth

- canonical policy: `plugin/skills/**`, `plugin/meta/agdf-agent-router.md`, `plugin/meta/agdf-runtime-contract.md`;
- surface definition: `plugin/meta/agdf-plugin.definition.json`;
- OpenCode adapter/generation: `create-agdf/opencode-plugin.js`, `create-agdf/scripts/sync-package-assets.js`;
- validation: `create-agdf/scripts/smoke-test.js`, focused OpenCode tests and capability tests;
- durable repository governance: `.agdf/control/`.

## 12. Required next step

Create the Task Plan with explicit migration, generation, permission, testing and runtime-evidence tasks.
