# Task/Test Plan: Reliable npm Bootstrap Readiness

## Status

- status: pending_approval
- approval: Approval: TP not yet provided
- derived_from: PRD and SD for `npm-bootstrap-registry-readiness`
- created_at: 2026-07-12
- owner: agent

## Objective

Remove the release-side npm readiness gap while preserving every existing public bootstrap
command exactly as documented, with no new user-facing flags or parameters.

## Task Plan

| Task ID | Area | Task | Acceptance Evidence |
|---|---|---|---|
| NBR-01 | Workflow ownership | Refactor the existing release workflow readiness logic into one bounded, readable exact-version helper without changing publication order. | Workflow inspection proves `create-agdf` readiness precedes `@agdf/cli` publication and both readiness checks remain bounded. |
| NBR-02 | Latest-tag readiness | Add explicit verification that `@agdf/cli@latest` resolves to the release version before the workflow reports readiness. | CI/source test covers exact version, `latest` match, mismatch, and timeout failure output. |
| NBR-03 | Clean client | Add an isolated clean-client bootstrap smoke test under `create-agdf/scripts/`, using disposable HOME, npm cache, target directory, and deterministic fake surface executables. | Test executes the unchanged public command shape and leaves no real user configuration changes. |
| NBR-04 | Bootstrap evidence | Verify package resolution, target dispatch, and expected generated output for the selected representative targets; cover the shared command contract for all documented targets where fixtures are deterministic. | Focused test report distinguishes registry resolution, dispatch, and output failures. |
| NBR-05 | Public command contract | Add assertions that public command strings remain unchanged in CLI help, package README/help assets, installation guidance, and generated website examples. | Contract test fails on added flags, extra parameters, or syntax drift. |
| NBR-06 | Asset synchronization | Keep authoritative command ownership in `create-agdf/bin/create-agdf.js` and synchronize derived package assets through the existing sync path. | Runtime integrity, package smoke, and generated-source comparison pass. |
| NBR-07 | Documentation | Update release/maintainer documentation only to describe internal readiness evidence; do not add user-side flags, retries, or cache-clearing instructions. | Documentation inspection confirms unchanged public commands and no workaround requirement. |
| NBR-08 | Verification and review | Run focused tests, package smoke tests, runtime integrity, package dry-runs, diff checks, and record final task coverage. | Complete command log, clean diff, and TP coverage matrix available for QA. |

## Delivery Sequence

1. NBR-01–NBR-02: workflow readiness and `latest` verification.
2. NBR-03–NBR-04: isolated clean-client bootstrap evidence.
3. NBR-05–NBR-07: command contract and documentation consistency.
4. NBR-08: complete validation and review preparation.

## Test Plan

| Test ID | Covers | Method | Expected Result |
|---|---|---|---|
| NBR-T01 | NBR-01, NBR-02 | Static workflow smoke assertions plus shell-level fixture inputs for exact version, `latest`, mismatch, and timeout. | Release fails closed on incomplete registry readiness and reports the observed state. |
| NBR-T02 | NBR-03, NBR-04 | Execute the published CLI from a temporary directory with isolated npm cache and fake target executable. | Exact documented command resolves and dispatches without touching real user configuration. |
| NBR-T03 | NBR-05, NBR-06 | Scan authoritative and generated command surfaces and run existing asset/runtime checks. | Public command forms remain unchanged and derived assets stay synchronized. |
| NBR-T04 | NBR-07, NBR-08 | Run package smoke tests, runtime integrity, package dry-runs, and `git diff --check`. | Full validation passes with no undocumented workaround or parameter added. |

## Required Validation

```bash
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf pack --dry-run
npm --prefix agdf pack --dry-run
git diff --check
```

The clean-client smoke test must use the public command shape exactly as documented. It must
not add `--prefer-online`, cache flags, retry flags, or alternate wrapper syntax.

## Brownfield Implementation Boundary

After `Approval: TP`, implementation preparation must first run Brownfield Analysis against:

- `.github/workflows/publish-agdf.yml`
- `create-agdf/bin/create-agdf.js`
- `create-agdf/scripts/smoke-test.js`
- `create-agdf/scripts/sync-package-assets.js`
- existing package READMEs and `INSTALL.md`
- `plugin/scripts/check-runtime-integrity.mjs`

Implementation remains forbidden until that analysis confirms the reuse path.

## Out Of Scope

- Changing any public `npx --yes @agdf/cli@latest <target>` command.
- Adding user-side npm flags, cache commands, retry instructions, or alternate syntax.
- Adding a second bootstrap package or command registry.
- Changing package names, release tags, AGDF gate semantics, or repository-owned control state.
- Commit, push, PR, or release execution.

## Approval Request

Exact approval required to start implementation preparation:

`Approval: TP`
