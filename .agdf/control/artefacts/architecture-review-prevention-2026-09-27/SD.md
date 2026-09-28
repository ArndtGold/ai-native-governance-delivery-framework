# SD: Architecture Debt Prevention in Brownfield Review

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD revision 11 (sha256:8ebc3a31ec124af91b6b09c84751474f25125eba11d7b11732172bb2482a7609)
Date: 2026-09-28
Owner: Arndt Gold (AGDF Brownfield policy)

## 1. Solution Overview

Extend the existing post-UR Brownfield Review with a conditional architecture lens. Before the existing Mode/Slice Decision, the reviewer establishes whether the change affects an architecture boundary or leaves an architecture decision uncertain. A relevant review names the affected boundary, impact, repository evidence, missing evidence, and the existing owner of the next decision. A low-impact review records `architecture-not-applicable` with its reason and continues through the same Brownfield route.

The review distinguishes an evidence-backed structural problem from an intentional trade-off. A trade-off that knowingly retains or adds debt is not considered accepted until the existing Brownfield Review names its rationale, accountable owner, mitigation, and review date or exit condition. Missing decisive evidence uses the existing `block` Mode/Slice recovery path. No new gate, approval, debt registry, or mandatory diagram is introduced.

This design implements PRD criteria `AC-ARCH-01` through `AC-ARCH-07` within the approved `structured_delivery` route. It does not authorize implementation; TP and its approval remain required after SD approval.

## 2. Ownership And Source Of Truth

| Concern | Existing authority | Design action |
|---|---|---|
| Brownfield review behavior | `plugin/skills/brownfield-analysis/SKILL.md` | Add the conditional evidence and trade-off instructions to `post_ur_review`; keep `pre_implementation_analysis` distinct. |
| Review record | `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` and each run's same-named artefact | Add a compact Architecture Impact section in this record and retain the existing Reuse And Parallel-Structure Risk table for findings. |
| Gate order and post-UR route | `plugin/meta/contracts/gate-transition.md` | Reference the existing Brownfield Review and Mode/Slice transition; create no new gate. |
| Structured depth | `plugin/meta/contracts/modes.md` | Keep its full-depth triggers and seven bounded-slice checks as the sole policy. Architecture evidence feeds those checks without copying the matrix into the skill. |
| Review-gap routing | `plugin/meta/contracts/quality.md` | Route later requirements, design, plan, implementation, and evidence gaps using its existing normalized categories. |
| Durable run authority | `.agdf/control/runs/<run_id>/RUN_STATE.md` | Continue to link one Brownfield Review artefact and one Mode/Slice Decision per run. |
| Host packaging | canonical `plugin/` source and `create-agdf/scripts/sync-package-assets.js` | Derive Codex, Claude, Copilot, and OpenCode surfaces from canonical source; do not edit generated profiles as separate owners. |

Arndt Gold is the accountable Brownfield policy owner. The approved PRD names Codex, Claude, Copilot, and OpenCode as the direct fresh-session acceptance scope. AD-01 resolves the PRD's deferred proportional trigger decision; AD-02 resolves its compact finding-format decision. TP still assigns direct host observation execution and evidence review under Arndt Gold's policy ownership.

## 3. Architecture Decisions

### AD-01 — Conditional architecture relevance

Treat architecture impact as relevant when the proposed change alters or crosses an existing module or owner boundary, externally consumed interface, data or source-of-truth ownership, compatibility or migration path, runtime/host contract, security or policy authority, or when evidence leaves one of these effects unresolved. The reviewer assesses only applicable dimensions and cites concrete repository evidence. This is an evidence prompt, not a second mode-selection matrix.

A local change may use `architecture-not-applicable` when the reviewer can explain from the affected code and owners why no material architecture boundary or unresolved architecture question is involved. The reason is recorded in the same Brownfield Review. The reviewer does not complete an exhaustive checklist or draw a diagram for that route.

### AD-02 — Record in the existing Brownfield artefact

Add a short `## Architecture Impact` section to the existing Brownfield Review template:

- `architecture_relevance`: `relevant | architecture-not-applicable`
- `architecture_impact`: `none | low | medium | high`
- `architecture_reason`: the affected boundary or the evidence-backed not-applicable reason
- `architecture_evidence`: repository paths, contracts, or observed behavior
- `architecture_missing_evidence`: unresolved facts and their evidence owner, or `none`
- `architecture_next_owner_and_action`: existing product, design, planning, or implementation owner and next step

The existing `Reuse And Parallel-Structure Risk` table remains the finding index. For a relevant row, prefix its Finding cell with `problem`, `trade-off`, or `unresolved`; cite the affected boundary in Evidence and put its owner and route in Required action. A knowingly retained-debt trade-off gets one detail block directly below that table with `rationale`, `accountable_owner`, `mitigation`, and `review_date_or_exit_condition`. The detail block uses the same finding label, so it is not a second registry. An unfilled acceptance field keeps the trade-off unresolved and prevents calling the debt accepted.

