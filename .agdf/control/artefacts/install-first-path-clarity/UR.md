# User Requirement: Sharpen INSTALL.md Into A Guided Installation Path

## Work Item

- key: `install-first-path-clarity`
- title: Make INSTALL.md a guided, accurate surface-installation path
- status: approved
- approval: `Approval: UR`

## User Need

`INSTALL.md` should let a new user choose the right AGDF surface, satisfy prerequisites, install it, verify the result and begin the first governed request without reading architecture or Delivery Path Search material first. Detailed runtime explanations must remain available below the guided path, and OpenCode wording must accurately describe native skills rather than obsolete generated-agent terminology.

## Acceptance Criteria

1. The beginning of INSTALL.md contains a compact surface-selection guide before Delivery Path Search and implementation-detail sections.
2. Prerequisites name every supported surface, including OpenCode, and make the target-repository boundary clear.
3. Codex, Claude Code, OpenCode and Copilot each expose a consistent concise path: install command, expected result, verification/restart requirement and first safe AGDF action.
4. Global and repository-local layers remain explicit; OpenCode global installation is not represented as repository governance activation.
5. OpenCode references consistently use the actually generated npm plugin and native skills; stale or conflicting generated-agent wording is removed or corrected from the scoped installation guidance.
6. Verification commands are placed close to the relevant setup path, especially `opencode-status`; behavior and repair claims are only stated when evidenced by the CLI/runtime.
7. Update, disable or removal guidance is added only where the existing implementation and authoritative docs support it; no undocumented destructive command or security/process policy is invented.
8. Delivery Path Search, skill identity, AGENTS ownership, CI and runtime-detail sections remain intact as advanced reference material after the guided path.
9. Documentation validation and relevant runtime/package checks pass; no CLI, plugin, generated asset or release-workflow behavior changes.

## Scope Boundary

In scope: `INSTALL.md` information architecture, installation-flow copy, precise runtime terminology, nearby verification/restart/first-action guidance and links to existing authoritative material.

Out of scope: CLI behavior, new update/remove commands, plugin behavior, generated assets, permission policy, control runtime, security policy, contribution policy, release workflow, commit, push, pull request or release.

## Evidence And Approval

- source discussion: INSTALL.md review in this Codex task on 2026-07-14
- observed gap: the current file begins with advanced Delivery Path Search material, lacks an initial decision guide and has uneven verification/restart guidance; its opening OpenCode wording is inconsistent with later native-skill documentation.
- approval: `Approval: UR` received on `2026-07-14`
