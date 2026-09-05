# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-request-activation-boundary
- lifecycle: active
- revision: 29
- revision_id: 00E80939-BDC0-4C77-B2D0-BF1E42CE4888
- started_at: 2026-09-04
- mode: `structured_delivery`
- current_gate: `QA`
- decision: `revise`
- owner: Arndt Gold

## Objective

Activate AGDF automatically only for explicit delivery intent, explicit AGDF operations or an
unambiguous active-run continuation, while ordinary read-only requests remain outside AGDF.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Revision 3 implementation uses one 1,092-byte Activation Kernel, compact discovery and on-demand operational detail without a second hook or classifier. Deterministic, package and full smoke evidence pass. Canonical-init finding `RAB-CR-01` was corrected and independently re-reviewed as pass. |
| What is approved? | UR Revision 1, PRD Revision 4, SD Revision 5 and TP Revision 3 are approved. The TP Revision 2 approval remains historical only. |
| What is missing? | Four required external model-backed composed-profile runs and exact install/readback/restart/fresh-session evidence for Codex, Claude Code, GitHub Copilot and OpenCode. |
| What is the next allowed action? | Obtain separate authorization for the external model-profile transfer in `RAB-TPR-02` and for each host lifecycle change in `RAB-TPR-01`; then collect both evidence sets and rerun QA. |
| What is explicitly forbidden right now? | External profile transfer or host mutation without separate authorization, inferred host parity, QA approval request, UAT, release, commit, push or PR while either evidence obligation remains open. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User reported Claude over-activation for `Bewerte das Projekt`, clarified that automatic AGDF activation should be limited to implementation-related delivery intent, requested a better solution and explicitly asked to reduce unnecessary system instruction on 2026-09-04.
- competing_scope_lines: `cross-surface-executable-skill-dispatcher` remains independently at QA revise and owns dispatcher execution after skill invocation; `opencode-native-dispatch-tool` remains independently at UR and owns only OpenCode permission transport.
- branch_workspace_evidence: Brownfield baseline HEAD remains `2e98bb332587301274feba37a5d0d21fd706937a`. Final source, generated and package evidence plus isolated full smoke pass. Dispatcher v1 and protected host owners remain clean. The unrelated untracked image remains excluded. Generated-candidate collisions were preserved under `/private/tmp/agdf-public-candidate-collision-backup-20260905T0005`; only the canonical candidate remains and the collision did not recur.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: user-supplied Claude transcript; canonical router, runtime contracts, skill descriptions, dispatcher contract, generated session guidance and current test corpus
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: approved activation product semantics and SD Revision 5 architecture are unchanged; approved TP Revision 3 only corrects evidence composition and labelling
- excluded_mutation_targets: manual generated or installed-profile edits; dispatcher v1; hook manifests/count; OpenCode native tool or permission design; control evaluation, status and interaction semantics; existing unrelated worktree changes; host installations without lifecycle consent; release state

## Run Status Card

