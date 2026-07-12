# Solution Design: Reliable npm Bootstrap Readiness

## Status

- status: pending_approval
- approval: Approval: SD not yet provided
- derived_from: `.agdf/control/artefacts/npm-bootstrap-registry-readiness/PRD.md`
- delivery_mode: structured_slice
- owner: agent

## Architecture Decision

Extend the existing release workflow and `create-agdf` smoke-test owner. Do not introduce a
new bootstrap package, alternate command syntax, client-side retry wrapper, or second command
registry.

## Design

### Release Readiness

1. Keep the existing publication order: `create-agdf`, readiness check, `@agdf/cli`, readiness check.
2. Refactor the duplicated readiness shell logic into one bounded workflow helper or equivalent
   shared step while preserving clear package-specific failure output.
3. After exact-version visibility is confirmed, explicitly query `@agdf/cli@latest` and require
   the release version.
4. Run readiness queries with a disposable npm cache in the workflow so the release signal is not
   based on a stale runner cache.

### Clean Bootstrap Smoke Test

1. Add a focused Node.js test/helper under the existing `create-agdf/scripts/` test owner.
2. Execute the published-package command shape in an isolated temporary directory and isolated
   npm cache, using a deterministic test target that does not touch real user configuration.
3. Assert the expected package resolution and generated output.
4. Remove temporary files and fail with a phase-specific message when resolution or bootstrap fails.

The test must invoke the public command shape exactly as documented. It must not add
`--prefer-online`, cache flags, extra arguments, or an alternate wrapper command.

### Command Contract

Keep `create-agdf/bin/create-agdf.js` as the owner of the public command strings. Extend the
existing package smoke assertions to cover the invariant command forms across generated help,
package README output, installation references, and website examples. Reuse the existing
asset-sync and runtime-integrity checks rather than creating a separate command manifest.

## Ownership And Source Of Truth

| Concern | Authoritative owner |
|---|---|
| Package publication and readiness | `.github/workflows/publish-agdf.yml` |
| Public CLI command strings | `create-agdf/bin/create-agdf.js` |
| Package smoke coverage | `create-agdf/scripts/smoke-test.js` and focused helper under `create-agdf/scripts/` |
| Generated package assets | `create-agdf/scripts/sync-package-assets.js` |
| Runtime/package consistency | `plugin/scripts/check-runtime-integrity.mjs` |
| User-facing installation guidance | existing `INSTALL.md`, package READMEs, and site references |

## Compatibility

- `npx --yes @agdf/cli@latest codex` and all existing target commands remain unchanged.
- No package names, versioning model, or gate semantics change.
- No real user configuration is accessed by CI smoke tests.
- The solution reduces release-side timing risk but cannot control a stale cache already held by
  an arbitrary user's local npm client.

## Test Design

- unit/contract assertions for the unchanged public command forms;
- workflow smoke assertions for publication order, bounded retries, exact version and `latest`;
- isolated clean-client bootstrap test;
- existing `npm --prefix create-agdf run smoke-test`;
- existing `npm --prefix agdf run smoke-test`;
- `node plugin/scripts/check-runtime-integrity.mjs`;
- package dry-runs and `git diff --check`.

## Risks And Mitigations

- Risk: duplicated workflow logic drifts. Mitigation: one shared readiness helper and focused
  source assertions.
- Risk: clean-client test changes real configuration. Mitigation: disposable HOME, npm cache,
  and target directory with explicit cleanup.
- Risk: users interpret CI readiness as control over all local caches. Mitigation: report only
  bounded release readiness and keep claims limited to the tested clean-client path.

## Required Next Step

Review this SD and provide exact approval:

`Approval: SD`
