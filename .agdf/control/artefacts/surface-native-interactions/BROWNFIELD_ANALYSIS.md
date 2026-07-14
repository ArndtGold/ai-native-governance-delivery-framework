# Brownfield Analysis: Surface-Native AGDF Interactions

## Analysis Meta

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/surface-native-interactions/BROWNFIELD_ANALYSIS.md`
- related_tp: `.agdf/control/artefacts/surface-native-interactions/TP.md`
- reviewed_at: 2026-07-14

## Scope

Verify the implementation path for TP tasks SNI-01 through SNI-15 against the current canonical runtime, generated surfaces, OpenCode configuration behavior, regression harness and repository control state. This analysis does not change product/runtime code.

## Worktree And Scope Evidence

- The worktree contains only this run's modified `.agdf/control/MASTER_BACKLOG.md` and untracked artefact/run directories.
- No canonical runtime, skill, plugin-definition, generator, CLI, test, documentation or Context Graph implementation path is currently dirty.
- The selected run, approved UR/PRD/SD/TP and active backlog row all identify the same cross-surface interaction scope.
- No observed implementation overlap exists with another active work line.
- multi_scope_state: `clear`

## Existing Owners And Reuse Path

| Area | Verified owner | Current coverage | Reuse decision | Implementation boundary |
|---|---|---|---|---|
| Normative gate and approval semantics | `plugin/meta/agdf-runtime-contract.md` | `partially_done` | `extend` | Add one Native Interaction Contract; do not add a second gate table, approval type or persisted interaction record. |
| Gate readiness and interaction selection | `plugin/skills/gate-check/SKILL.md` | `partially_done` | `extend` | Add trigger, readiness, native/fallback and revalidation rules to the existing workflow only. |
| Surface capability metadata | `plugin/meta/agdf-plugin.definition.json` | `partially_done` | `extend` | Add capability/adapter metadata without duplicating normative gate semantics. |
| Codex and Claude plugin surfaces | canonical `plugin/**` plus recursive plugin/package propagation | `partially_done` | `reuse_and_extend` | Canonical skill and contract changes flow through the existing plugin ownership; no new hook, MCP server or surface-specific policy file. |
| OpenCode repository generation | `create-agdf/scripts/sync-package-assets.js` | `partially_done` | `extend` | Generate `question` capability/permission guidance from canonical metadata alongside existing edit, bash and skill settings. |
| OpenCode global configuration merge | `installOpenCodeGlobalPlugin` in `create-agdf/bin/create-agdf.js` | `partially_done` | `extend` | Add only a missing `permission.question` decision; preserve any explicit user value and the existing conservative object/type checks. |
| Existing OpenCode repository config protection | `generatedFilesForTarget` and `opencode.agdf.json` behavior in `create-agdf/bin/create-agdf.js` | `fully_done` | `preserve` | Existing `opencode.json` remains untouched without `--force`; generated fragment/docs must not instruct users to replace an explicit deny. No automatic repository-config merge is introduced. |
| Runtime drift enforcement | `plugin/scripts/check-runtime-integrity.mjs` | `partially_done` | `extend` | Add focused canonical anchors and metadata assertions; do not create a second validator. |
| Package and config regression harness | `create-agdf/scripts/smoke-test.js` | `partially_done` | `extend` | Reuse temporary config/repository fixtures and fake npm isolation for absent/allow/deny cases. |
| Gate-state regression harness | `create-agdf/scripts/control-state-test.js` plus existing CLI evaluators | `partially_done` | `extend_if_needed` | Characterize existing wrong-run, wrong-gate, missing-artefact and exact-approval behavior first; add only missing deterministic cases. Native UI remains an input adapter, not a CLI state machine. |
| Routing validation | `create-agdf/scripts/test-routing.js` | `fully_done` as mechanism | `reuse` | Confirm generated gate-check discoverability after synchronization; no new test runner. |
| Public setup/capability wording | `INSTALL.md` and canonical Pages capability data/copy | `partially_done` | `update_if_affected` | Describe native presentation and fallback only where current public claims would otherwise drift. |
| Reusable approval-authority knowledge | `.agdf/control/CONTEXT_GRAPH.md` | `not_done` for this invariant | `new_node` | Create one durable invariant during implementation; do not record host versions or duplicate schemas. |

## Current Coverage Summary

- `fully_done`: exact approval vocabulary, durable per-run authority, fail-closed gate evaluation, canonical-to-generated asset synchronization, native-skill routing, OpenCode non-destructive existing-config behavior and isolated smoke fixtures.
- `partially_done`: surface capability metadata, gate-check presentation guidance, OpenCode permission map/merge behavior, integrity anchors, public capability wording and deterministic rejection coverage.
- `not_done`: the canonical interaction envelope, explicit Codex/Claude/OpenCode adapter rules, `permission.question` ownership, cross-surface interaction drift assertions and the reusable Context Graph invariant.

## Clean Implementation Path

1. Add the normative interaction semantics and adapter-selection rules to the Runtime Contract and gate-check skill.
2. Add provider-neutral surface capability metadata to the canonical plugin definition.
3. Extend OpenCode generation and the existing global merge path while preserving repository fragment behavior and explicit user decisions.
4. Extend integrity assertions before regenerating, so drift is visible at the canonical boundary.
5. Regenerate all package surfaces through `sync-package-assets.js`; never patch generated mirrors independently.
6. Extend existing control-state and smoke fixtures for missing/allow/deny config and fail-closed gate inputs.
7. Update only documentation/capability claims proven affected by the implementation.
8. Add the approved Context Graph invariant, then run deterministic checks before bounded supporting live probes.

This is an `extend` strategy. No replacement, custom interaction service, parallel policy owner or new public command is justified.

## Compatibility And Regression Impact

- Public AGDF commands and exact textual approvals remain unchanged.
- The interaction envelope is semantic and is not added to run-state persistence, so no data migration or schema version change is required.
- Codex and Claude behavior remains instruction-driven; host permission/plan controls retain their own authority and cannot advance AGDF gates.
- OpenCode fresh/generated configuration gains `question: allow`; global installation gains a missing-only merge; explicit user allow/deny remains authoritative.
- Existing repository `opencode.json` protection remains binding. `opencode.agdf.json` is still a reviewable fragment rather than an automatic merge path.
- Generated Codex, Copilot/fallback and OpenCode assets must remain source-derived; a second sync run must be idempotent.
- Tests must avoid touching real user configuration, authenticated sessions or durable gate state outside disposable fixtures.

## Risks And Required Guards

| Risk | Required guard |
|---|---|
| Native UI response is mistaken for durable approval | Re-run canonical gate validation for the same run and expected gate immediately before persistence. |
| Host timeout/default or hook output carries authority | Normative prohibition plus deterministic contract assertions and textual fallback when safety is unknown. |
| Technical permission or plan approval advances AGDF | Block-level invariant in contract, gate-check guidance and regression assertions. |
| OpenCode user preference is overwritten | Missing-only merge, explicit allow/deny fixtures and unchanged existing-repository config protection. |
| Surface-specific instructions become parallel policy | Keep semantics in Runtime Contract/gate-check and metadata descriptive; integrity checks reject drift. |
| Generated mirrors diverge | Source-first changes, idempotent sync and runtime-integrity/package smoke checks. |
| Live probe availability is mistaken for release evidence | Label probes supporting only; deterministic tests remain release-critical. |
| Prompt fatigue | Negative trigger rules for routine inspection, status and non-ready gates. |

## Test Impact

- Extend `create-agdf/scripts/control-state-test.js` only for rejection/compatibility cases not already characterized.
- Extend `create-agdf/scripts/smoke-test.js` for canonical/generated surface content and OpenCode config behavior; reuse its temporary directory and fake npm patterns.
- Extend `plugin/scripts/check-runtime-integrity.mjs` for exact canonical invariants and metadata shape.
- Reuse `create-agdf/scripts/test-routing.js`; do not add a parallel routing harness.
- Run the TP commands with the repository's actual script names: sync, runtime integrity, `test:control-state`, `test:routing`, aggregate `smoke-test`, focused config fixtures and `git diff --check`.

## Parallel-Structure And SoT Check

- parallel_structure_risk: `controlled`
- Normative policy remains in `plugin/meta/agdf-runtime-contract.md`.
- Gate interaction workflow remains in `plugin/skills/gate-check/SKILL.md`.
- Surface metadata remains descriptive and generated adapters remain derived.
- Existing control-state evaluation and persistence remain the sole executable gate authority.
- Stop and return to SD if implementation requires a second approval evaluator, persisted interaction store, custom host UI, hook-based gate interception or automatic overwrite of user-owned configuration.

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: none yet
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Approved PRD/SD establish a reusable cross-surface authority invariant; TP SNI-12 owns creation before QA/closeout.

## Missing Evidence

- No blocking implementation evidence is missing.
- Exact host schemas and authenticated UI behavior may drift; bounded live probes remain supporting evidence under SNI-14 and cannot replace deterministic contract and generation checks.
- Existing control-state tests must be characterized before adding cases so implementation does not duplicate already-covered behavior.

## Decision

- decision: `pass`
- current_coverage: `partially_done`
- reuse_strategy: `extend`
- required_next_step: Begin CD+Tests with SNI-01, preserving the current worktree boundary and implementing SNI-01 through SNI-15 through existing owners only.
- forbidden: parallel interaction policy, custom approval persistence, automatic user-config overwrite, QA/release claims, commit, push or PR.
