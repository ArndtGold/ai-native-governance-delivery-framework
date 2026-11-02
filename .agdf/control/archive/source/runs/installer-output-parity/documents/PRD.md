# PRD: Coherent AGDF Installation Lifecycle

Status: approved; revision 2
Gate: PRD
Date: 2026-07-17
Derived from: approved `UR.md` revision 2 and completed `BROWNFIELD_REVIEW.md` revision 2
Gate approval: revision 1 approved on 2026-07-16; revision 2 approved with exact `Approval: PRD` on 2026-07-17

## Revision 2 Product Delta: Canonical English CLI Success Card

### Product Decision

AGDF-owned CLI presentation uses English as its canonical and unconditional default. Repository
`chat_language` and `artifact_language` continue to control agent conversations and durable AGDF
artefacts; they do not localize CLI commands, labels, status copy or lifecycle cards. CLI
localization is not offered implicitly through the operating-system locale. Any future localized CLI
mode must be explicit and complete for the rendered surface.

The lifecycle completion card becomes the concise primary success surface for every supported coding
agent. The caller passes the canonical coding-agent `surface`; the shared renderer never assumes
Codex and never infers a surface from the current directory, operating system or installed tools. On
a successful native host operation, normal mode suppresses repetitive host success chatter and
internal marketplace or cache paths while retaining the captured evidence for verification.
`--verbose` prints the native phase output and technical paths before the same final card. On
failure, the relevant upstream error and recovery evidence remain visible even without `--verbose`.

### Coding-Agent Surface Contract

Every lifecycle result contains one explicit canonical surface value:

| Canonical value | Human label | Source |
|---|---|---|
| `codex` | Codex | implied by `codex` / `codex-repo`, or passed through `--surface codex` |
| `claude` | Claude Code | implied by `claude`, or passed through `--surface claude` |
| `opencode` | OpenCode | implied by `opencode` / `opencode-repo`, or passed through `--surface opencode` |
| `copilot` | GitHub Copilot | implied by `copilot`, or passed through `--surface copilot` |
| `generic` | Generic coding agent | only for commands that explicitly support a generic surface |

Install and repository-setup commands derive the parameter deterministically from their command
target. Shared lifecycle commands such as `status`, `disable` and `uninstall` consume the explicit
`--surface` value according to their existing validation rules. The normalized surface is passed
through the lifecycle result into presentation; presentation owns only the human label. Missing,
generic or unsupported surfaces must fail closed where the operation requires a concrete host.

Surface-specific capability data determines activation wording and the one next action. It may not
fork the card layout, English-language contract, installation-health semantics or delivery authority.

### Human Success Card

Every supported coding agent uses the same semantic card. This is the Codex instance of that shared
contract:

```text
AGDF installation completed

Surface: Codex
Version: 0.9.6 (verified)
Installation scope: global
Installation: healthy
Activation: pending restart
Repository delivery: not evaluated

Next action: Restart Codex.
```

Rules:

1. The title describes the completed operation and replaces the redundant `Result: success` row.
2. `Surface` maps the passed canonical parameter to the human product name; commands and machine
   values remain canonical English.
3. Version shows the installed version and verification. Update output may show the previous and new
   version; unchanged output says `already current` rather than `added` or `installed`.
4. `Installation` reports technical plugin/package health only.
5. `Activation` reports host loading state. A required restart produces `pending restart`; internal
   reasons such as `host_reload` belong to JSON or verbose detail.
6. `Repository delivery` derives only from repository control evidence. A global install without a
   selected repository reports `not evaluated`; restart state never implies `blocked` delivery.
7. The card contains one `Next action`. Repository setup may use its one action as the first prompt
   once no host action remains.
8. Labels, human values and next-action copy are all English. A German system or project language
   must not create a mixed-language card.

### Lifecycle Result Compatibility

The schema-v1 lifecycle result remains the sole JSON and human presentation source. It gains only
additive projections where required:

- `installation.status`: `healthy | degraded | not_installed | unknown`
- `activation.status`: `active | pending_restart | inactive | unknown`
- `activation.reason`: existing canonical reason such as `host_reload | none | unknown`
- `delivery.status`: existing delivery vocabulary or `not_evaluated`

Existing `verification`, `restart`, version, change, retained-state and failure fields remain
compatible. The renderer must derive new projections from existing verified evidence where possible;
it must not introduce another host or gate evaluator.

### Standard And Verbose Output

- Normal success: one concise AGDF card; no duplicate marketplace/cache-root lines.
- Verbose success: captured native output and technical paths, followed by the identical final card.
- Failure or partial result: phase-specific upstream error and recovery evidence remain visible in
  normal mode; verbose may add full captured diagnostics.
- JSON: no human card and no localization; stable machine values only.
- `--language` and `--lang` continue to configure project chat and artefact language. They do not
  change CLI presentation.

### Revision 2 Acceptance Criteria

1. `codex`, `claude`, `opencode`, `copilot`, repository setup, status, disable and uninstall render
   AGDF-owned lifecycle output in English under German and English system/project locales.
2. Successful standard output ends with exactly one outcome-specific card and does not repeat
   marketplace/cache-root detail emitted by successful native phases.
3. `--verbose` exposes preserved native output and technical paths; normal failures still preserve
   the decisive upstream error and recovery guidance.
4. The card distinguishes installation, activation and repository delivery; pending restart never
   becomes a delivery-gate decision.
5. Install, update and unchanged fixtures render truthful version-transition language.
6. JSON values and existing schema-v1 fields remain compatible; additive activation/delivery fields
   are deterministic and validated.
7. Project chat and artefact language configuration remains unchanged, including German interaction
   and approval surfaces.
8. Focused lifecycle, CLI, scaffold, smoke and clean release-bootstrap tests pass and reject
   mixed-language cards.
9. Surface-matrix fixtures prove `codex` → Codex, `claude` → Claude Code, `opencode` → OpenCode and
   `copilot` → GitHub Copilot through the same renderer, with surface-specific activation and next
   actions but identical card structure.
10. No supported operation silently defaults to Codex when another coding-agent surface was passed
    or implied by the command target.

### Revision 2 Non-Goals

- No removal of German interaction or agent-chat localization.
- No localized CLI implementation or automatic OS-locale selection.
- No change to host installation commands, approval authority, delivery-gate evaluation, destructive
  lifecycle operations or repository activation policy.
- No new presentation module, locale registry or second lifecycle/status evaluator.

## Revision 1 Baseline

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
