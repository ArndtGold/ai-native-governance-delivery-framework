# User Requirement: OpenCode Plugin Proof In Easy Setup

## Work Item

- key: `pages-opencode-plugin-proof`
- title: Add OpenCode plugin evidence to the Pages Easy Setup section
- status: approved
- approval: `Approval: UR`

## User Need

The public Pages site should show OpenCode alongside Codex and Claude Code in the Easy Setup visual evidence. The additional image should demonstrate that OpenCode has loaded the `create-agdf` npm plugin and can use the installed global AGDF native-skill surface, while preserving an accurate distinction between OpenCode's plugin indicator and the plugin-detail interfaces shown by Codex and Claude Code.

## Acceptance Criteria

1. Easy Setup contains a third, clearly labelled OpenCode evidence card using `opencode-agdf-plugin-ui.png` or a privacy-safe derived crop.
2. The three-card composition is visually balanced at wide breakpoints and remains readable without overflow, awkward orphaning or distorted images at narrower breakpoints.
3. The OpenCode image keeps the visible `create-agdf` plugin indicator and enough AGDF interaction context to substantiate loaded-and-usable integration.
4. Unnecessary personal filesystem paths and unrelated screen content are removed from the public image where practical.
5. OpenCode copy states the observed npm-plugin/global-native-skill evidence without claiming that OpenCode exposes the same plugin-detail UI or enforcement model as Codex and Claude Code.
6. Intrinsic image dimensions and accessible alternative text match all three real assets and avoid avoidable layout shift.
7. Existing lightbox behavior, setup guidance, responsive presentation and release-source-of-truth disclaimer remain coherent.
8. Pages build and relevant repository validation pass.

## Scope Boundary

In scope: the Easy Setup evidence-card markup and layout, the supplied OpenCode screenshot or a derived crop, image metadata, labels, alt text and immediately adjacent explanatory copy.

Out of scope: OpenCode runtime behavior, installer changes, plugin implementation, new setup commands, changes to Codex or Claude integration semantics, broader Pages redesign, commit, push, pull request or release.

## Evidence And Approval

- user intent: add the supplied OpenCode screenshot as a third Easy Setup proof while keeping the layout visually correct
- source asset: `pages/public/assets/opencode-agdf-plugin-ui.png`
- approval: `Approval: UR` received on `2026-07-14`
- date: `2026-07-14`
