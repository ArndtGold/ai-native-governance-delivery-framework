# TP: Define UX Intent And Route Review Gaps Upstream

Status: approved
Gate: TP
Gate approval: approved (`Approval: TP`, 2026-07-19; revision 17)
Based on: approved SD revision 16
Date: 2026-07-19
Owner: user

## 1. Task List

Tasks are ordered by dependency. No task authorizes implementation before exact TP approval and the
required pre-implementation Brownfield Analysis.

| task_id | Priority | Depends on | Task | Acceptance mapping | Evidence required |
|---|---:|---|---|---|---|
| UXI-T01 | P0 | none | Extend `plugin/meta/contracts/gate-transition.md` and `plugin/skills/brownfield-analysis/SKILL.md` so the existing post-UR owner records `delivery_context`, the shared `none | low | medium | high` UI/UX impact, rationale and whether UX definition is required. Cover Greenfield and Brownfield without adding a gate or evaluator. | UXI-AC-01..03 | Focused routing assertions for both contexts and all four impact values; inspection proving gate order and exact approvals are unchanged. |
| UXI-T02 | P0 | UXI-T01 | Create canonical `plugin/skills/ux-intent-definition/SKILL.md` and `HELP.md` with complete discovery triggers, required inputs/outputs, `ready | blocked | not_applicable`, authority limits, revision routing and fail-closed conditions. | UXI-AC-02..13, UXI-AC-15 | Skill-contract inspection plus normal, boundary and adversarial evaluations proving complete output, blocked ambiguity and refusal to invent or mutate product intent. |
| UXI-T03 | P0 | UXI-T01, UXI-T02 | Add `plugin/control/templates/artefacts/UX_INTENT_DEFINITION.md` and include it in `create-agdf/lib/scaffold/plan.js` as run-scoped supporting analysis with no Gate or approval field and no transition authority. | UXI-AC-03..07, UXI-AC-15 | Template assertions and generated-package inspection proving the artefact is durable, non-authorizing and outside the user-gate Artefact Chain. |
| UXI-T04 | P0 | UXI-T02 | Expand `plugin/control/templates/artefacts/PRD.md` with mandatory applicability, UX intent/success, working modes, effective state, visible state types, authority/presentation owner, activation/deactivation, blockers, recovery, transitions and structured criterion evidence. | UXI-AC-08..16 | Exact-section assertions plus fixtures proving fields are populated or explicitly justified as not applicable and remain implementation-neutral. |
| UXI-T05 | P0 | UXI-T04 | Extend `plugin/skills/task-plan-review/SKILL.md` with a distinct UX Intent Fidelity matrix mapping `prd_criterion`, `working_mode_state`, `task_id`, `visible_evidence`, `fidelity_status` and `gap_type`; preserve review-only authority. | UXI-AC-16..19 | Cases for fulfilled, partial, missing, not-verifiable and requirements-gap outcomes; inspection proving no criteria are invented and QA is not decided here. |
| UXI-T06 | P0 | UXI-T05 | Extend `plugin/meta/contracts/quality.md` and `plugin/skills/qa-gate/SKILL.md` so QA consumes UX Intent Fidelity and cannot pass applicable incomplete or code-only visible claims while remaining the sole final QA owner. | UXI-AC-20..21 | Positive and negative QA fixtures showing incomplete evidence fails closed and the existing four-row Quality Readiness decision remains authoritative. |
| UXI-T07 | P1 | UXI-T02 | Register the skill in `plugin/meta/agdf-plugin.definition.json`, expose it through `plugin/meta/agdf-agent-router.md`, and add consistent catalogue/evaluation data to `pages/src/data/skills.ts`, `pages/src/data/evaluationEvidence.ts` and the relevant Pages presentation. | UXI-AC-22 | Canonical inventory/router/Pages parity assertions and rendered catalogue evidence with one authority boundary. |
| UXI-T08 | P0 | UXI-T02, UXI-T05, UXI-T06 | Add `evals/cases/ux-intent-definition.json` normal, boundary and adversarial cases and the minimum fixtures/quality profile needed; regenerate deterministic observations and fingerprints through the existing eval workflow. | UXI-AC-04..07, UXI-AC-24 | Three passing cases: ready structured input, fail-closed ambiguous low impact, and rejection of gate/PRD authority expansion; aggregate evaluation remains 100%. |
| UXI-T09 | P0 | UXI-T03, UXI-T04, UXI-T07, UXI-T08 | Extend `plugin/scripts/check-runtime-integrity.mjs`, `create-agdf/scripts/test-routing.js`, `create-agdf/scripts/package-contents-test.js` and focused test owners to fail on missing assets, PRD prompts, review/QA invariants, eval coverage, router drift or Pages mismatch. | UXI-AC-01..25 | Focused negative assertions fail for each named drift class and pass after restoration; no new gate or approval value appears. |
| UXI-T10 | P1 | UXI-T03, UXI-T07, UXI-T09 | Inventory and update explicit nine-skill copy/expectations, including `create-agdf/README.md`; run the canonical sync owner once and never hand-edit `create-agdf/generated/`. | UXI-AC-22..25 | `rg` inventory closes all static count drift; source-to-generated comparison and a second sync are clean/idempotent across Codex, Claude Code, Copilot and OpenCode. |
| UXI-T11 | P1 | UXI-T08, UXI-T10 | Run focused and aggregate repository validation, Pages check/build, package contents, routing, Runtime Integrity and smoke tests; capture repository evidence separately from any live host-visible claim. | UXI-AC-22..25 | Command transcripts and exit status for every test-plan row; direct visible evidence only where a host/UI claim is made. |
| UXI-T12 | P1 | UXI-T01..UXI-T11 | Create the curated Context Graph node for the reusable lifecycle invariant, then prepare implementation evidence for mandatory Brownfield, Clean Implementation, Code and Task Plan reviews. | UXI-AC-03, UXI-AC-15..21 | Reconciled node states UX intent before PRD approval, PRD authority, Task Plan Review fidelity and QA consumption without implementation detail; review inputs link all 25 criteria. |

