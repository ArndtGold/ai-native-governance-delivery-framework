# TP: Parent Reconciliation Handoff

Status: `ready_for_approval`
Gate: `TP`
Revision: `1`
Date: `2026-08-19`
Owner: user / agent
Based on: approved PRD Revision 1 and approved SD Revision 1

## 1. Execution Boundary

Implement the approved explicit Child-to-Parent reconciliation handoff through the existing
Closeout, Artefact Chain, Delivery Map, OR and delivery-closeout owners. The implementation must be
additive, repository-local, non-authorizing and unable to mutate or block an independently complete
Child.

Before implementation, `Approval: TP` must be followed by the mandatory
`brownfield-analysis` `pre_implementation_analysis`. That analysis must revalidate clean candidate
paths, current owners, unrelated worktree changes, propagation scope and regression risk. A block or
scope change returns to the earliest affected gate.

## 2. Task Plan

| task_id | Task | Expected files / owner | Completion evidence |
|---|---|---|---|
| PRH-T01 | Add canonical reconciliation outcomes, authority boundaries, accepted-open behavior and programme readiness rules. | `plugin/meta/contracts/closeout.md` | Contract assertions prove one semantic owner and prohibit gate changes, inference and Parent mutation. |
| PRH-T02 | Add optional Child handoff inputs and Parent programme inputs without making them mandatory for legacy runs. | `plugin/control/templates/RUN_STATE.md` | Template documents exact fields, enums, one-action rule and legacy boundary. |
| PRH-T03 | Add separate optional Child completion, Parent reconciliation and programme readiness projections. | `plugin/control/templates/artefacts/OR.md` | OR shape contains evaluated fields and preserves independent Child status. |
| PRH-T04 | Parse optional disposition, next-action and programme evidence inputs without accepting malformed state. | `create-agdf/lib/control-state/run-state-parser.js` | Unit fixtures prove valid parsing and fail-closed invalid input. |
| PRH-T05 | Implement one pure evaluator for qualifying `OR | reconciles_with | parent_run:<id>` and reciprocal `Aggregate | includes | child_run:<id>` rows. | focused module under `create-agdf/lib/control-evaluation/` | Fixtures prove `not_applicable`, `resolved` and every `open` failure path without inference. |
| PRH-T06 | Enforce repository-local target resolution and safe run-id/path handling; never use evidence prose as a filesystem target. | reconciliation evaluator and run-state repository helpers | Traversal, invalid ID, missing run and unreadable state tests fail closed with no out-of-scope access. |
| PRH-T07 | Integrate the evaluator only through Delivery Map and expose additive output plus warning findings inherited by Doctor and Gate Check. | `create-agdf/lib/control-evaluation/delivery-map.js` and composition tests | One shared result/finding appears across all three commands; no second scanner exists. |
| PRH-T08 | Derive programme `startable` and `final_ready` from completed-Child, control-artefact acceptance-reference and missing-evidence state. | reconciliation evaluator and Delivery Map projection | Tests prove false/true transitions and that final-ready implies startable without granting QA/UAT. |
| PRH-T09 | Make `release-or` report the evaluated handoff and readiness without inference or Parent mutation. | `plugin/skills/release-or/SKILL.md` | Semantic evals distinguish Child completion from open coordination and retain one next action. |
| PRH-T10 | Make `delivery-closeout` consume the OR projection only and never withhold an otherwise valid commit offer. | `plugin/skills/delivery-closeout/SKILL.md` | Evals reject rediscovery, reclassification, approval creation and automatic Parent repair. |
| PRH-T11 | Add a focused deterministic reconciliation suite and package script for relationship, disposition, independence and security. | `create-agdf/scripts/parent-reconciliation-test.js`; `create-agdf/package.json` | Focused suite passes and is included in the full smoke chain. |
| PRH-T12 | Extend control-state and Delivery Map regressions for optional parsing, additive JSON, warning severity and legacy behavior. | `create-agdf/scripts/control-state-test.js` and fixtures | Existing schemas stay compatible; absent relationships add no warning or ceremony. |
| PRH-T13 | Add release-or and delivery-closeout semantic eval cases for resolved, open, accepted-open and not-applicable behavior. | `evals/cases/` and existing skill-eval harness | Direct cases prove skills follow, rather than redefine, the Closeout Contract. |
| PRH-T14 | Reconcile the reusable invariant into two existing Context Graph nodes without creating a new node. | `.agdf/control/CONTEXT_GRAPH.md`; selected run state | Named nodes contain single-owner and independent-Child invariants; run gap is resolved. |
| PRH-T15 | Propagate canonical assets and verify Codex, Claude, Copilot and OpenCode parity without manual generated/cache edits. | existing asset synchronizer and generated surfaces | Sync is deterministic; Runtime Integrity and package checks pass. |
| PRH-T16 | Run mandatory plan, clean implementation and code reviews and resolve every blocking/revise finding. | durable review reports for this run | TP coverage 17/17, solution integrity pass and Code Review pass with no open finding. |
| PRH-T17 | Run focused/full regression evidence and create QA with explicit repository/host/UAT non-claims. | test outputs and `QA_REPORT.md` | Every required command passes; QA alone decides `pass | revise | block`. |

