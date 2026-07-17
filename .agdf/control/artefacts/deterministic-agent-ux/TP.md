# Task Plan: Deterministic Agent UX

Status: approved
Gate: TP
Gate approval: `Approval: TP` accepted for revision 1 on 2026-07-17
Revision: 1
Derived from: approved `SD.md` revision 3
Date: 2026-07-17
Owner: agent

## 1. Scope

Implement the approved deterministic Approval Orientation projection and visible three-role operating
model across Codex, Claude Code, OpenCode and GitHub Copilot. Extend the existing evaluator,
presentation, locale, CLI, contract, generated-surface and documentation owners. Do not create a
second gate evaluator, renderer, persisted presentation state or speculative Copilot-native adapter.

## 2. Tasks

| task_id | Task | Owner | Evidence / acceptance |
|---|---|---|---|
| DAU-01 | Extend the canonical interaction locale registry with neutral decision headings, human-readable required-decision values and neutral approve/revise/decline guidance for every user gate in English and German. | agent | Complete locale fixtures cover UR, PRD, SD, TP, QA and UAT; headings contain no approval recommendation and fallback remains whole-locale. |
| DAU-02 | Refactor the existing immutable approval snapshot to expose the five approval-time status fields while preserving the full `status_card` and its `quality_outlook` semantics unchanged. | agent | Focused tests prove selected run, readiness, current gate, required decision and neutral next action in canonical order; existing machine/audit fields retain their meaning. |
| DAU-03 | Add one pure validated renderer for the two Markdown blocks and approval interaction, enforcing hierarchy, field order, one in-card approval token, artefact safety, budgets, locale consistency and revision identity. | agent | Exact English/German snapshots pass for all six gates; mutations for duplicate/decorated approval, biased/generic heading, wrong fields, unsafe links, mixed locale and stale identity return no partial presentation. |
| DAU-04 | Expose additive schema-v1 `approval_presentation` from the existing gate-check composition only for a ready selected user gate, with `null` for non-ready states. | agent | Human and JSON fixtures prove one evaluator, unchanged existing fields and exit codes, `authorizes: false`, correct option order and same-run/same-gate identity. |
| DAU-05 | Add and route `gate-check --approval-envelope` through the existing CLI parser, command registry and application, using the shared projection without native host invocation or network installation. | agent | Parser/help tests cover valid use, unsupported commands, incompatible options and non-ready behavior; output is two cards plus one exact-text request from the same object. |
| DAU-06 | Implement the presentation-failure recovery branch: re-evaluate the gate, request exact text only when readiness and canonical value are independently valid, otherwise report the non-ready reason without requesting a decision. | agent | Negative fixtures distinguish presentation failure with a still-ready gate from a newly non-ready or stale gate; neither path guesses or patches presentation content. |
| DAU-07 | Update canonical interaction/control contracts and the gate-check skill to consume rendered blocks, preserve authority and capability preflight, and describe Codex, Claude Code, OpenCode and Copilot transport truthfully. | agent | Contract and skill assertions retain exact approval authority, deliberate input, one native attempt, Copilot exact-text behavior and no second renderer or gate table. |
| DAU-08 | Reorder the primary README, guided INSTALL section, package README and CLI help around chat/skill, `.agdf/control/` and CLI-validator roles, with installed/local `agdf` preferred for repeated deterministic checks. | agent | Documentation assertions distinguish bootstrap `npx ...@latest`, repeated local execution and agent-native inspection without removing supported install paths. |
| DAU-09 | Synchronize canonical assets to generated Codex, Claude Code, OpenCode and Copilot surfaces and add cross-surface drift checks. | agent | Generated skills, contracts, locale registry and Copilot instructions match canonical owners; Runtime Integrity positive and negative tests pass. |
| DAU-10 | Run focused, aggregate and optional live-surface verification, keeping repository conformance separate from host-visible evidence. | agent + user for live UAT | Focused suites, aggregate smoke, doctor, gate-check and whitespace checks pass; live observations name the actual surface and never claim unsupported native controls. |

## 3. Dependencies And Execution Order

