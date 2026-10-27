# T-005 Evidence: Generation and Integrity

Run: `agdf-begleiter-companion-20261025-01`
Task: T-005 (SDD-01, SDD-02; scenarios SCN-015 and SCN-016, which T-006 registers as repository tests)
Recorded: 2026-10-26
Result: done

## Changes

- `scripts/sync-package-assets.js`
  - `companion` joins `hooks` in the source root's `generatedOnly` set, so the stale-entry cleanup keeps it.
  - After the shared hooks, `syncDirectory` copies the build-only `plugins/agdf/host-templates/claude/companion/` exactly into `generated/plugins/agdf/companion/`.
- `scripts/public-plugin/validator.js`, runtime branch of `validatePortableProfile`:
  - `companion/companion.json` must exist.
  - The runtime Claude manifest must equal `createClaudePluginManifest(definition, { runtimeProfile: true, companion })`.
  - The declared hooks file and every module it lists must exist.
- `scripts/public-plugin/copilot-profile.js`: `companion/` joins the excluded Copilot surfaces. Unmapped companion files are already rejected as `AGDF_COPILOT_PAYLOAD_UNMAPPED`; the new rule backs up any future mapping.
- `plugins/agdf/scripts/check-runtime-integrity.mjs`
  - In source and installed modes, all twelve companion files must be present.
  - The descriptor must be exactly `{ schema_version: 1, hooks: "./companion/hooks.json" }`, and the companion hooks must load only `./register.mjs`.
  - The source Claude manifest must declare no `hooks`; the runtime one must declare the descriptor's value.
  - Negative checks: the Codex manifest, the shared `hooks/hooks.json` and the shared plugin definition must not mention the companion.
  - An installed Copilot runtime profile must contain no `companion/` directory.
- `packages/cli/scripts/package-contents-test.js`
  - The npm package must contain `generated/plugins/agdf/companion/{companion.json,hooks.json,register.mjs}`.
  - It must not carry the companion anywhere else, neither as a build template nor in the Copilot profile.

## Verification

- `npm run build:prepare` passed (72.3 s). `generated/plugins/agdf/companion/` holds the twelve files; the generated Copilot profile has none.
- `check-runtime-integrity.mjs` returns ok in source mode and in installed mode on the generated runtime plugin.
- Negative checks on copies of the generated runtime plugin:
  - An unmodified copy fails only the runtime's own copy-location digest self-resolution, which is unrelated to the companion. Every mutation adds its expected failure on top of that baseline.
  - Mutations that fail as expected: runtime Claude manifest without `hooks`; manifest pointing to `./hooks/hooks.json`; `register.mjs` missing; descriptor redirected; companion hooks loading a second module; companion referenced in the Codex manifest, in `hooks/hooks.json` or in the shared definition.
  - `validatePortableProfile` rejects a runtime Claude manifest without the companion and a missing descriptor.
  - `validateCopilotPayload` rejects a Copilot profile containing the companion.
- Byte-identity: `git diff` is empty for the following, so the generated Codex manifest and `hooks/hooks.json` remain canonical projections of unchanged sources:
  - `plugins/agdf/meta/agdf-plugin.definition.json`
  - `plugins/agdf/host-templates/shared/`
  - `plugins/agdf/.codex-plugin/`
  - `plugins/agdf/.claude-plugin/`
- `node scripts/payload-budget.js`: Copilot runtime profile 397 files and 3,495,539 bytes, equal to the baseline.
- `public-plugin-test` passes (public candidate unchanged: 63 files, same digest). `claude-plugin-mcp-test` passes.
- Native: `claude plugin validate` (Claude Code 2.1.302) on the generated runtime plugin `packages/cli/generated/plugins/agdf` passed without warnings. It lists the companion module's six hooks, `.catch` on `command.run` and `ui.close`, the expected `$` calls and env reads `CLAUDE_CONFIG_DIR`, `HOME`, `USERPROFILE`.

## Not Yet Covered

- `package-contents-test` needs the distribution build. It runs with `npm run verify:ci` in T-007.
- The negative checks above are a scratch script. T-006 turns them into repository tests registered in the verification plan.
