# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-guided-mcp-activation
- lifecycle: active
- revision: 23
- revision_id: A1DB491D-EF88-492A-AE1A-4FAF1DBC56A7
- started_at: 2026-09-08
- mode: structured_delivery
- current_gate: UAT
- decision: in_progress
- owner: Arndt Gold

## Objective

Make AGDF installation a coherent guided setup that offers a deliberate project- or user-scoped MCP
activation together with plugin installation, preserves an explicit plugin-only path, reports every
effective state truthfully and never infers technical or governance consent.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | TP Revision 2 is implemented. CD+Tests Revision 5, Task Plan Review Revision 4, Clean Implementation Review Revision 4 and Code Review Revision 5 pass for GMA-01 through GMA-28 and AC-01 through AC-13. The Context Graph is reconciled. |
| What is approved? | UR, PRD Revision 2, SD Revision 2, TP Revision 2 and QA Report Revision 4 are approved. Brownfield Review selected `structured_delivery`; the updated pre-implementation Brownfield Analysis and QA decision are `pass`. |
| What is missing? | Direct multi-host, fresh-session, native Windows and human UAT evidence remain unverified. Exact `Approval: UAT` is missing and cannot be requested until the applicable UAT evidence is complete. |
| What is the next allowed action? | Execute the prepared UAT cases within existing host authorization and record direct host and human evidence separately. |
| What is explicitly forbidden right now? | A UAT pass or approval without direct evidence, release, push, pull request and commit without their required authority. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User requested on 2026-09-08 that MCP registration and activation become part of the installation journey.
- competing_scope_lines: `agdf-cross-host-mcp-integration` retains its delivered MCP server, lifecycle, language and evidence scope; `installation-consent-runtime-checks` retains automatic-check consent; `cross-surface-plugin-opt-out` retains plugin removal semantics.
- branch_workspace_evidence: Branch `main` at clean baseline `5397df666b6e6384a13ba84325c78e70e639627c` before this run was created.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: current installed Codex plugin and MCP status; existing installer, lifecycle, consent, opt-out and architecture owners; user product decision
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: new cross-host installation-journey scope
- excluded_mutation_targets: canonical dispatch semantics; gate authority; host-managed trust and permissions; publication and release

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UAT |
| Allowed now | Execute the prepared UAT cases and record direct evidence. |
| Blocked by | none |
| Missing approval | `Approval: UAT` after applicable direct UAT evidence is complete and presented |
| Next step | Execute GMA-U01 through GMA-U09 and the authorized host observations without deriving host support from repository tests. |
| Quality outlook | QA Report Revision 4 is approved and passes 28/28 TP tasks and 13/13 acceptance criteria; direct UAT evidence remains pending. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-08 against run revision `d202cadb-bfed-40f0-8735-b2170a37adcc`. |
| Brownfield Review | done | `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_REVIEW.md`; Structured Delivery selected. |
| Mode/Slice Decision | structured_delivery | Public CLI, runtime, recovery and cross-host triggers are directly evidenced. |
| UX Intent Definition | ready | `.agdf/control/artefacts/agdf-guided-mcp-activation/UX_INTENT_DEFINITION.md`; no open product question blocks PRD drafting. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-09-09 against run revision `6B78B39F-4844-4823-B9A9-B134316D2C59`. |
| SD | approved | Exact `Approval: SD` accepted on 2026-09-09 against run revision `D6E900DA-A645-4CB9-A505-5DEF352E125D`. |
| TP | approved | Exact `Approval: TP` accepted on 2026-09-09 against run revision `E40A4773-D868-46B2-BFCD-35E295A40FBC`. |
| QA | approved | Exact `Approval: QA` accepted on 2026-09-09 against run revision `AF703D59-0686-4024-864D-4D7DDF15C36C`; QA Report Revision 4 decision is `pass`. |
| UAT | current | Direct host and human acceptance evidence must be recorded before an exact `Approval: UAT` may be requested. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-guided-mcp-activation/UR.md` | approved | Revision 1 approved on 2026-09-08. |
| Brownfield Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_REVIEW.md` | done | Existing owners mapped; Structured Delivery selected. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-guided-mcp-activation/UX_INTENT_DEFINITION.md` | ready | High-impact choices, effective states and recovery are defined as PRD input. |
| PRD | `.agdf/control/artefacts/agdf-guided-mcp-activation/PRD.md` | approved | Revision 2 approved on 2026-09-09. |
| SD | `.agdf/control/artefacts/agdf-guided-mcp-activation/SD.md` | approved | Revision 2 defines scope selection, scope preflights, precedence, user-scope labels and validated invocation-directory transport. |
| TP | `.agdf/control/artefacts/agdf-guided-mcp-activation/TP.md` | approved | Revision 2 maps GMA-19 through GMA-28 and AC-13 to implementation, tests, documentation, reviews and evidence boundaries. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_ANALYSIS.md` | done | Revision 2 decision `pass`; existing owners, dependency direction, compatibility and regression path support the revised implementation. |
| CD+Tests | `.agdf/control/artefacts/agdf-guided-mcp-activation/CD_TESTS.md` | done | Revision 5 implements GMA-01 through GMA-28 and AC-01 through AC-13; direct host and UAT tracks remain unverified. |
| Task Plan Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/TASK_PLAN_REVIEW.md` | done | Revision 4; decision `pass`; 28/28 tasks fully_done and 13/13 criteria done. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Revision 4; decision `pass`; existing setup, MCP, consent, locale and wrapper owners remain singular. |
| Code Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/CODE_REVIEW.md` | done | Revision 5; decision `pass`; GMA-UAT-04 and GMA-UAT-05 are resolved with current tests. |
| CR | three linked review artefacts | done | Current reviews apply to approved PRD, SD and TP Revision 2. |
| QA | `.agdf/control/artefacts/agdf-guided-mcp-activation/QA_REPORT.md` | pass | Revision 4 decision `pass` was approved exactly against the revalidated QA revision. |
| UAT Preparation | `.agdf/control/artefacts/agdf-guided-mcp-activation/UAT_PREPARATION.md` | ready | Revision 4 lists the current nine human and four direct-host evidence lanes without claiming execution. |
| UAT |  | current | Direct evidence collection is allowed; no UAT decision or approval exists yet. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `Brownfield Analysis`
- scope_reason: `external_contract_depth`; the public CLI and installation contract changes, while plugin and MCP runtime transactions, recovery and four host consumers require coordinated design and evidence. Structured Slice is rejected because it cannot independently satisfy the shared update, removal and compatibility outcome.
- evidence: `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_REVIEW.md`
- transparency_note: Quick Task and Verified Change are ineligible due new product semantics and runtime mutation; Structured Delivery retains full PRD, SD, TP, QA and UAT depth.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-09-08 after same-run, same-gate and revision revalidation. |
| Brownfield Review | routes | Mode/Slice Decision | Structured Delivery selected with complete depth evidence. |
| UX Intent Definition | informs | PRD | Ready; becomes authoritative only through approved PRD. |
| PRD | derived_from | UR | Approved Revision 2 retains the installation intent and incorporates direct local evidence for the explicit scope journey plus original invocation-directory contract. |
| PRD | approved_by | `Approval: PRD` | Exact approval accepted on 2026-09-09 after same-target, same-run, same-gate and revision revalidation. |
| PRD Revision 1 | superseded_by | approved PRD Revision 2 | The earlier approval remains historical. |
| SD | derived_from | PRD | Approved PRD Revision 2 defines the product contract; SD Revision 2 defines the separate scope interaction, scope preflights, native precedence and invocation-directory transport. |
| SD Revision 1 | superseded_by | SD Revision 2 | The earlier approval remains historical and does not cover the changed design. |
| SD | approved_by | `Approval: SD` | Exact approval accepted on 2026-09-09 after same-target, same-run, same-gate and revision `D6E900DA-A645-4CB9-A505-5DEF352E125D` revalidation. |
| TP | derived_from | SD | Approved SD Revision 2 provides the design; TP Revision 2 adds GMA-19 through GMA-28 and AC-13 for scope selection, precedence, invocation-directory transport and current evidence boundaries. |
| TP Revision 1 | superseded_by | TP Revision 2 | The earlier approval remains historical and does not cover GMA-UAT-04 or GMA-UAT-05. |
| TP | approved_by | `Approval: TP` | Exact approval accepted on 2026-09-09 after same-target, same-run, same-gate and revision `E40A4773-D868-46B2-BFCD-35E295A40FBC` revalidation. |
| Brownfield Analysis Revision 2 | prepares | TP | Decision `pass`; existing owners support the revised scope without parallel authority. |
| Brownfield Analysis | prepares | TP | Decision `pass`; existing owners and bounded reuse path permit CD+Tests. |
| CD+Tests | implements | TP | Revision 5 completes GMA-01 through GMA-28 and AC-01 through AC-13 and records repository, package, protocol, host and UAT evidence separately. |
| Task Plan Review | verifies | TP and CD+Tests | Revision 4; decision `pass`; 28/28 tasks and 13/13 criteria are mapped to concrete evidence. |
| Clean Implementation Review | verifies | SD and implementation | Revision 4; decision `pass`; ownership and dependency direction remain clean. |
| Code Review | verifies | implementation and CD+Tests | Revision 5; decision `pass`; no open finding remains. |
| QA_REPORT Revision 3 | superseded_by | revised product journey and open implementation findings | The earlier pass covers the previous approved scope only. |
| Historical QA approval | superseded_by | GMA-UAT-01 correction | The approval for Revision 11 remains historical evidence but does not approve QA Report Revision 2. |
| Historical QA approval | superseded_by | GMA-UAT-02 correction | The approval for QA Report Revision 2 remains historical evidence but does not approve QA Report Revision 3. |
| QA_REPORT | tests | TP | Revision 4 decision `pass`; 28/28 tasks, 13/13 criteria, Brownfield fit, solution integrity, code quality and Context Graph reconciliation are current for TP Revision 2. |
| QA_REPORT Revision 4 | approved_by | `Approval: QA` | Exact deliberate approval accepted on 2026-09-09 after same-target, same-run, same-gate and revision `AF703D59-0686-4024-864D-4D7DDF15C36C` revalidation. |
| UAT Preparation Revision 3 | superseded_by | revised product journey | Revision 4 is prepared only after the current QA decision. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Current Codex MCP inspection | `codex mcp list` and `codex mcp get agdf --json`, 2026-09-08 | Plugin enabled while AGDF MCP registration is absent | direct local inspection |
| Existing MCP lifecycle | `create-agdf/lib/mcp-lifecycle/` and `plugin/meta/agdf-mcp-capability.json` | reusable four-host status, enable, disable, provenance and cleanup owners | direct repository inspection |
| Existing installation owners | `create-agdf/lib/installers/`, `create-agdf/lib/host-adapters/` and local install scripts | current plugin installation and host-specific mechanisms | direct repository inspection |
| Cross-host MCP baseline | `.agdf/control/artefacts/agdf-cross-host-mcp-integration/` | approved server, lifecycle, language and evidence boundaries | durable repository evidence |
| Product decision | User request, 2026-09-08 | MCP activation should join the installation journey | direct user instruction |
| Brownfield Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_REVIEW.md` | existing owners, reuse path, risks and Structured Depth Decision | direct repository analysis |
| UX Intent Definition | `.agdf/control/artefacts/agdf-guided-mcp-activation/UX_INTENT_DEFINITION.md` | user decisions, effective states, recovery and proposed acceptance criteria | direct product analysis |
| Approved PRD Revision 2 | `.agdf/control/artefacts/agdf-guided-mcp-activation/PRD.md` | explicit project/user scope journey and original invocation-directory contract | durable approved product contract |
| Approved SD Revision 2 | `.agdf/control/artefacts/agdf-guided-mcp-activation/SD.md` | separate scope interaction, scope preflights, native precedence, labels and invocation-directory transport | durable approved design contract |
| TP Revision 2 | `.agdf/control/artefacts/agdf-guided-mcp-activation/TP.md` | GMA-19 through GMA-28, AC-13 and updated repository, host and UAT matrix | durable approved task and test plan |
| Brownfield Analysis Revision 2 | `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_ANALYSIS.md` | current owner coverage, reuse, compatibility, regression and evidence boundaries for TP Revision 2 | direct repository analysis; pass |
| CD+Tests | `.agdf/control/artefacts/agdf-guided-mcp-activation/CD_TESTS.md` | Revision 5 implementation, tests, version boundary, dual scope, invocation source, protocol and evidence boundaries | durable repository evidence; done |
| Task Plan Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/TASK_PLAN_REVIEW.md` | Revision 4; 28/28 tasks, 13/13 criteria and UX Intent Fidelity | durable review evidence; pass |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/CLEAN_IMPLEMENTATION_REVIEW.md` | Revision 4; primary solution, bounded fallbacks, owner reuse and Brownfield fit | durable review evidence; pass |
| Code Review | `.agdf/control/artefacts/agdf-guided-mcp-activation/CODE_REVIEW.md` | Revision 5; scope, path, priority, null mutation and compatibility | durable review evidence; pass |
| QA Report Revision 3 | `.agdf/control/artefacts/agdf-guided-mcp-activation/QA_REPORT.md` | previous TP coverage and quality decision | historical pass; superseded by open findings |
| QA Report Revision 4 | `.agdf/control/artefacts/agdf-guided-mcp-activation/QA_REPORT.md` | current TP Revision 2 coverage and `qa-gate` decision | durable QA evidence; approved pass |
| Current QA Approval | User response `Approval: QA`, 2026-09-09; `.agdf/control/artefacts/agdf-guided-mcp-activation/evidence/QA_APPROVAL_20260909_R4.json` | exact deliberate approval of QA Report Revision 4 against the revalidated run revision | current direct user authority for transition to UAT |
| Direct local Codex output | `.agdf/control/artefacts/agdf-guided-mcp-activation/evidence/CODEX_LOCAL_SETUP_20260909.json` | configured project scope and incorrect `<repository>/create-agdf` target | direct installed-host evidence for one setup result; discovery still pending restart |
| Historical QA Approval | User response `Approval: QA`, 2026-09-09 | approval for the superseded pre-GMA-UAT-01 state | historical direct user instruction; not current authority |
| Superseded QA Approval | User response `Approval: QA`, 2026-09-09; `.agdf/control/artefacts/agdf-guided-mcp-activation/evidence/QA_APPROVAL_20260909_R2.json` | exact deliberate approval of QA Report Revision 2 before GMA-UAT-02 | historical direct user instruction; not current authority |
| UAT Preparation Revision 3 | `.agdf/control/artefacts/agdf-guided-mcp-activation/UAT_PREPARATION.md` | previous nine acceptance cases and evidence boundaries | historical; superseded by revised product journey |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Direct installed-host setup journeys for Codex, Claude Code, GitHub Copilot and OpenCode | blocks support claims for the new guided journey | Execute GMA-H01 through GMA-H04 only with separate host authorization. |
| Native Windows guided setup | blocks a Windows support claim | Execute GMA-H05 on a native Windows host. |
| Human understanding of setup, recovery, version boundary and local package path | blocks UAT acceptance | Execute GMA-U01 through GMA-U09 after QA. |
| Exact `Approval: UAT` | blocks delivery closeout | Request only after the applicable direct host and human UAT evidence has been executed and presented. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Recommended setup is mistaken for implicit consent. | warn | Require a deliberate interactive choice and explicit noninteractive `--with-mcp`. |
| Partial failure is reported as complete installation. | warn | Model plugin, hook, registration, discovery and restart as separate effective states. |
| New orchestration duplicates installer or MCP lifecycle logic. | warn | Brownfield Review must preserve existing owners and add only composition. |
| Coupled removal deletes foreign or shared state. | warn | Reuse exact ownership, provenance and reference-counted cleanup. |
| Repository tests are presented as loaded-host support. | warn | Retain separate direct host and UAT evidence lanes. |
| A user-wide registration is mistaken for governance target authority. | warn | Explain that user scope changes host discovery only; every dispatch still resolves one target and run. |
| The local wrapper binds its technical `create-agdf` cwd as the project target. | resolved | `INIT_CWD` or validated `process.cwd()` is normalized before preparation and transported as explicit invocation context. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The three existing nodes now record dual-scope inspection, explicit scope selection, native precedence and validated invocation-directory transport with CD+Tests Revision 5.

## Closeout

- next_allowed_action: Execute the prepared direct host and human UAT cases within existing authorization and record each evidence lane separately.
- quality_outlook: QA Report Revision 4 is approved with a `pass`; direct host and human UAT evidence remain explicitly separate and pending.
