# UR: Deliver AGDF as an Installable GitHub Copilot Plugin

Status: approved  
Gate: UR  
Gate approval: `Approval: UR` recorded on 2026-08-28  
Date: 2026-08-28  
Owner: Arndt Gold

## 1. Problem

AGDF supports GitHub Copilot today through repository-local `AGENTS.md`, Copilot instructions and
prefixed repository skills. Current GitHub Copilot products now support installable plugins that can
bundle skills, agents, hooks, extensions and runtime integrations. AGDF does not yet provide a
Copilot plugin package, marketplace entry or verified plugin lifecycle for that host.

As a result, users must currently bootstrap AGDF into each repository even when they only need the
portable AGDF workflow controls. The existing documentation also describes Copilot as an
instruction-only, repository-file surface even though the host's current plugin capabilities make a
stronger and more reusable integration possible.

## 2. Goal

Make AGDF available as an installable GitHub Copilot plugin that reuses the canonical AGDF skills,
runtime contracts and exact-version validation model. The plugin should provide a consistent,
updateable AGDF experience in the GitHub Copilot app and Copilot CLI without turning Copilot into a
second governance authority or requiring portable plugin content to be copied into every target
repository.

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
- preservation of the existing repository bootstrap for project-owned instructions, control
  templates and teams that deliberately prefer checked-in configuration;
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
- Removing the existing Copilot repository bootstrap or automatically rewriting repositories when
  the plugin is installed.
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
   and
10. public documentation no longer describes a capability boundary that current supported Copilot
    plugin behavior disproves.

## 7. Existing Sources Of Truth And Reuse Candidates

- `plugin/meta/agdf-plugin.definition.json` owns cross-surface AGDF identity, skills and capability
  metadata.
- `plugin/skills/**` and `plugin/meta/contracts/**` own the portable workflows and Runtime Contract.
- `create-agdf/scripts/sync-package-assets.js` already generates Copilot-prefixed repository skills
  and shared contract files.
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

## 9. Next Step

Review this UR. Approval permits a Brownfield Review of the existing Copilot generators, plugin
packaging, runtime, lifecycle, interaction and validation owners. It does not permit implementation.

Approve only with:

`Approval: UR`
