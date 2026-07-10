# AGDF Run State

## Run Meta

- run_id: codex-bootstrap-release-readiness
- started_at: 2026-07-10
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Prevent stale or broken Codex, Claude Code and Copilot bootstrap updates, plus npm release-readiness races for the AGDF bootstrap path.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | `codex plugin add` reuses an existing marketplace snapshot; the observed snapshot remained at plugin `0.4.2` although GitHub `main` and npm packages were `0.4.4`. `claude plugin add` is unsupported by the installed Claude CLI, which exposes `install` and `update`. A second Copilot bootstrap fails at an existing AGDF config file unless `--force` is used. npm briefly resolved `latest` to `0.4.4` before that version was retrievable, causing `ETARGET`. |
| What is approved? | UR, PRD, SD, TP and UAT approved by exact formulas; Brownfield Review selected `structured_slice`; implementation-prep Brownfield Analysis passed; QA passed; OR completed. |
| What is missing? | No delivery-scope evidence is missing. |
| What is the next allowed action? | Offer commit-ready handoff; commit, push, PR, release, tag and publish require separate explicit instruction. |
| What is explicitly forbidden right now? | Commit, push, PR, release, tag and publish without separate explicit user instruction. |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Pass |
| Current gate | OR |
| Allowed now | Delivery closeout handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer commit-ready handoff; wait for explicit commit/push/PR/release instruction |
| Quality outlook | No further technical follow-up required for the approved implementation scope before commit |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-10 |
| PRD | approved | `Approval: PRD` provided in session on 2026-07-10 |
| SD | approved | `Approval: SD` provided in session on 2026-07-10 |
| TP | approved | `Approval: TP` provided in session on 2026-07-10 |
| QA | passed | .agdf/control/artefacts/codex-bootstrap-release-readiness/QA_REPORT.md |
| UAT | approved | `Approval: UAT` provided in session on 2026-07-10 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/codex-bootstrap-release-readiness/UR.md | approved | Surface bootstrap and registry readiness requirement |
| Brownfield Review | .agdf/control/artefacts/codex-bootstrap-release-readiness/BROWNFIELD_REVIEW.md | done | Existing owners identified; structured_slice selected |
| PRD | .agdf/control/artefacts/codex-bootstrap-release-readiness/PRD.md | approved | Cross-surface bootstrap, file ownership and release-readiness requirements |
| SD | .agdf/control/artefacts/codex-bootstrap-release-readiness/SD.md | approved | Adapter, overwrite-policy, test and release-readiness design |
| TP | .agdf/control/artefacts/codex-bootstrap-release-readiness/TP.md | approved | Task/test plan for Codex, Claude Code, Copilot and npm readiness changes |
| Brownfield Analysis | .agdf/control/artefacts/codex-bootstrap-release-readiness/BROWNFIELD_ANALYSIS.md | passed | Existing owners and reuse path reconfirmed before implementation |
| CD+Tests | .agdf/control/artefacts/codex-bootstrap-release-readiness/IMPLEMENTATION_EVIDENCE.md | completed | T01-T10 implemented and required validation passed |
| Reviews | .agdf/control/artefacts/codex-bootstrap-release-readiness/REVIEWS.md | passed | TP review, clean implementation review and code review completed |
| QA | .agdf/control/artefacts/codex-bootstrap-release-readiness/QA_REPORT.md | passed | QA gate passed with release-time evidence caveat |
| OR | .agdf/control/artefacts/codex-bootstrap-release-readiness/OR.md | completed | Final orchestration report completed after UAT approval |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: The change defines cross-surface update semantics, user-file ownership and release completion behavior across external CLIs.
- evidence: Brownfield Review identified existing adapter, generator, release workflow and smoke-test owners.
- transparency_note: PRD and SD are required; implementation remains forbidden pending their approval chain.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session on 2026-07-10 |
| Brownfield Review | sizes | UR | Review selected structured_slice and identified existing owners |
| PRD | derived_from | UR | PRD specifies the approved structured slice |
| PRD | approved_by | Approval: PRD | Exact approval captured in session on 2026-07-10 |
| SD | derived_from | PRD | Draft defines the bounded implementation design |
| SD | approved_by | Approval: SD | Exact approval captured in session on 2026-07-10 |
| TP | derived_from | SD | TP defines task IDs, test IDs and required validation for the approved design |
| TP | approved_by | Approval: TP | Exact approval captured in session on 2026-07-10 |
| Brownfield Analysis | prepares | TP | Pre-implementation analysis passed and selected existing owners |
| CD+Tests | implements | TP | T01-T10 implementation evidence and validation recorded |
| Reviews | verifies | CD+Tests | TP review, clean implementation review and code review passed |
| QA_REPORT | tests | TP | QA passed with focused validation and review evidence |
| UAT | approves | QA_REPORT | Exact `Approval: UAT` captured in session on 2026-07-10 |
| OR | closes | Structured Slice | OR records delivered work, evidence, risks and next permissible step |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Marketplace snapshot | Local marketplace was at commit `c48addd` / plugin `0.4.2`; GitHub `main` was `8f2e928` / plugin `0.4.4` | Existing `codex plugin add` did not refresh marketplace state | direct |
| Claude CLI commands | Local `claude plugin --help` exposes `install` and `update`; `claude plugin add --help` returns the command index instead of an add command | Existing Claude bootstrap uses an unsupported command spelling | direct |
| Copilot rerun | A second `create-agdf copilot` invocation exited 1 with `Refusing to overwrite existing file: .agdf/control/config.json` | No non-destructive Copilot upgrade path exists | direct |
| npm install failure | npm log recorded `ETARGET` for `@agdf/cli@0.4.4` after `latest` selected that version | Registry readiness was not externally verified before first use | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Codex CLI behavior or output changes | medium | Isolate command invocation and test the sequence with a stubbed executable |
| npm propagation exceeds expected interval | medium | Use bounded polling with explicit timeout and package/version diagnostics |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Brownfield Review identified the existing cross-surface delivery reliability line.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-plugin.definition.json`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: approved UR, PRD and SD plus Brownfield Review for `codex-bootstrap-release-readiness`
- competing_scope_lines: none
- branch_workspace_evidence: no implementation changes for this scope
- branch_workspace_scope_effect: neutral

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: This is reusable cross-surface bootstrap and release-readiness knowledge.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH; .agdf/control/artefacts/codex-bootstrap-release-readiness/

## Closeout

- delivered: Approved UR, PRD, SD, TP and UAT; Brownfield Review; Brownfield Analysis; implementation; validation; reviews; QA pass; OR closeout.
- not_delivered: commit, push, PR, release, tag and publish.
- verification_performed: `npm --prefix create-agdf run smoke-test`; `npm --prefix agdf run smoke-test`; `node plugin/scripts/check-runtime-integrity.mjs`; `npx --yes @agdf/cli@latest doctor --json`; `git diff --check`.
- unverified: live GitHub Actions publish execution of the new npm readiness step.
- next_allowed_action: Offer commit-ready handoff; wait for explicit commit/push/PR/release instruction.
- quality_outlook: No further technical follow-up required for the approved implementation scope before commit.
