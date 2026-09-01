# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: legacy-profile-upgrade-recovery
- lifecycle: active
- revision: 26
- revision_id: 20A528F6-8E34-4E83-B6E0-C3807F58122E
- started_at: 2026-09-01
- mode: `structured_delivery`
- current_gate: `UAT`
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Make upgrades from explicitly supported historical AGDF profile contracts safe and automatic while
preserving fail-closed provenance and bounded Windows cache recovery.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | A verified AGDF-owned 0.13.8 shared marketplace was rejected by 0.14.3 because its older profile contract lacked the newer Copilot profile. Direct tag evidence identifies exact supported records for 0.13.6, 0.13.7, 0.13.8 and 0.14.1, current-shape records for 0.14.2 and 0.14.3, and no authoritative 0.14.0 record. PRD Revision 3 stated that set in its authority contract but contradicted it in acceptance criteria and non-goals. |
| What is approved? | UR, PRD Revision 4, SD Revision 3, TP Revision 5 and QA Revision 2 are approved. Brownfield Analysis Revision 4 and mandatory reviews pass. |
| What is missing? | UAT is deliberately deferred. Separately authorized native-Windows host/fresh-session evidence, a passing UAT report and exact `Approval: UAT` remain missing. |
| What is the next allowed action? | Resume only after deliberate bounded host authorization; do not approve UAT before direct evidence. |
| What is explicitly forbidden right now? | Unapproved real host/cache mutation, publication, release and VCS actions. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: User requested a UR for safe historical-profile upgrade and Windows cache recovery on 2026-09-01; durable UR at `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UR.md`.
- competing_scope_lines: Existing cross-host integrity, Windows viability and Copilot integration runs provide evidence but do not authorize this new migration and recovery behavior.
- branch_workspace_evidence: Branch `main` at baseline `e836571c7c11c99172f938edc4246e8a3650917b`; pre-existing changes from other active runs remain excluded.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | QA approved; UAT deliberately deferred |
| Current gate | UAT |
| Allowed now | Preserve the non-operative delivery summary or resume after explicit bounded host authority. |
| Blocked by | UAT execution is deferred and current host/fresh-session evidence is missing. |
| Missing approval | `Approval: UAT` only after a passing UAT report |
| Next step | Resume UAT only after explicit bounded native-Windows host authorization. |
| Quality outlook | Make compatibility systematic at release time without turning exact provenance into permissive version inference. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted on 2026-09-01 after same-run, same-gate and revision revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for durable Revision 4 after same-run, same-gate and revision revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for durable Revision 3 after same-run, same-gate and revision revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for durable Revision 5 after same-run, same-gate and revision revalidation. |
| QA | `approved` | Exact `Approval: QA` accepted for durable Revision 2 after same-run, same-gate and revision revalidation. |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UR.md` | `approved` | Safe historical-profile upgrade and bounded Windows cache recovery need; exact approval recorded. |
| Brownfield Review | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_REVIEW.md` | `done` | Existing owners inspected; Structured Delivery selected with complete depth evidence. |
| UX Intent Definition | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UX_INTENT_DEFINITION.md` | `ready` | High UI/UX impact; app restart and fresh-session activation states are defined as PRD input. |
| Verified Change |  | `not_applicable` | Public compatibility, migration, runtime recovery and cross-host activation impacts prohibit the compact path. |
| PRD | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/PRD.md` | `approved` | Revision 4 makes acceptance criteria, non-goals and evidence consistent with the exact tag-evidenced support set and fail-closed `agdf-v0.14.0` mismatch handling. |
| SD | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/SD.md` | `approved` | Revision 3 maps exact supported releases and explicitly rejects the incoherent `agdf-v0.14.0` tag. |
| TP | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TP.md` | `approved` | Revision 5 aligns tasks and release matrices and requires a new Brownfield Analysis Revision 4 rather than overwriting durable Revision 3. |
| Brownfield Analysis | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_ANALYSIS.md` | `done` | Revision 4 passes the exact owner, call-path, reuse and stop-condition assessment for approved TP Revision 5. |
| CD+Tests | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CD_TESTS.md` | `done` | Revision 2 records catalogue implementation, focused passes and three disclosed non-success baseline failures. |
| Task Plan Review | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TASK_PLAN_REVIEW.md` | `done` | Revision 2 decision pass covers CAT-T01 through CAT-T10 and preserves disclosed baseline failures. |
| Clean Implementation Review | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CLEAN_IMPLEMENTATION_REVIEW.md` | `done` | Revision 2 decision pass confirms minimal owner-aligned structure and no duplicate authority. |
| CR | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CODE_REVIEW.md` | `done` | Revision 2 decision pass records seven resolved findings and an independent final pass. |
| QA | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/QA_REPORT.md` | `pass` | Revision 2 passes the approved catalogue scope with three unrelated baseline failures explicitly non-successful. |
| UAT | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UAT_REPORT.md` | `pending` | Revision 2 records deliberate deferral and preserves required direct native-Windows and fresh-session evidence. |
| OR |  | `missing` | Not allowed. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `UAT`
- scope_reason: `external_contract_depth` is primary: the public installer changes its accepted historical compatibility contract and activation promise. Decisive persistence/migration, architecture/runtime and release/cross-host effects also apply because one durable shared marketplace is rebuilt across a closed compatibility window, Claude-owned cache recovery needs a separate exact authority boundary, and application restart plus fresh-session activation must remain coherent. `structured_slice` is rejected because these effects are not independently acceptable or recoverable as one local owner change.
- evidence: `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UX_INTENT_DEFINITION.md`; direct native-Windows public 0.14.3 recovery evidence from 2026-09-01; existing provenance, marketplace, installer, filesystem-swap, lifecycle and test owners.
- transparency_note: Brownfield Review and UX Intent Definition are complete internal routing inputs. They permit PRD drafting only and do not authorize implementation, installation mutation or loaded-host claims.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` | exact approval accepted on 2026-09-01 after same-run, same-gate and revision revalidation |
| Brownfield Review | `derived_from` | UR | completed post-UR owner, compatibility, recovery, UX-impact and structured-depth assessment |
| UX Intent Definition | `derived_from` | Brownfield Review | ready internal PRD input; no approval or implementation authority |
| PRD | `derived_from` | UR | approved Revision 4 derived from approved UR, completed Brownfield Review and ready UX Intent Definition |
| SD | `derived_from` | PRD | approved Revision 3 derived from approved PRD Revision 4 |
| TP | `derived_from` | SD | approved Revision 5 derived from approved SD Revision 3 |
| CD+Tests | `implements` | TP | Revision 3 implements approved TP Revision 5 with disclosed unrelated baselines |
| QA_REPORT | `tests` | TP | approved Revision 2 tests TP Revision 5 after mandatory review pass |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Public 0.14.3 install rejected the owned 0.13.8 marketplace | direct Windows execution on 2026-09-01 | historical profile compatibility gap | direct |
| Existing 0.13.8 ownership and installation provenance | `%LOCALAPPDATA%\agdf\marketplaces\agdf` inspection before recovery | trusted historical state | direct |
| Transactional marketplace replacement removed the profile blocker | bounded recovery execution on 2026-09-01 | canonical rebuild path | direct |
| First Claude cache rename failed with `EPERM`; owned temp cleanup and retry passed | direct Windows execution on 2026-09-01 | bounded cache recovery need | direct |
| Claude installation completed as verified 0.14.3 | public CLI result on 2026-09-01 | recovery outcome, not loaded-session evidence | direct |
| Restored host sessions retain a stale skill registry | direct post-install host observation on 2026-09-01 | restart and fresh-session activation are distinct | direct |
| Existing current-profile, transaction, host sequencing, retry, lifecycle and regression owners | repository inspection recorded in Brownfield Review | reuse path and structured-depth selection | direct |
| PRD Revision 1 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/PRD.md` | exact compatibility, authority, recovery, UX and evidence contract | direct |
| Revalidated PRD approval | deliberate exact `Approval: PRD` on 2026-09-01 | same run, PRD gate, durable Revision 1 and revision_id `9B8F3E36-1D55-4DE9-BFCC-322045C3343D` | direct |
| Solution Design Revision 1 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/SD.md` | architecture, ownership, failure recovery and verification design | direct |
| Revalidated SD approval | deliberate exact `Approval: SD` on 2026-09-01 | same run, SD gate, durable Revision 1 and revision_id `24FE7C99-C639-4BCF-B8D8-C92A7C4B10BB` | direct |
| Task and Test Plan Revision 1 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TP.md` | implementation tasks, approved paths, tests, stop conditions and evidence sequence | direct |
| Revalidated TP approval | deliberate exact `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 1 and revision_id `59F166ED-A883-4683-B242-86243CA62D22` | direct |
| Pre-implementation Brownfield Analysis | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_ANALYSIS.md` | exact owner/call-path reuse and implementation stop conditions | direct |
| CD+Tests Revision 1 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CD_TESTS.md` | implementation, focused verification and evidence-plane separation | direct |
| Mandatory reviews | Task Plan, Clean Implementation and Code Review Revision 1 | coverage, clean structure and code quality | direct |
| QA Report Revision 1 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/QA_REPORT.md` | revise decision and two open evidence obligations | direct |
| Deliberate scope expansion | User instruction `machen wir es doch gleich richtig` on 2026-09-01 | replace incident-only entry with systematic release-owned exact catalogue | direct |
| Revalidated PRD Revision 2 approval | deliberate exact `Approval: PRD` on 2026-09-01 | same run, PRD gate, durable Revision 2 and revision_id `8C2CCBF3-167C-4BC7-BFC3-FEBAA37E9438` | direct |
| Solution Design Revision 2 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/SD.md` | catalogue schema, ownership, release continuity, failure and verification design | direct |
| Revalidated SD Revision 2 approval | deliberate exact `Approval: SD` on 2026-09-01 | same run, SD gate, durable Revision 2 and revision_id `D091E7FB-E852-4DA2-8EB6-D6D8C77F441A` | direct |
| Task and Test Plan Revision 2 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TP.md` | tasks, approved paths, failure contract, test matrix and execution sequence | direct |
| Revalidated TP Revision 2 approval | deliberate exact `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 2 and revision_id `B5D71F41-86CB-4494-9AF7-C0111F4FB30F` | direct |
| Revalidated TP Revision 3 approval | deliberate exact `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 3 and revision_id `1733A354-49EF-42F1-9D83-E1188299943E` | direct |
| Brownfield Analysis Revision 2 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_ANALYSIS.md` | existing owners, call path, reuse strategy and stop conditions | direct |
| Rejected PRD Revision 3 approval persistence | deliberate exact `Approval: PRD` on 2026-09-01 plus semantic pre-persistence review | approval matched the gate text but was not persisted because AC-02 and the non-goals rejected versions required by Section 3.1 | direct |
| Revalidated PRD Revision 4 approval | deliberate native decision `Approval: PRD` on 2026-09-01 | same run, PRD gate, durable Revision 4 and revision_id `FAE1F128-8DDF-4110-BD9C-B52564133CA5` | direct |
| Solution Design Revision 3 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/SD.md` | exact release catalogue, incoherent-tag rejection, ownership, release continuity and migration design | direct |
| Revalidated SD Revision 3 approval | deliberate native decision `Approval: SD` on 2026-09-01 | same run, SD gate, durable Revision 3 and revision_id `D3AE6C92-6AF1-4DE8-9D0B-6FBFDF3A2957` | direct |
| Task and Test Plan Revision 5 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TP.md` | corrected tasks, approved paths, release matrix, stop conditions and monotonic Brownfield evidence sequence | direct |
| Rejected TP Revision 4 approval persistence | deliberate native decision `Approval: TP` on 2026-09-01 plus pre-persistence evidence review | approval matched the gate text but was not persisted because TP Revision 4 would have overwritten durable Brownfield Analysis Revision 3 | direct |
| Revalidated TP Revision 5 approval | deliberate native decision `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 5 and revision_id `70AA61D1-23F1-496C-9335-178116DAFEF2` | direct |
| Brownfield Analysis Revision 4 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_ANALYSIS.md` | pass; approved owner, call-path, reuse, risk and stop-condition evidence | direct |
| CD+Tests Revision 2 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CD_TESTS.md` | catalogue implementation, deterministic passes, disclosed baseline failures and evidence-plane boundaries | direct |
| Mandatory reviews Revision 2 | Task Plan, Clean Implementation and Code Review artefacts | TP coverage pass, clean structure pass and seven resolved code findings with final independent pass | direct |
| QA Report Revision 2 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/QA_REPORT.md` | pass decision over focused evidence, package projection and disclosed unrelated baselines | direct |
| Revalidated QA Revision 2 approval | deliberate native decision `Approval: QA` on 2026-09-01 | same run, QA gate, durable Revision 2 and revision_id `4CDFB6C4-4DA1-44D0-ADAD-8F4BBB98F50B` | direct |
| UAT Report Revision 2 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UAT_REPORT.md` | deferred by deliberate user decision; no host authority or mutation | direct |

## Missing Evidence

- Separately authorized direct native-Windows upgrade, restart and fresh-session evidence; passing UAT report and exact approval.

## Risks

- A general catalogue could become an open-ended downgrade path if any entry is inferred rather than exact.
- Release automation could silently omit a predecessor and recreate the same upgrade defect.
- Cache recovery could delete unowned or unrelated host state if exact ownership is not proven.
- Shared Codex/Claude marketplace migration could disturb one registration while repairing the other.
- Installer success could be overstated as active loaded skills unless restart and fresh-session states remain separate.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Existing node extensions own provenance, atomic marketplace replacement, Windows retry, Claude refresh and loaded-session separation; closeout must add the explicit historical compatibility and app-restart-versus-fresh-session invariant.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The compatibility and activation boundaries are reusable for future installer upgrades.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; this run's Brownfield Review and later approved delivery artefacts.

## Closeout

- next_allowed_action: Resume UAT only after explicit bounded native-Windows host authorization; do not approve UAT before direct evidence.
- quality_outlook: Move compatibility evidence into the release lifecycle while keeping every accepted version and contract exact.
