# Brownfield Review: Single-Install OpenCode Activation

- revision: `1`
- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/opencode-single-install-activation/BROWNFIELD_REVIEW.md`

## Scope

Size the approved single-install OpenCode activation requirement without implementation. The scope
is limited to the existing global OpenCode plugin, global native-skill surface, repository scaffold,
status projection, generated assets, migration behavior and their user-facing documentation.

## Existing Owners And Coverage

| Concern | Existing owner | Coverage | Reuse decision |
|---|---|---|---|
| Global plugin installation and global permission defaults | `create-agdf/lib/installers/opencode.js` | fully_done | extend in place |
| Global skills, instructions and contracts | `installOpenCodeGlobalSurface()` in `create-agdf/lib/installers/opencode.js` | fully_done, but uses collision-safe `agdf-global-*` adapters | extend without creating another asset pipeline |
| Repository OpenCode activation | `opencode-repo` plan in `create-agdf/lib/scaffold/plan.js`; generated `opencode.json` and `.opencode/**` | fully_done for the existing duplicated-surface design | refactor the activation boundary; preserve migration compatibility |
| Runtime activation detection and reminders | `create-agdf/opencode-plugin.js` | partially_done: requires local `.opencode/AGDF.md` and skill files, and injects routing only during compaction | extend the existing plugin; do not add a second plugin |
| Status classification | `evaluateOpenCodeStatus()` in `create-agdf/lib/installers/opencode.js` | partially_done: reports global config, package, global skills, session signal and local surface, but treats local files as activation | extend its activation model and output |
| Shared OpenCode policy | `plugin/meta/agdf-plugin.definition.json`, generated `.opencode/**`, contracts and canonical skills | fully_done | retain canonical definition and generation path |
| Permission and approval boundary | `CG-NATIVE-INTERACTION-AUTHORITY`; interaction contract | fully_done | preserve explicit `question: deny` and exact-text fallback |
| Existing migration behavior | `opencode-repo` legacy-agent migration and current ownership guards | partially_done | extend with an owned local-surface compatibility path; never delete unowned files |

## Current Coverage And Reuse Strategy

The repository already has a global npm plugin and nine global skill adapters, plus a separate
repository scaffold that copies instructions, contracts and skills. The intended result does not
need a new installer, gate evaluator, skill model or control state. It needs one refactor of the
activation predicate and its consumers:

1. use valid `.agdf/control/config.json` as the explicit repository marker;
2. let the existing global plugin provide the shared routing/system guidance when that marker is
   present;
3. retain the global `agdf-global-*` naming until a collision-safe migration for existing local
   `agdf-*` skills is proved; and
4. reduce new repository scaffolding to durable control state and migration metadata rather than
   copied runtime assets.

## Change Impact

- runtime: `create-agdf/opencode-plugin.js` and its current compaction-only reminder path;
- installer/status: `create-agdf/lib/installers/opencode.js`;
- scaffold/migration: `create-agdf/lib/scaffold/plan.js`, generated OpenCode files and owned-file
  cleanup rules;
- canonical metadata and generated assets: `plugin/meta/agdf-plugin.definition.json` and
  `create-agdf/scripts/sync-package-assets.js`;
- public guidance: `INSTALL.md`, `README.md` and `create-agdf/README.md`;
- verification: focused OpenCode installer/status/scaffold tests, package smoke, Runtime Integrity,
  migration fixtures and optional live OpenCode evidence.

No gate authority, durable run schema, data migration, external service or new UI surface is
required. Existing local `.opencode/` surfaces remain a compatibility concern, not an independent
policy owner.

## Parallel-Structure And Ownership Risks

- Replacing global skill names with `agdf-*` immediately would collide with existing local skills;
  the current `agdf-global-*` prefix is a deliberate compatibility boundary and cannot be removed
  without tested migration.
- A new project-local plugin or a second generated instruction set would reintroduce the duplication
  this scope removes.
- A `config` hook must preserve an explicit user permission denial. It must never turn an OpenCode
  permission or auto-mode result into AGDF approval.
- System guidance must be injected through the existing global plugin, not reconstructed by a
  second host-specific router.

## Product And Runtime Drift

The current product intent says global discovery is not repository activation and directs users to
`opencode-repo`. The approved UR intentionally changes that activation model. This is product and
runtime semantics work, not a documentation-only correction. OpenCode's plugin API exposes both a
`config` hook and a system-transform hook, but repository tests cannot alone prove live host loading;
that remains separate UAT evidence.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- rationale: Existing nodes already own permission/approval authority and installer/CLI composition.
  The scope changes their consumption boundary but introduces no reusable new invariant yet.

## Decision And Transparency

`structured_slice` is the smallest safe path. `quick_task` and `verified_change` are ineligible
because this changes activation semantics, runtime hooks, installer/status behavior, generated
assets, migration compatibility and public guidance. Full `structured_delivery` is not required:
the existing owners, control state and shared policy model remain valid and can be extended in place.

## Missing Evidence

- The exact safe precedence/migration behavior when global and legacy local skills coexist needs a
  design decision and regression fixtures.
- A live OpenCode session must later verify that global system guidance is visible before an agent
  acts; it cannot be claimed from source inspection alone.

## Required Next Step

Draft a compact PRD that defines activation eligibility, global-skill and legacy-local coexistence,
permission preservation, status language, migration behavior and acceptance evidence; then request
`Approval: PRD`.
