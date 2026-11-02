# Solution Design: OpenCode Version Transparency

## 1. Design decision

Extend the existing OpenCode package resolver and installer/status owner. Read the installed `create-agdf` package version from the package resolved in the OpenCode config directory and compare it with `pluginDefinition.version`. Capture a previous version only within the same `opencode` install/update operation, before npm installation mutates the config directory.

No persistent version history, second registry or new command is introduced.

## 2. Ownership

```text
plugin/meta/agdf-plugin.definition.json
  └── expected version source

OpenCode configDir/node_modules/create-agdf/package.json
  └── installed version source

create-agdf/bin/create-agdf.js
  ├── resolveOpenCodePackage(): loadability, path and installed version
  ├── evaluateOpenCodeStatus(): additive package version state
  ├── installOpenCodeGlobalPlugin(): previous/current transition capture
  └── printOpenCodeStatus(): human-readable version output
```

The npm package remains the only installed-version source. The canonical plugin definition remains the only expected-version source.

## 3. Version resolution

1. Resolve the package entrypoint from `configDir` using the existing `require.resolve` path.
2. Resolve/read the nearest package manifest for the same installed package without importing plugin code.
3. Return `installed_version` when it is a valid non-empty string.
4. Return `installed_version: null` and `version_status: unknown` when the package loads but its manifest/version is unreadable.
5. Preserve `loadable: false` and the existing error path when package resolution fails.
6. Compare against `pluginDefinition.version` only after loadability resolution.

## 4. Status contract

Extend the existing schema-v1 `package` object:

```json
{
  "name": "create-agdf",
  "loadable": true,
  "resolved_path": "<entrypoint>",
  "installed_version": "0.6.9",
  "expected_version": "0.6.9",
  "version_status": "current",
  "error": ""
}
```

Version status values:

- `current`: installed and expected versions match;
- `outdated`: both are readable and differ;
- `unknown`: package loads but version cannot be read;
- `unloadable`: package cannot be resolved.

Existing fields and `status: configured|not_configured` semantics remain unchanged. `outdated` is a visible finding and repair next step, but does not erase evidence that the package is loadable/configured.

## 5. Install/update transition

`opencode` captures the pre-install package state, performs the existing npm install, then resolves the installed package again:

```json
{
  "previous_version": "0.6.8",
  "installed_version": "0.6.9",
  "transition_status": "updated"
}
```

Allowed transition statuses:

- `installed`: no previous loadable package was observed;
- `updated`: previous and installed versions are readable and differ;
- `unchanged`: previous and installed versions match;
- `unknown`: either side is not safely observable; no transition claim is made.

The transition is an operation result only. It is not persisted as global history and is not added to later `opencode-status` output unless independently observable from the current package.

## 6. Human output

The installer and status output use the same compact wording:

```text
Package version: 0.6.9
Expected version: 0.6.9
Version status: current
```

The installer adds a transition line only when meaningful:

```text
Version transition: 0.6.8 -> 0.6.9
```

Unknown/unloadable states include the existing actionable refresh/install command and do not imply a successful upgrade.

## 7. Test design

- current fixture: installed and expected versions match;
- outdated fixture: installed package manifest differs from canonical definition;
- unknown fixture: package resolves but manifest version is unreadable/missing;
- unloadable fixture: package cannot resolve;
- install transition: previous package is readable before replacement and new package is readable after replacement;
- no-transition: previous version is unavailable, so no invented `previous -> installed` claim appears;
- JSON compatibility: existing schema-v1 fields remain present and new fields are additive;
- regression: global skill completeness, repository separation, preservation, ownership preflight and capability classification remain unchanged.

## 8. Migration and failure handling

- No migration file or persistent state is required.
- Existing installations without readable package metadata report `unknown` and remain repairable through the existing `opencode` command.
- Package installation failure preserves the existing error path and must not report a successful transition.
- Version metadata must never be used as governance activation or enforcement evidence.

## 9. Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install status and package-loadability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

## 10. Required next step

Create the Task Plan and request `Approval: TP`.

## Approval

- `Approval: PRD` provided on `2026-07-13`.

