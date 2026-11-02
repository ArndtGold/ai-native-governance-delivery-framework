# PRD: Simple Local Plugin Installation Scripts

Status: approved
Gate: PRD
Gate approval: approved
Based on: `.agdf/control/artefacts/agdf-local-plugin-install-scripts/UR.md`
Date: 2026-08-23
Owner: Arndt Gold

## 1. Product Scope

Deliver three repository-level contributor commands from the AGDF source checkout:

- `npm run install:codex`
- `npm run install:claude`
- `npm run install:opencode`

Each command prepares and validates the current source-owned runtime, then delegates installation or update to the existing surface-specific lifecycle owner. The result must clearly identify the surface, operation, version evidence, verification status, restart requirement and next action. The public `npx --yes @agdf/cli@latest ...` commands remain unchanged.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics in this PRD; Brownfield Review classified the command aliases as preserving existing installation and recovery behavior
- primary_user_intent: Install or refresh the AGDF plugin being developed in the current checkout without remembering build, marketplace and host-specific command sequences.
- success_signal: One named npm command completes source preparation and the existing safe lifecycle path, then reports what was installed, what was verified and what the contributor must do next.
- primary_decision_or_action: Select the target host by running its explicit `npm run install:<surface>` command.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Codex local checkout installation | The source-built AGDF marketplace is registered and the expected plugin version is installed or updated for Codex. | preparation status, install/update result, expected and observed version, verification, restart requirement, next action, typed failure | owned marketplace state plus `codex plugin list` | existing AGDF lifecycle presentation |
| Claude Code local checkout installation | The source-built AGDF marketplace is registered and AGDF is installed or updated for Claude Code; version evidence may be degraded when the host omits it. | preparation status, install/update result, version or explicit missing-version evidence, verification, restart requirement, next action, typed failure | owned marketplace state plus `claude plugin list` | existing AGDF lifecycle presentation |
| OpenCode local checkout installation | The current checkout's exact AGDF package and generated native surface are installed or updated in the configured OpenCode environment. | preparation status, package transition, expected and installed version, SDK alignment, verification, restart requirement, next action, typed failure | owned OpenCode configuration, installed package and existing `opencode-status` evaluation | existing AGDF lifecycle and OpenCode status presentation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Running a script mutates only the selected host's existing global AGDF installation scope. Successful installation reports that a host restart is required. The script does not restart, activate or deactivate the host and does not initialize repository governance.
- blockers_and_visible_next_actions: Missing host CLI, invalid or unowned marketplace/configuration, source-preparation failure, version mismatch, package/SDK misalignment and host-command failure must stop the command with a non-zero exit and one specific corrective action.
- recovery_paths: A contributor can correct the reported condition and rerun the same command. Codex and Claude Code preserve the existing transactional marketplace rollback. OpenCode preserves its ownership preflight and existing recovery semantics. No command silently falls back from the checkout to a registry package.
- relevant_state_transitions: `source checkout -> prepared exact bundle -> existing lifecycle install/update -> verification result -> restart pending`; any failed preparation or lifecycle step returns a visible typed failure and retains or restores the last valid owned state where the existing lifecycle supports rollback.

## 5. Acceptance Criteria

