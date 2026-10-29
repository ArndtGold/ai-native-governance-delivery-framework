# @agdf/cli

Primary command-line interface for the AI Governance & Delivery Framework.

AGDF helps teams turn AI-assisted software work into governed, reviewable
delivery: repository-local agent instructions, durable control files,
machine-checkable gate decisions and consistent setup for Codex, Claude Code,
GitHub Copilot and OpenCode.

GitHub Copilot and OpenCode are **experimentally supported in 0.20.x**. Both have adapters and
automated regression tests; native qualification is not currently claimed. Tests with simulated
hosts do not establish behavior in an actual Copilot or OpenCode session. See the
[host compatibility report](https://github.com/ArndtGold/ai-native-governance-delivery-framework/blob/main/docs/compatibility/HOST_COMPATIBILITY.md)
for dated evidence and gaps.

- Website: https://agdf.iself.eu
- Repository: https://github.com/arndtgold/ai-native-governance-delivery-framework
- Installation guide: https://github.com/arndtgold/ai-native-governance-delivery-framework/blob/main/INSTALL.md

## Prerequisites

AGDF is distributed as an npm package. Use `npx` for bootstrap or explicit
refresh, or install the wrapper once for repeated local `agdf` checks. Node.js
and npm must be installed first (npm bundles `npx`).

Check whether you already have them:

```bash
node -v
npm -v
```

If either command fails, install Node.js 22 or later:

- **Windows:** `winget install OpenJS.NodeJS.LTS`
- **macOS:** `brew install node`
- **Linux (Debian/Ubuntu):** `sudo apt install nodejs npm`
- **Any OS:** download the LTS installer from https://nodejs.org

Then re-run `node -v` and `npm -v` to confirm before continuing.

## Operating model

- Chat and AGDF skills are the normal interaction surface.
- `.agdf/control/` is the durable source of truth.
- The CLI is a deterministic validator, renderer and automation interface, not a second gate system.

Use `npx ...@latest` for the installation commands below. After global CLI installation, prefer the
local `agdf` executable for repeated gate checks.

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

The runtime plugin also declares AGDF MCP. In the current shared default build, Codex additionally
receives Cockpit through `agdf-cockpit` and a gate-decision MCP App through `agdf`. No separate
`mcp enable` command is needed. Rendering requires host MCP App support and its own native evidence;
production gate-decision click actions remain disabled pending qualification. These repository-build
details do not verify the payload currently resolved by `@agdf/cli@latest`.

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

The runtime plugin declares AGDF MCP without a separate `mcp enable` command. The shared default
build does not enable the Codex Cockpit or gate-decision UI paths in Claude Code. A separate
Claude-specific Cockpit development build exists; it does not establish general Claude Code or
Claude Desktop UI support. See [MCP and UI by host](https://github.com/ArndtGold/ai-native-governance-delivery-framework/blob/main/INSTALL.md#claude-code-and-codex-mcp-and-ui).

### OpenCode

**Experimental support in 0.20.x.**

```bash
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status
```

**Global.** Adds the AGDF npm plugin as a user-wide hook in
`~/.config/opencode/opencode.json` (or `$OPENCODE_CONFIG_DIR`) and installs global native skills
under `skills/agdf-global-*/`. `opencode-status` reports installation and repository activation;
it does not prove behavior in a live session. Restart OpenCode after installation.

```bash
npx --yes @agdf/cli@latest opencode-repo
```

**Repository.** Writes the durable `.agdf/control/config.json` activation marker and control
templates for the globally installed runtime. It does not write `opencode.json` or copy runtime
instructions or skills into `.opencode/`. Existing local assets remain untouched. Run the status
command from that repository, then load `agdf-global-gate-check` for an AGDF delivery request.

### GitHub Copilot

**Experimental support in 0.20.x.**

```bash
npx --yes @agdf/cli@latest copilot
```

**Global.** Registers the AGDF-owned local Git marketplace and installs `agdf@agdf` through
Copilot CLI. Git must be available. If `copilot` is not on `PATH`, the installer uses a pinned
official `@github/copilot` npm package. It verifies plugin identity and every expected enabled
`agdf-` skill against the installed package content.

Restart Copilot and check a fresh session after installation. Installation and skill discovery
do not establish native qualification or support for another Copilot client variant. The installer
leaves repository files untouched. Use `init` separately when a repository should own durable
AGDF control state.

### CLI for repeated checks

Install the AGDF CLI globally when `agdf` should be available as a regular
shell command on your machine:

```bash
npm install -g @agdf/cli
agdf init
agdf doctor
agdf gate-check --status-card
agdf gate-check --approval-envelope
agdf gate-check --json
```

## What This Package Does

`@agdf/cli` is the stable user-facing wrapper. It delegates to `create-agdf`
for the shared implementation, so AGDF setup commands and scaffold-compatible
`npm create` usage stay aligned.

Use it to:

- install AGDF instructions and skills into a target repository
- initialize durable `.agdf/control` state when a repository should own it
- render ready-gate cards with `gate-check --approval-envelope`, run compact status checks with `--status-card`, and produce deterministic evidence with `doctor` or `gate-check --json`
- prepare Codex, GitHub Copilot and OpenCode surfaces from the same source of
  truth while keeping Claude Code installation explicitly separate

## Durable Control State

When a repository owns live AGDF control state,
`.agdf/control/MASTER_BACKLOG.md` is its human-readable steering view. It links
active work to the current UR, Brownfield Review, PRD, SD, TP, QA and OR
artefacts without turning the backlog into a second specification.

- [View the canonical Master Backlog template](https://github.com/ArndtGold/ai-native-governance-delivery-framework/blob/main/plugins/agdf/control/templates/MASTER_BACKLOG.md)
- [Read the durable control-state guide](https://github.com/ArndtGold/ai-native-governance-delivery-framework/blob/main/plugins/agdf/control/README.md)

Each repository maintains its own live backlog. The linked template is the
authoritative reusable format, not AGDF's internal project backlog.

## Commands

| Command | Purpose |
| --- | --- |
| `codex` | Install the AGDF plugin globally for Codex. |
| `codex-repo` | Add a repository-local Codex marketplace and AGDF plugin copy. |
| `claude` | Install the AGDF plugin globally for Claude Code. |
| `opencode` | Experimental in 0.20.x: install the AGDF npm plugin and global native skills for OpenCode. |
| `opencode-status` | Report OpenCode global config, package loadability, session signals and repository surface presence. |
| `opencode-repo` | Experimental in 0.20.x: add durable repository activation and control templates for the global OpenCode runtime. |
| `copilot` | Experimental in 0.20.x: install the AGDF plugin globally through Copilot CLI and verify its skills. |
| `init` | Create durable `.agdf/control` files when repository-owned control state is required. |
| `config --language <tag>` | Persist a BCP 47 project language such as `de`, `en` or `fr-CA` without creating the full control scaffold. |
| `doctor [--json]` | Check whether the durable control state is consistent and actionable. |
| `gate-check [--json]` | Report the current gate, blockers and next permitted action. |
| `gate-check --status-card` | Print compact interactive gate status without full JSON. |
| `delivery-map [--json]` | Report artefact relationships, evidence, risks and Context Graph effects. |
| `delivery-path-search --surface <name> [--json]` | Compare bounded high-impact delivery paths before implementation; advisory only. |
| `run-create --run <run_id>` | Create a canonical run-scoped `RUN_STATE.md`. |
| `run-migrate [--run <run_id>]` | Explicitly migrate legacy run state into the canonical run-scoped layout. |
| `run-render-legacy --run <run_id>` | Render the selected canonical run as a non-authoritative legacy projection. |
| `run-update --run <run_id> --revision <revision_id>` | Record a deliberate edit of the run state or its artefacts as a new sealed revision. |
| `run-step --run <run_id> --revision <revision_id> --step <step>` | Record one standard transition such as UR registration, Mode/Slice route, evidence or Code Review. |
| `run-present --run <run_id> --gate <gate> --revision <revision_id>` | Prepare the exact approval presentation for the current gate. |
| `run-approve --run <run_id> --gate <gate> --revision <revision_id> --presentation <id> --response "Approval: <gate>"` | Record a deliberate gate approval for the presented revision. |
| `run-recovery --run <run_id> --action <inspect\|preview\|apply>` | Inspect, preview and apply recovery of a run whose seal no longer matches. |
| `run-close --action <preview\|apply>` | End active runs as `superseded` or `abandoned`: preview first, then apply with the exact phrase `Close runs: <preview_id>`; closures are final. |

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
agdf run-close --action preview --run payment-limit-v1 --outcome superseded --reason "Replaced by the limit redesign" --successor-run payment-limit-v2
agdf run-close --action apply --preview-id 3f2a9c1e --confirmation "Close runs: 3f2a9c1e"
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

See [Quick Start](#quick-start) for what each command installs and its global-vs-repository scope.
Copilot and OpenCode remain experimental in 0.20.x. OpenCode loads global native skills from
`skills/agdf-global-*/` in its configuration directory; `.agdf/control/` owns durable repository
state. Load `agdf-global-gate-check` through OpenCode's native `skill` tool for an AGDF delivery
request. Copilot loads its `agdf-` skills from the installed plugin, not a generated repository
projection. Neither installation establishes behavior in a fresh host session.

`npm create agdf@latest -- ...` remains supported through the companion
`create-agdf` package for scaffold-style setup flows.
