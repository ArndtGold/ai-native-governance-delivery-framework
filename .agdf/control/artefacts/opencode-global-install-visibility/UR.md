# UR: OpenCode Global Install Visibility

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## 1. Problem

`npx --yes @agdf/cli@latest opencode` currently records the AGDF npm plugin in the OpenCode global configuration, but users cannot clearly see whether AGDF is configured, loadable, active in the current OpenCode session, or active for the current repository.

This creates a confusing split between global installation and repository-local OpenCode surface files.

## 2. Goal

Make the OpenCode AGDF installation visibly and deterministically checkable after the global `opencode` command, while preserving explicit repository activation for repository-owned governance files.

## 3. Scope

- Improve the `opencode` installation path and status output so users can distinguish global configuration, package loadability, session activation and repository surface presence.
- Add or extend an OpenCode status check for AGDF visibility.
- Make the OpenCode hook expose clear runtime status signals when it is loaded.
- Keep `opencode-repo` as the explicit repository bootstrap for `.opencode/` files and `.agdf/control/` templates.
- Update user-facing documentation to explain global install, runtime visibility and repository surface activation.
- Extend focused smoke coverage for the OpenCode visibility/status behavior.

## 4. Non-Goals

- No change to Codex, Claude Code or GitHub Copilot behavior.
- No automatic modification of arbitrary repositories at OpenCode startup.
- No change to AGDF gate semantics or approval rules.
- No release, publish, tag, commit, push or PR.

## 5. Acceptance Signals

- A user can run a deterministic AGDF command to see whether OpenCode global config includes AGDF.
- The status check reports whether the AGDF npm package is loadable from the OpenCode config context.
- The status check reports whether the current session exposes AGDF runtime signals.
- The status check reports whether the current repository has the OpenCode AGDF surface.
- Documentation explains that global installation and repository surface activation are separate, visible states.
- Focused smoke tests cover the new OpenCode status behavior.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js`
- `create-agdf/opencode-plugin.js`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/smoke-test.js`
- `plugin/meta/agdf-plugin.definition.json`
- `README.md`
- `INSTALL.md`
- `create-agdf/README.md`

## 7. Next Step

Perform Brownfield Review before implementation because the change affects CLI behavior, OpenCode runtime behavior, generated assets and documentation.
