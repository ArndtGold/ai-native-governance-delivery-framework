# Installation and Setup

AGDF supports four usage surfaces:

1. **Codex** through the installable plugin manifest in `plugin/.codex-plugin/plugin.json`
2. **Claude Code** through the installable plugin in `plugin/`
3. **GitHub Copilot** through generated repository files because Copilot does not currently consume the AGDF plugin package
4. **OpenCode** through repository instructions, generated agents, permissions and the `create-agdf` npm plugin

Codex and Claude Code consume AGDF as an installable plugin runtime.
GitHub Copilot consumes AGDF through an `AGENTS.md` bootstrap and visible repository skills.
OpenCode consumes AGDF through AGENTS-style instructions, generated agents, explicit permissions and npm plugin hooks.

Codex is the primary plugin-packaging surface for AGDF.
OpenCode is the reference runtime for showing how AGDF can combine repository instructions, agents, permission gates and plugins in one target surface.
The AGDF control model itself is surface-neutral and is reused for Claude Code, GitHub Copilot and OpenCode.

AGDF is an independent project and is not affiliated with, endorsed by, or sponsored by OpenAI, Anthropic, GitHub or OpenCode.

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

The AGDF `SessionStart` hook activates a compact runtime reminder and references:

```text
plugin/meta/agdf-agent-router.md
```

plus the compact AGDF constitution so the skills do not have to carry the whole control model alone.
It does not print the full router into the chat; the first visible workflow step should still be the appropriate AGDF skill, usually `gate-check` for new build intent.

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
2. The AGDF `SessionStart` hook activates a compact reminder and references the shared router and compact constitution.
3. The router describes which AGDF skill should be primary for which kind of request.
4. The individual skill descriptions provide additional trigger hints.

For example, a new user intent such as "I want to build X" should route first to `gate-check`, not `qa-gate`.
`qa-gate` is only appropriate when implementation evidence exists and a QA decision is requested or implied.

This is why AGDF generates `AGENTS.md` only for Copilot-style repository instruction loading.
Codex uses plugin discovery plus the AGDF router instead.

For global Codex installation, run:

```bash
npx --yes @agdf/cli@latest codex
```

For local repository testing, run:

```bash
npx --yes @agdf/cli@latest codex-repo
```

Then restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

The global command wraps the Codex marketplace installation commands:

```bash
codex plugin marketplace add arndtgold/ai-native-governance-delivery-framework
codex plugin add agdf --marketplace agdf
```

This installs AGDF into your Codex environment.

Then start a new Codex thread and ask:

```text
Run an AGDF gate check for this request.
```

For a normal fresh request, AGDF does not require `init` as a ritual first step. The agent can draft the minimal UR in the response and request the exact approval text `Approval: UR`.

For Brownfield Review, later gated delivery work or implementation, the Runtime Contract still requires the relevant durable or linked artefacts before the process can move on. Create `.agdf/control` files only when the repository should own durable AGDF control state, when that state is already live, or when deterministic setup for scripts, CI or repeatable onboarding is needed.

When durable AGDF control state is explicitly needed, keep the agent-native path primary. Ask Codex to inspect the repository and create the minimal control scaffold:

```text
Create an AGDF control scaffold for this repository.
```

Or initialize live control files directly when you want deterministic scaffolding for scripts, CI setup, repeatable onboarding or repository-owned AGDF control state:

```bash
npm create agdf@latest -- init
```

The primary CLI package is `agdf`. Use it when command semantics matter:

```bash
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest doctor
npx --yes @agdf/cli@latest gate-check --status-card
npx --yes @agdf/cli@latest gate-check --json
```

`npm create agdf@latest -- ...` remains supported for scaffold-style setup.

You can pin the preferred project language during setup:

```bash
npx --yes @agdf/cli@latest init --language de
npx --yes @agdf/cli@latest codex-repo --lang en
npx --yes @agdf/cli@latest config --language en
```

Supported values are `de` and `en`. If no language is provided, `create-agdf` reads the local system locale from `LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE` or the Node.js runtime locale and falls back to `en`.

The selected language is written to:

```text
.agdf/control/config.json
```

AGDF uses `artifact_language` for durable control artefacts and `chat_language` for user-facing responses unless the user explicitly asks otherwise. Runtime rules and internal control contracts remain English so Codex, Claude Code and Copilot share one stable rule surface.
Generated or updated control artefacts stay in files by default; user-facing chat should summarize paths, decisions, blockers and next steps instead of pasting full file bodies.

