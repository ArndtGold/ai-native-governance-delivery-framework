# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-public-plugin-distribution
- lifecycle: active
- revision: 27
- revision_id: 4bcf137c-d36e-4f45-9608-c32385167b87
- mode: structured_delivery
- current_gate: QA
- decision: pass
- owner: agent

## Objective

Prepare AGDF for a public, submission-ready plugin distribution through OpenAI's shared ChatGPT and
Codex plugin directory while preserving one canonical AGDF source, honest surface boundaries and
separate authority for submission, publication and release.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Description and public-policy corrections remain implemented and tested. `CONTRIBUTING.md`, `GOVERNANCE.md` and `CODE_OF_CONDUCT.md` are now canonical English documents preserving contribution, authority, succession and enforcement semantics. English/German participation and German-primary governance remain explicit. Community baseline plus 17 negative contracts, Runtime Integrity and full create-agdf smoke pass. Revision 7 reviews and QA Revision 10 pass; PPD-QA-03 is resolved. |
| What is approved? | Exact approvals are recorded for UR, PRD Revisions 1–3, SD Revisions 1–3 and TP Revisions 2–3. TP Revision 3 received exact `Approval: TP` on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| What is missing? | Exact `Approval: QA` for QA Report Revision 10. Live host, deployment, publisher, portal and publication evidence remains separate. |
| What is the next allowed action? | Review QA Report Revision 10 and provide exact `Approval: QA`, request revision or decline. |
| What is explicitly forbidden right now? | Portal mutation, identity action, deployment, submission, publication, release, VCS action, installed-cache edit and any inference of external success from repository evidence. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/agdf-public-plugin-distribution/UR.md`; AGDF Runtime Contract
- multi_scope_state: clear
- active_scope_evidence: User explicitly requested starting `agdf-public-plugin-distribution`; repository search found no existing run with that key.
- competing_scope_lines: Existing plugin, packaging, public Pages, host-conformance and community-health runs provide evidence but do not own this new public-directory distribution outcome.
- branch_workspace_evidence: Pre-existing staged `docs/presentation/agdf_cto_praesentation.key` is unrelated user work and remains isolated from this run.
- branch_workspace_scope_effect: Only public-distribution implementation and control artefacts changed for this revision; unrelated user work remains isolated.

## Run Status Card

| Run status | Value |
|---|---|
| Status | in progress |
| Current gate | QA |
| Allowed now | Review QA Report Revision 10 and decide it |
| Blocked by | Missing exact QA approval |
| Missing approval | `Approval: QA` |
| Next gate after approval | UAT |
| Allowed after approval | Prepare bounded UAT evidence; release and external actions remain gated |
| Next step | Review QA Report Revision 10 and provide exact `Approval: QA`, request revision or decline |
| Quality outlook | Align local/package and constrained public descriptions without implying a runtime, execution environment or agent platform |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-08-17 after revalidation of run, gate, revision and durable UR. |
| Brownfield Review | done | `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_REVIEW.md`; `structured_delivery` selected. |
| UX Intent Definition | ready | `.agdf/control/artefacts/agdf-public-plugin-distribution/UX_INTENT_DEFINITION.md`; non-authorizing PRD input. |
| PRD Revision 1 | approved | Exact `Approval: PRD` provided on 2026-08-17 after revalidation of run, gate, revision and durable PRD. |
| PRD Revision 2 | approved | Revision 2 received exact `Approval: PRD` on 2026-08-17 after revalidation of run, gate, revision and durable PRD. |
| PRD | approved | Revision 3 received exact `Approval: PRD` on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| SD Revision 1 | approved | Exact `Approval: SD` provided on 2026-08-17 after revalidation of run, gate, revision and durable SD. |
| SD Revision 2 | approved | Revision 2 received exact `Approval: SD` on 2026-08-17 after revalidation of run, gate, revision and durable SD. |
| SD | approved | Revision 3 received exact `Approval: SD` on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| TP Revision 2 | approved | Revision 2 received exact `Approval: TP` on 2026-08-17 after revalidation of run, gate, revision and durable TP. |
| TP | approved | Revision 3 received exact `Approval: TP` on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | missing | QA Report Revision 10 decision is `pass` and requires exact `Approval: QA`. |
| UAT | blocked | Exact QA approval and live-host evidence are incomplete. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-public-plugin-distribution/UR.md` | approved | Revision 1 approved on 2026-08-17. |
| Brownfield Review | `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_REVIEW.md` | done | Existing owners inventoried; high UX impact and `structured_delivery` recorded. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-public-plugin-distribution/UX_INTENT_DEFINITION.md` | ready | Working modes, effective-state authority, visible ownership, blockers, recovery, transitions and proposed PRD criteria are defined. |
| PRD | `.agdf/control/artefacts/agdf-public-plugin-distribution/PRD.md` | approved | Revision 3 approved on 2026-08-18. |
| SD | `.agdf/control/artefacts/agdf-public-plugin-distribution/SD.md` | approved | Revision 3 approved on 2026-08-18. |
| TP | `.agdf/control/artefacts/agdf-public-plugin-distribution/TP.md` | approved | Revision 3 approved on 2026-08-18. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_ANALYSIS.md` | done | Revision 4 passes in-place English translation through existing community-policy and test owners. |
| CD+Tests | `.agdf/control/artefacts/agdf-public-plugin-distribution/CD_TESTS.md` | done | Revision 8 resolves PPD-QA-03; community baseline plus 17 negatives, Runtime Integrity and full smoke pass. |
| Candidate Inspection | `.agdf/control/artefacts/agdf-public-plugin-distribution/PUBLIC_CANDIDATE_INSPECTION.md` | pass | Refreshed PPD-L01 confirms public short copy, 29-code-point length, tree, exclusions, digest and honest blockers. |
| TP Review | `.agdf/control/artefacts/agdf-public-plugin-distribution/TP_REVIEW.md` | pass | Revision 7: 19/20 fully done; full English community-policy routing is verified and PPD-T20 is current QA. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-public-plugin-distribution/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Revision 7: five in-place policy translations and existing metadata owners without fallback or parallel structure. |
| CR | `.agdf/control/artefacts/agdf-public-plugin-distribution/CODE_REVIEW.md` | done | Revision 7 decision `pass`; PPD-CR-08 is resolved and no open finding remains. |
| QA | `.agdf/control/artefacts/agdf-public-plugin-distribution/QA_REPORT.md` | pass | Revision 10 resolves PPD-QA-01–03 and passes repository/exact-bundle readiness; PPD-L02–L08 remain pending. |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: TP
- scope_reason: `release_cross_host_depth`; public listing/capability/legal claims form an external contract, while verified publisher authority, review, publication and rollback span repository, OpenAI portal, ChatGPT and Codex. `structured_slice` is rejected because those effects are not locally reversible or independently acceptable.
- evidence: `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_REVIEW.md`; official OpenAI plugin architecture/submission documentation inspected 2026-08-17; canonical plugin/package/release and host-evidence owners.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User request | motivates | UR Revision 1 | Explicit request to start `agdf-public-plugin-distribution` on 2026-08-17. |
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-08-17 after same-run, same-gate and revision revalidation. |
| Brownfield Review | sizes | UR | Existing owners, coverage, reuse, public contract, external authority, release and cross-host effects inspected. |
| Brownfield Review | selects_mode | structured_delivery | Complete Structured Depth Evidence records three decisive full-depth trigger families and rejects the bounded slice. |
| UX Intent Definition | informs | PRD | Ready; public adopter and publisher modes, effective-state authority, recovery and fourteen proposed acceptance criteria are defined. |
| PRD | derived_from | UR | Revision 1 derives forty observable requirements from approved intent, Brownfield ownership/depth evidence and ready UX input. |
| PRD Revision 1 | approved_by | `Approval: PRD` | Exact approval provided on 2026-08-17 after same-run, same-gate and revision revalidation. |
| PRD Revision 2 | revises | PRD Revision 1 | User-selected `AGDF` directory label, compliant short copy and three prompt projection resolve current final-directory constraints without replacing the full product identity. |
| PRD Revision 2 | approved_by | `Approval: PRD` | Revision 2 exact approval provided on 2026-08-17 after same-run, same-gate and revision revalidation. |
| PRD Revision 3 | revises | PRD Revision 2 | User-requested copy sharpening removes “operating system” from plugin metadata and defines exact local/package and constrained public descriptions. |
| PRD Revision 3 | approved_by | `Approval: PRD` | Exact approval provided on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| SD Revision 1 | derived_from | PRD Revision 1 | Maps all forty requirements to canonical owners, deterministic build/package validation, public-policy projections, evidence classes and explicit external transitions. |
| SD Revision 1 | approved_by | `Approval: SD` | Exact approval provided on 2026-08-17 after same-run, same-gate and revision revalidation. |
| SD Revision 2 | derived_from | PRD Revision 2 | Adds only canonical constrained/full identity projections and fail-closed 30/30/3/128 validation to the approved architecture. |
| SD Revision 2 | approved_by | `Approval: SD` | Exact approval provided on 2026-08-17 after same-run, same-gate and revision revalidation. |
| SD Revision 3 | derived_from | PRD Revision 3 | Preserves the Revision 2 architecture and limits the delta to two short-copy projections, exact length/equality tests and exclusion of the marketing metaphor from plugin metadata. |
| SD Revision 3 | approved_by | `Approval: SD` | Exact approval provided on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | Current Revision 3 preserves the approved architecture and implements only the approved description-projection design delta. |
| SD | approved_by | `Approval: SD` | Revision 3 exact approval provided on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| TP Revision 2 | derived_from | SD Revision 2 | Maps all forty requirements to implementation/review tasks, automated tests, live evidence, sequencing and QA blockers. |
| TP Revision 2 | approved_by | `Approval: TP` | Exact approval provided on 2026-08-17 after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | Current Revision 3 limits the delta to two canonical values, deterministic generation, exact projection/length assertions and renewed reviews/QA. |
| TP | approved_by | `Approval: TP` | Revision 3 exact approval provided on 2026-08-18 after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Analysis | verifies | TP | Revision 2 pass; existing canonical definition, projector, generator and tests support the narrow change without a schema or parallel owner. |
| CD+Tests | implements | TP | Revision 6 implements the two approved descriptions through existing canonical owners and preserves strategic long copy, prompts, capabilities and external boundaries. |
| Candidate Inspection | verifies | CD+Tests | Refreshed PPD-L01 passes as bundle-only evidence; external state remains unverified. |
| TP Review | verifies | TP | Revision 5: 19/20 fully done; PPD-T20 is deliberately the current QA action. |
| Clean Implementation Review | verifies | CD+Tests | Revision 5 pass; canonical local/public short-copy owners and one strategic long-copy owner without fallback or parallel owner. |
| CR | reviews | CD+Tests | Revision 5 pass; PPD-CR-06 is resolved and no open code finding remains. |
| QA Report | resolves | PPD-QA-01 | Revision 6 `pass`; approved Revision 3 contract, implementation and deterministic evidence close the requirements gap. |
| QA Report Revision 7 | routes_to | CD+Tests | PPD-QA-02 requires English canonical security/support policies and updated language-sensitive tests. |
| CD+Tests Revision 7 | resolves | PPD-QA-02 | In-place English policies, semantic bilingual guardrails, monolingual negative fixture and complete regressions pass. |
| QA_REPORT | tests | TP | QA Revision 8 decision `pass` is supported by Brownfield Analysis Revision 3, CD+Tests Revision 7, Revision 6 reviews and complete repository/bundle regressions. |
| QA Report Revision 9 | routes_to | CD+Tests | PPD-QA-03 requires English canonical contribution/governance/conduct owners and semantic negative fixtures. |
| CD+Tests Revision 8 | resolves | PPD-QA-03 | In-place English community policies, semantic guards, authority/conduct negative fixtures and complete regressions pass. |
| QA_REPORT | tests | TP | QA Revision 10 decision `pass` is supported by Brownfield Analysis Revision 4, CD+Tests Revision 8, Revision 7 reviews and complete repository/bundle regressions. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Public plugin directory and submission model | Current official OpenAI plugin documentation inspected 2026-08-17 | External distribution feasibility | direct documentation |
| Existing installable AGDF plugin metadata | `plugin/.codex-plugin/plugin.json` | Current product/package baseline | direct |
| Source runtime integrity pass | `node plugin/scripts/check-runtime-integrity.mjs` on 2026-08-17 | Source-tree consistency only | deterministic |
| Version-matched local validator | installed AGDF `0.12.0` resolve-only probe | Machine-validation ownership | deterministic |
| Brownfield owner inventory | `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_REVIEW.md` | Existing coverage, reuse and depth decision | direct repository evidence |
| Solution owner mapping | `.agdf/control/artefacts/agdf-public-plugin-distribution/SD.md` | Canonical sources, generated candidate, package proof, policies, evidence and portal boundaries | approved-PRD-derived design |
| Pre-implementation Brownfield Analysis | `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_ANALYSIS.md` | Existing owners, reuse order, regressions, stop conditions and worktree isolation | direct repository evidence |
| Current public-listing constraints | Official OpenAI plugin build, submission and submission-error documentation fetched 2026-08-18 | Package validation permits a longer local interface; final public submission applies 30/30/3/128 listing limits | direct current documentation |
| Local/public manifest projection | `plugin/.codex-plugin/plugin.json` and generated public candidate measured 2026-08-18 | Local 34-character name and four prompts remain distinct from public `AGDF` and three prompts | deterministic repository evidence |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Current Codex and ChatGPT live-host behavior | Blocks public capability claims | Define later UAT matrix |
| Publisher identity verification and Apps Management authority | Blocks portal submission but not repository preparation | Complete and observe outside the repository after applicable approvals; persist no Persona material |
| Public privacy/terms route deployment | Blocks submission readiness | Deploy and verify only after applicable approval and explicit external-action authority |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Public listing overstates enforcement or compliance | High trust and product risk | Make capability and non-certification boundaries acceptance criteria |
| OpenAI-specific fork becomes a second policy owner | High governance drift risk | Derive distribution from canonical AGDF sources |
| Repository tests are mistaken for live-host proof | High evidence risk | Keep source, package, host and portal evidence separate |
| Submission or publication is inferred from readiness work | High authority risk | Require separate explicit external action after applicable gates |
| Portal limits are handled by silent truncation | High product identity and review risk | Route exact name/copy constraints to approved PRD revision before implementation |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; existing `CG-CREATE-AGDF-CLI-COMPOSITION`, `CG-NATIVE-INTERACTION-AUTHORITY`, `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_required_action: reconcile
- context_graph_reconciliation: resolved
- context_graph_gate_effect: none
- context_graph_evidence: `CG-PUBLIC-PLUGIN-DISTRIBUTION` records the approved Revision 3 local/public description projections, one strategic long-copy owner, deterministic validation and unchanged authority boundaries.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Public-directory authority, desired/effective state and surface-capability boundaries are reusable release invariants that need a curated node before closeout.
- memory_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-public-plugin-distribution/SD.md`

## Closeout

- next_allowed_action: Review QA Report Revision 10 and provide exact `Approval: QA`, request revision or decline.
- quality_outlook: Align local/package and constrained public descriptions without implying a runtime, execution environment or agent platform.
