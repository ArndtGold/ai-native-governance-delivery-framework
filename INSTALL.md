# Installation and Setup

AGDF supports three primary usage surfaces:

1. **Codex** through the installable plugin manifest in `plugin/.codex-plugin/plugin.json`
2. **Claude Code** through the installable plugin in `plugin/`
3. **GitHub Copilot** through generated repository files because Copilot does not currently consume the AGDF plugin package

Codex and Claude Code consume AGDF as an installable plugin runtime.
GitHub Copilot consumes AGDF as repository-local instructions and visible repository skills.

Codex is the primary plugin-packaging surface for AGDF.
The AGDF control model itself is surface-neutral and is reused for Claude Code and GitHub Copilot.

AGDF is a control-first plugin.
The skills steer agent behavior during a run.
The `plugin/control/` scaffold provides durable repository artefacts for run state, backlog pointers, source-of-truth ownership, Context Graph knowledge and quality contracts.

## Skill identity model

AGDF uses one logical skill model and renders surface-specific skill references.

Codex and Claude Code use plugin-scoped skill names because the plugin itself provides the `agdf` namespace.

Example:

```text
/gate-check
/brownfield-analysis
/qa-gate
```

GitHub Copilot uses repository-visible prefixed skill names because Copilot reads checked-in repository files instead of installing the AGDF plugin runtime.

Example:

```text
.github/skills/agdf-gate-check/SKILL.md
.github/skills/agdf-brownfield-analysis/SKILL.md
.github/skills/agdf-qa-gate/SKILL.md
```

The prefix is generated from the shared AGDF skill definition model and must not be manually duplicated across independent files.

The routing table is calculated from:

```text
plugin/meta/agdf-plugin.definition.json
```

using:

```text
surface.skillPrefix + skillSet.slug
```

The shared router source is:

```text
plugin/meta/agdf-agent-router.md
```

Copilot-facing `AGENTS.md` content is rendered from the same source with Copilot skill prefixes.

This avoids drift between:

- Codex plugin metadata
- Claude Code plugin metadata
- lifecycle hooks
- generated Copilot instructions
- visible Copilot skills
- website documentation
- examples and test prompts

## Prerequisites

- Node.js and npm installed
- For **Codex**: Codex CLI or the Codex app with plugin support
- For **GitHub Copilot**: GitHub Copilot CLI or the Copilot Coding Agent
- For **Claude Code**: Claude Code CLI
- Run bootstrap commands inside the target Git repository, not inside this AGDF repository

## Codex

AGDF is available as a Codex plugin from the same `plugin/` root used for the Claude Code plugin.

Codex uses:

```text
plugin/.codex-plugin/plugin.json
```

as the plugin manifest and loads the shared AGDF skills from:

```text
plugin/skills/
```

Codex also discovers the default lifecycle hook configuration when the plugin bundle includes:

```text
plugin/hooks/hooks.json
```

The AGDF `SessionStart` hook loads:

```text
plugin/meta/agdf-agent-router.md
```

plus the compact AGDF constitution so the skills do not have to carry the whole control model alone.

### How Codex chooses AGDF skills

Codex does not need a generated repository `AGENTS.md` to recognize AGDF plugin skills.
The Codex plugin runtime provides the discovery surface:

```text
plugin/.codex-plugin/plugin.json
plugin/skills/*/SKILL.md
plugin/meta/agdf-agent-router.md
plugin/hooks/hooks.json
```

At runtime:

1. Codex sees the installed plugin skills through their `name` and `description`.
2. The AGDF `SessionStart` hook loads the shared router and compact constitution.
3. The router describes which AGDF skill should be primary for which kind of request.
4. The individual skill descriptions provide additional trigger hints.

For example, a new user intent such as "I want to build X" should route first to `gate-check`, not `qa-gate`.
`qa-gate` is only appropriate when implementation evidence exists and a QA decision is requested or implied.

This is why AGDF generates `AGENTS.md` only for Copilot-style repository instruction loading.
Codex uses plugin discovery plus the AGDF router instead.

