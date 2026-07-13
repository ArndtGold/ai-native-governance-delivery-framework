# @agdf/cli

Primary command-line interface for the AI Governance & Delivery Framework.

AGDF helps teams turn AI-assisted software work into governed, reviewable
delivery: repository-local agent instructions, durable control files,
machine-checkable gate decisions and consistent setup for Codex, Claude Code,
GitHub Copilot and OpenCode.

- Website: https://agdf.iself.eu
- Repository: https://github.com/arndtgold/ai-native-governance-delivery-framework
- Installation guide: https://github.com/arndtgold/ai-native-governance-delivery-framework/blob/main/INSTALL.md

## Prerequisites

AGDF is distributed as an npm package and run through `npx`, so Node.js and
npm must be installed first (npm bundles `npx`).

Check whether you already have them:

```bash
node -v
npm -v
```

If either command fails, install Node.js 18 or later:

- **Windows:** `winget install OpenJS.NodeJS.LTS`
- **macOS:** `brew install node`
- **Linux (Debian/Ubuntu):** `sudo apt install nodejs npm`
- **Any OS:** download the LTS installer from https://nodejs.org

Then re-run `node -v` and `npm -v` to confirm before continuing.

## Quick Start

Commands are either **global** (installed once per machine through the
coding agent's own CLI, then available in every repository you open with
that agent) or **repository** (write files only into the current
repository). Run only the command(s) for the agent(s) you actually use.

### Codex

```bash
npx --yes @agdf/cli@latest codex
```

**Global.** Requires the `codex` CLI on `PATH`. Runs
`codex plugin marketplace add/upgrade` and `codex plugin add` to install the
`agdf` plugin (skills, hooks, control templates) for every repository opened
in Codex.

```bash
npx --yes @agdf/cli@latest codex-repo
```

**Repository.** Writes a repo-local marketplace and plugin copy instead of
using the global one: `.agents/plugins/marketplace.json` and
`plugins/agdf/**` (skills, hooks, meta, control templates).

### Claude Code

```bash
npx --yes @agdf/cli@latest claude
```

**Global only.** Requires the `claude` CLI on `PATH`. Runs
`claude plugin marketplace add/update` and `claude plugin install/update` to
install the `agdf` plugin for every repository opened in Claude Code. There
is no repository-local Claude Code plugin copy.

### OpenCode

```bash
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status
```

**Global.** Adds the AGDF npm plugin as a user-wide hook in
`~/.config/opencode/opencode.json` (or `$OPENCODE_CONFIG_DIR`). `opencode-status`
verifies the install.

```bash
npx --yes @agdf/cli@latest opencode-repo
```

**Repository.** Writes `opencode.json` (or a fragment if one already
exists), repository instructions, native AGDF skills and control templates
under `.opencode/`.

### GitHub Copilot

```bash
npx --yes @agdf/cli@latest copilot
```

**Repository only** — Copilot does not consume the AGDF plugin package, so
there is no global command. Writes `AGENTS.md` (or `AGENTS.agdf.md`
alongside an existing `AGENTS.md`), plus `.github/copilot-instructions.md`,
`.github/instructions/agdf-governance.instructions.md` and
`.github/skills/**`.

### Both repository-local surfaces at once

```bash
npx --yes @agdf/cli@latest both
```

Runs `codex-repo` and `copilot` together.

Install the AGDF CLI globally when `agdf` should be available as a regular
shell command on your machine:

```bash
npm install -g @agdf/cli
agdf init
agdf doctor
agdf gate-check --status-card
agdf gate-check --json
```

## What This Package Does

`@agdf/cli` is the stable user-facing wrapper. It delegates to `create-agdf`
for the shared implementation, so AGDF setup commands and scaffold-compatible
`npm create` usage stay aligned.

Use it to:

- install AGDF instructions and skills into a target repository
- initialize durable `.agdf/control` state when a repository should own it
- run compact interactive checks such as `gate-check --status-card` and deterministic validators such as `doctor` and `gate-check --json`
- prepare Codex, GitHub Copilot and OpenCode surfaces from the same source of
  truth while keeping Claude Code installation explicitly separate

