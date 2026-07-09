# QA Report: AGDF Delivery Path Search

Status: passed
Gate: QA
Decision: `pass`
Gate approval: `Approval: QA`
Date: 2026-07-09
Owner: agent
Based on: `.agdf/control/artefacts/agdf-delivery-path-search/TP.md`

## QA Gate

- decision: `pass`
- evidence:
  - UR, PRD, SD and TP are approved and form a complete artefact chain.
  - Pre-implementation Brownfield Analysis passed and implementation reused the existing CLI, package, skill-routing, generation and test owners.
  - DPS-01 through DPS-14 are `fully_done` in TP Review.
  - Clean Implementation Review passed with no fallback-heavy or parallel authority model.
  - Code Review passed after resolving path traversal, action-smuggling, cost-budget and package-wrapper findings.
  - Focused Delivery Path Search tests passed.
  - `npm --prefix create-agdf run smoke-test` passed.
  - `node plugin/scripts/check-runtime-integrity.mjs` passed with 9 skills and 13 control files.
  - `npm --prefix agdf run smoke-test` passed against packed dependencies and exercised the new command.
  - Package dry-run included runtime modules and generated surface mappings.
  - Pages now render all 9 canonical skills, place Delivery Path Search in the workflow and distinguish executable Codex evaluation from contract-ready surfaces.
  - `npm --prefix pages run check` passed with 0 errors, warnings or hints.
  - `npm --prefix pages run build` passed.
  - `git diff --check` passed.
- missing_evidence: none for the approved first-release scope
- risks:
  - Codex is the only executable native evaluator adapter; other supported surfaces expose the shared workflow and contract and fail explicitly until a conforming evaluator is configured.
  - `instruction_only` surfaces cannot technically prove write prevention and are labelled accordingly.
  - Cost units are rubric units rather than measured provider currency.
  - The existing CLI gate projection does not consume persisted Brownfield Analysis completion; the live run and persisted pass artefact remain authoritative.
- required_next_step: Request exact approval `Approval: QA`.
- impact_codes:
  - `AGDF_DPS_NATIVE_EVALUATOR_CODEX_ONLY` — warn
  - `AGDF_DPS_WEAK_SURFACE_ENFORCEMENT_VISIBLE` — warn
  - `AGDF_BROWNFIELD_PROJECTION_GAP` — warn

## Acceptance Decision

All PRD acceptance criteria are covered for the approved first release:

- one portable core and canonical contract
- honest bounded-search naming
- deterministic gate legality before evaluation
- no permission granted by search
- recommendation or `no_safe_recommendation`
- facts and model judgements separated
- bounded evaluation, depth, duration, cost and stability
- invalid evaluator output fails closed
- redacted persistence
- executable Codex reference adapter
- shared Claude Code, Copilot and OpenCode mappings with explicit capability limits
- adapter extensibility without core forks
- cross-surface runtime-integrity checks
- unchanged canonical AGDF gate authority

The documented non-Codex evaluator limitation is inside the approved PRD boundary and is not missing scope.

## QA Revision Closure

The initial QA pass review exposed an incomplete DPS-13 documentation surface: Pages still stated “7 Core Workflow Skills” and omitted `code-review` and `delivery-path-search`.

The finding was corrected before QA approval:

- the heading now derives its count from `skills.length`
- all 9 canonical skills are represented
- Delivery Path Search has the Planning family
- the workflow places optional path search before implementation contracts and preparation
- Compatibility states that Codex is executable while Claude Code, Copilot and OpenCode are contract-ready pending a conforming evaluator
- Pages type-check and static build both pass

The QA decision remains `pass` after re-verification.

### Documentation and drift-hardening follow-up

A second QA revision completed the remaining documentation hardening:

- Runtime Integrity now compares `pages/src/data/skills.ts` exactly with the canonical plugin `skillSet`.
- Runtime Integrity requires the Pages heading to derive its count from `skills.length`.
- Pages now show a concrete three-path decision example, deterministic gate rejection, `no_safe_recommendation`, enforcement meanings and an executable-support matrix.
- `INSTALL.md`, `create-agdf/README.md` and `agdf/README.md` document prerequisites, options, persistence paths, cost-unit semantics and the mandatory post-search gate-check.
- CLI failure text no longer implies that a configurable external evaluator already exists.

Re-verification passed Runtime Integrity, Pages check/build, create-agdf smoke/routing, packaged CLI smoke and diff checks. The QA decision remains `pass`.

### Benefit communication follow-up

User review found that the Pages section explained the mechanism but did not make the advantage legible. The section now leads with the business consequence:

- avoid implementing the wrong plausible direction first
- reduce expensive rework and duplicate architecture
- gain decision-relevant evidence earlier
- allow agents to explore without silently turning exploration into implementation

The authorization example now connects rejected paths to migration cost, maintenance risk and protection of the existing investment. Pages check/build and Runtime Integrity pass after the copy revision.

### Page consolidation follow-up

The rendered page was reviewed as one information flow and consolidated:

- Intake now owns delivery-path selection.
- Workflow now owns execution after the path is chosen.
- Gate Map now explains durable approvals and evidence instead of repeating workflow instructions.
- Duplicate path matrices and gate-card repetitions were removed.
- Delivery Path Search is visibly optional.
- Operating guards lead with practical consequences instead of internal terminology.
- OpenCode is labelled the control-stack reference; Codex is labelled the executable Delivery Path Search reference.
- The Author section now describes AGDF as an independent installable open framework.

Rendered headings and section text were re-inspected after the change. Pages check/build, Runtime Integrity and diff checks pass. QA remains `pass`.

### Search-method explanation

Pages now explain the methodological basis without overstating the implementation:

- Delivery Path Search is inspired by decision-tree search.
- The current algorithm is bounded best-first search.
- Candidate expansion is limited by cost, time, depth and evaluation budgets.
- Full MCTS would require stochastic simulation, reward backpropagation and an explicit exploration policy.

Pages check/build and Runtime Integrity pass after this clarification.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: none yet
- context_graph_required_action: Promote portable adapter, gate-authority and enforcement-level invariants after UAT.
- context_graph_gate_effect: none
- context_graph_evidence: QA verifies these invariants, but UAT should confirm the product positioning before promotion.

## Approval

Approved with `Approval: QA` on 2026-07-09.

## Planned Follow-up

The next product step is recorded separately as `delivery-path-search-ai-candidate-generation`:

- use AI to generate several concrete delivery-path candidates from objective, risks, missing evidence and the allowed action class
- validate every candidate deterministically before evaluation
- keep scoring, budgets, persistence and AGDF gate authority controlled
- require a new UR rather than silently expanding the approved first release
