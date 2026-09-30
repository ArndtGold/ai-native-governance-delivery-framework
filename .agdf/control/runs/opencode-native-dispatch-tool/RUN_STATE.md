# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-native-dispatch-tool
- lifecycle: active
- revision: 2
- revision_id: a7bd2f8d-e8fe-447c-aa11-06b175802e90
- content_seal: sha256:6f10e2c4fa8038479ffe0f3579eebef5a534970026dfff585497fbe780f28f9f
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-09-30T08:31:16.046Z
- started_at: 2026-09-04
- mode: `undecided`
- current_gate: UR
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Eliminate repeated general shell confirmations for explicitly invoked, read-only AGDF dispatch in
OpenCode through one narrowly permitted native capability without weakening bash, edit, activation,
approval or evidence boundaries.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Recovery reset approvals without independent provenance; the ordinary approval sequence resumes. |
| What is approved? | Nothing yet. |
| What is missing? | Exact Approval: UR. |
| What is the next allowed action? | Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR. |
| What is explicitly forbidden right now? | create later-gate artefacts beyond the current allowed gate; run Brownfield Analysis as implementation preparation; implement code; claim QA or release readiness |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: User accepted the two-run approach on 2026-09-04 after providing direct OpenCode permission-prompt evidence.
- competing_scope_lines: `cross-surface-executable-skill-dispatcher` remains independently at QA and owns the inactive global-skill correction; this run owns only the future active-repository permission experience.
- branch_workspace_evidence: HEAD `1dcc5fc11a0fe354b52856900885a10815069a09`; current dispatcher-run changes and the unrelated untracked image predate this run and are excluded.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: user screenshots; official OpenCode custom-tool and permission documentation; existing OpenCode adapter and dispatcher owners
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: new OpenCode-specific host permission and native-tool capability
- excluded_mutation_targets: current dispatcher run semantics; other hosts; general bash/edit permissions; approvals; unrelated image asset

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UR |
| Allowed now | Review or refine UR Revision 1. |
| Blocked by | Exact UR approval is missing. |
| Missing approval | `Approval: UR` |
| Next step | Review the UR and provide the exact approval, request revision or decline. |
| Quality outlook | Reduce prompt friction without creating a broad shell bypass or second governance owner. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing |  |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/opencode-native-dispatch-tool/UR.md` | draft | Revision 1 defines the need, safety boundary and observable acceptance criteria. |
| Brownfield Review |  | missing | Allowed only after exact UR approval. |
| PRD |  | not_applicable | Not allowed before approved UR, Brownfield Review and Mode/Slice Decision. |
| SD |  | not_applicable | Not allowed. |
| TP |  | not_applicable | Not allowed. |
| QA |  | not_applicable | Not allowed. |
| UAT |  | not_applicable | Not allowed. |

## Mode / Slice Decision

- decision: `undecided`
- required_next_gate: `none`
- scope_reason: Existing custom-tool, permission, installer, activation and runtime owners have not yet been inspected together.
- evidence: `.agdf/control/artefacts/opencode-native-dispatch-tool/UR.md`
- transparency_note: The native custom tool is the leading candidate, not approved architecture.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | approval missing |
| PRD | derived_from | UR | not allowed |
| SD | derived_from | PRD | not allowed |
| TP | derived_from | SD | not allowed |
| QA_REPORT | tests | TP | not allowed |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| OpenCode permission prompt | User screenshots, 2026-09-04 | repeated general shell confirmation and exposed runtime command | direct user-attested |
| Installed OpenCode configuration | `~/.config/opencode/opencode.json` and version 1.18.3 status | current `bash: ask`, skill permission and host generation | direct local inspection |
| OpenCode custom tools | `https://opencode.ai/docs/custom-tools/` | plugin-owned typed tool capability | official external documentation |
| OpenCode permissions | `https://opencode.ai/docs/permissions/` | per-tool `allow`, `ask`, `deny` and pattern behavior | official external documentation |
| Existing AGDF owners | OpenCode adapter, installer consent, dispatcher and interaction contract | reuse candidates and authority boundaries | direct repository inspection |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Exact supported custom-tool API and permission behavior for installed OpenCode | blocks design | Inspect during Brownfield Review after UR approval. |
| Existing owner and consent compatibility | blocks mode decision | Map adapter, installer, contract and Runtime Integrity seams. |
| Loaded-host enabled/manual/inactive/active behavior | blocks QA/UAT | Define later test matrix; do not infer from docs. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Native tool becomes a general shell bypass. | warn | Strict schema, fixed runtime owner, no arbitrary executable/command/path and dedicated permission key. |
| Tool permission is mistaken for AGDF approval. | warn | Preserve exact `Approval: <Gate>` validation and non-authorizing tool result. |
| Installer overwrites user policy. | warn | Additive, consent-bound projection that preserves explicit user settings and provides manual mode. |
| Repository evidence is overstated as host behavior. | warn | Require separate direct loaded-host evidence. |

## Context Graph Impact

- context_graph_impact: `pending`
- context_graph_refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `pending`
- context_graph_required_action: Brownfield Review must determine whether a distinct OpenCode native-tool adapter node is required.
- context_graph_gate_effect: none before UR approval

## Closeout

- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook: Keep the native permission adapter narrower than general shell access and separate from governance approval.