### Acceptance Coverage Audit

| PRD criterion range | Planned tasks |
|---|---|
| UXI-AC-01..03 | UXI-T01, UXI-T03, UXI-T09, UXI-T12 |
| UXI-AC-04..07 | UXI-T02, UXI-T03, UXI-T08, UXI-T09 |
| UXI-AC-08..13 | UXI-T02, UXI-T04, UXI-T09 |
| UXI-AC-14..16 | UXI-T03, UXI-T04, UXI-T05, UXI-T12 |
| UXI-AC-17..21 | UXI-T05, UXI-T06, UXI-T09, UXI-T12 |
| UXI-AC-22..25 | UXI-T07, UXI-T08, UXI-T09, UXI-T10, UXI-T11 |

All 25 approved criteria have an implementation owner and required observable evidence.

## 2. Test Plan

| test_id | Scope | Check | Expected evidence |
|---|---|---|---|
| UXI-TEST-01 | Routing contract | Focused routing tests/fixtures cover Greenfield and Brownfield with `none`, unambiguous and ambiguous `low`, `medium` and `high`. | Medium/high always require definition; ambiguous low fails closed; none records not applicable; no gate/approval changes. |
| UXI-TEST-02 | Skill behavior | `npm run test:skill-evals` and `npm run eval:skills` in `create-agdf/`, including all new UX cases. | Normal, boundary and adversarial cases pass; canonical coverage is complete and deterministic replay stays explicitly non-live. |
| UXI-TEST-03 | Requirements and fidelity | Focused fixture/assertion tests for the PRD template, supporting analysis template, Task Plan Review matrix and QA consumption. | Missing PRD fields, missing recovery, competing authority, incomplete fidelity or code-only visible evidence fail closed. |
| UXI-TEST-04 | Routing projection | `npm run test:routing` in `create-agdf/`. | Canonical definition and rendered surface routing match with correct prefixes and authority boundaries. |
| UXI-TEST-05 | Runtime integrity | `node plugin/scripts/check-runtime-integrity.mjs` plus `npm run test:runtime-integrity-layout` and `npm run test:runtime-integrity-negative` in `create-agdf/`. | Source and installed layouts pass; missing new assets/contracts/evals/Pages entries fail deterministically. |
| UXI-TEST-06 | Synchronization | `npm run sync-package-assets` twice in `create-agdf/`, with scoped diff inspection after each run. | First run produces only expected derived changes; second run is idempotent; generated copies are not manually edited. |
| UXI-TEST-07 | Packaging | `npm run test:package-contents` and `npm run test:package-build` in `create-agdf/`. | New skill/help/template and evaluation assets are present on every required packaged surface; no stale nine-skill expectation remains. |
| UXI-TEST-08 | Pages | `npm run check` and `npm run build` in `pages/`, plus focused rendered-data assertions. | Catalogue and evaluation totals derive from canonical data, include the skill and preserve evidence-boundary language. |
| UXI-TEST-09 | Aggregate regression | `npm run smoke-test` in `create-agdf/`. | Complete smoke chain passes without gate, lifecycle, installation, routing or package regressions. |
| UXI-TEST-10 | Static integrity | `rg` inventory for `nine`, `9 canonical`, `27 behavioral`, explicit expected paths/counts and `git diff --check`. | Every affected explicit count is intentionally updated or documented as historical; no whitespace errors. |
| UXI-TEST-11 | Visible evidence | Inspect representative PRD, UX analysis, Task Plan Review and QA outputs; perform live host observation only if delivery claims host-visible behavior. | A user/reviewer can identify effective state, blocker, recovery, criterion mapping and visible evidence; repository tests are not mislabeled as live UAT. |

