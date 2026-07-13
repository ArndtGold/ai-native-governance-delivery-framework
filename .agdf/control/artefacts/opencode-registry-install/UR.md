# User Request: OpenCode Registry Installation and Runtime Integrity

## Request

Stabilize the OpenCode plugin installation and correct the discovered parser/transition contract defects so global installation is portable and AGDF late-gate decisions remain deterministic.

## Problem

The current `opencode` installer invokes npm with the local `create-agdf` package directory, which persists a fragile `file:../../.npm/_npx/...` dependency. In addition, runtime inspection found that the control-state parser accepts only `Brownfield Review` as an internal artefact, the transition model has no deterministic `Brownfield Analysis`/`CD+Tests`/`CR`/pre-QA branches, the canonical `Mode/Slice Decision` heading does not match the parser, QA `pass` vocabulary is not normalized to approval, and an unused `firstUnapprovedGate` helper remains. A stale global `AGDF.md` namespace statement is also a deployment consistency defect.

## Desired outcome

- Global OpenCode installation depends on the published `create-agdf@<expected-version>` registry package.
- `package.json` and `package-lock.json` contain a stable registry dependency, not a local `file:` path.
- OpenCode resolves the plugin from the configured global `node_modules/create-agdf` installation and remains stable after source/cache removal.
- Internal artefact parsing models `Brownfield Analysis`, `CD+Tests` and `CR` alongside `Brownfield Review`.
- Transition logic deterministically exposes `Brownfield Analysis`, `CD+Tests`, `CR`, pre-QA `QA` and post-QA/UAT states with the correct approval/next action.
- Canonical `Mode/Slice Decision` headings and QA approval vocabulary are aligned across parser, templates, skills and runtime contract.
- Dead code is removed or justified, and stale global OpenCode guidance is repaired by the installer/generator path.

## Boundaries

- No new command or required parameter.
- No change to OpenCode skill names or governance authority.
- No silent fallback to an ephemeral cache path in the production installer.
- No second gate model or surface-specific transition owner.
- No commit, push, pull request or release in this scope.

## Acceptance criteria

- A clean `opencode` install writes a registry dependency such as `create-agdf: 0.6.9` and no `file:` reference to the npx cache.
- The installed package resolves from `<configDir>/node_modules/create-agdf` and survives removal of the source/cache path.
- Version/status output remains current and global native skills remain complete.
- Existing preservation, ownership, status, smoke, integrity and doctor checks remain green.
- The release/bootstrap workflow remains compatible with the published package lifecycle.
- Parser fixtures preserve all internal artefact rows and recognize the canonical `Mode/Slice Decision` heading.
- Gate fixtures reach `Brownfield Analysis`, `CD+Tests`, `CR`, pre-QA `QA`, post-QA `UAT` and `OR` deterministically with correct approvals and allowed actions.
- QA `pass` and `passed` normalize consistently to the approved QA state where the control contract requires it.
- No unused transition helper remains without an explicit owner or test purpose.
- Generated/global OpenCode guidance contains the current `agdf-global-*` namespace.

## Approval

- Original `Approval: UR` provided on `2026-07-13` for the registry-install slice.
- Scope refinement requires renewed exact approval: `Approval: UR`.
