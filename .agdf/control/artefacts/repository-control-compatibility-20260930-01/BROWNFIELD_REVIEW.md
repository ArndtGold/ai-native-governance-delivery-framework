# Brownfield Review: Repository control compatibility

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: repository-control-compatibility-20260930-01
- related_ur: .agdf/control/artefacts/repository-control-compatibility-20260930-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-09-30
- decision: pass

## Objective

Size and route the approved repository-specific compatibility check, visible maintenance offer and direct migration/repair entry point without reinstalling the globally installed plugin. This is routing evidence, not implementation-preparation analysis or delivery permission.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Repository orientation gains a specific actionable compatibility state and moves the primary recovery action out of installation. The one bounded maintenance capability materially changes its activation, visible blocker and recovery path; it does not introduce new governance authority.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/repository-control-compatibility-20260930-01/UX_INTENT_DEFINITION.md; repository modes, factual authority, deliberate selection and actionable recovery are recorded without prescribing technical design.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR for this run; installer control compatibility | `UR.md`; `create-agdf/lib/install-setup/service.js` invokes compatibility and the repair assistant after plugin health is established | medium: a repository maintenance action becomes independently reachable |
| Source of truth | `.agdf/control/runs/<run_id>/RUN_STATE.md`; control-state and control-evaluation owners | `SOT_REGISTRY.md`; `run-seal.js`, `run-recovery.js`, `run-state-writer.js`, `contained-file.js` | authority unchanged; compatibility inspection must not become delivery readiness |
| Runtime path | SessionStart generator and local validator | `scripts/sync-plugin-runtime.js` emits consent-gated Doctor facts; `lib/runtime/validator-application.js` does not expose installer maintenance | high: a distributed executable entry point and additional typed facts are needed |
| UI / UX | Locale registry and existing installer control presentation/selection | `install-setup/interaction.js`, `presentation.js`, `plugin/meta/agdf-interaction-locales.json` | medium: existing choices and concrete proposals can be reused with repository-facing copy |
| Persistence / data | Canonical recovery previews, repair previews, per-run locks and atomic writer | `control-migration.js` binds read-only snapshots before confirmation; `control-repair.js` rechecks original sources and file identity | storage meaning and approval reset are retained; only access to the existing operation changes |
| Tests / QA | Recovery, migration, repair, consent, validator, package and integrity tests | `run-recovery-test.js`, `install-control-migration-test.js`, `install-control-repair-test.js`, `runtime-check-consent-test.js`, `local-validator-test.js`, `package-build-test.js` | new repository-selection, no-write, runtime packaging and localized notice cases are required |
| Release / operations | Exact runtime generation, provenance and host-owned permission | `sync-plugin-runtime.js`; `runtime-check-consent/contract.js`, `coordinator.js`; `host-adapters/` | delivered runtime identity changes; technical consent and live-host evidence remain separately owned |

## Coverage And Reuse

- fully_done: Exact control inventory, pending-output handling, approval-safe migration, checkpoint/Git repair proposals, backups, locks and conflict checking exist. Source/package and temporary fixture checks are available; they do not prove a fresh installed session.
- partially_done: SessionStart resolves the hook-provided working directory to one Git repository and reports aggregated Doctor status; installer UI presents repository compatibility, details and deliberate maintenance choices.
- not_done: Repository-specific startup compatibility facts/notice and an independently reachable maintenance operation in the installed runtime.
- reuse_strategy: Refactor shared maintenance orchestration out of installation-only ownership where necessary, with one implementation used by installer and runtime. Extend existing validator command dispatch, hook facts and localization. Keep canonical evaluation and writer ownership.
- minimal_next_step: Complete the internal UX intent input, then a PRD at the justified structured depth. SD must choose the precise module and transport boundaries after PRD approval.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: An externally consumed runtime/CLI entry point and its package dependency boundary change. Automatic inspection and deliberate mutation must remain separate consumers of the same canonical maintenance logic.
- architecture_evidence: `runtime/validator-application.js`, `cli/validation-handlers.js`, `cli/command-registry.js`, `scripts/sync-plugin-runtime.js`, `install-setup/control-migration.js`, `install-setup/control-repair.js`, `runtime-check-consent/contract.js`.
- architecture_missing_evidence: none for depth selection; exact shared module placement and transport grammar remain SD decisions, not missing evidence of the existing owners.
- architecture_next_owner_and_action: SD under the existing CLI/runtime composition owner specifies dependency direction, exposed maintenance operations, package propagation, permission boundaries and unchanged control writer authority.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: A second repository-maintenance implementation would fork migration and repair policy | Both canonical paths already exist in `install-setup/control-migration.js` and `control-repair.js` | revise if duplicated during design/implementation | SD must specify one shared owner and adapters only; reviews check import direction and semantic parity |
| problem: Installer presentation carries installation context into a standalone repository action | `presentation.js` owns existing choices; installer service composes plugin health and maintenance | warn | PRD owns repository-facing intent and copy; SD separates presentation from plugin installation without adding a second policy owner |
| problem: Passive startup facts could be mistaken for permission to mutate | SessionStart currently exits after emitting facts; consent coordinator declares checks read-only and gate authority none | warn | Preserve read-only automatic execution and require a new deliberate repository-bound maintenance selection |
| problem: Packaging all installer dependencies into the validator would widen its runtime payload | `sync-plugin-runtime.js` explicitly selects validator dependencies and excludes installer setup | warn | SD defines the minimum dependency closure; TP verifies all generated profiles, payload inventory and source integrity |
| problem: Generic Doctor blockers can be mislabeled as compatibility failures | Doctor still reports open delivery/evidence findings while `inspectControlMigration` reports current | warn | Derive compatibility only from its own canonical inventory; do not use aggregate finding counts as migration counts |

