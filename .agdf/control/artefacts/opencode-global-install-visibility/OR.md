# OR: OpenCode Global Install Visibility

Status: completed
Gate: OR
Date: 2026-07-09
Owner: agent

## Result

OpenCode global AGDF installation is now visibly and deterministically checkable.

## Delivered

- `opencode` now installs the `create-agdf` package into the OpenCode config environment and writes the global `plugin[]` config.
- `opencode-status` reports global config, package loadability, active session signals and repository surface presence as separate facts.
- The OpenCode plugin hook exposes `AGDF_PLUGIN_ACTIVE`, `AGDF_PLUGIN_VERSION`, `AGDF_CONTROL_DIR` and `AGDF_OPENCODE_REPOSITORY_SURFACE` through `shell.env` when loaded.
- User documentation and generated OpenCode surface docs describe the global/repository split and status command.
- Smoke coverage validates status behavior before and after repository-surface generation.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Targeted manual status check | temporary OpenCode config dir | `opencode` config and package loadability, separated from session/repo state | direct runtime output |
| Smoke test | `npm --prefix create-agdf run smoke-test` | generated assets, OpenCode install/status behavior, routing | direct automated test |
| Runtime integrity | `node plugin/scripts/check-runtime-integrity.mjs` | runtime skill/control consistency | direct automated test |

## Verification

| Check | Result |
|---|---|
| `npm --prefix create-agdf run smoke-test` | passed |
| `node plugin/scripts/check-runtime-integrity.mjs` | passed |

## Limitations

- Active OpenCode session detection can only be proven from a process that sees the hook-set environment variables.
- This change does not automatically activate AGDF repository governance in arbitrary repositories; `opencode-repo` remains explicit.

## Next Step

Offer commit handoff; do not commit, push, publish or open a PR automatically.

## Quality Outlook

Keep status outputs factual: config, package loadability, session signal and repository surface are separate evidence classes.