## 3. Dependency Order

1. PRH-T01 defines semantics before parser, evaluator or skill changes.
2. PRH-T02 through PRH-T04 establish additive durable inputs and report shape.
3. PRH-T05 and PRH-T06 implement and secure the pure evaluator.
4. PRH-T07 and PRH-T08 compose relationship and programme projections into Delivery Map.
5. PRH-T09 and PRH-T10 update reporting and operational consumers after evaluator stability.
6. PRH-T11 through PRH-T13 complete behavior and regression evidence.
7. PRH-T14 resolves durable knowledge; PRH-T15 propagates canonical assets.
8. PRH-T16 and PRH-T17 perform mandatory reviews and QA preparation.

No task may update an existing Parent run as sample data. Tests use isolated temporary repositories.

## 4. Acceptance And Test Matrix

| acceptance_id | PRD / SD obligation | Tasks | Deterministic evidence |
|---|---|---|---|
| PRH-A01 | Only one explicit qualifying Artefact Chain row activates reconciliation. | T04–T07, T11–T12 | no-row, one-row, duplicate-row, invalid-ID and nearby-name/path fixtures |
| PRH-A02 | Outcome is `resolved | not_applicable | open`; open has evidence and one action. | T01–T07, T09, T11–T13 | evaluator schema assertions and OR evals |
| PRH-A03 | Reconciliation cannot change Child gate, QA, UAT or OR completion. | T01, T07, T09–T13 | before/after gate fixtures with identical authority and warning-only findings |
| PRH-A04 | Closeout owns; release-or reports; delivery-closeout consumes. | T01, T03, T09–T10, T13 | static ownership checks and direct skill evals |
| PRH-A05 | Open names one Parent and action without approval controls. | T03, T05, T07, T09–T13 | JSON/OR assertions and forbidden approval-token checks |
| PRH-A06 | `accepted_open` preserves coordination and permits valid operational handoff. | T01, T05, T09–T13 | accepted-open fixture and delivery-closeout eval |
| PRH-A07 | Programme readiness separates startable/final-ready and grants no gate. | T01–T03, T08, T11–T13 | zero-child, child-only, missing-acceptance, open-evidence and final-ready fixtures |
| PRH-A08 | Diagnostic is Delivery Map-owned, additive, warning-level and inherited once. | T05–T08, T11–T12 | Delivery Map/Doctor/Gate Check equality and finding-count assertions |
| PRH-A09 | Legacy and unrelated runs remain unchanged. | T02–T07, T11–T12, T15 | legacy fixtures, full smoke and Runtime Integrity |
| PRH-A10 | Paths stay repository-local and evaluation never mutates Parent state. | T05–T07, T11 | traversal/absolute/evidence-path attacks and Parent pre/post digest |
| PRH-A11 | Canonical/generated surfaces stay in parity. | T01–T03, T09–T10, T15 | clean sync, package contents and Runtime Integrity |
| PRH-A12 | Repository and live-host/UAT evidence remain distinct. | T17 | QA evidence classes and explicit non-claims |

