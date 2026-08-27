# PRD: Informed Installation Consent for Automatic AGDF Runtime Checks

Status: approved; revision 2
Gate: PRD
Gate approval: exact `Approval: PRD` recorded 2026-08-27 after same-run, same-gate and revision-2 revalidation
Based on: approved `UR.md` revision 2, completed `BROWNFIELD_REVIEW.md` and ready
`UX_INTENT_DEFINITION.md`
Date: 2026-08-27
Owner: Arndt Gold

## 1. Product Goal

Give every AGDF user an informed, deliberate and reversible decision during every interactive
installation or update for narrowly defined automatic local runtime checks. A still-valid existing
decision is shown as context, but is never retained silently in an interactive update. When the
selected host can express and verify the required least-privilege rule, enabling the capability
should prevent repeated host prompts for the same unchanged checks between updates. Declining,
omitting or revoking consent must leave AGDF usable through manual host confirmation.

This is technical execution consent only. It never authorizes an AGDF gate, implementation, QA,
UAT, release, version-control action, network access or a broader command family.

## 2. Users And Jobs

- Interactive installer: understand the exact recurring capability and choose enable, manual or
  cancel before any consent-dependent mutation.
- Existing user updating AGDF: see the current decision and deliberately choose enable, manual or
  cancel again before the update mutates plugin or permission state.
- Security-conscious user or administrator: preserve host and managed-policy restrictions, inspect
  effective state and revoke the capability without uninstalling AGDF.
- Non-interactive operator: select an explicit policy value or receive the safe manual default;
  absence of input is never inferred consent.
- Maintainer and reviewer: distinguish intended consent, host-effective permission, executable
  identity and fresh-session behavior for every claimed host/OS combination.

## 3. Consent Scope

The consent request covers only AGDF-owned, local, read-only checks needed to establish the active
runtime and repository governance state:

1. resolve the installed AGDF plugin or config-local runtime and its manifest;
2. verify the expected AGDF version, runtime digest and installation provenance;
3. read the selected repository's `.agdf/control/` state without creating or changing it; and
4. invoke only the version-matched local AGDF validator's read-only resolution, health, gate or
   delivery-state projections required for session orientation.

The consent excludes arbitrary shell or PowerShell execution, unrestricted Node execution, broad
filesystem access, writes, package installation, registry resolution, network access, source-control
commands and non-AGDF scripts. Solution Design must translate this semantic scope into the narrowest
host-native permission or trust mechanism available. If a host cannot express or verify that scope,
automatic mode is unavailable and the product stays in manual mode.

## 4. Shared Decision Journey

### 4.1 Disclosure

Before a consent-dependent configuration change, the installer or updater must show:

- the selected host and installation scope;
- the automatic checks covered by Section 3 and when they run;
- the local executable identity and paths the checks may read;
- that the checks are read-only and perform no network access;
- the host or configuration owner that records the effective technical permission;
- how updates can require renewed consent; and
- how to inspect and revoke the decision later.

### 4.2 Deliberate Outcomes

The interaction presents three distinct outcomes with no preselected enabling choice:

1. **Enable automatic checks**: apply only the supported narrow host-native rule, verify the
   resulting state and report enabled or a truthful degraded result.
2. **Continue in manual mode**: complete the installation or update without the automatic rule;
   host prompts may still occur when checks are later requested.
3. **Cancel**: stop before the consent-dependent installation mutation and report that no requested
   permission change was applied.

Decline, cancel, unreadable configuration, managed-policy denial and unsupported capability must not
be reframed as an error that pressures the user to enable access.

### 4.3 Non-Interactive Operation

Non-interactive installation defaults to manual mode. Automatic mode is allowed only when the caller
supplies one explicit, documented policy value for the exact capability and the host can apply and
verify it safely. Environment detection, CI presence, prior unrelated permissions or lack of a TTY
never implies consent. A managed policy may restrict or deny enablement but cannot be overridden by
the installer.

## 5. Effective State And Authority

| Visible state | Required effective condition | User consequence |
|---|---|---|
| `decision required` | No current deliberate decision exists for the effective capability identity | Choose enable, manual or cancel |
| `enabled` | Deliberate enablement, current executable/capability identity and verified host-effective permission or trust all agree | Covered checks run without recurring AGDF-created prompts |
| `manual` | Consent is declined, absent, revoked, unsupported or cannot be verified | AGDF remains usable with host confirmation where required |
| `renewal required` | Executable identity, covered checks, accessed paths or permission scope changed materially | Review the changed disclosure before automatic checks resume |
| `unavailable` or `degraded` | The host, OS or managed policy cannot safely express or verify the narrow rule | No broad fallback; use manual mode and show why |
| `cancelled` | The user cancelled before the requested mutation | Preserve the prior effective state |
| `failed` | A supported application or verification step failed | Roll back installer-owned changes where safe and show one recovery action |