## 3. Brownfield Scope

Before implementation, Brownfield Analysis must revalidate these existing owners and record reuse,
regression and duplication risk:

- lifecycle/routing: `plugin/meta/contracts/gate-transition.md`,
  `plugin/skills/brownfield-analysis/SKILL.md`, `plugin/meta/agdf-agent-router.md`;
- product and supporting templates: `plugin/control/templates/artefacts/PRD.md`,
  `create-agdf/lib/scaffold/plan.js` and the user-gate artefact parser boundary;
- review/QA: `plugin/skills/task-plan-review/SKILL.md`, `plugin/skills/qa-gate/SKILL.md`,
  `plugin/meta/contracts/quality.md`;
- discovery/distribution: `plugin/meta/agdf-plugin.definition.json`,
  `create-agdf/scripts/sync-package-assets.js`, generated surface prefixes and package plans;
- evaluation/integrity: `evals/`, `create-agdf/lib/skill-evals/`,
  `plugin/scripts/check-runtime-integrity.mjs`, routing, package and smoke tests; and
- public evidence/counts: `pages/src/data/skills.ts`, `pages/src/data/evaluationEvidence.ts`, Pages
  rendering and explicit nine-skill/27-case documentation.

The analysis must stop implementation if it finds a second routing owner, a parallel product SoT, a
new approval/gate, hand-edited generated assets or an unresolved canonical owner conflict.

## 4. Out Of Scope

- A new AGDF gate, approval value, CLI command or runtime JSON evaluator.
- A standalone post-implementation `ux-intent-review` skill.
- Visual styling, component-library or application-specific UI implementation.
- Live authenticated host validation unless a delivered claim depends on that behavior.
- Commit, push, pull request, publication, release or installed-cache mutation.

## 5. Risks And Blockers