## 5. Focused Fixture Matrix

| fixture | Expected reconciliation/readiness | Diagnostic | Child authority |
|---|---|---|---|
| legacy/no relationship | `not_applicable` | none | unchanged |
| unrelated nearby Parent name/path | `not_applicable` | none | unchanged |
| one reciprocal evidenced relationship | `resolved` | none | unchanged |
| declared Parent missing | `open` | warning + repair action | unchanged |
| reciprocal row missing or empty | `open` | warning + reconcile/evidence action | unchanged |
| two qualifying Parent candidates | `open` | invalid-evidence warning + disambiguation | unchanged |
| invalid/traversal Parent ID | `open` | invalid-evidence warning | unchanged |
| open + `action_required` | `open` | warning + declared action | unchanged |
| open + `accepted_open` | `open` | retained coordination warning | unchanged and deliverable |
| programme without completed Child | false / false | warning when inputs exist | unchanged |
| programme with completed Child only | true / false | missing acceptance evidence | unchanged |
| programme with acceptance and open gap | true / false | evidence warning | unchanged |
| programme with complete acceptance | true / true | none | unchanged |

## 6. Validation Commands

Run from `create-agdf/` unless stated otherwise:

1. `npm run test:parent-reconciliation`
2. `npm run test:control-state`
3. `npm run test:skill-evals`
4. `npm run eval:skills`
5. `npm run sync-package-assets`
6. `npm run test:runtime-integrity-layout`
7. `npm run test:runtime-integrity-negative`
8. `npm run test:package-contents`
9. `npm run smoke-test`
10. From repository root: focused `doctor`, `gate-check`, `delivery-map` for this run and
    `git diff --check`.

Run focused suites before full smoke. Do not weaken or skip unrelated assertions to obtain a pass.

## 7. Review And QA Evidence

Before requesting QA approval, persist `TASK_PLAN_REVIEW.md`, `CLEAN_IMPLEMENTATION_REVIEW.md`,
`CODE_REVIEW.md` and `QA_REPORT.md`. TP Review covers T01–T17 and A01–A12; clean review proves no
parallel evaluator/state owner/fallback scanner/automatic Parent mutation; code review covers path
safety, compatibility, warning/gate independence and maintainability. QA records focused/full tests,
generated parity, Context Graph resolution, evidence classes, risks and live-host/UAT non-claims.

Any open normalized review finding routes to its canonical owner before QA can pass.

## 8. Brownfield And Worktree Controls

- Reinspect every candidate canonical and derived path before implementation.
- Capture tracked/untracked changes; isolate unrelated user work and never overwrite it.
- Extend existing owners before adding the one planned pure evaluator module.
- Never edit `create-agdf/generated/**` directly; use the owned synchronizer.
- Never mutate `/Users/arndtgold/.codex/plugins/cache/**` in this run.
- Do not use the Product Maturity Roadmap or completed Child runs as mutable fixtures.
- Re-run gate-check if scope, public schema or owner decisions deviate from approved SD.

## 9. Explicit Non-Claims

Repository evidence cannot prove authenticated host rendering, cross-repository coordination, human
operator compliance, installed-plugin freshness, release behavior or deployment. These remain UAT or
operational boundaries. TP approval authorizes no commit, push, PR, release, deployment or reinstall.

## 10. Next Step

Review TP Revision 1 and provide exact `Approval: TP`, request revision or decline. After approval,
the agent must run pre-implementation Brownfield Analysis before changing implementation files.
