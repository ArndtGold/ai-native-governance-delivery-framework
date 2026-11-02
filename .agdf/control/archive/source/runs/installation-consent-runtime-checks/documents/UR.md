# UR: Add Informed Installation Consent for Automatic AGDF Runtime Checks

Status: approved
Gate: UR
Gate approval: `Approval: UR` recorded 2026-08-27
Date: 2026-08-27
Owner: Arndt Gold

## 1. Problem

AGDF may need to run local, read-only runtime and repository-state checks so a coding-agent session
can establish the installed validator, provenance and current control state. On hosts such as Claude
Code, those checks can produce repeated technical permission prompts during ordinary work. The
prompts interrupt the user without clearly explaining the recurring capability, while broad host
permission bypasses would weaken least-privilege protection.

The current installation flow does not provide one clear, informed and reversible decision about
whether AGDF may perform narrowly defined automatic checks. Host-specific permission and hook trust
mechanisms therefore remain disconnected from the user's installation decision.

## 2. Goal

Make installation and update flows able to request explicit, informed consent for narrowly scoped
automatic AGDF runtime checks across supported coding-agent hosts. A consenting user should avoid
repeated prompts for the same safe checks, while a user who declines must retain a usable manual
confirmation path.

The installation decision must remain a host-technical permission only. It must never approve an
AGDF gate, widen delivery scope or authorize implementation, QA, UAT, release or VCS actions.

## 3. Scope

This first scope establishes the governed need for:

- one shared consent meaning across Codex, Claude Code and OpenCode, with host-specific adapters;
- an explicit host and operating-system capability matrix covering macOS, Linux and native Windows
  wherever the supported host can run AGDF, with honest unsupported or degraded outcomes instead of
  inferred parity;
- an installation or update interaction that explains what runs, when it runs, which local paths it
  can access, whether it writes files or uses the network, where consent is recorded and how it can
  be revoked;
- an explicit choice to enable automatic checks, continue without automatic checks or cancel the
  installation action;
- least-privilege handling limited to the version-matched AGDF runtime and repository-state checks
  required for session orientation and deterministic gate evidence;
- safe behavior for interactive and non-interactive installation, unsupported hosts, declined
  consent, stale consent and host-native trust or permission mechanisms;
- re-evaluation when the trusted hook, validator identity, provenance or effective permission scope
  changes materially;
- status and recovery guidance that shows whether automatic checks are enabled, unavailable,
  declined or require renewed consent; and
- Windows-specific handling of PowerShell command construction, path and quoting semantics,
  filesystem permissions, configuration locations, interactive and non-interactive execution and
  safe rollback; and
- separate repository, package, installed-host and fresh-session evidence for every supported host
  and operating-system combination, including direct native-Windows evidence where Windows support
  is claimed.

## 4. Non-Goals

- Granting blanket permission to Bash, Node, all plugin scripts, unrestricted filesystem access or
  network access.
- Bypassing Codex hook trust, Claude Code permission enforcement, OpenCode permissions, sandboxes,
  managed policy or operating-system controls.
- Treating installation consent, hook trust or tool permission as `Approval: <GateName>`.
- Silently editing user or project configuration without explicit consent and ownership checks.
- Adding telemetry, a hosted service, an account requirement, a remote validator or automatic
  registry access.
- Selecting the final interaction design, persistence format or per-host command rules before
  Brownfield Review and the required later gates.
- Implementing, releasing, publishing or modifying installed host state as part of this UR.
- Claiming Windows support from macOS or Linux execution, path simulation or repository-only tests.

## 5. Acceptance Signals

The need is clear enough for Brownfield Review when:

1. the repeated-prompt problem and the protected least-privilege boundary are explicit;
2. automatic checks are limited to a transparent, reviewable and revocable technical capability;
3. enable, decline and cancellation outcomes preserve usable and honest host behavior;
4. host-native trust and permission systems remain authoritative and are not bypassed;
5. installation consent is explicitly separated from every AGDF gate approval;
6. changed executable or permission scope cannot silently inherit stale consent;
7. existing installer, runtime, interaction and provenance owners are named for reuse; and
8. repository validation is not presented as proof of effective fresh-host behavior;
9. every supported host has an explicit macOS, Linux and native-Windows capability outcome rather
   than an assumed cross-platform result;
10. any claimed native-Windows path has direct evidence for installation, consent persistence,
    status, revocation, update invalidation, rollback and a fresh post-install session; and
11. unsupported host and operating-system combinations remain usable through an honest manual
    confirmation path and do not receive broad fallback permissions.

## 6. Existing Source Of Truth

- `create-agdf/lib/installers/plugin-installers.js` owns Codex and Claude Code installation lifecycle
  operations.
- `create-agdf/lib/installers/opencode.js` owns the OpenCode config-local runtime and permission
  integration.
- `create-agdf/lib/installers/local-marketplace.js` owns durable marketplace staging, provenance,
  ownership checks, promotion and rollback.
- `plugin/hooks/hooks.json` and `plugin/hooks/session-start.sh` own the shared plugin session-start
  activation path.
- `create-agdf/lib/runtime/plugin-provenance.js` and the generated runtime own version, digest and
  installed-plugin provenance evidence.
- `plugin/meta/contracts/interaction.md` owns the boundary between host technical permission and
  AGDF gate approval.
- The `installer-output-parity` run owns the established lifecycle result and human installation
  presentation boundaries.
- The `agdf-cross-host-runtime-integrity` run owns the shared validator, distribution-profile,
  provenance and evidence-plane boundaries.
- The `windows-native-install-viability` run records current native-Windows installer, filesystem
  swap and capability-probe evidence; it is reusable evidence, not proof that the new consent flow
  already works on Windows.
- Host documentation and observed host behavior are external capability evidence, not AGDF
  authority.

## 7. Risks And Unknowns

- Supported hosts expose materially different installation, hook-trust and permission mechanisms.
- Host and operating-system combinations may expose different permission storage, shell, path,
  quoting, filesystem ACL, non-interactive and rollback behavior; host support on one operating
  system must not be generalized to another.
- A host may not support safely persisting the narrow permission requested by the installer.
- Permission rules tied only to a stable path could survive a changed executable and become too
  broad unless version, digest or renewed-trust behavior is designed carefully.
- Non-interactive installation cannot obtain deliberate consent and needs a safe, explicit policy.
- Updates may change the hook or validator while host caches preserve older content.
- Automatic checks must remain bounded in runtime cost and must not turn every session into a full
  validation ritual.
- Fresh-session behavior may differ from repository, package or installed-root evidence and must be
  observed independently.
- Direct native-Windows testing may remain unavailable during earlier delivery stages; any resulting
  evidence gap must block a Windows-support claim rather than be replaced by simulation.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
