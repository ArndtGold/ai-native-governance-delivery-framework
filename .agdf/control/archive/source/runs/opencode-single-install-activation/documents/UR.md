# UR: Single-Install OpenCode Activation

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation.
Revision: 2
Date: 2026-07-17
Owner: agent

## Problem

AGDF can be installed globally for OpenCode, but the current activation model also requires a
repository-local OpenCode surface that duplicates instructions, runtime-contract assets and native
skill adapters. A globally installed plugin can therefore be discoverable while an AGDF repository
is not active, which makes first use confusing and allows an agent to miss the intended gate routing.

## Goal

Provide one global OpenCode AGDF installation with explicit, repository-local activation through
durable AGDF control state. The global runtime should supply the shared skills and interaction
guidance; the repository should retain only its authoritative control state and an explicit opt-in
marker.

## Scope

After the required approvals, deliver the smallest safe change that:

1. treats a valid `.agdf/control/config.json` as the repository activation marker;
2. lets the global OpenCode plugin activate AGDF routing and shared runtime guidance for that
   repository without requiring duplicated `.opencode/` instructions or skill files;
3. preserves explicit user permission denials and keeps technical permissions separate from AGDF
   approval authority;
4. keeps `.agdf/control/` as the durable repository source of truth;
5. gives status output a truthful installed-versus-activated distinction; and
6. supplies a safe migration path for repositories that still use the generated local OpenCode
   surface.

## Non-Goals

- activating AGDF automatically in every OpenCode repository;
- changing gate order, exact approval values or durable approval authority;
- deleting or overwriting user-owned OpenCode configuration;
- introducing a second skill, contract, renderer or control-state owner;
- claiming live host behavior without direct evidence; or
- performing installation, update, reinstall, VCS or release operations as part of this run.

## Acceptance Signals

1. A single global OpenCode installation exposes the canonical AGDF skills and runtime guidance.
2. A repository with valid AGDF control configuration becomes active without generated local copies
   of shared skills or instructions.
3. A repository without the marker remains inactive and receives an actionable orientation only.
4. An explicit user `permission.question: deny` remains authoritative; no permission outcome can
   advance an AGDF gate.
5. Status and documentation distinguish global installation, repository activation and an active
   OpenCode session.
6. Generated and regression checks prove no duplicate OpenCode policy owner or migration breakage.

## Existing Source Of Truth

- `plugin/meta/agdf-plugin.definition.json` for OpenCode package, skill and permission metadata;
- `create-agdf/opencode-plugin.js` for OpenCode lifecycle hooks and repository-surface detection;
- `create-agdf/lib/installers/opencode.js` for installation, global skills and status behavior;
- `create-agdf/lib/scaffold/plan.js` for current `opencode-repo` generated files;
- `plugin/meta/contracts/control-scaffold.md` and `plugin/meta/contracts/interaction.md` for
  repository authority and permission/approval boundaries; and
- `.agdf/control/config.json` for durable repository language and AGDF control configuration.

## Risks And Unknowns

- OpenCode plugin configuration hooks may not safely merge all repository-specific permissions.
- Existing repositories may rely on local `.opencode/` assets, so migration must preserve a clear
  compatibility boundary.
- Global skill names and discovery precedence must not create collisions or a second policy source.
- Live OpenCode behavior requires separate host evidence and must not be inferred from repository
  tests alone.

## Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts
or implementation.
