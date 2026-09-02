# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: legacy-profile-upgrade-recovery
- lifecycle: active
- revision: 41
- revision_id: 10B14394-2D95-49D0-9A8B-41939DF1081C
- started_at: 2026-09-01
- mode: `structured_delivery`
- current_gate: `QA`
- decision: `revise`
- owner: Arndt Gold

## Objective

Make upgrades from explicitly supported historical AGDF profile contracts safe and automatic while
preserving fail-closed provenance and bounded Windows cache recovery.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | One immutable snapshot now binds normalized source identity, Codex local version, staged bytes and provenance inside the existing marketplace owner. Focused installer, marketplace, lifecycle, release and source Runtime Integrity evidence passes. |
| What is approved? | UR, PRD Revision 4, SD Revision 5 and TP Revision 9 are approved. |
| What is missing? | Complete green create-agdf smoke and affected remote GitHub Actions evidence under TPR-5-01. |
| What is the next allowed action? | Reconcile the separately owned runtime-packaging aggregate baseline, then rerun complete smoke and remote CI evidence. |
| What is explicitly forbidden right now? | QA approval request while TPR-5-01 is open, UAT approval, real host/cache mutation, publication, release and automatic VCS actions. |

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
| Status | QA revise |
| Current gate | QA |
| Allowed now | Repair the separately owned aggregate baseline and refresh evidence. |
| Blocked by | TPR-5-01: complete smoke and remote CI evidence are open. |
| Missing approval | none at this gate |
| Next step | Reconcile runtime packaging, rerun complete smoke and then rerun the affected GitHub Actions workflow. |
| Quality outlook | Remove duplicate digest ownership while retaining exact source-bound local provenance. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted on 2026-09-01 after same-run, same-gate and revision revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for durable Revision 4 after same-run, same-gate and revision revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for durable Revision 5 on 2026-09-02 after same-run, SD-gate and revision_id `0BF255D2-4F89-4C2C-B179-88A13E4A32E0` revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for durable Revision 9 on 2026-09-02 after same-run, TP-gate and revision_id `2B83E2C1-3523-4D19-AD03-C1DD27F42B67` revalidation. |
| QA | `open` | Revision 5 decides `revise`; no approval may be requested while TPR-5-01 is open. |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UR.md` | `approved` | Safe historical-profile upgrade and bounded Windows cache recovery need; exact approval recorded. |
| Brownfield Review | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_REVIEW.md` | `done` | Existing owners inspected; Structured Delivery selected with complete depth evidence. |
| UX Intent Definition | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UX_INTENT_DEFINITION.md` | `ready` | High UI/UX impact; app restart and fresh-session activation states are defined as PRD input. |
| Verified Change |  | `not_applicable` | Public compatibility, migration, runtime recovery and cross-host activation impacts prohibit the compact path. |
| PRD | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/PRD.md` | `approved` | Revision 4 makes acceptance criteria, non-goals and evidence consistent with the exact tag-evidenced support set and fail-closed `agdf-v0.14.0` mismatch handling. |
| SD | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/SD.md` | `approved` | Revision 5 adds one immutable local-build snapshot and single source-identity owner while preserving strict Codex provenance and existing public contracts; exact approval recorded. |
| TP | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TP.md` | `approved` | Revision 9 maps the snapshot owner, unstable-source failure, approved paths and deterministic regression matrix; exact approval recorded. |
| Brownfield Analysis | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_ANALYSIS.md` | `done` | Revision 8 passes the existing owner, reuse, cleanup, compatibility and host-sequencing fit for TP Revision 9. |
| CD+Tests | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CD_TESTS.md` | `done` | Revision 6 records the immutable snapshot implementation, focused passes and the unchanged aggregate runtime-packaging failure. |
| Task Plan Review | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/TASK_PLAN_REVIEW.md` | `done` | Revision 5 is revise: 15/16 fully done; CAT-T12 remains partial because aggregate and remote evidence are open. |
| Clean Implementation Review | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CLEAN_IMPLEMENTATION_REVIEW.md` | `done` | Revision 5 passes the single snapshot owner, no-fallback and Brownfield-fit solution. |
| CR | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/CODE_REVIEW.md` | `done` | Revision 5 passes with no open correctness, error-path, security, compatibility or maintainability finding. |
| QA | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/QA_REPORT.md` | `revise` | Revision 5 retains open normalized evidence finding TPR-5-01. |
| UAT | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UAT_REPORT.md` | `pending` | Revision 2 records deliberate deferral and preserves required direct native-Windows and fresh-session evidence. |
| OR |  | `missing` | Not allowed. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `TP`
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
| SD Revision 5 | `derived_from` | PRD | preserves approved behavior while closing the observed mutable-source identity race through one immutable snapshot owner |
| SD Revision 5 | `approved_by` | `Approval: SD` | exact approval accepted on 2026-09-02 after same-run, SD-gate and revision_id `0BF255D2-4F89-4C2C-B179-88A13E4A32E0` revalidation |
| TP Revision 9 | `derived_from` | SD Revision 5 | maps the approved snapshot owner and fail-closed unstable-source behavior to bounded tasks, paths and tests |
| TP Revision 9 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-09-02 after same-run, TP-gate and revision_id `2B83E2C1-3523-4D19-AD03-C1DD27F42B67` revalidation |
| TP Revision 8 | `approved_by` | `Approval: TP` | historical approval accepted on 2026-09-01; it does not authorize Revision 9 implementation |
| SD | `derived_from` | PRD | approved Revision 5 preserves PRD Revision 4 behavior and adds one immutable local-build snapshot owner |
| SD | `approved_by` | `Approval: SD` | canonical current relationship for approved Revision 5 |
| TP | `derived_from` | SD | approved Revision 9 maps SD Revision 5 to CAT-T13 through CAT-T16 and deterministic snapshot evidence |
| TP | `approved_by` | `Approval: TP` | canonical current relationship for approved Revision 9 |
| Brownfield Analysis Revision 8 | `derived_from` | TP Revision 9 | pass; existing marketplace transaction and normalized digest owners can host one bounded immutable snapshot without public contract drift |
| CD+Tests | `implements` | TP | Revision 6 implements TP Revision 9, passes the focused snapshot and regression evidence and retains the aggregate/remote obligation |
| QA_REPORT | `tests` | TP | Revision 5 decides revise for TP Revision 9 after mandatory reviews Revision 5 because TPR-5-01 remains open |

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
| GitHub Actions release preparation failure | `test:release-version-coherence` on 2026-09-01 | default shallow checkout lacks `agdf-v0.13.6`; real-tag CI requirement is not fulfilled | direct |
| Revalidated TP Revision 6 approval | deliberate exact `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 6 and revision_id `C38FA15E-4D0E-4925-9296-E4796AE6F989` | direct |
| Brownfield Analysis Revision 5 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/BROWNFIELD_ANALYSIS.md` | existing checkout owner, bounded three-workflow scope and no-fallback solution | direct |
| CD+Tests Revision 4 and reviews Revision 3 | run artefacts | checkout correction, static/YAML/tag evidence, clean pass, code review pass and TP Review revise | direct |
| Current 0.14.4 release preparation failure | local `release:prepare` on commit `2cc30a6` | exact current catalogue snapshot missing independently of the checkout correction | direct |
| Revalidated SD Revision 4 approval | deliberate exact `Approval: SD` on 2026-09-01 | same run, SD gate, durable Revision 4 and revision_id `633F7F8A-4CAC-4B03-B986-923F3C3149C9` | direct |
| Revalidated TP Revision 7 approval | deliberate exact `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 7 and revision_id `71EC4F47-0C01-4935-B6CC-9A4644239088` | direct |
| Revalidated TP Revision 8 approval | deliberate exact `Approval: TP` on 2026-09-01 | same run, TP gate, durable Revision 8 and revision_id `69DB7F6C-3D85-4270-B8C5-610CDAFF26EE` | direct |
| Brownfield Analysis Revision 7 | run artefact | single existing owner, descriptor reuse, recoverable transaction and exact tag boundary | direct |
| Real 0.14.4 reconciliation | `npm run set-version -- 0.14.4` | both packages unpublished; exact current catalogue record added without version advance | direct |
| Focused implementation evidence | release preparation, transaction/history/coherence/package/runtime tests | automatic bump correctness, rollback, recovery and current-versus-historical tag behavior | direct |
| Mandatory reviews Revision 4 | Task Plan, Clean Implementation and Code Review artefacts | 11/12 TP coverage, clean pass, code pass and open evidence gap TPR-4-01 | direct |
| QA Report Revision 4 | `.agdf/control/artefacts/legacy-profile-upgrade-recovery/QA_REPORT.md` | revise because aggregate and remote evidence remain open | direct |
| Local identity race diagnosis | `create-agdf/scripts/install-local-plugin.js`; `create-agdf/lib/installers/local-marketplace.js`; prior aggregate failure; focused isolated-cache pass on 2026-09-02 | caller and marketplace recompute one identity from a mutable source, while the version syntax itself remains valid | direct |
| Immutable local snapshot evidence | `test:local-development-install`, `test:local-marketplace`, `test:lifecycle`, release preparation and source Runtime Integrity on 2026-09-02 | one descriptor, exact per-surface identities, injected instability, cleanup retry, zero host call and unchanged transaction regressions | direct |
| Aggregate runtime layout failure | isolated-cache `create-agdf smoke-test` on 2026-09-02 | first unchanged aggregate blocker after all affected installer, marketplace, package, lifecycle and control tests passed | direct |

