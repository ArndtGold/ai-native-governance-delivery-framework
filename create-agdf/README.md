# create-agdf

Bootstrap AGDF for one repository.

## Usage

```bash
npm create agdf@latest copilot
npm create agdf@latest both
```

Optional flags:

- `--dir <path>` write into a specific directory
- `--force` overwrite existing generated files

## Targets and existing AGENTS.md

- `copilot` writes `AGENTS.md` and visible repository skills under `.github/skills/`
- `both` writes the same Copilot-facing files and reminds you to install the Claude plugin separately

If the target repository already has an `AGENTS.md`, `create-agdf` preserves it and writes `AGENTS.agdf.md` instead of replacing your existing instructions. Merge the AGDF fragment into your current `AGENTS.md` when you want Copilot to load both instruction sets. Use `--force` only when you explicitly want to overwrite generated files.

## Single source of truth

The AGDF skill contracts are maintained in `plugin/skills/`.
The published package assets are generated from the repository sources only at pack/publish time. The package does not keep a second manually maintained template tree.

```bash
npm run sync-package-assets
```

## Publishing

The repository publishes this package from `create-agdf/` via the GitHub Actions workflow `.github/workflows/publish-create-agdf.yml`.

- Create or update the version in `create-agdf/package.json`
- Push a matching git tag in the form `create-agdf-v<version>`
- Ensure the repository secret `NPM_TOKEN` exists with publish rights for `create-agdf`
