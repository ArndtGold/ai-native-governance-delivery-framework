# Brownfield Review: Sharpen create-agdf README For First Contact

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/create-agdf-readme-first-contact/BROWNFIELD_REVIEW.md`
- scope: restructure and sharpen only `create-agdf/README.md` so its first screen explains fit, value and a recommended start before the complete existing reference; add links to already-authoritative project materials.
- evidence:
  - `create-agdf/README.md` already owns package usage, surface targets, control-state operations, source-of-truth and publishing reference, but starts directly with an undifferentiated command list.
  - Root `README.md` provides AGDF purpose, process-overhead framing, contribution invitation and Apache-2.0 license link.
  - `INSTALL.md` is the authoritative surface-specific setup and capability-boundary reference; `RELEASE.md` owns the release workflow.
  - `create-agdf/package.json` owns package description, public registry metadata and its local validation scripts.
  - No `CONTRIBUTING.md`, `SECURITY.md`, support policy or separate security reporting channel exists in the repository, so the README must link existing contribution routes and state the absence of a separate policy rather than invent one.
- transparency: no PRD, SD or TP is required because the approved scope changes documentation navigation and framing only, reuses known authorities, has no command, runtime, policy, interface, persistence or release-workflow change, and remains wholly within a Markdown file outside runtime-governing paths.
- missing_evidence: no user study or analytics exists for first-contact comprehension; the reviewed structural gaps and authoritative sources are sufficient for this bounded documentation improvement.
- current_coverage:
  - `partially_done`: accurate command, target, runtime-boundary, source-of-truth and publishing reference already exists.
  - `not_done`: concise value/fit opening, an explicitly recommended first success path, navigation to authoritative deeper material and honest contribution/security boundary guidance.
- reuse_strategy: `extend` the existing README with a short opening and a navigation layer; link root `README.md`, `INSTALL.md`, `RELEASE.md`, `LICENSE` and the existing GitHub issue route instead of copying or creating policy documents.
- risks:
  - A shortened entry point could accidentally overrule detailed surface guidance; mitigate by keeping the existing target reference intact and linking to `INSTALL.md` as authority.
  - A contribution/security section must not imply a policy that does not exist; state the boundary and point to the existing issue route only for non-sensitive contribution discussion.
- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- required_next_step: execute the Quick Task, validate Markdown links and package documentation checks, then record compact closeout evidence.

## Mode/Slice Decision

- decision: `quick_task`
- scope_reason: one existing Markdown file is being sharpened through links to already-authoritative material; no product behavior, public command shape, runtime contract or policy is changed.
- evidence: `create-agdf/README.md`; root `README.md`; `INSTALL.md`; `RELEASE.md`; `LICENSE`; `create-agdf/package.json`.