Use `config` for an existing repository where the plugin is already installed and only the project language preference should be created or changed. Unlike `init`, it writes only `.agdf/control/config.json`.

This promotes the AGDF templates into live files under:

```text
.agdf/control/
```

It also installs reusable artefact templates for `UR`, `PRD`, `SD`, `TP` and `QA_REPORT` under:

```text
.agdf/control/templates/artefacts/
```

Use deterministic validators when you need machine-readable proof, CI or PR evidence, repeatable diagnostics, or an audit trail:

```bash
npm create agdf@latest -- doctor
npx --yes create-agdf@latest doctor --json
npx --yes create-agdf@latest gate-check --json
```

`doctor` reports whether the repository has a current gate, a next allowed action, visible evidence, backlog pointer, source-of-truth registry, Context Graph hygiene and valid quality contracts.

`gate-check` derives the operative decision from that state:

```text
open | blocked
```

including current gate, missing approval, allowed outputs, forbidden outputs and next allowed action.

For interactive handoff, `gate-check --status-card` prints only the compact gate projection. For machine-readable handoff, `gate-check --json` and `delivery-map --json` include a `status_card` projection with the current gate, allowed and forbidden actions, blocking condition, next skill, next permissible step and `quality_outlook`. The quality outlook is advisory: it names the next useful quality improvement, but it does not unlock gates or replace evidence.

These commands are not a required ritual for normal agent work when the agent can inspect the live control files directly.
That is the control boundary: AGDF is agent-native first and CLI-verifiable by design.

## Codex for one repository only

Run this inside the target Git repository when AGDF should be available only from that project:

```bash
npm create agdf@latest -- codex-repo
```

This writes:

