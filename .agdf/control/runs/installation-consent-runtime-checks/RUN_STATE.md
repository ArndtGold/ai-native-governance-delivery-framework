# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: installation-consent-runtime-checks
- lifecycle: active
- revision: 22
- revision_id: 667840F0-974C-4194-874E-D225839CB82D
- started_at: 2026-08-27
- mode: `structured_delivery`
- current_gate: `QA`
- decision: `revise`
- owner: Arndt Gold

## Objective

Establish an informed, least-privilege and reversible installation-consent boundary for automatic
AGDF runtime checks across Codex, Claude Code and OpenCode on explicitly supported macOS, Linux and
native-Windows combinations without weakening host security or AGDF gate authority.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Every interactive install or update presents a versioned beginner-first automatic, manual or cancel decision. A previous choice is intent, never effective host permission; manual mode stays usable and invalid input recovers visibly. Material consent facts stay visible, technical details open through D, and the result has verified version, one compact state and one next action. |
| What is approved? | UR Revision 2, PRD Revision 2, SD Revision 3 and TP Revision 2 are approved through exact same-run, same-gate and revision-matched approvals; Brownfield Analysis Revision 2 passed. |
| What is missing? | Revised live installer rendering on Codex, Claude Code and OpenCode; Codex trust cycle; native Windows; rendered public candidate; remaining conflict/rollback evidence. |
| What is the next allowed action? | Collect separately authorized direct-host evidence without inferred parity. |
| What is explicitly forbidden right now? | QA pass or approval request, UAT, publication, release and VCS actions. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: User explicitly requested creation of this UR on 2026-08-27 after discussing installation-time consent for automatic AGDF checks across supported hosts, then requested explicit native-Windows coverage in UR Revision 2; durable UR at `.agdf/control/artefacts/installation-consent-runtime-checks/UR.md`.
- competing_scope_lines: `installer-output-parity` and `agdf-cross-host-runtime-integrity` are existing source-of-truth evidence and owner boundaries, not mutation targets for this unapproved scope; other active runs remain independent.
- branch_workspace_evidence: Branch `main` at baseline `753124e20adebb44acf53817823300cf73ea0ac8`; no pre-existing worktree delta was observed before this run was created.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open |
| Current gate | QA |
| Allowed now | Collect separately authorized direct-host evidence and keep evidence planes explicit. |
| Blocked by | TPR-01 direct-host evidence gap |
| Missing approval | none |
| Next step | Observe the revised choice on real Codex, Claude Code and OpenCode hosts, then complete the remaining declared cells. |
| Quality outlook | Preserve transparency at every interactive update without causing repeated native host trust prompts for unchanged capability identity. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` from Arndt Gold on 2026-08-27 for UR Revision 2 |
| PRD | `approved` | Exact `Approval: PRD` from Arndt Gold on 2026-08-27 for PRD Revision 2 |
| SD | `approved` | Exact `Approval: SD` from Arndt Gold on 2026-08-27 for SD Revision 3 |
| TP | `approved` | Exact `Approval: TP` from Arndt Gold on 2026-08-27 for TP Revision 2 |
| QA | `missing` | none |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/installation-consent-runtime-checks/UR.md` | `approved` | Revision 2 approved on 2026-08-27. |
| PRD | `.agdf/control/artefacts/installation-consent-runtime-checks/PRD.md` | `approved` | Revision 2 approved on 2026-08-27. |
| SD | `.agdf/control/artefacts/installation-consent-runtime-checks/SD.md` | `approved` | Revision 3 approved on 2026-08-27. |
| TP | `.agdf/control/artefacts/installation-consent-runtime-checks/TP.md` | `approved` | Revision 2 approved on 2026-08-27. |
| Brownfield Review | `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_REVIEW.md` | `done` | Existing owners, reuse, high UX impact and Structured Delivery routing are evidenced. |
| UX Intent Definition | `.agdf/control/artefacts/installation-consent-runtime-checks/UX_INTENT_DEFINITION.md` | `ready` | Consent, effective state, activation, blockers, recovery and transitions are ready as PRD input. |
| Verified Change |  | `missing` | No mode decision exists. |
| Brownfield Analysis | `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_ANALYSIS.md` | `done` | Revision 2 passed for the bounded interactive-update correction and existing owner reuse. |
| CD+Tests | `.agdf/control/artefacts/installation-consent-runtime-checks/CD_TESTS.md` | `done` | TP Revision 2 behavior plus version identity, truthful previous intent, manual help, invalid-input recovery, D details and compact result implemented; focused, real TTY and final aggregate tests pass. |
| Direct Host Evidence | `.agdf/control/artefacts/installation-consent-runtime-checks/HOST_EVIDENCE_MACOS.md` | `partial` | Real macOS installation on all three, Claude hook success, OpenCode enabled/manual sessions and Codex native review. |
| Task Plan Review | `.agdf/control/artefacts/installation-consent-runtime-checks/TASK_PLAN_REVIEW.md` | `revise` | 15/16 fully done; revised host rendering, IRC-12 and narrowed TPR-01 remain open. |
| Clean Implementation Review | `.agdf/control/artefacts/installation-consent-runtime-checks/CLEAN_IMPLEMENTATION_REVIEW.md` | `pass` | Existing owners reused; no broad fallback or parallel authority. |
| CR | `.agdf/control/artefacts/installation-consent-runtime-checks/CODE_REVIEW.md` | `done` | Code Review pass; QA-UX-01 through QA-UX-05 are resolved. |
| QA | `.agdf/control/artefacts/installation-consent-runtime-checks/QA_REPORT.md` | `revise` | Revision 9 confirms versioned beginner presentation, truthful intent, recovery and compact results and retains only required installed-host evidence gaps. |
| OR |  | `missing` | Not allowed. |

