# Copilot Host Evidence

Date: 2026-09-03
Run: `agdf-copilot-plugin-integration`
Package version: `0.14.5`

## 2026-09-03 Repo-less Early-Return Revision

| Observation | Result | Boundary |
|---|---|---|
| Fresh restarted GeneralChat | Copilot correctly classified the repo-less chat as `target_unresolved`, not `repository_ungoverned`, and withheld repository activation. It then incorrectly reused a prior draft UR, reported `BLOCKED` and requested `Approval: UR`. | Direct loaded-host evidence. Target classification passed; terminal early-return behavior failed. |
| Root cause | The gate-check skill stated the unresolved stop rule, but general missing-control and fresh-UR guidance remained available later in the same instruction body and was followed conditionally from chat history. | Instruction-order defect on an `instruction_only` surface, not a validator or installed-provenance defect. |
| Correction | The canonical target contract now makes unresolved terminal for the response. The gate-check skill places a mandatory early return before repository inspection and explicitly forbids prior-UR branches, speculative context menus, `BLOCKED`, gate and approval output. | Canonical source and generated-surface behavior contract. |
| Regression | A new adversarial case includes a prior draft UR and exact approval bait. Runtime Integrity and 70/70 deterministic skill evaluations pass. | Deterministic replay, not renewed loaded-host proof. |
| Aggregate verification | The final complete `npm --prefix create-agdf run smoke-test` passes with 389 package files, four generated skill surfaces, 70/70 evals and plugin-only Copilot routing. | Repository and package evidence. |
| Refreshed install | `npm --prefix create-agdf run install:copilot` reports AGDF 0.14.5 verified and Ready. The installed gate-check skill, locale registry and inventory are byte-identical to the generated Copilot profile. The profile contains 82 files and 603481 bytes; the installed validator renders Revision 34 fully in German. Resolver reports profile `copilot-runtime-plugin` and matched provenance. | Installed-root evidence; a second restart is still required. Automatic checks remain Manual. |
| Second restarted GeneralChat | Copilot now stops after unresolved and emits no prior UR, `BLOCKED`, gate or approval. It still labels the internal chat folder as `current_repository`, producing `target_content_mismatch`, and invokes target-check without the German chat locale. It also adds process narration and path examples after the canonical card. | Direct loaded-host evidence. Terminal early return passed; target-source, locale and concise-output behavior require revision. |
| Invocation correction | The unresolved path now omits `--target-source` and `--primary-target`, passes only working-directory context plus `--language de`, and forbids treating Copilot chat storage as repository selection. The CLI usage surface shows both unresolved and resolved forms. | Canonical skill and CLI contract; no second resolver or host heuristic. |
| Corrected executable result | The exact context-only command returns `no_reliable_target`, empty target authority and a fully German Task Target Orientation with `Ein primäres Ziel benennen.` | Direct installed validator evidence, not loaded-model behavior. |
| Final refresh | Complete smoke and 70/70 evals pass. Installed 0.14.5 is Ready with an 82-file, 604307-byte profile. | Source, package and installed-root evidence; another restart remains required. |
| Third restarted GeneralChat | Copilot returns `no_reliable_target`, does not promote the chat folder to repository authority and asks exactly one short target question without process narration or examples. The canonical card and question remain English in the German conversation. | Direct loaded-host evidence. Target and concise-output behavior pass; locale behavior still fails. |
| Explicit conversation-locale correction | The skill now resolves language from the user's current natural-language conversation before invocation. A German turn or ongoing German conversation requires literal `--language de`; English skill, command and host text cannot override it. The follow-up question must use the renderer's `presentation_language`. | Instruction-only correction with static integrity locks and a German adversarial replay case. |
| Locale correction refresh | Complete smoke and 70/70 evals pass. Installed 0.14.5 is Ready, generated and installed gate-check bytes match, and the final profile contains 82 files and 604901 bytes. The installed executable renders the same context-only request fully in German with literal `--language de`. | Source, package, installed-root and direct executable evidence; a fourth restarted loaded-host observation remains required. |

The three fresh observations close the former uncertainty about repo-less classification, terminal
stopping, target authority and concise output. They also expose successively narrower instruction
and locale-following defects, all corrected in the current installed bytes. QA remains `revise`
until the locale-corrected installed skill is observed after another full Copilot restart. Repository-bound
and automatic SessionStart observations also remain open.

## 2026-09-03 Task-Target Binding Revision

