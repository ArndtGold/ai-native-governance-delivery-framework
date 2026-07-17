# PRD: Coherent AGDF Installation Lifecycle

Status: approved
Gate: PRD
Date: 2026-07-16
Derived from: approved `UR.md` and completed `BROWNFIELD_REVIEW.md`
Gate approval: Approval: PRD

## 1. Product Goal

Make AGDF installation, repository activation, verification, first use, safe opt-out and removal one
coherent lifecycle. A user must be able to distinguish technical installation health from delivery
gate state, understand which scope is active, and receive exactly one truthful next action without
learning AGDF's internal storage or host-adapter model first.

## 2. Product Principles

1. **Capability truth over aspiration.** AGDF describes only behavior proven by the loaded host and
   current evidence.
2. **Technical health is not delivery authority.** Installation can be healthy while delivery is
   blocked, and the two states remain separate in every projection.
3. **Safe by default.** Status is read-only; disable prefers repository-local opt-out; uninstall
   retains user-owned and ambiguous files unless the user explicitly authorizes a proven owned target.
4. **One primary path.** `npx --yes @agdf/cli@latest ...` is the primary CLI family. Compatibility
   entry points remain supported but secondary.
5. **Host-native ownership.** AGDF orchestrates and verifies supported host operations; it does not
   claim to bypass required restart, plugin-browser or permission steps.
6. **Exact approval authority.** Native controls improve presentation only. Exact approval values and
   durable revalidation remain authoritative.

## 3. Primary Users And Jobs

- First-time installer: install one surface, verify version/scope, learn restart needs and receive one
  first prompt.
- Repository maintainer: distinguish global availability, local activation, technical health and
  delivery state.
- Read-only user: see once that no run was created and no gate approval is required.
- Gate approver: use native controls only with proven canonical-value transport, otherwise use exact
  text with identical authority.
- Opt-out user: disable one repository without removing global capability or durable repository state,
  or explicitly uninstall a selected global surface with retained-state reporting.

## 4. User Journeys

### 4.1 Global install or update

AGDF preserves host-native operation output, verifies installed and expected versions where possible,
then renders one localized Success Card with exactly one next action.

### 4.2 Repository-local Codex setup

`codex-repo` writes only collision-safe repository-owned files, verifies them and automates every
host-supported step. If restart and `/plugins` remain mandatory, the Success Card names that single
remaining host action and does not claim activation prematurely.

### 4.3 Status

The general read-only `status` command reports installation, repository activation and delivery as
separate sections. Delivery details derive from existing doctor/gate-check owners. Missing repository
control state is `not_configured` or `not_applicable`, not an installation failure.

### 4.4 Read-only request

For a fresh read-only request with no required run decision, AGDF shows one compact localized
orientation: no run was created and no gate approval is required. It performs no durable write and
does not repeat the message during the same request.

### 4.5 Gate approval

Native control is eligible only with deliberate waiting and proven `exact_option_value` or
`separate_label_and_value` transport. Decorated-only, missing, unsafe or conflicting capability fails
closed before invocation. The exact-text path explains the host limitation once and presents the
unchanged canonical value. Decorated values never authorize or persist a gate.

### 4.6 Repository-local disable

AGDF inspects host configuration, distinguishes owned/user-owned/ambiguous state, writes only the
minimal supported repository opt-out when collision checks pass, retains global capability and
`.agdf/control`, and reports changed/retained state plus restart requirements.

### 4.7 Global uninstall

The user explicitly selects surface and global scope. AGDF previews intended operations and retained
files without mutation until explicit confirmation, invokes only supported host-native removal,
removes only proven AGDF-owned generated global state, retains repository/control/ambiguous files and
verifies the resulting host state.

## 5. Human Success Card Contract

Every successful install, update, disable or uninstall ends with the same ordered fields:

1. Result
2. Surface
3. Installation scope
4. AGDF version or explicit verification limitation
5. Verification state
6. Restart requirement
7. Exactly one next action or first prompt

The card is localized through the existing locale ownership model. Machine values remain available
in JSON/audit output and do not replace human copy.

## 6. Status Contract

The versioned general status projection has distinct sections:

- `installation`: `healthy | degraded | not_installed | unknown`, installed/expected version and
  verification evidence.
