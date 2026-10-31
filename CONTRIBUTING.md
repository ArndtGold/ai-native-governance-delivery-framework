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

- `plugins/agdf/` and its documented Runtime Contracts are canonical editable sources for plugin
  semantics. The source directory is deliberately runtime-free and is not an installable plugin.
- `packages/core/` owns control logic and validators; `packages/cli/` owns commands, installers and host composition.
- `packages/mcp-server/` owns MCP transport. Root `scripts/` owns shared build and release orchestration; `evals/` owns evaluations.
- `packages/cli/generated/` is produced by the existing synchronization and packaging processes and
  must not be edited as a primary source.
- Installed Codex, Claude Code or OpenCode caches are not a repository source and must not be used as
  an implementation path.
- `INSTALL.md` owns installation and runtime-support statements.
- `RELEASE.md` and `.github/workflows/publish-agdf.yml` own the release process.
- `LICENSE`, `NOTICE` and `TRADEMARKS.md` own legal and trademark boundaries.

When a change affects canonical and derived files, use the existing synchronization process and
inspect the exact diff afterward.

## Verify the change proportionately

The [shared Quality Contract](plugins/agdf/meta/contracts/quality.md) owns test selection,
evidence reuse and verification completion. This guide applies that contract to contributions;
the canonical npm scripts and `scripts/ci-plan.mjs` own the executable inventory.

Before running checks, identify the changed behavior, acceptance criteria, affected consumers,
shared fixtures or harnesses, and existing coverage. Choose the smallest sufficient local checks
and explain their scope in the PR. Unknown impact requires broader checking or a visible gap.
Changing test files alone does not require every test suite: run those tests and the relevant
consumer or harness checks. Test-file locality alone does not establish that impact is bounded.

| Decision point | Expected verification |
|---|---|
| Local feedback | Run the relevant existing tests and affected generation, contract or documentation checks. |
| Push / PR creation | Include all intended sources and fixtures; report local results, failures and pending CI honestly. A local full-suite pass is not a routine prerequisite. |
| Merge | All required CI jobs must pass for the current PR head or the merge candidate associated with that head. Check actual coverage against the canonical inventory. |
| Additional local full run | Use when it answers a concrete unresolved question, reproduces a broad regression or supports an explicitly required acceptance. Explain the added value. |

Reuse applicable results with their tested source identity, environment and accessible evidence.
A new commit requires assessing what changed, not automatically repeating the full local plan.
Rerun affected checks when their inputs change; retain an explicit gap when applicability is
uncertain. CI for an older head does not establish the result for the current head.

For example, a contributor-guide-only change can use the existing community-health checks and
local link/diff review. Runtime or shared harness changes need their relevant consumer and
failure-path checks. Host-facing claims still require suitable host evidence.

### Before pushing

Review the staged diff, including new scripts, fixtures and required derived files. Working-copy
success can depend on untracked files or ignored build output; include every required input in
the commit. Then push the branch and open the PR with the selected checks and their results.
Full required regression remains in PR/merge CI; pending, failed or unavailable CI is not a pass
and must be resolved before merge. Do not remove tests or weaken checks to shorten execution.

### Optional full snapshot verification

Both commands below run the **full** shared verification plan in a disposable checkout:

```bash
# Check the staged index when an isolated index check is specifically needed.
npm run verify:commit

# Check a concrete commit when full local reproduction is specifically needed.
npm run verify:commit -- --ref HEAD
```

Choose the input that answers the question; there is no default requirement to run both.
These are not quick commit-completeness checks. They reinstall dependencies, build payloads,
verify evidence, test packages and run smoke suites. They do not modify the source checkout or
index, install Git hooks or change Git configuration. A pass proves the selected snapshot on
that Node/OS only; required CI coverage and any native qualification remain separate.

[Verification reference](docs/development/verification.md) explains setup, build versus prepare,
SDK updates, compatibility evidence and reproduction of individual CI partitions. Set up only
the prerequisites needed by the selected checks. A documentation edit does not automatically
require building every distribution or installing the plugin into a host.

## Install the current checkout for local testing

Use a local install only when testing the selected host is part of the change:

```bash
npm run install:codex
npm run install:claude
npm run install:copilot
npm run install:opencode
```

Node.js 22 or later, npm and the selected agent CLI are required; Copilot also requires Git.
Run only the command for that host. It prepares the checkout and changes the selected host's
AGDF installation. Use the guided setup described in [INSTALL.md](INSTALL.md#guided-plugin-and-mcp-setup-unreleased-development-preview)
when MCP registration is needed; plugin installation and MCP registration are separate effects.
Do not register the runtime-free repository root or `plugins/agdf/` as a plugin marketplace.

Local preparation reuses valid MCP UI builds and automatically rebuilds missing or stale required
resources before packaging. It validates the rebuilt output before installation. If the separate UI
build dependencies are missing, run `npm --prefix packages/control-ui ci --ignore-scripts` and retry.

After a successful install, restart the selected host and start a fresh task or session.
Installation verification does not prove restarted-host loading, repository activation or
UAT. Report those observations separately when required. [INSTALL.md](INSTALL.md) owns setup,
consent, upgrade recovery and published host-support statements; [RELEASE.md](RELEASE.md) owns
release qualification and publication.

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