- **Block:** any change to the canonical gate order or exact approval values.
- **Block:** analysis output becomes authoritative beside the approved PRD.
- **Block:** medium/high impact can reach PRD readiness without a `ready` definition result.
- **Block:** Task Plan Review invents requirements or QA can pass incomplete UX fidelity.
- **Revise:** Greenfield and Brownfield classification semantics or evidence expectations diverge.
- **Revise:** supporting analysis enters the user-gate parser/Artefact Chain.
- **Revise:** generated surfaces, catalogue, evaluations or static count statements drift.
- **Warn:** repository evidence cannot prove authenticated live-host rendering; disclose that boundary.

## 6. Revision 17 Task List — Normalized Review Gaps

| task_id | Priority | Depends on | Task | Acceptance mapping | Evidence required |
|---|---:|---|---|---|---|
| UXI-T13 | P0 | none | Extend `plugin/meta/contracts/quality.md` as the sole owner of the six normalized gap types, allowed targets, compact finding fields, fixed-route validation, `emergent_risk` assessment, `open | resolved` status and the `none` sentinel boundary. | UXI-AC-26..28, UXI-AC-33 | Contract inspection and negative assertions for missing/unknown types, invalid targets, contradictory routes, missing fields and attempted authority expansion. |
| UXI-T14 | P0 | UXI-T13 | Refactor `plugin/skills/task-plan-review/SKILL.md` to consume the shared contract for TP Coverage and UX Intent Fidelity, preserve `none` only on fulfilled rows and emit normalized findings for applicable gaps without a private route table. | UXI-AC-27..29, UXI-AC-33 | Normal fulfilled case plus requirements, plan, implementation and evidence gap cases; inspection proving no product/design invention or QA decision. |
| UXI-T15 | P0 | UXI-T13 | Extend `plugin/skills/clean-implementation-review/SKILL.md` with normalized findings that distinguish absent design/plan decisions from implementation non-conformance while preserving its solution-integrity evidence role. | UXI-AC-27..28, UXI-AC-30, UXI-AC-33 | Cases for missing canonical owner/fallback exit decision, missing planned cleanup and actual parallel implementation; each routes to SD, TP or CD+Tests respectively. |
| UXI-T16 | P0 | UXI-T13 | Extend `plugin/skills/code-review/SKILL.md` with normalized findings that preserve concrete defect ownership, route absent upstream constraints correctly and assess genuine emergent risk against the earliest affected owner. | UXI-AC-27..28, UXI-AC-31, UXI-AC-33 | Cases for concrete diff defect, missing security/product constraint and emergent risk; no static checklist or invented requirement. |
| UXI-T17 | P0 | UXI-T14..UXI-T16 | Extend `plugin/skills/qa-gate/SKILL.md` so QA consumes but never reclassifies normalized findings and rejects every applicable `open`, missing, unknown or contradictory classification. | UXI-AC-27..28, UXI-AC-32..33 | Positive all-resolved case and negative open/invalid/insufficient-evidence cases; four-row projection and sole QA ownership remain unchanged. |
| UXI-T18 | P0 | UXI-T13..UXI-T17 | Extend focused Runtime Integrity and deterministic normal/boundary/adversarial skill-evaluation expectations across Task Plan, Clean, Code and QA. Cover all six types/routes, sentinel rules, consumer references and prohibition of complete private mapping tables. | UXI-AC-28, UXI-AC-34..35 | Runtime Integrity fails after controlled removal/drift and passes after restoration; affected eval cases and aggregate deterministic replay remain 100%. |
| UXI-T19 | P1 | UXI-T18 | Run canonical sync, idempotence, package contents/build, installed-layout/negative integrity, routing and aggregate smoke; update `CG-UX-INTENT-BEFORE-PRD`; capture revised TP, Clean, Code and QA inputs without claiming live-host behavior. | UXI-AC-27..35 | Source-to-generated parity, second-sync cleanliness, full regression pass, reconciled Context Graph and direct durable report/eval evidence for every new criterion. |

