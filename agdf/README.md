# agdf

Primary AGDF command-line interface.

Use `agdf` for normal command semantics:

```bash
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest doctor
npx --yes @agdf/cli@latest gate-check --json
npx --yes @agdf/cli@latest opencode
```

Install globally when AGDF should be available as a regular command:

```bash
npm install -g @agdf/cli
agdf init
agdf doctor
agdf gate-check --json
```

`npm create agdf@latest -- ...` remains supported through the companion
`create-agdf` package for scaffold-style setup flows.
