# User Request: Global Native OpenCode Surface

## Objective

Provide a globally discoverable native OpenCode AGDF skill surface in addition to the existing global npm plugin hook, while keeping repository-local AGDF control state authoritative.

## Problem

`npx --yes @agdf/cli@latest opencode-status` reports the global npm plugin as configured and loadable, but native AGDF skills are absent until `opencode-repo` is run in each repository. This creates a visible global-surface asymmetry compared with Codex and Claude Code.

## In scope

- Generate or install globally discoverable `agdf-*` OpenCode skills through the supported global OpenCode configuration/skill path.
- Keep the global surface fail-closed when no repository-local `.opencode/AGDF.md`, native skills or `.agdf/control/` state is present.
- Preserve the existing global plugin hook for lifecycle/status/compaction responsibilities.
- Keep repository-local generated skills, instructions and `.agdf/control/` as the authoritative governance surface.
- Add status, migration, integrity, smoke and documentation evidence for the global native surface.

## Non-goals

- Do not copy or create global `.agdf/control/` governance state.
- Do not introduce a second gate calculator or policy owner.
- Do not claim model-independent OpenCode tool enforcement.
- Do not remove the repository-local `opencode-repo` path.
- Do not change the public command shape without an approved later design.

## Acceptance direction

- A fresh global install exposes the nine native `agdf-*` skills through OpenCode discovery.
- A repository without `opencode-repo` does not appear governed merely because the global skills exist.
- A repository with the local surface uses local instructions and control files as the source of truth.
- Existing global and repository configurations are preserved according to current ownership rules.
- OpenCode remains classified as `instruction_only` unless independent enforcement evidence is established.

## Approval

- `Approval: UR` provided on `2026-07-13`.
