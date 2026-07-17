# UR: Make AGDF Installation and First-Run UX Coherent

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-16
Owner: agent

## 1. Problem

AGDF installation is technically reliable, but the user journey is fragmented across plugin
installation, repository activation, durable control state and the first governed interaction.
Codex and Claude Code finish installation with surface-specific single-line messages, while
OpenCode already exposes a richer status projection. Technical installation health and delivery
gate blockers are not clearly separated, so an expected missing approval can look like a broken
installation.

The native Codex approval path also has a capability-truth gap. AGDF requires the canonical value
`Approval: <GateName>`, while the currently available Codex question tool decorates the recommended
option label and does not expose a separate canonical value transport. The Runtime Contract correctly
requires an exact-text fallback for this case, but the canonical plugin definition currently declares
`exact_option_value` for Codex. This can make the product promise a native button path that the loaded
host tool cannot safely authorize.

The public README still presents AGDF primarily as a discussion draft even though a versioned,
installable plugin exists. The documentation exposes several compatible command families at the
same level, repository-local Codex setup remains multi-step, and AGDF has no explicit status,
disable or uninstall lifecycle commands. Read-only tasks also need a visible assurance that they do
not create a run or require a gate approval.

Claude installation additionally collapses every failure into the claim that the Claude Code CLI
may be missing. This is misleading when Claude is present but its marketplace refresh rejects Git
on native Windows as missing or unsafe.

## 2. User Need

As an AGDF user, I need installation, activation, verification, first use and opt-out to form one
understandable journey, so that I can tell whether AGDF is installed correctly, whether a repository
is governed, whether delivery is merely blocked at a gate, and what single action to take next.

## 3. Scope

### P0: installation completion and health

- End successful Codex, Claude Code and OpenCode installation with one recognizable localized
  Success Card containing AGDF version, installation scope, verification result, restart requirement
  and exactly one first prompt or next action.
- Preserve host-native command output before the final AGDF card.
- Separate technical installation health from repository delivery state in human and JSON status
  output, for example `installation: healthy` and `delivery: blocked`, without weakening either
  result.
- Make Codex native-approval capability reporting match the actually loaded host tool. A
  decorated-label-only adapter must never be advertised or invoked as exact-value transport.
- When Codex cannot transport the exact approval value, present the fallback as a deliberate,
  concise safety path: explain the host limitation once, show the unchanged exact value and wait for
  explicit text input.
- Never accept or persist `Approval: <GateName> (Recommended)` as gate authority, and do not promise
  button UX unconditionally in onboarding or installation copy.
- Keep installed and expected versions visible and keep version mismatch fail-closed.
- Classify installer failures at the narrowest reliable phase. Preserve the existing focused
  native-Windows Claude Git recovery requirement and upstream detail.

### P1: first-run and documentation orientation

- For a new read-only inspection, explanation or review, visibly state that no AGDF run was created
  and no gate approval is required.
- Sharpen the root README opening so it accurately presents the current installable product while
  retaining the framework's discussion-draft and non-standard disclaimer.
- Place the primary installation path before the long conceptual introduction.
- Present `npx --yes @agdf/cli@latest ...` as the single primary CLI family. Move
  `npm create agdf@latest -- ...` and `npx --yes create-agdf@latest ...` to a clearly labeled
  Advanced / Compatibility section.

### P2: lifecycle and repository-local setup

- Add explicit `status`, `disable` and `uninstall` commands with safe, surface-aware behavior.
- Prefer repository-local disablement over global removal when the user only wants AGDF inactive in
  one repository.
- Never delete user-owned repository files or control state implicitly; preview or report retained
  files and require explicit destructive intent where removal would affect them.
- Reduce the manual `codex-repo` journey as far as Codex host capabilities permit, and finish with
  explicit verification plus any unavoidable restart or `/plugins` action.
- Add deterministic regression coverage for success cards, health/delivery separation, read-only
  orientation, command discovery, lifecycle safety and repository-local verification.

## 4. Non-Goals

- No change to AGDF gate authority or exact `Approval: <GateName>` semantics.
- No automatic approval, automatic run creation for read-only work or hidden repository governance.
- No deletion of `.agdf/control`, user-authored configuration or repository content by default.
- No unsupported automation of Codex UI actions.
- No custom host UI that pretends to be native Codex, Claude Code or OpenCode behavior.
- No release, publication, global reinstall or mutation of the user's active plugin installation.
- No removal of backward-compatible command entry points in this delivery; they are demoted in
  documentation, not broken.

