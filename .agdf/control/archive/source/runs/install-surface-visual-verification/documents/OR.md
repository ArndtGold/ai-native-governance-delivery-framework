# OR: Add Shared Surface Visual Verification To INSTALL.md

## OR

- gate: `Quick Task Execution`
- report_mode: `OR-lite`
- artefact: `.agdf/control/artefacts/install-surface-visual-verification/OR.md`
- status: `pass`
- delivered:
  - Embedded direct relative references to the existing Codex, Claude Code and OpenCode Pages screenshots in their matching INSTALL.md detail sections.
  - Added captions that separate each UI example's observed integration evidence from installation/version authority, repository governance activation, session state and tool-enforcement claims.
  - Reused the source assets in place; no image was copied, regenerated, edited or added.
  - Recorded the user's explicit acceptance of the current OpenCode screenshot with visible local paths before publication.
- intentionally_not_delivered:
  - No Pages markup, image asset, CLI command, plugin behavior, integration semantics, policy or runtime state changed.
  - No privacy-safe replacement or crop was created because the user explicitly chose publication of the current OpenCode image unchanged.
  - No push, pull request or release was performed.
- evidence:
  - All three `pages/public/assets/` targets exist and INSTALL.md directly references each one.
  - `npm --prefix create-agdf run smoke-test` passed, including generated-asset sync, control-state, Delivery Path Search, installer smoke and routing checks.
  - `node plugin/scripts/check-runtime-integrity.mjs` passed (`9 skills and 14 control files checked`).
  - `node create-agdf/bin/create-agdf.js doctor --json` passed with 0 findings.
  - `git diff --check` passed.
  - User commit `c174661` records the direct `INSTALL.md` references and the pre-closeout scope artefacts.
- missing_evidence: none for the explicitly accepted direct-reference scope.
- risks:
  - The OpenCode screenshot visibly repeats local path information in INSTALL.md; this disclosure is explicitly accepted by the user on 2026-07-14.
  - UI examples can age independently of runtime behavior; every caption retains a command/status source-of-truth boundary.
- retained_fallbacks: none.
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- required_next_step: offer delivery closeout; the implementation is already recorded in `c174661`, while any additional closeout commit, push, pull request or release requires separate explicit instruction.
- quality_outlook: replace the OpenCode screenshot with a privacy-safe current capture if its visible UI or the accepted disclosure boundary changes.
