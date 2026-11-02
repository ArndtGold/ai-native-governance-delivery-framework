# Brownfield Analysis: Architecture Debt Prevention

Status: done
Mode: `pre_implementation_analysis`
Decision: `pass`
Date: 2026-09-28
Owner: Arndt Gold (AGDF Brownfield policy)
Based on: approved TP revision 17, approved SD revision 14 and approved PRD revision 11

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_ANALYSIS.md`
- scope: TP tasks T1-T7 within the approved architecture-debt-prevention change.
- evidence: the current Brownfield skill, review template, Modes and Quality contracts, runtime-integrity owner, evaluation corpus, package projection and host installers were inspected.
- missing_evidence: scenario results, package parity, host observations and downstream reviews are implementation/QA obligations, not prerequisites to selecting the reuse path.
- risks: broad trigger language, duplicate policy ownership, weak accepted-debt evidence and stale host sessions.
- required_next_step: implement T1-T4 through the existing owners, project packages through T5, then collect and review T6-T7 evidence without overstating host acceptance.

## Existing Coverage And Reuse

| TP scope | Existing owner | Current coverage | Reuse strategy |
|---|---|---|---|
| T1 architecture guidance | `plugin/skills/brownfield-analysis/SKILL.md` | `partially_done`: architecture, reuse, compatibility, migration, SoT drift and route evidence already appear, but conditional relevance, problem/trade-off and retained-debt acceptance are not explicit. | `extend` only `post_ur_review`; keep `pre_implementation_analysis` distinct. |
| T2 review record | `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` | `partially_done`: Existing-System View and four-column Reuse And Parallel-Structure Risk table exist; compact architecture relevance and accepted-debt details do not. | `extend` the same template and finding index; create no second registry. |
| T3 policy boundaries | `plugin/meta/contracts/gate-transition.md`, `modes.md`, `quality.md` | `fully_done` for gate, depth and normalized gap ownership. | `reference` existing owners; add only a necessary cross-reference. |
| T4 checks and scenarios | `plugin/scripts/check-runtime-integrity.mjs`, `evals/cases/brownfield-analysis.json`, `evals/manifest.json` and deterministic observations | `partially_done`: structural Brownfield checks and scenario harness exist; architecture-debt-specific outcomes are missing. | `extend` existing integrity and eval owners; do not create another test runner. |
| T5-T6 distribution | `create-agdf/scripts/sync-package-assets.js` and local installers for Codex, Claude, Copilot and OpenCode | `fully_done` as a source-to-package and installation path; no fresh-session acceptance for this change exists. | `reuse` projection and installer flows; record each host observation separately. |

## Minimal Safe Implementation Path

1. Add the conditional architecture prompts and not-applicable route to the existing Brownfield skill. Reference `modes.md` and `quality.md` rather than copying their normative tables.
2. Add compact Architecture Impact fields to the existing Brownfield Review template. Keep each retained-debt decision tied to one existing finding and require its rationale, owner, mitigation and review/exit condition.
3. Add only the cross-reference needed in `gate-transition.md`; keep existing gate order and authority.
4. Extend the current runtime-integrity checks and Brownfield evaluation cases with positive, negative and low-impact evidence. Keep replay evidence separate from live-host observations.
5. Project canonical `plugin/` sources into generated packages, then install and observe each agreed host in a fresh session. Record actual availability and provenance; do not infer acceptance from package integrity.

## Boundaries And Regression Risks

- The current worktree contains this run's approved artefacts, control revisions and presentation records. Preserve them and do not treat them as implementation defects or as authority for another run.
- No new gate, approval type, CLI command, debt backlog, architecture skill or separate findings table is needed for this PRD/SD scope.
- The existing `Reuse And Parallel-Structure Risk` table must keep its four columns. The architecture detail block must refer to the same finding, so later review can identify the owner and exit condition without a second source of truth.
- `post_ur_review` decides relevance before Mode/Slice; `pre_implementation_analysis` verifies implementation fit after TP. Do not merge the two routes or run a second depth matrix.
- Missing decisive evidence uses the existing `block` recovery. A local change can use `architecture-not-applicable` only with a repository-based reason. A diagram is optional and must answer a specific boundary question.
- Source, generated package, installed plugin and fresh host session are four distinct evidence states. A stale or unavailable host stays unobserved until directly checked.

## Context Graph And Decision

- context_graph_impact: `none` for this pre-implementation record; the approved PRD keeps run-specific findings in the same artefacts. Curate a reusable graph update only if implementation produces a concrete durable decision.
- decision: `pass`; existing owners and reuse paths support the approved TP without a new architecture authority.
- required_next_step: proceed to `CD+Tests` for T1-T7, starting with the canonical skill and template. Reopen PRD or SD through the existing route if implementation reveals a material product or design conflict.
