# AGENTS.md

## Role
You are working on the AGDF source repository.
Optimize for trustworthy changes to the plugin, Copilot bootstrap assets, and the supporting documentation around them.

## Repository Scope
- This repository is the source for:
  - the Claude plugin under `plugin/`
  - the Copilot bootstrap package under `create-agdf/`
  - the website and documentation that explain both surfaces
- The installable Copilot `AGENTS.md` content is maintained in `plugin/meta/agdf-copilot-agents.md`.

## Working Rules
- Treat this repository as brownfield: inspect existing runtime artefacts, installer behavior, and docs before changing structure.
- Reuse before create. Do not introduce a second source of truth for runtime rules, skills, or installable Copilot instructions.
- Keep cross-surface changes coherent. If behavior changes for AGDF runtime or bootstrap output, update the relevant source, generator, and directly affected docs together.
- Do not manually edit generated package output when a source file or sync script is the real authority.
- Do not commit, push, or open pull requests automatically.

## Source of Truth
- Copilot installable root instructions: `plugin/meta/agdf-copilot-agents.md`
- Shared runtime rules: `plugin/meta/agdf-runtime-contract.md`
- Claude and Copilot skill sources: `plugin/skills/`
- Copilot package asset sync: `create-agdf/scripts/sync-package-assets.js`

## Validation
- Run the smallest relevant checks for the area you changed.
- For runtime or skill changes, use `node plugin/scripts/check-runtime-integrity.mjs`.
- For Copilot bootstrap changes, use `npm --prefix create-agdf run smoke-test`.
