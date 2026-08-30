# PRD: Installable AGDF Plugin for GitHub Copilot

Status: approved
Gate: PRD
Gate approval: exact `Approval: PRD` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation
Revision: 3
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` revision 2
Brownfield Review: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` revision 2
UX Intent: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md` revision 2
Date: 2026-08-28
Owner: Arndt Gold

## 1. Product Decision

AGDF supports GitHub Copilot only as an installable plugin. The public command is:

```bash
npx --yes @agdf/cli@latest copilot
```

Contributors installing from the source checkout use:

```bash
npm run install:copilot
```

There is no separate supported Copilot repository projection. The prior `copilot-plugin` command,
the Copilot behavior of `both`, generated Copilot instructions and generated repository skill copies
are retired as supported product surfaces.

## 2. User Outcome

A GitHub Copilot user has one obvious installation path. The command installs or updates the AGDF
plugin, verifies its identity and version, explains whether a fresh session is required and gives one
next action. A fresh supported Copilot session exposes the prefixed `agdf-` skills and the
consent-bound session hook without treating installation or hook execution as AGDF gate approval.

## 3. Scope

- Remap the public `copilot` target from repository scaffolding to the existing plugin lifecycle.
- Keep `npm run install:copilot` as the local source-checkout equivalent.
- Retire `copilot-plugin` as a public command and supported documentation path.
- Retire `both` as a public combined Codex and Copilot repository setup target.
- Stop generating a Copilot-specific repository distribution containing `AGENTS.md`,
  `.github/copilot-instructions.md` and `.github/skills/**`.
- Preserve the generated plugin bundle, `copilot-skills/**`, plugin manifest, hook and exact-version
  runtime.
- Materialize a Copilot-specific installation artifact from canonical sources. The artifact registered
  with Copilot must contain exactly one Copilot-facing skill projection and must not carry an unused
  canonical `skills/**` tree or another editable copy of the same semantic content.
- Add fail-closed package inventory and source-to-projection integrity checks so unexpected semantic
  duplication, stale projections and unexplained payload growth block release preparation.
- Preserve installation consent, lifecycle, provenance, status, disable and uninstall behavior.
- Preserve existing user-owned repository files. No installation, update or uninstall operation may
  delete or rewrite historical Copilot files.
- Align README, INSTALL, CLI README, Pages, help output, package contents and deterministic tests.

## 4. UX Intent And Effective State

- ui_ux_impact: `medium`
- ux_intent_definition: `ready` at `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md` revision 2
- primary_user_intent: Install AGDF for Copilot through one command and understand whether the plugin
  is installed, verified and loaded.
- success_signal: The canonical command reports a verified version and one next action; a fresh
  session exposes the expected skills.
- primary_decision_or_action: Install or update the plugin, then restart Copilot when requested.

| Working mode | Effective state | Visible state and recovery | Authority |
|---|---|---|---|
| `not_installed` | No verified AGDF plugin | Offer the canonical `copilot` command | AGDF installer diagnosis |
| `installed_pending_fresh_session` | Plugin files and host registration verified; loaded session not yet proven | Show version and request restart or fresh session | Copilot host state plus AGDF lifecycle result |
| `active_ungoverned_repository` | Plugin loaded; no selectable AGDF run | Skills available; explain optional generic control setup | Copilot loaded state and AGDF validator |
| `active_governed_repository` | Plugin loaded; valid repository control state | Show selected run, gate and next allowed action | `.agdf/control/` and exact approval contract |
| `active_with_project_override` | Project or personal configuration shadows a plugin component | Diagnose precedence without overwriting files | Copilot precedence rules |
| `degraded_or_stale` | Version, provenance, hook, validator or loaded evidence conflicts | Show failing phase and one retry or repair action | AGDF lifecycle and host evidence |
| `disabled_or_uninstalled` | Plugin not active in new sessions | Offer install or enable action; retain repository data | Copilot lifecycle state |

`repository_bootstrap_only` is removed as a supported AGDF Copilot working mode. Existing files may
remain in repositories as user-owned legacy content but do not constitute a supported installation.

## 5. Functional Requirements And Acceptance Criteria

### CPI2-AC-01 — Canonical public installation

`npx --yes @agdf/cli@latest copilot` must execute the existing fail-safe Copilot plugin lifecycle,
including build verification before mutation, host registration, post-mutation verification,
installed version reporting and one next action.

### CPI2-AC-02 — Local checkout installation

`npm run install:copilot` must install the exact plugin generated by the current checkout and preserve
the lifecycle exit code and verification result.

### CPI2-AC-03 — One supported Copilot path

CLI help, command validation, README, INSTALL, CLI README and Pages must expose only `copilot` as the
public Copilot setup target. `copilot-plugin` and `both` must not be offered as supported commands.

### CPI2-AC-04 — Plugin payload preserved

The generated Copilot plugin must retain coherent `plugin.json`, marketplace identity `agdf@agdf`,
the full product name `AI Governance & Delivery Framework (AGDF)`, category `Productivity`, prefixed
skills, contracts, consent-bound hook and exact-version validator runtime.

### CPI2-AC-05 — Repository projection retired

New Copilot setup must not generate `AGENTS.md`, `AGENTS.agdf.md`,
`.github/copilot-instructions.md`, `.github/instructions/agdf.instructions.md` or
`.github/skills/**` as an AGDF Copilot distribution surface.

### CPI2-AC-06 — Existing files retained

Install, update, status, disable and uninstall must not delete or rewrite pre-existing repository
instructions, skills or `.agdf/control/**`. Tests must cover user-owned and formerly AGDF-generated
fixtures.

### CPI2-AC-07 — Generic governance state remains available

The plugin may inspect valid `.agdf/control/` state. Creation or maintenance of that state remains a
surface-neutral AGDF workflow and must not recreate a Copilot-specific repository distribution.

### CPI2-AC-08 — Consent and hook authority

Interactive install and update must continue to offer explicit `enable`, `manual` and `cancel`
choices for automatic runtime checks. Consent and hook execution must never grant
`Approval: <GateName>` or change repository control state.

### CPI2-AC-09 — Lifecycle and recovery

Install, update, status, disable and uninstall must preserve the prior healthy plugin on failed
mutation where the existing lifecycle promises rollback. Results must distinguish package,
installed-root and loaded-session evidence.

### CPI2-AC-10 — Documentation consistency

Root README, INSTALL, package README and Pages must describe the same command, scope, product name,
plugin identity, restart requirement and evidence limits. Local checkout commands must not be
presented as public registry installation.

### CPI2-AC-11 — Regression protection

Deterministic tests must prove command routing, help output, package contents, local installation,
non-deletion, plugin skill routing, hook JSON, lifecycle reporting and absence of the retired public
Copilot repository path.

### CPI2-AC-12 — Bounded support claims

Repository and package tests prove only source and bundle behavior. Loaded app behavior, operating
system parity, human UAT and marketplace publication require separate evidence and must remain
explicitly unverified where absent.

### CPI2-AC-13 — Single-projection Copilot payload

The plugin artifact materialized and registered for GitHub Copilot must contain exactly one complete
Copilot-facing skill projection. It must not include an unused canonical `skills/**` tree, a second
host's skill projection or duplicate editable owners for skills, runtime contracts, hooks or plugin
metadata. Shared runtime code and contracts may be included only where the Copilot artifact needs
them to operate offline and validate the exact installed version.

The release build must produce a deterministic semantic inventory that maps every Copilot payload
component to one canonical source owner. It must fail closed when the artifact contains an
unmapped semantic duplicate, a stale derived projection, an unexpected host surface or unexplained
growth beyond an explicitly reviewed baseline. The check must compare semantic ownership and
required host behavior, not file names or byte count alone.

## 6. Non-Goals

- Deleting or migrating files in existing user repositories.
- Replacing `.agdf/control/`, exact gate approvals or the AGDF validator.
- Creating a renamed Copilot repository installer such as `copilot-repo`.
- Treating generic `init` or repository governance state as a second Copilot distribution surface.
- Adding a second installer, consent model, provenance model, skill source or gate authority.
- Removing host-required runtime or contract content merely to minimize byte size.
- Requiring the registry package itself to contain only Copilot assets; the constraint applies to
  the artifact materialized and registered for Copilot, while other host release outputs may remain
  in the registry package as separately owned artifacts.
- Claiming default marketplace publication, cross-platform parity or human acceptance without direct
  evidence.
- Changing Codex, Claude Code or OpenCode installation semantics except where removal of `both`
  requires accurate help and tests.

## 7. Migration And Compatibility

- The revised command contract is intentionally breaking within the unreleased Copilot plugin work.
- Existing repositories keep all files. AGDF does not attempt ownership inference or cleanup.
- Users of the former `both` target use `codex-repo` when they still want repository-local Codex and
  install the Copilot plugin separately with `copilot`.
- Existing installed Copilot plugins continue through the shared lifecycle and can be refreshed with
  the canonical `copilot` command.
- Historical generated Copilot files are not evidence that the current plugin is installed or loaded.

## 8. Evidence And Release Boundary

Required deterministic evidence includes CLI and lifecycle tests, generated package inventory,
semantic source-to-projection mapping, negative duplicate and stale-projection fixtures, reviewed
payload baseline, Runtime Integrity, routing tests, hook contract tests, non-deletion fixtures,
Pages tests and `git diff --check`. Direct Copilot evidence must separately record the installed
version, fresh session, loaded skills and hook execution for the tested host version.

QA, UAT, publication, release, commit and push remain separately gated.

## 9. Risks

- Removing `both` can surprise current source-checkout users; documentation must provide the two
  explicit replacement commands.
- Repository projection code may share generators with the plugin's prefixed skills; implementation
  must remove only repository consumers and preserve `copilot-skills/**`.
- Stale repository files may look supported. Documentation and status output must not use their
  presence as plugin activation proof.
- Host plugin behavior may drift across Copilot app, CLI, cloud agent and operating systems.
- A physically shared multi-host plugin root can make Copilot install content that its manifest does
  not load. This increases the number of derived copies that can drift even when the host ignores
  the extra files.
- A byte-only optimization can remove required offline validation or contract content while leaving
  semantic duplication intact. Integrity checks must therefore prove ownership and behavior first.

## 10. Next Step

Review PRD revision 3. Approval permits drafting the revised Solution Design. It does not permit
implementation.

Approve only with:

`Approval: PRD`
