# create-agdf

Bootstrap AGDF repository instructions and a machine-checkable control loop for one repository.

## Usage

Preferred long-term CLI shape:

```bash
npx --yes @agdf-runtime/cli@latest codex
npx --yes @agdf-runtime/cli@latest opencode
npx --yes @agdf-runtime/cli@latest init
npx --yes @agdf-runtime/cli@latest config --language en
npx --yes @agdf-runtime/cli@latest doctor
npx --yes @agdf-runtime/cli@latest gate-check --json
```

Backward-compatible scaffold usage:

```bash
npm create agdf@latest -- codex
npm create agdf@latest -- copilot
npm create agdf@latest -- opencode
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

- `codex` writes a repository-local Codex marketplace under `.agents/plugins/` and a local AGDF plugin copy under `plugins/agdf/`
- `copilot` writes `AGENTS.md`, Copilot custom instructions under `.github/`, visible repository skills under `.github/skills/`, and AGDF control templates under `.agdf/control/`
- `opencode` writes `opencode.json`, `.opencode/AGDF.md`, prefixed OpenCode agents under `.opencode/agents/`, explicit edit/bash permissions, and AGDF control templates under `.agdf/control/`
- `both` writes the Codex repository-local marketplace plus the Copilot-facing repository files
- `config` writes or updates only `.agdf/control/config.json` for an already installed plugin or an existing repository

If the target repository already has an `AGENTS.md`, `create-agdf` preserves it and writes `AGENTS.agdf.md` instead of replacing your existing instructions. Merge the AGDF fragment into your current `AGENTS.md` when you want Copilot to load both instruction sets. The generated `.github/copilot-instructions.md` keeps Copilot pointed at `AGENTS.md`, `.github/skills/` and `.agdf/control/` without duplicating the full AGDF rule model. Use `--force` only when you explicitly want to overwrite generated files.

Use the `codex` target when AGDF should be available only inside one repository instead of being installed as a personal/global Codex plugin.

After `npm create agdf@latest -- codex`, restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

Use the `opencode` target when AGDF should be available to OpenCode from repository files:

```bash
npm create agdf@latest -- opencode
```

OpenCode loads the AGDF npm plugin from `opencode.json`, AGENTS-style rules from `.opencode/AGDF.md`, explicit `edit`/`bash` permissions and the `agdf-` prefixed agents under `.opencode/agents/`.
If `opencode.json` already exists, AGDF keeps it unchanged and writes `opencode.agdf.json` as a merge fragment.
Using OpenCode's plugin installer for `create-agdf` can add the npm plugin entry, but AGDF still needs the repository instructions and agents. The `opencode` target writes the npm plugin entry and the repository files together.

## Control scaffold

The generated `.agdf/control/templates/` files are reusable starting points for durable AGDF state:

- `AGDF_RUN.md` for the current run dashboard
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

- `.agdf/control/AGDF_RUN.md`
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

Use `gate-check` to derive the next process decision from the doctor result and `AGDF_RUN.md`:

```bash
npm create agdf@latest -- gate-check
npx --yes create-agdf@latest gate-check --json
```

The gate check reports `open | blocked`, the current gate, blocking reason, missing exact approval, allowed outputs, forbidden outputs, next allowed action, evidence references and the embedded doctor report.

Together, `init`, `doctor` and `gate-check --json` turn AGDF from an instruction layer into a repository control system when durable control state is needed. For normal fresh requests, the agent-native path can stay lighter: draft the minimal UR in the response, request `Approval: UR`, and use CLI validators only when machine-readable proof is useful.

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

## Publishing

The repository publishes this package from `create-agdf/` via the GitHub Actions workflow `.github/workflows/publish-create-agdf.yml`.

The primary user-facing CLI package is published separately from `agdf/` and delegates to this package through the shared `create-agdf/cli` export.

- Create or update the version in `create-agdf/package.json`
- Push a matching git tag in the form `create-agdf-v<version>`
- Ensure the repository secret `NPM_TOKEN` exists with publish rights for `create-agdf`

## Trademark Notice

AGDF(TM) and AI Governance & Delivery Framework(TM) are marks of Arndt Gold.
Use of the AGDF name and marks is governed by the project trademark guidelines.
