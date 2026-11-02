# Brownfield Review: Installation Consent for Automatic Runtime Checks

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `installation-consent-runtime-checks`
- related_ur: `.agdf/control/artefacts/installation-consent-runtime-checks/UR.md`
- current_gate: `PRD`
- reviewer: Codex
- reviewed_at: 2026-08-27

## Objective

Size and route the approved cross-host and cross-platform installation-consent outcome while reusing
the existing installer, runtime, provenance, lifecycle, interaction and host-adapter owners.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: The change introduces a safety-relevant installation decision with persistent
  effective state, host-owned trust or permission consequences, declined and unavailable modes,
  revocation, update invalidation and recovery across Codex, Claude Code, OpenCode, macOS, Linux and
  native Windows.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; `plugin/meta/contracts/interaction.md` | Technical permission and AGDF gate approval are already distinct semantic kinds | `high` |
| Source of truth | `plugin/meta/agdf-plugin.definition.json`; existing `installer-output-parity` and `agdf-cross-host-runtime-integrity` runs | Canonical host metadata, lifecycle presentation, validator provenance and evidence planes already have owners | `high` |
| Runtime path | `plugin/hooks/hooks.json`; `plugin/hooks/session-start.sh`; generated `runtime/agdf-local.js` | Session start already runs the version-matched resolve probe and emits loaded-session orientation | `high` |
| UI / UX | Existing installer lifecycle presentation and host-native trust or permission dialogs | No shared informed-consent journey, effective-state vocabulary or revocation journey exists yet | `high` |
| Persistence / data | Host user/project configuration, hook-trust state and AGDF installation provenance | OpenCode fills missing permissions while preserving explicit decisions; Codex and Claude use different host-owned trust/configuration paths | `high` |
| Tests / QA | Installer, lifecycle, local-marketplace, Runtime Integrity, OpenCode hardening and smoke suites | Strong repository coverage exists, but consent, revocation, renewal and host/OS matrix coverage do not | `high` |
| Release / operations | Existing package build, durable marketplace, host installers, rollback and restart boundaries | The feature must propagate consistently across three hosts and claimed operating-system combinations | `high` |

## Current Coverage And Reuse Strategy

| Concern | Coverage | Reuse strategy |
|---|---|---|
| Shared consent semantics | `not_done` | extend the existing lifecycle and interaction contracts; do not create host-specific product meanings |
| Codex hook trust | `partially_done` | reuse native hash-bound hook review and existing plugin hook packaging; do not bypass it |
| Claude permission handling | `partially_done` | extend the existing user-scope installer and native permission mechanism only after exact capability verification |
| OpenCode permissions | `partially_done` | extend the existing missing-only configuration merge while preserving every explicit user decision |
| Session runtime orientation | `fully_done` for resolve-only identity | extend the existing SessionStart path only if later design proves more state is required |
| Provenance and update identity | `fully_done` for installed runtime | reuse version, digest and ownership evidence for consent renewal and stale-state decisions |
| Native Windows install mechanics | `partially_done` | reuse bounded filesystem retry, target-platform paths and capability probes; require direct native-Windows consent evidence |
| Consent status, revoke and recovery | `not_done` | extend existing lifecycle status/disable/uninstall owners rather than add a second control surface |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A second consent or permission store could drift from host-effective state | Existing host-owned permissions plus AGDF provenance | `block` | Later design must define one host-authoritative effective state and use AGDF-owned data only for bounded intent/provenance evidence |
| Per-host copy could create three product contracts | Thin-adapter architecture in existing runs and plugin definition | `revise` | Define one semantic consent contract and keep adapters transport-only |
| Broad command allow rules could outlive changed executable content | Approved UR and current Claude permission model | `block` | Bind renewal to effective hook/validator identity or fail closed to manual confirmation |
| Installer mutation could bypass explicit user decisions | OpenCode currently preserves explicit permission values; Codex hook trust is host-owned | `block` | Preserve user decisions and host-native trust; unsupported mutation must degrade honestly |
| New status UX could duplicate lifecycle presentation | `installer-output-parity` owns lifecycle result and presentation | `revise` | Extend the existing lifecycle result and status owners |

## Impact Assessment

- files/modules: canonical plugin definition, shared hook/session orientation, installer lifecycle and
  presentation, Codex/Claude installer adapter, OpenCode configuration adapter, provenance/status
  projections and focused tests;