No deliberate technical debt is accepted. No architecture diagram is needed: the named source imports and composition boundaries answer the ownership question directly.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: the user-approved independently reachable maintenance action changes the executable runtime/CLI contract; startup adds actionable repository-facing facts. Structured Slice is rejected because the public entry point and its exact packaged behavior are full-depth relevant.
- evidence: .agdf/control/artefacts/repository-control-compatibility-20260930-01/BROWNFIELD_REVIEW.md
- transparency_note: Quick Task introduces new product recovery behavior and is ineligible. Verified Change prohibits CLI/runtime contract impact and requires clean candidate paths; these paths already contain authorized earlier work. Structured Delivery is selected by contract effect, not file or owner counts.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External/public executable CLI contract extension in the delivered local validator; corresponding runtime facts and repository-maintenance user contract.
- rejected_alternative: structured_slice because full_depth_impacts_absent fails; quick_task and verified_change are ineligible for the new user-visible runtime/CLI capability.
- missing_or_conflicting_facts: none decisive for selecting depth. Detailed SD choices and later loaded-host proof remain explicit obligations.
- depth_evidence_refs: Approved UR sections 3 and 5; `validator-application.js`; `command-registry.js`; `sync-plugin-runtime.js`; `runtime-check-consent/coordinator.js`; existing installer maintenance owners.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One approved outcome: inspect and maintain the selected repository without reinstalling the plugin |
| authority_boundary | pass | Existing technical consent remains read-only; explicit selection does not create a gate approval; canonical run writers remain authoritative |
| owner_consumer_coordination | pass | Installer and local validator can consume one maintenance implementation; existing generation owns profile propagation; no shared data cutover is required |
| full_depth_impacts_absent | fail | A new externally consumed executable maintenance entry point and startup repository facts change the distributed runtime/CLI contract |
| migration_propagation_bounded | pass | Same canonical recovery/repair transactions and repository-local snapshots; generated package propagation is deterministic; no new persistent schema is required |
| failure_recovery_local | pass | Existing per-run locks, stale-source rejection, backups, interruption journals and explicit unresolved evidence remain repository-local |
| independently_acceptable | pass | Per-repository notices and maintenance can be accepted with package/fixture evidence and a fresh Codex observation without requiring unrelated historical runs to finish |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Incorporate the ready repository notice, 1/2/3 intent, result states and retry behavior into authoritative product acceptance | PRD | warn: the internal input is ready; PRD approval remains pending |
| Choose exact shared maintenance owner, argument grammar, runtime facts schema and minimum packaged dependency closure | SD | warn: design work remains intentionally downstream |
| Plan direct Codex observation and honestly classify other host/OS execution lanes | TP | warn: fixtures cannot attest fresh-host behavior |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-NATIVE-INTERACTION-AUTHORITY; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This review links the existing composition, interaction and runtime authority nodes. It creates no new node or policy owner; any implemented invariant change is reconciled in later delivery evidence.

## Next Permissible Step

- next_allowed_action: Draft and present the PRD from the approved UR and ready UX input.
- forbidden_until_then: SD, TP, implementation-preparation Brownfield Analysis, implementation, QA pass, publication, VCS actions and installed-host changes.

## Quality Outlook

- quality_outlook: Existing maintenance machinery supports bounded reuse. Product entry/notice behavior, package closure and direct host execution are still unimplemented and unverified for this run.
