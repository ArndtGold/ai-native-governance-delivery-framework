# Brownfield Review: Self-Hosting Gate Proof

## Decision

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- reviewed_at: 2026-07-16
- ur_revision: 2

## Scope

Extend the existing Codex proof module into a two-step Gate-Rationale-Registry sequence from SD
decision to quality-backed UAT readiness under the approved `AGDF is developed using AGDF.` claim.

## Existing-System Evidence

| Area | Existing owner or artefact | Coverage and impact |
|---|---|---|
| Public claim | `.agdf/control/artefacts/pages-self-hosting-proof/UR.md` | Already approves the evidence-backed present-tense self-hosting claim and its historical boundary. |
| Page composition | `pages/src/pages/index.astro` | Owns the self-hosting section, proof terminal, screenshot, caption, lightbox and responsive layout. Extend in place. |
| SD screenshot | `pages/public/assets/codex-gate-check-proof.png` | Already replaced by the user; shows German SD approval and English solution design at `3348 x 2692`. |
| UAT screenshot source | user-provided capture at `3356 x 2712` | Shows passed QA evidence and UAT ready for deliberate decision; it does not show submitted or persisted acceptance. |
| Captured feature scope | `.agdf/control/artefacts/agdf-gate-rationale-why/{UR,PRD,SD,TP,QA_REPORT}.md` | Establishes the real Gate-Rationale-Registry requirement, SD transition and QA evidence. Read-only evidence; owned by a separate run. |
| Runtime, persistence and architecture | none | Static public presentation change only. |

## Current Coverage And Reuse

- current_coverage: `partially_done`; revision 1's SD proof copy, alternative text, dimensions and
  desktop/mobile rendering already pass, while the approved UAT proof card is not yet repository-owned
  or rendered.
- reuse_strategy: `extend` the existing proof block, card treatment, lightbox and responsive grid;
  use two columns on desktop and the existing stacked grid behavior on mobile.
- primary_visible_owner: `pages/src/pages/index.astro`.
- parallel_structure_risk: low; one additional image asset is needed, but no new section, component,
  gallery, carousel, data owner or runtime behavior is needed.

## Risks And Controls

- Narrative mismatch: make heading, lifecycle summary, both screenshots, captions and alt text describe one SD-to-UAT run.
- Historical overclaim: retain present-tense self-hosting language and avoid `was built` claims.
- Approval overclaim: state that the captures record decision points and do not themselves grant current authority.
- UAT overclaim: label the second image `ready for user acceptance`, never accepted or completed.
- Bilingual confusion: explain German interaction versus English durable artefacts as intentional language policy.
- Responsive density: keep two cards side by side only at the large breakpoint, stack them on mobile,
  preserve both lightboxes and verify that captions remain readable.
- Scope collision: do not edit the active `agdf-gate-rationale-why` feature implementation or artefacts.

## Transparency

PRD, SD and TP are skipped because product semantics are already exact in the approved self-hosting
UR and revision 2 adds one bounded evidence asset plus a second card inside the same owner. The
change introduces no new route, component system, gallery behavior, architecture, persistence or
runtime contract. Quick Task execution must remain confined to both claimed screenshots and the
existing proof module, followed by focused checks, rendered inspection, Code Review and compact
closeout.

## Context Graph

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: none
- context_graph_evidence: the change presents existing evidence and establishes no reusable runtime invariant.

## Required Next Step

Quick Task execution: copy the approved UAT capture into the existing asset owner, render the
two-step proof sequence, then run Pages checks, focused assertions, responsive rendered inspection,
Code Review and compact closeout.
