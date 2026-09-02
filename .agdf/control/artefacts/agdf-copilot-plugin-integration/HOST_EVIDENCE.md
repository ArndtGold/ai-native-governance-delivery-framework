# Copilot Host Evidence

Date: 2026-08-30
Run: `agdf-copilot-plugin-integration`
Package version: `0.14.1`

## 2026-09-02 Launcher Fallback Revision

| Observation | Result | Boundary |
|---|---|---|
| Real local install | `npm run install:copilot` failed during initial verification because a present launcher returned `Cannot find GitHub Copilot CLI`; no successful installation or loaded-session claim follows. | Direct negative macOS UAT. |
| Isolated official fallback | `npm exec --yes --package=@github/copilot@1.0.80 -- copilot --version` returned `GitHub Copilot CLI 1.0.80`. | Proves the pinned fallback is executable, not that AGDF installation completed. |
| Implementation correction | The unavailable classifier now accepts both process `ENOENT` and the exact official missing-binary launcher prefix, then routes both through the same pinned fallback. | Repository implementation and injected host evidence only. |
| Focused verification | Local development install, lifecycle, Copilot profile, marketplace, CLI modularization, release preparation and `git diff --check` pass. | Deterministic evidence; real installation must be repeated deliberately. |
| Corrected real install | User confirmed the repeated install succeeds; independent official CLI read-back reports `agdf@agdf (v0.14.4)`. | Direct installed-state evidence, not fresh-session loading. |
| Installed-root validation | Installed validator reports `owned_version_matched`, profile `copilot-runtime-plugin`, version 0.14.4 and matched provenance; ten prefixed skill directories are present. | Direct filesystem/runtime evidence from the installed root. |

The failed real run supersedes the earlier assumption that every non-`ENOENT` launcher result is a
normal verification failure. It does not invalidate the prior 0.14.1 installed-root evidence, but it
reopened current 0.14.4 installation and fresh-session evidence. The corrected rerun closes the
installation/read-back gap; fresh-session evidence remains open.

## Copilot-Specific Profile Refresh

| Observation | Result | Boundary |
|---|---|---|
| Local checkout install | `npm run install:copilot` completed with `AGDF updated for GitHub Copilot`, version `0.14.1 (verified)`, installation `Ready` and restart required. | Proves installer and persistent host state, not a freshly loaded app session. |
| Callable host route | No `copilot` executable was available on `PATH`; installation and read-back used pinned official `@github/copilot@1.0.80`. | Supported fallback, distinct from a PATH-installed CLI. |
| Marketplace migration | The prior exact AGDF-owned shared registration was replaced by local Marketplace `agdf` at `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf-copilot`. | Only the registered Copilot source changed. The shared filesystem root was retained. |
| Plugin read-back | Official Copilot CLI listed `agdf@agdf (v0.14.1)`. | Persistent installed registration; restart remains required for loaded-session evidence. |
| Generated/staged payload | Semantic inventory reports 78 files and 539607 bytes with digest `5bfefc3bec6375446b3d8aa16d2e4e9720823613f27c619601d6f511119b519b`. | Inventory excludes its own file and installation provenance. |
| Installed cache | `/Users/arndtgold/.copilot/installed-plugins/agdf/agdf` contains 80 files: 78 payload files plus inventory and provenance. It contains ten `agdf-` skills, one hook, no `skills/**`, no `.codex-plugin/**` and no `.claude-plugin/**`. | Installed-root evidence only. |
| Exact validator | Installed root resolved `owned_version_matched`, profile `copilot-runtime-plugin`, provenance `matched`, evidence plane `installed_plugin_root`. | Does not claim host-loaded execution. |
| Shared-root isolation | Shared Marketplace plugin digest stayed `882265b857aa72061eb62b303d97c6783169572a7101cd079e8c736a649dc9b2` before and after Copilot migration. | Proves the tested Copilot refresh did not replace shared staged bytes. |
| Footprint | Allocated installed-plugin footprint changed from the prior shared root's 1216 KiB to 748 KiB for the Copilot cache, a 38.5% reduction. | Filesystem allocation, not compressed registry-package size. |

## Evidence Planes

| Plane | Observed state | Evidence boundary |
|---|---|---|
| Canonical source | `verified` | Copilot assets derive from `plugin/` and runtime generator owners; no second editable skill source exists. |
| Generated package | `verified` | Two byte-identical builds, semantic inventory, package contents, Runtime Integrity and complete smoke passed. |
| Durable local stage | `verified` | Independent `agdf-copilot` root has profile-aware provenance and GitHub-documented `.github/plugin/marketplace.json`. |
| Copilot installed plugin store | `verified_current_pending_restart` | Exact installed profile, version, hook and ten skills are present and locally validated. |
| Loaded Copilot session | `unavailable_after_final_refresh` | The app was not restarted and observed after the final refresh. Historical app 1.1.14 evidence proves the AGDF `sessionStart` command can execute, but it is not current loaded-session proof. |
| Linux and native Windows | `unavailable` | No parity claim without direct lifecycle and fresh-session evidence. |
| Public Marketplace and managed policy | `unverified` | The local Marketplace is verified. Publication and managed-policy behavior were not authorized or observed. |

## Deterministic Evidence

- Complete `npm --prefix create-agdf run smoke-test` passed after the host fixes.
- `npm --prefix create-agdf run test:copilot-profile` rejects unmapped, missing, duplicate, stale, excluded, tampered and growing payloads.
- Marketplace tests cover both host orderings, idempotence, wrong provenance, foreign roots and isolated rollback.
- Installer tests cover direct-install migration, exact owned shared-registration migration, same-version cache replacement and failure recovery.
- Pages check, landing test and public-document test passed.
- `node plugin/scripts/check-runtime-integrity.mjs` and 66/66 deterministic skill evaluations passed.

## Remaining Direct Host Evidence

1. Restart the macOS Copilot app and capture plugin identity, version, loaded ten-skill inventory and current hook behavior.
2. Observe gate-check routing in one governed and one ungoverned repository.
3. Observe collision, disable and uninstall behavior while proving repository files remain unchanged.
4. Require separate hosts before Linux or native-Windows parity claims.

These are UAT and support-boundary observations. Package, stage and installed-root evidence do not
substitute for them.