Host-native permission, hook trust and managed policy remain authoritative for execution. AGDF
provenance identifies the capability being considered. Any AGDF-owned consent receipt may record
intent and identity evidence for status and renewal, but it is never a second permission authority
and never an AGDF gate approval.

Consent applies to one host installation and one effective AGDF capability identity. It is not a
blanket per-user, per-machine or per-repository grant. A repository may narrow host access further
but cannot widen installation consent.

## 6. Renewal, Revocation And Recovery

- A material change to the hook, validator digest, covered command set, accessed path classes,
  write/network behavior or host-native permission scope invalidates automatic mode until renewed.
- A version-only update may retain consent only when the effective capability identity proves that
  the disclosed executable content and permission scope are unchanged.
- Status must show the selected host, automatic/manual state, verification state, effective
  capability identity and one next action without exposing sensitive configuration content.
- Revocation uses the existing lifecycle owner, removes only proven AGDF-owned configuration or
  directs the user to the authoritative host control, and leaves AGDF installed in manual mode.
- Failed application, verification or update must preserve unrelated user settings. Atomic rollback
  must restore the previous installer-owned state where supported and report any retained ambiguity.
- Reinstallation must not silently convert manual, revoked, denied or ambiguous state to enabled.

## 7. Host And Operating-System Capability Matrix

The first delivery targets Codex, Claude Code and OpenCode on macOS, Linux and native Windows. Every
cell must provide at least a usable manual path. Automatic enablement is a release claim only where
the host-native mechanism can narrowly apply, inspect and revoke the Section 3 capability and the
required direct evidence exists.

| Host | macOS target | Linux target | Native Windows target |
|---|---|---|---|
| Codex | Narrow automatic mode when host trust permits; otherwise manual | Narrow automatic mode when host trust permits; otherwise manual | Narrow automatic mode only with direct native-Windows proof; otherwise explicitly manual or unsupported |
| Claude Code | Narrow automatic mode when permission rules can be safely scoped and verified; otherwise manual | Narrow automatic mode when permission rules can be safely scoped and verified; otherwise manual | Narrow automatic mode only with direct native-Windows proof of PowerShell, paths and permission behavior; otherwise explicitly manual or unsupported |
| OpenCode | Preserve explicit user decisions and use only safe missing-state integration; otherwise manual | Preserve explicit user decisions and use only safe missing-state integration; otherwise manual | Automatic mode only with direct native-Windows proof of configuration, PowerShell, paths and rollback; otherwise explicitly manual or unsupported |

The matrix describes the target outcome, not current proof. A cell cannot be labelled supported for
automatic mode until installation, enable, decline, status, revoke, renewal, rollback and fresh
session have been observed on that host/OS combination. Simulation, repository tests or evidence
from another operating system may support diagnosis but cannot satisfy the claim.

## 8. Presentation And Compatibility Requirements

- Extend the existing installation lifecycle result and presentation owners. Do not create a second
  settings product, installer or status evaluator.
- Use one shared consent vocabulary and state model. Host adapters may vary only in transport,
  capability and recovery details.
- Existing installations start as manual or decision-required unless current narrow consent can be
  proven without overriding an explicit user or managed-policy decision.
- Preserve unrelated user/project configuration and every explicit allow, ask or deny decision.
- Human output names the actual effective result. Successful installation does not imply enabled
  automatic checks, and repository/package success does not imply fresh-session behavior.
- Machine output uses stable values for requested outcome, effective state, verification,
  capability identity, mutation, rollback and next action. Exact schema design belongs to SD.
- Windows paths, quoting and command presentation must be native-safe and must not assume Bash,
  POSIX separators, executable bits, symlinks or Unix configuration locations.

## 9. Acceptance Criteria

Each criterion must later map to implementation tasks, automated checks and direct host evidence
where specified.

### PRD-IC-01 — Complete Informed Disclosure

- source_state: every interactive install or update reaches the consent decision, including an
  identity-equivalent update with a still-valid receipt
- trigger_action: the product requests automatic-check consent
- expected_effective_state: no permission mutation has occurred yet
- visible_feedback: host, scope, covered checks, local paths, read-only/no-network promise,
  persistence owner, renewal trigger, revocation path and current requested state are visible
