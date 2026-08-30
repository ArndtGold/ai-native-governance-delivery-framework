# UR: Deliver AGDF as an Installable GitHub Copilot Plugin

Status: approved  
Gate: UR  
Gate approval: exact `Approval: UR` accepted for revision 2 on 2026-08-28 after same-run, same-gate and revision revalidation
Revision: 2
Date: 2026-08-28  
Owner: Arndt Gold

## 1. Problem

AGDF currently exposes two different GitHub Copilot setup paths: an installable plugin and a
repository projection containing Copilot instructions and prefixed skills. This creates an
unnecessary product choice, two public command meanings and two support boundaries for the same
user outcome.

GitHub Copilot supports an installable plugin that can carry the portable AGDF workflow. AGDF should
therefore expose one supported Copilot installation path and reserve repository state for
project-owned governance data rather than a second Copilot distribution surface.

## 2. Goal

Make the installable AGDF plugin the only supported GitHub Copilot integration. The public command
`npx --yes @agdf/cli@latest copilot` and the local checkout command `npm run install:copilot` install
that plugin. AGDF no longer publishes or documents a separate Copilot repository bootstrap.

## 3. User Outcome

A GitHub Copilot user can install AGDF once, start a fresh session in a repository and use the
recognizable AGDF workflow skills with truthful activation, version and evidence boundaries. The
repository remains the owner of its own `.agdf/control/` state and any project-specific instructions.

## 4. Scope

This user need covers:

- one generated Copilot plugin bundle derived from existing canonical AGDF sources;
- Copilot-compatible plugin and marketplace metadata with coherent AGDF identity and versioning;
- the existing Copilot-prefixed AGDF skills and their shared Runtime Contract dependencies;
- access to the exact-version local AGDF validator from the installed plugin;
- a Copilot-compatible, read-only session activation path that cannot approve gates or silently
  mutate repository control state;
- install, update, status, uninstall and fresh-session verification boundaries appropriate to the
  supported Copilot plugin lifecycle;
- the public `copilot` command as the canonical plugin installer and the local
  `npm run install:copilot` command as its checkout equivalent;
- retirement of the separate Copilot repository installer and generated Copilot instruction and
  skill projection as supported product surfaces;
- non-destructive migration behavior that leaves already checked-in repository files untouched;
- deterministic package, runtime-integrity and routing tests for the Copilot bundle; and
- documentation that distinguishes source, generated package, installed plugin, loaded session,
  human UAT and marketplace publication evidence.

The first implementation may retain exact textual AGDF approvals. A native Copilot decision adapter
is included only if later evidence proves exact approval-value transport, deliberate waiting and
post-response revalidation without creating a second approval path.

## 5. Non-Goals

- Replacing `.agdf/control/`, the AGDF gate model, the AGDF CLI or exact approval formulas.
- Treating Copilot tool permissions, plan controls, plugin installation or hook execution as an AGDF
  gate approval.
- Automatically deleting or rewriting existing `AGENTS.md`, `.github/copilot-instructions.md`,
  `.github/skills/**` or `.agdf/control/**` files during plugin installation, update or uninstall.
- Publishing AGDF into a GitHub-managed default marketplace before package, security, legal and UAT
  evidence is separately ready and explicitly authorized.
- Claiming GitHub Copilot cloud-agent, code-review, Visual Studio Code or cross-platform parity from
  app or repository tests alone.
- Introducing an AGDF account, hosted service, telemetry backend or second durable state store.
- Making host-specific Copilot behavior normative for other AGDF surfaces.

## 6. Acceptance Signals

The user need is satisfied only when later approved delivery can demonstrate that:

1. one Copilot plugin package installs through a documented supported path and reports a coherent
   AGDF identity and version;
2. a fresh supported Copilot session discovers the intended AGDF skills without requiring their
   repository-local copies;
3. skill routing preserves the `agdf-` collision boundary and selects `agdf-gate-check` for new
   gate-relevant work;
4. the installed bundle contains and resolves the matching local validator without registry access;
5. activation and lifecycle behavior is read-only or explicitly consented, bounded and reversible;
6. exact AGDF approval remains the only gate authority, with exact text as the mandatory fallback;
7. project-level skills and instructions retain their documented precedence and never become
   silently overwritten by the plugin;
8. source, generated bundle, installed root, loaded session and human UAT evidence are reported
   separately;
9. release preparation, Runtime Integrity, package inventory and focused Copilot routing tests pass;
10. `copilot` installs the plugin while the retired repository projection is no longer offered or
    documented as a supported Copilot installation path; and
11. public documentation no longer describes a capability boundary that current supported Copilot
    plugin behavior disproves.

## 7. Existing Sources Of Truth And Reuse Candidates

- `plugin/meta/agdf-plugin.definition.json` owns cross-surface AGDF identity, skills and capability
  metadata.
- `plugin/skills/**` and `plugin/meta/contracts/**` own the portable workflows and Runtime Contract.
- `create-agdf/scripts/sync-package-assets.js` currently generates Copilot-prefixed repository
  skills and shared contract files; Brownfield Review must identify the smallest removal boundary
  without affecting other generated consumers.
- `create-agdf/scripts/sync-plugin-runtime.js` and the generated runtime bundle own exact-version
  validator composition.
- `plugin/scripts/check-runtime-integrity.mjs` and `create-agdf/scripts/smoke-test.js` own package,
  routing and generated-surface verification.
- `create-agdf/lib/installers/**`, lifecycle owners and the existing installation-consent contract
  are reuse candidates for a supported Copilot lifecycle; Brownfield Review must decide the actual
  owner rather than creating a parallel installer.
- `plugin/meta/contracts/interaction.md` remains the sole AGDF interaction and approval authority.
- `.agdf/control/` remains the repository-owned governance state.

External capability evidence:

- `https://docs.github.com/en/copilot/concepts/agents/about-plugins`
- `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference`
- `https://docs.github.com/en/copilot/reference/hooks-reference`
- `https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills`

These GitHub sources describe host capabilities. They do not own AGDF semantics or prove behavior in
the installed app.

## 8. Risks And Open Questions

- The smallest clean package shape is not yet established: a shared generated runtime bundle may be
  reusable directly, or Copilot may require a dedicated projection because skill names and hooks
  differ.
- The Copilot app and CLI may support different installation, hook, extension or lifecycle details.
- The current AGDF hook format is not the documented Copilot hook format and must not be reused
  without explicit compatibility evidence.
- Plugin-local validator discovery and plugin-root environment behavior require direct observation.
- Project and personal skill precedence can suppress plugin skills with the same names; collision and
  diagnostics behavior must be tested.
- Native user-input APIs exist in the installed SDK, but gate-safe exact-value transport and waiting
  behavior remain unverified.
- GitHub plugin and extension specifications can change independently of AGDF.
- Cross-platform process, path, permission and cache behavior require direct macOS, Linux and native
  Windows evidence before parity is claimed.
- Existing repositories may retain formerly generated Copilot files. Retirement must not delete user
  content, and documentation must distinguish unsupported legacy files from the supported plugin.

## 9. Next Step

Approval permits a refreshed Brownfield Review of the existing Copilot command, repository
projection, plugin packaging, runtime, lifecycle, interaction and validation owners. It does not
permit implementation or deletion of existing repository files.

Approve only with:

`Approval: UR`
