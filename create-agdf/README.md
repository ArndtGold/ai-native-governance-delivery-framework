# create-agdf

Bootstrap AGDF repository instructions for one repository.

## Usage

```bash
npm create agdf@latest codex
npm create agdf@latest copilot
npm create agdf@latest both
npm create agdf@latest init
npm create agdf@latest doctor
npm create agdf@latest gate-check
```

Optional flags:

- `--dir <path>` write into a specific directory
- `--force` overwrite existing generated files

## Targets and existing AGENTS.md

- `codex` writes a repository-local Codex marketplace under `.agents/plugins/` and a local AGDF plugin copy under `plugins/agdf/`
- `copilot` writes `AGENTS.md`, Copilot custom instructions under `.github/`, visible repository skills under `.github/skills/`, and AGDF control templates under `.agdf/control/`
- `both` writes the Codex repository-local marketplace plus the Copilot-facing repository files

If the target repository already has an `AGENTS.md`, `create-agdf` preserves it and writes `AGENTS.agdf.md` instead of replacing your existing instructions. Merge the AGDF fragment into your current `AGENTS.md` when you want Copilot to load both instruction sets. The generated `.github/copilot-instructions.md` keeps Copilot pointed at `AGENTS.md`, `.github/skills/` and `.agdf/control/` without duplicating the full AGDF rule model. Use `--force` only when you explicitly want to overwrite generated files.

Use the `codex` target when AGDF should be available only inside one repository instead of being installed as a personal/global Codex plugin.

After `npm create agdf@latest codex`, restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

## Control scaffold

The generated `.agdf/control/templates/` files are reusable starting points for durable AGDF state:

- `AGDF_RUN.md` for the current run dashboard
- `MASTER_BACKLOG.md` for active delivery pointers
- `SOT_REGISTRY.md` for one source of truth per domain
- `CONTEXT_GRAPH.md` for durable Brownfield findings, decisions, risks, evidence and exit criteria
- `AGENT_QUALITY_CONTRACTS.json` for reusable block, revise and warning conditions

Use `init` to promote those templates into live control files:

```bash
npm create agdf@latest init
```

This writes:

- `.agdf/control/AGDF_RUN.md`
- `.agdf/control/MASTER_BACKLOG.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

Use `doctor` to check whether the live control state is actionable:

```bash
npm create agdf@latest doctor
npm create agdf@latest doctor --json
```

The doctor reports missing live control files, missing current gate, missing next allowed action, empty evidence, empty backlog pointer, empty source-of-truth registry, duplicate active SoT rows and invalid quality contracts. It exits non-zero only for blocking control failures.

Use `gate-check` to derive the next process decision from the doctor result and `AGDF_RUN.md`:

```bash
npm create agdf@latest gate-check
npm create agdf@latest gate-check --json
```

The gate check reports `open | blocked`, the current gate, blocking reason, missing exact approval, allowed outputs, forbidden outputs, next allowed action, evidence references and the embedded doctor report.

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

- Create or update the version in `create-agdf/package.json`
- Push a matching git tag in the form `create-agdf-v<version>`
- Ensure the repository secret `NPM_TOKEN` exists with publish rights for `create-agdf`
