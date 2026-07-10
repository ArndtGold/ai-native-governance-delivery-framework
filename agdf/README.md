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

Prepare one repository:

```bash
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest codex-repo
npx --yes @agdf/cli@latest claude
npx --yes @agdf/cli@latest opencode-repo
npx --yes @agdf/cli@latest copilot
```

Install the user-wide OpenCode hook:

```bash
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status
```

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
| `opencode-repo` | Add OpenCode repository instructions, subagents, permissions and control templates. |
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
```

The CLI validators provide deterministic evidence for agents and automation.
They do not replace AGDF skill judgement or user approvals.

Delivery Path Search requires live `.agdf/control/AGDF_RUN.md` state with explicit
allowed and forbidden actions. Codex and Claude Code are executable, tool-enforced
reference evaluators in this release. Copilot and OpenCode expose the shared skill
and contract as instruction-only surfaces until a conforming executable evaluator
is available.

Use `--persist` only when the redacted decision should become durable scope
evidence. It writes `DELIVERY_PATH_SEARCH.json` and
`DELIVERY_PATH_SEARCH.md` under `.agdf/control/artefacts/<scope>/`. Then run
`gate-check`; the recommendation never grants permission.

## Surface Notes

- **Codex:** `codex` installs the AGDF plugin globally for Codex, while
  `codex-repo` prepares a repository-local marketplace for testing AGDF in one
  repository.
- **Claude Code:** `claude` installs the AGDF plugin globally for Claude Code.
- **OpenCode:** `opencode` installs the user-wide npm plugin hook, while
  `opencode-status` verifies global config, package loadability, session signals
  and repository surface presence. `opencode-repo` writes the repository instructions, agents and permissions
  AGDF needs. Repository instructions, generated agents and control files remain
  the AGDF source of truth. The generated
  OpenCode agents are intentional `mode: subagent` workflow controls, not
  `.opencode/skills/` entries or primary menu agents; use `@agdf-gate-check`
  as the visible entry point for new build/change intent.
- **GitHub Copilot:** `copilot` writes repository instructions and skills. If
  `AGENTS.md` already exists, AGDF preserves it and writes `AGENTS.agdf.md` for
  manual merging.

`npm create agdf@latest -- ...` remains supported through the companion
`create-agdf` package for scaffold-style setup flows.
