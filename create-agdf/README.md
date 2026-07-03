# create-agdf

Bootstrap AGDF for one repository.

## Usage

```bash
npm create agdf@latest copilot
npm create agdf@latest claude
npm create agdf@latest both
```

Optional flags:

- `--dir <path>` write into a specific directory
- `--force` overwrite existing generated files

## Targets

- `copilot` writes `AGENTS.md` and `.github/copilot-instructions.md`
- `claude` writes `AGENTS.md` and prints the Claude plugin installation step
- `both` writes both instruction files and prints both next steps

## Publishing

The repository publishes this package from `create-agdf/` via the GitHub Actions workflow `.github/workflows/publish-create-agdf.yml`.

- Create or update the version in `create-agdf/package.json`
- Push a matching git tag in the form `create-agdf-v<version>`
- Ensure the repository secret `NPM_TOKEN` exists with publish rights for `create-agdf`