- interfaces: host plugin install/update commands, host permission or hook-trust configuration and
  the human installation decision;
- data model/migrations: host-effective trust/permission state and any minimal AGDF-owned consent
  evidence must support upgrade, invalidation, revocation and rollback without becoming authority;
- backwards compatibility: existing installations without consent must remain usable through manual
  confirmation; explicit host decisions must remain authoritative;
- regression tests: enable, decline, cancel, non-interactive, unsupported, revoke, update, stale
  identity, rollback and fresh-session cases per supported host/OS combination;
- side effects: user or project configuration changes, hook activation, restart requirements and
  potential stale-cache behavior must be visible and reversible.

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `authority_policy_security_depth` is decisive because installation consent changes a
  persistent technical permission and trust boundary. `release_cross_host_depth` also applies because
  activation, renewal, revocation, rollback and evidence must remain coherent across three hosts and
  explicitly supported macOS, Linux and native-Windows combinations.
- evidence: approved UR Revision 2; current installer, hook, permission, provenance and lifecycle
  owners; existing cross-host runtime and native-Windows evidence; current official Codex and Claude
  host documentation.
- transparency_note: Quick Task and Verified Change are ineligible because permission, policy,
  runtime and cross-host behavior changes are explicitly prohibited on those paths. Structured Slice
  is rejected because stale-consent prevention and host/OS activation cannot be delivered or accepted
  as a purely local bounded change without the shared authority and rollout contract.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `authority_policy_security_depth`
- decisive_full_depth_triggers: `authority_policy_security_depth`; `release_cross_host_depth`;
  `external_contract_depth`
- rejected_alternative: `structured_slice` is rejected because host permission and hook-trust
  schemas are external compatibility contracts, while shared consent meaning, update invalidation,
  revocation and direct host/OS evidence require coordinated activation and rollback.
- missing_or_conflicting_facts: `none` for depth selection; detailed product and technical choices
  remain assigned to PRD and SD.
- depth_evidence_refs: approved UR Revision 2; `plugin/meta/contracts/interaction.md`;
  `plugin/meta/agdf-plugin.definition.json`; `plugin/hooks/`; `create-agdf/lib/installers/`;
  `create-agdf/lib/runtime/plugin-provenance.js`; `installer-output-parity`;
  `agdf-cross-host-runtime-integrity`; `windows-native-install-viability`; current official Codex and
  Claude documentation inspected 2026-08-27.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: the user makes one informed, reversible installation decision for narrow automatic checks. |
| authority_boundary | `fail` | The outcome changes persistent host permission and hook-trust behavior and must preserve AGDF gate authority separately. |
| owner_consumer_coordination | `fail` | Shared semantics must coordinate existing installer/runtime owners with Codex, Claude Code, OpenCode and multiple operating systems. |
| full_depth_impacts_absent | `fail` | Permission, policy, runtime, external host contract and cross-host activation impacts are explicit. |
| migration_propagation_bounded | `fail` | Existing installations, updates, stale consent and changed executable identity require a coordinated compatibility and renewal path. |
| failure_recovery_local | `fail` | Effective trust and permission state is host-owned and recovery differs by host and operating system. |
| independently_acceptable | `fail` | A single-host implementation cannot satisfy the approved shared consent meaning and claimed host/OS capability matrix. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| What exact disclosure and decision sequence is shared across hosts? | `PRD` | `block` |
| What is the safe default for non-interactive installation and unsupported permission persistence? | `PRD` | `block` |
| Which host/OS combinations support enablement, status, revocation and renewed consent? | `PRD` | `block` |
| Which checks are safe and useful enough for automatic execution? | `PRD` | `block` |
| How is effective consent derived without creating a second authority store? | `SD` | `block` |
| How are hook/validator changes detected and stale consent invalidated atomically? | `SD` | `block` |
| How do configuration mutation and rollback preserve unrelated user settings? | `SD` | `block` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The reusable extension is that installation consent and host permission
  state are technical authority only, must preserve explicit host decisions, and must be renewed when
  the effective executable permission scope changes.

## Next Permissible Step

- next_allowed_action: Draft the PRD using the ready UX Intent Definition and request
  `Approval: PRD`.
- forbidden_until_then: Solution Design, Task Plan, implementation, host configuration mutation, QA,
  UAT, release and VCS actions.

## Quality Outlook

- quality_outlook: Define one observable consent and recovery journey while retaining exact
  host/OS capability truth and direct native-Windows evidence obligations.