## Missing Evidence

- Green complete create-agdf smoke after separately owned aggregate repair and affected remote GitHub Actions evidence;
- Green complete create-agdf smoke after separately owned baseline repairs, remote GitHub Actions
  evidence and repeated QA;
  later, separately authorized direct native-Windows upgrade, restart and fresh-session evidence.

## Risks

- A general catalogue could become an open-ended downgrade path if any entry is inferred rather than exact.
- Release automation could silently omit a predecessor and recreate the same upgrade defect.
- Cache recovery could delete unowned or unrelated host state if exact ownership is not proven.
- Shared Codex/Claude marketplace migration could disturb one registration while repairing the other.
- Installer success could be overstated as active loaded skills unless restart and fresh-session states remain separate.
- A shallow CI checkout can make required tag and default-branch continuity evidence unavailable even when the canonical repository contains it.
- A mutable generated plugin root can change between duplicate digest calculations and produce a misleading invalid-version failure unless installation binds identity and staging to one immutable snapshot.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: `CG-CREATE-AGDF-CLI-COMPOSITION` records complete CI history, the stable root command, one transactional version/catalogue owner and current-pre-tag versus historical-tag evidence.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The compatibility and activation boundaries are reusable for future installer upgrades.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; this run's Brownfield Review and later approved delivery artefacts.

## Closeout

- next_allowed_action: Reconcile the separately owned runtime-packaging baseline, rerun complete smoke and then obtain affected remote GitHub Actions evidence.
- quality_outlook: Remove duplicate digest ownership while retaining strict source-bound local provenance and the existing marketplace transaction authority.
