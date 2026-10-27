# T-002 Evidence: Claude Companion Descriptor and Manifest Projection

Run: `agdf-begleiter-companion-20261025-01`
Task: T-002 (SDD-01; scenario SCN-015 in part, its integrity half follows in T-005)
Recorded: 2026-10-26
Result: done

## Changes

- `plugins/agdf/host-templates/claude/companion/companion.json` (new, build-only): `{ "schema_version": 1, "hooks": "./companion/hooks.json" }`.
- `scripts/public-plugin/manifest.js`:
  - New `validateClaudeCompanionDescriptor`. It requires exactly `schema_version` 1 and a `./companion/*.json` hooks path, and fails with `AGDF_CLAUDE_COMPANION_DESCRIPTOR_INVALID`.
  - `createClaudePluginManifest(definition, { runtimeProfile, companion })` adds `hooks` only for the runtime profile and only from the validated descriptor.
- `scripts/sync-package-assets.js`: reads the descriptor from the source plugin's build-only `host-templates/claude/companion/` and passes it to the runtime Claude manifest projection.
- `packages/cli/scripts/public-plugin-test.js` asserts that:
  - the source Claude manifest declares no `hooks`;
  - the shared definition's `claude` block has no `hooks`;
  - the runtime projection declares `./companion/hooks.json` and keeps `mcpServers`;
  - a missing, redirected or extended descriptor is rejected.

## Verification

- `node packages/cli/scripts/public-plugin-test.js`: passed.
- `npm run build:prepare`: passed (65.6 s). The generated runtime `.claude-plugin/plugin.json` now ends with `"mcpServers": "./mcp/claude.mcp.json", "hooks": "./companion/hooks.json"`.
- The following files show no diff against the start of this task:
  - `plugins/agdf/.claude-plugin/plugin.json` (source manifest);
  - `plugins/agdf/meta/agdf-plugin.definition.json` (shared definition).
- `node packages/cli/scripts/claude-plugin-mcp-test.js`: passed.
- `check-runtime-integrity.mjs`: ok in source mode and in installed mode on the generated runtime plugin.
- `node scripts/payload-budget.js`: the Copilot runtime profile observes 397 files and 3,495,539 bytes, equal to the baseline. The Copilot payload is unchanged.

## Known Intermediate State

Until T-004 and T-005 add and copy the companion files, the generated runtime manifest declares `./companion/hooks.json` without the file. No build from this state is installed or published.

`compatibility:check` reports a changed source snapshot. Its records are renewed in T-007, as planned.
