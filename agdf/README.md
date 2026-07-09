# @agdf/cli

Primary command-line interface for the AI Governance & Delivery Framework.

AGDF helps teams turn AI-assisted software work into governed, reviewable
delivery: repository-local agent instructions, durable control files,
machine-checkable gate decisions and consistent setup for Codex, Claude Code,
GitHub Copilot and OpenCode.

- Website: https://agdf.iself.eu
- Repository: https://github.com/arndtgold/ai-native-governance-delivery-framework
- Installation guide: https://github.com/arndtgold/ai-native-governance-delivery-framework/blob/main/INSTALL.md

## Quick Start

Run commands inside the target Git repository:

```bash
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest copilot
```

Install globally when AGDF should be available as a regular command on your
machine:

```bash
npm install -g @agdf/cli
agdf init
agdf doctor
agdf gate-check --json
```

## What This Package Does

`@agdf/cli` is the stable user-facing wrapper. It delegates to `create-agdf`
for the shared implementation, so AGDF setup commands and scaffold-compatible
`npm create` usage stay aligned.

Use it to:

- install AGDF instructions and skills into a target repository
- initialize durable `.agdf/control` state when a repository should own it
- run deterministic validators such as `doctor` and `gate-check --json`
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
| `codex` | Add a repository-local Codex marketplace and AGDF plugin copy. |
| `opencode` | Add OpenCode instructions, agents, permissions and the npm plugin entry. |
| `copilot` | Add `AGENTS.md`, Copilot instructions, skills and control templates. |
| `both` | Prepare the repository-file and plugin surfaces together. |
| `init` | Create durable `.agdf/control` files when repository-owned control state is required. |
| `config --language de\|en` | Persist the project language without creating the full control scaffold. |
| `doctor [--json]` | Check whether the durable control state is consistent and actionable. |
| `gate-check [--json]` | Report the current gate, blockers and next permitted action. |
| `delivery-map [--json]` | Report artefact relationships, evidence, risks and Context Graph effects. |

Examples:

```bash
npx --yes @agdf/cli@latest config --language en
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest doctor
npx --yes @agdf/cli@latest gate-check --json
npx --yes @agdf/cli@latest delivery-map --json
```

The CLI validators provide deterministic evidence for agents and automation.
They do not replace AGDF skill judgement or user approvals.

## Surface Notes

- **Codex:** `codex` prepares a repository-local marketplace. For a global
  installation, use the Codex plugin marketplace commands documented on the
  [AGDF website](https://agdf.iself.eu/#setup-codex).
- **Claude Code:** install the AGDF plugin with the Claude Code CLI; this is not
  an `@agdf/cli` bootstrap target.
- **OpenCode:** `opencode` writes the npm plugin entry together with the
  repository instructions, agents and permissions AGDF needs.
- **GitHub Copilot:** `copilot` writes repository instructions and skills. If
  `AGENTS.md` already exists, AGDF preserves it and writes `AGENTS.agdf.md` for
  manual merging.

`npm create agdf@latest -- ...` remains supported through the companion
`create-agdf` package for scaffold-style setup flows.
