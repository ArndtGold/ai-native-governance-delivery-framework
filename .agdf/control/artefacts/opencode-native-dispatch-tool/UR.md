# UR: Native OpenCode Dispatch Without Repeated Shell Approval

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-04
Owner: Arndt Gold

## 1. Problem

OpenCode currently reaches the AGDF skill dispatcher through its general `bash` tool. Even though
dispatch is read-only, offline and non-authorizing, the host therefore asks for shell permission on
each invocation or offers a broad command-pattern approval. The prompt exposes long installation
paths and does not distinguish the bounded AGDF operation from arbitrary Node or shell execution.

An inactive-repository observation also showed that a model can reconstruct an installed runtime
path from global skill instructions. The current dispatcher run owns that fail-closed correction;
this new scope owns the separate active-repository permission experience.

## 2. User Need

As an OpenCode user, I need explicitly invoked, read-only AGDF skill dispatch to run without repeated
general shell confirmations, while unrelated shell commands, edits and AGDF gate approvals retain
their existing protection.

## 3. Scope

Establish an OpenCode-native, narrowly typed AGDF dispatch capability that:

- is callable only for canonical AGDF skills and validated dispatcher inputs;
- derives working directory and worktree from the current OpenCode context rather than free-form
  executable or filesystem paths;
- uses the existing version-matched dispatcher and does not duplicate target, gate, presentation or
  approval authority;
- returns inactive-repository recovery without shell execution;
- can be permitted independently from general `bash` and `edit` access;
- requires an explicit, truthful installation choice before repeated prompts are suppressed;
- remains read-only, offline and non-authorizing; and
- has repository, generated-package and direct loaded-host evidence.

The leading implementation candidate is a plugin-owned custom tool such as `agdf_dispatch` because
OpenCode supports custom plugin tools and tool-specific permission rules. Brownfield Review must
confirm the exact owner and supported API before this candidate becomes design authority.

## 4. Acceptance Criteria

1. In an inactive repository, invoking a global AGDF skill performs no dispatcher shell call and
   returns only the bounded activation recovery.
2. In an active repository, one explicitly invoked AGDF skill can call the existing dispatcher
   without a general shell prompt when the user enabled the narrow capability.
3. General `bash` and `edit` permissions remain `ask` unless the user already configured otherwise.
4. The capability cannot accept an arbitrary executable, shell command, runtime path or unrestricted
   filesystem target.
5. Skill, language, target/run evidence and output remain validated by the canonical dispatcher
   contract and preserve terminal `host_action` behavior.
6. Host permission never counts as `Approval: <GateName>` and cannot persist AGDF approval.
7. Installation displays prior intent, effective state, scope, safety properties and a manual mode;
   updates renew consent when the capability identity or safety contract changes.
8. Direct OpenCode evidence covers enabled, manual, inactive, active, malformed-input and rollback
   cases without inferring other-host parity.

## 5. Non-Goals

- Allowing all `bash`, `node` or OpenCode auto-mode operations.
- Replacing the canonical AGDF dispatcher, target resolver, renderer, gate model or approval store.
- Standardizing permissions for Codex, Claude Code or Copilot in this OpenCode-specific run.
- Suppressing prompts for edits, implementation commands, tests or other mutable work.
- Treating a custom tool registration, host permission or installer choice as governance activation.
- Claiming loaded-host behavior from repository or SDK declaration evidence alone.

## 6. Protected Boundaries

- `.agdf/control/` remains the durable governance authority.
- OpenCode owns host permission enforcement and its user-visible permission UI.
- AGDF owns only the bounded tool contract, installer projection and fail-closed runtime behavior.
- The current `cross-surface-executable-skill-dispatcher` run must finish its existing corrections
  independently; this UR does not widen that approved PRD or TP.

## 7. Risks And Unknowns

- A custom tool executes outside the general bash prompt, so input validation, activation,
  provenance and non-mutation constraints must be demonstrably stronger than a shell-prefix allow.
- OpenCode plugin and permission APIs may change across host versions.
- Tool-specific permission may be session- or project-scoped depending on the OpenCode generation;
  the effective scope must be reported truthfully.
- Plugin tool calls from subagents may retain existing OpenCode enforcement limitations and must not
  be claimed as technically gate-enforced without direct evidence.

## 8. Evidence Sources

- User-provided OpenCode permission screenshots from 2026-09-04.
- `https://opencode.ai/docs/custom-tools/` for plugin-owned custom tools.
- `https://opencode.ai/docs/permissions/` for tool-specific `allow | ask | deny` behavior.
- Existing OpenCode adapter, installer consent, runtime integrity and dispatcher owners in this repo.

## 9. Next Step

After exact `Approval: UR`, perform Brownfield Review and then record the smallest safe Mode/Slice
Decision. No custom tool, permission mutation or installation change is authorized by this draft.

Exact approval required:

`Approval: UR`
