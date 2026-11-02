# Brownfield Review: Add Shared Surface Visual Verification To INSTALL.md

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/install-surface-visual-verification/BROWNFIELD_REVIEW.md`
- scope: assess the existing Pages assets for direct INSTALL.md references without copying or editing them.
- evidence:
  - `pages/public/assets/codex-agdf-plugin-ui.png` and `pages/public/assets/claude-agdf-plugin-ui.png` exist and are already referenced by the Pages Easy Setup section with accurate descriptive text.
  - `pages/public/assets/opencode-agdf-plugin-proof.png` exists and is already referenced by Pages, but direct visual inspection shows multiple visible `/Users/arndtgold/...` filesystem paths and a personal project path in its shell-output area.
  - The active UR explicitly restricts the change to direct references of existing assets and excludes image editing, generation, duplication and Pages changes.
- transparency: direct Markdown references avoid duplicate assets. The current OpenCode file discloses unnecessary personal local-path information, but the user explicitly authorized publication of this asset unchanged on 2026-07-14; no crop, replacement or copied derivative is required.
- missing_evidence: none for the explicitly accepted publication scope.
- current_coverage:
  - `fully_done`: Codex and Claude Code source assets exist and fit their corresponding detailed sections.
  - `not_done`: direct references and captions in the matching INSTALL.md sections.
- reuse_strategy: `extend` INSTALL.md with direct relative asset references; do not create a copied or manipulated shadow asset in the documentation path.
- risks:
  - Publishing the current OpenCode image repeats visible personal path data in INSTALL.md; this is accepted explicitly by the user for this scope.
  - Screenshots must remain labelled as UI examples and observed integration evidence, not release authority or equal surface semantics.
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- required_next_step: execute the Quick Task, validate direct image links and package/runtime checks, then record compact closeout evidence.

## Mode/Slice Decision

- decision: `quick_task`
- scope_reason: direct reuse is technically simple; the only privacy concern is explicitly accepted by the user, so the bounded Markdown-only change can proceed without asset manipulation or additional formal artefacts.
- evidence: direct inspection of `pages/public/assets/opencode-agdf-plugin-proof.png`; user direction on 2026-07-14; approved UR scope boundary.
