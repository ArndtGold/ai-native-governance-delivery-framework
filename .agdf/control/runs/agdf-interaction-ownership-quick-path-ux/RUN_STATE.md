# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-interaction-ownership-quick-path-ux
- lifecycle: completed
- revision: 22
- revision_id: e6c01bee-50e5-46de-854e-6db75d7f2a66
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Remove duplicated normative native-interaction prose from the gate-check skill and make the smallest
safe AGDF delivery path clearer and less ceremonially visible without weakening governance.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Interaction ownership, Compact Delivery, local validation, OpenCode/release-or fixes and the code-owned operational status projection are implemented, reviewed, QA-approved and UAT-accepted. |
| What is approved? | Expanded UR, PRD, SD, TP, refreshed QA and UAT are exactly approved; OR-full closes the governance lifecycle. |
| What is missing? | No governance artefact or approval. Released installed-host consumption, authenticated refreshed OpenCode behavior and native Windows execution remain unperformed post-release evidence. |
| What is the next allowed action? | Re-evaluate Product Maturity Roadmap PMR-5/PMR-6 and the remaining `opencode-single-install-activation` owner decision. |
| What is explicitly forbidden right now? | Inferring released-host evidence or performing automatic VCS, release, deployment or reinstall actions. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/contracts/interaction.md`; `plugin/meta/contracts/gate-transition.md`; `plugin/meta/contracts/modes.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/UR.md`
- competing_scope_lines: `opencode-single-install-activation` is an unrelated active run awaiting UAT
- branch_workspace_evidence: User accepted the two assessed GLM findings for correction on 2026-07-18.
- branch_workspace_scope_effect: supports

## Run Status Card

| Run status | Value |
|---|---|
| Status | pass |
| Current gate | OR |
| Allowed now | Use the OR for audit; perform delivery-closeout only on explicit VCS request |
| Blocked by | none |
| Missing approval | none |
| Next step | Re-evaluate Product Maturity Roadmap PMR-5/PMR-6 and the remaining OpenCode owner |
| Quality outlook | Preserve compact semantic parity and keep installed-host behavior as explicit UAT evidence |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided on 2026-07-18 for expanded revision 6 after revalidation |
| PRD | approved | `Approval: PRD` provided on 2026-07-18 after revision-8 revalidation |
| SD | approved | `Approval: SD` provided on 2026-07-18 after revision-11 revalidation |
| TP | approved | `Approval: TP` provided on 2026-07-18 after revision-12 revalidation |
| QA | approved | `Approval: QA` provided on 2026-07-19 after revision-20 revalidation |
| UAT | approved | Exact `Approval: UAT` accepted on 2026-08-19 after selected-run, same-gate and Revision 21 revalidation with evidence limits retained. |
| OR | done | OR-full `pass`; governance lifecycle completed without VCS, release, deployment or reinstall action. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/UR.md | approved | `Approval: UR` provided on 2026-07-18 |
| Brownfield Review | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/BROWNFIELD_REVIEW.md | done | Repeated review passed; `structured_delivery` selected for cross-surface runtime packaging |
| PRD | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/PRD.md | approved | `Approval: PRD` provided on 2026-07-18 |
| SD | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/SD.md | approved | `Approval: SD` provided on 2026-07-18 |
| TP | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/TP.md | approved | `Approval: TP` provided on 2026-07-18 |
| Brownfield Analysis | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/BROWNFIELD_ANALYSIS.md | done | Pass; UAT revision reuses the existing status-data and presentation owners |
| CD+Tests | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/CD_TESTS.md | done | LIR-01 through LIR-12 plus deterministic operational status regressions pass |
| TP Review | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/TASK_PLAN_REVIEW.md | done | Pass; 12/12 tasks fully done after UAT revision reconciliation |
| Clean Implementation Review | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/CLEAN_IMPLEMENTATION_REVIEW.md | done | Pass; one data owner, one Markdown owner and no fallback template |
| CR | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/CODE_REVIEW.md | done | Pass after escaping, fail-closed output and compatibility findings were fixed |
| QA | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/QA_REPORT.md | pass | Refreshed qa-gate pass accepted through exact `Approval: QA` on 2026-07-19 |
| UAT | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/UAT_EVIDENCE.md | approved | Revision request resolved and repository behavior accepted with release/install evidence limits retained. |
| OR | .agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/OR.md | pass | OR-full records accepted delivery, warning-level evidence limits and resolved Context Graph impact. |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: The expanded work changes normative interaction/mode guidance, installer output and exact-version offline validator availability across Codex, Claude and OpenCode, including package layout, status and release evidence. It must reuse one `create-agdf/cli` owner but requires full structured design and planning.
- evidence: `.agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/BROWNFIELD_REVIEW.md`
- transparency_note: Full gate depth is justified only by the added cross-surface runtime packaging; the original three corrections remain bounded and compatibility-preserving.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR revision 2 | approved_by | `Approval: UR` | Exact approval provided on 2026-07-18 for the earlier three-finding scope |
| Expanded UR | supersedes_scope_of | UR revision 2 | Adds local validator availability, offline execution and exact-version coupling |
| Expanded UR revision 6 | approved_by | `Approval: UR` | Exact approval provided on 2026-07-18 after same-run/gate revalidation |
| UR | approved_by | `Approval: UR` | Current expanded UR approved on 2026-07-18 after same-run/gate revision-6 revalidation |
| Brownfield Review | sizes | Expanded UR | Repeated review passed and selected `structured_delivery` |
| PRD | derived_from | UR | Expanded draft incorporates all four approved findings and repeated Brownfield evidence |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-07-18 after same-run/gate revision-8 revalidation |
| SD | derived_from | PRD | Design defines single owners, local runtime packaging, fail-closed resolution and regression evidence |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-18 after revision-11 revalidation |
| TP | derived_from | SD | Task and Test Plan maps all approved requirements to implementation and deterministic evidence |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-18 after revision-12 revalidation |
| Brownfield Analysis | verifies | TP | Pass; reuse, packaging, compatibility, overlap and regression paths confirmed before implementation |
| CD+Tests | implements | TP | LIR-01 through LIR-12 and all mapped tests complete |
| TP Review | verifies | CD+Tests | 12/12 tasks fully done |
| Clean Implementation Review | verifies | CD+Tests | Clean shared-owner solution passes |
| Code Review | reviews | implementation diff | Pass; no meaningful finding remains |
| QA_REPORT | tests | TP | 12/12 task coverage, aggregate smoke, Runtime Integrity and 27/27 skill evaluations pass |
| QA Report | approved_by | `Approval: QA` | Exact approval provided on 2026-07-19 after revision-17 revalidation |
| UAT Evidence | evaluates | accepted QA scope | Repository behavior and explicit live-host evidence boundary are ready for user acceptance |
| UAT Revision | supersedes | QA revision 17 | Operational chat status still permitted agent-side reconstruction |
| Refreshed QA_REPORT | tests | TP | Canonical status renderer, CLI parity, fail-closed output and no-template integrity pass |
| Refreshed QA Report | approved_by | `Approval: QA` | Exact approval provided on 2026-07-19 after revision-20 revalidation |
| Refreshed UAT Evidence | evaluates | refreshed QA scope | Deterministic status behavior and external evidence boundary are ready for acceptance |
| UAT | approved_by | `Approval: UAT` | Exact approval accepted on 2026-08-19 after selected-run, same-gate and Revision 21 revalidation. |
| OR | verifies | full run | OR-full records accepted delivery, external evidence limits, risks and resolved Context Graph impact. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Duplicated native-interaction guidance | `plugin/skills/gate-check/SKILL.md`; `plugin/meta/contracts/interaction.md` | Single-owner maintainability finding | direct |
| Prose duplication enforced by integrity checks | `plugin/scripts/check-runtime-integrity.mjs` | Structural cause of drift risk | direct |
| Two Quick Task paths and mandatory post-UR routing | `plugin/meta/contracts/modes.md`; `plugin/meta/contracts/gate-transition.md` | Proportionality and terminology finding | direct |
| One generated OpenCode boundary copied into nine skills and global instructions | `create-agdf/lib/installers/opencode.js`; global OpenCode installation | Context and installed-artifact redundancy with one existing generator owner | direct |
| Focused contract references differ by skill | `plugin/skills/*/SKILL.md` | Blanket removal would lose explicit dependency scoping | direct |
| Local validator unavailable on the current shell path | `command -v agdf`; Codex/Claude plugin manifests; OpenCode config-local `.bin/create-agdf` | Routine machine validation is not uniformly locally resolvable | direct |
| Existing shared CLI implementation | `agdf/bin/agdf.js`; `create-agdf/cli` export | A local adapter can delegate without copying evaluator policy | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Direct authenticated Codex/Claude/OpenCode observation after implementation | warn | Record as supporting UAT evidence without replacing deterministic tests |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Skill becomes too terse to execute reliably | warn | Prove focused contract loading and retain gate-specific orchestration |
| Terminology change breaks persisted mode consumers | warn | Prefer human-facing clarification over enum migration unless explicitly designed |
| Reduced ceremony hides required evidence | warn | Collapse interaction only; keep durable evidence and fail-closed escalation |
| Centralized OpenCode boundary is not loaded before a skill | warn | Prove global instruction loading or retain a compact skill-local activation guard |
| Local validator adapters create a second CLI implementation | warn | Delegate only to `create-agdf/cli` and enforce source/version parity |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: existing nodes now record consolidated interaction ownership, Compact Delivery routing and exact-version local-validator composition.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The current findings and decisions belong to this delivery scope until approved and implemented.
- memory_refs: `.agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/UR.md`

## Closeout

- delivered: LIR-01 through LIR-12, release-built runtime dependency, three reproduced-finding fixes, deterministic operational status presentation, focused/aggregate tests, refreshed 12/12 TP Review, Clean Review, Code Review, QA Gate pass, exact UAT acceptance, OR-full and Context Graph reconciliation.
- not_delivered: authenticated released-host observation, native Windows execution, release and VCS publication.
- verification_performed: deterministic generation/digest checks, offline local command execution, OpenCode wrapper fixtures, Runtime Integrity positive/negative, 27/27 skill evals, aggregate smoke and diff check.
- unverified: direct authenticated Codex/Claude/OpenCode host observation and Windows-native execution.
- next_allowed_action: Re-evaluate Product Maturity Roadmap PMR-5/PMR-6 and the remaining `opencode-single-install-activation` owner decision.
- quality_outlook: Preserve compact semantic parity and keep released-package installation as UAT evidence.