- blocker_failure_behavior: missing disclosure prevents enablement and leaves manual mode available
- observable_success: the user can distinguish the narrow capability from arbitrary script access
  and no interactive update silently retains the previous decision
- required_evidence: presentation contract tests and rendered host-path review

### PRD-IC-02 — Three Deliberate Outcomes

- source_state: complete disclosure and any current decision are visible
- trigger_action: enable, manual or cancel is deliberately selected
- expected_effective_state: exactly the newly selected outcome is applied; enable is never
  preselected and the previous decision is context only
- visible_feedback: requested and resulting state plus one next action are shown
- blocker_failure_behavior: invalid, missing or ambiguous input performs no plugin or permission
  mutation during the interactive install or update
- observable_success: fixtures prove enable, manual and cancel are distinct and deterministic
- required_evidence: interaction and lifecycle tests plus direct host observation

### PRD-IC-03 — Least-Privilege Automatic Scope

- source_state: enablement was deliberately selected
- trigger_action: translate the shared scope into host-native permission or trust
- expected_effective_state: only Section 3 checks are eligible for automatic execution
- visible_feedback: exact effective capability or honest unavailability is inspectable
- blocker_failure_behavior: a rule requiring broad shell, Node, PowerShell, filesystem or network
  permission is rejected and the installation stays manual
- observable_success: allowed checks work while representative unrelated commands remain subject to
  normal host protection
- required_evidence: positive and negative permission fixtures plus direct host probes

### PRD-IC-04 — Effective State Requires Three-Way Agreement

- source_state: consent intent and an installed AGDF runtime exist
- trigger_action: install, update, status or session orientation derives automatic-check state
- expected_effective_state: `enabled` appears only when deliberate intent, current capability identity
  and host-effective permission/trust agree
- visible_feedback: mismatches become manual, renewal required, unavailable or failed
- blocker_failure_behavior: intent receipt or configuration text alone cannot prove enabled state
- observable_success: each missing or mismatched input fails closed independently
- required_evidence: state-derivation tests and installed-host verification

### PRD-IC-05 — Explicit Decisions And Managed Policy Are Preserved

- source_state: host configuration contains explicit allow, ask, deny or managed-policy state
- trigger_action: install, update, enable, revoke or repair runs
- expected_effective_state: unrelated settings and restrictive decisions remain unchanged
- visible_feedback: conflicts or policy denial name the preserved authority and manual next path
- blocker_failure_behavior: unknown ownership or conflicting state stops mutation
- observable_success: before/after fixtures prove minimal change and stable unrelated configuration
- required_evidence: ownership, merge, conflict and managed-policy tests

### PRD-IC-06 — Renewal Prevents Stale Consent

- source_state: automatic mode was previously enabled
- trigger_action: executable content or effective capability scope changes
- expected_effective_state: material changes produce `renewal required` before automatic execution
- visible_feedback: the changed capability is reviewable; an unchanged capability may retain its
  technical identity, but every interactive update still presents enable, manual and cancel
- blocker_failure_behavior: path stability or version text alone cannot preserve stale permission
- observable_success: digest/scope changes invalidate prior consent; an identity-equivalent update
  avoids a second host-native trust prompt after the user deliberately chooses enable again, while
  non-interactive operation follows PRD-IC-08
- required_evidence: provenance, update and invalidation tests

### PRD-IC-07 — Revocation Leaves A Usable Manual Installation

- source_state: automatic mode is enabled
- trigger_action: the user requests revocation through the supported lifecycle path
- expected_effective_state: automatic checks become manual without uninstalling AGDF
- visible_feedback: changed and retained state, restart need and one next action are shown
- blocker_failure_behavior: unowned configuration is retained and routed to host-native removal
- observable_success: a fresh session no longer treats the covered checks as automatically allowed
- required_evidence: revoke/ownership tests and direct fresh-session host evidence

### PRD-IC-08 — Non-Interactive Operation Fails Safe

- source_state: installation has no deliberate interactive input
- trigger_action: install or update executes
- expected_effective_state: manual mode unless one explicit exact-capability policy value is supplied
  and verified
- visible_feedback: selected policy, resulting state and recovery action are machine-readable
- blocker_failure_behavior: missing, generic or invalid policy never enables automatic checks
- observable_success: CI and no-TTY fixtures cannot acquire consent accidentally
- required_evidence: non-interactive CLI and policy tests

### PRD-IC-09 — Unsupported Or Degraded Combinations Stay Honest

