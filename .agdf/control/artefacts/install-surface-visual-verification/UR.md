# User Requirement: Add Shared Surface Visual Verification To INSTALL.md

## Work Item

- key: `install-surface-visual-verification`
- title: Add Codex, Claude Code and OpenCode visual verification to INSTALL.md without duplicating assets
- status: approved
- approval: `Approval: UR`

## User Need

The detailed Codex, Claude Code and OpenCode installation sections should show the same maintained UI evidence already used by Pages, so users can verify that AGDF is visibly present in the correct surface. INSTALL.md must reference those repository assets directly, describe each screenshot as an illustrative observed state rather than release authority, and preserve the distinct plugin/integration models of the three surfaces.

## Acceptance Criteria

1. INSTALL.md directly references the existing Pages assets without copying or creating duplicate image files.
2. The Codex screenshot appears near the Codex installation verification, the Claude screenshot near the Claude verification, and the focused OpenCode proof near OpenCode status verification.
3. Every image has accurate, accessible alternative text and a concise caption that states what it demonstrates and what it does not prove.
4. Visual evidence does not imply identical plugin-management UI, release-version authority, tool enforcement, repository governance activation or active session state across surfaces.
5. The referenced assets resolve from INSTALL.md in the repository and no unrelated Pages layout or asset is changed.
6. Existing installation commands, technical detail and source-of-truth boundaries remain intact.
7. Markdown/documentation and relevant package/runtime validation pass.

## Scope Boundary

In scope: image references, captions and minimal surrounding copy in `INSTALL.md` using existing `pages/public/assets/` files.

Out of scope: new image generation, image editing, asset duplication, Pages markup, CLI/runtime behavior, plugin metadata, installation commands, policy, commit, push, pull request or release.

## Evidence And Approval

- source discussion: current Codex task on 2026-07-14
- source assets: `pages/public/assets/codex-agdf-plugin-ui.png`, `pages/public/assets/claude-agdf-plugin-ui.png`, `pages/public/assets/opencode-agdf-plugin-proof.png`
- approval: `Approval: UR` received on `2026-07-14`
