# @agdf/cli

Primary command-line interface for the AI Governance & Delivery Framework.

AGDF helps teams turn AI-assisted software work into governed, reviewable
delivery: repository-local agent instructions, durable control files,
machine-checkable gate decisions and consistent setup for Codex, Claude Code,
GitHub Copilot and OpenCode.

- Website: https://agdf.iself.eu
- Repository: https://github.com/arndtgold/ai-native-governance-delivery-framework
- Installation guide: https://github.com/arndtgold/ai-native-governance-delivery-framework/blob/main/INSTALL.md

## Quick Start

Use the primary CLI when command semantics matter:

```bash
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest doctor
npx --yes @agdf/cli@latest gate-check --json
npx --yes @agdf/cli@latest opencode
```

Install globally when AGDF should be available as a regular command on your
machine:

```bash
npm install -g @agdf/cli
agdf init
agdf doctor
agdf gate-check --json
```

`npm create agdf@latest -- ...` remains supported through the companion
`create-agdf` package for scaffold-style setup flows.

## What This Package Does

`@agdf/cli` is the stable user-facing wrapper. It delegates to `create-agdf`
for the shared implementation, so AGDF setup commands and scaffold-compatible
`npm create` usage stay aligned.

Use it to:

- install AGDF instructions and skills into a target repository
- initialize durable `.agdf/control` state when a repository should own it
- run deterministic validators such as `doctor` and `gate-check --json`
- prepare Codex, Claude Code, GitHub Copilot or OpenCode surfaces from the same
  source of truth