## Durable Control State

When a repository owns live AGDF control state,
`.agdf/control/MASTER_BACKLOG.md` is its human-readable steering view. It links
active work to the current UR, Brownfield Review, PRD, SD, TP, QA and OR
artefacts without turning the backlog into a second specification.

- [View the canonical Master Backlog template](https://github.com/ArndtGold/ai-native-governance-delivery-framework/blob/main/plugin/control/templates/MASTER_BACKLOG.md)
- [Read the durable control-state guide](https://github.com/ArndtGold/ai-native-governance-delivery-framework/blob/main/plugin/control/README.md)

Each repository maintains its own live backlog. The linked template is the
authoritative reusable format, not AGDF's internal project backlog.

## Commands

| Command | Purpose |
| --- | --- |
| `codex` | Install the AGDF plugin globally for Codex. |
| `codex-repo` | Add a repository-local Codex marketplace and AGDF plugin copy. |
| `claude` | Install the AGDF plugin globally for Claude Code. |
| `opencode` | Install the AGDF npm plugin as a user-wide OpenCode hook. |
| `opencode-status` | Report OpenCode global config, package loadability, session signals and repository surface presence. |
| `opencode-repo` | Add OpenCode repository instructions, native skills, permissions and control templates. |
| `copilot` | Add `AGENTS.md`, Copilot instructions, skills and control templates. |
| `both` | Prepare the repository-file and plugin surfaces together. |
| `init` | Create durable `.agdf/control` files when repository-owned control state is required. |
| `config --language de\|en` | Persist the project language without creating the full control scaffold. |
| `doctor [--json]` | Check whether the durable control state is consistent and actionable. |
| `gate-check [--json]` | Report the current gate, blockers and next permitted action. |
| `gate-check --status-card` | Print compact interactive gate status without full JSON. |
| `delivery-map [--json]` | Report artefact relationships, evidence, risks and Context Graph effects. |
| `delivery-path-search --surface <name> [--json]` | Compare bounded high-impact delivery paths before implementation; advisory only. |

Examples:

```bash
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status --json
npx --yes @agdf/cli@latest opencode-repo
npx --yes @agdf/cli@latest config --language en
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest doctor
npx --yes @agdf/cli@latest gate-check --status-card
npx --yes @agdf/cli@latest gate-check --json
npx --yes @agdf/cli@latest delivery-map --json
npx --yes @agdf/cli@latest delivery-path-search --surface codex --json
npx --yes @agdf/cli@latest delivery-path-search --surface codex --generate-candidates --json
```

The CLI validators provide deterministic evidence for agents and automation.
They do not replace AGDF skill judgement or user approvals.

Delivery Path Search requires selected canonical `.agdf/control/runs/<run_id>/RUN_STATE.md` state with explicit
allowed and forbidden actions. Codex and Claude Code are executable, tool-enforced
reference evaluators in this release. Copilot and OpenCode expose the shared skill
and contract as instruction-only surfaces until a conforming executable evaluator
is available.

Candidate generation is opt-in for Codex and Claude Code. It supplements deterministic
candidates, uses separate hard budgets, and exposes provenance, rejection and failure;
it never grants gate permission or silently switches providers.

Use `--persist` only when the redacted decision should become durable scope
evidence. It writes `DELIVERY_PATH_SEARCH.json` and
`DELIVERY_PATH_SEARCH.md` under `.agdf/control/artefacts/<scope>/`. Then run
`gate-check`; the recommendation never grants permission.

## Surface Notes

See [Quick Start](#quick-start) for what each command installs and its
global-vs-repository scope. One extra OpenCode detail: repository
instructions, native skills and control files remain the AGDF source of truth
even after the global hook is installed. The generated OpenCode skills live
under `.opencode/skills/` and load on demand through OpenCode's native `skill`
tool; use `agdf-gate-check` first for new build/change intent.

`npm create agdf@latest -- ...` remains supported through the companion
`create-agdf` package for scaffold-style setup flows.
