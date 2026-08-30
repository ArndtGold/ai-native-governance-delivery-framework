# Copilot Host Evidence

Date: 2026-08-28
Run: `agdf-copilot-plugin-integration`
Package version: `0.13.8`

## Plugin-Only Refresh: 2026-08-30

| Observation | Result | Boundary |
|---|---|---|
| Local checkout install | `npm run install:copilot` completed with `AGDF updated for GitHub Copilot`, version `0.13.8 (verified)`, installation `Ready` and restart required. | Proves installer and persistent host state, not a freshly loaded app session. |
| Callable host route | No `copilot` executable was available on `PATH`; the installer and read-back used pinned official `@github/copilot@1.0.80`. | This is the supported fallback and remains distinct from a PATH-installed CLI. |
| Marketplace read-back | Copilot listed registered local Marketplace `agdf` at `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf`. | Local Marketplace only; no public/default Marketplace claim. |
| Plugin read-back | Copilot listed `agdf@agdf (v0.13.8)`. | Persistent installed registration; restart remains required for refreshed loaded-session evidence. |
| Repository retention | Deterministic byte-for-byte fixtures passed for install, update, status, rejected repository disable, global uninstall and install failure. | Proves the tested lifecycle does not alter existing `AGENTS.md`, `AGENTS.agdf.md`, `.github/**` or `.agdf/control/**`; it is not a claim about unrelated files. |

The canonical public command is now `npx --yes @agdf/cli@latest copilot`. The retired
`copilot-plugin` and `both` targets fail before mutation. Copilot repository projection is no longer
generated or supported. Existing repository files remain untouched.

## Evidence Planes

| Plane | Observed state | Evidence boundary |
|---|---|---|
| Generated package | `verified` | `release:prepare`, package contents, byte-identical package build and Runtime Integrity passed for the root manifest, prefixed skills, hook and exact runtime. |
| Installed macOS app | `hook_execution_verified_context_pending` | `/Applications/GitHub Copilot.app` version `1.1.14` uses the embedded Copilot CLI session runtime. Session `4ef44ec1-0225-4756-98d4-12813789457b` recorded AGDF's only configured camel-case `sessionStart` command hook with `success: true`. Its output was `{}` because Copilot runtime-check consent was not effectively enabled. |
| Callable Copilot CLI | `verified_via_official_npm_package` | `copilot` was not executable on `PATH`. The installer ran pinned `@github/copilot@1.0.80`; Copilot reported `Plugin "agdf" installed successfully. Installed 10 skills.` and a post-install list reported AGDF `v0.13.8`. |
| Durable local stage | `verified` | Runtime Integrity passed in `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf`; root manifest reports AGDF `0.13.8`, `copilot-skills/` and `hooks/copilot-hooks.json`. |
| Copilot installed plugin store | `verified_current_pending_restart` | The 2026-08-30 plugin-only refresh verified Marketplace identity `agdf@agdf` and version `0.13.8`. The root manifest binds `hooks/copilot-hooks.json`; prior direct app session evidence proves hook execution. Fresh post-update loaded-session evidence still requires restart. |
| Linux host | `unavailable` | No direct environment was available. No parity claim. |
| Native Windows host | `unavailable` | No direct environment was available. No parity claim. |
| Marketplace and managed policy | `local_verified_publication_unverified` | The owned local Marketplace is registered and installed. Default-Marketplace publication was not authorized. Managed behavior is represented only by deterministic adapter fixtures. |

## Direct Host Evidence Still Required

1. Restart the macOS Copilot app and capture plugin identity, version and loaded `agdf-` skill inventory.
2. Observe gate-check routing in governed and ungoverned repositories.
3. Observe one project skill collision, disable and uninstall while proving repository files remain.
4. After explicit runtime-check consent, refresh AGDF and observe non-empty `additionalContext` in a new app session. Manual-mode execution with empty output is already proven.

Package, repository and adapter fixtures do not satisfy these observations.

## Direct App Hook Observation

- App runtime: `/Applications/GitHub Copilot.app/Contents/Resources/copilot-sdk/extension.js` exposes `sessions.reloadPluginHooks` for user and installed-plugin hooks.
- Installed binding: `~/.copilot/installed-plugins/agdf/agdf/plugin.json` points `hooks` to `hooks/copilot-hooks.json`.
- Unique configured camel-case startup hook: the installed AGDF hook is the only `sessionStart` entry found beneath `~/.copilot`.
- Executed event: `~/.copilot/session-state/4ef44ec1-0225-4756-98d4-12813789457b/events.jsonl` records `hook.start` with `hookType: sessionStart`, followed by `hook.end`, `success: true`, and `output: {}`.
- Interpretation: no Custom Extension is required to execute the AGDF plugin hook in Copilot App 1.1.14. Empty output proves the current consent or installed-output state, not absence of hook support.