For local repository testing, add this repository as a Codex plugin marketplace and then install `agdf`:

```bash
codex plugin marketplace add arndtgold/ai-native-governance-delivery-framework
codex plugin add agdf --marketplace agdf
```

This installs AGDF into your Codex environment.

Then start a new Codex thread and ask:

```text
Run an AGDF gate check for this request.
```

For a repository that should keep durable AGDF control state, ask Codex to use the plugin scaffold:

```text
Create an AGDF control scaffold for this repository.
```

Or initialize live control files directly:

```bash
npm create agdf@latest init
```

This promotes the AGDF templates into live files under:

```text
.agdf/control/
```

Check the result before the next governed agent run:

```bash
npm create agdf@latest doctor
npm create agdf@latest doctor --json
npm create agdf@latest gate-check --json
```

`doctor` reports whether the repository has a current gate, a next allowed action, visible evidence, backlog pointer, source-of-truth registry, Context Graph hygiene and valid quality contracts.

`gate-check` derives the operative decision from that state:

```text
open | blocked
```

including current gate, missing approval, allowed outputs, forbidden outputs and next allowed action.

That is the `0.2.0` control boundary: AGDF no longer only asks agents to follow rules; it gives the repository a checkable control state.

## Codex for one repository only

Run this inside the target Git repository when AGDF should be available only from that project:

```bash
npm create agdf@latest codex
```

This writes:

```text
.agents/plugins/marketplace.json
plugins/agdf/.codex-plugin/plugin.json
plugins/agdf/skills/**
plugins/agdf/control/**
plugins/agdf/meta/**
```

Then restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

The plugin is then discoverable from that repository's local marketplace.

Other repositories do not get this project-local marketplace unless they also contain:

```text
.agents/plugins/marketplace.json
plugins/agdf/
```

If this repository should also keep durable AGDF control state, run:

```bash
npm create agdf@latest init
npm create agdf@latest doctor
npm create agdf@latest gate-check
```

## GitHub Actions and rollout boundary

GitHub Actions can validate that the Codex, Claude Code and Copilot-facing artefacts are publishable and internally consistent.

GitHub Actions should not run:

```bash
codex plugin marketplace add
claude plugin add
```

as a rollout step.

Those commands configure the current machine or user environment.
In GitHub Actions they would only affect the temporary runner and would not install AGDF for repository users.

Use GitHub Actions for:

- validating `plugin/.codex-plugin/plugin.json`
- validating `.claude-plugin/marketplace.json`
- running `node plugin/scripts/check-runtime-integrity.mjs`
- publishing `create-agdf`
- validating generated Copilot-facing files
- validating that generated skill references match `plugin/meta/agdf-plugin.definition.json`

Use the documented CLI commands on the target developer machine or workspace setup path to install AGDF into Codex or Claude Code.

## Claude Code

Install the plugin in a normal terminal where the Claude Code CLI is installed:

```bash
claude plugin add arndtgold/ai-native-governance-delivery-framework
```

This installs AGDF into Claude Code.

Then start with:

```text
/gate-check
```

Codex and Claude Code plugin skill names are intentionally unprefixed because the plugin itself provides the `agdf` namespace.

This avoids labels such as:

```text
agdf:agdf-gate-check
```

For Codex and Claude Code, the intended plugin-scoped reference is:

```text
agdf:gate-check
```

or, when invoked as a slash command inside the plugin surface:

```text
/gate-check
```

The shared router source is:

```text
plugin/meta/agdf-agent-router.md
```

Copilot-facing `AGENTS.md` content is rendered from the same source with Copilot skill prefixes.

The routing table itself is calculated from:

```text
plugin/meta/agdf-plugin.definition.json
```

using:

```text
surface.skillPrefix + skillSet.slug
```

## Why AGENTS.md is not the Codex or Claude Code router

AGDF does not generate a separate `AGENTS.md` or `CLAUDE.md` routing file for Codex or Claude Code because both surfaces consume AGDF through the installable plugin package.

