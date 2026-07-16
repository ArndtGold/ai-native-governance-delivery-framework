# User Requirement: Self-Hosting Gate Proof

- work_item: `pages-self-hosting-gate-proof`
- status: approved
- revision: 2
- date: 2026-07-16
- approval: revision 2 approved with exact `Approval: UR` on 2026-07-16 after same-run, same-gate and revision revalidation; revision 1 approval retained as historical evidence

## User Need

The public AGDF Pages site should use two Codex screenshots as a concise proof sequence showing
that AGDF governs its own evolution from solution-design approval to quality-backed user-acceptance
readiness. The surrounding copy must describe the actual Gate-Rationale-Registry run instead of the
previous file-count CLI / UR example.

## Required Presentation

- Keep the screenshots in the existing proof module and align that module with the approved
  `AGDF is developed using AGDF.` self-hosting claim.
- Replace the stale file-count CLI / UR terminal story with the actual bounded requirement:
  a curated, localized and deterministic one-line rationale for every gate and internal step.
- Present a visible two-step sequence: `SD — design decision` followed by
  `UAT — ready for user acceptance`.
- Show that the first capture is at the `SD` gate and that `Approval: SD` authorizes only the next
  planned transition.
- Show that the second capture has passed QA evidence and is ready for a deliberate UAT decision,
  while making clear that a selected but unsubmitted `Approval: UAT` is not completed acceptance.
- Explain the bilingual evidence accurately: German user interaction and an English durable SD
  or QA artefact under the repository language policy.
- Reuse the existing lightbox pattern for both images; use a two-column proof layout on desktop and
  stack the proof cards on mobile without introducing a carousel or new runtime behavior.
- Use accurate alternative text and intrinsic dimensions for the SD image (`3348 x 2692`) and UAT
  image (`3356 x 2712`).

## Acceptance Criteria

1. The proof heading, lifecycle summary, screenshots, alternative text and captions tell one
   coherent Gate-Rationale-Registry sequence from SD decision to UAT readiness.
2. The proof visibly supports the existing present-tense claim that AGDF is developed using AGDF.
3. No copy claims that all historical AGDF code was produced under the current process.
4. The exact values remain `Approval: SD` and `Approval: UAT`; screenshots are evidence, not current
   release or approval authority.
5. The UAT proof is labelled as ready for decision and never as accepted or completed delivery.
6. Existing Pages composition, lightbox behavior and responsive conventions are reused; no route,
   component system or runtime behavior is introduced.
7. Pages check and build pass, focused source assertions pass, the rendered proof is inspected at
   desktop and mobile widths, and `git diff --check` passes.

## Scope Boundary

In scope: the existing proof block in `pages/src/pages/index.astro`, the already replaced
`pages/public/assets/codex-gate-check-proof.png`, one additional privacy-safe UAT screenshot asset
derived from the user-provided capture, and durable artefacts for this follow-up.

Out of scope: claims of completed UAT from the pre-submit capture, changes to AGDF gate behavior,
the Gate-Rationale-Registry implementation itself, further screenshots, new routes, release-version
claims, commit, push, pull request or release.

## Evidence Basis

- approved `pages-self-hosting-proof` UR and its evidence-backed present-tense claim
- the new Codex screenshot showing the German SD approval surface and English SD artefact
- the user-provided Codex screenshot showing passed QA evidence and UAT ready for deliberate decision
- the active `agdf-gate-rationale-why` run and its approved UR, PRD, SD and TP artefacts
- current Pages proof composition in `pages/src/pages/index.astro`
