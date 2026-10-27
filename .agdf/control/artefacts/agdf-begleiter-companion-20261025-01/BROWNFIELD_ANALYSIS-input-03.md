# Brownfield Analysis: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: pass
Mode: `pre_implementation_analysis`
Status: `pass`

## Run

- run_id: `agdf-begleiter-companion-20261025-01`
- related_sd: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/SD.md` (approved after the second SD source revision, revision 26)
- related_tp: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/TP.md` (approved, revision 29)
- current_gate: Brownfield Analysis
- reviewer: Claude
- reviewed_at: 2026-10-25

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- scope: Approved TP tasks T-001 to T-009 for the Claude-only companion after the SDD-01 correction and the SDD-07 correction (companion state file in the AGDF plugin data directory instead of `$.store`, from the T-001 host probe).
- evidence: `scripts/public-plugin/manifest.js:83-96` (`createClaudePluginManifest` adds `mcpServers` for the runtime profile only; the companion declaration follows the same branch); `scripts/sync-package-assets.js:185-189` (`generatedOnly` and build-only `host-templates` in `syncPluginDirectory`), `:599` (source Claude manifest without runtime declarations), `:615` (shared hooks copied from `host-templates/shared/hooks`, the pattern for a generated-only `companion/`), `:633` (runtime Claude manifest projection), `:640` (`validatePortableProfile` runtime check); `scripts/public-plugin/validator.js:122-140` (non-source profiles reject distributed `host-templates/`; the runtime branch checks declared paths; source and public profiles reject any `hooks` declaration, so the source manifest stays without one); `scripts/public-plugin/copilot-profile.js:107-111` (the Copilot payload rejects `.claude-plugin/`, `.codex-plugin/` and `hooks/hooks.json`, so the runtime Claude manifest cannot reach Copilot); `scripts/sync-plugin-runtime.js:187-227` (the runtime bundle copies an explicit entry list; no `companion/` entry); `plugins/agdf/scripts/check-runtime-integrity.mjs:1333-1359` (Claude manifest identity and runtime-only `mcpServers` checks, the place for the companion declaration check); `packages/cli/scripts/public-plugin-test.js:79-80`; `packages/cli/scripts/package-contents-test.js:38-78`; `packages/cli/package.json` (`smoke-test` chains the CLI suites run by the `cli-smoke` stage of `scripts/verify-ci.mjs`).
- missing_evidence: none for the decision; the dispatch call under a throwing companion remains the renewed T-001 obligation before T-004.
- current_coverage: not_done — no companion code, wiring or tests exist in the repository; the prototype lives outside it.
- reuse_strategy: extend — reuse the Claude plugin data directory convention of `claudePluginDataRoot`, the runtime-profile manifest projection, the generated-only copy pattern used for `hooks/`, the validator and integrity owners, the Copilot exclusion list, the payload budget owner and the CLI test chain. The shared plugin definition stays unchanged.
- risks: The `companion/` directory is generated only for the runtime plugin; without `companion` in the source-root `generatedOnly` set, `syncPluginDirectory` would delete it as a stale entry on the next build. The runtime integrity check has no `host-templates/` tree, so the expected declaration must come from a file shipped with the companion or from the manifest projection itself; the descriptor may therefore be copied with the companion as `companion/companion.json`. The companion files are present but inert in the Codex view of the shared runtime folder (accepted in SDD-01). The companion state file lives in the AGDF plugin data directory beside the plugin MCP runtime that `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` installs there; T-001 showed the MCP server stays connected with the file present, and T-004 must keep the file name distinct from the runtime entries and write only when the directory exists. `packages/cli/lib/mcp-lifecycle/plugin-runtime.js:349-353` (`claudePluginDataRoot`) already encodes the same naming convention (plugin id with non-alphanumerics replaced, `agdf@agdf` to `agdf-agdf`); the companion cannot import Node code, so T-006 adds a parity test between its path derivation and `claudePluginDataRoot`. `inspectPluginMcpDataRoot` (`:360-364`) treats any entry besides `mcp/` as foreign, but it is applied only to the Codex data root under the AGDF data directory (`packages/cli/lib/lifecycle/operations.js:78-80`), never to the Claude plugin data directory, so the state file does not affect AGDF lifecycle classification.
- context_graph_impact: unchanged from the Brownfield Review (update CG-PUBLIC-PLUGIN-DISTRIBUTION and CG-RUN-STATUS-CARD after implementation evidence).
- required_next_step: CD+Tests, starting with the renewed T-001 throwing-module variants after a fresh CLI login, then T-002 onward.

## Minimal Clean Implementation Path

1. Renewed T-001 throwing-module variants on a scratch runtime build in an isolated `CLAUDE_CONFIG_DIR` (short path, fresh CLI login); loading, isolation of hook and MCP, retained `$.store` and the plugin data directory state file are already evidenced in `T-001_HOST_PROBE.md`.
2. Companion source and descriptor under `plugins/agdf/host-templates/claude/companion/` (build-only, never distributed as `host-templates/`).
3. `scripts/sync-package-assets.js`: add `companion` to the source-root `generatedOnly` set and copy the companion into `generated/plugins/agdf/companion/` after `syncPluginDirectory`, like the shared hooks.
4. `createClaudePluginManifest` runtime profile adds `"hooks": "./companion/hooks.json"` from the companion descriptor; the source profile and the shared plugin definition stay unchanged.
5. `validatePortableProfile` runtime branch and `check-runtime-integrity.mjs` verify the declaration and files; negative checks for the Codex manifest, `hooks/hooks.json`, the shared plugin definition and the Copilot profile.
6. `package-contents-test.js`, `public-plugin-test.js` and `portable-plugin-test.js` updated for the new generated files; companion suites registered in the existing verification chain.
7. Payload budget review, regenerated provenance, fingerprints and compatibility records; `INSTALL.md`.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| BA-F01 | design_gap | SD | resolved | SD source revision applied on 2026-10-25: SDD-01 now reads the Claude-only declaration from `plugins/agdf/host-templates/claude/companion/companion.json` in `createClaudePluginManifest` (runtime profile only) and keeps `plugins/agdf/meta/agdf-plugin.definition.json` unchanged; SD approved again (revision 18); TP T-002, T-005 and SCN-016 aligned and approved again (revision 20) | none |

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP, beginning with T-001.
- forbidden_until_then: none beyond the TP order; a failed T-001 isolation or retained store returns the run to SD.
