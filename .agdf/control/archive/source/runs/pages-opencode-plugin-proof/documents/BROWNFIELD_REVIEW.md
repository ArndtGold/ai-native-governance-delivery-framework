# Brownfield Review: OpenCode Plugin Proof In Easy Setup

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/pages-opencode-plugin-proof/BROWNFIELD_REVIEW.md`
- scope: add one public OpenCode evidence card to the existing Easy Setup image grid; crop or replace the supplied source image only as needed to retain the plugin indicator and remove unnecessary local-path detail; correct the existing cards' intrinsic dimensions and retain their current lightbox interaction.
- evidence:
  - `pages/src/pages/index.astro` owns the Easy Setup section and already contains two structurally identical evidence cards in a `sm:grid-cols-2` grid.
  - The generic lightbox in `pages/src/layouts/BaseLayout.astro` attaches through `data-lightbox-trigger` and `data-lightbox-open`; a third card reuses it without a second interaction owner.
  - `pages/public/assets/opencode-agdf-plugin-ui.png` is already supplied and visibly shows OpenCode's `create-agdf` plugin indicator plus AGDF interaction and global-skill use.
  - The work is limited to `pages/**` and does not touch the excluded runtime, control-template or CLI paths of the Non-Normative Trivial Change Boundary.
- transparency: no PRD, SD or TP is required because the approved UR fixes the public message and acceptance boundary, all technical owners are known, no interface or persistent state changes, product-policy choice, new command, runtime behavior or cross-surface contract is introduced, and the small visual change can be validated with the existing Pages build/check path.
- missing_evidence: no browser breakpoint capture exists yet; implementation must render and inspect the responsive grid before claiming completion.
- current_coverage:
  - `partially_done`: Easy Setup already provides the two reusable Codex and Claude Code proof cards, correct lightbox hooks and a release-source-of-truth disclaimer.
  - `not_done`: OpenCode card, three-card responsive composition, factual OpenCode label, privacy-safe framing and real intrinsic dimensions.
- reuse_strategy: `extend` the existing image-card markup and responsive utility layout; reuse the shared lightbox and supplied asset rather than introducing a new component or client script.
- risks:
  - A three-column layout can make dense screenshots unreadable; use a focused crop or responsive presentation that preserves the visible plugin proof.
  - The OpenCode UI must be described as npm-plugin/global-native-skill evidence, not as the same plugin-detail UI or enforcement model as the other surfaces.
  - Public screenshots should avoid unnecessary local paths and user-specific context.
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- required_next_step: execute the Quick Task, run Pages check/build and record compact evidence.

## Mode/Slice Decision

- decision: `quick_task`
- scope_reason: the change is a bounded extension of an existing static Pages section, reuses its generic interaction owner and remains outside runtime-governing paths. The UR already fixes the factual statement and visual acceptance boundary.
- evidence: `pages/src/pages/index.astro`; `pages/src/layouts/BaseLayout.astro`; supplied `pages/public/assets/opencode-agdf-plugin-ui.png`; `plugin/meta/agdf-runtime-contract.md` Non-Normative Trivial Change Boundary.
