# Build and package evidence
Date: 2026-10-08. Scope: T-006; SCN-003/022/023.

Final browser build and MCP build completed successfully through existing Vite/build-mcp owners (evidence/build-final.log and mcp-build-final.log). Browser entry: dist/assets/main-5SBUnCwd.js. Prepared MCP UI: 1052651 bytes; sha256:551cf9bf88c24df33618e634eb1e3474cc344fecf1191d20ddf54dd3080a59a1. Typecheck also passes (evidence/typecheck-final.log). Both list renderers import the same browser-safe canonical Core helper; its dependency closure contains no imports, filesystem, network or React dependency.

Canonical asset synchronization used syncPackageAssets(surface=codex), then assembleNpm(surface=codex,cockpit=true), prepareLocalMcpPackageSources and prepareMcpServerPackage. Temporary-root projectCore checks compare helper and declaration bytes exactly for private projection and assert both absent in Copilot (evidence/prepare-final.log). No generated copy was edited by hand.

Payload-budget review tests, plugin MCP variant tests and Codex cockpit connection-preservation tests pass (evidence/package.log). Runtime integrity source and generated installed checks pass via verify-ci --stage runtime / built-runtime (evidence/runtime.log, built-runtime.log). Applicable verification is scoped to changed Core/UI/private package paths; unrelated release/site/bootstrap stages are not represented as executed.

Prepared isolated profile: codex-cockpit-core-ui-20261008-02; server 32125f11a55c4f701a640fe0e89c3326f1a8f43b3161ac73e761efeb49b49954; dispatcher 193865d1c3255267eaf6c70e0fa1f3407759ccc592e05d54e6a4230f80fdaec3; SDK 02e7212cc00a844c08ac190c572b98dd9aa52671936cb4900808460d44c543d9. Exact metadata: evidence/PREPARED_RUNTIME.json. Both actual stdio protocol suites were rerun against this preparation using AGDF_COCKPIT_TEST_PREPARATION; passed under both 2025-11-25 and 2026-07-28, matching UI identity (evidence/mcp-fresh-final.log and scoped-mcp-fresh-final.log).

The first packaging run exercised the older default preparation and invoked the scoped test without its required environment, causing a missing-path error. It is retained in evidence/package.log and is not fresh-build evidence. The subsequent explicitly bound preparation runs above correct both limitations.

Project .codex/config.toml now points only its existing agdf-cockpit-local entry to this new prepared profile. Other configuration text and the running older profile were preserved. This config is ignored/local. Host reconnect and fresh native rendering remain unverified; preparation.json activated=false is not rewritten as an unsupported activation claim.

Final changed source/test/document hashes: evidence/SOURCE_MANIFEST.json. No public schema, tool capability, release version or transport was changed.
