# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: pre-decision-status-card-visibility
- lifecycle: active
- revision: 12
- revision_id: ed6136d7-da71-477b-b098-20d67d33be14
- mode: structured_delivery
- current_gate: UAT
- decision: in_progress
- owner: agent

## Objective

Ensure every ready-gate approval request is preceded by, or visibly offers, the full canonical
operational Run Status Card, so users decide with complete authority context (path, allowed,
forbidden, blocker, quality outlook) without weakening exactly-once or non-authorizing semantics.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The approved envelope change is implemented in commit `072213c`; canonical source and freshly generated Codex/Copilot surfaces contain the full-card sequence; TP Review, Clean Review, Code Review and QA revision 1 pass on the repository evidence plane; the previously inspected Claude and GitHub Copilot installations still showed older content. |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP` and `Approval: QA` accepted on 2026-09-01; Brownfield Review selected `structured_slice`. |
| What is missing? | Refreshed installed-host and fresh-session UAT evidence for Claude and GitHub Copilot, followed by exact `Approval: UAT`. |
| What is the next allowed action? | Prepare the bounded UAT and, only after explicit host-lifecycle instruction, refresh the intended Claude and GitHub Copilot installations and collect fresh-session evidence. |
| What is explicitly forbidden right now? | Host installation changes without explicit instruction; UAT approval, release and installed-host success claims before fresh-session evidence; commit, push or PR without explicit instruction. |

## Source And Scope State

- normative_instruction_source: approved UR, PRD, SD and TP revision 1; AGDF Runtime Contract
- primary_target: ready-gate approval envelope status-card visibility in canonical and generated repository surfaces
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: commit `072213c`; fresh generated Codex/Copilot profiles; installed Claude and Copilot roots as negative UAT evidence only
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- multi_scope_state: clear
- active_scope_evidence: approved TP PDV-T1..PDV-T8
- competing_scope_lines: systemic version immutability and source-to-loaded-host enforcement require a separate future UR; they are not implemented here
- branch_workspace_evidence: only the regenerated legacy projection and this run's review/control artefacts are tracked changes; two unrelated untracked image assets remain excluded
- branch_workspace_scope_effect: supports

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_REVIEW.md` 2026-09-01; owner inventory, first-visible-line conflict named, compact-path evaluation and Structured Depth Evidence complete. |
| Mode/Slice Decision | structured_slice | Bounded presentation-sequence change across contract, skill text, envelope code and tests with all consumers in-repo; compact paths ineligible (excluded paths, multiple owners, user-visible behavior); no full-depth trigger; primary_reason_code `bounded_structured_slice`. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-09-01 via native gate question for revision 1 after same-run, same-gate, revision and durable-artefact revalidation. A premature `Approval: PRD` given before the artefact existed had been rejected fail-closed. |
| SD | approved | Exact `Approval: SD` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-09-01 after same-run, same-gate, revision `0adecabc-abd8-4ed0-bcfd-1539047c7599` and durable QA artefact revalidation. |
| UAT | open | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/pre-decision-status-card-visibility/UR.md` | approved | Revision 1 approved 2026-09-01; defines pre-decision status-card visibility scope, non-goals and acceptance signals. |
| Brownfield Review | `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_REVIEW.md` | done | 2026-09-01 post_ur_review; Mode/Slice Decision `structured_slice`; PRD must decide always-render vs visible offer and the decision-title placement. |
| PRD | `.agdf/control/artefacts/pre-decision-status-card-visibility/PRD.md` | approved | Revision 1 approved 2026-09-01; decides always-render (offer rejected), fixes sequence compact → full card → transition card → interaction, keeps decision title first and scopes the once-only rule to the snapshot blocks. |
| SD | `.agdf/control/artefacts/pre-decision-status-card-visibility/SD.md` | approved | Revision 1 approved 2026-09-01; full card rendered from `status_presentation` outside the untouched snapshot, envelope as single composition point, diagnostics-based degradation, contract/skill/integrity wording amendments. |
| TP | `.agdf/control/artefacts/pre-decision-status-card-visibility/TP.md` | approved | Revision 1 approved 2026-09-01; eight tasks PDV-T1..PDV-T8 mapped to AC-01..AC-09 with test plan and negative controls. |
| Brownfield Analysis | `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_ANALYSIS.md` | done | 2026-09-01 pre_implementation_analysis pass (PDV-T1): no integrity phrase to swap (add-only), smoke-test envelope count 2→3 disclosed as deviation, envelope unit fixtures need `status_presentation`, shared uncommitted `gate-check.js` regions disclosed. |
| CD+Tests | `.agdf/control/runs/pre-decision-status-card-visibility/RUN_STATE.md` | done | PDV-T2..PDV-T7 implemented in commit `072213c`; two fresh sync runs are hash-identical; all approved regression commands pass after run-state reconciliation. |
| TP Review | `.agdf/control/artefacts/pre-decision-status-card-visibility/TP_REVIEW.md` | done | Pass; 8/8 tasks fully done and installed-host rendering retained for UAT. |
| Clean Review | `.agdf/control/artefacts/pre-decision-status-card-visibility/CLEAN_REVIEW.md` | done | Pass; one existing envelope owner, bounded diagnostic fallback and no parallel renderer. |
| CR | `.agdf/control/artefacts/pre-decision-status-card-visibility/CODE_REVIEW.md` | done | Pass; no meaningful correctness, regression, security or maintainability finding remains. |
| QA | `.agdf/control/artefacts/pre-decision-status-card-visibility/QA_REPORT.md` | pass | Revision 1 repository QA pass approved on 2026-09-01; loaded-host UAT remains open. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approval-time replacement of the full card is contract-mandated | `plugin/skills/gate-check/SKILL.md` §Output; `plugin/meta/contracts/interaction.md` approval sequence | Current designed behavior | direct |
| Full card appeared once in a complete six-gate run; user asked twice why | Session observation 2026-09-01, run `doctor-presentation-identity-parity` | User-visible gap at decision time | direct |
| Compact projection lacks path, forbidden actions, blocker and quality outlook | `APPROVAL_SEQUENCE` blocks in `create-agdf/lib/interaction-presentation.js` vs `renderOperationalStatusCard` fields | Missing decision context | direct |
| Two fresh canonical generations produced stable generated-surface hashes | `sync-package-assets` twice; generated Codex gate-check hash `7f49c129...`; generated Copilot gate-check hash `251e482d...` | PDV-T7 propagation and idempotence | direct |
| Approved regression set passes | interaction, control-state, verified-change, local-marketplace, Copilot profile, routing, version coherence, public plugin, Runtime Integrity and `git diff --check` on 2026-09-01 | Repository implementation and generated-surface integrity | direct |
| Claude and GitHub Copilot did not show the new full card because their loaded/installed content predated the change | user observation plus installed-root inspection on 2026-09-01 | Negative host evidence and UAT boundary | direct |

## Missing Evidence

Fresh installed-host and fresh-session rendering of the synchronized build in Claude and GitHub
Copilot. Existing observations are negative evidence for stale installations and must not be
promoted to a passing UAT claim.

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Reintroducing ceremony the compact design removed | medium | Brownfield Review weighs always-render vs localized offer |
| Sequence validators and envelope tests pin the three-block shape | medium | Scope item 4/5; canonical sync for mirrors |
| Two blocks claiming semantic id `run_status_card` | medium | Naming decision in SD; single semantic owner preserved |
| A host reports the same semantic version while loading older content | high | Preserve as UAT blocker; a future separate scope must add immutable build identity and content-bound refresh. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: Bounded presentation-sequence change (contract wording, skill text, envelope rendering, tests, optional one locale key) with one coherent outcome and all consumers in-repo; compact paths ineligible (excluded paths, multiple owners, user-visible behavior); no evidenced full-depth trigger; primary_reason_code `bounded_structured_slice`; rejected alternatives `verified_change` and `structured_delivery`.
- evidence: `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_REVIEW.md` 2026-09-01 §Structured Depth Evidence; `plugin/meta/contracts/interaction.md:141-158`; `create-agdf/lib/interaction-presentation.js:8,635,670`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| UR | motivated_by | Full status card appeared once in a six-gate run; user asked twice | Session observation 2026-09-01 documented in UR §1 and the Evidence table. |
| UR | scoped_by | Non-Goals section of UR | Excludes gate/approval-value changes, card layout changes, status-only reporting and VCS actions. |
| Brownfield Review | sizes | UR | Owner inventory and Structured Depth Evidence in BROWNFIELD_REVIEW.md 2026-09-01. |
| Brownfield Review | selects_mode | structured_slice | All seven bounded-slice checks pass; compact paths ineligible; no full-depth trigger. |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| PRD | derived_from | UR | PRD revision 1 encodes the UR scope as PDV-01..PDV-06 with AC-01..AC-09 and decides always-render over the rejected offer variant. |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | SD revision 1 resolves PRD §7: plain separator, envelope composition outside the untouched snapshot, contract/skill/integrity amendments together. |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | TP revision 1 maps SD §4 integration points to PDV-T1..PDV-T8 and SD §6 to the executable test plan. |
| QA_REPORT | tests | TP | QA revision 1 consumes 8/8 TP coverage plus Clean Review, Code Review and synchronized regression evidence. |
| QA_REPORT | approved_by | `Approval: QA` | Exact approval provided on 2026-09-01 after same-run, same-gate, revision and durable-artefact revalidation. |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-RUN-STATUS-CARD`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The canonical interaction contract owns the sequence; the existing nodes already own status projection and approval authority.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Repository implementation evidence and stale-host observations remain run-specific until a separately approved systemic delivery-integrity scope establishes a reusable invariant.
- memory_refs: QA Report revision 1; TP Review; installed-host observation 2026-09-01

## Next Step

Prepare refreshed installed-host and fresh-session UAT evidence for Claude and GitHub Copilot.

- next_allowed_action: Prepare the bounded UAT and request explicit instruction before changing either host installation.
- quality_outlook: Repository implementation, generated surfaces, mandatory reviews and QA approval pass; refreshed installed-host rendering remains required before any UAT decision.
