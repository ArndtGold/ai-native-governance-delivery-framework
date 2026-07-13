# Product Requirements Document: OpenCode Version Transparency

## 1. Product decision

Make the OpenCode installer and status output explicitly report the AGDF package version that is installed, the version expected by the current canonical definition, and the resulting version state. Preserve the existing command shape and schema-v1 compatibility.

## 2. Problem

`opencode` currently reports package loadability and a resolved path but does not tell users whether the loaded AGDF package is current. It also gives no visible transition when an existing package is refreshed. This makes a successful command operationally ambiguous after a package release.

## 3. Goals

- show installed and expected AGDF package versions in human output;
- classify the package as `current`, `outdated`, `unknown` or `unloadable`;
- expose the same information additively through `opencode-status --json`;
- report an observable `previous -> installed` transition during `opencode` installation/update;
- distinguish package version from active-session version signals;
- reuse the existing package resolver, canonical plugin definition and smoke-test owner.

## 4. Non-goals

- no new command or required parameter;
- no persistent version-history database or global state file;
- no change to plugin loading, global native skills, repository activation or `.agdf/control/` authority;
- no capability or enforcement classification change;
- no automatic commit, push, PR or release.

## 5. Requirements

### R1 Human installer output

`opencode` must show a compact package version block after installation/update:

```text
Package version: 0.6.9
Expected version: 0.6.9
Version status: current
```

When a previous version is observable before installation, show:

```text
Version transition: 0.6.8 -> 0.6.9
```

If the previous version cannot be observed, do not infer a transition; report only the installed/expected comparison.

### R2 Human status output

`opencode-status` must show the same installed/expected/status fields. It must not claim a previous version because status runs do not have a reliable transition context.

### R3 JSON status

Extend the existing `package` object additively:

```json
{
  "name": "create-agdf",
  "loadable": true,
  "resolved_path": ".../create-agdf/opencode-plugin.js",
  "installed_version": "0.6.9",
  "expected_version": "0.6.9",
  "version_status": "current",
  "error": ""
}
```

Allowed `version_status` values are `current`, `outdated`, `unknown` and `unloadable`.

### R4 Mismatch behavior

- `current`: installed and expected versions match;
- `outdated`: both versions are readable but differ; output includes the existing refresh command;
- `unknown`: package is loadable but its version cannot be read safely;
- `unloadable`: package resolution fails; preserve the existing loadability finding and actionable install command.

Version mismatch must not make a loadable package appear absent, and version evidence must not be conflated with session activity.

### R5 Compatibility and tests

Existing schema-v1 fields remain unchanged. Tests must cover current, outdated, unknown and unloadable fixtures, observable update transition, no-transition behavior and existing global/repository separation.

## 6. Acceptance criteria

- A current install visibly reports matching installed/expected versions and `current`.
- A stale fixture visibly reports `outdated` and a refresh command.
- An update fixture reports `previous -> installed` only when both values are observable.
- JSON consumers receive additive package-version fields.
- Existing OpenCode global skill, repository surface, preservation, integrity, doctor and smoke behavior remains green.

## 7. Brownfield and source of truth

- `plugin/meta/agdf-plugin.definition.json` remains the expected-version source;
- the installed package `package.json` is the installed-version source;
- `create-agdf/bin/create-agdf.js` remains the installer/status owner;
- no second version registry or persistent history owner is introduced.

## 8. Required next step

Request `Approval: PRD`, then create the Solution Design for resolver behavior, transition capture and fixture/test strategy.

## Approval

- `Approval: UR` provided on `2026-07-13`.