## Mode / Slice Decision

Set this after Brownfield Review. Do not assume the full gate chain before the existing-system impact is understood.
Quick Task execution or implementation is not allowed until this decision is visible with scope reason and evidence.

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `authority_policy_security_depth` is decisive because persistent host permission and trust behavior changes; `release_cross_host_depth` also applies across three hosts and explicitly supported macOS, Linux and native-Windows combinations. Structured Slice is rejected because stale-consent prevention, renewal, revocation and host/OS activation cannot be delivered within one local authority boundary.
- evidence: `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/installation-consent-runtime-checks/UX_INTENT_DEFINITION.md`
- transparency_note: Structured Delivery governs the shared permission, compatibility and rollout contract; it does not authorize implementation or require an undifferentiated large change.

## Artefact Chain

Keep the active work item traceable. A gate may open only when the previous gate has both exact approval and a durable or linked artefact.

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` | exact approval recorded 2026-08-27 for UR Revision 2 |
| PRD | `derived_from` | UR | PRD Revision 2 derives from approved UR Revision 2 and is informed by Brownfield Review and UX Intent Definition |
| Brownfield Review | `sizes` | `structured_delivery` | `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_REVIEW.md` |
| UX Intent Definition | `informs` | PRD | `.agdf/control/artefacts/installation-consent-runtime-checks/UX_INTENT_DEFINITION.md` |
| PRD | `approved_by` | `Approval: PRD` | exact approval recorded 2026-08-27 for PRD Revision 2 |
| SD | `derived_from` | PRD | Revision 3 implements the approved product contract through one fixed entrypoint, thin host adapters and existing public-plugin pipeline |
| SD | `approved_by` | `Approval: SD` | exact approval recorded 2026-08-27 for SD Revision 3 |
| TP | `derived_from` | SD | Revision 2; sixteen bounded tasks with PRD mappings, repository tests and direct-host obligations |
| TP | `approved_by` | `Approval: TP` | exact approval recorded 2026-08-27 for TP Revision 2 |
| Brownfield Analysis | `validates` | TP | pre-implementation analysis passed with existing-owner reuse and honest profile/host boundaries |
| CD_TESTS | `implements` | TP | repository/package implementation and aggregate tests complete; higher evidence planes declared |
| HOST_EVIDENCE_MACOS | `evidences` | TP | direct macOS cells for Codex, Claude Code and OpenCode |
| TASK_PLAN_REVIEW | `checks` | TP | revise; 15/16 fully done and narrowed TPR-01 open |
| CLEAN_IMPLEMENTATION_REVIEW | `checks` | CD_TESTS | pass; existing-owner fit and no parallel authority |
| CODE_REVIEW | `checks` | CD_TESTS | pass; mandatory CR done |
| QA_REPORT | `tests` | TP | Revision 9 revise; versioned beginner presentation, truthful intent, recovery and compact result are clean but open installed-host evidence prevents pass |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| User-reported repeated Claude permission prompts | Conversation on 2026-08-27 | Concrete usability problem and desired installation-time decision | `direct` |
| Existing installer lifecycle owners | `create-agdf/lib/installers/`; `.agdf/control/artefacts/installer-output-parity/` | Installation, update, status, presentation and safe mutation boundaries | `direct` |
| Existing cross-host runtime owners | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/`; `plugin/hooks/`; `create-agdf/lib/runtime/` | Shared validator, session activation, provenance and evidence planes | `direct` |
| Existing interaction authority | `plugin/meta/contracts/interaction.md`; `CG-NATIVE-INTERACTION-AUTHORITY` | Host permission versus AGDF gate approval boundary | `direct` |
| Existing native-Windows installer evidence | `.agdf/control/artefacts/windows-native-install-viability/VERIFIED_CHANGE.md` | Current Windows filesystem, command and capability-probe boundaries without proving the proposed consent flow | `direct` |
| Current official Codex documentation | `https://learn.chatgpt.com/docs/hooks`; `https://learn.chatgpt.com/docs/plugins` | Native plugin-hook trust and host permission behavior | `official host documentation` |
| Current official Claude Code documentation | `https://code.claude.com/docs/en/permissions`; `https://code.claude.com/docs/en/hooks` | Permission rules and plugin hook behavior | `official host documentation` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Verified automatic-mode outcome for each Codex, Claude Code and OpenCode combination on macOS, Linux and native Windows | `warn` | Complete the remaining direct-host matrix without inferred parity. |
| Safe consent persistence and invalidation behavior for each supported host | `warn` | Observe revised install/update choices, renewal and rollback through separately authorized host evidence. |
| Direct fresh-session behavior after enabled, declined, revoked and updated consent | `warn` | Complete the declared host evidence before QA pass; do not infer it from repository tests. |
| Direct native-Windows evidence for installation, consent, status, revocation, update, rollback and fresh session | `warn` | Require native-Windows execution before claiming Windows support; simulation remains supporting evidence only. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Installation consent is mistaken for an AGDF gate approval. | `warn` | Preserve `interaction.md` and `CG-NATIVE-INTERACTION-AUTHORITY` as the sole authority boundary. |
| A broad or stale permission rule survives changed executable content. | `warn` | Brownfield Review and later design must prove least-privilege scope and renewed-consent behavior. |
| The installer silently mutates user or project configuration. | `warn` | Require explicit consent, ownership checks, visible effects and reversible state through existing installer owners. |
| One generic mechanism ignores material host differences. | `warn` | Keep one semantic consent contract with thin host-specific adapters and honest unsupported outcomes. |
| macOS or Linux evidence is generalized into an unsupported Windows claim. | `warn` | Require an explicit host/OS matrix and direct native-Windows evidence for every claimed Windows path. |
| Repository or installation evidence is overstated as effective host behavior. | `warn` | Preserve separate repository, package, installed-host and fresh-session evidence planes. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes now record the non-authoritative receipt, content-bound renewal, explicit-decision preservation, public portable-profile boundary and direct host/OS evidence separation delivered by this run.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: Brownfield Review identifies reusable permission-authority, consent-renewal and explicit-user-decision invariants across future installers and host adapters.
- memory_refs: `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_REVIEW.md`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- delivered: Approved UR Revision 2, PRD Revision 2, SD Revision 3 and TP Revision 2; Brownfield Analysis Revision 2 pass; interactive retained-consent bypass removed; versioned beginner-first terminal consent UX with truthful previous intent, manual help, input recovery, on-demand technical details and compact result; docs and submission evidence updated; final aggregate green; reviews refreshed.
- not_delivered: QA pass, revised direct-host rendering, Codex user trust and enabled cycle, native Windows, rendered public candidate, UAT, VCS, publication and release.
- verification_performed: Source-matched 0.13.7 focused and final aggregate tests; target/installed/update version, truthful previous intent, post-install permission wording, manual help, progress, invalid-input recovery, D details, compact/default and verbose diagnostic regressions; 66/66 skill cases; 313-file package; 43-file public candidate; Runtime Integrity; doctor/gate-check; `git diff --check`.
- unverified: revised real-host interaction, Codex enabled/change/disable cycle, native-Windows cells, rendered listing, induced managed conflict/rollback and online dependency audit.
- next_allowed_action: Collect separately authorized direct-host evidence without inferred parity.
- quality_outlook: Preserve transparency at every interactive update without causing repeated native host trust prompts for unchanged capability identity.