| Run status | Value |
|---|---|
| Status | QA Revision 3 ist `revise`: Implementierung und Code Reviews bestehen, aber zwei verpflichtende Evidenzebenen fehlen. |
| Current gate | QA |
| Allowed now | Separate Autorisierung für die externe Modellprofilübertragung und für jede Host-Lifecycle-Änderung einholen. |
| Blocked by | `RAB-TPR-01`, `RAB-TPR-02` |
| Missing approval | none |
| Next step | Nach separater Autorisierung beide Evidenzsätze erheben, TP Review aktualisieren und QA erneut ausführen. |
| Quality outlook | Source-, Generated-, Package-, Evaluator-, Installed- und Fresh-Host-Evidenz getrennt halten; keine QA-Freigabe aus deterministischen Ergebnissen ableiten. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` on 2026-09-04 after revalidating target, run, gate and revision `1A491E3C-21D7-46D7-BDA8-F175C15782E2`. |
| PRD | approved | Exact `Approval: PRD` on 2026-09-04 after revalidating target, run, gate and revision `79CF00F1-B52B-4BA6-814A-8F6B90FC2BD2`. |
| SD | approved | Exact `Approval: SD` for Revision 5 accepted on 2026-09-04 after same-target, same-run, same-gate and revision `2B7A793E-156B-4EBB-BF1E-A644C910517E` revalidation. Revision 4 approval remains historical. |
| TP | approved | Exact `Approval: TP` for Revision 3 accepted on 2026-09-04 after same-target, same-run, same-gate and run revision `C11F3392-2A48-41B3-9E48-88188E67A5ED` revalidation. Revision 2 and Revision 1 approvals remain historical. |
| QA | `revise` | QA Revision 3 consumes final Revision 3 implementation and reviews. `RAB-CR-01` is resolved; evidence gaps `RAB-TPR-01` and `RAB-TPR-02` prevent pass and approval request. |
| UAT | missing | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-request-activation-boundary/UR.md` | approved | Revision 1 defines automatic activation, abstention and missing-control boundaries. |
| Brownfield Review | `.agdf/control/artefacts/agdf-request-activation-boundary/BROWNFIELD_REVIEW.md` | done | Brownfield `pass`; `structured_delivery`; high UI/UX impact; new activation authority required. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-request-activation-boundary/UX_INTENT_DEFINITION.md` | ready | Revision 4 defines six working modes, SessionStart baseline, explicit invocation evidence, silent abstention, visibility, continuation and pre-approval control setup as non-authorizing PRD input. |
| PRD | `.agdf/control/artefacts/agdf-request-activation-boundary/PRD.md` | approved | Revision 4 defines six request classes, disjoint lifecycle/run-status handling, effect precedence, invocation provenance, silent abstention, complete missing-control routing and twenty observable criteria. |
| SD | `.agdf/control/artefacts/agdf-request-activation-boundary/SD.md` | approved | Revision 5 retains approved product semantics and defines one eager Activation Kernel, on-demand router/contracts, compact discovery and bindings, explicit instruction budgets, duplicate checks and compaction exit criteria. |
| TP | `.agdf/control/artefacts/agdf-request-activation-boundary/TP.md` | approved | Revision 3 preserves the bounded two-stage implementation delta and corrects `RAB-BA-01` with separate profile/evaluator identities and closed non-oracle instruction-skill metadata. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-request-activation-boundary/BROWNFIELD_ANALYSIS.md` | done | Revision 3 decision is `pass`; it confirms owner reuse and protected boundaries, records `RAB-BA-01` resolved at approved TP Revision 3, and permits the bounded CD+Tests sequence. |
| CD+Tests | `.agdf/control/artefacts/agdf-request-activation-boundary/CD_TESTS.md` | done | Final implementation, focused suites, package evidence, canonical-init correction and isolated full smoke are recorded; external evidence gaps remain explicit. |
| TP Review | `.agdf/control/artefacts/agdf-request-activation-boundary/TASK_PLAN_REVIEW.md` | revise | Revision 3 records 6/8 relevant tasks fully done, `RAB-TP-20` partial and `RAB-TP-15` not done. |
| Instruction Footprint Audit | `.agdf/control/artefacts/agdf-request-activation-boundary/INSTRUCTION_FOOTPRINT_AUDIT.md` | done | Revision 3 records all final budgets, identities, on-demand route reachability and evidence boundaries. |
| Clean Review | `.agdf/control/artefacts/agdf-request-activation-boundary/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Revision 5 confirms the two-stage primary solution and bounded fallback exit criteria; `RAB-CR-01` is resolved. |
| CR | `.agdf/control/artefacts/agdf-request-activation-boundary/CODE_REVIEW.md` | done | Revision 3 passes with no remaining code finding after independent re-review and final smoke. |
| QA | `.agdf/control/artefacts/agdf-request-activation-boundary/QA_REPORT.md` | revise | Revision 3 consumes final evidence and withholds pass for open `RAB-TPR-01` and `RAB-TPR-02`. |
| UAT |  | not_applicable | Forbidden before QA pass and exact QA approval. |
| OR | `.agdf/control/artefacts/agdf-request-activation-boundary/OR.md` | done | Revision 2 records full closeout status and separate external-evidence authorization boundaries without granting QA, UAT, release or Git authority. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `TP`
- scope_reason: `authority_policy_security_depth` is decisive because the change defines when AGDF governance applies. `architecture_runtime_depth` and `release_cross_host_depth` also apply because applicability must precede target/dispatch/control and remain equivalent across four loaded host surfaces. Structured Slice is rejected because these effects require coordinated policy, runtime and rollout treatment.
- evidence: `.agdf/control/artefacts/agdf-request-activation-boundary/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-request-activation-boundary/UX_INTENT_DEFINITION.md`
- transparency_note: Brownfield Review and UX Intent Definition are internal, non-authorizing inputs. The recorded depth decision requires the full gate sequence and does not authorize implementation.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-09-04 after same-target, same-run, same-gate and same-revision revalidation. |
| Brownfield Review | sizes | UR | `structured_delivery`; high UI/UX impact; complete depth facts. |
| UX Intent Definition | informs | PRD | Revision 4 is `ready`; working modes, authority, activation, blockers, recovery and fifteen proposed criteria. |
| PRD | derived_from | UR | Revision 4 incorporates completed Brownfield Review and UX Intent Definition Revision 4; exact approval accepted after same-target/run/gate/revision revalidation. |
| SD | derived_from | PRD | Revision 5 retains all approved PRD semantics, responds to `RAB-CIR-02` with two-stage instruction loading and explicit budgets, and is exactly approved. |
| TP | derived_from | SD | Revision 3 preserves the bounded implementation delta for approved SD Revision 5, corrects the evidence interface found by Brownfield Analysis and is exactly approved. |
| Brownfield Analysis | analyzes | TP | Revision 3 passes against approved TP Revision 3, confirms the reuse path and records plan gap `RAB-BA-01` resolved. |
| CD+Tests | implements_and_tests | TP | Revision 3 implementation and deterministic/package evidence pass; external and fresh-host evidence remain separate. |
| TASK_PLAN_REVIEW | verifies | TP | Revision 3 records 6/8 relevant tasks fully done and two evidence-bound tasks incomplete. |
| CLEAN_IMPLEMENTATION_REVIEW | verifies_solution | CD+Tests | Revision 5 passes; no second activation owner or unjustified fallback remains. |
| CODE_REVIEW | reviews | CD+Tests | Revision 3 passes after `RAB-CR-01` correction and independent re-review. |
| QA_REPORT | tests | TP | QA Revision 3 is `revise` solely because `RAB-TPR-01` and `RAB-TPR-02` remain open. |
| OR | summarizes | run | Revision 2 records delivered scope, retained fallbacks, evidence and authorization boundaries, and the next permissible step. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Claude over-activation transcript | User report, 2026-09-04 | `Bewerte das Projekt` selected `gate-check` and missing-control UR flow | direct user-attested |
| Canonical routing conflict | `agdf-agent-router.md`; `modes.md`; `interaction.md`; `gate-check/SKILL.md` | read-only exclusion, AGDF Quick Task inclusion and broad discovery language | direct repository inspection |
| Dispatcher applicability gap | `skill-dispatch/contract.js`; `skill-dispatch/service.js`; `control-evaluation/gate-check.js` | no activation input, no abstention outcome and generic missing-control result | direct repository inspection |
| Existing approved read-only behavior | completed `installer-output-parity` artefacts | prior visible AGDF read-only orientation that requires explicit supersession | durable prior decision |
| Owner and consumer map | Brownfield Review; router, modes, target, interaction, dispatcher, lifecycle and generator sources | one new activation authority before existing target, dispatch and presentation owners | direct repository inspection plus three independent audits |
| Structured depth evidence | Brownfield Review | decisive policy, runtime and cross-host triggers; seven bounded-slice checks | complete policy evidence |
| UX intent | UX Intent Definition | silent and visible modes, continuation, ambiguity, lifecycle recovery and proposed PRD criteria | ready internal analysis |
| Product contract | approved PRD Revision 4 | request classes, precedence, authority order, silent abstention, SessionStart boundary, invocation provenance, pre-approval durable setup, missing-control matrix and twenty acceptance criteria | approved after exact same-target/run/gate/revision revalidation |
| Solution architecture | approved SD Revision 5 | approved product semantics plus one compact eager kernel, on-demand router/contracts, compact discovery and binding facts, deterministic instruction budgets, duplicate prevention and compaction exit criteria | approved after exact same-target/run/gate/revision revalidation |
| Independent SD review | three read-only specialist audits, 2026-09-04 | guard transport, provenance/origin, dispatcher order, initialization safety, discovery ownership, repository activation, generic status, status scope, OpenCode ordering, module inventory and host evidence | all concrete findings incorporated; dispatcher, routing and hook re-reviews returned READY on SD Revision 4 |
| Historical task and test plan | TP Revision 1 plus three read-only implementation-path audits, 2026-09-04 | prior implementation baseline, dispatcher fixture boundary, canonical init safety and four-host evidence separation | exact approval was accepted for Revision 1 only; stale for the two-stage architecture |
| Historical approved task and test plan | TP Revision 2 plus instruction-architecture, footprint-test and control-state audits, 2026-09-04 | bounded delta tasks, exact budgets, negative cases, composed-profile intent and compaction exit criteria | exact approval permitted Brownfield Analysis; superseded after finding RAB-BA-01 |
| Current task and test plan | TP Revision 3; Brownfield Analysis Revision 3 | separate profile/evaluator identities, closed non-oracle instruction-skill metadata and truthful source-composed evidence labelling | exactly approved, analyzed and implemented within the bounded owner set |
| Current worktree baseline | `git status --short`; HEAD `2e98bb332587301274feba37a5d0d21fd706937a` | final implementation and control artefacts; unrelated image excluded | direct repository inspection |
| Current pre-implementation Brownfield Analysis | `BROWNFIELD_ANALYSIS.md` Revision 3; three read-only specialist audits; projection check, 2026-09-04 | owner reuse, dirty overlap, compatibility, regression, host-evidence limits, composed-profile feasibility and prior plan-gap resolution | pass; RAB-BA-01 resolved at approved TP Revision 3; permits bounded CD+Tests |
| Historical oracle-free behavioral evidence | final `eval:request-activation`, 2026-09-04 | 33 German/English activation cases against the prior composition | stale for composed-profile proof; not loaded-host evidence |
| Instruction footprint audit | `INSTRUCTION_FOOTPRINT_AUDIT.md` Revision 3; temporary generated/installer/hook measurements, 2026-09-05 | separate eager static, dynamic, discovery, selected-skill and compaction planes; exact final byte counts and digests | direct source and generated evidence; not installed-host proof |
| Canonical-init correction | `canonical-init.js`; `canonical-init-test.js`; public CLI reproduction; independent re-review | strict valid-run retention, retry/repair idempotency, concurrent drift and invalid-state safety | focused and final full smoke pass; `RAB-CR-01` resolved |
| Final full smoke | `npm --prefix create-agdf run smoke-test`, 2026-09-05 | release prepare, activation, lifecycle, package, integrity, 83/83 skill evals and routing render | pass; deterministic/package evidence only |
| Mandatory reviews | `TASK_PLAN_REVIEW.md` Revision 3; `CLEAN_IMPLEMENTATION_REVIEW.md` Revision 5; `CODE_REVIEW.md` Revision 3; `QA_REPORT.md` Revision 3 | final TP coverage, solution integrity, actual diff and QA decision | Clean and Code Review pass; TP Review and QA revise only for `RAB-TPR-01` and `RAB-TPR-02` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Four external model-backed composed-profile runs | blocks complete behavioral evidence and QA pass | Obtain separate authorization for external profile transfer, then execute the TP-required Codex, Claude Code, GitHub Copilot and OpenCode profile/evaluator pairs with correct provenance. |
| Exact fresh-session host behavior for four hosts | blocks QA pass and UAT | Obtain separate lifecycle authorization per host, then execute the strict host matrix with matching staged/install/fresh version, digest and identity, including the two OpenCode compaction probes. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| A keyword filter misclassifies advice or quoted implementation text. | warn | Classify requested effect through one semantic contract and test adversarial cases. |
| A second hook becomes a competing activation policy. | warn | Keep activation semantics canonical and treat any mutation hook only as later defense in depth. |
| Dispatcher compatibility is changed in place or confused with another run's completed/QA evidence. | warn | Preserve dispatcher v1 by default; any necessary executable backstop requires explicit versioning and independent evidence. |
| Ordinary read-only handling still emits an AGDF banner. | warn | Require silent abstention and loaded-host transcript evidence. |
| Explicit AGDF status or lifecycle requests stop working. | warn | Preserve explicit-operation routes and test missing-control behavior by request class. |
| Canonical init recovery overwrites user or conflicting partial state. | warn | Strict valid-run parser, file/link constraints, content/identity snapshots and rollback tests fail closed; preserve this owner boundary. |
| Full eager routing or repeated policy channels return in a future projection. | warn | Preserve definition-owned byte budgets, kernel fingerprint, on-demand route and duplicate/conflict integrity checks. |
| Source-composed Copilot or OpenCode profiles are falsely presented as live evaluation on those hosts. | warn | Keep `profile_surface` and `evaluator_surface` independent, report `evidence_plane: source_composed`, and retain fresh-host evidence as a separate obligation. Treat any conflation as an implementation stop condition. |
| Expected case outcomes leak into model-visible composed instructions. | warn | Use only closed `composed_profile.instruction_skill` metadata and exclude both metadata and `expected` from model input. Treat any leakage as an implementation stop condition. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-REQUEST-ACTIVATION-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: update
- context_graph_gate_effect: `warning`
- context_graph_evidence: `CG-REQUEST-ACTIVATION-AUTHORITY` records the final two-stage implementation, on-demand route, budget evidence, resolved `RAB-CIR-02`, `RAB-BA-01` and `RAB-CR-01`, and the remaining external-model and fresh-host evidence gaps. Reconciliation remains open until those evidence obligations complete.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The request-activation boundary, two-stage instruction loading and separation of eager, dynamic, discovery, selected-skill and compaction evidence are reusable cross-surface invariants.
- memory_refs: `CG-REQUEST-ACTIVATION-AUTHORITY`; related existing authority nodes; `INSTRUCTION_FOOTPRINT_AUDIT.md`; SD Revision 5.

## Closeout

- next_allowed_action: Resolve blocking or revise-level delivery-map findings before making stronger quality claims.
- quality_outlook: Preserve the distinction between installed state and fresh-session loaded behavior.
