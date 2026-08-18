# Brownfield Analysis: AGDF Landing Page Simplification

Status: done
Mode: `pre_implementation_analysis`
Decision: pass
Date: 2026-08-18
Run: `agdf-pages-landing-simplification`
Approved plan: TP Revision 2

## 1. Scope And Baseline

The approved implementation is a bounded in-place refactor of the existing Pages landing surface.
No plugin/runtime, policy, deployment, public-directory or release owner is an implementation target.

Baseline reproduced before candidate mutation:

- `npm --prefix pages run check`: pass, 0 errors, 0 warnings, 0 hints;
- `npm --prefix pages run build`: pass, four static routes;
- `node pages/scripts/public-documents-test.mjs`: pass;
- rendered homepage: 163,779 HTML bytes;
- inline script content: 5,621 bytes;
- ten referenced local images: 8,570,997 bytes;
- about 4,987 visible words and 20 major sections from the approved pre-change audit;
- worktree contains only this new run's control artefacts and backlog pointer.

## 2. Existing Owners And Reuse Path

| Concern | Existing owner | Reuse decision |
|---|---|---|
| Shared identity/version/URLs | `pages/src/data/site.ts`; canonical plugin definition | retain `site`; refactor only homepage-specific exports into `landingPage` |
| Homepage composition | `pages/src/pages/index.astro` | replace in place with approved seven-section static composition |
| Page shell/metadata | `pages/src/layouts/BaseLayout.astro` | extend existing props; remove obsolete homepage-only script |
| Styling | `pages/src/styles/global.css`; existing Tailwind classes | retain visual tokens/surfaces; remove obsolete interaction/reveal rules only after markup replacement |
| Proof counts | `pages/src/data/evaluationEvidence.ts` | retain repository-derived evidence |
| Detailed guidance | `INSTALL.md`; bilingual handbook | link, never duplicate |
| Public policies | root documents and existing redirect routes | retain unchanged |
| Validation | Pages check/build/public-document test | extend with one focused landing-page test and package script |

## 3. Exact Candidate Paths

Approved source mutation paths:

- `pages/src/data/site.ts`;
- `pages/src/pages/index.astro`;
- `pages/src/layouts/BaseLayout.astro`;
- `pages/src/styles/global.css`;
- `pages/package.json`;
- new `pages/scripts/landing-page-test.mjs`;
- `pages/src/data/projectStats.ts` and `pages/src/data/skills.ts` only if final consumer search remains
  empty after the new composition is wired;
- this run's control artefacts, backlog pointer and required Context Graph reconciliation.

Implementation-time validation discovery adds one focused source-mode validation owner:

- `plugin/scripts/check-runtime-integrity.mjs`, limited to replacing obsolete Pages assertions that
  required the removed duplicate skill catalogue and full UX-fidelity detail on the homepage. The
  replacement checks the approved concise projection, canonical evaluation evidence and canonical
  handbook/contract/installation destinations. This is TP LPS-T10 validation maintenance; it does
  not change installed runtime, plugin, gate, mode or skill semantics.

Shared evidence images under `pages/public/assets/` are not deletion targets. The homepage may stop
referencing them, but installation documentation and repository evidence continue to own them.

## 4. Fragment And Consumer Evidence

Repository-wide source scan found no independent inbound references to the old major homepage
fragments outside `index.astro`. The four old `#setup-*` references exist only in the current
`compatibility` export in `site.ts`, which is itself replaced by the new projection. `#setup` remains
the stable installation anchor.

`projectStats.ts` is consumed only by the current homepage and performs build-time GitHub requests.
`skills.ts` is consumed only by the current homepage and duplicates a presentation catalogue that is
removed by the approved scope. Both may be deleted after the final consumer scan. Their canonical
sources remain the plugin definition, repository, release links and evaluation projection.

## 5. Regression And Test Impact

Primary regressions:

- loss or inflation of protected public-plugin/evidence wording;
- altered exact Hero hierarchy or repeated Formula 1 framing;
- broken anchors or documentation/policy destinations;
- script-dependent mobile navigation or hidden content;
- malformed metadata;
- word/section/payload guard evasion;
- obsolete imports, exports, CSS or interaction markup;
- accidental deletion of shared evidence assets.

The TP's LPS-V01–LPS-V20 and LPS-L01–LPS-L06 cover these risks. Negative probes must use temporary
fixtures or in-memory mutations and leave the candidate unchanged.

## 6. Worktree And Compatibility

- unrelated_dirty_paths: none observed at baseline;
- generated/cache paths: no tracked baseline drift after the pre-change checks;
- data/persistence/migration: none;
- public API/CLI/file-format impact: none;
- browser compatibility: native HTML/CSS and Astro static output; no new dependency;
- rollback: bounded source revert; no external or persistent state;
- deployment/live-domain evidence: explicitly outside scope.

## 7. Parallel-Structure And Drift Check

- no new design system, component library, content tree, policy owner or runtime model;
- `landingPage` replaces parallel homepage exports rather than layering on top;
- exact Hero copy derives from approved PRD/SD and remains presentation data, not product policy;
- Formula 1 is problem framing only and must not become a second workflow model;
- canonical handbook, installation and policy owners remain authoritative;
- local render evidence remains distinct from deployed/host/portal/publication evidence.

## 8. Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; prior Pages positioning/evidence nodes
- context_graph_reconciliation: open_gap
- context_graph_required_action: update after implementation evidence
- context_graph_gate_effect: none during CD+Tests; closeout blocked until reconciled
- memory_target: context_graph
- memory_reason: Preserve the concise-homepage/canonical-detail boundary and single problem/process
  framing for future public communication.
- memory_refs: approved PRD Revision 3; SD Revision 3; TP Revision 2; this analysis

## 9. Decision

- current_coverage: partially_done
- reuse_strategy: refactor existing owners in place; delete only proven obsolete homepage-only owners
- evidence: approved artefact chain, passing baseline tests, source/consumer/fragment inventory and
  reproduced payload metrics
- missing_evidence: implementation, focused guard results and visible browser evidence only
- risks: bounded and covered by approved tests; no unresolved owner or scope conflict
- required_next_step: Implement LPS-T02–LPS-T12 through the approved paths, run LPS-V02–LPS-V20 and
  LPS-L01–LPS-L06, then record CD+Tests evidence before mandatory reviews.