| criterion_id | working_mode | source_state | trigger/action | expected effective state | visible feedback | blocker/failure behavior | recovery/next action | observable success | required evidence |
|---|---|---|---|---|---|---|---|---|---|
| LPI-1 | all | contributor is at repository root | inspect npm scripts | exactly three install entry points are discoverable for Codex, Claude Code and OpenCode | stable script names | missing or duplicate aliases fail manifest tests | restore the canonical three aliases | `npm run` exposes all three commands | package-manifest test |
| LPI-2 | all | source or generated assets may differ | run any install script | canonical source preparation completes before host mutation | preparation failure is explicit | no host lifecycle command runs after failed preparation | fix source/preparation error and retry | installer receives a version-coherent current-checkout bundle | ordered orchestration fixture and Runtime Integrity evidence |
| LPI-3 | Codex | Codex CLI is available | run `npm run install:codex` | existing Codex installer installs or updates the source-built plugin | lifecycle result shows surface, operation, expected/installed version, verification and restart | missing CLI, conflict or version mismatch fails closed | use the reported correction and rerun | native list evidence matches the expected checkout version | fake-host lifecycle test plus optional live-host observation |
| LPI-4 | Claude Code | Claude CLI is available | run `npm run install:claude` | existing Claude installer installs or updates the source-built plugin | lifecycle result shows healthy or explicitly degraded version verification and restart | missing CLI, conflict or host failure fails closed | use the reported correction and rerun | marketplace and plugin list evidence match supported host output | fake-host lifecycle test plus optional live-host observation |
| LPI-5 | OpenCode | OpenCode config directory is writable and owned paths are valid | run `npm run install:opencode` | current checkout package and native surface are installed without resolving the already-published AGDF version | package transition, exact version, SDK alignment, verification and restart are visible | unowned config, package failure or alignment failure stops visibly | correct the named condition and rerun | installed package content/digest originates from the current prepared checkout | isolated config fixture, package-content proof and optional live-host observation |
| LPI-6 | all | the expected checkout version is already installed | rerun the same install script | the command reports a safe no-change or update result without creating another registration | idempotent outcome is visible | conflicting unowned state remains blocked | resolve ownership conflict explicitly; no auto-replacement | exactly one owned AGDF installation remains | repeated-install lifecycle fixtures |
| LPI-7 | Codex and Claude Code | marketplace name is owned by another source or is ambiguous | run the selected script | no unowned registration is replaced | ownership conflict and target path are visible | command exits non-zero before destructive replacement | user resolves the conflict outside the command, then retries | pre-existing unowned state remains unchanged | negative ownership fixtures |
| LPI-8 | all | source preparation or host installation fails | run the selected script | partial work does not become a false successful installation | failing phase and recovery action are visible | command exits non-zero; prior valid owned state is retained or rolled back according to the canonical lifecycle | fix cause and rerun | failure fixtures prove state preservation and no success output | lifecycle rollback and interruption tests |
| LPI-9 | all | installation command completes | inspect output | repository, exact-bundle, installed-package/cache, host-load and UAT evidence remain distinct | output states what is verified and what remains pending | no repository or package check may claim restarted-host activation | restart host and perform separate observation when required | restart remains an explicit next action and live-host proof is not inferred | lifecycle-presentation assertions |
| LPI-10 | all | supported development platform | run scripts through npm | orchestration uses Node/npm-compatible commands without shell-specific chaining | the same command names apply across supported platforms | unsupported executable or filesystem conditions fail explicitly | install prerequisite or correct environment and retry | deterministic fixtures pass on supported CI platforms | cross-platform command construction tests |
| LPI-11 | all | contributor reads repository guidance | open contributor installation section | local checkout scripts and public npm bootstrap are clearly separated | concise command table and scope wording | documentation must not imply publication, release, restart or UAT | follow the path matching contributor or end-user intent | commands, scope and evidence boundaries match runtime behavior | documentation assertions and link checks |

## 6. Non-Goals

- Adding `status:<surface>`, uninstall, repository-local or combined install aliases in this first slice.
- Changing the public CLI command grammar, package names, plugin IDs, marketplace schemas or host-specific lifecycle semantics.
- Installing every surface through one implicit command.
- Automatically restarting hosts, initializing `.agdf/control`, accepting approvals or claiming repository activation.
- Publishing npm packages, releasing plugins or changing marketplace/distribution policy.
- Treating the Project Inventory installer implementation as an AGDF source of truth.

## 7. Users And Roles

- Primary user: AGDF contributor or maintainer testing the current source checkout.
- Secondary user: reviewer reproducing an exact pre-release plugin build locally.
- Product owner: approves the command contract and evidence boundaries through AGDF gates.
- Existing lifecycle modules: remain the technical authority for installation, ownership, rollback, verification and visible result semantics.
- Host applications: remain authoritative for actual loaded-plugin behavior after restart.

## 8. Constraints

- Node.js and npm remain prerequisites; the selected host CLI must exist where the current lifecycle requires it.
- Commands must run from the AGDF repository root and must not contact the npm registry to substitute a published AGDF package for current-checkout content.
- Canonical version metadata and generated runtime digests must remain coherent before installation.
- Existing owned-state, conflict, rollback and fail-closed guarantees must not be weakened.
- User-owned configuration and unrelated worktree changes must remain untouched.
- Durable AGDF artefacts remain English; user-facing AGDF interaction follows project locale configuration.

## 9. Evidence Requirements

- Root manifest assertions for the exact three aliases and their canonical orchestration target.
- Ordered fixture evidence that source preparation finishes before any host mutation.
- Existing plus new lifecycle fixtures for install, update, no-change, conflict, failure and rollback outcomes.
- Exact generated-bundle Runtime Integrity and package/version coherence checks.
- OpenCode fixture proof that installed content comes from the prepared checkout rather than the registry-resolved published package.
- Documentation assertions distinguishing contributor checkout commands from public bootstrap.
- `git diff --check`, focused tests and the full relevant `create-agdf` smoke suite before QA.
- Installed-package/cache and restarted-host observations recorded separately; authenticated live-host UAT remains a later human decision.

## 10. Risks And Open Questions

- SD must choose the smallest cross-platform orchestration owner for running source preparation and the existing CLI without duplicating command routing.
- SD must define a checkout-local OpenCode package transport that preserves exact version, SDK alignment, ownership and rollback semantics.
- TP must isolate every installation test from real user host configuration and prevent registry/network dependency.
- Claude Code may omit version information; existing degraded-but-honest verification behavior must remain unchanged.
- A same-semver source rebuild can differ in digest from an installed plugin; SD must define how the local update is made observable without changing public release versioning.

## 11. Next Step

Draft the bounded Solution Design while implementation remains forbidden.
