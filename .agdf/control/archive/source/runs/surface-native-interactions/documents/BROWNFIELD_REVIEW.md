# Brownfield Review: Surface-Native Interactions

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `surface-native-interactions`
- related_ur: `.agdf/control/artefacts/surface-native-interactions/UR.md`
- current_gate: `Brownfield Review`
- reviewer: agent
- reviewed_at: 2026-07-14

## Review Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- reuse_strategy: `extend`

## Objective

Size and route the approved requirement for native AGDF clarifications, technical-permission decisions and gate approvals across Codex, Claude Code and OpenCode without introducing a second approval authority or custom host UI.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product and gate semantics | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md` | Exact approvals, gate transitions, allowed/forbidden actions and fail-closed behavior are already canonical | high |
| Skill routing | `plugin/meta/agdf-agent-router.md`; `plugin/meta/agdf-plugin.definition.json` | One canonical skill set is mapped into Codex, Claude Code, Copilot and OpenCode naming conventions | medium |
| Durable approval state | `create-agdf/lib/control-state/**`; `create-agdf/bin/create-agdf.js` | Selected-run parsing, artefact presence and exact approval validation already exist | high |
| Codex surface | Codex plugin skills and `plugin/hooks/session-start.sh` | Plugin instructions and skills are available; native user-input and tool-permission UI is host-owned | medium |
| Claude Code surface | Shared plugin root, skills and SessionStart hook | Claude Code provides native `AskUserQuestion`, permission prompts and hook decision controls; AGDF currently has no canonical mapping for them | medium |
| OpenCode surface | `create-agdf/opencode-plugin.js`; generated `.opencode/AGDF.md`, skills and `opencode.json` | OpenCode already exposes native `question` and permission controls; AGDF config owns explicit edit/bash/skill rules but no interaction mapping | medium |
| Package propagation | `create-agdf/scripts/sync-package-assets.js` | Canonical router, skills, Runtime Contract and OpenCode configuration are generated into target surfaces | high |
| Tests and integrity | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/smoke-test.js`; control-state tests | Existing checks cover canonical/generated drift, package shape and gate-state semantics | high |
| UI / UX ownership | Codex, Claude Code and OpenCode hosts | AGDF does not own native widgets and must not emulate or replace them | low |
| Persistence / migrations | Repository `.agdf/control/` | No new datastore or migration is needed; existing run state remains authoritative | low |
| Release / operations | Existing plugin/package release flow | Any canonical skill/runtime change propagates into packaged surfaces and requires package regression evidence | medium |

## Current Coverage

- `fully_done`: exact approval syntax, durable artefact requirement, selected-run gate validation, fail-closed gate transitions, canonical-to-generated skill propagation and native host permission systems.
- `partially_done`: skills can already ask users for exact approval in text, and hosts can already show native questions, but AGDF does not define when or how those native controls represent clarification versus technical permission versus gate approval.
- `not_done`: canonical interaction contract, per-surface mappings, timeout/auto-approve boundaries, deterministic fallback rules and regression assertions for those mappings.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Runtime Contract already owns gate semantics | `plugin/meta/agdf-runtime-contract.md` | block | Extend this owner; do not create a second interaction-policy document or gate model. |
| Gate-check already owns approval prompting and next-action decisions | `plugin/skills/gate-check/SKILL.md` | block | Add native-interaction selection guidance here and reuse it across generated skills. |
| Host permission dialogs are not AGDF approvals | Native surface contracts and current AGDF exact-approval rule | block | Define a canonical semantic boundary and require explicit gate-specific user intent before persistence. |
| Package sync already maps canonical skills to each surface | `create-agdf/scripts/sync-package-assets.js` | warn | Extend the existing transformations and assertions instead of maintaining hand-edited surface copies. |
| OpenCode plugin is a runtime/discoverability hook, not a policy owner | `create-agdf/opencode-plugin.js` | warn | Keep policy in canonical instructions/skills; add executable plugin behavior only if PRD/SD evidence proves it necessary. |
| Native UI schemas are host-owned and may change | Codex, Claude Code and OpenCode runtime APIs | warn | Keep adapter descriptions capability-based and fail to concise text when a control is unavailable. |

## Impact Assessment

- files/modules: Runtime Contract, gate-check skill, router and/or canonical plugin definition, generated surface assets, integrity checks, package smoke tests and user documentation.
- interfaces: agent-facing interaction contract and surface mapping; no new public AGDF CLI command is required by the current evidence.
- data model/migrations: no new persistence model; existing selected run and artefact chain remain authoritative.
- backwards compatibility: textual approval remains the universal fallback; native controls are an enhancement and must not invalidate existing workflows.
- regression tests: exact-approval behavior, wrong-run/wrong-gate rejection, no timeout or auto-approve gate advancement, generated-surface mapping and fallback behavior.
- side effects: native prompts can reduce ambiguity and ceremony, but excessive prompting can create approval fatigue; only decision-relevant points should use them.

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: The work changes user-visible and security-relevant approval semantics across three runtime surfaces, but it can reuse the existing Runtime Contract, gate-check skill, selected-run validator and generated-surface pipeline. No custom UI, new datastore, new gate order or standalone service is needed.
- evidence: canonical owners and reuse paths listed in this review; approved UR `.agdf/control/artefacts/surface-native-interactions/UR.md`
- transparency_note: A focused PRD is required to define observable behavior and boundaries. SD depth is likely needed for the canonical interaction shape and adapter ownership, but must remain limited to existing owners. Implementation is not yet allowed.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which AGDF decisions should invoke native controls, and which remain plain text to avoid prompt fatigue? | PRD | revise |
| What exact observable event constitutes deliberate gate-specific user intent on each surface? | PRD | block |
| Should the canonical interaction contract be normative prose, machine-readable metadata, or both? | SD | revise |
| Can Codex and Claude Code use one instruction-driven mapping, or do their hook/tool differences require separate adapter metadata? | SD | revise |
| Does OpenCode need an explicit `question` permission/config entry, or is skill guidance sufficient and safer? | SD | revise |
| What deterministic evidence proves that timeouts, auto-approve and session-wide tool permissions cannot advance a gate? | TP | block |

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: none yet
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The separation of host permission, clarification and durable AGDF gate authority is a reusable cross-surface invariant. Create the node only during an approved later artefact or closeout step; Brownfield Review does not create it automatically.

## Next Permissible Step

- next_allowed_action: Draft a focused PRD for the structured slice and request `Approval: PRD` after the artefact is persisted.
- forbidden_until_then: SD, TP, implementation, QA and release.

## Quality Outlook

- quality_outlook: Preserve one canonical interaction contract and prove each surface mapping without coupling AGDF to host-owned UI internals.

