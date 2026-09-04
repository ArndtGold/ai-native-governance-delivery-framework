# Brownfield Review: Cross-surface Executable Skill Dispatcher

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_REVIEW.md`

## Scope

Add one executable common entry for direct canonical AGDF skill invocation, reuse existing target,
gate, locale and presentation owners, project the runtime through all supported distribution
profiles, and keep host-specific code limited to binding and transport.

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The change spans direct skill capabilities and four host surfaces and changes
  first-visible state, timing, terminal stop, recovery and effective execution ownership.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
  (`.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UX_INTENT_DEFINITION.md`)

## Existing-System View

| Area | Existing owner or artefact | Coverage | Reuse strategy |
|---|---|---|---|
| Target authority | `plugin/meta/contracts/task-target-resolution.md`; `target-check` handler | fully_done | extend through dispatcher input and output |
| Gate authority | `gate-transition.md`; `control-evaluation/gate-check.js` | fully_done | call unchanged evaluator |
| Presentation | `interaction.md`; `interaction-presentation.js`; locale registry | fully_done | return existing rendered payload verbatim |
| Surface-local executable | `runtime/agdf-local.js`; `local-validator.js`; `validator-application.js` | partially_done | extend one version-matched CLI/runtime owner |
| Command schema | parser, command registry and validation handlers | partially_done | add one bounded command and typed input/output contract |
| Skill entrypoints | canonical `plugin/skills/*/SKILL.md` plus generated projections | partially_done | shorten to one dispatcher-first boundary while retaining skill-specific judgement |
| Copilot profile | `plugin.json`, `copilot-skills/`, hook and packaged runtime | partially_done | bind through installed runtime; host has no native AGDF question adapter |
| Codex and Claude profiles | canonical plugin manifests, skills, hooks and packaged runtime | partially_done | reuse common runtime and existing host discovery |
| OpenCode profile | config-local validator, global skills and plugin guidance | partially_done | bind to config-local runtime without repository-local duplication |
| Generation and packaging | `sync-package-assets.js`; `sync-plugin-runtime.js`; profile and package tests | fully_done | extend canonical generation and inventories |
| Behavioral evidence | task-target, interaction, skill-eval, runtime-integrity and host tests | partially_done | extend with dispatcher, timing and terminality cases |

## Reuse And Parallel-Structure Assessment

- Canonical owner: extend the existing surface-local validator/runtime composition; do not add an
  independent workflow engine.
- Target resolution: call the existing `target-check` implementation and validate its normalized
  result. Never infer target authority in the dispatcher.
- Gate and QA decisions: dispatch to existing command/evaluator or skill-specific bounded context;
  never copy gate tables or QA policy.
- Presentation: return existing `task_target_orientation`, `status_presentation` and
  `approval_presentation` payloads without another Markdown renderer.
- Cross-surface projection: edit canonical sources and regenerate. Direct edits to generated host
  payloads are prohibited.
- Parallel-structure risk: `block` if the dispatcher accumulates a second target resolver, gate
  engine, approval store, locale registry, persistent run state or per-host semantic forks.

## Host Capability Boundary

| Surface | Existing executable binding evidence | Brownfield constraint |
|---|---|---|
| Copilot | Skills plus packaged runtime and SessionStart hook; no native AGDF decision adapter | Prove whether a skill can deterministically issue the first runtime call; do not claim host-native direct slash execution without evidence. |
| Codex | Plugin skills and packaged runtime | Use the surface-local plugin root and existing tool permission boundary. |
| Claude Code | Plugin skills, packaged runtime and command-capable hooks | Keep hook context separate from deliberate skill invocation and approvals. |
| OpenCode | Global skills plus config-local runtime and plugin callbacks | Reuse the config-local executable and preserve the documented subagent enforcement limitation. |

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `architecture_runtime_depth`
- decisive_full_depth_triggers: `architecture_runtime_depth`; `external_contract_depth`;
  `release_cross_host_depth`
- rejected_alternative: `structured_slice`, because it would understate the new execution owner,
  typed public invocation contract, coordinated generated profiles, rollback needs and loaded-host
  validation across four operational boundaries.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: approved UR; `local-validator.js`; `validator-application.js`;
  `command-registry.js`; canonical skill and interaction contracts; plugin manifests;
  `sync-plugin-runtime.js`; `sync-package-assets.js`; existing profile and runtime-integrity tests.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One dispatcher-first invocation outcome has a clear terminal-or-bounded-continuation boundary. |
| authority_boundary | `pass` | Target, gate, QA, approval and presentation authority stay in their existing owners; dispatcher is orchestration only. |
| owner_consumer_coordination | `fail` | One runtime owner must coordinate canonical skills, four generated profiles, installers and loaded-host evidence. |
| full_depth_impacts_absent | `fail` | Runtime orchestration, public command/schema and cross-host release effects are present. |
| migration_propagation_bounded | `pass` | No user-data migration; generated payload propagation is deterministic but release-sensitive. |
| failure_recovery_local | `fail` | Missing or mismatched runtime, host binding failure and rollback span installed host profiles. |
| independently_acceptable | `pass` | Dispatcher behavior is independently testable, but delivery still requires coordinated profile compatibility. |

## Impact

- Runtime: new dispatcher orchestration in the existing local validator/package composition.
- Public contract: typed invocation inputs, outcomes, diagnostics and timing fields require explicit
  compatibility treatment.
- UI/UX: first-visible response, terminal clarification, progress visibility and recovery change on
  all direct skill surfaces.
- Persistence: no new repository state or approval store is expected.
- Security and authority: no new authorization is desired; fail-closed behavior and tool permissions
  remain binding.
- Release: all distribution profiles, payload inventories, install tests and host observations are
  affected.
- Rollback: remove the dispatcher command/binding and restore dispatcher-first skill projections as
  one version-coherent release action.

## Product And Design Questions

- Exact user-visible states during dispatch: starting, terminal clarification, resolved handoff,
  unavailable runtime and version mismatch.
- Whether `gate-check` and `qa-gate` form the first coherent release slice or the public registry
  must cover every shipped canonical skill atomically.
- Stable dispatcher input/output schema and which fields are public compatibility commitments.
- Per-host executable binding and truthful fallback when a host cannot guarantee immediate direct
  process execution.
- Timing measurement points and conformance thresholds for runtime, tool start and first visible
  AGDF output.
- Recovery, telemetry privacy, rollback and version negotiation.

## Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: proposed `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; related
  `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: A new reusable orchestration boundary is being designed between host skill
  invocation and existing semantic owners; its final authority and fallback rules require approved
  design before graph curation.

## Transparency

Quick Task and Verified Change are ineligible because executable runtime, public schema, canonical
skill instructions, generated profiles and cross-host release evidence change. Structured Slice is
also too shallow because three full-depth triggers are evidenced. UX Intent Definition, PRD, SD and
TP are required before implementation.

## Missing Evidence

- Approved public contract and architecture ownership.
- Direct host capability evidence for executable-first binding on every surface.

## Required Next Step

Review PRD Revision 1 and provide the exact PRD decision. Implementation remains forbidden.