- source_state: a host/OS combination cannot express, apply or verify the narrow capability
- trigger_action: install, update, status or enablement runs
- expected_effective_state: AGDF remains manual and the combination is unavailable or degraded for
  automatic mode
- visible_feedback: limitation and supported next action are shown without a broad fallback
- blocker_failure_behavior: evidence from another host or OS cannot upgrade the state
- observable_success: every matrix cell has a deterministic supported, degraded or unsupported
  result
- required_evidence: capability-matrix fixtures and per-cell evidence records

### PRD-IC-10 — Native Windows Is Directly Proven

- source_state: any Windows automatic-mode support claim is proposed
- trigger_action: QA evaluates the corresponding host/OS matrix cell
- expected_effective_state: the claim remains unverified until native Windows proves installation,
  disclosure, enable, manual, status, revoke, renewal, rollback and fresh session
- visible_feedback: PowerShell command handling, native paths, configuration location, filesystem
  permissions and restart behavior are evidenced separately
- blocker_failure_behavior: macOS/Linux results, WSL, path simulation or repository-only tests cannot
  satisfy native-Windows acceptance
- observable_success: direct evidence identifies the tested Windows and host versions and all
  required transitions
- required_evidence: native-Windows execution record and UAT observation

### PRD-IC-11 — Evidence Planes Remain Separate

- source_state: repository, package, installed-root or loaded-session evidence is collected
- trigger_action: status, QA or UAT makes a behavior claim
- expected_effective_state: each claim is attributed only to its observed evidence plane
- visible_feedback: missing higher-plane evidence remains declared
- blocker_failure_behavior: lower-plane success cannot imply host-effective or fresh-session success
- observable_success: reviewers can identify passed, failed and unverified planes per matrix cell
- required_evidence: evidence-matrix checks and direct host records

### PRD-IC-12 — Existing Lifecycle And Governance Remain Regression Clean

- source_state: the consent capability is integrated through existing owners
- trigger_action: build, install, update, status, disable, uninstall and governed workflow tests run
- expected_effective_state: lifecycle, rollback, provenance, exact gate approval and manual operation
  remain compatible
- visible_feedback: failures are assigned to the existing owner and do not create a parallel path
- blocker_failure_behavior: any widened permission or AGDF authority regression blocks QA
- observable_success: focused and existing regression suites pass without weakened assertions
- required_evidence: mandatory later review reports and regression-suite output

## 10. Non-Goals

- Granting blanket Bash, PowerShell, Node, filesystem or network permission.
- Bypassing host prompts for commands outside the disclosed capability.
- Replacing host-native permission, hook-trust, sandbox or managed-policy authority.
- Treating installation consent as `Approval: <GateName>` or any delivery authorization.
- Designing a new installer, validator, settings product, gate model or host-independent permission
  store.
- Silently migrating ambiguous or user-owned permission state.
- Requiring an account, telemetry, hosted service, remote validator or registry lookup.
- Claiming automatic support for an unverified host/OS matrix cell.
- Selecting exact files, schemas, command patterns or adapter APIs before Solution Design.
- Implementing, testing on hosts, publishing, releasing or performing VCS delivery as part of PRD
  approval.

## 11. Product Risks

- A host may support plugin trust but not the narrower command-level rule required by this PRD.
- A command allow rule can become broader than intended through shell, path or quoting behavior.
- Consent identity that is too sensitive causes needless renewal; one that is too stable preserves
  stale permission.
- Host configuration formats and managed-policy precedence can change independently of AGDF.
- The nine-cell host/OS matrix may yield honest partial support rather than automatic parity.
- Windows execution can diverge through PowerShell, ACL, path, restart and atomic-replacement
  behavior even when repository tests pass.
- Added session checks can increase startup cost unless the SD keeps them bounded and cache-aware
  without weakening identity verification.

## 12. Required Solution Design Decisions

Solution Design must decide and evidence:

1. the canonical consent capability identity and material-change algorithm;
2. the host-authoritative storage and verification path for Codex, Claude Code and OpenCode;
3. whether a minimal AGDF intent receipt is necessary and how it avoids becoming authority;
4. the exact narrow permission/trust translation and unsupported outcome for every matrix cell;
5. atomic configuration mutation, ownership, rollback and restart behavior, including native Windows;
6. the additive lifecycle/status schema and human presentation integration;
7. the explicit non-interactive policy transport;
8. bounded session-check frequency and performance budget; and
9. the complete automated and direct-host evidence plan.

## 13. Next Gate

PRD Revision 2 is approved. SD Revision 3 and TP Revision 2 carry this requirement into the current
implementation and evidence chain.
