# Contributing to AGDF

Thank you for your interest in AGDF. Contributions in English or German are welcome. German remains
the primary language for governance discussions and domain-specific rationale; technical
identifiers, commands and exact AGDF approval values remain unchanged.

## Choose the right channel

- Questions, early ideas and open design proposals: [GitHub Discussions](https://github.com/ArndtGold/ai-native-governance-delivery-framework/discussions)
- Reproducible defects or implementation-ready proposals: [GitHub issue forms](https://github.com/ArndtGold/ai-native-governance-delivery-framework/issues/new/choose)
- Suspected vulnerabilities: exclusively through [SECURITY.md](SECURITY.md)
- Code or documentation changes: a pull request following this document

## Before making a change

1. Check whether a related Issue or Discussion already exists.
2. Choose a proportional delivery path. Small changes should stay small; changes to product
   semantics, governance, architecture, persistence or release behavior require the appropriate AGDF
   controls.
3. Identify the canonical source and any derived files.
4. Define which tests and visible evidence will demonstrate the change.

## Canonical and derived paths

- `plugin/` and its documented Runtime Contracts are canonical editable sources for plugin
  semantics. The source directory is deliberately runtime-free and is not an installable plugin.
- `create-agdf/` owns the CLI, installers, packaging and synchronization of derived plugin assets.
- `create-agdf/generated/` is produced by the existing synchronization and packaging processes and
  must not be edited as a primary source.
- Installed Codex, Claude Code or OpenCode caches are not a repository source and must not be used as
  an implementation path.
- `INSTALL.md` owns installation and runtime-support statements.
- `RELEASE.md` and `.github/workflows/publish-agdf.yml` own the release process.
- `LICENSE`, `NOTICE` and `TRADEMARKS.md` own legal and trademark boundaries.

When a change affects canonical and derived files, use the existing synchronization process and
inspect the exact diff afterward.

## Install the current checkout for local testing

From this repository root, install the current checkout into the agent you want to test:

```bash
npm run install:codex
npm run install:claude
npm run install:opencode
```

Node.js 18 or later, npm and the selected agent CLI are required. Run only the command for the
selected agent. Each command validates and prepares the current
checkout before changing that agent's global AGDF installation. Codex receives a content-derived
local version so a changed checkout is not mistaken for the previous cache entry. Claude Code uses
the same local marketplace with the canonical project version. OpenCode installs a marker-owned
local package built from this checkout instead of resolving the public npm package.

Do not register the repository root or `plugin/` directly as a Codex or Claude marketplace. The
commands above build one complete runtime-bearing plugin, stage it in the AGDF-owned durable
marketplace and attach installation provenance before invoking the host CLI.

After a successful command, restart the selected host. For Codex, then start a fresh task so the
host loads the new plugin content. The command proves checkout preparation and the existing
installation verification only. It does not prove restarted-host loading, repository activation or
UAT. A later public OpenCode installation replaces the development-local file dependency through
the normal registry path.

These contributor commands are for local development validation. Published installation remains
the `npx --yes @agdf/cli@latest ...` path documented in [INSTALL.md](INSTALL.md).

## Local validation

Choose the commands relevant to your scope. Larger repository changes typically include:

```bash
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
npm --prefix pages run check
git diff --check
```

Community-health files are additionally checked with:

```bash
npm run test:community-health
npm run check:community-health
```

Document the tests performed, visible evidence and deliberately omitted checks. A green test does
not replace required host or UI observation.

## Pull requests

A pull request should:

- explain the problem and intended effect;
- link the related Issue or Discussion;
- identify affected surfaces and canonical or derived paths;
- list tests and visible evidence;
- assess security, compatibility, documentation and release impact;
- name the AGDF run used or justify a proportional exception.

No Contributor License Agreement (CLA) or Developer Certificate of Origin (DCO) is required.

## AI assistance

If AI assistance had a significant effect on content, code, design, analysis or tests, briefly
describe:

- which parts used AI assistance;
- what a human reviewed or adjusted;
- which tests or other evidence support the result.

Do not submit raw prompts, hidden reasoning, tokens, credentials, secrets or unnecessary private
data. Disclosure should support review and human accountability, not collect confidential working
material.

## Review and decisions

`@ArndtGold` is currently the sole maintainer. Review comments, requested changes and closure notes
should explain the technical or governance reason. A pull request does not imply acceptance or a
commitment to merge or release it. See [GOVERNANCE.md](GOVERNANCE.md).
