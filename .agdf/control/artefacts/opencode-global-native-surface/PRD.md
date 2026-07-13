# Product Requirements Document: Global Native OpenCode Surface

## 1. Product intent

AGDF shall make its OpenCode integration globally discoverable through OpenCode's native skill mechanism while preserving repository-local governance as the only authoritative control surface.

## 2. Problem statement

The global `create-agdf` npm plugin is configured and loadable, but it contributes only lifecycle, status and compaction hooks. Native AGDF skills are generated only by `opencode-repo` into a target repository. As a result, OpenCode has no globally discoverable native AGDF skill surface comparable to the global Codex and Claude Code plugin installations.

## 3. Goals

- Install or expose the canonical nine `agdf-*` skills through OpenCode's supported global skill discovery path.
- Keep the global plugin hook responsible for lifecycle/status/compaction context only.
- Keep `.agdf/control/`, repository `.opencode/AGDF.md` and repository-local skills authoritative for active governance.
- Make global skill presence, repository-surface presence and active-session signals independently visible in `opencode-status`.
- Fail closed when a repository has no local AGDF control surface.
- Preserve existing `opencode`, `opencode-status` and `opencode-repo` command shapes and existing-config protection.
- Generate global and repository adapters from the same canonical `plugin/skills/**` and Runtime Contract sources.
- Keep OpenCode capability classification at `instruction_only` unless new independent enforcement evidence is established.

## 4. Non-goals

- No global copy of `.agdf/control/` or repository governance state.
- No second gate calculator, router policy owner or global Runtime Contract authority.
- No automatic repository mutation at OpenCode startup.
- No removal of the repository-local `opencode-repo` path.
- No change to Codex, Claude Code, Copilot or generic-surface behavior.
- No new public command or required parameter unless the SD proves the existing `opencode` command cannot support the scope.
- No commit, push, pull request or release.

## 5. User requirements

### R1 Global native discovery

After the existing global OpenCode install, an OpenCode user can discover the nine canonical `agdf-*` skills through native skill discovery without first modifying a repository.

### R2 Repository activation remains explicit

Global plugin or skill installation alone must not report active repository governance. A repository becomes governed only when its local `.opencode/AGDF.md`, native skills and `.agdf/control/` state are present according to the existing `opencode-repo` path.

### R3 Single source of truth

Global skill files are generated adapters. Their bodies, names, Runtime Contract references and routing expectations come from canonical `plugin/` sources. They must not contain a second gate model or copied durable control state.

### R4 Fail-closed routing

When loaded without a repository surface, global `agdf-gate-check` must direct the user to install the repository surface and must not claim that a governance run is active. When a repository surface exists, local instructions and control files take precedence.

### R5 Safe global installation

The global installer must preserve unrelated user-owned OpenCode skills and config entries, identify AGDF-owned generated files deterministically, and update only its owned assets on regeneration.

### R6 Status contract

`opencode-status --json` must distinguish at least global plugin configuration/loadability, global native skill presence, repository-surface presence and session signals. Existing schema-v1 fields remain compatible or receive an explicitly justified versioned extension.

### R7 Capability honesty

Global native discovery is not tool enforcement. OpenCode remains `instruction_only` unless a separate reproducible guard is proven.

## 6. Proposed product shape

Extend the existing `opencode` target and canonical asset synchronizer:

1. retain the npm plugin installation in the global OpenCode config;
2. generate global `agdf-*` skill adapters and the shared global Runtime Contract in OpenCode's verified global skill location;
3. keep `opencode-repo` generating repository-local instructions, skills, permissions and control templates;
4. make global skills delegate to or verify the repository-local surface before applying governance instructions;
5. extend status and integrity checks to prove both global and repository surfaces;
6. retain explicit `edit`/`bash` approval and scoped `agdf-*` skill permission behavior where OpenCode accepts global permission configuration.

The Solution Design must verify the exact global directory, precedence rules, config interaction, ownership fingerprint and update/uninstall behavior against the installed OpenCode runtime before implementation.

## 7. Acceptance criteria

- A clean isolated global install exposes all nine canonical `agdf-*` skills through installed OpenCode native discovery.
- A global-only install does not claim repository governance or an active AGDF session.
- A repository with `opencode-repo` uses its local instructions, skills and `.agdf/control/` as the source of truth even when global skills are present.
- Existing global OpenCode config and unrelated global skills are preserved.
- Regeneration updates only AGDF-owned global assets and does not leave duplicate AGDF skill variants.
- `opencode-status --json` reports global native-surface state without breaking schema-v1 consumers.
- Runtime integrity and package smoke tests cover global generation, repository separation, discovery, permissions and migration.
- OpenCode capability output remains `instruction_only` with no unsupported enforcement claim.
- Documentation explains the global native surface and the repository activation boundary.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| OpenCode's global skill directory or precedence differs by runtime version | Verify with installed OpenCode discovery probes and document the supported runtime boundary. |
| Global skills are loaded in unrelated repositories and appear authoritative | Fail-closed skill wording, explicit status separation and repository-local control checks. |
| Global adapters drift from canonical skills | Generate from `plugin/skills/**`, reuse the Runtime Contract and extend runtime-integrity checks. |
| Global installer overwrites user skills | Fingerprint AGDF-owned files and preserve unrelated paths/configuration. |
| Global and repository skills create duplicate routing | One canonical router policy; global adapters only discover/delegate, repository files remain authoritative. |
| Discovery is mistaken for enforcement | Keep `instruction_only` and require independent evidence for any capability upgrade. |

## 9. Traceability

- derived_from: `UR.md`
- sized_by: `BROWNFIELD_REVIEW.md`
- primary owners: `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/sync-package-assets.js`, `create-agdf/scripts/smoke-test.js`, `plugin/scripts/check-runtime-integrity.mjs`, OpenCode status and documentation owners
- source-of-truth owners retained: `plugin/skills/**`, `plugin/meta/agdf-runtime-contract.md`, `.agdf/control/`
- context_graph: `link_only` to the existing Delivery Path Search surface capability invariant; no new node required

## 10. Required next step

Create the Solution Design for global skill location, precedence, ownership/migration, status schema compatibility, fail-closed routing and validation evidence; request `Approval: SD`.

## Approval

- `Approval: PRD` provided on `2026-07-13`.