| Observation | Result | Boundary |
|---|---|---|
| Final aggregate verification | `npm --prefix create-agdf run smoke-test` passed after the final `current_repository` correction. It includes release preparation, package build, lifecycle, retention, Runtime Integrity, four generated skill surfaces, 70/70 deterministic skill evals and plugin-only Copilot routing. | Deterministic repository and package evidence, not loaded Copilot behavior. |
| Deterministic profile | Two release builds produced the same semantic inventory before final review; the final reviewed profile contains 82 mapped files and 604307 bytes. | Generated-profile evidence; the inventory excludes its own file and installation provenance. |
| Installed profile | `npm --prefix create-agdf run install:copilot` reported version 0.14.5 verified and Ready. Installed validation reports `owned_version_matched`, `copilot-runtime-plugin`, runtime digest `4b242df5...2ddd` and matched provenance. | Installed-root evidence after the final smoke run; restart remains required. |
| Generated/installed identity | Generated and installed SessionStart hooks share SHA-256 `fc1136c...3ff4`; generated and installed inventories share SHA-256 `c5544d85...2a53`. Direct `cmp` returned 0 for both. | Proves byte identity, not that a fresh app session loaded those bytes. |
| Installed QA status card | The installed validator renders the current QA status as a complete German table, including allowed and forbidden actions, next step and quality outlook; presentation diagnostics are empty. | Direct installed-runtime rendering, not Copilot chat rendering. |
| Repo-less target preflight | The installed validator against Copilot chat cwd `005e2eeb-...` returns `unresolved`, `no_reliable_target`, empty primary/governance target and a fully German Task Target Orientation. | Direct installed-runtime behavior. It proves no cwd fallback in the executable preflight, not model compliance in a fresh session. |
| False current-repository claim | The installed validator rejects the repository as `current_repository` when the supplied working directory is the repo-less Copilot chat cwd. It returns `target_content_mismatch` and no governance target. | Direct negative installed-runtime evidence. |
| True current repository | The installed validator resolves the same repository when both primary target and working directory are the verified Git worktree. | Direct positive installed-runtime evidence. |
| SessionStart consent | Existing receipt requests automatic checks, but the changed capability identity is `renewal_required`; the installer therefore leaves automatic behavior inactive. | No consent was inferred from TP approval or installation. Fresh hook evidence requires a new explicit runtime-check decision. |

The executable defect is corrected in source, generated package and installed 0.14.5. Current
fresh-session Copilot evidence remains open because the app has not been restarted with renewed
automatic-check consent. The implementation does not claim that the instruction-only skill layer
technically intercepts every host command.

## 2026-09-03 Locale And SessionStart Revision

| Observation | Result | Boundary |
|---|---|---|
| Copilot UAT before correction | Version and provenance were consistent, validator and hook executed, and the status card rendered as a table. German labels were paired with English operational values. | Direct Copilot feedback; locale decision was revise. |
| Aggregate warning clarification | The observed 37 findings came from `doctor --all-active` across 17 runs. The selected status-card run reported pass with 0 findings. | Portfolio governance evidence, not an installed-plugin defect. |
| SessionStart mismatch before correction | Initial context said `.agdf/control/config.json` was missing although a current hook invocation found it. | Direct Copilot feedback; the process working directory and event target were inconsistent. |
| Root-cause correction | The canonical renderer now resolves registered operational values through the complete locale pack and fails closed with diagnostics on unregistered non-fallback text. The generated checker uses the official SessionStart event `cwd` for doctor and config resolution. | Repository implementation and deterministic tests. |
| Complete aggregate evidence | One complete `npm --prefix create-agdf run smoke-test` passed with 67/67 skill evals and plugin-only Copilot routing. | Deterministic repository/package evidence, not fresh-session evidence. |
| Corrected installed state | `npm run install:copilot` reported `AGDF updated for GitHub Copilot`, version 0.14.5 verified and Ready. Installed validator reports profile `copilot-runtime-plugin` and matched provenance. | Direct installation and installed-root evidence. |
| Installed status card | The installed validator renders the selected German card with localized operational values and unchanged canonical gate/diagnostic tokens. | Direct installed-runtime invocation, not Copilot chat rendering. |
| Final UAT-transition refresh | Generated and installed inventories both report version 0.14.5, profile `copilot-runtime-plugin`, 80 files and 581942 bytes. The installed validator renders the UAT operational card fully in German. | Direct installed-root evidence after the QA-to-UAT locale regression; a fresh app session remains unverified. |
| Installed SessionStart bytes | Generated and installed `agdf-session-check.js` share SHA-256 `86eebea02da9ec87564791604fb2043940d3b57aecfa26f74861d6f07019842a`. | Proves installed code identity, not a newly started session. |
| Automatic runtime checks | The refresh reports `Automatic checks: Manual`. | Fresh hook UAT requires separate deliberate consent before restart. |

The two reported defects are corrected in source, generated payload and installed 0.14.5 bytes. A
fresh Copilot session remains necessary to prove loaded behavior and is not inferred from the
successful installed-runtime invocation.

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
- `node plugin/scripts/check-runtime-integrity.mjs` and 67/67 deterministic skill evaluations passed.

## Remaining Direct Host Evidence

1. Restart the macOS Copilot app and capture plugin identity, version, loaded ten-skill inventory and current hook behavior.
2. Observe gate-check routing in one governed and one ungoverned repository.
3. Observe collision, disable and uninstall behavior while proving repository files remain unchanged.
4. Require separate hosts before Linux or native-Windows parity claims.

These are UAT and support-boundary observations. Package, stage and installed-root evidence do not
substitute for them.