For Codex, the plugin manifest is:

```text
plugin/.codex-plugin/plugin.json
```

For Claude Code, the same `plugin/` root is used as the installable plugin package.

Both surfaces load AGDF skills, hooks and shared meta instructions from the plugin bundle.
Their skill routing comes from the plugin router and skill descriptions, not from a target-repository `AGENTS.md`.

GitHub Copilot is different.
Copilot does not currently consume AGDF through the same plugin package.
For Copilot, AGDF must be delivered as repository-local instructions and visible repository skills.

Therefore the Copilot bootstrap writes the following files into the target repository:

```text
AGENTS.md
.github/copilot-instructions.md
.github/instructions/**
.github/skills/**
```

This creates a clear ownership boundary:

- `plugin/` is the AGDF plugin runtime for Codex and Claude Code.
- `AGENTS.md` belongs to the target repository.
- `.github/skills/**` exposes Copilot-visible AGDF skills.
- `.agdf/control/**` stores durable AGDF control state owned by the target repository.

AGDF must not treat `AGENTS.md` as part of the Codex or Claude Code plugin package.
It is a generated or manually merged Copilot-facing repository file.
When `npm create agdf@latest both` writes `AGENTS.md`, that file is still for Copilot-style repository instruction loading; the Codex plugin continues to use `plugin/.codex-plugin/plugin.json`, `plugin/skills/**`, hooks and `plugin/meta/agdf-agent-router.md`.

If the target repository already has an `AGENTS.md`, the Copilot bootstrap writes `AGENTS.agdf.md` instead.
The repository owner must then merge the AGDF section intentionally, because the existing file may already contain project-specific rules for build commands, tests, architecture, security constraints or team workflow.

## GitHub Copilot

Run this inside the target Git repository you want to equip with AGDF:

```bash
npm create agdf@latest copilot
```

If the repository does not yet contain `AGENTS.md`, this writes:

```text
AGENTS.md
.agdf/control/templates/**
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.github/skills/**
```

If `AGENTS.md` already exists, AGDF keeps it unchanged and writes:

```text
AGENTS.agdf.md
.agdf/control/templates/**
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.github/skills/**
```

Then merge the AGDF instructions from `AGENTS.agdf.md` into your existing `AGENTS.md`.
Use `--force` only if you intentionally want to replace existing generated files.

When the repository is ready to own AGDF state as source-of-truth artefacts, run:

```bash
npm create agdf@latest init
npm create agdf@latest doctor
npm create agdf@latest gate-check
```

After bootstrapping the target repository, verify that Copilot sees the checked-in instructions:

```text
/instructions
```

You should see at least:

```text
AGENTS.md
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.agdf/control/templates/AGDF_RUN.md
.agdf/control/AGDF_RUN.md after npm create agdf@latest init
.github/skills/agdf-runtime-contract.md
.github/skills/agdf-gate-check/SKILL.md
```

Then trigger AGDF naturally, for example:

```text
Run an AGDF gate check for this request.
```

For code-changing runs, the repository skills also include:

```text
.github/skills/agdf-code-review/SKILL.md
```

## Combined surfaces

If one target repository should support Copilot-oriented repo files plus plugin usage in Claude Code or Codex, run:

```bash
npm create agdf@latest both
```

This writes the Codex repository-local marketplace plus the same Copilot-facing files as the `copilot` target:

```text
.agents/plugins/marketplace.json
plugins/agdf/**
AGENTS.md or AGENTS.agdf.md if an AGENTS.md already exists
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.github/skills/**
```

For Claude Code you still install the plugin separately if you want Claude Code plugin support outside the checked-in Copilot files:

```bash
claude plugin add arndtgold/ai-native-governance-delivery-framework
```

## Validate the runtime in this repository

For this repository itself:

```bash
node plugin/scripts/check-runtime-integrity.mjs
```

For the website:

```bash
cd pages
npm install
npm run check
npm run build
```
