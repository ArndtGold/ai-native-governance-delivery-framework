# User Requirement

## Work Item

- key: `surface-native-interactions`
- title: Add surface-native AGDF interactions across Codex, Claude Code and OpenCode
- status: approved
- approval: `Approval: UR`

## User Need

AGDF users should be able to make clarifications, tool-permission decisions and AGDF gate approvals through the native interaction controls of their coding-agent surface without weakening AGDF's durable control state or exact-approval rules.

The interaction should make the current scope, expected effect, relevant risk and next permissible step visible at the point where the user decides.

## Required Behavior

1. Define one surface-independent AGDF interaction model that distinguishes:
   - clarification or preference input;
   - technical tool permission;
   - AGDF gate approval.
2. Map that model to the native interaction mechanisms of Codex, Claude Code and OpenCode where the surface supports them.
3. Preserve the exact AGDF approval value `Approval: <GateName>` as explicit user intent.
4. Validate every gate approval against the selected run, the current gate and the required durable artefact before advancing.
5. Persist accepted AGDF approvals in repository-owned control state; native UI state or chat history must not become a second source of truth.
6. Prevent technical permission outcomes such as accept-once, always-allow, auto-approve or plan approval from being interpreted as AGDF gate approval.
7. Prevent timeouts, defaults or unattended execution from granting an AGDF gate approval.
8. Fall back to a concise textual interaction when a surface does not expose a suitable native control.

## Acceptance Criteria

1. A canonical interaction contract identifies interaction kind, run, current gate, scope, decision options, side effects and required evidence.
2. Codex, Claude Code and OpenCode each have an explicit adapter or documented mapping to their native interaction facilities.
3. A native selection can produce an exact AGDF approval only when the user deliberately selects the gate-specific option.
4. Missing or stale artefacts, wrong-run answers and wrong-gate answers fail closed.
5. Technical tool permission and AGDF gate approval remain mechanically distinguishable.
6. AGDF gate approvals cannot auto-resolve or inherit session-wide tool permissions.
7. Unsupported or non-interactive environments retain a deterministic, auditable fallback.
8. Relevant runtime-integrity, package-surface and regression checks cover canonical-to-generated propagation.

## Scope Boundary

In scope: canonical AGDF interaction semantics, surface mappings for Codex, Claude Code and OpenCode, durable approval handling, fallback behavior, documentation and regression coverage.

Out of scope: replacing host permission systems, building custom host UI components, treating generic consent as approval, changing the canonical gate order, bypassing repository-owned control state, or adding autonomous release authority.

## Initial Risks And Questions

- Native controls use different option and permission vocabularies; surface terminology must not leak into canonical AGDF semantics.
- Claude Code question timeouts and OpenCode auto-approve/session-wide permissions must not be able to advance an AGDF gate.
- The Brownfield Review must identify whether the first release can be instruction-and-contract driven or requires executable adapter code per surface.
- The design must reuse existing skill, runtime-contract, plugin-definition and generated-surface ownership rather than create a parallel interaction framework.

## Evidence And Approval

- user intent: `Legen wir damit los`
- user approval: `Approval: UR`
- approval date: 2026-07-14
- source discussion: current Codex task conversation on 2026-07-14