### Revision 17 Acceptance Coverage Audit

| PRD criterion | Planned tasks |
|---|---|
| UXI-AC-26 | UXI-T13, UXI-T18 |
| UXI-AC-27..28 | UXI-T13..UXI-T18 |
| UXI-AC-29 | UXI-T14, UXI-T18 |
| UXI-AC-30 | UXI-T15, UXI-T18 |
| UXI-AC-31 | UXI-T16, UXI-T18 |
| UXI-AC-32..33 | UXI-T14..UXI-T18 |
| UXI-AC-34..35 | UXI-T18, UXI-T19 |

All ten revision-15 criteria have an implementation owner, negative evidence requirement and
explicit review/QA traceability. Original tasks UXI-T01..12 remain historical completed scope.

## 7. Revision 17 Test Plan

| test_id | Scope | Check | Expected evidence |
|---|---|---|---|
| UXI-TEST-12 | Canonical gap contract | Runtime Integrity plus focused controlled-drift probes inspect six types, targets, fields, statuses, fixed routes, emergent assessment and sentinel boundary. | Canonical contract passes; missing/unknown/contradictory content and consumer-private mapping fail deterministically. |
| UXI-TEST-13 | Task Plan Review | Focused normal/boundary/adversarial expectations and durable sample output. | Fulfilled rows use `none`; applicable gaps use one canonical type/target and never invent requirements or decide QA. |
| UXI-TEST-14 | Clean Review | Focused cases for absent design, absent plan and actual implementation non-conformance. | Results route to SD, TP and CD+Tests with evidence and one next step. |
| UXI-TEST-15 | Code Review | Focused concrete-defect, upstream-constraint and emergent-risk cases. | Concrete defects remain Code Review findings; upstream gaps and earliest-owner emergent risks are classified without retrospective specification. |
| UXI-TEST-16 | QA consumption | Focused resolved, open, invalid, contradictory and insufficient-evidence cases. | Only complete resolved evidence may pass; QA never reclassifies and remains the sole decision owner. |
| UXI-TEST-17 | Behavioral evaluations | `npm run test:skill-evals && npm run eval:skills` in `create-agdf/`. | All affected normal, boundary and adversarial cases pass; aggregate remains 100% and explicitly deterministic/non-live. |
| UXI-TEST-18 | Integrity and propagation | `node plugin/scripts/check-runtime-integrity.mjs`; sync twice; package contents/build; layout and negative integrity; routing. | Canonical/derived copies match, second sync is idempotent and no private owner or stale generated skill remains. |
| UXI-TEST-19 | Aggregate regression | `npm run smoke-test` in `create-agdf/` plus `git diff --check`. | Complete regression chain passes with no gate, review, QA, package or formatting regression. |

## 8. Revision 17 Brownfield Scope

Before implementation, revalidate:

- `plugin/meta/contracts/quality.md` as the single normative taxonomy owner;
- Task Plan, Clean and Code Review plus QA as reference-only consumers;
- current eval case/observation ownership and whether existing three-class cases can be extended cleanly;
- Runtime Integrity as the narrow deterministic drift owner rather than a new parser or schema;
- generated skill propagation through `sync-package-assets`; and
- Context Graph reuse of `CG-UX-INTENT-BEFORE-PRD` instead of creating a parallel node.

Stop implementation if the analysis finds a second taxonomy/mapping owner, a new mutable finding
store, automatic upstream artefact mutation, changed gate authority or an unresolved conflict between
review roles.

## 9. Revision 17 Out Of Scope

- New skill, gate, approval value, CLI command, parser, schema or persisted finding registry.
- Automatic edits or approvals of UR, PRD, SD or TP from a review finding.
- Turning Code Review into a requirements checklist or predicting every implementation defect.
- Public Pages changes unless existing copy becomes materially false.
- Authenticated live-host claims, VCS delivery, publication or release.

## 10. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