```text
.agents/plugins/marketplace.json
.agdf/control/config.json
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

If this repository should also keep durable AGDF control state, let the agent create the scaffold as the next allowed action or run the deterministic setup path directly:

```bash
npm create agdf@latest -- init
npm create agdf@latest -- doctor
npm create agdf@latest -- gate-check
```

Use `--language de|en` or `--lang de|en` on `codex`, `copilot`, `opencode`, `both`, `init` or `config` when the repository should persist an explicit AGDF language preference in `.agdf/control/config.json`. Without the flag, AGDF derives the preference from the local system locale.

## OpenCode

Run this once when you want OpenCode to load the AGDF npm plugin as a user-wide hook:

```bash
npx --yes @agdf/cli@latest opencode
```

Then run this inside each target Git repository you want to equip with AGDF governance files for OpenCode:

```bash
npx --yes @agdf/cli@latest opencode-repo
```

This writes:

```text
opencode.json
.opencode/AGDF.md
.opencode/agdf-runtime-contract.md
.opencode/agents/agdf-*.md
.agdf/control/config.json
.agdf/control/templates/**
```

`opencode.json` contains both:

```json
{
  "plugin": ["create-agdf"],
  "instructions": [".opencode/AGDF.md"],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  }
}
```

OpenCode installs npm plugins automatically at startup and caches them in its OpenCode cache. The `create-agdf` package therefore acts as the npm-loadable AGDF OpenCode plugin, while `.opencode/AGDF.md`, `.opencode/agents/agdf-*.md` and OpenCode permissions keep the repository-specific AGDF routing and execution boundary visible.

AGDF for OpenCode has two layers:

- optional global npm plugin hook through `~/.config/opencode/opencode.json`
- repository-local governance surface through the target repository's `opencode.json`, `.opencode/AGDF.md`, `.opencode/agents/` and `.agdf/control/`

The global install updates `~/.config/opencode/opencode.json` to contain the npm plugin entry:

```json
{
  "plugin": ["create-agdf"]
}
```

The global plugin hook does not replace repository instructions, generated subagents or durable control files. Run `npx --yes @agdf/cli@latest opencode-repo` in each repository where AGDF governance should be active and reviewable.

If `opencode.json` already exists, AGDF keeps it unchanged and writes `opencode.agdf.json` as a merge fragment. Merge its `plugin` and `instructions` entries into the existing OpenCode config so OpenCode loads the AGDF npm plugin and `.opencode/AGDF.md`.

OpenCode also supports project-local plugins under `.opencode/plugins/`, but AGDF's default OpenCode path uses the npm plugin declared in `opencode.json` or, optionally, the same npm plugin declared in global OpenCode config. The generated OpenCode surface uses the `agdf-` prefix because OpenCode project agents do not have the Codex or Claude Code plugin namespace.

OpenCode also makes AGDF's control story visible at runtime: `.opencode/AGDF.md` carries the AGENTS-style rules, `.opencode/agents/` carries the generated AGDF agents, `permission.edit` and `permission.bash` stay on `ask`, and the npm plugin contributes runtime hooks.

The generated `.opencode/agents/agdf-*.md` files intentionally use `mode: subagent`. They are internal workflow-routing controls, not visible primary menu agents and not OpenCode Skills under `.opencode/skills/<name>/SKILL.md`. If users look for a visible entry point, start with `@agdf-gate-check` for new build/change intent or unclear approval; AGDF should remain a governance layer instead of converting those subagents into main agents.

Use `@agdf-gate-check` for new build/change intent or unclear approval before later artefacts or implementation. Use the deterministic validators only when machine-readable proof is useful:

```bash
npx --yes create-agdf@latest doctor --json
npx --yes create-agdf@latest gate-check --status-card
npx --yes create-agdf@latest gate-check --json
npx --yes create-agdf@latest delivery-map --json
```

## GitHub Actions and rollout boundary

GitHub Actions can validate that the Codex, Claude Code, OpenCode and Copilot-facing artefacts are publishable and internally consistent.

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
- validating generated Copilot- and OpenCode-facing files
- validating that generated skill references match `plugin/meta/agdf-plugin.definition.json`

Use the documented CLI commands on the target developer machine or workspace setup path to install AGDF into Codex or Claude Code.

## Claude Code

Install the plugin in a normal terminal where the Claude Code CLI is installed:

```bash
npx --yes @agdf/cli@latest claude
```

This wraps the Claude Code plugin install command:

```bash
claude plugin add arndtgold/ai-native-governance-delivery-framework
```

Language preference is project-local, not global to the Claude Code plugin.
After installing the plugin, run this inside each repository that should keep governed AGDF state:

```bash
npm create agdf@latest -- init --language de
```

Use `--language en` or `--lang en` for English artefacts and chat. If no language flag is provided, `create-agdf` derives the preference from the local system locale and writes it to:

```text
.agdf/control/config.json
```

Claude Code should use that file's `artifact_language` for durable AGDF artefacts and `chat_language` for user-facing responses unless the user explicitly asks otherwise. The plugin runtime and shared control rules remain English.

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
When `npm create agdf@latest -- both` writes `AGENTS.md`, that file is still for Copilot-style repository instruction loading; the Codex plugin continues to use `plugin/.codex-plugin/plugin.json`, `plugin/skills/**`, hooks and `plugin/meta/agdf-agent-router.md`.

If the target repository already has an `AGENTS.md`, the Copilot bootstrap writes `AGENTS.agdf.md` instead.
The repository owner must then merge the AGDF section intentionally, because the existing file may already contain project-specific rules for build commands, tests, architecture, security constraints or team workflow.

## GitHub Copilot

Run this inside the target Git repository you want to equip with AGDF:

```bash
npm create agdf@latest -- copilot
```

Add `--language de|en` or `--lang de|en` if AGDF artefacts and chat responses should follow an explicit project language. Without the flag, `create-agdf` derives the preference from the local system locale and writes it to `.agdf/control/config.json`.

If the repository does not yet contain `AGENTS.md`, this writes:

```text
AGENTS.md
.agdf/control/config.json
.agdf/control/templates/**
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.github/skills/**
```

If `AGENTS.md` already exists, AGDF keeps it unchanged and writes:

```text
AGENTS.agdf.md
.agdf/control/config.json
.agdf/control/templates/**
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.github/skills/**
```

Then merge the AGDF instructions from `AGENTS.agdf.md` into your existing `AGENTS.md`.
Use `--force` only if you intentionally want to replace existing generated files.

When the repository is ready to own AGDF state as source-of-truth artefacts, let the agent initialize the scaffold as the next allowed action or run the deterministic setup path directly:

```bash
npm create agdf@latest -- init
npm create agdf@latest -- doctor
npm create agdf@latest -- gate-check
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
.agdf/control/AGDF_RUN.md after npm create agdf@latest -- init
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
npm create agdf@latest -- both
```

This writes the Codex repository-local marketplace plus the same Copilot-facing files as the `copilot` target:

```text
.agents/plugins/marketplace.json
.agdf/control/config.json
plugins/agdf/**
AGENTS.md or AGENTS.agdf.md if an AGENTS.md already exists
.github/copilot-instructions.md
.github/instructions/agdf-governance.instructions.md
.github/skills/**
```

For Claude Code you still install the plugin separately if you want Claude Code plugin support outside the checked-in Copilot files:

```bash
npx --yes @agdf/cli@latest claude
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
