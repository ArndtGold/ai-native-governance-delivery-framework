# create-agdf

Bootstrap AGDF into the coding-agent surface and repository where work actually happens. It installs or generates the surface-specific guidance, skills and optional durable control files that help teams make scope, approvals, evidence and delivery state visible.

AGDF is useful when AI-assisted work can affect an existing system and a team needs a traceable answer to: what is allowed next, who approved it and what evidence supports it. It is deliberately not a substitute for engineering judgement, security review, tests, product ownership or human acceptance. For the framework's fit, limits and examples, start with the [project overview](../README.md).

## Quick start

If you use Codex, this is the recommended first installation:

```bash
npx --yes @agdf/cli@latest codex
```

Restart Codex, open a new task in the repository you want to work in, and describe the intended change. AGDF starts with the smallest permitted governance step; it does not make implementation automatic.

Use a different target when Codex is not your agent surface:

| Surface or goal | Start with | What it gives you |
|---|---|---|
| Claude Code | `npx --yes @agdf/cli@latest claude` | The AGDF plugin for Claude Code. |
| OpenCode, user-wide discovery | `npx --yes @agdf/cli@latest opencode` | The npm plugin and global native skills; repository governance remains opt-in. |
| OpenCode, one repository | `npx --yes @agdf/cli@latest opencode-repo` | Repository instructions, native skills, permissions and control templates. |
| GitHub Copilot | `npm create agdf@latest -- copilot` | Repository instructions, visible skills and control templates. |
| Durable control state in an existing setup | `npx --yes @agdf/cli@latest init` | Live `.agdf/control/` state when the repository explicitly needs it. |

For prerequisites, all surface-specific flows and operational boundaries, use the authoritative [installation guide](../INSTALL.md). Do not run `init` merely to ask a fresh question: an agent can first clarify the request and ask for `Approval: UR` when durable control state is needed.

## Full command reference

The commands below are the complete package reference. The Quick Start above is the recommended entry point; these commands cover the remaining surfaces, repository-local variants and validation paths.

Preferred long-term CLI shape:

```bash
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest codex-repo
npx --yes @agdf/cli@latest claude
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status
npx --yes @agdf/cli@latest opencode-repo
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest config --language en
npx --yes @agdf/cli@latest doctor
npx --yes @agdf/cli@latest gate-check --status-card
npx --yes @agdf/cli@latest gate-check --json
```

Backward-compatible scaffold usage:

```bash
npm create agdf@latest -- codex
npm create agdf@latest -- codex-repo
npm create agdf@latest -- claude
npm create agdf@latest -- copilot
npm create agdf@latest -- opencode
npm create agdf@latest -- opencode-status
npm create agdf@latest -- opencode-repo
npm create agdf@latest -- both
npm create agdf@latest -- init
npm create agdf@latest -- config --language en
npm create agdf@latest -- doctor
npm create agdf@latest -- gate-check
```

Optional flags:

- `--dir <path>` write into a specific directory
- `--force` overwrite existing generated files
- `--language <de|en>` or `--lang <de|en>` persist the preferred AGDF artefact and chat language

If no language is provided, `create-agdf` derives the preference from the local system locale (`LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE` or the Node.js runtime locale) and falls back to `en`.

## Targets and existing AGENTS.md

- `codex` installs the AGDF plugin globally for Codex
- `codex-repo` writes a repository-local Codex marketplace under `.agents/plugins/` and a local AGDF plugin copy under `plugins/agdf/`
- `claude` installs the AGDF plugin globally for Claude Code
- `copilot` writes `AGENTS.md`, Copilot custom instructions under `.github/`, visible repository skills under `.github/skills/`, and AGDF control templates under `.agdf/control/`
- `opencode` installs the AGDF npm plugin and nine native skills as a user-wide OpenCode surface
- `opencode-status` reports OpenCode global config, package loadability, global native-skill completeness, session signals and repository surface presence
- `opencode-repo` writes `opencode.json`, `.opencode/AGDF.md`, prefixed native OpenCode skills under `.opencode/skills/`, explicit question/edit/bash/skill permissions, and AGDF control templates under `.agdf/control/`
- `both` writes the Codex repository-local marketplace plus the Copilot-facing repository files
- `config` writes or updates only `.agdf/control/config.json` for an already installed plugin or an existing repository

If the target repository already has an `AGENTS.md`, `create-agdf` preserves it and writes `AGENTS.agdf.md` instead of replacing your existing instructions. Merge the AGDF fragment into your current `AGENTS.md` when you want Copilot to load both instruction sets. The generated `.github/copilot-instructions.md` keeps Copilot pointed at `AGENTS.md`, `.github/skills/` and `.agdf/control/` without duplicating the full AGDF rule model. Use `--force` only when you explicitly want to overwrite generated files.