## 5. Acceptance Criteria

1. Successful Codex, Claude Code and OpenCode installs end with the same ordered Success Card fields:
   result, surface, scope, installed version, verification, restart requirement and first action.
2. Human and JSON status output distinguish technical installation health from repository delivery
   state; an expected gate blocker never appears as an installation failure.
3. Codex capability projection reflects the actually loaded question adapter. If only a decorated
   label is available, no native approval attempt is made and the visible outcome is
   `unavailable_before_invocation` with an exact-text fallback.
4. `Approval: <GateName> (Recommended)` and every other decorated value remain invalid and cannot be
   persisted as approval evidence.
5. Installation, onboarding and approval copy describe native buttons as capability-dependent and
   present exact text as an equally authoritative safety path rather than a hidden degradation.
6. A read-only request produces a concise visible no-run/no-approval orientation and does not mutate
   durable AGDF state.
7. The root README presents AGDF as an available installable plugin, preserves its independent
   draft/non-standard disclaimer, and exposes the primary install path before the conceptual tour.
8. Primary documentation and CLI help lead with `@agdf/cli`; scaffold and compatibility entry points
   remain documented only in Advanced / Compatibility guidance.
9. `status` reports installation scope, plugin version/verification and repository delivery state
   without mutation.
10. `disable` supports a safe repository-local opt-out where the host supports it and reports the
   exact retained global and repository state.
11. `uninstall` removes only AGDF-owned global or generated installation entries selected by the user,
   preserves user-owned repository/control files by default and reports retained files.
12. `codex-repo` automates every host-supported step and ends with a truthful verification result plus
   one unavoidable manual action at most.
13. Missing host CLIs, Git/Git-Bash discovery failures, marketplace failures, plugin-operation
    failures and version mismatches retain original evidence and receive phase-specific recovery.
14. Focused deterministic tests cover first install, update/unchanged state, version-unavailable
    output, read-only no-mutation, lifecycle safety and partial host-capability paths.
15. Package smoke, release-bootstrap smoke, runtime integrity, selected-run doctor and whitespace
    validation pass without weakening existing assertions.

## 6. Existing Sources Of Truth

- `create-agdf/lib/cli/` owns command routing and user-facing CLI orchestration.
- `create-agdf/lib/installers/` owns supported surface installation behavior.
- `create-agdf/lib/control-evaluation/` owns doctor, gate-check and delivery projections.
- `plugin/meta/contracts/` and `plugin/skills/gate-check/SKILL.md` own runtime and read-only routing
  semantics.
- `plugin/meta/agdf-plugin.definition.json` owns declared surface capabilities; the active
  `agdf-human-decision-surface` run remains the owner of the shared approval-interaction contract.
- `create-agdf/lib/interaction-presentation.js` and its tests own capability preflight, native-attempt
  suppression and exact-text fallback behavior.
- `README.md`, `INSTALL.md` and `create-agdf/README.md` own public and package onboarding.
- `create-agdf/scripts/smoke-test.js` and `release-bootstrap-smoke-test.js` own deterministic installer
  and public-bootstrap regression coverage.
- Host-native plugin/configuration commands remain authoritative for what Codex, Claude Code and
  OpenCode can actually install, disable or remove.

## 7. Risks And Open Questions

- Brownfield Review must decide whether one structured slice is sufficient or whether lifecycle
  commands require a separate delivery after the shared status model is established.
- `doctor` compatibility must be preserved while separating installation health from delivery state.
- Codex repository-local installation may still require restart and explicit `/plugins` interaction;
  the UX must expose that host boundary instead of claiming false automation.
- Disable and uninstall semantics vary by host. One shared user model must not hide surface-specific
  retention or mutation behavior.
- Codex question-tool capability can vary by host release and loaded session. Runtime evidence must
  override optimistic static metadata without hard-coding one temporary host limitation forever.
- The active `agdf-human-decision-surface` run owns core approval-interaction behavior. Brownfield
  Review must reuse or link that owner and prevent this installation run from creating parallel
  adapter or authorization logic.
- README changes must not replace the honest independent-project and discussion-draft positioning
  with unsupported maturity claims.
- Read-only orientation belongs in the interaction layer and must not become repetitive session noise.

## 8. Next Step

After exact UR approval, run Brownfield Review, reconcile overlap with completed onboarding work and
select the smallest safe delivery path before PRD or implementation.
