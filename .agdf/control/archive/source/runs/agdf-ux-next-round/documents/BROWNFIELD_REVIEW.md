# Brownfield Review: AGDF UX Next Round

Gate: Brownfield Review
Type: Brownfield Review
Status: done

## Review Meta

- mode: `post_ur_review`
- run_id: `agdf-ux-next-round`
- related_ur: `.agdf/control/artefacts/agdf-ux-next-round/UR.md`
- reviewed_at: 2026-07-15
- reviewer: agent

## Review Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- reuse_strategy: `extend_existing_owners`

## Existing-System View

| Area | Existing owner or artefact | Coverage | Impact |
|---|---|---|---|
| Run selection and gate evaluation | `create-agdf/bin/create-agdf.js`, `create-agdf/lib/control-state/run-state-repository.js` | `partially_done`: explicit `--run` works and ambiguity fails closed; human-readable candidate choice is not present | high |
| Human decision presentation | `create-agdf/lib/interaction-presentation.js`, `plugin/meta/agdf-runtime-contract.md`, `plugin/skills/gate-check/SKILL.md` | `fully_done` for ready approval cards; scope extends to blocked/ambiguous and first-contact states | high |
| Plugin onboarding | `plugin/meta/agdf-plugin.definition.json`, generated manifests, `create-agdf/README.md` | `partially_done`: suitability prompt and installation guide exist; short progressive first-contact flow is not explicit | medium |
| Skill discovery | `pages/src/data/skills.ts`, `pages/src/pages/index.astro` | `partially_done`: skills have families and triggers, but are rendered as one flat nine-item catalogue | medium |
| Fallback and version evidence | `plugin/meta/agdf-plugin.definition.json`, `create-agdf/README.md`, `pages/src/pages/index.astro` | `partially_done`: exact-text fallback and version boundary exist; runtime fallback explanation and installed/expected evidence need one visible contract | medium |
| Durable control state | `.agdf/control/runs/<run_id>/RUN_STATE.md`, `MASTER_BACKLOG.md` | `fully_done`: one canonical run owner and linked artefact chain | low |
| Validation and propagation | `create-agdf/scripts/interaction-presentation-test.js`, `plugin/scripts/check-runtime-integrity.mjs`, `create-agdf/scripts/smoke-test.js` | `fully_done` for current contracts; new UX states require focused coverage | medium |

## Reuse And Parallel-Structure Risk

| Finding | Risk | Required action |
|---|---|---|
| `agdf-human-decision-surface` already owns the broader status/blocked/clarification presentation boundary. | High: a second card or status renderer would fork semantics. | Extend the existing presentation contract and link the prior run; do not create a second state model. |
| `native-gate-buttons-live` owns native approval presentation and fallback authority boundaries. | High: ambiguous-run UX must not become a new approval path. | Reuse native adapter rules and keep exact approval text canonical. |
| `create-agdf` already distinguishes JSON, compact status-card and native presentation paths. | Medium: adding candidate selection only to one output would create surface drift. | Define primary, detail and machine projections before implementation. |
| `pages/src/data/skills.ts` already has family and trigger data. | Medium: manually maintained “Start here” copies could drift. | Derive grouping from canonical skill metadata or add one explicit, tested semantic field. |
| Pages explicitly states screenshots are not release-version sources of truth. | Low: evidence is clear but not prominent enough for trust repair. | Reuse the boundary and add visible installed/expected/historical labels without treating screenshots as runtime evidence. |

## Impact Assessment

- files/modules: run-selection presentation and CLI output, interaction presentation contract,
  canonical plugin metadata, skill metadata/rendering, installation/status documentation and
  screenshot evidence labels.
- interfaces: human-facing status, blocked and onboarding surfaces; JSON and gate authority must
  remain backwards compatible.
- data model/migrations: no new authority model; a small presentation/grouping field may be
  appropriate if it can be derived and validated.
- backwards compatibility: exact approval values, existing skill identifiers, locale packs,
  `--run` and machine-readable output remain stable.
- regression tests: add focused tests for candidate presentation, progressive onboarding,
  grouping semantics and fallback/version labels; retain interaction, runtime-integrity and smoke
  checks.
- side effects: users may see a clearer choice before gate-check can continue; no implicit run
  selection or approval is permitted.

## SoT And Product-Semantics Findings

The requested changes are user-visible product semantics across multiple surfaces, not a
documentation-only change. The Runtime Contract remains the semantic authority. Human-readable
run candidates and skill grouping are presentation projections and must never become alternate
gate or scope authority. The existing `agdf-human-decision-surface` and
`native-gate-buttons-live` records are linked prior work, not silently reopened acceptance.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: existing human decision surface, native gate interaction and onboarding
  presentation decisions
- context_graph_required_action: link existing knowledge if the PRD establishes a new reusable
  presentation invariant
- context_graph_gate_effect: none
- context_graph_evidence: existing runtime contract and prior UX slices already define the
  separation between canonical control state, human presentation and host-native interaction.

## Transparency

`structured_slice` is the smallest safe path. Quick Task is not appropriate because the scope
changes normative user-visible behavior across run selection, onboarding, skill discovery and
fallback/version evidence. Full structured delivery is not required yet because the affected
owners and compatibility boundaries are known; a focused PRD must first define the exact states,
copy, projections and acceptance evidence.