Use the `codex-repo` target when AGDF should be available only inside one repository instead of being installed as a personal/global Codex plugin.

After `npm create agdf@latest -- codex-repo`, restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

Use the `opencode` target to install the AGDF npm plugin as a user-wide OpenCode hook:

```bash
npx --yes @agdf/cli@latest opencode
```

Then verify the visible installation state:

```bash
npx --yes @agdf/cli@latest opencode-status --json
```

The status command reports global configuration, package loadability, global native-skill completeness, session signals and whether the current repository has `.opencode/AGDF.md` plus the `agdf-gate-check` surface. It does not infer an active OpenCode session from config alone.
In JSON schema version 1, `repository_surface.gate_check_agent` remains a deprecated compatibility alias for the native `gate_check_skill` path so existing status consumers keep working during the agent-to-skill migration.

Use the `opencode-repo` target when AGDF should be available to OpenCode from repository files:

```bash
npm create agdf@latest -- opencode-repo
```

OpenCode loads the AGDF npm plugin and global native skills from global OpenCode config, plus repository instructions from `.opencode/AGDF.md`, explicit `question`/`edit`/`bash`/`skill` permissions and canonical `agdf-` project skills under `.opencode/skills/`. Global adapters use the collision-safe `agdf-global-` prefix. AGDF for OpenCode has a global discoverability layer installed with `npx --yes @agdf/cli@latest opencode` and a repository-local governance surface generated by `opencode-repo`.
Those generated skills load on demand through OpenCode's native `skill` tool. Use `agdf-gate-check` first for new build/change intent or unclear approval.
The built-in `question` tool can present a gate choice, but `.agdf/control/` and exact post-response validation remain authoritative; technical permission and auto-mode outcomes never approve an AGDF gate. If `opencode.json` already exists, AGDF keeps it unchanged and writes `opencode.agdf.json` as a merge fragment. Preserve any explicit `permission.question` decision when reviewing that fragment; `deny` uses exact-text fallback.
The global layer makes the nine native AGDF skills discoverable, but does not activate repository governance by itself. Global skills fail closed until the current repository has `.opencode/AGDF.md`, `.opencode/skills/agdf-gate-check/SKILL.md` and `.agdf/control/`. Use `opencode-repo` to write that repository surface.

## Control scaffold

The generated `.agdf/control/templates/` files are reusable starting points for durable AGDF state:

- `runs/<run_id>/RUN_STATE.md` for each canonical current run dashboard
- `MASTER_BACKLOG.md` for active delivery pointers
- `templates/artefacts/` for durable UR, PRD, SD, TP and QA report artefact templates
- `SOT_REGISTRY.md` for one source of truth per domain
- `CONTEXT_GRAPH.md` for durable Brownfield findings, decisions, risks, evidence and exit criteria
- `AGENT_QUALITY_CONTRACTS.json` for reusable block, revise and warning conditions

Use `init` to promote those templates into live control files when the repository should own durable AGDF control state:

```bash
npm create agdf@latest -- init
```

This writes:

- `.agdf/control/runs/<run_id>/RUN_STATE.md`
- `.agdf/control/MASTER_BACKLOG.md`
- `.agdf/control/config.json`
- `.agdf/control/templates/artefacts/UR.md`
- `.agdf/control/templates/artefacts/PRD.md`
- `.agdf/control/templates/artefacts/SD.md`
- `.agdf/control/templates/artefacts/TP.md`
- `.agdf/control/templates/artefacts/QA_REPORT.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

`config.json` stores `artifact_language` and `chat_language` for governed work in the target repository. Runtime rules stay English so all AGDF surfaces share the same control contract.

For a normal fresh request, `init` is not the required first move. The agent-native path can draft the minimal UR in the response and ask for the exact approval text `Approval: UR`. Write or initialize `.agdf/control` only when durable repository-owned control state is explicitly wanted, already in use, or needed for deterministic setup/CI evidence. Before Brownfield Review, later gates or implementation, AGDF still requires the persisted or linked artefacts named by the Runtime Contract.

For an existing repository where the plugin is already installed and only the language preference is missing or wrong, use the lighter config target:

```bash
npm create agdf@latest -- config --language en
```

Use `doctor` to check whether the live control state is actionable:

```bash
npm create agdf@latest -- doctor
npx --yes create-agdf@latest doctor --json
```

The doctor reports missing live control files, missing current gate, missing next allowed action, empty evidence, empty backlog pointer, empty source-of-truth registry, duplicate active SoT rows and invalid quality contracts. It exits non-zero only for blocking control failures.

Use `gate-check` to derive the next process decision from the selected canonical
`.agdf/control/runs/<run_id>/RUN_STATE.md`. Use `--run <run_id>` or `AGDF_RUN_ID` when several runs are active:

```bash
npm create agdf@latest -- gate-check
npx --yes create-agdf@latest gate-check --json
```

The gate check reports `open | blocked`, the current gate, blocking reason, missing exact approval, allowed outputs, forbidden outputs, next allowed action, evidence references and the embedded doctor report.

Use `gate-check --status-card` for compact interactive output, especially in OpenCode where shell output is highly visible. Keep `gate-check --json` for automation, CI, regression evidence and audit trails.

Use `delivery-path-search` only for high-impact planning decisions with several materially different next steps:

```bash
npx --yes @agdf/cli@latest delivery-path-search --surface codex --json
```

The runtime uses bounded best-first Delivery Path Search, not MCTS. It is read-only and advisory: the result must be checked by canonical `gate-check`. Codex and Claude Code are executable, tool-enforced evaluator adapters and support opt-in `--generate-candidates`; generated proposals supplement the deterministic baseline and are deterministically validated before evaluation. Copilot and OpenCode reuse the same skill and contracts as instruction-only surfaces until conforming executable adapters are available.

Requirements and boundaries:

- run it only with selected canonical `.agdf/control/runs/<run_id>/RUN_STATE.md` state
- the current control state must expose legal next actions
- Codex CLI must be installed and authenticated for `--surface codex`
- Claude Code CLI must be installed and authenticated for `--surface claude`
- `--model <id>` optionally selects the Codex or Claude evaluator model
- `--persist` writes redacted `DELIVERY_PATH_SEARCH.json` and `.md` evidence under the current scope
- `--fixture <path>` is for deterministic contract tests, not a production evaluator
- Copilot and OpenCode have shared workflow mappings but no executable native evaluator in this release
- cost units are rubric values used for bounded comparison, not measured provider currency

The result is either one recommendation or `no_safe_recommendation`. In both cases run canonical `gate-check` afterwards.

`gate-check --json` and `delivery-map --json` also expose a `status_card` object. It is a compact projection of the current control state: current gate, allowed and forbidden actions, blocker, next skill, next permissible step and `quality_outlook`. `next_step` is process permission; `quality_outlook` is the next meaningful quality-improvement focus and does not unlock gates.

Together, `init`, `doctor` and `gate-check --json` turn AGDF from an instruction layer into a repository control system when durable control state is needed. For normal fresh requests, keep the path lighter: draft the minimal UR in the response, request `Approval: UR`, and use CLI validators only when machine-readable proof is useful.

## Single source of truth

The repository-facing AGDF sources are maintained in:

- `plugin/meta/agdf-agent-router.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/skills/`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/control/`

Skill routing is rendered from `skillSet.slug`, `useFor`, `boundary` and the target surface `skillPrefix`; it is not maintained as separate Codex, Claude Code and Copilot routing tables.

The published package assets are generated from these repository sources only at pack/publish time. The package does not keep a second manually maintained template tree.

```bash
npm run sync-package-assets
```

To verify the rendered routing locally, run:

```bash
npm run test:routing
```

The routing test installs `both` into a temporary target repository and checks that plugin routing stays unprefixed while Copilot routing receives the configured `agdf-` prefix.

## Project, contribution and support

This README is the package guide. Keep framework rationale, limits and examples in the [project overview](../README.md); keep target-specific installation in [INSTALL.md](../INSTALL.md); and use [RELEASE.md](../RELEASE.md) only when maintaining a published AGDF release.

Non-sensitive feedback, examples and contributions are welcome through [GitHub Issues](https://github.com/ArndtGold/ai-native-governance-delivery-framework/issues). To validate a local package change before proposing it, run:

```bash
npm --prefix create-agdf run smoke-test
```

The repository is licensed under [Apache-2.0](../LICENSE). No separate public `CONTRIBUTING.md`, `SECURITY.md` or private security-reporting channel is currently published. Do not treat a public issue as a private vulnerability disclosure.

## Publishing

The repository publishes this package and the primary user-facing `@agdf/cli` wrapper as one coupled AGDF release.
See the root `RELEASE.md` for the sequenced `agdf-v<version>` workflow and npm token requirements.

## Trademark Notice

AGDF(TM) and AI Governance & Delivery Framework(TM) are marks of Arndt Gold.
Use of the AGDF name and marks is governed by the project trademark guidelines.
