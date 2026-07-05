# Installation and Setup

AGDF supports three primary usage surfaces:

1. **Codex** through the installable plugin manifest in `plugin/.codex-plugin/plugin.json`
2. **Claude Code** through the installable plugin in `plugin/`
3. **GitHub Copilot** through `AGENTS.md` and visible skills under `.github/skills/`

Codex is the leading plugin surface for AGDF. The AGDF skills and agent instructions are maintained Codex-first and then reused or adapted for Claude Code and GitHub Copilot.

AGDF is a control-first plugin. The skills steer agent behavior during a run; the `plugin/control/` scaffold provides durable repository artefacts for run state, backlog pointers, source-of-truth ownership, Context Graph knowledge and quality contracts.

## Prerequisites

- Node.js and npm installed
- For **Codex**: Codex CLI or the Codex app with plugin support
- For **GitHub Copilot**: GitHub Copilot CLI or the Copilot Coding Agent
- For **Claude Code**: Claude Code CLI
- Run bootstrap commands inside the target Git repository, not inside this AGDF repository

## Codex

AGDF is available as a Codex plugin from the same `plugin/` root used for the Claude plugin.
Codex uses `plugin/.codex-plugin/plugin.json` as the plugin manifest and loads the shared AGDF skills from `plugin/skills/`.
Codex also discovers the default `plugin/hooks/hooks.json` lifecycle config when the plugin bundle includes it. The AGDF SessionStart hook loads `plugin/meta/agdf-agent-router.md` plus the compact constitution so the skills do not have to carry the whole control model alone.

For local repository testing, add this repository as a Codex plugin marketplace and then install `agdf`:

```bash
codex plugin marketplace add arndtgold/ai-native-governance-delivery-framework
codex plugin add agdf --marketplace agdf
```

This installs AGDF into your Codex environment. Use the repository-local setup below when AGDF should be visible only for one target repository.

Then start a new Codex thread and ask:

```text
Run an AGDF gate check for this request.
```

For a repository that should keep durable AGDF control state, ask Codex to use the plugin scaffold:

```text
Create an AGDF control scaffold for this repository.
```

Use `plugin/control/templates/` as the source. In a target repository, live control files usually belong under `.agdf/control/`.

### Codex for one repository only

Run this inside the target Git repository when AGDF should be available only from that project:

```bash
npm create agdf@latest codex
```

This writes:

- `.agents/plugins/marketplace.json`
- `plugins/agdf/.codex-plugin/plugin.json`
- `plugins/agdf/skills/**`
- `plugins/agdf/control/**`
- `plugins/agdf/meta/**`

Then restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

The plugin is then discoverable from that repository's local marketplace. Other repositories do not get this project-local marketplace unless they also contain the generated `.agents/plugins/marketplace.json` and `plugins/agdf/` files.

## GitHub Actions and rollout boundary

GitHub Actions can validate that the Codex, Claude Code and Copilot-facing artefacts are publishable and internally consistent, but they should not run `codex plugin marketplace add` or `claude plugin add` as a rollout step.
Those commands configure the current machine or user environment. In GitHub Actions that would only affect the temporary runner and would not install AGDF for repository users.

Use GitHub Actions for:

- validating `plugin/.codex-plugin/plugin.json`
- validating `.claude-plugin/marketplace.json`
- running `node plugin/scripts/check-runtime-integrity.mjs`
- publishing `create-agdf`

Use the documented CLI commands on the target developer machine or workspace setup path to install AGDF into Codex or Claude Code.

## Claude Code

Install the plugin in a normal terminal where the Claude Code CLI is installed:

```bash
claude plugin add arndtgold/ai-native-governance-delivery-framework
```

This installs AGDF into Claude Code. Then start with:

```text
/gate-check
```

Codex and Claude Code plugin skill names are intentionally unprefixed because the plugin itself provides the `agdf` namespace. This avoids labels such as `agdf:agdf-gate-check`.
The shared router source is `plugin/meta/agdf-agent-router.md`; Copilot `AGENTS.md` is rendered from the same source with Copilot skill prefixes.
The routing table itself is calculated from `plugin/meta/agdf-plugin.definition.json`: `surface.skillPrefix + skillSet.slug`.

## GitHub Copilot

Run this inside the target Git repository you want to equip with AGDF:

```bash
npm create agdf@latest copilot
```

If the repository does not yet contain `AGENTS.md`, this writes:

- `AGENTS.md`
- `.agdf/control/**`
- `.github/copilot-instructions.md`
- `.github/instructions/agdf-governance.instructions.md`
- `.github/skills/**`

If `AGENTS.md` already exists, AGDF keeps it unchanged and writes:

- `AGENTS.agdf.md`
- `.agdf/control/**`
- `.github/copilot-instructions.md`
- `.github/instructions/agdf-governance.instructions.md`
- `.github/skills/**`

Then merge the AGDF instructions from `AGENTS.agdf.md` into your existing `AGENTS.md`. Use `--force` only if you intentionally want to replace existing generated files.

After bootstrapping the target repository, verify that Copilot sees the checked-in instructions:

```text
/instructions
```

You should see at least:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/agdf-governance.instructions.md`
- `.agdf/control/templates/AGDF_RUN.md`
- `.github/skills/agdf-runtime-contract.md`
- `.github/skills/agdf-gate-check/SKILL.md`

Then trigger AGDF naturally, for example:

```text
Run an AGDF gate check for this request.
```

For code-changing runs, the repository skills also include:

- `.github/skills/agdf-code-review/SKILL.md`

## Combined surfaces

If one target repository should support Copilot-oriented repo files plus plugin usage in Claude Code or Codex, run:

```bash
npm create agdf@latest both
```

This writes the Codex repository-local marketplace plus the same Copilot-facing files as the `copilot` target:

- `.agents/plugins/marketplace.json`
- `plugins/agdf/**`
- `AGENTS.md` or `AGENTS.agdf.md` if an `AGENTS.md` already exists
- `.github/copilot-instructions.md`
- `.github/instructions/agdf-governance.instructions.md`
- `.github/skills/**`

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