## Missing Evidence

- No live first-time-user study was run.
- No fresh cross-surface session evidence was collected in this review.
- The PRD must define how candidate titles, version labels and fallback explanations are verified
  on each supported surface.

## Next Permissible Step

- next_allowed_action: Draft the focused PRD for the bounded UX presentation slice.
- forbidden_until_then: SD, TP, implementation, QA, UAT and release claims.

## Quality Outlook

Keep one canonical control-state model and extend its presentation projections. The primary quality
risk is UX clarity drifting into a parallel authority model or surface-specific behavior.

## Follow-up Brownfield Review: Run Reconciliation And Lifecycle Status

### Review Meta

- review_type: `post_prd_follow_up`
- related_prd: `.agdf/control/artefacts/agdf-ux-next-round/PRD.md` section 2.5
- reviewed_at: 2026-07-15
- reviewer: agent
- PRD approval: `Approval: PRD` provided on 2026-07-15

### Review Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `SD`
- reuse_strategy: `extend_existing_owners`

The refinement is implementable without a new authority model, but it is not a Quick Task. It
changes user-visible orchestration and status semantics across the durable run repository, gate
evaluation, human CLI output and agent routing guidance.

### Existing-System Findings

| Concern | Existing owner | Finding | Required direction |
|---|---|---|---|
| Active-run ambiguity | `create-agdf/lib/interaction-presentation.js`; `create-agdf/bin/create-agdf.js` | `buildRunCandidates()` intentionally projects only valid active runs; this correctly prevents closed runs from being selectable, but it cannot identify a matching completed delivery before a new run is created. | Add a separate non-authorizing reconciliation projection for active and recently completed runs; do not broaden the approval candidate list to closed runs. |
| Run discovery | `create-agdf/lib/control-state/run-state-repository.js`; `run-state-resolver.js` | Canonical parsing and explicit `--run`/`AGDF_RUN_ID` selection already exist. Matching by recency, branch or chat proximity would violate the existing fail-closed boundary. | Define deterministic matching inputs in SD; uncertain matches must be reported as clarification, never auto-selected. |
| OR / completed status | `create-agdf/bin/create-agdf.js` transition evaluation; `plugin/meta/agdf-runtime-contract.md` status contract | OR handoff currently returns `status: open` with `current_gate: OR`, while the canonical run may have `lifecycle: completed`. This is process-valid but humanly ambiguous. | Keep lifecycle and delivery state separate in the projection, e.g. `completed` plus `delivery closeout pending`; preserve machine compatibility and exact authority. |
| Agent routing | `plugin/skills/gate-check/SKILL.md`; `plugin/meta/agdf-agent-router.md` | Existing guidance resolves active ambiguity but does not require a pre-creation check against completed matching work. | Add a pre-creation reconciliation invariant and require an explicit explanation when work is already delivered or a new follow-up is justified. |
| Tests and generated surfaces | `create-agdf/scripts/interaction-presentation-test.js`, `control-state-test.js`, `smoke-test.js`, runtime-integrity sync | Active candidate and OR status behavior are covered independently; the combined reconciliation and lifecycle wording is not yet covered. | Add focused fixtures and propagate the canonical wording through integrity/smoke checks without changing existing JSON authority fields. |

### Ownership And Compatibility Boundary

- The canonical control-state files and run parser remain the sole source of lifecycle, gate and
  approval authority.
- The reconciliation result is a presentation/clarification projection only. It must never select
  a run, approve a gate, reopen a completed run or persist a new authority record.
- Active-run candidates remain active-only for selection. Completed matches are informational and
  may point to the delivered OR/closeout; a distinct follow-up requires explicit user intent and
  its own durable scope.
- Existing `--run`, `AGDF_RUN_ID`, `candidate_runs`, exact approval values and machine-readable
  schemas remain backward compatible. Additive detail fields require consumer-safe defaults.
- No fuzzy model judgement may become the canonical match decision. The SD must define a bounded,
  deterministic match contract and a fail-closed result for insufficient evidence.

### Impact And Risks

- impact: high for chat orchestration clarity; medium for CLI human output; low for gate authority
  and persistence because those remain unchanged.
- primary risk: a broad semantic matcher could incorrectly merge distinct work or expose a
  completed run as selectable. Mitigation: separate informational matching from active selection,
  deterministic evidence, and explicit clarification on ambiguity.
- secondary risk: changing `status: open` globally could break automation. Mitigation: preserve the
  existing JSON status contract where required and introduce a distinct lifecycle/closeout display
  value or human-facing label through the canonical projection.
- evidence gap: no live host rendering is required for this refinement; deterministic CLI/chat
  projection tests are the first proof boundary.

### Next Permissible Step

- next_allowed_action: Draft the focused Solution Design for deterministic existing-run
  reconciliation and lifecycle/closeout status projection.
- forbidden_until_then: implementation, QA, UAT and release claims for this follow-up refinement.

### Quality Outlook

The clean solution is a pre-creation reconciliation projection plus an explicit lifecycle/closeout
projection, both derived from the existing run state. Do not solve the symptom by auto-reusing the
most recent run, by making completed runs active candidates, or by adding a second run registry.
