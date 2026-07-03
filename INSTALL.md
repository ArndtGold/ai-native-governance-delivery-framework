# Installation and Setup

AGDF supports two primary usage surfaces:

1. **GitHub Copilot** through `AGENTS.md` and visible skills under `.github/skills/`
2. **Claude Code** through the installable plugin in `plugin/`

## Prerequisites

- Node.js and npm installed
- For **GitHub Copilot**: GitHub Copilot CLI or the Copilot Coding Agent
- For **Claude Code**: Claude Code CLI
- Run bootstrap commands inside the target Git repository, not inside this AGDF repository

## GitHub Copilot

Run this inside the target Git repository you want to equip with AGDF:

```bash
npm create agdf@latest copilot
```

If the repository does not yet contain `AGENTS.md`, this writes:

- `AGENTS.md`
- `.github/skills/**`

If `AGENTS.md` already exists, AGDF keeps it unchanged and writes:

- `AGENTS.agdf.md`
- `.github/skills/**`

Then merge the AGDF instructions from `AGENTS.agdf.md` into your existing `AGENTS.md`. Use `--force` only if you intentionally want to replace existing generated files.

After bootstrapping the target repository, verify that Copilot sees the checked-in instructions:

```text
/instructions
```

You should see at least:

- `AGENTS.md`
- `.github/skills/agdf-gate-check/SKILL.md`

Then trigger AGDF naturally, for example:

```text
Run an AGDF gate check for this request.
```

## Claude Code

Install the plugin in a normal terminal where the Claude Code CLI is installed:

```bash
claude plugin add arndtgold/ai-native-governance-delivery-framework
```

This installs AGDF into Claude Code. Then start with:

```text
/agdf-gate-check
```

## Both surfaces

If one target repository should support both Copilot and Claude-oriented repo files, run:

```bash
npm create agdf@latest both
```

This follows the same AGENTS behavior as the `copilot` target:

- `AGENTS.md` or `AGENTS.agdf.md` if an `AGENTS.md` already exists
- `.github/skills/**`

For Claude Code itself you still install the plugin separately:

```bash
claude plugin add arndtgold/ai-native-governance-delivery-framework
```

## Validate the runtime in this repository

For this repository itself:

```bash
node plugin/scripts/check-runtime-integrity.mjs
```

For the website:

```bash
cd pages
npm install
npm run check
npm run build
```