- `repository`: `active | disabled | not_configured | unknown`, scope and evidence.
- `delivery`: `open | blocked | complete | not_configured | unknown`, selected run/current gate when
  available and a reference to existing gate authority.
- `next_action`: exactly one human-actionable step.

Status is deterministic and read-only. It never initializes control state, silently selects a run or
modifies configuration. Existing `doctor`, `gate-check`, `delivery-map` and `opencode-status` schemas
and exit codes remain compatible; the new projection composes them and is not a second validator.

## 7. Command Discovery And Compatibility

- Primary help shows installation, status, lifecycle and delivery commands under `@agdf/cli` in
  task-oriented groups.
- `npm create agdf@latest -- ...` is labeled scaffold compatibility.
- `npx --yes create-agdf@latest ...` is labeled legacy compatibility.
- Existing entry points remain operational.
- `status`, `disable` and `uninstall` require enough surface/scope information to avoid ambiguous
  mutation. SD defines exact flags and confirmation mechanics.

## 8. Safety And Ownership Requirements

- Status and preview paths perform zero mutation.
- Global uninstall requires explicit confirmation after selected surface/scope is visible.
- Repository-local disable is preferred for repository-specific intent.
- No lifecycle command deletes `.agdf/control`, source documents or user-authored repository files.
- Unowned or ambiguous host configuration fails closed and is retained for manual review.
- Generated files are removable only with canonical ownership proof and selected-scope match.
- Partial failure reports completed operations, retained state and one recovery step; it does not
  retry through a second transport automatically.
- Host failures preserve original evidence and classify the failing phase.

## 9. Documentation Requirements

- Root README leads with the current installable product and primary installation action while
  retaining independent-project, discussion-draft and non-standard boundaries.
- INSTALL owns surface setup, status, update, disable, uninstall and verification journeys.
- Package README owns command reference and moves compatibility forms under Advanced / Compatibility.
- Native buttons are capability-dependent; exact text is a first-class safe path.
- No fourth onboarding or lifecycle source is introduced.

## 10. Acceptance Criteria

1. Supported installs/updates finish with the ordered Success Card and truthful verification,
   restart and first-action fields.
2. Status human/JSON outputs keep installation, repository activation and delivery separate while
   preserving existing control evaluators as authority.
3. A healthy installation plus blocked delivery is reported simultaneously without contradiction.
4. Read-only orientation is visible once, localized, non-mutating and creates no run.
5. Codex native control is not invoked for decorated-only capability; exact text appears once with
   unchanged authority.
6. Decorated approval values remain invalid across normalization, persistence and tests.
7. Primary help/docs lead with `@agdf/cli`; compatibility commands remain supported and secondary.
8. Repository-local disable retains global availability and durable control state.
9. Global uninstall requires explicit scope/confirmation, removes only proven owned state, retains
   repository/control/ambiguous files and verifies the result.
10. `codex-repo` automates host-supported operations and leaves no more than one truthful manual host
    action.
11. Failure output identifies executable, marketplace, plugin operation, version, ownership or
    verification phase without hiding upstream evidence.
12. Deterministic fixtures cover install/update/unchanged/unknown version, partial failure, read-only
    status, no-run orientation, disable, uninstall preview/confirmation, owned/unowned files,
    capability conflict and repository-local completion.
13. Runtime integrity, generated-surface sync, package and release-bootstrap smoke, selected-run
    doctor and whitespace validation pass.

## 11. Non-Goals

- Changing gate order, approval syntax or durable approval authority.
- Replacing host-native plugin managers or bypassing required Codex `/plugins` actions.
- Deleting repository control state during plugin uninstall.
- Removing compatibility entry points in this delivery.
- Treating repository tests as proof of host-visible button rendering.
- Publishing, releasing, reinstalling the active plugin or performing VCS delivery.

## 12. Product Risks

- Cross-host lifecycle parity may be falsely implied where capabilities differ.
- Uninstall can damage user configuration if ownership proof is weak.
- Combined status can become a second gate evaluator if derivation boundaries are unclear.
- Read-only orientation can become chat noise if repeated outside fresh-request classification.
- Static capability metadata can drift from the loaded Codex tool set across releases and sessions.

## 13. Next Gate

PRD is approved. Solution Design may be drafted; implementation remains forbidden until the later
design and task-plan gates are approved.