### AD-03 — Preserve existing decision routes

The Brownfield reviewer gathers and classifies evidence before Mode/Slice selection. A missing fact that decides the safe route uses the existing `block` decision and `depth_facts_missing` or `depth_facts_conflicting` recovery. An unresolved product requirement returns to UR/PRD, a technical design decision belongs in SD, and a plan or evidence gap goes to the existing TP or evidence route. Code defects remain for Code Review; implementation cleanliness remains for Clean Implementation Review. None of these findings grants gate approval.

### AD-04 — Optional diagrams and deliberate debt

Use a focused diagram only if textual evidence cannot make a specific ownership or dependency boundary clear enough to decide. Name that question and link the diagram from the same review. Documenting a trade-off never makes an avoidable workaround acceptable by itself; the accountable owner must make and own the explicit decision with a mitigation and a finite review or exit condition.

## 4. Integration Points

1. After `Approval: UR`, the existing gate path invokes `brownfield-analysis` in `post_ur_review` mode. The skill reads repository evidence, records architecture relevance, and persists the same Brownfield Review and Mode/Slice Decision.
2. `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` provides the compact fields; existing run artefacts are not bulk migrated. If an older run is revised, the reviewer adds only the applicable evidence then.
3. `plugin/scripts/check-runtime-integrity.mjs` checks that the canonical skill and template retain their owner boundaries and required fields. Skill evaluations cover relevant risk, accepted trade-off, missing owner/evidence, and low-impact not-applicable cases. These checks provide structural and scenario evidence, not proof of fresh-host behavior.
4. `create-agdf/scripts/sync-package-assets.js` projects the changed canonical content into host packages. The TP must require installation, full restart, and a fresh-session observation for each of Codex, Claude, Copilot, and OpenCode before claiming that host accepted the change.
5. Run status and approval presentations keep using their existing renderer and exact gate binding. This architecture change requires no additional UI, CLI command, persisted decision type, or authorization path.

## 5. Constraints And Compatibility

- Preserve existing `BROWNFIELD_REVIEW.md` files and the four-column Reuse And Parallel-Structure Risk table. New fields apply when a review is created or revised under the updated guidance; absence in an untouched historical run is not retroactive evidence of failure.
- Keep `modes.md` as the sole structured-depth decision policy and `quality.md` as the sole normalized gap route. The architecture lens supplies facts; it cannot choose depth or quality disposition independently.
- Product scope and host acceptance requirements derive from approved PRD revision 11; SD decisions may refine technical handling without changing that product boundary.
- Do not add a parallel finding store, debt backlog, new reviewer skill, gate, approval authority, or required architecture diagram.
- A package/source match alone cannot satisfy direct host acceptance. Record unobserved or stale hosts explicitly.

## 6. Test And Evidence Strategy For TP

| PRD criterion | Required later evidence |
|---|---|
| `AC-ARCH-01` | A relevant Brownfield scenario cites changed boundaries, evidence, missing facts, and owner before route selection. |
| `AC-ARCH-02` | A scenario separates a structural problem from a defensible trade-off and routes each to its existing owner. |
| `AC-ARCH-03` | A retained-debt scenario records rationale, owner, mitigation, and review/exit condition; a missing field stays unresolved. |
| `AC-ARCH-04` | A local low-impact scenario records `architecture-not-applicable` with evidence and no extra ceremony. |
| `AC-ARCH-05` | Contract and scenario checks find no new gate, duplicate depth matrix, debt registry, or downstream-review substitution. |
| `AC-ARCH-06` | Generated payload integrity plus installed-version and fresh-session observation for each of Codex, Claude, Copilot, and OpenCode. |
| `AC-ARCH-07` | A boundary case uses a diagram only when it changes a decision; a simple case succeeds without one. |

The TP should distinguish source checks, generated-package checks, installed-host evidence, and fresh-session behavior. QA may only claim the host surfaces actually observed. No test or host acceptance is claimed by this SD.

## 7. Risks And Open Questions

| Risk or question | Treatment before TP |
|---|---|
| Broad architecture language could cause needless review ceremony. | Keep the trigger tied to concrete affected boundaries or unresolved evidence, and require an evidence-backed not-applicable path. |
| Accepted debt could become a permanent workaround. | Require accountable owner, mitigation, and finite review/exit condition in the same Brownfield artefact; incomplete fields remain unresolved. |
| Generated packages may be current while a host session is stale. | Require a fresh-session check per claimed host; report each unobserved host separately. |
| Scope could drift from the approved UR while revising PRD. | Keep the run objective and revised PRD aligned with the approved UR's debt-prevention goal. |

## 8. Next Step

Review this design against approved PRD revision 11 and approve only with:

`Approval: SD`
