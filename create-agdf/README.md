# create-agdf

Bootstrap AGDF repository instructions for one repository.

## Usage

```bash
npm create agdf@latest copilot
npm create agdf@latest both
```

Optional flags:

- `--dir <path>` write into a specific directory
- `--force` overwrite existing generated files

## Targets and existing AGENTS.md

- `copilot` writes `AGENTS.md`, visible repository skills under `.github/skills/`, and AGDF control templates under `.agdf/control/`
- `both` writes the same Copilot-facing files and reminds you to install the Claude Code plugin separately

If the target repository already has an `AGENTS.md`, `create-agdf` preserves it and writes `AGENTS.agdf.md` instead of replacing your existing instructions. Merge the AGDF fragment into your current `AGENTS.md` when you want Copilot to load both instruction sets. Use `--force` only when you explicitly want to overwrite generated files.

Codex is supported through the AGDF Codex plugin in `plugin/.codex-plugin/plugin.json`, not through `create-agdf` package output.

## Control scaffold

The generated `.agdf/control/templates/` files are starting points for durable AGDF state:

- `AGDF_RUN.md` for the current run dashboard
- `MASTER_BACKLOG.md` for active delivery pointers
- `SOT_REGISTRY.md` for one source of truth per domain
- `CONTEXT_GRAPH.md` for durable Brownfield findings, decisions, risks, evidence and exit criteria
- `AGENT_QUALITY_CONTRACTS.json` for reusable block, revise and warning conditions

Copy or promote templates into live `.agdf/control/` files only when the target repository is ready to own them as source-of-truth artefacts.

## Single source of truth

The repository-facing AGDF sources are maintained in:

- `plugin/meta/agdf-copilot-agents.md`
- `plugin/skills/`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/control/`

The published package assets are generated from these repository sources only at pack/publish time. The package does not keep a second manually maintained template tree.

```bash
npm run sync-package-assets
```

## Publishing

The repository publishes this package from `create-agdf/` via the GitHub Actions workflow `.github/workflows/publish-create-agdf.yml`.

- Create or update the version in `create-agdf/package.json`
- Push a matching git tag in the form `create-agdf-v<version>`
- Ensure the repository secret `NPM_TOKEN` exists with publish rights for `create-agdf`