1. DAU-01 establishes localized decision semantics.
2. DAU-02 establishes the five-field snapshot consumed by DAU-03.
3. DAU-03 establishes the renderer and validation boundary used by DAU-04 and DAU-05.
4. DAU-04 and DAU-05 expose the same projection through JSON and focused human output.
5. DAU-06 closes recovery behavior against the evaluator after the projection path exists.
6. DAU-07 updates normative consumers only after executable semantics are fixed.
7. DAU-08 documents only the approved and implemented operating model.
8. DAU-09 synchronizes all derived surfaces after canonical edits stabilize.
9. DAU-10 verifies the complete slice and records live-host limits separately.

## 4. Acceptance Matrix

| PRD acceptance | Planned evidence |
|---|---|
| AC-01/02 visible three-role model and local repeated use | DAU-08 documentation/help assertions |
| AC-03 one render-ready envelope for every user gate | DAU-02, DAU-03 and six-gate fixtures |
| AC-04 neutral five-field compact status card | DAU-01, DAU-02 and exact snapshots |
| AC-05 one in-card approval token and neutral alternatives | DAU-03 mutation tests and DAU-05 output fixtures |
| AC-06 fail-closed rendering and branched recovery | DAU-03 and DAU-06 negative fixtures |
| AC-07 unchanged authority and revalidation | DAU-04, DAU-06 and existing approval-validator regressions |
| AC-08 additive compatibility | DAU-04 JSON and exit-code fixtures |
| AC-09/10 synchronized four-surface semantics and truthful Copilot boundary | DAU-07 and DAU-09 generated-surface checks |
| AC-11 repository proof separated from live-host proof | DAU-10 evidence record |
| AC-12 no routine registry-resolved invocation | DAU-05 and DAU-08 CLI/documentation assertions |

## 5. Verification Commands

```text
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:cli-modularization
node create-agdf/scripts/sync-package-assets.js
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
node create-agdf/bin/create-agdf.js doctor --run deterministic-agent-ux --json
node create-agdf/bin/create-agdf.js gate-check --run deterministic-agent-ux --json
git diff --check
```

Focused tests must precede aggregate smoke. Tests and fixtures must not modify installed plugins, real
host configuration or user repositories. Live host observation is separately authorized UAT evidence.

## 6. Constraints

- Preserve `.agdf/control/runs/<run_id>/RUN_STATE.md` as the only mutable run authority.
- Preserve the existing full `status_card`, including `missing_approval` and `quality_outlook`; only the
  approval-time compact projection changes to five fields.
- Do not add a second evaluator, renderer, locale registry, gate table, persisted presentation record or
  surface-specific semantic fork.
- Do not alter gate order, approval formulas, deliberate-input requirements or exact approval
  persistence.
- Do not claim native Copilot interaction or host-visible rendering from repository fixtures.
- Do not auto-install dependencies, mutate consumer package manifests or require network access for
  ordinary state inspection.
- Do not commit, push, publish, reinstall plugins or open a pull request without separate authority.

## 7. Required Review Path

After exact TP approval, run mandatory pre-implementation Brownfield Analysis. If it confirms the
approved owners and no earlier gate reopens, implement DAU-01 through DAU-10. Then run Task Plan Review,
Clean Implementation Review, Code Review and QA Gate. Live UAT follows QA readiness; Delivery Closeout
and the Orchestration Report follow the resulting evidence.

## 8. Traceability

- product contract: `UR.md`, `PRD.md`
- brownfield sizing: `BROWNFIELD_REVIEW.md`
- solution contract: `SD.md`
- presentation owner: `create-agdf/lib/interaction-presentation.js`
- gate composition owner: `create-agdf/lib/control-evaluation/gate-check.js`
- CLI owners: `create-agdf/lib/cli/parse-args.js`, `command-registry.js`, `application.js`
- locale owner: `plugin/meta/agdf-interaction-locales.json`
- normative owners: `plugin/meta/contracts/interaction.md`, `plugin/skills/gate-check/SKILL.md`
- generation owner: `create-agdf/scripts/sync-package-assets.js`
- context graph refs: `CG-RUN-STATUS-CARD`, `CG-NATIVE-INTERACTION-AUTHORITY`,
  `CG-CREATE-AGDF-CLI-COMPOSITION`

## 9. Approval

- `Approval: SD` accepted for SD revision 3 on 2026-07-17.
- Exact `Approval: TP` accepted for this Task Plan revision 1 on 2026-07-17.
