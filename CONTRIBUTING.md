# Contributing to AGDF

Thank you for your interest in AGDF. Contributions in English or German are welcome. German remains
the primary language for governance discussions and domain-specific rationale; technical
identifiers, commands and exact AGDF approval values remain unchanged.

## Choose the right channel

- Questions, early ideas and open design proposals: [Discussions](https://github.com/ArndtGold/ai-native-governance-delivery-framework/discussions)
- Reproducible defects or implementation-ready proposals: [Issue forms](https://github.com/ArndtGold/ai-native-governance-delivery-framework/issues/new/choose)
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

- `plugin/` and its documented Runtime Contracts are canonical for plugin semantics.
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

If AI assistance materially influenced content, code, design, analysis or tests, briefly describe:

- which parts received material assistance;
- what a human reviewed or adjusted;
- which tests or other evidence support the result.

Do not submit raw prompts, hidden reasoning, tokens, credentials, secrets or unnecessary private
data. Disclosure should support review and human accountability, not collect confidential working
material.

## Review and decisions

`@ArndtGold` is currently the sole maintainer. Review comments, requested changes or closure should
make the technical or governance reason understandable. A pull request does not create acceptance,
merge or release commitment. See [GOVERNANCE.md](GOVERNANCE.md).
