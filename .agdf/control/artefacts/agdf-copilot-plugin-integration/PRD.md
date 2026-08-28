# PRD: Installable AGDF Plugin for GitHub Copilot

Status: approved  
Gate: PRD  
Gate approval: approved with exact `Approval: PRD` on 2026-08-28  
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md`  
Date: 2026-08-28  
Owner: Arndt Gold

## 1. Product Scope

Deliver one versioned AGDF plugin package for supported GitHub Copilot app and Copilot CLI versions.
The package must expose the canonical AGDF workflow skills, their shared contracts and an
exact-version local validator without requiring those portable components to be copied into every
repository.

The plugin and existing repository bootstrap are complementary:

- the plugin owns portable AGDF skills, packaged runtime validation and host lifecycle integration;
- the repository owns `.agdf/control/`, project-specific instructions and deliberate checked-in
  configuration; and
- installing, enabling or updating the plugin never creates or approves repository delivery state.

The initial release uses exact textual AGDF approvals. A native Copilot input extension is excluded
unless the same delivery run later proves exact option-value transport, deliberate waiting, safe
fallback and same-run/gate/revision revalidation. Default-marketplace publication is a separate
external delivery action and is not required for this product outcome.

## 2. UX Intent And Success

- ui_ux_impact: `medium`
- ux_intent_definition: `ready` at `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md`
- primary_user_intent: Install AGDF once for GitHub Copilot, know whether the expected AGDF version
  and workflow controls are actually available in the current session, and recover safely when they
  are not.
- success_signal: A supported installation reports one coherent version and effective state, a fresh
  session discovers the intended `agdf-` skills, a governed repository continues to use its own
  `.agdf/control/` authority, and every degraded state provides one visible recovery action.
- primary_decision_or_action: Install or update the AGDF plugin, then start or restart a supported
  Copilot session in the intended repository.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `not_installed` | No AGDF plugin is registered for the user | not installed; available source or marketplace; install action | GitHub Copilot plugin registry and effective settings | Copilot Customize or plugin management surface |
| `installed_pending_fresh_session` | Package is installed but the current session has not proven it loaded | installed version; verification; restart or fresh-session requirement | Copilot installation state plus AGDF package verification | AGDF lifecycle result followed by Copilot host state |
| `active_ungoverned_repository` | Plugin skills are loaded; repository has no active AGDF control state | loaded plugin identity; skills available; repository not governed; setup choice | Copilot loaded-session state and exact-version validator | AGDF activation/status presentation |
| `active_governed_repository` | Plugin is loaded and exactly one repository AGDF run can be selected | loaded version; selected run; current gate; allowed next action | Copilot loaded-session state, AGDF validator and selected `RUN_STATE.md` | AGDF status and gate presentation |
| `active_with_project_override` | Plugin is installed but a project or personal skill/instruction has documented precedence | effective skill source; collision or override; non-destructive next action | Copilot discovery and precedence rules plus repository configuration | Copilot skill inventory with AGDF diagnostic guidance |
| `degraded_or_stale` | Installation, provenance, version, hook, validator or loaded-session evidence is incomplete or conflicting | failing phase; expected and observed version; evidence plane; recovery action | Copilot effective state and AGDF package/runtime verification | AGDF lifecycle/status result |
| `repository_bootstrap_only` | Repository-local AGDF files are used without an installed plugin | checked-in instructions and skills; local control state; plugin unavailable or deliberately unused | Repository files and `.agdf/control/` | Repository instructions and AGDF status presentation |
| `disabled_or_uninstalled` | Plugin components must not be treated as available in new sessions | disabled or removed state; retained project files; reinstall action | Copilot effective settings and plugin registry | Copilot plugin management surface |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Users install from a supported marketplace, repository or local
  development source, receive package verification, and start a fresh session when required. Users
  can disable or uninstall the plugin without deleting project-owned `.agdf/control/`, `AGENTS.md`
  or `.github/**` files. Repository bootstrap remains a separate explicit setup action.
- blockers_and_visible_next_actions: Unsupported host version, managed policy, unavailable source,
  invalid manifest, version/provenance mismatch, failed transaction, pending restart, skill collision,
  missing validator and ambiguous AGDF runs each show the failing state and exactly one permissible
  next action. Unknown state never renders as active or healthy.
- recovery_paths: Failed install or update preserves or restores the previous proven installation;
  pending activation directs the user to a fresh session; unavailable automatic checks retain manual
  validation; precedence conflicts are diagnosed without overwriting project or personal files;
  unsupported plugin behavior can fall back to the repository bootstrap; gate approval is never part
  of technical recovery.
- relevant_state_transitions: `not_installed -> installed_pending_fresh_session -> active` after
  successful verification and fresh-session discovery; `active -> update_pending -> active` after an
  atomic verified update; `active -> degraded_or_stale -> active` after bounded repair and renewed
  evidence; `active -> disabled_or_uninstalled` without repository deletion; `active_ungoverned_repository
  -> active_governed_repository` only through explicit repository control setup and gate flow;
  `active -> active_with_project_override` when higher-precedence configuration is detected;
  `plugin_unavailable -> repository_bootstrap_only` only through an explicit user choice.

## 5. Acceptance Criteria

### CPI-AC-01 — Installable coherent package

- working_mode: `not_installed`
- source_state: No AGDF Copilot plugin is installed.
- trigger_action: User installs the generated AGDF plugin through a supported Copilot path.
- expected_effective_state: Exactly one AGDF plugin identity and version are registered.
- visible_feedback: Result names operation, expected and installed version, verification state,
  activation state and one next action.
- blocker_failure_behavior: Invalid source, manifest, ownership or transaction fails closed without a
  partial healthy claim.
- recovery_next_action: Retry a named supported source or retain the previous healthy installation.
- observable_success: Installed plugin can be listed with the canonical AGDF identity and expected version.
- required_evidence: Generated manifest validation, install transaction result and installed-root inventory.

### CPI-AC-02 — Fresh-session skill discovery

- working_mode: `installed_pending_fresh_session`
- source_state: Package installation is verified but loaded-session state is unproven.
- trigger_action: User starts a fresh supported Copilot app or CLI session.
- expected_effective_state: All intended Copilot-prefixed AGDF skills are discoverable from the
  installed plugin.
- visible_feedback: Loaded plugin identity and skill source are inspectable without treating package
  presence as session evidence.
- blocker_failure_behavior: Missing, shadowed or failed skills produce a degraded result rather than
  inferred parity.
- recovery_next_action: Diagnose load failure or precedence, then restart after repair.
- observable_success: Fresh-session inventory shows every declared `agdf-` skill with the expected plugin version.
- required_evidence: Direct fresh-session observation plus deterministic declared-versus-loaded inventory comparison.

### CPI-AC-03 — Correct default governance routing

- working_mode: `active_ungoverned_repository` or `active_governed_repository`
- source_state: Plugin skills are loaded.
- trigger_action: User requests a new build, change, extension, feature, refactor or unclear gated step.
- expected_effective_state: Copilot selects or follows `agdf-gate-check` before later artefacts or implementation.
- visible_feedback: The current allowed action and authority boundary are concise and explicit.
- blocker_failure_behavior: Ambiguous scope or unavailable skill fails closed to clarification or exact-text guidance.
- recovery_next_action: Select the intended repository/run or invoke the visible AGDF gate skill.
- observable_success: Deterministic routing cases and direct host observation preserve the canonical gate order.
- required_evidence: Skill routing tests, generated parity and authenticated fresh-session behavior.

### CPI-AC-04 — Exact-version local validation

- working_mode: `active_ungoverned_repository`, `active_governed_repository` or `degraded_or_stale`
- source_state: An installed plugin claims a specific AGDF version.
- trigger_action: AGDF or the user requests runtime or control-state validation.
- expected_effective_state: The validator resolves from the matching installed plugin payload without
  registry access and reports source, version, runtime digest, evidence plane and provenance.
- visible_feedback: `owned_version_matched` or a truthful unavailable, mismatch or unverified state.
- blocker_failure_behavior: PATH lookup, `@latest`, cache wildcards or older validator fallback are forbidden.
- recovery_next_action: Use the supported install/update/repair path or manual external validation.
- observable_success: Resolve-only and focused doctor/gate-check commands use the installed exact-version runtime.
- required_evidence: Runtime manifest, digest/provenance checks and executed validator output.

### CPI-AC-05 — Repository ownership remains explicit

- working_mode: `active_ungoverned_repository`, `active_governed_repository` or `repository_bootstrap_only`
- source_state: Plugin is installed or repository files already exist.
- trigger_action: Session starts or AGDF is used in the repository.
- expected_effective_state: Plugin content remains portable; `.agdf/control/` and project-specific
  instructions remain repository-owned and change only through their explicit workflows.
- visible_feedback: Status distinguishes plugin availability from repository activation and current gate.
- blocker_failure_behavior: Missing control state never triggers silent scaffold creation or approval.
- recovery_next_action: Offer the permitted minimal UR or explicit repository setup path.
- observable_success: Installing, updating, disabling or uninstalling the plugin leaves repository-owned files unchanged.
- required_evidence: Before/after repository snapshots and lifecycle tests.

### CPI-AC-06 — Safe install, update and rollback lifecycle

- working_mode: `not_installed`, `active` or `degraded_or_stale`
- source_state: A lifecycle operation is requested.
- trigger_action: Install, update, repair, status, disable or uninstall.
- expected_effective_state: One canonical lifecycle model reports package, activation, repository,
  runtime-check and next-action states with bounded atomic transitions.
- visible_feedback: Previous and installed versions, failing phase, retained state and rollback outcome when applicable.
- blocker_failure_behavior: Unknown ownership, tampered provenance, failed replacement or verification
  preserves the last proven state and returns a recovery action.
- recovery_next_action: Retry, restore the proven version, restart, or use manual mode as appropriate.
- observable_success: Successful transitions are version-verified; injected failure cases prove retention or rollback.
- required_evidence: Focused installer/lifecycle tests and direct supported-host observations.

### CPI-AC-07 — Skill precedence without destructive override

- working_mode: `active_with_project_override`
- source_state: Plugin, project or personal components share an effective skill name or instruction boundary.
- trigger_action: Copilot loads the session components.
- expected_effective_state: Documented host precedence applies; AGDF reports the effective source and
  does not overwrite higher-precedence files.
- visible_feedback: Collision, winning source and one non-destructive next action.
- blocker_failure_behavior: Unknown precedence yields degraded/unverified, never assumed plugin control.
- recovery_next_action: Rename, remove or deliberately retain the higher-precedence configuration.
- observable_success: Collision fixtures preserve user files and produce deterministic diagnostics.
- required_evidence: Precedence fixtures and direct loaded inventory where supported.

### CPI-AC-08 — Exact approval authority

- working_mode: `active_governed_repository`
- source_state: A durable AGDF gate artefact is ready for a selected run and revision.
- trigger_action: User makes a gate decision.
- expected_effective_state: Only exact revalidated `Approval: <GateName>` advances the gate.
- visible_feedback: Canonical status and transition presentation followed by exact-text input.
- blocker_failure_behavior: Copilot permission, plan, install, hook, timeout, default or decorated label
  never grants AGDF authority.
- recovery_next_action: Re-evaluate the selected run and request the exact value again only on a fresh explicit attempt.
- observable_success: Positive, stale, wrong-gate and permission-confusion cases preserve the canonical authority boundary.
- required_evidence: Interaction contract tests and direct host behavior for any claimed native adapter.

### CPI-AC-09 — Complementary repository bootstrap

- working_mode: `repository_bootstrap_only` or any active plugin mode
- source_state: User needs checked-in team instructions, control templates or plugin-independent operation.
- trigger_action: User explicitly runs repository setup.
- expected_effective_state: Existing scaffold ownership and merge rules remain unchanged; plugin use is optional.
- visible_feedback: Result names files written, preserved or requiring manual merge.
- blocker_failure_behavior: Existing user-owned `AGENTS.md` and project skills are never silently replaced.
- recovery_next_action: Merge the generated fragment deliberately or continue with plugin-only portable controls.
- observable_success: Existing bootstrap smoke tests remain green with and without an installed-plugin assumption.
- required_evidence: Repository setup fixtures, write-plan checks and generated parity.

### CPI-AC-10 — Honest support and evidence matrix

- working_mode: all
- source_state: Package or documentation makes a surface, operating-system or capability claim.
- trigger_action: Release preparation, QA, UAT or documentation generation.
- expected_effective_state: Every claim identifies its evidence plane and supported Copilot surface/version/OS boundary.
- visible_feedback: Repository, generated bundle, installed root, loaded session, human UAT and
  marketplace publication remain distinct.
- blocker_failure_behavior: Missing direct evidence keeps the claim unverified or unsupported rather than inferred.
- recovery_next_action: Execute the named host evidence or narrow the claim.
- observable_success: Capability matrix and public copy agree with retained evidence and declared limitations.
- required_evidence: Release inventory, Runtime Integrity, host matrix, UAT records and documentation assertions.

### CPI-AC-11 — Bounded session activation and consent

- working_mode: `installed_pending_fresh_session`, `active` or `degraded_or_stale`
- source_state: The plugin can contribute skills, hooks or automatic validation.
- trigger_action: A new or resumed session begins.
- expected_effective_state: Skill loading is passive; any automatic executable runtime check uses the
  existing content-bound consent contract or remains manual.
- visible_feedback: Effective automatic-check state and authority limitation are visible.
- blocker_failure_behavior: Missing, stale or denied consent performs no automatic validation and no mutation.
- recovery_next_action: Continue manually or explicitly review enablement through the supported lifecycle.
- observable_success: Hook and consent tests prove no arguments, network, writes or gate authority in the automatic check path.
- required_evidence: Hook schema validation, consent identity tests and direct invocation evidence where claimed.

### CPI-AC-12 — Updateable marketplace distribution without automatic publication

- working_mode: `not_installed` or `active`
- source_state: A generated AGDF plugin version is available from an AGDF-owned source or marketplace.
- trigger_action: User installs or checks for an update.
- expected_effective_state: Versioned metadata resolves to the exact generated plugin bundle and can be updated through supported host behavior.
- visible_feedback: Source, current and available version, update result and restart requirement.
- blocker_failure_behavior: Moving, conflicting or unknown sources fail closed; no portal or default-marketplace mutation occurs automatically.
- recovery_next_action: Refresh the registered source, pin a proven version or retain the installed version.
- observable_success: Local/repository marketplace tests install and update the intended exact bundle.
- required_evidence: Marketplace schema validation, pinned-source fixture, install/update evidence and separate publication authorization.

## 6. Non-Goals

- Replacing AGDF governance, `.agdf/control/`, the CLI validator or exact approvals.
- Removing or silently migrating the repository-local Copilot bootstrap.
- Shipping a native Copilot approval UI in the initial release without complete gate-safety evidence.
- Automatic publication to a GitHub-managed default marketplace.
- Claiming Copilot cloud agent, code review, Visual Studio Code or operating-system parity without
  separate direct evidence.
- Adding hosted AGDF services, accounts, telemetry, remote governance state, MCP servers or LSP servers.
- Granting technical permissions or enabling automatic checks without the existing informed-consent boundary.

## 7. Users And Roles

- developer or maintainer: installs and updates AGDF, selects repositories and performs technical recovery;
- repository owner or team: owns checked-in instructions and `.agdf/control/` state;
- delivery approver: provides exact AGDF gate approvals and is never replaced by host permissions;
- AGDF maintainer: publishes signed/versioned package sources and maintains compatibility evidence;
- GitHub Copilot host: owns plugin registry, effective settings, permissions, cache, component loading
  and visible host controls;
- organization or enterprise administrator: may manage plugin and marketplace policy; managed state
  remains host authority and must be shown honestly.

## 8. Constraints

- One canonical AGDF definition and generator must own cross-surface identity and content.
- Copilot skill names retain the `agdf-` prefix because plugin skills are not collision-proof namespaces.
- Generated bundles are derived and release-built; source `plugin/` remains runtime-free and is not
  made directly installable unless a later design changes that invariant explicitly.
- Routine validation must not use PATH discovery, registry access, `npx @latest`, cache wildcards or
  an older runtime fallback.
- Plugin installation, settings, permissions and lifecycle actions are technical authority only.
- Project and personal configurations retain host-documented precedence.
- No installation or update may silently mutate repository-owned files.
- Cross-platform paths, process invocation, atomic replacement and rollback must be designed for
  macOS, Linux and native Windows, while support claims require direct evidence.
- Official GitHub plugin, hook and skill contracts are external dependencies and must be revalidated
  during design and before release.
- Existing unrelated worktree changes remain outside this run.

## 9. Evidence Requirements

- exact generated plugin inventory, manifest and marketplace validation;
- canonical-to-generated parity for all declared Copilot skills and shared contracts;
- exact-version runtime manifest, source/runtime digests and provenance result;
- focused install, update, rollback, disable, uninstall, collision and repository-preservation tests;
- Runtime Integrity, release preparation and package smoke results;
- direct plugin installation and fresh-session skill discovery in the installed Copilot app;
- direct Copilot CLI lifecycle and loaded-session evidence for claims made about that surface;
- native Windows and Linux evidence before parity claims, or an explicit narrowed support matrix;
- interaction tests proving permissions and plugin actions cannot advance an AGDF gate;
- human UAT for installation, visible states, recovery, governed use and uninstall retention;
- separate evidence for any marketplace publication or managed-policy behavior.

## 10. Risks And Open Questions

- Solution Design must determine whether one generated runtime plugin can safely carry separate
  Copilot skill names and hook files, or whether a dedicated derived Copilot directory is required.
- Solution Design must identify the supported local, repository and marketplace install transports
  available to the app and CLI without introducing a parallel installer.
- The documented Copilot hook contract differs from the current AGDF plugin hook. Design must decide
  whether a Copilot-specific hook is necessary for the initial outcome and how it provides context
  without noise, mutation or unauthorized execution.
- Plugin-local validator discovery and plugin-root variables require executed proof.
- GitHub-managed policy can supersede local settings and may limit install/update control.
- Direct Linux and native-Windows environments may be unavailable during the run. QA must narrow
  claims or remain revise rather than infer parity.
- Native user-input and extension capabilities may be useful later but are outside the baseline until
  their approval transport is proven gate-safe.
- The effective version compatibility policy for future Copilot releases must be explicit and must
  not rely solely on one observed app version.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
